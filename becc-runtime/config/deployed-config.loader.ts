/**
 * BECC v2 — Deployed Runtime Configuration Loader
 *
 * Implements strict, declarative environment-driven configuration for BECC v2 deployed runtime.
 * Enforces fail-closed validation, explicit storage type selection, no silent fallback to in-memory,
 * and zero secret leakage in diagnostics and error messages.
 */

import type { BeccAuditLedgerConfig } from '../audit/becc-audit-ledger.factory.js';

export class ConfigurationError extends Error {
  public readonly code = 'CONFIGURATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export type StorageType = 'postgres' | 'in-memory';

export interface DeployedPostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl?: boolean;
}

export interface DeployedRuntimeConfig {
  storageType: StorageType;
  postgres?: DeployedPostgresConfig;
}

const VALID_STORAGE_TYPES: ReadonlySet<string> = new Set(['postgres', 'in-memory']);
const VALID_SSL_TRUE: ReadonlySet<string> = new Set(['true', 'require']);
const VALID_SSL_FALSE: ReadonlySet<string> = new Set(['false', 'disable']);

export function parsePgSsl(val: string | undefined): boolean | undefined {
  if (val === undefined || val.trim() === '') {
    return undefined;
  }
  const normalized = val.trim().toLowerCase();
  if (VALID_SSL_TRUE.has(normalized)) {
    return true;
  }
  if (VALID_SSL_FALSE.has(normalized)) {
    return false;
  }
  throw new ConfigurationError(
    `Invalid PGSSL value '${val}'. Must be one of: 'true', 'false', 'require', 'disable'.`
  );
}

export function loadDeployedConfig(env: NodeJS.ProcessEnv = process.env): DeployedRuntimeConfig {
  const rawStorageType = env.BECC_STORAGE_TYPE;
  if (!rawStorageType || rawStorageType.trim() === '') {
    throw new ConfigurationError(
      "Missing required environment variable BECC_STORAGE_TYPE. Must be explicitly set to 'postgres' or 'in-memory' (silent fallback prohibited)."
    );
  }

  const storageType = rawStorageType.trim().toLowerCase();
  if (!VALID_STORAGE_TYPES.has(storageType)) {
    throw new ConfigurationError(
      `Unsupported BECC_STORAGE_TYPE '${rawStorageType}'. Must be 'postgres' or 'in-memory'.`
    );
  }

  if (storageType === 'in-memory') {
    return { storageType: 'in-memory' };
  }

  // PostgreSQL mode: validate required connection parameters
  const host = env.PGHOST?.trim();
  if (!host) {
    throw new ConfigurationError('Missing or empty required environment variable PGHOST.');
  }

  const rawPort = env.PGPORT?.trim();
  if (!rawPort) {
    throw new ConfigurationError('Missing or empty required environment variable PGPORT.');
  }
  const port = parseInt(rawPort, 10);
  if (isNaN(port) || port < 1 || port > 65535 || String(port) !== rawPort) {
    throw new ConfigurationError(
      `Invalid PGPORT '${rawPort}'. Must be an integer between 1 and 65535.`
    );
  }

  const database = env.PGDATABASE?.trim();
  if (!database) {
    throw new ConfigurationError('Missing or empty required environment variable PGDATABASE.');
  }

  const user = env.PGUSER?.trim();
  if (!user) {
    throw new ConfigurationError('Missing or empty required environment variable PGUSER.');
  }

  const password = env.PGPASSWORD !== undefined && env.PGPASSWORD !== '' ? env.PGPASSWORD : undefined;
  const ssl = parsePgSsl(env.PGSSL);

  return {
    storageType: 'postgres',
    postgres: {
      host,
      port,
      database,
      user,
      password,
      ssl
    }
  };
}

export function toAuditLedgerConfig(config: DeployedRuntimeConfig): BeccAuditLedgerConfig {
  if (config.storageType === 'in-memory') {
    return { storageType: 'in-memory' };
  }
  return {
    storageType: 'postgres',
    postgres: {
      host: config.postgres!.host,
      port: config.postgres!.port,
      database: config.postgres!.database,
      user: config.postgres!.user,
      password: config.postgres!.password,
      ssl: config.postgres!.ssl
    }
  };
}
