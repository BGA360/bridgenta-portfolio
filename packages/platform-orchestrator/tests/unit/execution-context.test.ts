/**
 * @file execution-context.test.ts
 * @module @cep/platform-orchestrator
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  ExecutionContext,
  ExecutionId,
  CorrelationId,
  PipelineStage,
} from '../../src/index.js';

describe('ExecutionContext — Unit Tests', () => {
  test('should create immutable ExecutionContext with initial stage', () => {
    const execId = ExecutionId.create('exec-unit-01');
    const corrId = CorrelationId.create('corr-unit-01');
    const traceability = {
      constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
      contract_id: 'CTR-006',
      domain_concept: 'Orchestration',
    };

    const ctx = new ExecutionContext({
      execution_id: execId,
      correlation_id: corrId,
      current_stage: PipelineStage.ASSESSMENT_INITIATION,
      traceability: traceability,
    });

    assert.equal(ctx.execution_id, 'exec-unit-01');
    assert.equal(ctx.correlation_id, 'corr-unit-01');
    assert.equal(ctx.current_stage, PipelineStage.ASSESSMENT_INITIATION);
    assert.equal(ctx.completed_stages.length, 0);
  });

  test('should advance stage without mutating original ExecutionContext', () => {
    const execId = ExecutionId.create('exec-unit-02');
    const corrId = CorrelationId.create('corr-unit-02');
    const traceability = {
      constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
      contract_id: 'CTR-006',
      domain_concept: 'Orchestration',
    };

    const ctx1 = new ExecutionContext({
      execution_id: execId,
      correlation_id: corrId,
      current_stage: PipelineStage.ASSESSMENT_INITIATION,
      traceability: traceability,
    });

    const ctx2 = ctx1.advanceStage(PipelineStage.EVIDENCE_COLLECTION);

    assert.equal(ctx1.current_stage, PipelineStage.ASSESSMENT_INITIATION);
    assert.equal(ctx1.completed_stages.length, 0);

    assert.equal(ctx2.current_stage, PipelineStage.EVIDENCE_COLLECTION);
    assert.equal(ctx2.completed_stages.length, 1);
    assert.equal(ctx2.completed_stages[0], PipelineStage.ASSESSMENT_INITIATION);
  });
});
