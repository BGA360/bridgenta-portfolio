/**
 * BECC v2 — BECC-NEXT-008A Telemetry & Observability Test Suite (GAP-PROD-006)
 *
 * Verifies:
 * - Structured operational events creation & redaction
 * - Health and readiness dependency signaling
 * - Version release SHA exposure and runtime identity
 * - Database and storage connectivity signals
 * - Degraded-state and misconfiguration fail-closed behavior
 * - Zero secret leakage across all operational outputs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BeccHttpServer } from '../server/becc-http-server.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';
import { BeccStructuredOperationalEvent } from '../observability/observability.types.js';

describe('BECC-NEXT-008A: Telemetry & Observability (GAP-PROD-006)', () => {
  it('emits structured operational events and enforces sensitive data redaction', () => {
    const rawEvent: BeccStructuredOperationalEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'CONFIG_VALIDATION',
      severity: 'INFO',
      component: 'CONFIG_LOADER',
      environment: 'production',
      releaseSha: 'a'.repeat(40),
      runtimeId: 'test-runtime-123',
      state: 'HEALTHY',
      dependency: 'NONE',
      safeMessage: 'Validation passed with password=SUPER_SECRET_123 and token ghp_123456789012345678901234567890123456',
      metadata: {
        dbUser: 'becc_app',
        secretToken: 'Bearer super_secret_token_val',
        port: 5432
      }
    };

    const sanitized = ObservabilitySecurityPolicy.sanitizeStructuredEvent(rawEvent);
    assert.strictEqual(sanitized.eventType, 'CONFIG_VALIDATION');
    assert.strictEqual(sanitized.state, 'HEALTHY');
    assert.ok(!sanitized.safeMessage.includes('SUPER_SECRET_123'));
    assert.ok(!sanitized.safeMessage.includes('ghp_123456789012345678901234567890123456'));
    assert.strictEqual(sanitized.metadata?.secretToken, '[REDACTED]');
    assert.strictEqual(sanitized.metadata?.port, 5432);
  });

  it('probes health and readiness with structured dependency signals in in-memory mode', async () => {
    const server = new BeccHttpServer({
      port: 0,
      host: '127.0.0.1',
      env: {
        BECC_STORAGE_TYPE: 'in-memory',
        BECC_RELEASE_SHA: 'b'.repeat(40),
        BECC_ENV: 'test'
      }
    });

    const report = await server.probeHealth();
    assert.strictEqual(report.healthState, 'HEALTHY');
    assert.strictEqual(report.liveness, true);
    assert.strictEqual(report.readiness, true);
    assert.strictEqual(report.storageMode, 'in-memory');
    assert.strictEqual(report.releaseSha, 'b'.repeat(40));
    assert.strictEqual(report.environment, 'test');
    assert.ok(report.runtimeId.startsWith('becc-'));
    assert.strictEqual(report.dependencies.storage.reachable, true);
    assert.strictEqual(report.dependencies.storage.auditPersistenceAvailable, true);
  });

  it('probes health and readiness fail closed when database is unreachable in postgres mode', async () => {
    const server = new BeccHttpServer({
      port: 0,
      host: '127.0.0.1',
      env: {
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: '127.0.0.1',
        PGPORT: '59997',
        PGDATABASE: 'testdb',
        PGUSER: 'testuser',
        PGPASSWORD: 'secret_password_test_008a',
        BECC_RELEASE_SHA: 'c'.repeat(40)
      }
    });

    const report = await server.probeHealth();
    assert.strictEqual(report.healthState, 'UNAVAILABLE');
    assert.strictEqual(report.liveness, true);
    assert.strictEqual(report.readiness, false);
    assert.strictEqual(report.storageMode, 'postgres');
    assert.strictEqual(report.dependencies.storage.reachable, false);
    assert.strictEqual(report.dependencies.storage.auditPersistenceAvailable, false);
    assert.ok(!JSON.stringify(report).includes('secret_password_test_008a'));
  });

  it('probes health returns MISCONFIGURED when required configuration is missing', async () => {
    const server = new BeccHttpServer({
      port: 0,
      host: '127.0.0.1',
      env: {}
    });

    const report = await server.probeHealth();
    assert.strictEqual(report.healthState, 'MISCONFIGURED');
    assert.strictEqual(report.liveness, false);
    assert.strictEqual(report.readiness, false);
    assert.strictEqual(report.storageMode, 'unconfigured');
    assert.strictEqual(report.dependencies.storage.reachable, false);
  });

  it('proves false healthy state is impossible when dependency fails', async () => {
    const mockUnhealthyLedger = {
      checkHealth: async () => ({
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState: 'UNAVAILABLE' as const,
        liveness: true,
        readiness: false,
        details: { safeMessage: 'Simulated connection failure' },
        occurredAt: new Date().toISOString()
      }),
      close: async () => {}
    };

    const server = new BeccHttpServer({
      port: 0,
      host: '127.0.0.1',
      env: {
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: '127.0.0.1',
        PGPORT: '5432',
        PGDATABASE: 'testdb',
        PGUSER: 'testuser'
      },
      ledger: mockUnhealthyLedger
    });

    const health = await server.probeHealth();
    const ready = await server.probeReadiness();

    assert.notStrictEqual(health.healthState, 'HEALTHY');
    assert.strictEqual(health.readiness, false);
    assert.strictEqual(ready.readiness, false);
  });
});
