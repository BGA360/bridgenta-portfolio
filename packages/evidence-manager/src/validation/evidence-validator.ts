/**
 * @file evidence-validator.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Validator
 */

import { EvidenceSubmissionModel } from '../contracts/evidence.contract.js';
import { EvidenceCategory, EvidenceType } from '../domain/types.js';
import { EvidenceValidationError } from '../errors/evidence.errors.js';

/**
 * Deterministic evidence submission validator.
 */
export class EvidenceValidator {
  /**
   * Validates an incoming EvidenceSubmissionModel payload against CTR-002 and domain invariants.
   *
   * @param submission Candidate evidence submission model.
   * @throws EvidenceValidationError (ERR-EVI-001) if validation rules fail.
   */
  public static validateSubmission(submission: EvidenceSubmissionModel): void {
    const errors: string[] = [];

    if (!submission || typeof submission !== 'object') {
      throw new EvidenceValidationError('Evidence submission must be a non-null object.');
    }

    if (!submission.submission_id || typeof submission.submission_id !== 'string' || submission.submission_id.trim() === '') {
      errors.push('Field "submission_id" is required and must be a non-empty string.');
    }

    if (!submission.assessment_id || typeof submission.assessment_id !== 'string' || submission.assessment_id.trim() === '') {
      errors.push('Field "assessment_id" is required and must be a non-empty string.');
    }

    if (!submission.artifact_name || typeof submission.artifact_name !== 'string' || submission.artifact_name.trim() === '') {
      errors.push('Field "artifact_name" is required and must be a non-empty string.');
    }

    if (typeof submission.raw_payload !== 'string') {
      errors.push('Field "raw_payload" is required and must be a string.');
    }

    // SHA-256 Format Verification
    const sha256Regex = /^[a-fA-F0-9]{64}$/;
    if (!submission.content_checksum || typeof submission.content_checksum !== 'string' || !sha256Regex.test(submission.content_checksum.trim())) {
      errors.push('Field "content_checksum" must be a valid 64-character hex SHA-256 string.');
    }

    // Category verification
    if (!submission.category || !Object.values(EvidenceCategory).includes(submission.category)) {
      errors.push(`Field "category" must be a valid EvidenceCategory (${Object.values(EvidenceCategory).join(', ')}).`);
    }

    // Type verification
    if (!submission.type || !Object.values(EvidenceType).includes(submission.type)) {
      errors.push(`Field "type" must be a valid EvidenceType (${Object.values(EvidenceType).join(', ')}).`);
    }

    // Provenance Verification
    if (!submission.origin || typeof submission.origin !== 'string' || submission.origin.trim() === '') {
      errors.push('Field "origin" (Provenance) is required and must be a non-empty string.');
    }

    if (!submission.submitting_authority || typeof submission.submitting_authority !== 'string' || submission.submitting_authority.trim() === '') {
      errors.push('Field "submitting_authority" (Provenance) is required and must be a non-empty string.');
    }

    if (!submission.correlation_id || typeof submission.correlation_id !== 'string' || submission.correlation_id.trim() === '') {
      errors.push('Field "correlation_id" (Provenance) is required and must be a non-empty string.');
    }

    if (errors.length > 0) {
      throw new EvidenceValidationError(`Evidence submission validation failed: ${errors.join(' ')}`, errors);
    }
  }
}
