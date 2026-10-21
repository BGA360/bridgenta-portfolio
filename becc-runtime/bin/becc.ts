import { randomUUID } from 'node:crypto';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { RuntimeConfig, LogEvent, HealthReport } from '../shared/types.js';
import { FileReviewStateAdapter } from '../human-review/adapters/file-review-state.adapter.js';
import { HumanReviewService } from '../human-review/human-review.service.js';
import { IReviewerIdentityPort } from '../human-review/ports/reviewer-identity.port.js';
import { IClockPort } from '../human-review/ports/clock.port.js';
import { VerifiedReviewer } from '../human-review/types.js';
import { FileLedgerStorageAdapter } from '../evidence/adapters/file-ledger-storage.adapter.js';
import { NodeCryptoAsymmetricSignatureAdapter } from '../evidence/adapters/node-crypto-asymmetric-signature.adapter.js';
import { ConfiguredTrustResolverAdapter } from '../evidence/adapters/configured-trust-resolver.adapter.js';
import { LedgerVerificationService } from '../evidence/ledger-verification.service.js';
import { LedgerStatus, TrustStatus } from '../evidence/types.js';
import { loadDeployedConfig, DeployedRuntimeConfig, ConfigurationError } from '../config/index.js';
import { PostgresBeccAuditLedger } from '../audit/postgres-audit-ledger.adapter.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';

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
  health     Probe runtime and audit persistence health status
  ready      Probe runtime and dependency readiness to accept work
  serve      Start the HTTP server exposing /health, /ready, and /version endpoints
