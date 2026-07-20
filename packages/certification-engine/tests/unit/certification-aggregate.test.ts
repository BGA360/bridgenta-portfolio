/**
 * @file certification-aggregate.test.ts
 * @module @cep/certification-engine
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  Certification,
  CertificationId,
  CertificationStatus,
  CertificationLevel,
  CertificationType,
  CertificationValidationError,
} from '../../src/index.js';

describe('Certification Aggregate — Unit Tests', () => {
  function createSampleProps(id = 'cert-unit-01') {
    return {
      id: CertificationId.create(id),
      assessment_id: 'assessment-01',
      policy_decision_id: 'pd-01',
      metadata: {
        title: 'CEF Attestation',
        issuer: 'BPGA Authority',
        framework_id: 'CEF',
        governance_level: CertificationLevel.LEVEL_3,
        type: CertificationType.CONSTITUTIONAL_COMPLIANCE,
        tags: ['attestation'],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-005',
        domain_concept: 'Certification',
      },
    };
  }

  test('should create Certification aggregate with ISSUED initial status', () => {
    const cert = new Certification(createSampleProps());

    assert.equal(cert.id, 'cert-unit-01');
    assert.equal(cert.status, CertificationStatus.ISSUED);
    assert.equal(cert.metadata.governance_level, CertificationLevel.LEVEL_3);
    assert.equal(cert.history.length, 1);
  });

  test('should execute legal state transition lifecycle ISSUED -> VERIFIED -> ACTIVE -> SUSPENDED -> REVOKED -> ARCHIVED', () => {
    const cert = new Certification(createSampleProps());

    cert.transitionStatus(CertificationStatus.VERIFIED, 'Verified audit hash');
    assert.equal(cert.status, CertificationStatus.VERIFIED);

    cert.transitionStatus(CertificationStatus.ACTIVE, 'Activated for release');
    assert.equal(cert.status, CertificationStatus.ACTIVE);

    cert.transitionStatus(CertificationStatus.SUSPENDED, 'Pending review');
    assert.equal(cert.status, CertificationStatus.SUSPENDED);

    cert.transitionStatus(CertificationStatus.REVOKED, 'Security policy violation');
    assert.equal(cert.status, CertificationStatus.REVOKED);

    cert.transitionStatus(CertificationStatus.ARCHIVED, 'Archived after expiry');
    assert.equal(cert.status, CertificationStatus.ARCHIVED);

    assert.ok(cert.history.length > 5);
  });

  test('should reject illegal transition directly from ISSUED to ACTIVE', () => {
    const cert = new Certification(createSampleProps());

    assert.throws(
      () => cert.transitionStatus(CertificationStatus.ACTIVE),
      CertificationValidationError
    );
  });

  test('should reject any transition from terminal ARCHIVED status', () => {
    const cert = new Certification(createSampleProps());
    cert.transitionStatus(CertificationStatus.VERIFIED);
    cert.transitionStatus(CertificationStatus.ARCHIVED);

    assert.throws(
      () => cert.transitionStatus(CertificationStatus.ACTIVE),
      CertificationValidationError
    );
  });
});
