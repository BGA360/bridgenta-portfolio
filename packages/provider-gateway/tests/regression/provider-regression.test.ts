/**
 * @file provider-regression.test.ts
 * @module @cep/provider-gateway
 * @type Regression Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createAIProviderGatewayService,
  ProviderType,
  ProviderCapability,
  AIRequestSubmissionModel,
} from '../../src/index.js';

describe('AI Provider Gateway — Regression Tests', () => {
  test('should produce 100% deterministic response structure across multiple invocations', () => {
    const gateway = createAIProviderGatewayService();

    const submission: AIRequestSubmissionModel = {
      provider_type: ProviderType.OPENAI,
      capability: ProviderCapability.CHAT_COMPLETION,
      user_input: 'Deterministic check',
    };

    const res1 = gateway.executeAIRequest(submission);
    const res2 = gateway.executeAIRequest(submission);

    assert.equal(res1.response.provider_type, res2.response.provider_type);
    assert.equal(res1.response.usage.total_tokens, res2.response.usage.total_tokens);
    assert.equal(res1.response.metadata.model_name, res2.response.metadata.model_name);
    assert.equal(res1.resultModel.finish_reason, res2.resultModel.finish_reason);
  });
});
