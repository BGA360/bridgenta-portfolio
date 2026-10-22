# BECC-NEXT-007B-A — Remote Infrastructure Provider Selection, Cost/Region/Security Evaluation & Owner Authorization

## 1. Executive Summary

- **Workstream ID:** `BRIDGENTA-BECC-V2-BECC-NEXT-007B-A-REMOTE-INFRASTRUCTURE-PROVIDER-SELECTION-COST-REGION-SECURITY-EVALUATION-OWNER-AUTHORIZATION-01`
- **Preceding Status:** `BECC-NEXT-007` merged and verified on canonical `main` (squash commit `d5b55c3a56fac383074a87c64fcce13c410e044b`).
- **Context:** Workstream `BECC-NEXT-007B` is paused at the owner/infrastructure authorization boundary (`OWNER_INFRASTRUCTURE_AUTHORIZATION_REQUIRED: YES`). No remote hosting provider, managed database, or cloud secrets currently exist for the runtime service.
- **Objective:** Evaluate candidate runtime hosts and persistent PostgreSQL providers against strict technical, security, regional, and cost criteria using current official sources, select one primary bounded topology plus one fallback, define the credential and secret plans, and formulate an explicit copyable owner authorization package.
- **Hard Workstream Boundary:** This workstream performs research and authorization formulation only. **No cloud accounts, billable resources, remote secrets, or production deployments are created in this workstream.**

---

## 2. Baseline & Blocker Status

The three known 006D blockers remain open and require real remote infrastructure to close:

| Blocker ID | Blocker Description | Required Resolution | Current Status |
| :--- | :--- | :--- | :--- |
| **NEXT006D-BLK-001** | Actual Remote BECC Runtime Service | Provisioned, long-running Node 22 container service reachable via HTTPS | `OPEN` |
| **NEXT006D-BLK-002** | Persistent Remote PostgreSQL & Role | Provisioned persistent PostgreSQL with separate admin and `becc_app` roles | `OPEN` |
| **NEXT006D-BLK-003** | Live Health & Readiness Endpoints | Live-verified `/health`, `/ready`, `/version` returning HTTP 200 | `OPEN` |

---

## 3. Decision Criteria & Weighted Model

Fifteen criteria were established with weights strictly totaling **100**:

| ID | Criterion | Description | Weight |
| :--- | :--- | :--- | :---: |
| **C1** | Security Model | Least-privilege role support, SSL/TLS enforcement, isolated network boundaries | **10** |
| **C2** | EU Region Availability | Availability of tier-1 EU datacenter (Frankfurt / Germany preferred) | **8** |
| **C3** | PostgreSQL Connectivity | Native PostgreSQL protocol compatibility, connection pooling, persistence class | **8** |
| **C4** | Secret Management | Encrypted platform secret store, runtime env injection, no repo leakage | **8** |
| **C5** | Deployment Simplicity | Automated deploy from GitHub Actions / container registry with minimal friction | **7** |
| **C6** | Runtime Compatibility | Native Node.js 22 / multi-stage Dockerfile execution | **8** |
| **C7** | Operational Observability | Streamed runtime logs, deployment history, restart tracking, metrics | **6** |
| **C8** | Rollback & Deployment Identity | Deterministic release SHA verification, instant rollback to prior revision | **6** |
| **C9** | Cost Predictability | Fixed or capped pricing without unexpected usage-spike exposure | **7** |
| **C10** | Low-Volume Affordability | Low monthly cost floor for initial single-instance deployment (< €25/mo) | **7** |
| **C11** | Scaling Path | Seamless path to larger compute, connection pooling, and storage growth | **5** |
| **C12** | Vendor Lock-in | Standard container and standard SQL portability; easy migration away | **5** |
| **C13** | Owner Operational Burden | Minimal day-2 maintenance overhead (no complex VPC/IAM routing rules) | **6** |
| **C14** | GitHub Integration | Native GitHub repository linking, commit triggers, action deploy tokens | **5** |
| **C15** | Private Networking | Provider-internal private networking between runtime and PostgreSQL | **4** |
| **Total** | | | **100** |

