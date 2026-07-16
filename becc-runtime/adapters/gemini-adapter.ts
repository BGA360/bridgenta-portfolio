import { ProviderExecutionEnvelope, IProviderResponse } from '../shared/types.js';
import { BaseAdapter } from './base-adapter.js';
import { ITokenizerPort, ITransportClient, ICredentialResolver } from './types.js';
import { AuthenticationException, InvalidRequestException, ProviderRateLimitException, ProviderNetworkException } from './exceptions.js';

class GeminiTokenizer implements ITokenizerPort {
  public countTokens(text: string): number {
    // Estimator for Gemini context checks (approx. 4 characters per token for English text)
    return Math.ceil(text.length / 4);
  }
}

export class GeminiAdapter extends BaseAdapter {
  protected readonly providerId = 'provider-gemini';
  protected readonly maxContextLimit = 1048576; // 1M tokens limit
  protected readonly tokenizer = new GeminiTokenizer();

  constructor(
    private readonly transportClient: ITransportClient,
    private readonly credentialResolver: ICredentialResolver,
    private readonly endpointUrl?: string
  ) {
    super();
  }

  protected async executeInternal(
    envelope: ProviderExecutionEnvelope,
    attempt: number,
    signal?: AbortSignal
  ): Promise<IProviderResponse> {
    const apiKey = this.credentialResolver.resolve(this.providerId);
    if (!apiKey) {
      throw new AuthenticationException('Gemini API key is not configured.');
    }

    const defaultUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    const url = (this.endpointUrl || process.env.BECC_GEMINI_ENDPOINT || defaultUrl) + `?key=${apiKey}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const body = {
      contents: [{
        parts: [{ text: envelope.promptText }]
      }],
      systemInstruction: envelope.systemInstructions ? {
        parts: [{ text: envelope.systemInstructions }]
      } : undefined,
      generationConfig: {
        temperature: envelope.policy.temperature,
        maxOutputTokens: envelope.policy.maxTokens
      }
    };

    const response = await this.transportClient.post(url, headers, body, 15000, signal);

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationException(response.data?.error?.message || 'Invalid API Key');
    }
    if (response.status === 429) {
      throw new ProviderRateLimitException(response.data?.error?.message || 'Rate limit limit reached');
    }
    if (response.status === 400) {
      throw new InvalidRequestException(response.data?.error?.message || 'Bad Request payload');
    }
    if (response.status !== 200) {
      throw new ProviderNetworkException(`Gemini API returned status code ${response.status}`);
    }

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new InvalidRequestException('Gemini API returned zero response candidates.');
    }

    const firstCandidate = candidates[0];
    const stopReasonRaw = firstCandidate.finishReason;
    let stopReason: 'stop' | 'length' | 'content_filter' | 'other' = 'other';

    if (stopReasonRaw === 'STOP') {
      stopReason = 'stop';
    } else if (stopReasonRaw === 'MAX_TOKENS') {
      stopReason = 'length';
    } else if (stopReasonRaw === 'SAFETY') {
      stopReason = 'content_filter';
    }

    const textContent = firstCandidate.content?.parts?.[0]?.text || '';
    const inputTokens = response.data?.usageMetadata?.promptTokenCount || this.tokenizer.countTokens(envelope.promptText);
    const outputTokens = response.data?.usageMetadata?.candidatesTokenCount || this.tokenizer.countTokens(textContent);

    return {
      text: textContent,
      stopReason,
      tokenUsage: {
        inputTokens,
        outputTokens
      },
      providerId: this.providerId,
      metadata: {
        requestId: response.headers['x-goog-correlation-id'] || `req-gemini-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    };
  }
}
