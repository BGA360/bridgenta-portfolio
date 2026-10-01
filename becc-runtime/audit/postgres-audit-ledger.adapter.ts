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
  private isInitialized = false;

  constructor(options: PostgresBeccAuditLedgerOptions = {}) {
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

    if (options.autoMigrate !== false) {
      // Auto migration will be awaited on first query or initialize() call
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    const runner = new BeccMigrationRunner();
    await runner.run(this.pool);
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
