/**
 * @file index.ts
 * @module @cep/policy-resolver
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-004 (Policy Resolution Contract)
 * @domainConcept Policy Resolution Foundation
 */

import { FindingStatus } from '@cep/assessment-core';

export type PolicyDecisionId = string & { readonly __brand: unique symbol };

export const PolicyDecisionId = {
  create: (id: string): PolicyDecisionId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('PolicyDecisionId must be a non-empty string.');
    }
    return id.trim() as PolicyDecisionId;
  },
};

export enum PolicyStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAIVED = 'WAIVED',
  PENDING = 'PENDING',
}

export enum PolicyLevel {
  LEVEL_0 = 'LEVEL_0',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4',
  LEVEL_5 = 'LEVEL_5',
}

export interface PolicyDecision {
  readonly decision_id: PolicyDecisionId;
  readonly assessment_id: string;
  readonly evaluation_id: string;
  readonly policy_id: string;
  readonly status: PolicyStatus;
  readonly governance_level: PolicyLevel;
  readonly rationale: string;
  readonly timestamp: string;
}

export class PolicyResolverService {
  private readonly decisions = new Map<string, PolicyDecision>();

  public createPolicyDecision(
    assessmentId: string,
    evaluationId: string,
    overallRuleStatus: FindingStatus,
    governanceLevel: PolicyLevel = PolicyLevel.LEVEL_3
  ): PolicyDecision {
    const status = overallRuleStatus === FindingStatus.PASS ? PolicyStatus.APPROVED : PolicyStatus.REJECTED;
    const decisionId = PolicyDecisionId.create(`pd-${assessmentId}-${Date.now()}`);

    const decision: PolicyDecision = {
      decision_id: decisionId,
      assessment_id: assessmentId,
      evaluation_id: evaluationId,
      policy_id: `policy-${governanceLevel.toLowerCase()}`,
      status: status,
      governance_level: governanceLevel,
      rationale: status === PolicyStatus.APPROVED
        ? `Policy evaluation passed for governance ${governanceLevel}.`
        : `Policy evaluation failed for governance ${governanceLevel} due to rule failures.`,
      timestamp: new Date().toISOString(),
    };

    this.decisions.set(decision.decision_id, decision);
    return decision;
  }

  public getPolicyDecision(decisionId: string): PolicyDecision {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`PolicyDecision '${decisionId}' not found.`);
    }
    return decision;
  }
}

export function createPolicyResolverService(): PolicyResolverService {
  return new PolicyResolverService();
}
