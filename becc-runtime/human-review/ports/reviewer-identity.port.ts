import { VerifiedReviewer } from '../types.js';

export interface IReviewerIdentityPort {
  verify(assertion: string, context: Record<string, unknown>): Promise<VerifiedReviewer>;
}
