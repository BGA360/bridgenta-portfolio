# BECC v2 — Work Package Specification & Implementation Certificate
## IMPL-013: Knowledge Resolver & Governed Guidance Query Integration

* **Work Package ID:** `BECC-V2-IMPL-013`
* **Work Package Name:** Knowledge Resolver & Governed Guidance Query Integration
* **Workstream ID:** `BRIDGENTA-BECC-V2-IMPL-013-KNOWLEDGE-RESOLVER-GOVERNED-GUIDANCE-QUERY-INTEGRATION-01`
* **Implementation Branch:** `feature/becc-v2-impl-013`
* **Date:** 2026-09-24
* **Status:** IMPLEMENTED & CERTIFIED (Pending PR Review)

---

## 1. Executive Summary

This work package implements `becc-runtime/knowledge/` (`GovernedGuidanceResolverService`), establishing the governed knowledge resolution capability for BECC v2 to query and consume Governed Learning guidance (`@cep/governed-learning`).

Key Architectural Guarantees:
1. **Public Governed Learning Runtime Boundary:** Communicates with Governed Learning strictly via `GovernedLearningIntegrationAdapter.queryGuidance()`, which dispatches `BuildGuidanceSetQuery` through `GovernedLearningRuntime.processAndExecuteCommandAsync()`.
2. **BECC ↔ Governed Learning TargetRef Mapping:** Maps BECC context (`projectRef`, `workstreamRef`, or `assessmentContext`) to canonical `TargetRef` (`PROJECT` or `WORKSTREAM`). Fails closed on unmapped context without broadening scope to `SYSTEM_WIDE`.
3. **No Governed Learning Eligibility Duplication:** BECC does not filter, re-evaluate, or inspect lesson statuses (`PUBLISHED`, `ADOPTED`, `REJECTED`, `SUPERSEDED`, `RETIRED`). Governed Learning runtime remains the Single Source of Truth for guidance eligibility.
4. **Zero Database / Persistence Access:** BECC production code contains no SQL queries, table references (`lessons`, `governance_events`), database managers, or transaction context imports.
5. **Stable Query Command Identity & Freshness:** Derives deterministic command identity using stable business inputs (`queryId` + `issuedAt` + query payload). Retries with identical command identity return the replayed result. New command identity queries fresh state per new command.
6. **Caller-Supplied `issuedAt`:** The resolver never synthesizes `issuedAt` on retries. Missing or whitespace `issuedAt` fails closed (`REFUSAL_INVARIANT_VIOLATION`).
7. **Explicit Runtime & Adapter Injection:** Requires explicit adapter injection (`GovernedGuidanceResolverOptions`). Silent fallback to unconfigured runtime is forbidden.
8. **Provenance & Replay Signal Preservation:** Preserves `lessonRef`, `version`, `statement`, `rationale`, `scope`, `evaluatedAt`, and `replayed` flags in returned readonly DTOs.
9. **Result Discrimination:** Distinguishes valid empty guidance (`SUCCESS` with `guidanceItems: []`) from query failure (`ERROR` or `REFUSED`).
10. **No Global Policy Binding or Auto-Enforcement:** Guidance is surfaced as informational governed context. Guidance does not automatically mutate BECC analysis decisions, alter finding severity, or force mandatory policy enforcement (`GL_CAPABILITY_GAP_002` remains open and out of scope).

---

## 2. File Inventory

| File Path | Description |
| :--- | :--- |
| `becc-runtime/governed-learning/governed-learning-adapter.types.ts` | Updated interface to include `BECCGuidanceQueryInput`, `BECCGuidanceQueryResult`, and `queryGuidance` method. |
| `becc-runtime/governed-learning/governed-learning-adapter.service.ts` | Implemented `queryGuidance()` method dispatching `BuildGuidanceSetQuery` through `runtime.processAndExecuteCommandAsync()`. |
| `becc-runtime/knowledge/governed-guidance-resolver.types.ts` | Resolver DTOs: `ResolvedGovernedGuidanceQueryInput`, `BECCGovernedGuidanceItem`, and `ResolvedGovernedGuidanceResult`. |
| `becc-runtime/knowledge/governed-guidance-resolver.service.ts` | `GovernedGuidanceResolverService` implementation mapping context to `TargetRef`, executing queries, failing closed on unmapped context, and projecting GL results into normalized DTOs. |
| `becc-runtime/knowledge/index.ts` | Knowledge resolver module public exports. |
| `becc-runtime/tests/governed-guidance-resolver.test.ts` | Comprehensive unit, boundary, replay, freshness, isolation, and static boundary verification tests (13/13 PASS). |

