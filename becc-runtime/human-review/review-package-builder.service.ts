import { HumanReviewInput, ReviewPackage, CandidateLineage } from './types.js';
import { DefaultReviewExpiryPolicy } from './policies/expiry.policy.js';
import { ReviewIntegrityService } from './review-integrity.service.js';

export class ReviewPackageBuilderService {
  constructor(
    private readonly integrityService = new ReviewIntegrityService(),
    private readonly expiryPolicy = new DefaultReviewExpiryPolicy()
  ) {}

  public build(input: HumanReviewInput, creationTimestamp: string): ReviewPackage {
    const candidateLineage: CandidateLineage = {
      candidateId: input.candidateId,
      revisionNumber: 1
    };

    const expiryTimestamp = this.expiryPolicy.calculateExpiry({ createdTimestamp: creationTimestamp }) || undefined;

    const payload = {
      schemaVersion: input.schemaVersion,
      reviewRequestId: input.reviewRequestId,
      assessmentId: input.assessmentId,
      sessionId: input.sessionId,
      projectId: input.projectId,
      targetPath: input.targetPath,
      baselineHash: input.baselineHash,
      candidateHash: input.candidateHash,
      validationResultHash: input.validationResultHash,
      knowledgeBundleHash: input.knowledgeBundleHash
    };

    const integrityDigest = this.integrityService.calculateDigest(payload);

    return {
      schemaVersion: input.schemaVersion,
      packageId: input.reviewRequestId,
      reviewRequestId: input.reviewRequestId,
      assessmentId: input.assessmentId,
      sessionId: input.sessionId,
      projectId: input.projectId,
      targetPath: input.targetPath,
      candidateLineage,
      baselineHash: input.baselineHash,
      candidateHash: input.candidateHash,
      validationResultHash: input.validationResultHash,
      knowledgeBundleHash: input.knowledgeBundleHash,
      controlledDiff: input.candidateDiff,
      findings: input.validationResult.findings,
      obligations: input.applicableObligations,
      reviewerPolicyReference: input.reviewerPolicyReference,
      creationTimestamp,
      expiryTimestamp,
      contentPolicyReference: 'default-content-policy',
      integrityAlgorithm: 'SHA-256',
      integrityDigest
    };
  }
}