`;

const VERSION_TEXT = '2.0.0-GA';

class CliReviewerIdentityPort implements IReviewerIdentityPort {
  public async verify(assertion: string, context: Record<string, unknown>): Promise<VerifiedReviewer> {
    try {
      const claim = JSON.parse(assertion);
      return {
        reviewerId: claim.reviewerId || context.reviewerId || 'mock-reviewer',
        role: claim.role || 'Reviewer',
        projectIds: claim.projectIds || ['*'],
        classifications: claim.classifications || ['*']
      };
    } catch {
      return {
        reviewerId: context.reviewerId as string || assertion || 'mock-reviewer',
        role: 'Reviewer',
        projectIds: ['*'],
        classifications: ['*']
      };
    }
  }
}

class CliClockPort implements IClockPort {
  public now(): string {
    return new Date().toISOString();
  }
}

export interface ProbeExecutionResult {
  command: 'health' | 'ready';
  exitCode: number;
  report: Record<string, unknown>;
}

export async function executeHealthProbe(env: NodeJS.ProcessEnv = process.env): Promise<ProbeExecutionResult> {
  let runtimeConfig: DeployedRuntimeConfig;
  try {
    runtimeConfig = loadDeployedConfig(env);
  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      command: 'health',
      exitCode: 2,
      report: {
        component: 'BECC_RUNTIME',
        healthState: 'MISCONFIGURED',
        liveness: false,
        readiness: false,
        details: { safeMessage: errorMsg },
        occurredAt: new Date().toISOString()
      }
    };
  }

  if (runtimeConfig.storageType === 'in-memory') {
    return {
      command: 'health',
      exitCode: 0,
      report: {
        component: 'IN_MEMORY_AUDIT_LEDGER',
        healthState: 'HEALTHY',
        liveness: true,
        readiness: true,
        details: { safeMessage: 'In-memory audit persistence active (L0 mode)' },
        occurredAt: new Date().toISOString()
      }
    };
  }

  const ledger = new PostgresBeccAuditLedger({ ...runtimeConfig.postgres, autoMigrate: false });
  try {
    const healthReport = await ledger.checkHealth();
    await ledger.close();
    const exitCode = (healthReport.healthState === 'HEALTHY' || healthReport.healthState === 'DEGRADED') ? 0 : 1;
    return {
      command: 'health',
      exitCode,
      report: healthReport
    };
  } catch (err: any) {
    await ledger.close().catch(() => {});
    const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'PERSISTENCE');
    return {
      command: 'health',
      exitCode: 1,
      report: {
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState: 'UNAVAILABLE',
        liveness: false,
        readiness: false,
        details: { safeMessage: safeErr.safeMessage },
        occurredAt: new Date().toISOString()
      }
    };
  }
}

export async function executeReadinessProbe(env: NodeJS.ProcessEnv = process.env): Promise<ProbeExecutionResult> {
  let runtimeConfig: DeployedRuntimeConfig;
  try {
    runtimeConfig = loadDeployedConfig(env);
  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      command: 'ready',
      exitCode: 2,
      report: {
        component: 'BECC_RUNTIME',
        healthState: 'MISCONFIGURED',
        liveness: false,
        readiness: false,
        details: { safeMessage: errorMsg },
        occurredAt: new Date().toISOString()
      }
    };
  }

  if (runtimeConfig.storageType === 'in-memory') {
    return {
      command: 'ready',
      exitCode: 0,
      report: {
        component: 'IN_MEMORY_AUDIT_LEDGER',
        healthState: 'HEALTHY',
        liveness: true,
        readiness: true,
        details: { safeMessage: 'In-memory audit persistence ready to serve work' },
        occurredAt: new Date().toISOString()
      }
    };
  }

  const ledger = new PostgresBeccAuditLedger({ ...runtimeConfig.postgres, autoMigrate: false });
  try {
    const healthReport = await ledger.checkHealth();
    await ledger.close();
    const exitCode = healthReport.readiness === true ? 0 : 1;
    return {
      command: 'ready',
      exitCode,
      report: healthReport
    };
  } catch (err: any) {
    await ledger.close().catch(() => {});
    const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'PERSISTENCE');
    return {
      command: 'ready',
      exitCode: 1,
      report: {
        component: 'POSTGRES_AUDIT_LEDGER',
        healthState: 'UNAVAILABLE',
        liveness: false,
        readiness: false,
        details: { safeMessage: safeErr.safeMessage },
        occurredAt: new Date().toISOString()
      }
    };
  }
}

export async function run(args: string[]) {
  resetShutdownState();
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

  if (primaryArg === 'health') {
    if (args.length > 1) {
      return shutdown('InvalidCommandParameters', 2, { error: 'Extra parameters not allowed with health command.' });
    }
    const result = await executeHealthProbe(process.env);
    process.stdout.write(JSON.stringify(result.report) + '\n');
    if (result.exitCode === 0) {
      return shutdown('HealthProbed', 0);
    }
    if (result.exitCode === 2) {
      return shutdown('ConfigurationError', 2, { error: (result.report.details as any)?.safeMessage });
    }
    return shutdown('HealthCheckFailed', 1, { error: (result.report.details as any)?.safeMessage });
  }

  if (primaryArg === 'ready') {
    if (args.length > 1) {
      return shutdown('InvalidCommandParameters', 2, { error: 'Extra parameters not allowed with ready command.' });
    }
    const result = await executeReadinessProbe(process.env);
    process.stdout.write(JSON.stringify(result.report) + '\n');
    if (result.exitCode === 0) {
      return shutdown('ReadinessProbed', 0);
    }
    if (result.exitCode === 2) {
      return shutdown('ConfigurationError', 2, { error: (result.report.details as any)?.safeMessage });
    }
    return shutdown('ReadinessCheckFailed', 1, { error: (result.report.details as any)?.safeMessage });
  }

  if (primaryArg === 'serve') {
    const { BeccHttpServer } = await import('../server/becc-http-server.js');
    let port: number | undefined;
    let host: string | undefined;
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--port' && i + 1 < args.length) {
        port = parseInt(args[++i], 10);
      } else if (args[i].startsWith('--port=')) {
        port = parseInt(args[i].slice(7), 10);
      } else if (args[i] === '--host' && i + 1 < args.length) {
        host = args[++i];
      } else if (args[i].startsWith('--host=')) {
        host = args[i].slice(7);
      }
    }
    const server = new BeccHttpServer({ port, host });
    try {
      const started = await server.start();
      process.stdout.write(JSON.stringify({ status: 'LISTENING', port: started.port, host: started.host }) + '\n');
      return;
    } catch (err: any) {
      return shutdown('ServerStartFailed', 1, { error: err instanceof Error ? err.message : String(err) });
    }
  }

  if (primaryArg === 'review') {
    const subArg = args[1];
    const sessionDir = process.env.BECC_SESSION_DIR || path.join(process.cwd(), '.sessions');
    const repository = new FileReviewStateAdapter(sessionDir);
    const identityPort = new CliReviewerIdentityPort();
    const clock = new CliClockPort();
    const reviewService = new HumanReviewService(repository, identityPort, clock);

    if (subArg === 'show') {
      const reviewRequestId = args[2];
      if (!reviewRequestId) {
        return shutdown('InvalidCommandParameters', 1, { error: 'Missing reviewRequestId parameter for review show' });
      }
      try {
        const record = await repository.loadPreparedReview(reviewRequestId);
        if (!record) {
          return shutdown('ReviewNotFound', 1, { error: `Review package not found: ${reviewRequestId}` });
        }
        process.stdout.write(JSON.stringify(record.reviewPackage, null, 2) + '\n');
        return shutdown('ReviewDisplayed', 0);
      } catch (err: any) {
        return shutdown('CommandFailed', 1, { error: err.message });
      }
    }

    if (subArg === 'submit') {
      const submissionPath = args[2];
      if (!submissionPath) {
        return shutdown('InvalidCommandParameters', 1, { error: 'Missing submissionPath parameter for review submit' });
      }
      try {
        const resolvedPath = path.resolve(submissionPath);
        if (!fs.existsSync(resolvedPath)) {
          return shutdown('FileNotFound', 1, { error: `Submission file not found: ${submissionPath}` });
        }
        const submissionContent = fs.readFileSync(resolvedPath, 'utf8');
        const submission = JSON.parse(submissionContent);

        const continuation = await reviewService.submitDecision(submission);

        process.stdout.write(JSON.stringify(continuation, null, 2) + '\n');
        return shutdown('ReviewSubmitted', 0);
      } catch (err: any) {
        return shutdown('CommandFailed', 1, { error: err.message });
      }
    }

    return shutdown('UnknownCommand', 1, { error: `Unknown review subcommand: ${subArg}` });
  }

  if (primaryArg === 'evidence') {
    const subArg = args[1];
    if (!subArg) {
      return shutdown('InvalidCommandParameters', 9, { error: 'Missing evidence subcommand. Use one of: show, verify, export, status' });
    }

    const repositoryRoot = process.env.BECC_REPO_ROOT || process.cwd();
    const storage = new FileLedgerStorageAdapter(repositoryRoot);
    const signatureProvider = new NodeCryptoAsymmetricSignatureAdapter();
    const defaultKeyRef = process.env.BECC_SIGNING_KEY_REF || 'default-key';
    const trustResolver = {
      verifyKeyTrust: async (keyReference: string, projectId: string) => {
        if (keyReference === defaultKeyRef) {
          return TrustStatus.KEY_TRUSTED;
        }
        return TrustStatus.KEY_UNKNOWN;
      }
    };
    const artifactResolver = {
      verifyArtifactHash: async (id: string, expected: string): Promise<'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID' | 'NOT_VERIFIED'> => {
        const fullPath = path.resolve(repositoryRoot, id);
        if (!fs.existsSync(fullPath)) {
          return 'NOT_VERIFIED';
        }
        try {
          const content = fs.readFileSync(fullPath);
          const actual = crypto.createHash('sha256').update(content).digest('hex');
          return actual === expected ? 'ARTIFACTS_VALID' : 'ARTIFACTS_INVALID';
        } catch {
          return 'NOT_VERIFIED';
        }
      }
    };

    const verifier = new LedgerVerificationService(signatureProvider, trustResolver, artifactResolver);

    const getProjectIds = (): string[] => {
      const dir = path.join(repositoryRoot, '.becc', 'evidence');
      if (!fs.existsSync(dir)) {
        return [];
      }
      const files = fs.readdirSync(dir);
      const projectIds: string[] = [];
      for (const file of files) {
        const match = file.match(/^ledger-(.+)\.jsonl$/);
        if (match && !file.endsWith('.lock') && !file.endsWith('.tmp')) {
          projectIds.push(match[1]);
        }
      }
      return projectIds;
    };

    if (subArg === 'show') {
      const option = args[2];
      const value = args[3];
      if (option !== '--entry' && option !== '--session') {
        return shutdown('InvalidCommandParameters', 9, { error: 'Invalid show option. Use --entry <entryId> or --session <sessionId>.' });
      }
      if (!value) {
        return shutdown('InvalidCommandParameters', 9, { error: `Missing value for show ${option}` });
      }

      try {
        const projectIds = getProjectIds();
        let foundRecord = null;
        for (const pid of projectIds) {
          const records = await storage.readLedger(pid);
          const r = records.find(x => x.payload.entryId === value || x.payload.sessionId === value);
          if (r) {
            foundRecord = r;
            break;
          }
        }

        if (!foundRecord) {
          process.stderr.write(`Evidence entry not found: ${value}\n`);
          return shutdown('EntryNotFound', 7);
        }

        process.stdout.write(JSON.stringify(foundRecord, null, 2) + '\n');
        return shutdown('EvidenceDisplayed', 0);
      } catch (err: any) {
        if (err instanceof SyntaxError) {
          process.stderr.write(`Malformed ledger: ${err.message}\n`);
          return shutdown('MalformedLedger', 8);
        }
        process.stderr.write(`Failed to show evidence: ${err.message}\n`);
        return shutdown('OperationalFailure', 9);
      }
    }

    if (subArg === 'verify') {
      const option = args[2];
      const value = args[3];

      try {
        const projectIds = getProjectIds();
        if (projectIds.length === 0) {
          process.stderr.write('No ledger file found.\n');
          return shutdown('NoLedger', 6);
        }

        if (option === '--entry') {
          if (!value) {
            return shutdown('InvalidCommandParameters', 9, { error: 'Missing entryId value for verify --entry' });
          }
          let foundRecord = null;
          let foundProjectId = '';
          for (const pid of projectIds) {
            const records = await storage.readLedger(pid);
            const r = records.find(x => x.payload.entryId === value);
            if (r) {
              foundRecord = r;
              foundProjectId = pid;
              break;
            }
          }

          if (!foundRecord) {
            process.stderr.write(`Entry not found: ${value}\n`);
            return shutdown('EntryNotFound', 7);
          }

          const records = await storage.readLedger(foundProjectId);
          const result = await verifier.verifyLedger(foundProjectId, records);
          const entryResult = result.records.find(r => r.entryId === value);
          if (!entryResult) {
            process.stderr.write(`Entry not found in verified ledger: ${value}\n`);
            return shutdown('EntryNotFound', 7);
          }

          process.stdout.write(JSON.stringify(entryResult, null, 2) + '\n');
          
          if (entryResult.signatureStatus === 'SIGNATURE_INVALID') {
            return shutdown('InvalidSignature', 1);
          }
          if (entryResult.trustStatus === TrustStatus.KEY_REVOKED || entryResult.trustStatus === TrustStatus.KEY_UNKNOWN) {
            return shutdown('UnknownTrust', 4);
          }
          if (entryResult.artifactStatus === 'ARTIFACTS_INVALID') {
            return shutdown('OperationalFailure', 9);
          }
          return shutdown('EntryVerified', 0);
        }

        if (option === '--ledger') {
          let combinedStatus = LedgerStatus.LEDGER_VALID;
          const allResults: any[] = [];

          for (const pid of projectIds) {
            const records = await storage.readLedger(pid);
            const result = await verifier.verifyLedger(pid, records);
            allResults.push(result);

            if (result.ledgerStatus === LedgerStatus.LEDGER_INVALID) {
              combinedStatus = LedgerStatus.LEDGER_INVALID;
            } else if (result.ledgerStatus === LedgerStatus.LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL && combinedStatus !== LedgerStatus.LEDGER_INVALID) {
              combinedStatus = LedgerStatus.LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL;
            } else if (result.ledgerStatus === LedgerStatus.LEDGER_TRUST_UNKNOWN && combinedStatus === LedgerStatus.LEDGER_VALID) {
              combinedStatus = LedgerStatus.LEDGER_TRUST_UNKNOWN;
            } else if (result.ledgerStatus === LedgerStatus.LEDGER_ARTIFACTS_UNAVAILABLE && combinedStatus === LedgerStatus.LEDGER_VALID) {
              combinedStatus = LedgerStatus.LEDGER_ARTIFACTS_UNAVAILABLE;
            }
          }

          process.stdout.write(JSON.stringify(allResults.length === 1 ? allResults[0] : allResults, null, 2) + '\n');

          if (combinedStatus === LedgerStatus.LEDGER_VALID) {
            return shutdown('LedgerValid', 0);
          }
          if (combinedStatus === LedgerStatus.LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL) {
            return shutdown('IncompleteTail', 3);
          }
          if (combinedStatus === LedgerStatus.LEDGER_INVALID) {
            const hasInvalidSig = allResults.some(res => res.records.some((r: any) => r.signatureStatus === 'SIGNATURE_INVALID'));
            if (hasInvalidSig) {
              return shutdown('InvalidSignature', 1);
            }
            return shutdown('BrokenChain', 2);
          }
          if (combinedStatus === LedgerStatus.LEDGER_TRUST_UNKNOWN) {
            return shutdown('UnknownTrust', 4);
          }
          if (combinedStatus === LedgerStatus.LEDGER_ARTIFACTS_UNAVAILABLE) {
            return shutdown('ArtifactUnavailable', 5);
          }
          return shutdown('OperationalFailure', 9);
        }

        return shutdown('InvalidCommandParameters', 9, { error: 'Invalid verify option. Use --entry <entryId> or --ledger.' });
      } catch (err: any) {
        if (err instanceof SyntaxError) {
          process.stderr.write(`Malformed ledger: ${err.message}\n`);
          return shutdown('MalformedLedger', 8);
        }
        process.stderr.write(`Verification failed: ${err.message}\n`);
        return shutdown('OperationalFailure', 9);
      }
    }

    if (subArg === 'export') {
      const option = args[2];
      const value = args[3];
      const exportPath = args[4];

      if (option !== '--project') {
        return shutdown('InvalidCommandParameters', 9, { error: 'Invalid export option. Use --project <projectId> <exportPath>.' });
      }
      if (!value) {
        return shutdown('InvalidCommandParameters', 9, { error: 'Missing projectId for export --project' });
      }
      if (!exportPath) {
        return shutdown('InvalidCommandParameters', 9, { error: 'Missing exportPath parameter' });
      }

      const resolvedExport = path.resolve(exportPath);
      if (fs.existsSync(resolvedExport)) {
        process.stderr.write(`Export path already exists: ${exportPath}\n`);
        return shutdown('ExportPathExists', 9);
      }

      try {
        const exists = await storage.ledgerExists(value);
        if (!exists) {
          process.stderr.write(`No ledger file found for project: ${value}\n`);
          return shutdown('NoLedger', 6);
        }
        const records = await storage.readLedger(value);
        const serialized = records.map(r => JSON.stringify(r)).join('\n') + '\n';
        fs.writeFileSync(resolvedExport, serialized, { mode: 0o600 });
        return shutdown('EvidenceExported', 0);
      } catch (err: any) {
        if (err instanceof SyntaxError) {
          process.stderr.write(`Malformed ledger: ${err.message}\n`);
          return shutdown('MalformedLedger', 8);
        }
        process.stderr.write(`Export failed: ${err.message}\n`);
        return shutdown('OperationalFailure', 9);
      }
    }

    if (subArg === 'status') {
      try {
        const projectIds = getProjectIds();
        if (projectIds.length === 0) {
          process.stdout.write('Ledger status: NOT_FOUND\n');
          return shutdown('LedgerNotFound', 6);
        }

        let combinedStatus = LedgerStatus.LEDGER_VALID;
        for (const pid of projectIds) {
          const status = await storage.getLedgerStatus(pid);
          if (status === LedgerStatus.LEDGER_INVALID) {
            combinedStatus = LedgerStatus.LEDGER_INVALID;
          } else if (status === LedgerStatus.LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL && combinedStatus !== LedgerStatus.LEDGER_INVALID) {
            combinedStatus = LedgerStatus.LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL;
          }
        }

        process.stdout.write(`Ledger status: ${combinedStatus}\n`);
        
        if (combinedStatus === LedgerStatus.LEDGER_VALID) {
          return shutdown('StatusReported', 0);
        }
        if (combinedStatus === LedgerStatus.LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL) {
          return shutdown('StatusReported', 3);
        }
        return shutdown('StatusReported', 8);
      } catch (err: any) {
        process.stderr.write(`Status check failed: ${err.message}\n`);
        return shutdown('OperationalFailure', 9);
      }
    }

    return shutdown('UnknownCommand', 9, { error: `Unknown evidence subcommand: ${subArg}` });
  }

  // Reject all other commands/options
  return shutdown('UnknownCommand', 1, { error: `Unknown command or option: ${primaryArg}` });
}

// Auto-run if executed directly as the entry point script
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('becc.js');
if (isMainModule && process.env.BECC_TEST_INTERCEPT_EXIT !== 'true') {
  run(process.argv.slice(2)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
