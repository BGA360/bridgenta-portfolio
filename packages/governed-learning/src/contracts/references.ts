import { z } from 'zod';
import {
  LessonIdSchema,
  LessonCandidateIdSchema,
  VersionValueSchema,
  ObservationIdSchema,
  EvidenceIdSchema,
  DecisionIdSchema,
  EventIdSchema,
  CommandIdSchema,
  FrameworkIdSchema,
  RuleManifestIdSchema,
  AuthorityContextIdSchema,
  ActorIdSchema,
  ProjectIdSchema,
  WorkstreamIdSchema,
  RuleCandidateIdSchema,
  RuleCandidateProposalIdSchema,
  CriteriaIdSchema,
} from '../types/primitives.js';
import { ActorTypeEnumSchema } from '../types/enums.js';

/**
 * CTR-GL-001: ObservationRef — Canonical Observation Identity Reference
 */
export const ObservationRefSchema = z
  .object({
    observationId: ObservationIdSchema,
  })
  .strict();
export type ObservationRef = z.infer<typeof ObservationRefSchema>;

/**
 * CTR-GL-002: LessonRef — Version-Qualified Lesson Identity Reference
 */
export const LessonRefSchema = z
  .object({
    lessonId: LessonIdSchema,
    version: VersionValueSchema,
  })
  .strict();
export type LessonRef = z.infer<typeof LessonRefSchema>;

/**
 * CTR-GL-003: LessonCandidateRef — Unverified Candidate Lesson Identity Reference
 */
export const LessonCandidateRefSchema = z
  .object({
    candidateId: LessonCandidateIdSchema,
  })
  .strict();
export type LessonCandidateRef = z.infer<typeof LessonCandidateRefSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: LessonFamilyRef — Unversioned Lesson Family Reference
 */
export const LessonFamilyRefSchema = z
  .object({
    lessonId: LessonIdSchema,
  })
  .strict();
export type LessonFamilyRef = z.infer<typeof LessonFamilyRefSchema>;

/**
 * CTR-GL-004: WorkstreamRef — Target Workstream Context Reference
 */
export const WorkstreamRefSchema = z
  .object({
    workstreamId: WorkstreamIdSchema,
  })
  .strict();
export type WorkstreamRef = z.infer<typeof WorkstreamRefSchema>;

/**
 * CTR-GL-005: ProjectRef — Target Project Context Reference
 */
export const ProjectRefSchema = z
  .object({
    projectId: ProjectIdSchema,
  })
  .strict();
export type ProjectRef = z.infer<typeof ProjectRefSchema>;

/**
 * CTR-GL-006: DecisionRef — Governed Decision Record Reference
 */
export const DecisionRefSchema = z
  .object({
    decisionId: DecisionIdSchema,
  })
  .strict();
export type DecisionRef = z.infer<typeof DecisionRefSchema>;

/**
 * CTR-GL-007: EventRef — Append-Only Log Event Instance Reference
 */
export const EventRefSchema = z
  .object({
    eventId: EventIdSchema,
  })
  .strict();
export type EventRef = z.infer<typeof EventRefSchema>;

/**
 * CTR-GL-008: RuleCandidateProposalRef — Rule Candidate Proposal Identity Reference
 */
export const RuleCandidateProposalRefSchema = z
  .object({
    proposalId: RuleCandidateProposalIdSchema,
  })
  .strict();
export type RuleCandidateProposalRef = z.infer<typeof RuleCandidateProposalRefSchema>;

/**
 * CTR-GL-009: AuthorityContextRef — Governance Authority Identity Reference
 */
export const AuthorityContextRefSchema = z
  .object({
    authorityId: AuthorityContextIdSchema,
  })
  .strict();
export type AuthorityContextRef = z.infer<typeof AuthorityContextRefSchema>;

/**
 * CTR-GL-010: FrameworkCriteriaRef — Composite Framework Pair Reference
 */
export const FrameworkCriteriaRefSchema = z
  .object({
    frameworkRef: z.object({ frameworkId: FrameworkIdSchema }).strict(),
    criteriaId: CriteriaIdSchema,
    criteriaVersion: VersionValueSchema.optional(),
  })
  .strict();
export type FrameworkCriteriaRef = z.infer<typeof FrameworkCriteriaRefSchema>;

/**
 * CTR-GL-011: TargetRef — Canonical Discriminated Union of Target References
 */
export const TargetRefSchema = z.discriminatedUnion('targetCategory', [
  z.object({ targetCategory: z.literal('OBSERVATION'), observationRef: ObservationRefSchema }).strict(),
  z.object({ targetCategory: z.literal('LESSON'), lessonRef: LessonRefSchema }).strict(),
  z.object({ targetCategory: z.literal('LESSON_CANDIDATE'), candidateRef: LessonCandidateRefSchema }).strict(),
  z.object({ targetCategory: z.literal('WORKSTREAM'), workstreamRef: WorkstreamRefSchema }).strict(),
  z.object({ targetCategory: z.literal('PROJECT'), projectRef: ProjectRefSchema }).strict(),
  z.object({ targetCategory: z.literal('DECISION'), decisionRef: DecisionRefSchema }).strict(),
  z.object({ targetCategory: z.literal('EVENT'), eventRef: EventRefSchema }).strict(),
  z.object({ targetCategory: z.literal('RULE_CANDIDATE_PROPOSAL'), proposalRef: RuleCandidateProposalRefSchema }).strict(),
  z.object({ targetCategory: z.literal('AUTHORITY_CONTEXT'), authorityContextRef: AuthorityContextRefSchema }).strict(),
]);
export type TargetRef = z.infer<typeof TargetRefSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: EvidenceRef
 */
export const EvidenceRefSchema = z
  .object({
    evidenceId: EvidenceIdSchema,
  })
  .strict();
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: CommandRef
 */
export const CommandRefSchema = z
  .object({
    commandId: CommandIdSchema,
  })
  .strict();
export type CommandRef = z.infer<typeof CommandRefSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: FrameworkRef
 */
export const FrameworkRefSchema = z
  .object({
    frameworkId: FrameworkIdSchema,
  })
  .strict();
export type FrameworkRef = z.infer<typeof FrameworkRefSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: FrameworkVersionRef
 */
export const FrameworkVersionRefSchema = z
  .object({
    frameworkRef: FrameworkRefSchema,
    version: VersionValueSchema,
  })
  .strict();
export type FrameworkVersionRef = z.infer<typeof FrameworkVersionRefSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: RuleVersionRef
 */
export const RuleVersionRefSchema = z
  .object({
    ruleManifestId: RuleManifestIdSchema,
    version: VersionValueSchema,
  })
  .strict();
export type RuleVersionRef = z.infer<typeof RuleVersionRefSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: ActorIdentityRef
 */
export const ActorIdentityRefSchema = z
  .object({
    actorId: ActorIdSchema,
    actorType: ActorTypeEnumSchema,
  })
  .strict();
export type ActorIdentityRef = z.infer<typeof ActorIdentityRefSchema>;
