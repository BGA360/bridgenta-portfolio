/**
 * @file rule-compliance.test.ts
 * @module @cep/rule-engine
 * @type Compliance Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  createEvidenceService,
  EvidenceSubmissionModel,
  EvidenceCategory,
  EvidenceType,
} from '@cep/evidence-manager';
import {
  createRuleEngineService,
  RuleId,
  RuleCategory,
  RuleSeverity,
  DuplicateRuleError,
} from '../../src/index.js';

describe('Rule Engine — Compliance Tests', () => {
  const dummyChecksumHex = 'b'.repeat(64);

  test('should enforce duplicate rule registration invariant (ERR-RUL-004)', () => {
    const engine = createRuleEngineService();
    const props = {
      id: RuleId.create('rule-dupe-01'),
      metadata: {
        name: 'Dupe Rule',
        description: 'Test dupe',
        framework_id: 'CEF',
        category: RuleCategory.GOVERNANCE,
        severity: RuleSeverity.HIGH,
        tags: [],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: () => ({ pass: true, message: 'ok' }),
    };

    engine.registerRule(props);

    assert.throws(
      () => engine.registerRule(props),
      (err: unknown) => err instanceof DuplicateRuleError && err.code === 'ERR-RUL-004'
    );
  });

  test('should verify zero mutation of evidence input during rule evaluation', () => {
    const evidenceService = createEvidenceService();
    const sub: EvidenceSubmissionModel = {
      submission_id: 'sub-immutable-01',
      assessment_id: 'assessment-001',
      artifact_name: 'test.ts',
      category: EvidenceCategory.STATIC_CODE,
      type: EvidenceType.FILE_ARTIFACT,
      raw_payload: 'export const secret = "none";',
      content_checksum: dummyChecksumHex,
      origin: 'git://repo/test.ts',
      submitting_authority: 'steward',
      correlation_id: 'corr-01',
    };
    const receipt = evidenceService.submitEvidence(sub);
    const evidence = evidenceService.getEvidence(receipt.evidence_id);

    const initialStatus = evidence.status;
    const initialRawPayload = evidence.raw_payload;
    const initialChecksum = evidence.checksum;

    const engine = createRuleEngineService();
    engine.registerRule({
      id: RuleId.create('rule-immutability-01'),
      metadata: {
        name: 'Check Secret',
        description: 'Check payload',
        framework_id: 'CEF',
        category: RuleCategory.SECURITY,
        severity: RuleSeverity.CRITICAL,
        tags: [],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: (payload) => ({ pass: !payload.includes('supersecret'), message: 'Checked' }),
    });

    engine.evaluateEvidence(
      { evaluation_id: 'eval-01', assessment_id: 'assessment-001', target_evidence_ids: [evidence.id] },
      [evidence]
    );

    // Verify evidence remains untouched
    assert.equal(evidence.status, initialStatus);
    assert.equal(evidence.raw_payload, initialRawPayload);
    assert.equal(evidence.checksum, initialChecksum);
  });
});
