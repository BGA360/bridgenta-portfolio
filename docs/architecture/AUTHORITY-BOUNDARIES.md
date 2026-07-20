# Authority Boundaries — Constitutional Responsibility Matrix

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Constitutional Architecture |
| **Project Status** | Constitution Engineering |
| **Lifecycle Stage** | Stage A — Constitution Engineering |
| **Sprint Reference** | Sprint A2 |
| **Next Authorized Sprint** | Sprint A3 — Constitutional Decision Architecture |
| **Governance Requirement** | Single Primary Ownership Matrix & Overlap Resolution |

---

## 1. Overview & Single-Ownership Mandate

A core principle of the **Constitutional Engineering Platform (CEP)** is **Explicit Authority Boundaries**. 

To prevent governance deadlocks and authority drift, **every constitutional responsibility within CEP must have exactly ONE primary owner**. While multiple frameworks or subsystems may intersect during evaluation, unresolved authority overlap is constitutionally prohibited.

---

## 2. Constitutional Responsibility Matrix

The matrix below maps every key platform and framework responsibility to its single primary owner, defining secondary contributors and non-overlapping boundary conditions:

| Constitutional Responsibility | Primary Owner | Secondary Contributors | Authority Boundary & Non-Overlapping Boundary |
| :--- | :---: | :--- | :--- |
| **Meta-Rule Definition** | **CEF** | None | CEF alone sets evaluation semantics and precedence rules. |
| **Evidence Schema Specification** | **CEF** | CEP Platform | CEF defines JSON/YAML evidence schemas; CEP enforces compliance. |
| **Reference Concept Grounding** | **RKF** | CEF | RKF owns architectural term definitions and knowledge taxonomies. |
| **Repository File Structure** | **BGCF** | BECC | BGCF owns physical directory layouts and component blueprints. |
| **Documentation & PR Standards** | **BECC** | BGCF | BECC owns technical readability, PR descriptions, and explainability. |
| **Public Release Clearance** | **BPGA** | BECC, BGCF | BPGA alone grants publication readiness certificates for releases. |
| **Lifecycle Event Interception** | **CEP Platform**| Target CI/CD | CEP Platform orchestrates event hooks without defining rule logic. |
| **Evidence Collection Execution**| **CEP Platform**| Static Analyzers | CEP gathers file/log artifacts; external tools generate raw data. |
| **Assessment Finding Generation**| **CEP Platform**| CEF Engine | CEP executes deterministic rule evaluation defined by CEF. |
| **Certificate Ledger Storage** | **CEP Platform**| BPGA, BECC | CEP persists cryptographic ledger records of issued certificates. |

---

## 3. Resolution of Intersecting Responsibilities

Four critical domain intersections exist where responsibilities touch. The explicit boundary rules governing these intersections are defined below:

### 3.1 Intersection 1: Repository Blueprints (BGCF) vs Documentation Layout (BECC)
- **Intersection**: Both frameworks mandate specific file creation (e.g., `docs/` layout vs `src/` layout).
- **Primary Authority**: **BGCF** owns physical file location and directory creation rules. **BECC** owns the internal content structure, readability criteria, and markdown formatting within `docs/`.
- **Boundary Contract**: BECC cannot mandate moving `docs/` to another folder; BGCF cannot dictate markdown section prose style.

### 3.2 Intersection 2: Public Release Clearance (BPGA) vs Communication Certification (BECC)
- **Intersection**: Both frameworks evaluate release readiness.
- **Primary Authority**: **BPGA** holds sole authority for issuing the final Public Release Clearance. **BECC** acts as an upstream evidence provider, issuing a Communication Certificate which BPGA requires as a prerequisite.
- **Boundary Contract**: BPGA cannot evaluate documentation quality directly; BECC cannot authorize public deployment tags.

### 3.3 Intersection 3: Evidence Gathering (CEP Platform) vs Evidence Schema (CEF)
- **Intersection**: Collecting and validating evidence artifacts.
- **Primary Authority**: **CEF** owns the evidence schema specification. **CEP Platform** owns the physical I/O pipelines that collect artifacts from file systems and APIs.
- **Boundary Contract**: CEP Platform cannot alter evidence schema fields; CEF cannot write disk I/O code.

### 3.4 Intersection 4: Assessment Execution (CEP Platform) vs Assessment Rules (CEF/BGCF/BECC)
- **Intersection**: Executing checks against project source code.
- **Primary Authority**: Domain Frameworks (**CEF/BGCF/BECC**) own declarative rule definitions. **CEP Platform** owns the execution runtime that evaluates evidence against those rules.
- **Boundary Contract**: CEP Platform cannot invent or modify evaluation thresholds; domain frameworks cannot execute runtime process loops.

---

## 4. Summary Authority Boundary Verification

```
+-------------------------------------------------------------------+
|               CEF: Meta-Rules & Evidence Schemas                  |
+-------------------------------------------------------------------+
      |                            |                            |
      v                            v                            v
+-------------------+    +-------------------+    +-------------------+
| BGCF: Repository  |    | BECC: Technical   |    | BPGA: Public      |
| Directory Layout  |    | Documentation & PR|    | Release Clearance |
+-------------------+    +-------------------+    +-------------------+
      |                            |                            |
      +----------------------------+----------------------------+
                                   | (Provides Rules To)
                                   v
+-------------------------------------------------------------------+
|            CEP PLATFORM: Execution, Pipelines & Ledger           |
+-------------------------------------------------------------------+
```

> [!IMPORTANT]
> Any unassigned or ambiguous authority identified during future platform design MUST be resolved by updating this document prior to subsystem engineering.
