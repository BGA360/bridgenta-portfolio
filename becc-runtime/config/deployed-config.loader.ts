/**
 * BECC v2 — Deployed Runtime Configuration Loader
 *
 * Implements strict, declarative environment-driven configuration for BECC v2 deployed runtime.
 * Enforces fail-closed validation, explicit storage type selection, no silent fallback to in-memory,
 * provider-neutral secret management abstraction (GAP-PROD-007), strict TLS / CA bundle support (Phase 18),
 * and zero secret leakage in diagnostics and error messages.
 */

import fs from 'node:fs';
import type { BeccAuditLedgerConfig } from '../audit/becc-audit-ledger.factory.js';
import { ISecretProvider, EnvironmentSecretProvider } from '../secrets/index.js';

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
  caBundlePath?: string;
  caBundleContent?: string;
  rejectUnauthorized?: boolean;
}

export interface DeployedRuntimeConfig {
  storageType: StorageType;
  postgres?: DeployedPostgresConfig;
  releaseSha?: string;
  environment?: string;
  runtimeId?: string;
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

export function loadDeployedConfig(
  env: NodeJS.ProcessEnv = process.env,
  secretProvider?: ISecretProvider
): DeployedRuntimeConfig {
  const secrets = secretProvider ?? new EnvironmentSecretProvider(env);

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

  const releaseSha = env.BECC_RELEASE_SHA || env.GITHUB_SHA || undefined;
  const environment = env.BECC_ENV || env.NODE_ENV || 'production';

  if (storageType === 'in-memory') {
    return {
      storageType: 'in-memory',
      releaseSha,
      environment
    };
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

  // Password read via secret management abstraction
  const password = secrets.getOptionalSecret('PGPASSWORD');
  const ssl = parsePgSsl(env.PGSSL);

  // CA bundle support for strict TLS (Phase 18)
  const caBundlePath = secrets.getOptionalSecret('PGSSL_CA_PATH') ?? env.PGSSL_CA_PATH;
  let caBundleContent = secrets.getOptionalSecret('PGSSL_CA_CONTENT') ?? env.PGSSL_CA_CONTENT;

  if (caBundlePath && !caBundleContent) {
    try {
      if (fs.existsSync(caBundlePath)) {
        caBundleContent = fs.readFileSync(caBundlePath, 'utf8');
      } else {
        throw new ConfigurationError(`Configured PGSSL_CA_PATH '${caBundlePath}' not found on disk.`);
      }
    } catch (err: any) {
      if (err instanceof ConfigurationError) throw err;
      throw new ConfigurationError(`Failed to read PGSSL_CA_PATH '${caBundlePath}': ${err.message}`);
    }
  }

  return {
    storageType: 'postgres',
    releaseSha,
    environment,
    postgres: {
      host,
      port,
      database,
      user,
      password,
      ssl,
      caBundlePath,
      caBundleContent,
      rejectUnauthorized: true // Strict by default, never allow bypass
    }
  };
}

export function toAuditLedgerConfig(config: DeployedRuntimeConfig): BeccAuditLedgerConfig {
  if (config.storageType === 'in-memory') {
    return { storageType: 'in-memory' };
  }

  const pg = config.postgres!;
  let sslOption: boolean | object | undefined = pg.ssl;

  if (pg.ssl === true) {
    if (pg.caBundleContent) {
      sslOption = {
        rejectUnauthorized: true,
        ca: pg.caBundleContent
      };
    } else {
      sslOption = {
        rejectUnauthorized: true
      };
    }
  } else if (pg.ssl === false) {
    sslOption = false;
  }

  return {
    storageType: 'postgres',
    postgres: {
      host: pg.host,
      port: pg.port,
      database: pg.database,
      user: pg.user,
      password: pg.password,
      ssl: sslOption
    }
  };
}
