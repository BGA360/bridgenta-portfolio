# Governed Learning Runtime Implementation Plan

## 1. Metadata

- **Document Title:** Governed Learning Runtime Implementation Plan
- **Document Role:** `AUTHORITATIVE_IMPLEMENTATION_PLAN`
- **Document Status:** `ACTIVE_STAGE_F_PLAN`
- **Target Subsystem:** `@cep/governed-learning`
- **Upstream Baseline:** `docs/governance/governed-learning/governed-learning-contract-baseline.md`
- **Upstream Specification:** `CEP-STAGE-F-GOVERNED-LEARNING-RUNTIME-SPECIFICATION-01`
- **Planning Workstream:** `CEP-STAGE-F-GOVERNED-LEARNING-RUNTIME-IMPLEMENTATION-PLANNING-02`
- **Created Date:** 2026-09-13

---

## 2. Authority & Provenance

This document establishes the binding implementation-wave decomposition, unit boundaries, capability mapping, test criteria, and non-scope for the remaining implementation waves of the Governed Learning Runtime.

### Governance Hierarchy

$$\text{COMMITTED SSoT BASELINE} \succ \text{CANONICAL ZOD SCHEMAS} \succ \text{RUNTIME SPECIFICATION} \succ \text{THIS IMPLEMENTATION PLAN} \succ \text{WAVE CODE}$$

### Provenance Classification

- **Closed Baseline (Waves 0–4):** `RECOVERED_HISTORICAL_FACT`
- **Wave 5 (`GL-IMPL-UNIT-005`):** `RECOVERED_ACCEPTED_PLANNING` (Formalized in Planning 02)
- **Wave 8 (`GL-IMPL-UNIT-008`):** `RECOVERED_ACCEPTED_PLANNING` (Formalized in Planning 02)
- **Waves 6, 7, 9 (`GL-IMPL-UNIT-006`, `007`, `009`):** `FORMALLY_DEFINED_IN_PLANNING_02`

---

## 3. Closed Baseline Waves 0–4

The following initial waves are formally closed and preserved without modification:

| Wave | Unit ID | Unit Name | Files | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Wave 0** | N/A | Governance & Specification Gate | `docs/governance/governed-learning/governed-learning-contract-baseline.md` | `CLOSED` |
| **Wave 1** | `GL-IMPL-UNIT-001` | Core Runtime Types & Error Model | `packages/governed-learning/src/runtime/types.ts`<br>`packages/governed-learning/src/runtime/errors.ts` | `CLOSED` |
| **Wave 2** | `GL-IMPL-UNIT-002` | Envelope & Entity Parsers | `packages/governed-learning/src/runtime/parsers.ts` | `CLOSED` |
| **Wave 3** | `GL-IMPL-UNIT-003` | Processing Pipeline & Dispatcher | `packages/governed-learning/src/runtime/pipeline.ts` | `CLOSED` |
| **Wave 4** | `GL-IMPL-UNIT-004` | Command Handlers | `packages/governed-learning/src/runtime/handlers.ts` | `CLOSED` |

---

## 4. Remaining Implementation-Wave Overview

| Wave | Unit ID | Unit Name | Primary Focus | Primary Output Files |
| :--- | :--- | :--- | :--- | :--- |
| **Wave 5** | `GL-IMPL-UNIT-005` | Event Construction & Preservation | Construction of canonical physical events & preservation envelopes | `src/runtime/events.ts` |
| **Wave 6** | `GL-IMPL-UNIT-006` | Governance Persistence Ports & In-Memory Adapters | Persistence port interfaces & in-memory transient state | `src/runtime/persistence.ts` |
| **Wave 7** | `GL-IMPL-UNIT-007` | Historical Replay & Preservation Engine | Replay of event logs & opaque preservation inspection | `src/runtime/replay.ts` |
| **Wave 8** | `GL-IMPL-UNIT-008` | Deterministic Filter & Eligibility Query Boundary | Stage 1 deterministic guidance item filtering | `src/runtime/eligibility.ts` |
| **Wave 9** | `GL-IMPL-UNIT-009` | Runtime Composition & Public Exports | Pipeline composition & package public exports | `src/runtime/index.ts`<br>`src/index.ts` |

---

## 5. Implementation-Unit Catalog

