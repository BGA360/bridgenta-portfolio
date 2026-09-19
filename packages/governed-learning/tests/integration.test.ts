import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGovernedLearningRuntime,
  GovernedLearningRuntime,
  CommandPayloadSchemaRegistry,
  EventPayloadSchemaRegistry,
  InMemoryGovernanceRepository,
  HistoricalReplayEngine,
} from '../src/index.js';
import type { GovernanceCommandEnvelope } from '../src/index.js';

describe('Governed Learning Wave 9 Runtime Composition & Public Exports (GL-IMPL-UNIT-009)', () => {
  const baseEnvelope: GovernanceCommandEnvelope = {
    commandId: 'cmd_w9_integration_001',
    commandType: 'DraftObservation',
    issuedAt: '2026-09-19T10:00:00.000Z',
    payloadVersion: '1.0.0',
    actorRef: { actorId: 'usr_steward_01', actorType: 'HUMAN' },
    authorityContextRef: { authorityId: 'ctx_steward_01' },
  };

  it('W9-I-001 — Runtime Composition connects pipeline, dispatcher, and bounded handlers end-to-end', () => {
    const runtime = createGovernedLearningRuntime();
    assert.ok(runtime instanceof GovernedLearningRuntime);

    const validDraftInput = {
      ...baseEnvelope,
      commandType: 'DraftObservation',
      payload: {
        category: 'MECHANICAL',
        statement: 'End-to-end system test statement',
      },
    };

    const res = runtime.processAndExecuteCommand(validDraftInput);
    assert.equal(res.ok, true);
    assert.equal(res.pipelineReport.ok, true);
    assert.equal(res.pipelineReport.currentStage, 'DISPATCH_ROUTER');
    assert.equal(res.handlerOutcome?.ok, true);
    if (res.handlerOutcome?.ok && res.handlerOutcome.category === 'SUCCESS') {
      const data = res.handlerOutcome.data as any;
      assert.equal(data.state, 'DRAFT');
      assert.equal(data.observationCategory, 'MECHANICAL');
    }
  });

  it('W9-I-002 — Public Package Export exposes top-level composition without deep-import requirements', () => {
    assert.ok(createGovernedLearningRuntime);
    assert.ok(GovernedLearningRuntime);
    assert.ok(CommandPayloadSchemaRegistry);
    assert.ok(EventPayloadSchemaRegistry);
    assert.ok(InMemoryGovernanceRepository);
    assert.ok(HistoricalReplayEngine);

    const runtime = createGovernedLearningRuntime();
    assert.equal(typeof runtime.processAndExecuteCommand, 'function');
  });

  it('W9-I-003 — Canonical Lifecycle semantics survive top-level runtime composition', () => {
    const runtime = createGovernedLearningRuntime();

    // 1. Submit Candidate for Review
    const submitInput = {
      ...baseEnvelope,
      commandId: 'cmd_w9_integration_002',
      commandType: 'SubmitLessonForReview',
      payload: {
        candidateRef: { candidateId: 'can_wave9_1001' },
      },
    };
    const submitRes = runtime.processAndExecuteCommand(submitInput);
    assert.equal(submitRes.ok, true);
    if (submitRes.handlerOutcome?.ok && submitRes.handlerOutcome.category === 'SUCCESS') {
      const data = submitRes.handlerOutcome.data as any;
      assert.equal(data.candidateId, 'can_wave9_1001');
      assert.equal(data.state, 'IN_REVIEW');
    }

    // 2. Candidate Approval yields published LessonRecord (status: PUBLISHED, nonBinding: true, candidateRef preserved)
    const approveInput = {
      ...baseEnvelope,
      commandId: 'cmd_w9_integration_003',
      commandType: 'ApproveLesson',
      payload: {
        candidateRef: { candidateId: 'can_wave9_1001' },
        decisionRef: { decisionId: 'dec_wave9_2001' },
      },
    };
    const approveRes = runtime.processAndExecuteCommand(approveInput);
    assert.equal(approveRes.ok, true);
    if (approveRes.handlerOutcome?.ok && approveRes.handlerOutcome.category === 'SUCCESS') {
      const data = approveRes.handlerOutcome.data as any;
      assert.equal(data.status, 'PUBLISHED');
      assert.equal(data.nonBinding, true);
      assert.equal(data.prospectiveOnly, undefined);
      assert.notEqual(data.lessonId, 'can_wave9_1001');
      assert.equal(data.candidateRef.candidateId, 'can_wave9_1001');
    }

    // 3. Rule Candidate Prospective Adoption targets proposalRef and yields ProspectiveAdoptionRecord
    const adoptInput = {
      ...baseEnvelope,
      commandId: 'cmd_w9_integration_004',
      commandType: 'AdoptLesson',
      payload: {
        proposalRef: { proposalId: 'prop_wave9_3001' },
        targetProjectRef: { projectId: 'prj_wave9_alpha' },
        decisionRef: { decisionId: 'dec_wave9_2002' },
      },
    };
    const adoptRes = runtime.processAndExecuteCommand(adoptInput);
    assert.equal(adoptRes.ok, true);
    if (adoptRes.handlerOutcome?.ok && adoptRes.handlerOutcome.category === 'SUCCESS') {
      const data = adoptRes.handlerOutcome.data as any;
      assert.equal(data.status, 'ADOPTED');
      assert.equal(data.proposalRef.proposalId, 'prop_wave9_3001');
      assert.equal(data.targetProjectRef.projectId, 'prj_wave9_alpha');
      assert.ok(data.adoptionId);
    }
  });

  it('W9-I-004 — Malformed commands fail closed at pipeline stage 1 before handler invocation', () => {
    const runtime = createGovernedLearningRuntime();
    const invalidEnvelopeInput = {
      commandType: 'DraftObservation',
      // missing required commandId, issuedAt, actorRef, payloadVersion
      payload: { category: 'MECHANICAL', statement: 'Statement' },
    };

    const res = runtime.processAndExecuteCommand(invalidEnvelopeInput);
    assert.equal(res.ok, false);
    assert.equal(res.pipelineReport.ok, false);
    assert.equal(res.pipelineReport.currentStage, 'ENVELOPE_STRUCTURAL_PARSE');
    assert.equal(res.handlerOutcome, undefined);
  });
});
