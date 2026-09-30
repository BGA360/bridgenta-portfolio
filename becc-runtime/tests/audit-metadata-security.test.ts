/**
 * BECC v2 — Audit Metadata Security & Boundary Enforcement Test Suite
 *
 * Exercises AuditMetadataSecurityPolicy shape enforcement, sensitive-key matching,
 * metadata allowlist filtering, byte-size limits, raw payload prohibitions,
 * canonicalization, and integration as specified in BECC-NEXT-002.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AuditMetadataSecurityPolicy,
  MAX_METADATA_SIZE_BYTES
} from '../audit/audit-metadata-security.policy.js';
import { BeccAuditIntegrationService } from '../audit/audit-integration.service.js';
import { InMemoryBeccAuditLedger } from '../audit/in-memory-audit-ledger.adapter.js';
import { BeccAuditRecordInput } from '../audit/audit-ledger.types.js';

describe('BECC v2 — Audit Metadata Security & Boundary Enforcement (BECC-NEXT-002)', () => {
  // A. Allowed metadata primitives
  it('A. Allowed primitives — preserves allowlisted string, number, and boolean', () => {
    const raw = {
      queryVersion: 'v1.0.0',
      lessonCount: 42,
      replayed: false,
      matchStrategy: 'STRICT'
    };
    const sanitized = AuditMetadataSecurityPolicy.sanitizeMetadata(raw);
    assert.deepEqual(sanitized, {
      lessonCount: 42,
      matchStrategy: 'STRICT',
      queryVersion: 'v1.0.0',
      replayed: false
    });
  });

  it('A. Allowed primitives — handles empty or undefined metadata gracefully', () => {
    assert.equal(AuditMetadataSecurityPolicy.sanitizeMetadata(undefined), undefined);
    assert.equal(AuditMetadataSecurityPolicy.sanitizeMetadata({}), undefined);
  });

  // B. Unknown keys
  it('B. Unknown keys — drops unallowlisted metadata keys deterministically', () => {
    const raw = {
      queryVersion: 'v1.0.0',
      unknownCustomKey: 'someValue',
      anotherUnapprovedField: 123
    };
    const sanitized = AuditMetadataSecurityPolicy.sanitizeMetadata(raw);
    assert.deepEqual(sanitized, {
      queryVersion: 'v1.0.0'
    });
  });

  // C. Sensitive keys
  it('C. Sensitive keys — drops sensitive key terms (password, secret, token, etc.)', () => {
    const raw = {
      queryVersion: 'v1.0.0',
      authToken: 'secret_token_123',
      user_password: 'Password123!',
      apiKey: 'key_abc_123',
      sessionId: 'sess_999'
    };
    const sanitized = AuditMetadataSecurityPolicy.sanitizeMetadata(raw);
    assert.deepEqual(sanitized, {
      queryVersion: 'v1.0.0'
    });
  });

  // D. False positives
  it('D. False positive protection — preserves non-sensitive words containing incidental substrings', () => {
    // Check key matching directly on policy
    const raw = {
      queryVersion: 'v1.0.0',
      customCategory: 'keyboard_event' // allowed key with word containing 'key'
    };
    const sanitized = AuditMetadataSecurityPolicy.sanitizeMetadata(raw);
    assert.equal(sanitized?.customCategory, 'keyboard_event');
  });

  // E. Invalid structures
  it('E. Invalid structures — drops nested objects, arrays, functions, and symbols', () => {
    const raw = {
      queryVersion: 'v1.0.0',
      nestedObj: { foo: 'bar' },
      itemsArray: [1, 2, 3],
      nullVal: null,
      funcVal: () => {}
    };
    const sanitized = AuditMetadataSecurityPolicy.sanitizeMetadata(raw as any);
    assert.deepEqual(sanitized, {
      queryVersion: 'v1.0.0'
    });
  });

  // F. Size enforcement
  it('F. Size enforcement — allows metadata <= 4096 UTF-8 bytes and rejects > 4096 UTF-8 bytes', () => {
    const smallStr = 'a'.repeat(4000);
    const validRaw = {
      errorDetails: smallStr
    };
    const sanitized = AuditMetadataSecurityPolicy.sanitizeMetadata(validRaw);
    assert.ok(sanitized);

    const oversizedStr = 'a'.repeat(4100);
    const oversizedRaw = {
      errorDetails: oversizedStr
    };
    assert.throws(
      () => AuditMetadataSecurityPolicy.sanitizeMetadata(oversizedRaw),
      /Audit record metadata size .* exceeds maximum limit of 4096 UTF-8 bytes/
    );
  });

  // G. Raw payload bypass attempts
  it('G. Raw payload prohibition — fails closed if metadata attempts to embed prohibited raw payloads', () => {
    const prohibitedKeys = [
      'rawRequest',
      'requestBody',
      'rawResponse',
      'responseBody',
      'fileContents',
      'evidenceContent',
      'sourceText',
      'documentBody'
    ];

    for (const key of prohibitedKeys) {
      assert.throws(
        () => AuditMetadataSecurityPolicy.sanitizeMetadata({ [key]: 'payload content' }),
        new RegExp(`Audit record metadata contains prohibited raw payload key '${key}'`)
      );
    }
  });

  // H. Secret pattern defense-in-depth
  it('H. Defense-in-depth — drops string metadata values containing high-confidence raw secret patterns', () => {
    const raw = {
      queryVersion: 'v1.0.0',
      errorDetails: 'Failed with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c token'
    };
    const sanitized = AuditMetadataSecurityPolicy.sanitizeMetadata(raw);
    // Value matching JWT pattern is dropped
    assert.deepEqual(sanitized, {
      queryVersion: 'v1.0.0'
    });
  });

  // I. Integration with BeccAuditIntegrationService
  it('I. Integration — BeccAuditIntegrationService enforces security policy on recordAudit()', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const input: BeccAuditRecordInput = {
      auditRecordId: 'aud-sec-test-001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op-sec-001',
      occurredAt: '2026-09-30T10:00:00Z',
      resultStatus: 'SUCCESS',
      metadata: {
        queryVersion: 'v1.0.0',
        secretToken: 'super_secret', // Should be dropped
        rawRequest: undefined // undefined raw request key is dropped safely
      }
    };

    const record = await service.recordAudit(input);
    assert.equal(record.auditRecordId, 'aud-sec-test-001');
    assert.deepEqual(record.metadata, { queryVersion: 'v1.0.0' });

    // Verify record in ledger
    const stored = await ledger.getById('aud-sec-test-001');
    assert.ok(stored);
    assert.equal((stored.metadata as any)?.secretToken, undefined);
  });

  it('I. Integration — exact retry of security-processed record is idempotent', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const input: BeccAuditRecordInput = {
      auditRecordId: 'aud-sec-retry-001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op-sec-retry-001',
      occurredAt: '2026-09-30T10:00:00Z',
      resultStatus: 'SUCCESS',
      metadata: {
        queryVersion: 'v1.0.0',
        lessonCount: 5
      }
    };

    // First emission
    await service.recordAudit(input);

    // Exact retry emission (same parameters)
    await service.recordAudit(input);

    const list = await ledger.listByOperationRef('op-sec-retry-001');
    assert.equal(list.length, 1);
  });

  it('I. Integration — conflicting record identity fails closed', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const input1: BeccAuditRecordInput = {
      auditRecordId: 'aud-sec-conflict-001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op-sec-conf-001',
      actorRef: 'ActorA',
      occurredAt: '2026-09-30T10:00:00Z',
      resultStatus: 'SUCCESS'
    };

    const input2: BeccAuditRecordInput = {
      ...input1,
      actorRef: 'ActorB' // Mismatched actorRef triggers identity conflict
    };

    await service.recordAudit(input1);

    await assert.rejects(
      () => service.recordAudit(input2),
      /Conflicting audit record identity 'aud-sec-conflict-001' already exists in ledger/
    );
  });

  // J. Phase 10 — Direct sensitive key classifier predicate tests
  it('J. Sensitive key classifier — correctly identifies sensitive terms and protects false positives', () => {
    const truePositives = [
      'password',
      'Password',
      'PASSWORD',
      'secret',
      'secretValue',
      'authToken',
      'access_token',
      'apiKey',
      'jwt',
      'cookie',
      'sessionId',
      'credential'
    ];

    for (const key of truePositives) {
      assert.equal(
        AuditMetadataSecurityPolicy.isSensitiveKey(key),
        true,
        `Expected '${key}' to be classified as sensitive`
      );
    }

    const falsePositives = ['keyboard', 'keynote', 'monkey', 'turkey', 'hockey'];

    for (const key of falsePositives) {
      assert.equal(
        AuditMetadataSecurityPolicy.isSensitiveKey(key),
        false,
        `Expected non-sensitive key '${key}' to NOT be classified as sensitive`
      );
    }
  });

  // K. Phase 11 — Direct raw payload normalization tests
  it('K. Raw payload normalization — correctly detects normalized raw payload key variants', () => {
    const variants = [
      'rawRequest',
      'raw_request',
      'raw-request',
      'RAW_REQUEST',
      'requestBody',
      'request_body',
      'responseBody',
      'fileContents',
      'evidenceContent',
      'sourceText',
      'documentBody'
    ];

    for (const key of variants) {
      assert.equal(
        AuditMetadataSecurityPolicy.isProhibitedRawPayloadKey(key),
        true,
        `Expected raw payload key variant '${key}' to be recognized as prohibited`
      );
    }
  });

  // L. Phase 12 — Secret value defense-in-depth tests
  it('L. Secret value pattern detector — detects true secrets and preserves benign strings', () => {
    const trueSecretStrings = [
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----',
      'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    ];

    for (const secretStr of trueSecretStrings) {
      assert.equal(
        AuditMetadataSecurityPolicy.containsSecretValuePattern(secretStr),
        true,
        `Expected secret string pattern to be detected`
      );
    }

    const benignStrings = [
      'tokenization completed',
      'keynote presentation',
      'session count is 4'
    ];

    for (const benignStr of benignStrings) {
      assert.equal(
        AuditMetadataSecurityPolicy.containsSecretValuePattern(benignStr),
        false,
        `Expected benign string '${benignStr}' to NOT be flagged as a secret pattern`
      );
    }
  });

  // M. Phase 8 & 9 — Exact UTF-8 byte boundary tests and multi-byte UTF-8 test
  it('M. Exact UTF-8 boundary — enforces 4095, 4096 (PASS) and 4097 (REJECT) byte limits', () => {
    // Overhead of JSON serialization `{"errorDetails":""}` is 19 bytes.
    // String length 4076 -> JSON byte size = 19 + 4076 = 4095 bytes
    const str4076 = 'a'.repeat(4076);
    const meta4095 = { errorDetails: str4076 };
    const sanitized4095 = AuditMetadataSecurityPolicy.sanitizeMetadata(meta4095);
    assert.ok(sanitized4095);
    assert.equal(Buffer.byteLength(JSON.stringify(sanitized4095), 'utf-8'), 4095);

    // String length 4077 -> JSON byte size = 19 + 4077 = 4096 bytes
    const str4077 = 'a'.repeat(4077);
    const meta4096 = { errorDetails: str4077 };
    const sanitized4096 = AuditMetadataSecurityPolicy.sanitizeMetadata(meta4096);
    assert.ok(sanitized4096);
    assert.equal(Buffer.byteLength(JSON.stringify(sanitized4096), 'utf-8'), 4096);

    // String length 4078 -> JSON byte size = 19 + 4078 = 4097 bytes => REJECT
    const str4078 = 'a'.repeat(4078);
    const meta4097 = { errorDetails: str4078 };
    assert.throws(
      () => AuditMetadataSecurityPolicy.sanitizeMetadata(meta4097),
      /Audit record metadata size \(4097 bytes\) exceeds maximum limit of 4096 UTF-8 bytes/
    );
  });

  it('M. Multi-byte UTF-8 boundary — measures byte count rather than character count for non-ASCII text', () => {
    // 2000 characters of '€' (3 UTF-8 bytes per char) = 6000 bytes + 19 overhead = 6019 bytes.
    // Character count (2000) <= 4096, but byte count (6019) > 4096 bytes => REJECT
    const euroStr = '€'.repeat(2000);
    const multiByteMeta = { errorDetails: euroStr };
    assert.throws(
      () => AuditMetadataSecurityPolicy.sanitizeMetadata(multiByteMeta),
      /Audit record metadata size \(6019 bytes\) exceeds maximum limit of 4096 UTF-8 bytes/
    );

    // Valid non-ASCII multi-byte metadata: 'ä€汉🙂' (2+3+3+4 = 12 bytes)
    const validMultiByteStr = 'ä€汉🙂';
    const validMultiByteMeta = { errorDetails: validMultiByteStr };
    const sanitizedMB = AuditMetadataSecurityPolicy.sanitizeMetadata(validMultiByteMeta);
    assert.ok(sanitizedMB);
    assert.equal(sanitizedMB.errorDetails, validMultiByteStr);
  });

  // N. Phase 7 — Full record retry conflict matrix tests
  it('N. Retry Conflict Matrix — verifies object key order invariance and conflict detection', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const baseRecord: BeccAuditRecordInput = {
      auditRecordId: 'aud-matrix-001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op-mat-001',
      actorRef: 'User1',
      causationRef: 'Cause1',
      correlationRef: 'Corr1',
      occurredAt: '2026-09-30T12:00:00Z',
      resultStatus: 'SUCCESS',
      metadata: {
        queryVersion: 'v1.0.0',
        lessonCount: 10
      }
    };

    // 1. Initial emission
    await service.recordAudit(baseRecord);

    // 2. Different object key order in metadata -> ACCEPTED (exact retry)
    const reorderedRecord: BeccAuditRecordInput = {
      ...baseRecord,
      metadata: {
        lessonCount: 10,
        queryVersion: 'v1.0.0'
      }
    };
    await service.recordAudit(reorderedRecord); // Should succeed idempotently

    // 3. Different actorRef -> CONFLICT
    await assert.rejects(
      () => service.recordAudit({ ...baseRecord, actorRef: 'User2' }),
      /Conflicting audit record identity 'aud-matrix-001' already exists in ledger/
    );

    // 4. Different causationRef -> CONFLICT
    await assert.rejects(
      () => service.recordAudit({ ...baseRecord, causationRef: 'Cause2' }),
      /Conflicting audit record identity 'aud-matrix-001' already exists in ledger/
    );

    // 5. Different correlationRef -> CONFLICT
    await assert.rejects(
      () => service.recordAudit({ ...baseRecord, correlationRef: 'Corr2' }),
      /Conflicting audit record identity 'aud-matrix-001' already exists in ledger/
    );

    // 6. Different metadata value -> CONFLICT
    await assert.rejects(
      () => service.recordAudit({ ...baseRecord, metadata: { queryVersion: 'v2.0.0' } }),
      /Conflicting audit record identity 'aud-matrix-001' already exists in ledger/
    );

    // 7. Additional metadata key retained by allowlist -> CONFLICT
    await assert.rejects(
      () => service.recordAudit({ ...baseRecord, metadata: { queryVersion: 'v1.0.0', lessonCount: 10, matchStrategy: 'STRICT' } }),
      /Conflicting audit record identity 'aud-matrix-001' already exists in ledger/
    );

    // 8. Only dropped unknown/sensitive metadata key difference -> ACCEPTED (same sanitized canonical record)
    const recordWithDroppedKeys: BeccAuditRecordInput = {
      ...baseRecord,
      metadata: {
        queryVersion: 'v1.0.0',
        lessonCount: 10,
        authToken: 'secret_to_drop',
        unknownUnapprovedField: 'value_to_drop'
      }
    };
    await service.recordAudit(recordWithDroppedKeys); // Should succeed idempotently because sanitized canonical record is identical!
  });

  // O. Phase 13 — Security boundary failure does not mutate domain execution
  it('O. Failure Semantics — security boundary failure does not write to ledger', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const invalidInput: BeccAuditRecordInput = {
      auditRecordId: 'aud-fail-001',
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op-fail-001',
      occurredAt: '2026-09-30T12:00:00Z',
      resultStatus: 'SUCCESS',
      metadata: {
        rawRequest: 'prohibited raw payload'
      }
    };

    await assert.rejects(
      () => service.recordAudit(invalidInput),
      /Audit record metadata contains prohibited raw payload key 'rawRequest'/
    );

    // Ledger must have NO record stored for aud-fail-001
    const stored = await ledger.getById('aud-fail-001');
    assert.equal(stored, undefined);
  });
});
