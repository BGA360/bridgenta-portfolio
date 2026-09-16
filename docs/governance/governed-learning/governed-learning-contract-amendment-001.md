# Governed Learning Contract Baseline — Strategy C Lifecycle & Structural Amendment

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Title** | Governed Learning Contract Baseline — Strategy C Lifecycle & Structural Amendment |
| **Amendment ID** | `GL-CONTRACT-AMENDMENT-001` |
| **Workstream ID** | `BRIDGENTA-GOVERNED-LEARNING-GOVERNANCE-EVOLUTION-AC-01` |
| **Document Role** | `AUTHORITATIVE_GOVERNANCE_AMENDMENT` |
| **Document Status** | `ACTIVE` |
| **Baseline Target Document** | `docs/governance/governed-learning/governed-learning-contract-baseline.md` |
| **Provenance Workstreams** | `BRIDGENTA-GOVERNED-LEARNING-CONTRACT-IDENTITY-RECONCILIATION-01`<br>`BRIDGENTA-GOVERNED-LEARNING-CONTRACT-RECONCILIATION-R1-REVIEW-01` |
| **Owner Authorization** | Decision Path A+C Approved (Owner Ratified 2026-09-16) |

---

## 1. Executive Summary & Authority Statement

This document formally amends and extends the frozen repository SSoT baseline `docs/governance/governed-learning/governed-learning-contract-baseline.md`.

Per global engineering policy, this amendment constitutes persisted repository governance. It supersedes all unpersisted conversation directives and establishes the authoritative domain model, candidate identity boundaries, and property-level structural contract specifications for Governed Learning R1 contract reconciliation.

---

## 2. Strategy C — Binding Domain Model

### 2.1 Lesson Candidate Review Layer
The candidate evaluation lifecycle is strictly decoupled from published non-binding lessons.

- **Authoritative Candidate Statuses (`LessonCandidateStatusEnum`)**:
  - `CANDIDATE`: Candidate lesson synthesized from validated observations.
  - `IN_REVIEW`: Currently under governance evaluation.
  - `APPROVED`: Governance evaluation passed; candidate is eligible for publication.
  - `REJECTED`: Candidate evaluation failed governance criteria.
  - `REVISION_REQUESTED`: Returned to author for evidence or scope revision.

$$\text{APPROVED CANDIDATE} \neq \text{PUBLISHED LESSON}$$

Approval certifies eligibility for publication. Approval alone does not constitute publication or forward-query eligibility.

### 2.2 Published Advisory Lesson Layer
The published advisory lesson lifecycle governs forward advisory query eligibility.

- **Authoritative Published Lesson Statuses (`PublishedLessonStatusEnum`)**:
  - `PUBLISHED`: Active advisory lesson eligible for standard forward learning-context query.
  - `DEPRECATED`: Inactive lesson formally deprecated with documented rationale; excluded from forward queries.
  - `SUPERSEDED`: Inactive lesson replaced by a successor lesson; excluded from forward queries.

Published lessons remain strictly `NON_BINDING` and `ADVISORY` context (`INV-GL-015`).

**Explicitly Excluded States**: `ADOPTED`, `RETIRED`, `APPROVED`, `CANDIDATE`, `IN_REVIEW`, `REJECTED`, and `REVISION_REQUESTED` are **NOT** valid states of a published `LessonRecord`.

### 2.3 Rule Candidate Layer
Rule candidates remain a distinct domain layer (`CTR-GL-027` through `CTR-GL-031`). Rule candidate proposals derive from approved published lessons, but rule candidate review and prospective adoption are **NOT** encoded into `LessonRecord` lifecycle.

### 2.4 Prospective Adoption Layer
Prospective adoption applies strictly to a **Rule Candidate** bindable to a **Project or Workstream Context** (`CTR-GL-032`).

- **Authoritative Adoption Statuses (`ProspectiveAdoptionStatusEnum`)**:
  - `ADOPTED`: Rule candidate prospectively adopted into project/workstream context.
  - `WITHDRAWN`: Prospective adoption formally withdrawn.
  - `EXPIRED`: Prospective adoption context expired.

$$\text{LESSON\_ADOPTION} = \text{NON\_CANONICAL}$$
$$\text{RULE\_CANDIDATE\_PROSPECTIVE\_ADOPTION} = \text{CANONICAL}$$

---

