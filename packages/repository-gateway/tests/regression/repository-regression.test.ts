/**
 * @file repository-regression.test.ts
 * @module @cep/repository-gateway
 * @type Regression Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createRepositoryGatewayService,
  RepositoryProviderType,
  RepositoryNormalizer,
} from '../../src/index.js';

describe('Repository Gateway — Regression Tests', () => {
  test('should produce 100% deterministic evidence transformation outputs from snapshot', () => {
    const gateway = createRepositoryGatewayService();
    const { snapshot } = gateway.discoverSnapshot({
      uri: '/local/test-repo',
      provider_type: RepositoryProviderType.LOCAL_GIT,
    });

    const { submissions: subs1 } = gateway.generateEvidenceSubmissions(snapshot, 'assessment-regr', 'corr-regr');
    const { submissions: subs2 } = gateway.generateEvidenceSubmissions(snapshot, 'assessment-regr', 'corr-regr');

    assert.equal(subs1.length, subs2.length);
    assert.equal(subs1[0].artifact_name, subs2[0].artifact_name);
    assert.equal(subs1[0].content_checksum, subs2[0].content_checksum);
    assert.equal(subs1[0].raw_payload, subs2[0].raw_payload);
  });
});
