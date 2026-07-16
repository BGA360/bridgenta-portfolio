import { test } from 'node:test';
import assert from 'node:assert';
import { ProviderExecutionEnvelope } from '../shared/types.js';
import { AdapterFactory } from '../adapters/adapter-factory.js';
import { MockAdapter } from '../adapters/mock-adapter.js';
import { GeminiAdapter } from '../adapters/gemini-adapter.js';
import { ProviderAdapterService } from '../adapters/provider-adapter.service.js';
import {
  AdapterResolutionException,
  CapacityExceededException,
  ProviderRateLimitException,
  ProviderTimeoutException,
  AuthenticationException
} from '../adapters/exceptions.js';
import { ITransportClient, ICredentialResolver } from '../adapters/types.js';

// ==========================================
// MOCK SERVICES FOR TESTING
// ==========================================

class DummyTransport implements ITransportClient {
  public status = 200;
  public data: any = {};
  public headers: Record<string, string> = {};
  public delayMs = 0;

  public async post(
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs: number,
    signal?: AbortSignal
  ): Promise<{ status: number; data: any; headers: Record<string, string> }> {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (this.delayMs > 0) {
      await new Promise((resolve, reject) => {
        const onAbort = () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        };
        if (signal) {
          signal.addEventListener('abort', onAbort);
        }
        const timer = setTimeout(() => {
          if (signal) {
            signal.removeEventListener('abort', onAbort);
          }
          resolve(true);
        }, this.delayMs);
      });
    }

    if (this.status === 429) {
      throw new ProviderRateLimitException('Rate limit limit exceeded');
    }

    return {
      status: this.status,
      data: this.data,
      headers: this.headers
    };
  }
}

class DummyCredentialResolver implements ICredentialResolver {
  public apiKey: string | undefined = 'dummy-key';
  public resolve(providerId: string): string | undefined {
    return this.apiKey;
  }
}

function createMockEnvelope(text: string): ProviderExecutionEnvelope {
  return {
    sessionId: 'sess-test-wp009',
    promptText: text,
    systemInstructions: 'Act as a helper',
    bundleHash: 'a5d8c73e7dabf1332b59712cb75c4cd1b0c13df0a5d8c73e7dabf1332b59712c',
    policy: {
      temperature: 0.1,
      maxTokens: 512
    }
  };
}

// ==========================================
// 1. FACTORY RESOLUTION TESTS
// ==========================================

test('WP-009: Factory - Resolves MockAdapter and GeminiAdapter correctly', () => {
  const factory = new AdapterFactory();
  const mockAdapter = factory.getAdapter('provider-mock');
  assert.ok(mockAdapter instanceof MockAdapter);

  const geminiAdapter = factory.getAdapter('provider-gemini');
  assert.ok(geminiAdapter instanceof GeminiAdapter);
});

test('WP-009: Factory - Rejects unregistered provider ID', () => {
  const factory = new AdapterFactory();
  assert.throws(() => {
    factory.getAdapter('provider-invalid');
  }, AdapterResolutionException);
});

// ==========================================
// 2. MOCK ADAPTER TESTS
// ==========================================

test('WP-009: Mock - Executes successfully and normalizes trace outputs', async () => {
  const service = new ProviderAdapterService();
  const envelope = createMockEnvelope('Hello test world');

  const result = await service.execute('provider-mock', envelope);
  assert.strictEqual(result.response.providerId, 'provider-mock');
  assert.strictEqual(result.response.stopReason, 'stop');
  assert.ok(result.response.text.includes('Hello test world'));
  assert.strictEqual(result.executionTrace.isMocked, true);
  assert.strictEqual(result.executionTrace.attemptCount, 1);
});

// ==========================================
// 3. RETRY & TIMEOUT TESTS
// ==========================================

test('WP-009: Retry - Transient rate limit recovers on retry', async () => {
  const factory = new AdapterFactory();
  const mock = factory.getAdapter('provider-mock') as MockAdapter;
  mock.simulateRateLimitOnce = true;

  const envelope = createMockEnvelope('Transient test');
  const result = await mock.execute(envelope);

  assert.strictEqual(result.executionTrace.attemptCount, 2);
  assert.strictEqual(result.response.stopReason, 'stop');
});

