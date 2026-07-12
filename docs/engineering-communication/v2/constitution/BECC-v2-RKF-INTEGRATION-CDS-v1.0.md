# BECC v2.0 — RKF Integration Constitutional Domain Specification (CDS v1.0)

An authoritative constitutional domain specification governing the integration between the Reference Knowledge Framework (RKF) and the BridGenta Engineering Communication Constitution (BECC) v2.0.

## 1. Constitutional Identity

- **Domain Name**: Reference Knowledge Framework (RKF) Integration Domain
- **Version**: 1.0.0
- **Status**: Active
- **Constitutional Owner**: BECC Core Governance Committee
- **Repository Scope**: The `docs/engineering-communication/v2/research/rkf-reference/docs/` directory and its operational integration with BECC v2.0.
- **Effective Date**: July 12, 2026

*Note: This specification governs the integration contract between BECC and RKF. It does not redefine the internal constitutional laws of RKF itself.*

## 2. Constitutional Purpose

This integration domain exists to establish a formal, governed, provider-independent, and auditable contract through which BECC is permitted to access and resolve RKF knowledge.

### Problem Solved
Without a formal integration specification, BECC would consume RKF markdown files in an ad-hoc manner. This would result in rules hallucination, cache staleness, consumption of superseded design files, and model-specific lock-in.

### Governed Knowledge Requirement
Raw files contain templates, educational examples, and historical blueprints that carry zero active authority. The integration domain ensures that only resolved, authoritative constitutional knowledge is assembled before any AI transformation occurs.

### Provider Independence
This CDS guarantees that the rules of authority and validation are executed locally on the BECC server. This prevents proprietary AI provider features (like specific model system prompts) from becoming constitutional authorities.

## 3. Constitutional Responsibilities

The RKF Integration Domain owns the following responsibilities:
1. **Governed Knowledge Consumption**: Enforcing reading constraints on the RKF snapshot.
2. **Constitutional Knowledge Discovery**: Scanning directory structures starting at the official entry points.
3. **Authority Resolution**: Executing override hierarchies (Canon > Volumes > Specs > Code) and filtering out archived/superseded documents.
4. **Bundle Assembly**: Compiling active principles, terms, and specs into a traceable, machine-readable format.
5. **Provider-Independent Knowledge Delivery**: Abstracting LLM integrations behind a Provider Broker layer.
6. **Provenance Preservation**: Retaining unique document identifiers and hashes to guarantee trace validation.
7. **Constitutional Traceability**: Assuring that transformed output sentences map back to active volume files.

## 4. Explicit Non-Responsibilities

This domain explicitly does NOT own the following concerns:
- **Constitutional Truth**: The semantic content of RKF volumes is governed by RKF itself.
- **Software Engineering Governance**: General coding standards outside of communication layouts belong to standard engineering guidelines.
- **Publication Governance**: Publishing logic and deployment rules belong to BGCF and BPGA.
- **Provider Behaviour**: The internal logic and parameters of external AI models (e.g. Gemini, Claude).
- **Human Approval Authority**: The final merge decision belongs strictly to the Human Reviewer.
- **Runtime Implementation**: The specific database, caching, or web server technologies used to run the resolver.
- **Repository Management**: Git branch merging and commit hooks belong to repo governance.

## 5. Constitutional Authority

- **Authority Source**: Resides strictly within RKF active volumes (`project/00-` to `project/10-`) and the Canon (`canon/`).
- **Authority Consumers**: The BECC execution engine, validation scripts, and generated communication outputs.
- **Authority Inheritance**: Derived downward from Canon to the general Constitution, down to individual volumes, and finally to domain specifications.
- **Authority Limitations**: The integration domain cannot write or modify RKF source files.
- **Authority Termination**: Authority terminates at code execution, examples, and raw telemetry logs.

## 6. Constitutional Boundaries

Operational boundaries and ownership mapping:

| Area | Primary Owner | Boundary Constraint |
|------|---------------|---------------------|
| **RKF** | RKF Framework | Stores durable files, active volumes, and decision records. |
| **BECC** | BECC Engine | Discovers, resolves, and validates constitutional knowledge. |
| **BGCF** | BGCF Framework | Establishes audit algorithms and quality gates. |
| **BPGA** | BPGA Automator | Automates documentation builds and staging. |
| **AI Provider** | LLM Vendor | Processes pure text transformations. Carries zero authority. |
| **Human Review** | Human Reviewer | The ultimate approval and merge authority. |
| **Runtime** | Operating System | Holds operational evidence and logging states. |

## 7. Constitutional Relationships

Interface mappings with system dependencies:

- **RKF Integration ──► RKF**
  - *Type*: Inward Dependency
  - *Direction*: Read-only.
  - *Authority*: RKF active files are the source of truth.
- **RKF Integration ──► BECC Core**
  - *Type*: Outward Contract
  - *Direction*: Provides compiled Knowledge Bundles.
  - *Authority*: Bundles constrain all Core operations.
- **RKF Integration ──► BGCF**
  - *Type*: Outward Compliance
  - *Direction*: Feeds validator results to audit ledgers.
  - *Authority*: BGCF defines validation gates.
