/**
 * @file rule.errors.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Error Model
 */

export abstract class RuleEngineError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RuleValidationError extends RuleEngineError {
  public readonly code = 'ERR-RUL-001';
  constructor(message: string, public readonly validationErrors: readonly string[] = []) {
    super(message);
  }
}

export class RuleExecutionError extends RuleEngineError {
  public readonly code = 'ERR-RUL-002';
  constructor(message: string, public readonly ruleId?: string) {
    super(message);
  }
}

export class UnknownRuleError extends RuleEngineError {
  public readonly code = 'ERR-RUL-003';
  constructor(public readonly ruleId: string) {
    super(`Unknown or unregistered rule ID '${ruleId}'.`);
  }
}

export class DuplicateRuleError extends RuleEngineError {
  public readonly code = 'ERR-RUL-004';
  constructor(public readonly ruleId: string) {
    super(`Rule with ID '${ruleId}' is already registered.`);
  }
}

export class FindingGenerationError extends RuleEngineError {
  public readonly code = 'ERR-RUL-005';
  constructor(message: string) {
    super(message);
  }
}

export class RuleContractViolation extends RuleEngineError {
  public readonly code = 'ERR-RUL-006';
  constructor(message: string, public readonly contractId: string = 'CTR-003') {
    super(message);
  }
}

export class RuleNotFoundError extends RuleEngineError {
  public readonly code = 'ERR-RUL-007';
  constructor(public readonly ruleId: string) {
    super(`Rule with ID '${ruleId}' was not found.`);
  }
}
