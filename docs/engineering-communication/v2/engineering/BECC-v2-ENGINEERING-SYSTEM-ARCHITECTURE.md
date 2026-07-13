# BECC v2.0 — Engineering System Architecture

An authoritative engineering document defining the runtime system overview, component catalog, orchestration architecture, state model, event model, data flow, component interactions, failure handling, observability, security, and scalability architectures for BECC v2.0.

## 1. Engineering Vision

The Engineering System Architecture defines the operational runtime framework for BECC v2.0. It bridges the gap between the high-level roadmap and concrete engineering domain specifications.

### Alignment to Planning and Roadmap
- **Constitutional Planning**: Preserves authority boundaries. All active laws and terminology assets reside in the read-only Reference Knowledge Framework (RKF).
- **Engineering Roadmap**: Operationalizes the bounded contexts and core components identified in Phase 2.0.

### Engineering Philosophy
- **Decoupled Orchestration**: Orchestrators coordinate component workflows without being coupled to specific vendor adapters.
- **Fail-Safe Validation**: Validator layers run locally and independently of AI models, protecting the system against model hallucinations.
- **Durable Traceability**: Every intermediate artifact must be uniquely identifiable, versioned, and audit-ready.

## 2. Runtime System Overview

The BECC v2.0 runtime request-flow:

```text
       [User Request]
              │
              ▼
    [Assessment Engine] (Initiates context)
              │
              ▼
   [Knowledge Discovery] (Scans files based on orientation rules)
              │
              ▼
    [Knowledge Resolver] (Applies overrides, outputs active index)
              │
              ▼
   [Knowledge Bundle Builder] (Compiles JSON/YAML bundle)
              │
              ▼
      [Provider Broker] (Abstracts API access)
              │
              ▼
      [Provider Adapter] (Gemini, Claude, ChatGPT, Codex, Antigravity)
              │
              ▼
        [AI Provider] (Performs text transformation)
              │
              ▼
   [Transformation Engine] (Formats response output)
              │
              ▼
     [Validation Engine] (Performs schema, vocab, and rules checks)
              │
              ▼
       [Review Engine] (Dashboard preview and approval gate)
              │
              ├────────────────────────┐
              ▼                        ▼
     [Publication Engine]     [Runtime Evidence Engine]
      (Commits output)         (Logs observations/drift)
```

## 3. Runtime Components

Every software component runs within strict boundaries:

1. **Assessment Engine**
   - *Purpose*: Initiates the review job.
   - *Responsibilities*: Collects target text, maps domain criteria.
   - *Dependencies*: None.
   - *Ownership*: Presentation/Application layers.
2. **Knowledge Resolver**
   - *Purpose*: Filters and overrides RKF files.
   - *Responsibilities*: Scans `docs/`, evaluates override hierarchy (Canon > Volumes > Specs).
   - *Dependencies*: Local filesystem.
   - *Ownership*: Knowledge Layer.
3. **Bundle Builder**
   - *Purpose*: Assembles the active context.
   - *Responsibilities*: Generates JSON/YAML Knowledge Bundles, calculates SHA-256 hashes.
   - *Dependencies*: Knowledge Resolver.
   - *Ownership*: Knowledge Layer.
4. **Provider Broker**
   - *Purpose*: Abstracts the AI models.
   - *Responsibilities*: Normalizes api calls, handles failover routing.
   - *Dependencies*: Infrastructure Network.
   - *Ownership*: Provider Layer.
5. **Provider Adapter**
   - *Purpose*: Normalizes vendor SDKs.
   - *Responsibilities*: Formats messages for specific APIs (Gemini, Claude, ChatGPT, Codex, Antigravity).
   - *Dependencies*: Provider Broker, Vendor API.
   - *Ownership*: Provider Layer.
6. **Transformation Engine**
   - *Purpose*: Wraps transformations.
   - *Responsibilities*: Injects context containers, parses responses.
   - *Dependencies*: Provider Broker, Bundle Builder.
   - *Ownership*: Application/Domain Layers.
7. **Validation Engine**
   - *Purpose*: Audits generated outputs locally.
   - *Responsibilities*: Schema check, terminology audit, rule compliance validation.
   - *Dependencies*: Bundle Builder.
   - *Ownership*: Domain Layer.
8. **Review Engine**
   - *Purpose*: Implements human-in-the-loop controls.
   - *Responsibilities*: Renders dashboard draft, handles approve/reject/iterate inputs.
   - *Dependencies*: Validation Engine.
   - *Ownership*: Presentation Layer.