### `GL-IMPL-UNIT-005`: Event Construction & Preservation
- **Assigned Wave:** Wave 5
- **Dependencies:** `GL-IMPL-UNIT-001`, `GL-IMPL-UNIT-002`, `GL-IMPL-UNIT-004`
- **Output Files:** `packages/governed-learning/src/runtime/events.ts`, `packages/governed-learning/tests/events.test.ts`
- **Purpose:** Construction and structural validation of physical canonical events from command handler outcomes and creation of `HistoricalEventPreservationEnvelope` (`CTR-GL-056`) for opaque payload version preservation without database persistence or network emission.

### `GL-IMPL-UNIT-006`: Governance Persistence Ports & In-Memory Adapters
- **Assigned Wave:** Wave 6
- **Dependencies:** `GL-IMPL-UNIT-001`, `GL-IMPL-UNIT-004`, `GL-IMPL-UNIT-005`
- **Output Files:** `packages/governed-learning/src/runtime/persistence.ts`, `packages/governed-learning/tests/persistence.test.ts`
- **Purpose:** Bounded runtime persistence port interfaces (`GovernancePersistencePort`) and transient in-memory repository adapters for observation, lesson, and event records without production database implementation.

### `GL-IMPL-UNIT-007`: Historical Replay & Preservation Engine
- **Assigned Wave:** Wave 7
- **Dependencies:** `GL-IMPL-UNIT-005`, `GL-IMPL-UNIT-006`
- **Output Files:** `packages/governed-learning/src/runtime/replay.ts`, `packages/governed-learning/tests/replay.test.ts`
- **Purpose:** Replay of historical event sequences and opaque preservation inspection (`CTR-GL-056`, `CTR-GL-057`) without historical record mutation or backdating.

### `GL-IMPL-UNIT-008`: Deterministic Filter & Eligibility Query Boundary
- **Assigned Wave:** Wave 8
- **Dependencies:** `GL-IMPL-UNIT-001`, `GL-IMPL-UNIT-002`, `GL-IMPL-UNIT-006`
- **Output Files:** `packages/governed-learning/src/runtime/eligibility.ts`, `packages/governed-learning/tests/eligibility.test.ts`
- **Purpose:** Stage 1 deterministic guidance item filtering and scope/target compatibility evaluation prior to downstream semantic ranking.

### `GL-IMPL-UNIT-009`: Runtime Composition & Public Exports
- **Assigned Wave:** Wave 9
- **Dependencies:** All previous units (`GL-IMPL-UNIT-001` through `008`)
- **Output Files:** `packages/governed-learning/src/runtime/index.ts`, `packages/governed-learning/src/index.ts`, `packages/governed-learning/tests/integration.test.ts`
- **Purpose:** End-to-end composite runtime pipeline wiring, public package export initialization, and end-to-end integration test suite.

---

## 6. Wave 5 Detailed Scope (`GL-IMPL-UNIT-005`)

### Authorized Files
- `packages/governed-learning/src/runtime/events.ts`
- `packages/governed-learning/tests/events.test.ts`

### Canonical Physical Event Set (Strategy C Reconciled Discriminators)
*Governance Alignment Notice (GL-CONTRACT-AMENDMENT-001):* Physical event discriminators below are aligned to canonical Strategy C contract catalog event types (`CTR-GL-013` through `CTR-GL-035`):
1. `OBSERVATION_INGESTED` (former `OBSERVATION_CREATED`, `CTR-GL-013`)
2. `OBSERVATION_VALIDATED` (`CTR-GL-015`)
3. `LESSON_CANDIDATE_PROPOSED` (former `LESSON_CANDIDATE_CREATED`, `CTR-GL-018`)
4. `LESSON_CANDIDATE_APPROVED` (`CTR-GL-020`)
5. `LESSON_PUBLISHED` (Canonical publication event, `CTR-GL-023`)
6. `LESSON_DEPRECATED` (former `LESSON_RETIRED`, `CTR-GL-025`)
7. `LESSON_SUPERSEDED` (`CTR-GL-026`)
8. `PROSPECTIVE_ADOPTION_ADOPTED` (former `LESSON_ADOPTED`, `CTR-GL-033`)
9. `PROSPECTIVE_ADOPTION_WITHDRAWN` (`CTR-GL-035`)

