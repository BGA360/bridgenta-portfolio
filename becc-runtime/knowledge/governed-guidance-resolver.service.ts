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

import type { BeccAuditIntegrationService } from '../audit/audit-integration.service.js';
import type { BeccOperationalObserverPort } from '../observability/observability.port.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';
import type { BeccOperationalContext, BeccOperationalResultStatus } from '../observability/observability.types.js';

export interface GovernedGuidanceResolverOptions {
  readonly adapter: GovernedLearningIntegrationAdapter;
  readonly auditService?: BeccAuditIntegrationService;
  readonly observer?: BeccOperationalObserverPort;
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
  private readonly auditService?: BeccAuditIntegrationService;
  private readonly observer?: BeccOperationalObserverPort;

  constructor(options: GovernedGuidanceResolverOptions) {
    if (!options || !options.adapter) {
      throw new Error(
        'GovernedLearningIntegrationAdapter instance is required for GovernedGuidanceResolverService construction. Silent fallback to unconfigured runtime is forbidden.'
      );
    }
    this.adapter = options.adapter;
    this.auditService = options.auditService;
    this.observer = options.observer;
  }

  /**
   * Resolves applicable governed guidance for a given BECC execution context.
   */
  public async resolveGuidance(
    input: ResolvedGovernedGuidanceQueryInput
  ): Promise<ResolvedGovernedGuidanceResult> {
    const startTime = Date.now();
    const opId = input?.queryId || 'query_unknown';
    const projId = input?.projectRef?.projectId || input?.assessmentContext?.projectIdentity?.id || input?.assessmentContext?.project;
    const workstreamId = input?.workstreamRef?.workstreamId;

    const context: BeccOperationalContext = ObservabilitySecurityPolicy.sanitizeContext({
      operationType: 'GUIDANCE_RESOLUTION',
      operationId: opId,
      correlationRef: opId,
      projectRef: projId,
      workstreamRef: workstreamId,
      occurredAt: new Date().toISOString()
    });

    if (this.observer) {
      try {
        this.observer.operationStarted(context);
      } catch {
        // Failure isolation
      }
    }

    const emitOutcome = (res: ResolvedGovernedGuidanceResult) => {
      const durationMs = Math.max(0, Date.now() - startTime);
      if (this.observer) {
        try {
          const opStatus: BeccOperationalResultStatus = res.ok
            ? 'SUCCESS'
            : (res.category === 'REFUSED' ? 'REFUSED' : 'ERROR');

          if (res.ok || res.category === 'REFUSED') {
            this.observer.operationCompleted(context, {
              operationalResultStatus: opStatus,
              domainResultStatus: res.category,
              durationMs
            });
          } else {
            const safeErr = ObservabilitySecurityPolicy.classifyError(res.errorDetails || res.reason || 'Guidance resolution error');
            this.observer.operationFailed(context, safeErr, {
              operationalResultStatus: 'ERROR',
              domainResultStatus: 'ERROR',
              durationMs
            });
          }
        } catch {
          // Failure isolation
        }
      }
    };

    if (!input || !input.queryId || !input.queryId.trim()) {
      const result: ResolvedGovernedGuidanceResult = {
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
      emitOutcome(result);
      return this.finalizeResultWithAudit(input, result);
    }

    if (!input.issuedAt || !input.issuedAt.trim()) {
      const result: ResolvedGovernedGuidanceResult = {
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
      emitOutcome(result);
      return this.finalizeResultWithAudit(input, result);
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
      const pId = input.assessmentContext.projectIdentity?.id || input.assessmentContext.project;
      if (pId && pId.trim()) {
        targetRef = {
          targetCategory: 'PROJECT',
          projectRef: { projectId: pId.trim() },
        };
      }
    }

    // Fail closed if context cannot be mapped to TargetRef (never broaden to SYSTEM_WIDE)
    if (!targetRef) {
      const result: ResolvedGovernedGuidanceResult = {
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
      emitOutcome(result);
      return this.finalizeResultWithAudit(input, result);
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

    const depStartTime = Date.now();
    let res;
    try {
      res = await this.adapter.queryGuidance(queryInput);
      const depDurationMs = Math.max(0, Date.now() - depStartTime);

      if (this.observer) {
        try {
          const depStatus = res.ok ? 'SUCCESS' : (res.category === 'REFUSED' ? 'SUCCESS' : 'FAILURE');
          const safeErr = !res.ok ? ObservabilitySecurityPolicy.classifyError(res.errorDetails || res.reason || 'GL dependency call failed') : undefined;

          this.observer.dependencyCallObserved({
            dependencyName: 'GOVERNED_LEARNING',
            operation: 'queryGuidance',
            status: depStatus,
            durationMs: depDurationMs,
            errorClass: safeErr?.errorClass,
            safeErrorCode: res.refusalCode || safeErr?.safeErrorCode,
            occurredAt: new Date().toISOString()
          });
        } catch {
          // Failure isolation
        }
      }
    } catch (err) {
      const depDurationMs = Math.max(0, Date.now() - depStartTime);
      if (this.observer) {
        try {
          const safeErr = ObservabilitySecurityPolicy.classifyError(err, 'DEPENDENCY_UNAVAILABLE');
          this.observer.dependencyCallObserved({
            dependencyName: 'GOVERNED_LEARNING',
            operation: 'queryGuidance',
            status: 'FAILURE',
            durationMs: depDurationMs,
            errorClass: safeErr.errorClass,
            safeErrorCode: safeErr.safeErrorCode,
            occurredAt: new Date().toISOString()
          });
        } catch {
          // Failure isolation
        }
      }
      throw err;
    }

    let result: ResolvedGovernedGuidanceResult;
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

      result = {
        ok: true,
        category: 'SUCCESS',
        source: 'GOVERNED_LEARNING',
        commandId: res.commandId,
        queryId: input.queryId,
        guidanceItems: Object.freeze(guidanceItems),
        evaluatedAt: res.guidanceSet.evaluatedAt,
        replayed: res.replayed === true,
      };
    } else if (res.category === 'REFUSED') {
      result = {
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
    } else {
      result = {
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

    emitOutcome(result);
    return this.finalizeResultWithAudit(input, result);
  }

  private async finalizeResultWithAudit(
    input: ResolvedGovernedGuidanceQueryInput | undefined,
    result: ResolvedGovernedGuidanceResult
  ): Promise<ResolvedGovernedGuidanceResult> {
    if (!this.auditService || !input || !input.issuedAt || isNaN(Date.parse(input.issuedAt))) {
      return result;
    }

    try {
      await this.auditService.recordGuidanceQueryAudit({
        queryInput: {
          commandId: result.commandId,
          actorRef: typeof input.actorRef === 'string' ? input.actorRef : (input.actorRef as any)?.actorId
        },
        queryResult: {
          status: result.ok ? 'SUCCESS' : (result.category === 'REFUSED' ? 'REFUSED' : 'ERROR'),
          guidanceSet: {
            lessons: (result.guidanceItems || []).map((g) => ({
              lessonRef: g.lessonRef.lessonId,
              version: g.lessonRef.version
            }))
          }
        },
        occurredAt: input.issuedAt
      });
    } catch (_err) {
      // Audit recording is BEST_EFFORT, domain result is unaffected
    }

    return result;
  }
}
