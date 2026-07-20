# `@cep/api-sdk` — Platform API & SDK Foundation Module

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Package Name** | `@cep/api-sdk` |
| **Package Version** | `0.1.0` |
| **Package Type** | ES Module (`"type": "module"`) |
| **Project Status** | Platform Implementation |
| **Lifecycle Stage** | Stage C — Platform Implementation (Developer Interface Foundation) |
| **Sprint Reference** | Sprint C9 |
| **Next Authorized Sprint** | Sprint C10 — Platform Hardening, Operational Readiness & v1.0 Release Candidate |
| **Governed Contract** | `CTR-009` (Platform API & SDK Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`) |
| **Constitutional Source** | `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` |

---

## 1. Overview & Module Purpose

The `@cep/api-sdk` module implements the official public developer interface for the **Constitutional Engineering Platform (CEP)**.

In strict compliance with Sprint C9 specifications, this module:
1. Defines stable, technology-neutral public API contracts (`PlatformAPI`).
2. Provides the developer SDK client (`CEPClient`) and fluent request builders (`PipelineRequestBuilder`, `AssessmentRequestBuilder`, `EvidenceRequestBuilder`).
3. Enforces strict architectural isolation: depends **only** on `@cep/platform-orchestrator`, `@cep/repository-gateway`, and `@cep/provider-gateway`. Does **NOT** depend directly on internal sub-modules (`@cep/assessment-core`, `@cep/evidence-manager`, `@cep/rule-engine`, `@cep/policy-resolver`, `@cep/certification-engine`).
4. Provides semantic API versioning metadata (`api_version: "1.0.0"`, `contract_version: "CTR-009"`).
5. Translates internal platform errors into stable API errors (`ERR-API-001` through `ERR-API-006`).
6. Emits immutable domain events (`SDKInitialized`, `APIRequestReceived`, `APIRequestValidated`, `PipelineExecutionRequested`, `APIResponseGenerated`).
7. Implements `APISerializer` for canonical JSON round-trip serialization.

---

## 2. Architecture & Public Interface Boundary

```
[Application / Automation / CLI / Web App]
                   │
                   ▼
               [SDK Client] (`CEPClient`)
                   │
                   ▼
             [Platform API] (`PlatformAPI`)
                   │
                   ▼
         [Platform Orchestrator] (`@cep/platform-orchestrator`)
                   │
   ┌───────────────┼───────────────┬──────────────────┐
   ▼               ▼               ▼                  ▼
Assessment     Evidence       Rule Engine       Certification
  Core         Manager       & Policy Resolver     Engine
```

Applications interact with CEP **exclusively** through `@cep/api-sdk`. Downstream internal package boundaries remain invisible to SDK consumers.

---

## 3. SDK Usage Example

```typescript
import {
  createCEPClient,
  PipelineRequestBuilder,
  EvidenceRequestBuilder,
} from '@cep/api-sdk';

const client = createCEPClient({ client_id: 'my-app' });

const evidence = new EvidenceRequestBuilder()
  .withArtifact('auth.ts', 'export function login() { return true; }', 'sha256-checksum-hex')
  .withOrigin('git://repo/auth.ts')
  .build();

const request = new PipelineRequestBuilder()
  .forProject('bridgenta-portfolio')
  .withGovernanceLevel(5)
  .addScopeFile('src/auth.ts')
  .addEvidence(evidence)
  .addRule({
    id: 'rule-security-login',
    metadata: { name: 'Login Check', category: 'SECURITY', severity: 'CRITICAL' },
    evaluator_fn: (payload: string) => ({ pass: payload.includes('login'), message: 'Login symbol verified.' }),
  })
  .build();

const response = client.executePipeline(request);
console.log(`Pipeline Status: ${response.pipeline_status}`);
console.log(`Certification Issued: ${response.certification.issued}`);
```

---

## 4. Public API Summary

- `createCEPClient(config)`: Factory function returning `CEPClient`.
- `PlatformAPI`: Interface exposing high-level operations (`createAssessment()`, `submitEvidence()`, `executePipeline()`, `retrieveCertification()`, `queryExecutionStatus()`, `executeAIProvider()`, `discoverRepository()`).
- `PipelineRequestBuilder`, `AssessmentRequestBuilder`, `EvidenceRequestBuilder`: Fluent builders.
- `APISerializer`: Canonical JSON serializer/deserializer.
- `APITraceabilityManager`: Class verifying traceability references.

---

## 5. Domain Events

- `SDKInitialized`: Emitted when `CEPClient` initializes.
- `APIRequestReceived`: Emitted when public API receives an incoming request.
- `APIRequestValidated`: Emitted when request payload schema passes validation.
- `PipelineExecutionRequested`: Emitted when pipeline execution is triggered.
- `APIResponseGenerated`: Emitted when response model is generated and returned.

---

## 6. Structured Error Model

| Error Class | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| `APIValidationError` | `ERR-API-001` | Request schema validation failure |
| `APIExecutionError` | `ERR-API-002` | Pipeline or stage execution error |
| `APIContractViolation` | `ERR-API-003` | CTR-009 contract boundary violation |
| `APIGatewayError` | `ERR-API-004` | Repository or AI Provider Gateway error |
| `APICertificationError` | `ERR-API-005` | Certification retrieval or verification error |
| `PlatformUnavailableError` | `ERR-API-006` | Platform runtime unavailable |

---

## 7. Test Inventory

- **Unit Tests**: `CEPClient` initialization, builders, and validation (`tests/unit/`).
- **Contract Tests**: `CTR-009` contract payload compliance checks (`tests/contract/`).
- **Compliance Tests**: Error translation (`ERR-API-*`) and architectural isolation (`tests/compliance/`).
- **Regression Tests**: Deterministic JSON serialization round-trip (`tests/regression/`).
- **Acceptance Tests**: Complete end-to-end developer workflow across SDK, gateways, and orchestrator (`tests/acceptance/`).

---

## 8. Explicit Non-Goals

The `@cep/api-sdk` module explicitly does **NOT**:
- Host HTTP, REST, GraphQL, or gRPC servers.
- Provide CLI executables or web user interfaces.
- Perform authentication, authorization, or token management.
- Re-implement assessment, evidence, rule, or certification logic.

---

## 9. Traceability Annotation

- **Constitutional Source**: `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` (Public API Surface)
- **Domain Concepts**: `Public API Surface`, `SDK Abstraction`, `Developer Interface` (`docs/domain/DOMAIN-MODEL.md`)
- **Governed Contract**: `CTR-009` (Platform API & SDK Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`)
- **Runtime Component**: `PlatformAPI`, `CEPClient` (`docs/runtime/COMPONENT-CATALOG.md`)
