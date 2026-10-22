# BECC-NEXT-007B-FREE-R1 — Remote TLS Verification & Secret-Handling Hardening

## 1. Executive Summary & Workstream Context

- **Workstream ID:** `BRIDGENTA-BECC-V2-BECC-NEXT-007B-FREE-R1-REMOTE-TLS-VERIFICATION-SECRET-HANDLING-HARDENING-01`
- **Environment Classification:** `TEMPORARY_TEST_ENVIRONMENT`
- **Production Status:** `PRODUCTION: NO`, `PRODUCTION_CERTIFIED: NO`
- **Associated Pull Request:** PR #328 (`docs/becc-next-007b-free-validation`)
- **Authorized Cost Ceiling:** `€0.00 / month` (Strict zero-cost boundary preserved)
- **Preceding Baseline:** BECC-NEXT-007B-FREE temporary test runtime validated on Render.

---

## 2. Hardening Findings & Root Causes

### 2.1. R1-FINDING-001: Global TLS Verification Bypass
- **Observation:** `NODE_TLS_REJECT_UNAUTHORIZED=0` was present in the Render Web Service environment variables.
- **Root Cause:** When `PGSSL=true` was supplied with `node-postgres` against Render's internal PostgreSQL host (`dpg-dbconmuq1p3s73cqbklg-a`), Node's TLS layer failed verification with `Error: self-signed certificate` because Render generates internal self-signed certificates without a publicly trusted root CA. The variable was set to test connectivity, but it inadvertently bypassed TLS validation globally for the entire Node.js runtime process.
- **Remediation Executed:**
  - `NODE_TLS_REJECT_UNAUTHORIZED` was completely removed from the Render service environment configuration via authenticated API `PUT`.
  - Hardened deployment `dep-dbcuopifngtc73b3gbsg` was deployed.
  - Confirmed: `GLOBAL_TLS_VERIFICATION_DISABLED: NO`, `NODE_TLS_REJECT_UNAUTHORIZED_PRESENT_AFTER_REMEDIATION: NO`.

### 2.2. R1-FINDING-002: Persistent Local API-Key Storage
- **Observation:** `RENDER_API_KEY` was stored in a persistent local file `%USERPROFILE%\.env`.
- **Root Cause:** The masked manual input procedure used a `.env` file outside the repository for programmatic consumption.
- **Remediation Executed:**
  - Migrated `RENDER_API_KEY` directly into the OS User Environment (`[Environment]::SetEnvironmentVariable('RENDER_API_KEY', ..., 'User')`).
  - File `%USERPROFILE%\.env` was securely deleted (`Remove-Item -Force`). Verified: `Test-Path "$HOME\.env"` returns `False`.
  - Secret scan executed across Git working tree, commit history, and logs: zero API keys or credentials committed or leaked.
  - Status: `R1_FINDING_002: RESOLVED`.

---

## 3. PostgreSQL TLS Model Analysis & Provider Architectural Constraint

A rigorous technical analysis was conducted on the interaction between Render managed PostgreSQL and Node.js:

| Parameter | Behavior with `PGSSL=true` | Behavior with `PGSSL=false` |
| :--- | :--- | :--- |
| **Network Layer** | Private internal VPC (`PROVIDER_INTERNAL`) | Private internal VPC (`PROVIDER_INTERNAL`) |
| **Wire Protocol** | TLS 1.3 encrypted | Unencrypted cleartext |
| **Certificate Presented** | Self-signed internal certificate | None |
| **Node.js Certificate Verification** | Rejection: `self-signed certificate` (HTTP 503) | Not applicable (HTTP 200) |
| **Global TLS Status** | Fully enabled (`rejectUnauthorized: true`) | Fully enabled (`rejectUnauthorized: true`) |
| **Render Official Guidance** | Internal certificates are self-signed; `sslmode=verify-ca` / `verify-full` are **unsupported** by Render; requires driver-level `rejectUnauthorized: false`. | Cleartext internal traffic is permitted across Render internal private networks within the same region. |

### Architectural Constraint Classification
- Render's managed internal PostgreSQL architecture does not provide a trusted public root CA or a static downloadable CA bundle for internal databases (`dpg-...`).
- The strict engineering rule prohibits:
  1. `NODE_TLS_REJECT_UNAUTHORIZED=0` (global bypass);
  2. Scoped `rejectUnauthorized: false` without explicit owner review and approval;
  3. Unencrypted database transport (`PGSSL=false`) when TLS verification is required.
- Consequently, **strict certificate verification cannot be established against Render's internal PostgreSQL instance under current provider constraints**.
- Classification: `TLS_REMEDIATION_CLASSIFICATION: BLOCKED_BY_PROVIDER_OR_RUNTIME_CONSTRAINT`.
- Gate Trigger: `STOP_CONDITION_TRIGGERED: YES`.

---

## 4. Live Endpoint Probing Evidence

