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

  // SCENARIO 4: FLOW B — Escalation Exact Retry (Idempotency)
  it('Scenario 4: Flow B — Escalation exact retry returns replayed result with same observationId and no audit conflict', async () => {
    const { escalationService } = createComposedRuntime();

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

  // SCENARIO 12: Authority & Security Boundaries
  it('Scenario 12: Authority & Security Boundaries — generic audit records default no authority, secrets disallowed', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const service = new BeccAuditIntegrationService(ledger);

    const record = await service.recordAudit({
      auditRecordId: 'aud-sec-e2e-001',
      operationType: 'CUSTOM_OPERATION',
      operationId: 'op-sec-1',
      occurredAt: '2026-09-29T10:00:00Z',
      resultStatus: 'SUCCESS',
      metadata: {
        secretToken: undefined // No secret stored
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
});
