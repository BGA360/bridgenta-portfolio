import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSqliteGovernedLearningRuntime,
  GovernedLearningRuntime,
  SqliteDatabaseManager,
  SqliteGovernanceRepository,
  SqliteIdempotencyStore,
  SqliteRuntimeIntegrityUnitOfWork,
  RuntimeInvariantError,
} from '../src/index.js';
import type {
  GovernanceCommandEnvelope,
  TransactionContext,
  IdempotencyStorePort,
  GovernancePersistencePort,
  RuntimeIntegrityUnitOfWork,
} from '../src/index.js';

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

      const resB = await runtimeB.processAndExecuteCommandAsync(mutatedCmd);
      assert.strictEqual(resB.ok, false);
      assert.strictEqual(resB.category, 'REFUSED');
      assert.strictEqual(resB.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');

      dbB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('7. ERROR transaction produces no command record', async () => {
    const dbManager = new SqliteDatabaseManager(':memory:');
    const store = new SqliteIdempotencyStore(dbManager);
    const unitOfWork = new SqliteRuntimeIntegrityUnitOfWork(dbManager);

    try {
      await unitOfWork.execute((tx) => {
        store.recordCommandExecution(
          {
            commandId: 'cmd_err_001',
            commandFingerprint: 'fp_err',
            commandType: 'DraftObservation',
            payloadVersion: '1.0.0',
            recordedAt: new Date().toISOString(),
            executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'COMMAND_SUCCESS' },
          },
          tx
        );
        throw new RuntimeInvariantError('Simulated infrastructure failure');
      });
    } catch {
      // Expected exception
    }

    const check = store.getCommandExecution('cmd_err_001');
    assert.strictEqual(check.ok, true);
    assert.strictEqual(check.data, undefined); // Rolled back

    dbManager.close();
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

    // Second transaction attempts insert of same commandId inside active transaction
    await unitOfWork.execute((tx) => {
      const res2 = store.recordCommandExecution(
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

      assert.strictEqual(res2.ok, true);
      if (res2.ok) {
        assert.strictEqual(res2.data.recorded, false); // Existing record returned, duplicate refused
      }
    });

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

    // Attempt second transaction with SAME commandId but different fingerprint -> returns REFUSED
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

      assert.strictEqual(recRes.ok, false);
      assert.strictEqual(recRes.category, 'REFUSED');
      assert.strictEqual(recRes.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
      return recRes;
    });

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
    const unitOfWork = new SqliteRuntimeIntegrityUnitOfWork(dbManager);
    const repo = new SqliteGovernanceRepository(dbManager);

    await unitOfWork.execute((tx) => {
      repo.appendEvent({ eventRef: 'evt_100', eventType: 'OBSERVATION_CREATED' }, tx);
      repo.appendEvent({ eventRef: 'evt_101', eventType: 'OBSERVATION_VALIDATED' }, tx);
    });

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
      const { persistencePort: portA, dbManager: dbA, unitOfWork: uowA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      await uowA.execute((tx) => {
        portA.appendEvent({ eventRef: 'evt_seq_1', eventType: 'OBSERVATION_CREATED' }, tx);
        portA.appendEvent({ eventRef: 'evt_seq_2', eventType: 'LESSON_CANDIDATE_CREATED' }, tx);
        portA.appendEvent({ eventRef: 'evt_seq_3', eventType: 'LESSON_APPROVED' }, tx);
      });
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

  it('22. sync processAndExecuteCommand returns real synchronous result', () => {
    const dbPath = getTempDbPath('sync_api_test');
    try {
      const { runtime, dbManager, persistencePort } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const res = runtime.processAndExecuteCommand(cloneCmd(sampleObservationCmd));

      assert.strictEqual(res instanceof Promise, false);
      assert.strictEqual(res.ok, true);
      assert.strictEqual(res.category, 'SUCCESS');

      // Verify database state is already committed synchronously before return
      const obs = persistencePort.getObservationByRef('obs_cmd_dur_obs_001');
      assert.strictEqual(obs.ok, true);

      dbManager.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('23. transaction context enforcement rejects stale, foreign, or missing contexts', async () => {
    const dbManagerA = new SqliteDatabaseManager(':memory:');
    const dbManagerB = new SqliteDatabaseManager(':memory:');
    const unitOfWorkA = new SqliteRuntimeIntegrityUnitOfWork(dbManagerA);
    const repoA = new SqliteGovernanceRepository(dbManagerA);
    const repoB = new SqliteGovernanceRepository(dbManagerB);

    // 1. Missing context on mutating operation returns ERROR
    const missingRes = repoA.saveObservation({ observationRef: 'obs_no_tx', category: 'TEST', statement: 'Statement' });
    assert.strictEqual(missingRes.ok, false);
    assert.strictEqual(missingRes.category, 'ERROR');
    assert.ok(missingRes.error?.message.includes('missing physical transaction context'));

    // 2. Fabricated context returns ERROR
    const fabricatedTx: TransactionContext = { transactionId: 'tx_fake_123', createdAt: new Date().toISOString(), isDurable: true };
    const fabRes = repoA.saveObservation({ observationRef: 'obs_fake_tx', category: 'TEST', statement: 'Statement' }, fabricatedTx);
    assert.strictEqual(fabRes.ok, false);
    assert.strictEqual(fabRes.category, 'ERROR');

    let staleTx: TransactionContext | undefined;
    await unitOfWorkA.execute((txA) => {
      staleTx = txA;
      // Valid active context works
      const validRes = repoA.saveObservation({ observationRef: 'obs_valid_tx', category: 'TEST', statement: 'Statement' }, txA);
      assert.strictEqual(validRes.ok, true);

      // 3. Foreign context (using txA on repoB) returns ERROR
      const foreignRes = repoB.saveObservation({ observationRef: 'obs_foreign_tx', category: 'TEST', statement: 'Statement' }, txA);
      assert.strictEqual(foreignRes.ok, false);
      assert.strictEqual(foreignRes.category, 'ERROR');
    });

    // 4. Stale context (using txA after transaction has committed) returns ERROR
    assert.ok(staleTx);
    const staleRes = repoA.saveObservation({ observationRef: 'obs_stale_tx', category: 'TEST', statement: 'Statement' }, staleTx);
    assert.strictEqual(staleRes.ok, false);
    assert.strictEqual(staleRes.category, 'ERROR');

    dbManagerA.close();
    dbManagerB.close();
  });

  it('24. persistence refusal stops event append and command success record', async () => {
    const dbPath = getTempDbPath('persist_refusal');
    try {
      const { runtime, dbManager, persistencePort } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });

      // Pre-insert observation ref obs_cmd_dur_obs_001 directly inside unit of work
      const uow = new SqliteRuntimeIntegrityUnitOfWork(dbManager);
      uow.execute((tx) => {
        persistencePort.saveObservation({ observationRef: 'obs_cmd_dur_obs_001', category: 'MECHANICAL', statement: 'First statement' }, tx);
      });

      // Execute command attempting to overwrite obs_cmd_dur_obs_001 -> saveObservation returns REFUSED
      const res = await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
      assert.strictEqual(res.ok, false);
      assert.strictEqual(res.category, 'REFUSED');
      assert.strictEqual(res.refusalCode, 'REFUSAL_HISTORICAL_MUTATION_DENIED');

      // Verify zero event appended, zero command record created
      const rawDb = dbManager.getRawDatabase();
      const evtCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM governance_events').get()?.count;
      const cmdCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM command_records').get()?.count;

      assert.strictEqual(evtCount, 0);
      assert.strictEqual(cmdCount, 0);

      dbManager.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('25. Window H real two-connection concurrent execution with same identity yields exactly one winner and one replay', async () => {
    const dbPath = getTempDbPath('window_h_same');
    try {
      const { runtime: runtimeA, dbManager: dbManagerA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const { runtime: runtimeB, dbManager: dbManagerB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });

      const cmdA = cloneCmd(sampleObservationCmd);
      const cmdB = cloneCmd(sampleObservationCmd);

      const [resA, resB] = await Promise.all([
        runtimeA.processAndExecuteCommandAsync(cmdA),
        runtimeB.processAndExecuteCommandAsync(cmdB),
      ]);

      assert.strictEqual(resA.ok, true);
      assert.strictEqual(resB.ok, true);

      const replayedCount = (resA.replayedResult ? 1 : 0) + (resB.replayedResult ? 1 : 0);
      assert.strictEqual(replayedCount, 1);

      const rawDb = dbManagerA.getRawDatabase();
      const obsCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM observations').get()?.count;
      const evtCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM governance_events').get()?.count;
      const cmdCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM command_records').get()?.count;

      assert.strictEqual(obsCount, 1);
      assert.strictEqual(evtCount, 1);
      assert.strictEqual(cmdCount, 1);

      dbManagerA.close();
      dbManagerB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('26. Window H real two-connection concurrent execution with mismatched identity yields one winner and one REFUSED', async () => {
    const dbPath = getTempDbPath('window_h_diff');
    try {
      const { runtime: runtimeA, dbManager: dbManagerA } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });
      const { runtime: runtimeB, dbManager: dbManagerB } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });

      const cmdA: GovernanceCommandEnvelope = {
        ...sampleObservationCmd,
        commandId: 'cmd_race_diff_001',
        payload: { category: 'MECHANICAL', statement: 'Statement from A' },
      };

      const cmdB: GovernanceCommandEnvelope = {
        ...sampleObservationCmd,
        commandId: 'cmd_race_diff_001',
        payload: { category: 'MECHANICAL', statement: 'Statement from B (DIFFERENT)' },
      };

      const [resA, resB] = await Promise.all([
        runtimeA.processAndExecuteCommandAsync(cmdA),
        runtimeB.processAndExecuteCommandAsync(cmdB),
      ]);

      const okResults = [resA, resB].filter((r) => r.ok);
      const refusedResults = [resA, resB].filter((r) => !r.ok && r.category === 'REFUSED');

      assert.strictEqual(okResults.length, 1);
      assert.strictEqual(refusedResults.length, 1);
      assert.strictEqual(refusedResults[0].refusalCode, 'REFUSAL_INVARIANT_VIOLATION');

      const rawDb = dbManagerA.getRawDatabase();
      const obsCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM observations').get()?.count;
      const evtCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM governance_events').get()?.count;
      const cmdCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM command_records').get()?.count;

      assert.strictEqual(obsCount, 1);
      assert.strictEqual(evtCount, 1);
      assert.strictEqual(cmdCount, 1);

      dbManagerA.close();
      dbManagerB.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('27. post-BEGIN durable idempotency lookup failure aborts handler and rolls back transaction', async () => {
    const dbPath = getTempDbPath('post_begin_error');
    try {
      const { dbManager, persistencePort: rawRepo, idempotencyStore: rawStore, unitOfWork } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });

      let postBeginLookupAttempts = 0;
      let domainPersistenceCalls = 0;
      let eventAppendCalls = 0;

      const failingIdempotencyStore: IdempotencyStorePort = {
        getCommandExecution(commandId: string, transactionContext?: TransactionContext) {
          if (transactionContext !== undefined) {
            postBeginLookupAttempts++;
            return {
              ok: false,
              category: 'ERROR',
              error: new RuntimeInvariantError('Injected post-BEGIN lookup infrastructure failure'),
            };
          }
          return rawStore.getCommandExecution(commandId, transactionContext);
        },
        recordCommandExecution(record, txContext) {
          return rawStore.recordCommandExecution(record, txContext);
        },
      };

      const trackedPersistencePort: GovernancePersistencePort = {
        saveObservation(obs, tx) {
          domainPersistenceCalls++;
          return rawRepo.saveObservation(obs, tx);
        },
        saveLesson(lesson, tx) {
          domainPersistenceCalls++;
          return rawRepo.saveLesson(lesson, tx);
        },
        saveRuleCandidate(rule, tx) {
          domainPersistenceCalls++;
          return rawRepo.saveRuleCandidate(rule, tx);
        },
        getObservationByRef(ref) {
          return rawRepo.getObservationByRef(ref);
        },
        getLessonByRef(ref) {
          return rawRepo.getLessonByRef(ref);
        },
        getRuleCandidateById(id) {
          return rawRepo.getRuleCandidateById(id);
        },
        appendEvent(evt, tx) {
          eventAppendCalls++;
          return rawRepo.appendEvent(evt, tx);
        },
        getEvents() {
          return rawRepo.getEvents();
        },
      };

      const runtime = new GovernedLearningRuntime({
        persistencePort: trackedPersistencePort,
        idempotencyStore: failingIdempotencyStore,
        unitOfWork,
      });

      const res = await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));

      assert.strictEqual(res.ok, false);
      assert.strictEqual(res.category, 'ERROR');
      assert.ok(res.error?.message.includes('Injected post-BEGIN lookup infrastructure failure'));

      assert.strictEqual(postBeginLookupAttempts, 1);
      assert.strictEqual(domainPersistenceCalls, 0);
      assert.strictEqual(eventAppendCalls, 0);

      // Verify physical transaction rollback left database with zero entities/events/records
      const rawDb = dbManager.getRawDatabase();
      const obsCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM observations').get()?.count;
      const evtCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM governance_events').get()?.count;
      const cmdCount = rawDb.prepare<{ count: number }>('SELECT COUNT(*) as count FROM command_records').get()?.count;

      assert.strictEqual(obsCount, 0);
      assert.strictEqual(evtCount, 0);
      assert.strictEqual(cmdCount, 0);

      dbManager.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });

  it('28. synchronous runtime rejects thenable UnitOfWork execution and releases lease', () => {
    const dbPath = getTempDbPath('thenable_uow_guard');
    try {
      const { persistencePort, idempotencyStore, dbManager } = createSqliteGovernedLearningRuntime({ databasePath: dbPath });

      // Custom UnitOfWork that returns a Promise (thenable) from execute
      const thenableUnitOfWork: RuntimeIntegrityUnitOfWork = {
        execute<T>(operation: (context: TransactionContext) => Promise<T> | T): Promise<T> | T {
          return Promise.resolve(operation({ transactionId: 'tx_async_mock', createdAt: new Date().toISOString(), isDurable: false }));
        },
      };

      const runtime = new GovernedLearningRuntime({
        persistencePort,
        idempotencyStore,
        unitOfWork: thenableUnitOfWork,
      });

      assert.throws(
        () => runtime.processAndExecuteCommand(cloneCmd(sampleObservationCmd)),
        (err: any) => err?.message?.includes('Synchronous runtime requires a synchronous UnitOfWork implementation')
      );

      dbManager.close();
    } finally {
      cleanupDbFile(dbPath);
    }
  });
});

