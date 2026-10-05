/**
 * BECC v2 — PostgreSQL Audit Ledger Adapter
 *
 * Implements BeccAuditLedgerPort for L2 durable PostgreSQL audit storage.
 * Enforces append-only application contracts, exact caller timestamp preservation,
 * race-safe exact-retry idempotency, and deterministic query ordering as specified in BECC-V2-IMPL-016.
 */

import type { Pool, PoolClient } from 'pg';
import pkg from 'pg';
const { Pool: PgPool } = pkg;

import { BeccAuditLedgerPort } from './audit-ledger.port.js';
import {
  BeccAuditRecord,
  BeccAuditQueryFilter,
  BeccAuditRecordStatus
} from './audit-ledger.types.js';
import { AuditMetadataSecurityPolicy } from './audit-metadata-security.policy.js';
import { BeccMigrationRunner } from './migrations/becc-migration-runner.js';
import { migration001 } from './migrations/001_create_becc_audit_records.js';

export interface PostgresBeccAuditLedgerOptions {
  pool?: Pool;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | object;
  maxConnections?: number;
  idleTimeoutMillis?: number;
  autoMigrate?: boolean;
}

export class PostgresBeccAuditLedger implements BeccAuditLedgerPort {
  private readonly pool: Pool;
  private readonly isPoolOwned: boolean;
  private readonly autoMigrate: boolean;
  private isInitialized = false;

  constructor(options: PostgresBeccAuditLedgerOptions = {}) {
    this.autoMigrate = options.autoMigrate ?? true;

    if (options.pool) {
      this.pool = options.pool;
      this.isPoolOwned = false;
    } else {
      this.pool = new PgPool({
        connectionString: options.connectionString,
        host: options.host ?? 'localhost',
        port: options.port ?? 5432,
        database: options.database ?? 'postgres',
        user: options.user ?? 'postgres',
        password: options.password,
        ssl: options.ssl,
        max: options.maxConnections ?? 10,
        idleTimeoutMillis: options.idleTimeoutMillis ?? 10000
      });
      this.isPoolOwned = true;
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.autoMigrate) {
      const runner = new BeccMigrationRunner();
      await runner.run(this.pool);
    } else {
      // autoMigrate: false -> Perform read-only schema & migration verification without DDL
      const schemaRes = await this.pool.query(
        "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'becc';"
      );
      if (schemaRes.rows.length === 0) {
        throw new Error(
          "Schema 'becc' does not exist in PostgreSQL database (autoMigrate is false)"
        );
      }

      const migrationsTableRes = await this.pool.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = 'becc' AND table_name = 'schema_migrations';"
      );
      if (migrationsTableRes.rows.length === 0) {
        throw new Error(
          "Table 'becc.schema_migrations' does not exist in PostgreSQL database (autoMigrate is false)"
        );
      }

      const recordsTableRes = await this.pool.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = 'becc' AND table_name = 'becc_audit_records';"
      );
      if (recordsTableRes.rows.length === 0) {
        throw new Error(
          "Table 'becc.becc_audit_records' does not exist in PostgreSQL database (autoMigrate is false)"
        );
      }

