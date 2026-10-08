# BECC v2 — BECC-NEXT-005 Recovery & Multi-Instance Certification Document

## 1. Executive Summary

This document certifies **BECC-NEXT-005 — Recovery & Multi-Instance Certification** for BridGenta BECC v2.

The certification proves that BECC operates truthfully, deterministically, and resiliently across process restart, database connection loss and recovery, multi-instance concurrency sharing a PostgreSQL audit ledger, and real domain service executions.

---

## 2. Recovery & Multi-Instance Architecture Model

```text
               +----------------------------------+          +----------------------------------+
               |     BECC Runtime Instance A      |          |     BECC Runtime Instance B      |
               | (Process A / Independent Memory) |          | (Process B / Independent Memory) |
               +----------------------------------+          +----------------------------------+
                                |                                         |
                                | (SQL over TCP)                          | (SQL over TCP)
                                +--------------------+ +------------------+
                                                     | |
                                                     v v
                                       +-------------------------------+
                                       |  PostgreSQL 18.4 Audit Store  |
                                       |  (becc.becc_audit_records)    |
                                       +-------------------------------+
```

### Supported Operating Modes & Guarantees
1. **Multi-Instance Shared Storage:** Multiple independent BECC runtime instances safely write to and query the same PostgreSQL database (`becc.becc_audit_records`).
2. **PostgreSQL-Backed Correctness:** All durable retry equivalence, conflict detection, and query ordering rely strictly on PostgreSQL primary key constraints (`audit_record_id`) and TIMESTAMPTZ index ordering. No cross-process in-memory lock or hidden shared memory is required.
3. **Domain Failure Isolation:** Audit persistence outage (e.g., PostgreSQL connection failure) is strictly isolated at service boundaries. Real domain services (`GovernedGuidanceResolverService`, `FindingEscalationService`, `PublicationReadinessEvaluationService`) return true domain outputs during audit storage outage and resume audit recording upon connection restoration.
4. **Health Readiness Signal Accuracy:** `checkHealth()` accurately reflects outage (`healthState: 'UNAVAILABLE'`, `readiness: false`) and recovery (`healthState: 'HEALTHY'`, `readiness: true`) without creating synthetic audit records.

---

## 3. Explicit Non-Claims & Architectural Boundaries

> [!IMPORTANT]
> The following non-claims are certified as true and unchanged across all operating conditions:

- **No Exactly-Once Claim:** BECC guarantees *at-least-once caller retry tolerance* via *durable idempotent retry*, not distributed exactly-once message delivery.
- **No Distributed Transaction Claim:** BECC and Governed Learning do not share a 2-phase commit or distributed transaction.
- **GL Boundary Preserved:** Governed Learning integration uses public adapter APIs only. BECC never writes GL tables, imports GL persistence internals, or duplicates GL concurrency control.
- **M5 / PRAG Boundary Preserved:** BECC does not own final publication authority. M5 / PRAG governance authority remains unchanged.
- **Metadata Security Boundary Preserved:** All audit metadata writes are sanitized via `AuditMetadataSecurityPolicy`. PostgreSQL connection errors in health checks are sanitized via `ObservabilitySecurityPolicy`. No secrets or raw payloads are persisted or exposed.

---

## 4. Test Verification Evidence Matrix

| Test Suite / Area | Command | Test Count | Result |
|---|---|---:|---|
| **BECC Recovery & Multi-Instance** | `node --test becc-runtime/dist/tests/recovery-multi-instance.real.test.js` | 8 | PASS |
| **BECC Real PostgreSQL Audit** | `node --test becc-runtime/dist/tests/postgres-audit-ledger.real.test.js` | 17 | PASS |
| **BECC Operational Observability** | `node --test becc-runtime/dist/tests/operational-observability.test.js` | 11 | PASS |
| **Governed Learning Unit** | `npm run --prefix packages/governed-learning test` | 310 | PASS |
| **Governed Learning PostgreSQL** | `npm run --prefix packages/governed-learning test:postgres` | 19 | PASS |
| **Root Application Build** | `npm run build` | N/A | PASS |
| **Markdown Documentation Lint** | `npm run lint` | N/A | PASS |

---

## 5. Certification Status

`BECC_NEXT_005_STATUS: CERTIFIED_ON_FEATURE_BRANCH`
