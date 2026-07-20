/**
 * @file assessment-orchestrator.test.ts
 * @module @cep/assessment-core
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createAssessmentOrchestrator,
  AssessmentState,
  ValidationError,
  StateTransitionError,
  AssessmentNotFoundError,
  AssessmentRequestModel,
} from '../../src/index.js';

describe('AssessmentOrchestrator — Unit Tests', () => {
  const validRequest: AssessmentRequestModel = {
    request_id: 'req-unit-001',
    project_ref: 'project-test-01',
    scope_manifest: ['BECC', 'BGCF'],
    target_governance_level: 3,
    trigger_event: 'PULL_REQUEST',
  };

  test('should create a valid assessment in REQUESTED state', () => {
    const orchestrator = createAssessmentOrchestrator();
    const result = orchestrator.createAssessment(validRequest);

    assert.equal(result.assessment_id, 'req-unit-001');
    assert.equal(result.state, AssessmentState.REQUESTED);
    assert.equal(result.governance_level, 3);
    assert.equal(result.findings.length, 0);
  });

  test('should throw ValidationError on missing request_id', () => {
    const orchestrator = createAssessmentOrchestrator();
    const invalidRequest = { ...validRequest, request_id: '' };

    assert.throws(
      () => orchestrator.createAssessment(invalidRequest),
      (err: unknown) => err instanceof ValidationError && err.code === 'ERR-VAL-001'
    );
  });

  test('should throw ValidationError on invalid target_governance_level (< 0 or > 5)', () => {
    const orchestrator = createAssessmentOrchestrator();
    const invalidRequestHigh = { ...validRequest, target_governance_level: 6 };
    const invalidRequestLow = { ...validRequest, target_governance_level: -1 };

    assert.throws(
      () => orchestrator.createAssessment(invalidRequestHigh),
      ValidationError
    );
    assert.throws(
      () => orchestrator.createAssessment(invalidRequestLow),
      ValidationError
    );
  });

  test('should throw ValidationError on empty scope_manifest', () => {
    const orchestrator = createAssessmentOrchestrator();
    const invalidRequest = { ...validRequest, scope_manifest: [] };

    assert.throws(
      () => orchestrator.createAssessment(invalidRequest),
      ValidationError
    );
  });

  test('should execute legal state transition from REQUESTED to COLLECTING_EVIDENCE', () => {
    const orchestrator = createAssessmentOrchestrator();
    orchestrator.createAssessment(validRequest);

    const updated = orchestrator.transitionState(
      'req-unit-001',
      AssessmentState.COLLECTING_EVIDENCE
    );

    assert.equal(updated.state, AssessmentState.COLLECTING_EVIDENCE);
  });

  test('should reject illegal state transition from REQUESTED directly to CERTIFIED', () => {
    const orchestrator = createAssessmentOrchestrator();
    orchestrator.createAssessment(validRequest);

    assert.throws(
      () => orchestrator.transitionState('req-unit-001', AssessmentState.CERTIFIED),
      (err: unknown) => err instanceof StateTransitionError && err.code === 'ERR-CNC-004'
    );
  });

  test('should throw AssessmentNotFoundError on unknown assessment ID', () => {
    const orchestrator = createAssessmentOrchestrator();

    assert.throws(
      () => orchestrator.inspectAssessment('unknown-id'),
      (err: unknown) => err instanceof AssessmentNotFoundError && err.code === 'ERR-CNC-002'
    );
  });

  test('should serialize and deserialize an assessment correctly', () => {
    const orchestrator = createAssessmentOrchestrator();
    const assessment = orchestrator.createAssessment(validRequest);

    const serialized = orchestrator.serializeAssessment(assessment);
    assert.equal(typeof serialized, 'string');

    const deserialized = orchestrator.deserializeAssessment(serialized);
    assert.equal(deserialized.assessment_id, 'req-unit-001');
    assert.equal(deserialized.state, AssessmentState.REQUESTED);
  });

  test('should throw ValidationError when deserializing invalid JSON syntax', () => {
    const orchestrator = createAssessmentOrchestrator();

    assert.throws(
      () => orchestrator.deserializeAssessment('invalid json text'),
      ValidationError
    );
  });
});
