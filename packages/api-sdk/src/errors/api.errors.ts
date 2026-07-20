/**
 * @file api.errors.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Platform API & SDK Error Model
 */

export abstract class PlatformAPIError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class APIValidationError extends PlatformAPIError {
  public readonly code = 'ERR-API-001';
  constructor(message: string) {
    super(`API Request Validation Error: ${message}`);
  }
}

export class APIExecutionError extends PlatformAPIError {
  public readonly code = 'ERR-API-002';
  constructor(message: string, public readonly executionId?: string) {
    super(`API Execution Error: ${message}`);
  }
}

export class APIContractViolation extends PlatformAPIError {
  public readonly code = 'ERR-API-003';
  constructor(message: string, public readonly contractId: string = 'CTR-009') {
    super(message);
  }
}

export class APIGatewayError extends PlatformAPIError {
  public readonly code = 'ERR-API-004';
  constructor(message: string, public readonly gatewayType?: string) {
    super(`Gateway Error: ${message}`);
  }
}

export class APICertificationError extends PlatformAPIError {
  public readonly code = 'ERR-API-005';
  constructor(message: string) {
    super(`Certification Error: ${message}`);
  }
}

export class PlatformUnavailableError extends PlatformAPIError {
  public readonly code = 'ERR-API-006';
  constructor(message: string = 'CEP Platform runtime is unavailable.') {
    super(message);
  }
}

export class APIErrorTranslator {
  public static translate(error: unknown): PlatformAPIError {
    if (error instanceof PlatformAPIError) {
      return error;
    }
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('ERR-ORC') || msg.includes('ERR-ASS')) {
      return new APIExecutionError(msg);
    }
    if (msg.includes('ERR-REP') || msg.includes('ERR-PRV')) {
      return new APIGatewayError(msg);
    }
    if (msg.includes('ERR-CRT')) {
      return new APICertificationError(msg);
    }
    return new APIExecutionError(msg);
  }
}
