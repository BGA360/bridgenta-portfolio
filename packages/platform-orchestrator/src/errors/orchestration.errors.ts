/**
 * @file orchestration.errors.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Orchestration Error Model
 */

export abstract class PlatformOrchestratorError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PipelineExecutionError extends PlatformOrchestratorError {
  public readonly code = 'ERR-ORC-001';
  constructor(message: string, public readonly executionId: string) {
    super(message);
  }
}

export class StageExecutionError extends PlatformOrchestratorError {
  public readonly code = 'ERR-ORC-002';
  constructor(message: string, public readonly stage: string) {
    super(`Stage execution failed at '${stage}': ${message}`);
  }
}

export class ModuleUnavailableError extends PlatformOrchestratorError {
  public readonly code = 'ERR-ORC-003';
  constructor(public readonly moduleName: string) {
    super(`Required platform module '${moduleName}' is unavailable.`);
  }
}

export class DependencyViolationError extends PlatformOrchestratorError {
  public readonly code = 'ERR-ORC-004';
  constructor(message: string) {
    super(message);
  }
}

export class PipelineTimeoutError extends PlatformOrchestratorError {
  public readonly code = 'ERR-ORC-005';
  constructor(message: string = 'Pipeline execution timed out.') {
    super(message);
  }
}

export class OrchestrationContractViolation extends PlatformOrchestratorError {
  public readonly code = 'ERR-ORC-006';
  constructor(message: string, public readonly contractId: string = 'CTR-006') {
    super(message);
  }
}
