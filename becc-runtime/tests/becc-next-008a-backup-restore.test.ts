/**
 * BECC v2 — BECC-NEXT-008A Synthetic Backup/Restore & TLS Preparation Test Suite (Phases 18 & 19)
 *
 * Verifies:
 * - Logical export of audit ledger records
 * - Synthetic restore into disposable target with row-count & checksum parity
 * - Tamper detection and fail-closed integrity check on corrupt backups
 * - Strict TLS / CA bundle configuration path support (Phase 18)
 * - Zero global or driver TLS bypass
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { InMemoryBeccAuditLedger } from '../audit/in-memory-audit-ledger.adapter.js';
import { SyntheticBackupRestoreHarness } from '../audit/synthetic-backup-restore-harness.js';
import { loadDeployedConfig } from '../config/index.js';

describe('BECC-NEXT-008A: Backup/Restore Harness & Strict TLS Preparation', () => {
  describe('Synthetic Backup & Restore Harness (Phase 19)', () => {
    it('exports audit ledger, restores into disposable target, and verifies checksum parity', async () => {
      const sourceLedger = new InMemoryBeccAuditLedger();
      await sourceLedger.append({
        auditRecordId: 'rec-001',
        operationType: 'GUIDANCE_RESOLUTION',
        operationId: 'op-001',
        resultStatus: 'SUCCESS',
        correlationRef: 'corr-001',
        occurredAt: '2026-10-23T10:00:00.000Z',
        inputRefs: [],
        evidenceRefs: [],
        provenanceRefs: []
      });
      await sourceLedger.append({
        auditRecordId: 'rec-002',
        operationType: 'FINDING_ESCALATION',
        operationId: 'op-002',
        resultStatus: 'SUCCESS',
        correlationRef: 'corr-002',
        occurredAt: '2026-10-23T10:05:00.000Z',
        inputRefs: [],
        evidenceRefs: [],
        provenanceRefs: []
      });

      // Export
      const backup = await SyntheticBackupRestoreHarness.exportBackup(sourceLedger);
      assert.strictEqual(backup.recordCount, 2);
      assert.ok(backup.recordsChecksum.length === 64);

      // Restore into disposable target
      const targetLedger = new InMemoryBeccAuditLedger();
      const res = await SyntheticBackupRestoreHarness.restoreAndVerify(backup, targetLedger);

      assert.strictEqual(res.verified, true);
      assert.strictEqual(res.sourceRecordCount, 2);
      assert.strictEqual(res.restoredRecordCount, 2);
      assert.strictEqual(res.checksumMatched, true);
      assert.strictEqual(res.errors.length, 0);
    });

    it('fails closed when backup data has been tampered with', async () => {
      const sourceLedger = new InMemoryBeccAuditLedger();
      await sourceLedger.append({
        auditRecordId: 'rec-tamper-01',
        operationType: 'GUIDANCE_RESOLUTION',
        operationId: 'op-tamper-01',
        resultStatus: 'SUCCESS',
        correlationRef: 'corr-001',
        occurredAt: '2026-10-23T10:00:00.000Z',
        inputRefs: [],
        evidenceRefs: [],
        provenanceRefs: []
      });

      const backup = await SyntheticBackupRestoreHarness.exportBackup(sourceLedger);

      // Tamper with records
      const tamperedBackup = {
        ...backup,
        records: [
          {
            ...backup.records[0],
            resultStatus: 'REFUSED' as any
          }
        ]
      };

      const targetLedger = new InMemoryBeccAuditLedger();
      const res = await SyntheticBackupRestoreHarness.restoreAndVerify(tamperedBackup, targetLedger);

      assert.strictEqual(res.verified, false);
      assert.strictEqual(res.checksumMatched, false);
      assert.ok(res.errors.some((e) => e.includes('checksum does not match manifest')));
    });
  });

  describe('Strict TLS & CA Bundle Loading (Phase 18)', () => {
    it('loads CA bundle content directly from environment variable', () => {
      const caCert = '-----BEGIN CERTIFICATE-----\nMIIB...\n-----END CERTIFICATE-----';
      const config = loadDeployedConfig({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: 'localhost',
        PGPORT: '5432',
        PGDATABASE: 'testdb',
        PGUSER: 'becc_app',
        PGSSL: 'require',
        PGSSL_CA_CONTENT: caCert
      });

      assert.strictEqual(config.postgres?.ssl, true);
      assert.strictEqual(config.postgres?.caBundleContent, caCert);
      assert.strictEqual(config.postgres?.rejectUnauthorized, true);
    });

    it('loads CA bundle from valid file path', () => {
      const tempCaPath = path.join(process.cwd(), 'scratch-temp-ca.crt');
      const caCert = '-----BEGIN CERTIFICATE-----\nTEST_CA_BUNDLE\n-----END CERTIFICATE-----';
      fs.writeFileSync(tempCaPath, caCert, 'utf8');

      try {
        const config = loadDeployedConfig({
          BECC_STORAGE_TYPE: 'postgres',
          PGHOST: 'localhost',
          PGPORT: '5432',
          PGDATABASE: 'testdb',
          PGUSER: 'becc_app',
          PGSSL: 'true',
          PGSSL_CA_PATH: tempCaPath
        });

        assert.strictEqual(config.postgres?.ssl, true);
        assert.strictEqual(config.postgres?.caBundleContent, caCert);
        assert.strictEqual(config.postgres?.rejectUnauthorized, true);
      } finally {
        if (fs.existsSync(tempCaPath)) {
          fs.unlinkSync(tempCaPath);
        }
      }
    });

    it('fails closed when configured PGSSL_CA_PATH does not exist', () => {
      assert.throws(
        () =>
          loadDeployedConfig({
            BECC_STORAGE_TYPE: 'postgres',
            PGHOST: 'localhost',
            PGPORT: '5432',
            PGDATABASE: 'testdb',
            PGUSER: 'becc_app',
            PGSSL: 'true',
            PGSSL_CA_PATH: 'non_existent_ca_path.crt'
          }),
        /not found on disk/
      );
    });
  });
});
