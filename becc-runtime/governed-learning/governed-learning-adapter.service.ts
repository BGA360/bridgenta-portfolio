import {
  GovernedLearningRuntime,
  registerDefaultRuntimeSchemas,
  type GovernanceCommandEnvelope,
  type CommandTypeEnum,
} from '@cep/governed-learning';
import type {
  BECCFindingEscalationInput,
  BECCEscalationResult,
  BECCGuidanceQueryInput,
  BECCGuidanceQueryResult,
  GovernedLearningIntegrationAdapter,
} from './governed-learning-adapter.types.js';
import { deriveGovernedLearningCommandId } from './governed-learning-command-id.js';

export interface DefaultGovernedLearningAdapterOptions {
  readonly runtime: GovernedLearningRuntime;
}

/**
 * DefaultGovernedLearningIntegrationAdapter
 * Bounded implementation of GovernedLearningIntegrationAdapter for BECC v2 platform.
 *
 * Guarantees:
 * 1. Uses ONLY public exported surface of @cep/governed-learning.
 * 2. Communicates strictly via GovernedLearningRuntime.processAndExecuteCommandAsync gateway.
 * 3. NO direct database table reads or writes (PostgreSQL/SQLite).
 * 4. NO transaction context exposure or leakage.
 * 5. NO duplication of Stage 8 idempotency or Stage 9 scope concurrency.
 * 6. Fails closed when required authority context or actor references are missing.
 * 7. Fails closed when evidence location/source artifact reference is missing.
 * 8. Requires explicit GovernedLearningRuntime injection (no silent Level-1 runtime fallback).
 * 9. Transparently preserves Governed Learning runtime categories (SUCCESS, REFUSED, ERROR).
 */
export class DefaultGovernedLearningIntegrationAdapter implements GovernedLearningIntegrationAdapter {
  private readonly runtime: GovernedLearningRuntime;

  constructor(options: DefaultGovernedLearningAdapterOptions) {
    if (!options || !options.runtime) {
      throw new Error(
        'GovernedLearningRuntime instance is required for DefaultGovernedLearningIntegrationAdapter construction. Silent fallback to Level-1 in-memory runtime is forbidden.'
      );
    }
    registerDefaultRuntimeSchemas();
    this.runtime = options.runtime;
  }

  /**
   * Drafts an observation in Governed Learning for a given BECC finding defect.
   */
  public async draftObservation(input: BECCFindingEscalationInput): Promise<BECCEscalationResult> {
    const commandType: CommandTypeEnum = 'DraftObservation';
    const pipelineStep = 'DRAFT';
    const commandId = deriveGovernedLearningCommandId(
      input.findingId,
      commandType,
      pipelineStep,
      input.escalationVersion
    );

    if (!input.authorityContextRef) {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED',
        reason: 'AuthorityContextRef is required for Governed Learning observation escalation (failed closed)',
      };
    }

