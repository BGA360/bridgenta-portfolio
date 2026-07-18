/**
 * WP-013 Runtime Evidence Exception Definitions
 */

export abstract class EvidenceException extends Error {
  public abstract readonly code: string;
  public abstract readonly category: 'CONFIGURATION' | 'CRYPTO' | 'STORAGE' | 'INTEGRITY' | 'OPERATIONAL';
  public abstract readonly retryable: boolean;
  public abstract readonly securityRelevance: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EvidenceConfigurationException extends EvidenceException {
  readonly code = 'EVIDENCE_CONFIGURATION_FAILURE';
  readonly category = 'CONFIGURATION';
  readonly retryable = false;
  readonly securityRelevance = false;
}

export class EvidenceCanonicalizationException extends EvidenceException {
  readonly code = 'EVIDENCE_CANONICALIZATION_FAILURE';
  readonly category = 'CRYPTO';
  readonly retryable = false;
  readonly securityRelevance = false;
}

export class EvidenceSignatureException extends EvidenceException {
  readonly code = 'EVIDENCE_SIGNATURE_FAILURE';
  readonly category = 'CRYPTO';
  readonly retryable = true;
  readonly securityRelevance = true;
}

export class EvidenceTrustResolutionException extends EvidenceException {
  readonly code = 'EVIDENCE_TRUST_RESOLUTION_FAILURE';
  readonly category = 'CRYPTO';
  readonly retryable = true;
  readonly securityRelevance = true;
}

export class EvidenceLockTimeoutException extends EvidenceException {
  readonly code = 'EVIDENCE_LOCK_TIMEOUT';
  readonly category = 'STORAGE';
  readonly retryable = true;
  readonly securityRelevance = false;
}

export class EvidencePersistenceException extends EvidenceException {
  readonly code = 'EVIDENCE_PERSISTENCE_FAILURE';
  readonly category = 'STORAGE';
  readonly retryable = true;
  readonly securityRelevance = false;
}

export class EvidenceChainConflictException extends EvidenceException {
  readonly code = 'EVIDENCE_CHAIN_CONFLICT';
  readonly category = 'INTEGRITY';
  readonly retryable = false;
  readonly securityRelevance = true;
}

export class EvidenceIdempotencyConflictException extends EvidenceException {
  readonly code = 'EVIDENCE_IDEMPOTENCY_CONFLICT';
  readonly category = 'INTEGRITY';
  readonly retryable = false;
  readonly securityRelevance = true;
}

export class EvidenceCorruptionException extends EvidenceException {
  readonly code = 'EVIDENCE_CORRUPTION_DETECTED';
  readonly category = 'INTEGRITY';
  readonly retryable = false;
  readonly securityRelevance = true;
}

export class EvidencePermissionException extends EvidenceException {
  readonly code = 'EVIDENCE_PERMISSION_FAILURE';
  readonly category = 'STORAGE';
  readonly retryable = false;
  readonly securityRelevance = false;
}

export class EvidenceArtifactUnavailableException extends EvidenceException {
  readonly code = 'EVIDENCE_ARTIFACT_UNAVAILABLE';
  readonly category = 'OPERATIONAL';
  readonly retryable = true;
  readonly securityRelevance = false;
}

export class EvidenceEntryNotFoundException extends EvidenceException {
  readonly code = 'EVIDENCE_ENTRY_NOT_FOUND';
  readonly category = 'OPERATIONAL';
  readonly retryable = false;
  readonly securityRelevance = false;
}

export class EvidenceLedgerNotFoundException extends EvidenceException {
  readonly code = 'EVIDENCE_LEDGER_NOT_FOUND';
  readonly category = 'OPERATIONAL';
  readonly retryable = false;
  readonly securityRelevance = false;
}
