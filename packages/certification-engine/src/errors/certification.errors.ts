/**
 * @file certification.errors.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Error Model
 */

export abstract class CertificationEngineError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CertificationValidationError extends CertificationEngineError {
  public readonly code = 'ERR-CRT-001';
  constructor(message: string, public readonly validationErrors: readonly string[] = []) {
    super(message);
  }
}

export class CertificationIssuanceError extends CertificationEngineError {
  public readonly code = 'ERR-CRT-002';
  constructor(message: string) {
    super(message);
  }
}

export class UnknownCertificationError extends CertificationEngineError {
  public readonly code = 'ERR-CRT-003';
  constructor(public readonly certificationId: string) {
    super(`Unknown or unregistered certification ID '${certificationId}'.`);
  }
}

export class DuplicateCertificationError extends CertificationEngineError {
  public readonly code = 'ERR-CRT-004';
  constructor(public readonly certificationId: string) {
    super(`Certification with ID '${certificationId}' already exists.`);
  }
}

export class CertificationTraceabilityError extends CertificationEngineError {
  public readonly code = 'ERR-CRT-005';
  constructor(message: string) {
    super(message);
  }
}

export class CertificationContractViolation extends CertificationEngineError {
  public readonly code = 'ERR-CRT-006';
  constructor(message: string, public readonly contractId: string = 'CTR-005') {
    super(message);
  }
}

export class CertificationNotFoundError extends CertificationEngineError {
  public readonly code = 'ERR-CRT-007';
  constructor(public readonly certificationId: string) {
    super(`Certification with ID '${certificationId}' was not found.`);
  }
}
