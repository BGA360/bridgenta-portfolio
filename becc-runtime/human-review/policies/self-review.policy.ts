import { SelfReviewPolicy } from '../types.js';

export class DefaultSelfReviewPolicy implements SelfReviewPolicy {
  readonly approvalByAuthorAllowed = false;
  readonly rejectionByAuthorAllowed = true;
  readonly revisionRequestByAuthorAllowed = true;
  readonly escalationByAuthorAllowed = true;
}
