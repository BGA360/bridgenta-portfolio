/**
 * BECC v2 — Publication & Portfolio Readiness Evaluation Service Final Traceability Tests
 *
 * IMPL-015 final traceability test suite certifying:
 * 1. 5 canonical readiness thresholds (docs/portfolio-readiness-rule.md Section 1).
 * 2. Active whitelist is NOT a readiness requirement (new projects can evaluate READY_BY_EVIDENCE).
 * 3. Static test confirming REQ-ACTIVE-WHITELIST-06 is absent.
 * 4. Explicit dependency injection (no silent default provider in business service).
 * 5. M5 / PRAG governance authority boundary preservation.
 * 6. Rule source reference traceability (ruleSourceRef: 'docs/portfolio-readiness-rule.md', no invented ruleVersion or ruleSourceRevision).
 * 7. Caller-supplied evaluation timestamp integrity (issuedAt required, missing/invalid timestamps fail closed, no synthetic timestamp fallback).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PublicationReadinessEvaluationService,
  CanonicalPortfolioReadinessRuleProvider,
  createCanonicalPublicationReadinessService
} from '../readiness/publication-readiness.service.js';
import {
  PortfolioReadinessEvaluationInput,
  ReadinessEvidenceItem,
  PortfolioReadinessRuleProvider,
  ReadinessRequirementDefinition,
  ReadinessEvidenceRepository
} from '../readiness/publication-readiness.types.js';

describe('BECC-V2-IMPL-015: Publication & Portfolio Readiness Evaluation Service (Final Traceability)', () => {
  it('Phase 28: FULLY_SATISFIED_READINESS_CASE — returns READY_BY_EVIDENCE for all 5 canonical criteria while preserving M5 / PRAG authority boundary', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-satisfied-001',
      projectRef: 'AEOcortex',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED',
          details: 'Development maturity measured at 85%'
        },
        {
          evidenceId: 'ev-prof-purp-02',
          requirementId: 'REQ-PROF-PURPOSE-02',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED',
          details: 'Clear professional purpose verified in architecture documentation'
        },
        {
          evidenceId: 'ev-visual-03',
          requirementId: 'REQ-VISUAL-EVIDENCE-03',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED',
          details: 'UI screenshots and system diagrams present'
        },
        {
          evidenceId: 'ev-defens-04',
          requirementId: 'REQ-INTERVIEW-DEF-04',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED',
          details: 'Interview defensibility matrix verified'
        },
        {
          evidenceId: 'ev-pub-std-05',
          requirementId: 'REQ-PUB-STANDARD-05',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED',
          details: 'No secrets or unapproved client IP found in codebase'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'READY_BY_EVIDENCE');
    assert.equal(result.satisfiedRequirementIds.length, 5);
    assert.equal(result.blockingRequirementIds.length, 0);

    // Authority boundary assertions
    assert.equal(result.authorityBoundary.beccOwnsFinalAuthority, false);
    assert.equal(result.authorityBoundary.finalPublicationAuthority, 'M5 / PRAG Governance');
    assert.equal(result.authorityBoundary.sideEffectsExecuted, false);
    assert.equal(result.authorityBoundary.evaluationOnly, true);
  });

  it('Part B2: NEW_PROJECT_NOT_ON_WHITELIST_CAN_BE_READY_BY_EVIDENCE — new project not on whitelist evaluates to READY_BY_EVIDENCE when criteria are met', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-newproject-002',
      projectRef: 'BrandNewUnlistedProjectCandidate',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-prof-purp-02',
          requirementId: 'REQ-PROF-PURPOSE-02',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-visual-03',
          requirementId: 'REQ-VISUAL-EVIDENCE-03',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-defens-04',
          requirementId: 'REQ-INTERVIEW-DEF-04',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-pub-std-05',
          requirementId: 'REQ-PUB-STANDARD-05',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'READY_BY_EVIDENCE');
    assert.equal(result.satisfiedRequirementIds.length, 5);
    assert.equal(result.blockingRequirementIds.length, 0);
  });

  it('Part I: NO_WHITELIST_REQUIREMENT_STATIC_TEST — confirms REQ-ACTIVE-WHITELIST-06 is not present in requirement definitions', () => {
    const provider = new CanonicalPortfolioReadinessRuleProvider();
    const requirements = provider.getRequirements();

    assert.equal(requirements.length, 5);
    const reqIds = requirements.map((r) => r.requirementId);
    assert.equal(reqIds.includes('REQ-ACTIVE-WHITELIST-06'), false);
  });

  it('Part C1 & C2: EXPLICIT_PROVIDER_REQUIRED_TEST — business service rejects missing provider, composition factory creates service explicitly', () => {
    assert.throws(
      () => new PublicationReadinessEvaluationService(undefined as any),
      /Explicit PortfolioReadinessRuleProvider is required/
    );

    const factoryService = createCanonicalPublicationReadinessService();
    assert.ok(factoryService instanceof PublicationReadinessEvaluationService);
  });

  it('Part A & Part I: RULE_SOURCE_REFERENCE_TEST & RULE_SOURCE_REVISION_TEST — result exposes ruleSourceRef and uninvented ruleSourceRevision', async () => {
    const provider = new CanonicalPortfolioReadinessRuleProvider();
    const service = new PublicationReadinessEvaluationService(provider);

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-trace-003',
      projectRef: 'BridGenta Reconstruction Platform',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: []
    };

    const result = await service.evaluateReadiness(input);
    assert.equal(result.ruleSourceRef, 'docs/portfolio-readiness-rule.md');
    assert.equal(result.ruleSourceRevision, undefined);
    assert.equal((result as any).ruleVersion, undefined);
  });

  it('Part H: VALID_EVALUATION_TIMESTAMP_TEST — preserves valid caller-supplied issuedAt timestamp exactly as evaluatedAt', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-validtime-003b',
      projectRef: 'AEOcortex',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: []
    };

    const result = await service.evaluateReadiness(input);
    assert.equal(result.evaluatedAt, '2026-09-27T12:00:00Z');
    assert.equal(result.evaluatedAt, input.issuedAt);
  });

  it('Part I: MISSING_EVALUATION_TIMESTAMP_FAILS_CLOSED & MISSING_TIMESTAMP_EVALUATED_AT_ABSENT_TEST — missing issuedAt fails closed to ERROR with undefined evaluatedAt', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-notime-004',
      projectRef: 'StarCleaners',
      issuedAt: '' as any,
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);
    assert.equal(result.status, 'ERROR');
    assert.equal(result.evaluatedAt, undefined);
    assert.notEqual(result.evaluatedAt, '2026-01-01T00:00:00Z');
    assert.notEqual(result.evaluatedAt, 'MISSING_TIMESTAMP');
  });

  it('Part J: INVALID_EVALUATION_TIMESTAMP_FAILS_CLOSED & INVALID_TIMESTAMP_EVALUATED_AT_ABSENT_TEST — malformed issuedAt fails closed to ERROR with undefined evaluatedAt', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-badtime-005',
      projectRef: 'StarCleaners',
      issuedAt: 'not-a-valid-timestamp',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);
    assert.equal(result.status, 'ERROR');
    assert.equal(result.evaluatedAt, undefined);
    assert.notEqual(result.evaluatedAt, 'not-a-valid-timestamp');
  });

  it('Part K: NO_TIMESTAMP_SENTINEL_LEAKAGE_TEST — verifies no MISSING_TIMESTAMP or ERROR_TIMESTAMP sentinels populate evaluatedAt', async () => {
    const service = createCanonicalPublicationReadinessService();

    const resultMissing = await service.evaluateReadiness({
      evaluationId: 'eval-missing-ts',
      projectRef: 'StarCleaners',
      issuedAt: '',
      evidenceItems: []
    });
    assert.notEqual(resultMissing.evaluatedAt, 'MISSING_TIMESTAMP');
    assert.notEqual(resultMissing.evaluatedAt, 'ERROR_TIMESTAMP');
    assert.equal(resultMissing.evaluatedAt, undefined);

    const resultInvalid = await service.evaluateReadiness({
      evaluationId: 'eval-invalid-ts',
      projectRef: 'StarCleaners',
      issuedAt: 'bad-ts',
      evidenceItems: []
    });
    assert.notEqual(resultInvalid.evaluatedAt, 'MISSING_TIMESTAMP');
    assert.notEqual(resultInvalid.evaluatedAt, 'ERROR_TIMESTAMP');
    assert.equal(resultInvalid.evaluatedAt, undefined);
  });

  it('Phase 29: BLOCKING_REQUIREMENT_CASE — failing blocking requirement returns NOT_READY', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-blocking-006',
      projectRef: 'AEOcortex',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-prof-purp-02',
          requirementId: 'REQ-PROF-PURPOSE-02',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-visual-03',
          requirementId: 'REQ-VISUAL-EVIDENCE-03',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-defens-04',
          requirementId: 'REQ-INTERVIEW-DEF-04',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-pub-std-05-fail',
          requirementId: 'REQ-PUB-STANDARD-05',
          source: 'BECC Assessment Engine',
          state: 'NOT_SATISFIED',
          details: 'Detected hardcoded secret in configuration file'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'NOT_READY');
    assert.ok(result.blockingRequirementIds.includes('REQ-PUB-STANDARD-05'));
  });

  it('Phase 30: MISSING_EVIDENCE_CASE — missing required evidence returns NOT_READY and distinct status', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-missing-007',
      projectRef: 'StarCleaners',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'NOT_READY');
    assert.ok(result.missingEvidenceRequirementIds.includes('REQ-PROF-PURPOSE-02'));

    const missingReqEval = result.evaluatedRequirements.find(
      (r) => r.requirementId === 'REQ-PROF-PURPOSE-02'
    );
    assert.ok(missingReqEval);
    assert.equal(missingReqEval.status, 'MISSING_EVIDENCE');
  });

  it('Phase 31: CONFLICTING_EVIDENCE_CASE — conflicting evidence for requirement returns INDETERMINATE and fails closed', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-conflict-008',
      projectRef: 'Lumina Praxis',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-visual-03a',
          requirementId: 'REQ-VISUAL-EVIDENCE-03',
          source: 'Source A',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-visual-03b',
          requirementId: 'REQ-VISUAL-EVIDENCE-03',
          source: 'Source B',
          state: 'NOT_SATISFIED',
          details: 'Missing screenshots'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'INDETERMINATE');
    assert.ok(result.conflictingEvidenceRequirementIds.includes('REQ-VISUAL-EVIDENCE-03'));
  });

  it('Phase 32: NON_BLOCKING_REQUIREMENT_CASE — unmet non-blocking requirement does not prevent READY_BY_EVIDENCE', async () => {
    class CustomRuleProvider implements PortfolioReadinessRuleProvider {
      getRuleSource(): { sourceRef: string; sourceRevision?: string } {
        return { sourceRef: 'custom#rule.md' };
      }
      getRequirements(): ReadinessRequirementDefinition[] {
        return [
          {
            requirementId: 'REQ-BLOCKING-01',
            dimensionName: 'blocking_dim',
            description: 'Core blocking requirement',
            sourceRuleRef: 'custom#1',
            blocking: true,
            evidenceRequired: true
          },
          {
            requirementId: 'REQ-OPTIONAL-02',
            dimensionName: 'optional_dim',
            description: 'Optional non-blocking metric',
            sourceRuleRef: 'custom#2',
            blocking: false,
            evidenceRequired: false
          }
        ];
      }
    }

    const service = new PublicationReadinessEvaluationService(new CustomRuleProvider());

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-nonblocking-009',
      projectRef: 'TestProject',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-block-01',
          requirementId: 'REQ-BLOCKING-01',
          source: 'Test Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-opt-02',
          requirementId: 'REQ-OPTIONAL-02',
          source: 'Test Engine',
          state: 'NOT_SATISFIED',
          details: 'Optional metric missed'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'READY_BY_EVIDENCE');
    assert.ok(result.satisfiedRequirementIds.includes('REQ-BLOCKING-01'));
    assert.equal(result.blockingRequirementIds.length, 0);
  });

  it('Part M & Phase 33: SAME_INPUT_SAME_READINESS_RESULT — evaluation is strictly deterministic on replay', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-replay-010',
      projectRef: 'Rooted Reality Gardens',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Engine',
          state: 'SATISFIED'
        }
      ]
    };

    const result1 = await service.evaluateReadiness(input);
    const result2 = await service.evaluateReadiness(input);

    assert.deepEqual(result1, result2);
    assert.equal(result1.evaluatedAt, '2026-09-27T12:00:00Z');
  });

  it('Phase 35 & 36: BECC_PUBLICATION_AUTHORITY_BOUNDARY_TEST — readiness result does not imply or grant publication approval', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-boundary-011',
      projectRef: 'AEOcortex',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-prof-purp-02',
          requirementId: 'REQ-PROF-PURPOSE-02',
          source: 'BECC Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-visual-03',
          requirementId: 'REQ-VISUAL-EVIDENCE-03',
          source: 'BECC Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-defens-04',
          requirementId: 'REQ-INTERVIEW-DEF-04',
          source: 'BECC Engine',
          state: 'SATISFIED'
        },
        {
          evidenceId: 'ev-pub-std-05',
          requirementId: 'REQ-PUB-STANDARD-05',
          source: 'BECC Engine',
          state: 'SATISFIED'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal((result as any).approvedForPublication, undefined);
    assert.equal((result as any).publishAuthorized, undefined);
    assert.equal((result as any).publishNow, undefined);

    assert.equal(result.authorityBoundary.finalPublicationAuthority, 'M5 / PRAG Governance');
    assert.equal(result.authorityBoundary.beccOwnsFinalAuthority, false);
    assert.equal(result.authorityBoundary.sideEffectsExecuted, false);
  });

  it('Phase 38: READINESS_PROVENANCE_TEST — evaluation result retains evidence IDs and references', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-provenance-012',
      projectRef: 'AEOcortex',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-unique-prov-101',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED',
          contentHash: 'sha256:abc123def456'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.ok(result.evidenceRefs.includes('ev-unique-prov-101'));
    const reqEval = result.evaluatedRequirements.find(
      (r) => r.requirementId === 'REQ-DEV-MATURITY-01'
    );
    assert.ok(reqEval);
    assert.ok(reqEval.evidenceRefs.includes('ev-unique-prov-101'));
  });

  it('Phase 39: READINESS_PROVIDER_FAILURE_FAILS_CLOSED — evidence repository failure produces ERROR', async () => {
    class FailingEvidenceRepo implements ReadinessEvidenceRepository {
      async fetchEvidenceForProject(_projectRef: string): Promise<ReadinessEvidenceItem[]> {
        throw new Error('Database connection timeout');
      }
    }

    const service = new PublicationReadinessEvaluationService(
      new CanonicalPortfolioReadinessRuleProvider(),
      new FailingEvidenceRepo()
    );

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-failrepo-013',
      projectRef: 'StarCleaners',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: []
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'ERROR');
  });

  it('Phase 40: UNKNOWN_REQUIREMENT_FAILS_CLOSED — evidence referencing unknown requirement produces ERROR', async () => {
    const service = createCanonicalPublicationReadinessService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-unknownreq-014',
      projectRef: 'StarCleaners',
      issuedAt: '2026-09-27T12:00:00Z',
      evidenceItems: [
        {
          evidenceId: 'ev-bad-req',
          requirementId: 'REQ-UNKNOWN-FAKEREQ-999',
          source: 'Malicious Input',
          state: 'SATISFIED'
        }
      ]
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'ERROR');
  });
});
