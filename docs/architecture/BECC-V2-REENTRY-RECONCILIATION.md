# BECC v2 Re-Entry Architecture Reconciliation Report

* **Workstream ID:** `BRIDGENTA-BECC-V2-PR311-ARCHITECTURE-EVIDENCE-ALIGNMENT-01`
* **Date:** 2026-09-22
* **Baseline Governed Learning Commit:** `7ad7c2fda88b147ef67611177fd337008e10b597` (PR #310 PostgreSQL Level-2B)
* **Current Main SHA:** `c338fcabe54637733f6a8d03b300a79b9e1ef868`
* **PR #311 Head SHA:** `73a9646368eb927a9d9031e620f9a5b24b4fcc00`
* **Status:** RE-CERTIFIED (Architecture Evidence Alignment Phase)

---

## 1. Executive Summary

This report presents the evidence-aligned re-entry architecture audit for the **BridGenta Engineering Communication Constitution (BECC) v2** platform following Governed Learning Hardening Level 2B (`GL-HARDENING-001` to `GL-HARDENING-006`).

Governed Learning is certified with Level-1 process-local integrity, Level-2A SQLite durable single-file transaction persistence, and Level-2B PostgreSQL production multi-instance durable transaction persistence (`READ COMMITTED` isolation, execution-scoped transaction ownership, post-BEGIN Stage 8 revalidation, `40P01` deadlock preservation, and atomic entity+event+command records).

This remediated report grounds all BECC v2 integration boundaries strictly in verified canonical Governed Learning contracts (`packages/governed-learning`). Non-existent commands (e.g. `BindRulePolicyCommand`) have been removed, query semantics are mapped to `BuildGuidanceSetQuery`, event-sourcing overclaims have been aligned with transactional state persistence, and explicit capability gaps have been documented.

---

## 2. Artifact Inventory & Classification

A comprehensive audit of all BECC v1 and BECC v2 artifacts in the repository yielded the following classification:

| Artifact | Path | Type | Current Status | Recommended Action | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BECC v1 Audit** | `BECC-v1.0-FINAL-OPERATIONAL-READINESS-AUDIT.md` | Doc | Historical | **ARCHIVE** | Superseded by BECC v2 specifications. |
| **AEO Cortex Files** | `docs/becc/aeocortex/*` | Docs | Historical | **ARCHIVE** | BECC v1 pilot remediation records; retain for audit compliance. |
| **v2 Proposal** | `docs/engineering-communication/BECC-v2.0-ARCHITECTURE-PROPOSAL.md` | Doc | Superseded | **SUPERSEDE** | Replaced by frozen v2 baseline documents. |
| **v2 Freeze Declaration** | `docs/engineering-communication/v2/BECC-v2-...AUTHORIZATION.md` | Doc | Frozen | **UPDATE** | Reflects pre-GL hardening state; update to reference GL Level-2B ADR. |
| **v2 RKF Integration CDS**| `docs/engineering-communication/v2/constitution/BECC-v2-...CDS-v1.0.md` | Spec | Active | **KEEP** | Authoritative constitutional reference for rule resolution. |
| **v2 Knowledge Spec** | `docs/engineering-communication/v2/architecture/BECC-v2-...ARCHITECTURE.md` | Spec | Active | **UPDATE** | Align Knowledge Resolver to consume guidance via `BuildGuidanceSetQuery`. |
| **v2 Implementation Spec**| `docs/engineering-communication/v2/architecture/BECC-v2-...SPECIFICATION.md` | Spec | Active | **UPDATE** | Incorporate GL integration adapter package boundary. |
| **v2 CDM Specification** | `docs/engineering-communication/v2/engineering/BECC-v2-...MODEL.md` | Schema | Active | **KEEP** | Sound data model; add DTO mapping to GL command envelopes. |
| **v2 Domain EDS (1-9)** | `docs/engineering-communication/v2/engineering/domains/*.md` | Spec | Active | **KEEP** | High quality domain specifications; align Runtime Orchestrator EDS with GL adapter. |
| **WP Certificates 1-11** | `docs/engineering-communication/v2/engineering/certificates/WP-001..011` | Cert | Frozen | **KEEP** | Certificates of closed implementation work packages. |
| **BECC Runtime Code** | `becc-runtime/` | Code | Active | **UPDATE** | Add `becc-runtime/governed-learning/` integration adapter. |
| **Portfolio Readiness Rule**| `docs/portfolio-readiness-rule.md` | Rule | Active | **KEEP** | Authoritative portfolio readiness rule specification. |
| **Publication Governance** | `docs/publication-governance.md` | Governance | Active | **KEEP** | Authoritative M5 / PRAG governance SSoT. |

---

## 3. Bounded Context & Ownership Definition

### 3.1 Bounded Context Statements
* **BECC v2 Bounded Context:** Technical engineering documentation assessment, weakness finding detection, AI-orchestrated transformation planning, passive AST/link validation, human-in-the-loop diff approval, and publication/portfolio readiness evidence evaluation.
* **Governed Learning Bounded Context:** Institutional observation capture, cross-project lesson candidate creation and evaluation, rule candidate proposal and prospective adoption, Stage 8 command idempotency, Stage 9 scope concurrency, durable transactional state, governance-event persistence, and historical replay.

### 3.2 Epistemic Invariants
$$\text{Observed} \neq \text{Learned} \neq \text{Approved} \neq \text{Binding Policy}$$
* A BECC finding is a raw defect detection; it cannot bypass observation validation or directly create an approved lesson.
* An approved lesson is NOT a binding policy rule.
* Prospective adoption (`AdoptLesson` / `AdoptProposalCommandPayloadSchema`) binds proposals to target project/workstream context (`ADOPTED`), not globally binding policy.

---

## 4. Integration & Dependency Architecture

### 4.1 Unidirectional Package Dependency
```text
[becc-runtime] (Transformation Engine & Orchestrator)
       │
       ▼ (Imports public TS contracts/runtime)
[packages/governed-learning] (Hardened Level-2B Runtime)
```
* `BECC_IMPORTS_GL_PROPOSED: YES`
* `GL_IMPORTS_BECC_PROPOSED: NO`
* `CIRCULAR_DEPENDENCY_PROPOSED: NO`

### 4.2 Application Service Integration (Model A)
BECC communicates with Governed Learning via an in-process **Governed Learning Integration Adapter** (`becc-runtime/governed-learning/governed-learning-adapter.service.ts`).
* The adapter wraps `GovernedLearningRuntime.processAndExecuteCommandAsync()`.
* Direct SQL execution against GL database tables is strictly prohibited (`BECC_DIRECT_GL_DATABASE_ACCESS: NO`).
* Raw `TransactionContext` objects are never exposed to BECC (`BECC_DIRECT_TRANSACTION_CONTEXT_ACCESS: NO`).
* Consistency model between BECC local ledger and GL is `EVENTUAL_IDEMPOTENT`.

### 4.3 Governed Learning Capability Gap Analysis

| Gap ID | Description | Classification | Impact on BECC Roadmap |
| :--- | :--- | :--- | :--- |
| **`GL_CAPABILITY_GAP_001`** | `BuildGuidanceSetQuery` handler in GL is currently deferred in `handlers.ts` (`RuntimeInvariantError`). | `GL_PUBLIC_API_GAP` | Requires GL guidance query handler implementation or dedicated query contract for `BECC-V2-IMPL-013`. `PUBLIC_GL_API_CHANGE_REQUIRED_FOR_IMPL_013: YES`. |
| **`GL_CAPABILITY_GAP_002`** | No explicit `BindRulePolicyCommand` or global policy binding engine in GL. | `OUT_OF_SCOPE_GOVERNANCE_CAPABILITY` | BECC treats prospective adoption as project context binding (`ADOPTED`), not binding policy. |
| **`GL_CAPABILITY_GAP_003`** | BECC finding cannot create an approved lesson in one command. | `BECC_ADAPTER_MAPPING_ONLY` | Escalation adapter in `BECC-V2-IMPL-014` dispatches multi-step observation pipeline (`DraftObservation` → `AttachEvidence` → `SubmitObservation`). |

---

## 5. Fail-Closed & Safety Taxonomy

| Failure Scenario | Fail Closed? | Pipeline Outcome | Runtime Category |
| :--- | :---: | :--- | :--- |
| Governed Learning Runtime Unavailable | YES | Pipeline Halts | `ERROR` |
| Evidence Repository Read Error | YES | Validation Refused | `ERROR` |
| Invalid / Foreign Authority Context | YES | Command Rejected | `REFUSED` |
| Stale / Unsupported Contract Version | YES | Execution Blocked | `ERROR` |
| Missing Provenance Metadata | YES | Findings Unverified | `INSUFFICIENT_EVIDENCE` |
| Rule Candidate Not Bound to Policy | YES | Informational Only | `NOT_APPLICABLE` |

---

## 6. Remediated Implementation Roadmap

To complete BECC v2 implementation safely, the work is structured into contract-first implementation units:

1. **`BECC-V2-IMPL-012`: Governed Learning Contract Verification & Integration Adapter**
   * Implement `becc-runtime/governed-learning/` adapter wrapping `packages/governed-learning`.
   * Verify canonical GL command envelope generation (`DraftObservation`, `AttachEvidence`, `SubmitObservation`).
   * `PUBLIC_GL_API_CHANGE_REQUIRED_FOR_IMPL_012: NO`.
2. **`BECC-V2-IMPL-013`: Knowledge Resolver & Governed Guidance Query Integration**
   * Prerequisite: Implement/expose GL `BuildGuidanceSetQuery` handler or guidance query contract.
   * Integrate BECC Knowledge Resolver to query guidance.
   * `PUBLIC_GL_API_CHANGE_REQUIRED_FOR_IMPL_013: YES`.
3. **`BECC-V2-IMPL-014`: Finding → Observation / Learning Escalation Pipeline**
   * Implement finding escalation pipeline executing multi-step GL observation workflow.
4. **`BECC-V2-IMPL-015`: Publication & Portfolio Readiness Evaluation Service**
   * Build readiness evaluator connecting BECC evidence to `docs/portfolio-readiness-rule.md` and M5 / PRAG reporting.
   * Status: `IMPLEMENTED (PR Pending Review)`.
5. **`BECC-V2-IMPL-016`: Audit Ledger & Provenance Integration**
   * Connect BECC validation reports and diff approval tokens to GL provenance records.
6. **`BECC-V2-IMPL-017`: End-to-End System Integration & Certification Suite**
   * Build complete integration test suite validating BECC v2 ↔ Governed Learning Level-2B Postgres flow.

---

## 7. Recommended Next Owner Decision

The Architecture Review Board and Lead Architect should review and approve PR #311 with this remediated architecture evidence alignment. Do not merge PR #311 until independent review approves these bounded contracts.