    if (!input.issuedAt || input.issuedAt.trim() === '') {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
        reason: 'issuedAt timestamp is required for Governed Learning command identity (failed closed)',
      };
    }

    const issuedAt = input.issuedAt;
    const payload = {
      category: input.category,
      statement: input.statement,
    };

    const envelope: GovernanceCommandEnvelope = {
      commandId,
      commandType,
      payloadVersion: '1.0.0',
      issuedAt,
      actorRef: input.actorRef,
      authorityContextRef: input.authorityContextRef,
      payload,
    };

    try {
      const result = await this.runtime.processAndExecuteCommandAsync(envelope);

      if (result.ok && result.category === 'SUCCESS') {
        const data = result.handlerOutcome && result.handlerOutcome.ok ? result.handlerOutcome.data : undefined;
        const observationId = (data as any)?.observationId ?? (data as any)?.observationRef?.observationId;
        const observationRef = observationId ? { observationId } : undefined;

        return {
          ok: true,
          category: 'SUCCESS',
          commandId,
          observationId,
          observationRef,
          data,
          replayed: result.replayedResult === true,
        };
      }

      if (result.category === 'REFUSED') {
        return {
          ok: false,
          category: 'REFUSED',
          commandId,
          refusalCode: result.refusalCode,
          reason: result.reason,
        };
      }

      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: result.error ? String(result.error.message ?? result.error) : 'Runtime execution error',
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Attaches evidence to an existing drafted observation in Governed Learning.
   */
  public async attachEvidence(
    input: BECCFindingEscalationInput,
    observationId: string
  ): Promise<BECCEscalationResult> {
    const commandType: CommandTypeEnum = 'AttachEvidence';
    const pipelineStep = 'ATTACH_EVIDENCE';
    const commandId = deriveGovernedLearningCommandId(
      input.findingId,
      commandType,
      pipelineStep,
      input.escalationVersion
    );

    if (!input.authorityContextRef) {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED',
        reason: 'AuthorityContextRef is required for Governed Learning evidence attachment (failed closed)',
      };
    }

    if (!input.issuedAt || input.issuedAt.trim() === '') {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
        reason: 'issuedAt timestamp is required for Governed Learning command identity (failed closed)',
      };
    }

    const location = input.evidenceLocation ?? input.sourceArtifactRef;
    if (!location || location.trim() === '') {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_INSUFFICIENT_EVIDENCE',
        reason: 'Evidence location or sourceArtifactRef is required for Governed Learning evidence attachment (failed closed)',
      };
    }

    const issuedAt = input.issuedAt;
    const payload = {
      observationRef: { observationId },
      evidenceType: input.evidenceType ?? 'ARTIFACT_DIFF',
      location,
    };

    const envelope: GovernanceCommandEnvelope = {
      commandId,
      commandType,
      payloadVersion: '1.0.0',
      issuedAt,
      actorRef: input.actorRef,
      authorityContextRef: input.authorityContextRef,
      payload,
    };

    try {
      const result = await this.runtime.processAndExecuteCommandAsync(envelope);

      if (result.ok && result.category === 'SUCCESS') {
        const data = result.handlerOutcome && result.handlerOutcome.ok ? result.handlerOutcome.data : undefined;
        return {
          ok: true,
          category: 'SUCCESS',
          commandId,
          data,
          replayed: result.replayedResult === true,
        };
      }

      if (result.category === 'REFUSED') {
        return {
          ok: false,
          category: 'REFUSED',
          commandId,
          refusalCode: result.refusalCode,
          reason: result.reason,
        };
      }

      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: result.error ? String(result.error.message ?? result.error) : 'Runtime execution error',
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Submits a validated observation for Governed Learning pipeline processing.
   */
  public async submitObservation(
    input: BECCFindingEscalationInput,
    observationId: string
  ): Promise<BECCEscalationResult> {
    const commandType: CommandTypeEnum = 'SubmitObservation';
    const pipelineStep = 'SUBMIT';
    const commandId = deriveGovernedLearningCommandId(
      input.findingId,
      commandType,
      pipelineStep,
      input.escalationVersion
    );

    if (!input.authorityContextRef) {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED',
        reason: 'AuthorityContextRef is required for Governed Learning observation submission (failed closed)',
      };
    }

    if (!input.issuedAt || input.issuedAt.trim() === '') {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
        reason: 'issuedAt timestamp is required for Governed Learning command identity (failed closed)',
      };
    }

    const issuedAt = input.issuedAt;
    const payload = {
      observationRef: { observationId },
    };

    const envelope: GovernanceCommandEnvelope = {
      commandId,
      commandType,
      payloadVersion: '1.0.0',
      issuedAt,
      actorRef: input.actorRef,
      authorityContextRef: input.authorityContextRef,
      payload,
    };

    try {
      const result = await this.runtime.processAndExecuteCommandAsync(envelope);

      if (result.ok && result.category === 'SUCCESS') {
        const data = result.handlerOutcome && result.handlerOutcome.ok ? result.handlerOutcome.data : undefined;
        return {
          ok: true,
          category: 'SUCCESS',
          commandId,
          data,
          replayed: result.replayedResult === true,
        };
      }

      if (result.category === 'REFUSED') {
        return {
          ok: false,
          category: 'REFUSED',
          commandId,
          refusalCode: result.refusalCode,
          reason: result.reason,
        };
      }

      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: result.error ? String(result.error.message ?? result.error) : 'Runtime execution error',
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Queries Governed Learning guidance set through the public runtime.
   */
  public async queryGuidance(input: BECCGuidanceQueryInput): Promise<BECCGuidanceQueryResult> {
    const commandType: CommandTypeEnum = 'BuildGuidanceSetQuery';
    const targetCategory = input.targetRef?.targetCategory ?? 'UNKNOWN';
    let targetId = 'unknown';
    if (input.targetRef) {
      if (input.targetRef.targetCategory === 'PROJECT') {
        targetId = input.targetRef.projectRef.projectId;
      } else if (input.targetRef.targetCategory === 'WORKSTREAM') {
        targetId = input.targetRef.workstreamRef.workstreamId;
      } else if (input.targetRef.targetCategory === 'LESSON') {
        targetId = input.targetRef.lessonRef.lessonId;
      }
    }

    const commandId = deriveGovernedLearningCommandId(
      input.queryId,
      commandType,
      `${targetCategory}_${targetId}_${input.matchStrategy ?? 'STRICT'}`,
      input.queryVersion
    );

    if (!input.targetRef) {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
        reason: 'TargetRef is required for Governed Learning guidance query (failed closed)',
      };
    }

    if (!input.authorityContextRef) {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED',
        reason: 'AuthorityContextRef is required for Governed Learning guidance query (failed closed)',
      };
    }

    if (!input.issuedAt || input.issuedAt.trim() === '') {
      return {
        ok: false,
        category: 'REFUSED',
        commandId,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
        reason: 'issuedAt timestamp is required for Governed Learning command identity (failed closed)',
      };
    }

    const issuedAt = input.issuedAt;
    const payload = {
      queryId: input.queryId,
      targetRef: input.targetRef,
      matchStrategy: input.matchStrategy ?? 'STRICT',
    };

    const envelope: GovernanceCommandEnvelope = {
      commandId,
      commandType,
      payloadVersion: '1.0.0',
      issuedAt,
      actorRef: input.actorRef,
      authorityContextRef: input.authorityContextRef,
      payload,
    };

    try {
      const result = await this.runtime.processAndExecuteCommandAsync(envelope);

      if (result.ok && result.category === 'SUCCESS') {
        const handlerOutcome = result.handlerOutcome;
        if (handlerOutcome && handlerOutcome.ok && handlerOutcome.category === 'SUCCESS') {
          const queryResult = handlerOutcome.data as any;
          return {
            ok: true,
            category: 'SUCCESS',
            commandId,
            guidanceSet: queryResult?.guidanceSet,
            replayed: result.replayedResult === true,
          };
        }
      }

      if (result.category === 'REFUSED') {
        return {
          ok: false,
          category: 'REFUSED',
          commandId,
          refusalCode: result.refusalCode,
          reason: result.reason,
        };
      }

      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: result.error ? String(result.error.message ?? result.error) : 'Runtime execution error',
      };
    } catch (err) {
      return {
        ok: false,
        category: 'ERROR',
        commandId,
        errorDetails: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
