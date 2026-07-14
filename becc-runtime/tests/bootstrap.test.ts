import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_PATH = join(__dirname, '../bin/becc.js');

// Helper to run the CLI in a child process and return outputs and exit code
function runCli(args: string[], env: Record<string, string> = {}): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      env: {
        ...process.env,
        BECC_TEST_INTERCEPT_EXIT: 'false',
        ...env
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

// Helper to parse JSON log lines from output
function parseJsonLogs(text: string): any[] {
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('{'))
    .map(line => JSON.parse(line));
}

test('CLI Contracts - Help flag', async () => {
  const { code, stdout, stderr } = await runCli(['--help']);
  assert.strictEqual(code, 0);
  assert.match(stdout, /Usage:/);
  assert.match(stdout, /--help/);
  assert.strictEqual(stderr, '');

  const logs = parseJsonLogs(stdout);
  assert.strictEqual(logs.length, 2);
  assert.strictEqual(logs[0].event, 'RuntimeStarted');
  assert.strictEqual(logs[1].event, 'RuntimeShutdown');
  assert.strictEqual(logs[1].payload.event, 'HelpDisplayed');
});

test('CLI Contracts - Version flag', async () => {
  const { code, stdout, stderr } = await runCli(['--version']);
  assert.strictEqual(code, 0);
  assert.match(stdout, /2\.0\.0-GA/);
  assert.strictEqual(stderr, '');

  const logs = parseJsonLogs(stdout);
  assert.strictEqual(logs.length, 2);
  assert.strictEqual(logs[0].event, 'RuntimeStarted');
  assert.strictEqual(logs[1].event, 'RuntimeShutdown');
  assert.strictEqual(logs[1].payload.event, 'VersionDisplayed');
});

test('CLI Contracts - Status command', async () => {
  const { code, stdout, stderr } = await runCli(['status']);
  assert.strictEqual(code, 0);
  assert.strictEqual(stderr, '');

  const lines = stdout.split('\n').filter(Boolean);
  const startLog = JSON.parse(lines[0]);
  const statusReport = JSON.parse(lines[1]);
  const shutdownLog = JSON.parse(lines[2]);

  assert.strictEqual(startLog.event, 'RuntimeStarted');
  assert.strictEqual(statusReport.status, 'ready');
  assert.ok(statusReport.session_id);
  assert.strictEqual(statusReport.config.env, 'development');
  assert.strictEqual(shutdownLog.event, 'RuntimeShutdown');
  assert.strictEqual(shutdownLog.payload.event, 'StatusReported');
});

test('CLI Contracts - Invalid command rejection', async () => {
  const { code, stdout, stderr } = await runCli(['invalid-command']);
  assert.strictEqual(code, 1);

  // RuntimeStarted is on stdout
  const outLogs = parseJsonLogs(stdout);
  assert.strictEqual(outLogs.length, 1);
  assert.strictEqual(outLogs[0].event, 'RuntimeStarted');

  // RuntimeFailed error log is on stderr
  const errLogs = parseJsonLogs(stderr);
  assert.strictEqual(errLogs.length, 1);
  assert.strictEqual(errLogs[0].event, 'RuntimeFailed');
  assert.strictEqual(errLogs[0].payload.event, 'UnknownCommand');
  assert.match(errLogs[0].payload.error, /Unknown command/);
});

test('CLI Contracts - Missing arguments rejection', async () => {
  const { code, stdout, stderr } = await runCli([]);
  assert.strictEqual(code, 1);
  assert.match(stdout, /Usage:/); // Help text printed to stdout

  // RuntimeStarted is on stdout
  const outLogs = parseJsonLogs(stdout);
  assert.strictEqual(outLogs.length, 1);
  assert.strictEqual(outLogs[0].event, 'RuntimeStarted');

  // RuntimeFailed error log is on stderr
  const errLogs = parseJsonLogs(stderr);
  assert.strictEqual(errLogs.length, 1);
  assert.strictEqual(errLogs[0].event, 'RuntimeFailed');
  assert.strictEqual(errLogs[0].payload.event, 'NoArgsProvided');
  assert.match(errLogs[0].payload.error, /No command or options/);
});

test('Runtime Identity - UUID format, uniqueness and immutability', async () => {
  const { stdout: out1 } = await runCli(['status']);
  const { stdout: out2 } = await runCli(['status']);

  const report1 = JSON.parse(out1.split('\n')[1]);
  const report2 = JSON.parse(out2.split('\n')[1]);

  // Format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.match(report1.session_id, uuidRegex);
  assert.match(report2.session_id, uuidRegex);

  // Uniqueness validation
  assert.notStrictEqual(report1.session_id, report2.session_id);

  // Immutability validation (object config freeze check)
  const beccModule = await import('../bin/becc.js');
  assert.ok(Object.isFrozen(beccModule.config));
  assert.throws(() => {
    (beccModule.config as any).env = 'production';
  }, TypeError);
});

test('Configuration Validation - Valid configuration loading', async () => {
  const { code, stdout } = await runCli(['status'], {
    BECC_TIMEOUT: '45',
    BECC_ENV: 'production',
    BECC_LOG_LEVEL: 'error'
  });
  assert.strictEqual(code, 0);

  const lines = stdout.split('\n').filter(Boolean);
  const statusReport = JSON.parse(lines[0]); // Under error log level, RuntimeStarted info log is suppressed!
  assert.strictEqual(statusReport.config.timeout, 45);
  assert.strictEqual(statusReport.config.env, 'production');
  assert.strictEqual(statusReport.config.logLevel, 'error');
});

