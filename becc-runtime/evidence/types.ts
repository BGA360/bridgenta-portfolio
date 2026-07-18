/**
 * WP-013 Runtime Evidence Contract Types
 */

export enum EvidenceRecordType {
  GENESIS = 'GENESIS',
  RUN_EVIDENCE = 'RUN_EVIDENCE',
  CORRECTION = 'CORRECTION',
  SUPERSESSION = 'SUPERSESSION'
}

export enum EvidenceRecordingPolicy {
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL',
  DISABLED = 'DISABLED'
}

export enum LedgerStatus {
  LEDGER_VALID = 'LEDGER_VALID',
  LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL = 'LEDGER_VALID_PREFIX_WITH_INCOMPLETE_TAIL',
  LEDGER_INVALID = 'LEDGER_INVALID',
  LEDGER_TRUST_UNKNOWN = 'LEDGER_TRUST_UNKNOWN',
  LEDGER_ARTIFACTS_UNAVAILABLE = 'LEDGER_ARTIFACTS_UNAVAILABLE'
}

export enum TrustStatus {
  KEY_TRUSTED = 'KEY_TRUSTED',
  KEY_EXPIRED = 'KEY_EXPIRED',
  KEY_REVOKED = 'KEY_REVOKED',
  KEY_UNKNOWN = 'KEY_UNKNOWN',
  KEY_OUT_OF_SCOPE = 'KEY_OUT_OF_SCOPE',
  TRUST_RESOLUTION_UNAVAILABLE = 'TRUST_RESOLUTION_UNAVAILABLE'
}

export interface SignatureEnvelope {
  readonly algorithm: string;
  readonly providerId: string;
  readonly keyReference: string;
  readonly signature: string;
  readonly signedAt: string;
}

export interface EvidencePayload {
  readonly schemaVersion: string;
  readonly canonicalizationVersion: string;
  readonly ledgerId: string;
  readonly entryId: string;
  readonly recordType: EvidenceRecordType;
  readonly sequenceNumber: number;
  readonly previousEntryHash: string | null;
  readonly recordedAt: string;
  readonly projectId: string;
  readonly assessmentId: string;
  readonly sessionId: string;
  readonly candidateId: string;
  readonly baselineHash: string;
  readonly candidateHash: string;
  readonly knowledgeBundleHash: string;
  readonly validationResultId: string;
  readonly validationResultHash: string;
  readonly humanReviewResultId?: string;
  readonly humanReviewResultHash?: string;
  readonly finalOutcome: string;
  readonly parentEntryId?: string;
}

export interface SignedEvidenceRecord {
  readonly payload: EvidencePayload;
  readonly payloadHash: string;
  readonly signature: SignatureEnvelope;
  readonly recordHash: string;
}

export interface LedgerLockPolicy {
  readonly maximumWaitMs: number;
  readonly initialRetryDelayMs: number;
  readonly maximumRetryDelayMs: number;
  readonly staleThresholdMs: number;
  readonly backoffStrategy: 'exponential' | 'linear';
}

export interface LedgerLockMetadata {
  readonly lockId: string;
  readonly ownerToken: string;
  readonly processId: number;
  readonly hostId: string;
  readonly createdAt: string;
  readonly ledgerId: string;
}

export interface EvidenceContentPolicy {
  readonly redactPaths: boolean;
  readonly hmacReviewerIds: boolean;
  readonly hashSaltReference?: string;
}

export interface EvidenceVerificationResult {
  readonly entryId: string;
  readonly signatureStatus: 'SIGNATURE_VALID' | 'SIGNATURE_INVALID';
  readonly trustStatus: TrustStatus;
  readonly artifactStatus: 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID' | 'NOT_VERIFIED';
}

export interface LedgerVerificationResult {
  readonly ledgerStatus: LedgerStatus;
  readonly verifiedPrefixLength: number;
  readonly totalEntriesCount: number;
  readonly records: EvidenceVerificationResult[];
}
