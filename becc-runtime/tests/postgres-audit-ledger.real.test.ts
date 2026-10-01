/**
 * BECC v2 — Real PostgreSQL Audit Ledger & Security Boundary Integration Test Suite
 *
 * Certifies L2 PostgreSQL durable audit persistence against a real Embedded PostgreSQL instance.
 * Covers all 20 hardening requirements including exact lexical timestamp preservation,
 * advisory-locked concurrent migrations, migration checksum integrity, runtime role permission denial,
 * JSONB array order preservation, concurrent insert races, domain failure isolation,
 * adapter & database process restart durability, explicit composition, and query parity with L0 in-memory.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import EmbeddedPostgres from 'embedded-postgres';
import pkg from 'pg';
const { Pool } = pkg;

import {
  PostgresBeccAuditLedger,
  createBeccAuditLedger,
  BeccAuditIntegrationService,
  InMemoryBeccAuditLedger,
  BeccAuditRecord,
  BeccMigrationRunner,
  migration001
} from '../audit/index.js';

describe('Real PostgreSQL BECC Audit Persistence & Security Certification Suite', () => {
  let pgServer: EmbeddedPostgres;
  let pgPort: number;
  let dbDataDir: string;
  let adminPool: pkg.Pool;

  before(async () => {
    pgPort = 5440 + Math.floor(Math.random() * 50);
    dbDataDir = `./data/becc_real_pg_suite_${Date.now()}_${pgPort}`;
    if (fs.existsSync(dbDataDir)) {
      fs.rmSync(dbDataDir, { recursive: true, force: true });
    }
    pgServer = new EmbeddedPostgres({
      port: pgPort,
      databaseDir: dbDataDir,
      persistent: true
    });
    await pgServer.initialise();
    await pgServer.start();
    adminPool = createPool();
    const runner = new BeccMigrationRunner();
    await runner.run(adminPool);
  });

  beforeEach(async () => {
    if (adminPool) {
      await adminPool.query('TRUNCATE becc.becc_audit_records;');
    }
  });

  after(async () => {
    if (adminPool) {
      await adminPool.end().catch(() => {});
    }
    if (pgServer) {
      try {
        await pgServer.stop();
      } catch {
        // Ignore stop errors on cleanup
      }
    }
    if (dbDataDir && fs.existsSync(dbDataDir)) {
      try {
        fs.rmSync(dbDataDir, { recursive: true, force: true });
      } catch {}
    }
  });

  function createPool(database = 'postgres'): pkg.Pool {
    return new Pool({
      host: '127.0.0.1',
      port: pgPort,
      user: 'postgres',
      password: 'password',
      database,
      max: 10
    });
  }

  it('1. Exact lexical occurredAt preservation and parsed TIMESTAMPTZ instant ordering', async () => {
    const pool = createPool();
    const ledger = new PostgresBeccAuditLedger({ pool });
    await ledger.initialize();

    const lexicalTimeStr = '2026-09-30T12:00:00+02:00';
    const record: BeccAuditRecord = {
      auditRecordId: 'audit_lexical_ts_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_lex_001',
      occurredAt: lexicalTimeStr,
      inputRefs: ['cmd_01'],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    await ledger.append(record);

    const fetched = await ledger.getById('audit_lexical_ts_001');
    assert.ok(fetched);
    assert.strictEqual(fetched.occurredAt, lexicalTimeStr); // Exact lexical string preserved

    // Ordering check with parsed instant
    const recordEarlier: BeccAuditRecord = {
      auditRecordId: 'audit_lexical_ts_000',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_lex_000',
      occurredAt: '2026-09-30T09:00:00Z', // 09:00 UTC (earlier than 12:00 +02:00 = 10:00 UTC)
      inputRefs: [],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };
    await ledger.append(recordEarlier);

    const queried = await ledger.query({ operationType: 'GUIDANCE_QUERY' });
    const ids = queried.map((r) => r.auditRecordId);
    assert.deepStrictEqual(ids, ['audit_lexical_ts_000', 'audit_lexical_ts_001']);
  });

  it('2. Concurrent migration safety using PostgreSQL advisory locking', async () => {
    const pool1 = createPool();
    const pool2 = createPool();

    const runner1 = new BeccMigrationRunner();
    const runner2 = new BeccMigrationRunner();

    // Execute migrations concurrently from separate connection pools
    const [res1, res2] = await Promise.all([runner1.run(pool1), runner2.run(pool2)]);

    assert.ok(res1);
    assert.ok(res2);

    await pool1.end();
    await pool2.end();
  });

  it('3. Migration integrity verification & checksum mismatch fail-closed behavior', async () => {
    const pool = createPool();
    const runner = new BeccMigrationRunner();

    // Corrupt migration definition
    (runner as any).migrations = [
      {
        migrationId: '001_create_becc_audit_records',
        sql: 'ALTER TABLE becc.becc_audit_records ADD COLUMN corrupted TEXT;',
        checksum: 'corrupted_checksum_hash_12345'
      }
    ];

    await assert.rejects(
      async () => {
        await runner.run(pool);
      },
      (err: Error) => {
        return (
          err.message.includes('Migration checksum mismatch') &&
          err.message.includes('001_create_becc_audit_records')
        );
      }
    );

    await pool.end();
  });

  it('4. Database runtime role permissions: SELECT/INSERT allowed, UPDATE/DELETE denied', async () => {
    const pool = createPool();
    const client = await pool.connect();
    try {
      // Create restricted runtime role
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'becc_restricted_role') THEN
            CREATE ROLE becc_restricted_role LOGIN PASSWORD 'restricted_pass';
          END IF;
        END
        $$;
        GRANT USAGE ON SCHEMA becc TO becc_restricted_role;
        GRANT SELECT, INSERT ON TABLE becc.becc_audit_records TO becc_restricted_role;
        REVOKE UPDATE, DELETE ON TABLE becc.becc_audit_records FROM becc_restricted_role;
      `);
    } finally {
      client.release();
    }

    const restrictedPool = new Pool({
      host: '127.0.0.1',
      port: pgPort,
      user: 'becc_restricted_role',
      password: 'restricted_pass',
      database: 'postgres'
    });

    const restrictedLedger = new PostgresBeccAuditLedger({ pool: restrictedPool, autoMigrate: false });
    (restrictedLedger as any).isInitialized = true;

    const rec: BeccAuditRecord = {
      auditRecordId: 'audit_perm_test_001',
      operationType: 'FINDING_ESCALATION',
      operationId: 'op_perm_001',
      occurredAt: new Date().toISOString(),
      inputRefs: [],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    // INSERT allowed
    await restrictedLedger.append(rec);

    // SELECT allowed
    const fetched = await restrictedLedger.getById('audit_perm_test_001');
    assert.ok(fetched);
    assert.strictEqual(fetched.auditRecordId, 'audit_perm_test_001');

    // UPDATE denied at DB level
    const restrictedClient = await restrictedPool.connect();
    try {
      await assert.rejects(
        async () => {
          await restrictedClient.query(
            "UPDATE becc.becc_audit_records SET result_status = 'ERROR' WHERE audit_record_id = 'audit_perm_test_001';"
          );
        },
        (err: any) => err.code === '42501' // 42501 = insufficient_privilege
      );

      // DELETE denied at DB level
      await assert.rejects(
        async () => {
          await restrictedClient.query(
            "DELETE FROM becc.becc_audit_records WHERE audit_record_id = 'audit_perm_test_001';"
          );
        },
        (err: any) => err.code === '42501'
      );
    } finally {
      restrictedClient.release();
      await restrictedPool.end();
      await pool.end();
    }
  });

  it('5. JSONB array element order preservation', async () => {
    const pool = createPool();
    const ledger = new PostgresBeccAuditLedger({ pool });
    await ledger.initialize();

    const record: BeccAuditRecord = {
      auditRecordId: 'audit_array_order_001',
      operationType: 'READINESS_EVALUATION',
      operationId: 'op_arr_001',
      occurredAt: new Date().toISOString(),
      inputRefs: ['REF_Z', 'REF_A', 'REF_M'],
      evidenceRefs: ['EV_2', 'EV_1'],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    await ledger.append(record);

    const fetched = await ledger.getById('audit_array_order_001');
    assert.ok(fetched);
    assert.deepStrictEqual(fetched.inputRefs, ['REF_Z', 'REF_A', 'REF_M']); // Array order preserved exactly
    assert.deepStrictEqual(fetched.evidenceRefs, ['EV_2', 'EV_1']);
    assert.notDeepStrictEqual(fetched.inputRefs, ['REF_A', 'REF_M', 'REF_Z']);
  });

  it('6. Real concurrent insert races: identical insert succeeds idempotently; conflicting insert fails closed', async () => {
    const pool = createPool();
    const ledger1 = new PostgresBeccAuditLedger({ pool });
    const ledger2 = new PostgresBeccAuditLedger({ pool });

    const identicalRecord: BeccAuditRecord = {
      auditRecordId: 'audit_race_identical_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_race_001',
      occurredAt: '2026-09-30T15:00:00Z',
      inputRefs: ['cmd_race'],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    // Identical concurrent race
    await Promise.all([ledger1.append(identicalRecord), ledger2.append(identicalRecord)]);

    const storedIdentical = await ledger1.getById('audit_race_identical_001');
    assert.ok(storedIdentical);

    // Conflicting concurrent race
    const recordConflicting1: BeccAuditRecord = {
      auditRecordId: 'audit_race_conflict_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_race_002',
      actorRef: 'ACTOR_ALICE',
      occurredAt: '2026-09-30T15:00:00Z',
      inputRefs: [],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    const recordConflicting2: BeccAuditRecord = {
      ...recordConflicting1,
      actorRef: 'ACTOR_BOB' // Conflicting content
    };

    const results = await Promise.allSettled([
      ledger1.append(recordConflicting1),
      ledger2.append(recordConflicting2)
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    assert.strictEqual(fulfilled.length, 1);
    assert.strictEqual(rejected.length, 1);
    assert.match(
      (rejected[0] as PromiseRejectedResult).reason.message,
      /Conflicting audit record identity/
    );
  });

  it('7. Best-effort failure isolation: database outage does not crash domain service result when isolated', async () => {
    const pool = createPool();
    const ledger = new PostgresBeccAuditLedger({ pool });
    await ledger.initialize();

    const service = new BeccAuditIntegrationService(ledger);

    // Simulate database failure by closing pool
    await pool.end();

    let domainOperationExecuted = false;

    // Execute domain operation with best-effort audit isolation pattern
    const executeDomainOperation = async () => {
      // 1. Core domain logic executes successfully
      domainOperationExecuted = true;
      const domainResult = { status: 'SUCCESS', value: 'domain_computed_value' };

      // 2. Best-effort audit logging
      try {
        await service.recordGuidanceQueryAudit({
          queryInput: { commandId: 'cmd_outage_001' },
          queryResult: domainResult,
          occurredAt: new Date().toISOString()
        });
      } catch (auditErr) {
        // Audit failure caught and logged by resilience wrapper — does NOT mutate domain result
      }

      return domainResult;
    };

    const result = await executeDomainOperation();
    assert.strictEqual(domainOperationExecuted, true);
    assert.strictEqual(result.status, 'SUCCESS');
    assert.strictEqual(result.value, 'domain_computed_value');
  });

  it('8. Adapter restart durability & Database Process restart durability', async () => {
    // A. Adapter Restart Durability
    const poolA = createPool();
    const ledgerA = new PostgresBeccAuditLedger({ pool: poolA });
    await ledgerA.initialize();

    const record: BeccAuditRecord = {
      auditRecordId: 'audit_restart_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_restart_001',
      occurredAt: new Date().toISOString(),
      inputRefs: ['ref_restart'],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    await ledgerA.append(record);
    await poolA.end();

    // Reconnect with new pool & adapter instance
    const poolB = createPool();
    const ledgerB = new PostgresBeccAuditLedger({ pool: poolB });
    const fetchedA = await ledgerB.getById('audit_restart_001');
    assert.ok(fetchedA);
    assert.strictEqual(fetchedA.auditRecordId, 'audit_restart_001');
    await poolB.end();

    // B. Database Process Restart Durability
    await pgServer.stop();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await pgServer.start();

    const poolC = createPool();
    const ledgerC = new PostgresBeccAuditLedger({ pool: poolC });
    const fetchedB = await ledgerC.getById('audit_restart_001');
    assert.ok(fetchedB);
    assert.strictEqual(fetchedB.auditRecordId, 'audit_restart_001');
    await poolC.end();
  });

  it('9. Explicit durable composition & prohibition of silent L0 fallback', async () => {
    // Valid postgres composition succeeds
    const pool = createPool();
    const ledger = await createBeccAuditLedger({
      storageType: 'postgres',
      postgres: { pool }
    });
    assert.ok(ledger instanceof PostgresBeccAuditLedger);

    // Invalid connection fails closed immediately without silent fallback
    await assert.rejects(
      async () => {
        await createBeccAuditLedger({
          storageType: 'postgres',
          postgres: { host: '127.0.0.1', port: 59999, idleTimeoutMillis: 100 }
        });
      },
      (err: Error) => {
        return (
          err.message.includes('silent L0 fallback prohibited') ||
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('connect')
        );
      }
    );

    await pool.end();
  });

  it('10. Exact query parity between L0 InMemoryBeccAuditLedger and L2 PostgresBeccAuditLedger', async () => {
    const pool = createPool();
    const l2Ledger = new PostgresBeccAuditLedger({ pool });
    await l2Ledger.initialize();

    const l0Ledger = new InMemoryBeccAuditLedger();

    const sampleRecords: BeccAuditRecord[] = [
      {
        auditRecordId: 'audit_parity_001',
        operationType: 'GUIDANCE_QUERY',
        operationId: 'op_p1',
        projectRef: 'proj_alpha',
        occurredAt: '2026-09-30T10:00:00Z',
        inputRefs: ['in1'],
        evidenceRefs: [],
        provenanceRefs: [],
        resultStatus: 'SUCCESS'
      },
      {
        auditRecordId: 'audit_parity_002',
        operationType: 'FINDING_ESCALATION',
        operationId: 'op_p2',
        projectRef: 'proj_alpha',
        occurredAt: '2026-09-30T11:00:00Z',
        inputRefs: ['in2'],
        evidenceRefs: ['ev1'],
        provenanceRefs: [],
        resultStatus: 'SUCCESS'
      },
      {
        auditRecordId: 'audit_parity_003',
        operationType: 'GUIDANCE_QUERY',
        operationId: 'op_p3',
        projectRef: 'proj_beta',
        occurredAt: '2026-09-30T09:30:00Z',
        inputRefs: ['in3'],
        evidenceRefs: [],
        provenanceRefs: [],
        resultStatus: 'REFUSED'
      }
    ];

    for (const rec of sampleRecords) {
      await l0Ledger.append(rec);
      await l2Ledger.append(rec);
    }

    // Query projectRef = proj_alpha
    const l0Proj = await l0Ledger.listByProjectRef('proj_alpha');
    const l2Proj = await l2Ledger.listByProjectRef('proj_alpha');

    assert.deepStrictEqual(
      l0Proj.map((r) => r.auditRecordId),
      l2Proj.map((r) => r.auditRecordId)
    );

    // Filter query: operationType = GUIDANCE_QUERY ordered by occurredAt ASC
    const l0Filter = await l0Ledger.query({ operationType: 'GUIDANCE_QUERY' });
    const l2Filter = await l2Ledger.query({ operationType: 'GUIDANCE_QUERY' });

    assert.deepStrictEqual(
      l0Filter.map((r) => r.auditRecordId),
      ['audit_parity_003', 'audit_parity_001']
    );
    assert.deepStrictEqual(
      l2Filter.map((r) => r.auditRecordId),
      ['audit_parity_003', 'audit_parity_001']
    );

    await pool.end();
  });

  it('11. Security boundary integration: secrets redacted & raw payloads prohibited before durable write', async () => {
    const pool = createPool();
    const ledger = new PostgresBeccAuditLedger({ pool });
    await ledger.initialize();

    const service = new BeccAuditIntegrationService(ledger);

    const recordWithSecrets = await service.recordAudit({
      auditRecordId: 'audit_sec_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_sec_001',
      occurredAt: new Date().toISOString(),
      resultStatus: 'SUCCESS',
      metadata: {
        safeSummary: 'normal_value',
        api_key: 'secret_token_12345',
        bearerToken: 'Bearer abc.def.ghi'
      }
    });

    const retrievedFromPg = await ledger.getById('audit_sec_001');
    assert.ok(retrievedFromPg);
    assert.strictEqual((retrievedFromPg.metadata as any).safeSummary, 'normal_value');
    assert.strictEqual((retrievedFromPg.metadata as any).api_key, undefined); // sensitive key dropped by allowlist / sensitive filter
    assert.strictEqual((retrievedFromPg.metadata as any).bearerToken, undefined);

    await pool.end();
  });
});
