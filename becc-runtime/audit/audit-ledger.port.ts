/**
 * BECC v2 — Audit Ledger Port
 *
 * Defines the persistence abstraction for BECC audit records as specified in BECC-V2-IMPL-016.
 */

import {
  BeccAuditRecord,
  BeccAuditQueryFilter
} from './audit-ledger.types.js';

export interface BeccAuditLedgerPort {
  /**
   * Appends an immutable audit record to the ledger.
   * Append-only semantics: fails closed on conflicting auditRecordId duplicates.
   */
  append(record: BeccAuditRecord): Promise<void>;

  /**
   * Fetches an audit record by its unique auditRecordId.
   */
  getById(auditRecordId: string): Promise<BeccAuditRecord | undefined>;

  /**
   * Lists audit records for a given operation identity.
   */
  listByOperationRef(operationId: string): Promise<BeccAuditRecord[]>;

  /**
   * Lists audit records associated with a project.
   */
  listByProjectRef(projectRef: string): Promise<BeccAuditRecord[]>;

  /**
   * Lists audit records matching a correlation reference.
   */
  listByCorrelationRef(correlationRef: string): Promise<BeccAuditRecord[]>;

  /**
   * Queries audit records matching filter criteria.
   * Output must be deterministically ordered by occurredAt, then auditRecordId.
   */
  query(filter: BeccAuditQueryFilter): Promise<BeccAuditRecord[]>;
}
