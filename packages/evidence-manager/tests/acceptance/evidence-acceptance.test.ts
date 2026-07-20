/**
 * @file evidence-acceptance.test.ts
 * @module @cep/evidence-manager
 * @type Acceptance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createEvidenceService,
  EvidenceSubmissionModel,
  EvidenceCategory,
  EvidenceType,
  EvidenceStatus,
  EvidenceSerializer,
} from '../../src/index.js';

describe('Evidence Manager — Acceptance Tests (End-to-End)', () => {
  const checksum1 = 'f'.repeat(64);
  const checksum2 = '1'.repeat(64);

  const sub1: EvidenceSubmissionModel = {
    submission_id: 'sub-acc-001',
    assessment_id: 'assessment-acc-100',
    artifact_name: 'test.spec.ts',
    category: EvidenceCategory.TEST_OUTPUT,
    type: EvidenceType.FILE_ARTIFACT,
    raw_payload: 'test("pass", () => {});',
    content_checksum: checksum1,
    origin: 'git://repo/tests/test.spec.ts',
    submitting_authority: 'steward-ci',
    correlation_id: 'corr-acc-100',
  };

  const sub2: EvidenceSubmissionModel = {
    submission_id: 'sub-acc-002',
    assessment_id: 'assessment-acc-100',
    artifact_name: 'report.txt',
    category: EvidenceCategory.ARCHITECTURAL_DOC,
    type: EvidenceType.DECLARATION,
    raw_payload: 'Audit Report Approved',
    content_checksum: checksum2,
    origin: 'git://repo/docs/report.txt',
    submitting_authority: 'steward-lead',
    correlation_id: 'corr-acc-100',
  };

  test('should execute full end-to-end evidence ingestion, validation, acceptance, referencing, and bundle assembly', () => {
    const service = createEvidenceService();

    // 1. Submit 2 evidence items
    const r1 = service.submitEvidence(sub1);
    const r2 = service.submitEvidence(sub2);
    assert.equal(r1.status, EvidenceStatus.SUBMITTED);
    assert.equal(r2.status, EvidenceStatus.SUBMITTED);

    // 2. Validate integrity
    service.validateEvidenceIntegrity(r1.evidence_id, checksum1);
    service.validateEvidenceIntegrity(r2.evidence_id, checksum2);

    // 3. Accept evidence
    const ev1 = service.acceptEvidence(r1.evidence_id);
    const ev2 = service.acceptEvidence(r2.evidence_id);
    assert.equal(ev1.status, EvidenceStatus.ACCEPTED);
    assert.equal(ev2.status, EvidenceStatus.ACCEPTED);

    // 4. Reference evidence
    service.referenceEvidence(r1.evidence_id, 'Rule-BGCF-01');
    service.referenceEvidence(r2.evidence_id, 'Rule-BECC-02');

    // 5. Assemble Sealed Bundle
    const bundle = service.createEvidenceBundle('assessment-acc-100', [r1.evidence_id, r2.evidence_id]);
    assert.equal(bundle.assessment_id, 'assessment-acc-100');
    assert.equal(bundle.evidence_items.length, 2);
    assert.equal(bundle.sealed_checksum.length, 64);

    // 6. Verify Domain Events emitted
    const events = service.getEvents();
    assert.ok(events.length >= 8); // 2 submitted, 2 validated, 2 accepted, 2 referenced

    // 7. Verify JSON Serialization Roundtrip on aggregate
    const jsonStr = EvidenceSerializer.serialize(ev1);
    const deserialized = EvidenceSerializer.deserialize(jsonStr);
    assert.equal(deserialized.id, ev1.id);
  });
});
