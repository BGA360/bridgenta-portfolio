# CEP Stage F — Governed Learning Contract Baseline

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Title** | CEP Stage F — Governed Learning Contract Baseline |
| **Workstream ID** | `CEP-STAGE-F-GOVERNED-LEARNING-CONTRACT-SCHEMA-BOUNDARY-01` |
| **Document Role** | `AUTHORITATIVE_REPOSITORY_SSoT` |
| **Document Status** | `FROZEN` |
| **Baseline Type** | `GOVERNANCE_CONTRACT_BASELINE` |
| **Lifecycle Stage** | `CEP Stage F — Platform Evolution` |
| **Implementation Relationship** | `UPSTREAM_OF_PHYSICAL_IMPLEMENTATION` |
| **Repository SSoT Path** | `docs/governance/governed-learning/governed-learning-contract-baseline.md` |
| **Active Amendments** | [`GL-CONTRACT-AMENDMENT-001`](file:///c:/antigravity/statichtmlpro/fdrefs/docs/governance/governed-learning/governed-learning-contract-amendment-001.md) (Strategy C Lifecycle & Structural Specification Amendment) |

---

## 1. Overview & SSoT Statement

This document is the single, authoritative, repository-resident **Single Source of Truth (SSoT)** for the **Governed Learning** domain contract baseline under **CEP Stage F — Platform Evolution**.

### 1.1 Governance Authority
Per repository and global engineering policy, files within `docs/` serve as the sole authoritative Single Source of Truth for system architecture, domain rules, and contract specifications. Chat memory and session transcripts serve strictly as historical evidence and provenance lineage; they are not persisted governance SSoTs.

### 1.2 Upstream Directionality
The governance hierarchy requires strict upstream-to-downstream derivation:

$$\text{ACCEPTED GOVERNANCE HISTORY} \longrightarrow \text{PERSISTED GOVERNANCE BASELINE} \longrightarrow \text{COMMITTED SSoT} \longrightarrow \text{IMPLEMENTATION VERIFICATION}$$

Physical implementations (`packages/governed-learning/src/`), test suites, or execution artifacts do not define or amend governance baseline rules. The physical implementation must conform to this baseline document and its active amendments.

### 1.3 Active Governance Amendments
This frozen baseline is formally extended and amended by:
- **`GL-CONTRACT-AMENDMENT-001`**: Governed Learning Contract Baseline — Strategy C Lifecycle & Structural Amendment (`docs/governance/governed-learning/governed-learning-contract-amendment-001.md`). Persists Strategy C tri-enum domain separation, candidate identity boundaries (`candidateId`), and 21 R1 property-level structural contract specifications.

---

## 2. Provenance Declaration

1. **Origins**: The Governed Learning contract baseline was developed, negotiated, and accepted across prior governed Antigravity workstreams (including `ADR-CEP-STAGE-F-001`, `CEP-STAGE-F-GOVERNED-LEARNING-DOMAIN-INTEGRITY-02`, and `CEP-STAGE-F-GOVERNED-LEARNING-CONTRACT-SCHEMA-BOUNDARY-01`).
2. **Session Persistence**: Prior to this workstream, the accepted contract baseline existed in session transcript history. This workstream formally persists that accepted baseline into this committed repository artifact.
3. **Zero Redesign**: No contract semantics, identifiers, types, or domain rules have been redesigned, altered, or reconstructed from physical implementation during this persistence workstream.
4. **Authority Transition**: Upon commit of this artifact, this document (`docs/governance/governed-learning/governed-learning-contract-baseline.md`) becomes the primary governing authority for all future contract and schema verification. Session transcripts transition to `HISTORICAL_PROVENANCE_ONLY`.

---

## 3. Master Canonical Contract Catalog

The canonical contract catalog consists of exactly **57** contract specifications (`CTR-GL-001` through `CTR-GL-057`).

| Contract ID | Canonical Name | Semantic Role | Structural Category | Identity / Key Semantics |
| :--- | :--- | :--- | :--- | :--- |
| **CTR-GL-001** | `ObservationRef` | Identity Contract | Semantic Reference | Unique identifier for an ingested domain observation (`observationId`). |
| **CTR-GL-002** | `LessonRef` | Identity Contract | Semantic Reference | Canonical reference to a governance-evaluated lesson learned (`lessonId`). |
| **CTR-GL-003** | `LessonCandidateRef` | Identity Contract | Semantic Reference | Reference to an unverified or candidate lesson (`candidateId`). |
| **CTR-GL-004** | `WorkstreamRef` | Identity Contract | Semantic Reference | Reference to an active or historical workstream context (`workstreamId`). |
| **CTR-GL-005** | `ProjectRef` | Identity Contract | Semantic Reference | Reference to a target project context (`projectId`). |
| **CTR-GL-006** | `DecisionRef` | Identity Contract | Semantic Reference | Canonical identity for a decision record (`decisionId`). |
| **CTR-GL-007** | `EventRef` | Identity Contract | Semantic Reference | Unique event instance reference within append-only log (`eventId`). |
| **CTR-GL-008** | `RuleCandidateProposalRef` | Identity Contract | Semantic Reference | Reference to a proposed rule candidate (`proposalId`). |
| **CTR-GL-009** | `AuthorityContextRef` | Identity Contract | Semantic Reference | Reference to governance authority domain and scope (`authorityId`). |
| **CTR-GL-010** | `FrameworkCriteriaRef` | Identity Pair Contract | Composite Reference | Pairing of `frameworkRef` (required) + `criteriaId` (required) + `criteriaVersion` (optional context). Identity = `frameworkRef` + `criteriaId`. |
| **CTR-GL-011** | `TargetRef` | Target Union Contract | Discriminated Union | Discriminated target union across 9 entity types (`OBSERVATION`, `LESSON`, `LESSON_CANDIDATE`, `WORKSTREAM`, `PROJECT`, `DECISION`, `EVENT`, `RULE_CANDIDATE_PROPOSAL`, `AUTHORITY_CONTEXT`). |
| **CTR-GL-012** | `ObservationRecord` | Domain Payload | Structural Record | Captures mechanical or interpretive domain observations. |
| **CTR-GL-013** | `ObservationIngestedEvent` | Domain Event Payload | Event Contract | Emitted when a raw observation is mechanically recorded. |
| **CTR-GL-014** | `ObservationValidationRecord` | Domain Payload | Structural Record | Documents mechanical or interpretive validation outcomes for an observation. |
| **CTR-GL-015** | `ObservationValidatedEvent` | Domain Event Payload | Event Contract | Emitted when an observation passes validation boundary constraints. |
| **CTR-GL-016** | `ObservationRejectedEvent` | Domain Event Payload | Event Contract | Emitted when an observation fails validation boundary constraints. |
| **CTR-GL-017** | `LessonCandidateRecord` | Domain Payload | Structural Record | Structural contract representing a candidate lesson synthesized from observations. |
| **CTR-GL-018** | `LessonCandidateProposedEvent` | Domain Event Payload | Event Contract | Emitted upon formal proposal of a lesson candidate. |
| **CTR-GL-019** | `LessonCandidateEvaluationRecord` | Domain Payload | Structural Record | Evaluation record assessing evidence, validity, and scope of a lesson candidate. |
| **CTR-GL-020** | `LessonCandidateApprovedEvent` | Domain Event Payload | Event Contract | Emitted when governance authority approves a lesson candidate. |
| **CTR-GL-021** | `LessonCandidateRejectedEvent` | Domain Event Payload | Event Contract | Emitted when a lesson candidate is rejected during governance evaluation. |
| **CTR-GL-022** | `LessonRecord` | Domain Payload | Structural Record | Canonical record representing an approved, versioned, non-binding lesson. |
| **CTR-GL-023** | `LessonPublishedEvent` | Domain Event Payload | Event Contract | Emitted when an approved lesson is published into the learning context. |
| **CTR-GL-024** | `LessonDeprecationRecord` | Domain Payload | Structural Record | Details rationale and scope for deprecating a published lesson. |
| **CTR-GL-025** | `LessonDeprecatedEvent` | Domain Event Payload | Event Contract | Emitted when a lesson is formally deprecated. |
| **CTR-GL-026** | `LessonSupersededEvent` | Domain Event Payload | Event Contract | Emitted when a lesson is superseded by a successor approved lesson. |
| **CTR-GL-027** | `RuleCandidateProposalRecord` | Domain Payload | Structural Record | Captures a rule candidate proposal generated from approved lessons. |
| **CTR-GL-028** | `RuleCandidateSubmittedEvent` | Domain Event Payload | Event Contract | Emitted when a rule candidate proposal is submitted to constitutional authority. |
| **CTR-GL-029** | `RuleCandidateReviewRecord` | Domain Payload | Structural Record | Evaluation record capturing constitutional review of a rule candidate proposal. |
| **CTR-GL-030** | `RuleCandidateApprovedEvent` | Domain Event Payload | Event Contract | Emitted when a rule candidate proposal is approved for prospective adoption. |
| **CTR-GL-031** | `RuleCandidateRejectedEvent` | Domain Event Payload | Event Contract | Emitted when a rule candidate proposal is rejected by authority. |
| **CTR-GL-032** | `ProspectiveAdoptionRecord` | Domain Payload | Structural Record | Captures formal prospective adoption of a rule candidate into a workstream. |
| **CTR-GL-033** | `ProspectiveAdoptionAdoptedEvent` | Domain Event Payload | Event Contract | Emitted when a rule candidate is adoptively linked to a project/workstream. |
| **CTR-GL-034** | `ProspectiveAdoptionWithdrawnRecord` | Domain Payload | Structural Record | Consolidated record contract capturing formal withdrawal of prospective adoption (consolidates former draft record CTR-GL-035). |
| **CTR-GL-035** | `ProspectiveAdoptionWithdrawnEvent` | Domain Event Payload | Event Contract | Canonical event contract emitted when prospective adoption is withdrawn. (Consolidation Note: Event payload retained as canonical CTR-GL-035). |
| **CTR-GL-036** | `LearningContextQuery` | Query Contract | Operational Payload | Query payload specification for retrieving relevant active lessons. |
| **CTR-GL-037** | `LearningContextQueryResult` | Query Result | Operational Payload | Result payload containing ordered, non-binding lessons matching a query. |
| **CTR-GL-038** | `LearningReplayQuery` | Query Contract | Operational Payload | Query contract specifying parameters for historical learning context replay. |
| **CTR-GL-039** | `LearningReplayResult` | Query Result | Operational Payload | Result payload containing reconstructed historical lesson states at a target timestamp/event point. |
| **CTR-GL-040** | `GovernanceEventEnvelope` | Architectural Envelope | Envelope Contract | Generic envelope wrapping domain events (`eventId`, `eventType`, `eventTimestamp`, `payloadVersion`, `payload`, `producerId`). |
| **CTR-GL-041** | `GovernanceCommandEnvelope` | Architectural Envelope | Envelope Contract | Generic envelope wrapping domain commands (`commandId`, `commandType`, `commandTimestamp`, `payloadVersion`, `payload`, `requesterId`). |
| **CTR-GL-042** | `SubmitObservationCommand` | Command Payload | Command Contract | Command requesting ingestion of a domain observation. |
| **CTR-GL-043** | `ValidateObservationCommand` | Command Payload | Command Contract | Command requesting validation evaluation of an observation. |
| **CTR-GL-044** | `ProposeLessonCandidateCommand` | Command Payload | Command Contract | Command requesting creation of a lesson candidate. |
| **CTR-GL-045** | `EvaluateLessonCandidateCommand` | Command Payload | Command Contract | Command requesting governance review of a lesson candidate. |
| **CTR-GL-046** | `PublishLessonCommand` | Command Payload | Command Contract | Command requesting publication of an approved lesson candidate. |
| **CTR-GL-047** | `DeprecateLessonCommand` | Command Payload | Command Contract | Command requesting deprecation of an active lesson. |
| **CTR-GL-048** | `SupersedeLessonCommand` | Command Payload | Command Contract | Command requesting supersession of a lesson by a successor. |
| **CTR-GL-049** | `SubmitRuleCandidateCommand` | Command Payload | Command Contract | Command submitting a rule candidate proposal. |
| **CTR-GL-050** | `ReviewRuleCandidateCommand` | Command Payload | Command Contract | Command requesting constitutional review of a rule candidate proposal. |
| **CTR-GL-051** | `AdoptRuleCandidateCommand` | Command Payload | Command Contract | Command requesting prospective adoption of a rule candidate. |
| **CTR-GL-052** | `WithdrawRuleCandidateAdoptionCommand` | Command Payload | Command Contract | Command requesting withdrawal of prospective adoption. |
| **CTR-GL-053** | `QueryLearningContextCommand` | Command Payload | Command Contract | Command initiating a learning context query. |
| **CTR-GL-054** | `ReplayLearningContextCommand` | Command Payload | Command Contract | Command requesting historical learning context replay. |
| **CTR-GL-055** | `GovernancePersistencePort` | Infrastructure Port | Architectural Interface | Port contract defining shared persistence interfaces used by Governed Learning module. |
| **CTR-GL-056** | `HistoricalEventPreservationEnvelope` | Historical Envelope | Preservation Contract | Opaque preservation envelope contract for uninterpretable or unsupported historical event payloads. |
| **CTR-GL-057** | `HistoricalCommandPreservationEnvelope` | Historical Envelope | Preservation Contract | Opaque preservation envelope contract for unsupported historical command payloads. |

---

## 4. Non-Contract Type Registry

The non-contract type registry defines technical types, primitives, semantic aliases, and helpers separate from canonical contract specifications ($\text{CANONICAL\_CONTRACT} \neq \text{NON\_CONTRACT\_TYPE}$). Total count: **49**.

### 4.1 Semantic ID & String Aliases (25)
1. `ObservationId`: Non-empty string uniquely identifying an observation.
2. `LessonId`: Non-empty string uniquely identifying a lesson.
3. `LessonCandidateId`: Non-empty string uniquely identifying a lesson candidate.
4. `WorkstreamId`: Non-empty string uniquely identifying a workstream.
5. `ProjectId`: Non-empty string uniquely identifying a project.
6. `DecisionId`: Non-empty string uniquely identifying a decision record.
7. `EventId`: Non-empty string uniquely identifying an event instance.
8. `RuleCandidateProposalId`: Non-empty string uniquely identifying a rule candidate proposal.
9. `AuthorityContextId`: Non-empty string uniquely identifying an authority context.
10. `FrameworkId`: Non-empty string identifying a governing framework.
11. `CriteriaId`: Non-empty string identifying evaluation criteria.
12. `CriteriaVersion`: Non-empty string specifying criteria version context.
13. `ProducerId`: Non-empty string identifying event producer component/agent.
14. `RequesterId`: Non-empty string identifying command requester component/agent.
15. `CommandId`: Non-empty string uniquely identifying a command instance.
16. `TimestampIso8601`: String conforming to ISO 8601 UTC timestamp format.
17. `VersionValue`: Generic non-empty string representing version metadata.
18. `RationaleText`: Non-empty explanatory narrative string.
19. `SummaryText`: Concise textual summary string.
20. `EvidenceUri`: Valid URI string pointing to evidence artifact.
21. `SchemaName`: Identifier string for schema definitions.
22. `PayloadVersionString`: Version string for envelope payload schemas.
23. `EventTypeName`: Discriminator string for governance event types.
24. `CommandTypeName`: Discriminator string for governance command types.
25. `RuleId`: Identifier string for constitutional/framework rules.

### 4.2 Non-Contract Technical & Domain Enums (20)
1. `ObservationCategoryEnum`: Categories of observations (`MECHANICAL`, `INTERPRETIVE`, `HYBRID`).
2. `ObservationValidationOutcomeEnum`: Outcome states for observation validation (`VALIDATED`, `REJECTED`, `PENDING`).
3. `LessonStatusEnum`: Lifecycle states for lessons (`CANDIDATE`, `APPROVED`, `PUBLISHED`, `DEPRECATED`, `SUPERSEDED`).
4. `LessonDeprecationReasonEnum`: Reasons for lesson deprecation (`SUPERSEDED`, `OUTDATED`, `INVALIDATED`, `CONTRADICTED`).
5. `ProposalStatusEnum`: Lifecycle states for rule proposals (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `WITHDRAWN`).
6. `ReviewOutcomeEnum`: Constitutional review decisions (`APPROVED`, `REJECTED`, `REVISION_REQUESTED`).
7. `AdoptionStatusEnum`: States of prospective adoption (`ADOPTED`, `WITHDRAWN`, `EXPIRED`).
8. `TargetTypeEnum`: Target discriminator types (`OBSERVATION`, `LESSON`, `LESSON_CANDIDATE`, `WORKSTREAM`, `PROJECT`, `DECISION`, `EVENT`, `RULE_CANDIDATE_PROPOSAL`, `AUTHORITY_CONTEXT`).
9. `RefusalCodeEnum`: Domain refusal codes (20 codes; see Section 5).
10. `GovernanceEventTypeEnum`: Discriminator enum listing all governance event type names.
11. `GovernanceCommandTypeEnum`: Discriminator enum listing all governance command type names.
12. `EventSchemaDispatchOutcomeEnum`: Parser outcome codes for event schemas (`VALID_SUPPORTED`, `UNSUPPORTED_VERSION`, `UNKNOWN_EVENT_TYPE`, `MALFORMED_PAYLOAD`).
13. `CommandSchemaDispatchOutcomeEnum`: Parser outcome codes for command schemas (`VALID_SUPPORTED`, `UNSUPPORTED_VERSION`, `UNKNOWN_COMMAND_TYPE`, `MALFORMED_PAYLOAD`).
14. `HistoricalPreservationReasonEnum`: Reasons for opaque preservation (`UNKNOWN_TYPE`, `UNSUPPORTED_VERSION`).
15. `HistoricalEventBranchTypeEnum`: Event branch dispatch classification (`TYPED_SUPPORTED`, `OPAQUE_PRESERVED`).
16. `HistoricalCommandBranchTypeEnum`: Command branch dispatch classification (`TYPED_SUPPORTED`, `OPAQUE_PRESERVED`).
17. `ObservationValidationBoundaryEnum`: Boundary modes (`MECHANICAL_ONLY`, `INTERPRETIVE_ONLY`, `HYBRID`).
18. `LearningAuthorityLevelEnum`: Governance authority tiers (`INFORMATIONAL`, `ADVISORY`, `CONSTITUTIONAL_MANDATE`).
19. `PersistenceOperationOutcomeEnum`: Outcome codes for persistence operations (`SUCCESS`, `KEY_CONFLICT`, `UNAVAILABLE`).
20. `GovernanceStageEnum`: Platform lifecycle stage classification (`STAGE_F_EVOLUTION`).

### 4.3 Opaque Payload & Technical Generic Utilities (4)
1. `OpaquePayload`: Unknown or unparsed payload object (`Record<string, unknown>`).
2. `EnvelopePayloadUnion`: Discriminated union of typed payload structures.
3. `TypedDispatchOutcome`: Helper generic wrapping successfully parsed payloads.
4. `PreservedDispatchOutcome`: Helper generic wrapping opaques preserved payloads.

---

## 5. RefusalCodeEnum Specification

Domain refusal codes represent domain-level enforcement decisions. They are strictly separate from parser or schema validation outcomes ($\text{SCHEMA\_OUTCOME} \neq \text{DOMAIN\_REFUSAL}$). The catalog contains exactly **20** domain refusal codes.

```
RefusalCodeEnum =
  | REFUSAL_UNVALIDATED_OBSERVATION
  | REFUSAL_INSUFFICIENT_EVIDENCE
  | REFUSAL_SCOPE_MISMATCH
  | REFUSAL_CONTRADICTS_EXISTING_RULE
  | REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED
  | REFUSAL_LESSON_NOT_APPROVED
  | REFUSAL_LESSON_ALREADY_DEPRECATED
  | REFUSAL_LESSON_ALREADY_SUPERSEDED
  | REFUSAL_CIRCULAR_SUPERCOGNITION
  | REFUSAL_PROPOSAL_EXPIRED
  | REFUSAL_ADOPTION_TARGET_INVALID
  | REFUSAL_ADOPTION_WITHDRAWAL_UNAUTHORIZED
  | REFUSAL_REPLAY_TIMESTAMP_FUTURE
  | REFUSAL_REPLAY_BOUNDS_EXCEEDED
  | REFUSAL_NON_BINDING_OVERRIDE_ATTEMPT
  | REFUSAL_BACKDATED_EFFECTIVE_TIME
  | REFUSAL_HISTORICAL_MUTATION_DENIED
  | REFUSAL_PERSISTENCE_PORT_UNAVAILABLE
  | REFUSAL_INVARIANT_VIOLATION
  | REFUSAL_GOVERNANCE_LOCKOUT
```

---

## 6. FrameworkCriteriaRef & TargetRef Semantics

### 6.1 FrameworkCriteriaRef (`CTR-GL-010`)
- `frameworkRef`: Required non-empty string referencing the governing framework.
- `criteriaId`: Required non-empty string referencing specific evaluation criteria.
- `criteriaVersion`: Optional string supplying version context.
- **Identity Semantics**: Entity identity is defined exclusively by `frameworkRef + criteriaId`. `criteriaVersion` provides evaluative version context, not identity.

### 6.2 TargetRef (`CTR-GL-011`)
`TargetRef` is a discriminated union over `targetType`. Target identity preservation rules:
- `OBSERVATION`: `observationId`
- `LESSON`: `lessonId` (preserves exact `LessonRef` identity)
- `LESSON_CANDIDATE`: `candidateId`
- `WORKSTREAM`: `workstreamId`
- `PROJECT`: `projectId`
- `DECISION`: `decisionId`
- `EVENT`: `eventId`
- `RULE_CANDIDATE_PROPOSAL`: `proposalId`
- `AUTHORITY_CONTEXT`: `authorityId`

---

## 7. Version & Envelope Identity Semantics

### 7.1 Separation of Version Scope
- $\text{ENTITY\_VERSION} \neq \text{PAYLOAD\_SCHEMA\_VERSION}$
- $\text{EVENT\_IDENTITY} \neq \text{EVENT\_PAYLOAD\_SCHEMA\_VERSION}$
- $\text{COMMAND\_IDENTITY} \neq \text{COMMAND\_PAYLOAD\_SCHEMA\_VERSION}$
- $\text{PAYLOAD\_SCHEMA\_VERSION} \neq \text{STREAM\_VERSION}$

### 7.2 Version Value Format
`VersionValue` is specified as a generic, non-empty string. Specific SemVer policies are not imposed at the base contract level.

### 7.3 Envelope Identity
- **GovernanceEventEnvelope (`CTR-GL-040`)**: `eventId` constitutes event instance identity. `payloadVersion` is schema metadata used for dispatch.
- **GovernanceCommandEnvelope (`CTR-GL-041`)**: `commandId` constitutes command instance identity. `payloadVersion` is schema metadata used for dispatch.

---

## 8. Historical Preservation & Schema Dispatch Semantics

Historical event and command streams must maintain absolute preservation without throwing parse errors on historical versions.

| Dispatch Scenario | Type Recognized? | Version Supported? | Payload Valid? | Resulting Handling |
| :--- | :--- | :--- | :--- | :--- |
| **Unknown Event/Command Type** | No | N/A | N/A | Preserved in `HistoricalEventPreservationEnvelope` (`CTR-GL-056`) / `HistoricalCommandPreservationEnvelope` (`CTR-GL-057`) with `UNKNOWN_TYPE`. |
| **Known Type + Unsupported Version** | Yes | No | N/A | Preserved in `HistoricalEventPreservationEnvelope` (`CTR-GL-056`) / `HistoricalCommandPreservationEnvelope` (`CTR-GL-057`) with `UNSUPPORTED_VERSION`. |
| **Known Type + Supported Version + Valid Payload** | Yes | Yes | Yes | Successfully parsed into typed payload (`TYPED_SUPPORTED`). |
| **Known Type + Supported Version + Invalid Payload** | Yes | Yes | No | Hard Schema Parse Error ($\text{KNOWN\_SUPPORTED\_INVALID\_PAYLOAD} \neq \text{UNSUPPORTED\_VERSION}$). |

---

## 9. Observation Boundary & Authority Rules

### 9.1 Observation Validation Boundary
- **Mechanical Validation**: Deterministic check of structural, syntactical, and schema constraints.
- **Interpretive Validation**: Evaluation of semantic validity, evidence sufficiency, and contextual relevance.
- `HYBRID`: Category classification for observations containing both mechanical telemetry and human/AI interpretive narrative.
- $\text{SCHEMA\_VALIDATION} \neq \text{AUTHORITY\_VALIDATION}$: Passing schema validation does not constitute governance authorization. AI systems do not self-authorize interpretive governance conclusions.

### 9.2 Learning Authority Rules
- $\text{LEARNING} \neq \text{AUTHORITY}$
- $\text{OBSERVATION} \neq \text{LESSON}$
- $\text{LESSON} \neq \text{RULE}$
- $\text{RULE\_CANDIDATE} \neq \text{APPROVED\_RULE}$
- $\text{APPROVED\_LESSON} = \text{NON\_BINDING}$
- Retrieved lessons provide non-binding advisory context and never override active constitutional rules or higher-authority mandates.
- Active workstreams require prospective adoption before rule candidates become binding constraints.

---

## 10. Append-Only Governance Lifecycle & Replay Semantics

### 10.1 Append-Only Log Rules
- Historical event state is immutable. In-place mutation of event payloads or historical meanings is forbidden.
- Supersession, deprecation, and adoption occur exclusively through subsequent append-only events (`LessonSupersededEvent`, `LessonDeprecatedEvent`, `ProspectiveAdoptionAdoptedEvent`, `ProspectiveAdoptionWithdrawnEvent`).
- `effectiveUntil` timestamps are derived state from subsequent events, never mutated in-place.
- Backdated effective timestamps are strictly prohibited (`REFUSAL_BACKDATED_EFFECTIVE_TIME`).

### 10.2 Historical Replay Boundary
- `HISTORICAL_LEARNING_CONTEXT_REPLAY_SUPPORTED`: Historical queries can reconstruct non-binding lesson context at any historical timestamp/event sequence.
- $\text{HISTORICAL\_LEARNING\_CONTEXT\_REPLAY} \neq \text{COMPLETE\_WORKSTREAM\_REPLAY}$: Learning replay reconstructs knowledge state, not complete runtime workstream execution.

---

## 11. Shared Governance Persistence Boundary

- Governed Learning application module **USES** the shared `GovernancePersistencePort` (`CTR-GL-055`).
- Infrastructure storage adapters **IMPLEMENT** `GovernancePersistencePort`.
- Certification and Governed Learning contexts may share infrastructure persistence implementations without sharing domain semantics ($\text{SHARED\_INFRASTRUCTURE} \neq \text{SHARED\_DOMAIN\_MEANING}$).

---

## 12. Complete Domain Invariant Register (`INV-GL-001` through `INV-GL-062`)

The domain contract baseline enforces 62 explicit domain invariants.

1. **`INV-GL-001`**: Every observation must possess a valid, non-empty `ObservationRef`.
2. **`INV-GL-002`**: Unvalidated observations cannot be referenced as valid evidence for a lesson candidate.
3. **`INV-GL-003`**: Ingestion of an observation must emit `ObservationIngestedEvent`.
4. **`INV-GL-004`**: Mechanical validation failure must emit `ObservationRejectedEvent`.
5. **`INV-GL-005`**: Mechanical validation success must emit `ObservationValidatedEvent`.
6. **`INV-GL-006`**: Interpretive validation must reference an explicit `AuthorityContextRef`.
7. **`INV-GL-007`**: AI self-authorization of interpretive validation without authority context is prohibited.
8. **`INV-GL-008`**: Lesson candidates require at least one validated `ObservationRef`.
9. **`INV-GL-009`**: Proposal of a lesson candidate must emit `LessonCandidateProposedEvent`.
10. **`INV-GL-010`**: Evaluation of a lesson candidate must produce a `LessonCandidateEvaluationRecord`.
11. **`INV-GL-011`**: Rejection of a lesson candidate must emit `LessonCandidateRejectedEvent`.
12. **`INV-GL-012`**: Approval of a lesson candidate must emit `LessonCandidateApprovedEvent`.
13. **`INV-GL-013`**: Only approved lesson candidates can transition into published lessons.
14. **`INV-GL-014`**: Publication of a lesson must generate a canonical `LessonRecord` and emit `LessonPublishedEvent`.
15. **`INV-GL-015`**: Published lessons are strictly non-binding advisory context.
16. **`INV-GL-016`**: Lessons cannot override constitutional rules or higher-authority policy documents.
17. **`INV-GL-017`**: Deprecation of a lesson requires a `LessonDeprecationRecord`.
18. **`INV-GL-018`**: Deprecation of a lesson must emit `LessonDeprecatedEvent`.
19. **`INV-GL-019`**: Deprecated lessons cannot be returned as active advisory lessons in standard context queries.
20. **`INV-GL-020`**: Supersession of a lesson must emit `LessonSupersededEvent` referencing the successor `LessonRef`.
21. **`INV-GL-021`**: Circular supersession chains are prohibited (`REFUSAL_CIRCULAR_SUPERCOGNITION`).
22. **`INV-GL-022`**: A superseded lesson is automatically marked as inactive for forward queries.
23. **`INV-GL-023`**: Rule candidate proposals must derive from at least one approved `LessonRef`.
24. **`INV-GL-024`**: Submission of a rule candidate proposal must emit `RuleCandidateSubmittedEvent`.
25. **`INV-GL-025`**: Constitutional review of a rule candidate proposal must generate `RuleCandidateReviewRecord`.
26. **`INV-GL-026`**: Rejection of a rule candidate proposal must emit `RuleCandidateRejectedEvent`.
27. **`INV-GL-027`**: Approval of a rule candidate proposal must emit `RuleCandidateApprovedEvent`.
28. **`INV-GL-028`**: Approved rule candidate proposals do not alter project governance until prospectively adopted.
29. **`INV-GL-029`**: Prospective adoption requires specifying explicit `ProjectRef` or `WorkstreamRef`.
30. **`INV-GL-030`**: Adoption of a rule candidate must emit `ProspectiveAdoptionAdoptedEvent`.
31. **`INV-GL-031`**: Adoption withdrawal must produce `ProspectiveAdoptionWithdrawnRecord` and emit `ProspectiveAdoptionWithdrawnEvent`.
32. **`INV-GL-032`**: Retrospective or backdated prospective adoption is prohibited.
33. **`INV-GL-033`**: Learning context queries (`LearningContextQuery`) must specify target scope (`TargetRef`).
34. **`INV-GL-034`**: Learning context query results (`LearningContextQueryResult`) must order lessons deterministically by relevance and recency.
35. **`INV-GL-035`**: Historical learning replay (`LearningReplayQuery`) must support target timestamp/event offset reconstructability.
36. **`INV-GL-036`**: Replay queries specifying future timestamps must be refused (`REFUSAL_REPLAY_TIMESTAMP_FUTURE`).
37. **`INV-GL-037`**: Governance event log is append-only; in-place payload updates are prohibited.
38. **`INV-GL-038`**: Governance command log is append-only.
39. **`INV-GL-039`**: `GovernanceEventEnvelope` must contain valid `eventId`, `eventType`, `eventTimestamp`, `payloadVersion`, `payload`, `producerId`.
40. **`INV-GL-040`**: `GovernanceCommandEnvelope` must contain valid `commandId`, `commandType`, `commandTimestamp`, `payloadVersion`, `payload`, `requesterId`.
41. **`INV-GL-041`**: Event envelopes with unknown `eventType` must be opaquely preserved via `HistoricalEventPreservationEnvelope`.
42. **`INV-GL-042`**: Command envelopes with unknown `commandType` must be opaquely preserved via `HistoricalCommandPreservationEnvelope`.
43. **`INV-GL-043`**: Event envelopes with unsupported `payloadVersion` must be opaquely preserved via `HistoricalEventPreservationEnvelope`.
44. **`INV-GL-044`**: Command envelopes with unsupported `payloadVersion` must be opaquely preserved via `HistoricalCommandPreservationEnvelope`.
45. **`INV-GL-045`**: Envelopes with supported versions but malformed payloads must trigger hard schema validation errors.
46. **`INV-GL-046`**: Parser/schema dispatch outcomes are strictly isolated from domain refusal codes.
47. **`INV-GL-047`**: `FrameworkCriteriaRef` identity equals `frameworkRef + criteriaId`.
48. **`INV-GL-048`**: `TargetRef` must evaluate to one of the 9 authorized target entity types.
49. **`INV-GL-049`**: Entity version identifiers are distinct from envelope payload schema versions.
50. **`INV-GL-050`**: Event instance identity equals `eventId` only.
51. **`INV-GL-051`**: Command instance identity equals `commandId` only.
52. **`INV-GL-052`**: `VersionValue` must be a non-empty string.
53. **`INV-GL-053`**: All domain timestamps must be valid ISO 8601 UTC strings.
54. **`INV-GL-054`**: Governed Learning uses `GovernancePersistencePort` without mutating port abstractions.
55. **`INV-GL-055`**: Infrastructure adapters implementing `GovernancePersistencePort` must preserve append-only invariants.
56. **`INV-GL-056`**: Refusal code count equals exactly 20.
57. **`INV-GL-057`**: Canonical contract count equals exactly 57.
58. **`INV-GL-058`**: Non-contract type registry count equals exactly 49.
59. **`INV-GL-059`**: Schema design remains strictly downstream of this contract baseline.
60. **`INV-GL-060`**: Implementation source files remain strictly downstream of this contract baseline.
61. **`INV-GL-061`**: Open non-blocking governance items do not impede contract baseline freeze.
62. **`INV-GL-062`**: Contract catalog traceability requires complete coverage across all 57 CTR-GL contracts.

---

## 13. Open Non-Blocking Items

The following governance items remain open and tracked for future evolution workstreams. They do not block the frozen contract baseline.

- `ADOPTION_WITHDRAWAL_SEMANTICS`: Refinement of workstream-level propagation when prospective adoption is withdrawn mid-sprint (`OPEN_NON_BLOCKING`).
- `PROVENANCE_AUTHENTICITY_VERIFICATION`: Cryptographic verification of producer signatures on event envelopes (`OPEN_NON_BLOCKING`).
- `SUCCESSOR_SCOPE_LINEAGE_SEMANTICS`: Semantic scope contraction rules when a successor lesson narrow its target applicability (`OPEN_NON_BLOCKING`).

---

## 14. Downstream Implementation Relationship Metadata

The physical implementation of this contract baseline is recorded for downstream traceability:

- **Implementation Branch**: `feature/governed-learning-schema-implementation`
- **Implementation Commit**: `ca399c069cec0ab84869604aa4892d431a0a17aa`
- **Implementation Status**: `LOCAL / NOT PUSHED`
- **Verification Requirement**: Implementation fidelity will be independently verified in workstream `CEP-STAGE-F-GOVERNED-LEARNING-SSOT-TO-IMPLEMENTATION-VERIFICATION-01`.

---

## 15. Governance Lineage Provenance Appendix

| Predecessor Workstream ID | Role & Contribution | Status |
| :--- | :--- | :--- |
| `ADR-CEP-STAGE-F-001` | Established Stage F Platform Evolution domain boundaries & Governed Learning charter. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-DOMAIN-INTEGRITY-02` | Defined domain entities, non-binding lesson semantics, authority rules. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-CONTRACT-SPECIFICATION-01` | Formulated initial CTR-GL catalog definitions. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-CONTRACT-TYPE-REFERENCE-INTEGRITY-01` | Verified cross-type reference integrity across contracts. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-CONTRACT-CONSOLIDATION-01` | Consolidated CTR-GL-035 record into CTR-GL-034. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-CONTRACT-SCHEMA-BOUNDARY-01` | Freeze baseline specification establishing 57 CTR-GL contracts. | Accepted (Baseline Target) |
| `CEP-STAGE-F-GOVERNED-LEARNING-SCHEMA-DESIGN-01` | Designed Zod schema mapping downstream of contract baseline. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-SCHEMA-INTEGRITY-01` | Corrected envelope, payload versioning, and refusal code isolation. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-SCHEMA-CLOSURE-01` | Schema closure and invariant alignment pass. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-SCHEMA-VERSION-DISPATCH-01` | Authoritative version dispatch matrix and historical preservation rules. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-SCHEMA-IMPLEMENTATION-BOUNDARY-01` | Decoupled payload versions and finalized 20 refusal codes. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-SCHEMA-FREEZE-INTEGRITY-01` | Final freeze integrity and parameterization check. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-FROZEN-CONTRACT-CATALOG-AUTHORITY-AUDIT-01` | Read-only authority audit confirming 57 CTR-GL canonical contracts. | Accepted |
| `CEP-STAGE-F-GOVERNED-LEARNING-SOT-PROVENANCE-AUDIT-01` | Provenance audit establishing `SOT_GOVERNANCE_DEFECT: YES` (transcript-only baseline requiring persistence under `docs/`). | Accepted |

*Transcript Session Evidence Identifier*: `10203b43-9d5a-4790-abed-d08e3cdfb79f` (Historical Antigravity governance session evidence).
