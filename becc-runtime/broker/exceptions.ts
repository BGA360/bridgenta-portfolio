export class NoCompatibleProviderException extends Error {
  public readonly code = 'NO_COMPATIBLE_PROVIDER';

  constructor(schemaVersion: string) {
    super(`No registered provider supports the required bundle schema version: ${schemaVersion}`);
    this.name = 'NoCompatibleProviderException';
  }
}

export class NoEligibleProviderException extends Error {
  public readonly code = 'NO_ELIGIBLE_PROVIDER';

  constructor(reason: string) {
    super(`No eligible provider is available: ${reason}`);
    this.name = 'NoEligibleProviderException';
  }
}

export class ProviderDisabledException extends Error {
  public readonly code = 'PROVIDER_DISABLED';

  constructor(providerId: string) {
    super(`The requested provider is disabled: ${providerId}`);
    this.name = 'ProviderDisabledException';
  }
}

export class ConfigurationConflictException extends Error {
  public readonly code = 'CONFIGURATION_CONFLICT';

  constructor(reason: string) {
    super(`Configuration conflict detected in provider registry: ${reason}`);
    this.name = 'ConfigurationConflictException';
  }
}
