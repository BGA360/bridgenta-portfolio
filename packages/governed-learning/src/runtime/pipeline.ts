import { z } from 'zod';
import type {
  GovernanceCommandEnvelope,
  GovernanceEventEnvelope,
} from '../contracts/envelopes.js';
import {
  parseGovernanceCommandEnvelope,
  parseGovernanceEventEnvelope,
  parseActorIdentityRef,
  parseAuthorityContextRef,
  parsePayloadWithSchema,
} from './parsers.js';
import type {
  RuntimeExecutionStageOutcome,
  RuntimeResultCategory,
} from './types.js';
import { GovernedLearningRuntimeError, RuntimeInvariantError } from './errors.js';
import {
  CommandPayloadSchemaRegistry,
  IsSupportedCommandPayloadVersion,
} from '../helpers/commands.js';
import {
  EventPayloadSchemaRegistry,
  IsSupportedEventPayloadVersion,
} from '../helpers/events.js';
import type {
  CommandDispatchOutcome,
  EventDispatchOutcome,
} from '../helpers/dispatch-outcomes.js';
import {
  CommandTypeEnumSchema,
  EventTypeEnumSchema,
} from '../types/enums.js';
import type { RefusalCodeEnum } from '../types/enums.js';
import type { IdempotencyStorePort } from '../contracts/ports.js';
import { createCommandFingerprint } from './idempotency.js';

export type PipelineStageId =
  | 'ENVELOPE_STRUCTURAL_PARSE'
  | 'TYPE_DISCRIMINATOR_CHECK'
  | 'VERSION_SUPPORT_CHECK'
  | 'PAYLOAD_STRUCTURAL_PARSE'
  | 'ACTOR_REF_STRUCTURAL_CHECK'
  | 'AUTHORITY_CONTEXT_REF_CHECK'
  | 'PROVENANCE_REF_CHECK'
  | 'IDEMPOTENCY_DETERMINISTIC_CHECK'
  | 'CONCURRENCY_CONTROL_CHECK'
  | 'DETERMINISTIC_POLICY_GATE'
  | 'DISPATCH_ROUTER';

export interface CommandDispatchResult {
  readonly ok: boolean;
  readonly outcome: CommandDispatchOutcome['outcome'];
  readonly commandType?: string;
  readonly payloadVersion?: string;
  readonly envelope?: GovernanceCommandEnvelope;
  readonly payload?: unknown;
  readonly error?: GovernedLearningRuntimeError;
}

export interface EventDispatchResult {
  readonly ok: boolean;
  readonly outcome: EventDispatchOutcome['outcome'];
  readonly eventType?: string;
  readonly payloadVersion?: string;
  readonly envelope?: GovernanceEventEnvelope;
  readonly payload?: unknown;
  readonly error?: GovernedLearningRuntimeError;
}

export interface PipelineExecutionReport<T = unknown> {
  readonly ok: boolean;
  readonly category: RuntimeResultCategory;
  readonly currentStage: PipelineStageId;
  readonly stageOutcomes: ReadonlyArray<RuntimeExecutionStageOutcome>;
  readonly data?: T;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly error?: GovernedLearningRuntimeError;
  readonly refusalCode?: RefusalCodeEnum;
  readonly reason?: string;
}

export interface GovernanceProcessingPipelineOptions {
  readonly idempotencyStore?: IdempotencyStorePort;
}

/**
 * Bounded Command Dispatcher (GL-IMPL-UNIT-003).
 * Identifies command discriminators, verifies version support, and parses typed payload against registered schema.
 * Does NOT execute downstream command handlers.
 */
