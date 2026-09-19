# BRIDGENTA GOVERNED LEARNING — DURABLE TRANSACTION BOUNDARY & FAILURE-WINDOW ARCHITECTURE

**Workstream**: `BRIDGENTA-GOVERNED-LEARNING-GL-HARDENING-004-DURABLE-TRANSACTION-BOUNDARY`  
**Baseline**: `64f220e1fe4b6f6de05cdf4cb3a648162946c181`  
**Status**: Authoritative Architecture Specification (Remediated)  

---

## 1. Executive Summary

Governed Learning Stage 8 (Idempotency) and Stage 9 (Concurrency Control) are active on canonical `main`. At Level 1, these protections enforce per-aggregate serialization and single-execution idempotency within a single Node.js runtime process.

This specification establishes the **durable transaction boundary, failure-window map, datastore capability requirements, and port relationship model** required before implementing any Level 2 database adapter.

> [!IMPORTANT]  
> Level 1 in-memory mechanisms do not guarantee restart safety, crash safety, or multi-instance transaction integrity. Level 2 durable persistence requires extending these boundaries into **one physical atomic database transaction**.

---

## 2. Current State Map & Component Analysis

```
Command Intake (processAndExecuteCommand / processAndExecuteCommandAsync)
       │
       ▼
Stages 1–7 Validation (Parse envelope, type, version, payload schema, actor, authority, provenance)
       │
       ▼
Stage 8 Idempotency Lookup (InMemoryIdempotencyStore.getCommandExecution)
       ├── [Exact Retry] ──► Return Cached Result DTO (Stage 9 SKIPPED)
       └── [Identity Collision] ──► Return REFUSED (Stage 9 SKIPPED)
       │
       ▼
Stage 9 Concurrency Control (InMemoryConcurrencyCoordinator.acquireScope / executeWithinScopeAsync)
       ├── [Sync Busy] ──► Return REFUSED (Non-blocking)
       └── [Async Busy] ──► Queue Waiter on activeLocks Map
       │
       ▼
Policy Gate & Dispatch Router
       │
       ▼
Domain Handler Execution (executeGovernedCommandHandler — calculate state transition DTO)
       │
       ▼
Domain State & Event Persistence (GovernancePersistencePort: saveObservation, saveLesson, appendEvent)
       │
       ▼
Command Idempotency Persistence (IdempotencyStorePort.recordCommandExecution)
       │
       ▼
Stage 9 Concurrency Lease Release (finally block)
```

### Component Boundaries Matrix

| Component | Storage Adapter | Authoritative? | Durable? | Transactional Boundary | Process Scope |
| --- | --- | --- | --- | --- | --- |
| Observation State | `InMemoryGovernanceRepository` | Yes (in-memory) | No | Non-transactional | Single Instance |
| Lesson Candidate State | `InMemoryGovernanceRepository` | Yes (in-memory) | No | Non-transactional | Single Instance |
| Approved Lesson State | `InMemoryGovernanceRepository` | Yes (in-memory) | No | Non-transactional | Single Instance |
| Rule Proposal State | `InMemoryGovernanceRepository` | Yes (in-memory) | No | Non-transactional | Single Instance |
| Event Log (`events`) | `InMemoryGovernanceRepository` | Yes (in-memory) | No | Non-transactional | Single Instance |
| Command Records | `InMemoryIdempotencyStore` | Yes (in-memory) | No | Non-transactional | Single Instance |
| Concurrency Scope Leases | `InMemoryConcurrencyCoordinator` | Yes (in-memory) | No | Non-transactional | Single Instance |

---

## 3. Failure Window Analysis (Windows A – J)

### Window A: Idempotency Lookup Succeeds ──► Process Crashes Before Mutation
- **Level 1 Behavior**: In-memory lookup. No record stored.
- **Duplication Risk**: None.
- **Lost Update Risk**: None.
- **Partial Commit Risk**: None.
- **Retry Safe**: Yes. Command is re-executed as unseen upon restart.
- **Durable Requirement**: Read-only idempotency lookup occurs within transaction read scope.

### Window B: Stage 9 Scope Acquired ──► Process Crashes Before Handler
- **Level 1 Behavior**: Process crash clears in-memory lock map.
- **Duplication Risk**: None.
- **Lost Update Risk**: None.
- **Partial Commit Risk**: None.
- **Retry Safe**: Yes.
- **Durable Requirement**: Uncommitted database transaction automatically rolls back.

