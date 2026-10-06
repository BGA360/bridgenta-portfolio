/**
 * BECC v2 — Publication & Portfolio Readiness Evaluation Service
 *
 * Implements BECC-V2-IMPL-015: Bounded evaluation service that evaluates whether
 * a project or candidate satisfies the observable and contractually defined readiness
 * conditions required by docs/portfolio-readiness-rule.md.
 *
 * AUTHORITY BOUNDARY:
 * BECC computes publication-readiness evidence and reports status, but final
 * publication release decisions remain under M5 / PRAG governance.
 * BECC_OWNS_FINAL_PUBLICATION_AUTHORITY: NO.
 */

import {
  PortfolioReadinessEvaluationInput,
  PortfolioReadinessEvaluationResult,
  PortfolioReadinessRuleProvider,
  PortfolioReadinessStatus,
  ReadinessEvidenceItem,
  ReadinessEvidenceRepository,
  ReadinessRequirementDefinition,
  SingleRequirementEvaluation,
  ReadinessAuthorityBoundary
} from './publication-readiness.types.js';

/**
 * Default canonical rule provider based strictly on Section 1 of docs/portfolio-readiness-rule.md
 * (5 canonical readiness thresholds).
 */
export class CanonicalPortfolioReadinessRuleProvider
  implements PortfolioReadinessRuleProvider
{
  private static readonly RULE_SOURCE_REF = 'docs/portfolio-readiness-rule.md';

  private static readonly REQUIREMENTS: ReadinessRequirementDefinition[] = [
    {
      requirementId: 'REQ-DEV-MATURITY-01',
      dimensionName: 'development_maturity',
      description: 'Development Maturity of at least 50% (Reifegrad >= 50%)',
      sourceRuleRef: 'docs/portfolio-readiness-rule.md#1.1',
      blocking: true,
      evidenceRequired: true
    },
    {
      requirementId: 'REQ-PROF-PURPOSE-02',
      dimensionName: 'professional_purpose',
      description: 'Clear Professional Purpose & Technical Qualifications',
      sourceRuleRef: 'docs/portfolio-readiness-rule.md#1.2',
      blocking: true,
      evidenceRequired: true
    },
    {
      requirementId: 'REQ-VISUAL-EVIDENCE-03',
      dimensionName: 'visual_evidence',
      description: 'Visual Evidence Available (UI Screenshots / System Diagrams)',
      sourceRuleRef: 'docs/portfolio-readiness-rule.md#1.3',
      blocking: true,
      evidenceRequired: true
    },
    {
      requirementId: 'REQ-INTERVIEW-DEF-04',
      dimensionName: 'interview_defensibility',
      description: 'Interview Defensibility of Architecture & Tradeoffs',
      sourceRuleRef: 'docs/portfolio-readiness-rule.md#1.4',
      blocking: true,
      evidenceRequired: true
    },
    {
      requirementId: 'REQ-PUB-STANDARD-05',
      dimensionName: 'publication_standard_compliance',
      description: 'BridGenta Publication Standard Compliance (No secrets/IP leakage)',
      sourceRuleRef: 'docs/portfolio-readiness-rule.md#1.5',
      blocking: true,
      evidenceRequired: true
    }
  ];

  getRuleSource(): { sourceRef: string; sourceRevision?: string } {
    return {
      sourceRef: CanonicalPortfolioReadinessRuleProvider.RULE_SOURCE_REF
    };
  }

  getRequirements(): ReadinessRequirementDefinition[] {
    return [...CanonicalPortfolioReadinessRuleProvider.REQUIREMENTS];
  }
}

import { BeccAuditIntegrationService } from '../audit/audit-integration.service.js';
import { BeccOperationalObserverPort } from '../observability/observability.port.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';
import { BeccOperationalContext, BeccOperationalResultStatus } from '../observability/observability.types.js';

/**
 * Service for evaluating project and candidate publication & portfolio readiness.
 * Requires explicit dependency injection of a PortfolioReadinessRuleProvider.
 */
export class PublicationReadinessEvaluationService {
  private readonly ruleProvider: PortfolioReadinessRuleProvider;
  private readonly evidenceRepository?: ReadinessEvidenceRepository;
  private readonly auditService?: BeccAuditIntegrationService;
  private readonly observer?: BeccOperationalObserverPort;

  constructor(
    ruleProvider: PortfolioReadinessRuleProvider,
    evidenceRepository?: ReadinessEvidenceRepository,
    auditService?: BeccAuditIntegrationService,
    observer?: BeccOperationalObserverPort
  ) {
    if (!ruleProvider) {
      throw new Error('Explicit PortfolioReadinessRuleProvider is required');
    }
    this.ruleProvider = ruleProvider;
    this.evidenceRepository = evidenceRepository;
    this.auditService = auditService;
    this.observer = observer;
  }

