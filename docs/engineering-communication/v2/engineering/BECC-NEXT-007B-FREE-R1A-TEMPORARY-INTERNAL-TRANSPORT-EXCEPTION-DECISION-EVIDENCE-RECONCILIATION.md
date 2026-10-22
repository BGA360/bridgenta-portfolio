# BECC-NEXT-007B-FREE-R1A — Temporary Internal-Transport Exception Decision & Evidence Reconciliation

## 1. Executive Summary & Workstream Context

- **Workstream ID:** `BRIDGENTA-BECC-V2-BECC-NEXT-007B-FREE-R1A-TEMPORARY-INTERNAL-TRANSPORT-EXCEPTION-DECISION-EVIDENCE-RECONCILIATION-01`
- **Environment Classification:** `TEMPORARY_TEST_ENVIRONMENT`
- **Production Status:** `PRODUCTION: NO`, `PRODUCTION_CERTIFIED: NO`
- **Associated Pull Request:** PR #328 (`docs/becc-next-007b-free-validation`)
- **Authorized Cost Ceiling:** `€0.00 / month` (Strict zero-cost boundary preserved)
- **Preceding Baseline:** BECC-NEXT-007B-FREE-R1 remote TLS verification and secret hardening.

---

## 2. Core Governance Reconciliation

BECC-NEXT-007B-FREE-R1 established that:
1. `NODE_TLS_REJECT_UNAUTHORIZED=0` was removed, restoring strict global TLS verification.
2. Render's managed internal PostgreSQL (`dpg-dbconmuq1p3s73cqbklg-a`) presents self-signed certificates without a trusted public root CA or downloadable CA bundle.
3. Under strict TLS verification (`PGSSL=true`), Node's TLS layer correctly fails closed on self-signed certificates (HTTP 503 `safeMessage: "self-signed certificate"`).
4. Under provider-internal private network cleartext (`PGSSL=false`), the runtime is fully operational (`/health` and `/ready` return HTTP 200 `HEALTHY` and `READY`).

R1 previously recorded a governance inconsistency:
`SECURITY_REVIEW: PASS` alongside `STOP_CONDITION_TRIGGERED: YES`.

This workstream explicitly reconciles that status through an authoritative governance decision.

---

## 3. Explicit Exception Decision & Scope

### 3.1. Formal Exception Grant
- **Decision:** `TEMPORARY_INTERNAL_TRANSPORT_EXCEPTION_DECISION: APPROVED`
- **Owner Approval:** `OWNER_APPROVED_TEMPORARY_EXCEPTION: YES`
- **Exception Name:** `ALLOW_PROVIDER_INTERNAL_CLEARTEXT_POSTGRES`
- **Exception Scope:** `TEMPORARY_TEST_ENVIRONMENT_ONLY`
- **Network Scope:** `RENDER_FRANKFURT_PROVIDER_INTERNAL_ONLY` (`dpg-dbconmuq1p3s73cqbklg-a`)

### 3.2. Mandatory Boundaries & Strict Prohibitions
1. **Public Database Access:** **FORBIDDEN** (`ipAllowList: []` strictly enforced; external database access drops).
2. **Production Use:** **FORBIDDEN** (Environment is temporary test only; safe to claim production certified: NO).
3. **Production Data:** **FORBIDDEN** (No sensitive, real, or persistent audit evidence).
4. **Driver-Level TLS Bypass:** **FORBIDDEN** (`ssl: { rejectUnauthorized: false }` strictly prohibited).
5. **Global TLS Bypass:** **FORBIDDEN** (`NODE_TLS_REJECT_UNAUTHORIZED=0` strictly prohibited; `GLOBAL_TLS_VERIFICATION_DISABLED: NO`).
6. **Production Requirement:** **CA_VERIFIED_TLS_REQUIRED** (Paid / persistent production architecture must enforce CA-verified TLS).
7. **Exception Expiry:** **WHEN_FREE_TEST_ENVIRONMENT_IS_RETIRED_OR_REPLACED** (Automated 30-day database expiration or earlier).

---

## 4. Reconciled Security & Stop-Condition Semantics