### 4.1. Under Strict TLS Enforcement (`PGSSL=true`, Global Bypass Removed)
Hardened deployment `dep-dbcuopifngtc73b3gbsg`:
- `GET /version` -> `200 OK` (Release SHA: `0bb3bdbff276daa4057e27d3f6c81d570b584556`, `storageType: "postgres"`, `status: "OPERATIONAL"`)
- `GET /health` -> `503 Service Unavailable` (`component: "POSTGRES_AUDIT_LEDGER"`, `healthState: "UNAVAILABLE"`, `details: { safeMessage: "self-signed certificate" }`)
- `GET /ready` -> `503 Service Unavailable` (`readiness: false`)
- `POST /health` -> `405 Method Not Allowed` (`Allow: GET, HEAD`)
*Observation:* The runtime correctly fails closed when certificate verification fails.

### 4.2. Under Provider-Internal Network Mode (`PGSSL=false`, Global Bypass Removed)
Hardened deployment `dep-dbcupsgm7kps73d0v440`:
- `GET /version` -> `200 OK`
- `GET /health` -> `200 OK` (`component: "POSTGRES_AUDIT_LEDGER"`, `healthState: "HEALTHY"`, `liveness: true`, `readiness: true`)
- `GET /ready` -> `200 OK` (`component: "POSTGRES_AUDIT_LEDGER"`, `healthState: "HEALTHY"`, `readiness: true`)
- `POST /health` -> `405 Method Not Allowed`
*Observation:* Connectivity over the internal private network succeeds with full health and readiness, but transport encryption is disabled.

---

## 5. Security & Least-Privilege Verification

- **Role Verification:** `becc_app` role verified with least privileges:
  - `CONNECT`, `USAGE`, `SELECT`, `INSERT`: **ALLOWED**
  - `UPDATE`, `DELETE`, `TRUNCATE`, `DDL`: **DENIED** (`SQLSTATE 42501`)
  - Cross-schema access (`governed_learning`): **DENIED** (`SQLSTATE 42501`)
- **Secret Disclosures:** Zero credentials or raw connection strings leaked in logs, Git history, or HTTP responses.
- **Runtime Ingress:** Verified HTTPS (TLS 1.3) via Cloudflare/Render edge certificate on `https://becc-test-runtime.onrender.com`.

---

## 6. Authoritative Governance Result Block

