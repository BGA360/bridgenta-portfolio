# Dependency Architecture — Component Dependency & Isolation Rules

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Dependency Architecture |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B3 |
| **Next Authorized Sprint** | Sprint B4 — Platform Implementation Strategy & Technical Architecture |
| **Dependency Scope** | Layer Isolation Rules, Dependency Inversion & DAG Enforcement |

---

## 1. Overview & Dependency Inversion Principle

The **Dependency Architecture** defines the rules governing interactions and dependencies between CEP runtime components.

To preserve technology independence, framework isolation, and multi-decade maintainability, CEP strictly enforces the **Dependency Inversion Principle**: High-level governance and orchestration components must never depend on low-level technical adapters or external service providers. Dependencies point strictly inward toward abstract contracts.

---

## 2. Layer Isolation & Dependency Direction

```
+-----------------------------------------------------------------------+
| LAYER 4: CONSTITUTIONAL & GOVERNANCE LAYER                            |
| (GovernanceCoordinator, PolicyResolver, DecisionManager)              |
+-----------------------------------------------------------------------+
                                   ^
                                   | (Inward Dependency Vector)
+-----------------------------------------------------------------------+
| LAYER 3: PLATFORM ORCHESTRATION LAYER                                 |
| (AssessmentOrchestrator, CertificationEngine, AuditLogger)            |
+-----------------------------------------------------------------------+
                                   ^
                                   | (Inward Dependency Vector)
+-----------------------------------------------------------------------+
| LAYER 2: EVALUATION & EVIDENCE ENGINE LAYER                           |
| (RuleEvaluationEngine, EvidenceManager)                               |
+-----------------------------------------------------------------------+
                                   ^
                                   | (Inward Dependency Vector)
+-----------------------------------------------------------------------+
| LAYER 1: ADAPTER & GATEWAY LAYER                                      |
| (RepositoryGateway, ProviderGateway)                                  |
+-----------------------------------------------------------------------+
```

---

## 3. Allowed vs Forbidden Dependencies

### 3.1 Allowed Dependencies
- Layer 3 (`AssessmentOrchestrator`) $\rightarrow$ Layer 4 (`PolicyResolver`, `GovernanceCoordinator`).
- Layer 3 (`AssessmentOrchestrator`) $\rightarrow$ Layer 2 (`RuleEvaluationEngine`, `EvidenceManager`).
- Layer 2 (`EvidenceManager`) $\rightarrow$ Layer 1 Abstract Contracts (`CTR-008` Repository Contract).
- Layer 2 (`RuleEvaluationEngine`) $\rightarrow$ Layer 1 Abstract Contracts (`CTR-009` Provider Contract).

### 3.2 Forbidden Dependencies
- **Forbidden 1: Outward Layer Dependency**: Layer 4 Governance components must NEVER depend on Layer 1 Gateways or external Adapters.
- **Forbidden 2: Circular Component Dependency**: Component A depending on Component B, which directly or indirectly depends on Component A, is constitutionally forbidden.
- **Forbidden 3: Vendor / Technology Leak**: Core platform components must NEVER depend on vendor-specific SDKs, database drivers, or web framework packages.
- **Forbidden 4: Direct Gateway Bypass**: Orchestrators must NEVER bypass abstract contracts (`CTR-008`/`CTR-009`) to interact directly with raw SCM APIs or LLM vendor SDKs.

---

## 4. Isolation Architecture Specifications

### 4.1 Framework Isolation
- **Rule**: Secondary domain frameworks (RKF, BGCF, BECC, BPGA) are isolated within Layer 4.
- **Enforcement**: Frameworks communicate exclusively through CEF kernel meta-rules and standardized evidence schemas. A BGCF rule cannot directly invoke a BECC evaluation routine.

### 4.2 Repository Abstraction Isolation
- **Rule**: Core evaluation engines operate on abstract repository models (`RepositoryInspectionResponseModel`).
- **Enforcement**: All repository I/O passes through `RepositoryGateway` (`CTR-008`). Switching Git hosting providers or using local file systems requires zero refactoring of core evaluation engines.

### 4.3 Provider Abstraction Isolation
- **Rule**: Core evaluation engines request processing through provider-neutral contracts (`ProviderProcessingRequestModel`).
- **Enforcement**: All AI/LLM integrations pass through `ProviderGateway` (`CTR-009`). Replacing an AI model vendor requires zero refactoring of core governance logic.

---

## 5. Summary Dependency Verification Matrix

| Component | Allowed Dependencies | Forbidden Dependencies | Primary Isolation Boundary |
| :--- | :--- | :--- | :--- |
| `GovernanceCoordinator` | `TraceabilityManager`, CEF Kernel Specs | All Layer 1 Gateways & Adapters | Meta-Framework Kernel Isolation |
| `PolicyResolver` | `GovernanceCoordinator` | Database drivers, Web frameworks | Governance Policy Isolation |
| `AssessmentOrchestrator` | `PolicyResolver`, `RuleEvaluationEngine` | Vendor Git SDKs, Raw LLM APIs | Orchestration Boundary |
| `RuleEvaluationEngine` | `EvidenceManager`, `CTR-003` Contract | State persistence engines | Deterministic Evaluation |
| `RepositoryGateway` | `CTR-008` Abstract Contract | Layer 3/4 Orchestrators | SCM Vendor Abstraction |
| `ProviderGateway` | `CTR-009` Abstract Contract | Layer 3/4 Orchestrators | AI Vendor Abstraction |
