/**
 * @file certification-compliance.test.ts
 * @module @cep/certification-engine
 * @type Compliance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { FindingStatus } from '@cep/assessment-core';
import { createPolicyResolverService, PolicyLevel } from '@cep/policy-resolver';
import {
  createCertificationEngineService,
  CertificationLevel,
  CertificationType,
  CertificationIssuanceError,
} from '../../src/index.js';

describe('Certification Engine — Compliance Tests', () => {
  test('should reject certification issuance when PolicyDecision is REJECTED (ERR-CRT-002)', () => {
    const policyResolver = createPolicyResolverService();

    // PolicyDecision is created for FAIL rule status -> REJECTED policy decision
    const failedPolicyDecision = policyResolver.createPolicyDecision(
      'assessment-fail-01',
      'eval-fail-01',
      FindingStatus.FAIL,
      PolicyLevel.LEVEL_3
    );

    const certEngine = createCertificationEngineService();
    const request = {
      assessment_id: 'assessment-fail-01',
      policy_decision_id: failedPolicyDecision.decision_id,
      title: 'Illegal Cert for Failed Policy',
      issuer: 'BPGA Authority',
      framework_id: 'CEF',
      governance_level: CertificationLevel.LEVEL_3,
      type: CertificationType.CONSTITUTIONAL_COMPLIANCE,
    };

    assert.throws(
      () => certEngine.issueCertification(request, failedPolicyDecision),
      (err: unknown) => err instanceof CertificationIssuanceError && err.code === 'ERR-CRT-002'
    );
  });
});
