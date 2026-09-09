import crypto from 'node:crypto';

/**
 * Deep sorts an object to ensure deterministic JSON serialization.
 */
function deepSort(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSort);
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const sorted: Record<string, unknown> = {};
  for (const key of keys) {
    sorted[key] = deepSort((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

/**
 * Computes the SHA-256 hash of a UTF-8 string.
 */
export function calculateStringHash(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Computes a stable SHA-256 hash of any JSON-serializable object.
 */
export function calculateObjectHash(obj: unknown): string {
  const sorted = deepSort(obj);
  return calculateStringHash(JSON.stringify(sorted));
}
