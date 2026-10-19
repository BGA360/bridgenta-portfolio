/**
 * BECC v2 — Embedded PostgreSQL Teardown Fixture Helper
 *
 * Provides safe, deterministic teardown of EmbeddedPostgres test fixtures on Windows and POSIX.
 * On Windows, EmbeddedPostgres spawns postgres.exe which in turn spawns background worker processes
 * (checkpointer, background writer, walwriter, etc.). EmbeddedPostgres's default .stop() method uses
 * asynchronous `spawn('taskkill')` which frequently fails to catch child worker processes before the
 * parent exits, leaving orphaned processes holding open stdio pipe handles.
 *
 * This fixture helper uses PostgreSQL's native `pg_ctl stop -m immediate` utility to command
 * immediate cluster shutdown and wait for all server and worker processes to exit, followed by
 * fixture-owned process tree verification, stdio stream closure, and optional data directory cleanup.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import type EmbeddedPostgres from 'embedded-postgres';

export async function stopEmbeddedPostgresFixture(
  pgServer: EmbeddedPostgres | undefined,
  dbDataDir: string | undefined,
  options: { cleanDataDir?: boolean } = {}
): Promise<void> {
  const { cleanDataDir = true } = options;
  if (!pgServer) return;

  const postmasterPid = (pgServer as any).process?.pid;

  // 1. On Windows, use PostgreSQL's native pg_ctl to gracefully and immediately stop all worker processes
  if (os.platform() === 'win32' && dbDataDir && fs.existsSync(dbDataDir)) {
    try {
      const nativePgCtl = path.resolve('node_modules/@embedded-postgres/windows-x64/native/bin/pg_ctl.exe');
      if (fs.existsSync(nativePgCtl)) {
        execFileSync(nativePgCtl, ['stop', '-D', dbDataDir, '-m', 'immediate'], {
          stdio: 'ignore',
          timeout: 10000
        });
      }
    } catch {
      // If pg_ctl returned non-zero or timed out, proceed to fallback teardown
    }
  }

  // 2. Destroy stdio streams so Node's event loop does not retain inherited pipe handles
  try {
    const proc = (pgServer as any).process;
    if (proc) {
      if (proc.stderr && !proc.stderr.destroyed) {
        proc.stderr.destroy();
      }
      if (proc.stdout && !proc.stdout.destroyed) {
        proc.stdout.destroy();
      }
      if (proc.stdin && !proc.stdin.destroyed) {
        proc.stdin.destroy();
      }
      // If process already exited via pg_ctl, clear process reference so pgServer.stop() doesn't hang on exit event
      if (proc.exitCode !== null) {
        (pgServer as any).process = undefined;
      }
    }
  } catch {
    // Best-effort stream cleanup
  }

  // 3. Invoke standard pgServer.stop()
  try {
    await pgServer.stop();
  } catch {
    // Ignore cleanup errors
  }

  // 4. Fixture-owned process tree verification on Windows
  if (os.platform() === 'win32' && postmasterPid) {
    try {
      execFileSync('taskkill', ['/pid', String(postmasterPid), '/f', '/t'], {
        stdio: 'ignore',
        timeout: 5000
      });
    } catch {
      // Expected if already cleanly stopped by pg_ctl
    }
  }

  // 5. Clean up data directory if requested
  if (cleanDataDir && dbDataDir && fs.existsSync(dbDataDir)) {
    try {
      fs.rmSync(dbDataDir, { recursive: true, force: true });
    } catch {
      // Best-effort directory removal
    }
  }
}