## 3. Binding Identity & Field Boundary Decisions

### 3.1 Candidate Identity Boundary (`candidateId`)
- **Canonical Candidate Identity**: `candidateId` (`LessonCandidateId`).
- A lesson candidate MUST NOT acquire `lessonId` prior to publication.
- `LessonCandidateRef` (`CTR-GL-003`) identity field = `candidateId`.
- `LessonCandidateRecord` (`CTR-GL-017`) identity field = `candidateId`.
- **Conceptual Lifecycle Transition**:
  $$\text{LessonCandidateRecord}(\text{candidateId}) \xrightarrow{\text{approval}} \text{PublishLessonCommand} \xrightarrow{\text{publication}} \text{LessonRecord}(\text{lessonId})$$

$$\text{candidateId} \neq \text{lessonId}$$

### 3.2 Removal of `prospectiveOnly` From `LessonRecord`
- `LessonRecord.prospectiveOnly` is **EXCLUDED** from the canonical `LessonRecord` specification.
- Published lessons are non-binding advisory context (`nonBinding: true`). Prospective adoption applies strictly to rule candidates (`ProspectiveAdoptionRecord`).

### 3.3 TargetRef Identity Alignment (`CTR-GL-011`)
Canonical target reference identity keys for discriminated union targets:
- `OBSERVATION`: `observationId` (`ObservationRef`)
- `LESSON`: `lessonId` + `version` (`LessonRef`)
- `LESSON_CANDIDATE`: `candidateId` (`LessonCandidateRef`)
- `WORKSTREAM`: `workstreamId` (`WorkstreamRef`)
- `PROJECT`: `projectId` (`ProjectRef`)
- `DECISION`: `decisionId` (`DecisionRef`)
- `EVENT`: `eventId` (`EventRef`)
- `RULE_CANDIDATE_PROPOSAL`: `proposalId` (`RuleCandidateProposalRef`)
- `AUTHORITY_CONTEXT`: `authorityId` (`AuthorityContextRef`)

### 3.4 AuthorityContextRef Identity Alignment (`CTR-GL-009`)
- `AuthorityContextRef` identity field = `authorityId` (`AuthorityContextId`). Reconciles physical property naming across envelopes and context records.

---

## 4. Historical Compatibility Boundary

Historical physical records from prior legacy implementations (containing values such as `APPROVED`, `RETIRED`, `ADOPTED`) are handled strictly at the runtime historical replay boundary (R3).

$$\text{HISTORICAL\_COMPATIBILITY\_MODEL} \neq \text{CANONICAL\_NEW\_WRITE\_MODEL}$$

1. Canonical new-write enums contain ONLY canonical Strategy C values (`PUBLISHED`, `DEPRECATED`, `SUPERSEDED` for published lessons; `CANDIDATE`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `REVISION_REQUESTED` for candidate evaluation; `ADOPTED`, `WITHDRAWN`, `EXPIRED` for adoption).
2. Historical values (`RETIRED`, `ADOPTED`, `APPROVED` as lesson state) MUST NOT be added to canonical new-write enums.

---

## 5. R1 Property-Level Structural Contract Specifications

The following 21 canonical contracts constitute the complete in-scope structural contract specification required for R1 physical schema implementation.

### 5.1 Identity & Reference Contracts

#### CTR-GL-001: ObservationRef
- **Canonical Name**: `ObservationRef`
- **Purpose**: Canonical identity reference for an ingested domain observation.
- **Identity Field**: `observationId` (`ObservationId`)
- **Required Fields**: `observationId: ObservationId`
- **Optional Fields**: None
- **Invariants**: `INV-GL-001`
- **Field Provenance**: `DIRECT_EXISTING_SSOT`

#### CTR-GL-002: LessonRef
- **Canonical Name**: `LessonRef`
- **Purpose**: Version-qualified identity reference for a published lesson.
- **Identity Field**: `lessonId` (`LessonId`), `version` (`VersionValue`)
- **Required Fields**: `lessonId: LessonId`, `version: VersionValue`
- **Optional Fields**: None
- **Invariants**: `INV-GL-014`, `INV-GL-049`
- **Field Provenance**: `DIRECT_EXISTING_SSOT`

