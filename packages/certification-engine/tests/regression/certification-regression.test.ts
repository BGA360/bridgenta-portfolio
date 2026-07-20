/**
 * @file certification-regression.test.ts
 * @module @cep/certification-engine
 * @type Regression Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { FindingStatus } from '@cep/assessment-core';
import { createPolicyResolverService, PolicyLevel } from '@cep/policy-resolver';
import {
  createCertificationEngineService,
  CertificationLevel,
  CertificationType,
  CertificationStatus,
  CertificationSerializer,
} from '../../src/index.js';

describe('Certification Engine — Regression Tests', () => {
  test('should produce 100% field, history, metadata, and status value parity on canonical JSON roundtrip', () => {
    const policyResolver = createPolicyResolverService();
    const policyDecision = policyResolver.createPolicyDecision(
      'assessment-regr-01',
      'eval-regr-01',
      FindingStatus.PASS,
      PolicyLevel.LEVEL_2
    );

    const certEngine = createCertificationEngineService();
    const { certification } = certEngine.issueCertification(
      {
        assessment_id: 'assessment-regr-01',
        policy_decision_id: policyDecision.decision_id,
        title: 'Regression Attestation',
        issuer: 'BPGA Authority',
        framework_id: 'CEF',
        governance_level: CertificationLevel.LEVEL_2,
        type: CertificationType.SECURITY_ATTESTATION,
      },
      policyDecision
    );

    certEngine.verifyCertification(certification.id);

    const serializedJson = CertificationSerializer.serialize(certification);
    const deserializedCert = CertificationSerializer.deserialize(serializedJson);

    assert.equal(deserializedCert.id, certification.id);
    assert.equal(deserializedCert.assessment_id, certification.assessment_id);
    assert.equal(deserializedCert.policy_decision_id, certification.policy_decision_id);
    assert.equal(deserializedCert.status, CertificationStatus.VERIFIED);
    assert.equal(deserializedCert.metadata.title, 'Regression Attestation');
    assert.equal(deserializedCert.history.length, certification.history.length);
  });
});
