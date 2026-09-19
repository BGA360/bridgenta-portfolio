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
import type { CommandTypeEnum, EventTypeEnum, RefusalCodeEnum } from '../types/enums.js';
import type { z } from 'zod';
import type { RuntimeResultCategory, RuntimeOperationResult } from './types.js';
import { GovernedLearningRuntimeError, RuntimeInvariantError } from './errors.js';

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

import type { IdempotencyStorePort, GovernanceCommandRecord, ConcurrencyCoordinatorPort, ConcurrencyLease, RuntimeIntegrityUnitOfWork, TransactionContext } from '../contracts/ports.js';
import type { GovernancePersistencePort } from './persistence.js';
import { InMemoryIdempotencyStore, createCommandFingerprint } from './idempotency.js';
import { InMemoryConcurrencyCoordinator, getConcurrencyScope } from './concurrency.js';

export * from './concurrency.js';

/**
 * Wave 9 Runtime Composition Result DTO (GL-IMPL-UNIT-009).
 * Combines pipeline stage processing report with downstream handler execution outcome.
 */
export interface GovernedLearningRuntimeExecutionResult<T = unknown> {
  readonly ok: boolean;
  readonly category?: RuntimeResultCategory;
  readonly refusalCode?: RefusalCodeEnum;
  readonly reason?: string;
  readonly error?: GovernedLearningRuntimeError;
  readonly pipelineReport: PipelineExecutionReport<CommandDispatchResult>;
  readonly handlerOutcome?: CommandHandlerOutcome<T>;
  readonly replayedResult?: boolean;
}

export interface GovernedLearningRuntimeOptions {
  readonly idempotencyStore?: IdempotencyStorePort;
  readonly concurrencyCoordinator?: ConcurrencyCoordinatorPort;
  readonly persistencePort?: GovernancePersistencePort;
  readonly unitOfWork?: RuntimeIntegrityUnitOfWork;
}

/**
 * Wave 9 Top-Level Governed Learning Runtime Composition (GL-IMPL-UNIT-009).
 * Composes pipeline validation, Stage 8 idempotency enforcement, Stage 9 concurrency control, envelope/payload dispatch, and command handler execution.
 */
export class GovernedLearningRuntime {
  private readonly pipeline: GovernanceProcessingPipeline;
  private readonly idempotencyStore: IdempotencyStorePort;
  private readonly concurrencyCoordinator: ConcurrencyCoordinatorPort;
  private readonly persistencePort?: GovernancePersistencePort;
  private readonly unitOfWork?: RuntimeIntegrityUnitOfWork;

  constructor(options?: GovernedLearningRuntimeOptions) {
    registerDefaultRuntimeSchemas();
    this.idempotencyStore = options?.idempotencyStore ?? new InMemoryIdempotencyStore();
    this.concurrencyCoordinator = options?.concurrencyCoordinator ?? new InMemoryConcurrencyCoordinator();
    this.persistencePort = options?.persistencePort;
    this.unitOfWork = options?.unitOfWork;
    this.pipeline = new GovernanceProcessingPipeline({
      idempotencyStore: this.idempotencyStore,
      concurrencyCoordinator: this.concurrencyCoordinator,
    });
  }

  /**
   * Retrieves the configured operational idempotency store instance.
   */
  public getIdempotencyStore(): IdempotencyStorePort {
    return this.idempotencyStore;
  }

  /**
   * Retrieves the configured operational concurrency coordinator instance.
   */
  public getConcurrencyCoordinator(): ConcurrencyCoordinatorPort {
    return this.concurrencyCoordinator;
  }

  /**
   * Retrieves the configured persistence port instance.
   */
  public getPersistencePort(): GovernancePersistencePort | undefined {
    return this.persistencePort;
  }

