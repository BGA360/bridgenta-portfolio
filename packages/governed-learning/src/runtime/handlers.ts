import type { GovernanceCommandEnvelope } from '../contracts/envelopes.js';
import type {
  RuntimeOperationResult,
} from './types.js';
import { RuntimeInvariantError } from './errors.js';
import type {
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
import type { z } from 'zod';
import type { GovernancePersistencePort } from './persistence.js';
import { filterEligibleGuidance } from './eligibility.js';
import type { ApplicableGuidance, ApplicableGuidanceSet, GuidanceQueryResult } from '../contracts/lesson.js';

export interface CommandHandlerInput<T = unknown> {
  readonly envelope: GovernanceCommandEnvelope;
  readonly payload: T;
  readonly persistencePort?: GovernancePersistencePort;
  readonly candidatesOverride?: ReadonlyArray<unknown>;
}

export type CommandHandlerOutcome<T = unknown> = RuntimeOperationResult<T>;

function maybeAsync<T, R>(
  val: Promise<T>,
  fn: (v: T) => R | Promise<R>
): Promise<R>;
function maybeAsync<T, R>(
  val: T,
  fn: (v: T) => R | Promise<R>
): R | Promise<R>;
function maybeAsync<T, R>(
  val: T | Promise<T>,
  fn: (v: T) => R | Promise<R>
): R | Promise<R> {
  if (val && typeof (val as any).then === 'function') {
    return (val as Promise<T>).then(fn);
  }
  return fn(val as T);
}

/**
 * GL-IMPL-UNIT-004: Governed Learning Runtime Command Handlers
 * Executes domain transition logic for accepted commands and produces transition outcome intent DTOs.
 * Preserves separation from event construction, persistence, query/replay, and unresolved governance questions.
 */

export function handleDraftObservationCommand(
  input: CommandHandlerInput<z.infer<typeof DraftObservationCommandPayloadSchema>>
): CommandHandlerOutcome {
  const observationId = `obs_${input.envelope.commandId}`;
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      observationId,
      observationRef: { observationId },
      observationCategory: input.payload.category,
      statement: input.payload.statement,
      state: 'DRAFT',
      actorId: input.envelope.actorRef.actorId,
    },
  };
}

export function handleAttachEvidenceCommand(
  input: CommandHandlerInput<z.infer<typeof AttachEvidenceCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      observationId: input.payload.observationRef.observationId,
      evidenceType: input.payload.evidenceType,
      location: input.payload.location,
      state: 'EVIDENCE_ATTACHED',
    },
  };
}

export function handleSubmitObservationCommand(
  input: CommandHandlerInput<z.infer<typeof SubmitObservationCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      observationId: input.payload.observationRef.observationId,
      state: 'SUBMITTED',
    },
  };
}

export function handleValidateMechanicalObservationCommand(
  input: CommandHandlerInput<z.infer<typeof ValidateMechanicalObservationCommandPayloadSchema>>
): CommandHandlerOutcome {
  const isInvalidated = input.payload.verdict === 'INVALIDATED';
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      observationId: input.payload.observationRef.observationId,
      validationType: 'MECHANICAL',
      verdict: input.payload.verdict,
      state: isInvalidated ? 'INVALIDATED' : 'MECHANICALLY_VALIDATED',
    },
  };
}

export function handleRecordInterpretiveValidationCommand(
  input: CommandHandlerInput<z.infer<typeof RecordInterpretiveValidationCommandPayloadSchema>>
): CommandHandlerOutcome {
  const isInvalidated = input.payload.verdict === 'INVALIDATED';
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      observationId: input.payload.observationRef.observationId,
      validationType: 'INTERPRETIVE',
      verdict: input.payload.verdict,
      decisionId: input.payload.decisionRef.decisionId,
      state: isInvalidated ? 'INVALIDATED' : 'INTERPRETIVELY_VALIDATED',
    },
  };
}

