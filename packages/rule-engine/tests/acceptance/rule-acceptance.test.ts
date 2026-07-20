/**
 * @file rule-acceptance.test.ts
 * @module @cep/rule-engine
 * @type Acceptance Test
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
} from '../../src/index.js';

describe('Rule Engine — Acceptance Tests (End-to-End)', () => {
  const checksum1 = 'd'.repeat(64);
  const checksum2 = 'e'.repeat(64);

  test('should execute full end-to-end rule registration, multi-evidence evaluation, finding generation, and evaluation trace assembly', () => {
    // 1. Prepare evidence items
    const evidenceService = createEvidenceService();

    const sub1: EvidenceSubmissionModel = {
      submission_id: 'sub-e2e-01',
      assessment_id: 'assessment-e2e-001',
      artifact_name: 'auth.ts',
      category: EvidenceCategory.STATIC_CODE,
      type: EvidenceType.FILE_ARTIFACT,
      raw_payload: 'const token = "secret123";',
      content_checksum: checksum1,
      origin: 'git://repo/src/auth.ts',
      submitting_authority: 'steward-ci',
      correlation_id: 'corr-e2e-001',
    };

    const sub2: EvidenceSubmissionModel = {
      submission_id: 'sub-e2e-02',
      assessment_id: 'assessment-e2e-001',
      artifact_name: 'utils.ts',
      category: EvidenceCategory.STATIC_CODE,
      type: EvidenceType.FILE_ARTIFACT,
      raw_payload: 'export function add(a: number, b: number) { return a + b; }',
      content_checksum: checksum2,
      origin: 'git://repo/src/utils.ts',
      submitting_authority: 'steward-ci',
      correlation_id: 'corr-e2e-001',
    };

    const r1 = evidenceService.submitEvidence(sub1);
    const r2 = evidenceService.submitEvidence(sub2);
    const ev1 = evidenceService.getEvidence(r1.evidence_id);
    const ev2 = evidenceService.getEvidence(r2.evidence_id);

    // 2. Register rules
    const engine = createRuleEngineService();

    engine.registerRule({
      id: RuleId.create('rule-security-no-secrets'),
      metadata: {
        name: 'No Secrets in Code',
        description: 'Detect hardcoded secret tokens',
        framework_id: 'CEF',
        category: RuleCategory.SECURITY,
        severity: RuleSeverity.CRITICAL,
        tags: ['security', 'secrets'],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: (payload) => {
        const fail = payload.includes('secret123');
        return { pass: !fail, message: fail ? 'Hardcoded token secret123 detected.' : 'No secrets.' };
      },
    });

    engine.registerRule({
      id: RuleId.create('rule-structural-export'),
      metadata: {
        name: 'Export Keyword Required',
        description: 'Verifies file exports at least one symbol',
        framework_id: 'BECC',
        category: RuleCategory.STRUCTURAL,
        severity: RuleSeverity.MEDIUM,
        tags: ['structure'],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: (payload) => {
        const pass = payload.includes('export');
        return { pass: pass, message: pass ? 'Symbol exported.' : 'Missing export keyword.' };
      },
    });

    // 3. Evaluate rules against evidence
    const { evaluation, resultModel } = engine.evaluateEvidence(
      { evaluation_id: 'eval-e2e-001', assessment_id: 'assessment-e2e-001', target_evidence_ids: [ev1.id, ev2.id] },
      [ev1, ev2]
    );

    // 4. Verify evaluation results
    assert.equal(resultModel.evaluation_id, 'eval-e2e-001');
    assert.equal(resultModel.overall_status, FindingStatus.FAIL);
    assert.equal(resultModel.total_rules_evaluated, 2);
    assert.ok(resultModel.total_findings_generated >= 1);

    // 5. Verify Findings generated correctly
    const failFinding = evaluation.findings.find((f) => f.rule_id === ('rule-security-no-secrets' as any));
    assert.ok(failFinding);
    if (failFinding) {
      assert.equal(failFinding.severity, RuleSeverity.CRITICAL);
      assert.equal(failFinding.status, FindingStatus.FAIL);
      assert.equal(failFinding.description, 'Hardcoded token secret123 detected.');
    }

    // 6. Verify Evaluation Trace details
    assert.equal(evaluation.trace.evaluated_rules_count, 2);
    assert.ok(evaluation.trace.fail_count >= 1);
    assert.equal(evaluation.trace.execution_order.length, 2);

    // 7. Verify Events emitted
    const events = engine.getEvents();
    assert.ok(events.length >= 6); // 2 registered, 4 evaluated (2 rules * 2 items), findings emitted
  });
});
