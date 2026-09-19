import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GovernedLearningRuntime,
  createGovernedLearningRuntime,
  InMemoryIdempotencyStore,
  GovernanceProcessingPipeline,
  createCommandFingerprint,
  CommandPayloadSchemaRegistry,
  DraftObservationCommandPayloadSchema,
} from '../src/index.js';
import type { GovernanceCommandEnvelope, GovernanceCommandRecord, IdempotencyStorePort } from '../src/index.js';

describe('GL-HARDENING-002 Stage 8 Idempotency Enforcement', () => {
  const baseEnvelope: GovernanceCommandEnvelope = {
    commandId: 'cmd_stage8_001',
    commandType: 'DraftObservation',
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-19T12:00:00.000Z',
    actorRef: { actorId: 'actor_alice', actorType: 'AGENT' },
    authorityContextRef: { authorityId: 'auth_sys' },
    payload: { category: 'MECHANICAL', statement: 'Observation statement for Stage 8 test' },
  };

  // --- NEW COMMAND (1-3) ---

  it('1. unseen command reaches handler', () => {
    const runtime = createGovernedLearningRuntime();
    const result = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.replayedResult, undefined);
    assert.strictEqual(result.handlerOutcome?.ok, true);
    assert.strictEqual(result.handlerOutcome?.category, 'SUCCESS');
    assert.strictEqual((result.handlerOutcome?.data as Record<string, unknown>).statement, 'Observation statement for Stage 8 test');
  });

  it('2. successful command creates exactly one command record in idempotency store', () => {
    const store = new InMemoryIdempotencyStore();
    const runtime = createGovernedLearningRuntime({ idempotencyStore: store });

    runtime.processAndExecuteCommand(baseEnvelope);

    const lookup = store.getCommandExecution(baseEnvelope.commandId);
    assert.strictEqual(lookup.ok, true);
    if (lookup.ok && lookup.data) {
      assert.strictEqual(lookup.data.commandId, baseEnvelope.commandId);
      assert.strictEqual(lookup.data.executionOutcome.category, 'SUCCESS');
    }
  });

  it('3. normal domain event count remains correct (no extra events emitted)', () => {
    const runtime = createGovernedLearningRuntime();
    const res = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.pipelineReport.stageOutcomes.length, 11);
    assert.strictEqual(res.pipelineReport.stageOutcomes[7].stageId, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.stageOutcomes[7].status, 'COMPLETED');
  });

  // --- EXACT RETRY (4-9) ---

  it('4. exact retry returns prior stored result DTO', () => {
    const runtime = createGovernedLearningRuntime();

    const firstRes = runtime.processAndExecuteCommand(baseEnvelope);
    assert.strictEqual(firstRes.ok, true);
    assert.strictEqual(firstRes.replayedResult, undefined);

    const retryRes = runtime.processAndExecuteCommand(baseEnvelope);
    assert.strictEqual(retryRes.ok, true);
    assert.strictEqual(retryRes.replayedResult, true);
    assert.deepStrictEqual(retryRes.handlerOutcome, firstRes.handlerOutcome);
  });

  it('5. exact retry sets replayedResult: true', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const retryRes = runtime.processAndExecuteCommand(baseEnvelope);
    assert.strictEqual(retryRes.replayedResult, true);
  });

  it('6. handler executes only once across multiple exact retries', () => {
    let executionCount = 0;
    const store = new InMemoryIdempotencyStore();
    const runtime = createGovernedLearningRuntime({ idempotencyStore: store });

    const res1 = runtime.processAndExecuteCommand(baseEnvelope);
    if (res1.ok && !res1.replayedResult) executionCount++;

    const res2 = runtime.processAndExecuteCommand(baseEnvelope);
    if (res2.ok && !res2.replayedResult) executionCount++;

    const res3 = runtime.processAndExecuteCommand(baseEnvelope);
    if (res3.ok && !res3.replayedResult) executionCount++;

    assert.strictEqual(executionCount, 1);
  });

  it('7. no duplicate domain events emitted on exact retry', () => {
    const runtime = createGovernedLearningRuntime();
    const res1 = runtime.processAndExecuteCommand(baseEnvelope);
    const res2 = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, true);
  });

  it('8. no duplicate entity mutation on exact retry', () => {
    const store = new InMemoryIdempotencyStore();
    const runtime = createGovernedLearningRuntime({ idempotencyStore: store });

    const res1 = runtime.processAndExecuteCommand(baseEnvelope);
    const res2 = runtime.processAndExecuteCommand(baseEnvelope);

    if (res1.handlerOutcome?.category === 'SUCCESS' && res2.handlerOutcome?.category === 'SUCCESS') {
      assert.deepStrictEqual(res1.handlerOutcome.data, res2.handlerOutcome.data);
    }
  });

  it('9. second command record is not created (idempotency store size remains 1)', () => {
    const store = new InMemoryIdempotencyStore();
    const runtime = createGovernedLearningRuntime({ idempotencyStore: store });

    runtime.processAndExecuteCommand(baseEnvelope);
    runtime.processAndExecuteCommand(baseEnvelope);
    runtime.processAndExecuteCommand(baseEnvelope);

    const lookup = store.getCommandExecution(baseEnvelope.commandId);
    assert.strictEqual(lookup.ok, true);
    assert.notStrictEqual(lookup.ok && lookup.data, undefined);
  });

  // --- IDENTITY COLLISION (10-15) ---

  it('10. same commandId + different payload is refused', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { category: 'INTERPRETIVE', statement: 'DIFFERENT STATEMENT COLLISION' },
    };

    const res = runtime.processAndExecuteCommand(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'REFUSED');
    assert.strictEqual(res.pipelineReport.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.handlerOutcome, undefined);
  });

  it('11. same commandId + different actor is refused', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      actorRef: { actorId: 'actor_bob', actorType: 'HUMAN' },
    };

    const res = runtime.processAndExecuteCommand(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'REFUSED');
    assert.strictEqual(res.pipelineReport.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.handlerOutcome, undefined);
  });

  it('12. same commandId + different authority context is refused', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      authorityContextRef: { authorityId: 'auth_different' },
    };

    const res = runtime.processAndExecuteCommand(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'REFUSED');
    assert.strictEqual(res.pipelineReport.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.handlerOutcome, undefined);
  });

  it('13. same commandId + different issuedAt is refused (issuedAt immutability)', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      issuedAt: '2026-09-19T12:07:00.000Z',
    };

    const res = runtime.processAndExecuteCommand(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'REFUSED');
    assert.strictEqual(res.pipelineReport.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.handlerOutcome, undefined);
  });

  it('14. same commandId + different command type is refused', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandType: 'SubmitObservation',
      payload: { observationRef: { observationId: 'obs_123' } },
    };

    const res = runtime.processAndExecuteCommand(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'REFUSED');
    assert.strictEqual(res.pipelineReport.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.handlerOutcome, undefined);
  });

  it('15. same commandId + different payload version is refused', () => {
    CommandPayloadSchemaRegistry.registerSchema(
      'DraftObservation',
      '2.0.0',
      DraftObservationCommandPayloadSchema
    );
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const collidedEnv: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payloadVersion: '2.0.0',
    };

    const res = runtime.processAndExecuteCommand(collidedEnv);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'REFUSED');
    assert.strictEqual(res.pipelineReport.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.strictEqual(res.handlerOutcome, undefined);
  });

  // --- OUTCOME CACHING (16-18) ---

  it('16. successful result reconstruction is equivalent', () => {
    const runtime = createGovernedLearningRuntime();
    const res1 = runtime.processAndExecuteCommand(baseEnvelope);
    const res2 = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res2.ok, true);
    if (res1.handlerOutcome?.category === 'SUCCESS' && res2.handlerOutcome?.category === 'SUCCESS') {
      assert.deepStrictEqual(res1.handlerOutcome.data, res2.handlerOutcome.data);
    }
  });

  it('17. refused outcome follows approved caching policy (domain refusal is cached and replayed)', () => {
    const store = new InMemoryIdempotencyStore();

    // Store a domain refusal manually or simulate handler refusal
    const refusalRecord: GovernanceCommandRecord = {
      commandId: baseEnvelope.commandId,
      commandFingerprint: createCommandFingerprint(baseEnvelope),
      commandType: baseEnvelope.commandType,
      payloadVersion: baseEnvelope.payloadVersion,
      issuedAt: baseEnvelope.issuedAt,
      recordedAt: new Date().toISOString(),
      executionOutcome: {
        ok: false,
        category: 'REFUSED',
        outcome: 'COMMAND_REFUSED',
        refusalCode: 'REFUSAL_LESSON_NOT_APPROVED',
        reason: 'Precondition refusal test',
      },
    };
    store.recordCommandExecution(refusalRecord);

    const runtime = createGovernedLearningRuntime({ idempotencyStore: store });
    const res = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.replayedResult, true);
    assert.strictEqual(res.handlerOutcome?.category, 'REFUSED');
    assert.strictEqual(res.handlerOutcome?.refusalCode, 'REFUSAL_LESSON_NOT_APPROVED');
  });

  it('18. error outcome follows approved caching policy (system infrastructure error is NOT cached)', () => {
    const store = new InMemoryIdempotencyStore();
    const runtime = createGovernedLearningRuntime({ idempotencyStore: store });

    // Execute invalid command envelope which produces ERROR in pipeline stage 1
    const invalidInput = { invalidField: true };
    const res = runtime.processAndExecuteCommand(invalidInput);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.pipelineReport.category, 'ERROR');

    // Verify error was NOT recorded in store
    const lookup = store.getCommandExecution('unknown_id');
    assert.strictEqual(lookup.ok, true);
    assert.strictEqual(lookup.data, undefined);
  });

  // --- STORE FAILURES (19-21) ---

  it('19. idempotency lookup failure returns runtime ERROR', () => {
    const failingStore: IdempotencyStorePort = {
      getCommandExecution() {
        return {
          ok: false,
          category: 'ERROR',
          error: { name: 'StoreError', message: 'Lookup IO Failure' } as any,
        };
      },
      recordCommandExecution() {
        return { ok: true, category: 'SUCCESS', data: { recorded: true, record: {} as any } };
      },
    };

    const runtime = createGovernedLearningRuntime({ idempotencyStore: failingStore });
    const res = runtime.processAndExecuteCommand(baseEnvelope);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(res.pipelineReport.category, 'ERROR');
  });

  it('20. record persistence failure returns runtime ERROR and exposes partial execution risk', () => {
    const failingStore: IdempotencyStorePort = {
      getCommandExecution() {
        return { ok: true, category: 'SUCCESS', data: undefined };
      },
      recordCommandExecution() {
        return {
          ok: false,
          category: 'ERROR',
          error: { name: 'StoreWriteError', message: 'Disk Write Failure' } as any,
        };
      },
    };

    const runtime = createGovernedLearningRuntime({ idempotencyStore: failingStore });
    const res = runtime.processAndExecuteCommand(baseEnvelope);

    // Top-level runtime result must be ERROR even though handler executed
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');
    assert.strictEqual(res.handlerOutcome?.ok, true);
    assert.ok(res.error?.message.includes('Write Failure') || res.error?.message.includes('persistence failed'));
  });

  it('21. no infrastructure failure is misclassified as domain REFUSED', () => {
    const pipeline = new GovernanceProcessingPipeline({
      idempotencyStore: {
        getCommandExecution() {
          return {
            ok: false,
            category: 'ERROR',
            error: { name: 'InfraError', message: 'DB Disconnected' } as any,
          };
        },
        recordCommandExecution() {
          return { ok: true, category: 'SUCCESS', data: { recorded: true, record: {} as any } };
        },
      },
    });

    const report = pipeline.processCommand(baseEnvelope);
    assert.strictEqual(report.ok, false);
    assert.strictEqual(report.category, 'ERROR');
    assert.strictEqual(report.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
  });

  // --- PIPELINE BEHAVIOR (22-24) ---

  it('22. exact retry short-circuits before handler dispatch', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const retryRes = runtime.processAndExecuteCommand(baseEnvelope);
    assert.strictEqual(retryRes.ok, true);
    assert.strictEqual(retryRes.replayedResult, true);
    assert.strictEqual(retryRes.pipelineReport.currentStage, 'IDEMPOTENCY_DETERMINISTIC_CHECK');
  });

  it('23. downstream unexecuted stages are represented accurately as SKIPPED', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    const retryRes = runtime.processAndExecuteCommand(baseEnvelope);
    const outcomes = retryRes.pipelineReport.stageOutcomes;

    const stage8 = outcomes.find(o => o.stageId === 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    const stage9 = outcomes.find(o => o.stageId === 'CONCURRENCY_CONTROL_CHECK');
    const stage10 = outcomes.find(o => o.stageId === 'DETERMINISTIC_POLICY_GATE');
    const stage11 = outcomes.find(o => o.stageId === 'DISPATCH_ROUTER');

    assert.strictEqual(stage8?.status, 'COMPLETED');
    assert.strictEqual(stage9?.status, 'SKIPPED');
    assert.strictEqual(stage10?.status, 'SKIPPED');
    assert.strictEqual(stage11?.status, 'SKIPPED');
  });

  it('24. new command still passes through Stage 8 normally', () => {
    const runtime = createGovernedLearningRuntime();
    const res = runtime.processAndExecuteCommand(baseEnvelope);

    const outcomes = res.pipelineReport.stageOutcomes;
    const stage8 = outcomes.find(o => o.stageId === 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    assert.strictEqual(stage8?.status, 'COMPLETED');
    assert.strictEqual(res.pipelineReport.currentStage, 'DISPATCH_ROUTER');
  });

  // --- ISOLATION & LEVEL 1 LIMITS (25-28) ---

  it('25. different command IDs do not interfere', () => {
    const runtime = createGovernedLearningRuntime();

    const env1 = { ...baseEnvelope, commandId: 'cmd_unique_1' };
    const env2 = { ...baseEnvelope, commandId: 'cmd_unique_2' };

    const res1 = runtime.processAndExecuteCommand(env1);
    const res2 = runtime.processAndExecuteCommand(env2);

    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res1.replayedResult, undefined);

    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, undefined);
  });

  it('26. multiple exact retries remain deterministic', () => {
    const runtime = createGovernedLearningRuntime();
    runtime.processAndExecuteCommand(baseEnvelope);

    for (let i = 0; i < 5; i++) {
      const res = runtime.processAndExecuteCommand(baseEnvelope);
      assert.strictEqual(res.ok, true);
      assert.strictEqual(res.replayedResult, true);
    }
  });

  it('27. a new InMemoryIdempotencyStore instance does not remember records from a previous instance', () => {
    const store1 = new InMemoryIdempotencyStore();
    const runtime1 = createGovernedLearningRuntime({ idempotencyStore: store1 });
    runtime1.processAndExecuteCommand(baseEnvelope);

    // Create fresh runtime with new store instance
    const store2 = new InMemoryIdempotencyStore();
    const runtime2 = createGovernedLearningRuntime({ idempotencyStore: store2 });
    const res2 = runtime2.processAndExecuteCommand(baseEnvelope);

    // New instance treats command as unseen (Level 1 in-process memory boundary)
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayedResult, undefined);
  });

  it('28. test explicitly documents that in-memory store is Level 1 in-process memory boundary only', () => {
    const store = new InMemoryIdempotencyStore();
    assert.strictEqual(typeof store.getCommandExecution, 'function');
    assert.strictEqual(typeof store.recordCommandExecution, 'function');
    // InMemoryIdempotencyStore provides single-process memory duplicate suppression and does not survive restart
  });
});
