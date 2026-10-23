/**
 * BECC v2 — Deployed Runtime HTTP Service (GAP-PROD-006 & GAP-PROD-007)
 *
 * Implements the real deployed runtime HTTP service for BECC v2.
 * Exposes live-reachable /health, /ready, and /version endpoints with structured telemetry,
 * dependency health signaling, release provenance, fail-closed configuration,
 * zero-secret-leakage guarantees, and graceful lifecycle management.
 */

import http from 'node:http';
import { URL } from 'node:url';
import { loadDeployedConfig, DeployedRuntimeConfig, ConfigurationError } from '../config/index.js';
import { PostgresBeccAuditLedger } from '../audit/postgres-audit-ledger.adapter.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';
import { ISecretProvider, EnvironmentSecretProvider } from '../secrets/index.js';

export interface StorageDependencyReport {
  name: string;
  state: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  reachable: boolean;
  auditPersistenceAvailable: boolean;
  safeMessage: string;
}

export interface HealthReport {
  component: string;
  healthState: 'HEALTHY' | 'DEGRADED' | 'NOT_READY' | 'MISCONFIGURED' | 'UNAVAILABLE';
  liveness: boolean;
  readiness: boolean;
  runtimeId: string;
  releaseSha: string;
  environment: string;
  storageMode: 'postgres' | 'in-memory' | 'unconfigured';
  dependencies: {
    storage: StorageDependencyReport;
  };
  details: Record<string, unknown>;
  occurredAt: string;
}

export interface BeccHttpServerOptions {
  port?: number;
  host?: string;
  env?: NodeJS.ProcessEnv;
  ledger?: any; // For injection in tests
  secretProvider?: ISecretProvider;
}

export class BeccHttpServer {
  private readonly port: number;
  private readonly host: string;
  private readonly env: NodeJS.ProcessEnv;
  private readonly secretProvider: ISecretProvider;
  private readonly runtimeId: string;
  private server: http.Server | null = null;
  private ledger: any | null = null;
  private isOwnedLedger = false;
  private isShuttingDown = false;
  private runtimeConfig: DeployedRuntimeConfig | null = null;
  private configError: string | null = null;