- **RKF Integration ──► BPGA**
  - *Type*: Publication Hook
  - *Direction*: Integrates pre-commit and build tests.
  - *Authority*: BPGA executes the build checks.
- **RKF Integration ──► Provider Broker**
  - *Type*: Abstracted Interface
  - *Direction*: Exposes provider-agnostic transformation methods.
  - *Authority*: Broker guarantees consistent rule application across models.

## 8. Knowledge Inputs

The integration domain consumes the following inputs:
- **Constitutional Principles**: Directives and validation rules (e.g. `canon/README.md`).
- **Terminology Assets**: Active ontologies and definitions (e.g. `project/01-rkf/shared-vocabulary.md`).
- **Specifications**: Document schemas and writing rules (e.g. `project/16-writing-specifications/`).
- **Engineering Guidance**: Implementation boundaries (e.g. `project/09-engineering/`).
- **Runtime Evidence**: Telemetry and logs (e.g. `runtime/debugging-log.md`).
- **Governance Records**: Decision records (e.g. `project/09-decisions/`).

## 9. Knowledge Outputs

The integration domain produces:
- **Governed Knowledge Bundles**: Machine-readable compilations of authoritative rules and terms.
- **Provider Context**: Containerized context sections injected into LLM prompts.
- **Provenance Metadata**: SHA-256 hashes verifying rule versions.
- **Validation Context**: Target parameters used by local validation scripts.
- **Traceability References**: Sentence-level file links pointing back to active volume files.

## 10. Constitutional Constraints

Future implementations must enforce these mandatory constraints:
1. **Rule 1**: AI models are pure translation utilities and shall never become constitutional authorities.
2. **Rule 2**: Every compiled Knowledge Bundle must have a unique SHA-256 hash registered in the runtime evidence logs.
3. **Rule 3**: Override priorities are absolute (Canon > Volumes > Specs > Code) and must be evaluated without human or model heuristics.
4. **Rule 4**: Runtime evidence logs cannot redefine active volumes. Change requires an approved Decision Record.
5. **Rule 5**: Human approval is required before any generated output is merged into the repository.

## 11. Evolution Rules

### Permissible Evolution
- Clarifying specification boundaries.
- Adding new terminology assets.
- Exposing new provider adapters in the broker layer.

### Prohibited Evolution
- Modifying the override hierarchy (e.g. making specifications override volumes).
- Introducing provider-specific dependencies inside the resolver logic.
- Allowing validation checks to run inside the LLM provider.

### Amendment Process
Any amendment to this specification requires a formal Decision Record drafted in `project/09-decisions/`, approved by the Project Owner, and committed to the main branch.

### Versioning Principles
This specification follows Semantic Versioning (SemVer). Breaking changes to the integration contract require a major version bump (e.g. CDS v2.0).

## 12. Dependency Register

Active dependencies of this integration specification:

| Dependency | Purpose | Required | Authority Implications |
|------------|---------|----------|------------------------|
| `docs/START_HERE.md` | Provides baseline Documentation Hierarchy and read orders. | Yes | Establishes the entry point. |
| `canon/README.md` | Holds enduring, root-level rules. | Yes | Highest authority source. |
| `project/01-rkf` to `10-runtime` | Core Constitutional Volumes. | Yes | Active ontologies and rule containers. |
| `project/09-decisions/` | Decides and logs all active rules updates. | Yes | Provides audit provenance. |
| `runtime/` logs | Target destination for validator outputs. | Yes | Governs drift detection. |

## 13. Risk Register

- **Risk**: Authority Leakage (AI provider creates unofficial rules).
  - *Mitigation*: Run local terminology and rule validator checks post-execution.
- **Risk**: Provider Lock-in (Dependency on model-specific prompt formats).
  - *Mitigation*: Abstract prompt creation and payload responses inside the Provider Broker.
- **Risk**: Stale Knowledge (Resolving cached, outdated rules).
  - *Mitigation*: Execute SHA-256 file checks against the JSON inventory before each run.
- **Risk**: Provenance Loss (Transformed text cannot be traced back to active files).
  - *Mitigation*: Enforce sentence-level traceability references in the Provider Contract.

## 14. Conformance Criteria

Future code implementations must satisfy these conformance criteria to be considered compliant:
- **Authority Preservation**: Demonstrate that active volumes override blueprints and reviews without exception.
- **Deterministic Resolution**: Prove that identical directory structures yield identical compiled bundles.
- **Provider Independence**: Verify that switching LLM adapters yields identical rule validation results.
- **Traceability**: Prove that generated communications contain metadata linking back to specific lines in active volume files.
- **Validation Isolation**: Ensure all validation stages are executed locally on the BECC server.

## 15. Readiness Assessment

### Classification: Ready

**Justification**:
- The structural directory listing, classifications, navigation models, and dependencies are fully mapped.
- The high-level resolver architecture and provider broker contracts are defined.
- With the finalization of this CDS v1.0, the constitutional contract is fully established, enabling developers to begin drafting technical engineering designs.
