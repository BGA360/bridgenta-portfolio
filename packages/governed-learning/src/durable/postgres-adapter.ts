import type { Pool, PoolClient } from 'pg';
import type { GovernancePersistencePort } from '../runtime/persistence.js';
import type {
  IdempotencyStorePort,
  GovernanceCommandRecord,
  TransactionContext,
  RuntimeIntegrityUnitOfWork,
} from '../contracts/ports.js';
import type { RuntimeOperationResult } from '../runtime/types.js';
import { GovernedLearningRuntimeError, RuntimeInvariantError } from '../runtime/errors.js';
import { GovernedLearningRuntime } from '../runtime/index.js';

function toRuntimeError(err: unknown, fallbackMessage = 'Database error'): GovernedLearningRuntimeError {
  if (err instanceof GovernedLearningRuntimeError) {
    return err;
  }
  return new RuntimeInvariantError(err instanceof Error ? err.message : fallbackMessage);
}

export interface PostgresDatabaseManagerOptions {
  pool?: Pool;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | object;
  maxConnections?: number;
  idleTimeoutMillis?: number;
  pgMemDb?: any;
}

export class PostgresDatabaseManager {
  private readonly pool: Pool;
  private readonly managerId: string;
  private readonly pgMemDb?: any;
  private readonly activeTransactions = new Map<
    string,
    { client: PoolClient; createdAt: string; backup?: any }
  >();
  private activeTransactionId: string | null = null;
  private isPoolOwned = false;

