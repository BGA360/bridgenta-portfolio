/**
 * @file certification-validator.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Validator
 */

import { PolicyDecision, PolicyStatus } from '@cep/policy-resolver';
import { CertificationIssuanceRequestModel } from '../contracts/certification.contract.js';
import { CertificationLevel, CertificationType } from '../domain/types.js';
import {
  CertificationValidationError,
  CertificationIssuanceError,
} from '../errors/certification.errors.js';

export class CertificationValidator {
  /**
   * Validates CertificationIssuanceRequestModel payload.
   */
  public static validateIssuanceRequest(request: CertificationIssuanceRequestModel): void {
    const errors: string[] = [];

    if (!request || typeof request !== 'object') {
      throw new CertificationValidationError('Issuance request must be a non-null object.');
    }

    if (!request.assessment_id || typeof request.assessment_id !== 'string' || request.assessment_id.trim() === '') {
      errors.push('Field "assessment_id" is required and must be a non-empty string.');
    }

    if (!request.policy_decision_id || typeof request.policy_decision_id !== 'string' || request.policy_decision_id.trim() === '') {
      errors.push('Field "policy_decision_id" is required and must be a non-empty string.');
    }

    if (!request.title || typeof request.title !== 'string' || request.title.trim() === '') {
      errors.push('Field "title" is required and must be a non-empty string.');
    }

    if (!request.issuer || typeof request.issuer !== 'string' || request.issuer.trim() === '') {
      errors.push('Field "issuer" is required and must be a non-empty string.');
    }

    if (!request.framework_id || typeof request.framework_id !== 'string' || request.framework_id.trim() === '') {
      errors.push('Field "framework_id" is required and must be a non-empty string.');
    }

    if (!request.governance_level || !Object.values(CertificationLevel).includes(request.governance_level)) {
      errors.push('Field "governance_level" must be a valid CertificationLevel.');
    }

    if (!request.type || !Object.values(CertificationType).includes(request.type)) {
      errors.push('Field "type" must be a valid CertificationType.');
    }

    if (errors.length > 0) {
      throw new CertificationValidationError(`Certification issuance request validation failed: ${errors.join(' ')}`, errors);
    }
  }

  /**
   * Validates that an incoming PolicyDecision is in APPROVED status.
   */
  public static validatePolicyDecisionApproval(policyDecision: PolicyDecision): void {
    if (!policyDecision || typeof policyDecision !== 'object') {
      throw new CertificationIssuanceError('PolicyDecision must be a valid object.');
    }

    if (policyDecision.status !== PolicyStatus.APPROVED) {
      throw new CertificationIssuanceError(
        `Cannot issue certification for policy decision '${policyDecision.decision_id}' with status '${policyDecision.status}'. Policy decision must be APPROVED.`
      );
    }
  }
}
