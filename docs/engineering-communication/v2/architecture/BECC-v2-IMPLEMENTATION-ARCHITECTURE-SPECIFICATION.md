# BECC v2.0 — Implementation Architecture Specification

An authoritative implementation architecture specification defining the concrete repository structures, module boundaries, dependency rules, interface strategy, configuration management, and deployment boundaries required to realize the BECC v2.0 platform in software.

---

## 1. Executive Summary

This document establishes the official **Implementation Architecture Specification** for the **BridGenta Engineering Communication Constitution (BECC) v2.0** platform. Its purpose is to bridge the gap between approved high-level engineering domain designs and functional software code.

By mapping the modular structures of the Canonical Data Model (CDM) and domain specifications onto concrete software modules, this specification ensures that future development adheres strictly to constitutional boundaries, maintains unidirectional dependencies, and preserves provider neutrality.

---

## 2. Architectural Principles

To ensure that the software realization remains constitutionally compliant, the implementation layer inherits the four core principles approved in the BECC v2.0 system design:

1. **Human Accountability (Constitutional Authority)**: The software runtime must treat all AI-generated text as advisory. The write operations back to the target repository are strictly blocked until a cryptographic authorization token is signed by an authenticated human reviewer.
2. **Deterministic Explainability (Traceability)**: Every text amendment must map back to a verified rule in the Knowledge Bundle, identifying the exact source line and rule hash.
3. **Fail-Secure Isolation (Security)**: The runtime operates with read-only defaults. Any transient failure in validation, network transport, or state transition aborts the session and restores the repository workspace to its target baseline.
4. **Provider Independence (Modularity)**: Domain engines communicate using provider-neutral CDM objects. All model-specific APIs and prompt configurations must remain isolated behind adapter interfaces.

---

## 3. Repository Architecture

The software codebase shall be structured as a monorepo containing the following modules under a unified root directory:

```text
becc-runtime/
├── bin/                        ◄── Command Line Interface (CLI) entry points
├── runtime/                    ◄── central orchestration state machine
├── connector/                  ◄── Project discovery and context resolution
├── resolver/                   ◄── Markdown rule crawling and override evaluation
├── bundle-builder/             ◄── Compilation and hashing of rules
├── broker/                     ◄── Model routing and capabilities registry
├── adapters/                   ◄── Provider-specific implementations (e.g., Gemini)
├── transformation/             ◄── Prompt compilation and diff reconstruction
├── validation/                 ◄── AST parsing, link audits, and terminology checks
├── review/                     ◄── Dashboard rendering and approval gates
├── evidence/                   ◄── Cryptographic ledger and trace recording
└── shared/                     ◄── Canonical CDM interfaces and schema helpers
```

---

## 4. Module Boundaries

Every engineering domain maps directly to a bounded implementation module:

1. **Project Connector Domain** $\rightarrow$ `connector/`
2. **Knowledge Resolver Domain** $\rightarrow$ `resolver/`
3. **Knowledge Bundle Builder Domain** $\rightarrow$ `bundle-builder/`
4. **Provider Broker Domain** $\rightarrow$ `broker/`
5. **Provider Adapter Domain** $\rightarrow$ `adapters/`
6. **Communication Transformation Engine Domain** $\rightarrow$ `transformation/`
7. **Validation Engine Domain** $\rightarrow$ `validation/`
8. **Human Review Engine Domain** $\rightarrow$ `review/`
9. **Runtime Evidence Engine Domain** $\rightarrow$ `evidence/`
10. **Runtime Orchestrator Domain** $\rightarrow$ `runtime/`

---

## 5. Dependency Rules

The implementation enforces a strict unidirectional dependency hierarchy. Circular dependencies are strictly prohibited at the build level.

### Layered Dependency Hierarchy

```text
 [runtime] ◄── central orchestration layer
    │
    ├─► [connector] ──► [shared]
    ├─► [resolver]  ──► [shared]
    ├─► [bundle-builder] ──► [shared]
    ├─► [broker]    ──► [adapters] ──► [shared]
    ├─► [transformation] ──► [shared]
    ├─► [validation] ──► [shared]
    ├─► [review]    ──► [shared]
    └─► [evidence]  ──► [shared]
```

