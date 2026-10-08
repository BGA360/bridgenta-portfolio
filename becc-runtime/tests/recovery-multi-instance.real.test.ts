/**
 * BECC v2 — Recovery & Multi-Instance Certification Test Suite (REAL POSTGRESQL)
 *
 * Certifies BECC-NEXT-005 Recovery & Multi-Instance Operational Behavior against real Embedded PostgreSQL.
 * Verifies process restart durability, multi-instance shared database safety, cross-instance exact retry,
 * cross-instance conflict detection, concurrent races across instances, audit outage & recovery resilience,
 * real domain service outage & recovery continuity, health readiness state transitions, and boundary preservation.
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
  BeccAuditRecord,
  BeccMigrationRunner,
  migration001
} from '../audit/index.js';
import { GovernedGuidanceResolverService } from '../knowledge/index.js';
import { FindingEscalationService } from '../escalation/index.js';
import {
  PublicationReadinessEvaluationService,
  CanonicalPortfolioReadinessRuleProvider
} from '../readiness/index.js';
import { InMemoryBeccOperationalObserver } from '../observability/in-memory-operational-observer.adapter.js';
import type { GovernedLearningIntegrationAdapter } from '../governed-learning/index.js';

const mockActorRef = { actorId: 'actor_rec_tester', actorType: 'AGENT' as const };

describe('BECC-NEXT-005 — Recovery & Multi-Instance Certification Suite (REAL POSTGRESQL)', () => {
  let pgServer: EmbeddedPostgres;
  let pgPort: number;
  let dbDataDir: string;
  let adminPool: pkg.Pool;

  before(async () => {
    pgPort = 5500 + Math.floor(Math.random() * 50);
    dbDataDir = `./data/becc_recovery_pg_suite_${Date.now()}_${pgPort}`;
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
      await adminPool.query('CREATE SCHEMA IF NOT EXISTS becc;');
      await adminPool.query(`
        CREATE TABLE IF NOT EXISTS becc.schema_migrations (
          migration_id VARCHAR(255) PRIMARY KEY,
          checksum VARCHAR(64) NOT NULL,
          applied_at VARCHAR(128) NOT NULL
        );
      `);
      await adminPool.query('TRUNCATE becc.becc_audit_records;');
      await adminPool.query(
        `INSERT INTO becc.schema_migrations (migration_id, checksum, applied_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (migration_id) DO UPDATE SET checksum = EXCLUDED.checksum;`,
        [migration001.migrationId, migration001.checksum, new Date().toISOString()]
      );
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
        // Ignore cleanup errors
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

  it('1. Audit survives adapter instance restart & new pool creation without data wipe', async () => {
    const poolA = createPool();
    const ledgerA = new PostgresBeccAuditLedger({ pool: poolA });
    await ledgerA.initialize();

    const record: BeccAuditRecord = {
      auditRecordId: 'audit_rec_restart_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_rec_001',
      occurredAt: '2026-10-06T10:00:00.000Z',
      inputRefs: ['ref_in_01'],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    await ledgerA.append(record);
    await poolA.end();

    // Re-instantiate Instance B with entirely new Pool
    const poolB = createPool();
    const ledgerB = new PostgresBeccAuditLedger({ pool: poolB, autoMigrate: false });
    await ledgerB.initialize();

    const fetched = await ledgerB.getById('audit_rec_restart_001');
    assert.ok(fetched);
    assert.strictEqual(fetched.auditRecordId, 'audit_rec_restart_001');
    assert.strictEqual(fetched.operationType, 'GUIDANCE_QUERY');
    assert.strictEqual(fetched.occurredAt, '2026-10-06T10:00:00.000Z');

    await poolB.end();
  });

  it('2. Cross-instance exact retry is deterministic without duplicate durable rows', async () => {
    const poolA = createPool();
    const poolB = createPool();
    const ledgerA = new PostgresBeccAuditLedger({ pool: poolA });
    const ledgerB = new PostgresBeccAuditLedger({ pool: poolB });

    await ledgerA.initialize();
    await ledgerB.initialize();

    const record: BeccAuditRecord = {
      auditRecordId: 'audit_cross_retry_001',
      operationType: 'FINDING_ESCALATION',
      operationId: 'op_cross_001',
      occurredAt: '2026-10-06T11:00:00.000Z',
      inputRefs: ['finding_100'],
      evidenceRefs: ['ev_100'],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    // Instance A appends record
    await ledgerA.append(record);

    // Instance B retries exact same record
    await ledgerB.append(record);

    // Verify exactly one durable row exists
    const adminCheckPool = createPool();
    const res = await adminCheckPool.query(
      'SELECT COUNT(*)::int as cnt FROM becc.becc_audit_records WHERE audit_record_id = $1;',
      ['audit_cross_retry_001']
    );
    assert.strictEqual(res.rows[0].cnt, 1);

    await poolA.end();
    await poolB.end();
    await adminCheckPool.end();
  });

  it('3. Cross-instance conflict detection fails closed and preserves original record without overwrite', async () => {
    const poolA = createPool();
    const poolB = createPool();
    const ledgerA = new PostgresBeccAuditLedger({ pool: poolA });
    const ledgerB = new PostgresBeccAuditLedger({ pool: poolB });

    await ledgerA.initialize();
    await ledgerB.initialize();

    const originalRecord: BeccAuditRecord = {
      auditRecordId: 'audit_cross_conflict_001',
      operationType: 'READINESS_EVALUATION',
      operationId: 'op_cross_conf_001',
      actorRef: 'ACTOR_ALICE',
      occurredAt: '2026-10-06T12:00:00.000Z',
      inputRefs: ['proj_alpha'],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    // Instance A appends original
    await ledgerA.append(originalRecord);

    // Instance B attempts conflicting content with same auditRecordId
    const conflictingRecord: BeccAuditRecord = {
      ...originalRecord,
      actorRef: 'ACTOR_BOB_ATTACKER'
    };

    await assert.rejects(
      async () => {
        await ledgerB.append(conflictingRecord);
      },
      (err: Error) => err.message.includes('Conflicting audit record identity')
    );

    // Verify original record is unchanged in DB
    const fetched = await ledgerA.getById('audit_cross_conflict_001');
    assert.ok(fetched);
    assert.strictEqual(fetched.actorRef, 'ACTOR_ALICE');

    await poolA.end();
    await poolB.end();
  });

  it('4. Concurrent same-identity race across independent instances: identical succeeds, conflicting fails closed', async () => {
    const pool1 = createPool();
    const pool2 = createPool();
    const ledger1 = new PostgresBeccAuditLedger({ pool: pool1 });
    const ledger2 = new PostgresBeccAuditLedger({ pool: pool2 });
    await ledger1.initialize();
    await ledger2.initialize();

    // A. Concurrent Identical Append Race
    const identicalRecord: BeccAuditRecord = {
      auditRecordId: 'audit_conc_identical_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_conc_id_001',
      occurredAt: '2026-10-06T13:00:00.000Z',
      inputRefs: ['in_conc'],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    await Promise.all([ledger1.append(identicalRecord), ledger2.append(identicalRecord)]);

    const countRes = await pool1.query(
      'SELECT COUNT(*)::int as cnt FROM becc.becc_audit_records WHERE audit_record_id = $1;',
      ['audit_conc_identical_001']
    );
    assert.strictEqual(countRes.rows[0].cnt, 1);

    // B. Concurrent Conflicting Append Race
    const confRecord1: BeccAuditRecord = {
      auditRecordId: 'audit_conc_conflict_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_conc_conf_001',
      actorRef: 'ACTOR_WORKER_1',
      occurredAt: '2026-10-06T13:05:00.000Z',
      inputRefs: [],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    const confRecord2: BeccAuditRecord = {
      ...confRecord1,
      actorRef: 'ACTOR_WORKER_2'
    };

    const settled = await Promise.allSettled([
      ledger1.append(confRecord1),
      ledger2.append(confRecord2)
    ]);

    const fulfilled = settled.filter((s) => s.status === 'fulfilled');
    const rejected = settled.filter((s) => s.status === 'rejected');

    assert.strictEqual(fulfilled.length, 1);
    assert.strictEqual(rejected.length, 1);
    assert.match(
      (rejected[0] as PromiseRejectedResult).reason.message,
      /Conflicting audit record identity/
    );

    await pool1.end();
    await pool2.end();
  });

  it('5. Query parity and deterministic ordering (occurredAt ASC, auditRecordId ASC) across instances', async () => {
    const pool1 = createPool();
    const pool2 = createPool();
    const ledger1 = new PostgresBeccAuditLedger({ pool: pool1 });
    const ledger2 = new PostgresBeccAuditLedger({ pool: pool2 });
    await ledger1.initialize();
    await ledger2.initialize();

    const r1: BeccAuditRecord = {
      auditRecordId: 'audit_q_002',
      operationType: 'READINESS_EVALUATION',
      operationId: 'op_q_2',
      projectRef: 'proj_beta',
      occurredAt: '2026-10-06T14:00:00.000Z',
      inputRefs: [],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    const r2: BeccAuditRecord = {
      auditRecordId: 'audit_q_001',
      operationType: 'READINESS_EVALUATION',
      operationId: 'op_q_1',
      projectRef: 'proj_beta',
      occurredAt: '2026-10-06T14:00:00.000Z', // Same timestamp -> tie-break by auditRecordId
      inputRefs: [],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };

    await ledger1.append(r1);
    await ledger2.append(r2);

    const q1 = await ledger1.query({ projectRef: 'proj_beta' });
    const q2 = await ledger2.query({ projectRef: 'proj_beta' });

    assert.deepStrictEqual(
      q1.map((r) => r.auditRecordId),
      ['audit_q_001', 'audit_q_002']
    );
    assert.deepStrictEqual(
      q2.map((r) => r.auditRecordId),
      ['audit_q_001', 'audit_q_002']
    );

    await pool1.end();
    await pool2.end();
  });

  it('6. PostgreSQL outage, health degradation, recovery, and post-recovery append resumption', async () => {
    const pool = createPool();
    const ledger = new PostgresBeccAuditLedger({ pool });
    await ledger.initialize();

    // 1. Healthy baseline check
    const health1 = await ledger.checkHealth();
    assert.strictEqual(health1.healthState, 'HEALTHY');
    assert.strictEqual(health1.readiness, true);
    assert.strictEqual(health1.liveness, true);

    // 2. Pre-outage append
    const recordPre: BeccAuditRecord = {
      auditRecordId: 'audit_outage_pre_001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_out_pre',
      occurredAt: new Date().toISOString(),
      inputRefs: [],
      evidenceRefs: [],
      provenanceRefs: [],
      resultStatus: 'SUCCESS'
    };
    await ledger.append(recordPre);

    // 3. Induce outage by ending pool
    await pool.end();

    // 4. Outage health check returns UNAVAILABLE / readiness false without throwing
    const health2 = await ledger.checkHealth();
    assert.strictEqual(health2.healthState, 'UNAVAILABLE');
    assert.strictEqual(health2.readiness, false);
    assert.ok(health2.details?.safeMessage);
    assert.equal(health2.details.safeMessage.includes('password'), false); // Sanitized

    // 5. Outage append fails closed
    const recordOutage: BeccAuditRecord = {
      ...recordPre,
      auditRecordId: 'audit_outage_during_001'
    };
    await assert.rejects(async () => {
      await ledger.append(recordOutage);
    });

    // 6. Restore DB connectivity with new pool & ledger instance
    const restoredPool = createPool();
    const restoredLedger = new PostgresBeccAuditLedger({ pool: restoredPool, autoMigrate: false });
    await restoredLedger.initialize();

    const health3 = await restoredLedger.checkHealth();
    assert.strictEqual(health3.healthState, 'HEALTHY');
    assert.strictEqual(health3.readiness, true);

    // 7. Post-recovery append succeeds
    const recordPost: BeccAuditRecord = {
      ...recordPre,
      auditRecordId: 'audit_outage_post_001'
    };
    await restoredLedger.append(recordPost);

    // 8. Verify pre-outage and post-recovery data survive intact
    const fetchedPre = await restoredLedger.getById('audit_outage_pre_001');
    const fetchedPost = await restoredLedger.getById('audit_outage_post_001');

    assert.ok(fetchedPre);
    assert.ok(fetchedPost);

    await restoredLedger.close();
  });

  it('7. Real domain services (Guidance, Escalation, Readiness) preserve output during audit DB outage & resume logging on recovery', async () => {
    const mockGlAdapter: GovernedLearningIntegrationAdapter = {
      queryGuidance: async (input: any) => ({
        ok: true,
        category: 'SUCCESS',
        commandId: `cmd_${input.queryId}`,
        replayed: false,
        guidanceSet: {
          evaluatedAt: input.issuedAt,
          matchedGuidance: [
            {
              lessonRef: { lessonId: 'les_rec_001', version: '1.0.0' },
              statement: 'Recovery statement',
              rationale: 'Recovery rationale',
              scope: 'PROJECT'
            }
          ]
        }
      }),
      draftObservation: async (input: any) => ({
        ok: true,
        category: 'SUCCESS',
        commandId: `cmd_draft_${input.findingId}`,
        observationId: `obs_${input.findingId}`,
        replayed: false
      }),
      attachEvidence: async (input: any, obsId: any) => ({
        ok: true,
        category: 'SUCCESS',
        commandId: `cmd_attach_${obsId}`,
        replayed: false
      }),
      submitObservation: async (input: any, obsId: any) => ({
        ok: true,
        category: 'SUCCESS',
        commandId: `cmd_submit_${obsId}`,
        replayed: false
      })
    } as any;

    const observer = new InMemoryBeccOperationalObserver();
    const outagePool = createPool();
    const outageLedger = new PostgresBeccAuditLedger({ pool: outagePool });
    await outageLedger.initialize();

    const auditService = new BeccAuditIntegrationService(outageLedger, observer);

    const guidanceService = new GovernedGuidanceResolverService({ adapter: mockGlAdapter, auditService, observer });
    const escalationService = new FindingEscalationService({ adapter: mockGlAdapter, auditService, observer });
    const readinessService = new PublicationReadinessEvaluationService(
      new CanonicalPortfolioReadinessRuleProvider(),
      undefined,
      auditService,
      observer
    );

    // Induce outage
    await outagePool.end();

    // A. GovernedGuidanceResolverService maintains domain output during outage
    const gResult = await guidanceService.resolveGuidance({
      queryId: 'q_out_001',
      actorRef: mockActorRef,
      issuedAt: new Date().toISOString(),
      projectRef: { projectId: 'proj_rec' }
    });
    assert.strictEqual(gResult.ok, true);
    assert.strictEqual(gResult.category, 'SUCCESS');

    // B. FindingEscalationService maintains domain output during outage
    const eResult = await escalationService.escalateFinding({
      finding: { id: 'f_out_001', category: 'Engineering', severity: 'error', message: 'Escalation outage' },
      actorRef: mockActorRef,
      issuedAt: new Date().toISOString(),
      authorityContextRef: { authorityId: 'auth_rec' } as any
    });
    assert.strictEqual(eResult.ok, true);
    assert.strictEqual(eResult.category, 'SUCCESS');

    // C. PublicationReadinessEvaluationService maintains domain output during outage
    const rResult = await readinessService.evaluateReadiness({
      evaluationId: 'eval_out_001',
      projectRef: 'proj_rec',
      issuedAt: new Date().toISOString(),
      evidenceItems: []
    });
    assert.strictEqual(rResult.status, 'NOT_READY');

    // D. Restore DB and verify post-recovery logging resumes
    const restoredPool = createPool();
    const restoredLedger = new PostgresBeccAuditLedger({ pool: restoredPool, autoMigrate: false });
    await restoredLedger.initialize();
    const restoredAuditService = new BeccAuditIntegrationService(restoredLedger, observer);

    const restoredGuidance = new GovernedGuidanceResolverService({
      adapter: mockGlAdapter,
      auditService: restoredAuditService,
      observer
    });

    await restoredGuidance.resolveGuidance({
      queryId: 'q_post_rec_001',
      actorRef: mockActorRef,
      issuedAt: new Date().toISOString(),
      projectRef: { projectId: 'proj_rec' }
    });

    const recInDb = await restoredLedger.query({ operationType: 'GUIDANCE_QUERY' });
    assert.ok(recInDb.length > 0, 'Audit logging must resume post-recovery');

    await restoredPool.end();
  });

  it('8. Observability distinguishes domain vs audit failure & health signals report truthfulness without synthetic audit records', async () => {
    const observer = new InMemoryBeccOperationalObserver();
    const pool = createPool();
    const ledger = new PostgresBeccAuditLedger({ pool });
    await ledger.initialize();

    const auditService = new BeccAuditIntegrationService(ledger, observer);

    // Initial health check is healthy
    const h1 = await ledger.checkHealth();
    assert.strictEqual(h1.healthState, 'HEALTHY');

    // Audit outage
    await pool.end();

    await auditService.recordAudit({
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_obs_dist',
      resultStatus: 'SUCCESS',
      occurredAt: new Date().toISOString()
    }).catch(() => {}); // Audit failure isolated

    const events = observer.getEvents();
    const depFail = events.find((e) => e.eventType === 'DEPENDENCY' && e.dependencyName === 'POSTGRES_AUDIT_LEDGER');
    assert.ok(depFail);
    assert.strictEqual(depFail.resultStatus, 'ERROR');

    // Verify health check returns UNAVAILABLE without creating synthetic audit records
    const adminCheckPool = createPool();
    const initialCount = (
      await adminCheckPool.query('SELECT COUNT(*)::int as cnt FROM becc.becc_audit_records;')
    ).rows[0].cnt;

    const h2 = await ledger.checkHealth();
    assert.strictEqual(h2.healthState, 'UNAVAILABLE');
    assert.strictEqual(h2.readiness, false);

    const finalCount = (
      await adminCheckPool.query('SELECT COUNT(*)::int as cnt FROM becc.becc_audit_records;')
    ).rows[0].cnt;

    // HEALTH_CHECK_WRITES_SYNTHETIC_AUDIT_RECORD: NO
    assert.strictEqual(finalCount, initialCount);

    await adminCheckPool.end();
  });
});
