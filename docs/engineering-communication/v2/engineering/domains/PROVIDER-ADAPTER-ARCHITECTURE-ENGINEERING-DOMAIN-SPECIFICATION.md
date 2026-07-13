# BECC v2.0 — Provider Adapter Architecture & Engineering Domain Specification

An authoritative engineering domain specification defining the interface contracts, request/response translations, error normalization mappings, security trust boundaries, and execution models for the Provider Adapter Layer.

## 1. Engineering Identity

- **Domain Name**: Provider Adapter Domain
- **Version**: 1.0.0
- **Status**: Active
- **Owner**: Model Adapter Engineering Team
- **Scope**: SDK wrappers, API credentials mapping, request/response payload translations, and error normalizations.

## 2. Purpose

The Provider Adapter Layer abstracts external AI vendor SDKs ( Anthropic, Google, OpenAI, etc.) from the core BECC engines. It ensures provider independence by presenting a standard adapter contract, making model swaps transparent to upstream components.

## 3. Responsibilities

1. **Standardized Execution**: Implements the standard adapter contract.
2. **Request Translation**: Converts canonical requests into model-native prompt messages.
3. **Response Normalization**: Extracts raw model string output and maps tokens count to standard CDM structures.
4. **Error Normalization**: Maps vendor exceptions to standard platform error codes.
5. **Credential Sandboxing**: Implements credentials isolation boundaries, preventing API key leakage.

## 4. Explicit Non-Responsibilities

The Provider Adapter Layer explicitly does NOT own:
- **Routing & Failover**: Health checks routing and adapter retry loops belong to the Provider Broker.
- **Rules Resolving**: Directory scans and overrides logic belong to the Knowledge Resolver.
- **Bundle Generation**: Prompt format packaging belongs to the Bundle Builder.
- **Workflow Orchestration**: Run state management belongs to the Coordinator.

## 5. Inputs

Consumes:
- **Transformation Request**: Canonical request container.
- **Knowledge Bundle**: Provider-neutral active rules and vocabulary context.

## 6. Outputs

Produces:
- **Transformation Response**: Standard payload enclosing output text, model rationale, and trace hashes.
- **Provider Response**: Normalized API latency and token metrics metadata wrapper.

## 7. Adapter Architecture

The Provider Adapter Layer serves as a strict architectural barrier:

```text
  [Provider Broker]
          │
          ▼  (Invokes Unified Call)
 [Standard Adapter Contract]  (Interface boundary)
          │
          ├─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
  [Claude Adapter]          [Gemini Adapter]        [Antigravity Adapter]
          │                         │                         │
          ▼                         ▼                         ▼
  (Anthropic SDK)            (Google SDK)            (Mock Local Tests)
```

Upstream components import zero vendor-specific API packages. Vendor dependencies remain encapsulated.

## 8. Standard Adapter Contract

Every adapter must implement these six capabilities:
1. **Initialize**: Configures endpoints and verifies credentials.
2. **Capability Reporting**: Declares supported features (context limit size, structured outputs).
3. **Request Translation**: Translates canonical input context to model prompt streams.
4. **Response Normalization**: Standardizes completion strings and token usage metadata.
5. **Error Normalization**: Maps proprietary API failures to canonical exceptions.
6. **Health Reporting**: Dispatches pings to verify connector uptime.

## 9. Supported Provider Types

Adapters are configured for these target engines:
- **Claude**: Used for detailed architectural analyses and parsing.
- **Gemini**: Used for high-volume text modifications and reviews.
- **ChatGPT**: Used for general template drafting.
- **Codex**: Used for source code completion pipelines.
- **Antigravity**: Local mock connector used for unit tests.

## 10. Request Translation & Response Normalization

### Request Translation
- The adapter translates standard string inputs into vendor structures (e.g. Anthropic's `messages` format vs Google's `contents` array).
- Prompts injection prevention wrappers are applied at this layer.

### Response Normalization
- The adapter extracts text completions, stripping vendor-specific container blocks.
- Input and output token counts are mapped to canonical CDM integers.

## 11. Capability Discovery

On boot, adapters publish their capability profile:
- `context_window_limit`: Maximum input/output tokens.
- `supports_system_instructions`: Boolean check indicator.
- `supports_json_mode`: Output formatting capability.

## 12. Error Normalization

Proprietary exceptions map to these canonical exception codes:
- **HTTP 429 (Rate Limits)** ──► `PROVIDER_RATE_LIMIT_ERROR`
- **HTTP 401 / 403 (Invalid Keys)** ──► `PROVIDER_AUTHENTICATION_ERROR`
- **HTTP 504 / Connection Timeout** ──► `PROVIDER_TIMEOUT_ERROR`
- **HTTP 400 (Invalid Schema)** ──► `PROVIDER_MALFORMED_REQUEST_ERROR`

## 13. Runtime Behaviour

Internal execution workflow:
```text
[Initialize] ──► [Translate Request] ──► [Invoke SDK Client] ──► [Normalize Output]
                                                                        │
                                                                        ▼
                                                             [Normalized Response]
```

## 14. State Management

Adapters transition through these states:
- **Uninitialized**: Booting connection.
- **Ready**: Online, capabilities registered.
- **Translating**: Formulating vendor request objects.
- **Executing**: Dispatched to external vendor gateway.
- **Normalizing**: Processing response text and tokens.
- **Unhealthy**: Authentication failure or endpoint offline.

## 15. Events

- **Consumes**:
  - `Provider Invoked`: Initiates adapter routing.
- **Produces**:
  - `Adapter Invoked`: Logs local execution start.
  - `Adapter Output Normalized`: Dispatches normalized CDM object.
  - `Adapter Call Failed`: Dispatches normalized exception code.

## 16. Dependencies

- **Upstream**: Provider Broker.
- **Downstream**: Vendor API Gateways.

## 17. Interactions

- **Provider Broker** ──► Supplies canonical request objects.
- **Vendor SDK Library** ──► Performs HTTP roundtrips.
- **Runtime Evidence Engine** ──► Receives normalized API latencies.

## 18. Failure Handling

- **SDK Crash / Timeout**
  - *Recovery*: Destroys client instance, sets state to `Uninitialized`, raises failover trigger to broker.
- **Invalid Credentials**
  - *Recovery*: Sets state to `Unhealthy` instantly, prevents subsequent API calls until manual reboot.

## 19. Runtime Metrics

Target KPIs:
- **Roundtrip API Latency**: Model-dependent (target < 3s).
- **Initialization Success**: % of connector boot-up success.
- **Rate Limit Triggers**: Number of HTTP 429 occurrences.
- **Normalization Error Rate**: % of malformed outputs.

## 20. Security

- **Credential Boundaries**: API Keys must be read from env parameters (`process.env.*`). Adapters are prohibited from writing keys to disk files or logs.
- **Sandbox Bounds**: Adapters are execute-restricted, meaning they lack file write rights and network routing capabilities outside the target API endpoint domain.

## 21. Risks

- **Vendor API Deprecations**
  - *Mitigation*: Separate adapter versioning from main system codebase.
- **Output Incompatibility**
  - *Mitigation*: Fall back to basic string normalization if JSON parsing fails.

## 22. Readiness Assessment

### Classification: Ready

**Justification**:
- The standard contract, vendor translation pipelines, and error normalizations are fully defined.
- Credential isolation and sandboxing parameters align with system requirements.
- No software implementation code exists, satisfying planning constraints.

The specification is complete. Transition to **Phase 2.6: Communication Transformation Engine Engineering Domain Specification** is authorized.
