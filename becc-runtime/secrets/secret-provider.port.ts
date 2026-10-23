/**
 * BECC v2 — Secret Provider Port & Validation Contracts (GAP-PROD-007)
 *
 * Defines the provider-neutral abstraction separating how code asks for secrets
 * from where secrets come from (environment variables, local secure store,
 * or future remote cloud vaults).
 *
 * Guarantees:
 * - Fail closed on missing required secrets.
 * - Strict prohibition of silent defaults for sensitive values.
 * - Zero secret value leakage in error messages or diagnostic traces.
 */

export class SecretValidationError extends Error {
  public readonly code = 'SECRET_VALIDATION_ERROR';
  public readonly missingSecretNames: readonly string[];

  constructor(message: string, missingSecretNames: string[] = []) {
    super(message);
    this.name = 'SecretValidationError';
    this.missingSecretNames = Object.freeze([...missingSecretNames]);
  }
}

export interface ISecretProvider {
  /**
   * Returns the secret value if present and non-empty, otherwise undefined.
   * Does not throw if missing.
   */
  getOptionalSecret(name: string): string | undefined;

  /**
   * Returns the secret value.
   * Throws SecretValidationError if missing or empty.
   * Error message MUST NOT contain secret values.
   */
  getRequiredSecret(name: string, description?: string): string;

  /**
   * Returns true if the secret is present and non-empty.
   */
  hasSecret(name: string): boolean;

  /**
   * Validates that all named secrets are present and non-empty.
   * Throws SecretValidationError listing all missing names if any are absent.
   */
  validateRequiredSecrets(requiredNames: string[]): void;
}
