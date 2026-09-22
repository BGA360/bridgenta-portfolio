import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

describe('BECC v2 IMPL-012: Governed Learning Integration Adapter Test Suite', () => {
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

  it('2. DraftObservation Command Envelope & Execution Mapping (DRAFT_OBSERVATION_MAPPING)', async () => {
    const adapter = new DefaultGovernedLearningIntegrationAdapter();
    const result = await adapter.draftObservation(sampleFindingInput);

    assert.strictEqual(result.ok, true, 'Drafting observation should succeed');
    assert.strictEqual(result.category, 'SUCCESS');
    assert.ok(result.commandId.startsWith('cmd_becc_'));
    assert.ok(result.data, 'Result data must be populated');
  });

  it('3. AttachEvidence Command Mapping (ATTACH_EVIDENCE_MAPPING)', async () => {
    const adapter = new DefaultGovernedLearningIntegrationAdapter();
    const draftRes = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(draftRes.ok, true);

    const attachRes = await adapter.attachEvidence(sampleFindingInput, 'obs_test_001');
    assert.strictEqual(attachRes.ok, true);
    assert.strictEqual(attachRes.category, 'SUCCESS');
  });

  it('4. SubmitObservation Command Mapping (SUBMIT_OBSERVATION_MAPPING)', async () => {
    const adapter = new DefaultGovernedLearningIntegrationAdapter();
    const submitRes = await adapter.submitObservation(sampleFindingInput, 'obs_test_001');
    assert.strictEqual(submitRes.ok, true);
    assert.strictEqual(submitRes.category, 'SUCCESS');
  });

  it('5. Missing Authority Context Fails Closed (MISSING_AUTHORITY_FAILS_CLOSED)', async () => {
    const adapter = new DefaultGovernedLearningIntegrationAdapter();
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

  it('6. Governed Learning Stage 8 Idempotency Exact Retry Integration (RETRY_REUSES_COMMAND_ID)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    // First execution
    const res1 = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res1.category, 'SUCCESS');

    // Exact retry with identical commandId & payload
    const res2 = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.category, 'SUCCESS');
    assert.strictEqual(res2.commandId, res1.commandId, 'Retry must preserve exact deterministic commandId');
  });

  it('7. Changed Payload with Same Command ID Yields GL Invariant Refusal (CHANGED_IDENTITY_REFUSED)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    const res1 = await adapter.draftObservation(sampleFindingInput);
    assert.strictEqual(res1.ok, true);

    // Mismatched payload with same commandId
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
      issuedAt: new Date().toISOString(),
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      payload: mismatchedPayload,
    };

    const mismatchRes = await runtime.processAndExecuteCommandAsync(mismatchedEnvelope);

    assert.strictEqual(mismatchRes.ok, false);
    assert.strictEqual(mismatchRes.category, 'REFUSED');
    assert.strictEqual(mismatchRes.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
  });

  it('8. Boundary Verification: Zero Direct Database or Transaction Leakage (NO_DIRECT_DB_OR_TRANSACTION_LEAKAGE)', () => {
    const adapterServiceContent = readFileSync(
      join(process.cwd(), 'becc-runtime', 'governed-learning', 'governed-learning-adapter.service.ts'),
      'utf-8'
    );

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
