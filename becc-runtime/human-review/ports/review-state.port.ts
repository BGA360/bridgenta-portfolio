import { PreparedReviewRecord, HumanReviewResult } from '../types.js';

export interface IReviewStateRepositoryPort {
  savePreparedReview(record: PreparedReviewRecord): Promise<void>;
  
  loadPreparedReview(reviewRequestId: string): Promise<PreparedReviewRecord | null>;
  
  finalizeReview(
    reviewRequestId: string,
    expectedVersion: number,
    result: HumanReviewResult
  ): Promise<void>;
  
  markCancelled(reviewRequestId: string, expectedVersion: number): Promise<void>;
  
  markExpired(reviewRequestId: string, expectedVersion: number): Promise<void>;
}
