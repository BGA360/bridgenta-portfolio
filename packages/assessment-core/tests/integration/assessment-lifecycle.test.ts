/**
 * @file assessment-lifecycle.test.ts
 * @module @cep/assessment-core
 * @type Integration Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createAssessmentOrchestrator,
  AssessmentState,
  FindingStatus,
  AssessmentRequestModel,
} from '../../src/index.js';

describe('Assessment Core — Lifecycle Integration Tests', () => {
  const request: AssessmentRequestModel = {
    request_id: 'req-integ-2026-001',
    project_ref: 'project-bridgenta-portfolio',
    scope_manifest: ['BECC-V1', 'BGCF-V2', 'CEF-META'],
    target_governance_level: 4,
    trigger_event: 'MANUAL_STAGING_RELEASE',
  };

  test('should execute complete lifecycle: REQUESTED -> COLLECTING_EVIDENCE -> UNDER_REVIEW -> COMPLETED -> CERTIFIED -> ARCHIVED', () => {
    const orchestrator = createAssessmentOrchestrator();

    // 1. Create
    const a1 = orchestrator.createAssessment(request);
    assert.equal(a1.state, AssessmentState.REQUESTED);

    // 2. Start Evidence Collection
    const a2 = orchestrator.transitionState(a1.assessment_id, AssessmentState.COLLECTING_EVIDENCE);
    assert.equal(a2.state, AssessmentState.COLLECTING_EVIDENCE);

    // 3. Start Under Review
    const a3 = orchestrator.transitionState(a1.assessment_id, AssessmentState.UNDER_REVIEW);
    assert.equal(a3.state, AssessmentState.UNDER_REVIEW);

    // 4. Complete Assessment
    const a4 = orchestrator.transitionState(a1.assessment_id, AssessmentState.COMPLETED);
    assert.equal(a4.state, AssessmentState.COMPLETED);
    assert.equal(a4.overall_status, FindingStatus.PASS);

    // 5. Certify
    const a5 = orchestrator.transitionState(a1.assessment_id, AssessmentState.CERTIFIED);
    assert.equal(a5.state, AssessmentState.CERTIFIED);

    // 6. Archive
    const a6 = orchestrator.transitionState(a1.assessment_id, AssessmentState.ARCHIVED);
    assert.equal(a6.state, AssessmentState.ARCHIVED);

    // 7. Verify Inspection matches final state
    const inspected = orchestrator.inspectAssessment(a1.assessment_id);
    assert.equal(inspected.state, AssessmentState.ARCHIVED);
  });

  test('should execute failure lifecycle path: REQUESTED -> COLLECTING_EVIDENCE -> FAILED -> ARCHIVED', () => {
    const orchestrator = createAssessmentOrchestrator();

    const a1 = orchestrator.createAssessment(request);
    orchestrator.transitionState(a1.assessment_id, AssessmentState.COLLECTING_EVIDENCE);

    // Fail early
    const failed = orchestrator.transitionState(a1.assessment_id, AssessmentState.FAILED);
    assert.equal(failed.state, AssessmentState.FAILED);

    // Archive failure
    const archived = orchestrator.transitionState(a1.assessment_id, AssessmentState.ARCHIVED);
    assert.equal(archived.state, AssessmentState.ARCHIVED);
  });

  test('should support state serialization and deserialization roundtrip', () => {
    const orchestrator = createAssessmentOrchestrator();
    const created = orchestrator.createAssessment(request);
    orchestrator.transitionState(created.assessment_id, AssessmentState.COLLECTING_EVIDENCE);

    const snapshot = orchestrator.inspectAssessment(created.assessment_id);
    const json = orchestrator.serializeAssessment(snapshot);

    const restored = orchestrator.deserializeAssessment(json);
    assert.equal(restored.assessment_id, 'req-integ-2026-001');
    assert.equal(restored.state, AssessmentState.COLLECTING_EVIDENCE);
    assert.equal(restored.governance_level, 4);
  });
});
