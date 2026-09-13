import { z } from 'zod';
import { LessonRefSchema, LessonFamilyRefSchema, ObservationRefSchema, EventRefSchema, RuleVersionRefSchema } from './references.js';
import { ApprovedLessonSchema, LessonCandidateSchema, ObservationSchema, VerifiedObservationSchema, RuleCandidateProposalSchema } from './entities.js';
import { RuleCandidateIdSchema } from '../types/primitives.js';

/**
 * CTR-GL-047: LessonStorePort — Schema for Lesson Persistence Operations
 */
export const LessonStorePortSchema = z
  .object({
    operation: z.enum(['SAVE_CANDIDATE', 'SAVE_APPROVED', 'GET_BY_REF', 'GET_FAMILY']),
    lessonCandidate: LessonCandidateSchema.optional(),
    approvedLesson: ApprovedLessonSchema.optional(),
    lessonRef: LessonRefSchema.optional(),
    lessonFamilyRef: LessonFamilyRefSchema.optional(),
  })
  .strict();
export type LessonStorePort = z.infer<typeof LessonStorePortSchema>;

/**
 * CTR-GL-048: ObservationStorePort — Schema for Observation Persistence Operations
 */
export const ObservationStorePortSchema = z
  .object({
    operation: z.enum(['SAVE_OBSERVATION', 'SAVE_VERIFIED', 'GET_BY_REF']),
    observation: ObservationSchema.optional(),
    verifiedObservation: VerifiedObservationSchema.optional(),
    observationRef: ObservationRefSchema.optional(),
  })
  .strict();
export type ObservationStorePort = z.infer<typeof ObservationStorePortSchema>;

/**
 * CTR-GL-049: GovernanceEventStorePort — Schema for Event Persistence Operations
 */
export const GovernanceEventStorePortSchema = z
  .object({
    operation: z.enum(['APPEND_EVENT', 'GET_BY_REF']),
    eventRef: EventRefSchema.optional(),
  })
  .strict();
export type GovernanceEventStorePort = z.infer<typeof GovernanceEventStorePortSchema>;

/**
 * CTR-GL-050: RuleCandidateStorePort — Schema for Rule Candidate Persistence Operations
 */
export const RuleCandidateStorePortSchema = z
  .object({
    operation: z.enum(['SAVE_PROPOSAL', 'GET_BY_ID']),
    proposal: RuleCandidateProposalSchema.optional(),
    ruleCandidateId: RuleCandidateIdSchema.optional(),
  })
  .strict();
export type RuleCandidateStorePort = z.infer<typeof RuleCandidateStorePortSchema>;
