# BECC v2 Re-Entry Architecture Reconciliation Report

* **Workstream ID:** `BRIDGENTA-BECC-V2-REENTRY-ARCHITECTURE-RECONCILIATION-01`
* **Date:** 2026-09-22
* **Baseline Governed Learning Commit:** `7ad7c2fda88b147ef67611177fd337008e10b597` (PR #310 PostgreSQL Level-2B)
* **Current Main SHA:** `c338fcabe54637733f6a8d03b300a79b9e1ef868`
* **Status:** COMPLETE (Architecture Audit & Reconciliation Phase)

---

## 1. Executive Summary

This report completes the formal re-entry architecture audit for the **BridGenta Engineering Communication Constitution (BECC) v2** platform following the completion of Governed Learning Hardening through Level 2B (`GL-HARDENING-001` to `GL-HARDENING-006`).

Governed Learning is now certified with Level-1 process-local integrity, Level-2A SQLite durable single-file transaction persistence, and Level-2B PostgreSQL production multi-instance durable transaction persistence (`READ COMMITTED` isolation, execution-scoped transaction ownership, post-BEGIN Stage 8 revalidation, `40P01` deadlock preservation, and atomic entity+event+command records).

This audit reconciles BECC v2's design specifications (`docs/engineering-communication/v2/` and `becc-runtime/`) with the hardened Governed Learning baseline (`packages/governed-learning`). It establishes clear bounded contexts, eliminates duplicate ownership, defines unidirectional dependency flows, specifies escalation/feedback mechanisms, and structures an ordered implementation roadmap.

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
| **v2 Knowledge Spec** | `docs/engineering-communication/v2/architecture/BECC-v2-...ARCHITECTURE.md` | Spec | Active | **UPDATE** | Align Knowledge Resolver to query GL public contract APIs for approved rules. |
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
* **Governed Learning Bounded Context:** Institutional observation capture, cross-project lesson candidate creation and evaluation, rule candidate proposal and policy binding, Stage 8 command idempotency, Stage 9 scope concurrency, durable event-sourced transaction persistence, and historical replay.

### 3.2 Key Conceptual Distinctions
1. **Claim vs Observation vs Finding:**
   * **Claim:** An assertion in technical documentation regarding compliance with constitutional standards.
   * **Observation:** A governed record of a domain event or system measurement captured during runtime execution.
   * **Finding:** A specific defect or weakness identified by BECC's Validation Engine or Assessment Domain.
2. **Invariant Chain:**
   $$\text{Observed} \neq \text{Learned} \neq \text{Approved} \neq \text{Binding Policy}$$
   * A BECC finding or runtime observation is NOT an approved lesson.
   * An approved lesson is NOT a binding policy rule.
   * Proposed rule candidates require explicit governance policy binding (`BindRulePolicyCommand`) before becoming enforceable constraints.

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

### 4.3 Model Context Protocol (MCP) Boundary
* MCP is NOT required for internal domain integration between BECC and Governed Learning (`MCP_REQUIRED_FOR_BECC_GL_CORE_INTEGRATION: NO`).
* MCP is suitable as an external tool exposure layer for client/LLM interaction in future workstreams (`MCP_APPROPRIATE_AS_EXTERNAL_EXPOSURE: LATER`).

---

## 5. Fail-Closed & Safety Taxonomy

| Failure Scenario | Fail Closed? | Result | Runtime Category |
| :--- | :---: | :--- | :--- |
| Governed Learning Runtime Unavailable | YES | Pipeline Halts, Assessment Flagged | `ERROR` |
| Evidence Repository Read Error | YES | Validation Refused | `ERROR` |
| Invalid / Foreign Authority Context | YES | Command Rejected | `REFUSED` |
| Stale / Unsupported Contract Version | YES | Execution Blocked | `ERROR` |
| Missing Provenance Metadata | YES | Findings Marked Unverified | `INSUFFICIENT_EVIDENCE` |
| Rule Candidate Not Bound to Policy | YES | Evaluated as Informational Only | `NOT_APPLICABLE` |

---

## 6. Proposed BECC v2 Implementation Roadmap

To complete BECC v2 implementation safely following this architectural reconciliation, the remaining work is structured into six sequential, independently reviewable work packages:

1. **`BECC-V2-IMPL-012`: Governed Learning Integration Adapter & Contracts**
   * Implement `becc-runtime/governed-learning/` adapter wrapping `packages/governed-learning`.
   * Define escalation DTO maps for findings to GL commands.
2. **`BECC-V2-IMPL-013`: Knowledge Resolver & Approved Lesson Query Integration**
   * Update Knowledge Resolver to query approved lessons and adopted rules from GL.
3. **`BECC-V2-IMPL-014`: Finding Escalation & Observation Pipeline**
   * Implement automated escalation of systemic BECC findings into GL `CreateLessonCandidate` flow.
4. **`BECC-V2-IMPL-015`: Publication & Portfolio Readiness Evaluation Service**
   * Build readiness evaluator connecting BECC evidence to `docs/portfolio-readiness-rule.md` and M5 / PRAG reporting.
5. **`BECC-V2-IMPL-016`: Audit Ledger & Provenance Integration**
   * Connect BECC validation reports and diff approval tokens to GL provenance records.
6. **`BECC-V2-IMPL-017`: End-to-End System Integration & Certification Suite**
   * Build complete integration test suite validating BECC v2 ↔ Governed Learning Level-2B Postgres flow.

---

## 7. Recommended Next Owner Decision

The Architecture Review Board and Lead Architect should authorize **`BECC-V2-IMPL-012`** as the next implementation work package upon approving this reconciliation report and the associated ADR (`BECC-V2-GOVERNED-LEARNING-INTEGRATION-ADR.md`).
