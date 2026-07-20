/**
 * @file types.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Domain Types & Branded Value Objects
 */

// Branded Types to prevent primitive string confusion
export type EvidenceId = string & { readonly __brand: unique symbol };
export type AssessmentId = string & { readonly __brand: unique symbol };
export type EvidenceChecksum = string & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

/**
 * Value Object creators and validators.
 */
export const EvidenceId = {
  create: (id: string): EvidenceId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('EvidenceId must be a non-empty string.');
    }
    return id.trim() as EvidenceId;
  },
};

export const AssessmentId = {
  create: (id: string): AssessmentId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('AssessmentId must be a non-empty string.');
    }
    return id.trim() as AssessmentId;
  },
};

export const EvidenceChecksum = {
  create: (checksum: string): EvidenceChecksum => {
    const sha256Regex = /^[a-fA-F0-9]{64}$/;
    if (!checksum || typeof checksum !== 'string' || !sha256Regex.test(checksum.trim())) {
      throw new Error('EvidenceChecksum must be a valid 64-character hex SHA-256 string.');
    }
    return checksum.trim().toLowerCase() as EvidenceChecksum;
  },
};

export const Timestamp = {
  create: (isoString?: string): Timestamp => {
    const str = isoString || new Date().toISOString();
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error('Timestamp must be a valid ISO 8601 date string.');
    }
    return date.toISOString() as Timestamp;
  },
};

/**
 * Canonical Evidence Status lifecycle state enumeration per approved domain specs.
 */
export enum EvidenceStatus {
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  ACCEPTED = 'ACCEPTED',
  REFERENCED = 'REFERENCED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Evidence Category enumeration per domain vocabulary.
 */
export enum EvidenceCategory {
  STATIC_CODE = 'STATIC_CODE',
  COMMIT_LOG = 'COMMIT_LOG',
  ARCHITECTURAL_DOC = 'ARCHITECTURAL_DOC',
  BENCHMARK_RESULT = 'BENCHMARK_RESULT',
  TEST_OUTPUT = 'TEST_OUTPUT',
}

/**
 * Evidence Type enumeration per domain vocabulary.
 */
export enum EvidenceType {
  FILE_ARTIFACT = 'FILE_ARTIFACT',
  METRIC_SET = 'METRIC_SET',
  DECLARATION = 'DECLARATION',
  HASH_DIGEST = 'HASH_DIGEST',
}

/**
 * Immutable Provenance record attached to every Evidence aggregate.
 */
export interface EvidenceSource {
  readonly origin: string;
  readonly collection_timestamp: Timestamp;
  readonly submitting_authority: string;
  readonly correlation_id: string;
}

/**
 * Traceability reference linking evidence back to constitutional sources.
 */
export interface TraceabilityReference {
  readonly constitutional_source: string;
  readonly contract_id: string; // e.g. "CTR-002"
  readonly domain_concept: string;
}

/**
 * Evidence metadata model.
 */
export interface EvidenceMetadata {
  readonly size_bytes: number;
  readonly mime_type: string;
  readonly category: EvidenceCategory;
  readonly type: EvidenceType;
  readonly tags: readonly string[];
}

/**
 * Immutable lifecycle transition record stored in Evidence aggregate history.
 */
export interface EvidenceTransitionRecord {
  readonly from_status: EvidenceStatus;
  readonly to_status: EvidenceStatus;
  readonly timestamp: Timestamp;
  readonly reason?: string;
}

/**
 * Evidence Reference summary model.
 */
export interface EvidenceReference {
  readonly evidence_id: EvidenceId;
  readonly checksum: EvidenceChecksum;
  readonly status: EvidenceStatus;
}

/**
 * Sealed Evidence Bundle containing multiple evidence references for an assessment.
 */
export interface EvidenceBundle {
  readonly bundle_id: string;
  readonly assessment_id: AssessmentId;
  readonly evidence_items: readonly EvidenceReference[];
  readonly sealed_checksum: EvidenceChecksum;
  readonly created_at: Timestamp;
}
