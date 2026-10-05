/**
 * BECC v2 — Audit Ledger Factory & Composition Module
 *
 * Provides explicit runtime selection between L0 in-memory and L2 PostgreSQL audit storage.
 * Prohibits silent L0 fallback when PostgreSQL mode is configured.
 */

import { BeccAuditLedgerPort } from './audit-ledger.port.js';
import { InMemoryBeccAuditLedger } from './in-memory-audit-ledger.adapter.js';
import {
  PostgresBeccAuditLedger,
  PostgresBeccAuditLedgerOptions
} from './postgres-audit-ledger.adapter.js';

export interface BeccAuditLedgerConfig {
  storageType: 'in-memory' | 'postgres';
  postgres?: PostgresBeccAuditLedgerOptions;
}

export async function createBeccAuditLedger(
  config: BeccAuditLedgerConfig
): Promise<BeccAuditLedgerPort> {
  if (!config || !config.storageType) {
    throw new Error('BeccAuditLedgerConfig requires explicit storageType ("in-memory" or "postgres")');
  }

  if (config.storageType === 'in-memory') {
    return new InMemoryBeccAuditLedger();
  }

  if (config.storageType === 'postgres') {
    const ledger = new PostgresBeccAuditLedger(config.postgres);
    try {
      await ledger.initialize();
      return ledger;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Failed to initialize PostgreSQL durable audit ledger (silent L0 fallback prohibited): ${message}`
      );
    }
  }

  throw new Error(`Unsupported audit ledger storageType '${(config as any).storageType}'`);
}
