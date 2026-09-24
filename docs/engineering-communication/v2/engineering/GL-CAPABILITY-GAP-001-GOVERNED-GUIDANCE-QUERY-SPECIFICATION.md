# GOVERNED GUIDANCE QUERY RUNTIME SPECIFICATION (GL_CAPABILITY_GAP_001)

## WORKSTREAM ID

`BRIDGENTA-GL-CAPABILITY-GAP-001-GOVERNED-GUIDANCE-QUERY-RUNTIME-01`

---

## 1. PURPOSE & ARCHITECTURAL SUMMARY

`GL_CAPABILITY_GAP_001` implements a deterministic, evidence-bounded read and query capability for `BuildGuidanceSetQuery` inside Governed Learning (`@cep/governed-learning`).

Prior to PR #313, `BuildGuidanceSetQuery` existed in the public command contract, but its runtime handler threw a deferred `RuntimeInvariantError`. PR #313 and its subsequent remediation establish the certified fail-closed query read capability inside Governed Learning without prematurely executing `BECC-V2-IMPL-013` or implementing global policy binding (`GL_CAPABILITY_GAP_002`).

---

## 2. FAIL-CLOSED READ CONTRACT & EPISTEMIC INVARIANT

Governed Learning maintains strict epistemic boundaries:

$$\text{Observed} \neq \text{Learned} \neq \text{Approved} \neq \text{Binding Policy}$$

### Epistemic Invariant: Valid Empty Store vs Unavailable Read Capability
> **An empty guidance set (`SUCCESS []`) is a valid knowledge result only when Governed Learning successfully queried an authoritative guidance source; absence of the query capability itself must never masquerade as absence of guidance.**

- **Missing Persistence Port**: Query handler fails closed with `category: 'ERROR'` (`RuntimeInvariantError('BuildGuidanceSetQuery requires GovernancePersistencePort.getLessons capability')`).
- **Missing `getLessons` Capability**: Query handler fails closed with `category: 'ERROR'`. `getLessons` is a required method on `GovernancePersistencePort`.
- **Infrastructure Read Failure**: `getLessons()` database errors fail closed with `category: 'ERROR'`.
- **Valid Empty Store**: Query succeeds with `category: 'SUCCESS'` and `matchedGuidance: []` ONLY when persistence is present and query yields zero eligible records.

---

## 3. CANONICAL RECORD INTEGRITY & FAIL-CLOSED ITEM MAPPING

### Approval Data Preservation (No Fabricated Semantics)
During `ApproveLesson` command processing, the published lesson record strictly preserves candidate data (`statement`, `rationale`, `scope`, `lessonId`, `version`, `publishedAt`). If candidate record data is missing or candidate retrieval fails, approval fails closed (`category: 'ERROR'`) rather than fabricating default fallback text such as `'Approved Governed Lesson'`, `'Approved via governance decision'`, or `{ scopeType: 'SYSTEM_WIDE' }`.

### Scope Fail-Closed Rule
- **Unknown or Malformed Scope $\neq$ `SYSTEM_WIDE`**: Missing or malformed scope on stored candidate/lesson records fails closed with `category: 'ERROR'`. Unknown scope is never silently promoted to `SYSTEM_WIDE`, preventing unauthorized guidance scope broadening.
- **Lesson Identity Fail-Closed**: Missing or synthetic lesson IDs (e.g. `'lsn_unknown'`) are rejected with `category: 'ERROR'`.

---

## 4. PUBLIC RESULT CONTRACT & DETERMINISTIC EVALUATION

The public query result conforms to `GuidanceQueryResultSchema`:

```typescript
export interface ApplicableGuidance {
  readonly lessonRef: {
    readonly lessonId: string;
    readonly version: string;
  };
  readonly statement: string;
  readonly rationale: string;
  readonly scope: ScopeContract;
}

export interface ApplicableGuidanceSet {
  readonly queryId: string;
  readonly matchedGuidance: ReadonlyArray<ApplicableGuidance>;
  readonly evaluatedAt: string;
  readonly matchStrategy: 'STRICT' | 'INHERITED' | 'CROSS_FRAMEWORK';
}

export interface GuidanceQueryResult {
  readonly queryId: string;
  readonly status: 'SUCCESS' | 'REFUSED' | 'ERROR';
  readonly guidanceSet?: ApplicableGuidanceSet;
  readonly refusal?: RefusalContract;
}
```