To maintain immutable historical truth:
- **R1 Original Run History:** `R1_ORIGINAL_STOP_CONDITION_TRIGGERED: YES` (Accurately records that strict TLS verification could not be established without an approved exception).
- **R1 Resolution:** `R1_STOP_CONDITION: TRIGGERED_AND_RESOLVED_BY_OWNER_APPROVED_TEMPORARY_EXCEPTION`.
- **Current Active Stop State:** `CURRENT_STOP_CONDITION_ACTIVE: NO`.
- **Current Stop Condition:** `STOP_CONDITION_TRIGGERED: NO`.
- **Security Review Classification:** `SECURITY_REVIEW: PASS_WITH_TEMPORARY_EXCEPTION` (Unconditional `PASS` is strictly avoided while cleartext transport remains).

---

## 5. Compensating Controls & Empirical Verification

All required compensating security controls have been verified:

| Control | Verification | Status |
| :--- | :--- | :--- |
| **Provider-Internal Routing** | `PGHOST=dpg-dbconmuq1p3s73cqbklg-a` (Frankfurt private VPC) | Verified |
| **Public Database Exposure** | `ipAllowList: []` | Blocked & Verified |
| **Database Role** | `becc_app` (least-privilege) | Verified (DDL/UPDATE/DELETE denied) |
| **Cross-Schema Access** | Governed Learning schema access denied | Verified (`SQLSTATE 42501`) |
| **Global TLS Verification** | Active across all Node.js HTTPS egress | Verified (`GLOBAL_TLS_VERIFICATION_DISABLED: NO`) |
| **Runtime Ingress TLS** | Public HTTPS endpoint secured via Cloudflare/Render edge TLS 1.3 | Verified |
| **Ephemeral Secret Storage** | `RENDER_API_KEY` stored solely in OS User Environment; `%USERPROFILE%\.env` deleted | Verified |
| **Zero Secret Exposure** | Working tree, commit history, logs clean | Verified |
| **Database Persistence Expectation** | Render Free 30-day automatic deletion | Verified |
| **Cost Incurred** | €0.00 / month | Preserved |

---

## 6. Live Endpoint Probing Evidence

HTTP probes against `https://becc-test-runtime.onrender.com`:

```http
GET /version -> HTTP/1.1 200 OK
{
  "name": "becc-runtime",
  "version": "2.0.0-GA",
  "releaseSha": "0bb3bdbff276daa4057e27d3f6c81d570b584556",
  "storageType": "postgres",
  "status": "OPERATIONAL",
  "timestamp": "2026-10-22T11:23:39.755Z"
}

GET /health -> HTTP/1.1 200 OK
{
  "component": "POSTGRES_AUDIT_LEDGER",
  "healthState": "HEALTHY",
  "liveness": true,
  "readiness": true,
  "details": {
    "safeMessage": "PostgreSQL audit persistence operational",
    "checkDurationMs": 111
  },
  "occurredAt": "2026-10-22T11:23:39.803Z"
}

GET /ready -> HTTP/1.1 200 OK
{
  "component": "POSTGRES_AUDIT_LEDGER",
  "healthState": "HEALTHY",
  "liveness": true,
  "readiness": true,
  "details": {
    "safeMessage": "PostgreSQL audit persistence operational",
    "checkDurationMs": 5
  },
  "occurredAt": "2026-10-22T11:23:39.962Z"
}

POST /health -> HTTP/1.1 405 Method Not Allowed
{"error":"Method Not Allowed"}
```

---

## 7. Authoritative Governance Result Block

