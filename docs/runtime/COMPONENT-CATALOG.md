# Component Catalog — 11 Core Runtime Subsystem Specifications

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Component Catalog |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B3 |
| **Next Authorized Sprint** | Sprint B4 — Platform Implementation Strategy & Technical Architecture |
| **Catalog Scope** | Specifications for 11 Core Runtime Components under Component Spec Standard |

---

## 1. Overview & Catalog Mandate

This catalog establishes the formal specifications for the **11 core runtime components** required to execute the Constitutional Engineering Platform (CEP).

In strict compliance with the **Component Specification Standard** established in Sprint A2, every component is defined across 11 standard sections enforcing **Mechanisms Before Labels**. Zero production implementation code is contained herein.

---

## 2. Core Runtime Subsystem Specifications

### 2.1 Component 1: Assessment Orchestrator (`AssessmentOrchestrator`)
- **Purpose**: Coordinates assessment workflow execution, sequencing evidence collection, rule evaluation, and result aggregation.
- **Responsibilities**: Ingesting Assessment Requests, driving state machine transitions, invoking gateways, and assembling results.
- **Inputs**: `AssessmentRequestModel` (`CTR-001`).
- **Outputs**: `AssessmentResultModel`, `AssessmentRequested` and `FindingGenerated` events.
- **Owned Contracts**: `CTR-001` (Assessment Contract).
- **Owned Domain Concepts**: Assessment, Assessment Request, Assessment Result.
- **Dependencies**: `PolicyResolver`, `EvidenceManager`, `RuleEvaluationEngine`, `RepositoryGateway`.
- **Constraints**: Must maintain deterministic execution sequence; zero direct file I/O code.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: 100% of valid Assessment Requests executed to completion with verifiable results.
- **Non-Goals**: Does not write to cryptographic audit ledger directly (delegated to Audit Logger).

### 2.2 Component 2: Evidence Manager (`EvidenceManager`)
- **Purpose**: Manages evidence ingestion, SHA-256 hash verification, packaging into Evidence Bundles, and persistence.
- **Responsibilities**: Verifying content digests, sealing Evidence Bundles, and exposing evidence locators.
- **Inputs**: `EvidenceSubmissionModel` (`CTR-002`).
- **Outputs**: `EvidenceIngestionReceiptModel`, `EvidenceSubmitted` and `EvidenceValidated` events.
- **Owned Contracts**: `CTR-002` (Evidence Submission Contract).
- **Owned Domain Concepts**: Evidence, Evidence Bundle.
- **Dependencies**: `RepositoryGateway`, `AuditLogger`.
- **Constraints**: Must reject any payload where re-computed hash fails digest match.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: 100% of ingested evidence items cryptographically verified and sealed.
- **Non-Goals**: Does not evaluate evidence against rules.

### 2.3 Component 3: Rule Evaluation Engine (`RuleEvaluationEngine`)
- **Purpose**: Executes deterministic rule evaluations against ingested evidence artifacts.
- **Responsibilities**: Ingesting evidence references, checking rule constraints, and generating findings.
- **Inputs**: `RuleEvaluationRequestModel` (`CTR-003`).
- **Outputs**: `RuleEvaluationResultModel`, `RuleEvaluated` and `FindingGenerated` events.
- **Owned Contracts**: `CTR-003` (Rule Evaluation Contract).
- **Owned Domain Concepts**: Finding, Finding Severity, Rule.
- **Dependencies**: `GovernanceCoordinator`, `EvidenceManager`.
- **Constraints**: Zero state mutation of input evidence; strict determinism.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: Identical evidence and rule inputs produce 100% identical finding outputs.
- **Non-Goals**: Does not alter target project files.

