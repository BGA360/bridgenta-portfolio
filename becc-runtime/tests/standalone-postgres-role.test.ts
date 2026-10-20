/**
 * BECC v2 — Standalone PostgreSQL CI Testbed & Least-Privilege Role Certification Suite
 *
 * Certifies BECC-NEXT-006B:
 * 1. Networked TCP PostgreSQL connection using 006A deployed configuration loader
 * 2. Separation of bootstrap/admin role from runtime application role (becc_app)
 * 3. Idempotent least-privilege role provisioning (01_provision_becc_app_role.sql)
 * 4. Database-enforced permission denials: SELECT/INSERT allowed; UPDATE, DELETE, TRUNCATE, DDL denied
 * 5. Cross-schema access denial (GL isolation)
 * 6. Standalone migration verification (autoMigrate: false succeeds, autoMigrate: true fails closed)
 * 7. Standalone health and readiness probe execution (becc health, becc ready)
 * 8. Zero secret leakage in diagnostics and telemetry
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import pkg from 'pg';
const { Pool } = pkg;
import EmbeddedPostgres from 'embedded-postgres';

import {
  PostgresBeccAuditLedger,
  BeccAuditRecord,
  BeccMigrationRunner,
  migration001
} from '../audit/index.js';
import { loadDeployedConfig, toAuditLedgerConfig } from '../config/index.js';
import { provisionBeccAppRole } from '../provisioning/index.js';
import { executeHealthProbe, executeReadinessProbe } from '../bin/becc.js';
import { stopEmbeddedPostgresFixture } from './fixtures/embedded-postgres-teardown.js';

describe('BECC-NEXT-006B — Standalone PostgreSQL CI Testbed & Least-Privilege Role Provisioning', () => {
  let isExternalStandalone = false;
  let pgServer: EmbeddedPostgres | undefined;
  let dbDataDir: string | undefined;

  let host: string;
  let port: number;
  let database: string;
  let adminUser: string;
  let adminPassword: string |undefined;
  const appRoleName = 'becc_app';
  const appRolePassword = 'test_app_secure_password_006b';

  let adminPool: pkg.Pool;
  let appPool: pkg.Pool;

  before(async () => {
    if (process.env.STANDALONE_PG_HOST) {
      // Connect to external networked standalone PostgreSQL service (e.g. GitHub Actions container)
      isExternalStandalone = true;
      host = process.env.STANDALONE_PG_HOST;
      port = parseInt(process.env.STANDALONE_PG_PORT || '5432', 10);
      database = process.env.STANDALONE_PG_DATABASE || 'becc_testdb';
      adminUser = process.env.STANDALONE_ADMIN_USER || 'postgres_admin';
      adminPassword = process.env.STANDALONE_ADMIN_PASSWORD || 'ephemeral_admin_password';
    } else {
      // Standalone TCP daemon fixture for local execution
      isExternalStandalone = false;
      host = '127.0.0.1';
      port = 5480 + Math.floor(Math.random() * 40);
      database = 'postgres';
      adminUser = 'postgres';
      adminPassword = 'password';

      dbDataDir = `./data/becc_standalone_pg_006b_${Date.now()}_${port}`;
      if (fs.existsSync(dbDataDir)) {
        fs.rmSync(dbDataDir, { recursive: true, force: true });
      }

      pgServer = new EmbeddedPostgres({
        port,
        databaseDir: dbDataDir,
        persistent: true
      });
      await pgServer.initialise();
      await pgServer.start();
    }

    // 1. Establish admin connection
    adminPool = new Pool({
      host,
      port,
      database,
      user: adminUser,
      password: adminPassword,
      ssl: false,
      max: 5
    });

    // 2. Admin performs initial schema setup & migrations
    const runner = new BeccMigrationRunner();
    await runner.run(adminPool);

    // 3. Admin creates isolated test schema for Governed Learning boundary check
    await adminPool.query('CREATE SCHEMA IF NOT EXISTS governed_learning;');
    await adminPool.query(`
      CREATE TABLE IF NOT EXISTS governed_learning.gl_protected_records (
        id VARCHAR(64) PRIMARY KEY,
        payload TEXT NOT NULL
      );
    `);
    await adminPool.query(`
      INSERT INTO governed_learning.gl_protected_records (id, payload)
      VALUES ('gl_001', 'confidential_gl_data')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Admin provisions the least-privilege application role (becc_app)
    await provisionBeccAppRole({
      host,
      port,
      database,
      adminUser,
      adminPassword,
      appRoleName,
      appRolePassword,
      ssl: false
    });

    // 5. Connect as the provisioned application role
    appPool = new Pool({
      host,
      port,
      database,
      user: appRoleName,
      password: appRolePassword,
      ssl: false,
      max: 5
    });
  });

  after(async () => {
    if (appPool) {
      await appPool.end().catch(() => {});
    }
    if (adminPool) {
      await adminPool.end().catch(() => {});
    }
    if (!isExternalStandalone && pgServer && dbDataDir) {
      await stopEmbeddedPostgresFixture(pgServer, dbDataDir);
    }
  });

  it('1. Role provisioning is idempotent on repeated execution', async () => {
    // Re-running provisioning against an already-provisioned database must succeed without errors
    const result = await provisionBeccAppRole({
      host,
      port,
      database,
      adminUser,
      adminPassword,
      appRoleName,
      appRolePassword,
      ssl: false
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.roleName, appRoleName);
    assert.strictEqual(result.database, database);
    assert.ok(result.occurredAt);
  });

  it('2. 006A Deployed Configuration Loader successfully parses and loads standalone config', () => {
    const rawEnv = {
      BECC_STORAGE_TYPE: 'postgres',
      PGHOST: host,
      PGPORT: String(port),
      PGDATABASE: database,
      PGUSER: appRoleName,
      PGPASSWORD: appRolePassword,
      PGSSL: 'disable'
    };

    const config = loadDeployedConfig(rawEnv);
    assert.strictEqual(config.storageType, 'postgres');
    assert.ok(config.postgres);
    assert.strictEqual(config.postgres.host, host);
    assert.strictEqual(config.postgres.port, port);
    assert.strictEqual(config.postgres.database, database);
    assert.strictEqual(config.postgres.user, appRoleName);
    assert.strictEqual(config.postgres.password, appRolePassword);
    assert.strictEqual(config.postgres.ssl, false);

    const ledgerConfig = toAuditLedgerConfig(config);
    assert.strictEqual(ledgerConfig.storageType, 'postgres');
  });

  it('3. Standalone TCP connection: becc_app connects over TCP and performs allowed INSERT & SELECT', async () => {
    const ledger = new PostgresBeccAuditLedger({
      pool: appPool,
      autoMigrate: false
    });
    await ledger.initialize();

    const recordId = `audit_tcp_standalone_${Date.now()}`;
    const testRecord: BeccAuditRecord = {
      auditRecordId: recordId,
      operationType: 'STANDALONE_CI_VERIFICATION',
      operationId: 'op_tcp_001',
      occurredAt: new Date().toISOString(),
      inputRefs: ['tcp_in_1'],
      evidenceRefs: ['tcp_ev_1'],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    // INSERT allowed
    await ledger.append(testRecord);

    // SELECT allowed
    const fetched = await ledger.getById(recordId);
    assert.ok(fetched);
    assert.strictEqual(fetched.auditRecordId, recordId);
    assert.strictEqual(fetched.operationType, 'STANDALONE_CI_VERIFICATION');
    assert.strictEqual(fetched.resultStatus, 'SUCCESS');
  });

  it('4. Least-privilege DB enforcement: UPDATE on audit records is denied at database engine level', async () => {
    const client = await appPool.connect();
    try {
      await assert.rejects(
        async () => {
          await client.query("UPDATE becc.becc_audit_records SET result_status = 'TAMPERED';");
        },
        (err: any) => err.code === '42501' // 42501 = insufficient_privilege
      );
    } finally {
      client.release();
    }
  });

  it('5. Least-privilege DB enforcement: DELETE on audit records is denied at database engine level', async () => {
    const client = await appPool.connect();
    try {
      await assert.rejects(
        async () => {
          await client.query("DELETE FROM becc.becc_audit_records;");
        },
        (err: any) => err.code === '42501'
      );
    } finally {
      client.release();
    }
  });

  it('6. Least-privilege DB enforcement: TRUNCATE on audit records is denied at database engine level', async () => {
    const client = await appPool.connect();
    try {
      await assert.rejects(
        async () => {
          await client.query("TRUNCATE TABLE becc.becc_audit_records;");
        },
        (err: any) => err.code === '42501'
      );
    } finally {
      client.release();
    }
  });

  it('7. Least-privilege DB enforcement: DDL (CREATE / ALTER / DROP) is denied at database engine level', async () => {
    const client = await appPool.connect();
    try {
      // CREATE TABLE denied
      await assert.rejects(
        async () => {
          await client.query("CREATE TABLE becc.unauthorized_tbl (id int);");
        },
        (err: any) => err.code === '42501'
      );

      // ALTER TABLE denied
      await assert.rejects(
        async () => {
          await client.query("ALTER TABLE becc.becc_audit_records ADD COLUMN unauthorized_col text;");
        },
        (err: any) => err.code === '42501'
      );

      // DROP TABLE denied
      await assert.rejects(
        async () => {
          await client.query("DROP TABLE becc.becc_audit_records;");
        },
        (err: any) => err.code === '42501'
      );
    } finally {
      client.release();
    }
  });

  it('8. Cross-schema access denial: becc_app cannot access or modify Governed Learning tables', async () => {
    const client = await appPool.connect();
    try {
      // SELECT from GL schema denied
      await assert.rejects(
        async () => {
          await client.query("SELECT * FROM governed_learning.gl_protected_records;");
        },
        (err: any) => err.code === '42501'
      );

      // INSERT into GL schema denied
      await assert.rejects(
        async () => {
          await client.query("INSERT INTO governed_learning.gl_protected_records (id, payload) VALUES ('gl_hacked', 'data');");
        },
        (err: any) => err.code === '42501'
      );
    } finally {
      client.release();
    }
  });

  it('9. Migration contracts against standalone PostgreSQL: autoMigrate false succeeds; autoMigrate true fails closed', async () => {
    // A. autoMigrate: false with becc_app initializes cleanly (read-only verification)
    const readonlyLedger = new PostgresBeccAuditLedger({
      pool: appPool,
      autoMigrate: false
    });
    await readonlyLedger.initialize();

    // B. autoMigrate: true with becc_app fails closed because DDL is denied
    const restrictedAutoMigrateLedger = new PostgresBeccAuditLedger({
      pool: appPool,
      autoMigrate: true
    });
    await assert.rejects(
      async () => {
        await restrictedAutoMigrateLedger.initialize();
      },
      (err: any) => err.code === '42501'
    );
  });

  it('10. Migration contracts against standalone PostgreSQL: altered migration checksum fails closed', async () => {
    // Admin simulates a corrupted/altered checksum
    await adminPool.query(
      `UPDATE becc.schema_migrations SET checksum = 'corrupted_checksum_006b' WHERE migration_id = $1;`,
      [migration001.migrationId]
    );

    try {
      const ledger = new PostgresBeccAuditLedger({
        pool: appPool,
        autoMigrate: false
      });
      await assert.rejects(
        async () => {
          await ledger.initialize();
        },
        /checksum mismatch/i
      );
    } finally {
      // Restore valid checksum
      await adminPool.query(
        `UPDATE becc.schema_migrations SET checksum = $1 WHERE migration_id = $2;`,
        [migration001.checksum, migration001.migrationId]
      );
    }
  });

  it('11. Standalone health and readiness probes execute successfully via 006A CLI probe functions', async () => {
    const env = {
      BECC_STORAGE_TYPE: 'postgres',
      PGHOST: host,
      PGPORT: String(port),
      PGDATABASE: database,
      PGUSER: appRoleName,
      PGPASSWORD: appRolePassword,
      PGSSL: 'disable'
    };

    // Health probe
    const healthResult = await executeHealthProbe(env);
    assert.strictEqual(healthResult.command, 'health');
    assert.strictEqual(healthResult.exitCode, 0);
    assert.strictEqual(healthResult.report.component, 'POSTGRES_AUDIT_LEDGER');
    assert.strictEqual(healthResult.report.healthState, 'HEALTHY');
    assert.strictEqual(healthResult.report.liveness, true);
    assert.strictEqual(healthResult.report.readiness, true);

    // Readiness probe
    const readyResult = await executeReadinessProbe(env);
    assert.strictEqual(readyResult.command, 'ready');
    assert.strictEqual(readyResult.exitCode, 0);
    assert.strictEqual(readyResult.report.component, 'POSTGRES_AUDIT_LEDGER');
    assert.strictEqual(readyResult.report.healthState, 'HEALTHY');
    assert.strictEqual(readyResult.report.liveness, true);
    assert.strictEqual(readyResult.report.readiness, true);
  });

  it('12. Zero secret leakage: diagnostics and reports never contain password strings', async () => {
    const env = {
      BECC_STORAGE_TYPE: 'postgres',
      PGHOST: host,
      PGPORT: String(port),
      PGDATABASE: database,
      PGUSER: appRoleName,
      PGPASSWORD: appRolePassword,
      PGSSL: 'disable'
    };

    const healthResult = await executeHealthProbe(env);
    const readyResult = await executeReadinessProbe(env);

    const serializedHealth = JSON.stringify(healthResult);
    const serializedReady = JSON.stringify(readyResult);

    assert.ok(
      !serializedHealth.includes(appRolePassword),
      'Health probe result must never contain PGPASSWORD'
    );
    assert.ok(
      !serializedReady.includes(appRolePassword),
      'Readiness probe result must never contain PGPASSWORD'
    );
  });
});
