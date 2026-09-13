/**
 * Classifies internal runtime error categories.
 * Distinct from domain RefusalCodeEnum values.
 */
export type RuntimeErrorCategory =
  | 'CONFIGURATION_ERROR'
  | 'INVARIANT_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'UNSUPPORTED_OPERATION';

/**
 * Base error representation for internal Governed Learning runtime execution failures.
 */
export class GovernedLearningRuntimeError extends Error {
  readonly category: RuntimeErrorCategory;
  readonly isInternal: boolean;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    message: string,
    category: RuntimeErrorCategory,
    isInternal: boolean = true,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(message);
    this.name = 'GovernedLearningRuntimeError';
    this.category = category;
    this.isInternal = isInternal;
    this.details = details;

    // Restore prototype chain for ES5/ES6 compatibility
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when runtime configuration or startup options are invalid or missing.
 */
export class RuntimeConfigurationError extends GovernedLearningRuntimeError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'CONFIGURATION_ERROR', true, details);
    this.name = 'RuntimeConfigurationError';
  }
}

/**
 * Thrown when an internal runtime execution invariant is violated.
 */
export class RuntimeInvariantError extends GovernedLearningRuntimeError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'INVARIANT_ERROR', true, details);
    this.name = 'RuntimeInvariantError';
  }
}

/**
 * Thrown when a required runtime dependency is unavailable or uninitialized.
 */
export class RuntimeDependencyError extends GovernedLearningRuntimeError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'DEPENDENCY_ERROR', true, details);
    this.name = 'RuntimeDependencyError';
  }
}

/**
 * Thrown when a requested runtime operation is not supported by the current wave.
 */
export class RuntimeUnsupportedOperationError extends GovernedLearningRuntimeError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message, 'UNSUPPORTED_OPERATION', true, details);
    this.name = 'RuntimeUnsupportedOperationError';
  }
}
