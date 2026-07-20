/**
 * @file evidence.contract.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept CTR-002 Input and Output Models
 */

import {
  EvidenceCategory,
  EvidenceType,
} from '../domain/types.js';

/**
 * Input request payload model for evidence submission per CTR-002.
 */
export interface EvidenceSubmissionModel {
  submission_id: string;
  assessment_id: string;
  artifact_name: string;
  category: EvidenceCategory;
  type: EvidenceType;
  raw_payload: string;
  content_checksum: string; // 64-char SHA-256 hex string
  origin: string;
  submitting_authority: string;
  correlation_id: string;
  constitutional_source?: string;
  tags?: string[];
}

/**
 * Receipt returned upon successful evidence submission per CTR-002.
 */
export interface EvidenceIngestionReceiptModel {
  receipt_id: string;
  evidence_id: string;
  assessment_id: string;
  status: string; // "SUBMITTED"
  checksum: string;
  ingested_at: string;
}
