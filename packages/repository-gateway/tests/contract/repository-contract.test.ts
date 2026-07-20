/**
 * @file repository-contract.test.ts
 * @module @cep/repository-gateway
 * @type Contract Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createRepositoryGatewayService,
  RepositoryProviderType,
  RepositoryDiscoveryRequestModel,
} from '../../src/index.js';

describe('Repository Gateway — Contract Tests (CTR-007)', () => {
  test('should accept RepositoryDiscoveryRequestModel and return CTR-007 snapshot result model', () => {
    const gateway = createRepositoryGatewayService();
    const request: RepositoryDiscoveryRequestModel = {
      uri: 'https://github.com/BGA360/bridgenta-portfolio',
      provider_type: RepositoryProviderType.GITHUB,
    };

    const { snapshot, resultModel } = gateway.discoverSnapshot(request);

    assert.equal(resultModel.provider_type, RepositoryProviderType.GITHUB);
    assert.equal(resultModel.default_branch, 'main');
    assert.ok(resultModel.repository_id.startsWith('gh-'));
    assert.ok(resultModel.files_count > 0);
    assert.equal(snapshot.file_tree.length, resultModel.files_count);
  });
});
