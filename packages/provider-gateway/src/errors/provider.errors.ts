/**
 * @file provider.errors.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept AI Provider Error Model
 */

export abstract class AIProviderGatewayError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProviderConnectionError extends AIProviderGatewayError {
  public readonly code = 'ERR-PRV-001';
  constructor(message: string, public readonly providerType: string) {
    super(`Connection failed to AI Provider '${providerType}': ${message}`);
  }
}

export class ProviderUnavailableError extends AIProviderGatewayError {
  public readonly code = 'ERR-PRV-002';
  constructor(public readonly providerType: string) {
    super(`AI Provider '${providerType}' is unavailable or unregistered.`);
  }
}

export class RequestValidationError extends AIProviderGatewayError {
  public readonly code = 'ERR-PRV-003';
  constructor(message: string) {
    super(`Invalid AI Request payload: ${message}`);
  }
}

export class ProviderContractViolation extends AIProviderGatewayError {
  public readonly code = 'ERR-PRV-004';
  constructor(message: string, public readonly contractId: string = 'CTR-008') {
    super(message);
  }
}

export class ResponseNormalizationError extends AIProviderGatewayError {
  public readonly code = 'ERR-PRV-005';
  constructor(message: string) {
    super(`Response normalization failed: ${message}`);
  }
}

export class AdapterRegistrationError extends AIProviderGatewayError {
  public readonly code = 'ERR-PRV-006';
  constructor(message: string) {
    super(message);
  }
}
