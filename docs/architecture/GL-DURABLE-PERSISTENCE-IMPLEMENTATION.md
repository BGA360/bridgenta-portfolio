# BRIDGENTA GOVERNED LEARNING — LEVEL 2 DURABLE PERSISTENCE IMPLEMENTATION

## WORKSTREAM

`BRIDGENTA-GOVERNED-LEARNING-GL-HARDENING-005-LEVEL2-DURABLE-PERSISTENCE`

---

## 1. EXECUTIVE SUMMARY & DURABLE ADAPTER SELECTION

`GL-HARDENING-005` implements the operational Level-2 durable transaction persistence layer for the Governed Learning runtime, enforcing the core Level-2 transaction invariant:

```text
Domain Entity State Mutation
+
Domain Event Log Append
+
Command Execution Record Insert
=
ONE PHYSICAL DATABASE TRANSACTION
```

### Primary Adapter Selected
- **Engine**: SQLite in **WAL (Write-Ahead Logging)** mode (`node:sqlite`).
- **Physical Transaction Binding**: `BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`.
- **Durability Guarantee**: Physical datastore persistence surviving process restarts, unhandled exceptions, and runtime instance re-initialization.

### PR #309 Remediation Improvements
- **Synchronous Public API**: `processAndExecuteCommand` is genuinely synchronous using `DatabaseSync`, returning `GovernedLearningRuntimeExecutionResult` directly (not a Promise).
- **Stage 9 Scope Lease**: Stage 9 lease/scope spans the physical database transaction commit/rollback end-to-end for both sync (`concurrencyCoordinator.executeWithinScope`) and async (`concurrencyCoordinator.executeWithinScopeAsync`) runtimes.
- **TransactionContext Enforcement**: All mutating repository/store operations explicitly verify `TransactionContext` manager ownership and active physical status, safely rejecting missing, stale, foreign, or fabricated contexts with `ERROR`.
- **Post-BEGIN Revalidation & Race Closure**: Post-BEGIN Stage 8 revalidation inside the physical transaction re-checks command records after acquiring the SQLite writer lock. Same fingerprint replays winner result; changed fingerprint returns `REFUSED` (`REFUSAL_INVARIANT_VIOLATION`) and rolls back partial writes.
- **Persistence Refusal Propagation**: Persistence refusals halt dependent event appends and success command records, rolling back partial writes cleanly (`PERSISTENCE_REFUSED_TRANSACTION_COMMITS_DOMAIN_WRITES: NO`).
- **Two-Connection Concurrent Testing**: Window H tests (`test 25`, `test 26`) verify real concurrent execution using two separate `SqliteDatabaseManager` instances connected to the same physical database file with `PRAGMA busy_timeout = 5000`.

### Production Target & PostgreSQL Strategy
- PostgreSQL remains the authoritative production Level-2 datastore target direction for multi-instance row-level locking (`SELECT ... FOR UPDATE`).
- The durable interface contracts (`GovernancePersistencePort`, `IdempotencyStorePort`, `RuntimeIntegrityUnitOfWork`, `TransactionContext`) were implemented in an infrastructure-neutral manner.
- A PostgreSQL adapter can be added in a future bounded workstream without breaking public domain contracts.

---

## 2. PHYSICAL DATABASE SCHEMA

The SQLite durable adapter (`SqliteDatabaseManager`) initializes the following physical tables:

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

-- 1. Governance Entity State Storage
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

-- 2. Governance Event Log Storage
CREATE TABLE IF NOT EXISTS governance_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_ref TEXT,
  event_type TEXT NOT NULL,
  data TEXT NOT NULL,
  appended_at TEXT NOT NULL
);

-- 3. Command Execution Records (Stage 8 Idempotency)
CREATE TABLE IF NOT EXISTS command_records (
  command_id TEXT PRIMARY KEY,
  command_fingerprint TEXT NOT NULL,
  command_type TEXT NOT NULL,
  payload_version TEXT NOT NULL,
  issued_at TEXT,
  recorded_at TEXT NOT NULL,
  execution_outcome TEXT NOT NULL
);
```

---

## 3. PHYSICAL TRANSACTION LIFECYCLE & BOUNDING

All mutating operations execute through `SqliteRuntimeIntegrityUnitOfWork.execute(operation)`.

### Lifecycle Diagram

```text
               Stage 9 Concurrency Lease Acquired
                            │
               unitOfWork.execute(txContext)
                            │
                  BEGIN IMMEDIATE (SQLite)
                            │
               txContext bound to physical DB
                            │
                 Post-BEGIN Stage 8 Recheck
                            │
    ┌───────────────────────┴───────────────────────┐
    │                                               │
    ▼                                               ▼
[1] Read State / Execute Handler            [Error / Exception / Refusal / Collision]
    │                                               │
[2] saveObservation / saveLesson (tx)               │
    │                                               │
[3] appendEvent (tx)                                │
    │                                               │
[4] recordCommandExecution (tx)                     │
    │                                               │
    ▼                                               ▼
