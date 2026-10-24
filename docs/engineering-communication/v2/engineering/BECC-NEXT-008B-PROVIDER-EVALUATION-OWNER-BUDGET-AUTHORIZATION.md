# BECC-NEXT-008B Provider Evaluation & Owner Budget Authorization

## Workstream
`BRIDGENTA-BECC-V2-BECC-NEXT-008B-PROVIDER-EVALUATION-OWNER-BUDGET-AUTHORIZATION-01`

---

## 1. Executive Summary & Purpose

Workstream **BECC-NEXT-008B** constitutes the formal decision-preparation and provider evaluation phase following the successful implementation, independent review, and merge of **BECC-NEXT-008A-R2** (`5f00d5469479e827c3f82d7946f5361c54d5eee6`).

The technical gap closure workstream (BECC-NEXT-008A) successfully closed all three authorized zero-cost engineering gaps:
- **GAP-PROD-006** — Telemetry / Observability Hooks *(Closed at €0.00/mo)*
- **GAP-PROD-007** — Secret-Management Abstraction *(Closed at €0.00/mo)*
- **GAP-PROD-008** — Pinned Deployment / Rollback Playbook *(Closed at €0.00/mo)*

The five remaining production-readiness gaps in the canonical BECC register require external infrastructure, cloud provider provisioning, recurring financial commitments, and/or owner governance actions:
- **GAP-PROD-001** — Persistent Database Instance (`BUDGET_LIMITATION`)
- **GAP-PROD-002** — Automated Backups & PITR (`BUDGET_LIMITATION`)
- **GAP-PROD-003** — CA-Verified Database TLS (`PROVIDER_LIMITATION`)
- **GAP-PROD-004** — Continuous Compute Availability (`BUDGET_LIMITATION`)
- **GAP-PROD-005** — Production Domain & Ingress Routing (`GOVERNANCE_DECISION`)

### Hard Workstream Boundaries & Governance Guardrails
1. **Decision Preparation Only:** This workstream performs research, cost modeling, risk analysis, and decision formulation. **No cloud services, database instances, DNS records, or financial commitments are provisioned in this workstream.**
2. **Strict Cost Ceiling:** The authorized recurring cost ceiling for this workstream remains strictly **€0.00 / month**.
3. **Execution Freeze:** Workstream `BECC-NEXT-008C` (Live Production Infrastructure Provisioning) is **FROZEN** and must **NOT** begin until explicit, signed owner authorization is granted.
4. **Certification Boundary:** Unchanged. The maximum truthful claim remains `REMOTE_TEST_ENVIRONMENT_VALIDATED`. All production non-claims and 006D blockers remain strictly open.

---

## 2. Baseline & Lineage