#### CTR-GL-003: LessonCandidateRef
- **Canonical Name**: `LessonCandidateRef`
- **Purpose**: Identity reference for an unverified or candidate lesson proposal.
- **Identity Field**: `candidateId` (`LessonCandidateId`)
- **Required Fields**: `candidateId: LessonCandidateId`
- **Optional Fields**: None
- **Invariants**: `INV-GL-008`, `INV-GL-009`
- **Field Provenance**: `DIRECT_EXISTING_SSOT`

#### CTR-GL-008: RuleCandidateProposalRef
- **Canonical Name**: `RuleCandidateProposalRef`
- **Purpose**: Identity reference for a proposed rule candidate.
- **Identity Field**: `proposalId` (`RuleCandidateProposalId`)
- **Required Fields**: `proposalId: RuleCandidateProposalId`
- **Optional Fields**: None
- **Invariants**: `INV-GL-024`
- **Field Provenance**: `DIRECT_EXISTING_SSOT`

#### CTR-GL-009: AuthorityContextRef
- **Canonical Name**: `AuthorityContextRef`
- **Purpose**: Reference to governance authority domain and context scope.
- **Identity Field**: `authorityId` (`AuthorityContextId`)
- **Required Fields**: `authorityId: AuthorityContextId`
- **Optional Fields**: None
- **Invariants**: `INV-GL-006`, `INV-GL-007`
- **Field Provenance**: `DIRECT_EXISTING_SSOT`

#### CTR-GL-011: TargetRef
- **Canonical Name**: `TargetRef`
- **Purpose**: Discriminated target union across 9 authorized entity types.
- **Identity Field**: Discriminated by `targetCategory`.
- **Discriminator Variants**:
  - `OBSERVATION`: `observationRef: ObservationRef` (`CTR-GL-001`)
  - `LESSON`: `lessonRef: LessonRef` (`CTR-GL-002`)
  - `LESSON_CANDIDATE`: `candidateRef: LessonCandidateRef` (`CTR-GL-003`)
  - `WORKSTREAM`: `workstreamRef: WorkstreamRef` (`CTR-GL-004`)
  - `PROJECT`: `projectRef: ProjectRef` (`CTR-GL-005`)
  - `DECISION`: `decisionRef: DecisionRef` (`CTR-GL-006`)
  - `EVENT`: `eventRef: EventRef` (`CTR-GL-007`)
  - `RULE_CANDIDATE_PROPOSAL`: `proposalRef: RuleCandidateProposalRef` (`CTR-GL-008`)
  - `AUTHORITY_CONTEXT`: `authorityContextRef: AuthorityContextRef` (`CTR-GL-009`)
- **Invariants**: `INV-GL-048`
- **Field Provenance**: `DIRECT_EXISTING_SSOT` (with identity key corrections ratified under Path C)

---

### 5.2 Observation Domain Contracts

#### CTR-GL-012: ObservationRecord
- **Canonical Name**: `ObservationRecord`
- **Purpose**: Structural contract representing an ingested mechanical or interpretive observation.
- **Identity Field**: `observationId` (`ObservationId`)
- **Required Fields**:
  - `observationId: ObservationId` (`DIRECT_EXISTING_SSOT`)
  - `category: ObservationCategoryEnum` (`MECHANICAL` | `INTERPRETIVE` | `HYBRID`) (`DIRECT_EXISTING_SSOT`)
  - `statement: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `evidenceRefs: List<EvidenceRef>` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `createdAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `createdBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Optional Fields**: None
- **Invariants**: `INV-GL-001`, `INV-GL-003`

#### CTR-GL-014: ObservationValidationRecord
- **Canonical Name**: `ObservationValidationRecord`
- **Purpose**: Documents mechanical or interpretive validation result for an observation.
- **Identity Field**: Component of `VerifiedObservation`.
- **Required Fields**:
  - `validationType: ValidationTypeEnum` (`MECHANICAL` | `INTERPRETIVE`) (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `verdict: ValidationVerdictEnum` (`VALIDATED` | `INVALIDATED` | `INCONCLUSIVE`) (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `validatedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `validatedBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Optional Fields**:
  - `decisionRef: DecisionRef` (`DIRECT_EXISTING_SSOT`)
- **Invariants**: `INV-GL-004`, `INV-GL-005`, `INV-GL-006`

---

### 5.3 Lesson Candidate Domain Contracts

#### CTR-GL-017: LessonCandidateRecord
- **Canonical Name**: `LessonCandidateRecord`
- **Purpose**: Proposal record representing a candidate lesson synthesized from validated observations.
- **Identity Field**: `candidateId` (`LessonCandidateId`)
- **Required Fields**:
  - `candidateId: LessonCandidateId` (`DIRECT_EXISTING_SSOT` / Ratified Boundary)
  - `statement: SummaryText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `rationale: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `scope: ScopeContract` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `originatingObservationRefs: List<ObservationRef>` (`DIRECT_EXISTING_SSOT` `INV-GL-008`)
  - `createdAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `createdBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Optional Fields**:
  - `status: LessonCandidateStatusEnum` (`OWNER_RATIFIED_NEW_GOVERNANCE`)
- **Invariants**: `INV-GL-008`, `INV-GL-009`

#### CTR-GL-019: LessonCandidateEvaluationRecord
- **Canonical Name**: `LessonCandidateEvaluationRecord`
- **Purpose**: Evaluation record capturing governance assessment of a lesson candidate.
- **Identity Field**: `candidateRef: LessonCandidateRef`, `decisionRef: DecisionRef`
- **Required Fields**:
  - `candidateRef: LessonCandidateRef` (`DIRECT_EXISTING_SSOT`)
  - `outcome: ReviewOutcomeEnum` (`APPROVED` | `REJECTED` | `REVISION_REQUESTED`) (`DIRECT_EXISTING_SSOT`)
  - `evaluatedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `evaluatedBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `decisionRef: DecisionRef` (`DIRECT_EXISTING_SSOT`)
- **Optional Fields**:
  - `comments: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Invariants**: `INV-GL-010`, `INV-GL-011`, `INV-GL-012`

