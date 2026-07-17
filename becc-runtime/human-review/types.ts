import { AssessmentContext, ValidationResultReport, ValidationFinding, ApplicableHumanReviewObligation } from '../shared/types.js';

export type HumanReviewDecision =
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUIRED'
  | 'ESCALATION_REQUESTED';

export type HumanReviewExecutionStatus =
  | 'PREPARED'
  | 'AWAITING_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED';

export type DecisionAdmissibility = 'ADMISSIBLE' | 'INADMISSIBLE';
export type RoutingEligibility = 'ELIGIBLE' | 'INELIGIBLE';

export interface CandidateLineage {
  readonly candidateId: string;
  readonly parentCandidateId?: string;
  readonly revisionNumber: number;
  readonly originatingReviewRequestId?: string;
}

export interface HumanReviewInput {
  readonly schemaVersion: string;
  readonly reviewRequestId: string;
  readonly assessmentId: string;
  readonly sessionId: string;
  readonly projectId: string;
  readonly targetPath: string;
  readonly authorReference?: string;
  readonly baselineReference: string;
  readonly baselineHash: string;
  readonly candidateId: string;
  readonly candidateCommunication: string;
  readonly candidateHash: string;
  readonly candidateDiff?: string;
  readonly transformationMetadataReference: string;
  readonly validationResult: ValidationResultReport;
  readonly validationResultHash: string;
  readonly knowledgeBundleReference: string;
  readonly knowledgeBundleHash: string;
  readonly applicableObligations: readonly ApplicableHumanReviewObligation[];
  readonly lifecycle: string;
  readonly classification: string;
  readonly locale: string;
  readonly reviewerPolicyReference: string;
  readonly expiryPolicyReference?: string;
}

export interface ReviewPackage {
  readonly schemaVersion: string;
  readonly packageId: string;
  readonly reviewRequestId: string;
  readonly assessmentId: string;
  readonly sessionId: string;
  readonly projectId: string;
  readonly targetPath: string;
  readonly candidateLineage: CandidateLineage;
  readonly baselineHash: string;
  readonly candidateHash: string;
  readonly validationResultHash: string;
  readonly knowledgeBundleHash: string;
  readonly controlledDiff?: string;
  readonly findings: readonly ValidationFinding[];
  readonly obligations: readonly ApplicableHumanReviewObligation[];
  readonly reviewerPolicyReference: string;
  readonly creationTimestamp: string;
  readonly expiryTimestamp?: string;
  readonly contentPolicyReference: string;
  readonly integrityAlgorithm: 'SHA-256';
  readonly integrityDigest: string;
}

export interface VerifiedReviewer {
  readonly reviewerId: string;
  readonly role: string;
  readonly projectIds: readonly string[];
  readonly classifications: readonly string[];
}

export interface ReviewerAuthority {
  readonly projectIds: readonly string[];
  readonly classifications: readonly string[];
  readonly permittedDecisions: readonly HumanReviewDecision[];
  readonly validUntil?: string;
  readonly authorityReference: string;
}

export interface FindingDisposition {
  readonly findingId: string;
  readonly code: 'acknowledged' | 'false_positive' | 'risk_accepted';
  readonly rationale: string;
}

export interface ObligationResponse {
  readonly obligationId: string;
  readonly response: boolean;
  readonly rationale: string;
}

export interface HumanReviewSubmission {
  readonly packageId: string;
  readonly decision: HumanReviewDecision;
  readonly reviewerId: string;
  readonly assertion: string; // reviewer authority assertion claim token
  readonly dispositions: readonly FindingDisposition[];
  readonly obligations: readonly ObligationResponse[];
  readonly comments?: string;
}

export interface HumanReviewResult {
  readonly schemaVersion: string;
  readonly reviewRequestId: string;
  readonly packageId: string;
  readonly assessmentId: string;
  readonly sessionId: string;
  readonly projectId: string;
  readonly targetPath: string;
  readonly candidateLineage: CandidateLineage;
  readonly baselineHash: string;
  readonly candidateHash: string;
  readonly validationResultHash: string;
  readonly knowledgeBundleHash: string;
  readonly reviewer: VerifiedReviewer;
  readonly authorityReference: string;
  readonly decision: HumanReviewDecision;
  readonly admissibility: DecisionAdmissibility;
  readonly executionStatus: HumanReviewExecutionStatus;
  readonly routingEligibility: RoutingEligibility;
  readonly dispositions: readonly FindingDisposition[];
  readonly obligations: readonly ObligationResponse[];
  readonly rationale?: string;
  readonly escalationRequested: boolean;
  readonly submittedTimestamp: string;
  readonly validatedTimestamp: string;
  readonly expiryTimestamp?: string;
  readonly integrityAlgorithm: 'SHA-256';
  readonly integrityDigest: string;
}

export interface PreparedReviewRecord {
  readonly reviewPackage: ReviewPackage;
  readonly executionStatus: HumanReviewExecutionStatus;
  readonly version: number;
  readonly context: AssessmentContext;
}

export interface HumanReviewContinuation {
  readonly reviewRequestId: string;
  readonly sessionId: string;
  readonly candidateId: string;
  readonly decision: HumanReviewDecision;
  readonly routingEligibility: RoutingEligibility;
  readonly resultReference: string;
}

export interface SelfReviewPolicy {
  readonly approvalByAuthorAllowed: boolean;
  readonly rejectionByAuthorAllowed: boolean;
  readonly revisionRequestByAuthorAllowed: boolean;
  readonly escalationByAuthorAllowed: boolean;
}

export interface ReviewContentPolicy {
  readonly maximumCandidateExcerptLength: number;
  readonly maximumEvidenceExcerptLength: number;
  readonly maximumRationaleLength: number;
  readonly maximumCommentLength: number;
  readonly allowFullCandidate: boolean;
}

export interface ReviewIntegrityPayload {
  readonly schemaVersion: string;
  readonly reviewRequestId: string;
  readonly assessmentId: string;
  readonly sessionId: string;
  readonly projectId: string;
  readonly targetPath: string;
  readonly baselineHash: string;
  readonly candidateHash: string;
  readonly validationResultHash: string;
  readonly knowledgeBundleHash: string;
}

