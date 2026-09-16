import { z } from 'zod';
import {
  EvidenceIdSchema,
  ObservationIdSchema,
  LessonIdSchema,
  LessonCandidateIdSchema,
  TimestampIsoSchema,
  DigestValueSchema,
  VersionValueSchema,
  RuleCandidateIdSchema,
  RuleManifestIdSchema,
  ProjectIdSchema,
  WorkstreamIdSchema,
} from '../types/primitives.js';
import {
  DigestAlgorithmEnumSchema,
  EvidenceTypeEnumSchema,
  ObservationCategoryEnumSchema,
  ValidationTypeEnumSchema,
  ValidationVerdictEnumSchema,
  LessonCandidateStatusEnumSchema,
  PublishedLessonStatusEnumSchema,
  ProspectiveAdoptionStatusEnumSchema,
  LessonStatusEnumSchema,
  ReviewOutcomeEnumSchema,
  RefusalCodeEnumSchema,
} from '../types/enums.js';
import {
  EvidenceRefSchema,
  ActorIdentityRefSchema,
  DecisionRefSchema,
  ObservationRefSchema,
  LessonRefSchema,
  LessonCandidateRefSchema,
  RuleCandidateProposalRefSchema,
  AuthorityContextRefSchema,
  TargetRefSchema,
  ProjectRefSchema,
  WorkstreamRefSchema,
} from './references.js';
import { ScopeContractSchema } from './scopes.js';

/**
 * NON_CONTRACT_INTERNAL_TYPE: IntegrityDigest — Content Hash Verification
 */
export const IntegrityDigestSchema = z
  .object({
    algorithm: DigestAlgorithmEnumSchema,
    value: DigestValueSchema,
  })
  .strict();
export type IntegrityDigest = z.infer<typeof IntegrityDigestSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: EvidenceArtifact — Verified Evidence Artifact
 */
export const EvidenceArtifactSchema = z
  .object({
    evidenceId: EvidenceIdSchema,
    evidenceType: EvidenceTypeEnumSchema,
    location: z.string().min(1),
    timestamp: TimestampIsoSchema,
    digest: IntegrityDigestSchema.optional(),
  })
  .strict();
export type EvidenceArtifact = z.infer<typeof EvidenceArtifactSchema>;

/**
 * CTR-GL-012: ObservationRecord — Base Ingested Observation Entity
 */
export const ObservationRecordSchema = z
  .object({
    observationId: ObservationIdSchema,
    category: ObservationCategoryEnumSchema,
    statement: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema),
    createdAt: TimestampIsoSchema,
    createdBy: ActorIdentityRefSchema,
  })
  .strict();
export type ObservationRecord = z.infer<typeof ObservationRecordSchema>;

/** Alias for backward internal compatibility */
export const ObservationSchema = ObservationRecordSchema;
export type Observation = ObservationRecord;

/**
 * CTR-GL-014: ObservationValidationRecord — Documented Validation Result
 */
export const ObservationValidationRecordSchema = z
  .object({
    validationType: ValidationTypeEnumSchema,
    verdict: ValidationVerdictEnumSchema,
    validatedAt: TimestampIsoSchema,
    validatedBy: ActorIdentityRefSchema,
    decisionRef: DecisionRefSchema.optional(),
  })
  .strict();
export type ObservationValidationRecord = z.infer<typeof ObservationValidationRecordSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: VerifiedObservation — Terminal Verified Observation Projection
 */
export const VerifiedObservationSchema = z
  .object({
    observationId: ObservationIdSchema,
    category: ObservationCategoryEnumSchema,
    statement: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema),
    createdAt: TimestampIsoSchema,
    createdBy: ActorIdentityRefSchema,
    validationRecord: ObservationValidationRecordSchema,
  })
  .strict();
export type VerifiedObservation = z.infer<typeof VerifiedObservationSchema>;

/**
 * CTR-GL-017: LessonCandidateRecord — Synthesized Lesson Candidate Proposal Record
 */
export const LessonCandidateRecordSchema = z
  .object({
    candidateId: LessonCandidateIdSchema,
    statement: z.string().min(1),
    rationale: z.string().min(1),
    scope: ScopeContractSchema,
    originatingObservationRefs: z.array(ObservationRefSchema),
    createdAt: TimestampIsoSchema,
    createdBy: ActorIdentityRefSchema,
    status: LessonCandidateStatusEnumSchema.optional(),
  })
  .strict();
export type LessonCandidateRecord = z.infer<typeof LessonCandidateRecordSchema>;

/** Alias for backward physical code compatibility */
export const LessonCandidateSchema = LessonCandidateRecordSchema;
export type LessonCandidate = LessonCandidateRecord;

/**
 * CTR-GL-019: LessonCandidateEvaluationRecord — Governance Evaluation of Candidate
 */
export const LessonCandidateEvaluationRecordSchema = z
  .object({
    candidateRef: LessonCandidateRefSchema,
    outcome: ReviewOutcomeEnumSchema,
    evaluatedAt: TimestampIsoSchema,
    evaluatedBy: ActorIdentityRefSchema,
    comments: z.string().optional(),
    decisionRef: DecisionRefSchema,
  })
  .strict();
export type LessonCandidateEvaluationRecord = z.infer<typeof LessonCandidateEvaluationRecordSchema>;

/**
 * CTR-GL-022: LessonRecord — Canonical Versioned Published Advisory Lesson
 */
export const LessonRecordSchema = z
  .object({
    lessonId: LessonIdSchema,
    version: VersionValueSchema,
    statement: z.string().min(1),
    rationale: z.string().min(1),
    scope: ScopeContractSchema,
    status: PublishedLessonStatusEnumSchema,
    publishedAt: TimestampIsoSchema,
    publishedBy: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    decisionRef: DecisionRefSchema,
    supersededByLessonRef: LessonRefSchema.optional(),
    nonBinding: z.literal(true),
  })
  .strict();
