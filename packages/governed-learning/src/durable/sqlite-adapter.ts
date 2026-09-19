import { DatabaseSync } from 'node:sqlite';
import type {
  GovernancePersistencePort,
} from '../runtime/persistence.js';
import type {
  IdempotencyStorePort,
  GovernanceCommandRecord,
  TransactionContext,
  RuntimeIntegrityUnitOfWork,
} from '../contracts/ports.js';
import type { RuntimeOperationResult } from '../runtime/types.js';
import { RuntimeInvariantError } from '../runtime/errors.js';
import { GovernanceCommandRecordSchema } from '../contracts/ports.js';

function deepClone<T>(val: T): T {
  if (val === undefined || val === null) {
    return val;
  }
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(val);
    }
  } catch {
    // Fallback if structuredClone fails
  }
  return JSON.parse(JSON.stringify(val));
}

/**
 * SQLite Database Manager for Level-2 Durable Persistence.
 * Configures WAL mode, busy timeout, foreign keys, manages physical schema, and provides physical transaction handles.
 */
export class SqliteDatabaseManager {
  private readonly db: DatabaseSync;
  private readonly managerId: string;
  private inTransaction = false;
  private activeTransactionId: string | null = null;

  constructor(location: string = ':memory:') {
    this.managerId = `mgr_sqlite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.db = new DatabaseSync(location);
    this.initSchema();
  }

  private initSchema(): void {
    // Enable WAL journal mode, busy timeout & foreign keys for concurrency & durability
    try {
      this.db.exec('PRAGMA journal_mode = WAL;');
      this.db.exec('PRAGMA busy_timeout = 5000;');
      this.db.exec('PRAGMA foreign_keys = ON;');
    } catch {
      // In-memory databases may use memory journal mode
    }

    // Initialize physical schema
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS observations (
        observation_ref TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lessons (
        lesson_ref TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rule_candidates (
        rule_candidate_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS governance_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_ref TEXT,
        event_type TEXT NOT NULL,
        data TEXT NOT NULL,
        appended_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS command_records (
        command_id TEXT PRIMARY KEY,
        command_fingerprint TEXT NOT NULL,
        command_type TEXT NOT NULL,
        payload_version TEXT NOT NULL,
        issued_at TEXT,
        recorded_at TEXT NOT NULL,
        execution_outcome TEXT NOT NULL
      );
    `);
  }

  public getRawDatabase(): DatabaseSync {
    return this.db;
  }

  public getManagerId(): string {
    return this.managerId;
  }

  public getActiveTransactionId(): string | null {
    return this.activeTransactionId;
  }

  public isTransactionActive(): boolean {
    return this.inTransaction;
  }

  public verifyTransactionContext(txContext?: TransactionContext): boolean {
    if (!txContext) return false;
    if (!this.inTransaction || !this.activeTransactionId) return false;
    if (txContext.managerId !== this.managerId) return false;
    if (txContext.transactionId !== this.activeTransactionId) return false;
    return true;
  }

  public beginTransaction(): TransactionContext {
    if (!this.inTransaction) {
      this.db.exec('BEGIN IMMEDIATE;');
      this.inTransaction = true;
      this.activeTransactionId = `tx_sqlite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    return {
      transactionId: this.activeTransactionId!,
      createdAt: new Date().toISOString(),
      isDurable: true,
      managerId: this.managerId,
    };
  }

  public commitTransaction(txContext?: TransactionContext): void {
    if (txContext && !this.verifyTransactionContext(txContext)) {
      throw new RuntimeInvariantError('Attempted to commit with invalid, foreign, or stale transaction context');
    }
    if (this.inTransaction) {
      this.db.exec('COMMIT;');
      this.inTransaction = false;
      this.activeTransactionId = null;
    }
  }

  public rollbackTransaction(txContext?: TransactionContext): void {
    if (this.inTransaction) {
      try {
        this.db.exec('ROLLBACK;');
      } catch {
        // Ignore rollback error if transaction already ended
      } finally {
        this.inTransaction = false;
        this.activeTransactionId = null;
      }
    }
  }

  public close(): void {
    try {
      this.db.close();
    } catch {
      // Ignore if already closed
    }
  }
}

/**
 * Level-2 Durable RuntimeIntegrityUnitOfWork Adapter backed by SQLite physical transactions.
 * Supports both synchronous and asynchronous transactional execution without type-casting promises to sync values.
 */
export class SqliteRuntimeIntegrityUnitOfWork implements RuntimeIntegrityUnitOfWork {
  private readonly dbManager: SqliteDatabaseManager;

  constructor(dbManager: SqliteDatabaseManager) {
    this.dbManager = dbManager;
  }

  public execute<T>(
    operation: (context: TransactionContext) => Promise<T> | T
  ): Promise<T> | T {
    const isTopLevel = !this.dbManager.isTransactionActive();
    let txContext: TransactionContext;

    if (isTopLevel) {
      txContext = this.dbManager.beginTransaction();
    } else {
      txContext = {
        transactionId: this.dbManager.getActiveTransactionId() ?? 'tx_nested',
        createdAt: new Date().toISOString(),
        isDurable: true,
        managerId: this.dbManager.getManagerId(),
      };
    }

    try {
      const result = operation(txContext);

      if (result && typeof (result as any).then === 'function') {
        return (result as Promise<T>).then(
          (res) => {
            if (isTopLevel) {
              if (res && typeof res === 'object' && ((res as any).category === 'ERROR' || (res as any).rollbackRequired === true)) {
                this.dbManager.rollbackTransaction(txContext);
              } else {
                this.dbManager.commitTransaction(txContext);
              }
            }
            return res;
          },
          (err) => {
            if (isTopLevel) {
              this.dbManager.rollbackTransaction(txContext);
            }
            throw err;
          }
        );
      }

      if (isTopLevel) {
        if (result && typeof result === 'object' && ((result as any).category === 'ERROR' || (result as any).rollbackRequired === true)) {
          this.dbManager.rollbackTransaction(txContext);
        } else {
          this.dbManager.commitTransaction(txContext);
        }
      }

      return result;
    } catch (err) {
      if (isTopLevel) {
        this.dbManager.rollbackTransaction(txContext);
      }
      throw err;
    }
  }
}

/**
 * Level-2 Durable GovernancePersistencePort Adapter backed by SQLite.
 */
export class SqliteGovernanceRepository implements GovernancePersistencePort {
  private readonly dbManager: SqliteDatabaseManager;

  constructor(dbManager: SqliteDatabaseManager) {
    this.dbManager = dbManager;
  }

  public appendEvent(
    event: unknown,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly eventRef?: string; readonly appended: boolean }> {
    if (!transactionContext || !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, stale, or missing physical transaction context'),
      };
    }

    if (!event || typeof event !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot append null or invalid event to persistence log'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const eventObj = event as Record<string, unknown>;
      const eventType =
        typeof eventObj.eventType === 'string'
          ? eventObj.eventType
          : typeof (eventObj.payload as Record<string, unknown>)?.eventType === 'string'
          ? (eventObj.payload as Record<string, unknown>).eventType as string
          : 'UNKNOWN';

      const eventRefObj = eventObj.eventRef;
      const eventRefStr =
        typeof eventRefObj === 'object' && eventRefObj !== null
          ? (eventRefObj as Record<string, unknown>).value
          : eventRefObj;
      const refStr = typeof eventRefStr === 'string' ? eventRefStr : undefined;

      const stmt = db.prepare(
        'INSERT INTO governance_events (event_ref, event_type, data, appended_at) VALUES (?, ?, ?, ?)'
      );
      stmt.run(refStr ?? null, eventType, JSON.stringify(deepClone(event)), new Date().toISOString());

      return {
        ok: true,
        category: 'SUCCESS',
        data: {
          eventRef: refStr,
          appended: true,
        },
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite event append failed: ${String(err)}`),
      };
    }
  }

  public getEvents(
    filter?: { readonly eventRef?: string; readonly eventType?: string },
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<ReadonlyArray<unknown>> {
    if (transactionContext && !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, or stale physical transaction context'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      let sql = 'SELECT data, event_ref, event_type FROM governance_events ORDER BY id ASC';
      const params: unknown[] = [];

      if (filter?.eventRef && filter?.eventType) {
        sql = 'SELECT data, event_ref, event_type FROM governance_events WHERE event_ref = ? AND event_type = ? ORDER BY id ASC';
        params.push(filter.eventRef, filter.eventType);
      } else if (filter?.eventRef) {
        sql = 'SELECT data, event_ref, event_type FROM governance_events WHERE event_ref = ? ORDER BY id ASC';
        params.push(filter.eventRef);
      } else if (filter?.eventType) {
        sql = 'SELECT data, event_ref, event_type FROM governance_events WHERE event_type = ? ORDER BY id ASC';
        params.push(filter.eventType);
      }

      const stmt = db.prepare<{ data: string }>(sql);
      const rows = stmt.all(...params);

      const events = rows.map((r) => JSON.parse(r.data));

      return {
        ok: true,
        category: 'SUCCESS',
        data: events,
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite getEvents failed: ${String(err)}`),
      };
    }
  }

  public saveObservation(
    observation: unknown,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly observationRef: string; readonly saved: boolean }> {
    if (!transactionContext || !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, stale, or missing physical transaction context'),
      };
    }

    if (!observation || typeof observation !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot save null or invalid observation'),
      };
    }

    const refObj = (observation as Record<string, unknown>)?.observationRef;
    const ref = typeof refObj === 'object' && refObj !== null ? (refObj as Record<string, unknown>).value : refObj;

    if (!ref || typeof ref !== 'string') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Observation must possess a valid observationRef'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const existingStmt = db.prepare<{ observation_ref: string }>(
        'SELECT observation_ref FROM observations WHERE observation_ref = ?'
      );
      const existing = existingStmt.get(ref);

      if (existing) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
          reason: `Observation reference ${ref} already exists and historical mutation is denied`,
          rollbackRequired: true,
        } as any;
      }

      const stmt = db.prepare(
        'INSERT INTO observations (observation_ref, data, created_at) VALUES (?, ?, ?)'
      );
      stmt.run(ref, JSON.stringify(deepClone(observation)), new Date().toISOString());

      return {
        ok: true,
        category: 'SUCCESS',
        data: {
          observationRef: ref,
          saved: true,
        },
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite saveObservation failed: ${String(err)}`),
      };
    }
  }

  public getObservationByRef(
    observationRef: string,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<unknown> {
    if (transactionContext && !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, or stale physical transaction context'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const stmt = db.prepare<{ data: string }>(
        'SELECT data FROM observations WHERE observation_ref = ?'
      );
      const row = stmt.get(observationRef);

      if (!row) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE',
          reason: `Observation ${observationRef} not found in persistence store`,
        };
      }

      return {
        ok: true,
        category: 'SUCCESS',
        data: JSON.parse(row.data),
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite getObservationByRef failed: ${String(err)}`),
      };
    }
  }

  public saveLesson(
    lesson: unknown,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly lessonRef: string; readonly saved: boolean }> {
    if (!transactionContext || !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, stale, or missing physical transaction context'),
      };
    }

    if (!lesson || typeof lesson !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot save null or invalid lesson'),
      };
    }

    const refObj =
      (lesson as Record<string, unknown>)?.lessonRef ??
      (lesson as Record<string, unknown>)?.lessonCandidateRef;
    const ref = typeof refObj === 'object' && refObj !== null ? (refObj as Record<string, unknown>).value : refObj;

    if (!ref || typeof ref !== 'string') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Lesson must possess a valid lessonRef or lessonCandidateRef'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const existingStmt = db.prepare<{ lesson_ref: string }>(
        'SELECT lesson_ref FROM lessons WHERE lesson_ref = ?'
      );
      const existing = existingStmt.get(ref);

      if (existing) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
          reason: `Lesson reference ${ref} already exists and historical mutation is denied`,
          rollbackRequired: true,
        } as any;
      }

      const stmt = db.prepare(
        'INSERT INTO lessons (lesson_ref, data, created_at) VALUES (?, ?, ?)'
      );
      stmt.run(ref, JSON.stringify(deepClone(lesson)), new Date().toISOString());

      return {
        ok: true,
        category: 'SUCCESS',
        data: {
          lessonRef: ref,
          saved: true,
        },
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite saveLesson failed: ${String(err)}`),
      };
    }
  }

  public getLessonByRef(
    lessonRef: string,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<unknown> {
    if (transactionContext && !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, or stale physical transaction context'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const stmt = db.prepare<{ data: string }>(
        'SELECT data FROM lessons WHERE lesson_ref = ?'
      );
      const row = stmt.get(lessonRef);

      if (!row) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE',
          reason: `Lesson ${lessonRef} not found in persistence store`,
        };
      }

      return {
        ok: true,
        category: 'SUCCESS',
        data: JSON.parse(row.data),
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite getLessonByRef failed: ${String(err)}`),
      };
    }
  }

  public saveRuleCandidate(
    ruleCandidate: unknown,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly ruleCandidateId: string; readonly saved: boolean }> {
    if (!transactionContext || !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, stale, or missing physical transaction context'),
      };
    }

    if (!ruleCandidate || typeof ruleCandidate !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot save null or invalid rule candidate'),
      };
    }

    const id = (ruleCandidate as Record<string, unknown>)?.ruleCandidateId;

    if (!id || typeof id !== 'string') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Rule candidate must possess a valid ruleCandidateId'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const existingStmt = db.prepare<{ rule_candidate_id: string }>(
        'SELECT rule_candidate_id FROM rule_candidates WHERE rule_candidate_id = ?'
      );
      const existing = existingStmt.get(id);

      if (existing) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
          reason: `Rule candidate ${id} already exists and historical mutation is denied`,
          rollbackRequired: true,
        } as any;
      }

      const stmt = db.prepare(
        'INSERT INTO rule_candidates (rule_candidate_id, data, created_at) VALUES (?, ?, ?)'
      );
      stmt.run(id, JSON.stringify(deepClone(ruleCandidate)), new Date().toISOString());

      return {
        ok: true,
        category: 'SUCCESS',
        data: {
          ruleCandidateId: id,
          saved: true,
        },
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite saveRuleCandidate failed: ${String(err)}`),
      };
    }
  }

  public getRuleCandidateById(
    ruleCandidateId: string,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<unknown> {
    if (transactionContext && !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, or stale physical transaction context'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const stmt = db.prepare<{ data: string }>(
        'SELECT data FROM rule_candidates WHERE rule_candidate_id = ?'
      );
      const row = stmt.get(ruleCandidateId);

      if (!row) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE',
          reason: `Rule candidate ${ruleCandidateId} not found in persistence store`,
        };
      }

      return {
        ok: true,
        category: 'SUCCESS',
        data: JSON.parse(row.data),
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite getRuleCandidateById failed: ${String(err)}`),
      };
    }
  }
}

/**
 * Level-2 Durable IdempotencyStorePort Adapter backed by SQLite.
 */
export class SqliteIdempotencyStore implements IdempotencyStorePort {
  private readonly dbManager: SqliteDatabaseManager;

  constructor(dbManager: SqliteDatabaseManager) {
    this.dbManager = dbManager;
  }

  public getCommandExecution(
    commandId: string,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<GovernanceCommandRecord | undefined> {
    if (transactionContext && !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, or stale physical transaction context'),
      };
    }

    try {
      const db = this.dbManager.getRawDatabase();
      const stmt = db.prepare<{
        command_id: string;
        command_fingerprint: string;
        command_type: string;
        payload_version: string;
        issued_at: string | null;
        recorded_at: string;
        execution_outcome: string;
      }>('SELECT * FROM command_records WHERE command_id = ?');

      const row = stmt.get(commandId);

      if (!row) {
        return {
          ok: true,
          category: 'SUCCESS',
          data: undefined,
        };
      }

      const record: GovernanceCommandRecord = {
        commandId: row.command_id,
        commandFingerprint: row.command_fingerprint,
        commandType: row.command_type as any,
        payloadVersion: row.payload_version,
        issuedAt: row.issued_at ?? undefined,
        recordedAt: row.recorded_at,
        executionOutcome: JSON.parse(row.execution_outcome),
      };

      return {
        ok: true,
        category: 'SUCCESS',
        data: record,
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite getCommandExecution failed: ${String(err)}`),
      };
    }
  }

  public recordCommandExecution(
    record: GovernanceCommandRecord,
    transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly recorded: boolean; readonly record: GovernanceCommandRecord }> {
    if (!transactionContext || !this.dbManager.verifyTransactionContext(transactionContext)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Invalid, foreign, stale, or missing physical transaction context'),
      };
    }

    const parseResult = GovernanceCommandRecordSchema.safeParse(record);
    if (!parseResult.success) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`Invalid command record schema: ${parseResult.error.message}`),
      };
    }

    const cloned = deepClone(parseResult.data);
    const db = this.dbManager.getRawDatabase();

    // Check if commandId already exists inside active transaction
    const existingRes = this.getCommandExecution(cloned.commandId, transactionContext);
    if (existingRes.ok && existingRes.data) {
      const existing = existingRes.data;
      if (existing.commandFingerprint !== cloned.commandFingerprint) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
          reason: `Command execution record collision for commandId '${cloned.commandId}' with mismatched command identity`,
          rollbackRequired: true,
        } as any;
      }
      return {
        ok: true,
        category: 'SUCCESS',
        data: { recorded: false, record: existing },
      };
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO command_records (command_id, command_fingerprint, command_type, payload_version, issued_at, recorded_at, execution_outcome) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run(
        cloned.commandId,
        cloned.commandFingerprint,
        cloned.commandType,
        cloned.payloadVersion,
        cloned.issuedAt ?? null,
        cloned.recordedAt,
        JSON.stringify(cloned.executionOutcome)
      );

      return {
        ok: true,
        category: 'SUCCESS',
        data: { recorded: true, record: cloned },
      };
    } catch (err) {
      // Catch UNIQUE / PRIMARY KEY constraint failure if another transaction committed during arbitration
      const errStr = String(err);
      if (errStr.includes('UNIQUE constraint failed') || errStr.includes('PRIMARY KEY')) {
        const lookup = this.getCommandExecution(cloned.commandId, transactionContext);
        if (lookup.ok && lookup.data) {
          if (lookup.data.commandFingerprint === cloned.commandFingerprint) {
            return {
              ok: true,
              category: 'SUCCESS',
              data: { recorded: false, record: lookup.data },
            };
          } else {
            return {
              ok: false,
              category: 'REFUSED',
              refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
              reason: `Command execution record collision for commandId '${cloned.commandId}' with mismatched command identity`,
              rollbackRequired: true,
            } as any;
          }
        }
      }

      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`SQLite recordCommandExecution failed: ${errStr}`),
      };
    }
  }
}
