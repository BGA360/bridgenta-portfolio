# BECC v2.0 — Runtime Lifecycle Amendment Specification
## Amendment ID: BECC-v2-LIFECYCLE-AMENDMENT-001

*   **Amendment ID**: BECC-v2-LIFECYCLE-AMENDMENT-001
*   **Title**: Authoritative Runtime Execution Lifecycle Amendment Specification
*   **Status**: Proposed — Awaiting Project Owner Approval
*   **Category**: Normative Lifecycle Revision
*   **Related ECP**: [ECP-WP009-001](../../../ECP-WP009-001-PROVIDER-EXECUTION-LIFECYCLE-RESOLUTION.md)
*   **Affected Work Packages**: WP-005, WP-009, WP-010
*   **Architectural Impact**: Redefines the execution sequencing of the BECC core runtime to insert a pre-execution prompt assembly stage.
*   **Effective Runtime Version**: 2.0.0-GA-LIFECYCLE-AMENDED

---

## 1. Amendment Rationale

The original BECC v2.0 execution sequence triggered `broker.invokeAdapter(...)` immediately after selecting the provider, passing raw `AssessmentContext` and `IKnowledgeBundle` inputs to the Provider Adapter (WP-009). The Transformation Engine (WP-010) was then called on the resulting provider response to compile diff blocks.

This sequencing contained a major architectural contradiction:
1.  **Transport Boundary Violation**: The Provider Adapter (WP-009) is a transport client wrapper. It must remain decoupled from prompt-engineering layouts, system-instruction composition, and rule formatting.
2.  **No Execution Payload**: If the Adapter does not build the prompt, and the Transformation Engine has not run yet, the Adapter has no prompt text to execute.
3.  **Boundary Inversion**: If WP-009 is forced to build the prompt, it duplicates the core layout capabilities of WP-010.

To resolve this boundary breach without introducing a new work package or compromising the Orchestrator's coordination authority, **Model A (Two-Phase Transformation Engine)** is selected. The Transformation Engine is split into:
*   **Phase A**: Pre-Execution Envelope Assembly (`assembleExecutionEnvelope`)
*   **Phase B**: Post-Execution Response Transformation (`transformProviderResponse`)

---

## 2. Canonical Runtime Lifecycle

The amended BECC runtime pipeline executes across 12 sequential stages:

```text
[Assessment Request]
         │
         ▼
  1. Initialize Session (WP-005)
         │
         ▼
  2. Repository Discovery (WP-003)
         │
         ▼
  3. Knowledge Resolution (WP-006)
         │
         ▼
  4. Bundle Compilation (WP-007)
         │
         ▼
  5. Provider Selection (WP-008)
         │
         ▼
  6. Pre-Execution Envelope Assembly (WP-010A)
         │
         ▼
  7. Provider Adapter Execution (WP-009)
         │
         ▼
  8. Post-Execution Response Transformation (WP-010B)
         │
         ▼
  9. Compliance Validation (WP-011)
         │
         ▼
 10. Human Review Gate (WP-012)
         │
         ▼
 11. Evidence Ledger Logging (WP-013)
         │
         ▼
 12. Complete & Shutdown (WP-005) ──► [Publication Authorization]
```

### Stage Catalog

| Stage | Stage Name | Owner | Canonical Input | Canonical Output |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Initialize Session | WP-005 | `AssessmentRequest` | Correlation ID, state context |
| **2** | Repository Discovery | WP-003 | Target file paths | `AssessmentContext` |
| **3** | Knowledge Resolution | WP-006 | `AssessmentContext` | `ResolvedKnowledge` |
| **4** | Bundle Compilation | WP-007 | `ResolvedKnowledge` | `IKnowledgeBundle` |
| **5** | Provider Selection | WP-008 | `IKnowledgeBundle` | `IProviderSelectionResult` |
| **6** | Pre-Execution Assembly | WP-010A | `IKnowledgeBundle`, Context | `ProviderExecutionEnvelope` |
| **7** | Provider Adapter Exec | WP-009 | `ProviderExecutionEnvelope`, Selection | `IProviderResponse` |
| **8** | Post-Execution Trans | WP-010B | `IProviderResponse`, Context | `TargetDocumentDiff` |
| **9** | Compliance Validation | WP-011 | `TargetDocumentDiff`, Bundle | `ValidationReport` |
| **10**| Human Review Gate | WP-012 | `ValidationReport` | `ReviewDecision` |
| **11**| Evidence Logging | WP-013 | `ReviewDecision`, execution logs | Signed Ledger entry |
| **12**| Complete & Shutdown | WP-005 | Signed Ledger entry | Finalized exit code |

---

## 3. Runtime Boundary Definitions

### Responsibility Matrix

