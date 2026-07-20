/**
 * @file assessment.errors.ts
 * @module @cep/assessment-core
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-001 (Assessment Contract)
 * @domainConcept Assessment Error Model
 */

/**
 * Base conceptual error class for @cep/assessment-core.
 */
export abstract class AssessmentCoreError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Raised when an Assessment Request payload fails validation (ERR-VAL-001).
 */
export class ValidationError extends AssessmentCoreError {
  public readonly code = 'ERR-VAL-001';

  constructor(message: string, public readonly validationErrors: string[] = []) {
    super(message);
  }
}

/**
 * Raised when an illegal state machine transition is attempted.
 */
export class StateTransitionError extends AssessmentCoreError {
  public readonly code = 'ERR-CNC-004';

  constructor(
    public readonly currentState: string,
    public readonly attemptedState: string,
    message?: string
  ) {
    super(
      message ||
        `Illegal assessment state transition from '${currentState}' to '${attemptedState}'.`
    );
  }
}

/**
 * Raised when a contract violation or invariant fails (ERR-CTR-005).
 */
export class ContractViolationError extends AssessmentCoreError {
  public readonly code = 'ERR-CTR-005';

  constructor(message: string, public readonly contractId: string = 'CTR-001') {
    super(message);
  }
}

/**
 * Raised when an assessment ID is not found.
 */
export class AssessmentNotFoundError extends AssessmentCoreError {
  public readonly code = 'ERR-CNC-002';

  constructor(public readonly assessmentId: string) {
    super(`Assessment with ID '${assessmentId}' was not found.`);
  }
}
