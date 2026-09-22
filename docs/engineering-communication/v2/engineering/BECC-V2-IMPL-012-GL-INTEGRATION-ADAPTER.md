# BECC v2 — Work Package Specification & Implementation Certificate
## IMPL-012: Governed Learning Contract Verification & Integration Adapter

* **Work Package ID:** `BECC-V2-IMPL-012`
* **Work Package Name:** Governed Learning Contract Verification & Integration Adapter
* **Workstream ID:** `BRIDGENTA-BECC-V2-IMPL-012-GL-CONTRACT-VERIFICATION-INTEGRATION-ADAPTER`
* **Implementation Branch:** `feature/becc-v2-impl-012`
* **Date:** 2026-09-22
* **Status:** IMPLEMENTED (Pending PR Review)

---

## 1. Executive Summary

This work package implements `becc-runtime/governed-learning/` (`DefaultGovernedLearningIntegrationAdapter`), providing a narrow, type-safe integration gateway between the BECC v2 platform runtime and Governed Learning Level-2B (`@cep/governed-learning`).

The adapter strictly respects all architectural boundaries specified in the frozen ADR (`BECC-V2-GOVERNED-LEARNING-INTEGRATION-ADR.md`):
1. **Unidirectional Dependency:** BECC imports `@cep/governed-learning` public exports (`packages/governed-learning`). Governed Learning does NOT import BECC.
2. **Application Service Gateway:** All interactions flow through `GovernedLearningRuntime.processAndExecuteCommandAsync()`.
3. **Zero Database / Transaction Context Leakage:** No direct SQL reads/writes against Governed Learning database tables (`observations`, `lessons`, `rule_candidates`, etc.). No exposure of raw `TransactionContext` or `PoolClient`.
4. **Deterministic Command ID Derivation:** Uses stable SHA-256 derivation (`deriveGovernedLearningCommandId`) to preserve Governed Learning Stage 8 command-level idempotency on retries without duplicating Stage 8 or Stage 9 logic.
5. **Fail-Closed Security:** Rejects escalation requests with missing `actorRef` or `authorityContextRef` (`REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED`).
6. **Preserved Governed Learning Capabilities & Gaps:** Supports canonical observation escalation commands (`DraftObservation`, `AttachEvidence`, `SubmitObservation`). Does NOT attempt to call non-existent commands or fake policy binding engines.

---

## 2. File Inventory

| File Path | Description |
| :--- | :--- |
| `becc-runtime/governed-learning/governed-learning-adapter.types.ts` | Bounded DTO input & outcome interfaces (`BECCFindingEscalationInput`, `BECCEscalationResult`, `GovernedLearningIntegrationAdapter`). |
| `becc-runtime/governed-learning/governed-learning-command-id.ts` | Deterministic SHA256 command ID derivation function (`deriveGovernedLearningCommandId`). |
| `becc-runtime/governed-learning/governed-learning-adapter.service.ts` | Core service implementation (`DefaultGovernedLearningIntegrationAdapter`). |
| `becc-runtime/governed-learning/index.ts` | Module export index. |
| `becc-runtime/tests/governed-learning-adapter.test.ts` | Contract verification, integration, boundary, and idempotency test suite. |

---

## 3. Verified Architecture Parameters

* **`BECC_IMPORTS_ONLY_GL_PUBLIC_SURFACE`:** `YES`
* **`BECC_DIRECT_GL_DATABASE_ACCESS`:** `NO`
* **`BECC_DIRECT_TRANSACTION_CONTEXT_ACCESS`:** `NO`
* **`BECC_REIMPLEMENTS_STAGE8`:** `NO`
* **`BECC_REIMPLEMENTS_STAGE9`:** `NO`
* **`BECC_AUTOMATICALLY_APPROVES_LESSONS`:** `NO`
* **`BECC_AUTOMATICALLY_PROPOSES_RULES`:** `NO`
* **`BECC_AUTOMATICALLY_ADOPTS_RULES`:** `NO`
* **`BUILD_GUIDANCE_SET_QUERY_IMPLEMENTED`:** `NO` (Deferred in GL runtime, logged as `GL_CAPABILITY_GAP_001`)
* **`GLOBAL_POLICY_BINDING_IMPLEMENTED`:** `NO` (`GL_CAPABILITY_GAP_002`)
* **`OUTBOX_IMPLEMENTED`:** `NO`
* **`GL_CODE_CHANGED`:** `NO`

---

## 4. Verification & Validation Summary

* **Unit & Contract Tests:** `PASS` (`becc-runtime/tests/governed-learning-adapter.test.ts` 8/8 tests PASS)
* **Governed Learning Package Build:** `PASS` (`npm run --prefix packages/governed-learning build`)
* **Governed Learning Package Tests:** `PASS` (`npm run --prefix packages/governed-learning test`)
* **Root Build:** `PASS` (`npm run build`)
* **Root Tests:** `PASS` (`npm test`)
* **Root Lint:** `PASS` (`npm run lint`)
