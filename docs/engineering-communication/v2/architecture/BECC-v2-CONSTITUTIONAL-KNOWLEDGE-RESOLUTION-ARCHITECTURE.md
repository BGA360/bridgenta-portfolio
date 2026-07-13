# BECC v2.0 — Constitutional Knowledge Resolution Architecture

An authoritative architectural design specifying how BECC v2.0 discovers, resolves, compiles, and consumes governed constitutional knowledge from the Reference Knowledge Framework (RKF).

## 1. Architectural Purpose

The Constitutional Knowledge Resolution Architecture bridges the gap between the static filesystem of RKF and the runtime validation requirements of BECC v2.0.

### Why Resolution Exists
The RKF repository contains a vast, nested structure of markdown files. A system cannot safely read these files in an ad-hoc manner during runtime execution. We must have a dedicated architecture to resolve, validate, and compile active rules into a single authoritative context before processing tasks.

### Why BECC Cannot Directly Consume Repository Files
Raw files in the repository contain:
- **Historical design documents**: Exploratory blueprints (e.g. Blueprint v1.0) and superseded system architectures.
- **Educational examples**: Mock code/data under `examples/` that carry zero authority.
- **Templates**: Structural blueprints meant to be filled out, not executed.
- **Runtime logs**: Operational evidence that changes continuously.

Directly consuming these files would result in rule duplication, semantic conflict, and context pollution.

### Governing Knowledge before AI Transformation
In BECC v2.0, AI providers are used to transform raw inputs into structured communications. However, AI models are prone to hallucination. By resolving and assembling a strict **Constitutional Knowledge Bundle** *before* invoking the AI provider, we constrain the LLM's operational context, enforcing durable compliance.

## 2. High-Level Architecture

The flow of request execution and knowledge processing in BECC v2.0:

```text
         [User Request]
                │
                ▼
       [Assessment Context] (Defines target domains & criteria)
                │
                ▼
       [Knowledge Discovery] (Locates candidate files via orientation)
                │
                ▼
       [Knowledge Resolution] (Filters superseded files & resolves conflicts)
                │
                ▼
    [Knowledge Bundle Assembly] (Compiles rules, terms, & specs)
                │
                ▼
      [Transformation Context] (Formats prompt container sections)
                │
                ▼
        [Provider Broker] (Decouples specific LLM integrations)
                │
                ▼
          [AI Provider] (Transforms communication output)
                │
                ▼
          [Validation] (Checks structural & rule compliance)
                │
                ▼
         [Human Review] (Final approval, rejection, or iteration)
                │
                ├────────────────────────┐
                ▼                        ▼
       [Runtime Evidence]       [RKF Evolution] (Via Decisions)
```

## 3. Knowledge Discovery

Knowledge Discovery scans the filesystem to locate candidate documents relevant to the request.
- **Repository Entry Points**: Discovery always begins at `docs/START_HERE.md`, moving to the active volume index files under `docs/project/`.
- **Navigation Rules**: Traversal strictly follows the paths defined in the Repository Navigation Model, skipping non-applicable zones.
- **Discovery Constraints**: The discovery engine is restricted to the `docs/` directory. It is prohibited from crawling root project folders or codebases.
- **Search Boundaries**: Example folders (`docs/examples/`) and archived/historical folders are explicitly excluded from candidates.
- **Deterministic Discovery**: Paths are resolved using filesystem indexing rather than keyword searches, ensuring predictable candidate lists.

## 4. Knowledge Resolution

Knowledge Resolution evaluates the candidate files, filtering out inactive or subordinate rules.
- **Authoritative Sources**: Prioritizes Canon, then Constitutional Volumes in order (Volume 00 to Volume 10), then Domain Specifications (CDS).
- **Superseded Knowledge**: Filters out files explicitly marked as archive, historical, or superseded (e.g. Blueprint v1.0).
- **Precedence Rules**: If two active volumes contain conflicting rules, the resolver prioritizes the lower-numbered foundation volume (e.g. Volume 04 overrides Volume 08).
- **Conflict Resolution**: The resolver relies on explicit metadata mapping and pre-defined acyclic dependencies. The resolver *never guesses* or infers authority.

## 5. Knowledge Bundle Assembly

Authoritative rules are compiled into a single structured, machine-readable **Constitutional Knowledge Bundle** (serialized in JSON or YAML).

### Bundle Components
1. **Constitutional Principles**: Core constraints and validation laws.
2. **Terminology Assets**: Active vocabulary, node types, and edge relationships.
3. **Engineering Rules**: Technical validation contracts.
4. **Communication Standards**: Readability, explainability, and tone guidelines.
5. **Runtime Observations**: Historical debugging logs or active status constraints.

### Assembly Loading Sequence
To preserve structural integrity, the bundle is compiled sequentially:
```text
Canon (Rules) ──► Core Volume (Ontology) ──► Domain Spec (CDS) ──► Engineering Spec
```

## 6. Transformation Context

The assembled Knowledge Bundle is mapped into the **Transformation Context** sent to the AI provider.
- **Prompt Isolation**: Rules are injected into distinct context containers (e.g. `<CONSTITUTIONAL_CONSTRAINTS>` or `<ACTIVE_VOCABULARY>`).
- **Context Boundaries**: Prohibits the AI provider from referencing external data or guessing rules.
- **Uncertainty Directives**: Directs the provider to explicitly state if rules are ambiguous or context is missing.
- **Scope Restriction**: Constrains the transformation strictly to the user's input request, avoiding scope creep.

