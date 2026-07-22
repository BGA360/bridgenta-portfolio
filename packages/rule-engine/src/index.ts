/**
 * @file index.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Engine, Finding Generation, Deterministic Evaluation
 */

// Export Domain Types & Enums
export {
  RuleId,
  FindingId,
  Timestamp,
  RuleCategory,
  RuleSeverity,
  RuleStatus,
  type RuleMetadata,
  type TraceabilityReference,
  type RuleResult,
  type Finding,
  type EvaluationTrace,
  type RuleEvaluation,
} from './domain/types.js';

// Export Domain Aggregate Root & Evaluator
export { Rule, type RuleProps, type RuleEvaluationFn } from './domain/rule.aggregate.js';
export { PureRuleEvaluator, type EvaluationOutcome } from './evaluation/evaluator.js';

// Export Application Service & Factory
export { RuleEngineService, createRuleEngineService } from './application/rule-engine-service.js';

// Export Contracts
export {
  type RuleEvaluationRequestModel,
  type RuleEvaluationResultModel,
} from './contracts/rule.contract.js';

// Export Validation
export { RuleValidator } from './validation/rule-validator.js';

// Export Events
export {
  type BaseRuleEvent,
  type RuleRegisteredEvent,
  type RuleEvaluatedEvent,
  type FindingGeneratedEvent,
  type RuleArchivedEvent,
  type RuleDomainEvent,
} from './events/rule.events.js';

// Export Errors
export {
  RuleEngineError,
  RuleValidationError,
  RuleExecutionError,
  UnknownRuleError,
  DuplicateRuleError,
  FindingGenerationError,
  RuleContractViolation,
  RuleNotFoundError,
} from './errors/rule.errors.js';

// Export Traceability
export { RuleTraceabilityManager } from './traceability/rule-traceability.js';
