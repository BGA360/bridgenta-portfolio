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

/**
 * Wave 9 Runtime Composition Result DTO (GL-IMPL-UNIT-009).
 * Combines pipeline stage processing report with downstream handler execution outcome.
 */
export interface GovernedLearningRuntimeExecutionResult<T = unknown> {
  readonly ok: boolean;
  readonly pipelineReport: PipelineExecutionReport<CommandDispatchResult>;
  readonly handlerOutcome?: CommandHandlerOutcome<T>;
}

/**
 * Wave 9 Top-Level Governed Learning Runtime Composition (GL-IMPL-UNIT-009).
 * Composes pipeline validation, envelope/payload dispatch, and command handler execution.
 */
export class GovernedLearningRuntime {
  private readonly pipeline: GovernanceProcessingPipeline;

  constructor() {
    registerDefaultRuntimeSchemas();
    this.pipeline = new GovernanceProcessingPipeline();
  }

  /**
   * Executes full pipeline validation and routes valid commands to bounded handlers.
   */
  public processAndExecuteCommand(input: unknown): GovernedLearningRuntimeExecutionResult {
    const pipelineReport = this.pipeline.processCommand(input);
    if (!pipelineReport.ok || !pipelineReport.data?.envelope || !pipelineReport.data?.payload) {
      return {
        ok: false,
        pipelineReport,
      };
    }

    const { envelope, payload } = pipelineReport.data;
    const handlerOutcome = executeGovernedCommandHandler(envelope, payload);

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
export function createGovernedLearningRuntime(): GovernedLearningRuntime {
  return new GovernedLearningRuntime();
}

