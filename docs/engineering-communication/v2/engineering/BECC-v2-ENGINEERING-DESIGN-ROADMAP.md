# BECC v2.0 — Phase 2.0 Engineering Design Roadmap

An authoritative engineering design roadmap defining domains, bounded contexts, layers, contracts, dependencies, validation strategies, and sprint sequences for BECC v2.0.

## 1. Engineering Vision

The engineering vision for BECC v2.0 is to translate the constitutional principles and validation rules of the Reference Knowledge Framework (RKF) into a robust, provider-independent, and trace-validated software platform.

### Architectural Philosophy
- **Design by Contract**: Interaction across components must rely on strict, immutable schemas.
- **Separation of Concerns**: Keep knowledge discovery, provider communication, validation checks, and human review isolated.
- **Defensive Execution**: Run validation logic locally on the BECC server rather than trusting provider outputs.

### Engineering Principles
- **Authority Preservation**: Active RKF volumes must remain the ultimate source of truth. Software cannot invent rules.
- **Zero-Trust Input**: Treat all provider-generated content as untrusted until validated locally.
- **Repeatability**: Resolver and validation logic must be fully deterministic.

## 2. Engineering Domains

The system is organized into the following major engineering domains:

1. **Knowledge Resolution**
   - *Purpose*: Reads and parses RKF documentation.
   - *Responsibilities*: Filesystem indexing, candidate discovery, override evaluation.
   - *Dependencies*: Local filesystem.
   - *Future Evolution*: Support remote git repository tracking.
2. **Knowledge Bundle Assembly**
   - *Purpose*: Compiles resolved rules.
   - *Responsibilities*: Serialization into JSON/YAML schemas, version hash creation.
   - *Dependencies*: Knowledge Resolution.
3. **Provider Brokerage**
   - *Purpose*: Normalizes LLM access.
   - *Responsibilities*: Adapter routing, payload abstraction.
   - *Dependencies*: Infrastructure network layer.
4. **Communication Transformation**
   - *Purpose*: Conducts AI text transformation.
   - *Responsibilities*: Injects prompts, executes transformations.
   - *Dependencies*: Provider Brokerage, Bundle Assembly.
5. **Validation**
   - *Purpose*: Audits compliance.
   - *Responsibilities*: Structural validation, terminology audit, rule compliance checks.
   - *Dependencies*: Knowledge Resolution, Bundle Assembly.
6. **Human Review**
   - *Purpose*: Implements the approval gate.
   - *Responsibilities*: Renders output dashboards, processes merge triggers.
   - *Dependencies*: Validation.
7. **Runtime Observation**
   - *Purpose*: Telemetry collection.
   - *Responsibilities*: Logs observations, registers drift.
   - *Dependencies*: Infrastructure logging.

## 3. Bounded Contexts

To isolate domains and define strict boundaries, BECC v2.0 establishes six Bounded Contexts:

```text
┌────────────────────────────────────────────────────────┐
│                    Resolver Context                    │
│  (Traverses docs/, resolves overrides, compiles index) │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Bundle Context                     │
│  (Assembles active rules & terms into JSON/YAML bundle)│
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Provider Context                    │
│  (Context injection, LLM abstraction, adapter routing) │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Validation Context                   │
│  (Checks schema, audits vocabulary, verifies rules)    │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Review Context                     │
│  (Dashboard rendering, human approval / rejection gate)│
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Runtime Context                     │
│  (Telemetry, observations logs, drift audits tracking) │
└────────────────────────────────────────────────────────┘
```

## 4. Engineering Layers

BECC v2.0 adopts a classic layered architecture to separate UI from domain and infrastructure logic:

1. **Presentation Layer**
   - Renders the Human Review Dashboard.
   - Displays validation reports and metrics overview.
2. **Application Layer**
   - Orchestrates request execution.
   - Manages transformation jobs and triggers validation.
3. **Domain Layer**
   - Houses the core business rules: override logic, terminology matching, and compliance validation.
4. **Knowledge Layer**
   - Indexes and traverses the RKF filesystem.
   - Performs override priorities evaluation.
5. **Provider Layer**
   - Houses the Provider Broker and adapter implementations.
6. **Infrastructure Layer**
   - Local filesystem utilities.
   - SHA-256 hash calculator.
   - Database/cache persistence.
   - Logging and telemetry recorders.

## 5. Core Components

The following software components must be engineered in Phase 2:
- **Knowledge Resolver**: Traverses files, indexes folders, and evaluates active authority states.
- **Bundle Builder**: Assembles resolved rules and term lists into JSON/YAML files.
- **Provider Broker**: The decoupled interface routing requests to active LLM adapters.
- **Provider Adapter**: Model-specific client wrappers (e.g. GeminiAdapter, ClaudeAdapter).
- **Transformation Engine**: Manages prompt templates, context container injection, and response parsing.
- **Validation Engine**: Performs schema checks, term Audits, and rules checks.
- **Review Engine**: Manages review dashboard states (Approval, Rejection, Iteration).
- **Runtime Evidence Engine**: Records observations to \`docs/runtime/\` logs.
- **Metrics Engine**: Aggregates latency, compliance, and drift metrics.

## 6. Provider Architecture

The provider layer decouples core domain logic from vendor APIs using the **Adapter Pattern**:

```text
                 [Transformation Engine]
                            │
                            ▼
                    [Provider Broker]
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
  [ClaudeAdapter]    [GeminiAdapter]    [ChatGPTAdapter]
         │                  │                  │
         ▼                  ▼                  ▼
    (Claude API)      (Gemini API)       (ChatGPT API)
