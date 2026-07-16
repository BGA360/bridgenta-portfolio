import { ProviderExecutionEnvelope, IProviderResponse } from '../shared/types.js';
import { BaseAdapter } from './base-adapter.js';
import { ITokenizerPort } from './types.js';
import { ProviderRateLimitException } from './exceptions.js';

class MockTokenizer implements ITokenizerPort {
  public countTokens(text: string): number {
    // Word-based mock count
    return text.trim().split(/\s+/).filter(Boolean).length;
  }
}

export class MockAdapter extends BaseAdapter {
  protected readonly providerId = 'provider-mock';
  protected readonly maxContextLimit = 4096;
  protected readonly tokenizer = new MockTokenizer();

  // Test triggers for simulating retryable/non-retryable errors
  public simulateRateLimitOnce = false;
  public simulateFailureOnce = false;

  protected async executeInternal(
    envelope: ProviderExecutionEnvelope,
    attempt: number,
    signal?: AbortSignal
  ): Promise<IProviderResponse> {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (this.simulateRateLimitOnce && attempt === 1) {
      this.simulateRateLimitOnce = false;
      throw new ProviderRateLimitException('Simulated rate limit');
    }

    if (this.simulateFailureOnce && attempt === 1) {
      this.simulateFailureOnce = false;
      throw new Error('Simulated critical failure');
    }

    return {
      text: `Mock response content for prompt: ${envelope.promptText.substring(0, 30)}...`,
      stopReason: 'stop',
      tokenUsage: {
        inputTokens: this.tokenizer.countTokens(envelope.promptText),
        outputTokens: 15
      },
      providerId: this.providerId,
      metadata: {
        requestId: `req-mock-${envelope.sessionId}`,
        timestamp: new Date().toISOString()
      }
    };
  }
}
