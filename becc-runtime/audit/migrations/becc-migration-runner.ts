/**
 * BECC v2 — PostgreSQL Migration Runner
 *
 * Provides concurrency-safe, integrity-verified migration execution using
 * PostgreSQL advisory locking and SHA-256 checksum validation.
 */

import type { Pool, PoolClient } from 'pg';
import { migration001, MigrationDefinition } from './001_create_becc_audit_records.js';

const BECC_MIGRATION_LOCK_ID = 883229017; // Fixed 64-bit integer key for pg_advisory_xact_lock

export interface BeccMigrationResult {
  appliedMigrations: string[];
  alreadyApplied: string[];
}

export class BeccMigrationRunner {
  private readonly migrations: MigrationDefinition[] = [migration001];

  async run(clientOrPool: Pool | PoolClient): Promise<BeccMigrationResult> {
    const isPool = 'connect' in clientOrPool && typeof (clientOrPool as any).connect === 'function';
    const client: PoolClient = isPool ? await (clientOrPool as Pool).connect() : (clientOrPool as PoolClient);

    const appliedMigrations: string[] = [];
    const alreadyApplied: string[] = [];

    try {
      await client.query('BEGIN');

      // Acquire exclusive transaction-level advisory lock to serialize concurrent migrations
      await client.query('SELECT pg_advisory_xact_lock($1)', [BECC_MIGRATION_LOCK_ID]);

      // Ensure becc schema & migration tracking table exist
      await client.query(`CREATE SCHEMA IF NOT EXISTS becc;`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS becc.schema_migrations (
          migration_id VARCHAR(255) PRIMARY KEY,
          checksum VARCHAR(64) NOT NULL,
          applied_at VARCHAR(128) NOT NULL
        );
      `);

      // Query already applied migrations
      const res = await client.query<{ migration_id: string; checksum: string }>(
        'SELECT migration_id, checksum FROM becc.schema_migrations;'
      );

      const appliedMap = new Map<string, string>();
      for (const row of res.rows) {
        appliedMap.set(row.migration_id, row.checksum);
      }

      for (const migration of this.migrations) {
        const existingChecksum = appliedMap.get(migration.migrationId);

        if (existingChecksum !== undefined) {
          // Checksum integrity verification
          if (existingChecksum !== migration.checksum) {
            throw new Error(
              `Migration checksum mismatch for migration '${migration.migrationId}': applied '${existingChecksum}', current code definition '${migration.checksum}'`
            );
          }
          alreadyApplied.push(migration.migrationId);
        } else {
          // Apply new migration
          await client.query(migration.sql);

          const appliedAt = new Date().toISOString();
          await client.query(
            `INSERT INTO becc.schema_migrations (migration_id, checksum, applied_at) VALUES ($1, $2, $3)`,
            [migration.migrationId, migration.checksum, appliedAt]
          );

          appliedMigrations.push(migration.migrationId);
        }
      }

      await client.query('COMMIT');
      return { appliedMigrations, alreadyApplied };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      if (isPool) {
        client.release();
      }
    }
  }
}
