/**
 * @file index.ts
 * @module @cep/assessment-core
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-001 (Assessment Contract)
 * @domainConcept Assessment, Assessment Orchestration
 */

// Export Models & Enums
export {
  AssessmentState,
  FindingSeverity,
  FindingStatus,
  type FindingModel,
  type AssessmentRequestModel,
  type AssessmentResultModel,
} from './models/assessment.types.js';

// Export Errors
export {
  AssessmentCoreError,
  ValidationError,
  StateTransitionError,
  ContractViolationError,
  AssessmentNotFoundError,
} from './errors/assessment.errors.js';

// Export Orchestrator Service & Factory
export {
  AssessmentOrchestrator,
  createAssessmentOrchestrator,
} from './services/assessment-orchestrator.js';
