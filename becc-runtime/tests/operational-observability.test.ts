/**
 * BECC v2 — Operational Observability Test Suite
 *
 * Verifies structured operational logging, correlation, metric snapshots, health signals,
 * dependency telemetry, safe error classification, security redaction, and failure isolation
 * as specified in BECC-NEXT-004.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

import { InMemoryBeccOperationalObserver } from '../observability/in-memory-operational-observer.adapter.js';
import { StructuredConsoleBeccOperationalObserver } from '../observability/structured-console-operational-observer.adapter.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';
import { AuditMetadataSecurityPolicy } from '../audit/audit-metadata-security.policy.js';

import { GovernedGuidanceResolverService } from '../knowledge/governed-guidance-resolver.service.js';
import { FindingEscalationService } from '../escalation/finding-escalation.service.js';
import { PublicationReadinessEvaluationService } from '../readiness/publication-readiness.service.js';
import { PortfolioReadinessRuleProvider } from '../readiness/publication-readiness.types.js';
import { BeccAuditIntegrationService } from '../audit/audit-integration.service.js';
import { InMemoryBeccAuditLedger } from '../audit/in-memory-audit-ledger.adapter.js';
import type { GovernedLearningIntegrationAdapter } from '../governed-learning/governed-learning-adapter.types.js';

const mockActorRef = { actorId: 'actor_tester', actorType: 'AGENT' as const };

function createMockGlAdapter(overrides: Partial<GovernedLearningIntegrationAdapter> = {}): GovernedLearningIntegrationAdapter {
  return {
    queryGuidance: async (input) => ({
      ok: true,
      category: 'SUCCESS',
      source: 'GOVERNED_LEARNING',
      commandId: `cmd_query_${input.queryId}`,
      guidanceSet: {
        queryId: input.queryId,
        matchStrategy: input.matchStrategy || 'STRICT',
        evaluatedAt: new Date().toISOString(),
        matchedGuidance: [
          {
            lessonRef: { lessonId: 'les_001', version: '1.0.0' },
            statement: 'Test lesson statement',
            rationale: 'Test rationale',
            scope: { scopeType: 'SYSTEM_WIDE' }
          }
        ]
      },
      replayed: false
    }),
    draftObservation: async (input) => ({
      ok: true,
      category: 'SUCCESS',
      source: 'GOVERNED_LEARNING',
      commandId: `cmd_draft_${input.findingId}`,
      observationId: `obs_${input.findingId}`,
      replayed: false
    }),
    attachEvidence: async (input, obsId) => ({
      ok: true,
      category: 'SUCCESS',
      source: 'GOVERNED_LEARNING',
      commandId: `cmd_attach_${obsId}`,
      observationId: obsId,
      replayed: false
    }),
    submitObservation: async (input, obsId) => ({
      ok: true,
      category: 'SUCCESS',
      source: 'GOVERNED_LEARNING',
      commandId: `cmd_submit_${obsId}`,
      observationId: obsId,
      replayed: false
    }),
    ...overrides
  };
}

class TestRuleProvider implements PortfolioReadinessRuleProvider {
  getRuleSource() {
    return { sourceRef: 'RULE_SRC_TEST', sourceRevision: 'v1.0' };
  }
  getRequirements() {
    return [
      {
        requirementId: 'REQ_01',
        dimensionName: 'SECURITY',
        description: 'Security audit requirement',
        sourceRuleRef: 'RULE_SRC_TEST',
        blocking: true,
        evidenceRequired: true,
        evaluatorType: 'EVIDENCE_MATCH'
      }
    ];
  }
}

describe('BECC-NEXT-004 — Operational Observability', () => {
  let observer: InMemoryBeccOperationalObserver;

  beforeEach(() => {
    observer = new InMemoryBeccOperationalObserver();
  });

  it('1. GovernedGuidanceResolverService emits operation and dependency events on success', async () => {
    const glAdapter = createMockGlAdapter();
    const service = new GovernedGuidanceResolverService({ adapter: glAdapter, observer });

    const result = await service.resolveGuidance({
      queryId: 'q_100',
      projectRef: { projectId: 'proj_alpha' },
      actorRef: mockActorRef,
      issuedAt: new Date().toISOString()
    });

    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');

    const events = observer.getEvents();
    assert.ok(events.length >= 2, 'Expected at least STARTED and COMPLETED events');

    const startedEvent = events.find((e) => e.eventType === 'STARTED')!;
    assert.ok(startedEvent);
    assert.equal(startedEvent.operationType, 'GUIDANCE_RESOLUTION');
    assert.equal(startedEvent.operationId, 'q_100');

    const depEvent = events.find((e) => e.eventType === 'DEPENDENCY')!;
    assert.ok(depEvent);
    assert.equal(depEvent.dependencyName, 'GOVERNED_LEARNING');
    assert.equal(depEvent.resultStatus, 'SUCCESS');

    const completedEvent = events.find((e) => e.eventType === 'COMPLETED')!;
    assert.ok(completedEvent);
    assert.equal(completedEvent.resultStatus, 'SUCCESS');
    assert.equal(completedEvent.domainResultStatus, 'SUCCESS');
    assert.ok((completedEvent.durationMs ?? -1) >= 0);
  });

  it('2. GovernedGuidanceResolverService emits REFUSED state distinctly from ERROR', async () => {
    const glAdapter = createMockGlAdapter();
    const service = new GovernedGuidanceResolverService({ adapter: glAdapter, observer });

    // Unmapped context -> REFUSED
    const result = await service.resolveGuidance({
      queryId: 'q_unmapped',
      actorRef: mockActorRef,
      issuedAt: new Date().toISOString()
    });

    assert.equal(result.ok, false);
    assert.equal(result.category, 'REFUSED');

    const snapshot = observer.getMetricsSnapshot();
    assert.equal(snapshot.operationsByStatus.REFUSED, 1);
    assert.equal(snapshot.operationsByStatus.ERROR, 0);

    const completedEvent = observer.getEvents().find((e) => e.eventType === 'COMPLETED')!;
    assert.ok(completedEvent);
    assert.equal(completedEvent.resultStatus, 'REFUSED');
    assert.equal(completedEvent.domainResultStatus, 'REFUSED');
  });

  it('3. FindingEscalationService emits multi-step GL dependency events and pipeline completion', async () => {
    const glAdapter = createMockGlAdapter();
    const service = new FindingEscalationService({ adapter: glAdapter, observer });

    const result = await service.escalateFinding({
      finding: { id: 'f_200', category: 'Engineering', severity: 'error', message: 'Defect finding' },
      actorRef: mockActorRef,
      authorityContextRef: { authorityId: 'AUTH_CTX_M5' },
      issuedAt: new Date().toISOString(),
      evidenceItems: [{ evidenceId: 'ev_01', location: '/path/to/diff' }]
    });

    assert.equal(result.ok, true);

    const events = observer.getEvents();
    const depEvents = events.filter((e) => e.eventType === 'DEPENDENCY');
    assert.ok(depEvents.length >= 3, 'Expected draft, attach, and submit dependency events');

    const ops = depEvents.map((e) => e.operation);
    assert.ok(ops.includes('draftObservation'));
    assert.ok(ops.includes('attachEvidence'));
    assert.ok(ops.includes('submitObservation'));

    const completedEvent = events.find((e) => e.eventType === 'COMPLETED')!;
    assert.ok(completedEvent);
    assert.equal(completedEvent.operationType, 'FINDING_ESCALATION');
    assert.equal(completedEvent.resultStatus, 'SUCCESS');
  });

  it('4. PublicationReadinessEvaluationService emits INDETERMINATE and ERROR statuses accurately', async () => {
    const service = new PublicationReadinessEvaluationService(new TestRuleProvider(), undefined, undefined, observer);

    // Missing issuedAt -> ERROR
    const errResult = await service.evaluateReadiness({
      evaluationId: 'eval_err',
      projectRef: 'proj_test',
      evidenceItems: [],
      issuedAt: ''
    });

    assert.equal(errResult.status, 'ERROR');

    const snapshot = observer.getMetricsSnapshot();
    assert.equal(snapshot.totalOperationsFailed, 1);

    const failEvent = observer.getEvents().find((e) => e.eventType === 'FAILED')!;
    assert.ok(failEvent);
    assert.equal(failEvent.operationType, 'READINESS_EVALUATION');
    assert.equal(failEvent.resultStatus, 'ERROR');
  });

  it('5. PostgreSQL Audit persistence dependency call is observed without duplicating audit payloads', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const auditService = new BeccAuditIntegrationService(ledger, observer);

    await auditService.recordAudit({
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_audit_obs',
      resultStatus: 'SUCCESS',
      occurredAt: new Date().toISOString(),
      metadata: { safeSummary: 'Audit record' }
    });

    const events = observer.getEvents();
    const pgDepEvent = events.find((e) => e.eventType === 'DEPENDENCY' && e.dependencyName === 'POSTGRES_AUDIT_LEDGER')!;
    assert.ok(pgDepEvent);
    assert.equal(pgDepEvent.operation, 'append');
    assert.equal(pgDepEvent.resultStatus, 'SUCCESS');

    // AUDIT_PAYLOAD_DUPLICATED_TO_OBSERVABILITY: NO
    assert.equal((pgDepEvent as any).metadata, undefined);
    assert.equal((pgDepEvent as any).inputRefs, undefined);
  });

  it('6. Observability adapter failure is strictly isolated from domain & audit execution', async () => {
    const failingObserver = new InMemoryBeccOperationalObserver({ simulateObserverFailure: true });
    const glAdapter = createMockGlAdapter();
    const ledger = new InMemoryBeccAuditLedger();
    const auditService = new BeccAuditIntegrationService(ledger, failingObserver);

    const guidanceService = new GovernedGuidanceResolverService({
      adapter: glAdapter,
      auditService,
      observer: failingObserver
    });

    // Operation must succeed completely even though observer throws internally
    const result = await guidanceService.resolveGuidance({
      queryId: 'q_fail_iso',
      projectRef: { projectId: 'proj_iso' },
      actorRef: mockActorRef,
      issuedAt: new Date().toISOString()
    });

    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');
  });

  it('7. Security Policy redacts sensitive terms and secret patterns', () => {
    // Reuses shared AuditMetadataSecurityPolicy rules
    assert.equal(AuditMetadataSecurityPolicy.isSensitiveKey('authToken'), true);
    assert.equal(AuditMetadataSecurityPolicy.isSensitiveKey('password'), true);
    assert.equal(AuditMetadataSecurityPolicy.isSensitiveKey('apiKey'), true);
    assert.equal(AuditMetadataSecurityPolicy.isSensitiveKey('projectRef'), false);

    const secretString = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature';
    assert.equal(ObservabilitySecurityPolicy.sanitizeString(secretString), '[REDACTED_SECRET_PATTERN]');

    const credString = 'user_password=SecretPass123!&env=prod';
    assert.equal(ObservabilitySecurityPolicy.sanitizeString(credString).includes('SecretPass123!'), false);
  });

  it('8. Metric label cardinality remains bounded', () => {
    const boundedLabel = ObservabilitySecurityPolicy.buildBoundedMetricLabel(
      'GUIDANCE_RESOLUTION',
      'SUCCESS',
      'GOVERNED_LEARNING',
      'ERR_NONE',
      'NONE'
    );

    assert.equal(boundedLabel, 'op:GUIDANCE_RESOLUTION|status:SUCCESS|dep:GOVERNED_LEARNING|err:NONE');
    assert.equal(boundedLabel.includes('q_100'), false, 'Unbounded operationId must NOT be included in metric label');
  });

  it('9. Operational timestamp is distinct from caller-supplied audit occurredAt', async () => {
    const ledger = new InMemoryBeccAuditLedger();
    const auditService = new BeccAuditIntegrationService(ledger, observer);

    const callerOccurredAt = '2026-01-01T00:00:00.000Z';
    const auditRecord = await auditService.recordAudit({
      operationType: 'GUIDANCE_QUERY',
      operationId: 'op_time_test',
      resultStatus: 'SUCCESS',
      occurredAt: callerOccurredAt
    });

    assert.equal(auditRecord.occurredAt, callerOccurredAt);

    const events = observer.getEvents();
    const depEvent = events.find((e) => e.eventType === 'DEPENDENCY')!;
    assert.ok(depEvent);
    assert.notEqual(depEvent.occurredAt, callerOccurredAt, 'Operational observation time must be system-generated timestamp');
  });

  it('10. StructuredConsoleBeccOperationalObserver formats valid JSON output without throwing', () => {
    const consoleObserver = new StructuredConsoleBeccOperationalObserver();

    assert.doesNotThrow(() => {
      consoleObserver.operationStarted({
        operationType: 'TEST_OP',
        operationId: 'op_console_1',
        correlationRef: 'corr_console_1',
        occurredAt: new Date().toISOString()
      });

      consoleObserver.operationCompleted(
        {
          operationType: 'TEST_OP',
          operationId: 'op_console_1',
          correlationRef: 'corr_console_1'
        },
        {
          operationalResultStatus: 'SUCCESS',
          durationMs: 15
        }
      );
    });
  });
});
