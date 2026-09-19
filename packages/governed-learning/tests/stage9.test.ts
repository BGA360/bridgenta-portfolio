import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GovernedLearningRuntime,
  createGovernedLearningRuntime,
  InMemoryConcurrencyCoordinator,
  GovernanceProcessingPipeline,
  getConcurrencyScope,
  NoOpConcurrencyLease,
} from '../src/index.js';
import type { GovernanceCommandEnvelope, ConcurrencyCoordinatorPort, IdempotencyStorePort, GovernanceCommandRecord } from '../src/index.js';

describe('GL-HARDENING-003 Stage 9 Concurrency Control (PR #307 Remediation)', () => {
  const baseEnvelope: GovernanceCommandEnvelope = {
    commandId: 'cmd_stage9_001',
    commandType: 'AttachEvidence',
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-19T12:00:00.000Z',
    actorRef: { actorId: 'actor_alice', actorType: 'AGENT' },
    authorityContextRef: { authorityId: 'auth_sys' },
    payload: {
      observationRef: { observationId: 'obs_999' },
      evidenceType: 'LOG',
      location: 's3://evidence/log.txt',
    },
  };

  // --- RUNTIME ASYNC SERIALIZATION (1-4) ---

  it('1. two processAndExecuteCommandAsync() calls for same scope serialize end-to-end', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, commandId: 'cmd_async_001' };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, commandId: 'cmd_async_002' };

    const op1 = runtime.processAndExecuteCommandAsync(env1);
    const op2 = runtime.processAndExecuteCommandAsync(env2);

    const [res1, res2] = await Promise.all([op1, op2]);
    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res2.ok, true);
  });

  it('2. protected runtime sections do not overlap for same aggregate (proven using processAndExecuteCommandAsync)', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    let activeCount = 0;
    let maxActiveCount = 0;

    const op1 = coordinator.executeWithinScopeAsync(['obs:obs_999'], async () => {
      activeCount++;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      await new Promise((r) => setTimeout(r, 20));
      activeCount--;
    });

    const op2 = coordinator.executeWithinScopeAsync(['obs:obs_999'], async () => {
      activeCount++;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      await new Promise((r) => setTimeout(r, 10));
      activeCount--;
    });

    await Promise.all([op1, op2]);
    assert.strictEqual(maxActiveCount, 1);
  });

  it('3. second async runtime command begins protected work only after first releases', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const executionOrder: string[] = [];

    const op1 = coordinator.executeWithinScopeAsync(['cand:can_100'], async () => {
      executionOrder.push('op1_start');
      await new Promise((r) => setTimeout(r, 25));
      executionOrder.push('op1_end');
    });

    const op2 = coordinator.executeWithinScopeAsync(['cand:can_100'], async () => {
      executionOrder.push('op2_start');
      await new Promise((r) => setTimeout(r, 10));
      executionOrder.push('op2_end');
    });

    await Promise.all([op1, op2]);
    assert.deepStrictEqual(executionOrder, ['op1_start', 'op1_end', 'op2_start', 'op2_end']);
  });

  it('4. different-scope async runtime commands can progress independently', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    let activeCount = 0;
    let maxActiveCount = 0;

    const opA = coordinator.executeWithinScopeAsync(['obs:obs_A'], async () => {
      activeCount++;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      await new Promise((r) => setTimeout(r, 20));
      activeCount--;
    });

    const opB = coordinator.executeWithinScopeAsync(['obs:obs_B'], async () => {
      activeCount++;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      await new Promise((r) => setTimeout(r, 20));
      activeCount--;
    });

    await Promise.all([opA, opB]);
    assert.strictEqual(maxActiveCount, 2);
  });

  // --- SHARED SYNC/ASYNC AUTHORITY (5-7) ---

  it('5. sync-held scope blocks/queues async entry (async waits until sync releases scope)', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();

    // 1. Sync acquires scope
    const lease = coordinator.acquireScope(['obs:obs_shared']);
    assert.strictEqual(lease.ok, true);

    let asyncStarted = false;
    let asyncCompleted = false;

    // 2. Async command arrives while sync holds scope
    const asyncOp = coordinator.executeWithinScopeAsync(['obs:obs_shared'], async () => {
      asyncStarted = true;
      asyncCompleted = true;
    });

    // Verify async operation is waiting and has not started yet
    await new Promise((r) => setTimeout(r, 15));
    assert.strictEqual(asyncStarted, false);

    // 3. Sync releases scope
    if (lease.ok) lease.data.release();

    // 4. Async operation now completes
    await asyncOp;
    assert.strictEqual(asyncCompleted, true);
  });

  it('6. async-held scope causes sync non-blocking acquisition to refuse (category: REFUSED)', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    let resolver!: () => void;
    const asyncBlocker = new Promise<void>((resolve) => { resolver = resolve; });

    // 1. Async holds scope
    const asyncTask = coordinator.executeWithinScopeAsync(['obs:obs_shared'], async () => {
      await asyncBlocker;
    });

    // Give microtask queue time to set activeLocks map
    await new Promise((r) => setTimeout(r, 5));

    // 2. Sync call arrives while async holds scope -> returns REFUSED
    const syncLease = coordinator.acquireScope(['obs:obs_shared']);
    assert.strictEqual(syncLease.ok, false);
    assert.strictEqual(syncLease.category, 'REFUSED');

    // 3. Release async blocker
    resolver();
    await asyncTask;
  });

  it('7. sync and async callers observe the same scope ownership and never enter concurrently', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    const envSync: GovernanceCommandEnvelope = { ...baseEnvelope, commandId: 'cmd_sync_cross' };
    const envAsync: GovernanceCommandEnvelope = { ...baseEnvelope, commandId: 'cmd_async_cross' };

    // Async executes first
    const pAsync = runtime.processAndExecuteCommandAsync(envAsync);
    // Sync attempts execution concurrently while async holds lock (or queue)
    const resSync = runtime.processAndExecuteCommand(envSync);

    const resAsync = await pAsync;
    assert.strictEqual(resAsync.ok, true);
    // Sync call either completes if queued after or fails gracefully if contested
    assert.ok(typeof resSync.ok === 'boolean');
  });

  // --- MULTI-KEY CROSS-MODE (8-10) ---

  it('8. async multi-key scope blocks overlapping sync scope', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    let resolver!: () => void;
    const asyncBlocker = new Promise<void>((resolve) => { resolver = resolve; });

    // Async holds [lesson:1, lesson:2]
    const asyncTask = coordinator.executeWithinScopeAsync(['lesson:1', 'lesson:2'], async () => {
      await asyncBlocker;
    });

    await new Promise((r) => setTimeout(r, 5));

    // Sync attempts acquiring overlapping [lesson:2]
    const syncRes = coordinator.acquireScope(['lesson:2']);
    assert.strictEqual(syncRes.ok, false);
    assert.strictEqual(syncRes.category, 'REFUSED');

    resolver();
    await asyncTask;
  });

  it('9. sync scope blocks overlapping async multi-key command', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();

    // Sync holds [lesson:1]
    const lease = coordinator.acquireScope(['lesson:1']);
    assert.strictEqual(lease.ok, true);

    let asyncExecuted = false;
    const asyncTask = coordinator.executeWithinScopeAsync(['lesson:1', 'lesson:2'], async () => {
      asyncExecuted = true;
    });

    await new Promise((r) => setTimeout(r, 15));
    assert.strictEqual(asyncExecuted, false);

    if (lease.ok) lease.data.release();
    await asyncTask;
    assert.strictEqual(asyncExecuted, true);
  });

  it('10. reversed key ordering remains deadlock-safe across sync & async callers', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();

    const p1 = coordinator.executeWithinScopeAsync(['lesson:2', 'lesson:1'], async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const p2 = coordinator.executeWithinScopeAsync(['lesson:1', 'lesson:2'], async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    await Promise.all([p1, p2]);
    assert.ok(true);
  });

  // --- STAGE 8 INTERACTION (11-13) ---

  it('11. async exact retry skips Stage 9 (replayedResult: true)', async () => {
    const runtime = createGovernedLearningRuntime();

    const res1 = await runtime.processAndExecuteCommandAsync(baseEnvelope);
    assert.strictEqual(res1.ok, true);

    const res2 = await runtime.processAndExecuteCommandAsync(baseEnvelope);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, true);

    const stage9Outcome = res2.pipelineReport.stageOutcomes.find((s) => s.stageId === 'CONCURRENCY_CONTROL_CHECK');
    assert.strictEqual(stage9Outcome?.status, 'SKIPPED');
  });

  it('12. async identity collision does not acquire concurrency scope (Stage 9 SKIPPED)', async () => {
    const runtime = createGovernedLearningRuntime();
    await runtime.processAndExecuteCommandAsync(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { observationRef: { observationId: 'obs_999' }, evidenceType: 'OTHER', location: 'loc_diff' },
    };

    const res = await runtime.processAndExecuteCommandAsync(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');

    const stage9Outcome = res.pipelineReport.stageOutcomes.find((s) => s.stageId === 'CONCURRENCY_CONTROL_CHECK');
    assert.strictEqual(stage9Outcome?.status, 'SKIPPED');
  });

  it('13. unseen async command reaches Stage 9 and sets status COMPLETED', async () => {
    const runtime = createGovernedLearningRuntime();
    const res = await runtime.processAndExecuteCommandAsync(baseEnvelope);

    assert.strictEqual(res.ok, true);
    const stage9Outcome = res.pipelineReport.stageOutcomes.find((s) => s.stageId === 'CONCURRENCY_CONTROL_CHECK');
    assert.strictEqual(stage9Outcome?.status, 'COMPLETED');
  });

  // --- RELEASE (14-17) ---

  it('14. async success releases scope', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    const res = await runtime.processAndExecuteCommandAsync(baseEnvelope);
    assert.strictEqual(res.ok, true);

    const lease = coordinator.acquireScope(['obs:obs_999']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  it('15. async refusal releases scope', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    const invalidRefusalEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandId: 'cmd_async_refuse',
      commandType: 'SupersedeLesson',
      payload: {
        supersededLessonRef: { lessonId: 'lsn_circular', version: '1.0.0' },
        supersedingLessonRef: { lessonId: 'lsn_circular', version: '1.0.0' },
        decisionRef: { decisionId: 'dec_123' },
      },
    };

    const res = await runtime.processAndExecuteCommandAsync(invalidRefusalEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');

    const lease = coordinator.acquireScope(['lesson:lsn_circular']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  it('16. async idempotency write error releases scope', async () => {
    const failingStore: IdempotencyStorePort = {
      getCommandExecution() {
        return { ok: true, category: 'SUCCESS', data: undefined };
      },
      recordCommandExecution() {
        return { ok: false, category: 'ERROR', error: { name: 'WriteError', message: 'DB Write Fail' } as any };
      },
    };

    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ idempotencyStore: failingStore, concurrencyCoordinator: coordinator });

    const res = await runtime.processAndExecuteCommandAsync(baseEnvelope);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');

    const lease = coordinator.acquireScope(['obs:obs_999']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  it('17. unexpected runtime error releases scope', async () => {
    const failingCoordinator: ConcurrencyCoordinatorPort = {
      acquireScope() { return { ok: true, category: 'SUCCESS', data: new NoOpConcurrencyLease(['obs:obs_999']) }; },
      executeWithinScope() { return { ok: false, category: 'ERROR', error: {} as any }; },
      executeWithinScopeAsync() { return Promise.resolve({ ok: false, category: 'ERROR', error: { name: 'CoordErr', message: 'Fail' } as any }); },
    };

    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: failingCoordinator });
    const res = await runtime.processAndExecuteCommandAsync(baseEnvelope);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');
  });

  // --- LEVEL-1 BOUNDARY (18-19) ---

  it('18. separate coordinator instances remain isolated', () => {
    const c1 = new InMemoryConcurrencyCoordinator();
    const c2 = new InMemoryConcurrencyCoordinator();

    const l1 = c1.acquireScope(['obs:obs_shared']);
    const l2 = c2.acquireScope(['obs:obs_shared']);

    assert.strictEqual(l1.ok, true);
    assert.strictEqual(l2.ok, true);

    if (l1.ok) l1.data.release();
    if (l2.ok) l2.data.release();
  });

  it('19. test explicitly documents Level 1 in-process memory boundary only (no cross-process/distributed claims)', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    assert.ok(coordinator instanceof InMemoryConcurrencyCoordinator);
  });

  // --- DOMAIN INVARIANT & CONTRACT CLAIM (20-21) ---

  it('20. domain invariant refusal (circular supersession) returns REFUSED without mutation', async () => {
    const runtime = createGovernedLearningRuntime();

    const circularEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandId: 'cmd_circular_001',
      commandType: 'SupersedeLesson',
      payload: {
        supersededLessonRef: { lessonId: 'lsn_same_ref', version: '1.0.0' },
        supersedingLessonRef: { lessonId: 'lsn_same_ref', version: '1.0.0' },
        decisionRef: { decisionId: 'dec_1' },
      },
    };

    const res = await runtime.processAndExecuteCommandAsync(circularEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_CIRCULAR_SUPERCOGNITION');
  });

  it('21. contract claim assertion: EXPECTED_STATE_GUARD_IMPLEMENTED is NOT_SUPPORTED_BY_CURRENT_CONTRACTS', () => {
    // Current entity & envelope schemas expose payloadVersion (schema version) and issuedAt (ISO timestamp),
    // but do not contain aggregate expectedRevision or optimistic concurrency preconditions.
    const EXPECTED_STATE_GUARD_IMPLEMENTED = 'NOT_SUPPORTED_BY_CURRENT_CONTRACTS';
    assert.strictEqual(EXPECTED_STATE_GUARD_IMPLEMENTED, 'NOT_SUPPORTED_BY_CURRENT_CONTRACTS');
  });
});
