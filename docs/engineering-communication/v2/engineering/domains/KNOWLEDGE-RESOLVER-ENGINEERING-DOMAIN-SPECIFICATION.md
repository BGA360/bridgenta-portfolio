# BECC v2.0 — Knowledge Resolver Engineering Domain Specification

An authoritative engineering domain specification defining the identity, purpose, responsibilities, input/output structures, traversal constraints, override algorithms, state behaviors, and validation strategies for the Knowledge Resolver.

## 1. Engineering Identity

- **Domain Name**: Knowledge Resolver Domain
- **Version**: 1.0.0
- **Status**: Active
- **Owner**: Knowledge Resolution Engineering Team
- **Scope**: Traversal, parsing, and authority override resolution within the `docs/` folder snapshot directory.

## 2. Purpose

The Knowledge Resolver is the authoritative gateway between the physical markdown repository and BECC v2.0's execution memory. It crawls the folder structure, filters out superseded blueprints and examples, resolves conflicting rule overrides, and prepares a deterministic set of active rule references for downstream context compilation.

## 3. Responsibilities

1. **Deterministic Discovery**: Scans target directories recursively using filesystem indices starting at onboarding entry points.
2. **Authority Filtering**: Excludes examples, templates, and archived historical versions.
3. **Override Resolution**: Applies acyclic override rules (Canon > Volumes > Domain Specifications).
4. **Line-Level Provenance Mappings**: Extracts rule line numbers and calculates SHA-256 content hashes to preserve traceability.
5. **Canonical Data Outputs**: Packages resolved references into compliant CDM reference objects.

## 4. Explicit Non-Responsibilities

The Knowledge Resolver explicitly does NOT own:
- **Prompt Compiling**: The resolver lists rule pointers; prompt context packaging belongs to the Bundle Builder.
- **Provider Communication**: Resolving LLM APIs belongs to the Provider Broker.
- **Document Generation**: The resolver operates in a read-only sandboxed process.
- **Human Dashboard Rendering**: UI dashboard views are owned by the Review Engine.

## 5. Inputs

Consumes the following Canonical Data Model (CDM) objects:
- **Assessment**: Origination transaction descriptor containing UUID signatures.
- **Assessment Context**: Mapped target criteria, target domains, and folder scanning exclusions.

## 6. Outputs

Produces the following CDM objects:
- **Knowledge Reference**: Collection of resolved file paths, active headers list, and rule hashes.
- **Authority Reference**: Priority ranking indicators.
- **Constitutional Reference**: Read-only rule pointers to Canon.

## 7. Knowledge Discovery

### Traversals and Entry Points
- Traversal always initiates at `docs/START_HERE.md` to parse the baseline hierarchy layout.
- The crawler then moves to the active volume index records under `docs/project/` and matches target folders.

### Navigation Boundaries & Constraints
- The discovery engine is restricted to the snapshot folder. It is prohibited from crawling root project folders or codebases.
- The following subfolders are explicitly excluded from discovery candidates:
  - `docs/examples/`
  - `docs/templates/`
  - Historical blueprints (e.g. `BP-TPCI-v1.0.md`).

## 8. Authority Resolution

### Constitutional Precedence
Authority follows a strict, non-inferential override hierarchy:
```text
Canon (canon/ README) ──► Core Volume (project/00-10) ──► Domain Specification (project/20-CDS)
```

### Override Rules
- If rules overlap, the resolver prioritizes the higher-level parent category (e.g. Canon overrides Volumes).
- Within Core Volumes, foundation layers override downstream specs (e.g. Volume 04 overrides Volume 08). Lower-numbered foundation volumes override higher-numbered volumes.
- If two specifications at the same tier conflict, the resolver halts execution and raises a block exception. No heuristics are used.

### Version Selection
- The resolver parses YAML metadata blocks in markdown headers, filtering out files containing `status: archive` or `status: historical`.
- Only active documents matching the target version filter are evaluated.

## 9. Knowledge Resolution

The resolver performs four core scanning steps:
1. **Repository Scanning**: Crawls files recursively, extracting headings and rule structures.
2. **Authority Verification**: Cross-references files against the classified constitutional matrix.
3. **Provenance Collection**: Maps rules to specific line numbers and registers line-level SHA hashes.
4. **Terminology Resolution**: Extracts vocabulary tables from Volume 01 (`shared-vocabulary.md`) to compile terminology assets.

## 10. Bundle Preparation

The resolver prepares three datasets:
- **Rule Pointers**: Structuring path, heading, rule ID, and line number details.
- **Vocabulary Listings**: Matching terms to official classifications.
- **Provenance Hashes**: SHA-256 hashes generated over rule string inputs to prove rule state immutability.

*Note: The resolver compiles rule metadata but does not execute LLM prompt creation.*

## 11. State Management

The resolver maintains an internal state machine persisted in the Job database:

```text
[Draft] ──► [Scanning] ──► [Resolving] ──► [Validated] (Completed)
                                              │
                                              ▼
                                           [Failed] (Aborted)
```

- **Draft**: Initialized, target path verified.
- **Scanning**: Crawling filesystem indices.
- **Resolving**: Applying override overrides and resolving overrides.
- **Validated**: Mappings successfully compiled and signed.
- **Failed**: Read exception or conflicting override detected. Job aborts.

## 12. Events

- **Consumes**:
  - `Assessment Created`: Initiates traversal.
- **Produces**:
  - `Knowledge Resolved`: Dispatches resolved pointers list.
  - `Resolution Failed`: Dispatches exception details to loggers.

## 13. Dependencies

- **Upstream**: Local filesystem folder structures.
- **Downstream**: Knowledge Bundle Builder.

## 14. Interactions

Component interaction mappings:
- **Assessment Engine Coordinator** ──► Supplies job configuration details.
- **Runtime Evidence Engine** ──► Receives resolver telemetry (document counts, latencies).
- **Validation Engine** ──► Supplies active validation target rules.

## 15. Failure Handling

- **Missing Folder Exceptions**
  - *Recovery*: Logs warnings to evidence logs, continues traversal but skips the target domain.
- **Conflicting Overrides**
  - *Recovery*: Halts job, marks status as `Failed`, raises alert.
- **Trace Loop Breakage (Broken Trace links)**
  - *Recovery*: Halts job and triggers an audit hook.

## 16. Runtime Metrics

Target operational KPIs:
- **Traversal Latency**: < 150ms per run.
- **Scan Count**: Total files index verified.
- **Override Conflicts**: Number of overlapping rules flagged.
- **Trace Completeness**: % of resolved rules containing valid line numbers.

## 17. Security

- **Process Sandboxing**: The resolver runs inside a read-only child process, preventing write operations.
- **Context Integrity**: Before parsing, the resolver verifies the folder directory hash against a pre-commit signature registry.

## 18. Future Evolution

- Remote Git repo crawling support.
- Automated creation of folder indices.

## 19. Risks

- **Cache Drift**: Local changes occur during runs.
  - *Mitigation*: Generate directory SHA hashes before every run.
- **Ambiguity Leakage**: Overlapping rule overrides are resolved incorrectly.
  - *Mitigation*: Enforce absolute override hierarchies (Canon > Volume) with zero heuristics.

## 20. Readiness Assessment

### Classification: Ready

**Justification**:
- Traverse algorithms, override hierarchies, and input/output contracts conform to system guidelines.
- Failure paths, states, and metrics are fully documented.
- No code has been implemented, satisfying sprint constraints.

The domain specification is complete. Transition to **Phase 2.3: Knowledge Bundle Builder Engineering Domain Specification** is authorized.
