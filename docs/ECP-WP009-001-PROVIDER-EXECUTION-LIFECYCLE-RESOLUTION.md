# Engineering Change Proposal (ECP)
## ECP-WP009-001: Provider Execution Lifecycle and WP-009/WP-010 Boundary Resolution

*   **ECP ID**: ECP-WP009-001
*   **Title**: Provider Execution Lifecycle and WP-009/WP-010 Boundary Resolution
*   **Category**: Cross-Work-Package Architecture Correction
*   **Affected Work Packages**: WP-005, WP-009, WP-010
*   **Status**: Proposed — Awaiting Project Owner Decision

---

## 1. Contradiction Statement

A **Cross-Work-Package Execution-Order Conflict** exists between the frozen v2.0 specifications:

1.  **Current WP-005 Sequence**:
    The Orchestrator (`orchestrator.service.ts` / Steps 6 & 7) coordinates flow as:
    ```text
    [Bundle Builder (WP-007)] ──► [Provider Broker (WP-008)] ──► [Provider Adapter (WP-009)] ──► [Transformation Engine (WP-010)]
    ```
    This triggers `broker.invokeAdapter` with only `context` and `bundle` references, and then passes the resulting response to `transformer.transform`.
2.  **Frozen WP-009 Responsibility**:
    WP-009 is a transport-only execution boundary. It is strictly prohibited from prompt construction, system instruction composition, or injecting bundle rules into prompt structures.
3.  **Frozen WP-010 Responsibility**:
    WP-010 owns input assembly, wrapping rule bundles in XML tags, and prompt formatting.
4.  **Resulting Contradiction**:
    If WP-009 runs before WP-010, the adapter has no compiled prompt text to execute. If the adapter constructs the prompt itself, it violates its transport-only boundary. If WP-010 is called before WP-009, the frozen WP-005 orchestration sequence must change.

---

## 2. Authoritative Baseline Review

| Artifact | Exact Section | Requirement | Effect on Lifecycle |
| :--- | :--- | :--- | :--- |
| **System Architecture** | Sec. 5.1 (Adapter Decoupling) | The broker/adapter layers must remain decoupled from prompt-engineering layout decisions. | Prohibits prompt building in WP-009. |
| **Orchestrator EDS** | Sec. 7 (Runtime Behavior) | Step 6 triggers Provider Adapter API Invocation before Step 7 Transformation. | Enforces execution before transformation. |
| **Transformation EDS** | Sec. 8 (Transformation Pipeline) | Pipeline segment 10 (AI Transformation) is preceded by Segment 9 (Transformation Planning) which builds local instructions. | Requires planning before provider invocation. |

---

## 3. Candidate Resolution Models

### Model A — WP-010 Two-Phase Domain
Under this model, the Transformation Engine (WP-010) is split into a pre-provider phase (Envelope Assembly) and a post-provider phase (Response Reconstruction).
*   **Signatures**:
    *   `transformer.assembleExecutionEnvelope(context, bundle) -> ProviderExecutionEnvelope`
    *   `transformer.transformProviderResponse(context, providerResponse) -> TargetDocumentDiff`
*   **Pros**: Preserves WP-005 as the sole coordinator, keeps WP-009 transport-neutral, isolates prompt layout within WP-010.
*   **Cons**: Requires a minor interface update to the frozen WP-010 domain definition.

### Model B — New Execution Envelope Work Package
*   **Structure**: Adds a new Work Package (e.g. WP-017: Execution Envelope Builder) to compile the prompt before adapter invocation.
*   **Pros**: Avoids splitting WP-010 interfaces.
*   **Cons**: Adds unnecessary architectural layers, increases runtime configuration complexity, and delays project delivery.

### Model C — Existing Canonical Envelope Already Exists
*   **Status**: **FAIL**. No such envelope exists in the frozen CDM.

