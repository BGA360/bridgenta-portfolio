/**
 * @file orchestration-compliance.test.ts
 * @module @cep/platform-orchestrator
 * @type Compliance Test
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

describe('Pipeline Engine — Compliance Tests', () => {
  const dummyChecksumHex = 'b'.repeat(64);

  test('should abort pipeline and set status to ABORTED when rule evaluation fails (Policy Decision REJECTED)', () => {
    const orchestrator = createPlatformOrchestratorService();

    const request: AssessmentRequestModel = {
      request_id: 'req-abort-01',
      project_ref: 'repo-abort-01',
      target_governance_level: 4,
      scope_manifest: ['src/unsafe.ts'],
    };

    const submissions: EvidenceSubmissionModel[] = [
      {
        submission_id: 'sub-abort-01',
        assessment_id: 'req-abort-01',
        artifact_name: 'unsafe.ts',
        category: EvidenceCategory.STATIC_CODE,
        type: EvidenceType.FILE_ARTIFACT,
        raw_payload: 'const secret = "12345";',
        content_checksum: dummyChecksumHex,
        origin: 'git://repo/src/unsafe.ts',
        submitting_authority: 'steward-ci',
        correlation_id: 'corr-abort-01',
      },
    ];

    const rules = [
      {
        id: RuleId.create('rule-no-secrets'),
        metadata: {
          name: 'No Secrets Check',
          description: 'Rejects plaintext secrets in source code',
          framework_id: 'CEF',
          category: RuleCategory.SECURITY,
          severity: RuleSeverity.CRITICAL,
          tags: ['security', 'secrets'],
        },
        traceability: {
          constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
          contract_id: 'CTR-006',
          domain_concept: 'Rule',
        },
        evaluator_fn: (payload: string) => ({
          pass: !payload.includes('secret ='),
          message: payload.includes('secret =') ? 'Hardcoded secret detected.' : 'No secret found.',
        }),
      },
    ];

    const { summary } = orchestrator.executePipeline(request, submissions, rules as any);

    assert.equal(summary.pipeline_status, PipelineStatus.ABORTED);
    assert.equal(summary.assessment.status, 'FAILED');
    assert.equal(summary.policy.policy_status, 'REJECTED');
    assert.equal(summary.certification.issued, false);

    const events = orchestrator.getEvents();
    const abortEvent = events.find((e) => e.event_name === 'PipelineAborted');
    assert.ok(abortEvent);
  });
});
