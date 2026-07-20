/**
 * @file evidence-aggregate.test.ts
 * @module @cep/evidence-manager
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  Evidence,
  EvidenceId,
  AssessmentId,
  EvidenceChecksum,
  EvidenceStatus,
  EvidenceCategory,
  EvidenceType,
  InvalidEvidenceTransitionError,
  EvidenceIntegrityError,
  Timestamp,
} from '../../src/index.js';

describe('Evidence Aggregate — Unit Tests', () => {
  const dummyChecksumHex = 'a'.repeat(64);

  function createSampleProps() {
    return {
      id: EvidenceId.create('evi-sample-001'),
      assessment_id: AssessmentId.create('assessment-001'),
      metadata: {
        size_bytes: 120,
        mime_type: 'text/plain',
        category: EvidenceCategory.STATIC_CODE,
        type: EvidenceType.FILE_ARTIFACT,
        tags: ['unit-test'],
      },
      provenance: {
        origin: 'git://repo/src/index.ts',
        collection_timestamp: Timestamp.create(),
        submitting_authority: 'steward-01',
        correlation_id: 'corr-001',
      },
      checksum: EvidenceChecksum.create(dummyChecksumHex),
      traceability: {
        constitutional_source: 'docs/project/CEP-ENGINEERING-PRINCIPLES.md',
        contract_id: 'CTR-002',
        domain_concept: 'Evidence',
      },
      raw_payload: 'const x = 42;',
    };
  }

  test('should create Evidence aggregate root with initial SUBMITTED status', () => {
    const evidence = new Evidence(createSampleProps());

    assert.equal(evidence.id, 'evi-sample-001');
    assert.equal(evidence.assessment_id, 'assessment-001');
    assert.equal(evidence.status, EvidenceStatus.SUBMITTED);
    assert.equal(evidence.history.length, 0);
  });

  test('should execute legal status transitions: SUBMITTED -> VALIDATED -> ACCEPTED -> REFERENCED -> ARCHIVED', () => {
    const evidence = new Evidence(createSampleProps());

    evidence.transitionStatus(EvidenceStatus.VALIDATED);
    assert.equal(evidence.status, EvidenceStatus.VALIDATED);

    evidence.transitionStatus(EvidenceStatus.ACCEPTED);
    assert.equal(evidence.status, EvidenceStatus.ACCEPTED);

    evidence.transitionStatus(EvidenceStatus.REFERENCED);
    assert.equal(evidence.status, EvidenceStatus.REFERENCED);

    evidence.transitionStatus(EvidenceStatus.ARCHIVED);
    assert.equal(evidence.status, EvidenceStatus.ARCHIVED);

    assert.equal(evidence.history.length, 4);
  });

  test('should reject illegal status transition SUBMITTED -> REFERENCED directly', () => {
    const evidence = new Evidence(createSampleProps());

    assert.throws(
      () => evidence.transitionStatus(EvidenceStatus.REFERENCED),
      InvalidEvidenceTransitionError
    );
  });

  test('should pass integrity verification when SHA-256 matches declared checksum', () => {
    const evidence = new Evidence(createSampleProps());
    assert.doesNotThrow(() => evidence.verifyIntegrity(dummyChecksumHex));
  });

  test('should fail integrity verification when SHA-256 differs', () => {
    const evidence = new Evidence(createSampleProps());
    const mismatchChecksumHex = 'b'.repeat(64);

    assert.throws(
      () => evidence.verifyIntegrity(mismatchChecksumHex),
      EvidenceIntegrityError
    );
  });
});
