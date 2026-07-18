import { EvidenceContentPolicy } from './types.js';
import { createHmac } from 'node:crypto';

export class EvidenceContentPolicyService {
  constructor(private policy: EvidenceContentPolicy) {}

  public redactPath(documentPath: string): string {
    if (!this.policy.redactPaths) return documentPath;
    let normalized = documentPath.replace(/\\/g, '/');
    if (normalized.includes(':')) {
      normalized = normalized.split(':').pop() || '';
    }
    if (normalized.startsWith('/')) {
      normalized = normalized.substring(1);
    }
    return normalized;
  }

  public maskReviewerId(reviewerId: string, salt: string): string {
    if (!this.policy.hmacReviewerIds) return reviewerId;
    return createHmac('sha256', salt).update(reviewerId).digest('hex');
  }
}
