/**
 * @file sdk-client.test.ts
 * @module @cep/api-sdk
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createCEPClient,
  PipelineRequestBuilder,
  EvidenceRequestBuilder,
  APIValidationError,
} from '../../src/index.js';

describe('Platform API & SDK — Unit Tests (CEPClient & Builders)', () => {
  test('should initialize CEPClient and query API version info', () => {
    const client = createCEPClient({ client_id: 'test-client' });
    const versionInfo = client.getAPIVersionInfo();

    assert.equal(versionInfo.api_version, '1.0.0');
    assert.equal(versionInfo.contract_version, 'CTR-009');
    assert.equal(versionInfo.compatibility_version, '1.x');
    assert.equal(versionInfo.is_deprecated, false);
  });

  test('should build PipelineExecutionRequest using PipelineRequestBuilder', () => {
    const evidence = new EvidenceRequestBuilder()
      .withArtifact('main.ts', 'console.log("hello");', 'checksum-123')
      .withOrigin('git://repo/main.ts')
      .build();

    const request = new PipelineRequestBuilder()
      .forProject('repo-unit-test')
      .withGovernanceLevel(4)
      .addScopeFile('src/main.ts')
      .addEvidence(evidence)
      .addRule({ id: 'rule-check', evaluator_fn: () => ({ pass: true }) })
      .withCertificationDetails('Unit Certificate', 'Unit Board')
      .build();

    assert.equal(request.project_ref, 'repo-unit-test');
    assert.equal(request.target_governance_level, 4);
    assert.equal(request.scope_manifest[0], 'src/main.ts');
    assert.equal(request.submissions.length, 1);
    assert.equal(request.certification_title, 'Unit Certificate');
  });

  test('should throw APIValidationError on invalid pipeline request schema', () => {
    const client = createCEPClient();
    assert.throws(
      () => client.executePipeline({
        request_id: '',
        project_ref: '',
        target_governance_level: 10,
        scope_manifest: [],
        submissions: [],
        rules: [],
      }),
      APIValidationError
    );
  });
});
