/**
 * @file pipeline-acceptance.test.ts
 * @module @cep/platform-orchestrator
 * @type Acceptance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { AssessmentRequestModel } from '@cep/assessment-core';
import { EvidenceSubmissionModel, EvidenceCategory, EvidenceType } from '@cep/evidence-manager';
import { RuleId, RuleCategory, RuleSeverity } from '@cep/rule-engine';
import { CertificationLevel } from '@cep/certification-engine';

import {
  createPlatformOrchestratorService,
  PipelineStatus,
} from '../../src/index.js';

describe('Platform Orchestrator — Acceptance Tests (Full End-to-End Pipeline)', () => {
  const dummyChecksumHex = 'd'.repeat(64);

  test('should execute complete CEP pipeline from raw Assessment Request to active Certification with summary & events', () => {
    const orchestrator = createPlatformOrchestratorService();

    const request: AssessmentRequestModel = {
      request_id: 'req-acc-e2e-01',
      project_ref: 'repo-bridgenta-core',
      target_governance_level: 5,
      scope_manifest: ['src/core/security.ts'],
    };

    const submissions: EvidenceSubmissionModel[] = [
      {
        submission_id: 'sub-acc-01',
        assessment_id: 'req-acc-e2e-01',
        artifact_name: 'security.ts',
        category: EvidenceCategory.STATIC_CODE,
        type: EvidenceType.FILE_ARTIFACT,
        raw_payload: 'export function authorizeRequest() { return true; }\nexport const enforcePolicy = true;',
        content_checksum: dummyChecksumHex,
        origin: 'git://repo/src/core/security.ts',
        submitting_authority: 'steward-ci',
        correlation_id: 'corr-acc-e2e',
      },
    ];

    const rules = [
      {
        id: RuleId.create('rule-auth-authorize-check'),
        metadata: {
          name: 'Authorization Request Function Check',
          description: 'Ensures authorizeRequest function exists',
          framework_id: 'CEF',
          category: RuleCategory.SECURITY,
          severity: RuleSeverity.CRITICAL,
          tags: ['security', 'authorization'],
        },
        traceability: {
          constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
          contract_id: 'CTR-006',
          domain_concept: 'Rule',
        },
        evaluator_fn: (payload: string) => ({
          pass: payload.includes('authorizeRequest'),
          message: 'Authorization symbol confirmed.',
        }),
      },
      {
        id: RuleId.create('rule-policy-enforce-check'),
        metadata: {
          name: 'Policy Enforce Constant Check',
          description: 'Ensures enforcePolicy constant is set',
          framework_id: 'CEF',
          category: RuleCategory.SECURITY,
          severity: RuleSeverity.CRITICAL,
          tags: ['policy'],
        },
        traceability: {
          constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
          contract_id: 'CTR-006',
          domain_concept: 'Rule',
        },
        evaluator_fn: (payload: string) => ({
          pass: payload.includes('enforcePolicy = true'),
          message: 'Policy enforcement constant confirmed.',
        }),
      },
    ];

    const { context, summary } = orchestrator.executePipeline(request, submissions, rules as any, {
      governance_level: CertificationLevel.LEVEL_5,
      certification_title: 'Level-5 Constitutional Clearance Certificate',
      certification_issuer: 'BPGA Release Steering Board',
    });

    // Verify Summary
    assert.equal(summary.pipeline_status, PipelineStatus.SUCCESS);
    assert.equal(summary.assessment.status, 'CERTIFIED');
    assert.equal(summary.evidence.total_evidence_count, 1);
    assert.equal(summary.rules.rules_evaluated, 2);
    assert.equal(summary.policy.policy_status, 'APPROVED');
    assert.equal(summary.certification.issued, true);
    assert.equal(summary.certification.certification_status, 'ACTIVE');

    // Verify Context
    assert.equal(context.completed_stages.length, 5);

    // Verify Events
    const events = orchestrator.getEvents();
    assert.ok(events.length >= 6); // PipelineStarted + 5 StageCompleted + PipelineCompleted
    assert.equal(events[0].event_name, 'PipelineStarted');
    assert.equal(events[events.length - 1].event_name, 'PipelineCompleted');
  });
});
