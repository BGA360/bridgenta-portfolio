/**
 * BECC v2 — Deployed Configuration Loader Test Suite
 *
 * Verifies fail-closed environment parsing, strict validation of storage types,
 * PostgreSQL configuration attributes, SSL options, and strict credential non-leakage.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  loadDeployedConfig,
  parsePgSsl,
  toAuditLedgerConfig,
  ConfigurationError
} from '../config/index.js';

describe('Deployed Configuration Loader', () => {
  describe('parsePgSsl', () => {
    it('returns undefined for undefined or empty string', () => {
      assert.strictEqual(parsePgSsl(undefined), undefined);
      assert.strictEqual(parsePgSsl(''), undefined);
      assert.strictEqual(parsePgSsl('   '), undefined);
    });

    it('parses valid truthy SSL values', () => {
      assert.strictEqual(parsePgSsl('true'), true);
      assert.strictEqual(parsePgSsl('TRUE'), true);
      assert.strictEqual(parsePgSsl(' require '), true);
      assert.strictEqual(parsePgSsl('REQUIRE'), true);
    });

    it('parses valid falsy SSL values', () => {
      assert.strictEqual(parsePgSsl('false'), false);
      assert.strictEqual(parsePgSsl('FALSE'), false);
      assert.strictEqual(parsePgSsl(' disable '), false);
      assert.strictEqual(parsePgSsl('DISABLE'), false);
    });

    it('throws ConfigurationError on invalid SSL values', () => {
      assert.throws(
        () => parsePgSsl('prefer'),
        (err: any) => err instanceof ConfigurationError && err.message.includes("Invalid PGSSL value 'prefer'")
      );
      assert.throws(
        () => parsePgSsl('yes'),
        (err: any) => err instanceof ConfigurationError && err.message.includes("Invalid PGSSL value 'yes'")
      );
      assert.throws(
        () => parsePgSsl('1'),
        (err: any) => err instanceof ConfigurationError && err.message.includes("Invalid PGSSL value '1'")
      );
    });
  });

  describe('loadDeployedConfig', () => {
    it('fails closed when BECC_STORAGE_TYPE is missing or whitespace', () => {
      assert.throws(
        () => loadDeployedConfig({}),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes('Missing required environment variable BECC_STORAGE_TYPE')
      );
      assert.throws(
        () => loadDeployedConfig({ BECC_STORAGE_TYPE: '  ' }),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes('Missing required environment variable BECC_STORAGE_TYPE')
      );
    });

    it('fails closed when BECC_STORAGE_TYPE is unsupported', () => {
      assert.throws(
        () => loadDeployedConfig({ BECC_STORAGE_TYPE: 'sqlite' }),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes("Unsupported BECC_STORAGE_TYPE 'sqlite'")
      );
      assert.throws(
        () => loadDeployedConfig({ BECC_STORAGE_TYPE: 'redis' }),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes("Unsupported BECC_STORAGE_TYPE 'redis'")
      );
    });

    it('loads in-memory configuration successfully', () => {
      const config1 = loadDeployedConfig({ BECC_STORAGE_TYPE: 'in-memory' });
      assert.strictEqual(config1.storageType, 'in-memory');
      assert.strictEqual(config1.postgres, undefined);

      const config2 = loadDeployedConfig({ BECC_STORAGE_TYPE: ' IN-MEMORY ' });
      assert.strictEqual(config2.storageType, 'in-memory');
    });

    it('fails closed when PGHOST is missing or empty in postgres mode', () => {
      assert.throws(
        () =>
          loadDeployedConfig({
            BECC_STORAGE_TYPE: 'postgres',
            PGPORT: '5432',
            PGDATABASE: 'testdb',
            PGUSER: 'testuser'
          }),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes('Missing or empty required environment variable PGHOST')
      );
    });

    it('fails closed when PGPORT is missing, empty, or invalid in postgres mode', () => {
      assert.throws(
        () =>
          loadDeployedConfig({
            BECC_STORAGE_TYPE: 'postgres',
            PGHOST: 'localhost',
            PGDATABASE: 'testdb',
            PGUSER: 'testuser'
          }),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes('Missing or empty required environment variable PGPORT')
      );

      const invalidPorts = ['0', '-1', '65536', 'abc', '5432.5', '99999'];
      for (const invalidPort of invalidPorts) {
        assert.throws(
          () =>
            loadDeployedConfig({
              BECC_STORAGE_TYPE: 'postgres',
              PGHOST: 'localhost',
              PGPORT: invalidPort,
              PGDATABASE: 'testdb',
              PGUSER: 'testuser'
            }),
          (err: any) =>
            err instanceof ConfigurationError &&
            err.message.includes(`Invalid PGPORT '${invalidPort}'`),
          `Expected invalid port ${invalidPort} to fail validation`
        );
      }
    });

    it('fails closed when PGDATABASE is missing or empty in postgres mode', () => {
      assert.throws(
        () =>
          loadDeployedConfig({
            BECC_STORAGE_TYPE: 'postgres',
            PGHOST: 'localhost',
            PGPORT: '5432',
            PGUSER: 'testuser'
          }),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes('Missing or empty required environment variable PGDATABASE')
      );
    });

    it('fails closed when PGUSER is missing or empty in postgres mode', () => {
      assert.throws(
        () =>
          loadDeployedConfig({
            BECC_STORAGE_TYPE: 'postgres',
            PGHOST: 'localhost',
            PGPORT: '5432',
            PGDATABASE: 'testdb'
          }),
        (err: any) =>
          err instanceof ConfigurationError &&
          err.message.includes('Missing or empty required environment variable PGUSER')
      );
    });

    it('loads valid postgres configuration with password and ssl', () => {
      const config = loadDeployedConfig({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: 'db.example.internal',
        PGPORT: '5432',
        PGDATABASE: 'becc_production',
        PGUSER: 'becc_app',
        PGPASSWORD: 'super-secret-password-123!',
        PGSSL: 'require'
      });

      assert.strictEqual(config.storageType, 'postgres');
      assert.ok(config.postgres);
      assert.strictEqual(config.postgres.host, 'db.example.internal');
      assert.strictEqual(config.postgres.port, 5432);
      assert.strictEqual(config.postgres.database, 'becc_production');
      assert.strictEqual(config.postgres.user, 'becc_app');
      assert.strictEqual(config.postgres.password, 'super-secret-password-123!');
      assert.strictEqual(config.postgres.ssl, true);
    });

    it('loads valid postgres configuration without password and without ssl', () => {
      const config = loadDeployedConfig({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: '127.0.0.1',
        PGPORT: '5433',
        PGDATABASE: 'becc_dev',
        PGUSER: 'dev_user'
      });

      assert.strictEqual(config.storageType, 'postgres');
      assert.ok(config.postgres);
      assert.strictEqual(config.postgres.host, '127.0.0.1');
      assert.strictEqual(config.postgres.port, 5433);
      assert.strictEqual(config.postgres.database, 'becc_dev');
      assert.strictEqual(config.postgres.user, 'dev_user');
      assert.strictEqual(config.postgres.password, undefined);
      assert.strictEqual(config.postgres.ssl, undefined);
    });

    it('strictly guarantees no password leakage in ConfigurationError messages', () => {
      const secretPassword = 'SUPER_CONFIDENTIAL_PASSWORD_9988';
      try {
        loadDeployedConfig({
          BECC_STORAGE_TYPE: 'postgres',
          PGHOST: 'localhost',
          PGPORT: 'invalid_port',
          PGDATABASE: 'becc_test',
          PGUSER: 'test_user',
          PGPASSWORD: secretPassword,
          PGSSL: 'invalid_ssl'
        });
        assert.fail('Expected loadDeployedConfig to throw ConfigurationError');
      } catch (err: any) {
        assert.ok(err instanceof ConfigurationError);
        assert.ok(
          !err.message.includes(secretPassword),
          'ConfigurationError message must never contain the password'
        );
      }
    });
  });

  describe('toAuditLedgerConfig', () => {
    it('converts in-memory deployed config', () => {
      const ledgerConfig = toAuditLedgerConfig({ storageType: 'in-memory' });
      assert.deepStrictEqual(ledgerConfig, { storageType: 'in-memory' });
    });

    it('converts postgres deployed config', () => {
      const ledgerConfig = toAuditLedgerConfig({
        storageType: 'postgres',
        postgres: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          user: 'testuser',
          password: 'secret_pw',
          ssl: false
        }
      });

      assert.deepStrictEqual(ledgerConfig, {
        storageType: 'postgres',
        postgres: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          user: 'testuser',
          password: 'secret_pw',
          ssl: false
        }
      });
    });
  });
});
