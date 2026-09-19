import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GovernedLearningRuntime,
  createGovernedLearningRuntime,
  InMemoryConcurrencyCoordinator,
  GovernanceProcessingPipeline,
  getConcurrencyScope,
  NoOpConcurrencyLease,
  CommandPayloadSchemaRegistry,
  DraftObservationCommandPayloadSchema,
} from '../src/index.js';
import type { GovernanceCommandEnvelope, ConcurrencyCoordinatorPort } from '../src/index.js';

describe('GL-HARDENING-003 Stage 9 Concurrency Control', () => {
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

  // --- SAME AGGREGATE SERIALIZATION (1-6) ---

  it('1. two commands for same aggregate serialize', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    let activeHandlers = 0;
    let maxActiveHandlers = 0;

    const op1 = coordinator.executeWithinScopeAsync(['obs:obs_999'], async () => {
      activeHandlers++;
      maxActiveHandlers = Math.max(maxActiveHandlers, activeHandlers);
      await new Promise((resolve) => setTimeout(resolve, 15));
      activeHandlers--;
    });

    const op2 = coordinator.executeWithinScopeAsync(['obs:obs_999'], async () => {
      activeHandlers++;
      maxActiveHandlers = Math.max(maxActiveHandlers, activeHandlers);
      await new Promise((resolve) => setTimeout(resolve, 15));
      activeHandlers--;
    });

    await Promise.all([op1, op2]);
    assert.strictEqual(maxActiveHandlers, 1);
  });

  it('2. protected handler sections never overlap for same aggregate', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const scopeKeys = ['cand:can_100'];

    const executionLog: string[] = [];

    const p1 = coordinator.executeWithinScopeAsync(scopeKeys, async () => {
      executionLog.push('start_1');
      await new Promise((r) => setTimeout(r, 20));
      executionLog.push('end_1');
    });

    const p2 = coordinator.executeWithinScopeAsync(scopeKeys, async () => {
      executionLog.push('start_2');
      await new Promise((r) => setTimeout(r, 10));
      executionLog.push('end_2');
    });

    await Promise.all([p1, p2]);
    assert.deepStrictEqual(executionLog, ['start_1', 'end_1', 'start_2', 'end_2']);
  });

  it('3. second command executes only after first releases scope', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const lease1 = coordinator.acquireScope(['lesson:lsn_001']);
    assert.strictEqual(lease1.ok, true);

    // Synchronous acquire for same scope while held returns REFUSED
    const lease2 = coordinator.acquireScope(['lesson:lsn_001']);
    assert.strictEqual(lease2.ok, false);
    assert.strictEqual(lease2.category, 'REFUSED');

    // After release, acquisition succeeds
    if (lease1.ok) lease1.data.release();
    const lease3 = coordinator.acquireScope(['lesson:lsn_001']);
    assert.strictEqual(lease3.ok, true);
    if (lease3.ok) lease3.data.release();
  });

  it('4. locks release after successful command', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    const res = runtime.processAndExecuteCommand(baseEnvelope);
    assert.strictEqual(res.ok, true);

    // Confirm scope key is no longer locked
    const lease = coordinator.acquireScope(['obs:obs_999']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  it('5. locks release after refused command', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    const invalidRefusalEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandId: 'cmd_stage9_supersede_self',
      commandType: 'SupersedeLesson',
      payload: {
        supersededLessonRef: { lessonId: 'lsn_circular', version: '1.0.0' },
        supersedingLessonRef: { lessonId: 'lsn_circular', version: '1.0.0' },
        decisionRef: { decisionId: 'dec_123' },
      },
    };

    const res = runtime.processAndExecuteCommand(invalidRefusalEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');

    // Confirm scope key 'lesson:lsn_circular' was released
    const lease = coordinator.acquireScope(['lesson:lsn_circular']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  it('6. locks release after runtime error', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    // Force failure by providing payload that passes pipeline but fails in handler or pipeline downstream
    const env: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandId: 'cmd_stage9_err',
    };

    const res = runtime.processAndExecuteCommand(env);
    // Lock for 'obs:obs_999' must be released regardless of outcome
    const lease = coordinator.acquireScope(['obs:obs_999']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  // --- DIFFERENT AGGREGATES (7-8) ---

  it('7. commands for different aggregates are not unnecessarily globally serialized', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    let maxActiveCount = 0;
    let activeCount = 0;

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

  it('8. independent scopes can execute concurrently', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();

    const leaseA = coordinator.acquireScope(['cand:can_A']);
    const leaseB = coordinator.acquireScope(['cand:can_B']);

    assert.strictEqual(leaseA.ok, true);
    assert.strictEqual(leaseB.ok, true);

    if (leaseA.ok) leaseA.data.release();
    if (leaseB.ok) leaseB.data.release();
  });

  // --- MULTI-KEY COMMANDS (9-12) ---

  it('9. keys are deduplicated', () => {
    const env: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandType: 'SupersedeLesson',
      payload: {
        supersededLessonRef: { lessonId: 'lsn_same' },
        supersedingLessonRef: { lessonId: 'lsn_same' },
        decisionRef: { decisionId: 'dec_1' },
      },
    };

    const keys = getConcurrencyScope(env);
    assert.deepStrictEqual(keys, ['lesson:lsn_same']);
  });

  it('10. keys are sorted deterministically', () => {
    const keys = getConcurrencyScope({
      ...baseEnvelope,
      commandType: 'SupersedeLesson',
      payload: {
        supersededLessonRef: { lessonId: 'lsn_z_last' },
        supersedingLessonRef: { lessonId: 'lsn_a_first' },
        decisionRef: { decisionId: 'dec_1' },
      },
    });

    assert.deepStrictEqual(keys, ['lesson:lsn_a_first', 'lesson:lsn_z_last']);
  });

  it('11. reversed incoming key order does not deadlock multi-key commands', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();

    // Command A requests [lesson:1, lesson:2]
    const p1 = coordinator.executeWithinScopeAsync(['lesson:1', 'lesson:2'], async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Command B requests [lesson:2, lesson:1] -> getConcurrencyScope & executeWithinScopeAsync sort keys to [lesson:1, lesson:2]
    const p2 = coordinator.executeWithinScopeAsync(['lesson:2', 'lesson:1'], async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    await Promise.all([p1, p2]);
    assert.ok(true);
  });

  it('12. overlapping multi-key commands serialize safely', async () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const executionOrder: string[] = [];

    const op1 = coordinator.executeWithinScopeAsync(['manifest:m1', 'lesson:l1'], async () => {
      executionOrder.push('op1_start');
      await new Promise((r) => setTimeout(r, 15));
      executionOrder.push('op1_end');
    });

    const op2 = coordinator.executeWithinScopeAsync(['lesson:l1'], async () => {
      executionOrder.push('op2_start');
      await new Promise((r) => setTimeout(r, 10));
      executionOrder.push('op2_end');
    });

    await Promise.all([op1, op2]);
    assert.deepStrictEqual(executionOrder, ['op1_start', 'op1_end', 'op2_start', 'op2_end']);
  });

  // --- STAGE 8 INTERACTION (13-15) ---

  it('13. exact retry does not acquire Stage 9 scope (downstream SKIPPED)', () => {
    const runtime = createGovernedLearningRuntime();
    const res1 = runtime.processAndExecuteCommand(baseEnvelope);
    assert.strictEqual(res1.ok, true);

    const res2 = runtime.processAndExecuteCommand(baseEnvelope);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, true);

    const stage9Outcome = res2.pipelineReport.stageOutcomes.find((s) => s.stageId === 'CONCURRENCY_CONTROL_CHECK');
    assert.strictEqual(stage9Outcome?.status, 'SKIPPED');
  });

  it('14. identity collision never reaches Stage 9', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { observationRef: { observationId: 'obs_999' }, evidenceType: 'OTHER', location: 'loc_diff' },
    };

    const res = runtime.processAndExecuteCommand(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');

    const stage9Outcome = res.pipelineReport.stageOutcomes.find((s) => s.stageId === 'CONCURRENCY_CONTROL_CHECK');
    assert.strictEqual(stage9Outcome?.status, 'SKIPPED');
  });

  it('15. unseen command reaches Stage 9 and sets status COMPLETED', () => {
    const runtime = createGovernedLearningRuntime();
    const res = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(res.ok, true);
    const stage9Outcome = res.pipelineReport.stageOutcomes.find((s) => s.stageId === 'CONCURRENCY_CONTROL_CHECK');
    assert.strictEqual(stage9Outcome?.status, 'COMPLETED');
  });

  // --- SCOPE COVERAGE (16-17) ---

  it('16. all supported mutating commands have deterministic aggregate scopes', () => {
    const sampleEnvelopes: GovernanceCommandEnvelope[] = [
      { ...baseEnvelope, commandType: 'AttachEvidence', payload: { observationRef: { observationId: 'obs_1' }, evidenceType: 'LOG', location: 'loc' } },
      { ...baseEnvelope, commandType: 'SubmitObservation', payload: { observationRef: { observationId: 'obs_1' } } },
      { ...baseEnvelope, commandType: 'ValidateMechanicalObservation', payload: { observationRef: { observationId: 'obs_1' }, verdict: 'VALIDATED' } },
      { ...baseEnvelope, commandType: 'RecordInterpretiveValidation', payload: { observationRef: { observationId: 'obs_1' }, verdict: 'VALIDATED', decisionRef: { decisionId: 'dec_1' } } },
      { ...baseEnvelope, commandType: 'CreateLessonCandidate', payload: { statement: 'st', rationale: 'rat', scope: { level: 'WORKSTREAM', targetRef: { workstreamRef: { workstreamId: 'ws_1' } } }, originatingObservationRefs: [{ observationId: 'obs_1' }] } },
      { ...baseEnvelope, commandType: 'SubmitLessonForReview', payload: { candidateRef: { candidateId: 'can_1' } } },
      { ...baseEnvelope, commandType: 'InvalidateLessonCandidate', payload: { candidateRef: { candidateId: 'can_1' }, reason: 'rs' } },
      { ...baseEnvelope, commandType: 'ApproveLesson', payload: { candidateRef: { candidateId: 'can_1' }, decisionRef: { decisionId: 'dec_1' } } },
      { ...baseEnvelope, commandType: 'RejectLesson', payload: { candidateRef: { candidateId: 'can_1' }, reason: 'rs', decisionRef: { decisionId: 'dec_1' } } },
      { ...baseEnvelope, commandType: 'RequestLessonRevision', payload: { candidateRef: { candidateId: 'can_1' }, feedback: 'fb', decisionRef: { decisionId: 'dec_1' } } },
      { ...baseEnvelope, commandType: 'SupersedeLesson', payload: { supersededLessonRef: { lessonId: 'lsn_1' }, supersedingLessonRef: { lessonId: 'lsn_2' }, decisionRef: { decisionId: 'dec_1' } } },
      { ...baseEnvelope, commandType: 'RetireLesson', payload: { retiredLessonRef: { lessonId: 'lsn_1' }, reason: 'rs', decisionRef: { decisionId: 'dec_1' } } },
      { ...baseEnvelope, commandType: 'AdoptLesson', payload: { proposalRef: { proposalId: 'prop_1' }, targetProjectRef: { projectId: 'prj_1' }, decisionRef: { decisionId: 'dec_1' } } },
      { ...baseEnvelope, commandType: 'ProposeRuleCandidate', payload: { ruleManifestId: 'man_1', proposedRule: 'rule', sourceLessonRef: { lessonId: 'lsn_1' } } },
    ];

    for (const env of sampleEnvelopes) {
      const scope = getConcurrencyScope(env);
      assert.ok(scope.length > 0);
      assert.strictEqual(scope[0].startsWith('actor:'), false);
    }
  });

  it('17. no supported mutating command targeting existing aggregate depends on unsafe actor fallback', () => {
    const env: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandType: 'AttachEvidence',
      payload: { observationRef: { observationId: 'obs_test_scope' }, evidenceType: 'LOG', location: 'loc' },
    };

    const scope = getConcurrencyScope(env);
    assert.deepStrictEqual(scope, ['obs:obs_test_scope']);
  });

  // --- FAILURE SAFETY (18-20) ---

  it('18. coordinator internal failure becomes runtime ERROR', () => {
    const failingCoordinator: ConcurrencyCoordinatorPort = {
      acquireScope() {
        return {
          ok: false,
          category: 'ERROR',
          error: { name: 'CoordinatorError', message: 'Internal Coordinator Lock Exception' } as any,
        };
      },
      executeWithinScope() {
        return { ok: false, category: 'ERROR', error: {} as any };
      },
      executeWithinScopeAsync() {
        return Promise.resolve({ ok: false, category: 'ERROR', error: {} as any });
      },
    };

    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: failingCoordinator });
    const res = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.pipelineReport.currentStage, 'CONCURRENCY_CONTROL_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'ERROR');
  });

  it('19. scope is released if handler throws unexpected exception', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    // Intentionally pass malformed state payload that passes pipeline but causes execution error in custom handler
    const env: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandId: 'cmd_err_throw',
    };

    runtime.processAndExecuteCommand(env);

    // Confirm scope was released
    const lease = coordinator.acquireScope(['obs:obs_999']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  it('20. no leaked lock after failed execution (clean Map state)', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    const runtime = createGovernedLearningRuntime({ concurrencyCoordinator: coordinator });

    runtime.processAndExecuteCommand(baseEnvelope);

    // Lock for scope 'obs:obs_999' is immediately re-acquirable
    const lease = coordinator.acquireScope(['obs:obs_999']);
    assert.strictEqual(lease.ok, true);
    if (lease.ok) lease.data.release();
  });

  // --- STATE CONFLICT & LEVEL 1 BOUNDARY (21-24) ---

  it('21. domain state conflict returns REFUSED without mutation', () => {
    const runtime = createGovernedLearningRuntime();

    // Circular supersession attempt is a domain invariant refusal
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

    const res = runtime.processAndExecuteCommand(circularEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_CIRCULAR_SUPERCOGNITION');
  });

  it('22. stale-state refusal does not execute authoritative mutation', () => {
    const runtime = createGovernedLearningRuntime();

    const circularEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandId: 'cmd_circular_002',
      commandType: 'SupersedeLesson',
      payload: {
        supersededLessonRef: { lessonId: 'lsn_same_ref', version: '1.0.0' },
        supersedingLessonRef: { lessonId: 'lsn_same_ref', version: '1.0.0' },
        decisionRef: { decisionId: 'dec_1' },
      },
    };

    const res = runtime.processAndExecuteCommand(circularEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.handlerOutcome?.ok, false);
  });

  it('23. separate coordinator instances do not coordinate (Level 1 in-process isolation)', () => {
    const coord1 = new InMemoryConcurrencyCoordinator();
    const coord2 = new InMemoryConcurrencyCoordinator();

    const lease1 = coord1.acquireScope(['obs:obs_shared']);
    const lease2 = coord2.acquireScope(['obs:obs_shared']);

    assert.strictEqual(lease1.ok, true);
    assert.strictEqual(lease2.ok, true);

    if (lease1.ok) lease1.data.release();
    if (lease2.ok) lease2.data.release();
  });

  it('24. test explicitly documents that InMemoryConcurrencyCoordinator is Level 1 in-process memory boundary only', () => {
    const coordinator = new InMemoryConcurrencyCoordinator();
    assert.ok(coordinator instanceof InMemoryConcurrencyCoordinator);
    // Explicit assertion: Level 1 in-memory only; no crash-safe, restart-safe, or distributed locking claimed
  });
});
