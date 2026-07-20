/**
 * @file rule-validator.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Validator
 */

import { RuleProps } from '../domain/rule.aggregate.js';
import { RuleEvaluationRequestModel } from '../contracts/rule.contract.js';
import { RuleCategory, RuleSeverity } from '../domain/types.js';
import { RuleValidationError } from '../errors/rule.errors.js';

export class RuleValidator {
  /**
   * Validates RuleProps prior to registration.
   */
  public static validateRuleProps(props: RuleProps): void {
    const errors: string[] = [];

    if (!props || typeof props !== 'object') {
      throw new RuleValidationError('Rule properties must be a non-null object.');
    }

    if (!props.id || typeof props.id !== 'string' || props.id.trim() === '') {
      errors.push('Rule ID is required and must be a non-empty string.');
    }

    if (!props.metadata || typeof props.metadata !== 'object') {
      errors.push('Rule metadata is required.');
    } else {
      if (!props.metadata.name || typeof props.metadata.name !== 'string' || props.metadata.name.trim() === '') {
        errors.push('Metadata "name" is required.');
      }
      if (!props.metadata.framework_id || typeof props.metadata.framework_id !== 'string' || props.metadata.framework_id.trim() === '') {
        errors.push('Metadata "framework_id" is required.');
      }
      if (!props.metadata.category || !Object.values(RuleCategory).includes(props.metadata.category)) {
        errors.push('Metadata "category" must be a valid RuleCategory.');
      }
      if (!props.metadata.severity || !Object.values(RuleSeverity).includes(props.metadata.severity)) {
        errors.push('Metadata "severity" must be a valid RuleSeverity.');
      }
    }

    if (typeof props.evaluator_fn !== 'function') {
      errors.push('Rule "evaluator_fn" is required and must be a function.');
    }

    if (errors.length > 0) {
      throw new RuleValidationError(`Rule validation failed: ${errors.join(' ')}`, errors);
    }
  }

  /**
   * Validates RuleEvaluationRequestModel payloads.
   */
  public static validateEvaluationRequest(request: RuleEvaluationRequestModel): void {
    const errors: string[] = [];

    if (!request || typeof request !== 'object') {
      throw new RuleValidationError('Evaluation request must be a non-null object.');
    }

    if (!request.evaluation_id || typeof request.evaluation_id !== 'string' || request.evaluation_id.trim() === '') {
      errors.push('Field "evaluation_id" is required.');
    }

    if (!request.assessment_id || typeof request.assessment_id !== 'string' || request.assessment_id.trim() === '') {
      errors.push('Field "assessment_id" is required.');
    }

    if (!Array.isArray(request.target_evidence_ids) || request.target_evidence_ids.length === 0) {
      errors.push('Field "target_evidence_ids" must be a non-empty array of strings.');
    }

    if (errors.length > 0) {
      throw new RuleValidationError(`Evaluation request validation failed: ${errors.join(' ')}`, errors);
    }
  }
}
