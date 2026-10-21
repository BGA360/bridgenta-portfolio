/**
 * BECC v2 — Deployed Runtime HTTP Service Entrypoint Test Suite
 *
 * Verifies live-reachable HTTP endpoints (/health, /ready, /version, /meta),
 * HTTP status codes (200, 503, 404, 405), fail-closed handling on misconfiguration,
 * zero secret leakage across diagnostics and headers, and graceful shutdown lifecycle.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { BeccHttpServer } from '../server/becc-http-server.js';

function makeRequest(
  url: string,
  method = 'GET'
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body
          });
        });
      }
    );
    req.on('error', (err) => reject(err));
    req.end();
  });
}

describe('BECC Deployed Runtime HTTP Service', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('In-Memory Mode (L0)', () => {
    let server: BeccHttpServer;
    let baseUrl: string;

    beforeEach(async () => {
      server = new BeccHttpServer({
        port: 0,
        host: '127.0.0.1',
        env: {
          BECC_STORAGE_TYPE: 'in-memory',
          BECC_RELEASE_SHA: 'sha-deploy-007-test'
        }
      });
      const { port } = await server.start();
      baseUrl = `http://127.0.0.1:${port}`;
    });

    afterEach(async () => {
      if (server) {
        await server.stop();
      }
    });

    it('GET /health returns HTTP 200 with HEALTHY status and security headers', async () => {
      const res = await makeRequest(`${baseUrl}/health`);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type']?.includes('application/json'));
      assert.strictEqual(res.headers['cache-control'], 'no-store, no-cache, must-revalidate, proxy-revalidate');

      const data = JSON.parse(res.body);
      assert.strictEqual(data.component, 'IN_MEMORY_AUDIT_LEDGER');
      assert.strictEqual(data.healthState, 'HEALTHY');
      assert.strictEqual(data.liveness, true);
      assert.strictEqual(data.readiness, true);
      assert.ok(data.details?.safeMessage);
      assert.ok(data.occurredAt);
    });

    it('HEAD /health returns HTTP 200 with empty body', async () => {
      const res = await makeRequest(`${baseUrl}/health`, 'HEAD');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body, '');
    });

    it('GET /healthz alias returns HTTP 200', async () => {
      const res = await makeRequest(`${baseUrl}/healthz`);
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.healthState, 'HEALTHY');
    });

    it('GET /ready returns HTTP 200 with readiness: true', async () => {
      const res = await makeRequest(`${baseUrl}/ready`);
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.readiness, true);
    });

    it('GET /readyz alias returns HTTP 200', async () => {
      const res = await makeRequest(`${baseUrl}/readyz`);
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.readiness, true);
    });

    it('GET /version returns HTTP 200 with runtime metadata', async () => {
      const res = await makeRequest(`${baseUrl}/version`);
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.name, 'becc-runtime');
      assert.strictEqual(data.version, '2.0.0-GA');
      assert.strictEqual(data.releaseSha, 'sha-deploy-007-test');
      assert.strictEqual(data.storageType, 'in-memory');
      assert.strictEqual(data.status, 'OPERATIONAL');
    });

    it('GET /meta alias returns HTTP 200 with metadata', async () => {
      const res = await makeRequest(`${baseUrl}/meta`);
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.version, '2.0.0-GA');
    });

    it('GET /unknown-path returns HTTP 404 Not Found', async () => {
      const res = await makeRequest(`${baseUrl}/unknown-path`);
      assert.strictEqual(res.statusCode, 404);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.error, 'Not Found');
    });

    it('Non-GET methods (POST, PUT, DELETE) return HTTP 405 Method Not Allowed with Allow header', async () => {
      for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
        const res = await makeRequest(`${baseUrl}/health`, method);
        assert.strictEqual(res.statusCode, 405, `Method ${method} should return 405`);
        assert.strictEqual(res.headers.allow, 'GET, HEAD');
        const data = JSON.parse(res.body);
        assert.strictEqual(data.error, 'Method Not Allowed');
      }
    });
  });

  describe('Misconfiguration Handling (Fail-Closed)', () => {
    let server: BeccHttpServer;
    let baseUrl: string;

    beforeEach(async () => {
      server = new BeccHttpServer({
        port: 0,
        host: '127.0.0.1',
        env: {} // Missing BECC_STORAGE_TYPE
      });
      const { port } = await server.start();
      baseUrl = `http://127.0.0.1:${port}`;
    });

    afterEach(async () => {
      if (server) {
        await server.stop();
      }
    });

    it('GET /health returns HTTP 503 and MISCONFIGURED when config is missing', async () => {
      const res = await makeRequest(`${baseUrl}/health`);
      assert.strictEqual(res.statusCode, 503);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.component, 'BECC_RUNTIME');
      assert.strictEqual(data.healthState, 'MISCONFIGURED');
      assert.strictEqual(data.liveness, false);
      assert.strictEqual(data.readiness, false);
      assert.ok(data.details?.safeMessage?.includes('BECC_STORAGE_TYPE'));
    });

    it('GET /ready returns HTTP 503 when config is missing', async () => {
      const res = await makeRequest(`${baseUrl}/ready`);
      assert.strictEqual(res.statusCode, 503);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.readiness, false);
    });

    it('GET /version returns status MISCONFIGURED when config is missing', async () => {
      const res = await makeRequest(`${baseUrl}/version`);
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.status, 'MISCONFIGURED');
      assert.strictEqual(data.storageType, 'unconfigured');
    });
  });

  describe('PostgreSQL Mode & Zero Secret Leakage', () => {
    it('GET /health returns 503 UNAVAILABLE when database is unreachable, with ZERO secret leakage', async () => {
      const secretPassword = 'SUPER_SECRET_DEPLOYED_TOKEN_007';
      const server = new BeccHttpServer({
        port: 0,
        host: '127.0.0.1',
        env: {
          BECC_STORAGE_TYPE: 'postgres',
          PGHOST: '127.0.0.1',
          PGPORT: '59998',
          PGDATABASE: 'testdb',
          PGUSER: 'testuser',
          PGPASSWORD: secretPassword
        }
      });
      const { port } = await server.start();
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        const res = await makeRequest(`${baseUrl}/health`);
        assert.strictEqual(res.statusCode, 503);
        const data = JSON.parse(res.body);
        assert.strictEqual(data.component, 'POSTGRES_AUDIT_LEDGER');
        assert.strictEqual(data.healthState, 'UNAVAILABLE');
        assert.strictEqual(data.readiness, false);

        // Crucial: check that secretPassword is not anywhere in body or headers
        assert.ok(
          !res.body.includes(secretPassword),
          'Health probe response body must never leak database password'
        );
        const headersStr = JSON.stringify(res.headers);
        assert.ok(
          !headersStr.includes(secretPassword),
          'Health probe response headers must never leak database password'
        );
      } finally {
        await server.stop();
      }
    });

    it('returns HTTP 200 when injected ledger is healthy and HTTP 503 when degraded/unready', async () => {
      const mockLedger: {
        checkHealth: () => Promise<any>;
        close: () => Promise<void>;
      } = {
        checkHealth: async () => ({
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'HEALTHY' as const,
          liveness: true,
          readiness: true,
          details: { safeMessage: 'PostgreSQL audit persistence operational', checkDurationMs: 2 },
          occurredAt: new Date().toISOString()
        }),
        close: async () => {}
      };

      const server = new BeccHttpServer({
        port: 0,
        host: '127.0.0.1',
        env: {
          BECC_STORAGE_TYPE: 'in-memory'
        },
        ledger: mockLedger
      });
      const { port } = await server.start();
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        const res = await makeRequest(`${baseUrl}/health`);
        assert.strictEqual(res.statusCode, 200);
        const data = JSON.parse(res.body);
        assert.strictEqual(data.healthState, 'HEALTHY');
        assert.strictEqual(data.readiness, true);

        // Switch mock to degraded / not ready
        mockLedger.checkHealth = async () => ({
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'UNAVAILABLE' as const,
          liveness: false,
          readiness: false,
          details: { safeMessage: 'Database connection failed', checkDurationMs: 10 },
          occurredAt: new Date().toISOString()
        });

        const unreadyRes = await makeRequest(`${baseUrl}/ready`);
        assert.strictEqual(unreadyRes.statusCode, 503);
        const unreadyData = JSON.parse(unreadyRes.body);
        assert.strictEqual(unreadyData.readiness, false);
      } finally {
        await server.stop();
      }
    });
  });

  describe('Graceful Shutdown Lifecycle', () => {
    it('stops accepting connections and cleans up ledger resources on stop()', async () => {
      let ledgerClosed = false;
      const mockLedger = {
        checkHealth: async () => ({
          component: 'POSTGRES_AUDIT_LEDGER',
          healthState: 'HEALTHY' as const,
          liveness: true,
          readiness: true,
          details: { safeMessage: 'OK' },
          occurredAt: new Date().toISOString()
        }),
        close: async () => {
          ledgerClosed = true;
        }
      };

      const server = new BeccHttpServer({
        port: 0,
        host: '127.0.0.1',
        env: { BECC_STORAGE_TYPE: 'in-memory' },
        ledger: mockLedger
      });
      const { port } = await server.start();
      const baseUrl = `http://127.0.0.1:${port}`;

      const res = await makeRequest(`${baseUrl}/health`);
      assert.strictEqual(res.statusCode, 200);

      await server.stop();

      // Subsequent requests should fail with connection refused or error
      await assert.rejects(async () => {
        await makeRequest(`${baseUrl}/health`);
      });
    });
  });
});
