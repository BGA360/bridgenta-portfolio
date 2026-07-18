/**
 * Shared canonicalization utilities for BECC v2.1.
 */

/**
 * Recursively canonicalizes an object by sorting all keys alphabetically.
 * Matches ReviewIntegrityService.canonicalSerialize.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJson(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const parts: string[] = [];
  for (const key of keys) {
    if (obj[key] !== undefined) {
      parts.push(`"${key}":${canonicalizeJson(obj[key])}`);
    }
  }
  return '{' + parts.join(',') + '}';
}

/**
 * Serializes an object using standard JSON.stringify and replaces CRLF with LF.
 * Matches BundleIntegrityService.canonicalSerialize.
 */
export function canonicalizeRawStringify(obj: any): string {
  const json = JSON.stringify(obj);
  return json
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\r\\n/g, '\\n')
    .replace(/\\r/g, '\\n');
}