test('Configuration Validation - Invalid BECC_TIMEOUT fails startup', async () => {
  const { code, stderr } = await runCli(['status'], { BECC_TIMEOUT: '-5' });
  assert.strictEqual(code, 1);
  const logs = parseJsonLogs(stderr);
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].event, 'RuntimeFailed');
  assert.match(logs[0].payload.error, /BECC_TIMEOUT/);
});

test('Configuration Validation - Invalid BECC_ENV fails startup', async () => {
  const { code, stderr } = await runCli(['status'], { BECC_ENV: 'staging' });
  assert.strictEqual(code, 1);
  const logs = parseJsonLogs(stderr);
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].event, 'RuntimeFailed');
  assert.match(logs[0].payload.error, /BECC_ENV/);
});

test('Configuration Validation - Invalid BECC_LOG_LEVEL fails startup', async () => {
  const { code, stderr } = await runCli(['status'], { BECC_LOG_LEVEL: 'debug' });
  assert.strictEqual(code, 1);
  const logs = parseJsonLogs(stderr);
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].event, 'RuntimeFailed');
  assert.match(logs[0].payload.error, /BECC_LOG_LEVEL/);
});

test('Lifecycle - Graceful exit on SIGINT via in-process triggers', async () => {
  process.env.BECC_TEST_INTERCEPT_EXIT = 'true';
  const beccModule = await import('../bin/becc.js');
  beccModule.resetShutdownState();

  let logCallCount = 0;
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk: any) => {
    const logObj = JSON.parse(chunk.toString().trim());
    if (logObj.event === 'RuntimeShutdown' && logObj.payload.event === 'SignalReceived') {
      logCallCount++;
    }
    return true;
  };

  try {
    process.emit('SIGINT');
  } finally {
    process.stdout.write = originalWrite;
  }

  assert.strictEqual(logCallCount, 1);
});

test('Lifecycle - Graceful exit on SIGTERM via in-process triggers', async () => {
  process.env.BECC_TEST_INTERCEPT_EXIT = 'true';
  const beccModule = await import('../bin/becc.js');
  beccModule.resetShutdownState();

  let logCallCount = 0;
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk: any) => {
    const logObj = JSON.parse(chunk.toString().trim());
    if (logObj.event === 'RuntimeShutdown' && logObj.payload.event === 'SignalReceived') {
      logCallCount++;
    }
    return true;
  };

  try {
    process.emit('SIGTERM');
  } finally {
    process.stdout.write = originalWrite;
  }

  assert.strictEqual(logCallCount, 1);
});

test('Lifecycle - Duplicate shutdown protection and failed-startup cleanup', async () => {
  process.env.BECC_TEST_INTERCEPT_EXIT = 'true';
  const beccModule = await import('../bin/becc.js');
  beccModule.resetShutdownState();

  let logCallCount = 0;
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk: any) => {
    const logObj = JSON.parse(chunk.toString().trim());
    if (logObj.event === 'RuntimeShutdown') {
      logCallCount++;
    }
    return true;
  };

  try {
    beccModule.shutdown('TestShutdown', 0);
    beccModule.shutdown('TestShutdownDuplicate', 0);
  } finally {
    process.stdout.write = originalWrite;
  }

  assert.strictEqual(logCallCount, 1);
});

test('Structured Logging - Log formats, properties and severity', async () => {
  process.env.BECC_TEST_INTERCEPT_EXIT = 'true';
  const mockWrite = {
    stdout: [] as any[],
    stderr: [] as any[],
    writeStdout(chunk: any) {
      this.stdout.push(JSON.parse(chunk.toString().trim()));
      return true;
    },
    writeStderr(chunk: any) {
      this.stderr.push(JSON.parse(chunk.toString().trim()));
      return true;
    }
  };

  const originalStdout = process.stdout.write;
  const originalStderr = process.stderr.write;
  process.stdout.write = mockWrite.writeStdout.bind(mockWrite) as any;
  process.stderr.write = mockWrite.writeStderr.bind(mockWrite) as any;

  try {
    const { log } = await import('../bin/becc.js');
    log('info', 'TestEventInfo', { details: 'info' });
    log('error', 'TestEventError', { details: 'error' });
  } finally {
    process.stdout.write = originalStdout;
    process.stderr.write = originalStderr;
    process.env.BECC_TEST_INTERCEPT_EXIT = 'false'; // Reset exit intercept at the very end
  }

  // Verify stdout properties
  assert.strictEqual(mockWrite.stdout.length, 1);
  const infoLog = mockWrite.stdout[0];
  assert.ok(infoLog.timestamp);
  assert.ok(infoLog.session_id);
  assert.strictEqual(infoLog.level, 'info');
  assert.strictEqual(infoLog.module, 'bin');
  assert.strictEqual(infoLog.event, 'TestEventInfo');
  assert.strictEqual(infoLog.payload.details, 'info');

  // Verify stderr properties
  assert.strictEqual(mockWrite.stderr.length, 1);
  const errLog = mockWrite.stderr[0];
  assert.strictEqual(errLog.level, 'error');
  assert.strictEqual(errLog.event, 'TestEventError');
  assert.strictEqual(errLog.payload.details, 'error');
});
