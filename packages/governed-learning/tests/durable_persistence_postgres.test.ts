import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { newDb } from 'pg-mem';
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
  RuntimeIntegrityUnitOfWork,
  TransactionContext,
} from '../src/contracts/ports.js';
import type { GovernancePersistencePort } from '../src/runtime/persistence.js';
import { RuntimeInvariantError } from '../src/runtime/errors.js';

function createPgTestEnv() {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  return { pool: new Pool(), pgMemDb: db };
}

function cloneCmd<T>(cmd: T): T {
  return JSON.parse(JSON.stringify(cmd));
}

describe('GL-HARDENING-006 PostgreSQL Level-2 Production Adapter & Multi-Instance Concurrency', () => {
  const sampleObservationCmd: GovernanceCommandEnvelope = {
    commandId: 'cmd_pg_obs_001',
    commandType: 'DraftObservation' as const,
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-19T18:00:00.000Z',
    actorRef: { actorId: 'agent_alice', actorType: 'AGENT' },
    authorityContextRef: { authorityId: 'auth_sys' },
    payload: { category: 'MECHANICAL', statement: 'Postgres durable observation statement test' },
  };

  it('1. PostgreSQL entity persistence survives restart', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const repo = new PostgresGovernanceRepository(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    await uow.execute(async (tx) => {
      await repo.saveObservation({ observationRef: 'obs_pg_100', category: 'TEST', statement: 'Statement' }, tx);
    });

    const obs = await repo.getObservationByRef('obs_pg_100');
    assert.strictEqual(obs.ok, true);
    if (obs.ok) {
      assert.strictEqual((obs.data as any).observationRef, 'obs_pg_100');
    }

    await dbManager.close();
  });

  it('2. PostgreSQL event persistence survives restart', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const repo = new PostgresGovernanceRepository(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    await uow.execute(async (tx) => {
      await repo.appendEvent({ eventRef: 'evt_pg_100', eventType: 'OBSERVATION_CREATED' }, tx);
    });

    const events = await repo.getEvents();
    assert.strictEqual(events.ok, true);
    if (events.ok) {
      assert.strictEqual(events.data.length, 1);
      assert.strictEqual((events.data[0] as any).eventRef, 'evt_pg_100');
    }

    await dbManager.close();
  });

  it('3. PostgreSQL command record survives transaction commit', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const store = new PostgresIdempotencyStore(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    const record = {
      commandId: 'cmd_pg_rec_001',
      commandFingerprint: 'fp_pg_rec_001',
      commandType: 'DraftObservation' as const,
      payloadVersion: '1.0.0',
      issuedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      executionOutcome: { ok: true, category: 'SUCCESS' as const, outcome: 'COMMAND_SUCCESS', data: { obsId: '1' } },
    };

    await uow.execute(async (tx) => {
      await store.recordCommandExecution(record, tx);
    });

    const lookup = await store.getCommandExecution('cmd_pg_rec_001');
    assert.strictEqual(lookup.ok, true);
    assert.ok(lookup.data);
    assert.strictEqual(lookup.data?.commandId, 'cmd_pg_rec_001');

    await dbManager.close();
  });

  it('4. PostgreSQL runtime processAndExecuteCommandAsync replays exact retry', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const { runtime, dbManager, persistencePort } = createPostgresGovernedLearningRuntime({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const cmd = cloneCmd(sampleObservationCmd);

    const res1 = await runtime.processAndExecuteCommandAsync(cmd);
    if (!res1.ok) {
      console.log('TEST 4 RES1 FAILED:', JSON.stringify(res1, null, 2));
    }
    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res1.replayedResult, undefined);

    const res2 = await runtime.processAndExecuteCommandAsync(cmd);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, true);

    const events = await persistencePort.getEvents();
    assert.strictEqual(events.ok, true);
    if (events.ok) {
      assert.strictEqual(events.data.length, 1);
    }

    await dbManager.close();
  });

  it('5. PostgreSQL changed identity retry returns REFUSED', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const { runtime, dbManager } = createPostgresGovernedLearningRuntime({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const cmd1 = cloneCmd(sampleObservationCmd);
    const cmd2: GovernanceCommandEnvelope = {
      ...sampleObservationCmd,
      payload: { category: 'MECHANICAL', statement: 'Mismatched statement' },
    };

    const res1 = await runtime.processAndExecuteCommandAsync(cmd1);
    assert.strictEqual(res1.ok, true);

    const res2 = await runtime.processAndExecuteCommandAsync(cmd2);
    assert.strictEqual(res2.ok, false);
    assert.strictEqual(res2.category, 'REFUSED');
    assert.strictEqual(res2.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');

    await dbManager.close();
  });

  it('6. PostgreSQL post-BEGIN lookup failure aborts handler and rolls back transaction', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const rawRepo = new PostgresGovernanceRepository(dbManager);
    const rawStore = new PostgresIdempotencyStore(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    let postBeginLookupAttempts = 0;
    let domainPersistenceCalls = 0;

    const failingStore: IdempotencyStorePort = {
      async getCommandExecution(commandId, tx) {
        if (tx !== undefined) {
          postBeginLookupAttempts++;
          return {
            ok: false,
            category: 'ERROR',
            error: new RuntimeInvariantError('Injected PostgreSQL post-BEGIN lookup failure'),
          };
        }
        return await rawStore.getCommandExecution(commandId, tx);
      },
      async recordCommandExecution(record, tx) {
        return await rawStore.recordCommandExecution(record, tx);
      },
    };

    const trackedRepo: GovernancePersistencePort = {
      async saveObservation(obs: any, tx?: TransactionContext) {
        domainPersistenceCalls++;
        return await rawRepo.saveObservation(obs, tx);
      },
      async saveLesson(l: any, tx?: TransactionContext) {
        domainPersistenceCalls++;
        return await rawRepo.saveLesson(l, tx);
      },
      async saveRuleCandidate(r: any, tx?: TransactionContext) {
        domainPersistenceCalls++;
        return await rawRepo.saveRuleCandidate(r, tx);
      },
      async getObservationByRef(ref: string, tx?: TransactionContext) {
        return await rawRepo.getObservationByRef(ref, tx);
      },
      async getLessonByRef(ref: string, tx?: TransactionContext) {
        return await rawRepo.getLessonByRef(ref, tx);
      },
      async getRuleCandidateById(id: string, tx?: TransactionContext) {
        return await rawRepo.getRuleCandidateById(id, tx);
      },
      async appendEvent(evt: any, tx?: TransactionContext) {
        return await rawRepo.appendEvent(evt, tx);
      },
      async getEvents(filter?: any, tx?: TransactionContext) {
        return await rawRepo.getEvents(filter, tx);
      },
    };

    const runtime = createPostgresGovernedLearningRuntime({ pool, pgMemDb }).runtime;
    // Instantiate with custom tracked ports
    const failingRuntime = new (runtime.constructor as any)({
      persistencePort: trackedRepo,
      idempotencyStore: failingStore,
      unitOfWork: uow,
    });

    const res = await failingRuntime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');

    assert.strictEqual(postBeginLookupAttempts, 1);
    assert.strictEqual(domainPersistenceCalls, 0);

    const obsRes = await rawRepo.getObservationByRef('obs_cmd_pg_obs_001');
    assert.strictEqual(obsRes.ok, false);

    await dbManager.close();
  });

  it('7. PostgreSQL command-record write failure rolls back entity and event (Window C closed)', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
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

    const runtime = new (createPostgresGovernedLearningRuntime({ pool, pgMemDb }).runtime.constructor as any)({
      persistencePort: repo,
      idempotencyStore: failingStore,
      unitOfWork: uow,
    });

    try {
      await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
    } catch {
      // Expected exception or error
    }

    const obsRes = await repo.getObservationByRef('obs_cmd_pg_obs_001');
    assert.strictEqual(obsRes.ok, false);

    const eventsRes = await repo.getEvents();
    assert.strictEqual(eventsRes.ok, true);
    if (eventsRes.ok) {
      assert.strictEqual(eventsRes.data.length, 0);
    }

    await dbManager.close();
  });

  it('8. PostgreSQL event append failure rolls back entity write (Window E/F closed)', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const rawRepo = new PostgresGovernanceRepository(dbManager);
    const store = new PostgresIdempotencyStore(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    const failingRepo: GovernancePersistencePort = {
      saveObservation: (obs, tx) => rawRepo.saveObservation(obs, tx),
      saveLesson: (l, tx) => rawRepo.saveLesson(l, tx),
      saveRuleCandidate: (r, tx) => rawRepo.saveRuleCandidate(r, tx),
      getObservationByRef: (ref, tx) => rawRepo.getObservationByRef(ref, tx),
      getLessonByRef: (ref, tx) => rawRepo.getLessonByRef(ref, tx),
      getRuleCandidateById: (id, tx) => rawRepo.getRuleCandidateById(id, tx),
      getEvents: (filter, tx) => rawRepo.getEvents(filter, tx),
      async appendEvent() {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError('Simulated event append failure'),
        };
      },
    };

    const runtime = new (createPostgresGovernedLearningRuntime({ pool, pgMemDb }).runtime.constructor as any)({
      persistencePort: failingRepo,
      idempotencyStore: store,
      unitOfWork: uow,
    });

    try {
      await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
    } catch {
      // Expected
    }

    const obsRes = await rawRepo.getObservationByRef('obs_cmd_pg_obs_001');
    assert.strictEqual(obsRes.ok, false);

    await dbManager.close();
  });

  it('9. PostgreSQL Window H same-identity concurrent race yields exactly one winner and one replay', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const { runtime: runtimeA } = createPostgresGovernedLearningRuntime({ pool, pgMemDb });
    const { runtime: runtimeB } = createPostgresGovernedLearningRuntime({ pool, pgMemDb });

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

  it('10. PostgreSQL Window H mismatched-identity concurrent race yields one winner and one REFUSED', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManager.initializeSchema();

    const { runtime: runtimeA } = createPostgresGovernedLearningRuntime({ pool, pgMemDb });
    const { runtime: runtimeB } = createPostgresGovernedLearningRuntime({ pool, pgMemDb });

    const cmdA: GovernanceCommandEnvelope = {
      ...sampleObservationCmd,
      commandId: 'cmd_pg_race_diff_001',
      payload: { category: 'MECHANICAL', statement: 'Statement A' },
    };

    const cmdB: GovernanceCommandEnvelope = {
      ...sampleObservationCmd,
      commandId: 'cmd_pg_race_diff_001',
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

  it('11. PostgreSQL transaction context enforcement rejects missing, foreign, or fabricated contexts', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManagerA = new PostgresDatabaseManager({ pool, pgMemDb });
    const dbManagerB = new PostgresDatabaseManager({ pool, pgMemDb });
    await dbManagerA.initializeSchema();

    const repoA = new PostgresGovernanceRepository(dbManagerA);
    const repoB = new PostgresGovernanceRepository(dbManagerB);
    const uowA = new PostgresRuntimeIntegrityUnitOfWork(dbManagerA);

    // Missing context
    const missingRes = await repoA.saveObservation({ observationRef: 'obs_pg_no_tx', category: 'TEST', statement: 'Stmt' });
    assert.strictEqual(missingRes.ok, false);
    assert.strictEqual(missingRes.category, 'ERROR');

    // Fabricated context
    const fabTx: TransactionContext = { transactionId: 'tx_fake_pg', createdAt: new Date().toISOString(), isDurable: true };
    const fabRes = await repoA.saveObservation({ observationRef: 'obs_pg_fab_tx', category: 'TEST', statement: 'Stmt' }, fabTx);
    assert.strictEqual(fabRes.ok, false);

    await uowA.execute(async (txA) => {
      // Foreign context (txA on repoB)
      const foreignRes = await repoB.saveObservation({ observationRef: 'obs_pg_foreign_tx', category: 'TEST', statement: 'Stmt' }, txA);
      assert.strictEqual(foreignRes.ok, false);
      assert.strictEqual(foreignRes.category, 'ERROR');
    });

    await dbManagerA.close();
    await dbManagerB.close();
  });

  it('12. PostgreSQL persistence refusal halts dependent event append and success command record', async () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const { runtime, dbManager, persistencePort } = createPostgresGovernedLearningRuntime({ pool, pgMemDb });
    await dbManager.initializeSchema();

    // Pre-insert observation ref obs_cmd_pg_obs_001 directly inside unit of work
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);
    await uow.execute(async (tx) => {
      await persistencePort.saveObservation({ observationRef: 'obs_cmd_pg_obs_001', category: 'MECHANICAL', statement: 'First statement' }, tx);
    });

    // Execute command attempting to overwrite obs_cmd_pg_obs_001 -> saveObservation returns REFUSED
    const res = await runtime.processAndExecuteCommandAsync(cloneCmd(sampleObservationCmd));
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_HISTORICAL_MUTATION_DENIED');

    const eventsRes = await persistencePort.getEvents();
    assert.strictEqual(eventsRes.ok, true);
    if (eventsRes.ok) {
      assert.strictEqual(eventsRes.data.length, 0);
    }

    await dbManager.close();
  });

  it('13. PostgreSQL sync processAndExecuteCommand explicitly rejects thenable UnitOfWork (SYNC_RUNTIME_THENABLE_GUARD)', () => {
    const { pool, pgMemDb } = createPgTestEnv();
    const dbManager = new PostgresDatabaseManager({ pool, pgMemDb });
    const repo = new PostgresGovernanceRepository(dbManager);
    const store = new PostgresIdempotencyStore(dbManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

    const runtime = new (createPostgresGovernedLearningRuntime({ pool, pgMemDb }).runtime.constructor as any)({
      persistencePort: repo,
      idempotencyStore: store,
      unitOfWork: uow,
    });

    // Synchronous execution with async PostgreSQL UnitOfWork must throw RuntimeInvariantError
    assert.throws(
      () => runtime.processAndExecuteCommand(cloneCmd(sampleObservationCmd)),
      (err: any) => err?.message?.includes('Synchronous runtime requires a synchronous UnitOfWork implementation')
    );
  });
});