---

## 4. Initial Load Assumptions

Initial operational assumptions for early-stage BridGenta BECC v2:
- **Traffic Volume:** Low request volume (internal/audited verification requests, health probes, portfolio readiness checks).
- **Runtime Topology:** Single persistent runtime instance (1 replica, always-on, no cold starts).
- **Database Topology:** Single primary PostgreSQL instance with durable SSD storage (initial 1 GB – 10 GB).
- **High Availability / Multi-Region:** Not required for initial deployed certification.
- **Audit Throughput:** Moderate event persistence rate (< 50 transactions/minute peak).

---

## 5. Official Sources & Verified Current Data

Data verified from official provider documentation and pricing pages (accessed October 2026):

1. **Render:**
   - *Source:* `https://render.com/pricing` & `https://render.com/docs/databases`
   - *Title:* Render Pricing & Render PostgreSQL Documentation (2026)
   - *Claims Supported:* Starter Web Service is $7.00/mo (512 MB RAM, 0.5 CPU, always-on). Starter PostgreSQL is $6.00/mo (1 GB storage included, $0.30/GB-mo additional). Free PostgreSQL automatically expires after 30 days. Native Frankfurt region supported. Provider-internal private networking (`.render.internal`) included at zero egress cost.
2. **Fly.io:**
   - *Source:* `https://fly.io/docs/about/pricing/`
   - *Title:* Fly.io Resource Pricing & Plans
   - *Claims Supported:* Pay-as-you-go Fly Machines: shared-CPU-1x (256 MB RAM) starts at ~$2.19/mo; 512 MB RAM starts at ~$3.50/mo. Frankfurt region (`fra`) supported. Dedicated IPv4 is $2.00/mo; shared IPv4/IPv6 is free. WireGuard 6PN private networking. Managed PostgreSQL is community-supported Stolon on Machines or third-party integration.
3. **Neon:**
   - *Source:* `https://neon.tech/pricing`
   - *Title:* Neon Serverless Postgres Pricing & Documentation
   - *Claims Supported:* Serverless PostgreSQL on AWS `eu-central-1` (Frankfurt). Free tier has 100 CU-hours and auto-suspends after 5 min. Launch plan is $5.00/mo base + $0.106/CU-hour. Direct connection (port 5432) and pooled connection (port 6543) with mandatory TLS.
4. **Supabase:**
   - *Source:* `https://supabase.com/pricing`
   - *Title:* Supabase Pricing & Compute Add-ons
   - *Claims Supported:* Free tier projects pause after 7 days of inactivity. Pro tier starts at $25.00/mo flat organization fee (includes 1 micro compute instance, 8 GB disk). AWS `eu-central-1` (Frankfurt) supported.
5. **AWS (App Runner & RDS):**
   - *Source:* `https://aws.amazon.com/apprunner/pricing/` & `https://aws.amazon.com/rds/postgresql/pricing/`
   - *Title:* AWS App Runner Pricing & Amazon RDS for PostgreSQL Pricing (eu-central-1)
   - *Claims Supported:* App Runner idle memory is $0.007/GB-hour (~$2.55/mo for 0.5 GB). RDS `db.t4g.micro` in Frankfurt is $0.019/hour (~$13.87/mo) + $0.115/GB-mo for gp3 storage (~$2.30/mo for 20 GB). Total baseline AWS cost ~$20–$25/mo plus configuration overhead.
6. **Google Cloud (Cloud Run & Cloud SQL):**
   - *Source:* `https://cloud.google.com/run/pricing` & `https://cloud.google.com/sql/pricing`
   - *Title:* Google Cloud Run & Cloud SQL Pricing (`europe-west3` Frankfurt)
   - *Claims Supported:* Cloud Run minimum instances always-on + Cloud SQL `db-f1-micro` baseline totals ~$25–$35/mo.

