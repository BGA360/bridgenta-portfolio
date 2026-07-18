import { ILedgerStoragePort } from '../ports/ledger-storage.port.js';
import { SignedEvidenceRecord, LedgerStatus, LedgerLockPolicy, LedgerLockMetadata } from '../types.js';
import {
  EvidencePersistenceException,
  EvidenceLockTimeoutException,
  EvidencePermissionException
} from '../exceptions.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';

export class FileLedgerStorageAdapter implements ILedgerStoragePort {
  private baseDir: string;
  private lockPolicy: LedgerLockPolicy;

  constructor(repoRoot: string, policy?: LedgerLockPolicy) {
    this.baseDir = path.join(repoRoot, '.becc', 'evidence');
    this.lockPolicy = policy || {
      maximumWaitMs: 2000,
      initialRetryDelayMs: 100,
      maximumRetryDelayMs: 500,
      staleThresholdMs: 30000,
      backoffStrategy: 'exponential'
    };
  }

  private getLedgerPath(projectId: string): string {
    if (/[^a-zA-Z0-9_\-]/.test(projectId)) {
      throw new EvidencePermissionException('Invalid project ID format (path traversal safety).');
    }
    return path.join(this.baseDir, `ledger-${projectId}.jsonl`);
  }

  private getLockPath(projectId: string): string {
    return this.getLedgerPath(projectId) + '.lock';
  }

