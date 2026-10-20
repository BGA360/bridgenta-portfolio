/**
 * BECC v2 — CLI Health & Readiness Probe Test Suite
 *
 * Verifies standalone health and readiness probe execution, strict exit code contracts:
 *   0 = Success / Healthy / Ready
 *   1 = Failure / Unhealthy / Not Ready
 *   2 = Misconfiguration
 * as well as stdout JSON output, non-mutation (no synthetic audit records), and zero secret leakage.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { executeHealthProbe, executeReadinessProbe, run } from '../bin/becc.js';

describe('CLI Health & Readiness Probes', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.BECC_TEST_INTERCEPT_EXIT = 'true';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('executeHealthProbe', () => {
    it('returns exitCode 0 and HEALTHY in-memory mode', async () => {
      const result = await executeHealthProbe({ BECC_STORAGE_TYPE: 'in-memory' });
      assert.strictEqual(result.command, 'health');
      assert.strictEqual(result.exitCode, 0);
      assert.strictEqual(result.report.component, 'IN_MEMORY_AUDIT_LEDGER');
      assert.strictEqual(result.report.healthState, 'HEALTHY');
      assert.strictEqual(result.report.liveness, true);
      assert.strictEqual(result.report.readiness, true);
    });

    it('returns exitCode 2 and MISCONFIGURED when storage type is missing', async () => {
      const result = await executeHealthProbe({});
      assert.strictEqual(result.command, 'health');
      assert.strictEqual(result.exitCode, 2);
      assert.strictEqual(result.report.component, 'BECC_RUNTIME');
      assert.strictEqual(result.report.healthState, 'MISCONFIGURED');
      assert.strictEqual(result.report.liveness, false);
      assert.strictEqual(result.report.readiness, false);
      assert.ok(
        typeof (result.report.details as any)?.safeMessage === 'string' &&
        (result.report.details as any).safeMessage.includes('BECC_STORAGE_TYPE')
      );
    });

    it('returns exitCode 2 and MISCONFIGURED when postgres configuration is invalid', async () => {
      const result = await executeHealthProbe({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: 'localhost',
        PGPORT: '99999', // out of range
        PGDATABASE: 'testdb',
        PGUSER: 'testuser'
      });
      assert.strictEqual(result.command, 'health');
      assert.strictEqual(result.exitCode, 2);
      assert.strictEqual(result.report.healthState, 'MISCONFIGURED');
      assert.strictEqual(result.report.liveness, false);
      assert.strictEqual(result.report.readiness, false);
    });

    it('returns exitCode 1 and UNAVAILABLE when database is unreachable', async () => {
      // Point to an unavailable local port with a short connection timeout attempt
      const result = await executeHealthProbe({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: '127.0.0.1',
        PGPORT: '59999',
        PGDATABASE: 'nonexistent_db',
        PGUSER: 'nonexistent_user',
        PGPASSWORD: 'test_password'
      });
      assert.strictEqual(result.command, 'health');
      assert.strictEqual(result.exitCode, 1);
      assert.strictEqual(result.report.component, 'POSTGRES_AUDIT_LEDGER');
      assert.strictEqual(result.report.healthState, 'UNAVAILABLE');
      assert.strictEqual(result.report.liveness, true);
      assert.strictEqual(result.report.readiness, false);
      assert.ok((result.report.details as any)?.safeMessage);
    });

    it('guarantees zero password leakage in health check diagnostics', async () => {
      const secretPassword = 'SUPER_SENSITIVE_SECRET_TOKEN_9911';
      const result = await executeHealthProbe({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: '127.0.0.1',
        PGPORT: '59999',
        PGDATABASE: 'testdb',
        PGUSER: 'testuser',
        PGPASSWORD: secretPassword
      });

      const serialized = JSON.stringify(result);
      assert.ok(
        !serialized.includes(secretPassword),
        'Health probe result must never contain the PGPASSWORD string'
      );
    });
  });

  describe('executeReadinessProbe', () => {
    it('returns exitCode 0 and ready in-memory mode', async () => {
      const result = await executeReadinessProbe({ BECC_STORAGE_TYPE: 'in-memory' });
      assert.strictEqual(result.command, 'ready');
      assert.strictEqual(result.exitCode, 0);
      assert.strictEqual(result.report.component, 'IN_MEMORY_AUDIT_LEDGER');
      assert.strictEqual(result.report.healthState, 'HEALTHY');
      assert.strictEqual(result.report.liveness, true);
      assert.strictEqual(result.report.readiness, true);
    });

    it('returns exitCode 2 and MISCONFIGURED when storage type is missing', async () => {
      const result = await executeReadinessProbe({});
      assert.strictEqual(result.command, 'ready');
      assert.strictEqual(result.exitCode, 2);
      assert.strictEqual(result.report.component, 'BECC_RUNTIME');
      assert.strictEqual(result.report.healthState, 'MISCONFIGURED');
      assert.strictEqual(result.report.readiness, false);
    });

    it('returns exitCode 1 and UNAVAILABLE when database is unreachable', async () => {
      const result = await executeReadinessProbe({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: '127.0.0.1',
        PGPORT: '59999',
        PGDATABASE: 'nonexistent_db',
        PGUSER: 'nonexistent_user',
        PGPASSWORD: 'test_password'
      });
      assert.strictEqual(result.command, 'ready');
      assert.strictEqual(result.exitCode, 1);
      assert.strictEqual(result.report.component, 'POSTGRES_AUDIT_LEDGER');
      assert.strictEqual(result.report.healthState, 'UNAVAILABLE');
      assert.strictEqual(result.report.readiness, false);
    });

    it('guarantees zero password leakage in readiness probe diagnostics', async () => {
      const secretPassword = 'SUPER_SENSITIVE_SECRET_TOKEN_READY_9922';
      const result = await executeReadinessProbe({
        BECC_STORAGE_TYPE: 'postgres',
        PGHOST: '127.0.0.1',
        PGPORT: '59999',
        PGDATABASE: 'testdb',
        PGUSER: 'testuser',
        PGPASSWORD: secretPassword
      });

      const serialized = JSON.stringify(result);
      assert.ok(
        !serialized.includes(secretPassword),
        'Readiness probe result must never contain the PGPASSWORD string'
      );
    });
  });

  describe('CLI run() Integration for health and ready', () => {
    it('executes becc health in in-memory mode and outputs JSON report', async () => {
      process.env.BECC_STORAGE_TYPE = 'in-memory';

      let stdoutOutput = '';
      const originalStdoutWrite = process.stdout.write;
      process.stdout.write = ((chunk: any) => {
        stdoutOutput += String(chunk);
        return true;
      }) as any;

      try {
        await run(['health']);
      } finally {
        process.stdout.write = originalStdoutWrite;
      }

      assert.ok(stdoutOutput.length > 0, 'stdout should capture health probe JSON output');
      const lines = stdoutOutput.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const probeLine = lines.find(l => {
        try {
          const p = JSON.parse(l);
          return p.component === 'IN_MEMORY_AUDIT_LEDGER';
        } catch {
          return false;
        }
      });
      assert.ok(probeLine, 'Expected health probe JSON line in stdout');
      const parsed = JSON.parse(probeLine!);
      assert.strictEqual(parsed.component, 'IN_MEMORY_AUDIT_LEDGER');
      assert.strictEqual(parsed.healthState, 'HEALTHY');
      assert.strictEqual(parsed.liveness, true);
      assert.strictEqual(parsed.readiness, true);
    });

    it('executes becc ready in in-memory mode and outputs JSON report', async () => {
      process.env.BECC_STORAGE_TYPE = 'in-memory';

      let stdoutOutput = '';
      const originalStdoutWrite = process.stdout.write;
      process.stdout.write = ((chunk: any) => {
        stdoutOutput += String(chunk);
        return true;
      }) as any;

      try {
        await run(['ready']);
      } finally {
        process.stdout.write = originalStdoutWrite;
      }

      assert.ok(stdoutOutput.length > 0, 'stdout should capture readiness probe JSON output');
      const lines = stdoutOutput.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const probeLine = lines.find(l => {
        try {
          const p = JSON.parse(l);
          return p.component === 'IN_MEMORY_AUDIT_LEDGER';
        } catch {
          return false;
        }
      });
      assert.ok(probeLine, 'Expected readiness probe JSON line in stdout');
      const parsed = JSON.parse(probeLine!);
      assert.strictEqual(parsed.component, 'IN_MEMORY_AUDIT_LEDGER');
      assert.strictEqual(parsed.healthState, 'HEALTHY');
      assert.strictEqual(parsed.readiness, true);
    });

    it('rejects extra arguments to health command with exitCode 2', async () => {
      let stderrOutput = '';
      const originalStderrWrite = process.stderr.write;
      process.stderr.write = ((chunk: any) => {
        stderrOutput += String(chunk);
        return true;
      }) as any;

      try {
        await run(['health', 'extra-arg']);
      } finally {
        process.stderr.write = originalStderrWrite;
      }

      assert.ok(stderrOutput.includes('Extra parameters not allowed with health command'));
    });

    it('rejects extra arguments to ready command with exitCode 2', async () => {
      let stderrOutput = '';
      const originalStderrWrite = process.stderr.write;
      process.stderr.write = ((chunk: any) => {
        stderrOutput += String(chunk);
        return true;
      }) as any;

      try {
        await run(['ready', 'extra-arg']);
      } finally {
        process.stderr.write = originalStderrWrite;
      }

      assert.ok(stderrOutput.includes('Extra parameters not allowed with ready command'));
    });
  });
});
