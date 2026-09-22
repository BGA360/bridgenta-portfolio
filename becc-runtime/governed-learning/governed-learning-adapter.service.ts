import {
  GovernedLearningRuntime,
  registerDefaultRuntimeSchemas,
  type GovernanceCommandEnvelope,
  type CommandTypeEnum,
} from '@cep/governed-learning';
import type {
  BECCFindingEscalationInput,
  BECCEscalationResult,
  GovernedLearningIntegrationAdapter,
} from './governed-learning-adapter.types.js';
import { deriveGovernedLearningCommandId } from './governed-learning-command-id.js';

export interface DefaultGovernedLearningAdapterOptions {
  readonly runtime?: GovernedLearningRuntime;
}

/**
 * DefaultGovernedLearningIntegrationAdapter
 * Bounded implementation of GovernedLearningIntegrationAdapter for BECC v2 platform.
 *
 * Guarantees:
 * 1. Uses ONLY public exported surface of @cep/governed-learning.
 * 2. Communicates strictly via GovernedLearningRuntime.processAndExecuteCommandAsync gateway.
 * 3. NO direct database table reads or writes (PostgreSQL/SQLite).
 * 4. NO TransactionContext exposure or leakage.
 * 5. NO duplication of Stage 8 idempotency or Stage 9 scope concurrency.
 * 6. Fails closed when required authority context or actor references are missing.
 * 7. Transparently preserves Governed Learning runtime categories (SUCCESS, REFUSED, ERROR).
 */
export class DefaultGovernedLearningIntegrationAdapter implements GovernedLearningIntegrationAdapter {
  private readonly runtime: GovernedLearningRuntime;

  constructor(options: DefaultGovernedLearningAdapterOptions = {}) {
    registerDefaultRuntimeSchemas();
    this.runtime = options.runtime ?? new GovernedLearningRuntime();
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

    const issuedAt = new Date().toISOString();
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
        return {
          ok: true,
          category: 'SUCCESS',
          commandId,
          data,
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

    const issuedAt = new Date().toISOString();
    const payload = {
      observationRef: { observationId },
      evidenceType: input.evidenceType ?? 'ARTIFACT_DIFF',
      location: input.evidenceLocation ?? input.sourceArtifactRef ?? 'file:///unknown_evidence',
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

    const issuedAt = new Date().toISOString();
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
}
