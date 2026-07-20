# `@cep/provider-gateway` — AI Provider Gateway Foundation Module

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Package Name** | `@cep/provider-gateway` |
| **Package Version** | `0.1.0` |
| **Package Type** | ES Module (`"type": "module"`) |
| **Project Status** | Platform Implementation |
| **Lifecycle Stage** | Stage C — Platform Implementation (External Integration Foundation) |
| **Sprint Reference** | Sprint C8 |
| **Next Authorized Sprint** | Sprint C9 — Platform API & SDK Foundation |
| **Governed Contract** | `CTR-008` (AI Provider Gateway Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`) |
| **Constitutional Source** | `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` |

---

## 1. Overview & Module Purpose

The `@cep/provider-gateway` module implements the AI provider integration boundary for the **Constitutional Engineering Platform (CEP)**.

In strict compliance with Sprint C8 specifications, this module:
1. Provides a provider-independent abstraction layer over AI providers (OpenAI, Anthropic, Google Gemini, xAI, Ollama).
2. Defines the common `AIProvider` interface (`connect()`, `disconnect()`, `getCapabilities()`, `healthCheck()`, `submitRequest()`, `normalizeResponse()`).
3. Exposes capability discovery across registered providers without leaking provider-specific APIs.
4. Normalizes requests into a canonical `AIRequest` model and responses into a canonical `AIResponse` model.
5. Emits immutable gateway domain events (`ProviderRegistered`, `ProviderConnected`, `RequestSubmitted`, `ResponseReceived`, `ProviderDisconnected`).
6. Enforces structured domain error codes (`ERR-PRV-001` through `ERR-PRV-006`).

This module acts strictly as an infrastructure integration layer. It does **NOT** perform prompt engineering, RAG, agent execution, memory management, or secret persistence.

---

## 2. Provider Architecture & Provider Independence

```
[AI Provider (OpenAI / Anthropic / Gemini / xAI / Ollama)]
                           │
                           ▼
                   [Provider Adapter]
                           │
                           ▼
                   [Provider Gateway]
                           │
                           ▼
                  [Canonical AI Model]
                           │
                           ▼
                       [Platform]
```

All downstream CEP modules consume **only** canonical AI models and responses, ensuring 100% provider independence and portability.

---

## 3. Public API Summary

- `createAIProviderGatewayService()`: Factory function returning `AIProviderGatewayService`.
- `ProviderType`: Enum (`OPENAI`, `ANTHROPIC`, `GOOGLE_GEMINI`, `XAI`, `OLLAMA`).
- `ProviderCapability`: Enum (`CHAT_COMPLETION`, `STRUCTURED_OUTPUT`, `STREAMING`, `TOOL_CALLING`, `IMAGE_GENERATION`, `REASONING_SUPPORT`, `FUNCTION_CALLING`, `EMBEDDINGS`).
- `OpenAIAdapter`, `AnthropicAdapter`, `GoogleGeminiAdapter`, `XAIAdapter`, `OllamaAdapter`: Initial provider adapters.
- `RequestNormalizer` & `ResponseNormalizer`: Classes for canonical format transformation.
- `RequestValidator` & `ResponseValidator`: Classes for model validation.
- `ProviderTraceabilityManager`: Class verifying provider gateway traceability references.

---

## 4. Domain Events

- `ProviderRegistered`: Emitted when adapter registers capabilities with gateway.
- `ProviderConnected`: Emitted when provider connects or passes health check.
- `RequestSubmitted`: Emitted when canonical request is submitted to provider.
- `ResponseReceived`: Emitted when provider response is normalized.
- `ProviderDisconnected`: Emitted upon provider disconnection.

---

## 5. Structured Error Model

| Error Class | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| `ProviderConnectionError` | `ERR-PRV-001` | Connection failure or adapter state uninitialized |
| `ProviderUnavailableError` | `ERR-PRV-002` | Unregistered or unavailable provider type requested |
| `RequestValidationError` | `ERR-PRV-003` | Invalid AI request payload structure |
| `ProviderContractViolation` | `ERR-PRV-004` | CTR-008 boundary or model violation |
| `ResponseNormalizationError` | `ERR-PRV-005` | Normalization failure during response parsing |
| `AdapterRegistrationError` | `ERR-PRV-006` | Adapter registration error |

---

## 6. Test Inventory

- **Unit Tests**: Provider adapters (`OpenAIAdapter`, `AnthropicAdapter`, `GoogleGeminiAdapter`, `XAIAdapter`, `OllamaAdapter`) (`tests/unit/`).
- **Contract Tests**: `CTR-008` contract payload compliance checks (`tests/contract/`).
- **Compliance Tests**: Secret protection and unregistered provider rejection (`tests/compliance/`).
- **Regression Tests**: Deterministic canonical response normalization (`tests/regression/`).
- **Acceptance Tests**: Full chain from capability discovery through request submission to normalized response assembly (`tests/acceptance/`).

---

## 7. Explicit Non-Goals

The `@cep/provider-gateway` module explicitly does **NOT**:
- Store API keys, credentials, or secrets.
- Persist prompt histories, conversations, or memory stores.
- Perform prompt engineering, RAG, or autonomous agent loops.
- Perform rule evaluation, policy resolution, or certification.
- Expose REST, CLI, or UI endpoints.

---

## 8. Traceability Annotation

- **Constitutional Source**: `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` (AI Provider Abstraction)
- **Domain Concepts**: `AI Provider Abstraction`, `Canonical AI Model`, `Provider Independence` (`docs/domain/DOMAIN-MODEL.md`)
- **Governed Contract**: `CTR-008` (AI Provider Gateway Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`)
- **Runtime Component**: `AIProviderGateway` (`docs/runtime/COMPONENT-CATALOG.md`)
