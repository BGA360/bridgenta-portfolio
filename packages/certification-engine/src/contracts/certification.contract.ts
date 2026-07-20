/**
 * @file certification.contract.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept CTR-005 Data Models
 */

import {
  CertificationStatus,
  CertificationLevel,
  CertificationType,
} from '../domain/types.js';

export interface CertificationIssuanceRequestModel {
  assessment_id: string;
  policy_decision_id: string;
  title: string;
  issuer: string;
  framework_id: string;
  governance_level: CertificationLevel;
  type: CertificationType;
  valid_until?: string;
  tags?: string[];
}

export interface CertificationIssuanceResultModel {
  certification_id: string;
  assessment_id: string;
  policy_decision_id: string;
  status: CertificationStatus;
  issued_at: string;
}

export interface CertificationVerificationModel {
  certification_id: string;
  status: CertificationStatus;
  verification_hash: string;
  verified_at: string;
}
