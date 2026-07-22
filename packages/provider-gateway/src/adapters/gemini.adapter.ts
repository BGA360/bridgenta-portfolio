/**
 * @file gemini.adapter.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept Google Gemini Provider Adapter
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

export class GoogleGeminiAdapter implements AIProvider {
  public readonly providerType = ProviderType.GOOGLE_GEMINI;
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
      ProviderCapability.FUNCTION_CALLING,
      ProviderCapability.EMBEDDINGS,
    ]);
  }

  public healthCheck(): ProviderHealth {
    return {
      status: 'HEALTHY',
      latency_ms: 20,
      last_checked: Timestamp.create(),
    };
  }

  public submitRequest(request: AIRequest): AIResponse {
    this.ensureConnected();
    const rawMock = {
      candidates: [{ content: { parts: [{ text: `[Google Gemini Response]: ${request.prompt.user_input}` }] }, finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 22, totalTokenCount: 34 },
      modelVersion: 'gemini-1.5-pro',
    };
    return this.normalizeResponse(rawMock, request);
  }

  public normalizeResponse(rawResponse: unknown, request: AIRequest): AIResponse {
    const raw = rawResponse as any;
    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text || 'No content';
    return {
      response_id: ResponseId.create(`resp-gemini-${Date.now()}`),
      request_id: request.request_id,
      provider_type: ProviderType.GOOGLE_GEMINI,
      completion: {
        content: text,
        finish_reason: 'stop',
      },
      usage: {
        prompt_tokens: raw.usageMetadata?.promptTokenCount || 0,
        completion_tokens: raw.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: raw.usageMetadata?.totalTokenCount || 0,
      },
      metadata: {
        name: 'Google Gemini Provider Adapter',
        version: '1.0.0',
        model_name: raw.modelVersion || 'gemini-1.5-pro',
        max_tokens: 1000000,
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
      throw new ProviderConnectionError('Adapter is not connected.', ProviderType.GOOGLE_GEMINI);
    }
  }
}
