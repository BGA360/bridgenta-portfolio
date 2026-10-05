/**
 * BECC v2 — Operational Observability Security Policy
 *
 * Enforces secret redaction, safe error classification, metric label cardinality restriction,
 * and reuse of shared sensitive-term detection logic as specified in BECC-NEXT-004.
 */

import { AuditMetadataSecurityPolicy } from '../audit/audit-metadata-security.policy.js';
import {
  BeccOperationalContext,
  BeccSafeOperationalError,
  BeccOperationalErrorClass,
  BeccOperationalLogRecord
} from './observability.types.js';

export class ObservabilitySecurityPolicy {
  /**
   * Sanitizes operational context to guarantee:
   * - No tenantRef / organizationRef / rawRequest / rawResponse fields added.
   * - High-risk key/value properties are redacted or stripped.
   */
  public static sanitizeContext(context: BeccOperationalContext): BeccOperationalContext {
    if (!context) {
      throw new Error('Operational context is required');
    }

    const {
      operationType,
      operationId,
      correlationRef,
      causationRef,
      projectRef,
      workstreamRef,
      dependencyName,
      occurredAt
    } = (context as unknown as Record<string, unknown>);

    // Enforce no tenancy / organization / raw payload fields
    const sanitized: BeccOperationalContext = {
      operationType: this.sanitizeString(String(operationType || 'UNKNOWN')),
      operationId: this.sanitizeString(String(operationId || 'unknown-op-id')),
      correlationRef: this.sanitizeString(String(correlationRef || 'unknown-correlation')),
      causationRef: causationRef ? this.sanitizeString(String(causationRef)) : undefined,
      projectRef: projectRef ? this.sanitizeString(String(projectRef)) : undefined,
      workstreamRef: workstreamRef ? this.sanitizeString(String(workstreamRef)) : undefined,
      dependencyName: dependencyName ? this.sanitizeString(String(dependencyName)) : undefined,
      occurredAt: occurredAt ? this.sanitizeString(String(occurredAt)) : new Date().toISOString()
    };

    return sanitized;
  }

  /**
   * Converts any raw thrown error or message into a safe operational error classification.
   * Prevents raw error objects containing secrets or stack traces from escaping into observability.
   */
  public static classifyError(
    err: unknown,
    defaultClass: BeccOperationalErrorClass = 'INTERNAL'
  ): BeccSafeOperationalError {
    if (!err) {
      return {
        errorClass: defaultClass,
        safeErrorCode: 'ERR_UNKNOWN',
        safeMessage: 'An unspecified error occurred'
      };
    }

    if (
      typeof err === 'object' &&
      err !== null &&
      'errorClass' in err &&
      'safeErrorCode' in err &&
      'safeMessage' in err
    ) {
      const e = err as BeccSafeOperationalError;
      return {
        errorClass: e.errorClass,
        safeErrorCode: this.sanitizeString(e.safeErrorCode),
        safeMessage: this.sanitizeString(e.safeMessage)
      };
    }

    const rawMessage = err instanceof Error ? err.message : String(err);
    const sanitizedMsg = this.sanitizeString(rawMessage);

    // Bounded classification heuristics based on error content
    let errorClass: BeccOperationalErrorClass = defaultClass;
    let safeErrorCode = 'ERR_INTERNAL';

    const lowerMsg = rawMessage.toLowerCase();
    if (lowerMsg.includes('validation') || lowerMsg.includes('required') || lowerMsg.includes('invalid')) {
      errorClass = 'VALIDATION';
      safeErrorCode = 'ERR_VALIDATION_FAILED';
    } else if (lowerMsg.includes('auth') || lowerMsg.includes('permission') || lowerMsg.includes('denied')) {
      errorClass = 'AUTHORIZATION';
      safeErrorCode = 'ERR_UNAUTHORIZED';
    } else if (lowerMsg.includes('connect') || lowerMsg.includes('econrefused') || lowerMsg.includes('unavailable')) {
      errorClass = 'DEPENDENCY_UNAVAILABLE';
      safeErrorCode = 'ERR_DEPENDENCY_UNAVAILABLE';
    } else if (lowerMsg.includes('timeout') || lowerMsg.includes('etimedout')) {
      errorClass = 'DEPENDENCY_TIMEOUT';
      safeErrorCode = 'ERR_DEPENDENCY_TIMEOUT';
    } else if (lowerMsg.includes('postgres') || lowerMsg.includes('sql') || lowerMsg.includes('migration')) {
      errorClass = 'PERSISTENCE';
      safeErrorCode = 'ERR_PERSISTENCE_FAILED';
    } else if (lowerMsg.includes('conflict') || lowerMsg.includes('duplicate')) {
      errorClass = 'CONFLICT';
      safeErrorCode = 'ERR_CONFLICT';
    } else if (lowerMsg.includes('schema') || lowerMsg.includes('checksum')) {
      errorClass = 'SCHEMA_MISMATCH';
      safeErrorCode = 'ERR_SCHEMA_MISMATCH';
    }

    return {
      errorClass,
      safeErrorCode,
      safeMessage: sanitizedMsg
    };
  }

