/**
 * BECC v2 — Environment-Backed Secret Provider Adapter (GAP-PROD-007)
 *
 * Implements ISecretProvider reading from process.env or an injected dictionary.
 * Fails closed on missing or empty sensitive values.
 * Strictly guarantees that secret names may be logged, but secret values are NEVER logged or leaked.
 */

import { ISecretProvider, SecretValidationError } from './secret-provider.port.js';

export class EnvironmentSecretProvider implements ISecretProvider {
  private readonly env: Record<string, string | undefined>;

  constructor(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
    this.env = { ...env };
  }

  public getOptionalSecret(name: string): string | undefined {
    const raw = this.env[name];
    if (raw === undefined || raw.trim() === '') {
      return undefined;
    }
    return raw;
  }

  public getRequiredSecret(name: string, description?: string): string {
    const val = this.getOptionalSecret(name);
    if (!val) {
      const desc = description ? ` (${description})` : '';
      throw new SecretValidationError(
        `Required secret '${name}'${desc} is missing or empty. Startup aborted.`,
        [name]
      );
    }
    return val;
  }

  public hasSecret(name: string): boolean {
    return this.getOptionalSecret(name) !== undefined;
  }

  public validateRequiredSecrets(requiredNames: string[]): void {
    const missing: string[] = [];
    for (const name of requiredNames) {
      if (!this.hasSecret(name)) {
        missing.push(name);
      }
    }

    if (missing.length > 0) {
      throw new SecretValidationError(
        `Required secrets missing or empty: ${missing.map((n) => `'${n}'`).join(', ')}. Startup aborted.`,
        missing
      );
    }
  }
}
