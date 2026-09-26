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
 * Default canonical rule provider based on docs/portfolio-readiness-rule.md
 */
export class CanonicalPortfolioReadinessRuleProvider
  implements PortfolioReadinessRuleProvider
{
  private static readonly RULE_VERSION = 'v1.0';

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
    },
    {
      requirementId: 'REQ-ACTIVE-WHITELIST-06',
      dimensionName: 'active_portfolio_eligibility',
      description: 'Active Portfolio Whitelist Inclusion',
      sourceRuleRef: 'docs/portfolio-readiness-rule.md#2',
      blocking: true,
      evidenceRequired: true
    }
  ];

  private static readonly ACTIVE_WHITELIST: string[] = [
    'BridGenta Reconstruction Platform',
    'AEOcortex',
    'Lumina Praxis',
    'Rooted Reality Gardens',
    'StarCleaners'
  ];

  getRuleVersion(): string {
    return CanonicalPortfolioReadinessRuleProvider.RULE_VERSION;
  }

  getRequirements(): ReadinessRequirementDefinition[] {
    return [...CanonicalPortfolioReadinessRuleProvider.REQUIREMENTS];
  }

  getActiveProjectWhitelist(): string[] {
    return [...CanonicalPortfolioReadinessRuleProvider.ACTIVE_WHITELIST];
  }
}

/**
 * Service for evaluating project and candidate publication & portfolio readiness.
 */
export class PublicationReadinessEvaluationService {
  private readonly ruleProvider: PortfolioReadinessRuleProvider;
  private readonly evidenceRepository?: ReadinessEvidenceRepository;

  constructor(
    ruleProvider: PortfolioReadinessRuleProvider = new CanonicalPortfolioReadinessRuleProvider(),
    evidenceRepository?: ReadinessEvidenceRepository
  ) {
    if (!ruleProvider) {
      throw new Error('Explicit ruleProvider is required');
    }
    this.ruleProvider = ruleProvider;
    this.evidenceRepository = evidenceRepository;
  }

  /**
   * Evaluates readiness evidence for a project or publication candidate.
   * Completely side-effect free: does not publish, mutate lifecycle, write sitemaps, or request indexing.
   */
  async evaluateReadiness(
    input: PortfolioReadinessEvaluationInput
  ): Promise<PortfolioReadinessEvaluationResult> {
    const evaluatedAt = input.issuedAt || new Date('2026-01-01T00:00:00Z').toISOString();

    const authorityBoundary: ReadinessAuthorityBoundary = {
      finalPublicationAuthority: 'M5 / PRAG Governance',
      beccOwnsFinalAuthority: false,
      sideEffectsExecuted: false,
      evaluationOnly: true
    };

    try {
      if (!input || !input.projectRef || !input.evaluationId) {
        return {
          evaluationId: input?.evaluationId || 'unknown-eval-id',
          projectRef: input?.projectRef || 'unknown-project',
          candidateRef: input?.candidateRef,
          status: 'ERROR',
          ruleVersion: this.ruleProvider.getRuleVersion(),
          evaluatedRequirements: [],
          satisfiedRequirementIds: [],
          blockingRequirementIds: [],
          missingEvidenceRequirementIds: [],
          conflictingEvidenceRequirementIds: [],
          evidenceRefs: [],
          evaluatedAt,
          authorityBoundary
        };
      }

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
          return {
            evaluationId: input.evaluationId,
            projectRef: input.projectRef,
            candidateRef: input.candidateRef,
            status: 'ERROR',
            ruleVersion: this.ruleProvider.getRuleVersion(),
            evaluatedRequirements: [],
            satisfiedRequirementIds: [],
            blockingRequirementIds: [],
            missingEvidenceRequirementIds: [],
            conflictingEvidenceRequirementIds: [],
            evidenceRefs: [],
            evaluatedAt,
            authorityBoundary
          };
        }
      }

      const definedRequirements = this.ruleProvider.getRequirements();
      const whitelist = this.ruleProvider.getActiveProjectWhitelist();

      const reqIdSet = new Set(definedRequirements.map((r) => r.requirementId));

      // Check for unknown requirement references in evidence
      for (const item of combinedEvidence) {
        if (!reqIdSet.has(item.requirementId)) {
          // Unknown requirement evidence triggers fail-closed ERROR
          return {
            evaluationId: input.evaluationId,
            projectRef: input.projectRef,
            candidateRef: input.candidateRef,
            status: 'ERROR',
            ruleVersion: this.ruleProvider.getRuleVersion(),
            evaluatedRequirements: [],
            satisfiedRequirementIds: [],
            blockingRequirementIds: [],
            missingEvidenceRequirementIds: [],
            conflictingEvidenceRequirementIds: [],
            evidenceRefs: combinedEvidence.map((e) => e.evidenceId),
            evaluatedAt,
            authorityBoundary
          };
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

        // Handle Active Whitelist requirement explicitly if projectRef matches
        if (req.requirementId === 'REQ-ACTIVE-WHITELIST-06') {
          const isWhitelisted = whitelist.includes(input.projectRef);
          if (matchingEvidence.length === 0) {
            const status = isWhitelisted ? 'SATISFIED' : 'NOT_SATISFIED';
            const reason = isWhitelisted
              ? `Project '${input.projectRef}' is explicitly on active portfolio whitelist.`
              : `Project '${input.projectRef}' is not on active portfolio whitelist.`;
            evaluatedRequirements.push({
              requirementId: req.requirementId,
              dimensionName: req.dimensionName,
              description: req.description,
              sourceRuleRef: req.sourceRuleRef,
              blocking: req.blocking,
              status,
              evidenceRefs: [],
              reason
            });

            if (status === 'SATISFIED') {
              satisfiedRequirementIds.push(req.requirementId);
            } else {
              if (req.blocking) {
                blockingRequirementIds.push(req.requirementId);
                hasUnsatisfiedBlockingRequirement = true;
              }
            }
            continue;
          }
        }

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

      return {
        evaluationId: input.evaluationId,
        projectRef: input.projectRef,
        candidateRef: input.candidateRef,
        status: overallStatus,
        ruleVersion: this.ruleProvider.getRuleVersion(),
        evaluatedRequirements,
        satisfiedRequirementIds,
        blockingRequirementIds,
        missingEvidenceRequirementIds,
        conflictingEvidenceRequirementIds,
        evidenceRefs: allEvidenceRefs,
        evaluatedAt,
        authorityBoundary
      };
    } catch (error) {
      return {
        evaluationId: input?.evaluationId || 'error-eval-id',
        projectRef: input?.projectRef || 'unknown-project',
        candidateRef: input?.candidateRef,
        status: 'ERROR',
        ruleVersion: this.ruleProvider.getRuleVersion(),
        evaluatedRequirements: [],
        satisfiedRequirementIds: [],
        blockingRequirementIds: [],
        missingEvidenceRequirementIds: [],
        conflictingEvidenceRequirementIds: [],
        evidenceRefs: [],
        evaluatedAt,
        authorityBoundary
      };
    }
  }
}
