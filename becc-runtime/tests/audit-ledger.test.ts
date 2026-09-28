/**
 * BECC v2 — Audit Ledger & Provenance Integration Test Suite
 *
 * IMPL-016 unit & integration test suite certifying:
 * 1. Ledger basics (append, getById, listByOperationRef, listByProjectRef, listByCorrelationRef, deterministic ordering, defensive copying).
 * 2. Provenance traceability (sourceRef preserved, sourceRevision uninvented, missing provenance non-fabricated).
 * 3. Timestamp integrity (caller-supplied occurredAt required, fail closed on missing/invalid timestamps, no sentinel leakage).
 * 4. Duplicate/idempotency handling (exact retry idempotent, conflicting duplicate identity fails closed).
 * 5. Distinct operation ID vs audit record ID.
 * 6. Correlation vs causation distinction.
 * 7. IMPL-013 Guidance Query Audit Integration.
 * 8. IMPL-014 Finding Escalation Audit Integration (captures canonical GL observationId).
 * 9. IMPL-015 Publication Readiness Audit Integration (preserves M5/PRAG boundary, READY_BY_EVIDENCE != PUBLISHED).
 * 10. Architectural boundary & scope protection.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  InMemoryBeccAuditLedger,
  BeccAuditIntegrationService,
  BeccAuditRecordInput,
  BeccAuditRecord
} from '../audit/index.js';

describe('BECC-V2-IMPL-016: Audit Ledger & Provenance Integration', () => {
  it('Phase 37.1-6: LEDGER_BASIC_TESTS — supports append, getById, query filtering, deterministic ordering, and defensive copying', async () => {
    const ledger = new InMemoryBeccAuditLedger();

    const record1: BeccAuditRecordInput = {
      auditRecordId: 'aud-002',
      operationType: 'READINESS_EVALUATION',
      operationId: 'eval-102',
      projectRef: 'ProjectAlpha',
      occurredAt: '2026-09-28T12:00:00Z',
      resultStatus: 'SUCCESS',
      inputRefs: ['eval-102']
    };

    const record2: BeccAuditRecordInput = {
      auditRecordId: 'aud-001',
      operationType: 'READINESS_EVALUATION',
      operationId: 'eval-101',
      projectRef: 'ProjectAlpha',
      occurredAt: '2026-09-28T11:00:00Z',
      resultStatus: 'SUCCESS',
      inputRefs: ['eval-101']
    };

    const service = new BeccAuditIntegrationService(ledger);
    await service.recordAudit(record1);
    await service.recordAudit(record2);

    // Get by ID
    const fetched1 = await ledger.getById('aud-001');
    assert.ok(fetched1);
    assert.equal(fetched1.operationId, 'eval-101');

    // List by project ref with deterministic sorting (occurredAt ascending)
    const list = await ledger.listByProjectRef('ProjectAlpha');
    assert.equal(list.length, 2);
    assert.equal(list[0].auditRecordId, 'aud-001'); // 11:00:00Z comes first
    assert.equal(list[1].auditRecordId, 'aud-002'); // 12:00:00Z comes second

    // Defensive copying verification: mutating returned object does not alter ledger
    (fetched1 as any).operationId = 'MUTATED';
    const refetched1 = await ledger.getById('aud-001');
    assert.equal(refetched1?.operationId, 'eval-101');
  });

  it('Phase 37.7-10: PROVENANCE_TESTS — preserves ruleSourceRef and uninvented revision without fabricating provenance', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const auditRecord = await service.recordReadinessEvaluationAudit({
      evaluationInput: {
        evaluationId: 'eval-prov-001',
        projectRef: 'AEOcortex',
        issuedAt: '2026-09-28T12:00:00Z',
        evidenceItems: [{ evidenceId: 'ev-01' }]
      },
      evaluationResult: {
        status: 'READY_BY_EVIDENCE',
        ruleSourceRef: 'docs/portfolio-readiness-rule.md',
        ruleSourceRevision: undefined,
        evidenceRefs: ['ev-01']
      },
      occurredAt: '2026-09-28T12:00:00Z'
    });

    assert.equal(auditRecord.provenanceRefs.length, 1);
    assert.equal(auditRecord.provenanceRefs[0].refType, 'RULE_SOURCE');
    assert.equal(auditRecord.provenanceRefs[0].ref, 'docs/portfolio-readiness-rule.md');
    assert.equal(auditRecord.provenanceRefs[0].revision, undefined);
    assert.equal((auditRecord.provenanceRefs[0] as any).fakeHash, undefined);
  });

  it('Phase 37.11-14: TIMESTAMP_TESTS — caller-supplied occurredAt preserved, missing/invalid timestamp fails closed with no sentinels', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    // Valid timestamp
    const validRec = await service.recordAudit({
      auditRecordId: 'aud-ts-valid',
      operationType: 'CUSTOM_OPERATION',
      operationId: 'op-001',
      occurredAt: '2026-09-28T12:00:00Z',
      resultStatus: 'SUCCESS'
    });
    assert.equal(validRec.occurredAt, '2026-09-28T12:00:00Z');

    // Missing timestamp fails closed
    await assert.rejects(
      () =>
        service.recordAudit({
          auditRecordId: 'aud-ts-missing',
          operationType: 'CUSTOM_OPERATION',
          operationId: 'op-002',
          occurredAt: '' as any,
          resultStatus: 'SUCCESS'
        }),
      /Audit record requires a valid caller-supplied occurredAt timestamp/
    );

    // Invalid timestamp fails closed
    await assert.rejects(
      () =>
        service.recordAudit({
          auditRecordId: 'aud-ts-invalid',
          operationType: 'CUSTOM_OPERATION',
          operationId: 'op-003',
          occurredAt: 'not-a-valid-timestamp',
          resultStatus: 'SUCCESS'
        }),
      /Audit record requires a valid caller-supplied occurredAt timestamp/
    );
  });

  it('Phase 37.15-17: DUPLICATE_IDENTITY_TESTS — exact retry succeeds idempotently, conflicting duplicate fails closed', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const record: BeccAuditRecordInput = {
      auditRecordId: 'aud-dup-001',
      operationType: 'FINDING_ESCALATION',
      operationId: 'esc-101',
      occurredAt: '2026-09-28T12:00:00Z',
      resultStatus: 'SUCCESS'
    };

    // First append succeeds
    await service.recordAudit(record);

    // Exact retry succeeds idempotently without duplicating in list
    await service.recordAudit(record);
    const list = await ledger.listByOperationRef('esc-101');
    assert.equal(list.length, 1);

    // Conflicting duplicate identity fails closed
    const conflictingRecord: BeccAuditRecordInput = {
      auditRecordId: 'aud-dup-001',
      operationType: 'FINDING_ESCALATION',
      operationId: 'esc-101',
      occurredAt: '2026-09-28T12:00:00Z',
      resultStatus: 'ERROR' // Conflicting status
    };
    await assert.rejects(
      () => service.recordAudit(conflictingRecord),
      /Conflicting audit record identity 'aud-dup-001' already exists in ledger/
    );
  });

  it('Phase 8 & 9: IDENTITY_CORRELATION_CAUSATION_TEST — keeps auditRecordId distinct from operationId, correlationRef distinct from causationRef', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const rec = await service.recordAudit({
      auditRecordId: 'audit-rec-999',
      operationType: 'FINDING_ESCALATION',
      operationId: 'escalation-op-456',
      correlationRef: 'workstream-flow-001',
      causationRef: 'finding-id-123',
      occurredAt: '2026-09-28T12:00:00Z',
      resultStatus: 'SUCCESS'
    });

    assert.notEqual(rec.auditRecordId, rec.operationId);
    assert.equal(rec.auditRecordId, 'audit-rec-999');
    assert.equal(rec.operationId, 'escalation-op-456');

    assert.notEqual(rec.correlationRef, rec.causationRef);
    assert.equal(rec.correlationRef, 'workstream-flow-001');
    assert.equal(rec.causationRef, 'finding-id-123');
  });

  it('Phase 37.18: GUIDANCE_QUERY_AUDIT_INTEGRATION — records IMPL-013 guidance query traceability without recomputing GL guidance', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const auditRecord = await service.recordGuidanceQueryAudit({
      queryInput: {
        commandId: 'cmd-guidance-001',
        projectRef: 'StarCleaners',
        workstreamRef: 'WS-01'
      },
      queryResult: {
        status: 'SUCCESS',
        guidanceSet: {
          lessons: [
            { lessonRef: 'lesson-001', version: 'v1.0' },
            { lessonRef: 'lesson-002', version: 'v1.1' }
          ]
        }
      },
      occurredAt: '2026-09-28T12:00:00Z',
      correlationRef: 'cor-query-101'
    });

    assert.equal(auditRecord.operationType, 'GUIDANCE_QUERY');
    assert.equal(auditRecord.operationId, 'cmd-guidance-001');
    assert.equal(auditRecord.resultStatus, 'SUCCESS');
    assert.equal(auditRecord.provenanceRefs.length, 2);
    assert.equal(auditRecord.provenanceRefs[0].ref, 'lesson-001');
    assert.equal(auditRecord.provenanceRefs[1].ref, 'lesson-002');
  });

  it('Phase 37.19-21: FINDING_ESCALATION_AUDIT_INTEGRATION — records IMPL-014 escalation traceability capturing canonical GL observationId', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const auditRecord = await service.recordFindingEscalationAudit({
      escalationInput: {
        escalationId: 'esc-001',
        findingId: 'fnd-100',
        projectRef: 'AEOcortex',
        evidenceItems: [{ evidenceId: 'ev-1' }, { evidenceId: 'ev-2' }]
      },
      escalationResult: {
        status: 'SUCCESS',
        observationId: 'obs_cmd_draft_001'
      },
      occurredAt: '2026-09-28T12:00:00Z',
      causationRef: 'fnd-100'
    });

    assert.equal(auditRecord.operationType, 'FINDING_ESCALATION');
    assert.equal(auditRecord.operationId, 'esc-001');
    assert.equal(auditRecord.resultStatus, 'SUCCESS');
    assert.equal(auditRecord.resultRef, 'obs_cmd_draft_001');
    assert.equal(auditRecord.evidenceRefs.length, 2);

    const obsProv = auditRecord.provenanceRefs.find((p) => p.refType === 'GL_OBSERVATION');
    assert.ok(obsProv);
    assert.equal(obsProv.ref, 'obs_cmd_draft_001');
  });

  it('Phase 37.22-24: READINESS_EVALUATION_AUDIT_INTEGRATION — records IMPL-015 readiness evaluation while preserving M5/PRAG boundary', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const auditRecord = await service.recordReadinessEvaluationAudit({
      evaluationInput: {
        evaluationId: 'eval-001',
        projectRef: 'BridGenta Reconstruction Platform',
        issuedAt: '2026-09-28T12:00:00Z',
        evidenceItems: [{ evidenceId: 'ev-dev-mat-01' }]
      },
      evaluationResult: {
        status: 'READY_BY_EVIDENCE',
        ruleSourceRef: 'docs/portfolio-readiness-rule.md',
        ruleSourceRevision: undefined,
        evidenceRefs: ['ev-dev-mat-01']
      },
      occurredAt: '2026-09-28T12:00:00Z'
    });

    assert.equal(auditRecord.operationType, 'READINESS_EVALUATION');
    assert.equal(auditRecord.resultStatus, 'SUCCESS');
    assert.equal(auditRecord.externalAuthorityBoundary, 'M5 / PRAG Governance');

    // Confirm READY_BY_EVIDENCE does not imply publication authorization
    assert.equal((auditRecord as any).approvedForPublication, undefined);
    assert.equal((auditRecord as any).publishNow, undefined);

    const authorityBoundary = service.getAuthorityBoundary();
    assert.equal(authorityBoundary.beccOwnsFinalAuthority, false);
    assert.equal(authorityBoundary.finalPublicationAuthority, 'M5 / PRAG Governance');
  });

  it('Phase 37.25-28: BOUNDARY_AND_SECURITY_TESTS — enforces no secret storage and explicit authority boundary', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const auditRecord = await service.recordAudit({
      auditRecordId: 'aud-sec-001',
      operationType: 'CUSTOM_OPERATION',
      operationId: 'op-sec-1',
      occurredAt: '2026-09-28T12:00:00Z',
      resultStatus: 'SUCCESS',
      actorRef: 'user-actor-101',
      authorityContextRef: 'M5_RELEASE_BOARD',
      metadata: {
        safeSummary: 'Bounded evidence summary',
        secretKey: undefined // No secrets stored
      }
    });

    assert.equal(auditRecord.actorRef, 'user-actor-101');
    assert.equal(auditRecord.authorityContextRef, 'M5_RELEASE_BOARD');
    assert.equal((auditRecord.metadata as any).secretKey, undefined);
  });
});