[All Writes Succeeded]                    [ROLLBACK (SQLite)]
    │                                       (Zero partial
  COMMIT                                     effects)
    │                                               │
    └───────────────────────┬───────────────────────┘
                            │
               Stage 9 Concurrency Lease Released
```

### Result Categorization & Rollback Semantics
1. **SUCCESS**: Domain entity saved + event appended + command record inserted -> `COMMIT`.
2. **REFUSED (Domain Policy Violation / Collision / Persistence Refusal)**: If refusal occurs during execution or persistence, any tentative entity/event writes are rolled back (`rollbackRequired: true`). If refusal record is authored (e.g. Stage 8 refusal outcome), refusal record is committed.
3. **ERROR (Infrastructure / DB / Validation / Context Violation)**: Any `ERROR` outcome or thrown exception immediately triggers physical `ROLLBACK`. Entity, event log, and command record remain completely absent/unchanged.

---

## 4. FAILURE WINDOW CLOSURE VERIFICATION

| Failure Window | Description | Target Invariant | Verification Status |
| :--- | :--- | :--- | :--- |
| **Window C** | Entity write succeeds; crash/error before command record | Zero partial effect (Command record absent, entity rolled back) | **CLOSED** (Tested in `test 10`) |
| **Window D** | Command record commits without entity/event | Zero partial effect (Command record cannot commit alone) | **CLOSED** (Tested in `test 8, 9, 10`) |
| **Window E / F** | Event append failure or entity write failure | Roll back all partial writes | **CLOSED** (Tested in `test 8, 9`) |
| **Window G** | Process restart after commit | Replay stored result without re-executing handler or duplicating state | **CLOSED** (Tested in `test 1, 2, 3, 4, 5, 7, 11`) |
| **Window H** | Parallel commandId insertion race (multi-connection) | Post-BEGIN revalidation + SQLite `PRIMARY KEY(command_id)` constraint forces exactly 1 winner; losing transaction rolls back completely | **CLOSED** (Tested in real two-connection `test 25` and `test 26`) |
| **Window J** | Multi-entity mutation failure | Roll back all affected rows | **CLOSED** (Tested in `test 14`) |

---

## 5. RESTART & REPLAY SEMANTICS

- **Same `commandId` + Same Identity**: Replays cached `SUCCESS` or `REFUSED` execution outcome without re-dispatching handler or duplicating events/entities. Sets `replayedResult: true`.
- **Same `commandId` + Changed Identity**: Refused with `REFUSAL_INVARIANT_VIOLATION`. The original record is preserved intact.
- **ERROR Outcomes**: Infrastructure errors are **NOT** cached. A failed transaction rolls back physically, allowing subsequent retries to execute freshly.

---

## 6. TEST SUITE EVIDENCE

All 26 test matrix scenarios in `packages/governed-learning/tests/durable_persistence_level2.test.ts` pass cleanly:

1. `durable entity persistence survives restart` (PASS)
2. `durable event persistence survives restart` (PASS)
3. `command record survives restart` (PASS)
4. `exact success retry after restart replays` (PASS)
5. `exact refusal retry after restart replays` (PASS)
6. `changed identity after restart is refused` (PASS)
7. `ERROR transaction produces no command record` (PASS)
8. `entity-write failure rolls back event + command record` (PASS)
9. `event-write failure rolls back entity + command record` (PASS)
10. `command-record failure rolls back entity + event (Window C closed)` (PASS)
11. `response-loss retry does not duplicate domain state` (PASS)
12. `commandId uniqueness race yields at most one committed transaction` (PASS)
13. `losing commandId transaction leaves no partial effects` (PASS)
14. `multi-entity failure leaves no partial commit` (PASS)
15. `event log remains append-only` (PASS)
16. `database reopen preserves deterministic read order` (PASS)
17. `transaction context is bound to physical database transaction` (PASS)
18. `Stage 8 uses durable command records` (PASS)
19. `Stage 9 semantics remain unchanged` (PASS)
20. `SQLite tests explicitly do not claim PostgreSQL row-lock equivalence` (PASS)
21. `durable runtime factory creates fully wired Level-2 environment` (PASS)
22. `synchronous durable API returns execution result directly (not Promise)` (PASS)
23. `transaction context enforcement rejects stale, foreign, or fabricated contexts` (PASS)
24. `persistence refusal halts dependent event append and success command record` (PASS)
25. `Window H real two-connection concurrent race (same identity) yields one execution + one replay` (PASS)
26. `Window H real two-connection concurrent race (mismatched identity) yields one execution + one refusal` (PASS)

---

## 7. KNOWN LIMITATIONS & FUTURE DEFERRALS

1. **Multi-Instance Cross-Process Concurrency**: SQLite WAL mode coordinates transactions on a single file on local disk with `PRAGMA busy_timeout = 5000`. It does not provide cross-network PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
2. **Distributed Mutex**: No external distributed lock service (Redis, etcd, ZooKeeper) was added, maintaining `SEPARATE_DISTRIBUTED_MUTEX_REQUIRED: NO`.
3. **Exactly-Once Execution**: Execution is **at-most-once committed effect**, not exactly-once execution (uncommitted handler calculations may run prior to rollback arbitration).
