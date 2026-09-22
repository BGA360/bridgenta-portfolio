# Architectural Decision Record (ADR)
## BECC v2 ↔ Governed Learning Integration Architecture & Boundary Model

* **Status:** PROPOSED (Pending Repository Owner Review & Authorization)
* **Date:** 2026-09-22
* **Workstream:** `BRIDGENTA-BECC-V2-REENTRY-ARCHITECTURE-RECONCILIATION-01`
* **Target Subsystems:** `becc-runtime` & `packages/governed-learning`

---

## 1. Context & Problem Statement

BridGenta Engineering Communication Constitution (BECC) v2 is designed as an AI-orchestrated engineering communication and technical documentation transformation platform. Following the successful completion of Governed Learning Hardening (`GL-HARDENING-001` through `GL-HARDENING-006`, culminating in PR #310 merge commit `7ad7c2fda88b147ef67611177fd337008e10b597`), Governed Learning provides Level-1 process-local integrity, Level-2A SQLite durable transaction persistence, and Level-2B PostgreSQL production multi-instance durable transaction persistence (`READ COMMITTED` isolation, physical `BEGIN...COMMIT` boundaries, atomic entity+event+command records, Stage 8 command idempotency, and Stage 9 scope concurrency control).

BECC v2 must now re-enter architecture development from first principles. Prior to this reconciliation, BECC v2 specifications assumed local rule management and independent orchestrator execution without explicit integration contracts with the hardened Governed Learning runtime. A clear integration contract and strict boundary definition are required to prevent duplicate ownership, bypassed governance gates, or database table collisions.

---

## 2. Decision Summary

1. **Unidirectional Core Dependency:** BECC v2 depends on Governed Learning's public TypeScript runtime contracts (`packages/governed-learning`). Governed Learning MUST NEVER depend on BECC (`GL_IMPORTS_BECC_PROPOSED: NO`).
2. **Model A Integration (Application Service Invocation):** BECC v2 invokes Governed Learning as an in-process core runtime service through `GovernedLearningRuntime.processAndExecuteCommandAsync()`. BECC does NOT write to Governed Learning database tables directly (`BECC_DIRECT_GL_DATABASE_ACCESS: NO`).
3. **Strict Bounded Context Separation:**
   * **BECC v2 Bounded Context:** Technical documentation/communication parsing, static AST & link validation, weakness finding detection, AI transformation planning, human-in-the-loop diff approval, and publication/portfolio readiness evidence computation.
   * **Governed Learning Bounded Context:** Institutional observation capture, cross-project lesson candidate creation and evaluation, rule candidate proposal and policy binding, Stage 8 command idempotency, Stage 9 scope concurrency, durable event-sourced transaction persistence, and historical replay.
4. **No Internal Transaction Leakage:** BECC and Governed Learning operate across separate transaction boundaries connected via `EVENTUAL_IDEMPOTENT` consistency. BECC MUST NOT receive or manipulate Governed Learning `TransactionContext` objects (`BECC_DIRECT_TRANSACTION_CONTEXT_ACCESS: NO`).
5. **Stage 8 & Stage 9 Non-Duplication:** Governed Learning retains exclusive ownership of command-level Stage 8 idempotency (`commandId`) and Stage 9 scope concurrency control (`scopeKeys`). BECC MUST NOT reimplement Stage 8 or Stage 9 for Governed Learning commands (`BECC_REIMPLEMENTS_STAGE8: NO`, `BECC_REIMPLEMENTS_STAGE9: NO`).
6. **Rule & Lesson SSoT:** Governed Learning is the Single Source of Truth for lessons and rule candidates. Proposed rules are NEVER treated as binding policy until explicitly adopted by governance (`RULE_CANDIDATE_TREATED_AS_BINDING_POLICY: NO`). BECC queries approved lessons and adopted rules from Governed Learning.
7. **Publication Authority Boundary:** BECC computes publication-readiness evidence and reports status (`READY`, `NOT_READY`, `BLOCKED`, `INSUFFICIENT_EVIDENCE`), but final publication authority remains exclusively with M5 / PRAG (`BECC_OWNS_FINAL_PUBLICATION_AUTHORITY: NO`).
8. **Internal TS Contracts vs External MCP:** In-process domain communication uses direct TypeScript contracts. Model Context Protocol (MCP) is reserved exclusively for external tool exposure and client boundaries (`MCP_REQUIRED_FOR_BECC_GL_CORE_INTEGRATION: NO`).

---

## 3. Responsibility & Ownership Matrix

| Domain / Capability | BECC v2 | Governed Learning | Shared Contract | External Subsystem |
| :--- | :---: | :---: | :---: | :---: |
| **Doc / Commit Evidence Capture** | OWNS | - | DTO | - |
| **Document Weakness Finding** | OWNS | - | DTO | - |
| **AI Transformation Planning** | OWNS | - | DTO | AI Provider Adapters |
| **Human Diff Approval (HITL Tokens)** | OWNS | - | DTO | - |
| **Publication Readiness Evaluation** | OWNS | - | DTO | - |
| **Final Portfolio / Publication Gate** | - | - | DTO | **M5 / PRAG Governance** |
| **Observation Recording** | - | OWNS | `ObservationRecord` | - |
| **Lesson Candidate Lifecycle** | - | OWNS | `LessonCandidateRecord` | - |
| **Lesson Approval & Evaluation** | - | OWNS | `LessonEvaluationRecord` | - |
| **Rule Candidate & Policy Binding** | - | OWNS | `RuleCandidateProposalRecord` | - |
| **Stage 8 Command Idempotency** | - | OWNS | `commandId` | - |
| **Stage 9 Scope Concurrency** | - | OWNS | `scopeKeys` | - |
| **Durable Transaction Persistence** | - | OWNS | `UnitOfWork` | PostgreSQL / SQLite |
| **BECC Ledger & Diff Cache** | OWNS | - | Local BECC Store | - |
| **Replay & Historical Reconstruction** | - | OWNS | `HistoricalReplayEngine` | - |

---

## 4. Architectural Collisions & Resolutions

### Collision 1: Rule & Lesson State Ownership
* **Legacy BECC Assumption:** BECC Knowledge Resolver assumes it crawls local markdown files and resolves rule overrides locally without a runtime authority.
* **Governed Learning Reality:** Governed Learning is the hardened SSoT for lesson and rule lifecycle states (`candidate`, `approved`, `adopted`, `superseded`, `retired`).
* **Resolution:** BECC Knowledge Resolver queries Governed Learning's public contract interfaces for approved lessons and adopted rules. BECC does not maintain an independent authoritative rule store.

### Collision 2: Command Idempotency
* **Legacy BECC Assumption:** BECC Orchestrator manages execution retries for all actions.
* **Governed Learning Reality:** Governed Learning Stage 8 provides guaranteed command-level idempotency (`commandId`) with strict payload mismatch refusal.
* **Resolution:** BECC passes deterministic `commandId` envelopes to Governed Learning. Governed Learning handles Stage 8 idempotency natively without BECC duplicating execution caches for GL commands.

### Collision 3: Database & Transaction Coupling
* **Legacy BECC Assumption:** Potential direct SQL reads/writes across tables.
* **Governed Learning Reality:** Governed Learning enforces atomic multi-entity physical transactions via `PostgresRuntimeIntegrityUnitOfWork` / `SqliteRuntimeIntegrityUnitOfWork`.
* **Resolution:** Direct database access to GL tables from BECC is strictly forbidden. BECC interacts with Governed Learning exclusively via public runtime service methods (`processAndExecuteCommandAsync`).

---

## 5. Escalation & Feedback Model

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
   [BECC Local Finding & Diff Plan]             [Cross-Project Insight?]
   (Internal to becc-runtime)                             │
                                                          ▼
                                            [BECC GL Integration Adapter]
                                                          │
                                         (Emits GL Command: CreateLessonCandidate)
                                                          │
                                                          ▼
                                            [Governed Learning Runtime]
                                            Stage 8 (Idempotency)
                                                    ↓
                                            Stage 9 (Concurrency)
                                                    ↓
                                            Level-2B Postgres Transaction
                                                    ↓
                                            [Governance Event & Replay]
```

1. **BECC → Governed Learning Escalation:** When a BECC finding identifies a cross-project systemic defect or reusable pattern, BECC dispatches a `CreateLessonCandidateCommand` or `SubmitObservationCommand` to Governed Learning.
2. **Governed Learning → BECC Feedback:** BECC Knowledge Resolver periodically queries Governed Learning for `APPROVED` lessons and `BOUND` policy rules to inform future document transformation guidance.

---

## 6. Rejected Alternatives

* **Alternative A (Shared Database Tables):** Rejected. Breaks bounded context encapsulation and violates Governed Learning's physical UnitOfWork transaction atomicity.
* **Alternative B (BECC Duplicating Governance Logic):** Rejected. Duplicating lesson approval or rule state in BECC creates split-brain governance.
* **Alternative C (Shared Physical Transaction Context):** Rejected. Passing raw PostgreSQL transaction clients across bounded contexts creates connection leaks and deadlock vulnerabilities.
* **Alternative D (MCP as Core Domain Contract):** Rejected. In-process domain communication must use type-checked TypeScript contracts for performance and strict schema enforcement.

---

## 7. Known Limitations & Out-of-Scope Items

* **Level 3 Coordination:** Distributed external side-effect coordination (e.g. remote webhooks, cross-repository Git pushes) is NOT implemented in this workstream.
* **HITL Operational Runtime:** Multi-user reviewer assignment queues, inbox UIs, and notification daemons are NOT included. BECC maintains simple local cryptographic approval tokens.
* **M5 / PRAG Authority:** BECC does NOT override or automate final M5 / PRAG publication release decisions.
