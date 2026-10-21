/**
 * BECC v2 — Deployed Runtime HTTP Service
 *
 * Implements the minimal real deployed runtime HTTP service for BECC v2.
 * Exposes live-reachable /health and /ready endpoints, version/metadata endpoints,
 * adheres to fail-closed configuration, zero-secret-leakage guarantees,
 * and graceful lifecycle management.
 */

import http from 'node:http';
import { URL } from 'node:url';
import { loadDeployedConfig, DeployedRuntimeConfig, ConfigurationError } from '../config/index.js';
import { PostgresBeccAuditLedger } from '../audit/postgres-audit-ledger.adapter.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';

export interface HealthReport {
  component: string;
  healthState: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'MISCONFIGURED';
  liveness: boolean;
  readiness: boolean;
  details: Record<string, unknown>;
  occurredAt: string;
}

export interface BeccHttpServerOptions {
  port?: number;
  host?: string;
  env?: NodeJS.ProcessEnv;
  ledger?: any; // For injection in tests
}

export class BeccHttpServer {
  private readonly port: number;
  private readonly host: string;
  private readonly env: NodeJS.ProcessEnv;
  private server: http.Server | null = null;
  private ledger: any | null = null;
  private isOwnedLedger = false;
  private isShuttingDown = false;
  private runtimeConfig: DeployedRuntimeConfig | null = null;
  private configError: string | null = null;

  constructor(options: BeccHttpServerOptions = {}) {
    this.env = options.env ?? process.env;
    const rawPort = options.port ?? (this.env.BECC_PORT ? parseInt(this.env.BECC_PORT, 10) : undefined) ?? (this.env.PORT ? parseInt(this.env.PORT, 10) : 8080);
    this.port = isNaN(rawPort) ? 8080 : rawPort;
    this.host = options.host ?? this.env.BECC_HOST ?? this.env.HOST ?? '0.0.0.0';

    if (options.ledger) {
      this.ledger = options.ledger;
      this.isOwnedLedger = false;
    }

    try {
      this.runtimeConfig = loadDeployedConfig(this.env);
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

  public getRuntimeConfig(): DeployedRuntimeConfig | null {
    return this.runtimeConfig;
  }

  public async probeHealth(): Promise<HealthReport> {
    if (this.configError || !this.runtimeConfig) {
      return {
        component: 'BECC_RUNTIME',
        healthState: 'MISCONFIGURED',
        liveness: false,
        readiness: false,
        details: { safeMessage: this.configError || 'Missing runtime configuration' },
        occurredAt: new Date().toISOString()
      };
    }

    if (this.ledger) {
      try {
        return await this.ledger.checkHealth();
      } catch (err: any) {
        const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'PERSISTENCE');
        return {
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'UNAVAILABLE',
          liveness: false,
          readiness: false,
          details: { safeMessage: safeErr.safeMessage },
          occurredAt: new Date().toISOString()
        };
      }
    }

    if (this.runtimeConfig.storageType === 'in-memory') {
      return {
        component: 'IN_MEMORY_AUDIT_LEDGER',
        healthState: 'HEALTHY',
        liveness: true,
        readiness: true,
        details: { safeMessage: 'In-memory audit persistence active (L0 mode)' },
        occurredAt: new Date().toISOString()
      };
    }

    if (!this.ledger) {
      this.ledger = new PostgresBeccAuditLedger({ ...this.runtimeConfig.postgres, autoMigrate: false });
      this.isOwnedLedger = true;
    }

    try {
      return await this.ledger.checkHealth();
    } catch (err: any) {
      const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'PERSISTENCE');
      return {
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState: 'UNAVAILABLE',
        liveness: false,
        readiness: false,
        details: { safeMessage: safeErr.safeMessage },
        occurredAt: new Date().toISOString()
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
        const statusCode = (report.healthState === 'HEALTHY' || report.healthState === 'DEGRADED') ? 200 : 503;
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
          releaseSha: this.env.BECC_RELEASE_SHA || this.env.GITHUB_SHA || 'unknown',
          storageType: this.runtimeConfig ? this.runtimeConfig.storageType : 'unconfigured',
          status: this.configError ? 'MISCONFIGURED' : 'OPERATIONAL',
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

    // If Postgres is configured and no ledger injected, initialize ledger eagerly or verify config
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

    if (this.ledger && this.isOwnedLedger && typeof this.ledger.close === 'function') {
      try {
        await this.ledger.close();
      } catch {
        // Suppress teardown errors
      }
      this.ledger = null;
    }
  }
}
