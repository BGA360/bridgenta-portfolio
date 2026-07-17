import { createHash } from 'node:crypto';
import { ReviewIntegrityPayload } from './types.js';

export class ReviewIntegrityService {
  public calculateDigest(payload: ReviewIntegrityPayload): string {
    const canonicalStr = this.canonicalSerialize(payload);
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

  public canonicalSerialize(obj: any): string {
    if (obj === null) return 'null';
    if (typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.canonicalSerialize(item)).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    const parts = keys.map(key => `"${key}":${this.canonicalSerialize(obj[key])}`);
    return '{' + parts.join(',') + '}';
  }
}
