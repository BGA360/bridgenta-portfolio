# Architectural Decision Record (ADR)
## BECC v2 ↔ Governed Learning Integration Architecture & Boundary Model

* **Status:** PROPOSED (Pending Repository Owner Review & Authorization)
* **Date:** 2026-09-22
* **Workstream:** `BRIDGENTA-BECC-V2-PR311-ARCHITECTURE-EVIDENCE-ALIGNMENT-01`
* **Target Subsystems:** `becc-runtime` & `packages/governed-learning`

---

## 1. Context & Problem Statement

BridGenta Engineering Communication Constitution (BECC) v2 is designed as an AI-orchestrated engineering communication and technical documentation transformation platform. Following the successful completion of Governed Learning Hardening (`GL-HARDENING-001` through `GL-HARDENING-006`, culminating in PR #310 merge commit `7ad7c2fda88b147ef67611177fd337008e10b597`), Governed Learning provides Level-1 process-local integrity, Level-2A SQLite durable transaction persistence, and Level-2B PostgreSQL production multi-instance durable transaction persistence (`READ COMMITTED` isolation, physical `BEGIN...COMMIT` boundaries, atomic entity+event+command records, Stage 8 command idempotency, and Stage 9 scope concurrency control).

BECC v2 must now re-enter architecture development from first principles. Prior to this reconciliation, BECC v2 specifications assumed local rule management and independent orchestrator execution without explicit integration contracts with the hardened Governed Learning runtime. A clear integration contract and strict boundary definition are required to prevent duplicate ownership, bypassed governance gates, or database table collisions.

---

## 2. Decision Summary

1. **Unidirectional Core Dependency:** BECC v2 depends on Governed Learning's verified public TypeScript contracts (`packages/governed-learning`). Governed Learning MUST NEVER depend on BECC (`GL_IMPORTS_BECC_PROPOSED: NO`).
2. **Model A Integration (Application Service Invocation):** BECC v2 invokes Governed Learning as an in-process core runtime service through `GovernedLearningRuntime.processAndExecuteCommandAsync()`. BECC does NOT write to Governed Learning database tables directly (`BECC_DIRECT_GL_DATABASE_ACCESS: NO`).
3. **Strict Bounded Context Separation:**
   * **BECC v2 Bounded Context:** Technical documentation/communication parsing, static AST & link validation, weakness finding detection, AI transformation planning, human-in-the-loop diff approval, and publication/portfolio readiness evidence computation.
   * **Governed Learning Bounded Context:** Institutional observation capture, cross-project lesson candidate creation and evaluation, rule candidate proposal and prospective adoption, Stage 8 command idempotency, Stage 9 scope concurrency, durable transactional state, governance-event persistence, and historical replay.
4. **No Internal Transaction Leakage:** BECC and Governed Learning operate across separate physical transaction boundaries connected via `EVENTUAL_IDEMPOTENT` consistency. BECC MUST NOT receive or manipulate Governed Learning `TransactionContext` objects (`BECC_DIRECT_TRANSACTION_CONTEXT_ACCESS: NO`).
5. **Stage 8 & Stage 9 Non-Duplication:** Governed Learning retains exclusive ownership of command-level Stage 8 idempotency (`commandId`) and Stage 9 scope concurrency control (`scopeKeys`). BECC MUST NOT reimplement Stage 8 or Stage 9 for Governed Learning commands (`BECC_REIMPLEMENTS_STAGE8: NO`, `BECC_REIMPLEMENTS_STAGE9: NO`).
6. **Rule & Lesson SSoT:** Governed Learning owns rule-candidate proposals (`ProposeRuleCandidate`) and prospective adoption semantics (`AdoptLesson` / `AdoptProposalCommandPayloadSchema`). Binding policy authority remains external or unresolved unless an explicit canonical binding contract exists (`GL_EXPLICIT_POLICY_BINDING_CAPABILITY: NOT_PROVEN`). BECC consumes eligible guidance through Governed Learning's verified public guidance-query contract (`BuildGuidanceSetQuery`).
7. **Publication Authority Boundary:** BECC computes publication-readiness evidence and reports status (`READY`, `NOT_READY`, `BLOCKED`, `INSUFFICIENT_EVIDENCE`), but final publication release decisions remain under M5 / PRAG governance (`BECC_OWNS_FINAL_PUBLICATION_AUTHORITY: NO`).
8. **Internal TS Contracts vs External MCP:** In-process domain communication uses direct TypeScript contracts. Model Context Protocol (MCP) is reserved exclusively for external tool exposure and client boundaries (`MCP_REQUIRED_FOR_BECC_GL_CORE_INTEGRATION: NO`).

---

## 3. Responsibility & Ownership Matrix

| Domain / Capability | BECC v2 | Governed Learning | Shared Contract | External Subsystem |
| :--- | :---: | :---: | :---: | :---: |
| **Doc / Commit Evidence Capture** | OWNS | - | DTO | - |
| **Document Weakness Finding** | OWNS | - | DTO | - |
| **AI Transformation Planning** | OWNS | - | DTO | AI Provider Adapters |
| **Human Diff Approval (HITL Tokens)** | OWNS (Subject to Verification) | - | DTO | - |
| **Publication Readiness Evaluation** | OWNS | - | DTO | - |
| **Final Portfolio / Publication Gate** | - | - | DTO | **M5 / PRAG Governance** |
| **Observation Recording** | - | OWNS | `ObservationRecord` | - |
| **Lesson Candidate Lifecycle** | - | OWNS | `LessonCandidateRecord` | - |
| **Lesson Approval & Evaluation** | - | OWNS | `LessonEvaluationRecord` | - |
| **Rule Candidate Proposal** | - | OWNS | `RuleCandidateProposalRecord` | - |
| **Prospective Adoption Semantics** | - | OWNS | `ProspectiveAdoptionRecord` | - |
| **Final Binding Policy Authority** | - | - | DTO | External Governance / Unresolved |
| **Stage 8 Command Idempotency** | - | OWNS | `commandId` | - |
| **Stage 9 Scope Concurrency** | - | OWNS | `scopeKeys` | - |
| **Durable Transaction Persistence** | - | OWNS | `UnitOfWork` | PostgreSQL / SQLite |
| **BECC Ledger & Diff Cache** | OWNS | - | Local BECC Store | - |
| **Historical Replay** | - | OWNS | `HistoricalReplayEngine` | - |

---

## 4. Architectural Collisions & Resolutions

### Collision 1: Rule & Lesson State Ownership
* **Legacy BECC Assumption:** BECC Knowledge Resolver assumes it crawls local markdown files and resolves rule overrides locally without a runtime authority.
* **Governed Learning Reality:** Governed Learning is the hardened SSoT for lesson and rule candidate lifecycle states (`candidate`, `in_review`, `approved`, `rejected`, `revision_requested`, `published`, `deprecated`, `superseded`).
* **Resolution:** BECC Knowledge Resolver consumes guidance through Governed Learning's verified public query interface (`BuildGuidanceSetQuery`). BECC does not maintain an independent authoritative rule store.

### Collision 2: Command Idempotency vs Historical Replay
* **Legacy BECC Assumption:** BECC Orchestrator manages execution retries for all actions and treats idempotency and replay as interchangeable.
* **Governed Learning Reality:** Governed Learning separates Stage 8 operational command idempotency (`commandId`, exact retry outcome replay) from `HistoricalReplayEngine` (domain state reconstruction up to a target timestamp/offset).
* **Resolution:** BECC dispatches deterministic `commandId` envelopes for Stage 8 command idempotency. Historical state queries use `HistoricalReplayEngine` when historical reconstruction is required.

### Collision 3: Database & Transaction Coupling
* **Legacy BECC Assumption:** Potential direct SQL reads/writes across tables.
* **Governed Learning Reality:** Governed Learning enforces atomic multi-entity physical transactions via `PostgresRuntimeIntegrityUnitOfWork` / `SqliteRuntimeIntegrityUnitOfWork`.
* **Resolution:** Direct database access to GL tables from BECC is strictly forbidden. BECC interacts with Governed Learning exclusively via public runtime service methods (`processAndExecuteCommandAsync`).

---

## 5. Epistemic Escalation & Feedback Model

```text
[Technical Document / Source Artifact]
               │
               ▼
[BECC Validation Engine & Assessment Domain]
               │
   (Detects Document Weakness / Compliance Defect)
               │
               ├──────────────────────────────────────────┐
               ▼                                          ▼
   [BECC Local Finding & Diff Plan]             [Cross-Project Insight Candidate?]
   (Internal to becc-runtime)                             │
                                                          ▼
                                            [BECC GL Integration Adapter]
                                                          │
                                         (Emits GL Pipeline: DraftObservation
                                                   → AttachEvidence
                                                   → SubmitObservation)
                                                          │
                                                          ▼
                                            [Governed Learning Runtime]
                                            Observation Validation Gate
                                                    ↓
                                            CreateLessonCandidate
                                                    ↓
                                            ApproveLesson / ProposeRuleCandidate
                                                    ↓
                                            [Durable Transaction & Event Log]
```

1. **Epistemic Invariant:**
   $$\text{Observed} \neq \text{Learned} \neq \text{Approved} \neq \text{Binding Policy}$$
   * A BECC finding is a raw defect detection; it cannot bypass observation validation or directly create an approved lesson.
   * Escalation dispatches canonical observation lifecycle commands (`DraftObservation` → `AttachEvidence` → `SubmitObservation`).
   * Governed Learning handles observation validation (`ValidateMechanicalObservation` / `RecordInterpretiveValidation`) and lesson candidate evaluation (`CreateLessonCandidate` → `ApproveLesson`).
2. **Governed Learning → BECC Feedback:** BECC Knowledge Resolver consumes guidance via `BuildGuidanceSetQuery` to obtain eligible advisory lessons for technical document transformation.

---

## 6. Identified Governed Learning Capability Gaps

1. **`GL_CAPABILITY_GAP_001` (Guidance Query Handler Deferred):**
   * *Description:* `BuildGuidanceSetQuery` payload schema exists in GL contracts, but its handler in `handlers.ts` currently returns `RuntimeInvariantError('BuildGuidanceSetQuery is a query payload deferred to query/replay wave')`.
   * *Classification:* `GL_PUBLIC_API_GAP`.
   * *Resolution:* BECC Knowledge Resolver integration (`BECC-V2-IMPL-013`) requires implementing or exposing the `BuildGuidanceSetQuery` handler in Governed Learning.
2. **`GL_CAPABILITY_GAP_002` (Explicit Policy Binding Engine Unimplemented):**
   * *Description:* Governed Learning supports proposal (`ProposeRuleCandidate`) and prospective adoption (`AdoptLesson` / `AdoptProposalCommand`), but does not expose a global policy-binding command engine or `BindRulePolicyCommand`.
   * *Classification:* `OUT_OF_SCOPE_GOVERNANCE_CAPABILITY`.
   * *Resolution:* BECC treats prospective adoption as project/workstream context binding (`ADOPTED`), not globally binding constitutional policy.
3. **`GL_CAPABILITY_GAP_003` (Canonical Escalation Multi-Step Mapping):**
   * *Description:* BECC cannot jump from finding to approved lesson in a single command.
   * *Classification:* `BECC_ADAPTER_MAPPING_ONLY`.
   * *Resolution:* BECC escalation adapter in `BECC-V2-IMPL-014` executes the multi-step observation submission pipeline.

---

## 7. Rejected Alternatives

* **Alternative A (Shared Database Tables):** Rejected. Breaks bounded context encapsulation and violates Governed Learning's physical UnitOfWork transaction atomicity.
* **Alternative B (BECC Duplicating Governance Logic):** Rejected. Duplicating lesson approval or rule state in BECC creates split-brain governance.
* **Alternative C (Inventing Non-Existent GL Commands in ADR):** Rejected. ADR must reflect verified repository contracts today.
* **Alternative D (MCP as Core Domain Contract):** Rejected. In-process domain communication must use type-checked TypeScript contracts.

---

## 8. Known Limitations & Out-of-Scope Items

* **Level 3 Coordination:** Distributed external side-effect coordination (e.g. remote webhooks, cross-repository Git pushes) is NOT implemented in this workstream.
* **HITL Operational Runtime:** Multi-user reviewer assignment queues, inbox UIs, and notification daemons are NOT included. BECC approval-token mechanism remains subject to implementation verification.
* **M5 / PRAG Authority:** BECC does NOT override or automate final M5 / PRAG publication release decisions.
