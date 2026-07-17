import { ReviewContentPolicy } from '../types.js';

export class DefaultReviewContentPolicy implements ReviewContentPolicy {
  readonly maximumCandidateExcerptLength = 100;
  readonly maximumEvidenceExcerptLength = 100;
  readonly maximumRationaleLength = 2000;
  readonly maximumCommentLength = 2000;
  readonly allowFullCandidate = true;
}