export function handleCreateLessonCandidateCommand(
  input: CommandHandlerInput<z.infer<typeof CreateLessonCandidateCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      statement: input.payload.statement,
      rationale: input.payload.rationale,
      scope: input.payload.scope,
      originatingObservationCount: input.payload.originatingObservationRefs.length,
      state: 'CANDIDATE',
    },
  };
}

export function handleSubmitLessonForReviewCommand(
  input: CommandHandlerInput<z.infer<typeof SubmitLessonForReviewCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      candidateId: input.payload.candidateRef.candidateId,
      state: 'IN_REVIEW',
    },
  };
}

export function handleInvalidateLessonCandidateCommand(
  input: CommandHandlerInput<z.infer<typeof InvalidateLessonCandidateCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      candidateId: input.payload.candidateRef.candidateId,
      reason: input.payload.reason,
      state: 'REJECTED',
    },
  };
}

export function handleApproveLessonCommand(
  input: CommandHandlerInput<z.infer<typeof ApproveLessonCommandPayloadSchema>>
): CommandHandlerOutcome {
  const publishedLessonId = `lsn_${input.payload.candidateRef.candidateId.replace(/^(can_|CAN_?)/, '')}`;
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      lessonId: publishedLessonId,
      version: '1.0.0',
      candidateRef: input.payload.candidateRef,
      decisionRef: input.payload.decisionRef,
      status: 'PUBLISHED',
      publishedAt: input.envelope.issuedAt,
      publishedBy: input.envelope.actorRef,
      authorityContextRef: input.envelope.authorityContextRef,
      nonBinding: true,
    },
  };
}

export function handleRejectLessonCommand(
  input: CommandHandlerInput<z.infer<typeof RejectLessonCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      candidateId: input.payload.candidateRef.candidateId,
      reason: input.payload.reason,
      decisionId: input.payload.decisionRef.decisionId,
      state: 'REJECTED',
    },
  };
}

export function handleRequestLessonRevisionCommand(
  input: CommandHandlerInput<z.infer<typeof RequestLessonRevisionCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      candidateId: input.payload.candidateRef.candidateId,
      feedback: input.payload.feedback,
      decisionId: input.payload.decisionRef.decisionId,
      state: 'REVISION_REQUESTED',
    },
  };
}

export function handleSupersedeLessonCommand(
  input: CommandHandlerInput<z.infer<typeof SupersedeLessonCommandPayloadSchema>>
): CommandHandlerOutcome {
  if (input.payload.supersededLessonRef.lessonId === input.payload.supersedingLessonRef.lessonId) {
    return {
      ok: false,
      category: 'REFUSED',
      refusalCode: 'REFUSAL_CIRCULAR_SUPERCOGNITION',
      reason: 'A lesson cannot supersede itself (circular supersession rejected)',
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      supersededLessonId: input.payload.supersededLessonRef.lessonId,
      supersedingLessonId: input.payload.supersedingLessonRef.lessonId,
      decisionId: input.payload.decisionRef.decisionId,
      state: 'SUPERSEDED',
    },
  };
}

export function handleRetireLessonCommand(
  input: CommandHandlerInput<z.infer<typeof RetireLessonCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      retiredLessonId: input.payload.retiredLessonRef.lessonId,
      reason: input.payload.reason,
      decisionId: input.payload.decisionRef.decisionId,
      state: 'RETIRED',
    },
  };
}

export function handleAdoptProposalCommand(
  input: CommandHandlerInput<z.infer<typeof AdoptProposalCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      adoptionId: `adp_${input.payload.proposalRef.proposalId.replace(/^(prop_|PROP_?)/, '')}`,
      proposalRef: input.payload.proposalRef,
      targetProjectRef: input.payload.targetProjectRef,
      targetWorkstreamRef: input.payload.targetWorkstreamRef,
      status: 'ADOPTED',
      adoptedAt: input.envelope.issuedAt,
      adoptedBy: input.envelope.actorRef,
      decisionRef: input.payload.decisionRef,
    },
  };
}

