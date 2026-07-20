# State Management — Transient, Persistent & Immutable State Architecture

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — State Management |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B3 |
| **Next Authorized Sprint** | Sprint B4 — Platform Implementation Strategy & Technical Architecture |
| **State Scope** | Technology-Independent State Management Architecture & Ownership |

---

## 1. Overview & State Architecture Philosophy

The **State Management Architecture** specifies how state is categorized, scoped, transitioned, and persisted across the **Constitutional Engineering Platform (CEP)**.

In strict adherence to technology independence, **this document specifies zero database technologies (SQL, NoSQL, Key-Value stores), caching layers, or file system formats**. It defines three conceptual state categories, state ownership boundaries, transition rules, and immutability constraints.

---

## 2. Three Conceptual State Categories

```
+-----------------------------------------------------------------------+
| CATEGORY 1: TRANSIENT STATE                                           |
| - In-memory pipeline execution state, active rule evaluation contexts |
| - Lifetime: Duration of a single assessment run / request execution   |
| - Ownership: AssessmentOrchestrator & RuleEvaluationEngine           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| CATEGORY 2: PERSISTENT STATE                                          |
| - Registered project profiles, active policies, component health,     |
|   cached evidence locators, active certificate metadata               |
| - Lifetime: Retained across platform executions until superseded      |
| - Ownership: Domain Bounded Contexts                                  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| CATEGORY 3: IMMUTABLE CONSTITUTIONAL RECORDS                          |
| - SHA-256 audit ledgers, issued certificates, approved CDRs,          |
|   sealed Evidence Bundles                                             |
| - Lifetime: Permanent, append-only, zero-mutation storage             |
| - Ownership: AuditLogger & CertificationEngine                        |
+-----------------------------------------------------------------------+
```

---

## 3. Detailed State Specifications & Ownership

### 3.1 Category 1: Transient State
- **Definition**: Short-lived, execution-scoped data structures created during an active workflow run.
- **Examples**: Active `RuleEvaluationRequestModel` payloads, intermediate finding aggregations, in-memory file content buffers.
- **State Ownership**: `AssessmentOrchestrator` and `RuleEvaluationEngine`.
- **Invariants**: Transient state is discarded immediately upon assessment run completion or failure. Transient state is never shared across independent project assessment runs.

### 3.2 Category 2: Persistent State
- **Definition**: Operational data retained across platform executions to support ongoing project governance, policy resolution, and component management.
- **Examples**: Target Project profiles, assigned Governance Levels (Level 0–5), active Policy profiles, component activation manifests.
- **State Ownership**: Respective Bounded Context owners (`PolicyResolver`, `RepositoryGateway`, `Platform Admin`).
- **Invariants**: Persistent state changes must execute through explicit lifecycle state transitions and emit state update events.

### 3.3 Category 3: Immutable Constitutional Records
- **Definition**: Cryptographically signed, append-only historical records validating constitutional compliance and governance decisions.
- **Examples**: Approved Constitutional Decision Records (CDRs), issued Certification tokens, cryptographic audit ledger chains (`audit-ledger.json`), sealed Evidence Bundles.
- **State Ownership**: `AuditLogger` and `CertificationEngine`.
- **Invariants**: **Zero-Mutation Rule**. Immutable records can never be updated, edited, or deleted. Any modification requires appending a new superseding entry to the ledger.

---

## 4. State Transition & Synchronization Rules

1. **State Transition Isolation**: State transitions must execute atomically. Partial or unverified state changes are rejected.
2. **Cryptographic Provenance**: State transitions advancing an entity to a `CERTIFIED` or `APPROVED` state must record a SHA-256 content hash in the immutable audit ledger.
3. **No Unowned State**: Every state variable or record must belong to exactly one primary runtime component owner.

---

## 5. Summary State Category Matrix

| State Category | Retention Lifetime | Primary Owner | Immutability Rule | Backup / Recovery Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Transient State** | Single Run Duration | `AssessmentOrchestrator` | Disposable / Non-persisted | Discarded on failure |
| **Persistent State** | Project Lifecycle | Bounded Context Owners | Mutable via Lifecycle Rules | Daily State Snapshot |
| **Immutable Records**| Permanent (Multi-Decade)| `AuditLogger` | **100% Immutable (Append-Only)**| Cryptographic Mirroring |