  /**
   * Evaluates readiness evidence for a project or publication candidate.
   * Completely side-effect free: does not publish, mutate lifecycle, write sitemaps, or request indexing.
   */
  async evaluateReadiness(
    input: PortfolioReadinessEvaluationInput
  ): Promise<PortfolioReadinessEvaluationResult> {
    const startTime = Date.now();
    const context: BeccOperationalContext = ObservabilitySecurityPolicy.sanitizeContext({
      operationType: 'READINESS_EVALUATION',
      operationId: input?.evaluationId || 'unknown-eval',
      correlationRef: input?.evaluationId || 'unknown-eval',
      projectRef: input?.projectRef,
      occurredAt: new Date().toISOString()
    });

    if (this.observer) {
      try {
        this.observer.operationStarted(context);
      } catch {
        // Failure isolation
      }
    }

    const emitOutcome = (res: PortfolioReadinessEvaluationResult) => {
      const durationMs = Math.max(0, Date.now() - startTime);
      if (this.observer) {
        try {
          let opStatus: BeccOperationalResultStatus;
          if (res.status === 'READY_BY_EVIDENCE') {
            opStatus = 'SUCCESS';
          } else if (res.status === 'NOT_READY') {
            opStatus = 'REFUSED';
          } else if (res.status === 'INDETERMINATE') {
            opStatus = 'INDETERMINATE';
          } else {
            opStatus = 'ERROR';
          }

          if (opStatus === 'ERROR') {
            const safeErr = ObservabilitySecurityPolicy.classifyError('Readiness evaluation error');
            this.observer.operationFailed(context, safeErr, {
              operationalResultStatus: 'ERROR',
              domainResultStatus: res.status,
              durationMs
            });
          } else {
            this.observer.operationCompleted(context, {
              operationalResultStatus: opStatus,
              domainResultStatus: res.status,
              durationMs
            });
          }
        } catch {
          // Failure isolation
        }
      }
    };

    const authorityBoundary: ReadinessAuthorityBoundary = {
      finalPublicationAuthority: 'M5 / PRAG Governance',
      beccOwnsFinalAuthority: false,
      sideEffectsExecuted: false,
      evaluationOnly: true
    };

    const ruleSource = this.ruleProvider.getRuleSource();

    try {
      // Validate input presence and required caller-supplied issuedAt timestamp
      if (!input || !input.projectRef || !input.evaluationId || !input.issuedAt) {
        const result: PortfolioReadinessEvaluationResult = {
          evaluationId: input?.evaluationId || 'unknown-eval-id',
          projectRef: input?.projectRef || 'unknown-project',
          candidateRef: input?.candidateRef,
          status: 'ERROR',
          ruleSourceRef: ruleSource.sourceRef,
          ruleSourceRevision: ruleSource.sourceRevision,
          evaluatedRequirements: [],
          satisfiedRequirementIds: [],
          blockingRequirementIds: [],
          missingEvidenceRequirementIds: [],
          conflictingEvidenceRequirementIds: [],
          evidenceRefs: [],
          evaluatedAt: undefined,
          authorityBoundary
        };
        emitOutcome(result);
        return this.finalizeResultWithAudit(input, result);
      }

      // Validate parseable timestamp format (fail closed if invalid)
      if (isNaN(Date.parse(input.issuedAt))) {
        const result: PortfolioReadinessEvaluationResult = {
          evaluationId: input.evaluationId,
          projectRef: input.projectRef,
          candidateRef: input.candidateRef,
          status: 'ERROR',
          ruleSourceRef: ruleSource.sourceRef,
          ruleSourceRevision: ruleSource.sourceRevision,
          evaluatedRequirements: [],
          satisfiedRequirementIds: [],
          blockingRequirementIds: [],
          missingEvidenceRequirementIds: [],
          conflictingEvidenceRequirementIds: [],
          evidenceRefs: [],
          evaluatedAt: undefined,
          authorityBoundary
        };
        emitOutcome(result);
        return this.finalizeResultWithAudit(input, result);
      }

      const evaluatedAt = input.issuedAt;

      // Merge input evidence with repository evidence if repository is injected
      let combinedEvidence: ReadinessEvidenceItem[] = [...(input.evidenceItems || [])];
      if (this.evidenceRepository) {
        try {
          const repoEvidence = await this.evidenceRepository.fetchEvidenceForProject(
            input.projectRef
          );
          combinedEvidence = [...combinedEvidence, ...repoEvidence];
        } catch (err) {
          // Repository failure must fail closed
          return this.finalizeResultWithAudit(input, {
            evaluationId: input.evaluationId,
            projectRef: input.projectRef,
            candidateRef: input.candidateRef,
            status: 'ERROR',
            ruleSourceRef: ruleSource.sourceRef,
            ruleSourceRevision: ruleSource.sourceRevision,
            evaluatedRequirements: [],
            satisfiedRequirementIds: [],
            blockingRequirementIds: [],
            missingEvidenceRequirementIds: [],
            conflictingEvidenceRequirementIds: [],
            evidenceRefs: [],
            evaluatedAt,
            authorityBoundary
          });
        }
      }

      const definedRequirements = this.ruleProvider.getRequirements();
      const reqIdSet = new Set(definedRequirements.map((r) => r.requirementId));

      // Check for unknown requirement references in evidence
      for (const item of combinedEvidence) {
        if (!reqIdSet.has(item.requirementId)) {
          // Unknown requirement evidence triggers fail-closed ERROR
          return this.finalizeResultWithAudit(input, {
            evaluationId: input.evaluationId,
            projectRef: input.projectRef,
            candidateRef: input.candidateRef,
            status: 'ERROR',
            ruleSourceRef: ruleSource.sourceRef,
            ruleSourceRevision: ruleSource.sourceRevision,
            evaluatedRequirements: [],
            satisfiedRequirementIds: [],
            blockingRequirementIds: [],
            missingEvidenceRequirementIds: [],
            conflictingEvidenceRequirementIds: [],
            evidenceRefs: combinedEvidence.map((e) => e.evidenceId),
            evaluatedAt,
            authorityBoundary
          });
        }
      }

      const evaluatedRequirements: SingleRequirementEvaluation[] = [];
      const satisfiedRequirementIds: string[] = [];
      const blockingRequirementIds: string[] = [];
      const missingEvidenceRequirementIds: string[] = [];
      const conflictingEvidenceRequirementIds: string[] = [];
      const allEvidenceRefs: string[] = [];

      let hasConflictingEvidence = false;
      let hasMissingBlockingEvidence = false;
      let hasUnsatisfiedBlockingRequirement = false;

      for (const req of definedRequirements) {
        const matchingEvidence = combinedEvidence.filter(
          (item) => item.requirementId === req.requirementId
        );

        matchingEvidence.forEach((item) => {
          if (item.evidenceId && !allEvidenceRefs.includes(item.evidenceId)) {
            allEvidenceRefs.push(item.evidenceId);
          }
        });

        if (matchingEvidence.length === 0) {
          missingEvidenceRequirementIds.push(req.requirementId);
          if (req.blocking) {
            blockingRequirementIds.push(req.requirementId);
            hasMissingBlockingEvidence = true;
          }

          evaluatedRequirements.push({
            requirementId: req.requirementId,
            dimensionName: req.dimensionName,
            description: req.description,
            sourceRuleRef: req.sourceRuleRef,
            blocking: req.blocking,
            status: 'MISSING_EVIDENCE',
            evidenceRefs: [],
            reason: `No evidence provided for requirement '${req.requirementId}'.`
          });
          continue;
        }

        // Check for conflicting evidence states among provided items
        const states = Array.from(new Set(matchingEvidence.map((e) => e.state)));
        if (states.length > 1) {
          const hasSatisfied = states.includes('SATISFIED');
          const hasUnsatisfied = states.includes('NOT_SATISFIED') || states.includes('INSUFFICIENT_EVIDENCE');
          if (hasSatisfied && hasUnsatisfied) {
            hasConflictingEvidence = true;
            conflictingEvidenceRequirementIds.push(req.requirementId);
            if (req.blocking) {
              blockingRequirementIds.push(req.requirementId);
            }

            evaluatedRequirements.push({
              requirementId: req.requirementId,
              dimensionName: req.dimensionName,
              description: req.description,
              sourceRuleRef: req.sourceRuleRef,
              blocking: req.blocking,
              status: 'CONFLICTING_EVIDENCE',
              evidenceRefs: matchingEvidence.map((e) => e.evidenceId),
              reason: `Conflicting evidence detected for requirement '${req.requirementId}'.`
            });
            continue;
          }
        }

        // Single primary state
        const primaryState = matchingEvidence[0].state;
        const primaryDetails = matchingEvidence.map((e) => e.details).filter(Boolean).join('; ');

        evaluatedRequirements.push({
          requirementId: req.requirementId,
          dimensionName: req.dimensionName,
          description: req.description,
          sourceRuleRef: req.sourceRuleRef,
          blocking: req.blocking,
          status: primaryState,
          evidenceRefs: matchingEvidence.map((e) => e.evidenceId),
          reason: primaryDetails || `Evidence evaluated with state '${primaryState}'.`
        });

        if (primaryState === 'SATISFIED') {
          satisfiedRequirementIds.push(req.requirementId);
        } else {
          if (req.blocking) {
            blockingRequirementIds.push(req.requirementId);
            if (primaryState === 'MISSING_EVIDENCE') {
              hasMissingBlockingEvidence = true;
            } else {
              hasUnsatisfiedBlockingRequirement = true;
            }
          }
        }
      }

      // Determine top-level readiness status
      let overallStatus: PortfolioReadinessStatus;
      if (hasConflictingEvidence) {
        overallStatus = 'INDETERMINATE';
      } else if (hasUnsatisfiedBlockingRequirement) {
        overallStatus = 'NOT_READY';
      } else if (hasMissingBlockingEvidence) {
        overallStatus = 'NOT_READY';
      } else {
        overallStatus = 'READY_BY_EVIDENCE';
      }

      const result: PortfolioReadinessEvaluationResult = {
        evaluationId: input.evaluationId,
        projectRef: input.projectRef,
        candidateRef: input.candidateRef,
        status: overallStatus,
        ruleSourceRef: ruleSource.sourceRef,
        ruleSourceRevision: ruleSource.sourceRevision,
        evaluatedRequirements,
        satisfiedRequirementIds,
        blockingRequirementIds,
        missingEvidenceRequirementIds,
        conflictingEvidenceRequirementIds,
        evidenceRefs: allEvidenceRefs,
        evaluatedAt,
        authorityBoundary
      };

      emitOutcome(result);
      return this.finalizeResultWithAudit(input, result);
    } catch (error) {
      const catchEvaluatedAt =
        input && input.issuedAt && !isNaN(Date.parse(input.issuedAt)) ? input.issuedAt : undefined;
      const errorResult: PortfolioReadinessEvaluationResult = {
        evaluationId: input?.evaluationId || 'error-eval-id',
        projectRef: input?.projectRef || 'unknown-project',
        candidateRef: input?.candidateRef,
        status: 'ERROR',
        ruleSourceRef: ruleSource.sourceRef,
        ruleSourceRevision: ruleSource.sourceRevision,
        evaluatedRequirements: [],
        satisfiedRequirementIds: [],
        blockingRequirementIds: [],
        missingEvidenceRequirementIds: [],
        conflictingEvidenceRequirementIds: [],
        evidenceRefs: [],
        evaluatedAt: catchEvaluatedAt,
        authorityBoundary
      };
      emitOutcome(errorResult);
      return this.finalizeResultWithAudit(input, errorResult);
    }
  }

