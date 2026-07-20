# Event Model — Conceptual Platform Events Specification

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Event Model |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B3 |
| **Next Authorized Sprint** | Sprint B4 — Platform Implementation Strategy & Technical Architecture |
| **Event Scope** | 9 Conceptual Platform Event Specifications |

---

## 1. Overview & Event Philosophy

The **Platform Event Model** defines the conceptual domain events emitted during CEP execution.

In strict adherence to technology independence, **these event specifications do not define Kafka topics, RabbitMQ queues, Redis channels, or JSON event envelope headers**. They specify event payload semantics, producing components, consuming components, ordering constraints, and lifecycle implications.

---

## 2. Nine Conceptual Platform Events Specification

### 2.1 Event 1: `AssessmentRequested`
- **Producer**: Target Project / CI Orchestrator / Platform Administration.
- **Consumers**: `AssessmentOrchestrator`, `TraceabilityManager`.
- **Payload Semantics**: `request_id`, `project_ref`, `scope_manifest`, `target_governance_level`, `timestamp`.
- **Ordering Requirements**: Must be emitted prior to any evidence collection or rule evaluation for the assessment run.
- **Lifecycle Implications**: Transitions Assessment state from `UNINITIALIZED` to `REQUESTED`.

### 2.2 Event 2: `EvidenceSubmitted`
- **Producer**: `RepositoryGateway`, `ProviderGateway`, External Static Analyzers.
- **Consumers**: `EvidenceManager`.
- **Payload Semantics**: `submission_id`, `artifact_type`, `content_hash`, `source_locator`, `raw_payload_size`.
- **Ordering Requirements**: Emitted upon raw evidence extraction, prior to verification.
- **Lifecycle Implications**: Transitions Evidence item state to `CAPTURED`.

### 2.3 Event 3: `EvidenceValidated`
- **Producer**: `EvidenceManager`.
- **Consumers**: `AssessmentOrchestrator`, `AuditLogger`.
- **Payload Semantics**: `evidence_id`, `content_hash`, `verification_status` (`VERIFIED`/`REJECTED`), `timestamp`.
- **Ordering Requirements**: Must follow `EvidenceSubmitted` after SHA-256 digest re-computation.
- **Lifecycle Implications**: Transitions Evidence item state from `CAPTURED` to `VERIFIED` and enables inclusion in Evidence Bundle.

### 2.4 Event 4: `RuleEvaluated`
- **Producer**: `RuleEvaluationEngine`.
- **Consumers**: `AssessmentOrchestrator`, `TraceabilityManager`.
- **Payload Semantics**: `evaluation_id`, `rule_id`, `evidence_ref`, `execution_time_ms`.
- **Ordering Requirements**: Emitted after rule evaluator completes execution against evidence.
- **Lifecycle Implications**: Records discrete rule check completion.

### 2.5 Event 5: `FindingGenerated`
- **Producer**: `RuleEvaluationEngine`.
- **Consumers**: `AssessmentOrchestrator`, Target Project Dashboard.
- **Payload Semantics**: `finding_id`, `rule_id`, `severity` (`CRITICAL`/`HIGH`/`MEDIUM`/`LOW`/`INFO`), `status` (`PASS`/`WARN`/`FAIL`), `evidence_ref`, `message`.
- **Ordering Requirements**: Emitted immediately following `RuleEvaluated` when a finding is generated.
- **Lifecycle Implications**: Appends finding item to active `AssessmentResultModel`.

### 2.6 Event 6: `CertificationIssued`
- **Producer**: `CertificationEngine`.
- **Consumers**: `AuditLogger`, Target Project, Release Deployment Gateways.
- **Payload Semantics**: `certificate_id`, `project_ref`, `framework_ref`, `assessment_result_ref`, `audit_ledger_hash`, `issued_at`.
- **Ordering Requirements**: Emitted only after assessment status evaluates to `PASS` and Gate 4/5 clearances are verified.
- **Lifecycle Implications**: Transitions Certification state from `PENDING` to `ISSUED`.

### 2.7 Event 7: `DecisionRecorded`
- **Producer**: `DecisionManager`.
- **Consumers**: `GovernanceCoordinator`, `AuditLogger`, Platform Maintainers.
- **Payload Semantics**: `decision_id`, `cdr_id`, `outcome` (`APPROVED`/`REJECTED`), `owner_ref`, `audit_hash`, `timestamp`.
- **Ordering Requirements**: Emitted upon formal Primary Owner sign-off on a CDR.
- **Lifecycle Implications**: Transitions CDR state from `PROPOSED` to `APPROVED` or `REJECTED`.

### 2.8 Event 8: `ComponentActivated`
- **Producer**: Platform Administration / Deployment Subsystem.
- **Consumers**: `TraceabilityManager`, `GovernanceCoordinator`.
- **Payload Semantics**: `component_id`, `specification_ref`, `version`, `activation_timestamp`.
- **Ordering Requirements**: Emitted when a runtime component passes Gate 3 Implementation Gate and enters active orchestration.
- **Lifecycle Implications**: Transitions Component state from `VALIDATED` to `ACTIVE`.

### 2.9 Event 9: `ContractApproved`
- **Producer**: `GovernanceCoordinator` / Primary Domain Owner.
- **Consumers**: `DecisionManager`, `TraceabilityManager`, All Bounded Contexts.
- **Payload Semantics**: `contract_id` (`CTR-XXX`), `version`, `owning_domain`, `approval_timestamp`.
- **Ordering Requirements**: Emitted upon formal approval of a new or updated platform contract specification.
- **Lifecycle Implications**: Transitions Contract state from `REVIEWED` to `APPROVED`.

---

## 3. Event Model Summary Matrix

| Event Name | Producing Component | Primary Consuming Component | Primary Payload Field | State Transition Driven |
| :--- | :--- | :--- | :--- | :--- |
| `AssessmentRequested` | Target Project | `AssessmentOrchestrator` | `request_id`, `scope_manifest` | Assessment $\rightarrow$ `REQUESTED` |
| `EvidenceSubmitted` | Gateways / Tools | `EvidenceManager` | `submission_id`, `content_hash`| Evidence $\rightarrow$ `CAPTURED` |
| `EvidenceValidated` | `EvidenceManager` | `AssessmentOrchestrator` | `evidence_id`, `status` | Evidence $\rightarrow$ `VERIFIED` |
| `RuleEvaluated` | `RuleEvaluationEngine` | `AssessmentOrchestrator` | `rule_id`, `evidence_ref` | Executed Rule Check |
| `FindingGenerated` | `RuleEvaluationEngine` | `AssessmentOrchestrator` | `finding_id`, `status` | Finding Added to Result |
| `CertificationIssued` | `CertificationEngine` | `AuditLogger` | `certificate_id`, `ledger_hash`| Certification $\rightarrow$ `ISSUED` |
| `DecisionRecorded` | `DecisionManager` | `AuditLogger` | `cdr_id`, `outcome` | CDR $\rightarrow$ `APPROVED`/`REJECTED` |
| `ComponentActivated` | Platform Admin | `TraceabilityManager` | `component_id`, `version` | Component $\rightarrow$ `ACTIVE` |
| `ContractApproved` | `GovernanceCoordinator`| All Contexts | `contract_id`, `version` | Contract $\rightarrow$ `APPROVED` |
