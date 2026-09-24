import type { TargetRef } from '@cep/governed-learning';
import type {
  GovernedLearningIntegrationAdapter,
  BECCGuidanceQueryInput,
} from '../governed-learning/governed-learning-adapter.types.js';
import type {
  ResolvedGovernedGuidanceQueryInput,
  ResolvedGovernedGuidanceResult,
  BECCGovernedGuidanceItem,
} from './governed-guidance-resolver.types.js';

export interface GovernedGuidanceResolverOptions {
  readonly adapter: GovernedLearningIntegrationAdapter;
}

/**
 * GovernedGuidanceResolverService
 * BECC v2 Knowledge Resolver service for querying and resolving governed guidance from Governed Learning.
 *
 * Guarantees:
 * 1. Communicates with Governed Learning strictly via public GovernedLearningIntegrationAdapter gateway.
 * 2. NO direct database table access (PostgreSQL/SQLite) or transaction context leakage.
 * 3. NO duplication of Governed Learning eligibility, status filtering, deduplication, Stage 8, or Stage 9 logic.
 * 4. Fails closed if BECC context cannot be mapped unambiguously to a TargetRef (never broadens scope to SYSTEM_WIDE).
 * 5. Requires explicit adapter injection (no silent fallback to unconfigured runtime).
 * 6. Preserves evaluatedAt, replayed signal, and full provenance (lessonRef, version, statement, rationale, scope).
 * 7. Distinguishes valid empty guidance store (SUCCESS with guidanceItems: []) from query failure (ERROR/REFUSED).
 * 8. NO automatic policy enforcement or decision mutation (BECC consumes guidance; GL decides what counts as guidance).
 */
export class GovernedGuidanceResolverService {
  private readonly adapter: GovernedLearningIntegrationAdapter;

  constructor(options: GovernedGuidanceResolverOptions) {
    if (!options || !options.adapter) {
      throw new Error(
        'GovernedLearningIntegrationAdapter instance is required for GovernedGuidanceResolverService construction. Silent fallback to unconfigured runtime is forbidden.'
      );
    }
    this.adapter = options.adapter;
  }

  /**
   * Resolves applicable governed guidance for a given BECC execution context.
   */
  public async resolveGuidance(
    input: ResolvedGovernedGuidanceQueryInput
  ): Promise<ResolvedGovernedGuidanceResult> {
    if (!input || !input.queryId || !input.queryId.trim()) {
      return {
        ok: false,
        category: 'REFUSED',
        source: 'GOVERNED_LEARNING',
        commandId: `cmd_becc_invalid_query_id`,
        queryId: input?.queryId ?? 'query_unknown',
        guidanceItems: [],
        replayed: false,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'queryId is required for Governed Learning guidance resolution (failed closed)',
      };
    }

    if (!input.issuedAt || !input.issuedAt.trim()) {
      return {
        ok: false,
        category: 'REFUSED',
        source: 'GOVERNED_LEARNING',
        commandId: `cmd_becc_missing_issued_at_${input.queryId}`,
        queryId: input.queryId,
        guidanceItems: [],
        replayed: false,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'issuedAt timestamp is required for stable command identity (failed closed)',
      };
    }

    // Map BECC context to canonical TargetRef
    let targetRef: TargetRef | undefined;

    if (input.projectRef && input.projectRef.projectId && input.projectRef.projectId.trim()) {
      targetRef = {
        targetCategory: 'PROJECT',
        projectRef: { projectId: input.projectRef.projectId.trim() },
      };
    } else if (input.workstreamRef && input.workstreamRef.workstreamId && input.workstreamRef.workstreamId.trim()) {
      targetRef = {
        targetCategory: 'WORKSTREAM',
        workstreamRef: { workstreamId: input.workstreamRef.workstreamId.trim() },
      };
    } else if (input.assessmentContext) {
      const projId = input.assessmentContext.projectIdentity?.id || input.assessmentContext.project;
      if (projId && projId.trim()) {
        targetRef = {
          targetCategory: 'PROJECT',
          projectRef: { projectId: projId.trim() },
        };
      }
    }

    // Fail closed if context cannot be mapped to TargetRef (never broaden to SYSTEM_WIDE)
    if (!targetRef) {
      return {
        ok: false,
        category: 'REFUSED',
        source: 'GOVERNED_LEARNING',
        commandId: `cmd_becc_unmapped_${input.queryId}`,
        queryId: input.queryId,
        guidanceItems: [],
        replayed: false,
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'BECC context could not be mapped to an unambiguous TargetRef for Governed Learning query (failed closed)',
      };
    }

    const queryInput: BECCGuidanceQueryInput = {
      queryId: input.queryId,
      targetRef,
      matchStrategy: input.matchStrategy ?? 'STRICT',
      actorRef: input.actorRef,
      authorityContextRef: input.authorityContextRef,
      issuedAt: input.issuedAt,
      queryVersion: input.queryVersion,
    };

    const res = await this.adapter.queryGuidance(queryInput);

    if (res.ok && res.category === 'SUCCESS' && res.guidanceSet) {
      const matched = res.guidanceSet.matchedGuidance ?? [];
      const guidanceItems: BECCGovernedGuidanceItem[] = matched.map((g) => ({
        lessonRef: {
          lessonId: g.lessonRef.lessonId,
          version: g.lessonRef.version,
        },
        statement: g.statement,
        rationale: g.rationale,
        scope: g.scope,
      }));

      return {
        ok: true,
        category: 'SUCCESS',
        source: 'GOVERNED_LEARNING',
        commandId: res.commandId,
        queryId: input.queryId,
        guidanceItems: Object.freeze(guidanceItems),
        evaluatedAt: res.guidanceSet.evaluatedAt,
        replayed: res.replayed === true,
      };
    }

    if (res.category === 'REFUSED') {
      return {
        ok: false,
        category: 'REFUSED',
        source: 'GOVERNED_LEARNING',
        commandId: res.commandId,
        queryId: input.queryId,
        guidanceItems: [],
        replayed: res.replayed === true,
        refusalCode: res.refusalCode,
        reason: res.reason,
      };
    }

    return {
      ok: false,
      category: 'ERROR',
      source: 'GOVERNED_LEARNING',
      commandId: res.commandId,
      queryId: input.queryId,
      guidanceItems: [],
      replayed: false,
      errorDetails: res.errorDetails ?? 'Governed Learning query error',
    };
  }
}