export function dispatchGovernanceCommand(input: unknown): CommandDispatchResult {
  const parseResult = parseGovernanceCommandEnvelope(input);
  if (!parseResult.ok) {
    if (
      typeof input === 'object' &&
      input !== null &&
      'commandType' in input &&
      typeof (input as Record<string, unknown>).commandType === 'string'
    ) {
      const issues = parseResult.error.details?.issues as z.ZodIssue[] | undefined;
      const isCommandTypeOnlyError =
        issues && issues.length > 0 && issues.every((issue) => issue.path[0] === 'commandType');
      if (isCommandTypeOnlyError) {
        return {
          ok: false,
          outcome: 'UNKNOWN_COMMAND_TYPE',
          commandType: String((input as Record<string, unknown>).commandType),
          error: parseResult.error,
        };
      }
    }
    return {
      ok: false,
      outcome: 'INVALID_COMMAND_ENVELOPE',
      error: parseResult.error,
    };
  }

  const envelope = parseResult.data;
  const typeCheck = CommandTypeEnumSchema.safeParse(envelope.commandType);
  if (!typeCheck.success) {
    return {
      ok: false,
      outcome: 'UNKNOWN_COMMAND_TYPE',
      commandType: envelope.commandType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: new RuntimeInvariantError(`Unknown command type '${envelope.commandType}'`),
    };
  }

  const isSupported = IsSupportedCommandPayloadVersion(envelope.commandType, envelope.payloadVersion);
  if (!isSupported) {
    return {
      ok: false,
      outcome: 'UNSUPPORTED_COMMAND_PAYLOAD_VERSION',
      commandType: envelope.commandType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: new RuntimeInvariantError(
        `Unsupported payload version '${envelope.payloadVersion}' for command '${envelope.commandType}'`
      ),
    };
  }

  const schema = CommandPayloadSchemaRegistry.getSchema(envelope.commandType, envelope.payloadVersion);
  if (!schema) {
    return {
      ok: false,
      outcome: 'UNSUPPORTED_COMMAND_PAYLOAD_VERSION',
      commandType: envelope.commandType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: new RuntimeInvariantError(
        `No schema registered for command '${envelope.commandType}' version '${envelope.payloadVersion}'`
      ),
    };
  }

  const payloadResult = parsePayloadWithSchema(envelope.payload, schema);
  if (!payloadResult.ok) {
    return {
      ok: false,
      outcome: 'INVALID_SUPPORTED_COMMAND_PAYLOAD',
      commandType: envelope.commandType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: payloadResult.error,
    };
  }

  return {
    ok: true,
    outcome: 'SUPPORTED_KNOWN_COMMAND',
    commandType: envelope.commandType,
    payloadVersion: envelope.payloadVersion,
    envelope,
    payload: payloadResult.data,
  };
}

/**
 * Bounded Event Dispatcher (GL-IMPL-UNIT-003).
 * Identifies event discriminators, verifies version support, and parses typed payload against registered schema.
 * Does NOT construct or emit domain events.
 */
export function dispatchGovernanceEvent(input: unknown): EventDispatchResult {
  const parseResult = parseGovernanceEventEnvelope(input);
  if (!parseResult.ok) {
    if (
      typeof input === 'object' &&
      input !== null &&
      'eventType' in input &&
      typeof (input as Record<string, unknown>).eventType === 'string'
    ) {
      const issues = parseResult.error.details?.issues as z.ZodIssue[] | undefined;
      const isEventTypeOnlyError =
        issues && issues.length > 0 && issues.every((issue) => issue.path[0] === 'eventType');
      if (isEventTypeOnlyError) {
        return {
          ok: false,
          outcome: 'UNKNOWN_EVENT_TYPE',
          eventType: String((input as Record<string, unknown>).eventType),
          error: parseResult.error,
        };
      }
    }
    return {
      ok: false,
      outcome: 'INVALID_EVENT_ENVELOPE',
      error: parseResult.error,
    };
  }

  const envelope = parseResult.data;
  const typeCheck = EventTypeEnumSchema.safeParse(envelope.eventType);
  if (!typeCheck.success) {
    return {
      ok: false,
      outcome: 'UNKNOWN_EVENT_TYPE',
      eventType: envelope.eventType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: new RuntimeInvariantError(`Unknown event type '${envelope.eventType}'`),
    };
  }

  const isSupported = IsSupportedEventPayloadVersion(envelope.eventType, envelope.payloadVersion);
  if (!isSupported) {
    return {
      ok: false,
      outcome: 'UNSUPPORTED_EVENT_PAYLOAD_VERSION',
      eventType: envelope.eventType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: new RuntimeInvariantError(
        `Unsupported payload version '${envelope.payloadVersion}' for event '${envelope.eventType}'`
      ),
    };
  }

  const schema = EventPayloadSchemaRegistry.getSchema(envelope.eventType, envelope.payloadVersion);
  if (!schema) {
    return {
      ok: false,
      outcome: 'UNSUPPORTED_EVENT_PAYLOAD_VERSION',
      eventType: envelope.eventType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: new RuntimeInvariantError(
        `No schema registered for event '${envelope.eventType}' version '${envelope.payloadVersion}'`
      ),
    };
  }

  const payloadResult = parsePayloadWithSchema(envelope.payload, schema);
  if (!payloadResult.ok) {
    return {
      ok: false,
      outcome: 'INVALID_SUPPORTED_EVENT_PAYLOAD',
      eventType: envelope.eventType,
      payloadVersion: envelope.payloadVersion,
      envelope,
      error: payloadResult.error,
    };
  }

  return {
    ok: true,
    outcome: 'SUPPORTED_KNOWN_EVENT',
    eventType: envelope.eventType,
    payloadVersion: envelope.payloadVersion,
    envelope,
    payload: payloadResult.data,
  };
}

/**
 * 11-Stage Governed Learning Runtime Processing Pipeline (GL-IMPL-UNIT-003).
 * Orchestrates pre-handler processing stages sequentially and short-circuits deterministically on stage failure.
 */