export const handleAdoptLessonCommand = handleAdoptProposalCommand;

export function handleProposeRuleCandidateCommand(
  input: CommandHandlerInput<z.infer<typeof ProposeRuleCandidateCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
      ruleManifestId: input.payload.ruleManifestId,
      proposedRule: input.payload.proposedRule,
      sourceLessonId: input.payload.sourceLessonRef.lessonId,
      state: 'RULE_CANDIDATE_PROPOSED',
    },
  };
}

export function handleBuildGuidanceSetQueryCommand(
  input: CommandHandlerInput<z.infer<typeof BuildGuidanceSetQueryCommandPayloadSchema>>
): CommandHandlerOutcome | Promise<CommandHandlerOutcome> {
  const payload = input.payload;
  const envelope = input.envelope;

  const fetchCandidatesRes = input.candidatesOverride
    ? { ok: true as const, category: 'SUCCESS' as const, data: input.candidatesOverride }
    : input.persistencePort && input.persistencePort.getLessons
    ? input.persistencePort.getLessons()
    : {
        ok: false as const,
        category: 'ERROR' as const,
        error: new RuntimeInvariantError('BuildGuidanceSetQuery requires GovernancePersistencePort.getLessons capability'),
      };

  const processCandidates = (candRes: RuntimeOperationResult<ReadonlyArray<unknown>>): CommandHandlerOutcome => {
    if (!candRes.ok) {
      if (candRes.category === 'REFUSED') {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: candRes.refusalCode,
          reason: candRes.reason,
        };
      }
      return {
        ok: false,
        category: 'ERROR',
        error: candRes.error ?? new RuntimeInvariantError('Failed to read candidates from persistence port'),
      };
    }

    const candidates = candRes.data ?? [];
    const filterRes = filterEligibleGuidance(candidates, {
      targetRef: payload.targetRef,
    });

    if (!filterRes.ok) {
      if (filterRes.category === 'REFUSED') {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: filterRes.refusalCode,
          reason: filterRes.reason,
        };
      }
      return {
        ok: false,
        category: 'ERROR',
        error: filterRes.error ?? new RuntimeInvariantError('Eligibility filtering error'),
      };
    }

    const rawEligible = filterRes.data.eligibleItems;

    // Deduplicate by lessonId
    const seen = new Set<string>();
    const matchedGuidance: ApplicableGuidance[] = [];

    for (const item of rawEligible) {
      if (!item || typeof item !== 'object') {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError('Guidance candidate record is invalid object'),
        };
      }
      const itemObj = item as Record<string, unknown>;
      const lessonRefObj = (itemObj.lessonRef as Record<string, unknown> | undefined) ?? {};
      const lessonIdRaw = itemObj.lessonId ?? lessonRefObj.lessonId;
      if (!lessonIdRaw || typeof lessonIdRaw !== 'string' || lessonIdRaw === 'lsn_unknown') {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError('Guidance item record is missing valid lessonId'),
        };
      }
      const lessonId = lessonIdRaw;
      if (seen.has(lessonId)) {
        continue;
      }

      const statementRaw = itemObj.statement;
      if (!statementRaw || typeof statementRaw !== 'string') {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError(`Guidance item record ${lessonId} is missing valid statement`),
        };
      }

      const scopeRaw = itemObj.scope;
      if (!scopeRaw || typeof scopeRaw !== 'object' || !('scopeType' in (scopeRaw as object))) {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError(`Guidance item record ${lessonId} is missing valid scope`),
        };
      }

      seen.add(lessonId);
      const version = String(itemObj.version ?? lessonRefObj.version ?? '1.0.0');
      const rationale = typeof itemObj.rationale === 'string' ? itemObj.rationale : '';

      matchedGuidance.push({
        lessonRef: { lessonId, version },
        statement: statementRaw,
        rationale,
        scope: scopeRaw as any,
      });
    }

    const guidanceSet: ApplicableGuidanceSet = {
      queryId: payload.queryId,
      matchedGuidance,
      evaluatedAt: envelope.issuedAt,
      matchStrategy: payload.matchStrategy,
    };

    const queryResult: GuidanceQueryResult = {
      queryId: payload.queryId,
      status: 'SUCCESS',
      guidanceSet,
    };

    return {
      ok: true,
      category: 'SUCCESS',
      data: queryResult,
    };
  };

  if (fetchCandidatesRes && typeof (fetchCandidatesRes as any).then === 'function') {
    return (fetchCandidatesRes as Promise<RuntimeOperationResult<ReadonlyArray<unknown>>>).then(processCandidates);
  }
  return processCandidates(fetchCandidatesRes as RuntimeOperationResult<ReadonlyArray<unknown>>);
}

