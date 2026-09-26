/**
 * BECC v2 — Publication & Portfolio Readiness Evaluation Service Tests
 *
 * IMPL-015 test suite certifying readiness evaluation semantics, evidence handling,
 * error fail-closed behavior, determinism, and M5 / PRAG authority boundary preservation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PublicationReadinessEvaluationService,
  CanonicalPortfolioReadinessRuleProvider
} from '../readiness/publication-readiness.service.js';
import {
  PortfolioReadinessEvaluationInput,
  ReadinessEvidenceItem,
  PortfolioReadinessRuleProvider,
  ReadinessRequirementDefinition,
  ReadinessEvidenceRepository
} from '../readiness/publication-readiness.types.js';

describe('BECC-V2-IMPL-015: Publication & Portfolio Readiness Evaluation Service', () => {
  it('Phase 28: FULLY_SATISFIED_READINESS_CASE — returns READY_BY_EVIDENCE while preserving M5 / PRAG authority boundary', async () => {
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-satisfied-001',
      projectRef: 'AEOcortex',
      issuedAt: '2026-09-26T00:00:00Z',
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
          details: 'UI screenshots and system diagrams present in docs/becc/aeocortex/'
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
    assert.equal(result.satisfiedRequirementIds.length, 6);
    assert.equal(result.blockingRequirementIds.length, 0);

    // Authority boundary assertions
    assert.equal(result.authorityBoundary.beccOwnsFinalAuthority, false);
    assert.equal(result.authorityBoundary.finalPublicationAuthority, 'M5 / PRAG Governance');
    assert.equal(result.authorityBoundary.sideEffectsExecuted, false);
    assert.equal(result.authorityBoundary.evaluationOnly, true);
  });

  it('Phase 29: BLOCKING_REQUIREMENT_CASE — failing blocking requirement returns NOT_READY', async () => {
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-blocking-002',
      projectRef: 'AEOcortex',
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
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-missing-003',
      projectRef: 'StarCleaners',
      evidenceItems: [
        {
          evidenceId: 'ev-dev-mat-01',
          requirementId: 'REQ-DEV-MATURITY-01',
          source: 'BECC Assessment Engine',
          state: 'SATISFIED'
        }
        // Requirements REQ-PROF-PURPOSE-02 etc. missing evidence
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
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-conflict-004',
      projectRef: 'Lumina Praxis',
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
      getRuleVersion(): string {
        return 'v1.0-custom';
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
      getActiveProjectWhitelist(): string[] {
        return ['TestProject'];
      }
    }

    const service = new PublicationReadinessEvaluationService(new CustomRuleProvider());

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-nonblocking-005',
      projectRef: 'TestProject',
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

  it('Phase 33: SAME_INPUT_SAME_READINESS_RESULT — evaluation is strictly deterministic on replay', async () => {
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-replay-006',
      projectRef: 'Rooted Reality Gardens',
      issuedAt: '2026-09-26T12:00:00Z',
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
  });

  it('Phase 34: RULE_VERSION_TRACEABILITY — output retains canonical rule version', async () => {
    const ruleProvider = new CanonicalPortfolioReadinessRuleProvider();
    const service = new PublicationReadinessEvaluationService(ruleProvider);

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-trace-007',
      projectRef: 'BridGenta Reconstruction Platform',
      evidenceItems: []
    };

    const result = await service.evaluateReadiness(input);
    assert.equal(result.ruleVersion, 'v1.0');
  });

  it('Phase 35 & 36: BECC_PUBLICATION_AUTHORITY_BOUNDARY_TEST — readiness result does not imply or grant publication approval', async () => {
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-boundary-008',
      projectRef: 'AEOcortex',
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

    // Verify properties indicating authority assignment do NOT exist
    assert.equal((result as any).approvedForPublication, undefined);
    assert.equal((result as any).publishAuthorized, undefined);
    assert.equal((result as any).publishNow, undefined);

    // Verify authority boundary declaration
    assert.equal(result.authorityBoundary.finalPublicationAuthority, 'M5 / PRAG Governance');
    assert.equal(result.authorityBoundary.beccOwnsFinalAuthority, false);
    assert.equal(result.authorityBoundary.sideEffectsExecuted, false);
  });

  it('Phase 38: READINESS_PROVENANCE_TEST — evaluation result retains evidence IDs and references', async () => {
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-provenance-009',
      projectRef: 'AEOcortex',
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
      evaluationId: 'eval-failrepo-010',
      projectRef: 'StarCleaners',
      evidenceItems: []
    };

    const result = await service.evaluateReadiness(input);

    assert.equal(result.status, 'ERROR');
  });

  it('Phase 40: UNKNOWN_REQUIREMENT_FAILS_CLOSED — evidence referencing unknown requirement produces ERROR', async () => {
    const service = new PublicationReadinessEvaluationService();

    const input: PortfolioReadinessEvaluationInput = {
      evaluationId: 'eval-unknownreq-011',
      projectRef: 'StarCleaners',
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
