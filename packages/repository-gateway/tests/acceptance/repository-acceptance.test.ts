/**
 * @file repository-acceptance.test.ts
 * @module @cep/repository-gateway
 * @type Acceptance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createRepositoryGatewayService,
  RepositoryProviderType,
} from '../../src/index.js';

describe('Repository Gateway — Acceptance Tests (Repository Discovery to Evidence Generation)', () => {
  test('should discover repository, index file tree, transform files to evidence submissions, and emit domain events', () => {
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
    assert.equal(submissions.length, snapshot.file_tree.length);
    assert.equal(submissions[0].assessment_id, assessmentId);
    assert.equal(submissions[0].correlation_id, correlationId);
    assert.ok(submissions[0].raw_payload.length > 0);

    // 3. Verify Gateway Domain Events
    const events = gateway.getEvents();
    assert.equal(events.length, 4); // Connected, Discovered, Indexed, EvidenceGenerated
    assert.equal(events[0].event_name, 'RepositoryConnected');
    assert.equal(events[1].event_name, 'RepositoryDiscovered');
    assert.equal(events[2].event_name, 'RepositoryIndexed');
    assert.equal(events[3].event_name, 'EvidenceGenerated');
  });
});