### Key Boundaries & Rules
- **Handler Result $\neq$ Canonical Event:** Handlers return execution outcome DTOs; Wave 5 event construction constructs physical canonical events from validated handler outcomes.
- **Event Construction $\neq$ Persistence:** Wave 5 builds event structures in memory; it does not write to a database or append-only store.
- **Event Construction $\neq$ Emission:** Wave 5 does not emit events over a network or message bus.
- **Event Construction $\neq$ Authority Decision:** Wave 5 requires explicit recorded decision inputs (`humanReviewerId`, `governanceAuthorityId`) for authority-sensitive events (`OBSERVATION_VALIDATED`, `LESSON_CANDIDATE_APPROVED`, `LESSON_PUBLISHED`, `LESSON_DEPRECATED`, `LESSON_SUPERSEDED`, `PROSPECTIVE_ADOPTION_ADOPTED`, `PROSPECTIVE_ADOPTION_WITHDRAWN`). It never infers or manufactures authority.
- **Preservation Meaning:** Structural preservation of unsupported event payload versions using `HistoricalEventPreservationEnvelope` (`CTR-GL-056`) without throwing unhandled parse exceptions. `CTR-GL-057` (`HistoricalCommandPreservationEnvelope`) is deferred to historical replay (Wave 7).
- **Version Strategy:** Consumes payload schema version provided in input or defaults to current canonical payload schema version under `OPEN-GL-RUNTIME-004` boundary without inventing a version generator.
- **Event Identity / Timestamp:** Populates structurally required fields in payload/envelope using input references without replacing pipeline execution timestamps.

---

## 7. Wave 6 Detailed Scope (`GL-IMPL-UNIT-006`)

### Authorized Files
- `packages/governed-learning/src/runtime/persistence.ts`
- `packages/governed-learning/tests/persistence.test.ts`

### Key Boundaries & Rules
- Defines `GovernancePersistencePort` interface.
- Implements `InMemoryGovernanceRepository` adapter for transient unit testing and in-memory execution pipeline state.
- Does not implement SQL, NoSQL, ORM, database migrations, or persistent disk storage.

---

## 8. Wave 7 Detailed Scope (`GL-IMPL-UNIT-007`)

### Authorized Files
- `packages/governed-learning/src/runtime/replay.ts`
- `packages/governed-learning/tests/replay.test.ts`

### Key Boundaries & Rules
- Implements `HistoricalReplayEngine` to reconstruct deterministic historical state up to timestamp $T$.
- Consumes `HistoricalEventPreservationEnvelope` (`CTR-GL-056`) and `HistoricalCommandPreservationEnvelope` (`CTR-GL-057`).
- Enforces strict historical immutability: rejects backdating and mutation attempts.

---

## 9. Wave 8 Detailed Scope (`GL-IMPL-UNIT-008`)

### Authorized Files
- `packages/governed-learning/src/runtime/eligibility.ts`
- `packages/governed-learning/tests/eligibility.test.ts`

### Key Boundaries & Rules
- Implements `Stage 1 Deterministic Eligibility Filter`.
- Filters out non-matching scopes, target component mismatches, retired lessons, and superseded guidance before Stage 2 semantic ranking.
- Does not perform AI semantic ranking or LLM scoring.

---

## 10. Wave 9 Detailed Scope (`GL-IMPL-UNIT-009`)

### Authorized Files
- `packages/governed-learning/src/runtime/index.ts`
- `packages/governed-learning/src/index.ts`
- `packages/governed-learning/tests/integration.test.ts`

### Key Boundaries & Rules
- Wires complete 11-stage runtime processing pipeline.
- Exports public API interfaces in `src/index.ts`.
- Validates end-to-end integration across commands, handlers, events, and eligibility filtering.

---

## 11. Capability-to-Unit Map

| Runtime Capability | Assigned Unit | Wave | Provenance |
| :--- | :--- | :--- | :--- |
| Runtime Error Taxonomy & Types | `GL-IMPL-UNIT-001` | Wave 1 | `CLOSED` |
| Structural Envelope & Entity Parsing | `GL-IMPL-UNIT-002` | Wave 2 | `CLOSED` |
| 11-Stage Processing Pipeline & Dispatcher | `GL-IMPL-UNIT-003` | Wave 3 | `CLOSED` |
| Bounded Command Handlers | `GL-IMPL-UNIT-004` | Wave 4 | `CLOSED` |
| Canonical Event Construction & `CTR-GL-056` Preservation | `GL-IMPL-UNIT-005` | Wave 5 | `RECONSTRUCTED` |
| Persistence Port Interfaces & In-Memory Repository | `GL-IMPL-UNIT-006` | Wave 6 | `FORMALLY_PLANNED` |
| Historical Replay Engine & `CTR-GL-057` Preservation | `GL-IMPL-UNIT-007` | Wave 7 | `FORMALLY_PLANNED` |
| Stage 1 Deterministic Eligibility Filtering | `GL-IMPL-UNIT-008` | Wave 8 | `RECONSTRUCTED` |
| Pipeline Composition & Package Public Exports | `GL-IMPL-UNIT-009` | Wave 9 | `FORMALLY_PLANNED` |

