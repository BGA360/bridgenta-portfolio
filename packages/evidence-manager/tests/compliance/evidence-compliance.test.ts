/**
 * @file evidence-compliance.test.ts
 * @module @cep/evidence-manager
 * @type Compliance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createEvidenceService,
  EvidenceSubmissionModel,
  EvidenceCategory,
  EvidenceType,
  DuplicateEvidenceError,
} from '../../src/index.js';

describe('Evidence Manager — Constitutional Compliance Tests', () => {
  const validChecksumHex = 'd'.repeat(64);

  const sampleSubmission: EvidenceSubmissionModel = {
    submission_id: 'sub-comp-001',
    assessment_id: 'assessment-comp-001',
    artifact_name: 'config.json',
    category: EvidenceCategory.ARCHITECTURAL_DOC,
    type: EvidenceType.DECLARATION,
    raw_payload: '{"version": "1.0"}',
    content_checksum: validChecksumHex,
    origin: 'git://repo/config.json',
    submitting_authority: 'steward-lead',
    correlation_id: 'corr-comp-001',
  };

  test('should enforce zero duplicate evidence submission invariant (ERR-EVI-004)', () => {
    const service = createEvidenceService();
    service.submitEvidence(sampleSubmission);

    assert.throws(
      () => service.submitEvidence(sampleSubmission),
      (err: unknown) => err instanceof DuplicateEvidenceError && err.code === 'ERR-EVI-004'
    );
  });

  test('should verify provenance fields remain immutable across status transitions', () => {
    const service = createEvidenceService();
    const receipt = service.submitEvidence(sampleSubmission);

    const evidence = service.getEvidence(receipt.evidence_id);
    const initialProvenance = { ...evidence.provenance };

    service.validateEvidenceIntegrity(receipt.evidence_id, validChecksumHex);
    service.acceptEvidence(receipt.evidence_id);

    const updatedEvidence = service.getEvidence(receipt.evidence_id);
    assert.deepEqual(updatedEvidence.provenance, initialProvenance);
  });
});
