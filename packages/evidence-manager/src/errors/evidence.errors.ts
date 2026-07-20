/**
 * @file evidence.errors.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Error Model
 */

/**
 * Base conceptual error for @cep/evidence-manager.
 */
export abstract class EvidenceManagerError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Raised when Evidence metadata or payload validation fails (ERR-EVI-001).
 */
export class EvidenceValidationError extends EvidenceManagerError {
  public readonly code = 'ERR-EVI-001';
  constructor(message: string, public readonly validationErrors: readonly string[] = []) {
    super(message);
  }
}

/**
 * Raised when evidence SHA-256 checksum fails verification or is tampered (ERR-EVI-002).
 */
export class EvidenceIntegrityError extends EvidenceManagerError {
  public readonly code = 'ERR-EVI-002';
  constructor(message: string, public readonly evidenceId?: string) {
    super(message);
  }
}

/**
 * Raised when an illegal evidence state transition is attempted (ERR-EVI-003).
 */
export class InvalidEvidenceTransitionError extends EvidenceManagerError {
  public readonly code = 'ERR-EVI-003';
  constructor(
    public readonly currentStatus: string,
    public readonly attemptedStatus: string,
    message?: string
  ) {
    super(
      message ||
        `Illegal evidence state transition from '${currentStatus}' to '${attemptedStatus}'.`
    );
  }
}

/**
 * Raised when a duplicate Evidence ID is ingested (ERR-EVI-004).
 */
export class DuplicateEvidenceError extends EvidenceManagerError {
  public readonly code = 'ERR-EVI-004';
  constructor(public readonly evidenceId: string) {
    super(`Evidence with ID '${evidenceId}' already exists.`);
  }
}

/**
 * Raised when constitutional traceability reference is missing or invalid (ERR-EVI-005).
 */
export class EvidenceTraceabilityError extends EvidenceManagerError {
  public readonly code = 'ERR-EVI-005';
  constructor(message: string) {
    super(message);
  }
}

/**
 * Raised when Evidence submission contract bounds are violated (ERR-EVI-006).
 */
export class EvidenceContractViolation extends EvidenceManagerError {
  public readonly code = 'ERR-EVI-006';
  constructor(message: string, public readonly contractId: string = 'CTR-002') {
    super(message);
  }
}

/**
 * Raised when requested Evidence item is not found.
 */
export class EvidenceNotFoundError extends EvidenceManagerError {
  public readonly code = 'ERR-EVI-007';
  constructor(public readonly evidenceId: string) {
    super(`Evidence item with ID '${evidenceId}' was not found.`);
  }
}