- **Deterministic `evaluatedAt`**: `evaluatedAt` uses `envelope.issuedAt` deterministically for exact replay consistency.
- **Internal Database Hiding**: Internal row IDs, PostgreSQL `PoolClient` handles, or physical transaction handles are strictly hidden.

---

## 5. DETERMINISTIC FILTERING & ORDERING

1. **TargetRef Enforcement (`INV-GL-033`)**: `LearningContextQuery` MUST specify `TargetRef` literally. Context parameter substitution without `TargetRef` is refused.
2. **Deterministic Recency Ordering**: Items are ordered by `publishedAt` / `adoptedAt` / `createdAt` descending. Ties are broken deterministically using `lessonId` ascending.
3. **Deduplication**: If the same lesson is eligible through multiple paths (e.g. general publication + project adoption), it is returned exactly once in the guidance set.

---

## 6. SCOPE & TARGET ISOLATION

- **Project Isolation**: Guidance adopted for `Project A` (`adoptedByProjectRef: 'Project A'`) will not appear in queries for `Project B`.
- **Workstream Isolation**: Guidance adopted for `Workstream X` (`adoptedByWorkstreamRef: 'Workstream X'`) will not appear in queries for `Workstream Y`.
- **Framework Compatibility**: `checkScopeCompatibility` verifies single-framework, cross-framework, or system-wide scope compatibility.

---

## 7. PERSISTENCE CERTIFICATION & POSTGRESQL HARNESS

The query capability is decoupled from physical storage through `GovernancePersistencePort.getLessons()`:
- **Level 1 (`InMemoryGovernanceRepository`)**: In-memory filtering and status derivation.
- **pg-mem (Fast Semantic Test)**: `pg-mem` adapter compatibility tests provide fast in-process semantic feedback, labeled explicitly as `PostgreSQL-compatible adapter semantic test (pg-mem)`.
- **Level 2A (`SqliteGovernanceRepository`)**: Physical SQLite transaction integrity and table queries with restart parity.
- **Level 2B Real PostgreSQL (`PostgresGovernanceRepository`)**: Production PostgreSQL Level-2B certification executed against real embedded PostgreSQL instances (`@embedded-postgres`), validating empty store query, approved lesson query, reconnect query durability across independent runtimes, and database read failure handling.

`QUERY_HANDLER_DIRECT_POSTGRES_DEPENDENCY: NO` — Handler depends strictly on `GovernancePersistencePort`.

---

## 8. PIPELINE STAGES, IDEMPOTENCY & FRESHNESS

- **Stage 8 Idempotency**: `QUERY_USES_STAGE8: YES`. Re-submitting an identical `commandId` with matching fingerprint and `issuedAt` returns the exact Stage 8 replayed result (`replayedResult: true`).
- **Stage 9 Concurrency**: `QUERY_USES_STAGE9: PARTIAL`. Read-only query commands validate concurrency pipeline stages without taking exclusive domain mutation locks.
- **Freshness Model**: `CURRENT_STATE_PER_NEW_COMMAND`. Submitting a new query with a fresh `commandId` evaluates the latest eligible guidance state from persistence. Submitting the same `commandId` replays the prior result.
- **Domain State Side-Effects**: `QUERY_MUTATES_DOMAIN_STATE: NO`. Executing `BuildGuidanceSetQuery` produces zero domain entity mutations or domain events.

---

## 9. EXPLICIT DISTINCTION FROM GLOBAL POLICY BINDING

This workstream implements **guidance querying only**.
It does **NOT** implement `GL_CAPABILITY_GAP_002`:
- `BindRulePolicyCommand`: `OUT_OF_SCOPE` / `OPEN`
- Global Policy Binding Engine: `NOT_IMPLEMENTED`
- Automatic Policy Enforcement: `NOT_IMPLEMENTED`

`GL_CAPABILITY_GAP_002` remains separate and unblocked for future authorization.
