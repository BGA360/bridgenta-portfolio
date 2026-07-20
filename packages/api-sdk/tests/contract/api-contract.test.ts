/**
 * @file api-contract.test.ts
 * @module @cep/api-sdk
 * @type Contract Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createCEPClient,
  PipelineRequestBuilder,
  EvidenceRequestBuilder,
} from '../../src/index.js';

describe('Platform API & SDK — Contract Tests (CTR-009)', () => {
  const dummyChecksumHex = 'a'.repeat(64);

  test('should execute pipeline via CEPClient and return CTR-009 compliant PipelineResponse DTO', () => {
    const client = createCEPClient();

    const evidence = new EvidenceRequestBuilder()
      .withArtifact('auth.ts', 'export function login() { return true; }', dummyChecksumHex)
      .withOrigin('git://repo/auth.ts')
      .build();

    const request = new PipelineRequestBuilder()
      .setRequestId('req-ctr-009-01')
      .forProject('repo-contract-009')
      .withGovernanceLevel(3)
      .addScopeFile('src/auth.ts')
      .addEvidence(evidence)
      .addRule({
        id: 'rule-login-check',
        metadata: { name: 'Login Check', framework_id: 'CEF', category: 'SECURITY', severity: 'HIGH' },
        traceability: { constitutional_source: 'CEF', contract_id: 'CTR-009', domain_concept: 'Rule' },
        evaluator_fn: (payload: string) => ({ pass: payload.includes('login'), message: 'Login symbol verified.' }),
      })
      .build();

    const response = client.executePipeline(request);

    assert.ok(response.execution_id.startsWith('exec-'));
    assert.equal(response.pipeline_status, 'SUCCESS');
    assert.equal(response.assessment.project_ref, 'repo-contract-009');
    assert.equal(response.evidence.total_evidence_count, 1);
    assert.equal(response.rules.rules_evaluated, 1);
    assert.equal(response.policy.policy_status, 'APPROVED');
    assert.equal(response.certification.issued, true);
    assert.ok(response.duration_ms >= 0);
  });
});
