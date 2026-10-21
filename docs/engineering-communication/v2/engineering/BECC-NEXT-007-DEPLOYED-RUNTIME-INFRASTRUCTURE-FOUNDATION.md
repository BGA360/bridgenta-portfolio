# BECC-NEXT-007 — Deployed Runtime Infrastructure Foundation

## 1. Executive Summary

- **Workstream ID:** `BRIDGENTA-BECC-V2-BECC-NEXT-007-DEPLOYED-RUNTIME-INFRASTRUCTURE-FOUNDATION-01`
- **Preceding Baseline:** BECC-NEXT-006D (`feature/becc-next-006d-final-runtime-certification`, PR #326)
- **Objective:** Establish the minimum real deployed runtime infrastructure foundation required to resolve the three blockers identified in 006D:
  - `NEXT006D-BLK-001`: Actual Deployed BECC Runtime Existence
  - `NEXT006D-BLK-002`: Live Remote PostgreSQL & Least-Privilege Runtime Role
  - `NEXT006D-BLK-003`: Live-Reachable Health & Readiness Endpoints
- **Current Canonical Status:**
  ```text
  DEPLOYED_RUNTIME_CERTIFICATION:
  NOT_CERTIFIED

  BECC_NEXT_007_STATUS:
  FOUNDATION_ESTABLISHED

  SAFE_TO_CLAIM_DEPLOYED_RUNTIME_CERTIFIED:
  NO

  SAFE_TO_CLAIM_PRODUCTION_CERTIFIED:
  NO

  SAFE_TO_MERGE_NEXT007_PR:
  NO
  ```

---

## 2. Architectural Scope & Target Topology

### 2.1 Repository & Hosting Bifurcation
- **Frontend / Portfolio Platform:** GitHub Pages (`STATIC_SITE_ONLY`), strictly build-time Astro SSG. No dynamic backend code executes on Pages.
- **Backend / BECC Runtime Platform:** Dedicated Node.js containerized service (`becc-runtime`), packaged for container or standalone process execution with live HTTP endpoints.

```mermaid
flowchart TD
    subgraph PublicInternet["Public Edge / GitHub Pages (Static Site Only)"]
        AstroApp["Astro SSG Web App<br/>(https://bga360.github.io/bridgenta-portfolio/)"]
        ClientBrowser["Client Browser"]
        ClientBrowser -->|HTTPS GET| AstroApp
    end

    subgraph DeployedRuntimeZone["BECC Runtime Service Domain (Port 8080)"]
        HttpServer["BeccHttpServer (node:http)<br/>becc-runtime/bin/server.js"]
        HealthEndpoint["GET /health<br/>(200 OK / 503 Service Unavailable)"]
        ReadyEndpoint["GET /ready<br/>(200 OK / 503 Service Unavailable)"]
        VersionEndpoint["GET /version<br/>(200 OK, Version Metadata)"]
        
        HttpServer --> HealthEndpoint
        HttpServer --> ReadyEndpoint
        HttpServer --> VersionEndpoint
    end

    subgraph PersistenceZone["Database Domain (Port 5432)"]
        PostgresDB["PostgreSQL 16.8 Engine"]
        AppRole["Least-Privilege Role: becc_app<br/>(SELECT, INSERT allowed; DDL, UPDATE, DELETE denied)"]
        PostgresDB --- AppRole
    end

    HttpServer -->|TCP Connection Pool (autoMigrate: false)| AppRole
```

---

## 3. Blocker Remediation Analysis

| Blocker ID | Control Description | 006D Finding | 007 Remediation Implementation | Post-007 State |
| :--- | :--- | :--- | :--- | :--- |
| **NEXT006D-BLK-001** | Actual Deployed BECC Runtime Existence | Hosting platform was static HTML only. No runtime daemon or service process existed. | Implemented `BeccHttpServer` (`server/becc-http-server.ts`), standalone executable `bin/server.ts`, CLI command `becc serve`, production multi-stage `Dockerfile`, and `docker-compose.yml`. | `FOUNDATION_ESTABLISHED` |
| **NEXT006D-BLK-002** | Live Remote PostgreSQL & Least-Privilege Role | Database and role existed only in ephemeral test containers. | Wired runtime configuration via 006A `loadDeployedConfig()`, enforced `autoMigrate: false` for `becc_app` runtime role, and provided reproducible schema/role provisioning. | `FOUNDATION_ESTABLISHED` |
| **NEXT006D-BLK-003** | Live-Reachable Health & Readiness Endpoints | Probes existed solely as in-process CLI functions without network accessibility. | Exposed native HTTP endpoints: `GET /health` (200/503), `GET /ready` (200/503), `GET /version` (200), strictly secret-sanitized with no-cache headers. | `FOUNDATION_ESTABLISHED` |

---

## 4. HTTP Service Interface Contract

### 4.1 Endpoints Specification

#### `GET /health` (and alias `/healthz`)
- **Success (200 OK):** Returned when audit persistence storage is `HEALTHY` or `DEGRADED`.
- **Failure (503 Service Unavailable):** Returned when persistence storage is `UNAVAILABLE` or `MISCONFIGURED`.
- **Response Format:**
  ```json
  {
    "component": "POSTGRES_AUDIT_LEDGER",
    "healthState": "HEALTHY",
    "liveness": true,
    "readiness": true,
    "details": {
      "safeMessage": "PostgreSQL audit persistence operational",
      "checkDurationMs": 2
    },
    "occurredAt": "2026-10-21T16:00:00.000Z"
  }
  ```

#### `GET /ready` (and alias `/readyz`)
- **Success (200 OK):** Returned when `readiness === true`.
- **Failure (503 Service Unavailable):** Returned when `readiness !== true`.
- **Response Format:** Same schema as `/health`.

#### `GET /version` (and alias `/meta`)
- **Success (200 OK):**
  ```json
  {
    "name": "becc-runtime",
    "version": "2.0.0-GA",
    "releaseSha": "ea0bb00f632d9849dffd2f8d6787d1250d77fbac",
    "storageType": "postgres",
    "status": "OPERATIONAL",
    "timestamp": "2026-10-21T16:00:00.000Z"
  }
  ```

#### HTTP Security & Method Restrictions
- **Methods Allowed:** `GET`, `HEAD`.
- **Method Rejection (405):** Any request using `POST`, `PUT`, `DELETE`, `PATCH` returns HTTP 405 Method Not Allowed with header `Allow: GET, HEAD`.
- **Unmapped Routes (404):** Any unmapped path returns HTTP 404 Not Found.
- **Security Headers:**
  - `Content-Type: application/json; charset=utf-8`
  - `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
  - `X-Content-Type-Options: nosniff`

---

## 5. Security & Isolation Controls

1. **Least-Privilege Database Role:** The runtime service connects exclusively via `becc_app`. The database engine enforces denial (`SQLSTATE 42501`) on `UPDATE`, `DELETE`, `TRUNCATE`, and all `DDL`.
2. **Read-Only / No Auto-Migration:** The service specifies `autoMigrate: false`, ensuring no schema alterations can be attempted by the application process.
3. **Zero Secret Leakage:** Diagnostic messages and response bodies are processed through `ObservabilitySecurityPolicy`. Passwords, credentials, and connection strings are strictly redacted.
4. **Container Security:** Multi-stage build executes under unprivileged user `node` (UID 1000).

---

## 6. Non-Claims & Certification Boundaries

The following non-claims remain strictly in effect:

```text
DEPLOYED_RUNTIME_CERTIFIED: NO
PRODUCTION_CERTIFIED: NO
TLS_CERTIFIED: NO
MULTI_REGION_CERTIFIED: NO
DISASTER_RECOVERY_CERTIFIED: NO
ZERO_DOWNTIME_CERTIFIED: NO
ZERO_DATA_LOSS_CERTIFIED: NO
EXACTLY_ONCE_CERTIFIED: NO
RTO_CERTIFIED: NO
RPO_CERTIFIED: NO
```

Establishing the infrastructure foundation makes live deployment possible; it does **not** substitute for live deployed-runtime certification.

---

## 7. Verification Evidence & CI Pipeline Integration

- **Automated Tests:** `becc-runtime/tests/service-entrypoint.test.ts` (15/15 tests green).
- **Existing CLI Probes:** `becc-runtime/tests/cli-health-readiness.test.ts` (13/13 tests green).
- **CI Service Verification:** Background execution in `.github/workflows/deploy.yml` with live HTTP probing.
- **Evidence Report:** `stewardship/reports/becc-007-deployed-infrastructure-evidence.json`.