  private async finalizeResultWithAudit(
    input: PortfolioReadinessEvaluationInput | undefined,
    result: PortfolioReadinessEvaluationResult
  ): Promise<PortfolioReadinessEvaluationResult> {
    if (!this.auditService || !input || !result) {
      return result;
    }

    const auditTimestamp =
      result.evaluatedAt ||
      (input.issuedAt && !isNaN(Date.parse(input.issuedAt)) ? input.issuedAt : undefined);
    if (!auditTimestamp) {
      return result;
    }

    try {
      await this.auditService.recordReadinessEvaluationAudit({
        evaluationInput: {
          evaluationId: result.evaluationId,
          projectRef: result.projectRef,
          candidateRef: result.candidateRef,
          issuedAt: auditTimestamp,
          evidenceItems: (result.evidenceRefs || []).map((ref) => ({ evidenceId: ref })),
          actorRef: input.actorRef
        },
        evaluationResult: {
          status: result.status,
          ruleSourceRef: result.ruleSourceRef,
          ruleSourceRevision: result.ruleSourceRevision,
          evidenceRefs: result.evidenceRefs || []
        },
        occurredAt: auditTimestamp
      });
    } catch (_err) {
      // BEST_EFFORT audit failure: domain result remains completely unchanged
    }

    return result;
  }
}

/**
 * Composition factory to create a service explicitly wired with CanonicalPortfolioReadinessRuleProvider.
 */
export function createCanonicalPublicationReadinessService(
  evidenceRepository?: ReadinessEvidenceRepository
): PublicationReadinessEvaluationService {
  return new PublicationReadinessEvaluationService(
    new CanonicalPortfolioReadinessRuleProvider(),
    evidenceRepository
  );
}
