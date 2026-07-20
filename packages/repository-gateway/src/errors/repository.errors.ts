/**
 * @file repository.errors.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Repository Error Model
 */

export abstract class RepositoryGatewayError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RepositoryConnectionError extends RepositoryGatewayError {
  public readonly code = 'ERR-REP-001';
  constructor(message: string, public readonly uri: string) {
    super(`Connection failed to repository '${uri}': ${message}`);
  }
}

export class ProviderUnavailableError extends RepositoryGatewayError {
  public readonly code = 'ERR-REP-002';
  constructor(public readonly providerType: string) {
    super(`Repository provider '${providerType}' is unavailable or unregistered.`);
  }
}

export class RepositoryNotFoundError extends RepositoryGatewayError {
  public readonly code = 'ERR-REP-003';
  constructor(public readonly repositoryId: string) {
    super(`Repository '${repositoryId}' was not found.`);
  }
}

export class RepositoryContractViolation extends RepositoryGatewayError {
  public readonly code = 'ERR-REP-004';
  constructor(message: string, public readonly contractId: string = 'CTR-007') {
    super(message);
  }
}

export class RepositoryNormalizationError extends RepositoryGatewayError {
  public readonly code = 'ERR-REP-005';
  constructor(message: string) {
    super(`Repository normalization error: ${message}`);
  }
}

export class AdapterRegistrationError extends RepositoryGatewayError {
  public readonly code = 'ERR-REP-006';
  constructor(message: string) {
    super(message);
  }
}
