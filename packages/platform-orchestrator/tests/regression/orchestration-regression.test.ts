/**
 * @file orchestration-regression.test.ts
 * @module @cep/platform-orchestrator
 * @type Regression Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { AssessmentRequestModel } from '@cep/assessment-core';
import { EvidenceSubmissionModel, EvidenceCategory, EvidenceType } from '@cep/evidence-manager';
import { RuleId, RuleCategory, RuleSeverity } from '@cep/rule-engine';

import { createPlatformOrchestratorService } from '../../src/index.js';

describe('Pipeline Engine — Regression Tests', () => {
  const dummyChecksumHex = 'c'.repeat(64);

  test('should produce 100% deterministic ExecutionSummary structure across multiple invocations with identical inputs', () => {
    const orchestrator1 = createPlatformOrchestratorService();
    const orchestrator2 = createPlatformOrchestratorService();

    const request: AssessmentRequestModel = {
      request_id: 'req-regr-01',
      project_ref: 'repo-regr-01',
      target_governance_level: 2,
      scope_manifest: ['src/main.ts'],
    };

    const submissions: EvidenceSubmissionModel[] = [
      {
        submission_id: 'sub-regr-01',
        assessment_id: 'req-regr-01',
        artifact_name: 'main.ts',
        category: EvidenceCategory.STATIC_CODE,
        type: EvidenceType.FILE_ARTIFACT,
        raw_payload: 'console.log("hello world");',
        content_checksum: dummyChecksumHex,
        origin: 'git://repo/src/main.ts',
        submitting_authority: 'steward-ci',
        correlation_id: 'corr-regr-01',
      },
    ];

    const rules = [
      {
        id: RuleId.create('rule-regr-check'),
        metadata: {
          name: 'Syntax Check',
          description: 'Basic sanity check',
          framework_id: 'CEF',
          category: RuleCategory.SECURITY,
          severity: RuleSeverity.LOW,
          tags: ['syntax'],
        },
        traceability: {
          constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
          contract_id: 'CTR-006',
          domain_concept: 'Rule',
        },
        evaluator_fn: (payload: string) => ({
          pass: payload.length > 0,
          message: 'Non-empty payload confirmed.',
        }),
      },
    ];

    const res1 = orchestrator1.executePipeline(request, submissions, rules as any);
    const res2 = orchestrator2.executePipeline(request, submissions, rules as any);

    assert.equal(res1.summary.pipeline_status, res2.summary.pipeline_status);
    assert.equal(res1.summary.assessment.status, res2.summary.assessment.status);
    assert.equal(res1.summary.evidence.total_evidence_count, res2.summary.evidence.total_evidence_count);
    assert.equal(res1.summary.rules.rules_evaluated, res2.summary.rules.rules_evaluated);
    assert.equal(res1.summary.policy.policy_status, res2.summary.policy.policy_status);
    assert.equal(res1.summary.certification.issued, res2.summary.certification.issued);
  });
});
