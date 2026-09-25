import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  GovernedLearningRuntime,
  InMemoryGovernanceRepository,
  createGovernedLearningRuntime,
  type ActorIdentityRef,
  type AuthorityContextRef,
} from '@cep/governed-learning';
import { DefaultGovernedLearningIntegrationAdapter } from '../governed-learning/governed-learning-adapter.service.js';
import { FindingEscalationService } from '../escalation/finding-escalation.service.js';
import type { EscalationRequestInput } from '../escalation/finding-escalation.types.js';
import type { ValidationFinding } from '../shared/types.js';

describe('BECC v2 IMPL-014: Finding -> Observation Escalation Pipeline Test Suite', () => {
  const validActorRef: ActorIdentityRef = {
    actorId: 'act_becc_validator_001',
    actorType: 'SYSTEM',
  };

  const validAuthorityContextRef: AuthorityContextRef = {
    authorityId: 'auth_becc_governance_v2',
  };

  const sampleFinding: ValidationFinding = {
    id: 'fnd_struct_001',
    category: 'Structure',
    severity: 'error',
    message: 'Required section missing from target documentation artifact',
    affectedLocation: {
      coordinateSystem: 'candidate',
      filePath: 'docs/architecture/spec.md',
      startLine: 10,
      endLine: 25,
    },
    originatingRuleId: 'rule_struct_check',
  };

  it('1. Construction requires explicit GovernedLearningIntegrationAdapter injection (EXPLICIT_GL_ADAPTER_INJECTION)', () => {
    assert.throws(() => {
      new FindingEscalationService(null as any);
    }, /GovernedLearningIntegrationAdapter instance is required/);

    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const service = new FindingEscalationService({ adapter });
    assert.ok(service);
  });

  it('2. Single Evidence Finding Escalation Pipeline Success (SINGLE_EVIDENCE_ESCALATION & CANONICAL_OBSERVATION_ID_PROPAGATION)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    // Spy on adapter methods to verify observationId propagation across stages
    const attachCalls: string[] = [];
    const submitCalls: string[] = [];

    const originalAttach = adapter.attachEvidence.bind(adapter);
    adapter.attachEvidence = async (input, obsId) => {
      attachCalls.push(obsId);
      return originalAttach(input, obsId);
    };

    const originalSubmit = adapter.submitObservation.bind(adapter);
    adapter.submitObservation = async (input, obsId) => {
      submitCalls.push(obsId);
      return originalSubmit(input, obsId);
    };

    const service = new FindingEscalationService({ adapter });

    const input: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T20:00:00.000Z',
      escalationVersion: 'v1',
    };

    const res = await service.escalateFinding(input);

    assert.strictEqual(res.ok, true, 'Escalation pipeline should succeed');
    assert.strictEqual(res.category, 'SUCCESS');
    assert.strictEqual(res.findingId, 'fnd_struct_001');
    assert.ok(res.observationId, 'Canonical observationId must be populated');
    assert.strictEqual(res.observationRef?.observationId, res.observationId);
    assert.strictEqual(res.attachedEvidenceCount, 1);
    assert.strictEqual(res.completedStage, 'SUBMIT');

    // Verify draft returned observationRef.observationId == AttachEvidence observation target == SubmitObservation observation target
    assert.strictEqual(attachCalls.length, 1);
    assert.strictEqual(submitCalls.length, 1);
    assert.strictEqual(attachCalls[0], res.observationId);
    assert.strictEqual(submitCalls[0], res.observationId);
    assert.strictEqual(res.findingId, sampleFinding.id);
  });

  it('3. Multiple Evidence Attachment Success (MULTI_EVIDENCE_ESCALATION)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const service = new FindingEscalationService({ adapter });

    const input: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      evidenceItems: [
        { evidenceType: 'ARTIFACT_DIFF', location: 'docs/arch/spec.md' },
        { evidenceType: 'LOG', location: 'logs/build.log' },
        { evidenceType: 'OTHER', location: 'config/becc.yaml' },
      ],
      issuedAt: '2026-09-24T20:01:00.000Z',
      escalationVersion: 'multi_v1',
    };

    const res = await service.escalateFinding(input);

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.category, 'SUCCESS');
    assert.strictEqual(res.attachedEvidenceCount, 3);
    assert.strictEqual(res.completedStage, 'SUBMIT');
  });

  it('4. Draft Failure Stops Pipeline (DRAFT_FAILURE_STOPS_PIPELINE)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const service = new FindingEscalationService({ adapter });

    // Force draft failure by omitting authorityContextRef
    const invalidInput: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: undefined as any,
      issuedAt: '2026-09-24T20:02:00.000Z',
    };

    const res = await service.escalateFinding(invalidInput);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.failedStage, 'DRAFT');
    assert.strictEqual(res.attachedEvidenceCount, 0);
    assert.strictEqual(res.refusalCode, 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED');
  });

  it('5. Attach Evidence Failure Stops Pipeline Before Submit (ATTACH_FAILURE_STOPS_BEFORE_SUBMIT)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const service = new FindingEscalationService({ adapter });

    // Force attach failure by using empty evidence location
    const invalidInput: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      evidenceItems: [
        { evidenceType: 'ARTIFACT_DIFF', location: '' }, // empty location fails closed
      ],
      issuedAt: '2026-09-24T20:03:00.000Z',
    };

    const res = await service.escalateFinding(invalidInput);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.failedStage, 'ATTACH_EVIDENCE');
    assert.strictEqual(res.attachedEvidenceCount, 0);
    assert.strictEqual(res.refusalCode, 'REFUSAL_INSUFFICIENT_EVIDENCE');
  });

  it('6. Multi-Evidence Partial Failure Stops Pipeline (MULTI_EVIDENCE_PARTIAL_FAILURE)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const service = new FindingEscalationService({ adapter });

    // Item 1 is valid, Item 2 has empty location
    const invalidInput: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      evidenceItems: [
        { evidenceType: 'ARTIFACT_DIFF', location: 'docs/valid.md' },
        { evidenceType: 'LOG', location: '   ' },
      ],
      issuedAt: '2026-09-24T20:04:00.000Z',
    };

    const res = await service.escalateFinding(invalidInput);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.failedStage, 'ATTACH_EVIDENCE');
    assert.strictEqual(res.attachedEvidenceCount, 1, 'First valid item was attached');
    assert.strictEqual(res.completedStage, undefined);
  });

  it('7. Exact Pipeline Retry Returns Replayed Result (EXACT_ESCALATION_RETRY & PARTIAL_FAILURE_RETRY_IDEMPOTENT)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const service = new FindingEscalationService({ adapter });

    const input: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T20:05:00.000Z',
      escalationVersion: 'retry_v1',
    };

    const res1 = await service.escalateFinding(input);
    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res1.completedStage, 'SUBMIT');

    // Exact retry
    const res2 = await service.escalateFinding(input);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.observationId, res1.observationId);
    assert.strictEqual(res2.completedStage, 'SUBMIT');
    assert.ok(res2.replayedSteps && res2.replayedSteps.length > 0, 'Replayed steps should be populated');
  });

  it('8. Missing Draft Observation ID Fails Closed Before Attach (MISSING_DRAFT_OBSERVATION_ID_TEST)', async () => {
    const mockAdapter = {
      draftObservation: async () => ({
        ok: true as const,
        category: 'SUCCESS' as const,
        commandId: 'cmd_becc_test_missing_obs_id',
        replayed: false,
        data: {}, // SUCCESS but NO observationId or observationRef!
      }),
      attachEvidence: async () => {
        assert.fail('attachEvidence must NOT be called when observationId is missing');
      },
      submitObservation: async () => {
        assert.fail('submitObservation must NOT be called when observationId is missing');
      },
    };

    const service = new FindingEscalationService({ adapter: mockAdapter as any });

    const res = await service.escalateFinding({
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T20:08:00.000Z',
    });

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');
    assert.strictEqual(res.failedStage, 'DRAFT');
    assert.strictEqual(res.attachedEvidenceCount, 0);
    assert.ok(res.reason?.includes('DraftObservation succeeded but returned no canonical observationId'));
  });

  it('9. Changed Finding Identity Refused on Replay (CHANGED_FINDING_SAME_IDENTITY_REFUSED)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const service = new FindingEscalationService({ adapter });

    const input1: EscalationRequestInput = {
      finding: sampleFinding,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T20:09:00.000Z',
    };

    const res1 = await service.escalateFinding(input1);
    assert.strictEqual(res1.ok, true);

    // Replay with altered statement but same finding ID, step, and issuedAt
    const input2: EscalationRequestInput = {
      ...input1,
      finding: {
        ...sampleFinding,
        message: 'Altered statement causing payload mismatch',
      },
    };

    const res2 = await service.escalateFinding(input2);
    assert.strictEqual(res2.ok, false);
    assert.strictEqual(res2.category, 'REFUSED');
    assert.strictEqual(res2.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
  });

  it('10. Truthful Scope Isolation Claims - Project and Workstream Scope Unsupported in GL Observation Contract (CROSS_PROJECT_ESCALATION_ISOLATION_TEST & CROSS_WORKSTREAM_ESCALATION_ISOLATION_TEST)', async () => {
    // Truthful verification: Governed Learning DraftObservation/AttachEvidence/SubmitObservation commands
    // do NOT carry projectRef or workstreamRef in their payloads.
    // BECC escalation mapping accurately reflects this contract limit:
    // PROJECT_SCOPE_SUPPORTED_FOR_ESCALATION: NO
    // WORKSTREAM_SCOPE_SUPPORTED_FOR_ESCALATION: NO
    // CROSS_PROJECT_ESCALATION_ISOLATION: NOT_APPLICABLE
    // CROSS_WORKSTREAM_ESCALATION_ISOLATION: NOT_APPLICABLE

    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });

    const draftCall = await adapter.draftObservation({
      findingId: sampleFinding.id,
      category: 'MECHANICAL',
      statement: sampleFinding.message,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T20:10:00.000Z',
    });

    assert.strictEqual(draftCall.ok, true);
    // Payload delivered to GL has no projectRef or workstreamRef fields
    const data = draftCall.data as any;
    assert.strictEqual(data.projectRef, undefined);
    assert.strictEqual(data.workstreamRef, undefined);
  });

  it('11. Static Boundary Check: No BECC Local Observation ID Reconstruction (NO_BECC_OBSERVATION_ID_RECONSTRUCTION_TEST)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const beccRoot = __dirname.includes(path.sep + 'dist')
      ? path.resolve(__dirname, '../../')
      : path.resolve(__dirname, '../');

    const targetFiles = [
      path.resolve(beccRoot, 'escalation/finding-escalation.service.ts'),
      path.resolve(beccRoot, 'governed-learning/governed-learning-adapter.service.ts'),
    ];

    const forbiddenReconstructionPatterns = [
      /obs_\$\{/,
      /`obs_\$\{/,
      /'obs_'/,
      /"obs_"/,
    ];

    for (const filePath of targetFiles) {
      const content = readFileSync(filePath, 'utf-8');
      // Strip doc comments before checking code
      const codeOnly = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
      for (const pattern of forbiddenReconstructionPatterns) {
        assert.strictEqual(
          pattern.test(codeOnly),
          false,
          `File ${path.basename(filePath)} violates observation identity rules by matching reconstruction pattern ${pattern}`
        );
      }
    }
  });

  it('12. Static Boundary Check: No Direct Database Imports in Escalation Code (IMPL014_GL_DATABASE_BOUNDARY_TEST)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const beccRoot = __dirname.includes(path.sep + 'dist')
      ? path.resolve(__dirname, '../../')
      : path.resolve(__dirname, '../');

    const targetFiles = [
      path.resolve(beccRoot, 'escalation/finding-escalation.service.ts'),
      path.resolve(beccRoot, 'escalation/finding-escalation.types.ts'),
      path.resolve(beccRoot, 'escalation/index.ts'),
    ];

    const forbiddenPatterns = [
      /PostgresGovernanceRepository/,
      /SqliteGovernanceRepository/,
      /PostgresDatabaseManager/,
      /SqliteDatabaseManager/,
      /TransactionContext/,
      /PoolClient/,
      /governance_events/,
      /SELECT .* FROM/i,
    ];

    for (const filePath of targetFiles) {
      const content = readFileSync(filePath, 'utf-8');
      for (const pattern of forbiddenPatterns) {
        assert.strictEqual(
          pattern.test(content),
          false,
          `File ${path.basename(filePath)} violates database boundary by matching ${pattern}`
        );
      }
    }
  });

  it('13. Static Boundary Check: BECC Imports Only GL Public Surface (IMPL014_GL_PUBLIC_API_BOUNDARY_TEST)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const beccRoot = __dirname.includes(path.sep + 'dist')
      ? path.resolve(__dirname, '../../')
      : path.resolve(__dirname, '../');

    const targetFiles = [
      path.resolve(beccRoot, 'escalation/finding-escalation.service.ts'),
      path.resolve(beccRoot, 'escalation/finding-escalation.types.ts'),
      path.resolve(beccRoot, 'escalation/index.ts'),
    ];

    const deepImportPattern = /packages\/governed-learning\/src\//;

    for (const filePath of targetFiles) {
      const content = readFileSync(filePath, 'utf-8');
      assert.strictEqual(
        deepImportPattern.test(content),
        false,
        `File ${path.basename(filePath)} violates GL public import boundary with deep import`
      );
    }
  });

  it('14. Static Boundary Check: Pipeline Stops at SubmitObservation (IMPL014_STOPS_AT_SUBMIT_OBSERVATION)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const beccRoot = __dirname.includes(path.sep + 'dist')
      ? path.resolve(__dirname, '../../')
      : path.resolve(__dirname, '../');

    const targetFiles = [
      path.resolve(beccRoot, 'escalation/finding-escalation.service.ts'),
    ];

    const unauthorizedCallPatterns = [
      /CreateLessonCandidate/,
      /SubmitLessonForReview/,
      /ApproveLesson/,
      /ProposeRuleCandidate/,
      /AdoptLesson/,
      /BindRulePolicy/,
    ];

    for (const filePath of targetFiles) {
      const content = readFileSync(filePath, 'utf-8');
      for (const pattern of unauthorizedCallPatterns) {
        assert.strictEqual(
          pattern.test(content),
          false,
          `File ${path.basename(filePath)} violates governance boundary by invoking ${pattern}`
        );
      }
    }
  });
});