export class GovernanceProcessingPipeline {
  private readonly idempotencyStore?: IdempotencyStorePort;

  constructor(options?: GovernanceProcessingPipelineOptions) {
    this.idempotencyStore = options?.idempotencyStore;
  }

  private readonly STAGE_SEQUENCE: ReadonlyArray<PipelineStageId> = [
    'ENVELOPE_STRUCTURAL_PARSE',
    'TYPE_DISCRIMINATOR_CHECK',
    'VERSION_SUPPORT_CHECK',
    'PAYLOAD_STRUCTURAL_PARSE',
    'ACTOR_REF_STRUCTURAL_CHECK',
    'AUTHORITY_CONTEXT_REF_CHECK',
    'PROVENANCE_REF_CHECK',
    'IDEMPOTENCY_DETERMINISTIC_CHECK',
    'CONCURRENCY_CONTROL_CHECK',
    'DETERMINISTIC_POLICY_GATE',
    'DISPATCH_ROUTER',
  ];

  processCommand(input: unknown): PipelineExecutionReport<CommandDispatchResult> {
    const outcomes: RuntimeExecutionStageOutcome[] = [];
    const timestamp = new Date().toISOString();
    let currentEnvelope: GovernanceCommandEnvelope | undefined;
    let failedStage: PipelineStageId | undefined;
    let stageError: GovernedLearningRuntimeError | undefined;
    let stageRefusalCode: RefusalCodeEnum | undefined;
    let stageRefusalReason: string | undefined;

    for (let i = 0; i < this.STAGE_SEQUENCE.length; i++) {
      const stageId = this.STAGE_SEQUENCE[i];

      if (failedStage) {
        outcomes.push({
          stageId,
          status: 'SKIPPED',
          timestamp,
        });
        continue;
      }

      let stageSuccess = true;

      switch (stageId) {
        case 'ENVELOPE_STRUCTURAL_PARSE': {
          const res = parseGovernanceCommandEnvelope(input);
          if (!res.ok) {
            stageSuccess = false;
            stageError = res.error;
          } else {
            currentEnvelope = res.data;
          }
          break;
        }

        case 'TYPE_DISCRIMINATOR_CHECK': {
          if (!currentEnvelope) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError('Missing command envelope for type check');
          } else {
            const check = CommandTypeEnumSchema.safeParse(currentEnvelope.commandType);
            if (!check.success) {
              stageSuccess = false;
              stageError = new RuntimeInvariantError(`Unknown command type '${currentEnvelope.commandType}'`);
            }
          }
          break;
        }

        case 'VERSION_SUPPORT_CHECK': {
          if (!currentEnvelope) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError('Missing command envelope for version check');
          } else if (!IsSupportedCommandPayloadVersion(currentEnvelope.commandType, currentEnvelope.payloadVersion)) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError(
              `Unsupported payload version '${currentEnvelope.payloadVersion}' for command '${currentEnvelope.commandType}'`
            );
          }
          break;
        }

