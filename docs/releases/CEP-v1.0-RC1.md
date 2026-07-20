# CEP v1.0 Release Candidate 1 (RC1) — Release Specification & Notes

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Release Identifier** | `CEP-v1.0-RC1` |
| **Release Date** | `2026-07-20` |
| **Release Status** | Certified Release Candidate (RC1) |
| **Monorepo Version** | `0.1.0` |
| **Governed Contracts** | `CTR-001` through `CTR-009` |
| **Constitutional Source** | `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` |
| **Next Stage** | **Sprint C11 — Independent Constitutional Audit, External Engineering Review & GA Readiness** |

---

## 1. Executive Summary

The **Constitutional Engineering Platform (CEP) v1.0 Release Candidate 1 (RC1)** represents the complete, executable, constitutionally traceable implementation of the CEP platform architecture.

Every platform capability—from raw assessment creation, evidence collection, deterministic rule evaluation, policy resolution, certification issuance, execution orchestration, repository abstraction, AI provider abstraction, through to public API and SDK exposure—is implemented as a modular ES package under `packages/`.

---

## 2. Release Scope & Included Modules

The CEP v1.0 RC1 catalog contains 9 executable modules:

1. **`@cep/assessment-core` (`v0.1.0`)**: Assessment aggregate root, lifecycle state machine, validation, and domain events (`CTR-001`).
2. **`@cep/evidence-manager` (`v0.1.0`)**: Evidence aggregate root, lifecycle management, canonical JSON serialization, and evidence receipts (`CTR-002`).
3. **`@cep/rule-engine` (`v0.1.0`)**: Deterministic `PureRuleEvaluator`, immutable `Finding` generation, and `EvaluationTrace` assembly (`CTR-003`).
4. **`@cep/policy-resolver` (`v0.1.0`)**: `PolicyDecision` models, governance level resolution, and `PolicyResolverService`.
5. **`@cep/certification-engine` (`v0.1.0`)**: `Certification` aggregate root, legal lifecycle state transitions, SHA-256 verification hash, and `CertificationEngineService` (`CTR-005`).
6. **`@cep/platform-orchestrator` (`v0.1.0`)**: 5-stage sequential pipeline engine (`ASSESSMENT` -> `EVIDENCE` -> `RULE_EVALUATION` -> `POLICY_RESOLUTION` -> `CERTIFICATION`), immutable `ExecutionContext`, `ExecutionSummary`, and domain events (`CTR-006`).
7. **`@cep/repository-gateway` (`v0.1.0`)**: Provider-independent repository integration layer (`LocalGitAdapter`, `GitHubAdapter`, `GitLabAdapter`, `AzureDevOpsAdapter`) (`CTR-007`).
8. **`@cep/provider-gateway` (`v0.1.0`)**: Provider-independent AI provider integration layer (`OpenAIAdapter`, `AnthropicAdapter`, `GoogleGeminiAdapter`, `XAIAdapter`, `OllamaAdapter`) (`CTR-008`).
9. **`@cep/api-sdk` (`v0.1.0`)**: Developer interface module exposing `PlatformAPI` contracts, `CEPClient` SDK, fluent builders, semantic API versioning (`1.0.0`), error translation, and canonical JSON serialization (`CTR-009`).

---

## 3. Platform Architecture Overview

```
[Application / SDK Client] (`@cep/api-sdk`)
                   │
                   ▼
       [Platform Orchestrator] (`@cep/platform-orchestrator`)
         ┌─────────┼─────────┬─────────┐
         ▼         ▼         ▼         ▼
    Assessment Evidence Rule Engine Certification
       Core    Manager  & Policy Res.   Engine
         │         │
         ▼         ▼
    Repository  AI Provider
     Gateway     Gateway
```

---

## 4. Public API & SDK Surface

- `createCEPClient(config)`: Primary SDK entry point.
- `PlatformAPI`: Canonical interface (`createAssessment()`, `submitEvidence()`, `executePipeline()`, `retrieveCertification()`, `queryExecutionStatus()`, `executeAIProvider()`, `discoverRepository()`).
- `PipelineRequestBuilder`, `AssessmentRequestBuilder`, `EvidenceRequestBuilder`: Fluent builders.
- `APISerializer`: Loss-free canonical JSON serializer.

---

## 5. Repository & AI Provider Abstraction Capabilities

- **Supported SCM Providers**: Local Git (`LOCAL_GIT`), GitHub (`GITHUB`), GitLab (`GITLAB`), Azure DevOps (`AZURE_DEVOPS`).
- **Supported AI Providers**: OpenAI (`OPENAI`), Anthropic (`ANTHROPIC`), Google Gemini (`GOOGLE_GEMINI`), xAI (`XAI`), Ollama (`OLLAMA`).

---

## 6. Known Limitations

- **In-Memory Drivers**: Default network transport clients for SCM and AI providers use mock simulation drivers. Live HTTP/gRPC transport drivers are deferred to operational deployment.
- **In-Memory Storage**: State persistence relies on immutable in-memory records. Database persistence drivers are deferred to future infrastructure waves.

---

## 7. Deferred Capabilities

- REST/gRPC/GraphQL HTTP server endpoints.
- CLI executable binary distribution.
- Web frontend dashboard UI.
- Network rate limiting and OAuth2 / IAM authentication.

---

## 8. Release Declaration

The CEP engineering team formally declares **CEP v1.0 Release Candidate 1 (RC1)** complete, verified, and authorized for independent review.
