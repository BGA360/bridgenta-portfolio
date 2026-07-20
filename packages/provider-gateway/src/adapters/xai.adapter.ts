/**
 * @file xai.adapter.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept xAI Provider Adapter
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

export class XAIAdapter implements AIProvider {
  public readonly providerType = ProviderType.XAI;
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
      ProviderCapability.STREAMING,
      ProviderCapability.REASONING_SUPPORT,
    ]);
  }

  public healthCheck(): ProviderHealth {
    return {
      status: 'HEALTHY',
      latency_ms: 35,
      last_checked: Timestamp.create(),
    };
  }

  public submitRequest(request: AIRequest): AIResponse {
    this.ensureConnected();
    const rawMock = {
      choices: [{ message: { content: `[xAI grok-2 Response]: ${request.prompt.user_input}` }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 14, completion_tokens: 24, total_tokens: 38 },
      model: 'grok-2',
    };
    return this.normalizeResponse(rawMock, request);
  }

  public normalizeResponse(rawResponse: unknown, request: AIRequest): AIResponse {
    const raw = rawResponse as any;
    return {
      response_id: ResponseId.create(`resp-xai-${Date.now()}`),
      request_id: request.request_id,
      provider_type: ProviderType.XAI,
      completion: {
        content: raw.choices?.[0]?.message?.content || 'No content',
        finish_reason: 'stop',
      },
      usage: {
        prompt_tokens: raw.usage?.prompt_tokens || 0,
        completion_tokens: raw.usage?.completion_tokens || 0,
        total_tokens: raw.usage?.total_tokens || 0,
      },
      metadata: {
        name: 'xAI Provider Adapter',
        version: '1.0.0',
        model_name: raw.model || 'grok-2',
        max_tokens: 131072,
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
      throw new ProviderConnectionError('Adapter is not connected.', ProviderType.XAI);
    }
  }
}
