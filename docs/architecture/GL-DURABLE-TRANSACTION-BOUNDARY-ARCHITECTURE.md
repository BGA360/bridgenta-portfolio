# BRIDGENTA GOVERNED LEARNING — DURABLE TRANSACTION BOUNDARY & FAILURE-WINDOW ARCHITECTURE

**Workstream**: `BRIDGENTA-GOVERNED-LEARNING-GL-HARDENING-004-DURABLE-TRANSACTION-BOUNDARY`  
**Baseline**: `64f220e1fe4b6f6de05cdf4cb3a648162946c181`  
**Status**: Authoritative Architecture Specification  

---

## 1. Executive Summary

Governed Learning Stage 8 (Idempotency) and Stage 9 (Concurrency Control) are active on canonical `main`. At Level 1, these protections enforce per-aggregate serialization and single-execution idempotency within a single Node.js runtime process.

This specification establishes the **durable transaction boundary, failure-window map, and port relationship model** required before implementing any Level 2 database adapter (e.g., PostgreSQL or SQLite).

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
- **Durable Requirement**: Enforce `PRIMARY KEY (command_id)` or `UNIQUE(command_id)` in `command_records` database table. Second transaction receives DB unique constraint failure and is refused or safely handled.

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

## 5. Port Relationship & Transaction Context Architecture

### Logical Port Separation
- `GovernancePersistencePort` (Domain Entities & Event Log) and `IdempotencyStorePort` (Operational Command Records) remain **logically separate interface ports**.
- Both ports accept an optional `transactionContext?: TransactionContext` parameter across all mutating operations.

### Durable Execution via Unit of Work
`RuntimeIntegrityUnitOfWork` coordinates physical transaction boundaries:

```ts
await unitOfWork.execute(async (transactionContext) => {
  // 1. Read / validate state within transactionContext
  // 2. Execute handler
  // 3. Save domain entity with transactionContext
  await persistencePort.saveObservation(observation, transactionContext);
  // 4. Append domain event with transactionContext
  await persistencePort.appendEvent(event, transactionContext);
  // 5. Record command execution with transactionContext
  await idempotencyStore.recordCommandExecution(record, transactionContext);
});
```

In Level 2 database implementations, `transactionContext` encapsulates the active database transaction handle (`dbClient` / `txHandle`), ensuring all operations execute within the **same database transaction**.

---

## 6. Datastore Capabilities & Database Selection Analysis

### Required Capabilities
1. **ACID Multi-Statement Transactions**: Atomic commit/rollback across entity tables, event log, and command records.
2. **Unique Constraints**: `PRIMARY KEY (command_id)` on command records table.
3. **Pessimistic Row Locking**: Support for `SELECT ... FOR UPDATE` to serialize aggregate mutations across multi-instance deployments.
4. **Append-Only Event Log**: High-throughput sequential insert with indexed event references for replay.
5. **JSON Document Support**: Structured payload storage (`JSONB` or `TEXT` JSON).

### Candidate Datastore Evaluation
- **PostgreSQL**: Meets 100% of required capabilities. Ideal for production multi-instance deployments.
- **SQLite (WAL mode)**: Meets 100% of required capabilities for embedded, local production, or automated testing environments.

---

## 7. Next Implementation Sequence (GL-HARDENING-005 proposal)

1. **Unit 1**: Implement `DurableGovernanceRepository` and `DurableIdempotencyStore` using SQLite / PostgreSQL with `RuntimeIntegrityUnitOfWork` transactional binding.
2. **Unit 2**: Implement row-level pessimistic locking (`SELECT ... FOR UPDATE`) in `DurableConcurrencyCoordinator` for multi-instance Stage 9 enforcement.
3. **Unit 3**: Run durable crash-recovery and transaction failure validation tests.
