/**
 * BECC v2 — Publication & Portfolio Readiness Evaluation Types
 *
 * Implements canonical types for evaluating publication & portfolio readiness
 * as specified in BECC-V2-IMPL-015 and docs/portfolio-readiness-rule.md.
 */

/**
 * State of evidence for an individual readiness requirement.
 */
export type ReadinessEvidenceState =
  | 'SATISFIED'
  | 'NOT_SATISFIED'
  | 'MISSING_EVIDENCE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_APPLICABLE'
  | 'NOT_MEASURABLE'
  | 'CONFLICTING_EVIDENCE';

/**
 * Top-level outcome status of a portfolio readiness evaluation.
 * Note: `READY_BY_EVIDENCE` indicates all required readiness evidence is satisfied.
 * It does NOT grant publication release authority, which belongs exclusively to M5 / PRAG Governance.
 */
export type PortfolioReadinessStatus =
  | 'READY_BY_EVIDENCE'
  | 'NOT_READY'
  | 'INDETERMINATE'
  | 'ERROR';

/**
 * Definition of a portfolio readiness dimension/requirement.
 */
export interface ReadinessRequirementDefinition {
  requirementId: string;
  dimensionName: string;
  description: string;
  sourceRuleRef: string;
  blocking: boolean;
  evidenceRequired: boolean;
}

/**
 * Submitted evidence item for readiness evaluation.
 */
export interface ReadinessEvidenceItem {
  evidenceId: string;
  requirementId: string;
  source: string;
  state: ReadinessEvidenceState;
  details?: string;
  contentHash?: string;
  timestamp?: string;
}

/**
 * Result of evaluating a single requirement.
 */
export interface SingleRequirementEvaluation {
  requirementId: string;
  dimensionName: string;
  description: string;
  sourceRuleRef: string;
  blocking: boolean;
  status: ReadinessEvidenceState;
  evidenceRefs: string[];
  reason: string;
}

/**
 * Input contract for PortfolioReadinessEvaluationService.
 */
export interface PortfolioReadinessEvaluationInput {
  evaluationId: string;
  projectRef: string;
  candidateRef?: string;
  lifecycleContext?: {
    status?: string;
    isPublicRequested?: boolean;
  };
  evidenceItems: ReadinessEvidenceItem[];
  assessmentContextRef?: string;
  ruleVersion?: string;
  issuedAt?: string;
  actorRef?: string;
}

/**
 * Authority boundary declaration returned with every evaluation result.
 */
export interface ReadinessAuthorityBoundary {
  finalPublicationAuthority: 'M5 / PRAG Governance';
  beccOwnsFinalAuthority: false;
  sideEffectsExecuted: false;
  evaluationOnly: true;
}

/**
 * Complete evaluation result contract.
 */
export interface PortfolioReadinessEvaluationResult {
  evaluationId: string;
  projectRef: string;
  candidateRef?: string;
  status: PortfolioReadinessStatus;
  ruleVersion: string;
  evaluatedRequirements: SingleRequirementEvaluation[];
  satisfiedRequirementIds: string[];
  blockingRequirementIds: string[];
  missingEvidenceRequirementIds: string[];
  conflictingEvidenceRequirementIds: string[];
  evidenceRefs: string[];
  evaluatedAt: string;
  authorityBoundary: ReadinessAuthorityBoundary;
}

/**
 * Interface for supplying canonical readiness rules to the evaluator.
 */
export interface PortfolioReadinessRuleProvider {
  getRuleVersion(): string;
  getRequirements(): ReadinessRequirementDefinition[];
  getActiveProjectWhitelist(): string[];
}

/**
 * Interface for injecting an evidence repository.
 */
export interface ReadinessEvidenceRepository {
  fetchEvidenceForProject(projectRef: string): Promise<ReadinessEvidenceItem[]>;
}