  /**
   * Sanitizes a string using shared sensitive term detection logic.
   * Uses AuditMetadataSecurityPolicy pattern checks.
   */
  public static sanitizeString(str: string): string {
    if (!str) return str;

    // Check for secret value patterns (Bearer tokens, SSH keys, GitHub tokens, JWTs)
    if (AuditMetadataSecurityPolicy.containsSecretValuePattern(str)) {
      return '[REDACTED_SECRET_PATTERN]';
    }

    // Direct check for common credentials/tokens
    const sensitiveTokens = [/password=[^\s;&]+/gi, /bearer\s+[^\s]+/gi, /api[_-]?key=[^\s;&]+/gi];

    let sanitized = str;
    for (const pat of sensitiveTokens) {
      sanitized = sanitized.replace(pat, '[REDACTED]');
    }

    return sanitized;
  }

  /**
   * Asserts that a log record is free from prohibited raw payload keys, secrets, and tenancy fields.
   */
  public static sanitizeLogRecord(record: BeccOperationalLogRecord): BeccOperationalLogRecord {
    const copy = { ...record };

    // Delete prohibited tenancy / raw payload fields if injected
    const rawObj = copy as Record<string, unknown>;
    delete rawObj.tenantRef;
    delete rawObj.organizationRef;
    delete rawObj.userEmail;
    delete rawObj.rawRequest;
    delete rawObj.rawResponse;

    if (copy.safeMessage) {
      copy.safeMessage = this.sanitizeString(copy.safeMessage);
    }

    return copy;
  }

  /**
   * Restricts metric label keys and values to bounded, low-cardinality values only.
   * Rejects unbounded IDs (operationId, auditRecordId, candidateRef, projectRef, raw URLs).
   */
  public static buildBoundedMetricLabel(
    operationType?: string,
    resultStatus?: string,
    dependencyName?: string,
    safeErrorCode?: string,
    errorClass?: string
  ): string {
    const boundedOpType = operationType ? this.sanitizeMetricDimension(operationType) : 'ALL';
    const boundedStatus = resultStatus ? this.sanitizeMetricDimension(resultStatus) : 'ALL';
    const boundedDep = dependencyName ? this.sanitizeMetricDimension(dependencyName) : 'NONE';
    const boundedErr = errorClass ? this.sanitizeMetricDimension(errorClass) : safeErrorCode ? this.sanitizeMetricDimension(safeErrorCode) : 'NONE';

    return `op:${boundedOpType}|status:${boundedStatus}|dep:${boundedDep}|err:${boundedErr}`;
  }

  private static sanitizeMetricDimension(val: string): string {
    // Standardize to uppercase alphanumeric + underscore to ensure low cardinality
    return val.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  }
}
