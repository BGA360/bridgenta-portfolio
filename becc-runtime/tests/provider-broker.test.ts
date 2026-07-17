import test from 'node:test';
import assert from 'node:assert';
import { ProviderBrokerService } from '../broker/provider-broker.service.js';
import { ProviderRegistryService } from '../broker/provider-registry.service.js';
import {
  ConfigurationConflictException,
  NoCompatibleProviderException,
  NoEligibleProviderException,
  ProviderDisabledException
} from '../broker/exceptions.js';
import { IProviderBrokerConfig } from '../broker/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';

// Base mock configuration
const createMockConfig = (): IProviderBrokerConfig => ({
  registrations: [
    {
      providerId: 'provider-cloud-a',
      label: 'Cloud Provider A',
      enabled: true,
      category: 'cloud',
      capabilities: {
        maxContextTokens: 4096,
        supportsSystemInstructions: true,
        supportsTools: true
      },
      supportedSchemaVersions: ['2.0.0']
    },
    {
      providerId: 'provider-local-b',
      label: 'Local Provider B',
      enabled: true,
      category: 'local',
      capabilities: {
        maxContextTokens: 2048,
        supportsSystemInstructions: false,
        supportsTools: false
      },
      supportedSchemaVersions: ['2.0.0'],
      fallbackProviderId: 'provider-cloud-a'
    }
  ],
  selectionPriority: {
    'provider-cloud-a': 10,
    'provider-local-b': 5
  },
  defaultProviderId: 'provider-cloud-a',
  environment: 'test'
});

// Base mock knowledge bundle
const createMockBundle = (sizeBytes = 1024): IKnowledgeBundle => ({
  sessionId: 'test-sess-123',
  schemaVersion: '2.0.0',
  rules: [],
  vocabulary: [],
  resolutionEvidence: [],
  obligations: [],
  integrity: {
    bundleHash: 'a'.repeat(64) // Valid SHA-256 string
  },
  buildMetadata: {
    timestamp: new Date().toISOString(),
    ruleCount: 0,
    sizeBytes,
    environment: 'test'
  }
});

// ==========================================
// 1. REGISTRY VALIDATION TESTS
// ==========================================

test('WP-008: Registry - Valid configuration initialization', () => {
  const config = createMockConfig();
  const registry = new ProviderRegistryService(config);
  assert.strictEqual(registry.getDefaultProviderId(), 'provider-cloud-a');
  assert.strictEqual(registry.getAllRegistrations().length, 2);
  assert.strictEqual(registry.getSelectionPriority('provider-cloud-a'), 10);
});

