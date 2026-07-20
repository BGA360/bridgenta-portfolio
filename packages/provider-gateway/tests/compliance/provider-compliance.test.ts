/**
 * @file provider-compliance.test.ts
 * @module @cep/provider-gateway
 * @type Compliance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createAIProviderGatewayService,
  ProviderType,
  ProviderCapability,
  ProviderUnavailableError,
} from '../../src/index.js';

describe('AI Provider Gateway — Compliance Tests', () => {
  test('should throw ProviderUnavailableError (ERR-PRV-002) for unregistered provider type', () => {
    const gateway = createAIProviderGatewayService();

    assert.throws(
      () => gateway.executeAIRequest({
        provider_type: 'CUSTOM_UNKNOWN' as any,
        capability: ProviderCapability.CHAT_COMPLETION,
        user_input: 'Hello',
      }),
      (err: unknown) => err instanceof ProviderUnavailableError && err.code === 'ERR-PRV-002'
    );
  });
});
