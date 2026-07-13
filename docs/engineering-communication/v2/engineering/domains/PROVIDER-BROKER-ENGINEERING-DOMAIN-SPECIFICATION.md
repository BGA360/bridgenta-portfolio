# BECC v2.0 — Provider Broker Engineering Domain Specification

An authoritative engineering domain specification defining the identity, purpose, responsibilities, input/output structures, provider selection algorithms, routing strategies, events, and failure handling policies for the Provider Broker.

## 1. Engineering Identity

- **Domain Name**: Provider Broker Domain
- **Version**: 1.0.0
- **Status**: Active
- **Owner**: Provider Broker Engineering Team
- **Scope**: Model routing, adapter management, failover, and request/response normalization.

## 2. Purpose

The Provider Broker is the decoupled interface layer that isolates the core engines of BECC v2.0 from vendor-specific LLM APIs. It translates canonical requests, selects the optimal active model adapter based on health and capability, executes retries and failover routes, and normalizes output payloads.

## 3. Responsibilities

1. **Adapter Registry Management**: Registers and pings active LLM client wrappers.
2. **Capability Matching**: Directs jobs to eligible models based on context window limits and capabilities.
3. **Health Monitoring**: Processes response states, marking unresponsive models offline.
4. **Orchestrated Routing**: Handles retries, timeout thresholds, and adapter fallback pipelines.
5. **Payload Normalization**: Decouples vendor APIs, converting responses to standard CDM structures.

## 4. Explicit Non-Responsibilities

The Provider Broker explicitly does NOT own:
- **Rule Traversal**: Directory parsing and overrides logic belong to the Knowledge Resolver.
- **Bundle Construction**: Rule formatting into JSON/YAML bundles belongs to the Bundle Builder.
- **Compliance Check Algorithms**: Post-execution validator checks belong to the Validation Engine.
- **Dashboard Interfaces**: Human approval workflows belong to the Review Engine.

## 5. Inputs

Consumes the following CDM data objects:
- **Knowledge Bundle**: Compiled active rules, vocabulary assets, and hashes.
- **Transformation Request**: Standard payload enclosing input text and task guidelines.
- **Provider Capability**: Model configuration records (context limits, pricing weights).

## 6. Outputs

Produces:
- **Transformation Response**: Standard payload enclosing output text, model rationale, and trace hashes.
- **Provider Response**: Raw API response wrapper.

## 7. Provider Selection

### Provider Registration
- Adapters are registered in a local configuration registry (e.g. `providers.json`).
- Registered adapters must implement a standard execution interface.

### Provider Capabilities
- The broker parses capabilities metadata: context limit size, support for XML tags, formatting speed.

### Availability & Health Monitoring
- The broker maintains health scoring. If an adapter returns consecutive network/API errors, its health score falls. If score drops below 50%, the broker flags it offline.

### Priority Configuration
- Core routing priorities map models to specific task scopes:
  - **Claude**: Complex layout specs.
  - **Gemini**: Fast text transformations.
  - **ChatGPT**: Standard communication templates.
  - **Antigravity**: Reference testing and local fallback.

## 8. Routing Strategy

### Routing Decisions
- The broker matches request criteria against registered capabilities, selecting the highest-priority online adapter.

### Fallback Routing
- If the selected adapter is unavailable or fails, the broker routes the request to the secondary fallback adapter (e.g. Gemini falls back to Claude, which falls back to Antigravity).

### Retry Strategy
- The broker executes up to 3 retries on network/rate-limit errors with exponential backoff (e.g. 500ms -> 1500ms -> 4500ms).

### Timeout Handling
- API requests enforce a strict 15-second timeout window. If exceeded, the request triggers a timeout exception and initiates fallback routing.

## 9. Provider Independence

All provider integrations are interchangeable:
- Core engines reference the Provider Broker interface exclusively.
- Switching from Claude to Gemini requires updating configuration values in the registry; no application code is modified.
- No model-specific libraries (e.g. Google AI SDK, Anthropic SDK) are imported outside the adapter files.

## 10. Provider Context Delivery

- **Tag Isolation**: The broker normalizes prompt delivery, wrapping rule bundles inside HTML/XML context boundaries (e.g. `<CONSTRAINTS>` or `<VOCABULARY>`).
- **Prompt Isolation**: Custom vendor prompt variables (like system messages) are mapped inside the Adapter layer, keeping the broker payload provider-neutral.

## 11. Runtime Behaviour

The internal broker routing flow:
```text
[Bundle + Request] ──► [Select Adapter] ──► [Verify Health] ──► [Call Adapter Client]
                                                                        │
        ┌───────────────────────────────────────────────────────────────┤
        ▼ (Timeout / Fail)                                              ▼ (Success)
[Execute Fallback / Retry]                                      [Normalize Response]
                                                                        │
                                                                        ▼
                                                             [Transformation Response]
```

## 12. State Management

The broker tracks states in the job transaction log:
- **Idle**: Ready to receive request.
- **Routing**: Evaluating capabilities and registry.
- **Executing**: Dispatched to active adapter.
- **Retrying**: Waiting on backoff delays.
- **Fallback**: Dispatched to secondary fallback adapter.
- **Completed**: Response normalized and returned.
- **Failed**: All fallbacks exhausted. Aborts run.

## 13. Events

- **Consumes**:
  - `Bundle Generated`: Initiates routing.
- **Produces**:
  - `Provider Invoked`: Logs model start timestamp.
  - `Provider Call Completed`: Logs latency and tokens consumed.
  - `Provider Call Failed`: Logs routing/fallback errors.

## 14. Dependencies

- **Upstream**: Knowledge Bundle Builder.
- **Downstream**: Provider Adapter Layer.

## 15. Interactions

- **Bundle Builder** ──► Supplies prompt rule context.
- **Provider Adapters** ──► Receives standardized payload, executes API call.
- **Runtime Evidence Engine** ──► Logs latency and token metrics events.

## 16. Failure Handling

- **Provider Timeout / Unavailable**
  - *Recovery*: Catches exception, updates health ledger, triggers fallback.
- **Invalid API Response**
  - *Recovery*: If response is empty or malformed JSON, treats it as execution failure, retries or falls back.
- **Routing Failure**
  - *Recovery*: If zero eligible adapters are online, coordinator cancels job, logs critical failure alert.

## 17. Runtime Metrics

Target KPIs:
- **Routing Latency**: < 50ms (overhead before provider call).
- **Retry Count**: Total API retries executed.
- **Fallback Usage**: Number of fallback adapter routings triggered.
- **Availability Uptime**: Target > 99.9% uptime across registered adapters.
- **Provider Utilization**: Tracks model token throughput and API costs.

## 18. Security

- **API Key Isolation**: Key credentials reside strictly inside environment variables loaded by adapters. The broker never accesses or logs keys.
- **Input Sanitization**: Before routing, requests are audited to prevent prompt injection scripts.

## 19. Risks

- **Provider API Changes**
  - *Mitigation*: Adapter Standard contract abstracts vendor payloads.
- **Model Output Drift**
  - *Mitigation*: Run local post-execution validation check scripts.

## 20. Readiness Assessment

### Classification: Ready

**Justification**:
- The registry, capability checks, fallback routing, and retry strategies are fully mapped.
- Inputs, outputs, states, and metrics comply with the EDS Standard.
- No code or SDK libraries are imported, satisfying plan constraints.

The specification is complete. Transition to **Phase 2.5: Provider Adapter Standard Engineering Domain Specification** is authorized.