---

## 12. Open Architecture Dependencies

All six open architecture questions remain **OPEN** and unratified:

1. `OPEN-GL-RUNTIME-001`: `ADOPTION_WITHDRAWAL_SEMANTICS` — Deferred to governance policy gate.
2. `OPEN-GL-RUNTIME-002`: `PROVENANCE_AUTHENTICITY_VERIFICATION` — Deferred to security policy gate.
3. `OPEN-GL-RUNTIME-003`: `SUCCESSOR_SCOPE_LINEAGE_SEMANTICS` — Deferred to lineage policy gate.
4. `OPEN-GL-RUNTIME-004`: `VERSION_ASSIGNMENT_AUTHORITY` — Consumed passively by Wave 5; authority resolution deferred.
5. `OPEN-GL-RUNTIME-005`: `IDEMPOTENCY_POLICY` — Stage 8 pipeline boundary remains neutral.
6. `OPEN-GL-RUNTIME-006`: `CONCURRENCY_CONTROL_STRATEGY` — Stage 9 pipeline boundary remains neutral.

---

## 13. Requirement Traceability

| Planning Identifier | SSoT / Architecture Source | Assigned Unit | Target Output File |
| :--- | :--- | :--- | :--- |
| `PLAN-GL-W5-001` | SSoT Section 6.2 (Event Discriminators) | `GL-IMPL-UNIT-005` | `src/runtime/events.ts` |
| `PLAN-GL-W5-002` | `CTR-GL-056` (Event Preservation Envelope) | `GL-IMPL-UNIT-005` | `src/runtime/events.ts` |
| `PLAN-GL-W6-001` | Specification Section 21 (Persistence Port) | `GL-IMPL-UNIT-006` | `src/runtime/persistence.ts` |
| `PLAN-GL-W7-001` | `CTR-GL-057` & Specification Section 19 | `GL-IMPL-UNIT-007` | `src/runtime/replay.ts` |
| `PLAN-GL-W8-001` | SSoT `INV-GL-034` (Deterministic Filtering) | `GL-IMPL-UNIT-008` | `src/runtime/eligibility.ts` |
| `PLAN-GL-W9-001` | Specification Section 33 (Public Composition) | `GL-IMPL-UNIT-009` | `src/index.ts` |

---

## 14. Explicit Non-Scope

The following capabilities are strictly excluded from all runtime implementation waves (Waves 1–9):

- Production database implementation (PostgreSQL, SQLite, Redis, ORM, migrations)
- Network message broker or event bus integration (Kafka, RabbitMQ, NATS)
- HTTP/REST/gRPC API controllers or server routes
- User Interface (UI) components or web apps
- AI self-authorization or automated governance decision-making
- Production version assignment generators
- M5 Enforcement Mode activation (M5 remains `SHADOW`)

---

## 15. Validation / Exit Criteria

### Wave 5 Exit Criteria
1. `packages/governed-learning/src/runtime/events.ts` created with exact 7 event construction functions.
2. `packages/governed-learning/tests/events.test.ts` passes with 100% test success.
3. Consumes existing canonical Zod schemas without redefining schemas.
4. No event store persistence or network emission implemented.
5. No authority inference or AI self-approval created.
6. Package build, root build, root test, and root lint pass.

---

## 16. Change-Control Rules

- Any amendment to this plan requires explicit owner authorization.
- Closed waves (Waves 0–4) cannot be reopened under runtime implementation workstreams.
- Open architecture questions (`OPEN-GL-RUNTIME-001` through `006`) cannot be resolved by code implementation alone.

---

## 17. Planning Provenance Limitations

- Requirement provenance across Stage F remains classified as `PARTIAL`.
- No unsupported shorthand identifiers may be presented as physical repository SSoT authority.
- The governance sequence finding `WAVE4-R3-GOV-001` remains recorded as an open, non-blocking sequence finding.
