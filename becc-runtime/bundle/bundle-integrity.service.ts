import crypto from 'node:crypto';

export class BundleIntegrityService {
  /**
   * Calculates the SHA-256 hexadecimal hash over sorted semantic payload properties.
   */
  public calculateHash(sessionId: string, rules: any[], vocabulary: any[], evidence: any[]): string {
    const semanticObject = {
      sessionId,
      rules: this.deepSortKeys(rules),
      vocabulary: this.deepSortKeys(vocabulary),
      evidence: this.deepSortKeys(evidence)
    };

    const canonicalString = this.canonicalSerialize(semanticObject);
    return crypto.createHash('sha256').update(canonicalString).digest('hex');
  }

  /**
   * Recursively sorts object keys alphabetically.
   */
  private deepSortKeys(value: any): any {
    if (Array.isArray(value)) {
      return value.map(item => this.deepSortKeys(item));
    } else if (value !== null && typeof value === 'object') {
      const sortedKeys = Object.keys(value).sort();
      const sortedObj: any = {};
      for (const key of sortedKeys) {
        sortedObj[key] = this.deepSortKeys(value[key]);
      }
      return sortedObj;
    }
    return value;
  }

  /**
   * Normalizes newlines and serializes sorting-friendly JSON.
   */
  private canonicalSerialize(obj: any): string {
    const json = JSON.stringify(obj);
    return json.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n');
  }
}
