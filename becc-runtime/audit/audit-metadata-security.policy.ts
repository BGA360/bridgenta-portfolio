/**
 * BECC v2 — Audit Metadata Security & Boundary Enforcement Policy
 *
 * Implements deterministic shape enforcement, sensitive key filtering,
 * metadata key allowlisting, byte size limits, raw payload prohibitions,
 * and canonicalization for BECC audit records as specified in BECC-NEXT-002.
 */

import { BeccAuditRecord, BeccAuditRecordInput } from './audit-ledger.types.js';

/**
 * Approved canonical allowlist of metadata keys permitted in BECC audit records.
 * Derived from current BECC v2 guidance, escalation, readiness, and integration usage.
 */
export const APPROVED_METADATA_ALLOWLIST = new Set<string>([
  'queryVersion',
  'matchStrategy',
  'lessonCount',
  'refusalCode',
  'refusalReason',
  'errorDetails',
  'ruleSourceRef',
  'ruleSourceRevision',
  'thresholdsEvaluated',
  'replayed',
  'replayedSteps',
  'customCategory',
  'safeSummary'
]);

/**
 * Prohibited raw payload keys that must never be embedded in audit metadata.
 */
export const PROHIBITED_RAW_PAYLOAD_KEYS = new Set<string>([
  'rawrequest',
  'requestbody',
  'rawresponse',
  'responsebody',
  'filecontents',
  'evidencecontent',
  'sourcetext',
  'documentbody'
]);

/**
 * Sensitive key terms requiring normalized token-boundary matching.
 */
const SENSITIVE_KEY_TERMS = [
  'secret',
  'password',
  'jwt',
  'cookie',
  'credential',
  'token',
  'key',
  'session',
  'privkey',
  'cert',
  'auth'
];

/**
 * Known sensitive key patterns that match camelCase / snake_case token boundaries
 * (e.g. authToken, access_token, apiKey, sessionId).
 */
const SENSITIVE_KEY_PATTERNS = [
  /\bauth[_-]?token\b/i,
  /\baccess[_-]?token\b/i,
  /\bapi[_-]?key\b/i,
  /\bsession[_-]?id\b/i,
  /\bsecret[_-]?token\b/i,
  /\bsecret[_-]?value\b/i,
  /\buser[_-]?password\b/i
];

/**
 * Maximum allowed UTF-8 serialized byte size for audit metadata.
 */
export const MAX_METADATA_SIZE_BYTES = 4096;

/**
 * Defense-in-depth regexes for detecting raw secret patterns inside string values.
 */
const SECRET_VALUE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/i,
  /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+)?PRIVATE\s+KEY-----/i,
  /\bghp_[A-Za-z0-9]{36}\b/,
  /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ // JWT pattern
];

/**
 * Recursively canonicalizes a value:
 * - Sorts object keys recursively.
 * - Preserves array order.
 * - Omits undefined properties deterministically.
 * - Preserves primitive scalar values and null.
 */
function canonicalizeValue(val: unknown): unknown {
  if (val === null || val === undefined) {
    return val;
  }
  if (typeof val !== 'object') {
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (Array.isArray(val)) {
    return val.map((item) => canonicalizeValue(item));
  }
  const obj = val as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const res: Record<string, unknown> = {};
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined) {
      const cv = canonicalizeValue(v);
      if (cv !== undefined) {
        res[k] = cv;
      }
    }
  }
  return res;
}

