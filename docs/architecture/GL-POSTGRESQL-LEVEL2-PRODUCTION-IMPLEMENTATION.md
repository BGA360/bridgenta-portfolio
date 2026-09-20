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
- **Fast Adapter Unit Test Substrate**: `pg-mem` (v3.0.14) for in-process memory-bound adapter unit tests (271 package tests).
- **Real Server Integration Test Substrate**: Native PostgreSQL 18.4 server process (via `embedded-postgres`) for production multi-session transaction, isolation level, locking, deadlock, and concurrency certification (15 real-server tests).

### Component Architecture
1. **`PostgresDatabaseManager`**: Manages `pg.Pool`, schema DDL bootstrap, and execution-scoped transaction boundary methods (`beginTransaction`, `commitTransaction`, `rollbackTransaction`). Obsolete manager-global active transaction pointer (`activeTransactionId`) has been removed (`OBSOLETE_GLOBAL_ACTIVE_TRANSACTION_STATE_REMOVED: YES`).
2. **`PostgresRuntimeIntegrityUnitOfWork`**: Physical `UnitOfWork` implementation wrapping asynchronous domain execution in PostgreSQL transaction semantics with explicit `BEGIN ISOLATION LEVEL <level>` / `COMMIT` / `ROLLBACK`. Uses execution-scoped transaction ownership and fail-closed parent context verification (`EXPLICIT_PARENT_TRANSACTION_POLICY_TEST: PASS`).
3. **`PostgresGovernanceRepository`**: Implements `GovernancePersistencePort` using parameterized SQL queries against `observations`, `lessons`, `rule_candidates`, and `governance_events`. Supports optional `forUpdate?: boolean` for transaction-scoped `SELECT ... FOR UPDATE` query capability (`SELECT_FOR_UPDATE_CAPABILITY: YES`).
4. **`PostgresIdempotencyStore`**: Implements `IdempotencyStorePort` using parameterized SQL queries against `command_records`.
5. **`createPostgresGovernedLearningRuntime()`**: Factory function initializing and wiring the PostgreSQL durable runtime components.

---

## Transaction Invariants, Isolation & Context Security

### Transaction Isolation Level Syntax
- **Syntax**: `BEGIN ISOLATION LEVEL READ COMMITTED` (or `REPEATABLE READ` / `SERIALIZABLE`).
- **Applied Verification**: Executing `SHOW transaction_isolation;` inside active transaction context returns exact configured level (`CONFIGURED_ISOLATION_LEVEL_ACTUALLY_APPLIED: YES`).
- **Production Selection**: `READ COMMITTED` selected for balance of isolation, row-locking protection, and low deadlock risk.

### Execution-Scoped Transaction Ownership & Parent Context Policy
- `PostgresRuntimeIntegrityUnitOfWork.execute` enforces that every top-level request receives its own execution-scoped `TransactionContext` and checks out a distinct `PoolClient` connection from `pg.Pool` (`MULTIPLE_ACTIVE_TRANSACTIONS_PER_MANAGER: PASS`).
- **Parent Context Policy**:
  - No parent context supplied: Creates a new top-level physical transaction.
  - Valid explicit parent context supplied: Reuses parent transaction (`isTopLevel = false`).
  - Stale / foreign / invalid parent context supplied: Fails closed immediately with `RuntimeInvariantError` (`EXPLICIT_PARENT_TRANSACTION_POLICY_TEST: PASS`).

### Transaction Context Security
- **Physical Binding**: `TransactionContext` contains `transactionId`, `managerId`, `createdAt`, and `isDurable: true`.
- **Validation**:
  - `STALE_TRANSACTION_CONTEXT_REJECTED`: Operations after `COMMIT` or `ROLLBACK` are rejected.
  - `FOREIGN_TRANSACTION_CONTEXT_REJECTED`: Contexts from another manager instance are rejected.
  - `FABRICATED_TRANSACTION_CONTEXT_REJECTED`: Unregistered context IDs are rejected.
  - `MISSING_TRANSACTION_CONTEXT_REJECTED`: Write calls without an active transaction context fail closed with `RuntimeInvariantError`.

---

## Concurrency Control, Aggregate Locking & Deadlock Certification

### Command-Level Aggregate Locking Audit
- **Audit Findings**: Source code inspection of all 15 Governed Learning domain command handlers confirms that all state mutations in Governed Learning are recorded via append-only domain events (`governance_events`) or brand-new row inserts (`observations`, `lessons`, `rule_candidates`). No command performs in-place mutation of an existing entity database row (`RUNTIME_AGGREGATE_ROW_LOCKING_REQUIRED: NO`).
- **Query Capability**: `PostgresGovernanceRepository` provides `forUpdate?: boolean` support on `getObservationByRef`, `getLessonByRef`, and `getRuleCandidateById` (`SELECT_FOR_UPDATE_CAPABILITY: YES`, `ROW_LOCKING_DOMAIN_API_LEAK: NO`).
- **Window I Status**: `REAL_POSTGRES_WINDOW_I: NOT_APPLICABLE_TO_CURRENT_COMMAND_MODEL` (entity creation is protected via database primary key constraints; event logs are append-only).

### Deadlock Handling & 40P01 Integration Evidence
- **Real Deadlock Test**: Certified via Test 14 in `durable_persistence_postgres_real.test.ts` on PostgreSQL 18.4 server. Two concurrent transactions locking rows in reverse order trigger native PostgreSQL cyclic wait detection (`REAL_POSTGRES_DEADLOCK_TEST: PASS`).
- **SQLSTATE 40P01**: PostgreSQL aborts the losing transaction with SQLSTATE `40P01` (`deadlock_detected`). The runtime catches the error, rolls back the losing transaction context, releases the pool connection, and returns `category: 'ERROR'`, allowing caller retry under Stage 8 idempotency rules (`DEADLOCK_40P01_OBSERVED: YES`, `DEADLOCK_HANDLING_STATUS: INTEGRATION_CERTIFIED`).

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
