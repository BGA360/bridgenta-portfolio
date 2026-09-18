import { z } from 'zod';
import { LessonRefSchema, LessonFamilyRefSchema, ObservationRefSchema, EventRefSchema } from './references.js';
import { ApprovedLessonSchema, LessonCandidateSchema, ObservationSchema, VerifiedObservationSchema, RuleCandidateProposalSchema } from './entities.js';
import { RuleCandidateIdSchema } from '../types/primitives.js';
import type { RefusalCodeEnum } from '../types/enums.js';

/**
 * Shared operation result contract for persistence port operations.
 */
export interface GovernancePersistenceSuccessResult<T> {
  readonly ok: true;
  readonly category: 'SUCCESS';
  readonly data: T;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface GovernancePersistenceRefusalResult {
  readonly ok: false;
  readonly category: 'REFUSED';
  readonly refusalCode: RefusalCodeEnum;
  readonly reason: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface GovernancePersistenceErrorResult {
  readonly ok: false;
  readonly category: 'ERROR';
  readonly error: any;
}

export type GovernancePersistenceOperationResult<T> =
  | GovernancePersistenceSuccessResult<T>
  | GovernancePersistenceRefusalResult
  | GovernancePersistenceErrorResult;

/**
 * CTR-GL-055: GovernancePersistencePort — Shared Architectural Persistence Interface Contract
 *
 * Nature: Architectural persistence interface contract defining persistence operation obligations
 * (APPEND_EVENT, GET_EVENTS, SAVE_OBSERVATION, GET_OBSERVATION, SAVE_LESSON, GET_LESSON, SAVE_RULE_PROPOSAL, GET_RULE_PROPOSAL).
 * NOT a serializable payload record or Zod schema.
 */
export interface GovernancePersistencePort {
  /**
   * Appends an event to the append-only governance event log.
   */
  appendEvent(
    event: unknown
  ): GovernancePersistenceOperationResult<{ readonly eventRef?: string; readonly appended: boolean }>;

  /**
   * Retrieves stored governance events in deterministic append order.
   */
  getEvents(
    filter?: { readonly eventRef?: string; readonly eventType?: string }
  ): GovernancePersistenceOperationResult<ReadonlyArray<unknown>>;

  /**
   * Stores an observation or verified observation.
   */
  saveObservation(
    observation: unknown
  ): GovernancePersistenceOperationResult<{ readonly observationRef: string; readonly saved: boolean }>;

  /**
   * Retrieves an observation by reference.
   */
  getObservationByRef(
    observationRef: string
  ): GovernancePersistenceOperationResult<unknown>;

  /**
   * Stores a lesson candidate or approved lesson.
   */
  saveLesson(
    lesson: unknown
  ): GovernancePersistenceOperationResult<{ readonly lessonRef: string; readonly saved: boolean }>;

  /**
   * Retrieves a lesson by reference.
   */
  getLessonByRef(
    lessonRef: string
  ): GovernancePersistenceOperationResult<unknown>;

  /**
   * Stores a rule candidate proposal.
   */
  saveRuleCandidate(
    proposal: unknown
  ): GovernancePersistenceOperationResult<{ readonly ruleCandidateId: string; readonly saved: boolean }>;

  /**
   * Retrieves a rule candidate proposal by ID.
   */
  getRuleCandidateById(
    ruleCandidateId: string
  ): GovernancePersistenceOperationResult<unknown>;
}

/**
 * NON_CONTRACT_INTERNAL_TYPE: LessonStorePort — Schema for Lesson Persistence Operations
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
 * NON_CONTRACT_INTERNAL_TYPE: ObservationStorePort — Schema for Observation Persistence Operations
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
 * NON_CONTRACT_INTERNAL_TYPE: GovernanceEventStorePort — Schema for Event Persistence Operations
 */
export const GovernanceEventStorePortSchema = z
  .object({
    operation: z.enum(['APPEND_EVENT', 'GET_BY_REF']),
    eventRef: EventRefSchema.optional(),
  })
  .strict();
export type GovernanceEventStorePort = z.infer<typeof GovernanceEventStorePortSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: RuleCandidateStorePort — Schema for Rule Candidate Persistence Operations
 */
export const RuleCandidateStorePortSchema = z
  .object({
    operation: z.enum(['SAVE_PROPOSAL', 'GET_BY_ID']),
    proposal: RuleCandidateProposalSchema.optional(),
    ruleCandidateId: RuleCandidateIdSchema.optional(),
  })
  .strict();
export type RuleCandidateStorePort = z.infer<typeof RuleCandidateStorePortSchema>;