| Work Package | Inputs | Outputs | Primary Consumer | Prohibited Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **WP-001** | Env vars, configs | Boot settings | All modules | Job state management |
| **WP-003** | Request | `AssessmentContext` | WP-005, WP-006 | Rule scanning, prompt building |
| **WP-005** | Request | Evidence, state | Downstream | Mutating source code or rule texts |
| **WP-006** | Context | Resolved paths | WP-007 | Packing rules into JSON files |
| **WP-007** | Resolved paths | `IKnowledgeBundle` | WP-008, WP-010 | Calling LLM APIs |
| **WP-008** | Bundle | Selection Result | WP-005, WP-009 | Loading endpoint credentials |
| **WP-009** | Envelope, Selection | Response | WP-005, WP-010 | Constructing prompts |
| **WP-010** | Context, Envelope | Diff, Envelope | WP-011 | Deciding model choice, syntax checks |
| **WP-011** | Diff, Bundle | ValidationReport | WP-012 | Writing to repository files |
| **WP-012** | ValidationReport | ReviewDecision | WP-013 | Modifying code or rules |

---

## 4. Canonical Runtime Contracts

*   **`AssessmentRequest`**: User request. Immutable. Lifecycle: Init.
*   **`AssessmentContext`**: Git status, target path. Immutable. Lifecycle: Connector to downstream.
*   **`ResolvedKnowledge`**: Pointers to rules. Immutable. Lifecycle: Resolver to Builder.
*   **`IKnowledgeBundle`**: Compiled JSON rules. Immutable. Lifecycle: Builder to downstream.
*   **`IProviderSelectionResult`**: Selected model ID. Immutable. Lifecycle: Broker to downstream.
*   **`ProviderExecutionEnvelope`**: Assembled prompt text, system message, temperature parameters. Immutable. Lifecycle: Transformation Phase A to Adapter.
*   **`IProviderResponse`**: Normalized model text, stop reasons. Immutable. Lifecycle: Adapter to Transformation Phase B.
*   **`TargetDocumentDiff`**: Generated code adjustments. Immutable. Lifecycle: Transformation Phase B to Validation.
*   **`ValidationReport`**: AST compliance score. Immutable. Lifecycle: Validation to Review.
*   **`ReviewDecision`**: Final user audit flag. Immutable. Lifecycle: Review to Evidence.

---

## 5. Runtime Coordination Rules

1.  **Single Coordinator Rule**: Only `RuntimeOrchestrator` (WP-005) coordinates step execution and drives state transitions.
2.  **No Downstream Invocations**: Downstream packages are prohibited from executing other packages directly (e.g., `GeminiAdapter` must never call the Transformation Engine).
3.  **Strict Orchestrator Mediation**: Every transition payload must be returned to the Orchestrator before being passed to the next step.

---

## 6. Runtime Amendment Impact Analysis

*   **WP-005**:
    *   *Implementation change*: Yes. Update `orchestrator.service.ts` steps 6 & 7.
    *   *Interface change*: Yes. Split `ITransformationEngine` interface into two methods.
    *   *Documentation*: Update EDS flowchart.
    *   *Tests*: Refactor mock structures in `orchestrator.test.ts`.
*   **WP-009**:
    *   *Implementation change*: None (not yet implemented).
    *   *Interface change*: Receives `ProviderExecutionEnvelope` instead of `IKnowledgeBundle`.
*   **WP-010**:
    *   *Implementation change*: Yes. Expose `assembleExecutionEnvelope` and `transformProviderResponse`.

---

## 7. Migration Strategy

The migration must occur in this order:
1.  **Architecture Amendment Approval**: Approve this specification document.
2.  **Canonical Contract Refactor**: Declare `ProviderExecutionEnvelope` in `shared/types.ts`.
3.  **WP-005 Orchestration refactor**: Implement split execution in `orchestrator.service.ts` and verify regressions.
4.  **WP-009 Planning & Execution**: Begin implementation of the Provider Adapter.
5.  **WP-010 Implementation**: Implement Transformation Phase A and Phase B.

---

## 8. Successor Authorization

Upon approval of this amendment:
*   **Authorized**: Creation of branch `feature/runtime-lifecycle-amendment` to apply updates to `orchestrator.service.ts`.
*   **Not Authorized**: Implementation of WP-009 or WP-010 code.

---

## 9. Final Self-Review

*   **Architectural consistency**: **PASS**. Standardizes prompt compilation cleanly.
*   **Work-package separation**: **PASS**. Transport adapter remains free of prompt-layout code.
*   **Canonical data flow**: **PASS**. Clear input-output pipeline.
*   **Provider neutrality**: **PASS**.
*   **Migration risk**: **PASS**. Small footprint change to FSM steps.