  /**
   * Helper to persist authoritative domain entities & domain events within active transaction.
   */
  private persistDomainEntityAndEvent(
    envelope: any,
    payload: any,
    handlerData: any,
    txContext?: TransactionContext
  ): RuntimeOperationResult<{ persisted: boolean }> {
    if (!this.persistencePort) {
      return { ok: true, category: 'SUCCESS', data: { persisted: false } };
    }

    const commandType = envelope.commandType;

    switch (commandType) {
      case 'DraftObservation': {
        const obsRef = `obs_${envelope.commandId}`;
        const saveRes = this.persistencePort.saveObservation(
          {
            observationRef: obsRef,
            category: payload.category,
            statement: payload.statement,
            state: 'DRAFT',
            actorId: envelope.actorRef?.actorId,
          },
          txContext
        );
        if (!saveRes.ok) {
          return saveRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: saveRes.refusalCode, reason: saveRes.reason }
            : { ok: false, category: 'ERROR', error: saveRes.error ?? new RuntimeInvariantError(`saveObservation failed`) };
        }

        const eventRes = this.persistencePort.appendEvent(
          {
            eventType: 'OBSERVATION_CREATED',
            eventRef: `evt_${envelope.commandId}`,
            payload: {
              observationRef: { value: obsRef },
              category: payload.category,
              statement: payload.statement,
            },
          },
          txContext
        );
        if (!eventRes.ok) {
          return eventRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: eventRes.refusalCode, reason: eventRes.reason }
            : { ok: false, category: 'ERROR', error: eventRes.error ?? new RuntimeInvariantError(`appendEvent OBSERVATION_CREATED failed`) };
        }
        break;
      }

      case 'CreateLessonCandidate': {
        const candidateRef = `can_${envelope.commandId}`;
        const saveRes = this.persistencePort.saveLesson(
          {
            lessonCandidateRef: candidateRef,
            statement: payload.statement,
            rationale: payload.rationale,
            scope: payload.scope,
            state: 'CANDIDATE',
          },
          txContext
        );
        if (!saveRes.ok) {
          return saveRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: saveRes.refusalCode, reason: saveRes.reason }
            : { ok: false, category: 'ERROR', error: saveRes.error ?? new RuntimeInvariantError(`saveLesson candidate failed`) };
        }