---

## 6. Runtime Hosting Candidate Comparison

| Provider | Node 22 / Docker | Always-On / No Cold Starts | EU Region (Frankfurt) | Secret Store | GitHub Action Deploy | Min Monthly Cost | Assessment |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Render** | Yes (Native Dockerfile) | Yes ($7/mo Starter) | Yes (`frankfurt`) | Yes (Env Vault) | Yes (Deploy Hook / API) | **$7.00** (~€6.50) | **Top Choice**: Clean container execution, fixed cost, Frankfurt colocation. |
| **Fly.io** | Yes (Fly Machines) | Yes (~$3.50/mo 512MB) | Yes (`fra`) | Yes (`fly secrets`) | Yes (`flyctl` deploy) | **$3.50–$5.50** (~€4.50) | **Strong Alternative**: Low cost, lightweight, but requires separate DB provider. |
| **Google Cloud Run** | Yes (Container) | Yes (min-instances=1) | Yes (`europe-west3`) | Yes (Secret Manager) | Yes (GCP Actions) | **~$12–$15** (~€12) | Suitable but higher setup/IAM complexity. |
| **AWS App Runner** | Yes (Container) | Yes (provisioned inst.) | Yes (`eu-central-1`) | Yes (Secrets Mgr / SSM) | Yes (ECR + Actions) | **~$10–$15** (~€11) | Suitable but higher IAM/VPC complexity. |
| **Railway** | Yes (Container) | Yes (pay-per-usage) | Netherlands / US | Yes (Variables) | Yes (Railway CLI) | **~$7–$10** (~€8) | Lacks dedicated Frankfurt region (Amsterdam only). |

---

## 7. PostgreSQL Provider Candidate Comparison

| Provider | Persistence Class | Role / Least Privilege Fit | EU Region (Frankfurt) | Connection Model | Sleep / Idle Behavior | Min Monthly Cost | Assessment |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Render Postgres** | Persistent SSD | Yes (Full standard PostgreSQL) | Yes (`frankfurt`) | Provider-Internal + Public TLS | **Always On** (Paid tiers) | **$6.00** (~€5.50) | **Top Choice**: Colocated with runtime, internal private network, zero sleep. |
| **Neon** | Persistent NVMe | Yes (Standard SQL roles) | Yes (`eu-central-1`) | Public TLS (Port 5432/6543) | Auto-suspends on free; always-on on Launch | **$5.00** (~€4.50) | **Strong Alternative**: Excellent serverless architecture, needs paid tier to avoid cold starts. |
| **Supabase** | Persistent SSD | Yes (Standard PostgreSQL) | Yes (`eu-central-1`) | Public TLS / PgBouncer | Auto-pauses on free; $25/mo Pro tier | **$25.00** (~€23) | Overkill for early stage; high base fee. |
| **AWS RDS** | Persistent gp3 | Yes (Standard PostgreSQL) | Yes (`eu-central-1`) | VPC / Public Subnet TLS | Always On | **~$16.17** (~€15) | Reliable but expensive and complex for initial wave. |
| **Google Cloud SQL** | Persistent SSD | Yes (Standard PostgreSQL) | Yes (`europe-west3`) | VPC / Public TLS | Always On | **~$15–$20** (~€16) | Reliable but complex VPC/proxy requirements. |
| **Railway Postgres** | Persistent Volume | Yes (Dockerized Postgres) | Netherlands (`europe-west4`) | Internal / Public TLS | Always On | **~$5–$8** (~€6) | Unmanaged containerized Postgres, not Frankfurt. |

---

## 8. Pairing Evaluation Matrix