### 2.4 Component 4: Policy Resolver (`PolicyResolver`)
- **Purpose**: Resolves applicable active rule sets, thresholds, and gate configurations for target projects and governance levels.
- **Responsibilities**: Ingesting project governance levels (Level 0–5) and returning active policy rule manifests.
- **Inputs**: `PolicyResolutionRequestModel` (`CTR-004`).
- **Outputs**: `PolicyResolutionResponseModel`.
- **Owned Contracts**: `CTR-004` (Policy Resolution Contract).
- **Owned Domain Concepts**: Policy, Governance Level.
- **Dependencies**: `GovernanceCoordinator`.
- **Constraints**: Must enforce CEF meta-rule precedence.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: Resolves active policy profiles in zero-contradiction state.
- **Non-Goals**: Does not evaluate rules against code.

### 2.5 Component 5: Certification Engine (`CertificationEngine`)
- **Purpose**: Manages the verification of assessment results and issuance of formal compliance certificates.
- **Responsibilities**: Validating assessment result hashes, verifying gate clearances, issuing certificates, and updating audit ledgers.
- **Inputs**: `CertificationRequestModel` (`CTR-005`).
- **Outputs**: `CertificationIssuedModel`, `CertificationIssued` event.
- **Owned Contracts**: `CTR-005` (Certification Contract).
- **Owned Domain Concepts**: Certification, Attestation.
- **Dependencies**: `AssessmentOrchestrator`, `AuditLogger`.
- **Constraints**: Must reject certificate issuance if assessment result contains blocking `FAIL` findings.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: 100% of issued certificates backed by verifiable passing assessment results.
- **Non-Goals**: Does not re-run raw static analysis.

### 2.6 Component 6: Decision Manager (`DecisionManager`)
- **Purpose**: Manages the proposal, review, evaluation, and enforcement lifecycle of Constitutional Decision Records (CDRs).
- **Responsibilities**: Validating CDR template compliance, recording owner sign-offs, and triggering authority transfers.
- **Inputs**: `DecisionProposalModel` (`CTR-006`).
- **Outputs**: `DecisionOutcomeModel`, `DecisionRecorded` event.
- **Owned Contracts**: `CTR-006` (Decision Contract).
- **Owned Domain Concepts**: Decision, Decision Record (CDR).
- **Dependencies**: `GovernanceCoordinator`, `AuditLogger`.
- **Constraints**: Must enforce single primary ownership invariant (`INV-04`).
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: 100% of binding decisions backed by approved CDRs logged in audit ledger.
- **Non-Goals**: Does not perform manual code editing.

### 2.7 Component 7: Governance Coordinator (`GovernanceCoordinator`)
- **Purpose**: Hosts CEF meta-framework kernel rules, manages inter-framework composition, and resolves precedence conflicts.
- **Responsibilities**: Maintaining framework DAGs, executing conflict resolution paths, and issuing composed rule models.
- **Inputs**: `GovernanceCompositionRequestModel` (`CTR-007`).
- **Outputs**: `GovernanceCompositionResponseModel`.
- **Owned Contracts**: `CTR-007` (Governance Contract).
- **Owned Domain Concepts**: Framework, Constitutional Framework (CEF).
- **Dependencies**: `TraceabilityManager`.
- **Constraints**: CEF meta-rules hold absolute, un-overrideable precedence.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: Zero meta-rule contradictions across all composed framework trees.
- **Non-Goals**: Does not execute project file traversal.

### 2.8 Component 8: Repository Gateway (`RepositoryGateway`)
- **Purpose**: Provides provider-neutral, read-only inspection access to target project source code repositories.
- **Responsibilities**: Exposing file trees, commit metadata, and file payloads under vendor-neutral models (`CTR-008`).
- **Inputs**: `RepositoryInspectionRequestModel` (`CTR-008`).
- **Outputs**: `RepositoryInspectionResponseModel`.
- **Owned Contracts**: `CTR-008` (Repository Contract).
- **Owned Domain Concepts**: Repository, Project.
- **Dependencies**: External SCM hosts via abstract adapter contracts.
- **Constraints**: Read-only access enforced; zero file modification on target repositories.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: Seamless file tree inspection across local FS, Git CLI, and remote SCM APIs.
- **Non-Goals**: Does not hardcode vendor-specific Git APIs into core platform.

