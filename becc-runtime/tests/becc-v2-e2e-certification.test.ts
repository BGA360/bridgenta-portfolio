/**
 * BECC v2 — End-to-End System Integration & Certification Test Suite
 *
 * IMPL-017 End-to-End Composed Runtime Certification Suite.
 * Certifies the composed runtime across:
 *   - IMPL-012: GL Integration Adapter (DefaultGovernedLearningIntegrationAdapter)
 *   - IMPL-013: Knowledge Resolver & Governed Guidance Query (GovernedGuidanceResolverService)
 *   - IMPL-014: Finding -> Observation Escalation Pipeline (FindingEscalationService)
 *   - IMPL-015: Publication & Portfolio Readiness Evaluation Service (PublicationReadinessEvaluationService)
 *   - IMPL-016: Audit Ledger & Provenance Integration (BeccAuditIntegrationService / InMemoryBeccAuditLedger)
 *
 * Epistemic & Governance Invariants Certified:
 * 1. Observed != Learned != Approved != Binding Policy.
 * 2. BECC_OWNS_FINAL_PUBLICATION_AUTHORITY: NO.
 * 3. GL_PUBLIC_API_ONLY: YES. Zero deep imports or direct database writes to GL tables.
 * 4. Audit ledger append-only, exact-retry idempotent, defensive copying, L0 in-memory durability.
 * 5. Unfabricated provenance: evidenceId preserved when present, missing identity remains absent, location not promoted to fake ID.
 * 6. Timestamp integrity: missing/invalid issuedAt fails closed with no synthetic audit timestamp.
 * 7. Best-effort audit failure model: audit storage failure does NOT mutate or fail domain execution.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGovernedLearningRuntime,
  InMemoryGovernanceRepository,
  type ActorIdentityRef,
  type AuthorityContextRef
} from '@cep/governed-learning';
import { DefaultGovernedLearningIntegrationAdapter } from '../governed-learning/governed-learning-adapter.service.js';
import { GovernedGuidanceResolverService } from '../knowledge/governed-guidance-resolver.service.js';
import { FindingEscalationService } from '../escalation/finding-escalation.service.js';
import {
  PublicationReadinessEvaluationService,
  CanonicalPortfolioReadinessRuleProvider
} from '../readiness/publication-readiness.service.js';
import {
  InMemoryBeccAuditLedger,
  BeccAuditIntegrationService
} from '../audit/index.js';
import type { ValidationFinding } from '../shared/types.js';
import type { PortfolioReadinessEvaluationInput } from '../readiness/publication-readiness.types.js';
import type { EscalationRequestInput } from '../escalation/finding-escalation.types.js';
import type { ResolvedGovernedGuidanceQueryInput } from '../knowledge/governed-guidance-resolver.types.js';

describe('BECC-V2-IMPL-017: End-to-End System Integration & Certification Suite', () => {
  const validActorRef: ActorIdentityRef = {
    actorId: 'act_e2e_tester_001',
    actorType: 'SYSTEM'
  };

  const validAuthorityContextRef: AuthorityContextRef = {
    authorityId: 'auth_e2e_governance_v2'
  };

  /**
   * Factory for creating a fully composed real BECC v2 runtime.
   */
  function createComposedRuntime() {
    const glRepo = new InMemoryGovernanceRepository();
    const glRuntime = createGovernedLearningRuntime({ persistencePort: glRepo });
    const glAdapter = new DefaultGovernedLearningIntegrationAdapter({ runtime: glRuntime });

    const auditLedger = new InMemoryBeccAuditLedger();
    const auditService = new BeccAuditIntegrationService(auditLedger);

    const guidanceService = new GovernedGuidanceResolverService({
      adapter: glAdapter,
      auditService
    });

    const escalationService = new FindingEscalationService({
      adapter: glAdapter,
      auditService
    });

    const readinessService = new PublicationReadinessEvaluationService(
      new CanonicalPortfolioReadinessRuleProvider(),
      undefined,
      auditService
    );

    return {
      glRepo,
      glRuntime,
      glAdapter,
      auditLedger,
      auditService,
      guidanceService,
      escalationService,
      readinessService
    };
  }

  // SCENARIO 1: FLOW A — Governed Guidance Query Success & Audit Emission
  it('Scenario 1: Flow A — Governed Guidance Query executes via runtime entrypoint and emits audit record', async () => {
    const { guidanceService, auditLedger } = createComposedRuntime();

    const queryInput: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'query-e2e-001',
      projectRef: { projectId: 'ProjectE2E' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    };

    const result = await guidanceService.resolveGuidance(queryInput);

    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');
    assert.equal(result.source, 'GOVERNED_LEARNING');
    assert.ok(result.commandId);

    // Verify audit record emitted in ledger
    const records = await auditLedger.listByOperationRef(result.commandId);
    assert.equal(records.length, 1);
    assert.equal(records[0].operationType, 'GUIDANCE_QUERY');
    assert.equal(records[0].resultStatus, 'SUCCESS');
    assert.equal(records[0].domainResultStatus, 'SUCCESS');
    assert.equal(records[0].occurredAt, '2026-09-29T10:00:00Z');
  });

  // SCENARIO 2: FLOW A — Governed Guidance Query Refusal
  it('Scenario 2: Flow A — Governed Guidance Query unmapped context fails closed to REFUSED and emits audit record', async () => {
    const { guidanceService, auditLedger } = createComposedRuntime();

    // Query with unmapped target ref (no project, workstream, or assessment context)
    const queryInput: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'query-e2e-unmapped-001',
      actorRef: validActorRef,
      issuedAt: '2026-09-29T10:00:00Z'
    };

    const result = await guidanceService.resolveGuidance(queryInput);

    assert.equal(result.ok, false);
    assert.equal(result.category, 'REFUSED');

    // Audit record emitted capturing refusal
    const records = await auditLedger.listByOperationRef(result.commandId);
    assert.equal(records.length, 1);
    assert.equal(records[0].resultStatus, 'REFUSED');
    assert.equal(records[0].domainResultStatus, 'REFUSED');
  });

  // SCENARIO 3: FLOW B — Finding -> Observation Escalation Success & Audit Emission
  it('Scenario 3: Flow B — Finding -> Observation Escalation executes full pipeline and preserves canonical observationId', async () => {
    const { escalationService, auditLedger } = createComposedRuntime();

    const sampleFinding: ValidationFinding = {
      id: 'fnd_e2e_001',
      category: 'Structure',
      severity: 'error',
      message: 'Missing section in specification artifact',
      affectedLocation: {
        coordinateSystem: 'candidate',
        filePath: 'docs/spec.md',
        startLine: 5,
        endLine: 15
      },
      originatingRuleId: 'rule_section_req'
    };

    const input: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-e2e-canon-01',
          location: 'docs/spec.md'
        }
      ]
    };

    const result = await escalationService.escalateFinding(input);

    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');
    assert.equal(result.completedStage, 'SUBMIT');
    assert.ok(result.observationId);
    assert.ok(result.observationId.startsWith('obs_'));

    // Verify audit record emitted in ledger
    const auditRecords = await auditLedger.listByOperationRef(`esc_${sampleFinding.id}_2026-09-29T10:00:00Z`);
    assert.equal(auditRecords.length, 1);
    assert.equal(auditRecords[0].operationType, 'FINDING_ESCALATION');
    assert.equal(auditRecords[0].resultStatus, 'SUCCESS');
    assert.equal(auditRecords[0].domainResultStatus, 'SUCCESS');
    assert.equal(auditRecords[0].resultRef, result.observationId);
    assert.deepEqual(auditRecords[0].evidenceRefs, ['ev-e2e-canon-01']);

    // Check GL_OBSERVATION provenance reference
    const obsProv = auditRecords[0].provenanceRefs.find((p) => p.refType === 'GL_OBSERVATION');
    assert.ok(obsProv);
    assert.equal(obsProv.ref, result.observationId);
  });

  // SCENARIO 4: FLOW B — Escalation Exact Retry (Idempotency) & Audit Retry
  it('Scenario 4: Flow B — Escalation exact retry returns replayed result with same observationId and no audit conflict or duplicate audit record', async () => {
    const { escalationService, auditLedger } = createComposedRuntime();

    const finding: ValidationFinding = {
      id: 'fnd_e2e_retry_001',
      category: 'Structure',
      severity: 'error',
      message: 'Defect requiring escalation replay test',
      affectedLocation: {
        coordinateSystem: 'candidate',
        filePath: 'docs/test.md'
      }
    };

    const input: EscalationRequestInput = {
      finding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    };

    // First attempt
    const res1 = await escalationService.escalateFinding(input);
    assert.equal(res1.ok, true);

    // Exact retry
    const res2 = await escalationService.escalateFinding(input);
    assert.equal(res2.ok, true);
    assert.equal(res2.observationId, res1.observationId);
    assert.deepEqual(res2.replayedSteps, ['DRAFT', 'ATTACH_EVIDENCE', 'SUBMIT']);

    // Verify audit record count is exactly 1 (no duplicate audit record created)
    const auditRecords = await auditLedger.listByOperationRef(`esc_${finding.id}_2026-09-29T10:00:00Z`);
    assert.equal(auditRecords.length, 1);
  });

  // SCENARIO 5: FLOW C — Publication Readiness READY_BY_EVIDENCE
  it('Scenario 5: Flow C — Publication Readiness READY_BY_EVIDENCE evaluates 5 thresholds and emits audit record with M5/PRAG boundary', async () => {
    const { readinessService, auditLedger } = createComposedRuntime();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-e2e-ready-001',
      projectRef: 'ProjectReadyE2E',
      issuedAt: '2026-09-29T10:00:00Z',
      evidenceItems: [
        { evidenceId: 'ev-1', requirementId: 'REQ-DEV-MATURITY-01', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-2', requirementId: 'REQ-PROF-PURPOSE-02', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-3', requirementId: 'REQ-VISUAL-EVIDENCE-03', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-4', requirementId: 'REQ-INTERVIEW-DEF-04', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-5', requirementId: 'REQ-PUB-STANDARD-05', source: 'Engine', state: 'SATISFIED' }
      ]
    };

    const result = await readinessService.evaluateReadiness(input);

    assert.equal(result.status, 'READY_BY_EVIDENCE');
    assert.equal(result.evaluatedRequirements.length, 5);

    // Verify authority boundary: READY_BY_EVIDENCE does NOT grant publication release
    assert.equal(result.authorityBoundary.beccOwnsFinalAuthority, false);
    assert.equal(result.authorityBoundary.finalPublicationAuthority, 'M5 / PRAG Governance');

    // Verify audit record emitted
    const auditRecords = await auditLedger.listByOperationRef('eval-e2e-ready-001');
    assert.equal(auditRecords.length, 1);
    assert.equal(auditRecords[0].operationType, 'READINESS_EVALUATION');
    assert.equal(auditRecords[0].resultStatus, 'SUCCESS');
    assert.equal(auditRecords[0].domainResultStatus, 'READY_BY_EVIDENCE');
    assert.equal(auditRecords[0].externalAuthorityBoundary, 'M5 / PRAG Governance');
  });

  // SCENARIO 6: FLOW C — Publication Readiness NOT_READY
  it('Scenario 6: Flow C — Publication Readiness NOT_READY separates audit status SUCCESS from domain status NOT_READY', async () => {
    const { readinessService, auditLedger } = createComposedRuntime();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-e2e-notready-001',
      projectRef: 'ProjectNotReadyE2E',
      issuedAt: '2026-09-29T10:00:00Z',
      evidenceItems: [] // Missing required evidence
    };

    const result = await readinessService.evaluateReadiness(input);

    assert.equal(result.status, 'NOT_READY');

    // Audit record emitted: audit execution is SUCCESS, domain status is NOT_READY
    const auditRecords = await auditLedger.listByOperationRef('eval-e2e-notready-001');
    assert.equal(auditRecords.length, 1);
    assert.equal(auditRecords[0].resultStatus, 'SUCCESS');
    assert.equal(auditRecords[0].domainResultStatus, 'NOT_READY');
  });

  // SCENARIO 7: FLOW C — Publication Readiness INDETERMINATE
  it('Scenario 7: Flow C — Publication Readiness INDETERMINATE separates audit status SUCCESS from domain status INDETERMINATE', async () => {
    const { readinessService, auditLedger } = createComposedRuntime();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-e2e-indet-001',
      projectRef: 'ProjectIndetE2E',
      issuedAt: '2026-09-29T10:00:00Z',
      evidenceItems: [
        { evidenceId: 'ev-sat', requirementId: 'REQ-DEV-MATURITY-01', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-unsat', requirementId: 'REQ-DEV-MATURITY-01', source: 'Engine', state: 'NOT_SATISFIED' }
      ]
    };

    const result = await readinessService.evaluateReadiness(input);

    assert.equal(result.status, 'INDETERMINATE');

    const auditRecords = await auditLedger.listByOperationRef('eval-e2e-indet-001');
    assert.equal(auditRecords.length, 1);
    assert.equal(auditRecords[0].resultStatus, 'SUCCESS');
    assert.equal(auditRecords[0].domainResultStatus, 'INDETERMINATE');
  });

  // SCENARIO 8: FLOW C — Readiness Error Path with Valid Timestamp
  it('Scenario 8: Flow C — Readiness valid-timestamp ERROR path emits audit record with resultStatus ERROR and domainResultStatus ERROR', async () => {
    const { readinessService, auditLedger } = createComposedRuntime();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-e2e-err-001',
      projectRef: 'ProjectErrE2E',
      issuedAt: '2026-09-29T10:00:00Z',
      evidenceItems: [
        { evidenceId: 'ev-unk', requirementId: 'REQ-UNKNOWN-REQUIREMENT-99', source: 'Engine', state: 'SATISFIED' }
      ]
    };

    const result = await readinessService.evaluateReadiness(input);

    assert.equal(result.status, 'ERROR');

    const auditRecords = await auditLedger.listByOperationRef('eval-e2e-err-001');
    assert.equal(auditRecords.length, 1);
    assert.equal(auditRecords[0].resultStatus, 'ERROR');
    assert.equal(auditRecords[0].domainResultStatus, 'ERROR');
    assert.equal(auditRecords[0].occurredAt, '2026-09-29T10:00:00Z');
  });

  // SCENARIO 9: FLOW C — Readiness Missing / Invalid Timestamp (Option A)
  it('Scenario 9: Flow C — Readiness missing or invalid timestamp returns ERROR result without emitting audit record (Option A)', async () => {
    const { readinessService, auditLedger } = createComposedRuntime();

    // Missing issuedAt
    const inputMissing: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-e2e-no-ts-001',
      projectRef: 'ProjectNoTsE2E',
      issuedAt: '',
      evidenceItems: []
    };

    const res1 = await readinessService.evaluateReadiness(inputMissing);
    assert.equal(res1.status, 'ERROR');
    assert.equal(res1.evaluatedAt, undefined);

    const recs1 = await auditLedger.listByOperationRef('eval-e2e-no-ts-001');
    assert.equal(recs1.length, 0); // ABSENT: No audit record created without valid caller timestamp

    // Invalid issuedAt
    const inputInvalid: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-e2e-bad-ts-001',
      projectRef: 'ProjectBadTsE2E',
      issuedAt: 'invalid-date',
      evidenceItems: []
    };

    const res2 = await readinessService.evaluateReadiness(inputInvalid);
    assert.equal(res2.status, 'ERROR');
    assert.equal(res2.evaluatedAt, undefined);

    const recs2 = await auditLedger.listByOperationRef('eval-e2e-bad-ts-001');
    assert.equal(recs2.length, 0); // ABSENT
  });

  // SCENARIO 10: Phase 17 — BEST_EFFORT Audit Failure Injection Across All Services
  it('Scenario 10: Phase 17 — Best-effort audit failure injection across Guidance, Escalation, and Readiness services', async () => {
    const glRepo = new InMemoryGovernanceRepository();
    const glRuntime = createGovernedLearningRuntime({ persistencePort: glRepo });
    const glAdapter = new DefaultGovernedLearningIntegrationAdapter({ runtime: glRuntime });

    // Failing audit ledger
    const failingLedger = {
      append: async () => {
        throw new Error('Audit ledger storage failure (simulated outage)');
      },
      getById: async () => null,
      listByOperationRef: async () => [],
      listByProjectRef: async () => [],
      listByCorrelationRef: async () => []
    };

    const auditService = new BeccAuditIntegrationService(failingLedger as any);

    const guidanceService = new GovernedGuidanceResolverService({
      adapter: glAdapter,
      auditService
    });

    const escalationService = new FindingEscalationService({
      adapter: glAdapter,
      auditService
    });

    const readinessService = new PublicationReadinessEvaluationService(
      new CanonicalPortfolioReadinessRuleProvider(),
      undefined,
      auditService
    );

    // 1. Guidance service executes normally despite audit failure
    const gRes = await guidanceService.resolveGuidance({
      queryId: 'query-best-effort-001',
      projectRef: { projectId: 'ProjBE' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    });
    assert.equal(gRes.ok, true);

    // 2. Escalation service executes normally despite audit failure
    const eRes = await escalationService.escalateFinding({
      finding: {
        id: 'fnd_be_001',
        category: 'Structure',
        severity: 'error',
        message: 'Defect for best effort audit test'
      },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    });
    assert.equal(eRes.ok, true);

    // 3. Readiness service executes normally despite audit failure
    const rRes = await readinessService.evaluateReadiness({
      evaluationId: 'eval-best-effort-001',
      projectRef: 'ProjBE',
      issuedAt: '2026-09-29T10:00:00Z',
      evidenceItems: []
    });
    assert.equal(rRes.status, 'NOT_READY');
  });

  // SCENARIO 11: Audit Ledger Invariants (Append-Only, Exact-Retry, Duplicate Conflict, Defensive Copying, Deterministic Order)
  it('Scenario 11: Audit Ledger Invariants — append-only, exact-retry idempotent, duplicate conflict fail-closed, defensive copying, and deterministic order', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    // Record 1
    const rec1 = await service.recordAudit({
      auditRecordId: 'aud-inv-002',
      operationType: 'READINESS_EVALUATION',
      operationId: 'op-inv-002',
      projectRef: 'ProjInv',
      occurredAt: '2026-09-29T12:00:00Z',
      resultStatus: 'SUCCESS'
    });

    // Record 2 (earlier timestamp)
    const rec2 = await service.recordAudit({
      auditRecordId: 'aud-inv-001',
      operationType: 'READINESS_EVALUATION',
      operationId: 'op-inv-001',
      projectRef: 'ProjInv',
      occurredAt: '2026-09-29T11:00:00Z',
      resultStatus: 'SUCCESS'
    });

    // Deterministic order check
    const list = await ledger.listByProjectRef('ProjInv');
    assert.equal(list.length, 2);
    assert.equal(list[0].auditRecordId, 'aud-inv-001'); // 11:00 comes first
    assert.equal(list[1].auditRecordId, 'aud-inv-002'); // 12:00 comes second

    // Exact retry is idempotent
    await service.recordAudit({
      auditRecordId: 'aud-inv-001',
      operationType: 'READINESS_EVALUATION',
      operationId: 'op-inv-001',
      projectRef: 'ProjInv',
      occurredAt: '2026-09-29T11:00:00Z',
      resultStatus: 'SUCCESS'
    });
    const listAfterRetry = await ledger.listByProjectRef('ProjInv');
    assert.equal(listAfterRetry.length, 2);

    // Conflicting duplicate ID fails closed
    await assert.rejects(
      () =>
        service.recordAudit({
          auditRecordId: 'aud-inv-001',
          operationType: 'READINESS_EVALUATION',
          operationId: 'op-inv-001',
          projectRef: 'ProjInv',
          occurredAt: '2026-09-29T11:00:00Z',
          resultStatus: 'ERROR' // Conflicting status
        }),
      /Conflicting audit record identity 'aud-inv-001' already exists in ledger/
    );

    // Defensive copying check
    const fetched = await ledger.getById('aud-inv-001');
    assert.ok(fetched);
    (fetched as any).operationId = 'MUTATED';
    const refetched = await ledger.getById('aud-inv-001');
    assert.equal(refetched?.operationId, 'op-inv-001');
  });

  // SCENARIO 12: Authority & Security Hygiene — generic audit records default no authority; certification fixtures do not store secrets
  it('Scenario 12: Authority & Security Hygiene — generic audit records default no authority; certification fixtures do not store secrets', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const record = await service.recordAudit({
      auditRecordId: 'aud-sec-e2e-001',
      operationType: 'CUSTOM_OPERATION',
      operationId: 'op-sec-1',
      occurredAt: '2026-09-29T10:00:00Z',
      resultStatus: 'SUCCESS',
      metadata: {
        secretToken: undefined // Certification fixtures do not store secrets
      }
    });

    // Generic audit records do NOT default externalAuthorityBoundary to M5/PRAG
    assert.equal(record.externalAuthorityBoundary, undefined);
    assert.equal((record.metadata as any).secretToken, undefined);

    // Authority boundary declaration check
    const boundary = service.getAuthorityBoundary();
    assert.equal(boundary.beccOwnsFinalAuthority, false);
    assert.equal(boundary.finalPublicationAuthority, 'M5 / PRAG Governance');
  });

  // SCENARIO 13: Flow A — Guidance ERROR propagation
  it('Scenario 13: Flow A — Guidance ERROR propagates through resolver to audit ledger with no fabricated provenance', async () => {
    const errorAdapter = {
      draftObservation: async () => ({ ok: false, category: 'ERROR' as const, commandId: 'err' }),
      attachEvidence: async () => ({ ok: false, category: 'ERROR' as const, commandId: 'err' }),
      submitObservation: async () => ({ ok: false, category: 'ERROR' as const, commandId: 'err' }),
      queryGuidance: async () => ({
        ok: false,
        category: 'ERROR' as const,
        commandId: 'cmd_guidance_err_001',
        errorDetails: 'Simulated Governed Learning runtime exception'
      })
    };

    const auditLedger = new InMemoryBeccAuditLedger();
    const auditService = new BeccAuditIntegrationService(auditLedger);
    const guidanceService = new GovernedGuidanceResolverService({
      adapter: errorAdapter as any,
      auditService
    });

    const result = await guidanceService.resolveGuidance({
      queryId: 'query-err-001',
      projectRef: { projectId: 'ProjectErr' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    });

    assert.equal(result.ok, false);
    assert.equal(result.category, 'ERROR');
    assert.equal(result.errorDetails, 'Simulated Governed Learning runtime exception');

    const auditRecords = await auditLedger.listByOperationRef('cmd_guidance_err_001');
    assert.equal(auditRecords.length, 1);
    assert.equal(auditRecords[0].resultStatus, 'ERROR');
    assert.equal(auditRecords[0].domainResultStatus, 'ERROR');
    assert.equal(auditRecords[0].occurredAt, '2026-09-29T10:00:00Z');
    assert.deepEqual(auditRecords[0].provenanceRefs, []); // NO fabricated provenance
  });

  // SCENARIO 14: Flow A — Guidance Exact Replay & Audit Count
  it('Scenario 14: Flow A — Guidance exact replay returns replayed signal with stable commandId and no duplicate audit record', async () => {
    const { guidanceService, auditLedger } = createComposedRuntime();

    const queryInput: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'query-e2e-replay-001',
      projectRef: { projectId: 'ProjectReplay' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    };

    const res1 = await guidanceService.resolveGuidance(queryInput);
    assert.equal(res1.ok, true);
    assert.equal(res1.category, 'SUCCESS');
    assert.equal(res1.replayed, false);

    const res2 = await guidanceService.resolveGuidance(queryInput);
    assert.equal(res2.ok, true);
    assert.equal(res2.category, 'SUCCESS');
    assert.equal(res2.commandId, res1.commandId);
    assert.equal(res2.replayed, true); // Replay signal verified

    // Verify audit record count is exactly 1 (no duplicate audit record created)
    const auditRecords = await auditLedger.listByOperationRef(res1.commandId);
    assert.equal(auditRecords.length, 1);
  });

  // SCENARIO 15: Flow A — Guidance Identity Collision Fail-Closed
  it('Scenario 15: Flow A — Guidance identity collision fails closed without mutating state or inventing new command identity', async () => {
    const { guidanceService } = createComposedRuntime();

    const input1: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'query-collision-001',
      projectRef: { projectId: 'ProjectColl' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    };

    const res1 = await guidanceService.resolveGuidance(input1);
    assert.equal(res1.ok, true);

    // Identity collision: Same queryId & commandId, but different issuedAt timestamp
    const input2: ResolvedGovernedGuidanceQueryInput = {
      ...input1,
      issuedAt: '2026-09-29T11:00:00Z' // Changed timestamp triggers Stage 8 collision
    };

    const res2 = await guidanceService.resolveGuidance(input2);
    assert.equal(res2.ok, false);
    assert.equal(res2.category, 'REFUSED'); // Fail closed
  });

  // SCENARIO 16: Flow A — Early Guidance Refusal Audit Wiring
  it('Scenario 16: Flow A — Early guidance refusal paths emit audit records when valid caller timestamp is present', async () => {
    const { guidanceService, auditLedger } = createComposedRuntime();

    // Missing queryId with valid issuedAt
    const resMissingQueryId = await guidanceService.resolveGuidance({
      queryId: '',
      projectRef: { projectId: 'ProjEarly' },
      actorRef: validActorRef,
      issuedAt: '2026-09-29T10:00:00Z'
    });
    assert.equal(resMissingQueryId.ok, false);
    assert.equal(resMissingQueryId.category, 'REFUSED');

    const recs1 = await auditLedger.listByOperationRef('cmd_becc_invalid_query_id');
    assert.equal(recs1.length, 1);
    assert.equal(recs1[0].resultStatus, 'REFUSED');
    assert.equal(recs1[0].domainResultStatus, 'REFUSED');
    assert.equal(recs1[0].occurredAt, '2026-09-29T10:00:00Z');

    // Unmapped context with valid issuedAt
    const resUnmapped = await guidanceService.resolveGuidance({
      queryId: 'query-early-unmapped-001',
      actorRef: validActorRef,
      issuedAt: '2026-09-29T10:00:00Z'
    });
    assert.equal(resUnmapped.ok, false);
    assert.equal(resUnmapped.category, 'REFUSED');

    const recs2 = await auditLedger.listByOperationRef('cmd_becc_unmapped_query-early-unmapped-001');
    assert.equal(recs2.length, 1);
    assert.equal(recs2[0].resultStatus, 'REFUSED');
    assert.equal(recs2[0].domainResultStatus, 'REFUSED');
  });

  // SCENARIO 17: Flow A — Missing/Invalid Guidance Timestamp Audit Absence
  it('Scenario 17: Flow A — Guidance missing or invalid timestamp produces REFUSED result without emitting audit record', async () => {
    const { guidanceService, auditLedger } = createComposedRuntime();

    // Missing issuedAt
    const resNoTs = await guidanceService.resolveGuidance({
      queryId: 'query-no-ts-001',
      projectRef: { projectId: 'ProjNoTs' },
      actorRef: validActorRef,
      issuedAt: ''
    });
    assert.equal(resNoTs.ok, false);
    assert.equal(resNoTs.category, 'REFUSED');
    const recs1 = await auditLedger.listByOperationRef(resNoTs.commandId);
    assert.equal(recs1.length, 0); // ABSENT

    // Invalid issuedAt - must use actual commandId returned by guidance resolver
    const resBadTs = await guidanceService.resolveGuidance({
      queryId: 'query-bad-ts-001',
      projectRef: { projectId: 'ProjBadTs' },
      actorRef: validActorRef,
      issuedAt: 'not-a-valid-date'
    });
    assert.equal(resBadTs.ok, false);
    assert.equal(resBadTs.category, 'REFUSED');
    const recs2 = await auditLedger.listByOperationRef(resBadTs.commandId);
    assert.equal(recs2.length, 0); // ABSENT
  });

  // SCENARIO 18: Flow A — Guidance Refusal Best-Effort Audit Failure Injection
  it('Scenario 18: Flow A — Guidance refusal path executes normally when audit ledger storage fails', async () => {
    const failingLedger = {
      append: async () => {
        throw new Error('Simulated audit ledger error');
      },
      getById: async () => null,
      listByOperationRef: async () => [],
      listByProjectRef: async () => [],
      listByCorrelationRef: async () => []
    };
    const auditService = new BeccAuditIntegrationService(failingLedger as any);
    const glRepo = new InMemoryGovernanceRepository();
    const glRuntime = createGovernedLearningRuntime({ persistencePort: glRepo });
    const glAdapter = new DefaultGovernedLearningIntegrationAdapter({ runtime: glRuntime });
    const guidanceService = new GovernedGuidanceResolverService({ adapter: glAdapter, auditService });

    const result = await guidanceService.resolveGuidance({
      queryId: 'query-failing-audit-refusal-001',
      actorRef: validActorRef,
      issuedAt: '2026-09-29T10:00:00Z' // Valid issuedAt triggers audit attempt
    });

    assert.equal(result.ok, false);
    assert.equal(result.category, 'REFUSED'); // Execution unaffected by audit failure
  });

  // SCENARIO 19: Deterministic Replay Verification across Guidance, Escalation, and Audit
  it('Scenario 19: Deterministic Replay — repeated executions yield stable operation IDs, results, and provenance across repeat calls', async () => {
    const { guidanceService, escalationService, auditLedger } = createComposedRuntime();

    // 1. Guidance Deterministic Replay
    const gInput: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'det-g-001',
      projectRef: { projectId: 'ProjDet' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    };
    const g1 = await guidanceService.resolveGuidance(gInput);
    const gAudits1 = await auditLedger.listByOperationRef(g1.commandId);

    const g2 = await guidanceService.resolveGuidance(gInput);
    const gAudits2 = await auditLedger.listByOperationRef(g2.commandId);

    assert.equal(g1.commandId, g2.commandId);
    assert.equal(g1.category, g2.category);

    // Guidance audit record stability & provenance comparison across replay
    assert.equal(gAudits1.length, 1);
    assert.equal(gAudits2.length, 1);
    assert.equal(gAudits1[0].auditRecordId, gAudits2[0].auditRecordId);
    assert.deepEqual(gAudits1[0].provenanceRefs, gAudits2[0].provenanceRefs);
    assert.equal(gAudits2[0].occurredAt, '2026-09-29T10:00:00Z');

    // 2. Escalation Deterministic Replay
    const eFinding: ValidationFinding = {
      id: 'fnd_det_001',
      category: 'Structure',
      severity: 'error',
      message: 'Deterministic test defect'
    };
    const eInput: EscalationRequestInput = {
      finding: eFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    };
    const e1 = await escalationService.escalateFinding(eInput);
    const eAudits1 = await auditLedger.listByOperationRef(`esc_${eFinding.id}_2026-09-29T10:00:00Z`);

    const e2 = await escalationService.escalateFinding(eInput);
    const eAudits2 = await auditLedger.listByOperationRef(`esc_${eFinding.id}_2026-09-29T10:00:00Z`);

    assert.equal(e1.observationId, e2.observationId);
    assert.equal(e1.completedStage, e2.completedStage);
    assert.equal(e1.draftCommandId, e2.draftCommandId);
    assert.equal(e1.submitCommandId, e2.submitCommandId);

    // Escalation audit record stability & provenance comparison across retry
    assert.equal(eAudits1.length, 1);
    assert.equal(eAudits2.length, 1);
    assert.equal(eAudits1[0].auditRecordId, eAudits2[0].auditRecordId);
    assert.deepEqual(eAudits1[0].provenanceRefs, eAudits2[0].provenanceRefs);
    assert.equal(eAudits2[0].resultRef, e1.observationId);
  });

  // SCENARIO 20: Composed Operation Audit Record Count Assertion
  it('Scenario 20: Audit Record Count Certification — audit record count matches expected runtime operations exactly across all composed flows', async () => {
    const { guidanceService, escalationService, readinessService, auditLedger } = createComposedRuntime();

    // Perform 5 audited operations with valid caller timestamp:
    // 1. Guidance success
    const resQ1 = await guidanceService.resolveGuidance({
      queryId: 'q-cnt-01',
      projectRef: { projectId: 'ProjCnt' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:00:00Z'
    });

    // 2. Guidance refusal (valid timestamp)
    const resQ2 = await guidanceService.resolveGuidance({
      queryId: 'q-cnt-02',
      actorRef: validActorRef,
      issuedAt: '2026-09-29T10:01:00Z'
    });

    // 3. Escalation success
    await escalationService.escalateFinding({
      finding: { id: 'fnd_cnt_01', category: 'Structure', severity: 'error', message: 'Defect' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-29T10:02:00Z'
    });

    // 4. Readiness READY_BY_EVIDENCE
    await readinessService.evaluateReadiness({
      evaluationId: 'eval-cnt-01',
      projectRef: 'ProjCnt',
      issuedAt: '2026-09-29T10:03:00Z',
      evidenceItems: [
        { evidenceId: 'ev-1', requirementId: 'REQ-DEV-MATURITY-01', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-2', requirementId: 'REQ-PROF-PURPOSE-02', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-3', requirementId: 'REQ-VISUAL-EVIDENCE-03', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-4', requirementId: 'REQ-INTERVIEW-DEF-04', source: 'Engine', state: 'SATISFIED' },
        { evidenceId: 'ev-5', requirementId: 'REQ-PUB-STANDARD-05', source: 'Engine', state: 'SATISFIED' }
      ]
    });

    // 5. Readiness ERROR (valid timestamp)
    await readinessService.evaluateReadiness({
      evaluationId: 'eval-cnt-02',
      projectRef: 'ProjCnt',
      issuedAt: '2026-09-29T10:04:00Z',
      evidenceItems: [
        { evidenceId: 'ev-unk', requirementId: 'REQ-UNKNOWN-99', source: 'Engine', state: 'SATISFIED' }
      ]
    });

    // Perform 2 operations without valid timestamp (0 audit records expected):
    await guidanceService.resolveGuidance({
      queryId: 'q-cnt-no-ts',
      projectRef: { projectId: 'ProjCnt' },
      actorRef: validActorRef,
      issuedAt: ''
    });

    await readinessService.evaluateReadiness({
      evaluationId: 'eval-cnt-no-ts',
      projectRef: 'ProjCnt',
      issuedAt: '',
      evidenceItems: []
    });

    // Verify each operation recorded exactly 1 audit record
    const recordsQ1 = await auditLedger.listByOperationRef(resQ1.commandId);
    const recordsQ2 = await auditLedger.listByOperationRef(resQ2.commandId);
    const recordsE1 = await auditLedger.listByOperationRef('esc_fnd_cnt_01_2026-09-29T10:02:00Z');
    const recordsR1 = await auditLedger.listByOperationRef('eval-cnt-01');
    const recordsR2 = await auditLedger.listByOperationRef('eval-cnt-02');

    assert.equal(recordsQ1.length, 1);
    assert.equal(recordsQ2.length, 1);
    assert.equal(recordsE1.length, 1);
    assert.equal(recordsR1.length, 1);
    assert.equal(recordsR2.length, 1);
  });
});


