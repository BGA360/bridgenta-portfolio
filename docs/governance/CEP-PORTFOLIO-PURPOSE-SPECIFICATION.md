# CEP — Portfolio Purpose Specification (PPS) Standard

---

| Policy Metadata | Specification |
| :--- | :--- |
| **Document ID** | `POL-PPS-001` |
| **Effective Date** | `2026-07-22` |
| **Governing Authority** | Constitutional Engineering Steering Board |
| **Target Platform** | Constitutional Engineering Platform (CEP) |
| **Status** | **PROPOSED CONSTITUTIONAL STANDARD** |

---

## 1. Overview & Constitutional Necessity

The **Portfolio Purpose Specification (PPS)** is a core constitutional component of the Constitutional Engineering Platform (CEP). It defines the baseline of intent, scope, and expected evidence for a target project before publication governance or portfolio readiness assessments can begin.

### Constitutional Problem Statement:
Without a formal declaration of purpose, the assessment of a project's **Portfolio Readiness** (under the PRR) is subjective and arbitrary. A prototype is evaluated against product standards, and a frontend project is penalized for lacking backend database evidence.

### Solution:
The PPS establishes an objective, baseline contract declaring:
- Why the project exists.
- Which engineering competencies it demonstrates.
- Which competencies are intentionally out of scope.
- What evidence must be verified to support these claims.

---

## 2. Architectural Placement & Dependency Graph

The PPS sits within the **Constitutional Plane** as a prerequisite metadata document located in the target project's repository root (as `.cep/purpose-spec.json` or `.cep/purpose-spec.md`).

```
    +-----------------------------------------------+
    |    Portfolio Purpose Specification (PPS)      | (Project Intent Contract)
    +-----------------------------------------------+
                           │
                           ▼
    +-----------------------------------------------+
    |   BGCF (Construction) / BECC (Communication)  | (Verifies specs against code/docs)
    +-----------------------------------------------+
                           │
                           ▼
    +-----------------------------------------------+
    |      BPGA Portfolio Readiness Gate (PRR)      | (Validates readiness against intent)
    +-----------------------------------------------+
```

---

## 3. Required Constitutional Elements

Every Portfolio Purpose Specification must contain the following eight mandatory sections:

### 3.1 Project Identity & Target Governance
- `project_id`: Unique string identifier.
- `version`: Semantic version.
- `target_governance_level`: Integer from 0 (Experiment) to 5 (Critical Infrastructure).

### 3.2 Constitutional Purpose
- A high-level description of why the project exists, its target audience, and the professional value it demonstrates.

### 3.3 Standardized Capability Mapping
A list of declared competency tags selected from the CEF Registry:
- `PRODUCT_ENGINEERING`
- `FRONTEND_ENGINEERING`
- `BACKEND_ENGINEERING`
- `AI_ENGINEERING`
- `SECURITY_ENGINEERING`
- `UX_DESIGN`
- `ACCESSIBILITY_A11Y`
- `EXPLAINABILITY_COMM`
- `DEVOPS_CI`
- `SYSTEMS_ARCHITECTURE`

### 3.4 Expected Evidence Matrix
A mapping of declared capabilities to the exact evidence files or validation logs required to clear the pipeline.
- *Example*: `ACCESSIBILITY_A11Y` must map to `evidence/lighthouse-a11y-score.json` with a score $\ge 90$.

### 3.5 Declared Exclusions
Explicitly defines what is out of scope to prevent false-negative validation failures.
- *Example*: A frontend portfolio codebase declares `BACKEND_ENGINEERING` as an exclusion, bypassing database layout checks.

### 3.6 Public/Private Information Boundaries (PICS)
Declares the classification of repository assets (P0 to P4 classification in alignment with `docs/publication-governance.md`).

### 3.7 Success & Readiness Criteria
Objective, pass/fail metrics that must be satisfied for publication clearance.

### 3.8 Change Control & Stewardship
Amendment history and steering board approvals for the project's purpose.

---

## 4. Assessment & Validation Workflow

During pipeline orchestration:
1. **Scope Parsing**: The orchestrator reads `.cep/purpose-spec.json` at the start of the execution run.
2. **Dynamic Rule Mapping**: The orchestrator maps the declared capability tags to the active rule sets in `@cep/rule-engine`.
3. **Exclusion Bypassing**: Any rules associated with excluded capabilities are bypassed.
4. **Readiness Evaluation**: The orchestrator evaluates evidence against the success criteria defined in the PPS.
5. **Certificate Issuance**: If the verifier passes all rules, the BPGA issues a signed Portfolio Readiness Certificate. If not, the project's route deactivation and sitemap exclusion remain active.

---

## 5. Constitutional Risks & Mitigations

### 5.1 Risk: Scope Sandbagging
- *Description*: Project owners might intentionally declare narrow scopes (e.g. only frontend) to avoid rigorous checks on poor code quality in other areas.
- *Mitigation*: The BGCF Construction Validator must run a repository code-type analyzer. If code types matching excluded capabilities are detected in active directories, validation must fail with a `ContractViolation` error.

### 5.2 Risk: Stale Intent Contracts
- *Description*: Codebases evolve, but the PPS document remains static, leading to false passes.
- *Mitigation*: The PPS must be cryptographically hashed and linked to the release manifest. Any code changes impacting directories outside the PPS scope manifest will fail Gates 3 and 4.
