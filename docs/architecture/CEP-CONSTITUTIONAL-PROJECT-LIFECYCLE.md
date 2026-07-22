# CEP — Constitutional Project Lifecycle (CPL) Specification

---

| Policy Metadata | Specification |
| :--- | :--- |
| **Document ID** | `SPEC-CPL-001` |
| **Effective Date** | `2026-07-22` |
| **Governing Authority** | Constitutional Engineering Steering Board |
| **Target Platform** | Constitutional Engineering Platform (CEP) |
| **Status** | **PROPOSED ARCHITECTURAL SPECIFICATION** |

---

## 1. Overview & Constitutional Necessity

The **Constitutional Project Lifecycle (CPL)** is the master architectural blueprint governing the progression of software projects within the Constitutional Engineering Platform (CEP) ecosystem.

### Constitutional Problem Statement:
Historically, BGCF (Construction), BECC (Communication), and BPGA (Publication) operated as isolated checkpoints. Without a unified lifecycle, projects faced the risk of out-of-order execution, duplicated validations, and overlapping authority boundaries.

### Solution:
The CPL unifies these components into a single, linear, acyclic sequence of state transitions and evidence gates, ensuring that no project can reach public visibility on `bridgenta.de` without passing through verified gates.

---

## 2. The 7 Constitutional Lifecycle States

Every project under CEP governance progresses through the following sequential states:

```
[ DRAFT ] ──► [ IN_DEVELOPMENT ] ──► [ BUILD_VERIFIED ] ──► [ TECHNICAL_READY ] ──► [ PORTFOLIO_READY ] ──► [ PUBLISHED ] ──► [ DEPRECATED ]
```

1. **`DRAFT`**: The **Portfolio Purpose Specification (PPS)** is being defined. Target governance level and capability scope are declared.
2. **`IN_DEVELOPMENT`**: Active code implementation. Evaluated against BGCF directory blueprints and construction rules.
3. **`BUILD_VERIFIED`**: Codebase compiles cleanly (`npm run build`) and passes all unit and integration test suites.
4. **`TECHNICAL_READY`**: The documentation and explainability assets are reviewed, and a **BECC Communication Certificate** is issued.
5. **`PORTFOLIO_READY`**: The **Portfolio Readiness Rule (PRR)** checks pass, verifying Visual Proof, Defensibility, and Limitation Disclosures.
6. **`PUBLISHED`**: The project is formally registered in the Certification Registry Ledger. Dynamic routing and sitemap generation are activated on `bridgenta.de`.
7. **`DEPRECATED`**: The project is retired. Routing is deactivated, sitemaps are purged, and the code repository is archived.

---

## 3. Evidence Gates & Transition Requirements

| Transition Gate | Source State | Target State | Governing Framework | Mandatory Evidence Artifacts | Pass Threshold |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gate 1: Architecture** | `DRAFT` | `IN_DEVELOPMENT` | CEF / Steering Board | `purpose-spec.json` (PPS) | 100% Schema & Scope Approval |
| **Gate 3: Construction** | `IN_DEVELOPMENT` | `BUILD_VERIFIED` | BGCF Domain | Build Logs & Test execution reports | 100% Pass rate, zero errors |
| **Gate 4: Communication**| `BUILD_VERIFIED` | `TECHNICAL_READY` | BECC Domain | README & PR template explainability docs | BECC Certificate Issued |
| **Gate 5: Readiness** | `TECHNICAL_READY` | `PORTFOLIO_READY` | BPGA Domain | Visual screenshot checksums, claims validation | Signed `gate-clearance-prr.json` |
| **Release Clearance** | `PORTFOLIO_READY` | `PUBLISHED` | CEP Platform | Signed clearances from Gates 1-5 | Registry Ledger Confirmation |

---

## 4. Domain Ownership & Authority Matrix

To prevent constitutional duplication, CPL strictly partitions domain authority:

- **BGCF (Construction)**: Holds exclusive authority over folder layouts, file extensions, compilation, and test suite execution. BGCF cannot evaluate documentation quality or public release flags.
- **BECC (Communication)**: Holds exclusive authority over text readability, README template mapping, and technical explainability. BECC cannot block build execution or authorize public deployment tags.
- **BPGA (Publication)**: Holds exclusive authority over PICS asset classification, screenshot checksum matching, public sitemap registration, and routing activation. BPGA depends on BGCF and BECC certificates as unbypassable prerequisites.
- **CEP Platform Core**: Coordinates the pipeline orchestration and logs cryptographic certs into the ledger.

---

## 5. Constitutional Scalability

The CPL dynamically adjusts its requirements based on the project's target governance level declared in the PPS:
- **Level 0 (Experiment)**: Progresses directly from `DRAFT` to `IN_DEVELOPMENT` and transitions to `DEPRECATED` upon completion, completely bypassing Gates 4 and 5 (remains unlisted).
- **Level 3 (Certified Product)**: Requires strict sequence verification through Gates 1, 3, 4, and 5 to reach the `PUBLISHED` state.
- **Level 5 (Critical)**: Requires zero-trust evidence ledger validation and formal proofs to reach `PUBLISHED`.