9. **Publication Engine**
   - *Purpose*: Finalizes changes.
   - *Responsibilities*: Staging and committing verified communications.
   - *Dependencies*: Review Engine.
   - *Ownership*: Infrastructure Layer.
10. **Runtime Evidence Engine**
    - *Purpose*: Logs telemetry.
    - *Responsibilities*: Appends logs to `runtime/debugging-log.md` and `runtime/drift-inventory.md`.
    - *Dependencies*: Local filesystem.
    - *Ownership*: Infrastructure Layer.
11. **Metrics Engine**
    - *Purpose*: Monitors performance.
    - *Responsibilities*: Aggregates latency, token counts, and drift scores.
    - *Dependencies*: Runtime Evidence Engine.
    - *Ownership*: Infrastructure Layer.

## 4. Orchestration Architecture

### Orchestration Model
BECC v2.0 utilizes a **Centralized Coordinator Pattern** managed by the **Assessment Engine Coordinator (AEC)**.
- **Workflow Controller**: The AEC coordinates transitions from initiating the request, to resolving rules, calling the broker, validating, and presenting the final dashboard state.
- **Transaction Isolation**: Each assessment run executes inside an isolated runtime thread or sandbox, preventing concurrent jobs from cross-pollinating rule states.
- **Rollback Coordination**: If any component fails (e.g. LLM timeout), the AEC catches the exception, cancels active threads, logs failure metadata, and resets the job state.

## 5. Runtime State Management

The job lifecycle is governed by a strict state machine:

```text
[Draft] ──► [Assessing] ──► [Resolving] ──► [Transforming] ──► [Validating] ──► [Reviewing]
                                                                                   │
                                               ┌───────────────────────────────────┤
                                               ▼                                   ▼
                                           [Approved]                          [Rejected]
                                               │                                   │
                                               ▼                                   ▼
                                          [Published]                          [Archived]
```

### State Definitions
- **Draft**: Job is initialized, target text is loaded.
- **Assessing**: Matching domains and target criteria.
- **Resolving**: Resolver scans RKF and evaluates active volumes.
- **Transforming**: Context prompt is compiled and LLM is invoked.
- **Validating**: Local validation scripts audit output.
- **Reviewing**: Output is staged on dashboard awaiting human review.
- **Approved**: Reviewer signs off.
- **Rejected**: Output is dismissed; system loops back to draft with comments.
- **Published**: Final output is committed.
- **Archived**: Audited job records are zipped.

*State Persistence*: The job status is saved to a local state database (e.g., SQLite or State JSON files) at the completion of every transition. If runtime is interrupted, the coordinator resumes execution from the last persisted state checkpoint.

## 6. Event Architecture

To decouple logging and metrics from core execution, the coordinator publishes events to a local **Event Bus**:

| Event | Producer | Consumer(s) | Purpose |
|-------|----------|-------------|---------|
| **Assessment Created** | Assessment Engine | Knowledge Resolver | Triggers directory scans. |
| **Knowledge Resolved** | Knowledge Resolver | Bundle Builder | Triggers JSON compilation. |
| **Bundle Generated** | Bundle Builder | Transformation Engine | Compiles prompt context. |
| **Provider Invoked** | Provider Broker | Runtime Evidence Engine | Logs LLM token metrics. |
| **Transformation Completed** | Transformation Engine | Validation Engine | Initiates post-execution checks. |
| **Validation Failed** | Validation Engine | Review Engine, Evidence | Displays errors on dashboard, logs drift. |
| **Review Requested** | Validation Engine | Review Engine (Dashboard) | Prompts human sign-off. |
| **Review Approved** | Review Engine | Publication Engine | Triggers git commit. |
| **Published** | Publication Engine | Metrics Engine, Runtime | Audits final deployment. |

## 7. Data Flow

Detailed engineering data flow:

```text
   [User Request]
         │
         ▼ (Job Payload: target_text, target_domains)
  [Assessment Engine]
         │
         ▼ (Discovery Index: list of applicable files)
  [Knowledge Resolver]
         │
         ▼ (Knowledge Bundle: principles, terms, specifications)
   [Bundle Builder]
         │
         ▼ (Context Payload: <CONSTRAINTS> + target_text)
  [Provider Broker] ──► (Transformed Text + Rationale) ──► [Transformation Engine]
                                                                  │
                                                                  ▼
  [Validation Engine] ◄── (Transformed Output + Bundle Schema) ──┘
         │
         ▼ (Validation Report: score, failures, trace links)
   [Review Engine]
         │
         ▼ (Human Approval / Reject command)
 [Publication Engine]
         │
         ▼ (Commits to Git & writes to runtime logs)
[Runtime Evidence]
```

