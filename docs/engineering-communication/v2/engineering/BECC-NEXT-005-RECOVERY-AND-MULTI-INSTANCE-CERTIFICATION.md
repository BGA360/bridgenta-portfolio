# BECC v2 — BECC-NEXT-005 Recovery & Multi-Instance Certification Document

## 1. Executive Summary

This document certifies **BECC-NEXT-005 — Recovery & Multi-Instance Certification** for BridGenta BECC v2.

The certification proves that BECC operates truthfully, deterministically, and resiliently across adapter re-instantiation, new connection pool creation, client-side connectivity loss and recovery, multi-instance concurrency sharing a PostgreSQL audit ledger, and real domain service executions.

---

## 2. Recovery & Multi-Instance Architecture Model

```text
               +----------------------------------+          +----------------------------------+
               |     BECC Runtime Instance A      |          |     BECC Runtime Instance B      |
               | (Adapter A / New Pool A)         |          | (Adapter B / New Pool B)         |
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

### Supported Operating Modes & Tested Guarantees
1. **Multi-Instance Shared Storage:** Multiple independent BECC runtime instances safely write to and query the same shared PostgreSQL database (`becc.becc_audit_records`).
2. **Durable Retry Equivalence & Conflict Prevention:** All retry equivalence and conflict detection rely on a combination of:
   - PostgreSQL primary key uniqueness (`audit_record_id`);
   - Canonical audit-record equivalence comparison (`AuditMetadataSecurityPolicy.canonicalizeRecord`);
   - Adapter-level retry and conflict handling (`PostgresBeccAuditLedger.append`).
   When incoming record fields match the canonical existing record exactly, the retry succeeds idempotently without duplicate row generation. When incoming record fields diverge, the operation fails closed with a conflict error without mutating or overwriting the original record.
3. **Three-Service Failure Isolation & Post-Recovery Audit Resumption:** Audit persistence outage (e.g., PostgreSQL connection closure) is strictly isolated at domain service boundaries. All three real domain services:
   - `GovernedGuidanceResolverService.resolveGuidance()`
   - `FindingEscalationService.escalateFinding()`
   - `PublicationReadinessEvaluationService.evaluateReadiness()`
   maintain truthful domain execution during audit storage outage and resume durable audit recording upon connection restoration via fresh ledger and pool re-composition.
4. **Health Readiness Signal Accuracy:** `checkHealth()` accurately reflects outage (`healthState: 'UNAVAILABLE'`, `readiness: false`) and recovery (`healthState: 'HEALTHY'`, `readiness: true`) without creating synthetic audit records.
5. **Deterministic Test Teardown:** Test fixtures employ native `pg_ctl stop -m immediate` teardown to ensure child worker processes on Windows terminate synchronously without resource leaks or orphaned processes.

---

## 3. Explicit Non-Claims & Architectural Boundaries

> [!IMPORTANT]
> The following non-claims are certified as true and unchanged across all operating conditions:

- **No OS Process Restart Claim:** Only adapter re-instantiation, pool re-creation, and client-side connection teardown are certified. Operating system process lifecycle management is out of scope.
- **No PostgreSQL Server Process Restart Claim:** Tests certify client-side connection drop, pool destruction, and new-pool reconnection against shared storage. Automatic database server recovery under production orchestration is not claimed.
- **No Automatic Failover / Partition Tolerance Claim:** Automatic failover, multi-region clustering, and network partition split-brain resolution are explicitly out of scope.
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