```

Supported adapters:
- **Antigravity Adapter**: Reference model implementation.
- **Claude Adapter**: High-context transformations.
- **Gemini Adapter**: Fast reasoning pipelines.
- **ChatGPT Adapter**: Standard communication layouts.
- **Codex Adapter**: Schema validations.

## 7. Engineering Contracts

Interaction between contexts relies on conceptual data contracts:

1. **Knowledge Bundle Contract**
   - Mapped data: Resolved principles list, terminology vocab list, document specification rules, schema versions, source hashes.
2. **Transformation Request Contract**
   - Mapped data: Target text input, active domains, context boundaries, prompt rules.
3. **Transformation Result Contract**
   - Mapped data: Output transformed text, model rationale, confidence metric, traceability line links.
4. **Validation Report Contract**
   - Mapped data: Pass/Fail status, structural schema validation score, terminology drift errors, failed constitutional rules list, explainability score.
5. **Review Decision Contract**
   - Mapped data: Approved/Iterated/Rejected state, review timestamp, reviewer ID, comments.
6. **Runtime Evidence Contract**
   - Mapped data: Execution metrics, validation failures, drift log list.

## 8. Engineering Dependencies

Dependencies flow downward from presentation to infrastructure:

```text
   [Presentation Layer] (Dashboard)
            │
            ▼
    [Application Layer] (Orchestration)
            │
            ▼
      [Domain Layer] (Validation Rules)
            │
            ▼
    [Knowledge Layer] (Resolver / Bundle Builder)
            │
            ▼
     [Provider Layer] (Broker / Adapters)
            │
            ▼
  [Infrastructure Layer] (File Access / Loggers)
```

*Sequencing Principle*: Infrastructure and Knowledge layers must be built first, followed by Provider interfaces, Domain rules, and UI dashboards.

## 9. Validation Strategy

Validation occurs at every tier of the platform:
- **Unit Validation**: Tests the Knowledge Resolver on dummy mock folder structures.
- **Integration Validation**: Assures that the Provider Broker correctly formats payloads for active adapters.
- **Constitutional Validation**: Verifies that generated text complies with active volumes.
- **Communication Validation**: Assesses tone, readability, and explainability.
- **Provider Validation**: Evaluates model-specific output drifts.
- **Runtime Validation**: Validates database integrity and evidence log writes.

## 10. Human Workflow

The system enforces a strict human-in-the-loop lifecycle:
1. **Trigger**: Developer/system requests communication transformation.
2. **Execution**: Resolver compiles bundle -> LLM transforms text -> Validator checks compliance.
3. **Draft Staging**: The staged output, validator reports, and traceability links are rendered on the review dashboard.
4. **Human Review**:
   - *Approve*: Pushes changes to the main branch.
   - *Iterate*: Feeds comments back into the request context container and reruns.
   - *Reject*: Terminates the process and logs failure evidence.
5. **Publication/Rollback**: Handled via standard git hooks and release management.

## 11. Development Strategy

The engineering sequence progresses in eight distinct phases:

```text
Foundation (Contracts) ──► Knowledge Layer ──► Provider Layer ──► Transformation ──► Validation ──► Review ──► Runtime ──► Operational Pilot
```

## 12. Sprint Roadmap

The Phase 2 sprints:

- **Sprint 2.1: Knowledge Bundle Contracts**
  - *Scope*: Define JSON/YAML schemas for compiled Knowledge Bundles.
- **Sprint 2.2: Knowledge Resolver**
  - *Scope*: Develop filesystem scanner, override evaluator, and caching logic.
- **Sprint 2.3: Provider Contracts**
  - *Scope*: Design Request, Result, and Adapter contracts.
- **Sprint 2.4: Provider Broker**
  - *Scope*: Implement the broker class and model registry.
- **Sprint 2.5: Antigravity Adapter**
  - *Scope*: Build the reference adapter implementation.
- **Sprint 2.6: Transformation Engine**
  - *Scope*: Build the context injection and template manager.
- **Sprint 2.7: Validation Engine**
  - *Scope*: Code the terminology, structural, and compliance validators.
- **Sprint 2.8: Review Dashboard**
  - *Scope*: Develop the UI interface and approval control hooks.
- **Sprint 2.9: Operational Pilot**
  - *Scope*: Deploy the end-to-end resolver for validation pilot testing.

## 13. Risks

- **Risk 1: Provider Coupling**
  - *Impact*: Code becomes locked to a specific provider api.
  - *Mitigation*: Enforce adapter abstraction in Sprint 2.4. Core engines must never reference provider libraries directly.
- **Risk 2: Performance Latency**
  - *Impact*: Iterative directory traversal is slow.
  - *Mitigation*: Index metadata in memory upon boot, refreshing only when filesystem hashes change.
- **Risk 3: Cache Drift**
  - *Impact*: Stale rules are resolved.
  - *Mitigation*: Run automated pre-execution SHA check checks in the resolver.

## 14. Readiness

### Classification: Ready

**Justification**:
- The constitutional specification (CDS v1.0) is finalized and committed.
- The readiness review board (ARB) has cleared all planning blocks.
- Bounded contexts, layers, contracts, and sprint roadmaps are fully mapped out.

The project is fully authorized to transition to **Phase 2.1: Engineering Domain Specifications**.
