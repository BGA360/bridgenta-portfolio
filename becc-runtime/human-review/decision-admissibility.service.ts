import {
  ReviewPackage,
  HumanReviewSubmission,
  VerifiedReviewer,
  PreparedReviewRecord
} from './types.js';
import { IReviewerIdentityPort } from './ports/reviewer-identity.port.js';
import { ReviewerAuthorityService } from './reviewer-authority.service.js';
import { FindingDispositionValidatorService } from './finding-disposition-validator.service.js';
import { ObligationResponseValidatorService } from './obligation-response-validator.service.js';
import { DefaultSelfReviewPolicy } from './policies/self-review.policy.js';
import { ReviewIntegrityService } from './review-integrity.service.js';
import { IClockPort } from './ports/clock.port.js';
import {
  ReviewPackageExpiredError,
  SelfReviewNotPermittedError,
  CandidateIntegrityMismatchError
} from './exceptions.js';

export class DecisionAdmissibilityService {
  constructor(
    private readonly identityPort: IReviewerIdentityPort,
    private readonly authorityService = new ReviewerAuthorityService(),
    private readonly findingsValidator = new FindingDispositionValidatorService(),
    private readonly obligationsValidator = new ObligationResponseValidatorService(),
    private readonly selfReviewPolicy = new DefaultSelfReviewPolicy(),
    private readonly integrityService = new ReviewIntegrityService()
  ) {}

  public async validate(
    record: PreparedReviewRecord,
    submission: HumanReviewSubmission,
    clock: IClockPort
  ): Promise<VerifiedReviewer> {
    const pkg = record.reviewPackage;

    // 1. Expiry check
    if (pkg.expiryTimestamp) {
      const now = clock.now();
      if (now > pkg.expiryTimestamp) {
        throw new ReviewPackageExpiredError(pkg.expiryTimestamp);
      }
    }

    // 2. Integrity checks (timing-independent comparison)
    const payload = {
      schemaVersion: pkg.schemaVersion,
      reviewRequestId: pkg.reviewRequestId,
      assessmentId: pkg.assessmentId,
      sessionId: pkg.sessionId,
      projectId: pkg.projectId,
      targetPath: pkg.targetPath,
      baselineHash: pkg.baselineHash,
      candidateHash: pkg.candidateHash,
      validationResultHash: pkg.validationResultHash,
      knowledgeBundleHash: pkg.knowledgeBundleHash
    };
    const calculatedDigest = this.integrityService.calculateDigest(payload);
    if (!this.integrityService.constantTimeCompare(calculatedDigest, pkg.integrityDigest)) {
      throw new CandidateIntegrityMismatchError();
    }

    // 3. Identity verification
    const reviewer = await this.identityPort.verify(submission.assertion, {
      reviewerId: submission.reviewerId
    });

    // 4. Self-review check
    const isAuthor = record.context.traceabilityMetadata?.signature === reviewer.reviewerId ||
                     (record.context as any).authorId === reviewer.reviewerId;
    if (isAuthor) {
      const isApproved = submission.decision === 'APPROVED';
      const isRejected = submission.decision === 'REJECTED';
      const isRevision = submission.decision === 'REVISION_REQUIRED';
      const isEscalation = submission.decision === 'ESCALATION_REQUESTED';

      if (isApproved && !this.selfReviewPolicy.approvalByAuthorAllowed) {
        throw new SelfReviewNotPermittedError();
      }
      if (isRejected && !this.selfReviewPolicy.rejectionByAuthorAllowed) {
        throw new SelfReviewNotPermittedError();
      }
      if (isRevision && !this.selfReviewPolicy.revisionRequestByAuthorAllowed) {
        throw new SelfReviewNotPermittedError();
      }
      if (isEscalation && !this.selfReviewPolicy.escalationByAuthorAllowed) {
        throw new SelfReviewNotPermittedError();
      }
    }

    // 5. Authority scope verification
    const actualClassification = record.context.publicationClassification || 'Public';
    this.authorityService.validate(reviewer, pkg.projectId, actualClassification);

    // 6. Findings dispositions check
    const isApproved = submission.decision === 'APPROVED';
    this.findingsValidator.validate(pkg.findings, submission.dispositions, isApproved);

    // 7. Obligations responses check
    this.obligationsValidator.validate(pkg.obligations, submission.obligations, isApproved);

    return reviewer;
  }
}
