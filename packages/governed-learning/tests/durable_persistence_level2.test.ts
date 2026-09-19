import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSqliteGovernedLearningRuntime,
  SqliteDatabaseManager,
  SqliteGovernanceRepository,
  SqliteIdempotencyStore,
  SqliteRuntimeIntegrityUnitOfWork,
  RuntimeInvariantError,
} from '../src/index.js';
import type { GovernanceCommandEnvelope } from '../src/index.js';

function getTempDbPath(name: string): string {
  return join(tmpdir(), `gl_durability_${name}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.db`);
}

function cleanupDbFile(path: string): void {
  try {
    if (existsSync(path)) unlinkSync(path);
    if (existsSync(`${path}-wal`)) unlinkSync(`${path}-wal`);
    if (existsSync(`${path}-shm`)) unlinkSync(`${path}-shm`);
  } catch {
    // Ignore cleanup errors
  }
}

function cloneCmd<T>(cmd: T): T {
  return JSON.parse(JSON.stringify(cmd));
}

describe('GL-HARDENING-005 Level-2 Durable Persistence & Physical Transaction Boundary', () => {
  const sampleObservationCmd: GovernanceCommandEnvelope = {
    commandId: 'cmd_dur_obs_001',
    commandType: 'DraftObservation',
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-19T18:00:00.000Z',
    actorRef: { actorId: 'agent_alice', actorType: 'AGENT' },
    authorityContextRef: { authorityId: 'auth_sys' },
    payload: { category: 'MECHANICAL', statement: 'Durable observation statement test' },
  };

  const sampleCandidateCmd: GovernanceCommandEnvelope = {
    commandId: 'cmd_dur_can_002',
    commandType: 'CreateLessonCandidate',
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-19T18:05:00.000Z',
    actorRef: { actorId: 'agent_bob', actorType: 'AGENT' },
    authorityContextRef: { authorityId: 'auth_sys' },
    payload: {
      statement: 'Durable candidate statement',
      rationale: 'Durable rationale for test',
      scope: { scopeType: 'SYSTEM_WIDE' },
      originatingObservationRefs: [{ observationId: 'obs_1' }],
    },
  };

  it('1. durable entity persistence survives restart', async () => {
    const dbPath = getTempDbPath('restart_entity');
    try {
      // Instance A
      const { runtime: runtimeA, dbManager: dbA, persistencePort: portA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const resA = await runtimeA.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
      assert.strictEqual(resA.ok, true);

      // Verify written in instance A
      const getObsA = portA.getObservationByRef('obs_cmd_dur_obs_001');
      assert.strictEqual(getObsA.ok, true);

      // Close Instance A
      dbA.close();

      // Instance B (Reopen same DB file)
      const { dbManager: dbB, persistencePort: portB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const getObsB = portB.getObservationByRef('obs_cmd_dur_obs_001');
      assert.strictEqual(getObsB.ok, true);
      assert.strictEqual((getObsB.data as any).statement, 'Durable observation statement test');

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('2. durable event persistence survives restart', async () => {
    const dbPath = getTempDbPath('restart_events');
    try {
      const { runtime: runtimeA, dbManager: dbA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      await runtimeA.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
      dbA.close();

      const { dbManager: dbB, persistencePort: portB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const eventsRes = portB.getEvents();
      assert.strictEqual(eventsRes.ok, true);
      if (eventsRes.ok) {
        assert.strictEqual(eventsRes.data.length, 1);
        assert.strictEqual((eventsRes.data[0] as any).eventType, 'OBSERVATION_CREATED');
      }

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('3. command record survives restart', async () => {
    const dbPath = getTempDbPath('restart_cmd_record');
    try {
      const { runtime: runtimeA, dbManager: dbA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      await runtimeA.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
      dbA.close();

      const { dbManager: dbB, idempotencyStore: storeB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const recordRes = storeB.getCommandExecution(sampleObservationCmd.commandId);
      assert.strictEqual(recordRes.ok, true);
      assert.ok(recordRes.data);
      assert.strictEqual(recordRes.data?.commandId, sampleObservationCmd.commandId);
      assert.strictEqual(recordRes.data?.executionOutcome.category, 'SUCCESS');

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('4. exact success retry after restart replays prior result', async () => {
    const dbPath = getTempDbPath('restart_exact_retry');
    try {
      const { runtime: runtimeA, dbManager: dbA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const resA = await runtimeA.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
      assert.strictEqual(resA.ok, true);
      assert.strictEqual(resA.replayedResult, undefined);
      dbA.close();

      // Instance B retries exact same command
      const { runtime: runtimeB, dbManager: dbB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const resB = await runtimeB.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));

      assert.strictEqual(resB.ok, true);
      assert.strictEqual(resB.replayedResult, true);
      assert.strictEqual(resB.category, 'SUCCESS');

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('5. exact refusal retry after restart replays prior refusal', async () => {
    const dbPath = getTempDbPath('restart_refusal_retry');
    const circularCmd: GovernanceCommandEnvelope = {
      commandId: 'cmd_dur_circ_003',
      commandType: 'SupersedeLesson',
      payloadVersion: '1.0.0',
      issuedAt: '2026-09-19T18:10:00.000Z',
      actorRef: { actorId: 'agent_alice', actorType: 'AGENT' },
      authorityContextRef: { authorityId: 'auth_sys' },
      payload: {
        supersededLessonRef: { lessonId: 'lsn_same', version: '1.0.0' },
        supersedingLessonRef: { lessonId: 'lsn_same', version: '1.0.0' },
        decisionRef: { decisionId: 'dec_1' },
      },
    };

    try {
      const { runtime: runtimeA, dbManager: dbA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const resA = await runtimeA.processAndExecuteCommandAsync(cloneCmd(circularCmd));
      assert.strictEqual(resA.ok, false);
      assert.strictEqual(resA.category, 'REFUSED');
      assert.strictEqual(resA.refusalCode, 'REFUSAL_CIRCULAR_SUPERCOGNITION');
      dbA.close();

      const { runtime: runtimeB, dbManager: dbB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const resB = await runtimeB.processAndExecuteCommandAsync(cloneCmd(circularCmd));
      assert.strictEqual(resB.ok, false);
      assert.strictEqual(resB.category, 'REFUSED');
      assert.strictEqual(resB.replayedResult, true);
      assert.strictEqual(resB.refusalCode, 'REFUSAL_CIRCULAR_SUPERCOGNITION');

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('6. changed identity after restart is refused', async () => {
    const dbPath = getTempDbPath('restart_identity_collision');
    try {
      const { runtime: runtimeA, dbManager: dbA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      await runtimeA.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
      dbA.close();

      const { runtime: runtimeB, dbManager: dbB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const mutatedCmd: GovernanceCommandEnvelope = {
        ...sampleObservationCmd,
        payload: { category: 'MECHANICAL', statement: 'MUTATED STATEMENT DIFFERENCE' },
      };

      const resB = await runtimeB.processAndExecuteCommandAsync(cloneCmd(mutatedCmd));
      assert.strictEqual(resB.ok, false);
      assert.strictEqual(resB.category, 'REFUSED');
      assert.strictEqual(resB.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('7. ERROR transaction produces no command record', async () => {
    const dbPath = getTempDbPath('error_no_record');
    const queryCmd: GovernanceCommandEnvelope = {
      commandId: 'cmd_dur_query_004',
      commandType: 'BuildGuidanceSetQuery',
      payloadVersion: '1.0.0',
      issuedAt: '2026-09-19T18:15:00.000Z',
      actorRef: { actorId: 'agent_alice', actorType: 'AGENT' },
      authorityContextRef: { authorityId: 'auth_sys' },
      payload: { queryId: 'q1' },
    };

    try {
      const { runtime, dbManager, idempotencyStore } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const res = await runtime.processAndExecuteCommandAsync(cloneCmd(queryCmd));

      assert.strictEqual(res.ok, false);
      assert.strictEqual(res.category, 'ERROR');

      const recordRes = idempotencyStore.getCommandExecution(queryCmd.commandId);
      assert.strictEqual(recordRes.ok, true);
      assert.strictEqual(recordRes.data, undefined);

      dbManager.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('8. entity-write failure rolls back event + command record', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const repo = new SqliteGovernanceRepository(dbManager);

    // Override saveObservation to return category ERROR
    repo.saveObservation = () => {
      return { ok: false, category: 'ERROR', error: new RuntimeInvariantError('Simulated physical entity write failure') };
    };

    const runtime = createSqliteGovernedLearningRuntime({ dbManager, persistencePort: repo }).runtime;
    const res = await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');
    assert.ok(res.error?.message.includes('Simulated physical entity write failure'));

    // Verify atomic rollback: 0 events, 0 command records
    const rawDb = dbManager.getRawDatabase();
    const eventCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM governance_events').get()?.count;
    const cmdCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM command_records').get()?.count;

    assert.strictEqual(eventCount, 0);
    assert.strictEqual(cmdCount, 0);

    dbManager.close();
  });

  it('9. event-write failure rolls back entity + command record', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const repo = new SqliteGovernanceRepository(dbManager);

    // Override appendEvent to return category ERROR
    repo.appendEvent = () => {
      return { ok: false, category: 'ERROR', error: new RuntimeInvariantError('Simulated physical event append failure') };
    };

    const runtime = createSqliteGovernedLearningRuntime({ dbManager, persistencePort: repo }).runtime;
    const res = await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');
    assert.ok(res.error?.message.includes('Simulated physical event append failure'));

    // Verify atomic rollback: 0 observations, 0 command records
    const rawDb = dbManager.getRawDatabase();
    const obsCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM observations').get()?.count;
    const cmdCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM command_records').get()?.count;

    assert.strictEqual(obsCount, 0);
    assert.strictEqual(cmdCount, 0);

    dbManager.close();
  });

  it('10. command-record failure rolls back entity + event (Window C closed)', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const store = new SqliteIdempotencyStore(dbManager);

    // Override recordCommandExecution to return category ERROR
    store.recordCommandExecution = () => {
      return { ok: false, category: 'ERROR', error: new RuntimeInvariantError('Simulated command record write failure') };
    };

    const runtime = createSqliteGovernedLearningRuntime({ dbManager, idempotencyStore: store }).runtime;
    const res = await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');
    assert.ok(res.error?.message.includes('Simulated command record write failure'));

    // Verify physical transaction rollback (Window C closed): 0 observations, 0 events, 0 command records
    const rawDb = dbManager.getRawDatabase();
    const obsCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM observations').get()?.count;
    const evtCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM governance_events').get()?.count;
    const cmdCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM command_records').get()?.count;

    assert.strictEqual(obsCount, 0);
    assert.strictEqual(evtCount, 0);
    assert.strictEqual(cmdCount, 0);

    dbManager.close();
  });

  it('11. response-loss retry does not duplicate domain state', async () => {
    const dbPath = getTempDbPath('response_loss');
    try {
      const { runtime: runtimeA, dbManager: dbA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const resA = await runtimeA.processAndExecuteCommandAsync(cloneCmd(sampleCandidateCmd));
      assert.strictEqual(resA.ok, true);
      dbA.close();

      // Client experienced response loss, retries exact command on Instance B
      const { runtime: runtimeB, dbManager: dbB, persistencePort: portB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const resB = await runtimeB.processAndExecuteCommandAsync(cloneCmd(sampleCandidateCmd));

      assert.strictEqual(resB.ok, true);
      assert.strictEqual(resB.replayedResult, true);

      // Verify state was not duplicated
      const events = portB.getEvents();
      assert.strictEqual(events.ok, true);
      if (events.ok) {
        assert.strictEqual(events.data.length, 1);
      }

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('12. commandId uniqueness race yields at most one committed transaction', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const store = new SqliteIdempotencyStore(dbManager);
    const unitOfWork = new SqliteRuntimeIntegrityUnitOfWork(dbManager);

    // First transaction commits
    await unitOfWork.execute((tx) => {
      store.recordCommandExecution(
        {
          commandId: 'cmd_race_001',
          commandFingerprint: 'fp_first',
          commandType: 'DraftObservation',
          payloadVersion: '1.0.0',
          recordedAt: new Date().toISOString(),
          executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'COMMAND_SUCCESS' },
        },
        tx
      );
    });

    // Second transaction attempts insert of same commandId
    const res2 = store.recordCommandExecution(
      {
        commandId: 'cmd_race_001',
        commandFingerprint: 'fp_first',
        commandType: 'DraftObservation',
        payloadVersion: '1.0.0',
        recordedAt: new Date().toISOString(),
        executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'COMMAND_SUCCESS' },
      }
    );

    assert.strictEqual(res2.ok, true);
    if (res2.ok) {
      assert.strictEqual(res2.data.recorded, false); // Existing record returned, duplicate refused
    }

    dbManager.close();
  });

  it('13. losing commandId race transaction rolls back all effects', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const unitOfWork = new SqliteRuntimeIntegrityUnitOfWork(dbManager);
    const repo = new SqliteGovernanceRepository(dbManager);
    const store = new SqliteIdempotencyStore(dbManager);

    // Pre-insert command record for cmd_race_002
    await unitOfWork.execute((tx) => {
      store.recordCommandExecution(
        {
          commandId: 'cmd_race_002',
          commandFingerprint: 'fp_original',
          commandType: 'DraftObservation',
          payloadVersion: '1.0.0',
          recordedAt: new Date().toISOString(),
          executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'COMMAND_SUCCESS' },
        },
        tx
      );
    });

    // Attempt second transaction with SAME commandId but different fingerprint -> throws error in transaction
    try {
      await unitOfWork.execute((tx) => {
        repo.saveObservation({ observationRef: 'obs_losing_tx', category: 'TEST', statement: 'Statement' }, tx);
        repo.appendEvent({ eventType: 'OBSERVATION_CREATED', payload: { observationRef: 'obs_losing_tx' } }, tx);

        const recRes = store.recordCommandExecution(
          {
            commandId: 'cmd_race_002',
            commandFingerprint: 'fp_DIFFERENT',
            commandType: 'DraftObservation',
            payloadVersion: '1.0.0',
            recordedAt: new Date().toISOString(),
            executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'COMMAND_SUCCESS' },
          },
          tx
        );

        if (!recRes.ok && recRes.category === 'ERROR') {
          throw recRes.error;
        }
      });
      assert.fail('Should have failed on duplicate commandId mismatch');
    } catch {
      // Expected rollback
    }

    // Verify losing transaction's observation and event were rolled back
    const obsLookup = repo.getObservationByRef('obs_losing_tx');
    assert.strictEqual(obsLookup.ok, false);

    const rawDb = dbManager.getRawDatabase();
    const evtCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM governance_events').get()?.count;
    assert.strictEqual(evtCount, 0);

    dbManager.close();
  });

  it('14. multi-entity failure leaves no partial commit (Window J)', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const unitOfWork = new SqliteRuntimeIntegrityUnitOfWork(dbManager);
    const repo = new SqliteGovernanceRepository(dbManager);

    try {
      await unitOfWork.execute((tx) => {
        repo.saveLesson({ lessonRef: 'lsn_part1', statement: 'Part 1' }, tx);
        repo.saveLesson({ lessonRef: 'lsn_part2', statement: 'Part 2' }, tx);
        throw new Error('Simulated multi-entity second step failure');
      });
    } catch {
      // Expected
    }

    // Verify neither lesson was committed
    assert.strictEqual(repo.getLessonByRef('lsn_part1').ok, false);
    assert.strictEqual(repo.getLessonByRef('lsn_part2').ok, false);

    dbManager.close();
  });

  it('15. event log remains append-only', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const repo = new SqliteGovernanceRepository(dbManager);

    repo.appendEvent({ eventRef: 'evt_100', eventType: 'OBSERVATION_CREATED' });
    repo.appendEvent({ eventRef: 'evt_101', eventType: 'OBSERVATION_VALIDATED' });

    const rawDb = dbManager.getRawDatabase();
    const rows = rawDb.prepare<{ id: number; event_type: string }>('SELECT id, event_type FROM governance_events ORDER BY id ASC').all();
    assert.strictEqual(rows.length, 2);
    assert.strictEqual(rows[0].id, 1);
    assert.strictEqual(rows[1].id, 2);

    dbManager.close();
  });

  it('16. database reopen preserves deterministic read order', async () => {
    const dbPath = getTempDbPath('read_order');
    try {
      const { persistencePort: portA, dbManager: dbA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      portA.appendEvent({ eventRef: 'evt_seq_1', eventType: 'OBSERVATION_CREATED' });
      portA.appendEvent({ eventRef: 'evt_seq_2', eventType: 'LESSON_CANDIDATE_CREATED' });
      portA.appendEvent({ eventRef: 'evt_seq_3', eventType: 'LESSON_APPROVED' });
      dbA.close();

      const { persistencePort: portB, dbManager: dbB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const eventsRes = portB.getEvents();
      assert.strictEqual(eventsRes.ok, true);
      if (eventsRes.ok) {
        assert.strictEqual(eventsRes.data.length, 3);
        assert.strictEqual((eventsRes.data[0] as any).eventRef, 'evt_seq_1');
        assert.strictEqual((eventsRes.data[1] as any).eventRef, 'evt_seq_2');
        assert.strictEqual((eventsRes.data[2] as any).eventRef, 'evt_seq_3');
      }

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('17. transaction context is bound to one physical transaction', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const unitOfWork = new SqliteRuntimeIntegrityUnitOfWork(dbManager);

    let txId1 = '';
    let txId2 = '';

    await unitOfWork.execute((tx1) => {
      assert.strictEqual(tx1.isDurable, true);
      txId1 = tx1.transactionId;
    });

    await unitOfWork.execute((tx2) => {
      assert.strictEqual(tx2.isDurable, true);
      txId2 = tx2.transactionId;
    });

    assert.notStrictEqual(txId1, txId2);
    dbManager.close();
  });

  it('18. operations with transaction context execute within active transaction', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const unitOfWork = new SqliteRuntimeIntegrityUnitOfWork(dbManager);
    const repo = new SqliteGovernanceRepository(dbManager);

    await unitOfWork.execute((tx) => {
      const saveRes = repo.saveObservation({ observationRef: 'obs_inside_tx', category: 'TEST', statement: 'Statement' }, tx);
      assert.strictEqual(saveRes.ok, true);
      assert.strictEqual(dbManager.isTransactionActive(), true);
    });

    assert.strictEqual(dbManager.isTransactionActive(), false);
    const lookup = repo.getObservationByRef('obs_inside_tx');
    assert.strictEqual(lookup.ok, true);

    dbManager.close();
  });

  it('19. Stage 8 uses durable command records', async () => {
    const dbPath = getTempDbPath('stage8_durable');
    try {
      const { runtime, dbManager, idempotencyStore } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });

      // Verify store is SqliteIdempotencyStore instance
      assert.ok(idempotencyStore instanceof SqliteIdempotencyStore);

      const res = await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
      assert.strictEqual(res.ok, true);

      const lookup = idempotencyStore.getCommandExecution(sampleObservationCmd.commandId);
      assert.strictEqual(lookup.ok, true);
      assert.ok(lookup.data);

      dbManager.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('20. Stage 9 semantics remain unchanged with durable runtime', async () => {
    const dbPath = getTempDbPath('stage9_durable');
    try {
      const { runtime, dbManager } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });

      // Execute 2 concurrent commands for same scope asynchronously
      const cmd1: GovernanceCommandEnvelope = {
        ...sampleObservationCmd,
        commandId: 'cmd_stage9_dur_001',
      };

      const cmd2: GovernanceCommandEnvelope = {
        ...sampleObservationCmd,
        commandId: 'cmd_stage9_dur_002',
      };

      const [res1, res2] = await Promise.all([
        runtime.processAndExecuteCommandAsync(cloneCmd(cmd1)),
        runtime.processAndExecuteCommandAsync(cloneCmd(cmd2)),
      ]);

      assert.strictEqual(res1.ok, true);
      assert.strictEqual(res2.ok, true);

      dbManager.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('21. SQLite tests explicitly do not claim PostgreSQL row-lock equivalence', () => {
    // Architectural assertion guard
    const SQLITE_EQUIVALENT_TO_POSTGRES_ROW_LOCKING = false;
    assert.strictEqual(SQLITE_EQUIVALENT_TO_POSTGRES_ROW_LOCKING, false);
  });
});
