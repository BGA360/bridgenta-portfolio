# BECC v2 — BECC-NEXT-006B Standalone PostgreSQL CI Testbed & Role Provisioning Specification

## 1. Executive Summary

This document specifies the technical baseline and verification results for **BECC-NEXT-006B — Standalone PostgreSQL CI Testbed & Least-Privilege Role Provisioning**.

BECC-NEXT-006B closes two engineering gaps identified in the deployed-runtime readiness audit:
* `NEXT006-GAP-003`: Standalone Networked PostgreSQL CI/CD Service Testbed
* `NEXT006-GAP-004`: Standalone Least-Privilege Database Role Provisioning Automation

---

## 2. Architecture & Service Topology

```text
+-------------------------------------------------------------------------------+
|                       GitHub Actions Runner (Ubuntu Linux)                    |
|                                                                               |
|  +--------------------------------+       +--------------------------------+  |
|  |     BECC Runtime Processes     |       |   PostgreSQL Service Container |  |
|  |   - Deployed Config Loader     |  TCP  |   - Image: postgres:16.8       |  |
|  |   - CLI Probes (health/ready)  | ----> |   - Port: 5432                 |  |
|  |   - PostgresBeccAuditLedger    |       |   - Healthcheck: pg_isready    |  |
|  +--------------------------------+       +--------------------------------+  |
|         ^                                                 |                   |
|         | Authenticated as: becc_app                      |                   |
|         +-------------------------------------------------+                   |
+-------------------------------------------------------------------------------+
```

### Component Parameters
* **PostgreSQL Image:** `postgres:16.8` (fixed tag, non-floating)
* **Networking:** Direct TCP connection over port 5432
* **Health Check:** `pg_isready` (interval: 10s, timeout: 5s, retries: 5)
* **Administrative Bootstrap User:** `postgres_admin` (ephemeral test-scoped credentials)
* **Runtime Application Role:** `becc_app` (strictly least-privilege)
* **TLS Mode:** Explicit `PGSSL=disable` within container testbed network; TLS certification is **NOT** claimed.

---

## 3. Least-Privilege Role Provisioning Contract

Role provisioning is automated via [`01_provision_becc_app_role.sql`](file:///c:/antigravity/statichtmlpro/fdrefs/becc-runtime/provisioning/01_provision_becc_app_role.sql) and the programmatic [`provisionBeccAppRole`](file:///c:/antigravity/statichtmlpro/fdrefs/becc-runtime/provisioning/provision-role.ts) utility.

### Role Permission Matrix

| Operation | Target Object | Engine Level Enforcement | Status |
| :--- | :--- | :--- | :---: |
| `CONNECT` | Database (`becc_testdb`) | PostgreSQL Engine | **ALLOWED** |
| `USAGE` | Schema `becc` | PostgreSQL Engine | **ALLOWED** |
| `SELECT` | Table `becc.becc_audit_records` | PostgreSQL Engine | **ALLOWED** |
| `INSERT` | Table `becc.becc_audit_records` | PostgreSQL Engine | **ALLOWED** |
| `SELECT` | Table `becc.schema_migrations` | PostgreSQL Engine | **ALLOWED** |
| `UPDATE` | Table `becc.becc_audit_records` | PostgreSQL Engine (`42501`) | **DENIED** |
| `DELETE` | Table `becc.becc_audit_records` | PostgreSQL Engine (`42501`) | **DENIED** |
| `TRUNCATE` | Table `becc.becc_audit_records` | PostgreSQL Engine (`42501`) | **DENIED** |
| `CREATE` / `DDL` | Schema `becc` / Tables | PostgreSQL Engine (`42501`) | **DENIED** |
| `SUPERUSER` | Database Server | PostgreSQL Engine | **DENIED** |
| Cross-Schema | Schema `governed_learning` | PostgreSQL Engine (`42501`) | **DENIED** |

### Idempotency & Repeatability
Re-running role provisioning against an existing database executes deterministically and idempotently without errors, without privilege escalation, and without modifying unaffected roles.

---

## 4. Deployed Configuration Loader Integration

All runtime connections and CLI probes execute through the 006A deployed configuration loader (`loadDeployedConfig`):
```text
BECC_STORAGE_TYPE=postgres
PGHOST=localhost
PGPORT=5432
PGDATABASE=becc_testdb
PGUSER=becc_app
PGPASSWORD=ephemeral_app_password
PGSSL=disable
```
Direct instantiation without configuration validation or silent in-memory fallback is prohibited.

---

## 5. Explicit Non-Claims & Architectural Boundaries

> [!IMPORTANT]
> The following non-claims are certified as true and preserved:

1. **No Deployed Runtime Certification Claim:** Status is `IMPLEMENTED_AND_TESTED_IN_CI`. Full deployed runtime certification requires failure-injection verification in Wave 006C and operational review in Wave 006D.
2. **No TLS Certification Claim:** Service container networking runs in explicit non-TLS mode (`PGSSL=disable`). TLS certification is not claimed.
3. **No 006C Failure Injection Claim:** Socket termination, network partition, and multi-process crash resumption under load are deferred to Wave 006C.
4. **GL Boundary Preserved:** Governed Learning integration uses public adapter APIs only. BECC never writes GL tables, imports GL persistence internals, or shares physical transactions.
5. **M5 / PRAG Boundary Preserved:** BECC does not own final publication authority. M5 / PRAG governance authority remains unchanged.
6. **Audit Append-Only Semantics Preserved:** Audit records remain strictly immutable and append-only.

---

## 6. Verification Status

```text
NEXT006_GAP_003_STATUS: CLOSED
NEXT006_GAP_004_STATUS: CLOSED
BECC_NEXT_006B_STATUS: IMPLEMENTED_AND_TESTED_IN_CI
SAFE_TO_BEGIN_006C: PENDING_PR_MERGE_AND_VERIFICATION
DEPLOYED_RUNTIME_CERTIFIED: NO
```
