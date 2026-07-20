/**
 * @file evidence-regression.test.ts
 * @module @cep/evidence-manager
 * @type Regression Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createEvidenceService,
  EvidenceSubmissionModel,
  EvidenceCategory,
  EvidenceType,
  EvidenceSerializer,
} from '../../src/index.js';

describe('Evidence Manager — Regression Tests', () => {
  const validChecksumHex = 'e'.repeat(64);

  const submission: EvidenceSubmissionModel = {
    submission_id: 'sub-regr-001',
    assessment_id: 'assessment-regr-001',
    artifact_name: 'benchmark.txt',
    category: EvidenceCategory.BENCHMARK_RESULT,
    type: EvidenceType.METRIC_SET,
    raw_payload: 'latency=2ms',
    content_checksum: validChecksumHex,
    origin: 'git://repo/benchmark.txt',
    submitting_authority: 'steward-perf',
    correlation_id: 'corr-regr-001',
  };

  test('should produce deterministic JSON output on serialization roundtrip', () => {
    const service = createEvidenceService();
    const receipt = service.submitEvidence(submission);
    const evidence = service.getEvidence(receipt.evidence_id);

    const json = EvidenceSerializer.serialize(evidence);
    const restored = EvidenceSerializer.deserialize(json);

    assert.equal(restored.id, evidence.id);
    assert.equal(restored.checksum, evidence.checksum);
    assert.equal(restored.raw_payload, evidence.raw_payload);
    assert.equal(restored.status, evidence.status);
  });
});
