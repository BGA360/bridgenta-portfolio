import { GovernanceProcessingPipeline } from './pipeline.js';
import { executeGovernedCommandHandler } from './handlers.js';
import type { CommandHandlerOutcome } from './handlers.js';
import type { PipelineExecutionReport, CommandDispatchResult } from './pipeline.js';
import {
  CommandPayloadSchemaRegistry,
  DraftObservationCommandPayloadSchema,
  AttachEvidenceCommandPayloadSchema,
  SubmitObservationCommandPayloadSchema,
  ValidateMechanicalObservationCommandPayloadSchema,
  RecordInterpretiveValidationCommandPayloadSchema,
  CreateLessonCandidateCommandPayloadSchema,
  SubmitLessonForReviewCommandPayloadSchema,
  InvalidateLessonCandidateCommandPayloadSchema,
  ApproveLessonCommandPayloadSchema,
  RejectLessonCommandPayloadSchema,
  RequestLessonRevisionCommandPayloadSchema,
  SupersedeLessonCommandPayloadSchema,
  RetireLessonCommandPayloadSchema,
  AdoptProposalCommandPayloadSchema,
  BuildGuidanceSetQueryCommandPayloadSchema,
  ProposeRuleCandidateCommandPayloadSchema,
} from '../helpers/commands.js';
import {
  EventPayloadSchemaRegistry,
  ObservationCreatedEventPayloadSchema,
  ObservationValidatedEventPayloadSchema,
  LessonCandidateCreatedEventPayloadSchema,
  LessonApprovedEventPayloadSchema,
  LessonSupersededEventPayloadSchema,
  LessonRetiredEventPayloadSchema,
  LessonAdoptedEventPayloadSchema,
} from '../helpers/events.js';
import type { CommandTypeEnum, EventTypeEnum } from '../types/enums.js';
import type { z } from 'zod';

export * from './types.js';
export * from './errors.js';
export * from './parsers.js';
export * from './events.js';
export * from './pipeline.js';
export * from './handlers.js';
export * from './persistence.js';
export * from './replay.js';
export * from './eligibility.js';
export * from './idempotency.js';
export * from './concurrency.js';

/**
 * Registers default canonical '1.0.0' payload schemas for supported runtime commands and events.
 */
export function registerDefaultRuntimeSchemas(): void {
  const commands: Array<[CommandTypeEnum, z.ZodSchema]> = [
    ['DraftObservation', DraftObservationCommandPayloadSchema],
    ['AttachEvidence', AttachEvidenceCommandPayloadSchema],
    ['SubmitObservation', SubmitObservationCommandPayloadSchema],
    ['ValidateMechanicalObservation', ValidateMechanicalObservationCommandPayloadSchema],
    ['RecordInterpretiveValidation', RecordInterpretiveValidationCommandPayloadSchema],
    ['CreateLessonCandidate', CreateLessonCandidateCommandPayloadSchema],
    ['SubmitLessonForReview', SubmitLessonForReviewCommandPayloadSchema],
    ['InvalidateLessonCandidate', InvalidateLessonCandidateCommandPayloadSchema],
    ['ApproveLesson', ApproveLessonCommandPayloadSchema],
    ['RejectLesson', RejectLessonCommandPayloadSchema],
    ['RequestLessonRevision', RequestLessonRevisionCommandPayloadSchema],
    ['SupersedeLesson', SupersedeLessonCommandPayloadSchema],
    ['RetireLesson', RetireLessonCommandPayloadSchema],
    ['AdoptLesson', AdoptProposalCommandPayloadSchema],
    ['BuildGuidanceSetQuery', BuildGuidanceSetQueryCommandPayloadSchema],
    ['ProposeRuleCandidate', ProposeRuleCandidateCommandPayloadSchema],
  ];

  for (const [commandType, schema] of commands) {
    if (!CommandPayloadSchemaRegistry.isSupportedVersion(commandType, '1.0.0')) {
      CommandPayloadSchemaRegistry.registerSchema(commandType, '1.0.0', schema);
    }
  }

  const events: Array<[EventTypeEnum, z.ZodSchema]> = [
    ['OBSERVATION_CREATED', ObservationCreatedEventPayloadSchema],
    ['OBSERVATION_VALIDATED', ObservationValidatedEventPayloadSchema],
    ['LESSON_CANDIDATE_CREATED', LessonCandidateCreatedEventPayloadSchema],
    ['LESSON_APPROVED', LessonApprovedEventPayloadSchema],
    ['LESSON_SUPERSEDED', LessonSupersededEventPayloadSchema],
    ['LESSON_RETIRED', LessonRetiredEventPayloadSchema],
    ['LESSON_ADOPTED', LessonAdoptedEventPayloadSchema],
  ];

  for (const [eventType, schema] of events) {
    if (!EventPayloadSchemaRegistry.isSupportedVersion(eventType, '1.0.0')) {
      EventPayloadSchemaRegistry.registerSchema(eventType, '1.0.0', schema);
    }
  }
}

import type { IdempotencyStorePort, GovernanceCommandRecord } from '../contracts/ports.js';
import type { GovernancePersistencePort } from './persistence.js';
import { InMemoryIdempotencyStore, createCommandFingerprint } from './idempotency.js';

