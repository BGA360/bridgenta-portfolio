/**
 * @file pipeline-integration.test.ts
 * @module @cep/platform-orchestrator
 * @type Integration Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { AssessmentRequestModel } from '@cep/assessment-core';
import { EvidenceSubmissionModel, EvidenceCategory, EvidenceType } from '@cep/evidence-manager';
import { RuleId, RuleCategory, RuleSeverity } from '@cep/rule-engine';

import {
  createPlatformOrchestratorService,
  PipelineStatus,
} from '../../src/index.js';

describe('Pipeline Engine — Integration Tests', () => {
  const dummyChecksumHex = 'a'.repeat(64);

  test('should orchestrate execution across all 5 sub-modules successfully', () => {
    const orchestrator = createPlatformOrchestratorService();

    const request: AssessmentRequestModel = {
      request_id: 'req-integ-01',
      project_ref: 'repo-integ-01',
      target_governance_level: 3,
      scope_manifest: ['src/index.ts'],
    };

    const submissions: EvidenceSubmissionModel[] = [
      {
        submission_id: 'sub-integ-01',
        assessment_id: 'req-integ-01',
        artifact_name: 'index.ts',
        category: EvidenceCategory.STATIC_CODE,
        type: EvidenceType.FILE_ARTIFACT,
        raw_payload: 'export const version = "1.0.0";',
        content_checksum: dummyChecksumHex,
        origin: 'git://repo/src/index.ts',
        submitting_authority: 'steward-ci',
        correlation_id: 'corr-integ-01',
      },
    ];

    const rules = [
      {
        id: RuleId.create('rule-integ-version-check'),
        metadata: {
          name: 'Version Export Check',
          description: 'Checks version symbol exported',
          framework_id: 'CEF',
          category: RuleCategory.SECURITY,
          severity: RuleSeverity.HIGH,
          tags: ['version'],
        },
        traceability: {
          constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
          contract_id: 'CTR-006',
          domain_concept: 'Rule',
        },
        evaluator_fn: (payload: string) => ({
          pass: payload.includes('export const version'),
          message: 'Version export confirmed.',
        }),
      },
    ];

    const { context, summary } = orchestrator.executePipeline(request, submissions, rules as any);

    assert.equal(summary.pipeline_status, PipelineStatus.SUCCESS);
    assert.equal(summary.assessment.status, 'CERTIFIED');
    assert.equal(summary.evidence.total_evidence_count, 1);
    assert.equal(summary.rules.rules_evaluated, 1);
    assert.equal(summary.policy.policy_status, 'APPROVED');
    assert.equal(summary.certification.issued, true);
    assert.ok(summary.certification.certification_id);
    assert.ok(summary.duration_ms >= 0);
  });
});