  constructor(options: PostgresDatabaseManagerOptions = {}) {
    this.managerId = `pg_mgr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.pgMemDb = options.pgMemDb;
    if (options.pool) {
      this.pool = options.pool;
      this.isPoolOwned = false;
    } else {
      const { Pool: PgPool } = require('pg');
      this.pool = new PgPool({
        connectionString: options.connectionString,
        host: options.host ?? 'localhost',
        port: options.port ?? 5432,
        database: options.database ?? 'governed_learning',
        user: options.user ?? 'postgres',
        password: options.password,
        ssl: options.ssl,
        max: options.maxConnections ?? 10,
        idleTimeoutMillis: options.idleTimeoutMillis ?? 10000,
      });
      this.isPoolOwned = true;
    }
  }

  public getManagerId(): string {
    return this.managerId;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public isTransactionActive(): boolean {
    return this.activeTransactions.size > 0;
  }

  public getActiveTransactionId(): string | null {
    return this.activeTransactionId;
  }

  public async initializeSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        CREATE TABLE IF NOT EXISTS observations (
          observation_ref VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS lessons (
          lesson_ref VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS rule_candidates (
          rule_candidate_id VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS governance_events (
          id BIGSERIAL PRIMARY KEY,
          event_ref VARCHAR(255),
          event_type VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          appended_at VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS command_records (
          command_id VARCHAR(255) PRIMARY KEY,
          command_fingerprint VARCHAR(512) NOT NULL,
          command_type VARCHAR(255) NOT NULL,
          payload_version VARCHAR(50) NOT NULL,
          issued_at VARCHAR(255),
          recorded_at VARCHAR(255) NOT NULL,
          execution_outcome JSONB NOT NULL
        );
      `);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async beginTransaction(
    isolationLevel: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE' = 'READ COMMITTED'
  ): Promise<TransactionContext> {
    const client = await this.pool.connect();
    const txId = `tx_pg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await client.query('BEGIN');
      const backup = this.pgMemDb ? this.pgMemDb.backup() : undefined;
      this.activeTransactions.set(txId, {
        client,
        createdAt: new Date().toISOString(),
        backup,
      });
      this.activeTransactionId = txId;

      return {
        transactionId: txId,
        createdAt: new Date().toISOString(),
        isDurable: true,
        managerId: this.managerId,
      };
    } catch (err) {
      client.release();
      throw err;
    }
  }

  public async commitTransaction(txContext: TransactionContext): Promise<void> {
    const verification = this.verifyTransactionContext(txContext);
    if (!verification.ok) {
      throw verification.error;
    }

    const txEntry = this.activeTransactions.get(txContext.transactionId);
    if (!txEntry) {
      throw new RuntimeInvariantError(`Transaction '${txContext.transactionId}' is no longer active`);
    }

    try {
      await txEntry.client.query('COMMIT');
    } finally {
      this.activeTransactions.delete(txContext.transactionId);
      if (this.activeTransactionId === txContext.transactionId) {
        this.activeTransactionId = null;
      }
      txEntry.client.release();
    }
  }

  public async rollbackTransaction(txContext: TransactionContext): Promise<void> {
    const txEntry = this.activeTransactions.get(txContext.transactionId);
    if (!txEntry) {
      return;
    }

    try {
      if (txEntry.backup) {
        txEntry.backup.restore();
      }
      await txEntry.client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors if transaction already ended
    } finally {
      this.activeTransactions.delete(txContext.transactionId);
      if (this.activeTransactionId === txContext.transactionId) {
        this.activeTransactionId = null;
      }
      txEntry.client.release();
    }
  }

  public verifyTransactionContext(
    txContext?: TransactionContext
  ): { ok: boolean; category?: 'ERROR'; error?: GovernedLearningRuntimeError } {
    if (!txContext) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Operation missing physical transaction context'),
      };
    }

    if (txContext.managerId !== this.managerId) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Transaction context belongs to a foreign database manager'),
      };
    }

    if (!this.activeTransactions.has(txContext.transactionId)) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Transaction context is stale or invalid'),
      };
    }

    return { ok: true };
  }

  public getClient(txContext?: TransactionContext): PoolClient {
    if (txContext) {
      const txEntry = this.activeTransactions.get(txContext.transactionId);
      if (txEntry) {
        return txEntry.client;
      }
    }
    throw new RuntimeInvariantError('No active transaction client available for given context');
  }

  public async close(): Promise<void> {
    for (const [txId, entry] of this.activeTransactions.entries()) {
      try {
        await entry.client.query('ROLLBACK');
      } catch {
        // Ignore
      } finally {
        entry.client.release();
      }
    }
    this.activeTransactions.clear();
    this.activeTransactionId = null;

    if (this.isPoolOwned) {
      await this.pool.end();
    }
  }
}

/**
 * Level-2 Durable RuntimeIntegrityUnitOfWork Adapter backed by PostgreSQL physical transactions.
 * Supports asynchronous transactional execution without casting promises to sync values.
 */
export class PostgresRuntimeIntegrityUnitOfWork implements RuntimeIntegrityUnitOfWork {
  private readonly dbManager: PostgresDatabaseManager;
  private readonly isolationLevel: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';

  constructor(
    dbManager: PostgresDatabaseManager,
    isolationLevel: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE' = 'READ COMMITTED'
  ) {
    this.dbManager = dbManager;
    this.isolationLevel = isolationLevel;
  }

  public async execute<T>(
    operation: (context: TransactionContext) => Promise<T> | T
  ): Promise<T> {
    const isTopLevel = !this.dbManager.isTransactionActive();
    let txContext: TransactionContext;

    if (isTopLevel) {
      txContext = await this.dbManager.beginTransaction(this.isolationLevel);
    } else {
      txContext = {
        transactionId: this.dbManager.getActiveTransactionId() ?? 'tx_nested',
        createdAt: new Date().toISOString(),
        isDurable: true,
        managerId: this.dbManager.getManagerId(),
      };
    }

    try {
      const result = await operation(txContext);

      if (isTopLevel) {
        if (
          result &&
          typeof result === 'object' &&
          ((result as any).category === 'ERROR' || (result as any).rollbackRequired === true)
        ) {
          await this.dbManager.rollbackTransaction(txContext);
        } else {
          await this.dbManager.commitTransaction(txContext);
        }
      }

      return result;
    } catch (err) {
      if (isTopLevel) {
        await this.dbManager.rollbackTransaction(txContext);
      }
      throw err;
    }
  }
}

/**
 * Level-2 Durable GovernancePersistencePort Adapter backed by PostgreSQL.
 */
export class PostgresGovernanceRepository implements GovernancePersistencePort {
  private readonly dbManager: PostgresDatabaseManager;

  constructor(dbManager: PostgresDatabaseManager) {
    this.dbManager = dbManager;
  }

  public async saveObservation(
    observation: unknown,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<{ readonly observationRef: string; readonly saved: boolean }>> {
    const verification = this.dbManager.verifyTransactionContext(transactionContext);
    if (!verification.ok) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
    }

    const obs = observation as any;
    const ref = obs.observationRef ?? obs.value ?? obs.id;
    if (!ref) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Observation record missing observationRef'),
      };
    }

    try {
      const client = this.dbManager.getClient(transactionContext);
      const createdAt = new Date().toISOString();

      const existing = await client.query(
        'SELECT data FROM observations WHERE observation_ref = $1',
        [ref]
      );
      const isExisting = Array.isArray(existing?.rows) && existing.rows.length > 0;
      if (isExisting) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
          reason: `Observation '${ref}' already exists and cannot be overwritten`,
          rollbackRequired: true,
        };
      }

      await client.query(
        'INSERT INTO observations (observation_ref, data, created_at) VALUES ($1, $2, $3)',
        [ref, JSON.stringify(obs), createdAt]
      );

      return { ok: true, category: 'SUCCESS', data: { observationRef: ref, saved: true } };
    } catch (err: any) {
      if (err?.code === '23505' || err?.message?.includes('duplicate key') || err?.message?.includes('PRIMARY KEY')) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
          reason: `Observation '${ref}' already exists and cannot be overwritten`,
          rollbackRequired: true,
        };
      }
      return {
        ok: false,
        category: 'ERROR',
        error: toRuntimeError(err),
      };
    }
  }

  public async getObservationByRef(
    ref: string,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<unknown>> {
    try {
      let clientOrPool: any;
      if (transactionContext) {
        const verification = this.dbManager.verifyTransactionContext(transactionContext);
        if (!verification.ok) {
          return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
        }
        clientOrPool = this.dbManager.getClient(transactionContext);
      } else {
        clientOrPool = this.dbManager.getPool();
      }

      const res = await clientOrPool.query(
        'SELECT data FROM observations WHERE observation_ref = $1',
        [ref]
      );
      const rows = res?.rows ?? [];
      if (rows.length === 0) {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError(`Observation '${ref}' not found`),
        };
      }
      const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
      return { ok: true, category: 'SUCCESS', data };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }

  public async saveLesson(
    lesson: unknown,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<{ readonly lessonRef: string; readonly saved: boolean }>> {
    const verification = this.dbManager.verifyTransactionContext(transactionContext);
    if (!verification.ok) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
    }

    const lsn = lesson as any;
    const ref = lsn.lessonRef ?? lsn.lessonCandidateRef ?? lsn.id;
    if (!ref) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Lesson record missing lessonRef'),
      };
    }

    try {
      const client = this.dbManager.getClient(transactionContext);
      const createdAt = new Date().toISOString();

      await client.query(
        'INSERT INTO lessons (lesson_ref, data, created_at) VALUES ($1, $2, $3)',
        [ref, JSON.stringify(lsn), createdAt]
      );

      return { ok: true, category: 'SUCCESS', data: { lessonRef: ref, saved: true } };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }

  public async getLessonByRef(
    ref: string,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<unknown>> {
    try {
      let clientOrPool: any;
      if (transactionContext) {
        const verification = this.dbManager.verifyTransactionContext(transactionContext);
        if (!verification.ok) {
          return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
        }
        clientOrPool = this.dbManager.getClient(transactionContext);
      } else {
        clientOrPool = this.dbManager.getPool();
      }

      const res = await clientOrPool.query(
        'SELECT data FROM lessons WHERE lesson_ref = $1',
        [ref]
      );
      const rows = res?.rows ?? [];
      if (rows.length === 0) {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError(`Lesson '${ref}' not found`),
        };
      }
      const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
      return { ok: true, category: 'SUCCESS', data };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }

  public async saveRuleCandidate(
    ruleCandidate: unknown,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<{ readonly ruleCandidateId: string; readonly saved: boolean }>> {
    const verification = this.dbManager.verifyTransactionContext(transactionContext);
    if (!verification.ok) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
    }

    const rc = ruleCandidate as any;
    const id = rc.ruleCandidateId ?? rc.id;
    if (!id) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('RuleCandidate record missing ruleCandidateId'),
      };
    }

    try {
      const client = this.dbManager.getClient(transactionContext);
      const createdAt = new Date().toISOString();

      await client.query(
        'INSERT INTO rule_candidates (rule_candidate_id, data, created_at) VALUES ($1, $2, $3)',
        [id, JSON.stringify(rc), createdAt]
      );

      return { ok: true, category: 'SUCCESS', data: { ruleCandidateId: id, saved: true } };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }

  public async getRuleCandidateById(
    id: string,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<unknown>> {
    try {
      let clientOrPool: any;
      if (transactionContext) {
        const verification = this.dbManager.verifyTransactionContext(transactionContext);
        if (!verification.ok) {
          return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
        }
        clientOrPool = this.dbManager.getClient(transactionContext);
      } else {
        clientOrPool = this.dbManager.getPool();
      }

      const res = await clientOrPool.query(
        'SELECT data FROM rule_candidates WHERE rule_candidate_id = $1',
        [id]
      );
      const rows = res?.rows ?? [];
      if (rows.length === 0) {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError(`RuleCandidate '${id}' not found`),
        };
      }
      const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
      return { ok: true, category: 'SUCCESS', data };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }

  public async appendEvent(
    event: unknown,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<{ readonly eventRef?: string; readonly appended: boolean }>> {
    const verification = this.dbManager.verifyTransactionContext(transactionContext);
    if (!verification.ok) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
    }

    const evt = event as any;
    const eventRef = evt.eventRef ?? evt.id;
    const eventType = evt.eventType ?? 'UNKNOWN_EVENT';

    try {
      const client = this.dbManager.getClient(transactionContext);
      const appendedAt = new Date().toISOString();

      await client.query(
        'INSERT INTO governance_events (event_ref, event_type, data, appended_at) VALUES ($1, $2, $3, $4)',
        [eventRef ?? null, eventType, JSON.stringify(evt), appendedAt]
      );

      return { ok: true, category: 'SUCCESS', data: { eventRef, appended: true } };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }

  public async getEvents(
    filter?: { readonly eventRef?: string; readonly eventType?: string },
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<ReadonlyArray<unknown>>> {
    try {
      let clientOrPool: any;
      if (transactionContext) {
        const verification = this.dbManager.verifyTransactionContext(transactionContext);
        if (!verification.ok) {
          return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
        }
        clientOrPool = this.dbManager.getClient(transactionContext);
      } else {
        clientOrPool = this.dbManager.getPool();
      }

      const res = await clientOrPool.query(
        'SELECT data FROM governance_events ORDER BY id ASC'
      );
      const rows = res?.rows ?? [];
      let events: unknown[] = rows.map((r: any) =>
        typeof r.data === 'string' ? JSON.parse(r.data) : r.data
      );

      if (filter?.eventRef) {
        events = events.filter((e) => (e as any)?.eventRef === filter.eventRef);
      }
      if (filter?.eventType) {
        events = events.filter((e) => (e as any)?.eventType === filter.eventType);
      }

      return { ok: true, category: 'SUCCESS', data: events };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }
}

/**
 * Level-2 Durable IdempotencyStorePort Adapter backed by PostgreSQL.
 */
export class PostgresIdempotencyStore implements IdempotencyStorePort {
  private readonly dbManager: PostgresDatabaseManager;

  constructor(dbManager: PostgresDatabaseManager) {
    this.dbManager = dbManager;
  }

  public async getCommandExecution(
    commandId: string,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<GovernanceCommandRecord | undefined>> {
    try {
      let clientOrPool: any;
      if (transactionContext) {
        const verification = this.dbManager.verifyTransactionContext(transactionContext);
        if (!verification.ok) {
          return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
        }
        clientOrPool = this.dbManager.getClient(transactionContext);
      } else {
        clientOrPool = this.dbManager.getPool();
      }

      const res = await clientOrPool.query(
        'SELECT command_id, command_fingerprint, command_type, payload_version, issued_at, recorded_at, execution_outcome FROM command_records WHERE command_id = $1',
        [commandId]
      );

      const rows = res?.rows ?? [];
      if (rows.length === 0) {
        return { ok: true, category: 'SUCCESS', data: undefined };
      }

      const row = rows[0];
      const outcome = typeof row.execution_outcome === 'string'
        ? JSON.parse(row.execution_outcome)
        : row.execution_outcome;

      const record: GovernanceCommandRecord = {
        commandId: row.command_id,
        commandFingerprint: row.command_fingerprint,
        commandType: row.command_type,
        payloadVersion: row.payload_version,
        issuedAt: row.issued_at ?? undefined,
        recordedAt: row.recorded_at,
        executionOutcome: outcome,
      };

      return { ok: true, category: 'SUCCESS', data: record };
    } catch (err: any) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }

  public async recordCommandExecution(
    record: GovernanceCommandRecord,
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<{ readonly recorded: boolean; readonly record: GovernanceCommandRecord }>> {
    const verification = this.dbManager.verifyTransactionContext(transactionContext);
    if (!verification.ok) {
      return { ok: false, category: 'ERROR', error: toRuntimeError(verification.error) };
    }

    const client = this.dbManager.getClient(transactionContext);

    try {
      await client.query(
        'INSERT INTO command_records (command_id, command_fingerprint, command_type, payload_version, issued_at, recorded_at, execution_outcome) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          record.commandId,
          record.commandFingerprint,
          record.commandType,
          record.payloadVersion,
          record.issuedAt ?? null,
          record.recordedAt,
          JSON.stringify(record.executionOutcome),
        ]
      );

      return { ok: true, category: 'SUCCESS', data: { recorded: true, record } };
    } catch (err: any) {
      if (err?.code === '23505' || err?.message?.includes('duplicate key') || err?.message?.includes('PRIMARY KEY')) {
        const existingRes = await this.getCommandExecution(record.commandId, transactionContext);
        if (existingRes.ok && existingRes.data) {
          const existing = existingRes.data;
          const isFingerprintMatch = existing.commandFingerprint === record.commandFingerprint;
          const isIssuedAtMatch = !existing.issuedAt || existing.issuedAt === record.issuedAt;

          if (isFingerprintMatch && isIssuedAtMatch) {
            return { ok: true, category: 'SUCCESS', data: { recorded: false, record: existing } };
          }
        }

        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
          reason: `Command execution record collision for commandId '${record.commandId}' with mismatched command identity`,
          rollbackRequired: true,
        };
      }

      return { ok: false, category: 'ERROR', error: toRuntimeError(err) };
    }
  }
}

/**
 * Factory function to create a PostgreSQL-backed GovernedLearningRuntime instance.
 */
export function createPostgresGovernedLearningRuntime(
  options: PostgresDatabaseManagerOptions = {}
): {
  runtime: GovernedLearningRuntime;
  dbManager: PostgresDatabaseManager;
  persistencePort: PostgresGovernanceRepository;
  idempotencyStore: PostgresIdempotencyStore;
  unitOfWork: PostgresRuntimeIntegrityUnitOfWork;
} {
  const dbManager = new PostgresDatabaseManager(options);
  const persistencePort = new PostgresGovernanceRepository(dbManager);
  const idempotencyStore = new PostgresIdempotencyStore(dbManager);
  const unitOfWork = new PostgresRuntimeIntegrityUnitOfWork(dbManager);

  const runtime = new GovernedLearningRuntime({
    persistencePort,
    idempotencyStore,
    unitOfWork,
  });

  return {
    runtime,
    dbManager,
    persistencePort,
    idempotencyStore,
    unitOfWork,
  };
}
