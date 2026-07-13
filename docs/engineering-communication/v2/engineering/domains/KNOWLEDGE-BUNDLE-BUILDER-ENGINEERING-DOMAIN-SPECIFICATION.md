# BECC v2.0 — Knowledge Bundle Builder Engineering Domain Specification

An authoritative engineering domain specification defining the identity, purpose, responsibilities, input/output structures, bundle composition, validations, states, and runtime behaviors for the Knowledge Bundle Builder.

## 1. Engineering Identity

- **Domain Name**: Knowledge Bundle Builder Domain
- **Version**: 1.0.0
- **Status**: Active
- **Owner**: Knowledge Bundle Builder Team
- **Scope**: Compilation, hashing, and packaging of resolved rule objects into serialization-neutral Knowledge Bundles.

## 2. Purpose

The Knowledge Bundle Builder aggregates the individual rule line references produced by the Knowledge Resolver and compiles them into a structured, unified, and provider-neutral compiled document representation. It acts as the bridge between raw repository metadata and AI operational context.

## 3. Responsibilities

1. **Rule Aggregation**: Collects rule text contents from resolved references.
2. **Context Compilation**: Groups rules into distinct context categories (principles, vocabularies, layout specifications).
3. **Cryptographic Validation**: Calculates a unique SHA-256 hash over the compiled bundle text to enforce rule state integrity.
4. **Metadata Annotation**: Decorates every rule inside the bundle with its origin file, line numbers, and override priorities.
5. **Schema Conformance**: Assures compiled output matches the CDM Knowledge Bundle contract schema.

## 4. Explicit Non-Responsibilities

The Knowledge Bundle Builder explicitly does NOT own:
- **Repository Scanning**: Traversal and overrides evaluation belong to the Knowledge Resolver.
- **Provider Adapters**: API client wrapping is managed by the Provider Broker.
- **Post-Execution Auditing**: Output compliance checking belongs to the Validation Engine.
- **Dashboard Interfaces**: Human approval gates belong to the Review Engine.

## 5. Inputs

Consumes the following CDM data objects:
- **Knowledge Reference**: Mappings of target rule files and line numbers.
- **Authority Reference**: Priority rankings.
- **Constitutional Reference**: Canon rule pointers.

## 6. Outputs

Produces:
- **Knowledge Bundle**: A single, immutable compiled JSON/YAML document wrapping active rules and metadata.

## 7. Bundle Purpose

### Why Canonical Bundles Are Required
AI models are highly sensitive to context organization. Compiling a canonical bundle ensures that the LLM receives rules and vocabulary formatted in a predictable, standardized layout, minimizing reasoning errors.

### Isolation from Raw Files
Directly supplying repository markdown files to LLMs is prohibited:
- Raw files contain historical archives and templates that confuse models.
- Context windows would be overloaded with duplicate rules.
- Local override execution prevents the LLM from making guesses about rule authority.

## 8. Bundle Assembly

The compilation process traverses four steps:
1. **Load Reference Content**: Read rule string lines using target line ranges.
2. **Section Formatting**: Wrap rule blocks inside distinct context tags (e.g. `<CONSTRAINTS>` or `<VOCABULARY>`).
3. **Hash Registration**: Append SHA-256 checksum signatures of rule files.
4. **Serialization Validation**: Run structural tests to verify that no duplicate rule IDs exist.

## 9. Bundle Composition

The Knowledge Bundle must contain the following sections:
- **Constitutional Context**: Enduring rules and root laws.
- **Engineering Context**: Document schemas and writing constraints.
- **Terminology**: Vocabulary lists, term mappings, and node types.
- **Authority References**: Priority hierarchies and volume overrides details.
- **Provenance**: Line numbers, file links, and commit SHA hashes.
- **Constraints**: Scope limits and provider restrictions.
- **Runtime Metadata**: Job UUID, execution timestamp, and active version numbers.
- **Validation Metadata**: Target score thresholds and validation check criteria.

## 10. Bundle Validation

Before publishing a bundle to the Provider Broker, the component runs local validations:
- **Completeness Check**: Verifies that every target domain in the assessment context is represented.
- **Hash Integrity**: Validates that rule file signatures match the pre-commit inventory registry.
- **Terminology Consistency**: Checks that vocab mappings do not define duplicate terminology names.
- **Traceability Verification**: Assures that every rule contains a non-empty file pointer and line range.

## 11. Runtime Behaviour

The internal compilation workflow:
```text
[Resolver Output] ──► [Extract Rule Texts] ──► [Format Tags] ──► [Run Schema Check] ──► [Compile Bundle]
```

## 12. State Management

The compilation state machine:
- **Draft**: Initialized, inputs verified.
- **Compiling**: Formatting XML/HTML containers.
- **Validating**: Running local integrity checks.
- **Generated**: Bundle locked, signed, and published.
- **Failed**: Validation failure or serialization error. Aborts run.

## 13. Events

- **Consumes**:
  - `Knowledge Resolved`: Initiates compilation.
- **Produces**:
  - `Bundle Generated`: Dispatches the completed Knowledge Bundle.
  - `Bundle Compilation Failed`: Logs the build error.

## 14. Dependencies

- **Upstream**: Knowledge Resolver.
- **Downstream**: Provider Broker, Validation Engine.

## 15. Interactions

- **Knowledge Resolver** ──► Supplies resolved rule references.
- **Provider Broker** ──► Receives the finalized bundle for prompt compilation.
- **Validation Engine** ──► Receives the bundle schemas to audit post-execution outputs.

## 16. Failure Handling

- **Incomplete Bundles**
  - *Recovery*: Coordinator halts the job, logs warnings, and blocks the broker call.
- **Conflicting Authority References**
  - *Recovery*: Aborts run, notifies review ledger.
- **Missing Provenance Hashes**
  - *Recovery*: Re-calculates rule hashes from source files; if they drift, halts build.

## 17. Runtime Metrics

Target KPIs:
- **Compilation Duration**: < 100ms per run.
- **Bundle Size**: Under 150KB to protect LLM context windows.
- **Traceability Score**: % of rules containing valid source line mappings (Target: 100%).
- **Validation Success Rate**: % of bundles passing schema validations.

## 18. Security

- **Sandbox Context Isolation**: Prompt templates use HTML context isolation wrappers to prevent AI injection attacks.
- **Signatures checking**: Output bundles are cryptographically signed, preventing tampering during broker routing.

## 19. Risks

- **Provider Context Leakage**
  - *Mitigation*: Abstract vendor-specific prompts outside the bundle structure.
- **Oversized Bundles**
  - *Mitigation*: Implement vocabulary pruning, discarding terms not applicable to target domains.

## 20. Readiness Assessment

### Classification: Ready

**Justification**:
- The bundle builder's purpose, assembly pipeline, composition sections, and validations are fully specified.
- The state transitions, event bus mappings, and risk mitigations comply with system constraints.
- No code has been implemented, satisfying planning requirements.

The specification is complete. Transition to **Phase 2.4: Provider Broker Engineering Domain Specification** is authorized.
