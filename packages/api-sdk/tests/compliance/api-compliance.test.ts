/**
 * @file api-compliance.test.ts
 * @module @cep/api-sdk
 * @type Compliance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createCEPClient,
  PipelineRequestBuilder,
  EvidenceRequestBuilder,
} from '../../src/index.js';

describe('Platform API & SDK — Compliance Tests', () => {
  const dummyChecksumHex = 'b'.repeat(64);

  test('should translate internal policy rejection into structured PlatformAPIError (ERR-API-*)', () => {
    const client = createCEPClient();

    const evidence = new EvidenceRequestBuilder()
      .withArtifact('auth.ts', 'export function login() { return false; }', dummyChecksumHex)
      .withOrigin('git://repo/auth.ts')
      .build();

    const request = new PipelineRequestBuilder()
      .setRequestId('req-compl-01')
      .forProject('repo-failing-policy')
      .withGovernanceLevel(3)
      .addScopeFile('src/auth.ts')
      .addEvidence(evidence)
      .addRule({
        id: 'rule-must-fail',
        metadata: { name: 'Failing Rule', framework_id: 'CEF', category: 'SECURITY', severity: 'CRITICAL' },
        traceability: { constitutional_source: 'CEF', contract_id: 'CTR-009', domain_concept: 'Rule' },
        evaluator_fn: () => ({ pass: false, message: 'Intentional failure' }),
      })
      .build();

    const response = client.executePipeline(request);

    assert.equal(response.pipeline_status, 'ABORTED');
    assert.equal(response.policy.policy_status, 'REJECTED');
    assert.equal(response.certification.issued, false);
  });
});