test('WP-008: Registry - Fails on duplicate provider ID', () => {
  const config = createMockConfig();
  const regDup = { ...config.registrations[0] };
  (config as any).registrations = [config.registrations[0], regDup];

  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on empty provider ID', () => {
  const config = createMockConfig();
  (config.registrations[0] as any).providerId = '';
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on invalid default provider ID', () => {
  const config = createMockConfig();
  (config as any).defaultProviderId = 'non-existent-provider';
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on disabled default provider', () => {
  const config = createMockConfig();
  (config.registrations[0] as any).enabled = false; // default provider is provider-cloud-a
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on missing priority value', () => {
  const config = createMockConfig();
  delete (config.selectionPriority as any)['provider-local-b'];
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on invalid schema semver format', () => {
  const config = createMockConfig();
  (config.registrations[0] as any).supportedSchemaVersions = ['invalid-semver'];
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on prohibited credential fields', () => {
  const config = createMockConfig();
  (config.registrations[0] as any).apiKey = 'secret-key-123';
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on cycle fallback chain', () => {
  const config = createMockConfig();
  // Create cycle: local-b -> cloud-a -> local-b
  (config.registrations[0] as any).fallbackProviderId = 'provider-local-b';
  (config.registrations[1] as any).fallbackProviderId = 'provider-cloud-a';
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

test('WP-008: Registry - Fails on unsupported category', () => {
  const config = createMockConfig();
  (config.registrations[0] as any).category = 'unsupported-cat';
  assert.throws(() => {
    new ProviderRegistryService(config);
  }, ConfigurationConflictException);
});

// ==========================================
// 2. BUNDLE COMPATIBILITY TESTS
// ==========================================

test('WP-008: Bundle - Fails on unsupported schema version', () => {
  const registry = new ProviderRegistryService(createMockConfig());
  const bundle = createMockBundle();
  (bundle as any).schemaVersion = '9.9.9'; // No provider supports this

  const broker = new ProviderBrokerService();
  assert.throws(() => {
    broker.route(bundle, registry);
  }, NoCompatibleProviderException);
});

test('WP-008: Bundle - Fails on missing integrity metadata', () => {
  const registry = new ProviderRegistryService(createMockConfig());
  const bundle = createMockBundle();
  delete (bundle as any).integrity;

  const broker = new ProviderBrokerService();
  assert.throws(() => {
    broker.route(bundle, registry);
  }, Error);
});

test('WP-008: Bundle - Fails on malformed bundleHash', () => {
  const registry = new ProviderRegistryService(createMockConfig());
  const bundle = createMockBundle();
  (bundle as any).integrity = { bundleHash: 'too-short-hash' };

  const broker = new ProviderBrokerService();
  assert.throws(() => {
    broker.route(bundle, registry);
  }, Error);
});

// ==========================================
// 3. ELIGIBILITY & SELECTION TESTS
// ==========================================

test('WP-008: Selection - Selects enabled compatible provider', () => {
  const registry = new ProviderRegistryService(createMockConfig());
  const bundle = createMockBundle();
  const broker = new ProviderBrokerService();

  const result = broker.route(bundle, registry);
  assert.strictEqual(result.selectedProviderId, 'provider-cloud-a');
  assert.strictEqual(result.fallbackApplied, false);
});

test('WP-008: Selection - Fails when all compatible providers are disabled', () => {
  const config = createMockConfig();
  // Add a provider that supports "3.0.0" but is disabled
  (config.registrations as any).push({
    providerId: 'provider-disabled-3',
    label: 'Disabled 3.0.0 Provider',
    enabled: false,
    category: 'cloud',
    capabilities: {
      maxContextTokens: 4096,
      supportsSystemInstructions: true,
      supportsTools: true
    },
    supportedSchemaVersions: ['3.0.0']
  });
  // Make sure selectionPriority has it
  (config.selectionPriority as any)['provider-disabled-3'] = 1;

  const registry = new ProviderRegistryService(config);
  const bundle = createMockBundle();
  (bundle as any).schemaVersion = '3.0.0';
  const broker = new ProviderBrokerService();

  assert.throws(() => {
    broker.route(bundle, registry);
  }, NoEligibleProviderException);
});

test('WP-008: Selection - Respects preference if eligible', () => {
  const registry = new ProviderRegistryService(createMockConfig());
  const bundle = createMockBundle();
  const broker = new ProviderBrokerService();

  const result = broker.route(bundle, registry, 'provider-local-b');
  assert.strictEqual(result.selectedProviderId, 'provider-local-b');
  
  // Verify trace entry
  const tracePreference = result.selectionTrace.find(t => t.type === 'preference_applied');
  assert.ok(tracePreference);
  assert.strictEqual(tracePreference.providerId, 'provider-local-b');
});

test('WP-008: Selection - Fails on preference when target is disabled', () => {
  const config = createMockConfig();
  (config.registrations[1] as any).enabled = false; // Disable local-b
  const registry = new ProviderRegistryService(config);
  const bundle = createMockBundle();
  const broker = new ProviderBrokerService();

  assert.throws(() => {
    broker.route(bundle, registry, 'provider-local-b');
  }, ProviderDisabledException);
});

test('WP-008: Selection - Deterministic tie-breaking alphabetically', () => {
  const config = createMockConfig();
  // Equal priority weights
  (config.selectionPriority as any)['provider-cloud-a'] = 10;
  (config.selectionPriority as any)['provider-local-b'] = 10;
  const registry = new ProviderRegistryService(config);
  const bundle = createMockBundle();
  const broker = new ProviderBrokerService();

  const result = broker.route(bundle, registry);
  // provider-cloud-a alphabetical compare first
  assert.strictEqual(result.selectedProviderId, 'provider-cloud-a');
});

test('WP-008: Selection - Repeated identical calls produce same result', () => {
  const registry = new ProviderRegistryService(createMockConfig());
  const bundle = createMockBundle();
  const broker = new ProviderBrokerService();

  const res1 = broker.route(bundle, registry);
  const res2 = broker.route(bundle, registry);
  assert.strictEqual(res1.selectedProviderId, res2.selectedProviderId);
  assert.strictEqual(res1.bundleHash, res2.bundleHash);
});

// ==========================================
// 4. IMMUTABILITY & SCOPE TESTS
// ==========================================

test('WP-008: Immutability - Selected result is frozen', () => {
  const registry = new ProviderRegistryService(createMockConfig());
  const bundle = createMockBundle();
  const broker = new ProviderBrokerService();

  const result = broker.route(bundle, registry);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.selectionTrace));
});

test('WP-008: Scope Protection - Pure execution assertions', () => {
  const config = createMockConfig();
  const registry = new ProviderRegistryService(config);
  const bundle = createMockBundle();
  const broker = new ProviderBrokerService();

  const result = broker.route(bundle, registry);
  
  // Assert no transport credentials or endpoints exist in trace/result
  const traceString = JSON.stringify(result);
  const prohibited = ['key', 'secret', 'token', 'url', 'http'];
  for (const word of prohibited) {
    assert.strictEqual(traceString.includes(word), false);
  }
});
