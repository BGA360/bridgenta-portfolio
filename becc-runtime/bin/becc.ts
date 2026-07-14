import { randomUUID } from 'node:crypto';
import { RuntimeConfig, LogEvent, HealthReport } from '../shared/types.js';

// 1. Initial State
let isShuttingDown = false;
export function resetShutdownState() {
  isShuttingDown = false;
}

// 2. Load and Validate Configuration
function initializeConfig(): RuntimeConfig {
  const sessionID = randomUUID();
  
  // Timeout validation
  let timeout = 30;
  if (process.env.BECC_TIMEOUT !== undefined) {
    const parsed = parseInt(process.env.BECC_TIMEOUT, 10);
    if (isNaN(parsed) || parsed <= 0 || String(parsed) !== process.env.BECC_TIMEOUT) {
      logErrorAndExit(sessionID, 'Invalid configuration value for BECC_TIMEOUT. Must be a positive integer.');
    }
    timeout = parsed;
  }

  // Environment validation
  let env: 'production' | 'development' | 'test' = 'development';
  if (process.env.BECC_ENV !== undefined) {
    if (process.env.BECC_ENV !== 'production' && process.env.BECC_ENV !== 'development' && process.env.BECC_ENV !== 'test') {
      logErrorAndExit(sessionID, 'Invalid configuration value for BECC_ENV. Must be one of: production, development, test.');
    }
    env = process.env.BECC_ENV;
  }

  // Log level validation
  let logLevel: 'info' | 'warn' | 'error' = 'info';
  if (process.env.BECC_LOG_LEVEL !== undefined) {
    if (process.env.BECC_LOG_LEVEL !== 'info' && process.env.BECC_LOG_LEVEL !== 'warn' && process.env.BECC_LOG_LEVEL !== 'error') {
      logErrorAndExit(sessionID, 'Invalid configuration value for BECC_LOG_LEVEL. Must be one of: info, warn, error.');
    }
    logLevel = process.env.BECC_LOG_LEVEL;
  }

  return Object.freeze({
    sessionID,
    env,
    timeout,
    logLevel
  });
}

// Helper to log errors before config is initialized
function logErrorAndExit(sessionID: string, message: string): never {
  const logEvent: LogEvent = {
    timestamp: new Date().toISOString(),
    level: 'error',
    session_id: sessionID,
    module: 'bin',
    event: 'RuntimeFailed',
    payload: { error: message }
  };
  process.stderr.write(JSON.stringify(logEvent) + '\n');
  process.exit(1);
}

export const config = initializeConfig();

// 3. Structured Logging
export function log(level: 'info' | 'warn' | 'error', event: string, payload: Record<string, unknown> = {}) {
  const levels = { info: 0, warn: 1, error: 2 };
  if (levels[level] < levels[config.logLevel]) return;

  const logEvent: LogEvent = {
    timestamp: new Date().toISOString(),
    level,
    session_id: config.sessionID,
    module: 'bin',
    event,
    payload
  };
  
  const output = JSON.stringify(logEvent) + '\n';
  if (level === 'error') {
    process.stderr.write(output);
  } else {
    process.stdout.write(output);
  }
}

// 4. Safe Teardown & Signal Handling
export function shutdown(event: string, exitCode = 0, payload: Record<string, unknown> = {}) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  const finalPayload = { event, exitCode, ...payload };
  if (exitCode === 0) {
    log('info', 'RuntimeShutdown', finalPayload);
  } else {
    log('error', 'RuntimeFailed', finalPayload);
  }

  // In testing environments, avoid calling process.exit directly if intercepted
  if (process.env.BECC_TEST_INTERCEPT_EXIT !== 'true') {
    process.exit(exitCode);
  }
}

// Register System Signal Listeners
process.on('SIGINT', () => shutdown('SignalReceived', 0, { signal: 'SIGINT' }));
process.on('SIGTERM', () => shutdown('SignalReceived', 0, { signal: 'SIGTERM' }));

// 5. CLI commands
const HELP_TEXT = `BECC CLI v2.0.0-GA — Runtime Bootstrap CLI

Usage:
  becc [options]
  becc <command>

Options:
  --help     Show this help documentation
  --version  Show application version

Commands:
  status     Perform bootstrap health check and report readiness
`;

const VERSION_TEXT = '2.0.0-GA';

export function run(args: string[]) {
  log('info', 'RuntimeStarted');

  if (args.length === 0) {
    process.stdout.write(HELP_TEXT);
    return shutdown('NoArgsProvided', 1, { error: 'No command or options provided.' });
  }

  const primaryArg = args[0];

  if (primaryArg === '--help') {
    if (args.length > 1) {
      return shutdown('InvalidOption', 1, { error: 'Extra parameters not allowed with --help.' });
    }
    process.stdout.write(HELP_TEXT);
    return shutdown('HelpDisplayed', 0);
  }

  if (primaryArg === '--version') {
    if (args.length > 1) {
      return shutdown('InvalidOption', 1, { error: 'Extra parameters not allowed with --version.' });
    }
    process.stdout.write(VERSION_TEXT + '\n');
    return shutdown('VersionDisplayed', 0);
  }

  if (primaryArg === 'status') {
    if (args.length > 1) {
      return shutdown('InvalidCommandParameters', 1, { error: 'Extra parameters not allowed with status command.' });
    }

    const report: HealthReport = {
      status: 'ready',
      session_id: config.sessionID,
      node_version: process.version,
      memory_usage: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external
      },
      config: {
        env: config.env,
        timeout: config.timeout,
        logLevel: config.logLevel
      }
    };

    process.stdout.write(JSON.stringify(report) + '\n');
    return shutdown('StatusReported', 0);
  }

  // Reject all other commands/options
  return shutdown('UnknownCommand', 1, { error: `Unknown command or option: ${primaryArg}` });
}

// Auto-run if executed directly as the entry point script
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('becc.js');
if (isMainModule && process.env.BECC_TEST_INTERCEPT_EXIT !== 'true') {
  run(process.argv.slice(2));
}