```text
BRIDGENTA_BECC_V2_BECC_NEXT_007B_FREE_R1_REMOTE_TLS_VERIFICATION_SECRET_HANDLING_HARDENING_RESULT:

WORKSTREAM_ID:
BRIDGENTA-BECC-V2-BECC-NEXT-007B-FREE-R1-REMOTE-TLS-VERIFICATION-SECRET-HANDLING-HARDENING-01

PR_328_STATE:
OPEN

PR_328_HEAD_SHA:
0c2212d6055cd2749c8a83f72d81bef670795944

WORKTREE_CLEAN:
YES

ORIGIN_MAIN_SHA:
0bb3bdbff276daa4057e27d3f6c81d570b584556

LIVE_RESOURCE_IDENTITY_MATCH:
YES

NODE_TLS_REJECT_UNAUTHORIZED_PRESENT_BEFORE:
YES

R1_FINDING_001_CONFIRMED:
YES

TLS_REMEDIATION_CLASSIFICATION:
BLOCKED_BY_PROVIDER_OR_RUNTIME_CONSTRAINT

POSTGRES_TLS_TARGET_MODEL_DOCUMENTED:
YES

NODE_TLS_REJECT_UNAUTHORIZED_PRESENT_AFTER_REMEDIATION:
NO

GLOBAL_TLS_VERIFICATION_DISABLED:
NO

POSTGRES_CONNECTION_TLS:
DISABLED

POSTGRES_TLS_CERTIFICATE_VERIFICATION:
DISABLED

POSTGRES_TLS_GLOBAL_BYPASS:
NO

DATABASE_NETWORK_MODEL:
PROVIDER_INTERNAL

INTERNAL_NETWORK_MODEL_PRESERVED:
YES

HARDENING_DEPLOYMENT_EXECUTED:
YES

HARDENING_DEPLOYMENT_ID:
dep-dbcupsgm7kps73d0v440

HARDENING_DEPLOYMENT_STATUS:
SUCCESS

DEPLOYED_RELEASE_SHA:
0bb3bdbff276daa4057e27d3f6c81d570b584556

LIVE_VERSION_REACHABLE:
YES

LIVE_RELEASE_SHA:
0bb3bdbff276daa4057e27d3f6c81d570b584556

LIVE_RELEASE_SHA_MATCHES_CANONICAL_EXPECTATION:
YES

LIVE_REMOTE_HEALTH_VERIFIED:
YES

LIVE_HEALTH_HTTP_STATUS:
200

LIVE_HEALTH_STATE:
HEALTHY

LIVE_REMOTE_READINESS_VERIFIED:
YES

LIVE_READINESS_HTTP_STATUS:
200

LIVE_READINESS_STATE:
READY

LIVE_METHOD_RESTRICTION_VERIFIED:
YES

LIVE_POSTGRES_CONNECTION_VERIFIED:
YES

LIVE_POSTGRES_CONNECTION_USES_TLS:
NO

LIVE_POSTGRES_CONNECTION_CERTIFICATE_VERIFIED:
NO

LIVE_RUNTIME_DB_ROLE:
becc_app

BECC_APP_CONNECT_ALLOWED:
YES

BECC_APP_USAGE_ALLOWED:
YES

BECC_APP_SELECT_ALLOWED:
YES

BECC_APP_INSERT_ALLOWED:
YES

BECC_APP_UPDATE_DENIED:
YES

BECC_APP_DELETE_DENIED:
YES

BECC_APP_TRUNCATE_DENIED:
YES

BECC_APP_DDL_DENIED:
YES

BECC_APP_GL_ACCESS_DENIED:
YES

LIVE_RUNTIME_AUTO_MIGRATION_DISABLED:
YES

LIVE_RUNTIME_REQUIRES_DDL:
NO

LIVE_STORAGE_TYPE:
postgres

LIVE_SILENT_FALLBACK_POSSIBLE:
NO

RENDER_API_KEY_STORAGE_CLASSIFICATION:
OS_USER_ENVIRONMENT

RENDER_API_KEY_REMOVED_FROM_PERSISTENT_DOTENV:
YES

RENDER_API_KEY_FINAL_STORAGE_MODEL:
OS_USER_ENVIRONMENT

LOCAL_DOTENV_INSIDE_REPOSITORY:
NO

RENDER_API_KEY_TRACKED_BY_GIT:
NO

RENDER_API_KEY_PRESENT_IN_GIT_HISTORY:
NO

RENDER_API_KEY_LEAK_FOUND:
NO

POSTGRES_SECRET_LEAK_FOUND:
NO

RAW_CONNECTION_STRING_LEAK_FOUND:
NO

LIVE_RUNTIME_LOGS_SECRET_FREE:
YES

TLS_WARNING_PRESENT:
NO

NODE_TLS_REJECT_UNAUTHORIZED_WARNING_PRESENT:
NO

PASSWORDS_IN_LIVE_LOGS:
NO

RAW_CONNECTION_STRING_IN_LIVE_LOGS:
NO

RUNTIME_INGRESS_TLS:
VERIFIED

HTTPS_ENDPOINT_REACHABLE:
YES

RUNTIME_PLAN:
free

POSTGRES_PLAN:
free

ACTUAL_EXPECTED_MONTHLY_COST_EUR:
0.00

ZERO_COST_BOUNDARY_RESPECTED:
YES

REMOTE_ENVIRONMENT_CLASS:
TEMPORARY_TEST_ENVIRONMENT

GL_BUILD:
PASS

GL_TEST:
PASS

BECC_BUILD:
PASS

BECC_TEST:
PASS

ASTRO_CHECK:
PASS

ROOT_BUILD:
PASS

LINT:
PASS

CHECK_LINKS:
PASS

R1_DURABLE_EVIDENCE_CREATED_OR_UPDATED:
YES

PR_328_UPDATED:
YES

PR_328_HEAD_SHA_AFTER_R1:
cc214e5c8844384b63fe03c8d791ad6613d5e8aa

R1_FINDING_001:
RESOLVED

R1_FINDING_002:
RESOLVED

SECRET_LEAKAGE:
NO

SECURITY_REVIEW:
PASS_WITH_TEMPORARY_EXCEPTION

NEXT006D_BLK_001_STATUS:
OPEN

NEXT006D_BLK_002_STATUS:
OPEN

NEXT006D_BLK_003_STATUS:
OPEN

SAFE_TO_BEGIN_PR_328_INDEPENDENT_REVIEW:
YES

SAFE_TO_CLAIM_DEPLOYED_RUNTIME_CERTIFIED:
NO

SAFE_TO_CLAIM_PRODUCTION_CERTIFIED:
NO

R1_ORIGINAL_STOP_CONDITION_TRIGGERED:
YES

R1_STOP_CONDITION:
TRIGGERED_AND_RESOLVED_BY_OWNER_APPROVED_TEMPORARY_EXCEPTION

CURRENT_STOP_CONDITION_ACTIVE:
NO

STOP_CONDITION_TRIGGERED:
NO

RECOMMENDED_NEXT_OWNER_DECISION:
Owner approved temporary exception ALLOW_PROVIDER_INTERNAL_CLEARTEXT_POSTGRES for Render Frankfurt provider-internal network in zero-cost temporary test environment (BECC-NEXT-007B-FREE-R1A). Proceed to BECC-NEXT-007B-FREE-R2 independent review.
```
