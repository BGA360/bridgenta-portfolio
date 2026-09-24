import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  GovernedLearningRuntime,
  InMemoryGovernanceRepository,
  createGovernedLearningRuntime,
  type ActorIdentityRef,
  type AuthorityContextRef,
  type GovernanceCommandEnvelope,
} from '@cep/governed-learning';
import {
  DefaultGovernedLearningIntegrationAdapter,
} from '../governed-learning/index.js';
import {
  GovernedGuidanceResolverService,
  type ResolvedGovernedGuidanceQueryInput,
} from '../knowledge/index.js';
import type { AssessmentContext } from '../shared/types.js';

describe('BECC v2 IMPL-013: Governed Guidance Knowledge Resolver Test Suite', () => {
  const validActorRef: ActorIdentityRef = {
    actorId: 'usr_architect_001',
    actorType: 'HUMAN',
  };

  const validAuthorityContextRef: AuthorityContextRef = {
    authorityId: 'auth_board_001',
  };

  const sampleAssessmentContext: AssessmentContext = {
    assessmentId: 'asm_001',
    project: 'PRJ-ALPHA',
    target: 'src/core/pipeline.ts',
    projectIdentity: {
      name: 'Alpha System',
      id: 'PRJ-ALPHA',
    },
    repositoryDetails: {
      remoteUri: 'https://github.com/org/alpha',
      branch: 'main',
      commitHash: 'abcdef1234567890',
      status: 'clean',
    },
    targetDocument: {
      path: 'docs/spec.md',
      hash: 'hash123',
    },
    projectType: 'TypeScript',
    lifecyclePhase: 'Active',
    publicationClassification: 'PUBLIC',
    runtimeMetadata: {
      env: 'test',
      os: 'windows',
      timestamp: '2026-09-24T10:00:00Z',
      processId: 1234,
    },
    traceabilityMetadata: {
      signature: 'sig_123',
    },
    creationTimestamp: '2026-09-24T10:00:00Z',
  };

  const createHelperCommandInput = (
    commandId: string,
    commandType: any,
    payload: any
  ): GovernanceCommandEnvelope => ({
    commandId,
    commandType,
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-24T10:00:00Z',
    actorRef: validActorRef,
    authorityContextRef: validAuthorityContextRef,
    payload,
  });

  it('1. Explicit Resolver Construction & Runtime Injection Required (EXPLICIT_GL_RUNTIME_INJECTION)', () => {
    assert.throws(
      () => new GovernedGuidanceResolverService(undefined as any),
      /GovernedLearningIntegrationAdapter instance is required/
    );
    assert.throws(
      () => new GovernedGuidanceResolverService({} as any),
      /GovernedLearningIntegrationAdapter instance is required/
    );

    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });
    assert.ok(resolver);
  });

  it('2. Empty Guidance Store Query returns SUCCESS with empty [] (BECC_EMPTY_GUIDANCE_RESULT)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    const input: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_empty_001',
      assessmentContext: sampleAssessmentContext,
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:00:00.000Z',
    };

    const res = await resolver.resolveGuidance(input);

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.category, 'SUCCESS');
    assert.strictEqual(res.source, 'GOVERNED_LEARNING');
    assert.strictEqual(res.queryId, 'q_empty_001');
    assert.strictEqual(res.guidanceItems.length, 0);
    assert.strictEqual(res.replayed, false);
    assert.ok(res.commandId.startsWith('cmd_becc_'));
  });

  it('3. Seeded Governed Learning Guidance is Returned Exactly via Resolver (BECC_APPLICABLE_GUIDANCE_RESULT)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    // 1. Create and approve lesson candidate in GL runtime
    const canCmd = createHelperCommandInput('cmd_can_seed_1', 'CreateLessonCandidate', {
      statement: 'Always enforce strict context bounds on GL guidance queries',
      rationale: 'Prevents unauthorized broad scope leakage',
      scope: { scopeType: 'SYSTEM_WIDE' },
      originatingObservationRefs: [],
    });
    await runtime.processAndExecuteCommandAsync(canCmd);

    const appCmd = createHelperCommandInput('cmd_app_seed_1', 'ApproveLesson', {
      candidateRef: { candidateId: 'can_cmd_can_seed_1' },
      decisionRef: { decisionId: 'dec_seed_1' },
    });
    await runtime.processAndExecuteCommandAsync(appCmd);

    // 2. Query guidance from BECC Knowledge Resolver
    const input: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_applicable_001',
      projectRef: { projectId: 'PRJ-ALPHA' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:01:00.000Z',
    };

    const res = await resolver.resolveGuidance(input);

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.category, 'SUCCESS');
    assert.strictEqual(res.guidanceItems.length, 1);

    const item = res.guidanceItems[0];
    assert.strictEqual(item.lessonRef.lessonId, 'lsn_cmd_can_seed_1');
    assert.strictEqual(item.statement, 'Always enforce strict context bounds on GL guidance queries');
    assert.strictEqual(item.rationale, 'Prevents unauthorized broad scope leakage');
    assert.strictEqual(item.scope.scopeType, 'SYSTEM_WIDE');
    assert.ok(res.evaluatedAt);
  });

  it('4. GL Infrastructure Read Error Fails Closed with ERROR (BECC_GL_ERROR_FAILS_CLOSED)', async () => {
    const failingRepo = {
      saveObservation: () => ({ ok: true, category: 'SUCCESS', data: {} }),
      getObservationByRef: () => ({ ok: true, category: 'SUCCESS', data: {} }),
      saveLesson: () => ({ ok: true, category: 'SUCCESS', data: {} }),
      getLessonByRef: () => ({ ok: true, category: 'SUCCESS', data: {} }),
      saveRuleCandidate: () => ({ ok: true, category: 'SUCCESS', data: {} }),
      appendEvent: () => ({ ok: true, category: 'SUCCESS', data: {} }),
      getEvents: () => ({ ok: true, category: 'SUCCESS', data: [] }),
      getLessons() {
        return {
          ok: false as const,
          category: 'ERROR' as const,
          error: new Error('Durable PostgreSQL storage offline'),
        };
      },
    };

    const runtime = createGovernedLearningRuntime({ persistencePort: failingRepo as any });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    const input: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_fail_001',
      projectRef: { projectId: 'PRJ-ALPHA' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:02:00.000Z',
    };

    const res = await resolver.resolveGuidance(input);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'ERROR');
    assert.strictEqual(res.guidanceItems.length, 0);
    assert.match(res.errorDetails ?? '', /Durable PostgreSQL storage offline/);
  });

  it('5. GL Refusal is Propagated with Refusal Code (BECC_GL_REFUSAL_PROPAGATION)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    // Send query without authorityContextRef
    const invalidInput: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_refused_001',
      projectRef: { projectId: 'PRJ-ALPHA' },
      actorRef: validActorRef,
      authorityContextRef: undefined,
      issuedAt: '2026-09-24T10:03:00.000Z',
    };

    const res = await resolver.resolveGuidance(invalidInput);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED');
    assert.strictEqual(res.guidanceItems.length, 0);
  });

  it('6. Unmapped BECC Context Fails Closed without Broadening Scope (UNKNOWN_BECC_CONTEXT_BROADENS_SCOPE: NO)', async () => {
    const runtime = new GovernedLearningRuntime();
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    // Input with no projectRef, no workstreamRef, and empty assessmentContext project
    const unmappedInput: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_unmapped_001',
      assessmentContext: {
        ...sampleAssessmentContext,
        project: '',
        projectIdentity: { name: '', id: '' },
      },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:04:00.000Z',
    };

    const res = await resolver.resolveGuidance(unmappedInput);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.category, 'REFUSED');
    assert.strictEqual(res.refusalCode, 'REFUSAL_INVARIANT_VIOLATION');
    assert.match(res.reason ?? '', /unambiguous TargetRef/);
    assert.strictEqual(res.guidanceItems.length, 0);
  });

  it('7. Query Replay Signal is Preserved Across Retries (BECC_QUERY_REPLAY_PRESERVED)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    const input: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_replay_100',
      projectRef: { projectId: 'PRJ-REPLAY' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:05:00.000Z',
    };

    // First resolution -> fresh
    const res1 = await resolver.resolveGuidance(input);
    assert.strictEqual(res1.ok, true);
    assert.strictEqual(res1.replayed, false);

    // Second resolution with exact same input -> replayed
    const res2 = await resolver.resolveGuidance(input);
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.replayed, true);
    assert.strictEqual(res1.commandId, res2.commandId);
  });

  it('8. Freshness Model: Same commandId replays prior result, new commandId reads new state (BECC_GUIDANCE_FRESHNESS_MODEL)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    // 1. Initial State S1: Seed Lesson A
    const canCmdA = createHelperCommandInput('cmd_fresh_can_a', 'CreateLessonCandidate', {
      statement: 'Freshness Lesson A',
      rationale: 'Rationale A',
      scope: { scopeType: 'SYSTEM_WIDE' },
      originatingObservationRefs: [],
    });
    await runtime.processAndExecuteCommandAsync(canCmdA);
    const appCmdA = createHelperCommandInput('cmd_fresh_app_a', 'ApproveLesson', {
      candidateRef: { candidateId: 'can_cmd_fresh_can_a' },
      decisionRef: { decisionId: 'dec_fresh_a' },
    });
    await runtime.processAndExecuteCommandAsync(appCmdA);

    // Query Q1 with commandId = C1
    const inputQ1: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_fresh_c1',
      projectRef: { projectId: 'PRJ-FRESH' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:06:00.000Z',
    };
    const resQ1 = await resolver.resolveGuidance(inputQ1);
    assert.strictEqual(resQ1.ok, true);
    assert.strictEqual(resQ1.replayed, false);
    assert.strictEqual(resQ1.guidanceItems.length, 1);

    // 2. Transition to State S2: Seed Lesson B
    const canCmdB = createHelperCommandInput('cmd_fresh_can_b', 'CreateLessonCandidate', {
      statement: 'Freshness Lesson B',
      rationale: 'Rationale B',
      scope: { scopeType: 'SYSTEM_WIDE' },
      originatingObservationRefs: [],
    });
    await runtime.processAndExecuteCommandAsync(canCmdB);
    const appCmdB = createHelperCommandInput('cmd_fresh_app_b', 'ApproveLesson', {
      candidateRef: { candidateId: 'can_cmd_fresh_can_b' },
      decisionRef: { decisionId: 'dec_fresh_b' },
    });
    await runtime.processAndExecuteCommandAsync(appCmdB);

    // Retry query Q1 -> MUST replay original 1-item result
    const resQ1Retry = await resolver.resolveGuidance(inputQ1);
    assert.strictEqual(resQ1Retry.ok, true);
    assert.strictEqual(resQ1Retry.replayed, true);
    assert.strictEqual(resQ1Retry.guidanceItems.length, 1);

    // Execute new query Q2 -> MUST evaluate new state and return 2 items
    const inputQ2: ResolvedGovernedGuidanceQueryInput = {
      queryId: 'q_fresh_c2',
      projectRef: { projectId: 'PRJ-FRESH' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:07:00.000Z',
    };
    const resQ2 = await resolver.resolveGuidance(inputQ2);
    assert.strictEqual(resQ2.ok, true);
    assert.strictEqual(resQ2.replayed, false);
    assert.strictEqual(resQ2.guidanceItems.length, 2);
  });

  it('9. Cross-Project Guidance Isolation (BECC_CROSS_PROJECT_GUIDANCE_ISOLATION)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    // Seed Lesson adopted for Project ALPHA
    repo.saveLesson({
      lessonId: 'lsn_alpha_only',
      lessonRef: { lessonId: 'lsn_alpha_only', version: '1.0.0' },
      statement: 'Project ALPHA specific guidance',
      rationale: 'Adopted for PRJ-ALPHA',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      adoptedByProjectRef: { projectId: 'PRJ-ALPHA' },
      publishedAt: '2026-09-20T10:00:00Z',
    });

    // Seed Lesson adopted for Project BETA
    repo.saveLesson({
      lessonId: 'lsn_beta_only',
      lessonRef: { lessonId: 'lsn_beta_only', version: '1.0.0' },
      statement: 'Project BETA specific guidance',
      rationale: 'Adopted for PRJ-BETA',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      adoptedByProjectRef: { projectId: 'PRJ-BETA' },
      publishedAt: '2026-09-21T10:00:00Z',
    });

    // Query for Project ALPHA
    const resAlpha = await resolver.resolveGuidance({
      queryId: 'q_prj_alpha',
      projectRef: { projectId: 'PRJ-ALPHA' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:08:00.000Z',
    });
    assert.strictEqual(resAlpha.ok, true);
    assert.strictEqual(resAlpha.guidanceItems.length, 1);
    assert.strictEqual(resAlpha.guidanceItems[0].lessonRef.lessonId, 'lsn_alpha_only');

    // Query for Project BETA
    const resBeta = await resolver.resolveGuidance({
      queryId: 'q_prj_beta',
      projectRef: { projectId: 'PRJ-BETA' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:09:00.000Z',
    });
    assert.strictEqual(resBeta.ok, true);
    assert.strictEqual(resBeta.guidanceItems.length, 1);
    assert.strictEqual(resBeta.guidanceItems[0].lessonRef.lessonId, 'lsn_beta_only');
  });

  it('10. Cross-Workstream Guidance Isolation (BECC_CROSS_WORKSTREAM_GUIDANCE_ISOLATION)', async () => {
    const repo = new InMemoryGovernanceRepository();
    const runtime = createGovernedLearningRuntime({ persistencePort: repo });
    const adapter = new DefaultGovernedLearningIntegrationAdapter({ runtime });
    const resolver = new GovernedGuidanceResolverService({ adapter });

    // Seed Lesson adopted for Workstream WS-1
    repo.saveLesson({
      lessonId: 'lsn_ws1_only',
      lessonRef: { lessonId: 'lsn_ws1_only', version: '1.0.0' },
      statement: 'Workstream 1 guidance',
      rationale: 'Adopted for WS-1',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      adoptedByWorkstreamRef: { workstreamId: 'WS-1' },
      publishedAt: '2026-09-20T10:00:00Z',
    });

    const resWS1 = await resolver.resolveGuidance({
      queryId: 'q_ws1',
      workstreamRef: { workstreamId: 'WS-1' },
      actorRef: validActorRef,
      authorityContextRef: validAuthorityContextRef,
      issuedAt: '2026-09-24T10:10:00.000Z',
    });

    assert.strictEqual(resWS1.ok, true);
    assert.strictEqual(resWS1.guidanceItems.length, 1);
    assert.strictEqual(resWS1.guidanceItems[0].lessonRef.lessonId, 'lsn_ws1_only');
  });

  it('11. Static Boundary Check: No Direct Database Imports in BECC Production Code (BECC_GUIDANCE_DB_BOUNDARY_TEST)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const beccRoot = __dirname.includes(path.sep + 'dist')
      ? path.resolve(__dirname, '../../')
      : path.resolve(__dirname, '../');

    const targetFiles = [
      path.resolve(beccRoot, 'knowledge/governed-guidance-resolver.service.ts'),
      path.resolve(beccRoot, 'knowledge/governed-guidance-resolver.types.ts'),
      path.resolve(beccRoot, 'governed-learning/governed-learning-adapter.service.ts'),
      path.resolve(beccRoot, 'governed-learning/governed-learning-adapter.types.ts'),
    ];

    const forbiddenPatterns = [
      /PostgresGovernanceRepository/,
      /SqliteGovernanceRepository/,
      /PostgresDatabaseManager/,
      /SqliteDatabaseManager/,
      /TransactionContext/,
      /PoolClient/,
      /governance_events/,
      /SELECT .* FROM lessons/i,
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

  it('12. Static Boundary Check: BECC Imports Only GL Public Surface (BECC_GL_PUBLIC_IMPORT_BOUNDARY_TEST)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const beccRoot = __dirname.includes(path.sep + 'dist')
      ? path.resolve(__dirname, '../../')
      : path.resolve(__dirname, '../');

    const targetFiles = [
      path.resolve(beccRoot, 'knowledge/governed-guidance-resolver.service.ts'),
      path.resolve(beccRoot, 'knowledge/governed-guidance-resolver.types.ts'),
      path.resolve(beccRoot, 'governed-learning/governed-learning-adapter.service.ts'),
      path.resolve(beccRoot, 'governed-learning/governed-learning-adapter.types.ts'),
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

  it('13. Static Boundary Check: No Status-Based Guidance Filtering in BECC (BECC_STATUS_BASED_GUIDANCE_FILTERING: NO)', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const beccRoot = __dirname.includes(path.sep + 'dist')
      ? path.resolve(__dirname, '../../')
      : path.resolve(__dirname, '../');

    const targetFiles = [
      path.resolve(beccRoot, 'knowledge/governed-guidance-resolver.service.ts'),
    ];

    const statusFilterPatterns = [
      /\.filter\(.*PUBLISHED.*\)/,
      /\.filter\(.*ADOPTED.*\)/,
      /\.filter\(.*REJECTED.*\)/,
      /\.filter\(.*SUPERSEDED.*\)/,
      /\.filter\(.*RETIRED.*\)/,
    ];

    for (const filePath of targetFiles) {
      const content = readFileSync(filePath, 'utf-8');
      for (const pattern of statusFilterPatterns) {
        assert.strictEqual(
          pattern.test(content),
          false,
          `File ${path.basename(filePath)} violates status-based filtering rule by matching ${pattern}`
        );
      }
    }
  });
});