### Window C: Domain Mutation Succeeds ──► Process Crashes Before Idempotency Record Write
- **Level 1 Behavior**: Handler computes transition DTO, but process crashes before `recordCommandExecution`.
- **Duplication Risk**: **CRITICAL (HIGH)**. On client retry, idempotency lookup finds no record, re-executing handler and duplicating entity state / events.
- **Partial Commit Risk**: **YES** (Domain state mutated without idempotency record).
- **Retry Safe**: **NO**.
- **Durable Requirement**: **MUST** wrap Domain State Mutation, Event Log Append, and Idempotency Command Record in **ONE atomic database transaction**.

### Window D: Idempotency Record Write Succeeds ──► Domain Mutation Fails
- **Level 1 Behavior**: Idempotency record is written after handler execution in current runtime. If ordering were reversed, crash after record write would return fake success on retry when no mutation occurred.
- **Lost Update Risk**: **HIGH**.
- **Partial Commit Risk**: **YES**.
- **Retry Safe**: **NO**.
- **Durable Requirement**: **MUST** be committed together in the same atomic transaction.

### Window E & F: Entity State Persisted ──► Event Append Fails (or Vice Versa)
- **Level 1 Behavior**: Non-transactional separation causes inconsistent projection vs event log.
- **Partial Commit Risk**: **YES**.
- **Retry Safe**: **NO**.
- **Durable Requirement**: **MUST** commit Entity State update and Event Log append in the SAME transaction.

### Window G: Transaction Commits ──► Response Lost ──► Client Retries
- **Level 1 Behavior**: Handled if record exists.
- **Retry Safe**: **YES**. Idempotency lookup finds committed record, returns prior result DTO with `replayedResult: true` without re-executing handler.

### Window H: Instance A and Instance B Process Same `commandId` Concurrently
- **Level 1 Behavior**: In-memory locking is per-process. Instance A and B do not coordinate.
- **Duplication Risk**: **HIGH**.
- **Durable Requirement**: Enforce `PRIMARY KEY (command_id)` or `UNIQUE(command_id)` in `command_records` database table. The unique constraint is the final durable arbitration mechanism. All authoritative entity and event writes MUST occur in the same transaction as the command-record insert so that the losing transaction rolls back ALL partial domain effects (`LOSING_COMMAND_ID_TRANSACTION_ROLLS_BACK_ALL_EFFECTS: YES`). At most one transaction may commit authoritative effects for a given `commandId`.

### Window I: Multi-Instance Concurrent Aggregate Mutation
- **Level 1 Behavior**: In-memory locking is per-process.
- **Lost Update Risk**: **HIGH**.
- **Durable Requirement**: Database row-level locking (`SELECT ... FOR UPDATE` on aggregate root) or optimistic revision check (`WHERE revision = expected_revision`).

### Window J: Multi-Aggregate Operation Partially Persists
- **Level 1 Behavior**: Non-transactional.
- **Partial Commit Risk**: **HIGH**.
- **Durable Requirement**: Single multi-row database transaction covering all affected aggregate entities, event log rows, and idempotency record.

---

## 4. The Single Atomic Transaction Invariant

Level 2 durable persistence MUST enforce the following core invariant:

$$\text{Atomic Transaction} = \text{Domain Entity State Mutation} + \text{Domain Event Log Append} + \text{Idempotency Command Record Insert}$$

```
                ┌─────────────────────────────────────────────────────────┐
                │          ONE PHYSICAL DATABASE TRANSACTION              │
                │                                                         │
                │  1. SELECT aggregate root FOR UPDATE (pessimistic lock) │
                │  2. Execute domain handler state transition             │
                │  3. UPDATE / INSERT Domain Entity tables                │
                │  4. INSERT Domain Event Log table                       │
                │  5. INSERT Idempotency Command Record (UNIQUE commandId)│
                └────────────────────────────┬────────────────────────────┘
                                             │
                             ┌───────────────┴───────────────┐
                             │                               │
                      COMMIT │                               │ ROLLBACK
                             ▼                               ▼
                 All 3 Artifacts Visible           Zero Artifacts Committed
                 (State + Event + Record)           (No partial execution)
```

---

## 5. Datastore Capability Matrix & Database Selection

### Datastore Capability Comparison

