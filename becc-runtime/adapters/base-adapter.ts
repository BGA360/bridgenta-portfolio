import { ProviderExecutionEnvelope, IProviderResponse } from '../shared/types.js';
import { IProviderAdapter, IProviderExecutionResult, ITokenizerPort } from './types.js';
import { CapacityExceededException, ProviderRateLimitException } from './exceptions.js';

export abstract class BaseAdapter implements IProviderAdapter {
  protected abstract readonly providerId: string;
  protected abstract readonly maxContextLimit: number;
  protected abstract readonly tokenizer: ITokenizerPort;

  protected abstract executeInternal(
    envelope: ProviderExecutionEnvelope,
    attempt: number,
    signal?: AbortSignal
  ): Promise<IProviderResponse>;

  public async execute(
    envelope: ProviderExecutionEnvelope,
    signal?: AbortSignal
  ): Promise<IProviderExecutionResult> {
    // 1. Capacity Check
    const tokenCount = this.tokenizer.countTokens(envelope.promptText);
    if (tokenCount > this.maxContextLimit) {
      throw new CapacityExceededException(tokenCount, this.maxContextLimit);
    }

    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 3;
    let lastError: any;

    while (attempt < maxAttempts) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      attempt++;
      try {
        const response = await this.executeInternal(envelope, attempt, signal);
        const durationMs = Date.now() - startTime;

        return {
          response,
          executionTrace: {
            attemptCount: attempt,
            totalDurationMs: durationMs,
            isMocked: this.providerId === 'provider-mock'
          }
        };
      } catch (err: any) {
        lastError = err;
        // Only retry on retryable transient errors (network fails, 429/503 rate limits)
        const isRetryable =
          err.name === 'ProviderNetworkException' ||
          err.name === 'ProviderRateLimitException';

        if (!isRetryable || attempt >= maxAttempts) {
          throw err;
        }

        // Exponential backoff: 100ms * 3^(attempt - 1)
        const delay = 100 * Math.pow(3, attempt - 1);
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
          }, delay);
        });
      }
    }

    throw lastError || new Error('Request execution failed.');
  }
}
