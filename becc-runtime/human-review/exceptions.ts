export class HumanReviewException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HumanReviewException';
  }
}

// Package Errors
export class ReviewPackageNotFoundError extends HumanReviewException {
  constructor(reviewRequestId: string) {
    super(`Review package not found for ID: ${reviewRequestId}`);
    this.name = 'ReviewPackageNotFoundError';
  }
}

export class ReviewPackageCorruptedError extends HumanReviewException {
  constructor(details: string) {
    super(`Review package is corrupted: ${details}`);
    this.name = 'ReviewPackageCorruptedError';
  }
}

export class ReviewPackageExpiredError extends HumanReviewException {
  constructor(expiry: string) {
    super(`Review package has expired on: ${expiry}`);
    this.name = 'ReviewPackageExpiredError';
  }
}

export class ReviewPackageCancelledError extends HumanReviewException {
  constructor() {
    super('Review package has been cancelled.');
    this.name = 'ReviewPackageCancelledError';
  }
}

export class ReviewPackageSupersededError extends HumanReviewException {
  constructor() {
    super('Review package has been superseded by a newer candidate.');
    this.name = 'ReviewPackageSupersededError';
  }
}

export class ReviewAlreadyFinalizedError extends HumanReviewException {
  constructor() {
    super('Decision already finalized for this review.');
    this.name = 'ReviewAlreadyFinalizedError';
  }
}

// Identity and Authority
export class ReviewerIdentityVerificationError extends HumanReviewException {
  constructor(details: string) {
    super(`Identity verification failed: ${details}`);
    this.name = 'ReviewerIdentityVerificationError';
  }
}

export class ReviewerNotAuthorizedError extends HumanReviewException {
  constructor(details: string) {
    super(`Reviewer is not authorized: ${details}`);
    this.name = 'ReviewerNotAuthorizedError';
  }
}

export class SelfReviewNotPermittedError extends HumanReviewException {
  constructor() {
    super('Prohibited self-review: Candidate author is not permitted to approve this communication.');
    this.name = 'SelfReviewNotPermittedError';
  }
}

export class AuthorityExpiredError extends HumanReviewException {
  constructor() {
    super('Reviewer authority has expired.');
    this.name = 'AuthorityExpiredError';
  }
}

// Integrity
export class CandidateIntegrityMismatchError extends HumanReviewException {
  constructor() {
    super('Candidate content hash mismatch between review package and submission.');
    this.name = 'CandidateIntegrityMismatchError';
  }
}

export class BaselineIntegrityMismatchError extends HumanReviewException {
  constructor() {
    super('Baseline hash mismatch.');
    this.name = 'BaselineIntegrityMismatchError';
  }
}

export class ValidationResultIntegrityMismatchError extends HumanReviewException {
  constructor() {
    super('Validation result report hash mismatch.');
    this.name = 'ValidationResultIntegrityMismatchError';
  }
}

export class KnowledgeBundleIntegrityMismatchError extends HumanReviewException {
  constructor() {
    super('Knowledge bundle hash mismatch.');
    this.name = 'KnowledgeBundleIntegrityMismatchError';
  }
}

export class SubmissionReplayError extends HumanReviewException {
  constructor() {
    super('Submission replay attempt detected.');
    this.name = 'SubmissionReplayError';
  }
}

// Findings and Obligations
export class UnknownFindingError extends HumanReviewException {
  constructor(findingId: string) {
    super(`Unknown validation finding ID referenced: ${findingId}`);
    this.name = 'UnknownFindingError';
  }
}

export class DuplicateFindingDispositionError extends HumanReviewException {
  constructor(findingId: string) {
    super(`Duplicate disposition recorded for finding ID: ${findingId}`);
    this.name = 'DuplicateFindingDispositionError';
  }
}

export class InvalidFindingDispositionError extends HumanReviewException {
  constructor(findingId: string, details: string) {
    super(`Invalid disposition for finding ${findingId}: ${details}`);
    this.name = 'InvalidFindingDispositionError';
  }
}

export class UnknownObligationError extends HumanReviewException {
  constructor(obligationId: string) {
    super(`Unknown obligation ID referenced: ${obligationId}`);
    this.name = 'UnknownObligationError';
  }
}

export class DuplicateObligationResponseError extends HumanReviewException {
  constructor(obligationId: string) {
    super(`Duplicate response recorded for obligation ID: ${obligationId}`);
    this.name = 'DuplicateObligationResponseError';
  }
}

export class InvalidObligationResponseError extends HumanReviewException {
  constructor(obligationId: string, details: string) {
    super(`Invalid response for obligation ${obligationId}: ${details}`);
    this.name = 'InvalidObligationResponseError';
  }
}

export class UnresolvedBlockingObligationError extends HumanReviewException {
  constructor(obligationId: string) {
    super(`Blocking obligation remains unresolved or answered false: ${obligationId}`);
    this.name = 'UnresolvedBlockingObligationError';
  }
}

// Persistence
export class ReviewStatePersistenceError extends HumanReviewException {
  constructor(details: string) {
    super(`Persistence adapter error: ${details}`);
    this.name = 'ReviewStatePersistenceError';
  }
}

export class ReviewStateConflictError extends HumanReviewException {
  constructor() {
    super('Persistence conflict (version mismatch).');
    this.name = 'ReviewStateConflictError';
  }
}
