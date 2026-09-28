/**
 * BECC v2 — Audit Ledger & Provenance Integration Types
 *
 * Implements canonical types for append-oriented audit recording and provenance
 * traceability as specified in BECC-V2-IMPL-016.
 */

/**
 * Explicit provenance reference contract.
 * References authoritative source documents, evidence items, GL observations/lessons, etc.
 */
export interface ProvenanceRef {
  refType: 'RULE_SOURCE' | 'EVIDENCE_ITEM' | 'GL_OBSERVATION' | 'GL_LESSON' | 'PRAG_REGISTRY' | string;
  ref: string;
  revision?: string;
  contentHash?: string;
}

/**
 * Status taxonomy for recorded BECC operations.
 */
export type BeccAuditRecordStatus =
  | 'SUCCESS'
  | 'REFUSED'
  | 'INDETERMINATE'
  | 'ERROR';

/**
 * Categorization of BECC operation types.
 */
export type BeccOperationType =
  | 'GUIDANCE_QUERY'
  | 'FINDING_ESCALATION'
  | 'READINESS_EVALUATION'
  | 'CUSTOM_OPERATION';

/**
 * Input contract for constructing a BECC audit record.
 */
export interface BeccAuditRecordInput {
  auditRecordId?: string;
  operationType: BeccOperationType | string;
  operationId: string;
  projectRef?: string;
  candidateRef?: string;
  workstreamRef?: string;
  actorRef?: string;
  authorityContextRef?: string;
  assessmentContextRef?: string;
  correlationRef?: string;
  causationRef?: string;
  inputRefs?: string[];
  evidenceRefs?: string[];
  provenanceRefs?: ProvenanceRef[];
  resultStatus: BeccAuditRecordStatus;
  domainResultStatus?: string;
  resultRef?: string;
  occurredAt: string;
  externalAuthorityBoundary?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Canonical immutable BECC audit record.
 */
export interface BeccAuditRecord {
  auditRecordId: string;
  operationType: string;
  operationId: string;
  projectRef?: string;
  candidateRef?: string;
  workstreamRef?: string;
  actorRef?: string;
  authorityContextRef?: string;
  assessmentContextRef?: string;
  correlationRef?: string;
  causationRef?: string;
  inputRefs: string[];
  evidenceRefs: string[];
  provenanceRefs: ProvenanceRef[];
  resultStatus: BeccAuditRecordStatus;
  domainResultStatus?: string;
  resultRef?: string;
  occurredAt: string;
  externalAuthorityBoundary?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Filter contract for querying audit records.
 */
export interface BeccAuditQueryFilter {
  auditRecordId?: string;
  operationType?: string;
  operationId?: string;
  projectRef?: string;
  correlationRef?: string;
  causationRef?: string;
  resultStatus?: BeccAuditRecordStatus;
}

/**
 * Authority boundary declaration for audit records.
 */
export interface BeccAuditAuthorityBoundary {
  finalPublicationAuthority: 'M5 / PRAG Governance';
  beccOwnsFinalAuthority: false;
  auditIsGovernanceDecision: false;
  auditOnly: true;
}
