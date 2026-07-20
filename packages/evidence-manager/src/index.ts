/**
 * @file index.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Aggregate, Evidence Lifecycle, Evidence Provenance
 */

// Export Domain Types & Value Objects
export {
  EvidenceId,
  AssessmentId,
  EvidenceChecksum,
  Timestamp,
  EvidenceStatus,
  EvidenceCategory,
  EvidenceType,
  type EvidenceSource,
  type EvidenceMetadata,
  type TraceabilityReference,
  type EvidenceTransitionRecord,
  type EvidenceReference,
  type EvidenceBundle,
} from './domain/types.js';

// Export Domain Aggregate
export { Evidence, type EvidenceProps } from './domain/evidence.aggregate.js';

// Export Application Service & Factory
export { EvidenceService, createEvidenceService } from './application/evidence-service.js';

// Export Contracts
export {
  type EvidenceSubmissionModel,
  type EvidenceIngestionReceiptModel,
} from './contracts/evidence.contract.js';

// Export Validation
export { EvidenceValidator } from './validation/evidence-validator.js';

// Export Events
export {
  type BaseEvidenceEvent,
  type EvidenceSubmittedEvent,
  type EvidenceValidatedEvent,
  type EvidenceAcceptedEvent,
  type EvidenceReferencedEvent,
  type EvidenceArchivedEvent,
  type EvidenceDomainEvent,
} from './events/evidence.events.js';

// Export Errors
export {
  EvidenceManagerError,
  EvidenceValidationError,
  EvidenceIntegrityError,
  InvalidEvidenceTransitionError,
  DuplicateEvidenceError,
  EvidenceTraceabilityError,
  EvidenceContractViolation,
  EvidenceNotFoundError,
} from './errors/evidence.errors.js';

// Export Serialization
export { EvidenceSerializer, type SerializedEvidencePayload } from './serialization/evidence-serializer.js';

// Export Traceability
export { EvidenceTraceabilityManager } from './traceability/evidence-traceability.js';
