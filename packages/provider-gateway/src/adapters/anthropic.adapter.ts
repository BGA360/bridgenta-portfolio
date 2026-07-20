/**
 * @file anthropic.adapter.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept Anthropic Provider Adapter
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

export class AnthropicAdapter implements AIProvider {
  public readonly providerType = ProviderType.ANTHROPIC;
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
      ProviderCapability.REASONING_SUPPORT,
    ]);
  }

  public healthCheck(): ProviderHealth {
    return {
      status: 'HEALTHY',
      latency_ms: 30,
      last_checked: Timestamp.create(),
    };
  }

  public submitRequest(request: AIRequest): AIResponse {
    this.ensureConnected();
    const rawMock = {
      content: [{ type: 'text', text: `[Anthropic claude-3-5-sonnet Response]: ${request.prompt.user_input}` }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 18, output_tokens: 28 },
      model: 'claude-3-5-sonnet-20241022',
    };
    return this.normalizeResponse(rawMock, request);
  }

  public normalizeResponse(rawResponse: unknown, request: AIRequest): AIResponse {
    const raw = rawResponse as any;
    const contentText = raw.content?.[0]?.text || 'No content';
    return {
      response_id: ResponseId.create(`resp-anthropic-${Date.now()}`),
      request_id: request.request_id,
      provider_type: ProviderType.ANTHROPIC,
      completion: {
        content: contentText,
        finish_reason: raw.stop_reason === 'end_turn' ? 'stop' : 'stop',
      },
      usage: {
        prompt_tokens: raw.usage?.input_tokens || 0,
        completion_tokens: raw.usage?.output_tokens || 0,
        total_tokens: (raw.usage?.input_tokens || 0) + (raw.usage?.output_tokens || 0),
      },
      metadata: {
        name: 'Anthropic Provider Adapter',
        version: '1.0.0',
        model_name: raw.model || 'claude-3-5-sonnet',
        max_tokens: 200000,
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
      throw new ProviderConnectionError('Adapter is not connected.', ProviderType.ANTHROPIC);
    }
  }
}