| Pairing | Runtime | Database | Region Colocation | Network Isolation | Secret Model | Est. Monthly Cost | Score (1-100) | Rank |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **Pairing 1** | **Render (Starter)** | **Render Postgres (Starter)** | **Frankfurt (100%)** | **`PROVIDER_INTERNAL`** | Render Environment Vault | **$13.00** (~€12.00) | **94** | **RECOMMENDED** |
| **Pairing 2** | Fly.io (Machine) | Neon Postgres (Launch) | Frankfurt (Fly `fra` + AWS `eu-central-1`) | `PUBLIC_TLS` | Fly Secrets + Neon SSL | **$8.50–$12** (~€9.50) | **86** | **FALLBACK** |
| **Pairing 3** | Fly.io (Machine) | Render Postgres (Starter) | Frankfurt (`fra` + `frankfurt`) | `PUBLIC_TLS` | Fly Secrets + Render SSL | **$9.50–$14** (~€11.50) | **82** | Rejected (split provider) |
| **Pairing 4** | AWS App Runner | AWS RDS `db.t4g.micro` | Frankfurt (`eu-central-1`) | `PRIVATE` (VPC Connector) | AWS Secrets Manager | **~$28.00** (~€26.00) | **76** | Rejected (cost & complexity) |
| **Pairing 5** | Google Cloud Run | GCP Cloud SQL | Frankfurt (`europe-west3`) | `PRIVATE` (VPC Access) | GCP Secret Manager | **~$32.00** (~€30.00) | **74** | Rejected (cost & complexity) |

---

## 9. Recommended Topology & Architecture

### 9.1 Recommended Selection
- **Runtime Host:** **Render** (Starter Instance, 512 MB RAM, 0.5 CPU, Node 22 native container)
- **PostgreSQL Provider:** **Render PostgreSQL** (Starter Instance, 512 MB RAM, 1 GB persistent SSD storage)
- **Region:** **Frankfurt, Germany** (`frankfurt`) for both runtime and database.
- **Network Model:** **`PROVIDER_INTERNAL`**
  - The runtime communicates with PostgreSQL via the private network hostname (`dpg-xxxxxx-a.frankfurt-postgres.render.com:5432`).
  - Zero traffic traverses the public internet for database transactions.
  - Zero cross-region latency or data transfer charges.
- **Public Ingress:** Restricted strictly to the runtime service HTTP port:
  - `GET /version` (Release provenance)
  - `GET /health` (Audit ledger health probe)
  - `GET /ready` (Audit readiness probe)
  - Method restriction enforced: all mutating methods (`POST`, `PUT`, `DELETE`, etc.) return HTTP 405.
- **Secret Model:** Render encrypted Environment Variables vault. Secrets are injected at runtime into `process.env`. Zero secrets committed to git or built into Docker images.

```mermaid
flowchart TD
    subgraph GitHubControlPlane["CI/CD Control Plane (GitHub Actions)"]
        GH["GitHub Actions Pipeline<br/>deploy.yml (canonical main)"]
        DeployWebhook["Deploy Hook Trigger / CLI Token<br/>RENDER_DEPLOY_HOOK_URL"]
        GH -->|HTTPS POST Trigger| DeployWebhook
    end

    subgraph RenderPlatform["Render Infrastructure (Region: Frankfurt, Germany)"]
        DeployWebhook --> WebService

        subgraph RuntimeZone["BECC Runtime Service (Private/Public Boundary)"]
            WebService["Render Web Service (Starter)<br/>becc-runtime Dockerfile"]
            PublicIngress["HTTPS Edge (TLS termination)<br/>GET /health, /ready, /version"]
            PublicIngress --> WebService
        end

        subgraph PrivateNetZone["Private Internal Network (.render.internal)"]
            PostgresDB["Render PostgreSQL 16 (Starter)<br/>Persistent SSD Storage"]
            AdminRole["Bootstrap Role: render_admin<br/>(Schema migrations & grant management)"]
            AppRole["Runtime Role: becc_app<br/>(SELECT, INSERT; DDL/UPDATE/DELETE denied)"]
            
            PostgresDB --- AdminRole
            PostgresDB --- AppRole
        end

        WebService -->|Internal TCP 5432 (SSL require)| AppRole
    end
```