### Model D — WP-009 Constructs the Prompt
*   **Status**: **FAIL**. Violates the transport-only scope boundary of WP-009.

### Model E — WP-010 Coordinates WP-008 and WP-009
*   **Status**: **FAIL**. Violates Orchestrator (WP-005) FSM state and lifecycle coordination boundaries.

---

## 4. Candidate Model Decision Matrix

| Model | Architectural Conformance | Boundary Clarity | Change Surface | Regression Risk | Extensibility | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Model A** | **PASS** | **PASS** | **PARTIAL** (WP-005/010 updates) | **PASS** (Low risk) | **PASS** | **RECOMMENDED** |
| **Model B** | **PARTIAL** | **PASS** | **FAIL** (High complexity) | **PARTIAL** | **PARTIAL** | No |
| **Model C** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | No |
| **Model D** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | No |
| **Model E** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | No |

---

## 5. Recommended Lifecycle (Model A Sequence)

```text
  Orchestrator ──► WP-010A (Assemble Envelope) ──► ProviderExecutionEnvelope
        │
        ▼
  Orchestrator ──► WP-009 (Execute Adapter) ──► NormalizedProviderResponse
        │
        ▼
  Orchestrator ──► WP-010B (Transform Response) ──► TargetDocumentDiff
```

| Sequence Step | Owning Work Package | Canonical Input | Canonical Output |
| :--- | :--- | :--- | :--- |
| **1. Select Provider** | WP-008 | `IKnowledgeBundle`, Registry | `IProviderSelectionResult` |
| **2. Assemble Envelope**| WP-010A | `IKnowledgeBundle`, context | `ProviderExecutionEnvelope` |
| **3. Execute Adapter** | WP-009 | `ProviderExecutionEnvelope`, Selection | `IProviderResponse` |
| **4. Compile Diff** | WP-010B | `IProviderResponse`, context | `TargetDocumentDiff` |

---

## 6. Canonical Pre-Execution Contract

We propose the addition of **`ProviderExecutionEnvelope`** to the Canonical Data Model:

```typescript
export interface ProviderExecutionEnvelope {
  readonly sessionId: string;
  readonly promptText: string;
  readonly systemInstructions?: string;
  readonly bundleHash: string;
  readonly policy: {
    readonly temperature: number;
    readonly maxTokens: number;
  };
}
```

| Field | Owner | Purpose | Required | Governing Spec |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | WP-005 | Traceability correlation | Yes | CDM Sec. 7 |
| `promptText` | WP-010 | Assembled instructions & text segments | Yes | Transformation EDS |
| `systemInstructions` | WP-010 | Governed behavior rules | No | Transformation EDS |
| `bundleHash` | WP-007 | Cross-reference validation hash | Yes | CDM Sec. 6 |
| `policy` | WP-010 | Generation options | Yes | System Architecture |

---

## 7. Canonical Post-Execution Contract

We define the normalized provider response payload returned to the Orchestrator:

```typescript
export interface IProviderResponse {
  readonly text: string;
  readonly stopReason: 'stop' | 'length' | 'content_filter' | 'other';
  readonly tokenUsage: {
    readonly inputTokens: number;
    readonly outputTokens: number;
  };
  readonly providerId: string;
  readonly metadata: {
    readonly requestId: string;
    readonly timestamp: string;
  };
}
```

---

## 8. Generation-Policy Ownership

| Policy or Parameter | Candidate Owner | Final Owner | Reason |
| :--- | :--- | :--- | :--- |
| **Communication objective** | WP-010 | **WP-010** | Defines content layout goals |
| **System-instruction composition** | WP-010 | **WP-010** | Translates bundle rules to prompt instructions |
| **Maximum output length** | WP-010 | **WP-010** | Content formatting constraint |
| **Temperature** | WP-010 | **WP-010** | Generation policy parameter |
| **Provider-specific parameter mapping** | WP-009 | **WP-009** | Encapsulates adapter transport payloads |
| **Provider role mapping** | WP-009 | **WP-009** | Enforces vendor message formatting |
| **Tokenizer selection** | WP-009 | **WP-009** | Model-specific library dependency |

