import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import EmbeddedPostgres from 'embedded-postgres';
import pg from 'pg';
import {
  createPostgresGovernedLearningRuntime,
  PostgresDatabaseManager,
  PostgresGovernanceRepository,
  PostgresIdempotencyStore,
  PostgresRuntimeIntegrityUnitOfWork,
} from '../src/durable/postgres-adapter.js';
import type { GovernanceCommandEnvelope } from '../src/contracts/envelopes.js';
import type {
  IdempotencyStorePort,
  TransactionContext,
} from '../src/contracts/ports.js';
import type { GovernancePersistencePort } from '../src/runtime/persistence.js';
import { RuntimeInvariantError } from '../src/runtime/errors.js';

function cloneCmd<T>(cmd: T): T {
  return JSON.parse(JSON.stringify(cmd));
}

describe('Real PostgreSQL Level-2B Production Integration & Concurrency Test Suite', () => {
  let pgServer: EmbeddedPostgres;
  let pgPort: number;
  let dbNameIndex = 0;

  before(async () => {
    pgPort = 5430 + Math.floor(Math.random() * 50);
    pgServer = new EmbeddedPostgres({
      port: pgPort,
      databaseDir: `./data/real_pg_suite_${pgPort}`,
      persistent: false,
    });
    await pgServer.initialise();
    await pgServer.start();
  });

  after(async () => {
    if (pgServer) {
      try {
        await pgServer.stop();
      } catch {
        // Ignore stop errors on cleanup
      }
    }
  });

  function createRealPgPool(): { pool: pg.Pool; managerOptions: any } {
    dbNameIndex++;
    const pool = new pg.Pool({
      host: '127.0.0.1',
      port: pgPort,
      user: 'postgres',
      password: 'password',
      database: 'postgres',
      max: 10,
    });
    return { pool, managerOptions: { pool } };
  }

  const sampleObservationCmd: GovernanceCommandEnvelope = {
    commandId: 'cmd_real_pg_obs_001',
    commandType: 'DraftObservation' as const,
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-20T18:00:00.000Z',
    actorRef: { actorId: 'agent_bob', actorType: 'AGENT' },
    authorityContextRef: { authorityId: 'auth_sys' },
    payload: { category: 'MECHANICAL', statement: 'Real PostgreSQL server observation statement' },
  };

  it('1. Real PostgreSQL server version and connection verification', async () => {
    const { pool } = createRealPgPool();
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT version();');
      assert.strictEqual(typeof res.rows[0].version, 'string');
      assert.match(res.rows[0].version, /PostgreSQL/);
    } finally {
      client.release();
      await pool.end();
    }
  });

  it('2. Configured transaction isolation level is actually applied to session', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const uowRepeatable = new PostgresRuntimeIntegrityUnitOfWork(dbManager, 'REPEATABLE READ');
    await uowRepeatable.execute(async (tx) => {
      const client = dbManager.getClient(tx);
      const res = await client.query("SHOW transaction_isolation;");
      assert.strictEqual(res.rows[0].transaction_isolation, 'repeatable read');
    });

    const uowSerializable = new PostgresRuntimeIntegrityUnitOfWork(dbManager, 'SERIALIZABLE');
    await uowSerializable.execute(async (tx) => {
      const client = dbManager.getClient(tx);
      const res = await client.query("SHOW transaction_isolation;");
      assert.strictEqual(res.rows[0].transaction_isolation, 'serializable');
    });

    await dbManager.close();
  });

  it('3. Real PostgreSQL same-runtime concurrent requests receive independent TransactionContexts and PoolClients', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);
    let clientA: any;
    let clientB: any;
    let txIdA = '';
    let txIdB = '';

    const p1 = uow.execute(async (txA) => {
      txIdA = txA.transactionId;
      clientA = dbManager.getClient(txA);
      await new Promise((r) => setTimeout(r, 50));
      return 'resA';
    });

    const p2 = uow.execute(async (txB) => {
      txIdB = txB.transactionId;
      clientB = dbManager.getClient(txB);
      await new Promise((r) => setTimeout(r, 50));
      return 'resB';
    });

    const [r1, r2] = await Promise.all([p1, p2]);
    assert.strictEqual(r1, 'resA');
    assert.strictEqual(r2, 'resB');

    assert.notStrictEqual(txIdA, txIdB);
    assert.notStrictEqual(clientA, clientB);

    await dbManager.close();
  });

  it('4. Real PostgreSQL Window H same-identity concurrent race yields exactly one winner and one replay', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const { runtime: runtimeA } = createPostgresGovernedLearningRuntime({ pool });
    const { runtime: runtimeB } = createPostgresGovernedLearningRuntime({ pool });

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

    await dbManager.close();
  });

  it('5. Real PostgreSQL Window H mismatched-identity concurrent race yields one winner and one REFUSED', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const { runtime: runtimeA } = createPostgresGovernedLearningRuntime({ pool });
    const { runtime: runtimeB } = createPostgresGovernedLearningRuntime({ pool });

    const cmdA: GovernanceCommandEnvelope = {
      ...sampleObservationCmd,
      commandId: 'cmd_real_race_diff_001',
      payload: { category: 'MECHANICAL', statement: 'Statement A' },
    };

    const cmdB: GovernanceCommandEnvelope = {
      ...sampleObservationCmd,
      commandId: 'cmd_real_race_diff_001',
      payload: { category: 'MECHANICAL', statement: 'Statement B (DIFFERENT)' },
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

    await dbManager.close();
  });

  it('6. Real PostgreSQL aggregate row locking SELECT ... FOR UPDATE', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const repo = new PostgresGovernanceRepository(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    await uow.execute(async (tx) => {
      await repo.saveObservation({ observationRef: 'obs_for_update_001', category: 'TEST', statement: 'Lock Test' }, tx);
    });

    await uow.execute(async (tx) => {
      const getRes = await repo.getObservationByRef('obs_for_update_001', tx, true);
      assert.strictEqual(getRes.ok, true);
    });

    await dbManager.close();
  });

  it('7. Real PostgreSQL command record write failure rolls back entity and event (Window C closed)', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const repo = new PostgresGovernanceRepository(dbManager);
    const rawStore = new PostgresIdempotencyStore(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    const failingStore: IdempotencyStorePort = {
      async getCommandExecution(id, tx) {
        return await rawStore.getCommandExecution(id, tx);
      },
      async recordCommandExecution() {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError('Simulated command record write failure'),
        };
      },
    };

    const runtime = new (createPostgresGovernedLearningRuntime({ pool }).runtime.constructor as any)({
      persistencePort: repo,
      idempotencyStore: failingStore,
      unitOfWork: uow,
    });

    const cmd = cloneCmd(sampleObservationCmd);
    cmd.commandId = 'cmd_real_fail_rec_001';

    try {
      await runtime.processAndExecuteCommandAsync(cmd);
    } catch {
      // Expected
    }

    const obsRes = await repo.getObservationByRef('obs_cmd_real_fail_rec_001');
    assert.strictEqual(obsRes.ok, false);

    const eventsRes = await repo.getEvents({ eventRef: 'evt_cmd_real_fail_rec_001' });
    assert.strictEqual(eventsRes.ok, true);
    if (eventsRes.ok) {
      assert.strictEqual(eventsRes.data.length, 0);
    }

    await dbManager.close();
  });

  it('8. Real PostgreSQL event append failure rolls back entity write (Window E/F closed)', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const rawRepo = new PostgresGovernanceRepository(dbManager);
    const store = new PostgresIdempotencyStore(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    const failingRepo: GovernancePersistencePort = {
      saveObservation: (obs, tx) => rawRepo.saveObservation(obs, tx),
      saveLesson: (l, tx) => rawRepo.saveLesson(l, tx),
      saveRuleCandidate: (r, tx) => rawRepo.saveRuleCandidate(r, tx),
      getObservationByRef: (ref, tx, f) => rawRepo.getObservationByRef(ref, tx, f),
      getLessonByRef: (ref, tx, f) => rawRepo.getLessonByRef(ref, tx, f),
      getRuleCandidateById: (id, tx, f) => rawRepo.getRuleCandidateById(id, tx, f),
      getEvents: (filter, tx) => rawRepo.getEvents(filter, tx),
      async appendEvent() {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError('Simulated event append failure'),
        };
      },
    };

    const runtime = new (createPostgresGovernedLearningRuntime({ pool }).runtime.constructor as any)({
      persistencePort: failingRepo,
      idempotencyStore: store,
      unitOfWork: uow,
    });

    const cmd = cloneCmd(sampleObservationCmd);
    cmd.commandId = 'cmd_real_fail_evt_001';

    try {
      await runtime.processAndExecuteCommandAsync(cmd);
    } catch {
      // Expected
    }

    const obsRes = await rawRepo.getObservationByRef('obs_cmd_real_fail_evt_001');
    assert.strictEqual(obsRes.ok, false);

    await dbManager.close();
  });

  it('9. Real PostgreSQL restart replay across separate pool connections', async () => {
    const { pool: pool1 } = createRealPgPool();
    const { runtime: runtime1, dbManager: manager1 } = createPostgresGovernedLearningRuntime({ pool: pool1 });
    await manager1.initializeSchema();

    const cmd = cloneCmd(sampleObservationCmd);
    cmd.commandId = 'cmd_real_restart_001';

    const res1 = await runtime1.processAndExecuteCommandAsync(cmd);
    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res1.replayedResult, undefined);

    await manager1.close();

    const { pool: pool2 } = createRealPgPool();
    const { runtime: runtime2, dbManager: manager2 } = createPostgresGovernedLearningRuntime({ pool: pool2 });

    const res2 = await runtime2.processAndExecuteCommandAsync(cmd);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, true);

    await manager2.close();
  });

  it('10. Real PostgreSQL response loss replay (Window G pass)', async () => {
    const { pool } = createRealPgPool();
    const { runtime, dbManager } = createPostgresGovernedLearningRuntime({ pool });
    await dbManager.initializeSchema();

    const cmd = cloneCmd(sampleObservationCmd);
    cmd.commandId = 'cmd_real_window_g_001';

    const res1 = await runtime.processAndExecuteCommandAsync(cmd);
    assert.strictEqual(res1.ok, true);

    // Simulate lost response: caller retries exact same command
    const res2 = await runtime.processAndExecuteCommandAsync(cmd);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, true);

    await dbManager.close();
  });

  it('11. Real PostgreSQL transaction context security enforcement', async () => {
    const { pool: pool1 } = createRealPgPool();
    const { pool: pool2 } = createRealPgPool();

    const manager1 = new PostgresDatabaseManager({ pool: pool1 });
    const manager2 = new PostgresDatabaseManager({ pool: pool2 });
    await manager1.initializeSchema();
    await manager2.initializeSchema();

    const repo1 = new PostgresGovernanceRepository(manager1);
    const uow1 = new PostgresRuntimeIntegrityUnitOfWork(manager1);

    await uow1.execute(async (txValid) => {
      const saveRes = await repo1.saveObservation({ observationRef: 'obs_sec_001', category: 'TEST', statement: 'Statement' }, txValid);
      assert.strictEqual(saveRes.ok, true);
    });

    const foreignContext: TransactionContext = {
      transactionId: 'tx_foreign',
      createdAt: new Date().toISOString(),
      isDurable: true,
      managerId: manager2.getManagerId(),
    };
    const foreignRes = await repo1.saveObservation({ observationRef: 'obs_sec_002', category: 'TEST', statement: 'Statement' }, foreignContext);
    assert.strictEqual(foreignRes.ok, false);
    assert.strictEqual(foreignRes.category, 'ERROR');

    const missingRes = await repo1.saveObservation({ observationRef: 'obs_sec_003', category: 'TEST', statement: 'Statement' });
    assert.strictEqual(missingRes.ok, false);
    assert.strictEqual(missingRes.category, 'ERROR');

    await manager1.close();
    await manager2.close();
  });

  it('12. Real PostgreSQL connection cleanup (zero pool leaks)', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);
    for (let i = 0; i < 5; i++) {
      await uow.execute(async (tx) => {
        const client = dbManager.getClient(tx);
        await client.query('SELECT 1;');
      });
    }

    assert.strictEqual(pool.totalCount, pool.idleCount);
    await dbManager.close();
  });

  it('13. Real PostgreSQL JSONB serialization round-trip equivalence', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();

    const repo = new PostgresGovernanceRepository(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    const complexPayload = {
      observationRef: 'obs_jsonb_001',
      category: 'MECHANICAL',
      statement: 'JSONB statement',
      evidenceRefs: [{ evidenceId: 'ev_001', score: 0.95 }],
      meta: { tags: ['tag1', 'tag2'], active: true },
    };

    await uow.execute(async (tx) => {
      await repo.saveObservation(complexPayload, tx);
    });

    const getRes = await repo.getObservationByRef('obs_jsonb_001');
    assert.strictEqual(getRes.ok, true);
    if (getRes.ok) {
      assert.deepStrictEqual(getRes.data, complexPayload);
    }

    await dbManager.close();
  });

  it('14. Real PostgreSQL deadlock 40P01 detection and transaction rollback', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();
    const repo = new PostgresGovernanceRepository(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    await uow.execute(async (tx) => {
      await repo.saveObservation({ observationRef: 'obs_dl_1', category: 'TEST', statement: 'Statement 1' }, tx);
      await repo.saveObservation({ observationRef: 'obs_dl_2', category: 'TEST', statement: 'Statement 2' }, tx);
    });

    let deadlockCaught = false;

    const pA = uow.execute(async (txA) => {
      const client = dbManager.getClient(txA);
      await client.query("SET deadlock_timeout = '50ms';");
      await repo.getObservationByRef('obs_dl_1', txA, true);
      await new Promise((r) => setTimeout(r, 150));
      return await repo.getObservationByRef('obs_dl_2', txA, true);
    });

    const pB = uow.execute(async (txB) => {
      const client = dbManager.getClient(txB);
      await client.query("SET deadlock_timeout = '50ms';");
      await new Promise((r) => setTimeout(r, 50));
      await repo.getObservationByRef('obs_dl_2', txB, true);
      return await repo.getObservationByRef('obs_dl_1', txB, true);
    });

    const [resA, resB] = await Promise.all([pA, pB]);

    const errorRes: any = [resA, resB].find((r: any) => r && !r.ok && r.category === 'ERROR');
    assert.ok(errorRes, 'Expected one transaction to return category ERROR on deadlock');
    assert.match(errorRes.error?.message ?? '', /deadlock/i);
    assert.strictEqual(errorRes.error?.databaseCode, '40P01');

    assert.strictEqual(pool.totalCount, pool.idleCount);
    await dbManager.close();
  });

  it('15. Real PostgreSQL explicit parent transaction context policy', async () => {
    const { pool } = createRealPgPool();
    const dbManager = new PostgresDatabaseManager({ pool });
    await dbManager.initializeSchema();
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    // Valid parent context reuse
    await uow.execute(async (parentTx) => {
      const parentClient = dbManager.getClient(parentTx);
      await uow.execute(async (childTx) => {
        assert.strictEqual(childTx.transactionId, parentTx.transactionId);
        const childClient = dbManager.getClient(childTx);
        assert.strictEqual(childClient, parentClient);
      }, parentTx);
    });

    // Invalid / stale parent context fails closed
    const staleContext: TransactionContext = {
      transactionId: 'tx_stale_999',
      createdAt: new Date().toISOString(),
      isDurable: true,
      managerId: dbManager.getManagerId(),
    };

    let errorCaught = false;
    try {
      await uow.execute(async () => {}, staleContext);
    } catch (err: any) {
      if (err?.message?.includes('stale or invalid')) {
        errorCaught = true;
      }
    }
    assert.strictEqual(errorCaught, true);

    // Foreign parent context from manager B fails closed when used with manager A UoW
    const dbManagerB = new PostgresDatabaseManager({ pool });
    await dbManagerB.initializeSchema();
    const foreignTx = await dbManagerB.beginTransaction();

    let foreignErrorCaught = false;
    try {
      await uow.execute(async () => {}, foreignTx);
    } catch (err: any) {
      if (err?.message?.includes('foreign database manager')) {
        foreignErrorCaught = true;
      }
    } finally {
      await dbManagerB.rollbackTransaction(foreignTx);
    }
    assert.strictEqual(foreignErrorCaught, true);

    await dbManagerB.close();
    await dbManager.close();
  });
});
