# BECC v2 — Minimal Incident Response Playbook (GAP-PROD-008 & Core Goal D)

## Purpose

Provides a deterministic operational triage runbook for engineers operating the BECC v2 runtime.
Covers initial detection, containment actions, root-cause diagnostics, and remediation procedures for all standard operational incidents.

---

## Authoritative Governance & Recovery Boundaries

```text
RECOVERY_TIME_OBJECTIVE (RTO):
OWNER_DECISION_REQUIRED (DEC-OWNER-001 / DEC-OWNER-002)

RECOVERY_POINT_OBJECTIVE (RPO):
OWNER_DECISION_REQUIRED (DEC-OWNER-001 / DEC-OWNER-002)

PRODUCTION_DATA_ENABLED:
NO (Strictly Forbidden until full production certification)

MAXIMUM_TRUTHFUL_CURRENT_CLAIM:
REMOTE_TEST_ENVIRONMENT_VALIDATED
```

---

## Operational Incident Matrix

| Incident Type | Primary Detection | Containment Action | Diagnostic & Remediation Steps |
| :--- | :--- | :--- | :--- |
| **1. Runtime Unavailable** | `/health` returns connection refused or HTTP 500/503 | Check process state; verify container status | Inspect container stdout/stderr for unhandled crashes; check memory/OOM limits; restart container. |
| **2. Database Unavailable** | `/ready` returns HTTP 503 (`state: UNAVAILABLE`) | Isolate traffic; verify DB server reachability | Verify PostgreSQL network connectivity and port; check connection limits; check disk space; inspect PostgreSQL server logs. |
| **3. Readiness Probe Failure** | `/ready` returns HTTP 503 while `/health` is 200 | Do not route user traffic to unready instance | Inspect `dependencies.storage.safeMessage`; confirm schema migrations are verified; check database connection pool status. |
| **4. Audit Persistence Failure** | `/health` reports degraded or `AUDIT_APPEND` error | Protect audit integrity; halt operations requiring durable records | Check `becc_app` user permissions; verify database disk capacity; verify audit ledger constraints; review connection pool health. |
| **5. Secret / Config Failure** | `/health` returns HTTP 503 (`MISCONFIGURED`) | Process aborts or refuses live requests | Check missing environment variables (`BECC_STORAGE_TYPE`, `PGHOST`, etc.); verify secret provider; ensure no secret values are logged. |
| **6. Deployment Regression** | `/version` SHA mismatch or post-deploy health failure | Trigger immediate automated or manual rollback | Execute rollback to pinned prior canonical release SHA; verify `/health` and `/ready` on prior container; record incident evidence. |
| **7. Rollback Execution** | Rollback triggered by operational failure | Pin traffic to prior known-good SHA | Execute RollbackController verification; verify database backward-compatibility; switch active release pointer; post-verify endpoints. |
| **8. TLS Handshake / Certificate Rejection** | Node reports `SELF_SIGNED_CERT` or connection drop | Verify CA bundle path and certificate validity | Inspect `PGSSL_CA_PATH` / `PGSSL_CA_CONTENT`; verify certificate expiration dates; confirm provider certificate rotation. |
| **9. Provider Outage** | Provider dashboard reports service degradation | Await provider failover or execute DR switch | Monitor provider status page; do not attempt unsafe cleartext overrides; await provider restoration; execute synthetic restore drill. |
| **10. Suspected Credential Compromise** | Secret exposed in logs or unauthorized access attempt | Revoke credential immediately; rotate secret | Revoke compromised credential in provider console; generate fresh secret; inject via secret provider; restart runtime with zero downtime. |

---

## Rollback Execution Runbook

When a post-deployment verification fails:
1. **Identify Rollback Target**: Retrieve the exact prior commit SHA from deployment manifest.
2. **Database Compatibility Gate**: Verify that any migrations applied by the regressed release are backward-compatible with the rollback target.
3. **Switch Release Pointer**:
   ```bash
   # Deploy pinned prior image
   docker run -d --name becc-runtime-rollback becc-runtime:<ROLLBACK_TARGET_SHA>
   ```
4. **Post-Rollback Probe**:
   ```bash
   curl -s http://127.0.0.1:8080/health | grep -q '"healthState": "HEALTHY"'
   curl -s http://127.0.0.1:8080/version | grep -q '<ROLLBACK_TARGET_SHA>'
   ```
5. **Capture Post-Mortem Evidence**: Export container logs, structured operational events, and timestamps for review.
