import { z } from 'zod';
import { LessonRefSchema, LessonFamilyRefSchema, ObservationRefSchema, EventRefSchema } from './references.js';
import { ApprovedLessonSchema, LessonCandidateSchema, ObservationSchema, VerifiedObservationSchema, RuleCandidateProposalSchema } from './entities.js';
import { RuleCandidateIdSchema, CommandIdSchema, VersionValueSchema, TimestampIsoSchema } from '../types/primitives.js';
import { CommandTypeEnumSchema } from '../types/enums.js';

/**
 * CTR-GL-055: GovernancePersistencePort — Shared Persistence Interface Contract
 */
export const GovernancePersistencePortSchema = z
  .object({
    operation: z.enum(['APPEND_EVENT', 'GET_EVENTS', 'SAVE_OBSERVATION', 'GET_OBSERVATION', 'SAVE_LESSON', 'GET_LESSON', 'SAVE_RULE_PROPOSAL', 'GET_RULE_PROPOSAL']),
  })
  .strict();
export type GovernancePersistencePortContract = z.infer<typeof GovernancePersistencePortSchema>;

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

/**
 * NON_CONTRACT_INTERNAL_TYPE: GovernanceCommandRecord — Operational Command Execution Record
 * Operational state recording completed command execution results.
 * Excluded from domain event history and HistoricalReplayEngine.
 */
export const GovernanceCommandRecordSchema = z
  .object({
    commandId: CommandIdSchema,
    commandFingerprint: z.string().min(1),
    commandType: CommandTypeEnumSchema,
    payloadVersion: VersionValueSchema,
    recordedAt: TimestampIsoSchema,
    executionOutcome: z
      .object({
        ok: z.boolean(),
        category: z.enum(['SUCCESS', 'REFUSED', 'ERROR']),
        outcome: z.string(),
        data: z.unknown().optional(),
        error: z.unknown().optional(),
      })
      .strict(),
  })
  .strict();
export type GovernanceCommandRecord = z.infer<typeof GovernanceCommandRecordSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: TransactionContext — Explicit Transaction Boundary Token
 * Represents an operational transaction boundary for Level 2/3 atomic writes.
 */
export interface TransactionContext {
  readonly transactionId: string;
  readonly createdAt: string;
  readonly isDurable: boolean;
}

/**
 * NON_CONTRACT_INTERNAL_TYPE: IdempotencyStorePort — Operational Idempotency Persistence Interface Contract
 * Dedicated persistence abstraction for tracking command execution idempotency.
 */
export interface IdempotencyStorePort {
  /**
   * Retrieves prior execution record for a command by ID.
   */
  getCommandExecution(
    commandId: string,
    transactionContext?: TransactionContext
  ): import('../runtime/types.js').RuntimeOperationResult<GovernanceCommandRecord | undefined>;

  /**
   * Records completed command execution details.
   */
  recordCommandExecution(
    record: GovernanceCommandRecord,
    transactionContext?: TransactionContext
  ): import('../runtime/types.js').RuntimeOperationResult<{ readonly recorded: boolean; readonly record: GovernanceCommandRecord }>;
}

/**
 * NON_CONTRACT_INTERNAL_TYPE: RuntimeIntegrityUnitOfWork — Shared Unit-of-Work Execution Boundary
 * Enforces atomic execution of domain mutations and command record writes across Level 2/3 storage adapters.
 */
export interface RuntimeIntegrityUnitOfWork {
  execute<T>(
    operation: (context: TransactionContext) => Promise<T> | T
  ): Promise<T> | T;
}