---

### 5.4 Published Lesson Domain Contracts

#### CTR-GL-022: LessonRecord
- **Canonical Name**: `LessonRecord`
- **Purpose**: Canonical record representing an approved, versioned, non-binding advisory lesson.
- **Identity Field**: `lessonId` (`LessonId`), `version` (`VersionValue`)
- **Required Fields**:
  - `lessonId: LessonId` (`DIRECT_EXISTING_SSOT`)
  - `version: VersionValue` (`DIRECT_EXISTING_SSOT`)
  - `statement: SummaryText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `rationale: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `scope: ScopeContract` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `status: PublishedLessonStatusEnum` (`PUBLISHED` | `DEPRECATED` | `SUPERSEDED`) (`OWNER_RATIFIED_NEW_GOVERNANCE`)
  - `publishedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `publishedBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `authorityContextRef: AuthorityContextRef` (`DIRECT_EXISTING_SSOT` `INV-GL-006`)
  - `decisionRef: DecisionRef` (`DIRECT_EXISTING_SSOT`)
  - `nonBinding: Literal<true>` (`DIRECT_EXISTING_SSOT` `INV-GL-015`)
- **Optional Fields**:
  - `supersededByLessonRef: LessonRef` (`DIRECT_EXISTING_SSOT` `INV-GL-020`)
- **Invariants**: `INV-GL-014`, `INV-GL-015`, `INV-GL-016`, `INV-GL-020`, `INV-GL-022`

#### CTR-GL-024: LessonDeprecationRecord
- **Canonical Name**: `LessonDeprecationRecord`
- **Purpose**: Structural contract documenting rationale and scope for deprecating a published lesson.
- **Identity Field**: `lessonRef: LessonRef`, `decisionRef: DecisionRef`
- **Required Fields**:
  - `lessonRef: LessonRef` (`DIRECT_EXISTING_SSOT`)
  - `deprecatedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `deprecatedBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `reason: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `decisionRef: DecisionRef` (`DIRECT_EXISTING_SSOT`)
- **Optional Fields**: None
- **Invariants**: `INV-GL-017`, `INV-GL-018`, `INV-GL-019`

---

### 5.5 Rule Candidate & Prospective Adoption Contracts

#### CTR-GL-027: RuleCandidateProposalRecord
- **Canonical Name**: `RuleCandidateProposalRecord`
- **Purpose**: Structural contract capturing a rule candidate proposal generated from approved published lessons.
- **Identity Field**: `proposalId` (`RuleCandidateProposalId`)
- **Required Fields**:
  - `proposalId: RuleCandidateProposalId` (`DIRECT_EXISTING_SSOT`)
  - `proposedRule: SummaryText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `rationale: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `sourceLessonRef: LessonRef` (`DIRECT_EXISTING_SSOT` `INV-GL-023`)
  - `proposedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `proposedBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Optional Fields**: None
- **Invariants**: `INV-GL-023`, `INV-GL-024`

#### CTR-GL-029: RuleCandidateReviewRecord
- **Canonical Name**: `RuleCandidateReviewRecord`
- **Purpose**: Evaluation record capturing constitutional review of a rule candidate proposal.
- **Identity Field**: `proposalRef: RuleCandidateProposalRef`, `decisionRef: DecisionRef`
- **Required Fields**:
  - `proposalRef: RuleCandidateProposalRef` (`DIRECT_EXISTING_SSOT`)
  - `outcome: ReviewOutcomeEnum` (`APPROVED` | `REJECTED` | `REVISION_REQUESTED`) (`DIRECT_EXISTING_SSOT`)
  - `reviewedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `reviewedBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `decisionRef: DecisionRef` (`DIRECT_EXISTING_SSOT`)
- **Optional Fields**:
  - `comments: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Invariants**: `INV-GL-025`, `INV-GL-026`, `INV-GL-027`

