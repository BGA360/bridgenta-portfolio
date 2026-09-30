/**
 * BECC v2 — In-Memory Audit Ledger Adapter
 *
 * Implements BeccAuditLedgerPort for L0 in-process memory audit storage.
 * Enforces append-only semantics, exact-retry idempotency, defensive copying,
 * and deterministic query ordering as specified in BECC-V2-IMPL-016.
 */

import { BeccAuditLedgerPort } from './audit-ledger.port.js';
import {
  BeccAuditRecord,
  BeccAuditQueryFilter
} from './audit-ledger.types.js';

import { AuditMetadataSecurityPolicy } from './audit-metadata-security.policy.js';

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  for (const prop of Object.getOwnPropertyNames(obj)) {
    const val = (obj as any)[prop];
    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

function deepClone<T>(obj: T): T {
  if (obj === undefined || obj === null) {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
}

export class InMemoryBeccAuditLedger implements BeccAuditLedgerPort {
  private readonly records = new Map<string, BeccAuditRecord>();

  async append(record: BeccAuditRecord): Promise<void> {
    if (!record || !record.auditRecordId) {
      throw new Error('Audit record must have a valid auditRecordId');
    }

    if (!record.occurredAt || isNaN(Date.parse(record.occurredAt))) {
      throw new Error('Audit record must have a valid caller-supplied occurredAt timestamp');
    }

    const canonicalIncoming = AuditMetadataSecurityPolicy.canonicalizeRecord(record);

    const existing = this.records.get(record.auditRecordId);
    if (existing) {
      // Check for exact retry equivalence using single canonical equivalence model
      const existingCanonicalStr = JSON.stringify(AuditMetadataSecurityPolicy.canonicalizeRecord(existing));
      const incomingCanonicalStr = JSON.stringify(canonicalIncoming);
      if (existingCanonicalStr === incomingCanonicalStr) {
        // Idempotent exact retry — pass without duplicating
        return;
      }
      throw new Error(
        `Conflicting audit record identity '${record.auditRecordId}' already exists in ledger`
      );
    }

    // Defensive copy & deep freeze
    const storedRecord = deepFreeze(deepClone(canonicalIncoming));
    this.records.set(record.auditRecordId, storedRecord);
  }

  async getById(auditRecordId: string): Promise<BeccAuditRecord | undefined> {
    const record = this.records.get(auditRecordId);
    return record ? deepClone(record) : undefined;
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
    const results: BeccAuditRecord[] = [];

    for (const record of this.records.values()) {
      if (filter.auditRecordId && record.auditRecordId !== filter.auditRecordId) {
        continue;
      }
      if (filter.operationType && record.operationType !== filter.operationType) {
        continue;
      }
      if (filter.operationId && record.operationId !== filter.operationId) {
        continue;
      }
      if (filter.projectRef && record.projectRef !== filter.projectRef) {
        continue;
      }
      if (filter.correlationRef && record.correlationRef !== filter.correlationRef) {
        continue;
      }
      if (filter.causationRef && record.causationRef !== filter.causationRef) {
        continue;
      }
      if (filter.resultStatus && record.resultStatus !== filter.resultStatus) {
        continue;
      }
      results.push(deepClone(record));
    }

    // Deterministic sorting: occurredAt ascending, then auditRecordId ascending
    results.sort((a, b) => {
      const timeDiff = new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return a.auditRecordId.localeCompare(b.auditRecordId);
    });

    return results;
  }
}
