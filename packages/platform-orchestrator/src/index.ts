/**
 * @file index.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Platform Integration and Pipeline Orchestration
 */

// Export Domain Types & Enums
export {
  ExecutionId,
  CorrelationId,
  Timestamp,
  PipelineStage,
  PipelineStatus,
  type AssessmentSummary,
  type EvidenceSummary,
  type RuleSummary,
  type PolicySummary,
  type CertificationSummary,
  type ExecutionSummary,
  type TraceabilityReference,
} from './domain/types.js';

// Export Context
export { ExecutionContext, type ExecutionContextProps } from './context/execution-context.js';

// Export Errors
export {
  PlatformOrchestratorError,
  PipelineExecutionError,
  StageExecutionError,
  ModuleUnavailableError,
  DependencyViolationError,
  PipelineTimeoutError,
  OrchestrationContractViolation,
} from './errors/orchestration.errors.js';

// Export Events
export {
  type BaseOrchestrationEvent,
  type PipelineStartedEvent,
  type StageCompletedEvent,
  type StageFailedEvent,
  type PipelineCompletedEvent,
  type PipelineAbortedEvent,
  type OrchestrationDomainEvent,
} from './events/orchestration.events.js';

// Export Workflow Engine & Service
export { PipelineEngine, type PipelineExecutionConfig } from './workflow/pipeline.js';
export {
  PlatformOrchestratorService,
  createPlatformOrchestratorService,
} from './application/orchestrator-service.js';

// Export Traceability
export { OrchestrationTraceabilityManager } from './traceability/orchestration-traceability.js';
