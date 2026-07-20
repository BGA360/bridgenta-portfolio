# `@cep/certification-engine` — Certification Engine Foundation Module

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Package Name** | `@cep/certification-engine` |
| **Package Version** | `0.1.0` |
| **Package Type** | ES Module (`"type": "module"`) |
| **Project Status** | Platform Implementation |
| **Lifecycle Stage** | Stage C — Platform Implementation |
| **Sprint Reference** | Sprint C5 |
| **Next Authorized Sprint** | Sprint C6 — Platform Integration & Orchestration Foundation |
| **Primary Component** | `CertificationEngine` (`docs/runtime/COMPONENT-CATALOG.md`) |
| **Governed Contract** | `CTR-005` (Certification Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`) |
| **Constitutional Source** | `docs/architecture/CEF-ARCHITECTURAL-ROLE.md` |

---

## 1. Overview & Module Purpose

The `@cep/certification-engine` module implements the formal attestation and trust layer for the **Constitutional Engineering Platform (CEP)**.

In strict compliance with Sprint C5 boundaries, this module is responsible for:
1. Issuing, validating, activating, suspending, revoking, and archiving constitutional certifications based on approved `PolicyDecision` outcomes.
2. Managing the `Certification` aggregate root and enforcing its formal state machine lifecycle (`ISSUED` $\rightarrow$ `VERIFIED` $\rightarrow$ `ACTIVE` $\rightarrow$ `SUSPENDED` / `REVOKED` $\rightarrow$ `ARCHIVED`).
3. Generating audit-ready `CertificationRecord` provenance entries and verification hashes.
4. Providing canonical JSON serialization with 100% round-trip value parity (`v1.0.0`).
5. Emitting immutable domain events (`CertificationIssued`, `CertificationVerified`, `CertificationActivated`, `CertificationRevoked`, `CertificationArchived`).
6. Enforcing structured domain error codes (`ERR-CRT-001` through `ERR-CRT-007`).

This module does **NOT** evaluate evidence, execute rules, resolve policy profiles, or mutate assessment, finding, or policy entities.

---

## 2. Public API Summary

- `createCertificationEngineService()`: Factory function creating `CertificationEngineService`.
- `Certification`: Aggregate root managing identity, metadata, status lifecycle, history, and traceability.
- `CertificationStatus`: Enum (`ISSUED`, `VERIFIED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `ARCHIVED`).
- `CertificationLevel`: Enum (`LEVEL_0`, `LEVEL_1`, `LEVEL_2`, `LEVEL_3`, `LEVEL_4`, `LEVEL_5`).
- `CertificationType`: Enum (`CONSTITUTIONAL_COMPLIANCE`, `SECURITY_ATTESTATION`, `ARCHITECTURAL_CONFORMANCE`, `GOVERNANCE_CLEARANCE`).
- `CertificationValidator`: Class providing static validation for issuance requests and policy decision approval checks.
- `CertificationSerializer`: Class offering `serialize(certification)` and `deserialize(jsonString)`.
- `CertificationTraceabilityManager`: Class generating and verifying constitutional traceability references.

---

## 3. Certification Lifecycle State Machine

```
[ISSUED] ───► [VERIFIED] ───► [ACTIVE] ───► [SUSPENDED]
   │             │               │              │
   │             ├───────────────┴──────────────┤
   ▼             ▼                              ▼
[REVOKED] ──► [ARCHIVED] ◄──────────────────────┘
```

- **Allowed Transitions**:
  - `ISSUED` $\rightarrow$ `VERIFIED`, `REVOKED`, `ARCHIVED`
  - `VERIFIED` $\rightarrow$ `ACTIVE`, `SUSPENDED`, `REVOKED`, `ARCHIVED`
  - `ACTIVE` $\rightarrow$ `SUSPENDED`, `REVOKED`, `ARCHIVED`
  - `SUSPENDED` $\rightarrow$ `ACTIVE`, `REVOKED`, `ARCHIVED`
  - `REVOKED` $\rightarrow$ `ARCHIVED`
  - `ARCHIVED` $\rightarrow$ Terminal state (no outgoing transitions allowed; `ERR-CRT-001` on illegal attempts)

---

## 4. Domain Events

- `CertificationIssued`: Emitted when a certification is issued for an approved policy decision.
- `CertificationVerified`: Emitted when a certification passes verification auditing.
- `CertificationActivated`: Emitted when a certification is activated for governance clearance.
- `CertificationRevoked`: Emitted when a certification is revoked due to policy failure or manual intervention.
- `CertificationArchived`: Emitted when a certification is archived.

---

## 5. Structured Error Model

| Error Class | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| `CertificationValidationError` | `ERR-CRT-001` | Request properties validation or illegal status transition attempt |
| `CertificationIssuanceError` | `ERR-CRT-002` | Attempt to issue certification for non-APPROVED policy decision |
| `UnknownCertificationError` | `ERR-CRT-003` | Unregistered certification ID referenced |
| `DuplicateCertificationError` | `ERR-CRT-004` | Attempted issuance of duplicate Certification ID |
| `CertificationTraceabilityError` | `ERR-CRT-005` | Missing/invalid traceability reference |
| `CertificationContractViolation` | `ERR-CRT-006` | CTR-005 boundary violation |
| `CertificationNotFoundError` | `ERR-CRT-007` | Requested certification ID not found |

---

## 6. Enforced Invariants

1. **Policy Approval Requirement**: Certifications may ONLY be issued for PolicyDecisions with status `APPROVED` (`ERR-CRT-002`).
2. **Immutable Reference Invariant**: Assessment ID and Policy Decision ID references cannot be altered once issued.
3. **State Machine Strictness**: Transition attempts violating allowed status flows are rejected (`ERR-CRT-001`).
4. **Pure Input Protection**: No assessment, evidence, rule result, or policy decision is ever mutated by the Certification Engine.

---

## 7. Test Inventory

- **Unit Tests**: Aggregate root, value objects, state transitions, state snapshot generation (`tests/unit/`).
- **Contract Tests**: `CTR-005` payload compliance checks (`tests/contract/`).
- **Compliance Tests**: Enforcement of approved policy decision invariant (`ERR-CRT-002`) and duplicate rejection (`tests/compliance/`).
- **Regression Tests**: Canonical JSON serialization round-trip determinism (`tests/regression/`).
- **Acceptance Tests**: Full end-to-end chain verification across Assessment Core, Evidence Manager, Rule Engine, Policy Resolver, and Certification Engine (`tests/acceptance/`).

---

## 8. Explicit Non-Goals

The `@cep/certification-engine` module explicitly does **NOT**:
- Perform evidence evaluation or rule checking.
- Resolve governance policy profiles or threshold rules.
- Interact with external Git repositories, SCM APIs, or AI providers.
- Provide REST, GraphQL, CLI, or UI interfaces.

---

## 9. Traceability Annotation

- **Constitutional Source**: `docs/architecture/CEF-ARCHITECTURAL-ROLE.md` (Formal Attestation & Trust Layer)
- **Domain Concepts**: `Certification`, `Attestation`, `Trust Layer` (`docs/domain/DOMAIN-MODEL.md`)
- **Governed Contract**: `CTR-005` (Certification Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`)
- **Runtime Component**: `CertificationEngine` (`docs/runtime/COMPONENT-CATALOG.md`)
