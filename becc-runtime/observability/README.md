# BECC v2 — Operational Observability Architecture (BECC-NEXT-004)

## Overview

Operational observability in BECC v2 provides provider-neutral, machine-readable operational logging, timing metrics, safe error classification, and dependency health diagnostics for BECC runtime operations without compromising governance integrity or security.

---

## Observability vs Governance Audit Ledger

| Aspect | Governance Audit Ledger (`BeccAuditLedgerPort`) | Operational Observability (`BeccOperationalObserverPort`) |
| :--- | :--- | :--- |
| **Purpose** | Evidentiary governance history proving operation occurrences | Operational health, timing, status, and dependency diagnostics |
| **Persistence** | Durable, append-only PostgreSQL storage | Provider-neutral events (structured log / in-memory / metrics) |
| **Payload** | Full canonical input/evidence/provenance references | Machine-readable metadata, durationMs, safe error codes |
| **Failure Mode** | Best-effort isolation at real domain service boundaries | Best-effort failure isolation (never throws or mutates domain) |

`OBSERVABILITY_IS_GOVERNANCE_AUDIT`: **NO**  
`OBSERVABILITY_DUPLICATES_AUDIT_LEDGER`: **NO**  
`OBSERVABILITY_MUTATES_DOMAIN_RESULT`: **NO**

---

## Operational Status Taxonomy

1. **`SUCCESS`**: Operation completed with a valid positive outcome.
2. **`REFUSED`**: Operation was explicitly refused by domain invariants, unmapped context, or missing authorization. Distinct from failure/error.
3. **`INDETERMINATE`**: Operation evaluated with conflicting evidence or ambiguous state.
4. **`ERROR`**: Operational failure or unexpected exception occurred during execution.

---

## What Observability Records

- Operation lifecycle (`STARTED`, `COMPLETED`, `FAILED`).
- Operation identifiers (`operationType`, `operationId`, `correlationRef`, `causationRef`, `projectRef`, `workstreamRef`).
- Monotonic execution duration in milliseconds (`durationMs`).
- Dependency telemetry for Governed Learning & PostgreSQL Audit Ledger (`dependencyName`, `operation`, `status`, `durationMs`, `safeErrorCode`, `errorClass`).
- Component health state events (`component`, `healthState`, `liveness`, `readiness`).

---

## What Observability DOES NOT Record

- **No Secrets**: Passwords, API keys, JWTs, bearer tokens, cookies, SSH private keys are strictly redacted/dropped via `ObservabilitySecurityPolicy` reusing `AuditMetadataSecurityPolicy`.
- **No Raw Payloads**: Raw request/response bodies, file contents, prompts, or model outputs are prohibited.
- **No Tenancy Inventions**: No `tenantRef`, `organizationRef`, or `userEmail` fields are added.
- **No Audit Payload Duplication**: Audit metadata and input/evidence payloads are never copied into operational logs.
- **No Fabricated Audit IDs or Causation**: Audit record IDs are only logged when an audit record actually exists. Causation references are never fabricated.

---

## Dependency Health & Readiness

- **Liveness vs Readiness**:
  - `LIVENESS`: Process capability to operate.
  - `READINESS`: Dependencies and schema configuration permit intended operation.
- **PostgreSQL Audit Persistence**:
  - Read-only health check (`checkHealth()`) verifies connection, schema `becc`, and migration checksum without writing synthetic audit records (`HEALTH_CHECK_WRITES_SYNTHETIC_AUDIT_RECORD: NO`).
- **Governed Learning Dependency**:
  - Reported as `PASSIVE_ONLY` because GL does not expose a non-mutating active health probe endpoint.

---

## Failure Isolation

- All observer calls inside services are wrapped in `try/catch` blocks.
- Observer internal errors or adapter failures are strictly isolated and never throw, fail closed domain operations, or alter domain results.
