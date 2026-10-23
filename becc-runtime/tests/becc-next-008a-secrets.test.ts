/**
 * BECC v2 — BECC-NEXT-008A Secret-Management Abstraction Test Suite (GAP-PROD-007)
 *
 * Verifies:
 * - Provider-neutral secret provider interface contracts
 * - Fail-closed behavior on missing or empty required secrets
 * - Zero secret value leakage in error messages or diagnostic traces
 * - Decoupling configuration loader from raw process.env
 * - Optional secret handling without throwing
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  EnvironmentSecretProvider,
  SecretValidationError,
  ISecretProvider
} from '../secrets/index.js';
import { loadDeployedConfig, ConfigurationError } from '../config/index.js';

describe('BECC-NEXT-008A: Secret-Management Abstraction (GAP-PROD-007)', () => {
  it('retrieves required secret successfully when present', () => {
    const provider = new EnvironmentSecretProvider({
      TEST_SECRET: 'super_secret_value_123'
    });

    const val = provider.getRequiredSecret('TEST_SECRET');
    assert.strictEqual(val, 'super_secret_value_123');
    assert.strictEqual(provider.hasSecret('TEST_SECRET'), true);
  });

  it('fails closed when required secret is missing', () => {
    const provider = new EnvironmentSecretProvider({});

    assert.throws(
      () => provider.getRequiredSecret('DATABASE_PASSWORD', 'Production DB'),
      (err: any) => {
        assert.ok(err instanceof SecretValidationError);
        assert.strictEqual(err.code, 'SECRET_VALIDATION_ERROR');
        assert.deepStrictEqual(err.missingSecretNames, ['DATABASE_PASSWORD']);
        assert.ok(err.message.includes('DATABASE_PASSWORD'));
        return true;
      }
    );
  });

  it('fails closed when required secret is empty or whitespace', () => {
    const provider = new EnvironmentSecretProvider({
      EMPTY_SECRET: '   '
    });

    assert.throws(
      () => provider.getRequiredSecret('EMPTY_SECRET'),
      (err: any) => {
        assert.ok(err instanceof SecretValidationError);
        assert.deepStrictEqual(err.missingSecretNames, ['EMPTY_SECRET']);
        return true;
      }
    );
  });

  it('returns undefined for optional secret when absent without throwing', () => {
    const provider = new EnvironmentSecretProvider({});
    const val = provider.getOptionalSecret('OPTIONAL_TOKEN');
    assert.strictEqual(val, undefined);
    assert.strictEqual(provider.hasSecret('OPTIONAL_TOKEN'), false);
  });

  it('validates multiple required secrets and lists all missing names without leaking values', () => {
    const provider = new EnvironmentSecretProvider({
      SECRET_A: 'val_a'
    });

    assert.throws(
      () => provider.validateRequiredSecrets(['SECRET_A', 'SECRET_B', 'SECRET_C']),
      (err: any) => {
        assert.ok(err instanceof SecretValidationError);
        assert.deepStrictEqual(err.missingSecretNames, ['SECRET_B', 'SECRET_C']);
        assert.ok(err.message.includes('SECRET_B'));
        assert.ok(err.message.includes('SECRET_C'));
        assert.ok(!err.message.includes('val_a')); // Does not leak existing secret
        return true;
      }
    );
  });

  it('integrates custom ISecretProvider into loadDeployedConfig', () => {
    const mockProvider: ISecretProvider = {
      getOptionalSecret: (name: string) => (name === 'PGPASSWORD' ? 'injected_db_pass' : undefined),
      getRequiredSecret: (name: string) => {
        if (name === 'PGPASSWORD') return 'injected_db_pass';
        throw new SecretValidationError(`Missing ${name}`);
      },
      hasSecret: (name: string) => name === 'PGPASSWORD',
      validateRequiredSecrets: () => {}
    };

    const env = {
      BECC_STORAGE_TYPE: 'postgres',
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGDATABASE: 'testdb',
      PGUSER: 'becc_app'
    };

    const config = loadDeployedConfig(env, mockProvider);
    assert.strictEqual(config.storageType, 'postgres');
    assert.strictEqual(config.postgres?.password, 'injected_db_pass');
  });
});
