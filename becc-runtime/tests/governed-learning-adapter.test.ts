import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  GovernedLearningRuntime,
  type ActorIdentityRef,
  type AuthorityContextRef,
} from '@cep/governed-learning';
import {
  DefaultGovernedLearningIntegrationAdapter,
  deriveGovernedLearningCommandId,
  type BECCFindingEscalationInput,
} from '../governed-learning/index.js';

describe('BECC v2 IMPL-012: Governed Learning Integration Adapter Remediation Test Suite', () => {
  const validActorRef: ActorIdentityRef = {
    actorId: 'act_becc_agent_001',
    actorType: 'AGENT',
  };

  const validAuthorityContextRef: AuthorityContextRef = {
    authorityId: 'auth_ctx_becc_steward_001',
  };

  const sampleFindingInput: BECCFindingEscalationInput = {
    findingId: 'finding_aq_es_001_section_3',
    category: 'MECHANICAL',
    statement: 'Technical specification missing required provenance metadata header section',
    sourceArtifactRef: 'docs/architecture/BECC-V2-GOVERNED-LEARNING-INTEGRATION-ADR.md',
    actorRef: validActorRef,
    authorityContextRef: validAuthorityContextRef,
    evidenceType: 'ARTIFACT_DIFF',
    evidenceLocation: 'docs/architecture/BECC-V2-GOVERNED-LEARNING-INTEGRATION-ADR.md#L15',
    issuedAt: '2026-09-22T06:00:00.000Z',
  };

  it('1. Deterministic Command ID Derivation (DETERMINISTIC_COMMAND_ID)', () => {
    const id1 = deriveGovernedLearningCommandId('finding_001', 'DraftObservation', 'DRAFT');
    const id2 = deriveGovernedLearningCommandId('finding_001', 'DraftObservation', 'DRAFT');
    const idStep2 = deriveGovernedLearningCommandId('finding_001', 'AttachEvidence', 'ATTACH_EVIDENCE');
    const idDifferentFinding = deriveGovernedLearningCommandId('finding_002', 'DraftObservation', 'DRAFT');

    assert.strictEqual(id1, id2, 'Same input parameters must produce identical commandId across retries');
    assert.notStrictEqual(id1, idStep2, 'Different pipeline step must produce different commandId');
    assert.notStrictEqual(id1, idDifferentFinding, 'Different finding ID must produce different commandId');
    assert.ok(id1.startsWith('cmd_becc_'), 'commandId must start with canonical cmd_becc_ prefix');
  });

  it('2. Explicit Runtime Injection Required (RUNTIME_INJECTION_REQUIRED & SILENT_LEVEL1_RUNTIME_FALLBACK_REMOVED)', () => {
    // Assert constructor throws when options or runtime are omitted
    assert.throws(
      () => new DefaultGovernedLearningIntegrationAdapter(undefined as any),
      /GovernedLearningRuntime instance is required/
    );
    assert.throws(
      () => new DefaultGovernedLearningIntegrationAdapter({} as any),
      /GovernedLearningRuntime instance is required/
    );

    // Assert constructor succeeds with explicitly injected runtime instance
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    assert.ok(adapter);
  });

  it('3. DraftObservation Command Envelope & Execution Mapping (DRAFT_OBSERVATION_MAPPING)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const result = await adapter.draftObservation(sampleFindingInput);

    assert.strictEqual(result.ok, true, 'Drafting observation should succeed');
    assert.strictEqual(result.category, 'SUCCESS');
    assert.ok(result.commandId.startsWith('cmd_becc_'));
    assert.ok(result.data, 'Result data must be populated');
    assert.strictEqual(result.replayed, false, 'Initial execution should not be replayed');
  });

  it('4. AttachEvidence Command Mapping with Valid Evidence (ATTACH_EVIDENCE_MAPPING & VALID_EVIDENCE_MAPPING)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const draftRes = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(draftRes.ok, true);

    const attachRes = await adapter.attachEvidence(sampleFindingInput, 'obs_test_001');
    assert.strictEqual(attachRes.ok, true);
    assert.strictEqual(attachRes.category, 'SUCCESS');
  });

  it('5. Missing Evidence Location Fails Closed Without Fabrication (MISSING_EVIDENCE_LOCATION_FAILS_CLOSED)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    const invalidInput: BECCFindingEscalationInput = {
      ...sampleFindingInput,
      evidenceLocation: undefined,
      sourceArtifactRef: undefined,
    };

    const attachRes = await adapter.attachEvidence(invalidInput, 'obs_test_001');
    assert.strictEqual(attachRes.ok, false);
    assert.strictEqual(attachRes.category, 'REFUSED');
    assert.strictEqual(attachRes.refusalCode, 'REFUSAL_INSUFFICIENT_EVIDENCE');
    assert.ok(attachRes.reason?.includes('failed closed'));
  });

  it('6. SubmitObservation Command Mapping (SUBMIT_OBSERVATION_MAPPING)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const submitRes = await adapter.submitObservation(sampleFindingInput, 'obs_test_001');
    assert.strictEqual(submitRes.ok, true);
    assert.strictEqual(submitRes.category, 'SUCCESS');
  });

  it('7. Missing Authority Context Fails Closed (MISSING_AUTHORITY_FAILS_CLOSED)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const invalidInput: BECCFindingEscalationInput = {
      ...sampleFindingInput,
      authorityContextRef: undefined,
    };

    const result = await adapter.draftObservation(invalidInput);
    assert.strictEqual(result.ok, false, 'Operation without authority context must fail');
    assert.strictEqual(result.category, 'REFUSED');
    assert.strictEqual(result.refusalCode, 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED');
    assert.ok(result.reason?.includes('failed closed'));
  });

  it('8. Governed Learning Stage 8 Idempotency Exact Retry with Wall-Clock Separation & True Replay (STABLE_ISSUED_AT_ACROSS_RETRY & TRUE_GL_IDEMPOTENT_REPLAY)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    // First execution
    const res1 = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res1.category, 'SUCCESS');
    assert.strictEqual(res1.replayed, false);

    // Force wall-clock separation between retries
    await new Promise((resolve) => setTimeout(resolve, 15));

    // Exact retry reusing identical findingId, step, and immutable issuedAt
    const res2 = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.category, 'SUCCESS');
    assert.strictEqual(res2.commandId, res1.commandId, 'Retry must preserve exact deterministic commandId');
    assert.strictEqual(res2.replayed, true, 'Second execution must return true GL replayedResult flag');
  });

  it('9. Same Command ID with Changed IssuedAt Yields GL Invariant Refusal (CHANGED_ISSUED_AT_SAME_ID_REFUSED)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    const initialInput: BECCFindingEscalationInput = {
      ...sampleFindingInput,
      findingId: 'finding_changed_issued_at_test_001',
      issuedAt: '2026-09-22T06:10:00.000Z',
    };

    const res1 = await adapter.draftObservation(initialInput);
    assert.strictEqual(res1.ok, true);

    // Same logical finding defect & pipeline step (producing identical commandId), but different issuedAt
    const retryWithNewTimestamp: BECCFindingEscalationInput = {
      ...initialInput,
      issuedAt: '2026-09-22T06:10:05.000Z',
    };

    const res2 = await adapter.draftObservation(retryWithNewTimestamp);
    assert.strictEqual(res2.ok, false);
    assert.strictEqual(res2.category, 'REFUSED');
    assert.strictEqual(res2.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.ok(
      res2.reason?.includes('issuedAt') || res2.reason?.includes('mismatched') || res2.reason?.includes('collision'),
      `Reason should indicate timestamp mismatch or identity collision, got: ${res2.reason}`
    );
  });

  it('10. Changed Payload with Same Command ID Yields GL Invariant Refusal (CHANGED_PAYLOAD_SAME_ID_REFUSED)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    const res1 = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(res1.ok, true);

    // Mismatched payload with same commandId and issuedAt
    const commandId = deriveGovernedLearningCommandId(
      sampleFindingInput.findingId,
      'DraftObservation',
      'DRAFT'
    );
    const mismatchedPayload = {
      category: 'INTERPRETIVE' as const, // Different category
      statement: 'Completely different statement',
    };
    const mismatchedEnvelope = {
      commandId,
      commandType: 'DraftObservation' as const,
      payloadVersion: '1.0.0',
      issuedAt: sampleFindingInput.issuedAt!,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      payload: mismatchedPayload,
    };

    const mismatchRes = await runtime.processAndExecuteCommandAsync(mismatchedEnvelope);

    assert.strictEqual(mismatchRes.ok, false);
    assert.strictEqual(mismatchRes.category, 'REFUSED');
    assert.strictEqual(mismatchRes.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
  });

  it('11. Boundary Verification: Zero Direct Database or Transaction Leakage (NO_DIRECT_DB_OR_TRANSACTION_LEAKAGE)', () => {
    const serviceFilePath = fileURLToPath(
      new URL('../../governed-learning/governed-learning-adapter.service.ts', import.meta.url)
    );
    const adapterServiceContent = readFileSync(serviceFilePath, 'utf-8');

    // Strip docstring comments before checking code imports/usage
    const codeOnly = adapterServiceContent.replace(/\/\*[\s\S]*?\*\//g, '');

    const forbiddenSymbols = [
      'PostgresDatabaseManager',
      'SqliteDatabaseManager',
      'PostgresGovernanceRepository',
      'PostgresIdempotencyStore',
      'TransactionContext',
      'PoolClient',
      'packages/governed-learning/src/internal',
    ];

    for (const symbol of forbiddenSymbols) {
      assert.strictEqual(
        codeOnly.includes(symbol),
        false,
        `Forbidden symbol or internal leak '${symbol}' found in adapter service implementation code`
      );
    }
  });
});