test('WP-009: Timeout - Request times out when delay exceeds limits', async () => {
  const transport = new DummyTransport();
  transport.delayMs = 100; // Delay exceeding local connection limits
  const resolver = new DummyCredentialResolver();
  const adapter = new GeminiAdapter(transport, resolver);
  const envelope = createMockEnvelope('Timeout test');

  // Inject a small request timeout for testing
  assert.rejects(async () => {
    // We simulate client-side abort wrapper or pass a signal to verify rejection
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20);
    await adapter.execute(envelope, controller.signal);
  }, /Aborted/);
});

// ==========================================
// 4. CAPACITY & TOKENIZATION TESTS
// ==========================================

test('WP-009: Capacity - Throws exception when token count exceeds maxLimit', async () => {
  const factory = new AdapterFactory();
  const mock = factory.getAdapter('provider-mock') as MockAdapter;
  
  // Generating a text string of 5000 words, exceeding mock maxLimit of 4096 tokens
  const longPrompt = 'word '.repeat(5000);
  const envelope = createMockEnvelope(longPrompt);

  await assert.rejects(async () => {
    await mock.execute(envelope);
  }, CapacityExceededException);
});

// ==========================================
// 5. CANCELLATION TESTS
// ==========================================

test('WP-009: Cancellation - Halts execution immediately on AbortSignal', async () => {
  const transport = new DummyTransport();
  transport.delayMs = 500;
  const resolver = new DummyCredentialResolver();
  const adapter = new GeminiAdapter(transport, resolver);
  const envelope = createMockEnvelope('Cancellation test');

  const controller = new AbortController();
  const promise = adapter.execute(envelope, controller.signal);

  // Trigger abort immediately
  controller.abort();

  await assert.rejects(promise, (err: any) => {
    return err.name === 'AbortError' || err.message.includes('Aborted');
  });
});

// ==========================================
// 6. GEMINI RESPONSE NORMALIZATION TESTS
// ==========================================

test('WP-009: Gemini - Normalizes stop reasons and usage metadata', async () => {
  const transport = new DummyTransport();
  transport.status = 200;
  transport.data = {
    candidates: [{
      content: { parts: [{ text: 'Gemini improvement output text' }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {
      promptTokenCount: 120,
      candidatesTokenCount: 80
    }
  };

  const resolver = new DummyCredentialResolver();
  const adapter = new GeminiAdapter(transport, resolver);
  const envelope = createMockEnvelope('Gemini normalization');

  const result = await adapter.execute(envelope);
  assert.strictEqual(result.response.text, 'Gemini improvement output text');
  assert.strictEqual(result.response.stopReason, 'stop');
  assert.strictEqual(result.response.tokenUsage.inputTokens, 120);
  assert.strictEqual(result.response.tokenUsage.outputTokens, 80);
});

test('WP-009: Gemini - Throws AuthenticationException on 401 response status', async () => {
  const transport = new DummyTransport();
  transport.status = 401;
  transport.data = { error: { message: 'Invalid API Key' } };

  const resolver = new DummyCredentialResolver();
  const adapter = new GeminiAdapter(transport, resolver);
  const envelope = createMockEnvelope('Auth failure');

  await assert.rejects(async () => {
    await adapter.execute(envelope);
  }, AuthenticationException);
});

// ==========================================
// 7. SECURITY & TELEMETRY TESTS
// ==========================================

test('WP-009: Security - Trace logs do not leak secrets or credentials', async () => {
  const transport = new DummyTransport();
  transport.data = {
    candidates: [{
      content: { parts: [{ text: 'Response' }] },
      finishReason: 'STOP'
    }]
  };
  const resolver = new DummyCredentialResolver();
  resolver.apiKey = 'SUPER_SECRET_BECC_API_KEY_123';
  const adapter = new GeminiAdapter(transport, resolver);
  const envelope = createMockEnvelope('Security check');

  const result = await adapter.execute(envelope);
  const traceString = JSON.stringify(result);

  assert.strictEqual(traceString.includes('SUPER_SECRET_BECC_API_KEY_123'), false);
  assert.strictEqual(traceString.includes('dummy-key'), false);
});