export class AuditMetadataSecurityPolicy {
  /**
   * Checks if a metadata key matches prohibited raw payload names.
   */
  public static isProhibitedRawPayloadKey(key: string): boolean {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, '');
    return PROHIBITED_RAW_PAYLOAD_KEYS.has(normalized);
  }

  /**
   * Checks if a metadata key matches sensitive key rules using token boundary matching.
   * Preserves false positive non-sensitive words (e.g., monkey, keyboard, keynote, turkey, hockey).
   */
  public static isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();

    // Check exact token terms
    for (const term of SENSITIVE_KEY_TERMS) {
      if (lowerKey === term) return true;
    }

    // Check structured token patterns
    for (const pattern of SENSITIVE_KEY_PATTERNS) {
      if (pattern.test(key)) return true;
    }

    // Check term as camelCase/snake_case word segment (e.g., authToken, user_secret)
    const segments = key.split(/(?=[A-Z])|[_.\-\s]+/).map((s) => s.toLowerCase());
    for (const segment of segments) {
      if (SENSITIVE_KEY_TERMS.includes(segment)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a string value contains high-confidence raw secret tokens.
   */
  public static containsSecretValuePattern(val: string): boolean {
    for (const pattern of SECRET_VALUE_PATTERNS) {
      if (pattern.test(val)) return true;
    }
    return false;
  }

  /**
   * Processes and sanitizes metadata dictionary according to approved security rules:
   * 1. Prohibits raw payload keys (fails closed if present).
   * 2. Drops sensitive keys (secret, token, password, etc.).
   * 3. Enforces allowlist (drops unknown keys).
   * 4. Enforces primitive value types (string, number, boolean). Drops nested objects/arrays/null/undefined.
   * 5. Defense-in-depth scanning for secret string values.
   * 6. Enforces <= 4096 UTF-8 bytes limit (fails closed if exceeded).
   */
  public static sanitizeMetadata(
    rawMetadata?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!rawMetadata || typeof rawMetadata !== 'object') {
      return undefined;
    }

    // Check for prohibited raw payload keys -> reject record immediately
    for (const key of Object.keys(rawMetadata)) {
      if (rawMetadata[key] !== undefined && this.isProhibitedRawPayloadKey(key)) {
        throw new Error(
          `Audit record metadata contains prohibited raw payload key '${key}'`
        );
      }
    }

    const sanitized: Record<string, unknown> = {};

    // Sort keys deterministically for canonicalization
    const keys = Object.keys(rawMetadata).sort();

    for (const key of keys) {
      // 1. Drop if key matches sensitive key rule
      if (this.isSensitiveKey(key)) {
        continue;
      }

      // 2. Drop if key is not on approved allowlist
      if (!APPROVED_METADATA_ALLOWLIST.has(key)) {
        continue;
      }

      const val = rawMetadata[key];

      // 3. Filter value types: allow primitive string, number, boolean only
      if (val === null || val === undefined) {
        continue; // DROP null/undefined
      }

      const valType = typeof val;
      if (valType === 'string') {
        const strVal = val as string;
        // Defense-in-depth secret pattern scanning
        if (this.containsSecretValuePattern(strVal)) {
          continue; // DROP value containing secret pattern
        }
        sanitized[key] = strVal;
      } else if (valType === 'number') {
        if (!isNaN(val as number) && isFinite(val as number)) {
          sanitized[key] = val;
        }
      } else if (valType === 'boolean') {
        sanitized[key] = val;
      }
      // Objects, arrays, functions, symbols, bigints, Dates are DROPPED automatically
    }

    if (Object.keys(sanitized).length === 0) {
      return undefined;
    }

    // Measure UTF-8 serialized byte size
    const serialized = JSON.stringify(sanitized);
    const byteSize = Buffer.byteLength(serialized, 'utf-8');

    if (byteSize > MAX_METADATA_SIZE_BYTES) {
      throw new Error(
        `Audit record metadata size (${byteSize} bytes) exceeds maximum limit of ${MAX_METADATA_SIZE_BYTES} UTF-8 bytes`
      );
    }

    return sanitized;
  }

  /**
   * Pre-processes an audit record input before passing to the audit ledger.
   * Ensures deterministic metadata shape and strict boundary enforcement.
   */
  public static sanitizeInput(input: BeccAuditRecordInput): BeccAuditRecordInput {
    if (!input) {
      return input;
    }

    const sanitizedMetadata = this.sanitizeMetadata(input.metadata);

    return {
      ...input,
      metadata: sanitizedMetadata
    };
  }

  /**
   * Asserts that an audit record's metadata strictly conforms to the security policy.
   * Throws an Error if the record metadata contains raw payload keys, sensitive keys,
   * unallowed keys, non-primitive values, secret value patterns, or exceeds aggregate size limits.
   * Non-mutating validator used at adapter trust boundaries.
   */
  public static assertSanitizedRecord(record: BeccAuditRecord): void {
    if (!record || !record.metadata) {
      return;
    }

    const metadata = record.metadata;
    const keys = Object.keys(metadata);

    for (const key of keys) {
      // 1. Prohibit raw payload keys
      if (this.isProhibitedRawPayloadKey(key)) {
        throw new Error(
          `Audit record metadata contains prohibited raw payload key '${key}'`
        );
      }

      // 2. Prohibit sensitive keys
      if (this.isSensitiveKey(key)) {
        throw new Error(
          `Audit record metadata contains sensitive key '${key}'`
        );
      }

      // 3. Prohibit keys not on approved allowlist
      if (!APPROVED_METADATA_ALLOWLIST.has(key)) {
        throw new Error(
          `Audit record metadata contains unallowed key '${key}'`
        );
      }

      const val = metadata[key];

      // 4. Prohibit non-primitive values (must be string, finite number, or boolean)
      if (val === null || val === undefined) {
        throw new Error(
          `Audit record metadata key '${key}' contains null or undefined value`
        );
      }

      const valType = typeof val;
      if (valType === 'string') {
        const strVal = val as string;
        if (this.containsSecretValuePattern(strVal)) {
          throw new Error(
            `Audit record metadata key '${key}' contains secret value pattern`
          );
        }
      } else if (valType === 'number') {
        if (isNaN(val as number) || !isFinite(val as number)) {
          throw new Error(
            `Audit record metadata key '${key}' contains non-finite number`
          );
        }
      } else if (valType !== 'boolean') {
        throw new Error(
          `Audit record metadata key '${key}' contains non-primitive value of type '${valType}'`
        );
      }
    }

    // 5. Enforce UTF-8 byte size limit
    const serialized = JSON.stringify(metadata);
    const byteSize = Buffer.byteLength(serialized, 'utf-8');
    if (byteSize > MAX_METADATA_SIZE_BYTES) {
      throw new Error(
        `Audit record metadata size (${byteSize} bytes) exceeds maximum limit of ${MAX_METADATA_SIZE_BYTES} UTF-8 bytes`
      );
    }
  }

  /**
   * Deterministically canonicalizes a BeccAuditRecord or record input recursively
   * ensuring key order invariance for exact retry comparisons across the entire semantic record.
   */
  public static canonicalizeRecord<T>(record: T): T {
    if (!record) {
      return record;
    }
    return canonicalizeValue(record) as T;
  }
}
