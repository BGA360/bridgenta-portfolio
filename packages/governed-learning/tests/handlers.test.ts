import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { GovernanceCommandEnvelope } from '../src/contracts/envelopes.js';
import {
  executeGovernedCommandHandler,
  handleDraftObservationCommand,
  handleAttachEvidenceCommand,
  handleSubmitObservationCommand,
  handleValidateMechanicalObservationCommand,
  handleRecordInterpretiveValidationCommand,
  handleCreateLessonCandidateCommand,
  handleSubmitLessonForReviewCommand,
  handleInvalidateLessonCandidateCommand,
  handleApproveLessonCommand,
  handleRejectLessonCommand,
  handleRequestLessonRevisionCommand,
  handleSupersedeLessonCommand,
  handleRetireLessonCommand,
  handleAdoptLessonCommand,
  handleProposeRuleCandidateCommand,
  handleBuildGuidanceSetQueryCommand,
} from '../src/runtime/handlers.js';

describe('Governed Learning Runtime Wave 4 Command Handlers', () => {
  const baseEnvelope: GovernanceCommandEnvelope = {
    commandId: 'cmd_wave4_test_001',
    commandType: 'DraftObservation',
    issuedAt: '2026-09-13T16:00:00.000Z',
    payloadVersion: '1.0.0',
    actorRef: { actorId: 'usr_steward_01', actorType: 'HUMAN' },
    authorityContextRef: { authorityId: 'ctx_steward_01' },
  };

  it('handleDraftObservationCommand creates draft observation intent', () => {
    const payload = { category: 'MECHANICAL' as const, statement: 'System latency exceeded threshold' };
    const res = handleDraftObservationCommand({ envelope: baseEnvelope, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.state, 'DRAFT');
      assert.equal(data.observationCategory, 'MECHANICAL');
      assert.equal(data.statement, 'System latency exceeded threshold');
      assert.equal(data.actorId, 'usr_steward_01');
    }
  });

  it('handleAttachEvidenceCommand attaches evidence reference', () => {
    const env = { ...baseEnvelope, commandType: 'AttachEvidence' as const };
    const payload = {
      observationRef: { observationId: 'obs_1001' },
      evidenceType: 'LOG' as const,
      location: 's3://logs/latency.log',
    };
    const res = handleAttachEvidenceCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.state, 'EVIDENCE_ATTACHED');
      assert.equal(data.observationId, 'obs_1001');
      assert.equal(data.location, 's3://logs/latency.log');
    }
  });

  it('handleSubmitObservationCommand transitions observation to SUBMITTED', () => {
    const env = { ...baseEnvelope, commandType: 'SubmitObservation' as const };
    const payload = { observationRef: { observationId: 'obs_1001' } };
    const res = handleSubmitObservationCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.state, 'SUBMITTED');
      assert.equal(data.observationId, 'obs_1001');
    }
  });

  it('handleValidateMechanicalObservationCommand distinguishes mechanical validation', () => {
    const env = { ...baseEnvelope, commandType: 'ValidateMechanicalObservation' as const };
    const payload = {
      observationRef: { observationId: 'obs_1001' },
      verdict: 'VALIDATED' as const,
    };
    const res = handleValidateMechanicalObservationCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.validationType, 'MECHANICAL');
      assert.equal(data.verdict, 'VALIDATED');
      assert.equal(data.state, 'MECHANICALLY_VALIDATED');
    }
  });

  it('handleRecordInterpretiveValidationCommand records decisionRef with interpretive validation', () => {
    const env = { ...baseEnvelope, commandType: 'RecordInterpretiveValidation' as const };
    const payload = {
      observationRef: { observationId: 'obs_1001' },
      verdict: 'VALIDATED' as const,
      decisionRef: { decisionId: 'dec_2001' },
    };
    const res = handleRecordInterpretiveValidationCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.validationType, 'INTERPRETIVE');
      assert.equal(data.decisionId, 'dec_2001');
      assert.equal(data.state, 'INTERPRETIVELY_VALIDATED');
    }
  });

  it('handleCreateLessonCandidateCommand creates candidate state from payload refs', () => {
    const env = { ...baseEnvelope, commandType: 'CreateLessonCandidate' as const };
    const validPayload = {
      statement: 'Retry transient timeouts with exponential backoff',
      rationale: 'Reduces cascade failures',
      scope: { scopeType: 'SYSTEM_WIDE' as const },
      originatingObservationRefs: [{ observationId: 'obs_1001' }],
    };
    const resValid = handleCreateLessonCandidateCommand({ envelope: env, payload: validPayload });
    assert.equal(resValid.ok, true);
    if (resValid.ok && resValid.category === 'SUCCESS') {
      const data = resValid.data as any;
      assert.equal(data.state, 'CANDIDATE');
      assert.equal(data.originatingObservationCount, 1);
    }
  });

  it('handleSubmitLessonForReviewCommand transitions candidate to IN_REVIEW', () => {
    const env = { ...baseEnvelope, commandType: 'SubmitLessonForReview' as const };
    const payload = { candidateRef: { candidateId: 'can_3001' } };
    const res = handleSubmitLessonForReviewCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.state, 'IN_REVIEW');
      assert.equal(data.candidateId, 'can_3001');
    }
  });

  it('handleInvalidateLessonCandidateCommand transitions candidate to REJECTED with reason', () => {
    const env = { ...baseEnvelope, commandType: 'InvalidateLessonCandidate' as const };
    const validPayload = { candidateRef: { candidateId: 'can_3001' }, reason: 'Superseded prior to review' };
    const resValid = handleInvalidateLessonCandidateCommand({ envelope: env, payload: validPayload });
    assert.equal(resValid.ok, true);
    if (resValid.ok && resValid.category === 'SUCCESS') {
      const data = resValid.data as any;
      assert.equal(data.state, 'REJECTED');
      assert.equal(data.candidateId, 'can_3001');
      assert.equal(data.reason, 'Superseded prior to review');
    }
  });

  it('handleApproveLessonCommand produces canonical published lesson record without prospectiveOnly', () => {
    const env = { ...baseEnvelope, commandType: 'ApproveLesson' as const };
    const payload = {
      candidateRef: { candidateId: 'can_3001' },
      decisionRef: { decisionId: 'dec_2002' },
    };
    const res = handleApproveLessonCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.status, 'PUBLISHED');
      assert.equal(data.nonBinding, true);
      assert.equal(data.prospectiveOnly, undefined);
      assert.notEqual(data.lessonId, 'can_3001');
      assert.equal(data.candidateRef.candidateId, 'can_3001');
    }
  });

  it('handleRejectLessonCommand and handleRequestLessonRevisionCommand handle review outcomes', () => {
    const envReject = { ...baseEnvelope, commandType: 'RejectLesson' as const };
    const resReject = handleRejectLessonCommand({
      envelope: envReject,
      payload: { candidateRef: { candidateId: 'can_3001' }, reason: 'Lacks evidence', decisionRef: { decisionId: 'dec_2003' } },
    });
    assert.equal(resReject.ok, true);
    if (resReject.ok && resReject.category === 'SUCCESS') {
      assert.equal((resReject.data as any).state, 'REJECTED');
      assert.equal((resReject.data as any).candidateId, 'can_3001');
    }

    const envRev = { ...baseEnvelope, commandType: 'RequestLessonRevision' as const };
    const resRev = handleRequestLessonRevisionCommand({
      envelope: envRev,
      payload: { candidateRef: { candidateId: 'can_3001' }, feedback: 'Clarify scope', decisionRef: { decisionId: 'dec_2004' } },
    });
    assert.equal(resRev.ok, true);
    if (resRev.ok && resRev.category === 'SUCCESS') {
      assert.equal((resRev.data as any).state, 'REVISION_REQUESTED');
      assert.equal((resRev.data as any).candidateId, 'can_3001');
    }
  });

  it('handleSupersedeLessonCommand rejects circular self-supersession', () => {
    const env = { ...baseEnvelope, commandType: 'SupersedeLesson' as const };
    const selfPayload = {
      supersededLessonRef: { lessonId: 'lsn_3001', version: '1.0.0' },
      supersedingLessonRef: { lessonId: 'lsn_3001', version: '2.0.0' },
      decisionRef: { decisionId: 'dec_2005' },
    };
    const resSelf = handleSupersedeLessonCommand({ envelope: env, payload: selfPayload });
    assert.equal(resSelf.ok, false);
    if (!resSelf.ok && resSelf.category === 'REFUSED') {
      assert.equal(resSelf.refusalCode, 'REFUSAL_CIRCULAR_SUPERCOGNITION');
    }

    const validPayload = {
      supersededLessonRef: { lessonId: 'lsn_3001', version: '1.0.0' },
      supersedingLessonRef: { lessonId: 'lsn_3002', version: '1.0.0' },
      decisionRef: { decisionId: 'dec_2005' },
    };
    const resValid = handleSupersedeLessonCommand({ envelope: env, payload: validPayload });
    assert.equal(resValid.ok, true);
    if (resValid.ok && resValid.category === 'SUCCESS') {
      assert.equal((resValid.data as any).state, 'SUPERSEDED');
    }
  });

  it('handleRetireLessonCommand transitions lesson to RETIRED', () => {
    const env = { ...baseEnvelope, commandType: 'RetireLesson' as const };
    const payload = {
      retiredLessonRef: { lessonId: 'lsn_3001', version: '1.0.0' },
      reason: 'Obsolete infrastructure',
      decisionRef: { decisionId: 'dec_2006' },
    };
    const res = handleRetireLessonCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      assert.equal((res.data as any).state, 'RETIRED');
    }
  });

  it('handleAdoptProposalCommand creates canonical ProspectiveAdoptionRecord', () => {
    const env = { ...baseEnvelope, commandType: 'AdoptLesson' as const };
    const payload = {
      proposalRef: { proposalId: 'prop_4001' },
      targetProjectRef: { projectId: 'prj_alpha' },
      decisionRef: { decisionId: 'dec_2007' },
    };
    const res = handleAdoptLessonCommand({ envelope: env, payload: payload as any });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.status, 'ADOPTED');
      assert.equal(data.proposalRef.proposalId, 'prop_4001');
      assert.equal(data.targetProjectRef.projectId, 'prj_alpha');
      assert.ok(data.adoptionId);
    }
  });

  it('handleProposeRuleCandidateCommand creates proposal without automatic rule promotion', () => {
    const env = { ...baseEnvelope, commandType: 'ProposeRuleCandidate' as const };
    const payload = {
      ruleManifestId: 'rm_4001',
      proposedRule: 'Always use parameterized DB queries',
      sourceLessonRef: { lessonId: 'lsn_3001', version: '1.0.0' },
    };
    const res = handleProposeRuleCandidateCommand({ envelope: env, payload });
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      const data = res.data as any;
      assert.equal(data.state, 'RULE_CANDIDATE_PROPOSED');
      assert.equal(data.ruleManifestId, 'rm_4001');
    }
  });

  it('handleBuildGuidanceSetQueryCommand processes query command and returns SUCCESS guidance result', () => {
    const env = { ...baseEnvelope, commandType: 'BuildGuidanceSetQuery' as const };
    const payload = {
      queryId: 'gq_5001',
      targetRef: { targetCategory: 'WORKSTREAM' as const, workstreamRef: { workstreamId: 'ws_alpha' } },
      matchStrategy: 'STRICT' as const,
    };
    const res = handleBuildGuidanceSetQueryCommand({ envelope: env, payload, candidatesOverride: [] }) as any;
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      assert.equal(res.data.status, 'SUCCESS');
      assert.equal(res.data.queryId, 'gq_5001');
      assert.equal(res.data.guidanceSet.matchedGuidance.length, 0);
    }
  });

  it('executeGovernedCommandHandler routes commands deterministically and preserves input immutability', () => {
    const env: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandType: 'DraftObservation',
    };
    const payload = { category: 'INTERPRETIVE' as const, statement: 'Architectural debt detected' };
    const frozenEnv = Object.freeze({ ...env });
    const frozenPayload = Object.freeze({ ...payload });

    const res = executeGovernedCommandHandler(frozenEnv, frozenPayload);
    assert.equal(res.ok, true);
    if (res.ok && res.category === 'SUCCESS') {
      assert.equal((res.data as any).observationCategory, 'INTERPRETIVE');
    }

    const envUnknown = { ...baseEnvelope, commandType: 'NonExistentCommand' as any };
    const resUnknown = executeGovernedCommandHandler(envUnknown, payload) as any;
    assert.equal(resUnknown.ok, false);
    if (!resUnknown.ok && resUnknown.category === 'ERROR') {
      assert.match(resUnknown.error.message, /No handler registered/);
    }
  });
});
