/**
 * @file rule-engine-service.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Engine Application Service
 */

import { FindingStatus } from '@cep/assessment-core';
import { Evidence } from '@cep/evidence-manager';
import {
  RuleId,
  Timestamp,
  RuleEvaluation,
  RuleResult,
  Finding,
  EvaluationTrace,
  RuleStatus,
} from '../domain/types.js';
import { Rule, RuleProps } from '../domain/rule.aggregate.js';
import { PureRuleEvaluator } from '../evaluation/evaluator.js';
import { RuleValidator } from '../validation/rule-validator.js';
import { RuleEvaluationRequestModel, RuleEvaluationResultModel } from '../contracts/rule.contract.js';
import {
  DuplicateRuleError,
  RuleNotFoundError,
} from '../errors/rule.errors.js';
import {
  RuleDomainEvent,
  RuleRegisteredEvent,
  RuleEvaluatedEvent,
  FindingGeneratedEvent,
} from '../events/rule.events.js';

export class RuleEngineService {
  private readonly rules = new Map<string, Rule>();
  private readonly events: RuleDomainEvent[] = [];

  /**
   * Registers a new Rule in the engine registry.
   *
   * @param props Rule properties and evaluator function.
   * @returns Registered Rule aggregate root.
   */
  public registerRule(props: RuleProps): Rule {
    RuleValidator.validateRuleProps(props);

    if (this.rules.has(props.id)) {
      throw new DuplicateRuleError(props.id);
    }

    const rule = new Rule(props);
    this.rules.set(rule.id, rule);

    const event: RuleRegisteredEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'RuleRegistered',
      rule_id: rule.id,
      framework_id: rule.metadata.framework_id,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);

    return rule;
  }

  /**
   * Evaluates registered rules against a set of Evidence items deterministically.
   *
   * @param request Evaluation request model matching CTR-003.
   * @param evidenceItems Array of Evidence aggregate instances.
   * @returns Tuple of [RuleEvaluation, RuleEvaluationResultModel].
   */
  public evaluateEvidence(
    request: RuleEvaluationRequestModel,
    evidenceItems: readonly Evidence[]
  ): { evaluation: RuleEvaluation; resultModel: RuleEvaluationResultModel } {
    RuleValidator.validateEvaluationRequest(request);
    const startTime = Date.now();

    // Filter active rules
    const activeRules = Array.from(this.rules.values()).filter((r) => {
      if (r.status !== RuleStatus.ACTIVE) return false;
      if (request.rule_filter_category && r.metadata.category !== request.rule_filter_category) {
        return false;
      }
      return true;
    });

    const ruleResults: RuleResult[] = [];
    const findings: Finding[] = [];
    const executionOrder: RuleId[] = [];

    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;

    for (const rule of activeRules) {
      executionOrder.push(rule.id);

      for (const evidence of evidenceItems) {
        // Evaluate rule against evidence deterministically
        const outcome = PureRuleEvaluator.evaluate(rule, evidence);
        ruleResults.push(outcome.result);

        // Record event
        const evalEvent: RuleEvaluatedEvent = {
          event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          event_name: 'RuleEvaluated',
          rule_id: rule.id,
          evidence_id: evidence.id,
          status: outcome.result.status,
          timestamp: Timestamp.create(),
        };
        this.events.push(evalEvent);

        if (outcome.result.status === FindingStatus.PASS) {
          passCount++;
        } else if (outcome.result.status === FindingStatus.FAIL) {
          failCount++;
          if (outcome.finding) {
            findings.push(outcome.finding);

            const findEvent: FindingGeneratedEvent = {
              event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              event_name: 'FindingGenerated',
              finding_id: outcome.finding.finding_id,
              rule_id: rule.id,
              evidence_id: evidence.id,
              severity: outcome.finding.severity,
              status: outcome.finding.status,
              timestamp: Timestamp.create(),
            };
            this.events.push(findEvent);
          }
        } else {
          warnCount++;
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const overallStatus = failCount > 0 ? FindingStatus.FAIL : warnCount > 0 ? FindingStatus.WARN : FindingStatus.PASS;
    const now = Timestamp.create();

    const trace: EvaluationTrace = {
      trace_id: `trace-${request.evaluation_id}`,
      execution_order: executionOrder,
      evaluated_rules_count: activeRules.length,
      pass_count: passCount,
      fail_count: failCount,
      warn_count: warnCount,
      duration_ms: durationMs,
    };

    const evaluation: RuleEvaluation = {
      evaluation_id: request.evaluation_id,
      assessment_id: request.assessment_id,
      rule_results: Object.freeze(ruleResults),
      findings: Object.freeze(findings),
      trace: Object.freeze(trace),
      created_at: now,
    };

    const resultModel: RuleEvaluationResultModel = {
      evaluation_id: request.evaluation_id,
      assessment_id: request.assessment_id,
      overall_status: overallStatus,
      total_rules_evaluated: activeRules.length,
      total_findings_generated: findings.length,
      evaluated_at: now,
    };

    return { evaluation, resultModel };
  }

  /**
   * Retrieves a registered Rule by ID.
   */
  public getRule(ruleId: string): Rule {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new RuleNotFoundError(ruleId);
    }
    return rule;
  }

  /**
   * Returns read-only array of all emitted domain events.
   */
  public getEvents(): readonly RuleDomainEvent[] {
    return Object.freeze([...this.events]);
  }
}

export function createRuleEngineService(): RuleEngineService {
  return new RuleEngineService();
}