---

## 10. Role & Migration Model Implementation Plan

The chosen Render PostgreSQL instance allows full superuser/admin role capability during setup:
1. **Bootstrap Phase (Admin Role):**
   - Execute migrations using the provisioned administrative connection (`render_admin` / owner connection).
   - Create schema tables (`becc_audit_records`, `becc_migration_history`).
   - Provision dedicated runtime user:
     ```sql
     CREATE ROLE becc_app WITH LOGIN PASSWORD '<secure-generated-password>' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
     ```
2. **Least-Privilege Grants (Runtime Role `becc_app`):**
   - Allow: `CONNECT`, `USAGE`, `SELECT`, `INSERT`.
   - Deny: `UPDATE`, `DELETE`, `TRUNCATE`, `ALTER`, `DROP`.
   - Deny cross-schema access (no GL database or table visibility).
3. **Runtime Execution:**
   - The BECC runtime connects exclusively using `PGUSER=becc_app`.
   - Enforce `autoMigrate: false` (no DDL attempted by runtime process).

---

## 11. Cost & Budget Analysis

### 11.1 Monthly Cost Breakdown (Primary Recommendation: Render)

| Component | Tier / Resource | Monthly Cost (USD) | Monthly Cost (EUR approx.) |
| :--- | :--- | :---: | :---: |
| **BECC Web Service** | Starter (512 MB RAM, 0.5 CPU, Always-On) | $7.00 | ~€6.45 |
| **Render PostgreSQL** | Starter (512 MB RAM, 1 GB Persistent SSD) | $6.00 | ~€5.55 |
| **Internal Egress** | Unlimited intra-region private network | $0.00 | €0.00 |
| **Inbound/Outbound SSL** | Automated Let's Encrypt certificates | $0.00 | €0.00 |
| **Custom Domain / Edge** | Included | $0.00 | €0.00 |
| **Total Base Recurring** | | **$13.00 / month** | **~€12.00 / month** |

### 11.2 Usage Bands & Risk Assessment
- **Cost Band Classification:** **BAND_B (€10 – €25 / month)**.
- **Hard Cost Floor:** $13.00/mo (€12.00/mo). Render compute and database instances are flat monthly rates, prorated by the second.
- **Surprise Usage Risk:** **LOW**. Intra-region traffic between web service and database is free. Low request volume will not exceed the 100 GB included monthly bandwidth.
- **Lock-In Risk:** **LOW**. Runtime uses standard portable Node 22 Docker container; database is standard PostgreSQL 16. Migrating to another host requires only repointing environment variables.

---

## 12. Alternative / Fallback Recommendation

- **Alternative Runtime:** **Fly.io** (Shared CPU-1x 512MB in `fra` Frankfurt, ~$3.50/mo).
- **Alternative PostgreSQL:** **Neon** (Launch Plan in AWS `eu-central-1` Frankfurt, ~$5.00/mo base).
- **Alternative Use Condition:** Adopted if owner prefers a lower cost floor (Band A: €0–€10/mo) or already holds active Fly.io / Neon accounts. Requires `PUBLIC_TLS` network connectivity between Fly and Neon.

---

## 13. Rejection Register

| Candidate | Status | Reason for Rejection |
| :--- | :---: | :--- |
| **Render Free Tier (Web/DB)** | Rejected | Web services sleep after 15 min; free databases expire automatically after 30 days. Unsuitable for persistent audit records. |
| **Supabase Pro** | Rejected | Base price of $25.00/mo plus tax exceeds initial budget needs for a simple audit ledger. |
| **AWS App Runner + RDS** | Rejected | Estimated monthly cost ~$28–$35/mo with high operational burden (VPC connectors, security groups, IAM roles). |
| **Google Cloud Run + Cloud SQL** | Rejected | Estimated monthly cost ~$30–$40/mo with VPC connector overhead. |
| **Railway** | Rejected | Datacenter located in Netherlands / US; lack of native Frankfurt region. |

