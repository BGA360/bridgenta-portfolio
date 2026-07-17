import { HumanReviewResult, HumanReviewContinuation } from './types.js';

export class ReviewContinuationService {
  public compileContinuation(result: HumanReviewResult): HumanReviewContinuation {
    return {
      reviewRequestId: result.reviewRequestId,
      sessionId: result.sessionId,
      candidateId: result.candidateLineage.candidateId,
      decision: result.decision,
      routingEligibility: result.routingEligibility,
      resultReference: `result-${result.reviewRequestId}.json`
    };
  }
}
