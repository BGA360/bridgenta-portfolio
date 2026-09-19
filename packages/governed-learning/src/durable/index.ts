import { SqliteDatabaseManager, SqliteGovernanceRepository, SqliteIdempotencyStore, SqliteRuntimeIntegrityUnitOfWork } from './sqlite-adapter.js';
import { GovernedLearningRuntime } from '../runtime/index.js';
import type { GovernedLearningRuntimeOptions } from '../runtime/index.js';
import type { GovernancePersistencePort } from '../runtime/persistence.js';
import type { IdempotencyStorePort, RuntimeIntegrityUnitOfWork } from '../contracts/ports.js';

export * from './sqlite-adapter.js';

export interface SqliteGovernedLearningRuntimeOptions extends GovernedLearningRuntimeOptions {
  readonly databasePath?: string;
  readonly dbManager?: SqliteDatabaseManager;
}

/**
 * Creates a Governed Learning Runtime instance fully configured with Level-2 SQLite Durable Persistence.
 */
export function createSqliteGovernedLearningRuntime(
  options?: SqliteGovernedLearningRuntimeOptions
): {
  runtime: GovernedLearningRuntime;
  dbManager: SqliteDatabaseManager;
  persistencePort: GovernancePersistencePort;
  idempotencyStore: IdempotencyStorePort;
  unitOfWork: RuntimeIntegrityUnitOfWork;
} {
  const dbManager = options?.dbManager ?? new SqliteDatabaseManager(options?.databasePath ?? ':memory:');
  const persistencePort = options?.persistencePort ?? new SqliteGovernanceRepository(dbManager);
  const idempotencyStore = options?.idempotencyStore ?? new SqliteIdempotencyStore(dbManager);
  const unitOfWork = options?.unitOfWork ?? new SqliteRuntimeIntegrityUnitOfWork(dbManager);

  const runtime = new GovernedLearningRuntime({
    ...options,
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
