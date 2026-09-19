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

export interface CommandHandlerInput<T = unknown> {
  readonly envelope: GovernanceCommandEnvelope;
  readonly payload: T;
}

export type CommandHandlerOutcome<T = unknown> = RuntimeOperationResult<T>;

/**
 * GL-IMPL-UNIT-004: Governed Learning Runtime Command Handlers
 * Executes domain transition logic for accepted commands and produces transition outcome intent DTOs.
 * Preserves separation from event construction, persistence, query/replay, and unresolved governance questions.
 */

export function handleDraftObservationCommand(
  input: CommandHandlerInput<z.infer<typeof DraftObservationCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: true,
    category: 'SUCCESS',
    data: {
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
  _input: CommandHandlerInput<z.infer<typeof BuildGuidanceSetQueryCommandPayloadSchema>>
): CommandHandlerOutcome {
  return {
    ok: false,
    category: 'ERROR',
    error: new RuntimeInvariantError('BuildGuidanceSetQuery is a query payload deferred to query/replay wave'),
  };
}

/**
 * Bounded Command Handler Router (GL-IMPL-UNIT-004).
 * Routes validated command envelope & payload from pipeline to specific handler.
 */
export function executeGovernedCommandHandler(
  envelope: GovernanceCommandEnvelope,
  payload: unknown
): CommandHandlerOutcome {
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
      return handleBuildGuidanceSetQueryCommand({ envelope, payload: payload as any });
    default:
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`No handler registered for commandType '${envelope.commandType}'`),
      };
  }
}