---

## 14. Owner Action Checklist & Credential Requirements

To proceed with live provisioning in `BECC-NEXT-007B`, the owner must complete the following isolated setup steps:

1. **Account Setup:**
   - Create an account on [Render.com](https://render.com) (or sign in via GitHub).
   - Enable Multi-Factor Authentication (MFA) on the Render account.
   - Add a payment method to authorize the Starter workspace.
2. **API & Deployment Credentials:**
   - Navigate to Account Settings -> API Keys in Render.
   - Generate a scoped API Key (or Webhook Deploy Hook URL for the web service).
   - Provide the key/webhook as a GitHub Secret (`RENDER_API_KEY` or `RENDER_DEPLOY_HOOK_URL`).
3. **Database Creation:**
   - In the Render dashboard, create a new PostgreSQL database in region `Frankfurt (EU Central)`.
   - Plan: Starter ($6/mo).
   - Record the internal connection string and admin credentials securely.
4. **Approve Recurring Budget:**
   - Authorize recurring budget for Band B ($13.00 / ~€12.00 per month).

---

## 15. Secret Management Plans

### 15.1 Proposed GitHub Secrets Plan
The following secrets will be stored in GitHub Secrets for CI/CD integration:

| Secret Name | Purpose | Where Stored | Exposure |
| :--- | :--- | :--- | :--- |
| `RENDER_API_KEY` | Authenticates deployment triggers from GitHub Actions | GitHub Repository Secrets | Build/Deploy step only |
| `RENDER_SERVICE_ID` | Identifies the Render web service target | GitHub Repository Secrets | Deploy step only |

*(Note: Master passwords and database admin passwords are NEVER stored in GitHub repository secrets).*

### 15.2 Proposed Runtime Service Environment Secrets Plan
The following secrets will be stored in the Render Environment Variables vault (encrypted at rest):

| Environment Variable | Sample Value Pattern | Purpose |
| :--- | :--- | :--- |
| `BECC_STORAGE_TYPE` | `postgres` | Enforces PostgreSQL storage engine |
| `PGHOST` | `dpg-xxxxxx-a.frankfurt-postgres.render.com` | Internal database hostname |
| `PGPORT` | `5432` | Standard PostgreSQL port |
| `PGDATABASE` | `bridgenta_becc` | Database name |
| `PGUSER` | `becc_app` | Least-privilege runtime role |
| `PGPASSWORD` | `<secure-generated-password>` | Dedicated password for `becc_app` |
| `PGSSL` | `true` | Enforces TLS encryption |
| `PORT` | `8080` | HTTP listener port |
| `RELEASE_SHA` | `<canonical-main-commit-sha>` | Verified commit provenance |

---

## 16. Post-Approval Provisioning Boundaries

Upon receipt of the owner authorization, workstream `BECC-NEXT-007B` is authorized to:
1. Connect to the provisioned database using the bootstrap admin credentials to execute schema migrations.
2. Create the `becc_app` role with strictly verified least-privilege grants (`SELECT`, `INSERT`; `UPDATE`, `DELETE`, `TRUNCATE`, `DDL` denied).
3. Configure the Render web service with runtime environment variables and deploy the canonical `main` Docker container.
4. Execute live HTTP verification of `/version`, `/health`, and `/ready`.
5. Capture immutable deployment evidence and close the three 006D blockers.

**Strictly Preserved Non-Claims:**
- `DEPLOYED_RUNTIME_CERTIFIED: NO` (requires independent certification workstream `007C`).
- `PRODUCTION_CERTIFIED: NO`.
- `MULTI_REGION_CERTIFIED: NO`.