export type LessonRecord = z.infer<typeof LessonRecordSchema>;

/**
 * CTR-GL-024: LessonDeprecationRecord — Rationale & Scope for Lesson Deprecation
 */
export const LessonDeprecationRecordSchema = z
  .object({
    lessonRef: LessonRefSchema,
    deprecatedAt: TimestampIsoSchema,
    deprecatedBy: ActorIdentityRefSchema,
    reason: z.string().min(1),
    decisionRef: DecisionRefSchema,
  })
  .strict();
export type LessonDeprecationRecord = z.infer<typeof LessonDeprecationRecordSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: ApprovedLesson — Candidate Approval Output DTO
 */
export const ApprovedLessonSchema = z
  .object({
    lessonId: LessonIdSchema,
    version: VersionValueSchema,
    statement: z.string().min(1),
    rationale: z.string().min(1),
    scope: ScopeContractSchema,
    approvedAt: TimestampIsoSchema,
    approvedBy: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    decisionRef: DecisionRefSchema,
    nonBinding: z.literal(true),
  })
  .strict();
export type ApprovedLesson = z.infer<typeof ApprovedLessonSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: DerivedEffectiveState — External Status Projection
 */
export const DerivedEffectiveStateSchema = z
  .object({
    lessonRef: LessonRefSchema,
    status: LessonStatusEnumSchema,
    supersededByLessonRef: LessonRefSchema.optional(),
    derivedAt: TimestampIsoSchema,
  })
  .strict();
export type DerivedEffectiveState = z.infer<typeof DerivedEffectiveStateSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: LessonReviewRecord — Internal Review Audit Record
 */
export const LessonReviewRecordSchema = z
  .object({
    reviewId: z.string().min(1),
    lessonId: LessonIdSchema,
    outcome: ReviewOutcomeEnumSchema,
    reviewedAt: TimestampIsoSchema,
    reviewedBy: ActorIdentityRefSchema,
    comments: z.string().optional(),
    decisionRef: DecisionRefSchema,
  })
  .strict();
export type LessonReviewRecord = z.infer<typeof LessonReviewRecordSchema>;

/**
 * CTR-GL-027: RuleCandidateProposalRecord — Rule Candidate Proposal Record
 */
export const RuleCandidateProposalRecordSchema = z
  .object({
    proposalId: RuleCandidateIdSchema,
    ruleManifestId: RuleManifestIdSchema,
    proposedRule: z.string().min(1),
    rationale: z.string().min(1),
    sourceLessonRef: LessonRefSchema,
    proposedAt: TimestampIsoSchema,
    proposedBy: ActorIdentityRefSchema,
  })
  .strict();
export type RuleCandidateProposalRecord = z.infer<typeof RuleCandidateProposalRecordSchema>;

/** Alias for backward compatibility */
export const RuleCandidateProposalSchema = RuleCandidateProposalRecordSchema;
export type RuleCandidateProposal = RuleCandidateProposalRecord;

/**
 * CTR-GL-029: RuleCandidateReviewRecord — Constitutional Review of Rule Candidate
 */
export const RuleCandidateReviewRecordSchema = z
  .object({
    proposalRef: RuleCandidateProposalRefSchema,
    outcome: ReviewOutcomeEnumSchema,
    reviewedAt: TimestampIsoSchema,
    reviewedBy: ActorIdentityRefSchema,
    comments: z.string().optional(),
    decisionRef: DecisionRefSchema,
  })
  .strict();
export type RuleCandidateReviewRecord = z.infer<typeof RuleCandidateReviewRecordSchema>;

/**
 * CTR-GL-032: ProspectiveAdoptionRecord — Prospective Adoption of Rule Candidate into Context
 */
export const ProspectiveAdoptionRecordSchema = z
  .object({
    adoptionId: z.string().min(1),
    proposalRef: RuleCandidateProposalRefSchema,
    targetProjectRef: ProjectRefSchema.optional(),
    targetWorkstreamRef: WorkstreamRefSchema.optional(),
    status: ProspectiveAdoptionStatusEnumSchema,
    adoptedAt: TimestampIsoSchema,
    adoptedBy: ActorIdentityRefSchema,
    decisionRef: DecisionRefSchema,
  })
  .strict();
export type ProspectiveAdoptionRecord = z.infer<typeof ProspectiveAdoptionRecordSchema>;

/**
 * CTR-GL-034: ProspectiveAdoptionWithdrawnRecord — Formal Withdrawal of Prospective Adoption
 */
export const ProspectiveAdoptionWithdrawnRecordSchema = z
  .object({
    adoptionId: z.string().min(1),
    proposalRef: RuleCandidateProposalRefSchema,
    withdrawnAt: TimestampIsoSchema,
    withdrawnBy: ActorIdentityRefSchema,
    reason: z.string().min(1),
    decisionRef: DecisionRefSchema,
  })
  .strict();
export type ProspectiveAdoptionWithdrawnRecord = z.infer<typeof ProspectiveAdoptionWithdrawnRecordSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: RefusalContract — Formal Domain Refusal DTO
 */
export const RefusalContractSchema = z
  .object({
    refusalCode: RefusalCodeEnumSchema,
    reason: z.string().min(1),
    timestamp: TimestampIsoSchema,
    targetRef: TargetRefSchema,
    actorIdentityRef: ActorIdentityRefSchema.optional(),
  })
  .strict();
export type RefusalContract = z.infer<typeof RefusalContractSchema>;
