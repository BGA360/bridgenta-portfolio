/**
 * @file provider-adapter.test.ts
 * @module @cep/provider-gateway
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  OpenAIAdapter,
  AnthropicAdapter,
  GoogleGeminiAdapter,
  XAIAdapter,
  OllamaAdapter,
  ProviderType,
  ProviderCapability,
  RequestId,
  Timestamp,
  AIRequest,
  ProviderConnectionError,
} from '../../src/index.js';

describe('AI Provider Gateway — Unit Tests (Adapters)', () => {
  const createTestRequest = (providerType: ProviderType): AIRequest => ({
    request_id: RequestId.create('req-unit-01'),
    provider_type: providerType,
    capability: ProviderCapability.CHAT_COMPLETION,
    prompt: { user_input: 'Explain Constitutional Engineering' },
    created_at: Timestamp.create(),
  });

  test('should connect, query capabilities, health check, and submit request with OpenAIAdapter', () => {
    const adapter = new OpenAIAdapter();
    assert.equal(adapter.providerType, ProviderType.OPENAI);
    assert.equal(adapter.isConnected(), false);

    adapter.connect();
    assert.equal(adapter.isConnected(), true);

    const caps = adapter.getCapabilities();
    assert.ok(caps.includes(ProviderCapability.CHAT_COMPLETION));
    assert.ok(caps.includes(ProviderCapability.STRUCTURED_OUTPUT));

    const health = adapter.healthCheck();
    assert.equal(health.status, 'HEALTHY');

    const response = adapter.submitRequest(createTestRequest(ProviderType.OPENAI));
    assert.equal(response.provider_type, ProviderType.OPENAI);
    assert.ok(response.completion.content.includes('Explain Constitutional Engineering'));
    assert.ok(response.usage.total_tokens > 0);

    adapter.disconnect();
    assert.equal(adapter.isConnected(), false);
  });

  test('should submit request with AnthropicAdapter', () => {
    const adapter = new AnthropicAdapter();
    adapter.connect();
    const response = adapter.submitRequest(createTestRequest(ProviderType.ANTHROPIC));

    assert.equal(response.provider_type, ProviderType.ANTHROPIC);
    assert.ok(response.completion.content.includes('Explain Constitutional Engineering'));
  });

  test('should submit request with GoogleGeminiAdapter', () => {
    const adapter = new GoogleGeminiAdapter();
    adapter.connect();
    const response = adapter.submitRequest(createTestRequest(ProviderType.GOOGLE_GEMINI));

    assert.equal(response.provider_type, ProviderType.GOOGLE_GEMINI);
    assert.ok(response.completion.content.includes('Explain Constitutional Engineering'));
  });

  test('should submit request with XAIAdapter', () => {
    const adapter = new XAIAdapter();
    adapter.connect();
    const response = adapter.submitRequest(createTestRequest(ProviderType.XAI));

    assert.equal(response.provider_type, ProviderType.XAI);
    assert.ok(response.completion.content.includes('Explain Constitutional Engineering'));
  });

  test('should submit request with OllamaAdapter', () => {
    const adapter = new OllamaAdapter();
    adapter.connect();
    const response = adapter.submitRequest(createTestRequest(ProviderType.OLLAMA));

    assert.equal(response.provider_type, ProviderType.OLLAMA);
    assert.ok(response.completion.content.includes('Explain Constitutional Engineering'));
  });

  test('should throw ProviderConnectionError when submitting request without connecting', () => {
    const adapter = new OpenAIAdapter();
    assert.throws(
      () => adapter.submitRequest(createTestRequest(ProviderType.OPENAI)),
      ProviderConnectionError
    );
  });
});
