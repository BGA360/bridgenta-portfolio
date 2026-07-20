/**
 * @file types.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Domain Types & Value Objects
 */

// Branded Types to avoid primitive confusion
export type CertificationId = string & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

export const CertificationId = {
  create: (id: string): CertificationId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('CertificationId must be a non-empty string.');
    }
    return id.trim() as CertificationId;
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
 * Certification Status state machine enumeration.
 */
export enum CertificationStatus {
  ISSUED = 'ISSUED',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Governance level for certification.
 */
export enum CertificationLevel {
  LEVEL_0 = 'LEVEL_0',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4',
  LEVEL_5 = 'LEVEL_5',
}

/**
 * Type of certification.
 */
export enum CertificationType {
  CONSTITUTIONAL_COMPLIANCE = 'CONSTITUTIONAL_COMPLIANCE',
  SECURITY_ATTESTATION = 'SECURITY_ATTESTATION',
  ARCHITECTURAL_CONFORMANCE = 'ARCHITECTURAL_CONFORMANCE',
  GOVERNANCE_CLEARANCE = 'GOVERNANCE_CLEARANCE',
}

/**
 * Metadata attached to a Certification.
 */
export interface CertificationMetadata {
  readonly title: string;
  readonly issuer: string;
  readonly framework_id: string; // e.g. "CEF", "BPGA"
  readonly governance_level: CertificationLevel;
  readonly type: CertificationType;
  readonly valid_until?: Timestamp;
  readonly tags: readonly string[];
}

/**
 * Audit Record model capturing issuance provenance.
 */
export interface CertificationRecord {
  readonly record_id: string;
  readonly certification_id: CertificationId;
  readonly assessment_id: string;
  readonly policy_decision_id: string;
  readonly issued_at: Timestamp;
}

/**
 * Result model returned upon certification verification.
 */
export interface CertificationResult {
  readonly certification_id: CertificationId;
  readonly status: CertificationStatus;
  readonly verification_hash: string;
  readonly verified_at: Timestamp;
}

/**
 * Reference link model.
 */
export interface CertificationReference {
  readonly reference_id: string;
  readonly target_uri: string;
  readonly checksum: string;
}

/**
 * Schema version model.
 */
export interface CertificationVersion {
  readonly version: string;
}

/**
 * Traceability reference model.
 */
export interface TraceabilityReference {
  readonly constitutional_source: string;
  readonly contract_id: string;
  readonly domain_concept: string;
}

/**
 * Transition history record for auditability.
 */
export interface CertificationTransitionRecord {
  readonly from_status: CertificationStatus;
  readonly to_status: CertificationStatus;
  readonly timestamp: Timestamp;
  readonly reason?: string;
}
