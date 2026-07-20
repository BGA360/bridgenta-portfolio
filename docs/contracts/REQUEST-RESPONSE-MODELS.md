# Request & Response Models — Canonical Information Models

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Information Models |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B2 |
| **Next Authorized Sprint** | Sprint B3 — Runtime Architecture & Component Design |
| **Model Scope** | Technology-Independent Conceptual Request/Response Information Models |

---

## 1. Overview & Information Model Philosophy

Request and Response Models define the canonical structure and semantic meaning of data payloads exchanged across platform contracts.

To preserve complete technology independence, **these models do not use JSON Schema, Protobuf `.proto`, OpenAPI YAML, or database DDL syntax**. They define conceptual fields, optionality, domain ownership, and validation expectations.

---

## 2. Canonical Information Models Specification

### 2.1 Assessment Request Model (`AssessmentRequestModel`)
- **Governed Contract**: `CTR-001` (Assessment Contract).
- **Domain Owner**: Assessment Context.
- **Fields**:
  - `request_id` (*Required*): Unique identifier string for the request.
  - `project_ref` (*Required*): Unique reference locator for target project.
  - `scope_manifest` (*Required*): List of framework IDs to evaluate (e.g., `["BECC", "BGCF"]`).
  - `target_governance_level` (*Required*): Target governance level (0 through 5).
  - `trigger_event` (*Optional*): Lifecycle event context (e.g., `PULL_REQUEST`, `RELEASE_TAG`).
- **Validation Expectations**: `request_id` must be non-empty; `target_governance_level` must be between 0 and 5; `scope_manifest` must contain at least one valid framework ID.

### 2.2 Assessment Result Model (`AssessmentResultModel`)
- **Governed Contract**: `CTR-001` (Assessment Contract).
- **Domain Owner**: Assessment Context.
- **Fields**:
  - `result_id` (*Required*): Unique identifier string for the assessment result.
  - `assessment_ref` (*Required*): Originating assessment ID.
  - `overall_status` (*Required*): Enum (`PASS`, `WARN`, `FAIL`).
  - `compliance_score` (*Required*): Calculated compliance percentage (0.0 to 100.0).
  - `findings` (*Required*): List of `FindingModel` items.
  - `completed_at` (*Required*): ISO timestamp string.
- **Validation Expectations**: `overall_status` must evaluate to `FAIL` if any finding has severity `CRITICAL` or `HIGH` with `PASS=false`.

### 2.3 Evidence Submission Model (`EvidenceSubmissionModel`)
- **Governed Contract**: `CTR-002` (Evidence Submission Contract).
- **Domain Owner**: Assessment Context.
- **Fields**:
  - `artifact_type` (*Required*): Standardized artifact type string (e.g., `MARKDOWN_DOC`, `TEST_LOG`).
  - `raw_payload` (*Required*): Binary or text content of the evidence artifact.
  - `content_hash` (*Required*): SHA-256 cryptographic content digest string.
  - `source_locator` (*Required*): URI or file path locator pointing to artifact source.
- **Validation Expectations**: Re-computed SHA-256 hash of `raw_payload` must match `content_hash` exactly.

### 2.4 Evidence Ingestion Receipt Model (`EvidenceIngestionReceiptModel`)
- **Governed Contract**: `CTR-002` (Evidence Submission Contract).
- **Domain Owner**: Assessment Context.
- **Fields**:
  - `evidence_id` (*Required*): System-generated unique identifier for ingested evidence.
  - `content_hash` (*Required*): Verified cryptographic hash string.
  - `verification_status` (*Required*): Enum (`VERIFIED`, `HASH_MISMATCH`, `REJECTED`).
  - `ingested_at` (*Required*): ISO timestamp string.
- **Validation Expectations**: `verification_status` must be `VERIFIED` for evidence to enter Evidence Bundle.

### 2.5 Rule Evaluation Request Model (`RuleEvaluationRequestModel`)
- **Governed Contract**: `CTR-003` (Rule Evaluation Contract).
- **Domain Owner**: Constitutional Governance Context.
- **Fields**:
  - `rule_id` (*Required*): Target rule identifier string.
  - `evidence_ref` (*Required*): Reference to ingested evidence item.
  - `evaluation_parameters` (*Optional*): Map of rule-specific threshold parameters.
- **Validation Expectations**: `rule_id` must match an active rule in the CEF/domain framework registry.

### 2.6 Rule Evaluation Result Model (`RuleEvaluationResultModel`)
- **Governed Contract**: `CTR-003` (Rule Evaluation Contract).
- **Domain Owner**: Constitutional Governance Context.
- **Fields**:
  - `rule_id` (*Required*): Evaluated rule identifier.
  - `status` (*Required*): Enum (`PASS`, `WARN`, `FAIL`).
  - `message` (*Required*): Explainable message text detailing evaluation finding.
  - `remediation_guidance` (*Optional*): Actionable text instructions for resolving failures.
- **Validation Expectations**: If `status` is `FAIL`, `message` and `remediation_guidance` must be populated.

### 2.7 Certification Request Model (`CertificationRequestModel`)
- **Governed Contract**: `CTR-005` (Certification Contract).
- **Domain Owner**: Certification Context.
- **Fields**:
  - `assessment_result_id` (*Required*): Reference to a completed Assessment Result.
  - `target_framework_id` (*Required*): Framework being certified against.
  - `requester_identity` (*Required*): Identity string of requesting entity.
- **Validation Expectations**: Referenced `assessment_result_id` must have `overall_status == PASS`.

### 2.8 Certification Issued Model (`CertificationIssuedModel`)
- **Governed Contract**: `CTR-005` (Certification Contract).
- **Domain Owner**: Certification Context.
- **Fields**:
  - `certificate_id` (*Required*): Unique certificate token string.
  - `status` (*Required*): Enum (`ISSUED`, `PENDING`, `REJECTED`).
  - `audit_ledger_hash` (*Required*): SHA-256 hash committed to the audit ledger.
  - `issued_at` (*Required*): ISO timestamp string.
  - `expiration_date` (*Required*): ISO expiration timestamp string.
- **Validation Expectations**: `audit_ledger_hash` must be non-empty and verified against ledger registry.

---

## 3. Model Field Summary Matrix

| Information Model | Owning Context | Key Required Fields | Primary Invariant |
| :--- | :--- | :--- | :--- |
| `AssessmentRequestModel` | Assessment | `request_id`, `project_ref`, `scope_manifest` | Non-empty framework scope list |
| `AssessmentResultModel` | Assessment | `result_id`, `overall_status`, `findings` | `FAIL` status if critical finding fails |
| `EvidenceSubmissionModel` | Assessment | `artifact_type`, `raw_payload`, `content_hash` | SHA-256 digest match |
| `EvidenceIngestionReceiptModel` | Assessment | `evidence_id`, `verification_status` | Must be `VERIFIED` for bundling |
| `RuleEvaluationRequestModel` | Const Gov | `rule_id`, `evidence_ref` | Rule ID exists in active registry |
| `RuleEvaluationResultModel` | Const Gov | `rule_id`, `status`, `message` | Message required on `FAIL` |
| `CertificationRequestModel` | Certification | `assessment_result_id`, `target_framework_id` | Assessment result status is `PASS` |
| `CertificationIssuedModel` | Certification | `certificate_id`, `audit_ledger_hash` | Ledger hash verified in audit registry |
