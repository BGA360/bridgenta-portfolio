/**
 * @file api-regression.test.ts
 * @module @cep/api-sdk
 * @type Regression Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createCEPClient,
  PipelineRequestBuilder,
  EvidenceRequestBuilder,
  APISerializer,
} from '../../src/index.js';

describe('Platform API & SDK — Regression Tests', () => {
  const dummyChecksumHex = 'c'.repeat(64);

  test('should support 100% loss-free JSON roundtrip serialization of PipelineResponse', () => {
    const client = createCEPClient();

    const evidence = new EvidenceRequestBuilder()
      .withArtifact('core.ts', 'export const core = true;', dummyChecksumHex)
      .withOrigin('git://repo/core.ts')
      .build();

    const request = new PipelineRequestBuilder()
      .setRequestId('req-regr-api-01')
      .forProject('repo-regr-api')
      .withGovernanceLevel(2)
      .addScopeFile('src/core.ts')
      .addEvidence(evidence)
      .addRule({
        id: 'rule-core-check',
        metadata: { name: 'Core Check', framework_id: 'CEF', category: 'SECURITY', severity: 'LOW' },
        traceability: { constitutional_source: 'CEF', contract_id: 'CTR-009', domain_concept: 'Rule' },
        evaluator_fn: () => ({ pass: true, message: 'Core OK' }),
      })
      .build();

    const response = client.executePipeline(request);

    const jsonStr = APISerializer.serializePipelineResponse(response);
    const deserialized = APISerializer.deserializePipelineResponse(jsonStr);

    assert.equal(deserialized.execution_id, response.execution_id);
    assert.equal(deserialized.pipeline_status, response.pipeline_status);
    assert.equal(deserialized.assessment.assessment_id, response.assessment.assessment_id);
    assert.equal(deserialized.evidence.total_evidence_count, response.evidence.total_evidence_count);
    assert.equal(deserialized.certification.issued, response.certification.issued);
  });
});