/**
 * Wave 9 Runtime Composition Result DTO (GL-IMPL-UNIT-009).
 * Combines pipeline stage processing report with downstream handler execution outcome.
 */
export interface GovernedLearningRuntimeExecutionResult<T = unknown> {
  readonly ok: boolean;
  readonly pipelineReport: PipelineExecutionReport<CommandDispatchResult>;
  readonly handlerOutcome?: CommandHandlerOutcome<T>;
  readonly replayedResult?: boolean;
}

export interface GovernedLearningRuntimeOptions {
  readonly idempotencyStore?: IdempotencyStorePort;
  readonly persistencePort?: GovernancePersistencePort;
}

/**
 * Wave 9 Top-Level Governed Learning Runtime Composition (GL-IMPL-UNIT-009).
 * Composes pipeline validation, Stage 8 idempotency enforcement, envelope/payload dispatch, and command handler execution.
 */
export class GovernedLearningRuntime {
  private readonly pipeline: GovernanceProcessingPipeline;
  private readonly idempotencyStore: IdempotencyStorePort;
  private readonly persistencePort?: GovernancePersistencePort;

  constructor(options?: GovernedLearningRuntimeOptions) {
    registerDefaultRuntimeSchemas();
    this.idempotencyStore = options?.idempotencyStore ?? new InMemoryIdempotencyStore();
    this.persistencePort = options?.persistencePort;
    this.pipeline = new GovernanceProcessingPipeline({
      idempotencyStore: this.idempotencyStore,
    });
  }

  /**
   * Retrieves the configured operational idempotency store instance.
   */
  public getIdempotencyStore(): IdempotencyStorePort {
    return this.idempotencyStore;
  }

  /**
   * Executes full pipeline validation and routes valid commands to bounded handlers.
   * Performs Stage 8 duplicate lookup: exact retries short-circuit and return prior stored results without re-executing handlers.
   */
  public processAndExecuteCommand(input: unknown): GovernedLearningRuntimeExecutionResult {
    const pipelineReport = this.pipeline.processCommand(input);

    // Stage 8 exact retry short-circuit check
    if (pipelineReport.metadata?.replayedResult === true && pipelineReport.metadata?.cachedRecord) {
      const cachedRecord = pipelineReport.metadata.cachedRecord as GovernanceCommandRecord;
      let handlerOutcome: CommandHandlerOutcome | undefined;

      if (cachedRecord.executionOutcome.category === 'SUCCESS') {
        handlerOutcome = {
          ok: true,
          category: 'SUCCESS',
          data: cachedRecord.executionOutcome.data,
        };
      } else if (cachedRecord.executionOutcome.category === 'REFUSED') {
        handlerOutcome = {
          ok: false,
          category: 'REFUSED',
          refusalCode: cachedRecord.executionOutcome.refusalCode ?? 'REFUSAL_INVARIANT_VIOLATION',
          reason: cachedRecord.executionOutcome.reason ?? 'Command execution refused',
        };
      }

      return {
        ok: cachedRecord.executionOutcome.ok,
        pipelineReport,
        handlerOutcome,
        replayedResult: true,
      };
    }

    if (!pipelineReport.ok || !pipelineReport.data?.envelope || !pipelineReport.data?.payload) {
      return {
        ok: false,
        pipelineReport,
      };
    }

    const { envelope, payload } = pipelineReport.data;
    const handlerOutcome = executeGovernedCommandHandler(envelope, payload);

    // Cache completed outcomes (SUCCESS or REFUSED) in idempotencyStore
    if (handlerOutcome.category === 'SUCCESS') {
      const record: GovernanceCommandRecord = {
        commandId: envelope.commandId,
        commandFingerprint: createCommandFingerprint(envelope),
        commandType: envelope.commandType,
        payloadVersion: envelope.payloadVersion,
        issuedAt: envelope.issuedAt,
        recordedAt: new Date().toISOString(),
        executionOutcome: {
          ok: true,
          category: 'SUCCESS',
          outcome: 'COMMAND_SUCCESS',
          data: handlerOutcome.data,
        },
      };
      this.idempotencyStore.recordCommandExecution(record);
    } else if (handlerOutcome.category === 'REFUSED') {
      const record: GovernanceCommandRecord = {
        commandId: envelope.commandId,
        commandFingerprint: createCommandFingerprint(envelope),
        commandType: envelope.commandType,
        payloadVersion: envelope.payloadVersion,
        issuedAt: envelope.issuedAt,
        recordedAt: new Date().toISOString(),
        executionOutcome: {
          ok: false,
          category: 'REFUSED',
          outcome: 'COMMAND_REFUSED',
          refusalCode: handlerOutcome.refusalCode,
          reason: handlerOutcome.reason,
        },
      };
      this.idempotencyStore.recordCommandExecution(record);
    }

    return {
      ok: handlerOutcome.ok,
      pipelineReport,
      handlerOutcome,
    };
  }
}

/**
 * Factory function for creating a composed Governed Learning Runtime instance.
 */
export function createGovernedLearningRuntime(
  options?: GovernedLearningRuntimeOptions
): GovernedLearningRuntime {
  return new GovernedLearningRuntime(options);
}

