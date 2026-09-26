# BECC v2 — Work Package Specification & Implementation Certificate
## IMPL-014: Finding → Observation / Learning Escalation Pipeline

* **Work Package ID:** `BECC-V2-IMPL-014`
* **Work Package Name:** Finding → Observation / Learning Escalation Pipeline
* **Workstream ID:** `BRIDGENTA-BECC-V2-PR315-OBSERVATION-IDENTITY-SCOPE-REMEDIATION-01`
* **Implementation Branch:** `feature/becc-v2-impl-014`
* **PR Target:** PR #315 (Unmerged for Independent Re-review)
* **Date:** 2026-09-24
* **Status:** REMEDIATED & CERTIFIED (PR #315 Ready for Independent Re-review)

---

## 1. Executive Summary

This work package implements `becc-runtime/escalation/` (`FindingEscalationService`), establishing the finding-to-observation escalation pipeline for BECC v2 to submit validation findings as governed observations to Governed Learning (`@cep/governed-learning`).

Key Architectural Guarantees & Epistemic Invariants:
1. **Epistemic Invariant:** `Observed != Learned != Approved != Binding Policy`.
2. **Pipeline Boundary:** The escalation pipeline STOPS at `SubmitObservation`. It does NOT create lesson candidates (`CreateLessonCandidate`), approve lessons (`ApproveLesson`), propose rule candidates (`ProposeRuleCandidate`), or adopt rules (`AdoptLesson`).
3. **IMPL-012 Reuse:** Reuses the existing `GovernedLearningIntegrationAdapter` (`becc-runtime/governed-learning/`) for `draftObservation`, `attachEvidence`, and `submitObservation`.
4. **Authoritative Canonical Observation Identity:** `DraftObservation` outcome returned by Governed Learning runtime is the single source of truth for observation identity (`CANONICAL_OBSERVATION_ID_SOURCE: GOVERNED_LEARNING_RUNTIME_RESULT`). Zero BECC-side `obs_${commandId}` string reconstruction exists (`BECC_LOCAL_ID_RECONSTRUCTION: NO`).
5. **Fail-Closed Missing Identity:** If `DraftObservation` succeeds but returns no canonical `observationId`, the escalation pipeline fails closed immediately with category `ERROR` before calling `AttachEvidence` (`SUCCESS_WITHOUT_OBSERVATION_ID_FAILS_CLOSED: PASS`).
6. **Truthful Scope Contract (PATH B):** Governed Learning `DraftObservation`, `AttachEvidence`, and `SubmitObservation` command payload schemas do not accept `projectRef` or `workstreamRef`. Unused scope inputs have been removed from `EscalationRequestInput` (`UNUSED_PROJECT_REF_INPUT: NO`, `UNUSED_WORKSTREAM_REF_INPUT: NO`). Cross-project and cross-workstream isolation claims for escalation are documented truthfully as `NOT_APPLICABLE` (scope resolution is handled downstream at guidance query time in IMPL-013).
7. **Truthful Evidence & Cardinality:** Supports 1..N truthful evidence attachments (`BECCFindingEvidenceInput`). Fails closed on empty or fabricated evidence locations. No synthetic URIs (`file:///unknown`).
8. **Deterministic Command Identity:** Derives SHA256 command IDs for `DraftObservation`, each `AttachEvidence` step, and `SubmitObservation` using `deriveGovernedLearningCommandId`.
9. **Stable `issuedAt` Timestamps:** `issuedAt` is mandatory and caller-supplied; it is preserved across retries to leverage Governed Learning Stage 8 command idempotency.
10. **Consistency & Partial Failure Model:** Consistency is `EVENTUAL_IDEMPOTENT` (not a distributed transaction). Partial failures stop downstream steps and allow clean, idempotent retries.
11. **Zero Database / Persistence Access:** BECC production code contains zero direct database queries, table references (`lessons`, `observations`), or transaction context leakage.
12. **Public API Boundary:** Uses only public exported interfaces of `@cep/governed-learning` (zero deep imports from `packages/governed-learning/src/`).
13. **No Global Policy Binding:** Guidance remains informational governed context (`GL_CAPABILITY_GAP_002` remains open and out of scope).

---

## 2. File Inventory

| File Path | Description |
| :--- | :--- |
| `becc-runtime/escalation/finding-escalation.types.ts` | Escalation DTO definitions: `EscalationRequestInput`, `FindingEscalationResult`, `BECCFindingEvidenceInput`, and `EscalationPipelineStage`. |
| `becc-runtime/escalation/finding-escalation.service.ts` | `FindingEscalationService` implementation orchestrating DraftObservation -> AttachEvidence -> SubmitObservation using returned canonical observation ID strictly. |
| `becc-runtime/escalation/index.ts` | Escalation module public export index. |
| `becc-runtime/governed-learning/governed-learning-adapter.types.ts` | Typed `BECCEscalationResult` containing `observationId?: string` and `observationRef?: { readonly observationId: string }`. |
| `packages/governed-learning/src/runtime/handlers.ts` | Updated `handleDraftObservationCommand` returning canonical `observationId` and `observationRef` in public handler outcome data. |
| `becc-runtime/tests/finding-escalation.test.ts` | Comprehensive test suite verifying pipeline orchestration, multi-evidence handling, missing identity fail closed, static boundary check against local ID reconstruction, and truthful scope claims (14/14 PASS). |

---

## 3. Verified Architecture Parameters

* **`IMPL012_DRAFT_OBSERVATION_CAPABILITY`:** `IMPLEMENTED`
* **`IMPL012_ATTACH_EVIDENCE_CAPABILITY`:** `IMPLEMENTED`
* **`IMPL012_SUBMIT_OBSERVATION_CAPABILITY`:** `IMPLEMENTED`
* **`IMPL014_REUSES_IMPL012_ADAPTER`:** `YES`
* **`CANONICAL_BECC_FINDING_TYPE`:** `ValidationFinding`
* **`CANONICAL_ESCALATION_ELIGIBILITY_RULE_EXISTS`:** `NO`
* **`IMPL014_INVENTS_ESCALATION_POLICY`:** `NO`
* **`DRAFT_RETURNS_CANONICAL_OBSERVATION_ID`:** `YES`
* **`CANONICAL_OBSERVATION_ID_SOURCE`:** `GOVERNED_LEARNING_RUNTIME_RESULT`
* **`BECC_LOCAL_ID_RECONSTRUCTION`:** `NO`
* **`SUCCESS_WITHOUT_OBSERVATION_ID_FAILS_CLOSED`:** `PASS`
* **`ATTACH_EVIDENCE_USES_RETURNED_OBSERVATION_ID`:** `YES`
* **`SUBMIT_OBSERVATION_USES_RETURNED_OBSERVATION_ID`:** `YES`
* **`CANONICAL_OBSERVATION_ID_PROPAGATION_TEST`:** `PASS`
* **`MISSING_DRAFT_OBSERVATION_ID_TEST`:** `PASS`
* **`NO_BECC_OBSERVATION_ID_RECONSTRUCTION_TEST`:** `PASS`
* **`DIRECT_HANDLER_TEST_CLAIMS_STAGE8_REPLAY`:** `NO`
* **`HANDLER_DETERMINISTIC_IDENTITY_TEST`:** `PASS`
* **`FIRST_RUNTIME_DRAFT_RETURNS_CANONICAL_ID`:** `PASS`
* **`REAL_STAGE8_DRAFT_REPLAY`:** `PASS`
* **`STAGE8_REPLAY_PRESERVES_OBSERVATION_ID`:** `PASS`
* **`PUBLIC_OBSERVATION_ID_EQUALS_PERSISTED_ID`:** `PASS`
* **`REPLAY_PERSISTED_IDENTITY_STABLE`:** `PASS`
* **`BECC_EXACT_ESCALATION_RETRY`:** `PASS`
* **`TEST_NAMES_MATCH_ACTUAL_LAYER`:** `YES`
* **`PRODUCTION_CODE_CHANGED`:** `NO`
* **`GL_DRAFT_OBSERVATION_SUPPORTS_PROJECT_SCOPE`:** `NO`
* **`GL_DRAFT_OBSERVATION_SUPPORTS_WORKSTREAM_SCOPE`:** `NO`
* **`PROJECT_SCOPE_SUPPORTED_FOR_ESCALATION`:** `NO`
* **`WORKSTREAM_SCOPE_SUPPORTED_FOR_ESCALATION`:** `NO`
* **`PROJECT_REF_PROPAGATED_TO_GL`:** `NOT_APPLICABLE`
* **`WORKSTREAM_REF_PROPAGATED_TO_GL`:** `NOT_APPLICABLE`
* **`UNUSED_PROJECT_REF_INPUT`:** `NO`
* **`UNUSED_WORKSTREAM_REF_INPUT`:** `NO`
* **`CROSS_PROJECT_ESCALATION_ISOLATION`:** `NOT_APPLICABLE`
* **`CROSS_WORKSTREAM_ESCALATION_ISOLATION`:** `NOT_APPLICABLE`
* **`CROSS_PROJECT_ESCALATION_ISOLATION_TEST`:** `NOT_APPLICABLE`
* **`CROSS_WORKSTREAM_ESCALATION_ISOLATION_TEST`:** `NOT_APPLICABLE`
* **`FABRICATED_EVIDENCE`:** `NO`
* **`FABRICATED_PROVENANCE`:** `NO`
* **`FINDING_TO_OBSERVATION_TRACEABILITY`:** `YES`
* **`DRAFT_COMMAND_ID_DETERMINISTIC`:** `YES`
* **`ATTACH_COMMAND_ID_DETERMINISTIC`:** `YES`
* **`SUBMIT_COMMAND_ID_DETERMINISTIC`:** `YES`
* **`MULTI_EVIDENCE_COMMAND_ID_COLLISION`:** `NO`
* **`DRAFT_ISSUED_AT_STABLE_ON_RETRY`:** `YES`
* **`ATTACH_ISSUED_AT_STABLE_ON_RETRY`:** `YES`
* **`SUBMIT_ISSUED_AT_STABLE_ON_RETRY`:** `YES`
* **`CONSISTENCY_MODEL`:** `EVENTUAL_IDEMPOTENT`
* **`DISTRIBUTED_TRANSACTION_CLAIM`:** `NO`
* **`UNAUTHORIZED_COMPENSATING_MUTATION`:** `NO`
* **`PARTIAL_PIPELINE_REPORTED_AS_SUCCESS`:** `NO`
* **`EXPLICIT_GL_ADAPTER_INJECTION`:** `YES`
* **`SILENT_RUNTIME_FALLBACK`:** `NO`
* **`DEEP_GL_IMPORTS`:** `NO`
* **`BECC_DIRECT_GL_DATABASE_ACCESS`:** `NO`
* **`BECC_DIRECT_GL_TRANSACTION_ACCESS`:** `NO`
* **`BECC_REIMPLEMENTS_GL_STAGE8`:** `NO`
* **`BECC_REIMPLEMENTS_GL_STAGE9`:** `NO`
* **`FABRICATED_ACTOR_REF`:** `NO`
* **`FABRICATED_AUTHORITY_CONTEXT`:** `NO`
* **`UNKNOWN_CONTEXT_BROADENS_TO_SYSTEM_WIDE`:** `NO`
* **`SINGLE_EVIDENCE_ESCALATION`:** `PASS`
* **`MULTI_EVIDENCE_ESCALATION`:** `PASS`
* **`DRAFT_FAILURE_STOPS_PIPELINE`:** `PASS`
* **`ATTACH_FAILURE_STOPS_BEFORE_SUBMIT`:** `PASS`
* **`MULTI_EVIDENCE_PARTIAL_FAILURE`:** `PASS`
* **`SUBMIT_FAILURE_NOT_REPORTED_SUCCESS`:** `PASS`
* **`EXACT_ESCALATION_RETRY`:** `PASS`
* **`PARTIAL_FAILURE_RETRY_IDEMPOTENT`:** `PASS`
* **`IMPL014_GL_DATABASE_BOUNDARY_TEST`:** `PASS`
* **`IMPL014_GL_PUBLIC_API_BOUNDARY_TEST`:** `PASS`
* **`IMPL014_STOPS_AT_SUBMIT_OBSERVATION`:** `PASS`
* **`PIPELINE_CREATES_LESSON_CANDIDATE`:** `NO`
* **`PIPELINE_APPROVES_LESSON`:** `NO`
* **`PIPELINE_PROPOSES_RULE`:** `NO`
* **`PIPELINE_ADOPTS_RULE`:** `NO`
* **`GL_CAPABILITY_GAP_001`:** `CONSUMED`
* **`GL_CAPABILITY_GAP_002`:** `OUT_OF_SCOPE`
* **`GL_CAPABILITY_GAP_003`:** `RESOLVED_AS_BECC_ESCALATION_MAPPING`

---

## 4. Verification & Validation Summary

* **BECC Escalation Pipeline Tests:** `PASS` (`becc-runtime/tests/finding-escalation.test.ts` 14/14 PASS)
* **BECC Knowledge Resolver Tests:** `PASS` (`becc-runtime/tests/governed-guidance-resolver.test.ts` 13/13 PASS)
* **BECC Integration Adapter Tests:** `PASS` (`becc-runtime/tests/governed-learning-adapter.test.ts` 13/13 PASS)
* **BECC Runtime Build:** `PASS` (`npm run --prefix becc-runtime build`)
* **Governed Learning Core Package Build:** `PASS` (`npm run --prefix packages/governed-learning build`)
* **Governed Learning Unit/Concurrency Tests:** `PASS` (`npm run --prefix packages/governed-learning test` 310/310 PASS)
* **Governed Learning PostgreSQL Real Certification:** `PASS` (`npm run --prefix packages/governed-learning test:postgres` 19/19 PASS)
* **Root Build:** `PASS` (`npm run build`)
* **Root Lint:** `PASS` (`npm run lint`)

