/**
 * @file rule-regression.test.ts
 * @module @cep/rule-engine
 * @type Regression Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
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
} from '../../src/index.js';

describe('Rule Engine — Regression Tests', () => {
  const dummyChecksumHex = 'c'.repeat(64);

  test('should yield 100% identical RuleResults given identical evidence and rules', () => {
    const evidenceService = createEvidenceService();
    const sub: EvidenceSubmissionModel = {
      submission_id: 'sub-regr-01',
      assessment_id: 'assessment-regr-01',
      artifact_name: 'code.ts',
      category: EvidenceCategory.STATIC_CODE,
      type: EvidenceType.FILE_ARTIFACT,
      raw_payload: 'function test() { return true; }',
      content_checksum: dummyChecksumHex,
      origin: 'git://repo/code.ts',
      submitting_authority: 'steward-ci',
      correlation_id: 'corr-regr-01',
    };
    const receipt = evidenceService.submitEvidence(sub);
    const evidence = evidenceService.getEvidence(receipt.evidence_id);

    const engine1 = createRuleEngineService();
    const engine2 = createRuleEngineService();

    const ruleProps = {
      id: RuleId.create('rule-regr-01'),
      metadata: {
        name: 'Function naming',
        description: 'Verifies payload has function keyword',
        framework_id: 'BECC',
        category: RuleCategory.STRUCTURAL,
        severity: RuleSeverity.MEDIUM,
        tags: [],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: (p: string) => ({ pass: p.includes('function'), message: 'Function present' }),
    };

    engine1.registerRule(ruleProps);
    engine2.registerRule(ruleProps);

    const run1 = engine1.evaluateEvidence(
      { evaluation_id: 'eval-r1', assessment_id: 'assessment-regr-01', target_evidence_ids: [evidence.id] },
      [evidence]
    );

    const run2 = engine2.evaluateEvidence(
      { evaluation_id: 'eval-r1', assessment_id: 'assessment-regr-01', target_evidence_ids: [evidence.id] },
      [evidence]
    );

    assert.equal(run1.resultModel.overall_status, run2.resultModel.overall_status);
    assert.equal(run1.resultModel.total_rules_evaluated, run2.resultModel.total_rules_evaluated);
    assert.equal(run1.resultModel.total_findings_generated, run2.resultModel.total_findings_generated);
    assert.equal(run1.evaluation.rule_results[0].status, run2.evaluation.rule_results[0].status);
  });
});
