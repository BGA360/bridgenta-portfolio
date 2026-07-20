/**
 * @file evaluator.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Pure Deterministic Rule Evaluator
 */

import { FindingStatus } from '@cep/assessment-core';
import { Evidence } from '@cep/evidence-manager';
import { Rule } from '../domain/rule.aggregate.js';
import {
  RuleResult,
  Finding,
  FindingId,
  Timestamp,
  RuleSeverity,
} from '../domain/types.js';
import { RuleTraceabilityManager } from '../traceability/rule-traceability.js';

export interface EvaluationOutcome {
  readonly result: RuleResult;
  readonly finding?: Finding;
}

export class PureRuleEvaluator {
  /**
   * Evaluates a single Rule against a single Evidence aggregate deterministically.
   * Guaranteed to NOT mutate Evidence or Rule instances.
   *
   * @param rule Active Rule aggregate instance.
   * @param evidence Ingested Evidence aggregate instance.
   * @returns EvaluationOutcome containing RuleResult and optional Finding.
   */
  public static evaluate(rule: Rule, evidence: Evidence): EvaluationOutcome {
    const outcome = rule.evaluate(evidence.raw_payload);
    const now = Timestamp.create();

    const status: FindingStatus = outcome.pass ? FindingStatus.PASS : FindingStatus.FAIL;
    let finding: Finding | undefined = undefined;

    if (!outcome.pass) {
      const findingIdStr = `finding-${rule.id}-${evidence.id}`;
      const findingId = FindingId.create(findingIdStr);

      finding = {
        finding_id: findingId,
        rule_id: rule.id,
        evidence_id: evidence.id,
        severity: rule.metadata.severity,
        status: FindingStatus.FAIL,
        description: outcome.message || `Rule '${rule.metadata.name}' failed evaluation against evidence '${evidence.id}'.`,
        traceability: RuleTraceabilityManager.createReference(rule.traceability.constitutional_source),
        timestamp: now,
      };
    }

    const result: RuleResult = {
      rule_id: rule.id,
      evidence_id: evidence.id,
      status: status,
      message: outcome.message,
      finding_id: finding ? finding.finding_id : undefined,
      evaluated_at: now,
    };

    return { result, finding };
  }
}
