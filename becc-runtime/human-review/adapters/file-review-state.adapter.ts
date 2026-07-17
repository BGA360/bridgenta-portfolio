import fs from 'node:fs';
import path from 'node:path';
import { IReviewStateRepositoryPort } from '../ports/review-state.port.js';
import { PreparedReviewRecord, HumanReviewResult } from '../types.js';
import {
  ReviewPackageNotFoundError,
  ReviewStateConflictError,
  ReviewStatePersistenceError
} from '../exceptions.js';

export class FileReviewStateAdapter implements IReviewStateRepositoryPort {
  constructor(private readonly storageDir: string) {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  }

  private getRecordPath(reviewRequestId: string): string {
    const safeName = reviewRequestId.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(this.storageDir, `review-${safeName}.json`);
  }

  private getResultPath(reviewRequestId: string): string {
    const safeName = reviewRequestId.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(this.storageDir, `result-${safeName}.json`);
  }

  public async savePreparedReview(record: PreparedReviewRecord): Promise<void> {
    const filePath = this.getRecordPath(record.reviewPackage.reviewRequestId);
    try {
      fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');
    } catch (err: any) {
      throw new ReviewStatePersistenceError(err.message);
    }
  }

  public async loadPreparedReview(reviewRequestId: string): Promise<PreparedReviewRecord | null> {
    const filePath = this.getRecordPath(reviewRequestId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (err: any) {
      throw new ReviewStatePersistenceError(err.message);
    }
  }

  public async finalizeReview(
    reviewRequestId: string,
    expectedVersion: number,
    result: HumanReviewResult
  ): Promise<void> {
    const record = await this.loadPreparedReview(reviewRequestId);
    if (!record) {
      throw new ReviewPackageNotFoundError(reviewRequestId);
    }
    if (record.version !== expectedVersion) {
      throw new ReviewStateConflictError();
    }

    const updatedRecord: PreparedReviewRecord = {
      ...record,
      executionStatus: 'COMPLETED',
      version: record.version + 1
    };

    await this.savePreparedReview(updatedRecord);

    const resultPath = this.getResultPath(reviewRequestId);
    try {
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf8');
    } catch (err: any) {
      throw new ReviewStatePersistenceError(err.message);
    }
  }

  public async markCancelled(reviewRequestId: string, expectedVersion: number): Promise<void> {
    const record = await this.loadPreparedReview(reviewRequestId);
    if (!record) {
      throw new ReviewPackageNotFoundError(reviewRequestId);
    }
    if (record.version !== expectedVersion) {
      throw new ReviewStateConflictError();
    }

    const updatedRecord: PreparedReviewRecord = {
      ...record,
      executionStatus: 'CANCELLED',
      version: record.version + 1
    };

    await this.savePreparedReview(updatedRecord);
  }

  public async markExpired(reviewRequestId: string, expectedVersion: number): Promise<void> {
    const record = await this.loadPreparedReview(reviewRequestId);
    if (!record) {
      throw new ReviewPackageNotFoundError(reviewRequestId);
    }
    if (record.version !== expectedVersion) {
      throw new ReviewStateConflictError();
    }

    const updatedRecord: PreparedReviewRecord = {
      ...record,
      executionStatus: 'EXPIRED',
      version: record.version + 1
    };

    await this.savePreparedReview(updatedRecord);
  }
}