## 8. Component Interaction Matrix

Audited system interfaces:

| Source | Destination | Interaction Type | Responsibility | Authority | Dependency |
|--------|-------------|------------------|----------------|-----------|------------|
| **Assessment Engine** | **Resolver** | Sync Call | Supplies target domains. | Low | Resolver interface. |
| **Resolver** | **Bundle Builder** | Sync Call | Feeds file structures list. | Medium | Bundle schemas. |
| **Bundle Builder** | **Transform Engine** | Data Object | Feeds compiled rules JSON. | High | Bundle structure. |
| **Transform Engine** | **Provider Broker** | Async Call | Supplies context payload. | Low | Broker API. |
| **Provider Broker** | **Provider Adapter** | Adapter Call | Translates schema format. | Low | Vendor SDK. |
| **Validation Engine** | **Review Engine** | Data Object | Supplies Validation Report. | High | Report schema. |
| **Review Engine** | **Publish Engine** | Action Call | Triggers Git commit. | High | Human approval. |
| **Publish Engine** | **Evidence Engine** | Event | Logs transaction trace. | Low | Telemetry logger. |

## 9. Failure Handling

Defensive recovery paths managed by the Coordinator:

- **Provider Unavailable**
  - *Mitigation*: The Provider Broker catches network/timeout exceptions. It retries with exponential backoff up to 3 times, then falls back to a secondary registered adapter (e.g. Gemini falls back to Antigravity).
- **Resolver Failure**
  - *Mitigation*: If files are missing, the resolver halts execution, marks the job state as `Resolving Failed`, and alerts the operator.
- **Validation Failure**
  - *Mitigation*: If validation scores fall below the target compliance threshold, the coordinator blocks publication, sets the state to `Reviewing (Failed Checks)`, and renders highlighted errors.
- **Review Rejection**
  - *Mitigation*: Clean up temporary staged branches, restore previous work directory status, log the rejection metrics, and notify the author.
- **Bundle Inconsistency**
  - *Mitigation*: If pre-execution SHA-256 check fails, execution aborts, and a pre-commit audit is triggered.

## 10. Observability Architecture

- **Runtime Telemetry**: Captures execution latency, token throughput, and adapter call counts.
- **Audit Events**: Records user ID, action timestamps, validation reports, and git commit hashes.
- **Evidence Collection**: Local validator failures are appended to `docs/runtime/debugging-log.md` and `docs/runtime/drift-inventory.md`.
- **Metrics**: Aggregates terminology drift counts and rule compliance percentages.

## 11. Security Architecture

- **Authority Protection**: The resolver executes inside a read-only sandboxed process, preventing runtime code from writing to active constitutional volume folders.
- **Provider Isolation**: Decoupled adapters prevent API keys and credentials from entering prompt templates.
- **Provenance Protection**: Every compiled Knowledge Bundle is signed with a SHA-256 hash. Validation checks audit this hash before processing.

## 12. Scalability Architecture

- **Multiple Providers**: Broker supports routing requests to local and cloud-based LLM APIs.
- **Multiple Repositories**: Discovery engine uses relative path mappings, supporting scanning of multiple workspace targets.
- **Concurrent Assessments**: Job coordinator runs inside independent worker threads, preventing memory leaks and state pollution.

## 13. Engineering Boundaries

- **Validation vs. Transformation**: Validators run locally on the server, separate from the AI Provider layer, ensuring validation logic is never delegated to LLMs.
- **Orchestration vs. Providers**: The Coordinator manages workflow states; providers are pure mathematical translators.
- **Human vs. Automation**: Automated validation provides checks, but human review maintains merge veto authority.

## 14. Engineering Risks

- **Race States on Dual Reviews**
  - *Impact*: Two reviewers approve different drafts concurrently.
  - *Mitigation*: Implement optimistic lock hashes on state files.
- **Adapter Coupling**
  - *Impact*: Core engine breaks when provider libraries update.
  - *Mitigation*: Enforce strict Request/Result schemas in the broker layer.
- **Cache Drift**
  - *Impact*: Resolver parses cached configurations instead of updated filesystem structures.
  - *Mitigation*: Calculate and compare folder hashes before every runtime loop.

## 15. Readiness Assessment

### Classification: Ready

**Justification**:
- The orchestration model, execution lifecycle, event flows, and data streams are fully established.
- The component interaction matrix and recovery strategies are defined.
- Conformance criteria and security structures conform to Phase 1.

The Engineering System Architecture is complete. Transition to **Phase 2.1: Engineering Domain Specifications** is authorized.
