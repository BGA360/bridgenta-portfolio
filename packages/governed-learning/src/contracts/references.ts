import { z } from 'zod';
import {
  LessonIdSchema,
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
  CriteriaIdSchema,
} from '../types/primitives.js';
import { ActorTypeEnumSchema, TargetCategoryEnumSchema } from '../types/enums.js';

/**
 * CTR-GL-014: LessonRef — Version-Qualified Lesson Identity
 */
export const LessonRefSchema = z
  .object({
    lessonId: LessonIdSchema,
    version: VersionValueSchema,
  })
  .strict();
export type LessonRef = z.infer<typeof LessonRefSchema>;

/**
 * CTR-GL-015: LessonFamilyRef — Unversioned Lesson Family Identity
 */
export const LessonFamilyRefSchema = z
  .object({
    lessonId: LessonIdSchema,
  })
  .strict();
export type LessonFamilyRef = z.infer<typeof LessonFamilyRefSchema>;

/**
 * CTR-GL-016: ObservationRef
 */
export const ObservationRefSchema = z
  .object({
    observationId: ObservationIdSchema,
  })
  .strict();
export type ObservationRef = z.infer<typeof ObservationRefSchema>;

/**
 * CTR-GL-017: EvidenceRef
 */
export const EvidenceRefSchema = z
  .object({
    evidenceId: EvidenceIdSchema,
  })
  .strict();
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

/**
 * CTR-GL-018: DecisionRef
 */
export const DecisionRefSchema = z
  .object({
    decisionId: DecisionIdSchema,
  })
  .strict();
export type DecisionRef = z.infer<typeof DecisionRefSchema>;

/**
 * CTR-GL-019: EventRef
 */
export const EventRefSchema = z
  .object({
    eventId: EventIdSchema,
  })
  .strict();
export type EventRef = z.infer<typeof EventRefSchema>;

/**
 * CTR-GL-020: CommandRef
 */
export const CommandRefSchema = z
  .object({
    commandId: CommandIdSchema,
  })
  .strict();
export type CommandRef = z.infer<typeof CommandRefSchema>;

/**
 * CTR-GL-021: FrameworkRef
 */
export const FrameworkRefSchema = z
  .object({
    frameworkId: FrameworkIdSchema,
  })
  .strict();
export type FrameworkRef = z.infer<typeof FrameworkRefSchema>;

/**
 * CTR-GL-022: FrameworkVersionRef — Framework Reference + Version
 */
export const FrameworkVersionRefSchema = z
  .object({
    frameworkRef: FrameworkRefSchema,
    version: VersionValueSchema,
  })
  .strict();
export type FrameworkVersionRef = z.infer<typeof FrameworkVersionRefSchema>;

/**
 * CTR-GL-023: RuleVersionRef — Rule Manifest ID + Version
 */
export const RuleVersionRefSchema = z
  .object({
    ruleManifestId: RuleManifestIdSchema,
    version: VersionValueSchema,
  })
  .strict();
export type RuleVersionRef = z.infer<typeof RuleVersionRefSchema>;

/**
 * CTR-GL-024: AuthorityContextRef — Scalar Identity Reference
 */
export const AuthorityContextRefSchema = z
  .object({
    authorityContextId: AuthorityContextIdSchema,
  })
  .strict();
export type AuthorityContextRef = z.infer<typeof AuthorityContextRefSchema>;

/**
 * CTR-GL-025: ActorIdentityRef
 */
export const ActorIdentityRefSchema = z
  .object({
    actorId: ActorIdSchema,
    actorType: ActorTypeEnumSchema,
  })
  .strict();
export type ActorIdentityRef = z.infer<typeof ActorIdentityRefSchema>;

/**
 * CTR-GL-026: ProjectRef
 */
export const ProjectRefSchema = z
  .object({
    projectId: ProjectIdSchema,
  })
  .strict();
export type ProjectRef = z.infer<typeof ProjectRefSchema>;

/**
 * CTR-GL-027: WorkstreamRef
 */
export const WorkstreamRefSchema = z
  .object({
    workstreamId: WorkstreamIdSchema,
  })
  .strict();
export type WorkstreamRef = z.infer<typeof WorkstreamRefSchema>;

/**
 * CTR-GL-056: FrameworkCriteriaRef — Structured Reference to Framework Criteria
 */
export const FrameworkCriteriaRefSchema = z
  .object({
    frameworkRef: FrameworkRefSchema,
    criteriaId: CriteriaIdSchema,
    criteriaVersion: VersionValueSchema.optional(),
  })
  .strict();
export type FrameworkCriteriaRef = z.infer<typeof FrameworkCriteriaRefSchema>;

/**
 * CTR-GL-057: TargetRef — Discriminated Union of Target References
 */
export const TargetRefSchema = z.discriminatedUnion('targetCategory', [
  z.object({ targetCategory: z.literal('OBSERVATION'), observationRef: ObservationRefSchema }).strict(),
  z.object({ targetCategory: z.literal('LESSON'), lessonRef: LessonRefSchema }).strict(),
  z.object({ targetCategory: z.literal('LESSON_CANDIDATE'), lessonFamilyRef: LessonFamilyRefSchema }).strict(),
  z.object({ targetCategory: z.literal('WORKSTREAM'), workstreamRef: WorkstreamRefSchema }).strict(),
  z.object({ targetCategory: z.literal('PROJECT'), projectRef: ProjectRefSchema }).strict(),
  z.object({ targetCategory: z.literal('DECISION'), decisionRef: DecisionRefSchema }).strict(),
  z.object({ targetCategory: z.literal('EVENT'), eventRef: EventRefSchema }).strict(),
  z.object({ targetCategory: z.literal('RULE_CANDIDATE_PROPOSAL'), ruleCandidateId: RuleCandidateIdSchema }).strict(),
  z.object({ targetCategory: z.literal('AUTHORITY_CONTEXT'), authorityContextRef: AuthorityContextRefSchema }).strict(),
]);
export type TargetRef = z.infer<typeof TargetRefSchema>;
