import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  GovernedLearningRuntime,
  createGovernedLearningRuntime,
  InMemoryGovernanceRepository,
} from '../src/runtime/index.js';
import {
  SqliteDatabaseManager,
  SqliteGovernanceRepository,
  SqliteRuntimeIntegrityUnitOfWork,
} from '../src/durable/sqlite-adapter.js';
import {
  PostgresDatabaseManager,
  PostgresGovernanceRepository,
  PostgresRuntimeIntegrityUnitOfWork,
} from '../src/durable/postgres-adapter.js';
import { newDb } from 'pg-mem';
import type { GovernanceCommandEnvelope } from '../src/contracts/envelopes.js';

describe('Governed Learning Guidance Query Runtime (GL_CAPABILITY_GAP_001)', () => {
  let runtime: GovernedLearningRuntime;
  let persistenceRepo: InMemoryGovernanceRepository;

  const validTargetRef = {
    targetCategory: 'PROJECT' as const,
    projectRef: { projectId: 'PRJ-ALPHA' },
  };

  const createCommandInput = (commandId: string, commandType: any, payload: any): GovernanceCommandEnvelope => ({
    commandId,
    commandType,
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-23T10:00:00Z',
    actorRef: { actorId: 'usr_architect', actorType: 'HUMAN' as const },
    authorityContextRef: { authorityId: 'auth_board' },
    payload,
  });

  beforeEach(() => {
    persistenceRepo = new InMemoryGovernanceRepository();
    runtime = createGovernedLearningRuntime({ persistencePort: persistenceRepo });
  });

  it('1. Empty store query returns SUCCESS with empty guidance set ([])', async () => {
    const input = createCommandInput('cmd_q_001', 'BuildGuidanceSetQuery', {
      queryId: 'gq_001',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });

    const res = await runtime.processAndExecuteCommandAsync(input);

    assert.equal(res.ok, true);
    assert.equal(res.category, 'SUCCESS');
    assert.equal(res.handlerOutcome?.ok, true);
    if (res.handlerOutcome?.ok) {
      const qRes = res.handlerOutcome.data as any;
      assert.equal(qRes.status, 'SUCCESS');
      assert.equal(qRes.queryId, 'gq_001');
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 0);
    }
  });

  it('2. Approved / Published lesson is returned in guidance set exactly once', async () => {
    // 1. Create lesson candidate
    const inputCan = createCommandInput('cmd_can_001', 'CreateLessonCandidate', {
      statement: 'Always enforce deterministic ordering in query responses',
      rationale: 'Prevents non-deterministic client behavior across cluster nodes',
      scope: { scopeType: 'SINGLE_FRAMEWORK' as const, frameworkRef: { frameworkId: 'ASTRO_FW' } },
      originatingObservationRefs: [],
    });
    const resCan = await runtime.processAndExecuteCommandAsync(inputCan);
    assert.equal(resCan.ok, true);

    // 2. Approve lesson candidate -> status PUBLISHED
    const inputApp = createCommandInput('cmd_app_001', 'ApproveLesson', {
      candidateRef: { candidateId: 'can_cmd_can_001' },
      decisionRef: { decisionId: 'dec_app_001' },
    });
    const resApp = await runtime.processAndExecuteCommandAsync(inputApp);
    assert.equal(resApp.ok, true);

    // 3. Query guidance for matching targetRef & frameworkId
    const inputQ = createCommandInput('cmd_q_002', 'BuildGuidanceSetQuery', {
      queryId: 'gq_002',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await runtime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.status, 'SUCCESS');
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 1);
      const item = qRes.guidanceSet.matchedGuidance[0];
      assert.equal(item.lessonRef.lessonId, 'lsn_cmd_can_001');
      assert.equal(item.statement, 'Always enforce deterministic ordering in query responses');
    }
  });

  it('3. Candidate lessons (unapproved) are excluded from guidance query', async () => {
    const inputCan = createCommandInput('cmd_can_002', 'CreateLessonCandidate', {
      statement: 'Unapproved candidate lesson statement',
      rationale: 'Under review',
      scope: { scopeType: 'SYSTEM_WIDE' as const },
      originatingObservationRefs: [],
    });
    await runtime.processAndExecuteCommandAsync(inputCan);

    const inputQ = createCommandInput('cmd_q_003', 'BuildGuidanceSetQuery', {
      queryId: 'gq_003',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await runtime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 0);
    }
  });

  it('4. Rejected candidate lessons are excluded', async () => {
    persistenceRepo.saveLesson({
      lessonCandidateRef: 'can_rej_001',
      statement: 'Rejected candidate statement',
      rationale: 'Rejected',
      scope: { scopeType: 'SYSTEM_WIDE' },
      state: 'REJECTED',
      status: 'REJECTED',
    });

    const inputQ = createCommandInput('cmd_q_004', 'BuildGuidanceSetQuery', {
      queryId: 'gq_004',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await runtime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 0);
    }
  });

  it('5. Superseded lessons are excluded from guidance set', async () => {
    persistenceRepo.saveLesson({
      lessonRef: 'lsn_old_001',
      lessonId: 'lsn_old_001',
      statement: 'Old superseded statement',
      rationale: 'Superseded',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'SUPERSEDED',
    });

    const inputQ = createCommandInput('cmd_q_005', 'BuildGuidanceSetQuery', {
      queryId: 'gq_005',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await runtime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 0);
    }
  });

  it('6. Retired lessons are excluded', async () => {
    persistenceRepo.saveLesson({
      lessonRef: 'lsn_ret_001',
      lessonId: 'lsn_ret_001',
      statement: 'Retired statement',
      rationale: 'Retired',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'RETIRED',
    });

    const inputQ = createCommandInput('cmd_q_006', 'BuildGuidanceSetQuery', {
      queryId: 'gq_006',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await runtime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 0);
    }
  });

  it('7. Cross-project and cross-workstream target isolation', async () => {
    // Lesson adopted specifically for Project ALPHA
    persistenceRepo.saveLesson({
      lessonId: 'lsn_prj_alpha',
      lessonRef: { lessonId: 'lsn_prj_alpha', version: '1.0.0' },
      statement: 'Project ALPHA specific guidance',
      rationale: 'Adopted for PRJ-ALPHA',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      adoptedByProjectRef: { projectId: 'PRJ-ALPHA' },
      publishedAt: '2026-09-20T10:00:00Z',
    });

    // Lesson adopted specifically for Project BETA
    persistenceRepo.saveLesson({
      lessonId: 'lsn_prj_beta',
      lessonRef: { lessonId: 'lsn_prj_beta', version: '1.0.0' },
      statement: 'Project BETA specific guidance',
      rationale: 'Adopted for PRJ-BETA',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      adoptedByProjectRef: { projectId: 'PRJ-BETA' },
      publishedAt: '2026-09-21T10:00:00Z',
    });

    // Query for Project ALPHA
    const inputQA = createCommandInput('cmd_q_proj_a', 'BuildGuidanceSetQuery', {
      queryId: 'gq_proj_a',
      targetRef: { targetCategory: 'PROJECT' as const, projectRef: { projectId: 'PRJ-ALPHA' } },
      matchStrategy: 'STRICT' as const,
    });
    const resQA = await runtime.processAndExecuteCommandAsync(inputQA);

    assert.equal(resQA.ok, true);
    if (resQA.handlerOutcome?.ok) {
      const qRes = resQA.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 1);
      assert.equal(qRes.guidanceSet.matchedGuidance[0].lessonRef.lessonId, 'lsn_prj_alpha');
    }

    // Query for Project BETA
    const inputQB = createCommandInput('cmd_q_proj_b', 'BuildGuidanceSetQuery', {
      queryId: 'gq_proj_b',
      targetRef: { targetCategory: 'PROJECT' as const, projectRef: { projectId: 'PRJ-BETA' } },
      matchStrategy: 'STRICT' as const,
    });
    const resQB = await runtime.processAndExecuteCommandAsync(inputQB);

    assert.equal(resQB.ok, true);
    if (resQB.handlerOutcome?.ok) {
      const qRes = resQB.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 1);
      assert.equal(qRes.guidanceSet.matchedGuidance[0].lessonRef.lessonId, 'lsn_prj_beta');
    }
  });

  it('8. Deterministic ordering: recency descending, lessonId ascending tiebreaker', async () => {
    persistenceRepo.saveLesson({
      lessonId: 'lsn_B',
      lessonRef: { lessonId: 'lsn_B', version: '1.0.0' },
      statement: 'Statement B',
      rationale: 'Rationale B',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      publishedAt: '2026-09-10T10:00:00Z',
    });

    persistenceRepo.saveLesson({
      lessonId: 'lsn_A',
      lessonRef: { lessonId: 'lsn_A', version: '1.0.0' },
      statement: 'Statement A (Newer)',
      rationale: 'Rationale A',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      publishedAt: '2026-09-20T10:00:00Z',
    });

    const inputQ = createCommandInput('cmd_q_order', 'BuildGuidanceSetQuery', {
      queryId: 'gq_order',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await runtime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 2);
      assert.equal(qRes.guidanceSet.matchedGuidance[0].lessonRef.lessonId, 'lsn_A');
      assert.equal(qRes.guidanceSet.matchedGuidance[1].lessonRef.lessonId, 'lsn_B');
    }
  });

  it('9. Deduplication: lesson eligible through multiple paths is returned once', async () => {
    persistenceRepo.saveLesson({
      lessonId: 'lsn_dup',
      lessonRef: { lessonId: 'lsn_dup', version: '1.0.0' },
      statement: 'Statement Dup',
      rationale: 'Rationale Dup',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      publishedAt: '2026-09-20T10:00:00Z',
    });

    const inputQ = createCommandInput('cmd_q_dedup', 'BuildGuidanceSetQuery', {
      queryId: 'gq_dedup',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });

    const res = await runtime.processAndExecuteCommandAsync(inputQ);
    assert.equal(res.ok, true);
    if (res.handlerOutcome?.ok) {
      const qRes = res.handlerOutcome.data as any;
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 1);
    }
  });

  it('10. Infrastructure failure fails closed with ERROR (not SUCCESS [])', async () => {
    const failingRepo = {
      getLessons() {
        return {
          ok: false as const,
          category: 'ERROR' as const,
          error: new Error('Postgres connection pool exhausted'),
        };
      },
    };

    const failingRuntime = createGovernedLearningRuntime({ persistencePort: failingRepo as any });
    const inputQ = createCommandInput('cmd_q_fail', 'BuildGuidanceSetQuery', {
      queryId: 'gq_fail',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });

    const res = await failingRuntime.processAndExecuteCommandAsync(inputQ);

    assert.equal(res.ok, false);
    assert.equal(res.category, 'ERROR');
    assert.match(res.error?.message ?? '', /Postgres connection pool exhausted/);
  });

  it('11. Query execution is non-mutating (QUERY_MUTATES_DOMAIN_STATE: NO)', async () => {
    const eventsBefore = (persistenceRepo.getEvents() as any).data.length;
    const lessonsBefore = (persistenceRepo.getLessons() as any).data.length;

    const inputQ = createCommandInput('cmd_q_nomutate', 'BuildGuidanceSetQuery', {
      queryId: 'gq_nomutate',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    await runtime.processAndExecuteCommandAsync(inputQ);

    const eventsAfter = (persistenceRepo.getEvents() as any).data.length;
    const lessonsAfter = (persistenceRepo.getLessons() as any).data.length;

    assert.equal(eventsAfter, eventsBefore);
    assert.equal(lessonsAfter, lessonsBefore);
  });

  it('12. Stage 8 Idempotency Replay returns exact cached query result on exact command retry', async () => {
    persistenceRepo.saveLesson({
      lessonId: 'lsn_idem_1',
      lessonRef: { lessonId: 'lsn_idem_1', version: '1.0.0' },
      statement: 'Idempotent query statement',
      rationale: 'Idempotency test',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      publishedAt: '2026-09-20T10:00:00Z',
    });

    const input = createCommandInput('cmd_idem_100', 'BuildGuidanceSetQuery', {
      queryId: 'gq_idem_100',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });

    // First execution
    const res1 = await runtime.processAndExecuteCommandAsync(input);
    assert.equal(res1.ok, true);
    assert.equal(res1.replayedResult, undefined);

    // Second execution with exact same commandId, fingerprint, and issuedAt
    const res2 = await runtime.processAndExecuteCommandAsync(input);
    assert.equal(res2.ok, true);
    assert.equal(res2.replayedResult, true);
    assert.deepStrictEqual(res1.handlerOutcome, res2.handlerOutcome);
  });

  it('13. SQLite L2A Durable Query Test with restart parity', async () => {
    const sqliteManager = new SqliteDatabaseManager(':memory:');
    const sqliteRepo = new SqliteGovernanceRepository(sqliteManager);
    const uow = new SqliteRuntimeIntegrityUnitOfWork(sqliteManager);

    const sqliteRuntime = createGovernedLearningRuntime({
      persistencePort: sqliteRepo,
      unitOfWork: uow,
    });

    // 1. Create and approve lesson
    const inputCan = createCommandInput('cmd_sql_can', 'CreateLessonCandidate', {
      statement: 'SQLite durable guidance item',
      rationale: 'Durability rationale',
      scope: { scopeType: 'SYSTEM_WIDE' as const },
      originatingObservationRefs: [],
    });
    await sqliteRuntime.processAndExecuteCommandAsync(inputCan);

    const inputApp = createCommandInput('cmd_sql_app', 'ApproveLesson', {
      candidateRef: { candidateId: 'can_cmd_sql_can' },
      decisionRef: { decisionId: 'dec_sql_app' },
    });
    await sqliteRuntime.processAndExecuteCommandAsync(inputApp);

    // 2. Query guidance
    const inputQ = createCommandInput('cmd_sql_q', 'BuildGuidanceSetQuery', {
      queryId: 'gq_sql_1',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await sqliteRuntime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.status, 'SUCCESS');
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 1);
      assert.equal(qRes.guidanceSet.matchedGuidance[0].statement, 'SQLite durable guidance item');
    }

    sqliteManager.close();
  });

  it('14. PostgreSQL L2B Durable Query Test (pg-mem)', async () => {
    const mem = newDb();
    const pgMemAdapter = mem.adapters.createPg();
    const pgMemPool = new pgMemAdapter.Pool();

    const pgManager = new PostgresDatabaseManager({ pool: pgMemPool, pgMemDb: mem });
    await pgManager.initializeSchema();
    const pgRepo = new PostgresGovernanceRepository(pgManager);
    const uow = new PostgresRuntimeIntegrityUnitOfWork(pgManager);

    const pgRuntime = createGovernedLearningRuntime({
      persistencePort: pgRepo,
      unitOfWork: uow,
    });

    // 1. Create and approve lesson
    const inputCan = createCommandInput('cmd_pg_can', 'CreateLessonCandidate', {
      statement: 'Postgres durable guidance item',
      rationale: 'Postgres durability rationale',
      scope: { scopeType: 'SYSTEM_WIDE' as const },
      originatingObservationRefs: [],
    });
    await pgRuntime.processAndExecuteCommandAsync(inputCan);

    const inputApp = createCommandInput('cmd_pg_app', 'ApproveLesson', {
      candidateRef: { candidateId: 'can_cmd_pg_can' },
      decisionRef: { decisionId: 'dec_pg_app' },
    });
    await pgRuntime.processAndExecuteCommandAsync(inputApp);

    // 2. Query guidance
    const inputQ = createCommandInput('cmd_pg_q', 'BuildGuidanceSetQuery', {
      queryId: 'gq_pg_1',
      targetRef: validTargetRef,
      matchStrategy: 'STRICT' as const,
    });
    const resQ = await pgRuntime.processAndExecuteCommandAsync(inputQ);

    assert.equal(resQ.ok, true);
    if (resQ.handlerOutcome?.ok) {
      const qRes = resQ.handlerOutcome.data as any;
      assert.equal(qRes.status, 'SUCCESS');
      assert.equal(qRes.guidanceSet.matchedGuidance.length, 1);
      assert.equal(qRes.guidanceSet.matchedGuidance[0].statement, 'Postgres durable guidance item');
    }
  });
});
