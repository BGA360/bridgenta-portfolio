import { ApplicableHumanReviewObligation } from '../shared/types.js';
import { ObligationResponse } from './types.js';
import {
  UnknownObligationError,
  DuplicateObligationResponseError,
  InvalidObligationResponseError,
  UnresolvedBlockingObligationError
} from './exceptions.js';

export class ObligationResponseValidatorService {
  public validate(
    obligations: readonly ApplicableHumanReviewObligation[],
    responses: readonly ObligationResponse[],
    isApproved: boolean
  ): void {
    const obligationsMap = new Map<string, ApplicableHumanReviewObligation>();
    for (const ob of obligations) {
      obligationsMap.set(ob.obligationId, ob);
    }

    const seenResponses = new Set<string>();

    for (const resp of responses) {
      // 1. Check unknown obligation ID
      const obligation = obligationsMap.get(resp.obligationId);
      if (!obligation) {
        throw new UnknownObligationError(resp.obligationId);
      }

      // 2. Check duplicates
      if (seenResponses.has(resp.obligationId)) {
        throw new DuplicateObligationResponseError(resp.obligationId);
      }
      seenResponses.add(resp.obligationId);

      // 3. Validate rationale
      if (obligation.rationaleRequired && (!resp.rationale || resp.rationale.trim().length < 10)) {
        throw new InvalidObligationResponseError(resp.obligationId, 'Obligation rationale must be at least 10 characters long.');
      }

      // 4. Validate blocking behavior on approval
      if (isApproved && obligation.blocking && !resp.response) {
        throw new UnresolvedBlockingObligationError(resp.obligationId);
      }
    }

    // If decision is APPROVED, check all blocking obligations have a valid response
    if (isApproved) {
      for (const obligation of obligations) {
        if (obligation.blocking) {
          if (!seenResponses.has(obligation.obligationId)) {
            throw new UnresolvedBlockingObligationError(obligation.obligationId);
          }
        }
      }
    }
  }
}
