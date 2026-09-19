# Governed Learning PostgreSQL Level-2 Production Adapter Architecture

## Executive Summary

`GL-HARDENING-006` introduces the PostgreSQL Level-2B durable transaction adapter for Governed Learning. The Level-2 production invariant enforces that domain entity writes, domain event appends, and command execution records occur atomically within **ONE physical PostgreSQL database transaction**.

```text
Domain Entity State Mutation
+
Domain Event Log Append
+
Command Execution Record Insert
=
ONE PostgreSQL Transaction
```

## Architectural Design & Client Selection

### PostgreSQL Client Library Choice
- **Client**: `pg` (`node-postgres`) with `@types/pg` and `pg-mem` for in-memory integration testing.
- **Selection Rationale**: `pg` is the standard Node.js client supporting connection pooling (`pg.Pool`), parameterized queries (`$1, $2`), explicit `BEGIN`, `COMMIT`, `ROLLBACK`, and transaction-scoped client checkouts.

### Component Map
1. **`PostgresDatabaseManager`**: Manages `pg.Pool`, schema creation, and transaction boundary methods (`beginTransaction`, `commitTransaction`, `rollbackTransaction`).
2. **`PostgresRuntimeIntegrityUnitOfWork`**: Physical `UnitOfWork` implementation wrapping asynchronous domain execution in PostgreSQL transaction semantics with explicit `BEGIN` / `COMMIT` / `ROLLBACK`.
3. **`PostgresGovernanceRepository`**: Implements `GovernancePersistencePort` using parameterized SQL queries against `observations`, `lessons`, `rule_candidates`, and `governance_events`.
4. **`PostgresIdempotencyStore`**: Implements `IdempotencyStorePort` using parameterized SQL queries against `command_records`.
5. **`createPostgresGovernedLearningRuntime()`**: Factory function initializing and wiring the PostgreSQL durable runtime components.

---

## Transaction Invariants & Context Security

### Transaction Context Enforcement
- **Physical Binding**: `TransactionContext` contains `transactionId`, `managerId`, `createdAt`, and `isDurable: true`.
- **Validation**:
  - `STALE_CONTEXT_REJECTED`: Operations after `COMMIT` or `ROLLBACK` are rejected.
  - `FOREIGN_CONTEXT_REJECTED`: Contexts from another manager instance are rejected.
  - `FABRICATED_CONTEXT_REJECTED`: Unregistered context IDs are rejected.
  - `MISSING_CONTEXT_REJECTED`: Write calls without an active transaction context fail closed with `RuntimeInvariantError`.

### Connection Release Safety
- Under both `COMMIT` and `ROLLBACK` (including thrown errors), `PostgresRuntimeIntegrityUnitOfWork` releases checking-out clients cleanly back to the pool via `finally` blocks. No orphaned connections or uncommitted open transactions leak into the pool.

---

## Stage 8 & Stage 9 Concurrency & Arbitration

### Post-BEGIN Command Arbitration
```text
Stage 8 Precheck (In-memory/read-only)
↓
Stage 9 Logical Concurrency Scope
↓
BEGIN PostgreSQL Transaction
↓
Recheck command_records inside Transaction
↓
same identity? → replay winner result
different identity? → REFUSED (REFUSAL_INVARIANT_VIOLATION)
lookup error? → ERROR + ROLLBACK
unseen? → proceed to handler
```

### Multi-Instance Arbitration Invariant
- **Unique Constraint**: `PRIMARY KEY (command_id)` on `command_records`.
- **At-Most-One Committed Effect**: Only one transaction per `commandId` can insert into `command_records` and commit authoritative entity/event writes. Losing transactions in concurrent races roll back completely.
- **Fail-Closed Lookup Handling**: If post-BEGIN command record lookup encounters an database error, the runtime rolls back immediately and propagates `ERROR`.

---

## Database Schema & Serialization

```sql
CREATE TABLE IF NOT EXISTS observations (
  observation_ref VARCHAR(255) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  statement TEXT NOT NULL,
  evidence_refs JSONB NOT NULL,
  state VARCHAR(100) NOT NULL,
  created_at VARCHAR(100) NOT NULL,
  updated_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  lesson_ref VARCHAR(255) PRIMARY KEY,
  lesson_id VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT NOT NULL,
  state VARCHAR(100) NOT NULL,
  created_at VARCHAR(100) NOT NULL,
  updated_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS rule_candidates (
  rule_candidate_id VARCHAR(255) PRIMARY KEY,
  proposed_rule TEXT NOT NULL,
  source_lesson_ref JSONB NOT NULL,
  state VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS governance_events (
  event_ref VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_records (
  command_id VARCHAR(255) PRIMARY KEY,
  command_fingerprint VARCHAR(255) NOT NULL,
  command_type VARCHAR(100) NOT NULL,
  payload_version VARCHAR(50) NOT NULL,
  issued_at VARCHAR(100),
  recorded_at VARCHAR(100) NOT NULL,
  execution_outcome JSONB NOT NULL
);
```

---

## Comparison: SQLite Level-2A vs PostgreSQL Level-2B

| Dimension | SQLite Level-2A | PostgreSQL Level-2B |
| --- | --- | --- |
| **Execution Mode** | Synchronous | Asynchronous (`processAndExecuteCommandAsync`) |
| **Concurrency Scope** | Single-file / local process | Multi-instance / multi-connection database |
| **Transaction Isolation** | File lock (`BEGIN IMMEDIATE`) | `READ COMMITTED` / `SERIALIZABLE` |
| **JSON Storage** | `TEXT` (JSON string) | `JSONB` |
| **Distributed Mutex** | None | None (PostgreSQL native transaction isolation) |

---

## Public API Stability

- `processAndExecuteCommand`: Retains synchronous execution for SQLite and in-memory runtimes. Throws `RuntimeInvariantError` if invoked against async PostgreSQL UnitOfWork to prevent unhandled Promise casting (`POSTGRES_SYNC_PROMISE_CAST: NO`).
- `processAndExecuteCommandAsync`: The standard async entry point for PostgreSQL Level-2B operation.

---

## Security & Parameterization

- All SQL queries use parameterized positional arguments (`$1`, `$2`, etc.) to prevent SQL injection.
- Database credentials are fed exclusively via `PostgresDatabaseManagerOptions` / environment variables.
