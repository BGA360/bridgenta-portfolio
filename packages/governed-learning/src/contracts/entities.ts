import { z } from 'zod';
import {
  EvidenceIdSchema,
  ObservationIdSchema,
  LessonIdSchema,
  TimestampIsoSchema,
  DigestValueSchema,
  VersionValueSchema,
  RuleCandidateIdSchema,
  RuleManifestIdSchema,
} from '../types/primitives.js';
import {
  DigestAlgorithmEnumSchema,
  EvidenceTypeEnumSchema,
  ObservationCategoryEnumSchema,
  ValidationTypeEnumSchema,
  ValidationVerdictEnumSchema,
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
  AuthorityContextRefSchema,
  TargetRefSchema,
} from './references.js';
import { ScopeContractSchema } from './scopes.js';

/**
 * CTR-GL-055: IntegrityDigest — Content Hash Verification
 */
export const IntegrityDigestSchema = z
  .object({
    algorithm: DigestAlgorithmEnumSchema,
    value: DigestValueSchema,
  })
  .strict();
export type IntegrityDigest = z.infer<typeof IntegrityDigestSchema>;

/**
 * CTR-GL-043: EvidenceArtifact — Verified Evidence Artifact
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
 * CTR-GL-030: ObservationValidationRecord — Result of Validation Step
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
 * CTR-GL-028: Observation — Base Observation Entity
 */
export const ObservationSchema = z
  .object({
    observationId: ObservationIdSchema,
    category: ObservationCategoryEnumSchema,
    statement: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema),
    createdAt: TimestampIsoSchema,
    createdBy: ActorIdentityRefSchema,
  })
  .strict();
export type Observation = z.infer<typeof ObservationSchema>;

/**
 * CTR-GL-029: VerifiedObservation — Terminal Verified Projection
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
 * CTR-GL-031: LessonCandidate — Unapproved Draft Lesson
 */
export const LessonCandidateSchema = z
  .object({
    lessonId: LessonIdSchema,
    statement: z.string().min(1),
    rationale: z.string().min(1),
    scope: ScopeContractSchema,
    originatingObservationRefs: z.array(ObservationRefSchema),
    createdAt: TimestampIsoSchema,
    createdBy: ActorIdentityRefSchema,
  })
  .strict();
export type LessonCandidate = z.infer<typeof LessonCandidateSchema>;

/**
 * CTR-GL-032: ApprovedLesson — Immutable Approved Governance Artifact
 * Contains NO mutable current status fields. nonBinding and prospectiveOnly are literal true.
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
    prospectiveOnly: z.literal(true),
  })
  .strict();
export type ApprovedLesson = z.infer<typeof ApprovedLessonSchema>;

/**
 * CTR-GL-033: DerivedEffectiveState — External Projection of Lesson Status
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
 * CTR-GL-034: LessonReviewRecord — Audit Record of Review Action
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
 * CTR-GL-036: RuleCandidateProposal — Proposal for Rule Engine Candidate
 */
export const RuleCandidateProposalSchema = z
  .object({
    ruleCandidateId: RuleCandidateIdSchema,
    ruleManifestId: RuleManifestIdSchema,
    proposedRule: z.string().min(1),
    rationale: z.string().min(1),
    sourceLessonRef: LessonRefSchema,
    proposedAt: TimestampIsoSchema,
    proposedBy: ActorIdentityRefSchema,
  })
  .strict();
export type RuleCandidateProposal = z.infer<typeof RuleCandidateProposalSchema>;

/**
 * CTR-GL-046: RefusalContract — Formal Domain Refusal Response
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