      const migrationRes = await this.pool.query<{ checksum: string }>(
        "SELECT checksum FROM becc.schema_migrations WHERE migration_id = $1;",
        [migration001.migrationId]
      );
      if (migrationRes.rows.length === 0) {
        throw new Error(
          `Required migration '${migration001.migrationId}' is not applied (autoMigrate is false)`
        );
      }
      if (migrationRes.rows[0].checksum !== migration001.checksum) {
        throw new Error(
          `Applied migration '${migration001.migrationId}' checksum mismatch (autoMigrate is false)`
        );
      }
    }

    this.isInitialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async append(record: BeccAuditRecord): Promise<void> {
    if (!record || !record.auditRecordId) {
      throw new Error('Audit record must have a valid auditRecordId');
    }

    if (!record.occurredAt || isNaN(Date.parse(record.occurredAt))) {
      throw new Error('Audit record must have a valid caller-supplied occurredAt timestamp');
    }

    await this.ensureInitialized();

    // Enforce trust-boundary security assertion on input record without mutating record
    AuditMetadataSecurityPolicy.assertSanitizedRecord(record);

    const canonicalIncoming = AuditMetadataSecurityPolicy.canonicalizeRecord(record);
    const parsedInstant = new Date(canonicalIncoming.occurredAt).toISOString();

    const sql = `
      INSERT INTO becc.becc_audit_records (
        audit_record_id, operation_type, operation_id, project_ref, candidate_ref, workstream_ref,
        actor_ref, authority_context_ref, assessment_context_ref, correlation_ref, causation_ref,
        result_status, domain_result_status, result_ref, occurred_at, occurred_at_instant,
        external_authority_boundary, input_refs, evidence_refs, provenance_refs, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (audit_record_id) DO NOTHING;
    `;

    const values = [
      canonicalIncoming.auditRecordId,
      canonicalIncoming.operationType,
      canonicalIncoming.operationId,
      canonicalIncoming.projectRef ?? null,
      canonicalIncoming.candidateRef ?? null,
      canonicalIncoming.workstreamRef ?? null,
      canonicalIncoming.actorRef ?? null,
      canonicalIncoming.authorityContextRef ?? null,
      canonicalIncoming.assessmentContextRef ?? null,
      canonicalIncoming.correlationRef ?? null,
      canonicalIncoming.causationRef ?? null,
      canonicalIncoming.resultStatus,
      canonicalIncoming.domainResultStatus ?? null,
      canonicalIncoming.resultRef ?? null,
      canonicalIncoming.occurredAt, // Preserves exact lexical caller string
      parsedInstant,
      canonicalIncoming.externalAuthorityBoundary ?? null,
      JSON.stringify(canonicalIncoming.inputRefs || []),
      JSON.stringify(canonicalIncoming.evidenceRefs || []),
      JSON.stringify(canonicalIncoming.provenanceRefs || []),
      canonicalIncoming.metadata ? JSON.stringify(canonicalIncoming.metadata) : null
    ];

    const res = await this.pool.query(sql, values);

    if (res.rowCount === 0) {
      // Conflict on auditRecordId -> Retrieve stored record and perform exact-retry equivalence check
      const existing = await this.getById(canonicalIncoming.auditRecordId);
      if (!existing) {
        throw new Error(`Failed to retrieve existing audit record for identity '${canonicalIncoming.auditRecordId}'`);
      }

      const existingCanonicalStr = JSON.stringify(AuditMetadataSecurityPolicy.canonicalizeRecord(existing));
      const incomingCanonicalStr = JSON.stringify(canonicalIncoming);

      if (existingCanonicalStr === incomingCanonicalStr) {
        // Idempotent exact retry — pass without error
        return;
      }

      throw new Error(
        `Conflicting audit record identity '${record.auditRecordId}' already exists in ledger`
      );
    }
  }

  async getById(auditRecordId: string): Promise<BeccAuditRecord | undefined> {
    await this.ensureInitialized();

    const sql = `SELECT * FROM becc.becc_audit_records WHERE audit_record_id = $1;`;
    const res = await this.pool.query(sql, [auditRecordId]);

    if (res.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToRecord(res.rows[0]);
  }

  async listByOperationRef(operationId: string): Promise<BeccAuditRecord[]> {
    return this.query({ operationId });
  }

  async listByProjectRef(projectRef: string): Promise<BeccAuditRecord[]> {
    return this.query({ projectRef });
  }

  async listByCorrelationRef(correlationRef: string): Promise<BeccAuditRecord[]> {
    return this.query({ correlationRef });
  }

  async query(filter: BeccAuditQueryFilter): Promise<BeccAuditRecord[]> {
    await this.ensureInitialized();

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (filter.auditRecordId) {
      conditions.push(`audit_record_id = $${paramIdx++}`);
      values.push(filter.auditRecordId);
    }
    if (filter.operationType) {
      conditions.push(`operation_type = $${paramIdx++}`);
      values.push(filter.operationType);
    }
    if (filter.operationId) {
      conditions.push(`operation_id = $${paramIdx++}`);
      values.push(filter.operationId);
    }
    if (filter.projectRef) {
      conditions.push(`project_ref = $${paramIdx++}`);
      values.push(filter.projectRef);
    }
    if (filter.correlationRef) {
      conditions.push(`correlation_ref = $${paramIdx++}`);
      values.push(filter.correlationRef);
    }
    if (filter.causationRef) {
      conditions.push(`causation_ref = $${paramIdx++}`);
      values.push(filter.causationRef);
    }
    if (filter.resultStatus) {
      conditions.push(`result_status = $${paramIdx++}`);
      values.push(filter.resultStatus);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT * FROM becc.becc_audit_records
      ${whereClause}
      ORDER BY occurred_at_instant ASC, audit_record_id ASC;
    `;

    const res = await this.pool.query(sql, values);
    return res.rows.map((row) => this.mapRowToRecord(row));
  }

  async close(): Promise<void> {
    if (this.isPoolOwned) {
      await this.pool.end();
    }
  }

  /**
   * Performs read-only health check for PostgreSQL audit persistence.
   * Does NOT perform synthetic audit writes (HEALTH_CHECK_WRITES_SYNTHETIC_AUDIT_RECORD: NO).
   */
  async checkHealth(): Promise<{
    component: string;
    healthState: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'MISCONFIGURED';
    liveness: boolean;
    readiness: boolean;
    details?: { safeMessage?: string; checkDurationMs?: number };
    occurredAt: string;
  }> {
    const startTime = Date.now();
    const occurredAt = new Date().toISOString();

    try {
      // 1. Connection check
      const connRes = await this.pool.query('SELECT 1;');
      if (connRes.rows.length === 0) {
        return {
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'UNAVAILABLE',
          liveness: true,
          readiness: false,
          details: { safeMessage: 'PostgreSQL ping query returned empty result', checkDurationMs: Date.now() - startTime },
          occurredAt
        };
      }

      // 2. Schema existence check
      const schemaRes = await this.pool.query("SELECT 1 FROM information_schema.schemata WHERE schema_name = 'becc';");
      if (schemaRes.rows.length === 0) {
        return {
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'MISCONFIGURED',
          liveness: true,
          readiness: false,
          details: { safeMessage: "Schema 'becc' missing", checkDurationMs: Date.now() - startTime },
          occurredAt
        };
      }

      // 3. Migration checksum check
      const migrationRes = await this.pool.query<{ checksum: string }>(
        'SELECT checksum FROM becc.schema_migrations WHERE migration_id = $1;',
        [migration001.migrationId]
      );
      if (migrationRes.rows.length === 0 || migrationRes.rows[0].checksum !== migration001.checksum) {
        return {
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'MISCONFIGURED',
          liveness: true,
          readiness: false,
          details: { safeMessage: 'Migration 001 missing or checksum mismatch', checkDurationMs: Date.now() - startTime },
          occurredAt
        };
      }

      // 4. Read capability check
      await this.pool.query('SELECT COUNT(*) FROM becc.becc_audit_records;');

      const durationMs = Math.max(0, Date.now() - startTime);
      const healthState = durationMs > 5000 ? 'DEGRADED' : 'HEALTHY';

      return {
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState,
        liveness: true,
        readiness: true,
        details: { safeMessage: 'PostgreSQL audit persistence operational', checkDurationMs: durationMs },
        occurredAt
      };
    } catch (err: any) {
      const durationMs = Math.max(0, Date.now() - startTime);
      return {
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState: 'UNAVAILABLE',
        liveness: true,
        readiness: false,
        details: { safeMessage: err?.message ? String(err.message) : 'PostgreSQL connection failed', checkDurationMs: durationMs },
        occurredAt
      };
    }
  }

  private mapRowToRecord(row: any): BeccAuditRecord {
    const parseJson = (val: any) => {
      if (val === null || val === undefined) return undefined;
      if (typeof val === 'string') return JSON.parse(val);
      return val;
    };

    return {
      auditRecordId: row.audit_record_id,
      operationType: row.operation_type,
      operationId: row.operation_id,
      projectRef: row.project_ref ?? undefined,
      candidateRef: row.candidate_ref ?? undefined,
      workstreamRef: row.workstream_ref ?? undefined,
      actorRef: row.actor_ref ?? undefined,
      authorityContextRef: row.authority_context_ref ?? undefined,
      assessmentContextRef: row.assessment_context_ref ?? undefined,
      correlationRef: row.correlation_ref ?? undefined,
      causationRef: row.causation_ref ?? undefined,
      inputRefs: parseJson(row.input_refs) || [],
      evidenceRefs: parseJson(row.evidence_refs) || [],
      provenanceRefs: parseJson(row.provenance_refs) || [],
      resultStatus: row.result_status as BeccAuditRecordStatus,
      domainResultStatus: row.domain_result_status ?? undefined,
      resultRef: row.result_ref ?? undefined,
      occurredAt: row.occurred_at, // Preserves exact lexical caller string
      externalAuthorityBoundary: row.external_authority_boundary ?? undefined,
      metadata: parseJson(row.metadata)
    };
  }
}