        const eventRes = this.persistencePort.appendEvent(
          {
            eventType: 'LESSON_CANDIDATE_CREATED',
            eventRef: `evt_${envelope.commandId}`,
            payload: {
              candidateRef: { candidateId: candidateRef },
              statement: payload.statement,
              scope: payload.scope,
            },
          },
          txContext
        );
        if (!eventRes.ok) {
          return eventRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: eventRes.refusalCode, reason: eventRes.reason }
            : { ok: false, category: 'ERROR', error: eventRes.error ?? new RuntimeInvariantError(`appendEvent LESSON_CANDIDATE_CREATED failed`) };
        }
        break;
      }

      case 'ApproveLesson': {
        const lessonId = handlerData?.lessonId ?? `lsn_${payload.candidateRef.candidateId.replace(/^(can_|CAN_?)/, '')}`;
        const saveRes = this.persistencePort.saveLesson(
          {
            lessonRef: lessonId,
            status: 'PUBLISHED',
            candidateRef: payload.candidateRef,
            decisionRef: payload.decisionRef,
            publishedAt: envelope.issuedAt,
          },
          txContext
        );
        if (!saveRes.ok) {
          return saveRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: saveRes.refusalCode, reason: saveRes.reason }
            : { ok: false, category: 'ERROR', error: saveRes.error ?? new RuntimeInvariantError(`saveLesson approved failed`) };
        }

        const eventRes = this.persistencePort.appendEvent(
          {
            eventType: 'LESSON_APPROVED',
            eventRef: `evt_${envelope.commandId}`,
            payload: {
              lessonRef: { lessonId, version: '1.0.0' },
              candidateRef: payload.candidateRef,
            },
          },
          txContext
        );
        if (!eventRes.ok) {
          return eventRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: eventRes.refusalCode, reason: eventRes.reason }
            : { ok: false, category: 'ERROR', error: eventRes.error ?? new RuntimeInvariantError(`appendEvent LESSON_APPROVED failed`) };
        }
        break;
      }

      case 'SupersedeLesson': {
        const eventRes = this.persistencePort.appendEvent(
          {
            eventType: 'LESSON_SUPERSEDED',
            eventRef: `evt_${envelope.commandId}`,
            payload: {
              supersededLessonRef: payload.supersededLessonRef,
              supersedingLessonRef: payload.supersedingLessonRef,
            },
          },
          txContext
        );
        if (!eventRes.ok) {
          return eventRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: eventRes.refusalCode, reason: eventRes.reason }
            : { ok: false, category: 'ERROR', error: eventRes.error ?? new RuntimeInvariantError(`appendEvent LESSON_SUPERSEDED failed`) };
        }
        break;
      }

      case 'RetireLesson': {
        const eventRes = this.persistencePort.appendEvent(
          {
            eventType: 'LESSON_RETIRED',
            eventRef: `evt_${envelope.commandId}`,
            payload: {
              retiredLessonRef: payload.retiredLessonRef,
              reason: payload.reason,
            },
          },
          txContext
        );
        if (!eventRes.ok) {
          return eventRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: eventRes.refusalCode, reason: eventRes.reason }
            : { ok: false, category: 'ERROR', error: eventRes.error ?? new RuntimeInvariantError(`appendEvent LESSON_RETIRED failed`) };
        }
        break;
      }

      case 'AdoptLesson': {
        const eventRes = this.persistencePort.appendEvent(
          {
            eventType: 'LESSON_ADOPTED',
            eventRef: `evt_${envelope.commandId}`,
            payload: {
              adoptionRef: { adoptionId: handlerData?.adoptionId ?? `adp_${envelope.commandId}` },
              targetRef: payload.targetProjectRef ?? { value: 'target_proj' },
            },
          },
          txContext
        );
        if (!eventRes.ok) {
          return eventRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: eventRes.refusalCode, reason: eventRes.reason }
            : { ok: false, category: 'ERROR', error: eventRes.error ?? new RuntimeInvariantError(`appendEvent LESSON_ADOPTED failed`) };
        }
        break;
      }

      case 'ProposeRuleCandidate': {
        const ruleId = `rule_${payload.ruleManifestId}`;
        const saveRes = this.persistencePort.saveRuleCandidate(
          {
            ruleCandidateId: ruleId,
            proposedRule: payload.proposedRule,
            sourceLessonRef: payload.sourceLessonRef,
            state: 'RULE_CANDIDATE_PROPOSED',
          },
          txContext
        );
        if (!saveRes.ok) {
          return saveRes.category === 'REFUSED'
            ? { ok: false, category: 'REFUSED', refusalCode: saveRes.refusalCode, reason: saveRes.reason }
            : { ok: false, category: 'ERROR', error: saveRes.error ?? new RuntimeInvariantError(`saveRuleCandidate failed`) };
        }
        break;
      }
    }

    return { ok: true, category: 'SUCCESS', data: { persisted: true } };
  }

  /**
   * Synchronous command processing method.
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
        category: cachedRecord.executionOutcome.category,
        refusalCode: cachedRecord.executionOutcome.refusalCode,
        reason: cachedRecord.executionOutcome.reason,
        pipelineReport,
        handlerOutcome,
        replayedResult: true,
      };
    }

    if (!pipelineReport.ok || !pipelineReport.data?.envelope || !pipelineReport.data?.payload) {
      return {
        ok: false,
        category: pipelineReport.category,
        refusalCode: pipelineReport.refusalCode,
        reason: pipelineReport.reason,
        error: pipelineReport.error,
        pipelineReport,
      };
    }

    const { envelope, payload } = pipelineReport.data;
    const lease = pipelineReport.metadata?.concurrencyLease as ConcurrencyLease | undefined;

    try {
      if (this.unitOfWork) {
        const uowResult = this.unitOfWork.execute((txContext) =>
          this.executeCore(envelope, payload, pipelineReport, txContext)
        );

        if (uowResult && typeof (uowResult as any).then === 'function') {
          throw new RuntimeInvariantError(
            'Synchronous runtime requires a synchronous UnitOfWork implementation'
          );
        }

        return uowResult as GovernedLearningRuntimeExecutionResult;
      }

      return this.executeCore(envelope, payload, pipelineReport);
    } finally {
      lease?.release();
    }
  }

  /**
   * Asynchronous command processing method.
   */
  public async processAndExecuteCommandAsync(input: unknown): Promise<GovernedLearningRuntimeExecutionResult> {
    const preReport = this.pipeline.processCommand(input, { skipConcurrencyCheck: true });

    // Stage 8 exact retry short-circuit
    if (preReport.metadata?.replayedResult === true && preReport.metadata?.cachedRecord) {
      const cachedRecord = preReport.metadata.cachedRecord as GovernanceCommandRecord;
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
        category: cachedRecord.executionOutcome.category,
        refusalCode: cachedRecord.executionOutcome.refusalCode,
        reason: cachedRecord.executionOutcome.reason,
        pipelineReport: preReport,
        handlerOutcome,
        replayedResult: true,
      };
    }

    if (!preReport.ok || !preReport.data?.envelope || !preReport.data?.payload) {
      return {
        ok: false,
        category: preReport.category,
        refusalCode: preReport.refusalCode,
        reason: preReport.reason,
        error: preReport.error,
        pipelineReport: preReport,
      };
    }

    const { envelope, payload } = preReport.data;
    const scopeKeys = getConcurrencyScope(envelope);

    const runExecutionWithinScope = async () => {
      const asyncRes = await this.concurrencyCoordinator.executeWithinScopeAsync(scopeKeys, async () => {
        const updatedOutcomes = preReport.stageOutcomes.map((s) => {
          if (s.stageId === 'CONCURRENCY_CONTROL_CHECK') {
            return { stageId: s.stageId, status: 'COMPLETED' as const, timestamp: new Date().toISOString() };
          }
          return s;
        });

        const pipelineReport: PipelineExecutionReport<CommandDispatchResult> = {
          ...preReport,
          stageOutcomes: updatedOutcomes,
        };

        if (this.unitOfWork) {
          return this.unitOfWork.execute((txContext) =>
            this.executeCore(envelope, payload, pipelineReport, txContext)
          );
        }

        return this.executeCore(envelope, payload, pipelineReport);
      });

      if (!asyncRes.ok) {
        const error =
          asyncRes.category === 'ERROR'
            ? asyncRes.error
            : new RuntimeInvariantError(asyncRes.reason ?? 'Coordinator execution refused');
        return {
          ok: false,
          category: asyncRes.category,
          refusalCode: asyncRes.category === 'REFUSED' ? asyncRes.refusalCode : undefined,
          reason: asyncRes.category === 'REFUSED' ? asyncRes.reason : undefined,
          error,
          pipelineReport: preReport,
        };
      }

      return asyncRes.data;
    };

    return await runExecutionWithinScope();
  }

  /**
   * Inner execution logic that binds handler dispatch, entity/event persistence, and command record insertion.
   */
  private executeCore(
    envelope: any,
    payload: any,
    pipelineReport: PipelineExecutionReport<CommandDispatchResult>,
    txContext?: TransactionContext
  ): GovernedLearningRuntimeExecutionResult {
    // Post-BEGIN In-Transaction Command Arbitration Recheck
    const inTxCheck = this.idempotencyStore.getCommandExecution(envelope.commandId, txContext);
    if (!inTxCheck.ok) {
      if (inTxCheck.category === 'ERROR') {
        return {
          ok: false,
          category: 'ERROR',
          error:
            inTxCheck.error ??
            new RuntimeInvariantError(
              `Post-BEGIN durable idempotency lookup failed for command '${envelope.commandId}'`
            ),
          pipelineReport,
          rollbackRequired: true,
        };
      }
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: inTxCheck.refusalCode ?? 'REFUSAL_INVARIANT_VIOLATION',
        reason: inTxCheck.reason ?? 'Durable idempotency arbitration refused',
        pipelineReport,
        rollbackRequired: true,
      };
    }

    if (inTxCheck.data) {
      const existingRecord = inTxCheck.data;
      const currentFingerprint = createCommandFingerprint(envelope);
      const isFingerprintMatch = existingRecord.commandFingerprint === currentFingerprint;
      const isIssuedAtMatch = !existingRecord.issuedAt || existingRecord.issuedAt === envelope.issuedAt;

      if (isFingerprintMatch && isIssuedAtMatch) {
        let handlerOutcome: CommandHandlerOutcome | undefined;

        if (existingRecord.executionOutcome.category === 'SUCCESS') {
          handlerOutcome = {
            ok: true,
            category: 'SUCCESS',
            data: existingRecord.executionOutcome.data,
          };
        } else if (existingRecord.executionOutcome.category === 'REFUSED') {
          handlerOutcome = {
            ok: false,
            category: 'REFUSED',
            refusalCode: existingRecord.executionOutcome.refusalCode ?? 'REFUSAL_INVARIANT_VIOLATION',
            reason: existingRecord.executionOutcome.reason ?? 'Command execution refused',
          };
        }

        return {
          ok: existingRecord.executionOutcome.ok,
          category: existingRecord.executionOutcome.category,
          refusalCode: existingRecord.executionOutcome.refusalCode,
          reason: existingRecord.executionOutcome.reason,
          pipelineReport,
          handlerOutcome,
          replayedResult: true,
        };
      } else {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
          reason: `Command execution record collision for commandId '${envelope.commandId}' with mismatched command identity`,
          pipelineReport,
          rollbackRequired: true,
        } as GovernedLearningRuntimeExecutionResult;
      }
    }

    const handlerOutcome = executeGovernedCommandHandler(envelope, payload);

    let recordWriteResult: RuntimeOperationResult<{ recorded: boolean; record: GovernanceCommandRecord }> | undefined;

    if (handlerOutcome.category === 'SUCCESS') {
      const persistRes = this.persistDomainEntityAndEvent(envelope, payload, handlerOutcome.data, txContext);
      if (!persistRes.ok) {
        if (persistRes.category === 'REFUSED') {
          return {
            ok: false,
            category: 'REFUSED',
            refusalCode: persistRes.refusalCode ?? 'REFUSAL_INVARIANT_VIOLATION',
            reason: persistRes.reason ?? 'Domain persistence operation refused',
            pipelineReport,
            handlerOutcome: {
              ok: false,
              category: 'REFUSED',
              refusalCode: persistRes.refusalCode ?? 'REFUSAL_INVARIANT_VIOLATION',
              reason: persistRes.reason ?? 'Domain persistence operation refused',
            },
            rollbackRequired: true,
          } as GovernedLearningRuntimeExecutionResult;
        } else {
          throw persistRes.error ?? new RuntimeInvariantError(`Domain persistence failed for command '${envelope.commandId}'`);
        }
      }

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
      recordWriteResult = this.idempotencyStore.recordCommandExecution(record, txContext);
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
      recordWriteResult = this.idempotencyStore.recordCommandExecution(record, txContext);
    } else {
      // ERROR outcome -> throw error to trigger physical transaction ROLLBACK
      throw handlerOutcome.error ?? new RuntimeInvariantError(`Handler produced ERROR for command '${envelope.commandId}'`);
    }

    if (recordWriteResult && !recordWriteResult.ok) {
      if (recordWriteResult.category === 'REFUSED') {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: recordWriteResult.refusalCode ?? 'REFUSAL_INVARIANT_VIOLATION',
          reason: recordWriteResult.reason ?? 'Command execution record collision',
          pipelineReport,
          handlerOutcome: {
            ok: false,
            category: 'REFUSED',
            refusalCode: recordWriteResult.refusalCode ?? 'REFUSAL_INVARIANT_VIOLATION',
            reason: recordWriteResult.reason ?? 'Command execution record collision',
          },
          rollbackRequired: true,
        } as GovernedLearningRuntimeExecutionResult;
      }

      const rawError = recordWriteResult.category === 'ERROR' ? recordWriteResult.error : undefined;
      const errorMsg =
        typeof rawError === 'object' && rawError !== null && 'message' in rawError
          ? String((rawError as any).message)
          : String(rawError ?? 'Write failed');

      const writeError =
        rawError instanceof GovernedLearningRuntimeError
          ? rawError
          : new RuntimeInvariantError(`Idempotency execution record persistence failed: ${errorMsg}`);

      return {
        ok: false,
        category: 'ERROR',
        error: writeError,
        pipelineReport,
        handlerOutcome,
      };
    }

    return {
      ok: handlerOutcome.ok,
      category: handlerOutcome.category,
      refusalCode: handlerOutcome.category === 'REFUSED' ? handlerOutcome.refusalCode : undefined,
      reason: handlerOutcome.category === 'REFUSED' ? handlerOutcome.reason : undefined,
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


