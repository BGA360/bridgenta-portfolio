/**
 * @file certification-acceptance.test.ts
 * @module @cep/certification-engine
 * @type Acceptance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';

// Import full platform execution chain modules
import { createAssessmentOrchestrator } from '@cep/assessment-core';
import {
  createEvidenceService,
  EvidenceSubmissionModel,
  EvidenceCategory,
  EvidenceType,
} from '@cep/evidence-manager';
import {
  createRuleEngineService,
  RuleId,
  RuleCategory,
  RuleSeverity,
} from '@cep/rule-engine';
import { createPolicyResolverService, PolicyLevel } from '@cep/policy-resolver';

import {
  createCertificationEngineService,
  CertificationLevel,
  CertificationType,
  CertificationStatus,
} from '../../src/index.js';

describe('Certification Engine — Acceptance Tests (End-to-End Execution Chain)', () => {
  const dummyChecksumHex = 'f'.repeat(64);

  test('should execute complete pipeline: Assessment -> Evidence -> Rule Evaluation -> Policy Decision -> Certification Issuance -> Verification -> Activation', () => {
    // 1. Assessment Core: Create Assessment
    const assessmentOrchestrator = createAssessmentOrchestrator();
    const assessment = assessmentOrchestrator.createAssessment({
      request_id: 'req-e2e-cert-01',
      project_ref: 'repo-e2e-cert-01',
      target_governance_level: 3,
      scope_manifest: ['src/core/auth.ts'],
    });

    // 2. Evidence Manager: Ingest Evidence
    const evidenceService = createEvidenceService();
    const sub: EvidenceSubmissionModel = {
      submission_id: 'sub-cert-e2e-01',
      assessment_id: assessment.assessment_id,
      artifact_name: 'auth.ts',
      category: EvidenceCategory.STATIC_CODE,
      type: EvidenceType.FILE_ARTIFACT,
      raw_payload: 'export function authenticate() { return true; }',
      content_checksum: dummyChecksumHex,
      origin: 'git://repo/src/core/auth.ts',
      submitting_authority: 'steward-ci',
      correlation_id: 'corr-cert-e2e',
    };
    const receipt = evidenceService.submitEvidence(sub);
    const evidence = evidenceService.getEvidence(receipt.evidence_id);

    // 3. Rule Evaluation Engine: Register and Evaluate Rule
    const ruleEngine = createRuleEngineService();
    ruleEngine.registerRule({
      id: RuleId.create('rule-cert-auth-check'),
      metadata: {
        name: 'Authentication Export Check',
        description: 'Verifies auth module exports authenticate symbol',
        framework_id: 'CEF',
        category: RuleCategory.SECURITY,
        severity: RuleSeverity.CRITICAL,
        tags: ['security', 'auth'],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: (payload) => ({
        pass: payload.includes('export function authenticate'),
        message: 'Authentication symbol exported correctly.',
      }),
    });

    const { evaluation, resultModel: ruleResultModel } = ruleEngine.evaluateEvidence(
      {
        evaluation_id: `eval-${assessment.assessment_id}`,
        assessment_id: assessment.assessment_id,
        target_evidence_ids: [evidence.id],
      },
      [evidence]
    );

    // 4. Policy Resolver: Resolve Policy Decision
    const policyResolver = createPolicyResolverService();
    const policyDecision = policyResolver.createPolicyDecision(
      assessment.assessment_id,
      evaluation.evaluation_id,
      ruleResultModel.overall_status,
      PolicyLevel.LEVEL_3
    );

    // 5. Certification Engine: Issue Certification
    const certEngine = createCertificationEngineService();
    const { certification, resultModel: certResultModel } = certEngine.issueCertification(
      {
        assessment_id: assessment.assessment_id,
        policy_decision_id: policyDecision.decision_id,
        title: 'Constitutional Attestation Certificate',
        issuer: 'BPGA Release Authority',
        framework_id: 'CEF',
        governance_level: CertificationLevel.LEVEL_3,
        type: CertificationType.CONSTITUTIONAL_COMPLIANCE,
        tags: ['e2e', 'release-ready'],
      },
      policyDecision
    );

    assert.equal(certResultModel.status, CertificationStatus.ISSUED);
    assert.equal(certification.status, CertificationStatus.ISSUED);

    // 6. Verification Step
    const verification = certEngine.verifyCertification(certification.id);
    assert.equal(verification.status, CertificationStatus.VERIFIED);
    assert.ok(verification.verification_hash.startsWith('sha256-hash-'));

    // 7. Activation Step
    certEngine.activateCertification(certification.id);
    const activeCert = certEngine.getCertification(certification.id);
    assert.equal(activeCert.status, CertificationStatus.ACTIVE);

    // 8. Verify Domain Events Emitted
    const events = certEngine.getEvents();
    assert.equal(events.length, 3); // Issued, Verified, Activated
    assert.equal(events[0].event_name, 'CertificationIssued');
    assert.equal(events[1].event_name, 'CertificationVerified');
    assert.equal(events[2].event_name, 'CertificationActivated');
  });
});
