import { VerifiedReviewer } from './types.js';
import { ReviewerNotAuthorizedError } from './exceptions.js';

export class ReviewerAuthorityService {
  public validate(reviewer: VerifiedReviewer, projectId: string, classification: string): void {
    // 1. Verify project scope
    if (!reviewer.projectIds.includes(projectId) && !reviewer.projectIds.includes('*')) {
      throw new ReviewerNotAuthorizedError(`Reviewer is not assigned to project [${projectId}]`);
    }

    // 2. Verify classification scope
    const matchesClassification = reviewer.classifications.some(
      c => c === '*' || c.toLowerCase() === classification.toLowerCase()
    );
    if (!matchesClassification) {
      throw new ReviewerNotAuthorizedError(`Reviewer classification scope does not cover [${classification}]`);
    }
  }
}
