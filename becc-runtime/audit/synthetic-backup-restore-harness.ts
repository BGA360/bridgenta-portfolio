/**
 * BECC v2 — Synthetic Backup / Restore Test Harness (Phase 19)
 *
 * Implements a zero-cost test harness capable of verifying:
 * - Logical export of audit ledger records
 * - Checksum calculation across exported records
 * - Restore into a disposable target ledger
 * - Row count, sequence order, and checksum parity verification
 * - Fail-closed integrity detection on tampered backups
 *
 * Note: Does not claim cloud provider automated backup or PITR certification.
 */

import crypto from 'node:crypto';
import { BeccAuditRecord } from './audit-ledger.types.js';
import { BeccAuditLedgerPort } from './audit-ledger.port.js';

export interface AuditLedgerBackupPackage {
  formatVersion: '1.0.0';
  exportedAt: string;
  recordCount: number;
  recordsChecksum: string;
  records: BeccAuditRecord[];
}

export interface BackupVerificationResult {
  verified: boolean;
  sourceRecordCount: number;
  restoredRecordCount: number;
  checksumMatched: boolean;
  errors: string[];
}

export class SyntheticBackupRestoreHarness {
  /**
   * Computes a deterministic SHA-256 checksum across a list of audit records.
   */
  public static computeChecksum(records: BeccAuditRecord[]): string {
    const hash = crypto.createHash('sha256');
    for (const r of records) {
      hash.update(`${r.auditRecordId}:${r.operationType}:${r.operationId}:${r.resultStatus}:${r.occurredAt}`);
    }
    return hash.digest('hex');
  }

  /**
   * Creates a logical export package from an audit ledger.
   */
  public static async exportBackup(ledger: BeccAuditLedgerPort): Promise<AuditLedgerBackupPackage> {
    const records = await ledger.query({});
    const recordsChecksum = this.computeChecksum(records);

    return {
      formatVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      recordsChecksum,
      records: Object.freeze([...records]) as BeccAuditRecord[]
    };
  }

  /**
   * Restores an export package into a target ledger and verifies integrity.
   */
  public static async restoreAndVerify(
    backup: AuditLedgerBackupPackage,
    targetLedger: BeccAuditLedgerPort
  ): Promise<BackupVerificationResult> {
    const errors: string[] = [];

    // Checksum verification before restore
    const calculatedChecksum = this.computeChecksum(backup.records);
    if (calculatedChecksum !== backup.recordsChecksum) {
      errors.push('Integrity verification failed: backup records checksum does not match manifest.');
      return {
        verified: false,
        sourceRecordCount: backup.recordCount,
        restoredRecordCount: 0,
        checksumMatched: false,
        errors
      };
    }

    // Append records to target ledger
    for (const record of backup.records) {
      try {
        await targetLedger.append(record);
      } catch (err: any) {
        errors.push(`Failed to restore record '${record.auditRecordId}': ${err.message}`);
      }
    }

    // Query restored records
    const restored = await targetLedger.query({});
    const restoredChecksum = this.computeChecksum(restored);

    if (restored.length !== backup.recordCount) {
      errors.push(
        `Row count mismatch: expected ${backup.recordCount} records, got ${restored.length}.`
      );
    }

    const checksumMatched = restoredChecksum === backup.recordsChecksum;
    if (!checksumMatched) {
      errors.push('Restored records checksum mismatch against source backup.');
    }

    return {
      verified: errors.length === 0,
      sourceRecordCount: backup.recordCount,
      restoredRecordCount: restored.length,
      checksumMatched,
      errors
    };
  }
}