### Dependency Principles
- **The Core Rule**: Upstream modules cannot import downstream modules (e.g., `resolver/` cannot import `bundle-builder/`).
- **Shared Access**: The `shared/` module contains the interfaces, DTOs, and schemas defined in the CDM. It has zero dependencies on other modules.
- **Provider Decoupling**: The `broker/` module imports the abstract interfaces from `adapters/` but remains decoupled from specific vendor packages (like `@google/generative-ai`). Vendor packages are isolated inside `adapters/`.

---

## 6. Runtime Composition

The runtime composition utilizes a Dependency Injection (DI) model managed by the `runtime/` Orchestrator. 

At startup, the CLI entry point resolves configurations and injects concrete instances of the domain services into the `RuntimeOrchestrator` constructor:

```typescript
// Conceptual composition pattern for the CLI startup bootstrap
const connector = new ProjectConnectorService();
const resolver = new KnowledgeResolverService();
const builder = new BundleBuilderService();
const broker = new ProviderBrokerService([new GeminiAdapter()]);
const transformer = new TransformationEngineService();
const validator = new ValidationEngineService();
const reviewer = new HumanReviewEngineService();
const evidence = new EvidenceEngineService();

const orchestrator = new RuntimeOrchestrator(
  connector,
  resolver,
  builder,
  broker,
  transformer,
  validator,
  reviewer,
  evidence
);

orchestrator.execute(request);
```

This composition ensures that domain logic remains decoupled from the orchestrator and facilitates mock testing during validation phases.

---

## 7. Interface Strategy

Modules communicate exclusively using standard, strongly-typed asynchronous interfaces defined in the `shared/` module. 

- **Payload Strategy**: All payloads conform strictly to the Canonical Data Model (CDM) schemas. No raw JSON strings or model-specific objects may be passed between domain modules.
- **Provider Abstraction**: Adapters must implement a standard `ModelAdapter` interface:
  ```typescript
  interface ModelAdapter {
    id: string;
    capabilities: string[];
    execute(request: CDM.TransformationRequest): Promise<CDM.TransformationResponse>;
  }
  ```
- **Platform Independence**: Interface schemas use standard, platform-neutral data types (e.g. ISO timestamps, UTF-8 strings, and relative file paths) to ensure compatibility across execution hosts.

---

## 8. Canonical Data Model Mapping

The software modules map to CDM objects as follows:

