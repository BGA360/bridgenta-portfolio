import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { IHumanReviewEngine } from '../orchestrator/types.js';
import { AssessmentContext, ValidationResultReport } from '../shared/types.js';
import {
  HumanReviewInput,
  ReviewPackage,
  PreparedReviewRecord,
  HumanReviewSubmission,
  HumanReviewResult,
  HumanReviewContinuation
} from './types.js';
import { ReviewPackageBuilderService } from './review-package-builder.service.js';
import { DecisionAdmissibilityService } from './decision-admissibility.service.js';
import { ReviewContinuationService } from './review-continuation.service.js';
import { IReviewStateRepositoryPort } from './ports/review-state.port.js';
import { IReviewerIdentityPort } from './ports/reviewer-identity.port.js';
import { IClockPort } from './ports/clock.port.js';
import { CandidateMaterializerService } from '../validator/candidate-materializer.service.js';
import { ReviewPackageNotFoundError, ReviewAlreadyFinalizedError } from './exceptions.js';
import { DefaultReviewContentPolicy } from './policies/content.policy.js';
import { ReviewIntegrityService } from './review-integrity.service.js';

export class HumanReviewService implements IHumanReviewEngine {
  constructor(
    private readonly repositoryPort: IReviewStateRepositoryPort,
    private readonly identityPort: IReviewerIdentityPort,
    private readonly clockPort: IClockPort,
    private readonly packageBuilder = new ReviewPackageBuilderService(),
    private readonly admissibilityService = new DecisionAdmissibilityService(identityPort),
    private readonly continuationService = new ReviewContinuationService(),
    private readonly materializer = new CandidateMaterializerService(),
    private readonly integrityService = new ReviewIntegrityService(),
    private readonly contentPolicy = new DefaultReviewContentPolicy()
  ) {}

  /**
   * Called by the orchestrator to stage the human review package after validation completes.
   */
  public async stageReview(
    context: AssessmentContext,
    validationReport: ValidationResultReport,
    bundle?: any,
    diff?: any
  ): Promise<ReviewPackage> {
    const repoRoot = (context as any).repositoryRoot || process.cwd();
    const baselinePath = path.resolve(repoRoot, context.targetDocument.path);
    const baselineContent = fs.existsSync(baselinePath) ? fs.readFileSync(baselinePath, 'utf8') : '';

    const diffContent = diff?.communication?.diffContent || '';
    const candidateContent = this.materializer.materialize(baselineContent, diffContent);

    const baselineHash = createHash('sha256').update(baselineContent).digest('hex');
    const candidateHash = createHash('sha256').update(candidateContent).digest('hex');
    const validationResultHash = createHash('sha256').update(JSON.stringify(validationReport)).digest('hex');
    const knowledgeBundleHash = bundle?.integrity?.bundleHash || 'unknown-bundle-hash';

    const input: HumanReviewInput = {
      schemaVersion: '2.0.0',
      reviewRequestId: context.assessmentId,
      assessmentId: context.assessmentId,
      sessionId: context.assessmentId,
      projectId: context.project,
      targetPath: context.targetDocument.path,
      authorReference: context.traceabilityMetadata?.signature,
      baselineReference: context.targetDocument.path,
      baselineHash,
      candidateId: `cand-${context.assessmentId}`,
      candidateCommunication: candidateContent,
      candidateHash,
      candidateDiff: diffContent,
      transformationMetadataReference: `metadata-${context.assessmentId}.json`,
      validationResult: validationReport,
      validationResultHash,
      knowledgeBundleReference: `bundle-${context.assessmentId}.json`,
      knowledgeBundleHash,
      applicableObligations: validationReport.applicableObligations || [],
      lifecycle: context.lifecyclePhase,
      classification: context.publicationClassification || 'Public',
      locale: 'en',
      reviewerPolicyReference: 'default-reviewer-policy'
    };

    const creationTimestamp = this.clockPort.now();
    const reviewPackage = this.packageBuilder.build(input, creationTimestamp);

    const record: PreparedReviewRecord = {
      reviewPackage,
      executionStatus: 'AWAITING_REVIEW',
      version: 1,
      context
    };

    await this.repositoryPort.savePreparedReview(record);
    return reviewPackage;
  }

  /**
   * Called by the CLI/adapter to submit a human review decision.
   */
  public async submitDecision(submission: HumanReviewSubmission): Promise<HumanReviewContinuation> {
    const record = await this.repositoryPort.loadPreparedReview(submission.packageId);
    if (!record) {
      throw new ReviewPackageNotFoundError(submission.packageId);
    }
    if (record.executionStatus === 'COMPLETED') {
      throw new ReviewAlreadyFinalizedError();
    }

    // Validate admissibility
    const reviewer = await this.admissibilityService.validate(record, submission, this.clockPort);

    // Build the result
    const routingEligibility = submission.decision === 'APPROVED' ? 'ELIGIBLE' : 'INELIGIBLE';
    const escalationRequested = submission.decision === 'ESCALATION_REQUESTED';

    const payload = {
      schemaVersion: record.reviewPackage.schemaVersion,
      reviewRequestId: record.reviewPackage.reviewRequestId,
      assessmentId: record.reviewPackage.assessmentId,
      sessionId: record.reviewPackage.sessionId,
      projectId: record.reviewPackage.projectId,
      targetPath: record.reviewPackage.targetPath,
      baselineHash: record.reviewPackage.baselineHash,
      candidateHash: record.reviewPackage.candidateHash,
      validationResultHash: record.reviewPackage.validationResultHash,
      knowledgeBundleHash: record.reviewPackage.knowledgeBundleHash
    };
    const integrityDigest = this.integrityService.calculateDigest(payload);

    const result: HumanReviewResult = {
      schemaVersion: record.reviewPackage.schemaVersion,
      reviewRequestId: record.reviewPackage.reviewRequestId,
      packageId: record.reviewPackage.packageId,
      assessmentId: record.reviewPackage.assessmentId,
      sessionId: record.reviewPackage.sessionId,
      projectId: record.reviewPackage.projectId,
      targetPath: record.reviewPackage.targetPath,
      candidateLineage: record.reviewPackage.candidateLineage,
      baselineHash: record.reviewPackage.baselineHash,
      candidateHash: record.reviewPackage.candidateHash,
      validationResultHash: record.reviewPackage.validationResultHash,
      knowledgeBundleHash: record.reviewPackage.knowledgeBundleHash,
      reviewer,
      authorityReference: reviewer.role,
      decision: submission.decision,
      admissibility: 'ADMISSIBLE',
      executionStatus: 'COMPLETED',
      routingEligibility,
      dispositions: submission.dispositions,
      obligations: submission.obligations,
      rationale: submission.comments,
      escalationRequested,
      submittedTimestamp: this.clockPort.now(),
      validatedTimestamp: this.clockPort.now(),
      expiryTimestamp: record.reviewPackage.expiryTimestamp,
      integrityAlgorithm: 'SHA-256',
      integrityDigest
    };

    await this.repositoryPort.finalizeReview(submission.packageId, record.version, result);

    // Map continuation
    return this.continuationService.compileContinuation(result);
  }
}
