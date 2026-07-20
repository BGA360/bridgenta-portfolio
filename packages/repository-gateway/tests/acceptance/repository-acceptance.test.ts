/**
 * @file repository-acceptance.test.ts
 * @module @cep/repository-gateway
 * @type Acceptance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { AssessmentRequestModel } from '@cep/assessment-core';
import { RuleId, RuleCategory, RuleSeverity } from '@cep/rule-engine';
import { createPlatformOrchestratorService, PipelineStatus } from '@cep/platform-orchestrator';

import {
  createRepositoryGatewayService,
  RepositoryProviderType,
} from '../../src/index.js';

describe('Repository Gateway — Acceptance Tests (Repository Discovery to Pipeline Orchestration)', () => {
  test('should discover repository, transform files to evidence submissions, and execute complete platform orchestration pipeline', () => {
    // 1. Repository Gateway: Discover Local Repository
    const gateway = createRepositoryGatewayService();
    const { snapshot, resultModel: snapshotModel } = gateway.discoverSnapshot({
      uri: '/local/projects/bridgenta-core',
      provider_type: RepositoryProviderType.LOCAL_GIT,
    });

    assert.equal(snapshotModel.provider_type, RepositoryProviderType.LOCAL_GIT);
    assert.ok(snapshot.file_tree.length > 0);

    // 2. Repository Gateway: Transform Snapshot to Evidence Submissions
    const assessmentId = 'req-acc-repo-01';
    const correlationId = 'corr-acc-repo-01';
    const { submissions, resultModel: evidenceGenModel } = gateway.generateEvidenceSubmissions(
      snapshot,
      assessmentId,
      correlationId
    );

    assert.equal(evidenceGenModel.evidence_submissions_count, snapshot.file_tree.length);

    // 3. Platform Orchestrator: Execute full CEP pipeline using Gateway Evidence
    const orchestrator = createPlatformOrchestratorService();

    const request: AssessmentRequestModel = {
      request_id: assessmentId,
      project_ref: snapshot.repository.name,
      target_governance_level: 3,
      scope_manifest: [snapshot.file_tree[0].path],
    };

    const rules = [
      {
        id: RuleId.create('rule-repo-main-export-check'),
        metadata: {
          name: 'Main Export Symbol Check',
          description: 'Verifies main export symbol exists in repository artifact',
          framework_id: 'CEF',
          category: RuleCategory.SECURITY,
          severity: RuleSeverity.CRITICAL,
          tags: ['repository', 'symbol'],
        },
        traceability: {
          constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
          contract_id: 'CTR-007',
          domain_concept: 'Rule',
        },
        evaluator_fn: (payload: string) => ({
          pass: payload.includes('export function main'),
          message: 'Main function export confirmed.',
        }),
      },
    ];

    const { context, summary } = orchestrator.executePipeline(request, submissions, rules as any);

    assert.equal(summary.pipeline_status, PipelineStatus.SUCCESS);
    assert.equal(summary.assessment.status, 'CERTIFIED');
    assert.equal(summary.evidence.total_evidence_count, submissions.length);
    assert.equal(summary.certification.issued, true);

    // 4. Verify Gateway Domain Events
    const events = gateway.getEvents();
    assert.equal(events.length, 4); // Connected, Discovered, Indexed, EvidenceGenerated
    assert.equal(events[0].event_name, 'RepositoryConnected');
    assert.equal(events[1].event_name, 'RepositoryDiscovered');
    assert.equal(events[2].event_name, 'RepositoryIndexed');
    assert.equal(events[3].event_name, 'EvidenceGenerated');
  });
});
