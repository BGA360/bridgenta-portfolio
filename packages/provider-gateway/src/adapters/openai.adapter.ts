/**
 * @file openai.adapter.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept OpenAI Provider Adapter
 */

import {
  ProviderType,
  ProviderCapability,
  ProviderHealth,
  AIRequest,
  AIResponse,
  ResponseId,
  Timestamp,
} from '../domain/types.js';
import { AIProvider } from '../providers/provider.interface.js';
import { ProviderConnectionError } from '../errors/provider.errors.js';
import { ProviderTraceabilityManager } from '../traceability/provider-traceability.js';

export class OpenAIAdapter implements AIProvider {
  public readonly providerType = ProviderType.OPENAI;
  private _connected = false;

  public connect(): boolean {
    this._connected = true;
    return true;
  }

  public disconnect(): void {
    this._connected = false;
  }

  public getCapabilities(): readonly ProviderCapability[] {
    return Object.freeze([
      ProviderCapability.CHAT_COMPLETION,
      ProviderCapability.STRUCTURED_OUTPUT,
      ProviderCapability.STREAMING,
      ProviderCapability.TOOL_CALLING,
      ProviderCapability.IMAGE_GENERATION,
      ProviderCapability.REASONING_SUPPORT,
      ProviderCapability.FUNCTION_CALLING,
      ProviderCapability.EMBEDDINGS,
    ]);
  }

  public healthCheck(): ProviderHealth {
    return {
      status: 'HEALTHY',
      latency_ms: 25,
      last_checked: Timestamp.create(),
    };
  }

  public submitRequest(request: AIRequest): AIResponse {
    this.ensureConnected();
    const rawMock = {
      choices: [{ message: { content: `[OpenAI gpt-4o Response]: ${request.prompt.user_input}` }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 15, completion_tokens: 25, total_tokens: 40 },
      model: 'gpt-4o',
    };
    return this.normalizeResponse(rawMock, request);
  }

  public normalizeResponse(rawResponse: unknown, request: AIRequest): AIResponse {
    const raw = rawResponse as any;
    return {
      response_id: ResponseId.create(`resp-openai-${Date.now()}`),
      request_id: request.request_id,
      provider_type: ProviderType.OPENAI,
      completion: {
        content: raw.choices?.[0]?.message?.content || 'No content',
        finish_reason: raw.choices?.[0]?.finish_reason || 'stop',
      },
      usage: {
        prompt_tokens: raw.usage?.prompt_tokens || 0,
        completion_tokens: raw.usage?.completion_tokens || 0,
        total_tokens: raw.usage?.total_tokens || 0,
      },
      metadata: {
        name: 'OpenAI Provider Adapter',
        version: '1.0.0',
        model_name: raw.model || 'gpt-4o',
        max_tokens: 128000,
      },
      traceability: ProviderTraceabilityManager.createReference(),
      created_at: Timestamp.create(),
    };
  }

  public isConnected(): boolean {
    return this._connected;
  }

  private ensureConnected(): void {
    if (!this._connected) {
      throw new ProviderConnectionError('Adapter is not connected.', ProviderType.OPENAI);
    }
  }
}
