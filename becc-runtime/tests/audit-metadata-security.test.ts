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
});