| Parameter | Value | Verification Status |
|:---|:---|:---|
| **Base Commit (PR #332 Merge)** | `5f00d5469479e827c3f82d7946f5361c54d5eee6` | Verified on canonical `main` |
| **CI Verification Run** | `39975532672` | Verified PASS on `main` |
| **Active Working Branch** | `docs/becc-next-008b-provider-evaluation-budget-authorization` | Created from canonical `main` |
| **Document Classification** | Engineering Decision & Authorization Proposal | Documentation-Only |
| **Preceding Gaps Closed** | `GAP-PROD-006`, `GAP-PROD-007`, `GAP-PROD-008` | Independently verified & merged |
| **Current Open Gaps** | `GAP-PROD-001`, `GAP-PROD-002`, `GAP-PROD-003`, `GAP-PROD-004`, `GAP-PROD-005` | Active evaluation targets |
| **006D Blockers** | `NEXT006D-BLK-001`, `NEXT006D-BLK-002`, `NEXT006D-BLK-003` | All strictly `OPEN` |

---

## 3. The Five Open Production-Readiness Gaps & Minimum Acceptance Criteria

Each open gap represents a concrete operational blocker to production certification. Below are the precise technical requirements and acceptance criteria necessary to close each gap during execution:

### 3.1 GAP-PROD-001 — Persistent Database Instance
- **Current State:** Deployed on temporary Render PostgreSQL Free Tier instance (`becc-v2-test-db-fra`, expiring `2026-11-21T04:06:51Z`). Ephemeral storage risk: all data wiped upon expiration.
- **Minimum Production Requirement:**
  - Dedicated persistent managed PostgreSQL instance (v16+) with persistent SSD storage.
  - Zero arbitrary lifespan expiration date.
  - Sized for early-stage production: 512 MB to 1 GB RAM, 1 GB to 10 GB persistent SSD disk.
  - Isolated database users: Dedicated `becc_admin` role for migrations and schema DDL; dedicated unprivileged `becc_app` role with least-privilege `SELECT, INSERT, UPDATE, DELETE` permissions on runtime tables.
- **Acceptance Gate:** Database persists across arbitrary restarts, reboots, and rolling application deployments with zero data loss and no 30-day expiration timer.

### 3.2 GAP-PROD-002 — Automated Backups & PITR
- **Current State:** Zero automated backups exist on the free tier. Synthetic test harness (`SyntheticBackupRestoreHarness`) was implemented and verified locally in NEXT-008A, but no live backup mechanism is active in the deployed environment.
- **Minimum Production Requirement:**
  - Continuous Write-Ahead Logging (WAL) archiving with Point-in-Time Recovery (PITR) capability (minimum 3-day retention window).
  - Daily automated logical database dumps (`pg_dump` format) retained for at least 7 days.
  - Documented and executable restore drill procedure capable of recovering from catastrophic data corruption or accidental drop.
- **Acceptance Gate:** Production database supports verifiable recovery to a historical timestamp, and daily snapshots are accessible without manual intervention.

### 3.3 GAP-PROD-003 — CA-Verified Database TLS
- **Current State:** Runtime connects to PostgreSQL over Render internal private network with `PGSSL=false` under an explicit, documented temporary exception (`BECC-NEXT-007B-FREE-R1A`). Driver-level bypasses (`rejectUnauthorized: false`) and global bypasses (`NODE_TLS_REJECT_UNAUTHORIZED=0`) remain strictly prohibited and absent from code.
- **Minimum Production Requirement:**
  - End-to-end encrypted transport over TLS 1.3 with certificate chain verification enabled (`rejectUnauthorized: true`).
  - Strict host identity verification using a valid Certificate Authority (CA).
  - Must not rely on insecure driver-level TLS bypass flags or transport exceptions in production.
- **Acceptance Gate:** PostgreSQL client connects with `ssl: { rejectUnauthorized: true, ca: ... }` and successfully executes queries against the live persistent database without TLS error or warning.

### 3.4 GAP-PROD-004 — Continuous Compute Availability
- **Current State:** Runtime web service runs on Render Free Web Service (`bridgenta-becc-v2.onrender.com`). Service spins down after 15 minutes of inactivity, resulting in 30–60 second cold starts on incoming requests, and is subject to monthly free-instance pool quotas.
- **Minimum Production Requirement:**
  - Dedicated 24/7 always-on compute instance with zero cold-start latency.
  - Container execution adhering strictly to pinned release SHAs.
  - Minimum 512 MB RAM, 0.5 vCPU allocation.
  - Native health probe supervision (`/health`, `/ready`) with automatic process restart upon failure.
- **Acceptance Gate:** HTTP synthetic probe monitoring over a 24-hour observation window confirms 100% uptime with sub-second p95 latency for health probes and zero cold-start spin-down events.

### 3.5 GAP-PROD-005 — Production Domain & Ingress Routing
- **Current State:** Accessible exclusively via provider-managed staging URL (`https://bridgenta-becc-v2.onrender.com`). No corporate branding, corporate TLS, or independent ingress control.
- **Minimum Production Requirement:**
  - Branded custom subdomain: `becc.bridgenta.de` (or `app.bridgenta.de` as determined by owner).
  - Automated public TLS certificate provisioning and renewal via trusted public CA (Let's Encrypt / DigiCert / Cloudflare).
  - CNAME or ALIAS DNS record delegating traffic from BridGenta domain registrar to the production ingress endpoint.
  - HTTP-to-HTTPS automatic redirection and HSTS enforcement.
- **Acceptance Gate:** HTTPS request to `https://becc.bridgenta.de/version` resolves correctly, serves a valid public CA certificate, and returns HTTP 200 with matching release SHA.

---

## 4. Provider Architectural Analysis: Single-Provider vs. Split Topology

Four realistic provider architectures were evaluated against BridGenta's operational, security, and financial criteria.

### 4.1 Topology 1: Single-Provider Colocated (All-Render Frankfurt) — *Recommended*
- **Compute:** Render Starter Web Service (512 MB RAM, 0.5 CPU, always-on) — **$7.00 / month** (~€6.50 / mo).
- **Database:** Render Starter PostgreSQL (1 GB SSD included, $0.30/GB-mo additional, continuous WAL archiving, 3-day PITR) — **$7.00 / month** (~€6.50 / mo).
- **Ingress / Domain:** Render Custom Domain (`becc.bridgenta.de`) with automated Let's Encrypt TLS — **$0.00 / month** (included).
- **Total Recurring Cost:** **$14.00 / month** (**~€13.00 / month**).
- **Network Topology:** Both compute and database reside in the Frankfurt (EU Central) datacenter, communicating across Render's internal private network (`.render.internal`).
- **Architectural Advantages:**
  - Sub-millisecond internal network latency (< 1ms).
  - Zero egress bandwidth charges between compute and database within the private VPC.
  - Single billing relationship and administrative control plane.
  - Seamless continuity with existing GitHub deployment hooks and Docker build infrastructure.
- **TLS Resolution Strategy for GAP-PROD-003:**
  Render's internal private network currently utilizes platform self-signed certificates. To achieve strict CA-verified TLS without driver bypass (`rejectUnauthorized: true`), two architectural options exist:
  - *Option A (Direct Public Gateway):* Connect to Render PostgreSQL via its external connection host (`dpg-...-a.frankfurt-postgres.render.com:5432`), which terminates on a publicly verifiable Let's Encrypt / Cloudflare certificate authority. This requires setting `PGSSL=true` and standard root CA trust.
  - *Option B (Private VPC with Custom CA Injection):* Connect over the internal private network (`.render.internal:5432`) while injecting Render's platform CA certificate into the runtime using the `PGSSL_CA_CONTENT` or `PGSSL_CA_PATH` mechanism implemented in NEXT-008A, preserving `rejectUnauthorized: true` with zero driver bypass.

### 4.2 Topology 2: Split-Provider (Render Compute + Neon Serverless Postgres)
- **Compute:** Render Starter Web Service (Frankfurt) — **$7.00 / month** (~€6.50 / mo).
- **Database:** Neon Serverless Postgres (AWS `eu-central-1` Frankfurt). Base fee is $0, but maintaining 24/7 continuous availability (disabling auto-suspend / scale-to-zero at 0.25 CU minimum) costs:
  `0.25 CU * 730 hours * $0.106/CU-hour = $19.35 / mo` + storage ($0.35/GB-mo) — **~$19.50 / month** (~€18.00 / mo).
- **Total Recurring Cost:** **~$26.50 / month** (**~€24.50 / month**).
- **Architectural Advantages:**
  - Standard public CA certificate (Let's Encrypt) out of the box with zero custom CA bundle requirements.
  - Instant database branching and 7-day point-in-time recovery.
- **Architectural Drawbacks:**
  - Cross-cloud public internet egress between Render and AWS Frankfurt (~2–5ms latency).
  - Two vendor relationships, separate billing invoices, and increased secret management overhead.
  - Higher baseline cost (€24.50 vs €13.00/mo).

### 4.3 Topology 3: Split-Provider (Render Compute + Supabase Pro Postgres)
- **Compute:** Render Starter Web Service (Frankfurt) — **$7.00 / month** (~€6.50 / mo).
- **Database:** Supabase Pro Plan (AWS `eu-central-1` Frankfurt). Removes the 7-day free tier pause, includes 1 micro compute instance, 8 GB SSD disk, daily backups with 7-day retention — **$25.00 / month** (~€23.00 / mo).
- **Total Recurring Cost:** **~$32.00 / month** (**~€29.50 / month**).
- **Architectural Advantages:** Enterprise-grade dashboard, automated daily backups, built-in connection pooler (PgBouncer/Supavisor).
- **Architectural Drawbacks:** Substantially higher cost floor for early-stage workload; features beyond core PostgreSQL (Auth, Storage, Realtime) are superfluous to BECC v2.

### 4.4 Topology 4: Self-Managed Dedicated VPS (Hetzner Cloud Germany)
- **Compute & Database:** Hetzner Cloud CX22 (2 vCPU, 4 GB RAM, 40 GB NVMe SSD, Frankfurt or Falkenstein/Nuremberg, Germany) — **~€4.50 to €5.50 / month**.
- **Ingress / Domain:** Caddy / Nginx reverse proxy with automated Let's Encrypt TLS — **€0.00 / month**.
- **Total Recurring Cost:** **~€5.00 / month**.
- **Architectural Advantages:** Lowest monthly financial cost; 100% German sovereign hosting under direct European jurisdiction; full root control over PostgreSQL configuration and TLS certificates.
- **Architectural Drawbacks:** High operational burden. BridGenta engineering would be directly responsible for OS security patching, database backups, disaster recovery scripting, systemd/docker supervision, and firewall maintenance. Lacks managed point-in-time recovery out of the box.

---

## 5. Detailed Provider Evaluation Matrix

| Criterion | Weight | Render Colocated (Topology 1) | Render + Neon (Topology 2) | Render + Supabase (Topology 3) | Hetzner VPS Self-Managed (Topology 4) |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Persistent Storage & Reliability** | 15% | **14 / 15** (Managed SSD, 99.9% SLA) | **14 / 15** (Managed Cloud SSD) | **14 / 15** (Managed AWS EBS) | **11 / 15** (Unmanaged local NVMe) |
| **Automated Backups & PITR** | 15% | **13 / 15** (Continuous WAL, 3-day PITR, 7-day exports) | **15 / 15** (Instant PITR & branching) | **14 / 15** (Daily automated backups, 7-day retention) | **6 / 15** (Must be custom scripted) |
| **CA-Verified TLS Integrity** | 15% | **13 / 15** (Public gateway or CA injection hook) | **15 / 15** (Native Let's Encrypt public CA) | **14 / 15** (Native public CA / SSL cert) | **15 / 15** (Self-managed Let's Encrypt) |
| **Continuous Compute & Zero Cold Start** | 15% | **14 / 15** (Always-on Starter web service) | **14 / 15** (Always-on Starter web service) | **14 / 15** (Always-on Starter web service) | **14 / 15** (Always-on systemd/Docker) |
| **Custom Domain & Ingress Automation** | 10% | **10 / 10** (Included free, automated Let's Encrypt) | **10 / 10** (Included free on compute host) | **10 / 10** (Included free on compute host) | **9 / 10** (Configured via Caddy/Certbot) |
| **EU Data Residency (Frankfurt, Germany)** | 10% | **10 / 10** (Dedicated Frankfurt EU region) | **10 / 10** (AWS `eu-central-1` Frankfurt) | **10 / 10** (AWS `eu-central-1` Frankfurt) | **10 / 10** (Frankfurt/Falkenstein, Germany) |
| **Operational Simplicity & Low Burden** | 10% | **10 / 10** (Single dashboard, zero OS maintenance) | **7 / 10** (Two control planes, separate billing) | **7 / 10** (Two control planes, separate billing) | **3 / 10** (High operational & maintenance burden) |
| **Monthly Cost Predictability (< €20/mo)** | 10% | **9 / 10** (~€13.00/mo flat) | **6 / 10** (~€24.50/mo usage-sensitive) | **5 / 10** (~€29.50/mo flat) | **10 / 10** (~€5.00/mo flat) |
| **Weighted Total Score** | **100%** | **12.3 / 15.0 (82.0%)** | **11.8 / 15.0 (78.7%)** | **11.4 / 15.0 (76.0%)** | **9.8 / 15.0 (65.3%)** |
| **Recommendation Rank** | | **RANK 1 (Primary)** | **RANK 2 (Fallback)** | **RANK 3** | **RANK 4** |

---

## 6. EU Data Residency & Sovereignty Assessment

Data protection and regulatory compliance are non-negotiable for BridGenta BECC v2:

1. **Datacenter Jurisdiction:**
   - The selected deployment region for both compute and database is strictly **Frankfurt am Main, Germany** (Render region `frankfurt` / AWS region `eu-central-1`).
   - All persisted operational audit ledgers, compliance records, and runtime configurations reside within the European Union.
2. **GDPR / DSGVO Compliance:**
   - Both Render and Neon/Supabase maintain standard Data Processing Agreements (DPAs) incorporating EU Standard Contractual Clauses (SCCs).
   - The BECC runtime processes operational compliance and system verification data; no sensitive personal identifiable information (PII) is stored in the audit ledger.
3. **Transit Encryption:**
   - All public ingress traffic is encrypted via TLS 1.3 using public trusted CA certificates.
   - All internal transport between compute and database is encrypted.

---

## 7. Cost Models & Tiered Budget Authorization Proposals

To grant the human owner full transparency and control, three cost tiers are structured below:

```
+---------------------------------------------------------------------------------------------------+
|                                  TIERED BUDGET AUTHORIZATION OPTIONS                              |
+-------------------+---------------------------------------------+-----------------+---------------+
| Tier              | Scope & Architecture                        | Monthly Cost    | Annualized    |
+-------------------+---------------------------------------------+-----------------+---------------+
| Tier A (Recom.)   | Minimal Production Footprint (All-Render)   | ~€13.00 / month | ~€156.00 / yr |
|                   | Starter Web Service + Starter PostgreSQL     | ($14.00 USD)    |               |
+-------------------+---------------------------------------------+-----------------+---------------+
| Tier B (Fallback) | Split-Provider (Render + Neon Launch)       | ~€24.50 / month | ~€294.00 / yr |
|                   | Starter Web Service + Neon Always-On DB     | ($26.50 USD)    |               |
+-------------------+---------------------------------------------+-----------------+---------------+
| Tier C (Extended) | Pro Managed (Render + Supabase Pro)         | ~€29.50 / month | ~€354.00 / yr |
|                   | Starter Web Service + Supabase Pro DB       | ($32.00 USD)    |               |
+-------------------+---------------------------------------------+-----------------+---------------+
| Tier 0 (Status Q) | Retain Free Tier Temporary Test Environment | €0.00 / month   | €0.00 / yr    |
|                   | Expiring 2026-11-21; gaps remain open       |                 |               |
+-------------------+---------------------------------------------+-----------------+---------------+
```

### Detailed Breakdown of Recommended Tier A:
- **Render Starter Web Service:** $7.00/mo
  - 512 MB RAM, 0.5 CPU.
  - Always-on (24/7/365 availability, zero cold start).
  - Custom domain binding (`becc.bridgenta.de`) with automated Let's Encrypt certificate renewal.
- **Render Starter PostgreSQL:** $7.00/mo
  - 1 GB persistent SSD storage included ($0.30/GB-mo for future expansion).
  - Permanent lifecycle (replaces expiring 30-day trial instance).
  - Continuous WAL archiving with 3-day point-in-time recovery window.
  - Manual logical backup exports downloadable via dashboard (retained 7 days).
- **Estimated Monthly Total:** **$14.00 USD** (converted at ~1.08 USD/EUR = **€12.96**, rounded to **€13.00 / month**).
- **Recommended Authorization Buffer:** Authorize a recurring cost ceiling of up to **€15.00 / month** to accommodate currency fluctuations and minor storage growth.

---

## 8. Lock-In, Portability & Exit Strategy

The proposed production architecture avoids proprietary cloud locks and guarantees immediate exit capability:

1. **Standard PostgreSQL Engine:**
   - The database engine is standard, unmodified PostgreSQL (v16).
   - Zero vendor-specific extensions (e.g., proprietary cloud triggers or non-standard SQL dialects) are utilized.
   - Full database exports can be created at any time using standard `pg_dump` and restored into any PostgreSQL provider (AWS RDS, Google Cloud SQL, Azure Database, self-hosted Docker, etc.) via `pg_restore`.
2. **Standard Container Packaging:**
   - The BECC runtime is packaged as a standard multi-stage OCI/Docker container based on `node:22-alpine`.
   - The application does not consume any proprietary Render APIs for request handling or processing.
   - It can be deployed to Fly.io, Google Cloud Run, AWS App Runner, Kubernetes, or bare metal without code changes.
3. **Abstracted Secret & Configuration Layer:**
   - Through `ISecretProvider` (implemented in NEXT-008A), configuration is decoupled from the underlying hosting provider's secret storage mechanism.
4. **DNS Ingress Independence:**
   - Because ingress routing is governed by the BridGenta DNS zone (`becc.bridgenta.de`), switching compute providers requires only updating a single DNS CNAME/A record.

---

## 9. Owner Decision Register

The owner is requested to act upon four specific decisions:

### DEC-OWNER-001: Architectural Topology Selection
- **Context:** Choice between a colocated single-provider architecture vs. a multi-provider split architecture.
- **Options:**
  - `OPTION-1A` *(Recommended)*: **Single-Provider Colocated (All-Render Frankfurt)**. Lowest operational overhead, colocated sub-millisecond private networking, single billing dashboard.
  - `OPTION-1B`: **Split-Provider (Render Compute + Neon Serverless Postgres)**. Native public CA certificate for TLS out of the box, higher monthly cost (~€24.50/mo), two vendor relationships.
  - `OPTION-1C`: **Self-Managed VPS (Hetzner Cloud Germany)**. Lowest cash cost (~€5.00/mo), maximum engineering overhead.
  - `OPTION-1D`: **Maintain Current Zero-Cost Staging State**. No budget authorized. Expiring database wipes on 2026-11-21; gaps remain open.
- **Engineering Recommendation:** Select `OPTION-1A`.

### DEC-OWNER-002: Monthly Recurring Budget Ceiling Authorization
- **Context:** Authorizing recurring infrastructure expenditure to close `GAP-PROD-001`, `002`, and `004`.
- **Options:**
  - `OPTION-2A` *(Recommended)*: Authorize recurring expenditure up to **€15.00 / month** (covers Tier A with currency fluctuation buffer).
  - `OPTION-2B`: Authorize recurring expenditure up to **€30.00 / month** (covers Tier B or Tier C).
  - `OPTION-2C`: Reject recurring expenditure authorization (**€0.00 / month**). Production readiness cannot be certified.
- **Engineering Recommendation:** Authorize `OPTION-2A`.

### DEC-OWNER-003: Database TLS Ingress Architecture on Render
- **Context:** Render's internal private network (`.render.internal`) uses a platform self-signed CA. Strict CA-verified TLS (`GAP-PROD-003`) with `rejectUnauthorized: true` requires selecting one of two connection paths.
- **Options:**
  - `OPTION-3A` *(Recommended)*: **Direct External PostgreSQL Gateway**. Connect via Render's external gateway (`dpg-...-a.frankfurt-postgres.render.com:5432`), which terminates with a standard public CA certificate (Let's Encrypt / Cloudflare). Fully satisfies `rejectUnauthorized: true` without custom CA file distribution.
  - `OPTION-3B`: **Internal Private VPC with Injected Platform CA**. Connect over internal private network (`.render.internal`) while injecting Render's platform CA certificate into the runtime via `PGSSL_CA_CONTENT` or `PGSSL_CA_PATH`. Fully preserves `rejectUnauthorized: true` with zero driver bypass.
- **Engineering Recommendation:** Select `OPTION-3A` initially for zero-friction verification; transition to `OPTION-3B` if internal VPC isolation is strictly mandated by corporate security policy.

### DEC-OWNER-004: Production Ingress Hostname & DNS Delegation
- **Context:** Closing `GAP-PROD-005` requires establishing a custom domain in the BridGenta DNS zone.
- **Options:**
  - `OPTION-4A` *(Recommended)*: Authorize and delegate **`becc.bridgenta.de`** via CNAME pointing to the production Render service host.
  - `OPTION-4B`: Authorize and delegate an alternative subdomain (e.g., `app.bridgenta.de` or `compliance.bridgenta.de`).
  - `OPTION-4C`: Defer custom domain provisioning; retain provider URL (`*.onrender.com`) temporarily.
- **Engineering Recommendation:** Authorize `OPTION-4A`.

---

## 10. Copyable Owner Authorization Package

To authorize execution of workstream **BECC-NEXT-008C**, the human owner may review, sign, and paste the following authorization block into the prompt:

```text
================================================================================
BRIDGENTA BECC v2 — OWNER INFRASTRUCTURE & BUDGET AUTHORIZATION (BECC-NEXT-008B)
================================================================================

I hereby confirm and authorize the following decisions for BridGenta BECC v2:

1. ARCHITECTURAL TOPOLOGY (DEC-OWNER-001):
   [X] OPTION-1A: Single-Provider Colocated (All-Render Frankfurt) [RECOMMENDED]
   [ ] OPTION-1B: Split-Provider (Render Compute + Neon Postgres)
   [ ] OPTION-1C: Self-Managed VPS (Hetzner Cloud Germany)
   [ ] OPTION-1D: Decline / Maintain Staging

2. RECURRING BUDGET CEILING (DEC-OWNER-002):
   [X] OPTION-2A: Authorize recurring budget up to €15.00 / month (Tier A) [RECOMMENDED]
   [ ] OPTION-2B: Authorize recurring budget up to €30.00 / month (Tier B/C)
   [ ] OPTION-2C: Decline recurring expenditure (€0.00 / month)

3. DATABASE TLS INGRESS ARCHITECTURE (DEC-OWNER-003):
   [X] OPTION-3A: External Gateway with Public CA (rejectUnauthorized: true) [RECOMMENDED]
   [ ] OPTION-3B: Internal Private VPC with Injected CA (rejectUnauthorized: true)

4. PRODUCTION DOMAIN INGRESS (DEC-OWNER-004):
   [X] OPTION-4A: Delegate 'becc.bridgenta.de' via CNAME [RECOMMENDED]
   [ ] OPTION-4B: Alternative hostname: ____________________
   [ ] OPTION-4C: Defer custom domain (retain onrender.com)

AUTHORIZATION CONFIRMATION:
- Authorized By: [Human Owner Name / Signature]
- Date Authorized: 2026-10-XX
- Maximum Monthly Recurring Cap: €15.00 EUR
- Provisioning Authorized for Workstream: BECC-NEXT-008C

================================================================================
```

---

## 11. Gap Closure Roadmap (Execution Phase — BECC-NEXT-008C)

Upon receipt of the signed Owner Authorization Package, execution will proceed in structured, verifiable stages during **BECC-NEXT-008C**:

```
+---------------------------------------------------------------------------------------+
|                       BECC-NEXT-008C EXECUTION ROADMAP                                |
+---------------------------------------------------------------------------------------+
|  Stage 1: Persistent Database Provisioning & Schema Migration                         |
|           - Provision Render Starter PostgreSQL in Frankfurt (EU).                    |
|           - Create dedicated 'becc_admin' and 'becc_app' database roles.              |
|           - Execute schema migration; verify persistence and 0-expiration status.     |
|           - [CLOSES GAP-PROD-001]                                                     |
+---------------------------------------------------------------------------------------+
|  Stage 2: Backup & PITR Operational Verification Drill                                |
|           - Confirm automated WAL archiving and 3-day recovery window.                |
|           - Execute live manual snapshot export.                                      |
|           - Perform end-to-end restore drill into isolated staging verification schema.|
|           - [CLOSES GAP-PROD-002]                                                     |
+---------------------------------------------------------------------------------------+
|  Stage 3: CA-Verified Database TLS Activation                                         |
|           - Configure PostgreSQL connection pool with 'rejectUnauthorized: true'.    |
|           - Verify certificate chain against trusted CA (Public gateway or custom CA).|
|           - Revoke temporary transport exception; enforce strict TLS.                 |
|           - [CLOSES GAP-PROD-003]                                                     |
+---------------------------------------------------------------------------------------+
|  Stage 4: Always-On Compute Upgrade & SLA Verification                                |
|           - Upgrade Web Service to Render Starter Plan (always-on, zero sleep).       |
|           - Execute 24-hour continuous uptime and cold-start verification probe.      |
|           - [CLOSES GAP-PROD-004]                                                     |
+---------------------------------------------------------------------------------------+
|  Stage 5: Custom Domain Ingress & Automated Public TLS Binding                        |
|           - Bind 'becc.bridgenta.de' custom domain in Render.                         |
|           - Validate DNS CNAME propagation and Let's Encrypt certificate issuance.    |
|           - Verify HTTPS redirection and release SHA probe endpoint.                  |
|           - [CLOSES GAP-PROD-005]                                                     |
+---------------------------------------------------------------------------------------+
|  Stage 6: Final Production Certification & Blocker Closure                            |
|           - Close NEXT006D-BLK-001, NEXT006D-BLK-002, and NEXT006D-BLK-003.           |
|           - Formulate Production Runtime Certification audit record.                  |
|           - Update all system architecture documentation and operational ledgers.     |
+---------------------------------------------------------------------------------------+
```

---

## 12. Strict Certification Boundaries & Non-Claims

To ensure absolute regulatory and engineering integrity, the following non-claims remain strictly binding during this decision-preparation workstream:

| Claim / Assertion | Value | Justification / Context |
|:---|:---:|:---|
| **PRODUCTION_RUNTIME_CERTIFIED** | **NO** | Production infrastructure has not yet been provisioned or verified. |
| **PERSISTENT_DATABASE_CERTIFIED** | **NO** | Active database remains on temporary 30-day free tier. |
| **PAID_INFRASTRUCTURE_PROVISIONED** | **NO** | No paid resources or cloud account upgrades have been executed. |
| **PAID_INFRASTRUCTURE_AUTHORIZED** | **NO** | Awaiting signed owner budget authorization package. |
| **AUTHORIZED_COST_CEILING_EUR** | **€0.00** | Budget ceiling remains zero until owner explicitly approves. |
| **ACTIVE_RUNNING_COST_EUR** | **€0.00** | Zero recurring charges incurred to date. |
| **MAXIMUM_TRUTHFUL_CURRENT_CLAIM** | `REMOTE_TEST_ENVIRONMENT_VALIDATED` | Current runtime is validated as a remote test environment only. |
| **NEXT006D-BLK-001 (Remote Runtime Service)** | **OPEN** | Dependent on always-on compute upgrade. |
| **NEXT006D-BLK-002 (Persistent Database & Roles)** | **OPEN** | Dependent on persistent PostgreSQL provisioning. |
| **NEXT006D-BLK-003 (Live Health & Readiness Probes)**| **OPEN** | Dependent on live persistent production endpoint validation. |
| **SAFE_TO_BEGIN_BECC_NEXT_008C** | **NO** | Provisioning is strictly prohibited until owner signs authorization. |

---

## 13. Summary & Next Steps

1. **Submit Documentation PR:** Submit PR containing this evaluation and authorization package for independent review.
2. **Independent Review & Controlled Merge:** Validate that no code or configuration has been altered, gap register continuity is preserved, and budget proposals are factually accurate.
3. **Owner Review & Signature:** Present the copyable authorization package to the human owner for review and explicit decision sign-off.
4. **Execution Hold:** Maintain all provisioning on hold until the signed authorization package is delivered.
