# GOVERNED GUIDANCE QUERY RUNTIME SPECIFICATION (GL_CAPABILITY_GAP_001)

## WORKSTREAM ID

`BRIDGENTA-GL-CAPABILITY-GAP-001-GOVERNED-GUIDANCE-QUERY-RUNTIME-01`

---

## 1. PURPOSE & ARCHITECTURAL SUMMARY

`GL_CAPABILITY_GAP_001` implements a deterministic, evidence-bounded read and query capability for `BuildGuidanceSetQuery` inside Governed Learning (`@cep/governed-learning`).

Prior to this workstream, `BuildGuidanceSetQuery` existed in the public command contract, but its runtime handler threw a deferred `RuntimeInvariantError`. This workstream resolves that capability gap inside Governed Learning without prematurely executing `BECC-V2-IMPL-013` or implementing global policy binding (`GL_CAPABILITY_GAP_002`).

---

## 2. EPISTEMIC INVARIANT & ELIGIBLE GUIDANCE DEFINITION

Governed Learning maintains strict epistemic boundaries:

$$\text{Observed} \neq \text{Learned} \neq \text{Approved} \neq \text{Binding Policy}$$

### Eligible Guidance Statuses
Only the following items can legally participate in a returned guidance set:
- **`PUBLISHED` Lessons**: Lessons authoritatively approved and published via `ApproveLesson`.
- **`ADOPTED` Guidance**: Prospective adoptions bound to a specific target project (`adoptedByProjectRef`) or workstream (`adoptedByWorkstreamRef`).

### Excluded Statuses
The query handler explicitly excludes:
- `CANDIDATE` (unapproved draft lesson candidates)
- `IN_REVIEW` (candidates under review)
- `REJECTED` (invalidated or rejected candidates)
- `REVISION_REQUESTED` (candidates sent back for revision)
- `SUPERSEDED` (lessons replaced by newer superseding lessons)
- `DEPRECATED` / `RETIRED` (retired lessons)
- `WITHDRAWN` / `EXPIRED` (withdrawn or expired adoptions)
- Raw `OBSERVATION` records (observations are evidence, not guidance)

---

## 3. PUBLIC RESULT CONTRACT

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

Internal database row IDs, PostgreSQL `PoolClient` handles, or physical transaction handles are strictly hidden from callers.

---

## 4. DETERMINISTIC FILTERING & ORDERING

1. **TargetRef Enforcement (`INV-GL-033`)**: `LearningContextQuery` MUST specify `TargetRef` literally. Context parameter substitution without `TargetRef` is refused.
2. **Deterministic Recency Ordering**: Items are ordered by `publishedAt` / `adoptedAt` / `createdAt` descending. Ties are broken deterministically using `lessonId` ascending.
3. **Deduplication**: If the same lesson is eligible through multiple paths (e.g. general publication + project adoption), it is returned exactly once in the guidance set.

---

## 5. SCOPE & TARGET ISOLATION

- **Project Isolation**: Guidance adopted for `Project A` (`adoptedByProjectRef: 'Project A'`) will not appear in queries for `Project B`.
- **Workstream Isolation**: Guidance adopted for `Workstream X` (`adoptedByWorkstreamRef: 'Workstream X'`) will not appear in queries for `Workstream Y`.
- **Framework Compatibility**: `checkScopeCompatibility` verifies single-framework, cross-framework, or system-wide scope compatibility.

---

## 6. PERSISTENCE ABSTRACTION & ADAPTER PARITY

The query capability is decoupled from physical storage through `GovernancePersistencePort.getLessons()`:
- **Level 1 (`InMemoryGovernanceRepository`)**: In-memory filtering and status derivation.
- **Level 2A (`SqliteGovernanceRepository`)**: Physical SQLite transaction integrity and table queries.
- **Level 2B (`PostgresGovernanceRepository`)**: Physical PostgreSQL transaction integrity and JSONB querying.

`QUERY_HANDLER_DIRECT_POSTGRES_DEPENDENCY: NO` — Handler depends strictly on `GovernancePersistencePort`.

---

## 7. PIPELINE STAGES, IDEMPOTENCY & FRESHNESS

- **Stage 8 Idempotency**: `QUERY_USES_STAGE8: YES`. Re-submitting an identical `commandId` with matching fingerprint and `issuedAt` returns the exact Stage 8 replayed result (`replayedResult: true`).
- **Stage 9 Concurrency**: `QUERY_USES_STAGE9: PARTIAL`. Read-only query commands validate concurrency pipeline stages without taking exclusive domain mutation locks.
- **Freshness Model**: `CURRENT_STATE_PER_NEW_COMMAND`. Submitting a new query with a fresh `commandId` evaluates the latest eligible guidance state from persistence.
- **Domain State Side-Effects**: `QUERY_MUTATES_DOMAIN_STATE: NO`. Executing `BuildGuidanceSetQuery` produces zero domain entity mutations or domain events.

---

## 8. EXPLICIT DISTINCTION FROM GLOBAL POLICY BINDING

This workstream implements **guidance querying only**.
It does **NOT** implement `GL_CAPABILITY_GAP_002`:
- `BindRulePolicyCommand`: `OUT_OF_SCOPE` / `OPEN`
- Global Policy Binding Engine: `NOT_IMPLEMENTED`
- Automatic Policy Enforcement: `NOT_IMPLEMENTED`

`GL_CAPABILITY_GAP_002` remains separate and unblocked for future authorization.
