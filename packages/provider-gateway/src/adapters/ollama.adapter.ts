/**
 * @file ollama.adapter.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept Ollama Provider Adapter
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

export class OllamaAdapter implements AIProvider {
  public readonly providerType = ProviderType.OLLAMA;
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
      ProviderCapability.EMBEDDINGS,
    ]);
  }

  public healthCheck(): ProviderHealth {
    return {
      status: 'HEALTHY',
      latency_ms: 10,
      last_checked: Timestamp.create(),
    };
  }

  public submitRequest(request: AIRequest): AIResponse {
    this.ensureConnected();
    const rawMock = {
      response: `[Ollama llama3 Response]: ${request.prompt.user_input}`,
      done: true,
      prompt_eval_count: 10,
      eval_count: 20,
      model: 'llama3:latest',
    };
    return this.normalizeResponse(rawMock, request);
  }

  public normalizeResponse(rawResponse: unknown, request: AIRequest): AIResponse {
    const raw = rawResponse as any;
    return {
      response_id: ResponseId.create(`resp-ollama-${Date.now()}`),
      request_id: request.request_id,
      provider_type: ProviderType.OLLAMA,
      completion: {
        content: raw.response || 'No content',
        finish_reason: raw.done ? 'stop' : 'stop',
      },
      usage: {
        prompt_tokens: raw.prompt_eval_count || 0,
        completion_tokens: raw.eval_count || 0,
        total_tokens: (raw.prompt_eval_count || 0) + (raw.eval_count || 0),
      },
      metadata: {
        name: 'Ollama Provider Adapter',
        version: '1.0.0',
        model_name: raw.model || 'llama3',
        max_tokens: 8192,
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
      throw new ProviderConnectionError('Adapter is not connected.', ProviderType.OLLAMA);
    }
  }
}
