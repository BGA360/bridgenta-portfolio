# Implementation Standards — Mandatory Engineering & Code Standards

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Implementation Standards |
| **Project Status** | Platform Engineering (**CONCLUDED**) |
| **Lifecycle Stage** | Stage B — Platform Engineering (**CONCLUDED**) |
| **Sprint Reference** | Sprint B4 |
| **Next Authorized Stage** | Stage C — Platform Implementation / Sprint C1 — Assessment Core Foundation |
| **Standards Scope** | Mandatory Naming Conventions, Code Layout, Traceability & Review Standards |

---

## 1. Overview & Compliance Mandate

This document establishes the **Mandatory Implementation Standards** for all source code, module specifications, and technical assets written for the **Constitutional Engineering Platform (CEP)** starting in Stage C.

Every pull request, module creation, and code commit must comply 100% with these standards. Non-compliant code will automatically fail **Gate 3 Implementation Gate** checks and will be rejected during architectural code review.

---

## 2. Naming Conventions

To enforce the **Ubiquitous Language**, naming across all codebases must be consistent:

| Asset Type | Naming Rule | Example | Prohibited Formats |
| :--- | :--- | :--- | :--- |
| **Package / Module** | Kebab-case, prefixed with `@cep/` | `@cep/assessment-core` | `@cep/assessment_core`, `@cep/AssessmentCore` |
| **Source Directory** | Lowercase kebab-case | `src/evidence-manager/` | `src/EvidenceManager/`, `src/evidence_manager/` |
| **Class / Component** | PascalCase, matching Component Catalog | `AssessmentOrchestrator` | `assessmentOrchestrator`, `Assessment_Orchestrator` |
| **Interface / Contract**| PascalCase, matching Contract Catalog | `AssessmentContract` | `IAssessmentContract`, `assessment_contract` |
| **Function / Method** | CamelCase, clear action verb | `evaluateRule()` | `eval_rule()`, `DoEvaluation()` |
| **Constants / Enums** | UPPER_SNAKE_CASE | `GOVERNANCE_LEVEL_MAX` | `maxGovernanceLevel`, `MAX-LEVEL` |
| **Test Files** | Matching source file with `.test.ts` | `assessment-orchestrator.test.ts` | `test-assessment.ts`, `spec.ts` |

---

## 3. Directory & File Organization

Every component module must follow a uniform physical file layout:

```
@cep/[module-name]/
├── README.md                           # Module overview & constitutional traceability
├── package.json                        # Package manifest & strict peer dependencies
├── tsconfig.json                       # TypeScript configuration
├── src/                                # Source directory
│   ├── index.ts                        # Public barrel export (Interfaces & Factory only)
│   ├── contracts/                      # Local contract model implementations
│   ├── services/                       # Internal component logic (not exported)
│   └── errors/                         # Conceptual error classes (matching ERR-XXX)
└── tests/                              # Unit, integration & contract tests
    ├── unit/                           # Pure unit tests
    ├── integration/                    # Inter-module integration tests
    └── contracts/                      # Contract compliance tests
```

---

## 4. Documentation & JSDoc Requirements

1. **Constitutional Header Requirement**: Every source file must begin with a mandatory JSDoc header referencing its Stage A source and Stage B contract:
   ```typescript
   /**
    * @file assessment-orchestrator.ts
    * @module @cep/assessment-core
    * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
    * @contract CTR-001 (Assessment Contract)
    * @domainConcept Assessment, Assessment Result
    */
   ```
2. **100% Public API JSDoc**: All exported classes, interfaces, methods, and error types must include comprehensive JSDoc comments detailing purpose, parameters, return values, and thrown error codes.

---

## 5. Constitutional Traceability Rules

Every pull request introducing new code must include a **Traceability Annotation** in the PR description:
- **Constitutional Source**: `docs/...`
- **Domain Concept**: Concept name from `docs/domain/DOMAIN-MODEL.md`
- **Governed Contract**: `CTR-XXX` from `docs/contracts/CONTRACT-CATALOG.md`
- **Runtime Component**: Component name from `docs/runtime/COMPONENT-CATALOG.md`

PRs lacking complete traceability annotations will be blocked by automated validation gates.

---

## 6. Code Review Expectations

All PRs must satisfy five review criteria prior to approval:
1. **Zero Lint & Build Warnings**: `npm run build` and `npm run lint` execute cleanly with exit code `0`.
2. **100% Test Coverage**: Unit test coverage for core business logic must meet or exceed 95%.
3. **No Forbidden Dependencies**: Verified free of circular imports or direct Layer 1 adapter couplings.
4. **Ubiquitous Language Audit**: Verified zero use of prohibited synonyms (e.g., calling an *Assessment* an "Audit Scan").
5. **Two Review Sign-Offs**: Requires approval from at least one Domain Owner and one Senior Platform Engineer.
