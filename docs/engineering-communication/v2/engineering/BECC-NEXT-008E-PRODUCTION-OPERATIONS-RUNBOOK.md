# BECC v2 — Production Operations Runbook

## Document Metadata

```text
WORKSTREAM_ID: BRIDGENTA-BECC-V2-BECC-NEXT-008E-PRODUCTION-OPERATIONS-BASELINE-OPERATIONAL-READINESS-HANDOFF-01
DOCUMENT_VERSION: 1.0.0
CANONICAL_PATH: docs/engineering-communication/v2/engineering/BECC-NEXT-008E-PRODUCTION-OPERATIONS-RUNBOOK.md
TARGET_AUDIENCE: Operations, On-Call Engineers, Human Owner, Support Leads
EFFECTIVE_DATE: 2026-10-24
STATUS: APPROVED_OPERATIONAL_BASELINE
```

---

## 1. System Identity & Topology

- **Service Name:** BECC Runtime (`becc-runtime`)
- **Version:** `2.0.0-GA`
- **Architecture:** Single-Provider All-Render Colocated Topology (`DEC-OWNER-001: OPTION-1A`)
- **Cloud Provider:** Render (Render Services Inc.)
- **Deployment Region:** Frankfurt, Germany / EU (`frankfurt` / `fra`)
- **Production Hostname:** `https://becc.bridgenta.de`
- **Ingress Target:** `becc-test-runtime.onrender.com`
- **Authorized Recurring Budget Ceiling:** €15.00 / month (`DEC-OWNER-002`)
- **Current Total Monthly Cost:** ~$14.00 / month (~€13.00 / month)

---

## 2. Infrastructure Inventory & Specifications

### 2.1 Web Service (Compute Runtime)
- **Render Service ID:** `srv-dbcoqtei0phs73fhso1g`
- **Service Name:** `becc-test-runtime`
- **Service Type:** Web Service (Docker container based on Node.js 22 LTS)
- **Compute Tier:** `0.5c-512mb` (Starter, Paid, Always-On)
- **Monthly Cost:** $7.00 / month (~€6.50 / month)
- **Suspension / Sleep Behavior:** Disabled (`suspended: not_suspended`). Continuous compute with 0ms cold-start delay.
- **Port:** Internal HTTP `8080` (mapped to `443` via Render Ingress Edge)

### 2.2 Database Service (Audit Persistence)
- **Render Postgres ID:** `dpg-dbconmuq1p3s73cqbklg-a`
- **Database Name:** `becc-test-postgres`
- **Database Plan:** `basic_1gb` (Persistent, Paid, Non-Expiring)
- **PostgreSQL Version:** 16.8
- **Monthly Cost:** $7.00 / month (~€6.50 / month)
- **External Gateway:** `dpg-dbconmuq1p3s73cqbklg-a.frankfurt-postgres.render.com:5432`
- **Database Identity:** Database `becc_testdb`, Schema `becc`
- **Application Role:** `becc_app` (least privilege: non-superuser, DDL disabled, DML restricted to `becc.*`)

