/**
 * @file evidence-contract.test.ts
 * @module @cep/evidence-manager
 * @type Contract Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createEvidenceService,
  EvidenceSubmissionModel,
  EvidenceCategory,
  EvidenceType,
  EvidenceStatus,
  EvidenceValidationError,
} from '../../src/index.js';

describe('Evidence Manager — Contract Tests (CTR-002)', () => {
  const validChecksumHex = 'c'.repeat(64);

  const sampleSubmission: EvidenceSubmissionModel = {
    submission_id: 'sub-contract-001',
    assessment_id: 'assessment-ctr-001',
    artifact_name: 'main.ts',
    category: EvidenceCategory.STATIC_CODE,
    type: EvidenceType.FILE_ARTIFACT,
    raw_payload: 'console.log("hello world");',
    content_checksum: validChecksumHex,
    origin: 'git://github.com/repo/main.ts',
    submitting_authority: 'steward-ci',
    correlation_id: 'corr-ctr-001',
  };

  test('should accept valid EvidenceSubmissionModel and return CTR-002 receipt', () => {
    const service = createEvidenceService();
    const receipt = service.submitEvidence(sampleSubmission);

    assert.equal(receipt.receipt_id, 'rcpt-sub-contract-001');
    assert.equal(receipt.evidence_id, 'evi-sub-contract-001');
    assert.equal(receipt.status, EvidenceStatus.SUBMITTED);
    assert.equal(receipt.checksum, validChecksumHex);
  });

  test('should reject CTR-002 submission with malformed SHA-256 checksum format', () => {
    const service = createEvidenceService();
    const badSubmission = { ...sampleSubmission, content_checksum: 'invalid-hash' };

    assert.throws(
      () => service.submitEvidence(badSubmission),
      (err: unknown) => err instanceof EvidenceValidationError && err.code === 'ERR-EVI-001'
    );
  });

  test('should reject CTR-002 submission missing required provenance origin', () => {
    const service = createEvidenceService();
    const badSubmission = { ...sampleSubmission, origin: '' };

    assert.throws(
      () => service.submitEvidence(badSubmission),
      EvidenceValidationError
    );
  });
});