        case 'PAYLOAD_STRUCTURAL_PARSE': {
          if (!currentEnvelope) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError('Missing command envelope for payload parse');
          } else {
            const schema = CommandPayloadSchemaRegistry.getSchema(
              currentEnvelope.commandType,
              currentEnvelope.payloadVersion
            );
            if (!schema) {
              stageSuccess = false;
              stageError = new RuntimeInvariantError(
                `No payload schema registered for command '${currentEnvelope.commandType}'`
              );
            } else {
              const res = parsePayloadWithSchema(currentEnvelope.payload, schema);
              if (!res.ok) {
                stageSuccess = false;
                stageError = res.error;
              }
            }
          }
          break;
        }

        case 'ACTOR_REF_STRUCTURAL_CHECK': {
          if (!currentEnvelope) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError('Missing command envelope for actorRef check');
          } else {
            const res = parseActorIdentityRef(currentEnvelope.actorRef);
            if (!res.ok) {
              stageSuccess = false;
              stageError = res.error;
            }
          }
          break;
        }

        case 'AUTHORITY_CONTEXT_REF_CHECK': {
          if (!currentEnvelope) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError('Missing command envelope for authorityContextRef check');
          } else {
            const res = parseAuthorityContextRef(currentEnvelope.authorityContextRef);
            if (!res.ok) {
              stageSuccess = false;
              stageError = res.error;
            }
          }
          break;
        }

        case 'PROVENANCE_REF_CHECK': {
          // Structural presence of attribution metadata (OPEN-GL-RUNTIME-002 preserved)
          if (!currentEnvelope || !currentEnvelope.issuedAt || !currentEnvelope.actorRef) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError('Missing required provenance/attribution metadata');
          }
          break;
        }

        case 'IDEMPOTENCY_DETERMINISTIC_CHECK': {
          if (this.idempotencyStore && currentEnvelope) {
            const lookupRes = this.idempotencyStore.getCommandExecution(currentEnvelope.commandId);
            if (!lookupRes.ok) {
              stageSuccess = false;
              stageError = lookupRes.category === 'ERROR' ? lookupRes.error : new RuntimeInvariantError('Idempotency store lookup failed');
            } else if (lookupRes.data) {
              const existingRecord = lookupRes.data;
              const currentFingerprint = createCommandFingerprint(currentEnvelope);

              // Verify fingerprint match and immutable issuedAt timestamp match
              const isFingerprintMatch = existingRecord.commandFingerprint === currentFingerprint;
              const isIssuedAtMatch = !existingRecord.issuedAt || existingRecord.issuedAt === currentEnvelope.issuedAt;

              if (isFingerprintMatch && isIssuedAtMatch) {
                // Exact Retry (Case B)
                outcomes.push({
                  stageId,
                  status: 'COMPLETED',
                  timestamp,
                });

                // Mark downstream stages as SKIPPED
                for (let j = i + 1; j < this.STAGE_SEQUENCE.length; j++) {
                  outcomes.push({
                    stageId: this.STAGE_SEQUENCE[j],
                    status: 'SKIPPED',
                    timestamp,
                  });
                }

                const dispatchRes: CommandDispatchResult = {
                  ok: existingRecord.executionOutcome.ok,
                  outcome: 'SUPPORTED_KNOWN_COMMAND',
                  commandType: currentEnvelope.commandType,
                  payloadVersion: currentEnvelope.payloadVersion,
                  envelope: currentEnvelope,
                  payload: currentEnvelope.payload,
                };

                return {
                  ok: true,
                  category: 'SUCCESS',
                  currentStage: stageId,
                  stageOutcomes: outcomes,
                  data: dispatchRes,
                  metadata: {
                    replayedResult: true,
                    cachedRecord: existingRecord,
                  },
                };
              } else {
                // Identity Collision (Case C) - different payload, actor, authority, issuedAt, commandType, or payloadVersion
                stageSuccess = false;
                stageRefusalCode = 'REFUSAL_INVARIANT_VIOLATION';
                let mismatchDetail = 'mismatched fingerprint, payload, actor, authority, commandType, or version';
                if (!isIssuedAtMatch) {
                  mismatchDetail = `issuedAt immutable timestamp mismatch ('${existingRecord.issuedAt}' vs '${currentEnvelope.issuedAt}')`;
                }
                stageRefusalReason = `Command identity collision for commandId '${currentEnvelope.commandId}' due to ${mismatchDetail}`;
                stageError = new RuntimeInvariantError(stageRefusalReason);
              }
            }
          }
          break;
        }

        case 'CONCURRENCY_CONTROL_CHECK': {
          // Pass-through orchestration boundary placeholder (OPEN-GL-RUNTIME-006 strategy execution deferred)
          break;
        }

        case 'DETERMINISTIC_POLICY_GATE': {
          // Pre-dispatch deterministic precondition gate
          if (!currentEnvelope) {
            stageSuccess = false;
            stageError = new RuntimeInvariantError('Missing command envelope at policy gate');
          }
          break;
        }

        case 'DISPATCH_ROUTER': {
          // Final stage: Invoke bounded command dispatcher
          const dispatchRes = dispatchGovernanceCommand(input);
          if (!dispatchRes.ok) {
            stageSuccess = false;
            stageError = dispatchRes.error ?? new RuntimeInvariantError('Command dispatch failed');
          } else {
            outcomes.push({
              stageId,
              status: 'COMPLETED',
              timestamp,
            });
            return {
              ok: true,
              category: 'SUCCESS',
              currentStage: stageId,
              stageOutcomes: outcomes,
              data: dispatchRes,
            };
          }
          break;
        }
      }

      if (stageSuccess) {
        outcomes.push({
          stageId,
          status: 'COMPLETED',
          timestamp,
        });
      } else {
        failedStage = stageId;
        outcomes.push({
          stageId,
          status: 'FAILED',
          timestamp,
        });
      }
    }

    if (stageRefusalCode) {
      return {
        ok: false,
        category: 'REFUSED',
        currentStage: failedStage ?? 'IDEMPOTENCY_DETERMINISTIC_CHECK',
        stageOutcomes: outcomes,
        refusalCode: stageRefusalCode,
        reason: stageRefusalReason ?? 'Command execution refused',
        error: stageError,
      };
    }

    return {
      ok: false,
      category: 'ERROR',
      currentStage: failedStage ?? 'ENVELOPE_STRUCTURAL_PARSE',
      stageOutcomes: outcomes,
      error: stageError ?? new RuntimeInvariantError('Pipeline execution failed'),
    };
  }
}
