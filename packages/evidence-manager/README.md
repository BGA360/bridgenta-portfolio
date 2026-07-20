# `@cep/evidence-manager` — Evidence Manager Foundation Module

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Package Name** | `@cep/evidence-manager` |
| **Package Version** | `0.1.0` |
| **Package Type** | ES Module (`"type": "module"`) |
| **Project Status** | Platform Implementation |
| **Lifecycle Stage** | Stage C — Platform Implementation |
| **Sprint Reference** | Sprint C2 |
| **Next Authorized Sprint** | Sprint C3 — Rule Evaluation Engine Foundation |
| **Primary Component** | `EvidenceManager` (`docs/runtime/COMPONENT-CATALOG.md`) |
| **Governed Contract** | `CTR-002` (Evidence Submission Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`) |
| **Constitutional Source** | `docs/project/CEP-ENGINEERING-PRINCIPLES.md` (Principle 2: *Evidence Before Assertion*) |

---

## 1. Overview & Module Purpose

The `@cep/evidence-manager` module implements the canonical Evidence bounded context for the **Constitutional Engineering Platform (CEP)**.

In strict compliance with Sprint C2 boundaries, this module is responsible for:
1. Receiving and validating evidence submission payloads against `CTR-002`.
2. Enforcing branded Value Objects (`EvidenceId`, `AssessmentId`, `EvidenceChecksum`, `Timestamp`).
3. Managing the Evidence Aggregate root and immutable transition history.
4. Enforcing legal state machine transitions (`SUBMITTED` $\rightarrow$ `VALIDATED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `REFERENCED` $\rightarrow$ `ARCHIVED`).
5. Guaranteeing provenance immutability after evidence acceptance.
6. Emitting immutable domain events (`EvidenceSubmitted`, `EvidenceValidated`, `EvidenceAccepted`, `EvidenceReferenced`, `EvidenceArchived`).
7. Providing canonical JSON serialization/deserialization (`v1.0.0`).
8. Assembling sealed Evidence Bundles with aggregate SHA-256 digests.

---

## 2. Public API Summary

- `createEvidenceService()`: Factory function creating an instance of `EvidenceService`.
- `Evidence`: Aggregate root managing identity, checksum, provenance, lifecycle, and history.
- `EvidenceStatus`: Enum (`SUBMITTED`, `VALIDATED`, `ACCEPTED`, `REFERENCED`, `ARCHIVED`).
- `EvidenceCategory`: Enum (`STATIC_CODE`, `COMMIT_LOG`, `ARCHITECTURAL_DOC`, `BENCHMARK_RESULT`, `TEST_OUTPUT`).
- `EvidenceType`: Enum (`FILE_ARTIFACT`, `METRIC_SET`, `DECLARATION`, `HASH_DIGEST`).
- `EvidenceSerializer`: Class providing `serialize(evidence)` and `deserialize(jsonString)`.
- `EvidenceValidator`: Class providing static submission validation.
- `EvidenceTraceabilityManager`: Class generating and verifying constitutional traceability references.

---

## 3. Evidence Lifecycle State Machine

```
[SUBMITTED]
     │
     ▼ (validateIntegrity)
[VALIDATED]
     │
     ▼ (acceptEvidence)
[ACCEPTED] ───(referenceEvidence)───► [REFERENCED]
     │                                      │
     └─────────────► [ARCHIVED] ◄───────────┘
```

- **Transitions**:
  - `SUBMITTED` $\rightarrow$ `VALIDATED`, `ARCHIVED`
  - `VALIDATED` $\rightarrow$ `ACCEPTED`, `ARCHIVED`
  - `ACCEPTED` $\rightarrow$ `REFERENCED`, `ARCHIVED`
  - `REFERENCED` $\rightarrow$ `ARCHIVED`
  - `ARCHIVED` $\rightarrow$ (No outgoing transitions)

---

## 4. Enforced Invariants

1. **SHA-256 Format Invariant**: Checksums must be valid 64-character hex strings matching `/^[a-fA-F0-9]{64}$/`.
2. **Provenance Immutability**: Evidence provenance (`origin`, `collection_timestamp`, `submitting_authority`, `correlation_id`) is permanently immutable after ingestion.
3. **No Duplicate Evidence**: Evidence IDs (`evi-[submission_id]`) must be unique across the platform instance (`ERR-EVI-004`).
4. **Transition History Immutability**: Every status change appends an immutable `EvidenceTransitionRecord` to aggregate history.

---

## 5. Domain Event Model

- `EvidenceSubmitted`: Emitted upon raw evidence ingestion.
- `EvidenceValidated`: Emitted when SHA-256 digest is verified.
- `EvidenceAccepted`: Emitted when evidence enters the accepted registry.
- `EvidenceReferenced`: Emitted when evidence is referenced by a rule or assessment run.
- `EvidenceArchived`: Emitted upon evidence archiving.

---

## 6. Structured Error Model

| Error Class | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| `EvidenceValidationError` | `ERR-EVI-001` | Submission payload validation failure |
| `EvidenceIntegrityError` | `ERR-EVI-002` | SHA-256 digest verification failure |
| `InvalidEvidenceTransitionError` | `ERR-EVI-003` | Attempted illegal state transition |
| `DuplicateEvidenceError` | `ERR-EVI-004` | Duplicate evidence ID submitted |
| `EvidenceTraceabilityError` | `ERR-EVI-005` | Missing/invalid traceability reference |
| `EvidenceContractViolation` | `ERR-EVI-006` | CTR-002 schema boundary violation |
| `EvidenceNotFoundError` | `ERR-EVI-007` | Requested evidence ID missing |

---

## 7. Deterministic Serialization

- **Schema Version**: `1.0.0`
- **Format**: Canonical JSON string representation.
- **Roundtrip**: `EvidenceSerializer.deserialize(EvidenceSerializer.serialize(evidence))` produces 100% value parity.

---

## 8. Test Inventory

- **Unit Tests**: Aggregate creation, value objects, invariants, transitions, checksum checks (`tests/unit/`).
- **Contract Tests**: `CTR-002` input validation, receipt generation, error schema checks (`tests/contract/`).
- **Compliance Tests**: Duplicate ID checks, provenance immutability verification (`tests/compliance/`).
- **Regression Tests**: SHA-256 digest checks, canonical JSON roundtrips (`tests/regression/`).
- **Acceptance Tests**: End-to-end evidence ingestion, validation, acceptance, bundle assembly, and event tracking (`tests/acceptance/`).

---

## 9. Explicit Non-Goals

The `@cep/evidence-manager` module explicitly does **NOT**:
- Execute rules or static analysis.
- Score, weight, or evaluate evidence artifacts.
- Generate findings or issue certificates.
- Interact with external AI providers, LLMs, or SCM APIs.
- Perform file system reads/writes or database persistence.

---

## 10. Traceability Annotation

- **Constitutional Source**: `docs/project/CEP-ENGINEERING-PRINCIPLES.md` (Principle 2)
- **Domain Concepts**: `Evidence`, `Evidence Bundle`, `Evidence Provenance` (`docs/domain/DOMAIN-MODEL.md`)
- **Governed Contract**: `CTR-002` (Evidence Submission Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`)
- **Runtime Component**: `EvidenceManager` (`docs/runtime/COMPONENT-CATALOG.md`)