  constructor(options: BeccHttpServerOptions = {}) {
    this.env = options.env ?? process.env;
    this.secretProvider = options.secretProvider ?? new EnvironmentSecretProvider(this.env);
    this.runtimeId = `becc-${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

    const rawPort =
      options.port ??
      (this.env.BECC_PORT ? parseInt(this.env.BECC_PORT, 10) : undefined) ??
      (this.env.PORT ? parseInt(this.env.PORT, 10) : 8080);
    this.port = isNaN(rawPort) ? 8080 : rawPort;
    this.host = options.host ?? this.env.BECC_HOST ?? this.env.HOST ?? '0.0.0.0';

    if (options.ledger) {
      this.ledger = options.ledger;
      this.isOwnedLedger = false;
    }

    try {
      this.runtimeConfig = loadDeployedConfig(this.env, this.secretProvider);
    } catch (err: any) {
      this.configError = err instanceof Error ? err.message : String(err);
    }
  }

  public getPort(): number {
    if (this.server && this.server.listening) {
      const addr = this.server.address();
      if (addr && typeof addr === 'object') {
        return addr.port;
      }
    }
    return this.port;
  }

  public getHost(): string {
    return this.host;
  }

  public getRuntimeId(): string {
    return this.runtimeId;
  }

  public getRuntimeConfig(): DeployedRuntimeConfig | null {
    return this.runtimeConfig;
  }

  public async probeHealth(): Promise<HealthReport> {
    const occurredAt = new Date().toISOString();
    const releaseSha =
      this.runtimeConfig?.releaseSha || this.env.BECC_RELEASE_SHA || this.env.GITHUB_SHA || 'unknown';
    const environment =
      this.runtimeConfig?.environment || this.env.BECC_ENV || this.env.NODE_ENV || 'production';

    if (this.configError || !this.runtimeConfig) {
      return {
        component: 'BECC_RUNTIME',
        healthState: 'MISCONFIGURED',
        liveness: false,
        readiness: false,
        runtimeId: this.runtimeId,
        releaseSha,
        environment,
        storageMode: 'unconfigured',
        dependencies: {
          storage: {
            name: 'UNCONFIGURED_STORAGE',
            state: 'UNAVAILABLE',
            reachable: false,
            auditPersistenceAvailable: false,
            safeMessage: ObservabilitySecurityPolicy.sanitizeString(
              this.configError || 'Missing runtime configuration'
            )
          }
        },
        details: {
          safeMessage: ObservabilitySecurityPolicy.sanitizeString(
            this.configError || 'Missing runtime configuration'
          )
        },
        occurredAt
      };
    }

    if (this.ledger) {
      try {
        const ledgerHealth = await this.ledger.checkHealth();
        const isHealthy = ledgerHealth.healthState === 'HEALTHY';
        const healthState = isHealthy ? 'HEALTHY' : (ledgerHealth.healthState ?? 'UNAVAILABLE');
        const safeMessage = ObservabilitySecurityPolicy.sanitizeString(
          ledgerHealth.details?.safeMessage ||
            (isHealthy ? 'Audit ledger healthy' : 'Audit ledger degraded')
        );

        return {
          component: ledgerHealth.component || 'POSTGRES_AUDIT_LEDGER',
          healthState,
          liveness: ledgerHealth.liveness ?? isHealthy,
          readiness: ledgerHealth.readiness ?? isHealthy,
          runtimeId: this.runtimeId,
          releaseSha,
          environment,
          storageMode: this.runtimeConfig.storageType,
          dependencies: {
            storage: {
              name: ledgerHealth.component || 'POSTGRES_AUDIT_LEDGER',
              state: isHealthy ? 'HEALTHY' : 'UNAVAILABLE',
              reachable: ledgerHealth.readiness ?? isHealthy,
              auditPersistenceAvailable: ledgerHealth.readiness ?? isHealthy,
              safeMessage
            }
          },
          details: {
            safeMessage,
            ...ledgerHealth.details
          },
          occurredAt
        };
      } catch (err: any) {
        const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'PERSISTENCE');
        return {
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'UNAVAILABLE',
          liveness: false,
          readiness: false,
          runtimeId: this.runtimeId,
          releaseSha,
          environment,
          storageMode: this.runtimeConfig.storageType,
          dependencies: {
            storage: {
              name: 'POSTGRES_AUDIT_LEDGER',
              state: 'UNAVAILABLE',
              reachable: false,
              auditPersistenceAvailable: false,
              safeMessage: safeErr.safeMessage
            }
          },
          details: { safeMessage: safeErr.safeMessage },
          occurredAt
        };
      }
    }

    if (this.runtimeConfig.storageType === 'in-memory') {
      return {
        component: 'IN_MEMORY_AUDIT_LEDGER',
        healthState: 'HEALTHY',
        liveness: true,
        readiness: true,
        runtimeId: this.runtimeId,
        releaseSha,
        environment,
        storageMode: 'in-memory',
        dependencies: {
          storage: {
            name: 'IN_MEMORY_AUDIT_LEDGER',
            state: 'HEALTHY',
            reachable: true,
            auditPersistenceAvailable: true,
            safeMessage: 'In-memory audit persistence active (L0 test/dev mode)'
          }
        },
        details: { safeMessage: 'In-memory audit persistence active (L0 mode)' },
        occurredAt
      };
    }

    // PostgreSQL Mode: verify storage dependency
    if (!this.ledger) {
      this.ledger = new PostgresBeccAuditLedger({ ...this.runtimeConfig.postgres, autoMigrate: false });
      this.isOwnedLedger = true;
    }

    try {
      const ledgerHealth = await this.ledger.checkHealth();
      const isHealthy = ledgerHealth.healthState === 'HEALTHY';
      const healthState = isHealthy ? 'HEALTHY' : (ledgerHealth.healthState ?? 'UNAVAILABLE');
      const safeMessage = ObservabilitySecurityPolicy.sanitizeString(
        ledgerHealth.details?.safeMessage || (isHealthy ? 'PostgreSQL audit ledger healthy' : 'PostgreSQL audit ledger degraded')
      );

      return {
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState,
        liveness: ledgerHealth.liveness ?? isHealthy,
        readiness: ledgerHealth.readiness ?? isHealthy,
        runtimeId: this.runtimeId,
        releaseSha,
        environment,
        storageMode: 'postgres',
        dependencies: {
          storage: {
            name: 'POSTGRES_AUDIT_LEDGER',
            state: isHealthy ? 'HEALTHY' : 'UNAVAILABLE',
            reachable: isHealthy,
            auditPersistenceAvailable: isHealthy,
            safeMessage
          }
        },
        details: {
          safeMessage,
          ...ledgerHealth.details
        },
        occurredAt
      };
    } catch (err: any) {
      const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'PERSISTENCE');
      return {
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState: 'UNAVAILABLE',
        liveness: false,
        readiness: false,
        runtimeId: this.runtimeId,
        releaseSha,
        environment,
        storageMode: 'postgres',
        dependencies: {
          storage: {
            name: 'POSTGRES_AUDIT_LEDGER',
            state: 'UNAVAILABLE',
            reachable: false,
            auditPersistenceAvailable: false,
            safeMessage: safeErr.safeMessage
          }
        },
        details: { safeMessage: safeErr.safeMessage },
        occurredAt
      };
    }
  }

  public async probeReadiness(): Promise<HealthReport> {
    return this.probeHealth();
  }

  private handleRequest = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
      const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;

      // Method restriction: only GET and HEAD allowed
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }

      // Security headers
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      if (pathname === '/health' || pathname === '/healthz') {
        const report = await this.probeHealth();
        const statusCode =
          report.healthState === 'HEALTHY' || report.healthState === 'DEGRADED' ? 200 : 503;
        res.writeHead(statusCode);
        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(JSON.stringify(report, null, 2));
        }
        return;
      }

      if (pathname === '/ready' || pathname === '/readyz') {
        const report = await this.probeReadiness();
        const statusCode = report.readiness === true ? 200 : 503;
        res.writeHead(statusCode);
        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(JSON.stringify(report, null, 2));
        }
        return;
      }

      if (pathname === '/version' || pathname === '/meta') {
        const versionPayload = {
          name: 'becc-runtime',
          version: '2.0.0-GA',
          releaseSha:
            this.runtimeConfig?.releaseSha ||
            this.env.BECC_RELEASE_SHA ||
            this.env.GITHUB_SHA ||
            'unknown',
          environment:
            this.runtimeConfig?.environment ||
            this.env.BECC_ENV ||
            this.env.NODE_ENV ||
            'production',
          storageType: this.runtimeConfig ? this.runtimeConfig.storageType : 'unconfigured',
          status: this.configError ? 'MISCONFIGURED' : 'OPERATIONAL',
          runtimeId: this.runtimeId,
          timestamp: new Date().toISOString()
        };
        res.writeHead(200);
        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(JSON.stringify(versionPayload, null, 2));
        }
        return;
      }

      // 404 for all other paths
      res.writeHead(404);
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (err: any) {
      const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'INTERNAL');
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Internal Server Error', safeMessage: safeErr.safeMessage }));
    }
  };

  public async start(): Promise<{ port: number; host: string }> {
    if (this.server) {
      return { port: this.getPort(), host: this.host };
    }

    if (this.runtimeConfig && this.runtimeConfig.storageType === 'postgres' && !this.ledger) {
      this.ledger = new PostgresBeccAuditLedger({ ...this.runtimeConfig.postgres, autoMigrate: false });
      this.isOwnedLedger = true;
    }

    this.server = http.createServer(this.handleRequest);

    return new Promise((resolve, reject) => {
      this.server!.once('error', (err) => {
        reject(err);
      });

      this.server!.listen(this.port, this.host, () => {
        resolve({ port: this.getPort(), host: this.host });
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }

    if (this.isOwnedLedger && this.ledger && typeof this.ledger.close === 'function') {
      try {
        await this.ledger.close();
      } catch (_err) {
        // Suppress teardown errors
      }
      this.ledger = null;
    }
  }
}
