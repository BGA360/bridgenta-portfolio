# BECC v2 — Work Package Specification & Implementation Certificate
## IMPL-012: Governed Learning Contract Verification & Integration Adapter (Remediated)

* **Work Package ID:** `BECC-V2-IMPL-012`
* **Work Package Name:** Governed Learning Contract Verification & Integration Adapter
* **Workstream ID:** `BRIDGENTA-BECC-V2-PR312-STABLE-IDENTITY-DURABLE-RUNTIME-EVIDENCE-REMEDIATION-01`
* **Implementation Branch:** `feature/becc-v2-impl-012`
* **Date:** 2026-09-22
* **Status:** REMEDIATED & CERTIFIED (Pending PR Review)

---

## 1. Executive Summary

This work package implements `becc-runtime/governed-learning/` (`DefaultGovernedLearningIntegrationAdapter`), providing a narrow, type-safe integration gateway between the BECC v2 platform runtime and Governed Learning Level-2B (`@cep/governed-learning`).

PR #312 independent review remediation incorporates the following verified guarantees:
1. **Stable Immutable Command Identity & `issuedAt` Invariant:** Governed Learning command identity requires identical `issuedAt` timestamps across retries of the same logical command. Re-generating `issuedAt` on retry causes identity mismatch (`REFUSAL_INVARIANT_VIOLATION`). Input DTO `BECCFindingEscalationInput` accepts or carries stable `issuedAt`, enabling deterministic idempotency replay.
2. **Explicit Runtime Injection:** The adapter constructor requires an explicitly injected `GovernedLearningRuntime` instance (`DefaultGovernedLearningAdapterOptions`). Silent fallback to Level-1 in-memory runtime is forbidden and fails construction.
3. **Durability Level Composition:** The adapter itself does not determine durability. Production runtime composition injects the certified Level-2B PostgreSQL runtime (`createPostgresGovernedLearningRuntime`). Unit tests inject the desired runtime explicitly.
4. **Fail-Closed Evidence Provenance:** `AttachEvidence` requires a valid `evidenceLocation` or `sourceArtifactRef`. Fabrication of fallback locations (such as `file:///unknown_evidence`) is forbidden; missing evidence location fails closed (`REFUSAL_INSUFFICIENT_EVIDENCE`) prior to dispatch.
5. **Replay Detection:** Successful command outcomes propagate the runtime `replayed` boolean flag (`result.replayedResult`), confirming whether an operation was newly executed or replayed from Stage 8 idempotency storage.
6. **Unidirectional Dependency:** BECC imports `@cep/governed-learning` public exports (`packages/governed-learning`). Governed Learning does NOT import BECC.
7. **Application Service Gateway:** All interactions flow through `GovernedLearningRuntime.processAndExecuteCommandAsync()`.
8. **Zero Database / Transaction Context Leakage:** No direct SQL reads/writes against Governed Learning database tables. No exposure of raw `TransactionContext` or `PoolClient`.
9. **Preserved Governed Learning Capabilities & Gaps:** Supports canonical observation escalation commands (`DraftObservation`, `AttachEvidence`, `SubmitObservation`). Non-existent commands (`BuildGuidanceSetQuery`, `BindRulePolicyCommand`) remain documented capability gaps (`GL_CAPABILITY_GAP_001`, `GL_CAPABILITY_GAP_002`).

---

## 2. File Inventory

| File Path | Description |
| :--- | :--- |
| `becc-runtime/governed-learning/governed-learning-adapter.types.ts` | Bounded DTO input & outcome interfaces (`BECCFindingEscalationInput`, `BECCEscalationResult`, `GovernedLearningIntegrationAdapter`). Includes stable `issuedAt` and `replayed` flags. |
| `becc-runtime/governed-learning/governed-learning-command-id.ts` | Deterministic SHA256 command ID derivation function (`deriveGovernedLearningCommandId`). |
| `becc-runtime/governed-learning/governed-learning-adapter.service.ts` | Core service implementation (`DefaultGovernedLearningIntegrationAdapter`) enforcing explicit runtime injection, fail-closed evidence validation, and stable identity dispatch. |
| `becc-runtime/governed-learning/index.ts` | Module export index. |
| `becc-runtime/tests/governed-learning-adapter.test.ts` | Remediation test suite verifying explicit runtime injection, stable retry identity, true GL replay, fail-closed evidence attachment, and zero internal leakage. |

---

## 3. Verified Architecture Parameters

* **`STABLE_COMMAND_ID`:** `PASS`
* **`STABLE_ISSUED_AT_ACROSS_RETRY`:** `PASS`
* **`RUNTIME_INJECTION_REQUIRED`:** `YES`
* **`SILENT_LEVEL1_RUNTIME_FALLBACK`:** `REMOVED`
* **`PUBLIC_LEVEL2B_RUNTIME_FACTORY_EXISTS`:** `YES` (`createPostgresGovernedLearningRuntime`)
* **`ADAPTER_SILENTLY_DOWNGRADES_DURABILITY`:** `NO`
* **`FABRICATED_EVIDENCE_FALLBACK_PRESENT`:** `NO`
* **`MISSING_EVIDENCE_LOCATION_FAILS_CLOSED`:** `PASS`
* **`BECC_IMPORTS_ONLY_GL_PUBLIC_SURFACE`:** `YES`
* **`BECC_DIRECT_GL_DATABASE_ACCESS`:** `NO`
* **`BECC_DIRECT_TRANSACTION_CONTEXT_ACCESS`:** `NO`
* **`BECC_REIMPLEMENTS_STAGE8`:** `NO`
* **`BECC_REIMPLEMENTS_STAGE9`:** `NO`
* **`BECC_AUTOMATICALLY_APPROVES_LESSONS`:** `NO`
* **`BECC_AUTOMATICALLY_PROPOSES_RULES`:** `NO`
* **`BECC_AUTOMATICALLY_ADOPTS_RULES`:** `NO`
* **`BUILD_GUIDANCE_SET_QUERY_CHANGED`:** `NO` (`GL_CAPABILITY_GAP_001`)
* **`GLOBAL_POLICY_BINDING_IMPLEMENTED`:** `NO` (`GL_CAPABILITY_GAP_002`)
* **`OUTBOX_IMPLEMENTED`:** `NO`
* **`GL_CODE_CHANGED`:** `NO`

---

## 4. Verification & Validation Summary

* **BECC Adapter Test Suite:** `PASS` (`becc-runtime/tests/governed-learning-adapter.test.ts` 11/11 tests PASS)
* **BECC Runtime Build:** `PASS` (`npm run --prefix becc-runtime build`)
* **BECC Runtime Package Test:** `PASS` (`npm run --prefix becc-runtime test`)
* **Governed Learning Package Build:** `PASS` (`npm run --prefix packages/governed-learning build`)
* **Governed Learning Package Tests:** `PASS` (`npm run --prefix packages/governed-learning test`)
* **Root Build:** `PASS` (`npm run build`)
* **Root Tests:** `PASS` (`npm test`)
* **Root Lint:** `PASS` (`npm run lint`)
