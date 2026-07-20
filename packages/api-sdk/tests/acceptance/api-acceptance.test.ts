/**
 * @file api-acceptance.test.ts
 * @module @cep/api-sdk
 * @type Acceptance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createCEPClient,
  PipelineRequestBuilder,
  EvidenceRequestBuilder,
} from '../../src/index.js';

describe('Platform API & SDK — Acceptance Tests (End-to-End SDK Workflow)', () => {
  const dummyChecksumHex = 'd'.repeat(64);

  test('should execute full developer workflow via CEPClient across Pipeline, AI Provider Gateway, and Repository Gateway', () => {
    const client = createCEPClient({ client_id: 'developer-app-01' });

    // 1. Repository Discovery
    const repoSnapshot = client.discoverRepository('/local/projects/bridgenta-app', 'LOCAL_GIT');
    assert.equal(repoSnapshot.snapshot.repository.name, 'bridgenta-app');

    // 2. AI Provider Execution
    const aiResponse = client.executeAIProvider({
      provider_type: 'OPENAI',
      capability: 'CHAT_COMPLETION',
      user_input: 'Generate rule evaluation policy rationale',
    });
    assert.equal(aiResponse.provider_type, 'OPENAI');
    assert.ok(aiResponse.content.length > 0);

    // 3. Build & Execute Full CEP Pipeline
    const evidence = new EvidenceRequestBuilder()
      .withArtifact('app.ts', 'export function startApp() { return true; }', dummyChecksumHex)
      .withOrigin('git://repo/app.ts')
      .build();

    const request = new PipelineRequestBuilder()
      .setRequestId('req-acc-api-01')
      .forProject('bridgenta-app')
      .withGovernanceLevel(5)
      .addScopeFile('src/app.ts')
      .addEvidence(evidence)
      .addRule({
        id: 'rule-app-start-check',
        metadata: { name: 'Start App Function Check', framework_id: 'CEF', category: 'SECURITY', severity: 'CRITICAL' },
        traceability: { constitutional_source: 'CEF', contract_id: 'CTR-009', domain_concept: 'Rule' },
        evaluator_fn: (payload: string) => ({ pass: payload.includes('startApp'), message: 'App start function verified.' }),
      })
      .withCertificationDetails('Level-5 App Certificate', 'Release Steering Board')
      .build();

    const pipelineResponse = client.executePipeline(request);

    assert.equal(pipelineResponse.pipeline_status, 'SUCCESS');
    assert.equal(pipelineResponse.assessment.status, 'CERTIFIED');
    assert.equal(pipelineResponse.certification.issued, true);

    // 4. Query Execution Status & Certification Details
    const statusResponse = client.queryExecutionStatus(pipelineResponse.execution_id);
    assert.equal(statusResponse.pipeline_status, 'SUCCESS');
    assert.ok(statusResponse.completed_stages.length > 0);

    const certResponse = client.retrieveCertification(pipelineResponse.certification.certification_id!);
    assert.equal(certResponse.issued, true);
    assert.equal(certResponse.status, 'ACTIVE');

    // 5. Verify SDK Domain Events
    const events = client.getEvents();
    assert.ok(events.length >= 5); // SDKInitialized + APIRequestReceived + APIRequestValidated + PipelineExecutionRequested + APIResponseGenerated
    assert.equal(events[0].event_name, 'SDKInitialized');
  });
});