#### CTR-GL-032: ProspectiveAdoptionRecord
- **Canonical Name**: `ProspectiveAdoptionRecord`
- **Purpose**: Captures formal prospective adoption of an approved rule candidate into project/workstream context.
- **Identity Field**: `adoptionId: String`
- **Required Fields**:
  - `adoptionId: String` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `proposalRef: RuleCandidateProposalRef` (`DIRECT_EXISTING_SSOT`)
  - `status: ProspectiveAdoptionStatusEnum` (`ADOPTED` | `WITHDRAWN` | `EXPIRED`) (`OWNER_RATIFIED_NEW_GOVERNANCE`)
  - `adoptedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `adoptedBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `decisionRef: DecisionRef` (`DIRECT_EXISTING_SSOT`)
- **Optional Fields**:
  - `targetProjectRef: ProjectRef` (`DIRECT_EXISTING_SSOT` `INV-GL-029`)
  - `targetWorkstreamRef: WorkstreamRef` (`DIRECT_EXISTING_SSOT` `INV-GL-029`)
- **Invariants**: `INV-GL-028`, `INV-GL-029`, `INV-GL-030`, `INV-GL-032`

#### CTR-GL-034: ProspectiveAdoptionWithdrawnRecord
- **Canonical Name**: `ProspectiveAdoptionWithdrawnRecord`
- **Purpose**: Consolidated record contract capturing formal withdrawal of prospective adoption.
- **Identity Field**: `adoptionId: String`, `decisionRef: DecisionRef`
- **Required Fields**:
  - `adoptionId: String` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `proposalRef: RuleCandidateProposalRef` (`DIRECT_EXISTING_SSOT`)
  - `withdrawnAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `withdrawnBy: ActorIdentityRef` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `reason: RationaleText` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `decisionRef: DecisionRef` (`DIRECT_EXISTING_SSOT`)
- **Optional Fields**: None
- **Invariants**: `INV-GL-031`

---

### 5.6 Operational Query & Envelope Contracts

#### CTR-GL-036: LearningContextQuery
- **Canonical Name**: `LearningContextQuery`
- **Purpose**: Operational query contract for retrieving active advisory lessons relevant to target scope.
- **Required Fields**:
  - `targetRef: TargetRef` (`DIRECT_EXISTING_SSOT` `INV-GL-033`)
- **Optional Fields**:
  - `scope: ScopeContract` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `matchStrategy: GuidanceMatchStrategyEnum` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Invariants**: `INV-GL-033`

#### CTR-GL-037: LearningContextQueryResult
- **Canonical Name**: `LearningContextQueryResult`
- **Purpose**: Operational result payload containing ordered non-binding lessons matching query.
- **Required Fields**:
  - `matchedLessons: List<LessonRecord>` (`DIRECT_EXISTING_SSOT` `INV-GL-034`)
- **Optional Fields**:
  - `queryId: GuidanceQueryId` (`OWNER_RATIFIED_RECONSTRUCTION`)
  - `queriedAt: TimestampIso8601` (`OWNER_RATIFIED_RECONSTRUCTION`)
- **Invariants**: `INV-GL-034`

#### CTR-GL-040: GovernanceEventEnvelope
- **Canonical Name**: `GovernanceEventEnvelope`
- **Purpose**: Architectural envelope wrapping domain events in append-only event log.
- **Identity Field**: `eventId` (`EventId`)
- **Required Fields**:
  - `eventId: EventId` (`DIRECT_EXISTING_SSOT` `INV-GL-039`, `INV-GL-050`)
  - `eventType: GovernanceEventTypeEnum` (`DIRECT_EXISTING_SSOT` `INV-GL-039`)
  - `payloadVersion: PayloadVersionString` (`DIRECT_EXISTING_SSOT` `INV-GL-039`, `INV-GL-049`)
  - `occurredAt: TimestampIso8601` (`DIRECT_EXISTING_SSOT` `INV-GL-039`)
  - `producerId: ProducerId` (`DIRECT_EXISTING_SSOT` `INV-GL-039`)
  - `authorityContextRef: AuthorityContextRef` (`DIRECT_EXISTING_SSOT`)
  - `payload: OpaquePayload` (`DIRECT_EXISTING_SSOT`)
- **Invariants**: `INV-GL-037`, `INV-GL-039`, `INV-GL-041`, `INV-GL-043`, `INV-GL-050`

#### CTR-GL-041: GovernanceCommandEnvelope
- **Canonical Name**: `GovernanceCommandEnvelope`
- **Purpose**: Architectural envelope wrapping domain commands in command log.
- **Identity Field**: `commandId` (`CommandId`)
- **Required Fields**:
  - `commandId: CommandId` (`DIRECT_EXISTING_SSOT` `INV-GL-040`, `INV-GL-051`)
  - `commandType: GovernanceCommandTypeEnum` (`DIRECT_EXISTING_SSOT` `INV-GL-040`)
  - `payloadVersion: PayloadVersionString` (`DIRECT_EXISTING_SSOT` `INV-GL-040`, `INV-GL-049`)
  - `issuedAt: TimestampIso8601` (`DIRECT_EXISTING_SSOT` `INV-GL-040`)
  - `requesterId: RequesterId` (`DIRECT_EXISTING_SSOT` `INV-GL-040`)
  - `authorityContextRef: AuthorityContextRef` (`DIRECT_EXISTING_SSOT`)
  - `payload: OpaquePayload` (`DIRECT_EXISTING_SSOT`)
- **Invariants**: `INV-GL-038`, `INV-GL-040`, `INV-GL-042`, `INV-GL-044`, `INV-GL-051`

#### CTR-GL-055: GovernancePersistencePort
- **Canonical Name**: `GovernancePersistencePort`
- **Purpose**: Architectural persistence interface port contract defining persistence operation obligations (`APPEND_EVENT`, `GET_EVENTS`, `SAVE_OBSERVATION`, `GET_OBSERVATION`, `SAVE_LESSON`, `GET_LESSON`, `SAVE_RULE_PROPOSAL`, `GET_RULE_PROPOSAL`).
- **Nature**: Interface contract, NOT a serializable payload record.
- **Invariants**: `INV-GL-054`, `INV-GL-055`
- **Field Provenance**: `DIRECT_EXISTING_SSOT`

---

## 6. Summary of Owner-Ratified Field Provenance

| Field / Concept | Canonical Placement | Provenance Classification |
| :--- | :--- | :--- |
| `LessonCandidateStatusEnum` | Candidate Evaluation Layer | `OWNER_RATIFIED_NEW_GOVERNANCE` |
| `PublishedLessonStatusEnum` | Published Advisory Lesson Layer | `OWNER_RATIFIED_NEW_GOVERNANCE` |
| `ProspectiveAdoptionStatusEnum` | Rule Candidate Adoption Layer | `OWNER_RATIFIED_NEW_GOVERNANCE` |
| Candidate identity = `candidateId` | `LessonCandidateRecord` & `TargetRef` | `DIRECT_EXISTING_SSOT` (Reconciled) |
| Exclusion of `prospectiveOnly` | `LessonRecord` | `OWNER_RATIFIED_NEW_GOVERNANCE` |
| `TargetRef` identity keys | `TargetRef` Discriminated Union | `DIRECT_EXISTING_SSOT` (Reconciled) |
| Record statements, rationales, timestamps | Physical Payload Schemas | `OWNER_RATIFIED_RECONSTRUCTION` |
| Result `queryId`, `queriedAt` | `LearningContextQueryResult` | `OWNER_RATIFIED_RECONSTRUCTION` |
