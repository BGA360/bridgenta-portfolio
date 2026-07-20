# Validation Contracts — Contract Compliance Verification & Invariants

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Validation Contracts |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B2 |
| **Next Authorized Sprint** | Sprint B3 — Runtime Architecture & Component Design |
| **Validation Mandate** | Compliance Rules, Invariant Checks, and Acceptance Criteria per Contract |

---

## 1. Overview & Validation Philosophy

Validation Contracts specify the mandatory rules and acceptance checks required to verify that inter-context data exchanges strictly comply with platform contracts.

In accordance with the principle **Evidence Before Assertion**, no contract payload or transition is accepted based on trust. Every exchange is subjected to explicit validation checks prior to processing.

---

## 2. Per-Contract Validation Specifications

### 2.1 Validation Specification: CTR-001 (Assessment Contract)
- **Mandatory Validation Rules**:
  1. `project_ref` must resolve to an active registered project in the Repository Abstraction context.
  2. `scope_manifest` must contain valid, active framework identifiers.
  3. `target_governance_level` must match the project's assigned level or trigger a Policy Resolution check (`CTR-004`).
- **Invariant Checks**: `INV-01` (Every Assessment must reference at least one Framework).
- **Evidence Requirements**: Valid `AssessmentRequestModel` payload.
- **Constitutional Traceability**: `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` (Section 2).
- **Acceptance Criteria**: Assessment status transitions to `PROCESSING` with zero validation errors.

### 2.2 Validation Specification: CTR-002 (Evidence Submission Contract)
- **Mandatory Validation Rules**:
  1. Re-computed SHA-256 hash of `raw_payload` must match `content_hash` exactly.
  2. `artifact_type` must be registered in the CEF Evidence Schema Registry.
  3. `source_locator` must be accessible.
- **Invariant Checks**: `INV-02` (Every Finding must be supported by Evidence).
- **Evidence Requirements**: Raw evidence payload and cryptographic content digest.
- **Constitutional Traceability**: `docs/project/CEP-ENGINEERING-PRINCIPLES.md` (Principle 2).
- **Acceptance Criteria**: Ingestion receipt generated with `verification_status == VERIFIED`.

### 2.3 Validation Specification: CTR-003 (Rule Evaluation Contract)
- **Mandatory Validation Rules**:
  1. `rule_id` must reference an active, non-deprecated rule in CEF or a secondary framework.
  2. `evidence_ref` must point to a verified item in the active Evidence Bundle.
- **Invariant Checks**: `INV-02` & `INV-07` (CEF Meta-Rule Absolute Precedence).
- **Evidence Requirements**: Verified Evidence reference and rule parameters.
- **Constitutional Traceability**: `docs/architecture/CEF-ARCHITECTURAL-ROLE.md` (Section 2).
- **Acceptance Criteria**: Finding emitted containing status (`PASS`/`WARN`/`FAIL`) and explainable message.

### 2.4 Validation Specification: CTR-004 (Policy Resolution Contract)
- **Mandatory Validation Rules**:
  1. Target `governance_level` must be an integer between 0 and 5.
  2. Framework list must be free of circular dependencies (DAG check).
- **Invariant Checks**: CEF Meta-Rule Precedence check.
- **Evidence Requirements**: Governance Level Policy definition.
- **Constitutional Traceability**: `docs/decisions/GOVERNANCE-LEVELS.md`.
- **Acceptance Criteria**: Policy resolution payload generated with active rule tree.

### 2.5 Validation Specification: CTR-005 (Certification Contract)
- **Mandatory Validation Rules**:
  1. Referenced `assessment_result_id` must have `overall_status == PASS`.
  2. All required framework evidence gates (Gates 1–4) must show `CLEARED` status.
- **Invariant Checks**: `INV-03` (Certification Assessment Origin).
- **Evidence Requirements**: Passing Assessment Result and Gate Clearance Records.
- **Constitutional Traceability**: `docs/decisions/EVIDENCE-GATE-STANDARD.md` (Gate 4 & Gate 5).
- **Acceptance Criteria**: Certificate issued and cryptographic hash written to audit ledger.

### 2.6 Validation Specification: CTR-006 (Decision Contract)
- **Mandatory Validation Rules**:
  1. Draft CDR must contain all 9 mandatory sections specified in the CDR Standard.
  2. Draft CDR must specify exactly ONE Primary Authority Owner.
- **Invariant Checks**: `INV-04` (Single Decision Ownership).
- **Evidence Requirements**: Draft CDR document and attached Evidence Package.
- **Constitutional Traceability**: `docs/decisions/DECISION-RECORD-STANDARD.md`.
- **Acceptance Criteria**: Decision marked `APPROVED` and registered in audit ledger.

### 2.7 Validation Specification: CTR-007 (Governance Contract)
- **Mandatory Validation Rules**:
  1. Composed rule tree must pass zero-contradiction check against CEF kernel.
  2. Authority boundaries must show zero unassigned authority overlaps.
- **Invariant Checks**: `INV-07` (CEF Precedence Absolute Primacy).
- **Evidence Requirements**: Machine-readable framework definitions.
- **Constitutional Traceability**: `docs/architecture/FRAMEWORK-COMPOSITION.md`.
- **Acceptance Criteria**: Composed rule model verified and cached.

### 2.8 Validation Specification: CTR-008 (Repository Contract)
- **Mandatory Validation Rules**:
  1. Target repository URI must be reachable under read-only credentials.
  2. Commit locator must match valid SHA or branch ref.
- **Invariant Checks**: Read-only inspection invariant.
- **Evidence Requirements**: Repository connection manifest.
- **Constitutional Traceability**: `docs/project/CEP-ENGINEERING-PRINCIPLES.md` (Principle 7).
- **Acceptance Criteria**: Inspection payload returned with zero target file modifications.

### 2.9 Validation Specification: CTR-009 (Provider Contract)
- **Mandatory Validation Rules**:
  1. Provider response must strictly adhere to the expected structured JSON output model.
  2. Provider must operate under neutral contract without vendor-specific payload leaks.
- **Invariant Checks**: AI Provider Independence invariant.
- **Evidence Requirements**: Structured provider response JSON.
- **Constitutional Traceability**: `docs/project/CEP-ENGINEERING-PRINCIPLES.md` (Principle 6).
- **Acceptance Criteria**: Provider response parsed without schema validation errors.

---

## 3. Summary Validation Matrix

| Contract ID | Contract Name | Mandatory Invariant | Primary Validation Check |
| :--- | :--- | :--- | :--- |
| **CTR-001** | Assessment Contract | `INV-01` | Non-empty framework scope & valid project ref |
| **CTR-002** | Evidence Submission Contract | `INV-02` | SHA-256 digest match against raw payload |
| **CTR-003** | Rule Evaluation Contract | `INV-02` & `INV-07` | Rule active & evidence ref verified |
| **CTR-004** | Policy Resolution Contract | CEF Precedence | Level 0–5 valid & DAG acyclic |
| **CTR-005** | Certification Contract | `INV-03` | Assessment status `PASS` & Gate clearance |
| **CTR-006** | Decision Contract | `INV-04` | Single primary owner & complete CDR template |
| **CTR-007** | Governance Contract | `INV-07` | Zero meta-rule contradiction against CEF |
| **CTR-008** | Repository Contract | Read-Only Invariant | Read-only inspection & valid repo URI |
| **CTR-009** | Provider Contract | Provider Independence | Structured JSON output validation |
