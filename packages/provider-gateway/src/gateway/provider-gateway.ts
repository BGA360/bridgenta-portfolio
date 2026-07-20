/**
 * @file provider-gateway.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept AI Provider Gateway Central Service
 */

import {
  ProviderType,
  ProviderCapability,
  AIResponse,
  Timestamp,
  RequestId,
} from '../domain/types.js';
import { AIProvider } from '../providers/provider.interface.js';
import { OpenAIAdapter } from '../adapters/openai.adapter.js';
import { AnthropicAdapter } from '../adapters/anthropic.adapter.js';
import { GoogleGeminiAdapter } from '../adapters/gemini.adapter.js';
import { XAIAdapter } from '../adapters/xai.adapter.js';
import { OllamaAdapter } from '../adapters/ollama.adapter.js';
import { RequestNormalizer, ResponseNormalizer } from '../normalization/normalizer.js';
import { RequestValidator, ResponseValidator } from '../validation/validator.js';
import {
  AIRequestSubmissionModel,
  AIResponseResultModel,
  ProviderCapabilityQueryModel,
} from '../contracts/provider.contract.js';
import { ProviderUnavailableError } from '../errors/provider.errors.js';
import {
  ProviderGatewayDomainEvent,
  ProviderRegisteredEvent,
  ProviderConnectedEvent,
  RequestSubmittedEvent,
  ResponseReceivedEvent,
  ProviderDisconnectedEvent,
} from '../events/provider.events.js';

export class AIProviderGatewayService {
  private readonly adapterFactories = new Map<ProviderType, () => AIProvider>();
  private readonly activeAdapters = new Map<ProviderType, AIProvider>();
  private readonly events: ProviderGatewayDomainEvent[] = [];

  constructor() {
    // Register default initial adapters
    this.registerAdapter(ProviderType.OPENAI, () => new OpenAIAdapter());
    this.registerAdapter(ProviderType.ANTHROPIC, () => new AnthropicAdapter());
    this.registerAdapter(ProviderType.GOOGLE_GEMINI, () => new GoogleGeminiAdapter());
    this.registerAdapter(ProviderType.XAI, () => new XAIAdapter());
    this.registerAdapter(ProviderType.OLLAMA, () => new OllamaAdapter());
  }

  /**
   * Registers a provider adapter factory and records registration event.
   */
  public registerAdapter(
    providerType: ProviderType,
    factory: () => AIProvider
  ): void {
    this.adapterFactories.set(providerType, factory);
    const instance = factory();

    const regEvent: ProviderRegisteredEvent = {
      event_id: `evt-${Date.now()}-reg-${providerType}`,
      event_name: 'ProviderRegistered',
      provider_type: providerType,
      capabilities: instance.getCapabilities(),
      timestamp: Timestamp.create(),
    };
    this.events.push(regEvent);
  }

  /**
   * Returns list of registered provider types supporting a given capability.
   */
  public getAvailableProvidersForCapability(capability: ProviderCapability): ProviderType[] {
    const matching: ProviderType[] = [];
    for (const [providerType, factory] of this.adapterFactories.entries()) {
      const adapter = factory();
      if (adapter.getCapabilities().includes(capability)) {
        matching.push(providerType);
      }
    }
    return matching;
  }

  /**
   * Queries provider capability details.
   */
  public queryProviderCapabilities(providerType: ProviderType): ProviderCapabilityQueryModel {
    const adapter = this.getOrCreateAdapter(providerType);
    const health = adapter.healthCheck();
    return {
      provider_type: providerType,
      supported_capabilities: [...adapter.getCapabilities()],
      is_healthy: health.status === 'HEALTHY',
    };
  }

  /**
   * Submits a canonical AI request and returns a normalized response.
   */
  public executeAIRequest(submission: AIRequestSubmissionModel): {
    response: AIResponse;
    resultModel: AIResponseResultModel;
  } {
    const adapter = this.getOrCreateAdapter(submission.provider_type);

    if (!adapter.isConnected()) {
      adapter.connect();
      const connEvent: ProviderConnectedEvent = {
        event_id: `evt-${Date.now()}-conn`,
        event_name: 'ProviderConnected',
        provider_type: submission.provider_type,
        status: adapter.healthCheck().status,
        timestamp: Timestamp.create(),
      };
      this.events.push(connEvent);
    }

    const reqId = RequestId.create(`req-ai-${Date.now()}`);
    const requestModel = RequestNormalizer.normalize({
      request_id: reqId,
      provider_type: submission.provider_type,
      capability: submission.capability,
      prompt: {
        system_instruction: submission.system_instruction,
        user_input: submission.user_input,
        context: submission.context,
      },
    });

    RequestValidator.validate(requestModel);

    const reqEvent: RequestSubmittedEvent = {
      event_id: `evt-${Date.now()}-sub`,
      event_name: 'RequestSubmitted',
      provider_type: submission.provider_type,
      request_id: reqId,
      capability: submission.capability,
      timestamp: Timestamp.create(),
    };
    this.events.push(reqEvent);

    const response = adapter.submitRequest(requestModel);
    ResponseValidator.validate(response);
    ResponseNormalizer.validate(response);

    const respEvent: ResponseReceivedEvent = {
      event_id: `evt-${Date.now()}-resp`,
      event_name: 'ResponseReceived',
      provider_type: submission.provider_type,
      response_id: response.response_id,
      request_id: response.request_id,
      total_tokens: response.usage.total_tokens,
      timestamp: Timestamp.create(),
    };
    this.events.push(respEvent);

    const resultModel: AIResponseResultModel = {
      response_id: response.response_id,
      request_id: response.request_id,
      provider_type: response.provider_type,
      content: response.completion.content,
      finish_reason: response.completion.finish_reason,
      total_tokens: response.usage.total_tokens,
      model_name: response.metadata.model_name,
      created_at: response.created_at,
    };

    return { response, resultModel };
  }

  /**
   * Disconnects a provider adapter.
   */
  public disconnectProvider(providerType: ProviderType): void {
    const adapter = this.activeAdapters.get(providerType);
    if (adapter) {
      adapter.disconnect();
      this.activeAdapters.delete(providerType);

      const discEvent: ProviderDisconnectedEvent = {
        event_id: `evt-${Date.now()}-disc`,
        event_name: 'ProviderDisconnected',
        provider_type: providerType,
        timestamp: Timestamp.create(),
      };
      this.events.push(discEvent);
    }
  }

  /**
   * Returns read-only array of emitted domain events.
   */
  public getEvents(): readonly ProviderGatewayDomainEvent[] {
    return Object.freeze([...this.events]);
  }

  private getOrCreateAdapter(providerType: ProviderType): AIProvider {
    let adapter = this.activeAdapters.get(providerType);
    if (!adapter) {
      const factory = this.adapterFactories.get(providerType);
      if (!factory) {
        throw new ProviderUnavailableError(providerType);
      }
      adapter = factory();
      this.activeAdapters.set(providerType, adapter);
    }
    return adapter;
  }
}

export function createAIProviderGatewayService(): AIProviderGatewayService {
  return new AIProviderGatewayService();
}