  private ensureDirExists() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true, mode: 0o700 });
    }
  }

  public async ledgerExists(projectId: string): Promise<boolean> {
    const file = this.getLedgerPath(projectId);
    return fs.existsSync(file);
  }

  public async initializeLedger(projectId: string, genesisRecord: SignedEvidenceRecord): Promise<void> {
    this.ensureDirExists();
    const file = this.getLedgerPath(projectId);
    if (fs.existsSync(file)) {
      throw new EvidencePersistenceException('Ledger already initialized.');
    }
    if (genesisRecord.payload.projectId !== projectId) {
      throw new EvidencePersistenceException('Project ID mismatch: record does not belong to this ledger.');
    }
    const line = JSON.stringify(genesisRecord) + '\n';
    try {
      const fd = fs.openSync(file, 'w', 0o600);
      fs.writeSync(fd, line);
      fs.fsyncSync(fd);
      fs.closeSync(fd);
    } catch (err: any) {
      throw new EvidencePersistenceException(`Failed to initialize ledger: ${err.message}`);
    }
  }

  public async readLedger(projectId: string): Promise<SignedEvidenceRecord[]> {
    const file = this.getLedgerPath(projectId);
    if (!fs.existsSync(file)) {
      return [];
    }
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const records: SignedEvidenceRecord[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        records.push(JSON.parse(trimmed));
      } catch (err) {
        throw err;
      }
    }
    return records;
  }

  public async appendRecord(projectId: string, record: SignedEvidenceRecord): Promise<void> {
    this.ensureDirExists();
    const file = this.getLedgerPath(projectId);
    const tmpFile = file + '.tmp';
    const line = JSON.stringify(record) + '\n';

    if (record.payload.projectId !== projectId) {
      throw new EvidencePersistenceException('Project ID mismatch: record does not belong to this ledger.');
    }
    
    try {
      const tmpFd = fs.openSync(tmpFile, 'w', 0o600);
      fs.writeSync(tmpFd, line);
      fs.fsyncSync(tmpFd);
      fs.closeSync(tmpFd);

      const fileFd = fs.openSync(file, 'a', 0o600);
      fs.writeSync(fileFd, line);
      fs.fsyncSync(fileFd);
      fs.closeSync(fileFd);
    } catch (err: any) {
      throw new EvidencePersistenceException(`Failed to append record: ${err.message}`);
    } finally {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }
  }

  public async getLedgerStatus(projectId: string): Promise<LedgerStatus> {
    const file = this.getLedgerPath(projectId);
    if (!fs.existsSync(file)) {
      return LedgerStatus.LEDGER_INVALID;
    }
    try {
      await this.readLedger(projectId);
      return LedgerStatus.LEDGER_VALID;
    } catch (err) {
      return LedgerStatus.LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL;
    }
  }

  public async acquireLock(projectId: string): Promise<string> {
    this.ensureDirExists();
    const lockFile = this.getLockPath(projectId);
    const lockId = randomUUID();
    const ownerToken = `${os.hostname()}:${process.pid}:${Date.now()}:${lockId}`;
    
    const startTime = Date.now();
    let delay = this.lockPolicy.initialRetryDelayMs;

    while (Date.now() - startTime < this.lockPolicy.maximumWaitMs) {
      try {
        const meta: LedgerLockMetadata = {
          lockId,
          ownerToken,
          processId: process.pid,
          hostId: os.hostname(),
          createdAt: new Date().toISOString(),
          ledgerId: `ledger-${projectId}`
        };
        fs.writeFileSync(lockFile, JSON.stringify(meta), { flag: 'wx', mode: 0o600 });
        return ownerToken;
      } catch (err: any) {
        if (err.code === 'EEXIST') {
          try {
            const content = fs.readFileSync(lockFile, 'utf8');
            const meta: LedgerLockMetadata = JSON.parse(content);

            // Validate metadata structure and values
            if (
              !meta ||
              typeof meta.lockId !== 'string' ||
              typeof meta.ownerToken !== 'string' ||
              typeof meta.processId !== 'number' ||
              typeof meta.hostId !== 'string' ||
              typeof meta.createdAt !== 'string' ||
              typeof meta.ledgerId !== 'string'
            ) {
              throw new EvidenceLockTimeoutException('Malformed lock metadata: safety abort.');
            }

            // Ledger identity matches
            if (meta.ledgerId !== `ledger-${projectId}`) {
              throw new EvidenceLockTimeoutException('Ledger identity mismatch: safety abort.');
            }

            // Ownership consistency checks
            const parts = meta.ownerToken.split(':');
            if (parts[0] !== meta.hostId || parseInt(parts[1], 10) !== meta.processId || parts[3] !== meta.lockId) {
              throw new EvidenceLockTimeoutException('Lock ownership token inconsistency: safety abort.');
            }

            const age = Date.now() - new Date(meta.createdAt).getTime();

            // Evaluate host relationship and process liveness
            if (meta.hostId === os.hostname()) {
              let isProcessAlive = true;
              try {
                process.kill(meta.processId, 0);
              } catch (e: any) {
                if (e.code === 'ESRCH') {
                  isProcessAlive = false;
                }
              }

              // Break lock ONLY if the process is dead AND it exceeds the recovery age staleThresholdMs
              if (!isProcessAlive && age > this.lockPolicy.staleThresholdMs) {
                fs.unlinkSync(lockFile);
                continue;
              }
            } else {
              // Remote-host or unknown-host lock: Do not break solely on age.
              if (age > this.lockPolicy.staleThresholdMs) {
                throw new EvidenceLockTimeoutException('Remote host stale lock recovery unsafe.');
              }
            }
          } catch (e2: any) {
            if (e2 instanceof EvidenceLockTimeoutException) {
              throw e2;
            }
            // Ignore other json parse/read errors and wait retry
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        if (this.lockPolicy.backoffStrategy === 'exponential') {
          delay = Math.min(delay * 2, this.lockPolicy.maximumRetryDelayMs);
        }
      }
    }
    throw new EvidenceLockTimeoutException('Failed to acquire ledger lock: timeout.');
  }

  public async releaseLock(projectId: string, ownerToken: string): Promise<void> {
    const lockFile = this.getLockPath(projectId);
    if (!fs.existsSync(lockFile)) {
      return;
    }
    try {
      const content = fs.readFileSync(lockFile, 'utf8');
      const meta: LedgerLockMetadata = JSON.parse(content);
      if (meta.ownerToken === ownerToken) {
        fs.unlinkSync(lockFile);
      }
    } catch {
      // Ignore
    }
  }
}