```text
BRIDGENTA_BECC_V2_BECC_NEXT_007B_FREE_R1A_TEMPORARY_INTERNAL_TRANSPORT_EXCEPTION_DECISION_EVIDENCE_RECONCILIATION_RESULT:

WORKSTREAM_ID:
BRIDGENTA-BECC-V2-BECC-NEXT-007B-FREE-R1A-TEMPORARY-INTERNAL-TRANSPORT-EXCEPTION-DECISION-EVIDENCE-RECONCILIATION-01

WORKTREE_CLEAN:
YES

ORIGIN_MAIN_SHA:
0bb3bdbff276daa4057e27d3f6c81d570b584556

PR_328_STATE:
OPEN

PR_328_HEAD_SHA:
8a0b68e66a14d6490c4cd9256242cffa7abb4fc2

R1_TRANSPORT_FINDINGS_RECONFIRMED:
YES

RENDER_INTERNAL_POSTGRES_STRICT_CERT_VERIFY_SUPPORTED:
NO

PROVIDER_CONSTRAINT_CONFIRMED:
YES

IS_ENVIRONMENT_TEMPORARY:
YES

IS_ENVIRONMENT_NON_PRODUCTION:
YES

IS_DB_PROVIDER_INTERNAL_ONLY:
YES

IS_PUBLIC_DB_ACCESS_DISABLED:
YES

IS_RUNTIME_ROLE_LEAST_PRIVILEGE:
YES

IS_PRODUCTION_DATA_PROHIBITED:
YES

IS_DATABASE_TEMPORARY:
YES

IS_EXCEPTION_BOUNDED:
YES

IS_EXCEPTION_REVERSIBLE:
YES

TEMPORARY_INTERNAL_TRANSPORT_EXCEPTION_DECISION:
APPROVED

OWNER_APPROVED_TEMPORARY_EXCEPTION:
YES

TEMPORARY_TEST_EXCEPTION:
ALLOW_PROVIDER_INTERNAL_CLEARTEXT_POSTGRES

EXCEPTION_SCOPE:
TEMPORARY_TEST_ENVIRONMENT_ONLY

NETWORK_SCOPE:
RENDER_FRANKFURT_PROVIDER_INTERNAL_ONLY

PUBLIC_DATABASE_ACCESS:
FORBIDDEN

PRODUCTION_USE:
FORBIDDEN

PRODUCTION_DATA:
FORBIDDEN

DRIVER_TLS_BYPASS:
FORBIDDEN

GLOBAL_TLS_BYPASS:
FORBIDDEN

PRODUCTION_TLS_REQUIREMENT:
CA_VERIFIED_TLS_REQUIRED

EXCEPTION_EXPIRY:
WHEN_FREE_TEST_ENVIRONMENT_IS_RETIRED_OR_REPLACED

SECURITY_REVIEW:
PASS_WITH_TEMPORARY_EXCEPTION

SECURITY_REVIEW_CLASSIFICATION_RECONCILED:
YES

R1_ORIGINAL_STOP_CONDITION_TRIGGERED:
YES

R1_STOP_CONDITION:
TRIGGERED_AND_RESOLVED_BY_OWNER_APPROVED_TEMPORARY_EXCEPTION

CURRENT_STOP_CONDITION_ACTIVE:
NO

STOP_CONDITION_HISTORY_PRESERVED:
YES

DATABASE_NETWORK_MODEL:
PROVIDER_INTERNAL

DATABASE_PUBLIC_ACCESS:
DISABLED

RUNTIME_REGION:
frankfurt

POSTGRES_REGION:
frankfurt

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

LIVE_SILENT_FALLBACK_POSSIBLE:
NO

PRODUCTION_DATA_ALLOWED:
NO

POSTGRES_BACKUPS_AVAILABLE:
NO

POSTGRES_TEMPORARY_EXPIRY_DOCUMENTED:
YES

COMPENSATING_CONTROLS_VERIFIED:
YES

DRIVER_LEVEL_TLS_BYPASS_PRESENT:
NO

LIVE_VERSION_HTTP_STATUS:
200

LIVE_RELEASE_SHA:
0bb3bdbff276daa4057e27d3f6c81d570b584556

LIVE_HEALTH_HTTP_STATUS:
200

LIVE_HEALTH_STATE:
HEALTHY

LIVE_READY_HTTP_STATUS:
200

LIVE_READY_STATE:
READY

LIVE_METHOD_NOT_ALLOWED_STATUS:
405

RENDER_API_KEY_FINAL_STORAGE_MODEL:
OS_USER_ENVIRONMENT

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

R1A_DURABLE_EVIDENCE_CREATED_OR_UPDATED:
YES

PR_328_UPDATED_WITH_R1A:
YES

PR_328_HEAD_SHA_AFTER_R1A:
a0e85e6a8b8a548279087ca13cc4c72ce391f7ec

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

STOP_CONDITION_TRIGGERED:
NO

RECOMMENDED_NEXT_OWNER_DECISION:
Proceed to BECC-NEXT-007B-FREE-R2 — PR #328 Independent Review, Evidence Integrity & Controlled Merge Decision under the reconciled PASS_WITH_TEMPORARY_EXCEPTION governance framework.
```
