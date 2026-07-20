# `@cep/rule-engine` — Rule Evaluation Engine Foundation Module

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Package Name** | `@cep/rule-engine` |
| **Package Version** | `0.1.0` |
| **Package Type** | ES Module (`"type": "module"`) |
| **Project Status** | Platform Implementation |
| **Lifecycle Stage** | Stage C — Platform Implementation |
| **Sprint Reference** | Sprint C3 |
| **Next Authorized Sprint** | Sprint C4 — Policy Resolution Foundation |
| **Primary Component** | `RuleEvaluationEngine` (`docs/runtime/COMPONENT-CATALOG.md`) |
| **Governed Contract** | `CTR-003` (Rule Evaluation Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`) |
| **Constitutional Source** | `docs/architecture/CEF-ARCHITECTURAL-ROLE.md` |

---

## 1. Overview & Module Purpose

The `@cep/rule-engine` module implements the deterministic rule evaluation capability for the **Constitutional Engineering Platform (CEP)**.

In strict compliance with Sprint C3 boundaries, this module is responsible for:
1. Registering deterministic rule definitions matching `Rule` aggregate root specifications.
2. Evaluating registered rules against Evidence aggregate instances without mutating evidence or assessment inputs.
3. Generating immutable `Finding` entities when rule checks evaluate to `FAIL` or `WARN`.
4. Assembling an `EvaluationTrace` recording execution order, pass/fail/warn counts, and evaluation latency.
5. Emitting immutable domain events (`RuleRegistered`, `RuleEvaluated`, `FindingGenerated`, `RuleArchived`).
6. Providing structured domain errors with stable error codes (`ERR-RUL-001` through `ERR-RUL-007`).

This module does **NOT** perform policy decisions, issue compliance certificates, or determine overall compliance beyond rule evaluation.

---

## 2. Public API Summary

- `createRuleEngineService()`: Factory function creating `RuleEngineService`.
- `Rule`: Aggregate root managing rule identity, metadata, status, evaluator function, and traceability.
- `PureRuleEvaluator`: Class providing `evaluate(rule, evidence)` deterministic evaluation logic.
- `RuleCategory`: Enum (`STRUCTURAL`, `SECURITY`, `COMMUNICATION`, `GOVERNANCE`, `PERFORMANCE`).
- `RuleSeverity`: Enum (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFORMATIONAL`).
- `RuleStatus`: Enum (`ACTIVE`, `INACTIVE`, `DEPRECATED`, `ARCHIVED`).
- `RuleValidator`: Class providing static validation for rules and requests.
- `RuleTraceabilityManager`: Class generating and verifying constitutional traceability references.

---

## 3. Evaluation Model & Flow

```
[Assessment & Evidence] ───► [PureRuleEvaluator] ◄─── [Registered Active Rules]
                                     │
                                     ▼ (Deterministic Evaluation)
                   [RuleResult] ───► [Finding (if FAIL/WARN)] ───► [EvaluationTrace]
```

- **Inputs**: `AssessmentRequestModel` / Assessment reference, `Evidence` aggregate instances.
- **Outputs**: `RuleResult` array, immutable `Finding` array, `EvaluationTrace`.
- **Determinism Guarantee**: Evaluating identical evidence against identical active rule sets produces 100% identical outputs.

---

## 4. Findings Model

Every generated `Finding` is immutable and contains:
- `finding_id`: Branded `FindingId`.
- `rule_id`: Originating `RuleId`.
- `evidence_id`: Originating Evidence item ID.
- `severity`: Rule severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFORMATIONAL`).
- `status`: Evaluation status (`FAIL` or `WARN`).
- `description`: Detailed explanatory message.
- `traceability`: Traceability reference linking back to constitutional source.
- `timestamp`: ISO timestamp of generation.

---

## 5. Domain Events

- `RuleRegistered`: Emitted when a new rule is registered in the engine.
- `RuleEvaluated`: Emitted when a rule finishes evaluating an evidence item.
- `FindingGenerated`: Emitted when a finding is generated for a failed/warned check.
- `RuleArchived`: Emitted when a rule is archived.

---

## 6. Structured Error Model

| Error Class | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| `RuleValidationError` | `ERR-RUL-001` | Rule properties or evaluation request validation failure |
| `RuleExecutionError` | `ERR-RUL-002` | Runtime error during rule evaluation function execution |
| `UnknownRuleError` | `ERR-RUL-003` | Unregistered rule ID referenced |
| `DuplicateRuleError` | `ERR-RUL-004` | Attempted registration of duplicate Rule ID |
| `FindingGenerationError` | `ERR-RUL-005` | Error during finding generation |
| `RuleContractViolation` | `ERR-RUL-006` | CTR-003 boundary violation |
| `RuleNotFoundError` | `ERR-RUL-007` | Requested rule ID missing |

---

## 7. Enforced Invariants

1. **Pure Input Immutability**: Neither Evidence aggregates nor Assessment instances are ever mutated during rule evaluation.
2. **Deterministic Outputs**: Given identical inputs, rule evaluation yields identical results.
3. **No Unregistered Execution**: Rules must be explicitly registered prior to execution (`ERR-RUL-003`).
4. **Duplicate Rejection**: Duplicate Rule IDs are rejected on registration (`ERR-RUL-004`).

---

## 8. Test Inventory

- **Unit Tests**: Rule aggregate, value objects, status transitions, evaluation function binding (`tests/unit/`).
- **Contract Tests**: `CTR-003` schema validation and request/result payload checks (`tests/contract/`).
- **Compliance Tests**: Duplicate rule rejection, evidence immutability checks (`tests/compliance/`).
- **Regression Tests**: Deterministic execution output verification (`tests/regression/`).
- **Acceptance Tests**: End-to-end multi-rule registration, multi-evidence evaluation, finding generation, and evaluation trace assembly (`tests/acceptance/`).

---

## 9. Explicit Non-Goals

The `@cep/rule-engine` module explicitly does **NOT**:
- Perform policy resolution or threshold gating (deferred to Sprint C4).
- Issue compliance certificates or attestation tokens (deferred to Sprint C5).
- Interact with external AI providers, LLMs, or SCM APIs.
- Perform file system reads/writes or database persistence.

---

## 10. Traceability Annotation

- **Constitutional Source**: `docs/architecture/CEF-ARCHITECTURAL-ROLE.md`
- **Domain Concepts**: `Rule`, `Finding`, `Rule Evaluation` (`docs/domain/DOMAIN-MODEL.md`)
- **Governed Contract**: `CTR-003` (Rule Evaluation Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`)
- **Runtime Component**: `RuleEvaluationEngine` (`docs/runtime/COMPONENT-CATALOG.md`)
