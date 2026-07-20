/**
 * @file rule-contract.test.ts
 * @module @cep/rule-engine
 * @type Contract Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { FindingStatus } from '@cep/assessment-core';
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
  RuleEvaluationRequestModel,
  RuleValidationError,
} from '../../src/index.js';

describe('Rule Engine — Contract Tests (CTR-003)', () => {
  const dummyChecksumHex = 'a'.repeat(64);

  test('should process RuleEvaluationRequestModel and return CTR-003 result model', () => {
    const evidenceService = createEvidenceService();
    const sub: EvidenceSubmissionModel = {
      submission_id: 'sub-rule-ctr-01',
      assessment_id: 'assessment-ctr-003',
      artifact_name: 'test.ts',
      category: EvidenceCategory.STATIC_CODE,
      type: EvidenceType.FILE_ARTIFACT,
      raw_payload: 'const a = 1;',
      content_checksum: dummyChecksumHex,
      origin: 'git://repo/test.ts',
      submitting_authority: 'steward-ci',
      correlation_id: 'corr-001',
    };
    const receipt = evidenceService.submitEvidence(sub);
    const evidence = evidenceService.getEvidence(receipt.evidence_id);

    const ruleEngine = createRuleEngineService();
    ruleEngine.registerRule({
      id: RuleId.create('rule-ctr-01'),
      metadata: {
        name: 'Valid TS Syntax',
        description: 'Verifies file starts with const or let.',
        framework_id: 'CEF',
        category: RuleCategory.STRUCTURAL,
        severity: RuleSeverity.LOW,
        tags: ['syntax'],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: (p) => ({ pass: p.includes('const'), message: 'Valid' }),
    });

    const request: RuleEvaluationRequestModel = {
      evaluation_id: 'eval-ctr-001',
      assessment_id: 'assessment-ctr-003',
      target_evidence_ids: [evidence.id],
    };

    const { evaluation, resultModel } = ruleEngine.evaluateEvidence(request, [evidence]);

    assert.equal(resultModel.evaluation_id, 'eval-ctr-001');
    assert.equal(resultModel.overall_status, FindingStatus.PASS);
    assert.equal(resultModel.total_rules_evaluated, 1);
    assert.equal(resultModel.total_findings_generated, 0);
    assert.equal(evaluation.rule_results.length, 1);
  });

  test('should throw RuleValidationError when evaluation request is missing target_evidence_ids', () => {
    const ruleEngine = createRuleEngineService();
    const badRequest = {
      evaluation_id: 'eval-bad',
      assessment_id: 'assessment-bad',
      target_evidence_ids: [],
    };

    assert.throws(
      () => ruleEngine.evaluateEvidence(badRequest, []),
      (err: unknown) => err instanceof RuleValidationError && err.code === 'ERR-RUL-001'
    );
  });
});
