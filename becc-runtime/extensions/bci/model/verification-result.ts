export type VerificationStatus =
  | 'VERIFIED_IN_PRODUCTION'
  | 'DEPLOYED_LIVE_VERIFICATION_FAILED'
  | 'MERGED_NOT_DEPLOYED'
  | 'DEPLOYMENT_FAILED'
  | 'VERIFICATION_INCOMPLETE';

export interface VerificationResult {
  readonly verificationId: string;
  readonly auditId: string;
  readonly candidateIds: readonly string[]; // RemediationCandidates verified
  readonly integratedCommitSha?: string;
  readonly deploymentSha?: string;
  readonly liveTargets: readonly string[]; // Crawled URLs inspected
  readonly expectedStateHashes: Readonly<Record<string, string>>; // Target page ID -> expected hash
  readonly observedStateHashes: Readonly<Record<string, string>>; // Target page ID -> observed hash
  readonly status: VerificationStatus;
  readonly verifiedAt: string;
}
