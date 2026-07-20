/**
 * @file repository-compliance.test.ts
 * @module @cep/repository-gateway
 * @type Compliance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createRepositoryGatewayService,
  RepositoryProviderType,
  ProviderUnavailableError,
} from '../../src/index.js';

describe('Repository Gateway — Compliance Tests', () => {
  test('should throw ProviderUnavailableError (ERR-REP-002) for unregistered provider type', () => {
    const gateway = createRepositoryGatewayService();

    assert.throws(
      () => gateway.discoverSnapshot({
        uri: 'custom://repo',
        provider_type: 'CUSTOM_UNKNOWN' as any,
      }),
      (err: unknown) => err instanceof ProviderUnavailableError && err.code === 'ERR-REP-002'
    );
  });
});
