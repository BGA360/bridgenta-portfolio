# `@cep/assessment-core` — Assessment Core Foundation Module

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Package Name** | `@cep/assessment-core` |
| **Package Version** | `0.1.0` |
| **Package Type** | ES Module (`"type": "module"`) |
| **Project Status** | Platform Implementation |
| **Lifecycle Stage** | Stage C — Platform Implementation |
| **Sprint Reference** | Sprint C1 |
| **Next Authorized Sprint** | Sprint C2 — Evidence Manager Foundation |
| **Primary Component** | `AssessmentOrchestrator` (`docs/runtime/COMPONENT-CATALOG.md`) |
| **Governed Contract** | `CTR-001` (Assessment Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`) |
| **Constitutional Source** | `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` (Section 2) |

---

## 1. Overview & Module Purpose

The `@cep/assessment-core` module implements the foundational executable orchestrator of the **Constitutional Engineering Platform (CEP)**.

In strict compliance with Sprint C1 boundaries, this module implements **only the minimum Assessment Core** required to:
1. Create a new assessment instance.
2. Validate incoming Assessment Request payloads against `CTR-001`.
3. Transition assessment instances across legal state machine states per `docs/domain/DOMAIN-LIFECYCLES.md`.
4. Inspect active assessment states, findings, and metadata.
5. Serialize and deserialize assessments to/from deterministic JSON models.

This module contains zero dependencies on un-authorized modules (evidence collection pipelines, rule evaluation engines, policy resolvers, certification registries, or external provider adapters).

---

## 2. Exported API

The module exports the following primary interfaces and factories:

- `AssessmentOrchestrator`: Primary service class managing assessment creation, validation, state transitions, inspection, and serialization.
- `createAssessmentOrchestrator()`: Factory function creating an instance of `AssessmentOrchestrator`.
- `AssessmentState`: Enum defining legal assessment states (`REQUESTED`, `COLLECTING_EVIDENCE`, `UNDER_REVIEW`, `COMPLETED`, `CERTIFIED`, `FAILED`, `ARCHIVED`).
- `FindingSeverity`: Enum defining finding severities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFORMATIONAL`).
- `ValidationError`, `StateTransitionError`, `ContractViolationError`: Conceptual error classes.

---

## 3. Usage Example

```typescript
import { 
  createAssessmentOrchestrator, 
  AssessmentState 
} from '@cep/assessment-core';

// Initialize orchestrator instance
const orchestrator = createAssessmentOrchestrator();

// 1. Create and validate assessment
const assessment = orchestrator.createAssessment({
  request_id: 'req-2026-001',
  project_ref: 'project-bridgenta-01',
  scope_manifest: ['BECC', 'BGCF'],
  target_governance_level: 3,
  trigger_event: 'PULL_REQUEST'
});

// 2. Transition states through lifecycle
orchestrator.transitionState(assessment.request_id, AssessmentState.COLLECTING_EVIDENCE);
orchestrator.transitionState(assessment.request_id, AssessmentState.UNDER_REVIEW);
orchestrator.transitionState(assessment.request_id, AssessmentState.COMPLETED);

// 3. Inspect assessment state
const currentAssessment = orchestrator.inspectAssessment(assessment.request_id);

// 4. Serialize to JSON
const jsonPayload = orchestrator.serializeAssessment(currentAssessment);
```

---

## 4. Traceability Annotation

- **Constitutional Source**: `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md`
- **Domain Concepts**: `Assessment`, `Assessment Request`, `Assessment Result`, `Finding` (`docs/domain/DOMAIN-MODEL.md`)
- **Governed Contract**: `CTR-001` (Assessment Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`)
- **Runtime Component**: `AssessmentOrchestrator` (`docs/runtime/COMPONENT-CATALOG.md`)
