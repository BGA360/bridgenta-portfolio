# BECC-NEXT-006C: Deployed Failure Injection, Outage, Recovery & Multi-Instance Certification

## 1. Executive Summary

This engineering communication artifact documents the architecture, failure-injection mechanisms, scenario register, and validation results for **BECC-NEXT-006C** (`BRIDGENTA-BECC-V2-BECC-NEXT-006C-DEPLOYED-FAILURE-INJECTION-OUTAGE-RECOVERY-MULTI-INSTANCE-CERTIFICATION-01`).

Building upon the standalone PostgreSQL testbed and least-privilege role provisioning established in BECC-NEXT-006B, Wave 006C certifies that the BridGenta BECC runtime behaves safely, fail-closed, and truthfully under network dependency disruptions, database unavailability, recovery resumption, and multi-instance concurrency.

---

## 2. Environment & Architectural Boundaries

### 2.1 Certification Environment
- **Environment Classification:** `STANDALONE_NETWORKED_CI`
- **Database Engine Image:** `postgres:16.8` (fixed tag, non-embedded)
- **Network Mode:** TCP loopback mapping on port `5432`
- **Service Management:** Dedicated container `becc-postgres-006c` running inside GitHub Actions CI runner
- **Credentials:** Ephemeral CI credentials (`postgres_admin` / `becc_app`) with zero production secret exposure

### 2.2 Safety & Failure-Injection Boundaries
- **Scope Isolation:** Failure injection is strictly bounded to the CI testbed container `becc-postgres-006c`.
- **Zero Broad Host Killing:** No host process termination or machine-wide destructive commands are utilized.
- **Zero Production Touch:** Ephemeral test container only; production resources are completely untouched.

---

## 3. Failure Injection & Recovery Mechanics

### 3.1 Controlled Outage Injection
- **Method:** `docker stop becc-postgres-006c (controlled container stop)`
- **Mechanism:** Immediately terminates the containerized PostgreSQL daemon and closes TCP port `5432`. Subsequent client connection attempts receive immediate `ECONNREFUSED` / connection failure.
- **Truthfulness:** Truthfully reported as service/container outage; physical host power loss is not claimed.

### 3.2 Controlled Dependency Recovery
- **Method:** `docker start becc-postgres-006c (controlled container start)`
- **Mechanism:** Restarts the containerized PostgreSQL daemon, allowing PostgreSQL to perform standard WAL startup/recovery and listen on TCP port `5432`.
- **Readiness Verification:** Polled via `pg_isready -h localhost -p 5432 -U postgres_admin` until ready status is confirmed before post-recovery scenarios proceed.

---

## 4. Scenario Register & Verification Results

The certification suite implements 17 deterministic failure/recovery scenarios:

| Scenario ID | Scenario Name | Injection Method | Expected Behavior | Result |
| :--- | :--- | :--- | :--- | :--- |
| **006C-S01** | Healthy standalone startup | None (Baseline) | Connects via 006A deployed config loader as `becc_app` | **PASS** |
| **006C-S02** | Health probe while DB healthy | None (Baseline) | `executeHealthProbe` returns exitCode `0`, `HEALTHY`, secret-free | **PASS** |
| **006C-S03** | Readiness probe while DB healthy | None (Baseline) | `executeReadinessProbe` returns exitCode `0`, `HEALTHY`, ready | **PASS** |
| **006C-S04** | DB becomes unavailable | `docker stop` | Port 5432 closes, TCP connections fail with `ECONNREFUSED` | **PASS** |
| **006C-S05** | Health reflects DB unavailability | During outage | `executeHealthProbe` returns exitCode `1`, `UNAVAILABLE`, sanitized error | **PASS** |
| **006C-S06** | Readiness reflects DB unavailability | During outage | `executeReadinessProbe` returns exitCode `1`, `readiness: false` | **PASS** |
| **006C-S07** | Audit append during outage fails safely | During outage | Append rejects safely; fail-closed without uncaught crash | **PASS** |
| **006C-S08** | No silent in-memory fallback | During outage | Adapter remains strictly `PostgresBeccAuditLedger`; no silent L0 switch | **PASS** |
| **006C-S09** | PostgreSQL service recovers | `docker start` | Port 5432 opens, `pg_isready` succeeds | **PASS** |
| **006C-S10** | Health recovers truthfully | After recovery | `executeHealthProbe` returns exitCode `0`, `HEALTHY` | **PASS** |
| **006C-S11** | Readiness recovers truthfully | After recovery | `executeReadinessProbe` returns exitCode `0`, `readiness: true` | **PASS** |
| **006C-S12** | Audit append resumes after recovery | After recovery | New audit records append successfully to restored DB | **PASS** |
| **006C-S13** | Query/read resumes after recovery | After recovery | Records retrievable; outage-attempt record was NOT written | **PASS** |
| **006C-S14** | Pool re-instantiation after recovery | After recovery | Fresh connection pool initializes and queries cleanly | **PASS** |
| **006C-S15** | Multi-instance concurrent appends | Standalone TCP | 3 independent clients append concurrently; zero lost records | **PASS** |
| **006C-S16** | Multi-instance retry & conflict detection | Standalone TCP | Exact retry idempotent success; conflicting retry fails closed | **PASS** |
| **006C-S17** | Migration & checksum integrity after recovery | Standalone TCP | Migrations idempotent; altered checksum fails closed | **PASS** |

---

## 5. Domain Service Failure Isolation Matrix

When the durable PostgreSQL audit ledger is unavailable:

| Domain Service | Behavior During Audit Outage | Classification |
| :--- | :--- | :--- |
| **Governed Guidance Resolver** | Continues guidance resolution successfully; records audit degradation via observer | `DOMAIN_CONTINUES_WITH_AUDIT_DEGRADED` |
| **Finding Escalation Service** | Continues finding escalation successfully; records audit degradation via observer | `DOMAIN_CONTINUES_WITH_AUDIT_DEGRADED` |
| **Publication Readiness Evaluation** | Continues evaluation successfully; records audit degradation via observer | `DOMAIN_CONTINUES_WITH_AUDIT_DEGRADED` |

---

## 6. Least-Privilege & Boundary Preservation

- **PostgreSQL Database Engine Permissions:** Verified after recovery that `becc_app` retains strictly least privilege:
  - `SELECT` & `INSERT`: **ALLOWED**
  - `UPDATE`, `DELETE`, `TRUNCATE`, `DDL`: **DENIED** (`SQLSTATE 42501`)
  - Cross-schema access to `governed_learning`: **DENIED** (`SQLSTATE 42501`)
- **Governed Learning (GL) Boundary:** BECC communicates exclusively via public API ports; BECC never accesses GL persistence internals or tables directly.
- **M5 Shadow Observation & PRAG Gate:** Untouched and preserved; all shadow history observations remain intact.
- **Audit Immutability:** Audit record append-only semantics and retry equivalence are strictly preserved.

---

## 7. Explicit Non-Claims

This workstream explicitly does **NOT** claim:
- Full deployed-runtime certification (Wave 006D scope)
- Production certification
- TLS certification (`PGSSL=disable` in local/CI testbed)
- Automatic failover or high availability clustering
- Multi-region resilience or disaster recovery
- Distributed transactions or consensus protocols
- Exactly-once delivery guarantees (at-least-once with deterministic deduplication)
- Zero downtime or zero data loss under storage hardware destruction
