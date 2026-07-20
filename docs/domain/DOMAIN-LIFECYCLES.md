# Domain Lifecycles — State Models & Transition Rules

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Domain Lifecycles |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B1 |
| **Next Authorized Sprint** | Sprint B2 — Platform Contracts & Interface Specifications |
| **Lifecycle Scope** | Entity State Machine Models & Transition Constraints |

---

## 1. Overview & State Machine Rigor

To prevent illegal state jumps or unhandled edge cases, major domain entities in the **Constitutional Engineering Platform (CEP)** operate under formal state machines. 

An entity state transition can only occur when explicit entry and exit conditions are satisfied. Jumping across lifecycle states or modifying entities in terminal states is constitutionally forbidden.

---

## 2. Major Domain Entity Lifecycles

### 2.1 Assessment Lifecycle

```
[REQUESTED] -> [COLLECTING_EVIDENCE] -> [UNDER_REVIEW] -> [COMPLETED]
                                                                |
                                             +------------------+------------------+
                                             |                                     |
                                             v                                     v
                                       [CERTIFIED]                             [FAILED]
                                             |                                     |
                                             v                                     v
                                       [ARCHIVED]                             [REMEDIATING]
```

- **REQUESTED**: Assessment Request validated and queued.
- **COLLECTING_EVIDENCE**: Evidence collectors gathering repository and static analysis artifacts.
- **UNDER_REVIEW**: Assessment engine evaluating collected evidence against rules.
- **COMPLETED**: Rule evaluation finished; Assessment Result generated.
- **CERTIFIED**: Result satisfies 100% of pass criteria; Certification issued.
- **FAILED**: Result contains blocking findings; remediation required.
- **REMEDIATING**: Target project team actively fixing non-compliant findings.
- **ARCHIVED**: Assessment record permanently stored in historical ledger.

### 2.2 Certification Lifecycle

```
[PENDING] -> [ISSUED] -> [RENEWED]
                 |
                 v
     [REMEDIATION_REQUIRED] -> [REVOKED]
```

- **PENDING**: Assessment passed; certificate generation queued.
- **ISSUED**: Certificate signed, registered in audit ledger, and active.
- **RENEWED**: Periodic assessment passed; expiration date extended.
- **REMEDIATION_REQUIRED**: Subsequent assessment detected rule violations; grace period active.
- **REVOKED**: Grace period expired without remediation; certificate invalidated.

### 2.3 Evidence Lifecycle

```
[CAPTURED] -> [VERIFIED] -> [BUNDLED] -> [STORED] -> [PURGED]
```

- **CAPTURED**: Raw evidence artifact extracted from repository or tool.
- **VERIFIED**: Content hash generated and cryptographic signature verified.
- **BUNDLED**: Sealed inside an Evidence Bundle for assessment ingestion.
- **STORED**: Persisted in persistent evidence repository linked to Assessment Result.
- **PURGED**: Expired per retention policy (metadata and hash retained permanently).

### 2.4 Decision Lifecycle

```
[PROPOSED] -> [EVALUATED] -> [APPROVED] / [REJECTED] -> [ENFORCED] -> [SUPERSEDED]
```

- **PROPOSED**: Draft CDR submitted with problem context.
- **EVALUATED**: Evidence package and Constitutional Impact Assessment executed.
- **APPROVED / REJECTED**: Primary Domain Owner renders formal decision.
- **ENFORCED**: Decision work packages scheduled and implemented.
- **SUPERSEDED**: Replaced by a newer approved CDR.

### 2.5 Platform Component Lifecycle

```
[SPECIFIED] -> [VALIDATED] -> [ACTIVE] -> [DEPRECATED] -> [RETIRED]
```

- **SPECIFIED**: 10-part component specification authored and approved.
- **VALIDATED**: Component implementation passes Gate 3 Implementation Gate.
- **ACTIVE**: Deployed in production platform orchestration pipeline.
- **DEPRECATED**: Marked for replacement; grace period active.
- **RETIRED**: Decommissioned from platform pipeline.

---

## 3. Transition Rules & Invariants

| Entity | Current State | Target State | Mandatory Transition Condition |
| :--- | :--- | :--- | :--- |
| **Assessment** | `COLLECTING_EVIDENCE` | `UNDER_REVIEW` | Evidence Bundle sealed with 100% required artifacts. |
| **Assessment** | `UNDER_REVIEW` | `CERTIFIED` | Zero blocking findings; Gate 4 Certification passed. |
| **Certification** | `ISSUED` | `REMEDIATION_REQUIRED`| Subsequent assessment yields `FAIL` finding on active rule. |
| **Certification** | `REMEDIATION_REQUIRED`| `REVOKED` | Grace period (60 days) expires without passing re-assessment. |
| **Evidence** | `CAPTURED` | `VERIFIED` | SHA-256 hash successfully computed and verified against source. |
| **Decision** | `PROPOSED` | `APPROVED` | 100% reviewers sign off + zero-violation assessment report. |
| **Component** | `SPECIFIED` | `ACTIVE` | Gate 1 (Arch) and Gate 3 (Impl) clearances verified. |