| CDM Object | Generating Module | Primary Consuming Module | Validation Stage |
| :--- | :--- | :--- | :--- |
| **AssessmentContext** | `connector/` | All downstream modules | Schema check upon initialization |
| **KnowledgeReference** | `resolver/` | `bundle-builder/` | Path containment validation |
| **KnowledgeBundle** | `bundle-builder/` | `transformation/`, `validation/` | SHA-256 integrity signature check |
| **TransformationRequest**| `transformation/` | `broker/` | Scope verification against context |
| **TransformationResponse`| `broker/` | `transformation/` | XML container balance check |
| **ValidationReport** | `validation/` | `review/` | AST correctness check |
| **ReviewDecision** | `review/` | `evidence/` | Cryptographic signature validation |
| **RuntimeEvidence** | `evidence/` | Core filesystem registry | Append-only write verification |

---

## 9. Configuration Strategy

Configurations are classified into four distinct boundaries to prevent settings pollution:

1. **Runtime Configuration**: Manages process timeouts, retries, and logging levels. Loaded via environment variables (`BECC_TIMEOUT`, `BECC_ENV`) or CLI flags.
2. **Provider Configuration**: Contains model preferences, safety thresholds, and capability registers. Stored in a local `provider-settings.json` file.
3. **Project Configuration**: Repository-specific settings, target documents, and volume associations. Loaded from the `.becc/becc.config.json` inside the scanned repository.
4. **Feature Flags**: Evaluates experimental capabilities (e.g. parallel validation, structural link checking) without altering base packages. Loaded from environment flags (`BECC_ENABLE_PARALLEL_VALIDATION`).

---

## 10. Observability Strategy

Observability is a critical element of runtime compliance. The orchestrator records telemetry across four layers:

- **Structured Logging**: Outputs execution progress to stdout/stderr in standardized JSON format:
  ```json
  {"timestamp":"2026-07-13T10:54:00Z","level":"info","session_id":"UUID-v4","module":"runtime","event":"StateChanged","payload":{"from":"Initializing","to":"Running"}}
  ```
- **Runtime Events**: Tracked via Event Bus dispatches to build the dynamic execution tree.
- **Metrics Collection**: Aggregates step latencies, model response times, context input/output tokens, and bundle compilation sizes.
- **Evidence Trail**: Cryptographically signs the execution log using SHA-256 hashes to generate the immutable `RuntimeEvidence` trail.

---

## 11. Security Architecture

The implementation enforces standard security boundaries to isolate data and credentials:

- **Secret Isolation**: Domain modules are prohibited from accessing API keys or token stores. All authentication tokens reside inside the execution environment and are passed directly to `adapters/` endpoints via secure runtime configurations.
- **Sandbox Traversals**: The `resolver/` module executes in a sandboxed, read-only child process, preventing directory write access.
- **Path Escape Prevention**: All input document targets and repository targets are checked against a canonical path resolver to prevent path traversal attacks (e.g. `../../etc/passwd` injection).
- **Execution Cryptography**: All transitions to the `Completed` state require verification of the Human Review signature token.

---

## 12. Testing Strategy

The quality assurance pipeline mandates coverage across four testing tiers:

1. **Unit Tests**: Employs mocks for the Event Bus and individual domains to verify state transitions and error handlers in `runtime/`.
2. **Integration Tests**: Tests the interactions between `resolver/`, `bundle-builder/`, and `transformation/` using static file fixtures.
3. **Constitutional Compliance Tests**: Runs validation rules against target test documents to verify that the `validation/` module successfully flags known non-conformities (re-evaluating Pilot 1 scenarios).
4. **Operational Readiness Tests**: Executes end-to-end CLI validation dry-runs against the active repository workspace.

---

## 13. Deployment Architecture

The software shall be packaged and deployed as a self-contained command-line utility (CLI) and package library:

- **CLI Distribution**: Compiled as a standalone binary or distributed via npm registry.
- **VCS Independence**: The runtime executes git queries via process spawns (`exec git`) without embedding version-control client libraries.
- **State Persistence**: The runtime runs statelessly, relying on the local filesystem and Event Bus for session state management.

---

## 14. Evolution Strategy

The architecture accommodates new capabilities without requiring core redesign:

- **Adding a Provider**: Requires authoring a new class in `adapters/` implementing the `ModelAdapter` interface, and registering it inside `broker/` settings. No change is made to the orchestrator or transformation engines.
- **Adding a Domain**: Encompasses adding a new module folder, defining its CDM schemas in `shared/`, registering its events on the Event Bus, and appending its execution step inside `runtime/`.

---

## 15. Migration Strategy

The transition from BECC v1.0 GA (Manual and Scripted Auditing) to v2.0 (Automated Runtime Orchestration) follows a three-stage roadmap:

1. **Stage 1 (Parallel Auditing)**: Run the BECC v2.0 CLI tool in `--dry-run` mode alongside the manual v1.0 check sheets during audits.
2. **Stage 2 (Automated Gates)**: Transition all CI/CD workflows to invoke the BECC v2.0 validation step, replacing legacy shell linters.
3. **Stage 3 (Full Integration)**: Decommission all manual auditing checklists, designating BECC v2.0 as the single source of operational compliance.

---

## 16. Risks

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Race Conditions in Approvals** | Double-sign collision | Implement optimistic locking hashes on the review session databases. |
| **Memory Leak in Rule Bundling** | Runtime crash | Streams large rule files instead of parsing complete documents in-memory. |
| **VCS Workspace Contamination** | Repository corruption | Execute all write transformations on a dedicated feature branch; execute standard resets upon error. |
| **Provider API Changes** | Broken broker calls | Maintain strict API version constraints in vendor packages in `adapters/`. |

---

## 17. Readiness Assessment

### Specification Coverage
- Conformance to EDS v1.0 standard: **Pass**
- Alignment with CDM schema: **Pass**
- Clean separations of modular boundaries: **Pass**
- Provider-neutral strategy: **Pass**

---

## 18. Engineering Decision

### Classification: READY FOR IMPLEMENTATION

**Justification**:
- The implementation specification successfully maps all domain dependencies without introducing circular references.
- Decoupling, interfaces, configuration layers, and testing strategies are fully defined.
- Zero codebase code has been implemented, conforming to phase objectives.

Transition to the coding phase for the BECC v2.0 platform is authorized.
