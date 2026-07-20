/**
 * @file provider-contract.test.ts
 * @module @cep/provider-gateway
 * @type Contract Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createAIProviderGatewayService,
  ProviderType,
  ProviderCapability,
  AIRequestSubmissionModel,
} from '../../src/index.js';

describe('AI Provider Gateway — Contract Tests (CTR-008)', () => {
  test('should accept AIRequestSubmissionModel and return CTR-008 response result model', () => {
    const gateway = createAIProviderGatewayService();

    const submission: AIRequestSubmissionModel = {
      provider_type: ProviderType.GOOGLE_GEMINI,
      capability: ProviderCapability.CHAT_COMPLETION,
      system_instruction: 'You are a CEP Constitutional Auditor.',
      user_input: 'Analyze rule compliance',
    };

    const { response, resultModel } = gateway.executeAIRequest(submission);

    assert.equal(resultModel.provider_type, ProviderType.GOOGLE_GEMINI);
    assert.ok(resultModel.response_id.startsWith('resp-gemini-'));
    assert.ok(resultModel.content.length > 0);
    assert.ok(resultModel.total_tokens > 0);
    assert.equal(response.request_id, resultModel.request_id);
  });
});