### 2.9 Component 9: Provider Gateway (`ProviderGateway`)
- **Purpose**: Provides provider-neutral processing contracts for external AI engines, LLMs, and static analysis services.
- **Responsibilities**: Translating processing requests into neutral payloads and parsing structured JSON responses (`CTR-009`).
- **Inputs**: `ProviderProcessingRequestModel` (`CTR-009`).
- **Outputs**: `ProviderProcessingResponseModel`.
- **Owned Contracts**: `CTR-009` (Provider Contract).
- **Owned Domain Concepts**: Provider, Capability.
- **Dependencies**: External AI / static tool providers via abstract contracts.
- **Constraints**: Enforces AI provider independence; zero vendor payload leaks.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: 100% vendor-neutral processing execution.
- **Non-Goals**: Does not host LLM models internally.

### 2.10 Component 10: Audit Logger (`AuditLogger`)
- **Purpose**: Persists immutable, cryptographically verifiable records of all platform decisions, certificates, and gate clearances.
- **Responsibilities**: Writing SHA-256 content hashes to the platform audit ledger and providing verification lookups.
- **Inputs**: Audit log entries from `CertificationEngine`, `DecisionManager`, and `EvidenceManager`.
- **Outputs**: Cryptographic ledger receipts and verification records.
- **Owned Contracts**: Internal Audit Ledger Contract.
- **Owned Domain Concepts**: Attestation, Audit Ledger.
- **Dependencies**: Storage adapters.
- **Constraints**: Append-only log design; zero record mutation or deletion permitted.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: 100% audit ledger integrity verified via SHA-256 chain.
- **Non-Goals**: Does not perform business logic evaluation.

### 2.11 Component 11: Traceability Manager (`TraceabilityManager`)
- **Purpose**: Maintains and validates 100% bidirectional traceability between runtime components, contracts, domain concepts, and Stage A constitutional source documents.
- **Responsibilities**: Indexing traceability matrices and verifying that every runtime action maps to explicit constitutional authority.
- **Inputs**: Component, contract, and CDR metadata manifests.
- **Outputs**: Traceability verification reports.
- **Owned Contracts**: Internal Traceability Verification Contract.
- **Owned Domain Concepts**: Traceability Matrix, Constitutional Source.
- **Dependencies**: `GovernanceCoordinator`.
- **Constraints**: Must flag any ungrounded component or orphan contract.
- **Lifecycle**: `SPECIFIED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETIRED`.
- **Success Criteria**: 100% traceability verification score across all platform assets.
- **Non-Goals**: Does not run code compilation.

---

## 3. Component Catalog Summary Matrix

| Component Name | Owning Layer | Primary Contract Owned | Core Domain Concept Owned |
| :--- | :--- | :--- | :--- |
| `AssessmentOrchestrator` | Layer 3: Orchestration | `CTR-001` (Assessment) | Assessment, Result |
| `EvidenceManager` | Layer 2: Evaluation | `CTR-002` (Evidence Submission)| Evidence, Evidence Bundle |
| `RuleEvaluationEngine` | Layer 2: Evaluation | `CTR-003` (Rule Evaluation) | Finding, Rule |
| `PolicyResolver` | Layer 4: Governance | `CTR-004` (Policy Resolution)| Policy, Governance Level |
| `CertificationEngine` | Layer 3: Orchestration | `CTR-005` (Certification) | Certification, Attestation |
| `DecisionManager` | Layer 4: Governance | `CTR-006` (Decision) | Decision, Decision Record |
| `GovernanceCoordinator` | Layer 4: Governance | `CTR-007` (Governance) | Framework, CEF Kernel |
| `RepositoryGateway` | Layer 1: Gateway | `CTR-008` (Repository) | Repository, Project |
| `ProviderGateway` | Layer 1: Gateway | `CTR-009` (Provider) | Provider, Capability |
| `AuditLogger` | Layer 3: Orchestration | Audit Ledger Contract | Audit Ledger |
| `TraceabilityManager` | Layer 4: Governance | Traceability Contract | Traceability Matrix |