/**
 * Bounded Command Handler Router (GL-IMPL-UNIT-004).
 * Routes validated command envelope & payload from pipeline to specific handler.
 */
export function executeGovernedCommandHandler(
  envelope: GovernanceCommandEnvelope & { commandType: 'BuildGuidanceSetQuery' },
  payload: unknown,
  persistencePort?: GovernancePersistencePort,
  candidatesOverride?: ReadonlyArray<unknown>
): CommandHandlerOutcome | Promise<CommandHandlerOutcome>;
export function executeGovernedCommandHandler(
  envelope: GovernanceCommandEnvelope,
  payload: unknown,
  persistencePort?: GovernancePersistencePort,
  candidatesOverride?: ReadonlyArray<unknown>
): CommandHandlerOutcome;
export function executeGovernedCommandHandler(
  envelope: GovernanceCommandEnvelope,
  payload: unknown,
  persistencePort?: GovernancePersistencePort,
  candidatesOverride?: ReadonlyArray<unknown>
): CommandHandlerOutcome | Promise<CommandHandlerOutcome> {
  switch (envelope.commandType) {
    case 'DraftObservation':
      return handleDraftObservationCommand({ envelope, payload: payload as any });
    case 'AttachEvidence':
      return handleAttachEvidenceCommand({ envelope, payload: payload as any });
    case 'SubmitObservation':
      return handleSubmitObservationCommand({ envelope, payload: payload as any });
    case 'ValidateMechanicalObservation':
      return handleValidateMechanicalObservationCommand({ envelope, payload: payload as any });
    case 'RecordInterpretiveValidation':
      return handleRecordInterpretiveValidationCommand({ envelope, payload: payload as any });
    case 'CreateLessonCandidate':
      return handleCreateLessonCandidateCommand({ envelope, payload: payload as any });
    case 'SubmitLessonForReview':
      return handleSubmitLessonForReviewCommand({ envelope, payload: payload as any });
    case 'InvalidateLessonCandidate':
      return handleInvalidateLessonCandidateCommand({ envelope, payload: payload as any });
    case 'ApproveLesson':
      return handleApproveLessonCommand({ envelope, payload: payload as any });
    case 'RejectLesson':
      return handleRejectLessonCommand({ envelope, payload: payload as any });
    case 'RequestLessonRevision':
      return handleRequestLessonRevisionCommand({ envelope, payload: payload as any });
    case 'SupersedeLesson':
      return handleSupersedeLessonCommand({ envelope, payload: payload as any });
    case 'RetireLesson':
      return handleRetireLessonCommand({ envelope, payload: payload as any });
    case 'AdoptLesson':
      return handleAdoptLessonCommand({ envelope, payload: payload as any });
    case 'ProposeRuleCandidate':
      return handleProposeRuleCandidateCommand({ envelope, payload: payload as any });
    case 'BuildGuidanceSetQuery':
      return handleBuildGuidanceSetQueryCommand({ envelope, payload: payload as any, persistencePort, candidatesOverride });
    default:
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`No handler registered for commandType '${envelope.commandType}'`),
      };
  }
}