---

## 3. Verified Architecture Parameters

* **`BUILD_GUIDANCE_SET_QUERY_PUBLIC_CONTRACT_AVAILABLE`:** `YES`
* **`BECC_KNOWLEDGE_RESOLVER_INPUT_DEFINED`:** `YES`
* **`BECC_KNOWLEDGE_RESOLVER_RESULT_DEFINED`:** `YES`
* **`RESOLVER_USES_EXISTING_GL_GATEWAY`:** `YES`
* **`GUIDANCE_QUERY_USES_PUBLIC_GL_RUNTIME`:** `YES`
* **`BECC_IMPORTS_ONLY_GL_PUBLIC_SURFACE`:** `YES`
* **`DEEP_GL_IMPORTS`:** `NO`
* **`GL_IMPORTS_BECC`:** `NO`
* **`BECC_DIRECT_GL_DATABASE_ACCESS`:** `NO`
* **`BECC_DIRECT_TRANSACTION_CONTEXT_ACCESS`:** `NO`
* **`EXPLICIT_GL_RUNTIME_INJECTION`:** `YES`
* **`SILENT_LEVEL1_RUNTIME_FALLBACK`:** `NO`
* **`DETERMINISTIC_GUIDANCE_QUERY_COMMAND_ID`:** `YES`
* **`RESOLVER_REGENERATES_ISSUED_AT_ON_RETRY`:** `NO`
* **`SUPPORTED_BECC_TO_GL_TARGET_MAPPINGS`:** `PROJECT, WORKSTREAM`
* **`UNKNOWN_BECC_CONTEXT_BROADENS_SCOPE`:** `NO`
* **`FABRICATED_AUTHORITY_CONTEXT`:** `NO`
* **`RAW_EXTERNAL_GL_QUERY_PASSTHROUGH`:** `NO`
* **`EMPTY_GUIDANCE_DISTINCT_FROM_QUERY_FAILURE`:** `YES`
* **`GL_REPLAY_SIGNAL_PRESERVED`:** `YES`
* **`GL_EVALUATED_AT_PRESERVED`:** `YES`
* **`GUIDANCE_PROVENANCE_PRESERVED`:** `YES`
* **`BECC_ADDS_UNRETURNED_GUIDANCE`:** `NO`
* **`BECC_REORDERS_GL_GUIDANCE`:** `NO`
* **`BECC_REIMPLEMENTS_GUIDANCE_DEDUPLICATION`:** `NO`
* **`BECC_REIMPLEMENTS_GL_ELIGIBILITY`:** `NO`
* **`BECC_REIMPLEMENTS_GL_SCOPE_MATCHING`:** `NO`
* **`BECC_REIMPLEMENTS_GL_STATUS_FILTERING`:** `NO`
* **`BECC_REIMPLEMENTS_GL_STAGE8`:** `NO`
* **`BECC_REIMPLEMENTS_GL_STAGE9`:** `NO`
* **`BECC_STATUS_BASED_GUIDANCE_FILTERING`:** `NO`
* **`GUIDANCE_AUTO_ENFORCEMENT`:** `NO`
* **`GUIDANCE_DIRECTLY_MUTATES_BECC_DECISION`:** `NO`
* **`GL_CAPABILITY_GAP_001`:** `CONSUMED`
* **`GL_CAPABILITY_GAP_002`:** `OPEN / OUT_OF_SCOPE`
* **`GLOBAL_POLICY_BINDING_IMPLEMENTED`:** `NO`

---

## 4. Verification & Validation Summary

* **BECC Resolver Test Suite:** `PASS` (`becc-runtime/tests/governed-guidance-resolver.test.ts` 13/13 tests PASS)
* **BECC Adapter Test Suite:** `PASS` (`becc-runtime/tests/governed-learning-adapter.test.ts` 13/13 tests PASS)
* **BECC Runtime Build:** `PASS` (`npm run --prefix becc-runtime build`)
* **Governed Learning Package Build:** `PASS` (`npm run --prefix packages/governed-learning build`)
* **Governed Learning Package Tests:** `PASS` (`npm run --prefix packages/governed-learning test` 307/307 tests PASS)
* **Governed Learning PostgreSQL Real Certification:** `PASS` (`npm run --prefix packages/governed-learning test:postgres` 19/19 tests PASS)
* **Root Build:** `PASS` (`npm run build`)
* **Root Lint:** `PASS` (`npm run lint`)
