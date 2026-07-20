/**
 * @file provider-acceptance.test.ts
 * @module @cep/provider-gateway
 * @type Acceptance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createAIProviderGatewayService,
  ProviderType,
  ProviderCapability,
} from '../../src/index.js';

describe('AI Provider Gateway — Acceptance Tests (Capability Discovery to Request Execution)', () => {
  test('should discover capabilities across all providers and execute requests through gateway', () => {
    const gateway = createAIProviderGatewayService();

    // 1. Query available providers for STRUCTURED_OUTPUT capability
    const structuredProviders = gateway.getAvailableProvidersForCapability(ProviderCapability.STRUCTURED_OUTPUT);
    assert.ok(structuredProviders.includes(ProviderType.OPENAI));
    assert.ok(structuredProviders.includes(ProviderType.ANTHROPIC));
    assert.ok(structuredProviders.includes(ProviderType.GOOGLE_GEMINI));

    // 2. Query capabilities for Anthropic
    const anthropicQuery = gateway.queryProviderCapabilities(ProviderType.ANTHROPIC);
    assert.equal(anthropicQuery.is_healthy, true);
    assert.ok(anthropicQuery.supported_capabilities.includes(ProviderCapability.CHAT_COMPLETION));

    // 3. Execute Request on Anthropic
    const { response, resultModel } = gateway.executeAIRequest({
      provider_type: ProviderType.ANTHROPIC,
      capability: ProviderCapability.CHAT_COMPLETION,
      user_input: 'Generate constitutional compliance report snippet',
    });

    assert.equal(resultModel.provider_type, ProviderType.ANTHROPIC);
    assert.equal(response.completion.finish_reason, 'stop');
    assert.ok(response.usage.total_tokens > 0);

    // 4. Verify Gateway Domain Events
    const events = gateway.getEvents();
    assert.ok(events.length >= 7); // 5 Register + 1 Connect + 1 Submit + 1 Receive
    assert.equal(events[0].event_name, 'ProviderRegistered');
    const subEvent = events.find((e) => e.event_name === 'RequestSubmitted');
    assert.ok(subEvent);
    const respEvent = events.find((e) => e.event_name === 'ResponseReceived');
    assert.ok(respEvent);
  });
});
