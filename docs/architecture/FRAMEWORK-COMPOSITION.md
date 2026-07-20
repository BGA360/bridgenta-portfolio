# Framework Composition — Assembly, Interaction & Conflict Resolution

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Constitutional Architecture |
| **Project Status** | Constitution Engineering |
| **Lifecycle Stage** | Stage A — Constitution Engineering |
| **Sprint Reference** | Sprint A2 |
| **Next Authorized Sprint** | Sprint A3 — Constitutional Decision Architecture |
| **Composition Mandate** | Multi-Framework Assembly, Dependency & Precedence Rules |

---

## 1. Overview & Purpose of Composition

The **Constitutional Engineering Platform (CEP)** is designed to host and orchestrate multiple independent constitutional frameworks—specifically **CEF**, **RKF**, **BGCF**, **BECC**, and **BPGA**.

Framework Composition defines how these distinct constitutional domains are assembled into a unified, non-conflicting project governance model without diluting their individual domain authority.

---

## 2. Composition Rules

To ensure predictable framework integration, CEP enforces four composition rules:

### 2.1 Rule 1: Non-Destructive Aggregation
Frameworks are composed by aggregating their respective rule trees into a unified assessment model. Composing a framework must never modify, mutate, or suppress the source definitions of any participating framework.

### 2.2 Rule 2: Layer Elevation
Framework rules are evaluated according to their hierarchical layer position. Meta-rules defined at higher layers (e.g., CEF Kernel) automatically apply to all lower-layer domain frameworks.

### 2.3 Rule 3: Explicit Namespace Isolation
Rules, findings, and evidence schemas belonging to specific frameworks must be strictly scoped to their framework namespace (e.g., `cef:meta:evidence-schema`, `becc:comm:readability-index`, `bgcf:struct:dir-layout`). Cross-framework namespace pollution is forbidden.

### 2.4 Rule 4: Atomic Inclusion
A target project may adopt one or more domain frameworks progressively, but adoption of any single framework must be atomic. Selective cherry-picking of partial rules within a framework is prohibited unless explicitly designed as optional sub-modules by that framework.

---

## 3. Dependency Rules & Acyclic Graph

Framework dependencies must form a strict **Directed Acyclic Graph (DAG)**. Circular framework dependencies are constitutionally forbidden.

```
                  +-----------------------------------+
                  |  CEF (Meta-Constitutional Kernel) |
                  +-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
    +---------------+       +---------------+       +---------------+
    |  RKF (Knowledge|       | BGCF (Construct|       | BECC (Comm    |
    |  Framework)   |       |  Framework)   |       |  Framework)   |
    +---------------+       +---------------+       +---------------+
            \                       |                       /
             \                      v                      /
              +------------> +---------------+ <----------+
                             | BPGA (Publish |
                             |  Framework)   |
                             +---------------+
```

### Dependency Rules:
1. **CEF** has zero dependencies and sits at the root.
2. **RKF**, **BGCF**, and **BECC** depend on **CEF**.
3. **BPGA** depends on **CEF**, **BGCF**, and **BECC** (requiring valid construction and documentation before publication approval).

---

## 4. Framework Interaction Rules

Frameworks interact exclusively through **Standardized Evidence Contracts**. Direct runtime invocation or state mutation between framework specifications is prohibited.

1. **Evidence-Based Coupling**: Framework A consumes findings or evidence artifacts produced by Framework B only if those artifacts conform to CEF-standardized evidence schemas.
2. **Read-Only Inspection**: A framework may inspect another framework's certified output status (e.g., BPGA checking if BECC has issued a Communication Certificate) without inspecting internal framework evaluation state.

---

## 5. Conflict Resolution Path

When rule overlap occurs between frameworks, CEP applies a deterministic **Four-Step Conflict Resolution Path**:

```
+-----------------------------------------------------------------------+
| STEP 1: Check Hierarchy Primacy                                        |
| -> CEF Kernel overrides all secondary domain frameworks.             |
+-----------------------------------------------------------------------+
                                   | (If same layer)
                                   v
+-----------------------------------------------------------------------+
| STEP 2: Check Domain Ownership Boundary                                |
| -> The framework with primary domain authority owns the decision.      |
|    (e.g., BECC owns communication conflicts; BGCF owns structure).     |
+-----------------------------------------------------------------------+
                                   | (If domain ambiguous)
                                   v
+-----------------------------------------------------------------------+
| STEP 3: Apply Most Restrictive Rule (Deny-by-Default)                |
| -> Select the rule option that enforces higher strictness / safety.    |
+-----------------------------------------------------------------------+
                                   | (If strictness identical)
                                   v
+-----------------------------------------------------------------------+
| STEP 4: Escalate to Human Governance Review                          |
| -> Halt automated pipeline and require explicit constitutional review.|
+-----------------------------------------------------------------------+
```

---

## 6. Ownership Boundaries

| Framework | Domain Ownership Boundary | Excluded Authority |
| :--- | :--- | :--- |
| **CEF** | Meta-rules, evidence schemas, certification status models | Domain construction patterns, UI text |
| **RKF** | Conceptual taxonomies, reference knowledge models | Pipeline orchestration, file structure |
| **BGCF** | Repository file layout, code modularity, build blueprints | Communication style, public releases |
| **BECC** | Technical documentation, PR templates, explainability | Directory blueprints, release tags |
| **BPGA** | Release readiness clearings, publication standards | Internal code structure, test runners |