### 2.3 Network & Security Posture
- **Database TLS Architecture:** `DEC-OWNER-003: OPTION-3A` (Strict TLS via external gateway with Let's Encrypt public CA).
- **TLS Verification:** Strict `rejectUnauthorized: true`. Zero driver bypasses, zero fallback, zero global certificate overrides.
- **Public Domain TLS:** Automatic HTTPS via Render Edge using Google Trust Services (WE1 CA). Valid through January 22, 2027.

---

## 3. Endpoints & Route Specifications

| Route | HTTP Methods | Expected Status | Response Content | Human / Operational Purpose |
|---|---|---|---|---|
| `/` | `GET`, `HEAD` | `200 OK` | `{"service":"BECC Runtime","status":"ok","health":"/health","ready":"/ready","version":"/version"}` | Human-understandable service greeting & endpoint index for human visitors and operators navigating directly |
| `/health` (alias `/healthz`) | `GET`, `HEAD` | `200 OK` / `503 Service Unavailable` | Structured JSON (`HealthReport`) | Process liveness and PostgreSQL audit ledger connectivity probe |
| `/ready` (alias `/readyz`) | `GET`, `HEAD` | `200 OK` / `503 Service Unavailable` | Structured JSON (`HealthReport`) | Traffic readiness probe (verifies database write/read readiness) |
| `/version` (alias `/meta`) | `GET`, `HEAD` | `200 OK` | Structured JSON (`releaseSha`, `version`, `status`) | Release provenance and git commit SHA verification |
| Unmapped Paths | `GET`, `HEAD` | `404 Not Found` | `{"error":"Not Found"}` | Clean fail-closed response for undefined paths |
| Non-GET/HEAD | `POST`, `PUT`, etc. | `405 Method Not Allowed` | `{"error":"Method Not Allowed"}` | Enforces method restriction with `Allow: GET, HEAD` |

All responses strictly apply security headers:
- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- `X-Content-Type-Options: nosniff`

---

## 4. Monitoring & Alerting Baseline

### 4.1 Monitored Vectors & Thresholds

| Vector | Probe Target | Frequency | Warning Threshold | Critical Threshold |
|---|---|---|---|---|
| **Public Availability** | `https://becc.bridgenta.de/` | Every 1 min | Latency > 1500ms | Status != 200 or connection failure |
| **Liveness Probe** | `https://becc.bridgenta.de/health` | Every 1 min | Latency > 1500ms | Status != 200 or `healthState != HEALTHY` |
| **Readiness Probe** | `https://becc.bridgenta.de/ready` | Every 1 min | Latency > 1000ms | Status != 200 or `readiness != true` |
| **Public TLS Expiry** | `becc.bridgenta.de:443` | Daily | Expiry < 30 days | Expiry < 7 days |
| **Database Gateway** | `*.frankfurt-postgres.render.com:5432` | Continuous | Connection retries > 1 | Connection dropped / TLS error |
| **Monthly Budget** | Render Dashboard / API | Weekly | Monthly total > €13.50 | Monthly total > €15.00 (Ceiling breach) |

### 4.2 Alert Ownership & Escalation
- **Primary Alert Owner:** Human System Owner (`ref@bridgenta.de`)
- **Notification Channels:** Render alert webhooks / email notifications, GitHub Actions failure notifications.
- **Operational Escalation SLAs:**
  - P1 (Complete outage / HTTP 503 / TLS error): Acknowledgment < 1 hour, resolution < 4 hours.
  - P2 (Degraded latency / transient probe failure): Acknowledgment < 4 hours, resolution < 24 hours.
  - P3 (Informational / minor version mismatch): Next business day.

---

## 5. Deployment & Release Procedure

### 5.1 Deployment Pipeline
1. **Branch Protection:** No direct pushes to `main`. All changes must be developed in a feature branch (`feat/becc-...`).
2. **Local Validation:**
   ```powershell
   npm run --prefix packages/governed-learning build
   npm run --prefix packages/governed-learning test
   npm run --prefix becc-runtime build
   npm test --prefix becc-runtime
   npx astro check
   npm run build
   npm run lint
   npm run check-links
   npm run learning:validate
   ```
3. **Pull Request & CI Gate:** Pull Request opened against `main`. All GitHub Actions workflow jobs must pass (`PASS`).
4. **Independent Review:** Independent evidence-first audit approval required before merge.
5. **Exact-Head Merge:** Squash merge with `--match-head-commit <HEAD_SHA>`.
6. **Automatic Deployment Trigger:** Push to `main` triggers Render Webhook / Auto-deploy tracking `main` branch.
7. **Post-Deployment Smoke Verification:**
   ```powershell
   curl -s -f https://becc.bridgenta.de/
   curl -s -f https://becc.bridgenta.de/health
   curl -s -f https://becc.bridgenta.de/ready
   curl -s -f https://becc.bridgenta.de/version
   ```
   Verify that `releaseSha` in `/version` matches the merged commit SHA.

---

## 6. Rollback Procedure

If a deployed release introduces regression, security defect, or outage:

### 6.1 Immediate Pinned Rollback
1. Identify the last certified stable commit SHA on `main` (e.g. `5a52715441f7432d273938666bbdb9c04b95059f`).
2. In Render Dashboard (`srv-dbcoqtei0phs73fhso1g`), navigate to **Deploys**.
3. Select the prior successful deploy corresponding to the stable SHA and click **Rollback to this deploy**.
4. Alternatively, use the Render API or revert commit on `main` via emergency PR:
   ```powershell
   git revert -m 1 <BAD_COMMIT_SHA>
   git push origin <REVERT_BRANCH>
   ```
5. Live-probe `/version` to confirm rollback to the prior known-good SHA:
   ```powershell
   curl -s https://becc.bridgenta.de/version
   ```

---

## 7. Database Backup, Retention & Disaster Recovery Procedure

### 7.1 Automated Backup Architecture
- **Provider Automation:** Render Managed Daily Snapshots + Continuous WAL Archiving (`basic_1gb` tier).
- **Retention Period:** 7 days rolling retention window.
- **Point-in-Time Recovery (PITR):** Supported down to minute-level granularity across the active retention window.

### 7.2 Point-in-Time Recovery Execution Procedure
If database corruption or accidental data modification occurs:
1. Identify target recovery timestamp $T_{recover}$ prior to the incident.
2. In Render PostgreSQL Dashboard (`dpg-dbconmuq1p3s73cqbklg-a`), trigger **Restore to Point in Time** specifying $T_{recover}$.
3. Render provisions a restored database instance with a dedicated external connection URL.
4. Verify schema and table integrity on the restored instance using temporary read-only queries.
5. Update runtime configuration environment variable `DATABASE_URL` in web service `srv-dbcoqtei0phs73fhso1g` to point to the restored database.
6. Verify `/health` and `/ready` return HTTP 200.
7. Once certified, decommission the damaged predecessor instance to avoid residual cost.

---

## 8. Incident Response Runbooks

### 8.1 Incident: Runtime Unavailable (HTTP 502 / 504 / Connection Refused)
1. **Detection:** Public uptime alert or `/health` unreachable.
2. **First Check:** Inspect Render service status (`srv-dbcoqtei0phs73fhso1g`) and runtime logs in Render Dashboard.
3. **Containment:** If runtime crashed due to OOM or unhandled exception, check container memory consumption against the 512MB limit.
4. **Recovery:** Trigger **Manual Deploy -> Clear build cache & deploy** or restart service.
5. **Verification:** Probe `https://becc.bridgenta.de/` and `https://becc.bridgenta.de/health`.
6. **Escalation:** If service does not recover within 15 minutes, notify Human Owner.

### 8.2 Incident: Database Connectivity Degraded (HTTP 503 on `/ready`)
1. **Detection:** `/ready` probe returns HTTP 503 with `"healthState": "UNAVAILABLE"`.
2. **First Check:** Probe database external gateway port `5432` from an external probe:
   ```powershell
   Test-NetConnection -ComputerName dpg-dbconmuq1p3s73cqbklg-a.frankfurt-postgres.render.com -Port 5432
   ```
3. **Containment:** Check Render PostgreSQL dashboard for connection exhaustion or maintenance event.
4. **Recovery:** If database is in recovery or restarted, allow connection pool to re-establish. If credentials or host changed, update runtime secret safely.
5. **Verification:** Confirm `/ready` returns HTTP 200 with `"readiness": true`.

### 8.3 Incident: Public TLS Certificate Failure / Hostname Mismatch
1. **Detection:** Browser or probe reports SSL/TLS validation failure on `becc.bridgenta.de`.
2. **First Check:** Verify Strato DNS CNAME record:
   ```powershell
   Resolve-DnsName becc.bridgenta.de -Type CNAME
   ```
   Ensure it points to `becc-test-runtime.onrender.com` without conflicting A/AAAA records.
3. **Containment:** Check Render Custom Domain status for `cdm-dbe31mgm7kps73c5q47g`.
4. **Recovery:** If certificate renewal failed, click **Refresh Certificate** in Render Dashboard.
5. **Verification:** Probe TLS handshake and verify certificate subject matches `CN=becc.bridgenta.de`.

### 8.4 Incident: Monthly Recurring Cost Spike
1. **Detection:** Weekly cost inspection or Render billing notification approaching €13.50.
2. **First Check:** Inspect Render account services list:
   Ensure exactly 1 Web Service (`0.5c-512mb` = $7) and exactly 1 PostgreSQL (`basic_1gb` = $7).
3. **Containment:** Check for accidental orphaned preview environments, abandoned restore databases, or duplicate services.
4. **Recovery:** Delete any unauthorized duplicate or ephemeral resource immediately.
5. **Verification:** Confirm active services sum to <= $14.00/month (~€13.00/month), within the €15.00/month ceiling.

---

## 9. Operational Support & Handoff Boundary

### 9.1 What Operators & API Clients Should Expect
- Direct browser access to `https://becc.bridgenta.de/` displays a clean, human-understandable JSON service greeting with operational links.
- No public user authentication or interactive web UI is currently hosted at `becc.bridgenta.de` (API runtime baseline).
- API client integration and operational probing should use the documented endpoints `/health`, `/ready`, `/version`.

### 9.2 Support Escalation Path
- Operational issues, support requests, and bug reports should be submitted via BridGenta project issue tracking or directed to `ref@bridgenta.de`.
- Known operational limitations (single-region Frankfurt, 0.5 vCPU compute ceiling, 1 GB storage ceiling) are documented and accepted.
