/**
 * @file certification-contract.test.ts
 * @module @cep/certification-engine
 * @type Contract Test
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
  CertificationIssuanceRequestModel,
  CertificationValidationError,
} from '../../src/index.js';

describe('Certification Engine — Contract Tests (CTR-005)', () => {
  test('should accept valid CertificationIssuanceRequestModel and return CTR-005 result model', () => {
    const policyResolver = createPolicyResolverService();
    const policyDecision = policyResolver.createPolicyDecision(
      'assessment-ctr-005',
      'eval-ctr-005',
      FindingStatus.PASS,
      PolicyLevel.LEVEL_4
    );

    const certEngine = createCertificationEngineService();
    const request: CertificationIssuanceRequestModel = {
      assessment_id: 'assessment-ctr-005',
      policy_decision_id: policyDecision.decision_id,
      title: 'High-Governance Compliance Certificate',
      issuer: 'BPGA Authority',
      framework_id: 'CEF',
      governance_level: CertificationLevel.LEVEL_4,
      type: CertificationType.CONSTITUTIONAL_COMPLIANCE,
    };

    const { certification, resultModel } = certEngine.issueCertification(request, policyDecision);

    assert.equal(resultModel.assessment_id, 'assessment-ctr-005');
    assert.equal(resultModel.policy_decision_id, policyDecision.decision_id);
    assert.equal(resultModel.status, CertificationStatus.ISSUED);
    assert.ok(resultModel.certification_id.startsWith('cert-'));
    assert.equal(certification.status, CertificationStatus.ISSUED);
  });

  test('should throw CertificationValidationError when required field assessment_id is missing', () => {
    const policyResolver = createPolicyResolverService();
    const policyDecision = policyResolver.createPolicyDecision(
      'assessment-bad',
      'eval-bad',
      FindingStatus.PASS,
      PolicyLevel.LEVEL_1
    );

    const certEngine = createCertificationEngineService();
    const badRequest = {
      assessment_id: '',
      policy_decision_id: policyDecision.decision_id,
      title: 'Bad Cert',
      issuer: 'Tester',
      framework_id: 'CEF',
      governance_level: CertificationLevel.LEVEL_1,
      type: CertificationType.CONSTITUTIONAL_COMPLIANCE,
    };

    assert.throws(
      () => certEngine.issueCertification(badRequest as any, policyDecision),
      (err: unknown) => err instanceof CertificationValidationError && err.code === 'ERR-CRT-001'
    );
  });
});
