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

### PostgreSQL Client Library & Dual Test Substrates
- **Production Client**: `pg` (`node-postgres` v8.13.3) with `@types/pg`.
- **Fast Adapter Unit Test Substrate**: `pg-mem` (v3.0.14) for in-process memory-bound adapter unit tests.
- **Real Server Integration Test Substrate**: Native PostgreSQL 18.4 server process (via `embedded-postgres`) for production multi-session transaction, isolation level, locking, deadlock, and concurrency certification.

### Component Architecture
1. **`PostgresDatabaseManager`**: Manages `pg.Pool`, schema DDL bootstrap, and execution-scoped transaction boundary methods (`beginTransaction`, `commitTransaction`, `rollbackTransaction`).
2. **`PostgresRuntimeIntegrityUnitOfWork`**: Physical `UnitOfWork` implementation wrapping asynchronous domain execution in PostgreSQL transaction semantics with explicit `BEGIN ISOLATION LEVEL <level>` / `COMMIT` / `ROLLBACK`. Uses execution-scoped transaction ownership to prevent cross-request context sharing.
3. **`PostgresGovernanceRepository`**: Implements `GovernancePersistencePort` using parameterized SQL queries against `observations`, `lessons`, `rule_candidates`, and `governance_events`. Supports optional `forUpdate?: boolean` for transaction-scoped `SELECT ... FOR UPDATE` aggregate locking.
4. **`PostgresIdempotencyStore`**: Implements `IdempotencyStorePort` using parameterized SQL queries against `command_records`.
5. **`createPostgresGovernedLearningRuntime()`**: Factory function initializing and wiring the PostgreSQL durable runtime components.

---

## Transaction Invariants, Isolation & Context Security

### Transaction Isolation Level Syntax
- **Syntax**: `BEGIN ISOLATION LEVEL READ COMMITTED` (or `REPEATABLE READ` / `SERIALIZABLE`).
- **Applied Verification**: Executing `SHOW transaction_isolation;` inside active transaction context returns exact configured level (`CONFIGURED_ISOLATION_LEVEL_ACTUALLY_APPLIED: YES`).
- **Production Selection**: `READ COMMITTED` selected for balance of isolation, row-locking protection, and low deadlock risk.

### Execution-Scoped Transaction Ownership
- `PostgresRuntimeIntegrityUnitOfWork.execute` enforces that every top-level request receives its own execution-scoped `TransactionContext` and checks out a distinct `PoolClient` connection from `pg.Pool`.
- **Manager-Global Nesting Removed**: The database manager no longer tracks a manager-global `activeTransactionId`. Implicit transaction nesting across concurrent requests is DISALLOWED (`NESTED_TRANSACTION_POLICY: IMPLICIT_DISALLOWED`).

### Transaction Context Security
- **Physical Binding**: `TransactionContext` contains `transactionId`, `managerId`, `createdAt`, and `isDurable: true`.
- **Validation**:
  - `STALE_TRANSACTION_CONTEXT_REJECTED`: Operations after `COMMIT` or `ROLLBACK` are rejected.
  - `FOREIGN_TRANSACTION_CONTEXT_REJECTED`: Contexts from another manager instance are rejected.
  - `FABRICATED_TRANSACTION_CONTEXT_REJECTED`: Unregistered context IDs are rejected.
  - `MISSING_TRANSACTION_CONTEXT_REJECTED`: Write calls without an active transaction context fail closed with `RuntimeInvariantError`.

---

## Row Locking & Concurrency Control

### Aggregate Row Locking (`SELECT ... FOR UPDATE`)
- When reading existing domain entity state prior to authoritative mutation, repository queries append `FOR UPDATE` inside active transaction context (`SELECT_FOR_UPDATE_IMPLEMENTED: YES`).
- Multi-aggregate lock ordering follows deterministic sorting via `getConcurrencyScope(envelope)` (`DETERMINISTIC_POSTGRES_ROW_LOCK_ORDER: YES`).

### Post-BEGIN Command Arbitration
```text
Stage 8 Precheck (In-memory/read-only)
↓
Stage 9 Logical Concurrency Scope
↓
BEGIN ISOLATION LEVEL READ COMMITTED
↓
Recheck command_records inside Transaction
↓
same identity? → replay winner result
different identity? → REFUSED (REFUSAL_INVARIANT_VIOLATION)
lookup error? → ERROR + ROLLBACK
unseen? → proceed to handler
```

---

## Schema Bootstrap & Migration Claim Correction

- **Schema Model**: `initializeSchema()` executes idempotent DDL (`CREATE TABLE IF NOT EXISTS ...`).
- **Status**:
  - `POSTGRES_SCHEMA_BOOTSTRAP: YES`
  - `VERSIONED_POSTGRES_MIGRATIONS: NO`
  - `MIGRATION_CLAIM_CORRECTED: YES`

---

## Comparison: SQLite Level-2A vs PostgreSQL Level-2B

| Dimension | SQLite Level-2A | PostgreSQL Level-2B |
| --- | --- | --- |
| **Execution Mode** | Synchronous | Asynchronous (`processAndExecuteCommandAsync`) |
| **Concurrency Scope** | Single-file / local process | Multi-instance / multi-session database |
| **Transaction Isolation** | File lock (`BEGIN IMMEDIATE`) | `READ COMMITTED` (`BEGIN ISOLATION LEVEL READ COMMITTED`) |
| **JSON Storage** | `TEXT` (JSON string) | `JSONB` |
| **Distributed Mutex** | None | None (PostgreSQL native transaction boundaries) |

---

## Public API Stability

- `processAndExecuteCommand`: Retains synchronous execution for SQLite and in-memory runtimes. Throws `RuntimeInvariantError` if invoked against async PostgreSQL UnitOfWork (`POSTGRES_SYNC_PROMISE_CAST: NO`).
- `processAndExecuteCommandAsync`: Standard async entry point for PostgreSQL Level-2B operation.

---

## Security & Parameterization

- All SQL queries use parameterized positional arguments (`$1`, `$2`, etc.) to prevent SQL injection (`SQL_PARAMETERIZATION: PASS`).
- Database credentials fed exclusively via options / environment variables (`CREDENTIALS_COMMITTED: NO`).