---

## 9. Credential Boundary

*   **Secret storage**: Host OS environment variables.
*   **Resolution Owner**: Concrete adapter wrappers resolved via factory.
*   **Runtime Consumer**: `ITransportClient` headers. Secrets never enter shared memory structures or log streams.

---

## 10. Endpoint Boundary

Endpoints are resolved from environment settings and validated against a static allowlist to prevent Server-Side Request Forgery (SSRF) hazards. Redirects to RFC 1918 ranges are blocked.

---

## 11. Adapter-Registration Scope

WP-009 initially implements:
1.  **Mock Adapter**: Reference test utility (test-only, not selected in production).
2.  **Gemini Adapter**: Initial production LLM provider client.
3.  **Claude Adapter**: Planned downstream provider.

---

## 12. Timeout, Retry, and Cancellation Ownership

*   **Global Timeout**: WP-005 (Orchestrator) manages global session limits.
*   **Request Timeout**: WP-009 enforces client network limits (default 15s) using connection timeouts.
*   **Retry Policy**: WP-009 client retries connection errors up to 3 times with exponential backoff.
*   **Cancellation**: WP-005 AbortSignals are propagated to WP-009 to terminate connections.

---

## 13. Tokenization and Capacity Authority

WP-009 is the sole owner of tokenizer execution and context-capacity validation. It reads the model's tokenizer metadata, count tokens, and throws `CapacityExceededException` if input exceeds capability. No bytes-per-token approximations are allowed.

---

## 14. Provider Safety and Refusal Semantics

| Outcome | Owning Work Package | Retryable | Canonical Representation |
| :--- | :--- | :--- | :--- |
| **Provider safety refusal** | WP-009 | No | `stopReason: 'content_filter'` |
| **Transport failure** | WP-009 | Yes (transient) | Throws `ProviderNetworkException` |
| **Invalid API key** | WP-009 | No | Throws `AuthenticationException` |

---

## 15. Response-Normalization Boundary

WP-009 is responsible for JSON serialization, field mapping, stop-reason standardization, and token usage counts. It does not parse markdown meaning, extract diff blocks, or evaluate text correctness (which are owned by WP-010/WP-011).

---

## 16. Security Clarification

TLS 1.2 or higher is mandated. Proxy parameters are read from environment configurations. Complete prompts and response bodies are excluded from execution logs.

---

## 17. Frozen-Artifact Change Inventory

| Artifact | Required Change | Change Type | Compatibility Impact |
| :--- | :--- | :--- | :--- |
| **`orchestrator.service.ts`** | Update Step 6/7 pipeline to split Transformation | Runtime behavior change | High (orchestrator execution flow) |
| **`ITransformationEngine`** | Split `transform` into two lifecycle methods | Canonical contract change | Medium (affects mock types) |
| **Orchestrator EDS** | Align lifecycle flow to Model A | Documentation correction | Low |
| **Transformation EDS** | Align input assembly signature | Documentation correction | Low |

---

## 18. Migration and Regression Plan

1.  **ECP Approval**: Confirm lifecycle change authorization.
2.  **Contract Update**: Refactor `becc-runtime/orchestrator/types.ts` to expose Model A signatures.
3.  **Orchestrator Adaptation**: Update `becc-runtime/orchestrator/orchestrator.service.ts` to call the two-phase Transformation engine.
4.  **Regression Validation**: Rerun all WP-001 through WP-008 tests to ensure no regressions occur.
5.  **WP-009 Planning**: Proceed with WP-009 design using the resolved execution envelope contract.

---

## 19. Final ECP Recommendation

Model A represents the most stable, extensible, and clean architectural design that preserves all boundaries.

We recommend adopting **Model A**.