| Capability | PostgreSQL | SQLite WAL | Required for Production Multi-Instance |
| --- | --- | --- | --- |
| ACID Transactions | Yes | Yes | Yes |
| Multi-Statement Atomic Transaction | Yes | Yes | Yes |
| Unique `commandId` Constraint | Yes | Yes | Yes |
| Row-Level Locking | Yes | No | Yes / preferred model |
| `SELECT ... FOR UPDATE` | Yes | No | Yes if pessimistic model used |
| JSON Document Storage | Yes | Yes | Yes |
| Multi-Instance Application Coordination | Yes | Limited / not equivalent | Yes |
| Embedded Local Testing | Possible | Yes | No |

> [!NOTE]  
> SQLite WAL is **NOT equivalent** to PostgreSQL row-level locking semantics (`SQLITE_EQUIVALENT_TO_POSTGRES_LOCKING: NO`). SQLite WAL uses a database-level write lock, while PostgreSQL provides row-level `SELECT ... FOR UPDATE` locks.

### Datastore Roles
- **PostgreSQL**: `RECOMMENDED_PRODUCTION_DATASTORE: POSTGRESQL`. Production candidate for Level-2 multi-instance durable integrity. Supports ACID multi-statement transactions, unique constraints, row-level locking, `SELECT ... FOR UPDATE`, transaction isolation, `JSONB`, and multi-row atomic transactions.
- **SQLite WAL**: `RECOMMENDED_EMBEDDED_TRANSACTION_TEST_DATASTORE: SQLITE_WAL`. Embedded/local durability and transaction-testing candidate. Useful for atomic commit/rollback tests, crash/restart persistence tests, unique constraint tests, local adapter development, and transaction-context integration tests.

---

## 6. Port Relationship & Transaction Context Architecture

### Logical Port Separation
- `GovernancePersistencePort` (Domain Entities & Event Log) and `IdempotencyStorePort` (Operational Command Records) remain **logically separate interface ports**.
- Both ports accept an optional `transactionContext?: TransactionContext` parameter across all mutating operations (`TRANSACTION_CONTEXT_COMPATIBLE_PORTS: YES`).

### Current Transaction Context Limitation
- `TransactionContext` currently serves as a contract carrier / extension point (`TRANSACTION_CONTEXT_CURRENTLY_ENFORCES_PHYSICAL_ATOMICITY: NO`).
- `RuntimeIntegrityUnitOfWork` is currently at `L1_ABSTRACTION_ONLY`.
- In Level 2 implementations, `TransactionContext` will wrap a real datastore transaction handle (`dbClient` / `txHandle`), ensuring all operations execute within the **same physical database transaction**.

### Concurrency Model & Lock Ordering
- Stage 9 is the **logical concurrency policy boundary**. PostgreSQL provides **physical multi-instance transaction enforcement** via row locking.
- A separate distributed mutex service is **not required** (`SEPARATE_DISTRIBUTED_MUTEX_REQUIRED: NO`).
- Multi-aggregate commands sort aggregate keys in canonical deterministic order (`getConcurrencyScope`), which controls and reduces lock inversion risk during row locking, but does not eliminate all database deadlocks (`DATABASE_DEADLOCKS_CLAIMED_IMPOSSIBLE: NO`).

---

## 7. External Side-Effects Verification

Source code inspection of all 15 domain command handlers in `packages/governed-learning/src/runtime/handlers.ts` confirms:

```text
EXTERNAL_SIDE_EFFECTS_IN_CURRENT_HANDLERS: NONE_VERIFIED
```

No current domain handler executes external network requests, file I/O, email, webhooks, or subprocesses. All operations calculate pure domain state transitions in memory.

---

## 8. Test Strategy Split & Next Implementation Sequence

### Dual-Layer Test Strategy
1. **Adapter-Neutral Durability Tests** (SQLite WAL & PostgreSQL):
   - Commit atomicity & rollback atomicity
   - `commandId` uniqueness constraints & losing transaction rollback
   - Restart persistence & response-loss replay
2. **PostgreSQL-Specific Concurrency Tests** (PostgreSQL only):
   - Row-level locking (`SELECT ... FOR UPDATE`)
   - Multi-instance conflicting mutations
   - Lock ordering & deadlock recovery
   - Transaction isolation behavior

### Next Implementation Sequence (`GL-HARDENING-005` Proposal)
1. **Unit 1**: Implement `DurableGovernanceRepository` and `DurableIdempotencyStore` using SQLite WAL / PostgreSQL driven by `RuntimeIntegrityUnitOfWork`.
2. **Unit 2**: Implement row-level pessimistic locking (`SELECT ... FOR UPDATE`) for multi-instance Stage 9 enforcement.
3. **Unit 3**: Run durable crash-recovery and transaction rollback integration tests.
