/**
 * @file index.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Engine, Attestation, Trust Layer
 */

// Export Domain Types & Enums
export {
  CertificationId,
  Timestamp,
  CertificationStatus,
  CertificationLevel,
  CertificationType,
  type CertificationMetadata,
  type CertificationRecord,
  type CertificationResult,
  type CertificationReference,
  type CertificationVersion,
  type TraceabilityReference,
  type CertificationTransitionRecord,
} from './domain/types.js';

// Export Domain Aggregate Root
export { Certification, type CertificationProps } from './domain/certification.aggregate.js';

// Export Application Service & Factory
export {
  CertificationEngineService,
  createCertificationEngineService,
} from './application/certification-service.js';

// Export Contracts
export {
  type CertificationIssuanceRequestModel,
  type CertificationIssuanceResultModel,
  type CertificationVerificationModel,
} from './contracts/certification.contract.js';

// Export Validation
export { CertificationValidator } from './validation/certification-validator.js';

// Export Errors
export {
  CertificationEngineError,
  CertificationValidationError,
  CertificationIssuanceError,
  UnknownCertificationError,
  DuplicateCertificationError,
  CertificationTraceabilityError,
  CertificationContractViolation,
  CertificationNotFoundError,
} from './errors/certification.errors.js';

// Export Events
export {
  type BaseCertificationEvent,
  type CertificationIssuedEvent,
  type CertificationVerifiedEvent,
  type CertificationActivatedEvent,
  type CertificationRevokedEvent,
  type CertificationArchivedEvent,
  type CertificationDomainEvent,
} from './events/certification.events.js';

// Export Serializer
export { CertificationSerializer, type CanonicalCertificationDto } from './serialization/certification-serializer.js';

// Export Traceability
export { CertificationTraceabilityManager } from './traceability/certification-traceability.js';
