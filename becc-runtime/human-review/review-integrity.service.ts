import { createHash } from 'node:crypto';
import { ReviewIntegrityPayload } from './types.js';
import { canonicalizeJson } from '../shared/canonicalize.js';

export class ReviewIntegrityService {
  public calculateDigest(payload: ReviewIntegrityPayload): string {
    const canonicalStr = canonicalizeJson(payload);
    return createHash('sha256').update(canonicalStr).digest('hex');
  }

  public constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