## 7. Provider Broker

The **Provider Broker** is an abstraction layer that decouples BECC from specific LLM providers (e.g. Gemini, Claude, ChatGPT).
- **Decoupled API**: Exposes a standard interface for text transformation.
- **Identical Context**: Ensures that regardless of the backend provider, the identical Constitutional Knowledge Bundle is supplied.
- **Failover Routing**: Enables switching between providers without affecting validation or authority rules.
- **Model Independence**: Keeps the core system logic provider-independent.

## 8. Provider Contract

The Provider Contract is a conceptual agreement defining inputs and outputs:

### Inputs
- **Knowledge Bundle**: Sorted, assembled rules and vocabulary.
- **Transformation Request**: Raw user text or target code.
- **Validation Requirements**: Expected structure and constraints.

### Outputs
- **Transformed Communication**: The compliant final text.
- **Design Rationale**: Step-by-step reasoning showing how rules were applied.
- **Uncertainty Assessment**: Flagging of any ambiguous terms.
- **Traceability Metadata**: Identifiers mapping output sentences back to source volume files.

## 9. Constitutional Validation

Once the AI provider returns an output, it must undergo multi-stage validation:
1. **Structural Validation**: Checks output schema (JSON/YAML formatting).
2. **Terminology Validation**: Audits terms against active vocabulary constraints.
3. **Constitutional Validation**: Verifies output complies with active volume rules.
4. **Publication Validation**: Verifies layout and publication standards.
5. **Explainability Validation**: Evaluates cognitive load and readability metrics.

All validation stages are provider-independent, running locally on the BECC server.

## 10. Human Review

Humans remain the ultimate constitutional authority.
- **Review Workflow**: The human reviewer is presented with the transformed output, rationale, and validation check logs.
- **Approval & Merge**: If all checks pass, the human approves, and the changes are committed to the main branch.
- **Rejection & Iteration**: If checks fail or layout is poor, the human rejects the output and triggers another execution loop.

## 11. Runtime Evidence

Operational telemetry is captured during every step:
- **Validator Telemetry**: Logs validation failures, terminology drift, and rule compliance scores.
- **Provider Performance**: Records latencies, token consumption, and model uncertainty levels.
- **Human Corrections**: Logs human modifications and overrides.
- **Feedback Loops**: Telemetry is written directly to `docs/runtime/debugging-log.md` and `docs/runtime/drift-inventory.md`, supporting future repository evolution.

## 12. Knowledge Lifecycle

The full loop of constitutional knowledge:

```text
  [RKF Repository docs] (Durable Truth)
           │
           ▼
  [Knowledge Discovery] (Finds candidate files)
           │
           ▼
  [Knowledge Resolution] (Filters & ranks files)
           │
           ▼
  [Knowledge Bundle Assembly] (Compiles JSON bundle)
           │
           ▼
     [AI Provider] (Performs transformation)
           │
           ▼
     [Validation] (Checks rule compliance)
           │
           ▼
    [Human Reviewer] (Approve/Reject)
           │
     ┌─────┴──────────────────────────────────┐
     ▼                                        ▼
[Approved Output]                    [Telemetry Logging]
(Committed to main)                  (Written to docs/runtime/)
                                              │
                                              ▼
                                     [Decision Record] (Amends rules)
                                              │
                                              ▼
                                     [RKF Repository docs] (Updated)
```

## 13. Architectural Boundaries

Division of system responsibilities:

| Component | Responsibility Scope |
|-----------|----------------------|
| **RKF** | Repository storage of durable files. Holds authority volumes, decisions, and runtime logs. |
| **BECC** | Execution engine. Performs discovery, resolution, assembly, broker management, and validation. |
| **BGCF** | Governance framework. Defines audit rules, compliance checking patterns, and lifecycle gates. |
| **BPGA** | Portfolio automation. Manages site builds and publication workflows. |
| **Provider Layer** | Pure transformation processing. Carries zero authority. |
| **Human Reviewer** | High-level authority. Approves, merges, or rejects changes. |

## 14. Architectural Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Authority Leakage** | AI provider invents rules. | Enforce strict context containers and post-validation checks. |
| **Provider Lock-in** | Dependency on model-specific features. | Standardize input/output structures in the Provider Broker layer. |
| **Stale Knowledge** | Bundle uses outdated cache. | Implement SHA-256 pre-validation hash checks before execution. |
| **Runtime Drift** | Code deviates from volume rules. | Run automated nightly regression checks against runtime logs. |
| **Provenance Loss** | Loose links between output and volumes. | Enforce traceability metadata in the Provider Contract. |

## 15. Readiness Assessment

### Classification: Partially Ready

**Justification**:
- **Repository Discovery**: **Ready**. Navigation models and entry points are fully documented.
- **Authority Mapping**: **Ready**. Override hierarchies and acyclic load orders are fully defined.
- **Bundle Assembly**: **Partially Ready**. While the loader sequence is clear, the exact JSON schema of the compiled bundle requires definition.
- **Provider Broker**: **Partially Ready**. API abstractions are conceptually designed, but model routing details are missing.
- **Validation**: **Partially Ready**. Validation stages are established, but check algorithms are unwritten.
- **Runtime Evidence**: **Ready**. Logs and current-state files provide clear telemetry destinations.

The architectural principles are sufficiently understood to begin designing the **Constitutional Domain Specification (CDS)** in Phase 1.0F, which will provide the concrete schemas and API contracts required before implementation begins.
