#!/usr/bin/env node
/**
 * BECC v2 — Standalone Deployed Runtime HTTP Server Executable
 *
 * Starts the HTTP service exposing /health, /ready, and /version endpoints.
 * Handles OS termination signals (SIGINT, SIGTERM) for zero-downtime / graceful shutdown.
 */

import { BeccHttpServer } from '../server/becc-http-server.js';

interface CliServerOptions {
  port?: number;
  host?: string;
}

function parseArgs(args: string[]): CliServerOptions {
  const options: CliServerOptions = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--port' && i + 1 < args.length) {
      const p = parseInt(args[++i], 10);
      if (!isNaN(p) && p > 0 && p <= 65535) {
        options.port = p;
      }
    } else if (arg.startsWith('--port=')) {
      const p = parseInt(arg.slice(7), 10);
      if (!isNaN(p) && p > 0 && p <= 65535) {
        options.port = p;
      }
    } else if (arg === '--host' && i + 1 < args.length) {
      options.host = args[++i];
    } else if (arg.startsWith('--host=')) {
      options.host = arg.slice(7);
    }
  }
  return options;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const server = new BeccHttpServer(options);

  const shutdown = async (signal: string) => {
    process.stdout.write(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        module: 'server',
        event: 'HttpServerStopping',
        payload: { signal }
      }) + '\n'
    );

    try {
      await server.stop();
      process.exit(0);
    } catch (err: any) {
      process.stderr.write(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          module: 'server',
          event: 'HttpServerStopError',
          payload: { error: err instanceof Error ? err.message : String(err) }
        }) + '\n'
      );
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    const { port, host } = await server.start();
    const config = server.getRuntimeConfig();

    process.stdout.write(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        module: 'server',
        event: 'HttpServerStarted',
        eventType: 'STARTUP',
        runtimeId: server.getRuntimeId(),
        releaseSha: config?.releaseSha || process.env.BECC_RELEASE_SHA || process.env.GITHUB_SHA || 'unknown',
        environment: config?.environment || process.env.BECC_ENV || process.env.NODE_ENV || 'production',
        payload: {
          port,
          host,
          storageType: config ? config.storageType : 'unconfigured',
          endpoints: ['/health', '/ready', '/version']
        }
      }) + '\n'
    );
  } catch (err: any) {
    const safeError = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        module: 'server',
        event: 'HttpServerFailed',
        eventType: 'ERROR',
        payload: { error: safeError }
      }) + '\n'
    );
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
