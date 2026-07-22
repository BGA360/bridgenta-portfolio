/**
 * @file index.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept AI Provider Abstraction and Integration
 */

// Export Domain Types & Models
export {
  ProviderId,
  RequestId,
  ResponseId,
  Timestamp,
  ProviderType,
  ProviderCapability,
  type PromptPayload,
  type AIRequest,
  type CompletionPayload,
  type TokenUsage,
  type ProviderMetadata,
  type ProviderHealth,
  type ProviderReference,
  type TraceabilityReference,
  type AIResponse,
} from './domain/types.js';

// Export Common Provider Interface
export { type AIProvider } from './providers/provider.interface.js';

// Export Adapters
export { OpenAIAdapter } from './adapters/openai.adapter.js';
export { AnthropicAdapter } from './adapters/anthropic.adapter.js';
export { GoogleGeminiAdapter } from './adapters/gemini.adapter.js';
export { XAIAdapter } from './adapters/xai.adapter.js';
export { OllamaAdapter } from './adapters/ollama.adapter.js';

// Export Normalization & Validation
export { RequestNormalizer, ResponseNormalizer } from './normalization/normalizer.js';
export { RequestValidator, ResponseValidator } from './validation/validator.js';

// Export Contracts
export {
  type AIRequestSubmissionModel,
  type AIResponseResultModel,
  type ProviderCapabilityQueryModel,
} from './contracts/provider.contract.js';

// Export Errors
export {
  AIProviderGatewayError,
  ProviderConnectionError,
  ProviderUnavailableError,
  RequestValidationError,
  ProviderContractViolation,
  ResponseNormalizationError,
  AdapterRegistrationError,
} from './errors/provider.errors.js';

// Export Events
export {
  type BaseProviderEvent,
  type ProviderRegisteredEvent,
  type ProviderConnectedEvent,
  type RequestSubmittedEvent,
  type ResponseReceivedEvent,
  type ProviderDisconnectedEvent,
  type ProviderGatewayDomainEvent,
} from './events/provider.events.js';

// Export Gateway Service & Factory
export {
  AIProviderGatewayService,
  createAIProviderGatewayService,
} from './gateway/provider-gateway.js';

// Export Traceability
export { ProviderTraceabilityManager } from './traceability/provider-traceability.js';
