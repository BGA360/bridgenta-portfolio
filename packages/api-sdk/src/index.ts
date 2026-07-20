/**
 * @file index.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Public Developer Interface and SDK
 */

// Export Domain Types & Models
export {
  APIVersion,
  ContractVersion,
  Timestamp,
  type APIVersionInfo,
  type AssessmentRequest,
  type EvidenceSubmissionRequest,
  type PipelineExecutionRequest,
  type CertificationRequest,
  type ProviderExecutionRequest,
  type AssessmentResponse,
  type EvidenceResponse,
  type CertificationResponse,
  type PipelineResponse,
  type ProviderResponse,
  type ExecutionStatusResponse,
  type TraceabilityReference,
} from './domain/types.js';

// Export Fluent Request Builders
export {
  PipelineRequestBuilder,
  AssessmentRequestBuilder,
  EvidenceRequestBuilder,
} from './builders/request-builders.js';

// Export Public API Interface
export { type PlatformAPI } from './api/platform-api.js';

// Export SDK Client & Factory
export { CEPClient, createCEPClient, type CEPClientConfig } from './sdk/cep-client.js';

// Export Contracts
export {
  type APIExecutionRequestModel,
  type APIExecutionResultModel,
  type APIVersionQueryResultModel,
} from './contracts/api.contract.js';

// Export Validators & Serializer
export { APIRequestValidator, APIResponseValidator } from './validation/validator.js';
export { APISerializer } from './serialization/serializer.js';

// Export Errors
export {
  PlatformAPIError,
  APIValidationError,
  APIExecutionError,
  APIContractViolation,
  APIGatewayError,
  APICertificationError,
  PlatformUnavailableError,
  APIErrorTranslator,
} from './errors/api.errors.js';

// Export Events
export {
  type BaseAPIEvent,
  type SDKInitializedEvent,
  type APIRequestReceivedEvent,
  type APIRequestValidatedEvent,
  type PipelineExecutionRequestedEvent,
  type APIResponseGeneratedEvent,
  type PlatformAPIDomainEvent,
} from './events/api.events.js';

// Export Traceability
export { APITraceabilityManager } from './traceability/api-traceability.js';
