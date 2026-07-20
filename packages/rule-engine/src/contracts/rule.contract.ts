/**
 * @file rule.contract.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept CTR-003 Input and Output Models
 */

import { FindingStatus } from '@cep/assessment-core';
import { RuleCategory, RuleSeverity } from '../domain/types.js';

export interface RuleEvaluationRequestModel {
  evaluation_id: string;
  assessment_id: string;
  target_evidence_ids: string[];
  rule_filter_category?: RuleCategory;
}

export interface RuleEvaluationResultModel {
  evaluation_id: string;
  assessment_id: string;
  overall_status: FindingStatus;
  total_rules_evaluated: number;
  total_findings_generated: number;
  evaluated_at: string;
}
