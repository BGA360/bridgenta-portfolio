import { IProviderBrokerConfig, IProviderRegistration } from './types.js';
import { ConfigurationConflictException } from './exceptions.js';

export class ProviderRegistryService {
  private readonly registrations: Map<string, IProviderRegistration> = new Map();
  private readonly config: IProviderBrokerConfig;

  constructor(config: IProviderBrokerConfig) {
    if (!config) {
      throw new ConfigurationConflictException('Configuration cannot be null or undefined.');
    }
    this.config = config;
    this.validateAndLoad(config);
  }

  private validateAndLoad(config: IProviderBrokerConfig): void {
    if (!config.registrations || !Array.isArray(config.registrations)) {
      throw new ConfigurationConflictException('Registrations list must be a valid array.');
    }

    const seenIds = new Set<string>();

    for (const reg of config.registrations) {
      if (!reg.providerId || reg.providerId.trim() === '') {
        throw new ConfigurationConflictException('Provider ID must not be empty.');
      }
      if (seenIds.has(reg.providerId)) {
        throw new ConfigurationConflictException(`Duplicate providerId detected: ${reg.providerId}`);
      }
      seenIds.add(reg.providerId);

      // Structural integrity
      if (!reg.label || reg.label.trim() === '') {
        throw new ConfigurationConflictException(`Provider ${reg.providerId} has an empty label.`);
      }
      if (!reg.category || !['cloud', 'local', 'internal', 'constitutional'].includes(reg.category)) {
        throw new ConfigurationConflictException(`Provider ${reg.providerId} has an unsupported category: ${reg.category}`);
      }
      if (!reg.capabilities) {
        throw new ConfigurationConflictException(`Provider ${reg.providerId} is missing capabilities.`);
      }
      if (typeof reg.capabilities.maxContextTokens !== 'number' || reg.capabilities.maxContextTokens <= 0) {
        throw new ConfigurationConflictException(`Provider ${reg.providerId} has invalid maxContextTokens.`);
      }
      if (!reg.supportedSchemaVersions || !Array.isArray(reg.supportedSchemaVersions) || reg.supportedSchemaVersions.length === 0) {
        throw new ConfigurationConflictException(`Provider ${reg.providerId} must support at least one schema version.`);
      }

      // Check valid schema semver strings
      const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
      for (const ver of reg.supportedSchemaVersions) {
        if (!semverRegex.test(ver)) {
          throw new ConfigurationConflictException(`Provider ${reg.providerId} declares invalid schema version format: ${ver}`);
        }
      }

      // Prohibited transport/credential checks
      const allowedKeys = [
        'providerId', 'label', 'enabled', 'category', 'capabilities',
        'supportedSchemaVersions', 'fallbackProviderId', 'maxContextTokens',
        'supportsSystemInstructions', 'supportsTools'
      ];
      const keys = Object.keys(reg) as string[];
      const prohibitedWords = ['key', 'secret', 'token', 'password', 'url', 'endpoint', 'credential', 'auth'];
      for (const k of keys) {
        if (allowedKeys.includes(k)) continue;
        if (prohibitedWords.some(word => k.toLowerCase().includes(word))) {
          throw new ConfigurationConflictException(`Provider ${reg.providerId} contains unauthorized transport/credential field: ${k}`);
        }
      }

      const capKeys = Object.keys(reg.capabilities);
      for (const ck of capKeys) {
        if (allowedKeys.includes(ck)) continue;
        if (prohibitedWords.some(word => ck.toLowerCase().includes(word))) {
          throw new ConfigurationConflictException(`Provider ${reg.providerId} capabilities contain unauthorized transport/credential field: ${ck}`);
        }
      }

      this.registrations.set(reg.providerId, Object.freeze({
        ...reg,
        capabilities: Object.freeze({ ...reg.capabilities }),
        supportedSchemaVersions: Object.freeze([...reg.supportedSchemaVersions])
      }));
    }

    // Default provider validation
    if (!config.defaultProviderId || config.defaultProviderId.trim() === '') {
      throw new ConfigurationConflictException('Default provider ID is required.');
    }
    const defaultReg = this.registrations.get(config.defaultProviderId);
    if (!defaultReg) {
      throw new ConfigurationConflictException(`Default provider ID ${config.defaultProviderId} does not match any registered provider.`);
    }
    if (!defaultReg.enabled) {
      throw new ConfigurationConflictException(`Default provider ID ${config.defaultProviderId} refers to a disabled provider.`);
    }

    // selectionPriority validation
    if (!config.selectionPriority) {
      throw new ConfigurationConflictException('selectionPriority configuration is required.');
    }
    for (const id of seenIds) {
      const priority = config.selectionPriority[id];
      if (priority === undefined || typeof priority !== 'number') {
        throw new ConfigurationConflictException(`Provider ${id} is missing a valid numeric selectionPriority.`);
      }
    }

    // Validate fallbacks (existence & cycle checks)
    for (const reg of config.registrations) {
      if (reg.fallbackProviderId) {
        if (!seenIds.has(reg.fallbackProviderId)) {
          throw new ConfigurationConflictException(`Provider ${reg.providerId} fallback references unknown provider: ${reg.fallbackProviderId}`);
        }
        if (reg.fallbackProviderId === reg.providerId) {
          throw new ConfigurationConflictException(`Provider ${reg.providerId} has self-referential fallback.`);
        }
        
        let slow: string | undefined = reg.fallbackProviderId;
        let fast: string | undefined = this.registrations.get(reg.fallbackProviderId)?.fallbackProviderId;
        while (fast) {
          if (slow === fast) {
            throw new ConfigurationConflictException(`Cyclic fallback chain detected starting at provider: ${reg.providerId}`);
          }
          slow = slow ? this.registrations.get(slow)?.fallbackProviderId : undefined;
          const nextFast = this.registrations.get(fast)?.fallbackProviderId;
          fast = nextFast ? this.registrations.get(nextFast)?.fallbackProviderId : undefined;
        }
      }
    }
  }

  public getRegistration(providerId: string): IProviderRegistration | undefined {
    return this.registrations.get(providerId);
  }

  public getAllRegistrations(): readonly IProviderRegistration[] {
    return Object.freeze(Array.from(this.registrations.values()));
  }

  public getSelectionPriority(providerId: string): number {
    return this.config.selectionPriority[providerId] ?? 0;
  }

  public getDefaultProviderId(): string {
    return this.config.defaultProviderId;
  }
}
