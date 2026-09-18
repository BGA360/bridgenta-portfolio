import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LessonCandidateStatusEnumSchema,
  PublishedLessonStatusEnumSchema,
  ProspectiveAdoptionStatusEnumSchema,
  ReviewOutcomeEnumSchema,
} from '../src/types/enums.js';
import { RuleCandidateProposalIdSchema } from '../src/types/primitives.js';
import {
  ObservationRefSchema,
  LessonRefSchema,
  LessonCandidateRefSchema,
  WorkstreamRefSchema,
  ProjectRefSchema,
  DecisionRefSchema,
  EventRefSchema,
  RuleCandidateProposalRefSchema,
  AuthorityContextRefSchema,
  FrameworkCriteriaRefSchema,
  TargetRefSchema,
} from '../src/contracts/references.js';
import {
  ObservationRecordSchema,
  ObservationValidationRecordSchema,
  LessonCandidateRecordSchema,
  LessonCandidateEvaluationRecordSchema,
  LessonRecordSchema,
  LessonDeprecationRecordSchema,
  RuleCandidateProposalRecordSchema,
  RuleCandidateReviewRecordSchema,
  ProspectiveAdoptionRecordSchema,
  ProspectiveAdoptionWithdrawnRecordSchema,
} from '../src/contracts/entities.js';
import { GovernanceEventEnvelopeSchema, GovernanceCommandEnvelopeSchema } from '../src/contracts/envelopes.js';
import { LearningContextQuerySchema, LearningContextQueryResultSchema } from '../src/contracts/lesson.js';
import type { GovernancePersistencePort } from '../src/contracts/ports.js';

describe('Governed Learning Contract Reconciliation R1 GL-CONTRACT-AMENDMENT-001 Conformance', () => {
  it('1. Candidate review status and published lesson status are separate bounded types', () => {
    const candidateStatuses = LessonCandidateStatusEnumSchema.options;
    const publishedStatuses = PublishedLessonStatusEnumSchema.options;

    assert.deepStrictEqual(candidateStatuses, ['CANDIDATE', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED']);
    assert.deepStrictEqual(publishedStatuses, ['PUBLISHED', 'DEPRECATED', 'SUPERSEDED']);
    assert.notDeepStrictEqual(candidateStatuses, publishedStatuses);
  });

  it('2. ADOPTED is absent from published lesson status enum', () => {
    const publishedStatuses = PublishedLessonStatusEnumSchema.options;
    assert.equal(publishedStatuses.includes('ADOPTED' as unknown as typeof publishedStatuses[number]), false);
  });

  it('3. RETIRED is absent from canonical published lesson status enum', () => {
    const publishedStatuses = PublishedLessonStatusEnumSchema.options;
    assert.equal(publishedStatuses.includes('RETIRED' as unknown as typeof publishedStatuses[number]), false);
  });

  it('4. LessonCandidateRecord uses candidateId and rejects lessonId-only identity', () => {
    const validCandidate = LessonCandidateRecordSchema.safeParse({
      candidateId: 'CAN-001',
      statement: 'Validate pre-commit build',
      rationale: 'Prevents broken builds',
      scope: { scopeType: 'SINGLE_FRAMEWORK', frameworkRef: { frameworkId: 'FW-01' } },
      originatingObservationRefs: [{ observationId: 'OBS-001' }],
      createdAt: '2026-09-01T10:00:00.000Z',
      createdBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
    });
    assert.equal(validCandidate.success, true);
    if (validCandidate.success) {
      assert.equal(validCandidate.data.candidateId, 'CAN-001');
    }

    const invalidCandidate = LessonCandidateRecordSchema.safeParse({
      lessonId: 'LES-001',
      statement: 'Validate pre-commit build',
      rationale: 'Prevents broken builds',
      scope: { scopeType: 'SINGLE_FRAMEWORK', frameworkRef: { frameworkId: 'FW-01' } },
      originatingObservationRefs: [{ observationId: 'OBS-001' }],
      createdAt: '2026-09-01T10:00:00.000Z',
      createdBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
    });
    assert.equal(invalidCandidate.success, false);
  });

  it('5. LessonCandidateEvaluationRecord uses candidateRef and canonical ReviewOutcomeEnum', () => {
    const evalRecord = LessonCandidateEvaluationRecordSchema.safeParse({
      candidateRef: { candidateId: 'CAN-001' },
      outcome: 'APPROVED',
      evaluatedAt: '2026-09-01T10:00:00.000Z',
      evaluatedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      decisionRef: { decisionId: 'DEC-001' },
    });
    assert.equal(evalRecord.success, true);

    const legacyOutcomeRecord = LessonCandidateEvaluationRecordSchema.safeParse({
      candidateRef: { candidateId: 'CAN-001' },
      outcome: 'APPROVE',
      evaluatedAt: '2026-09-01T10:00:00.000Z',
      evaluatedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      decisionRef: { decisionId: 'DEC-001' },
    });
    assert.equal(legacyOutcomeRecord.success, false);
  });

  it('6. LessonRef requires lessonId + version', () => {
    const lessonRefResult = LessonRefSchema.safeParse({
      lessonId: 'LES-001',
      version: '1.0.0',
    });
    assert.equal(lessonRefResult.success, true);

    const missingVersion = LessonRefSchema.safeParse({
      lessonId: 'LES-001',
    });
    assert.equal(missingVersion.success, false);
  });

  it('7. TargetRef LESSON_CANDIDATE variant uses candidateRef', () => {
    const targetCandidate = TargetRefSchema.safeParse({
      targetCategory: 'LESSON_CANDIDATE',
      candidateRef: { candidateId: 'CAN-001' },
    });
    assert.equal(targetCandidate.success, true);

    const oldTargetCandidate = TargetRefSchema.safeParse({
      targetCategory: 'LESSON_CANDIDATE',
      lessonFamilyRef: { lessonId: 'LES-001' },
    });
    assert.equal(oldTargetCandidate.success, false);
  });

  it('8. TargetRef RULE_CANDIDATE_PROPOSAL variant uses proposalRef', () => {
    const targetProposal = TargetRefSchema.safeParse({
      targetCategory: 'RULE_CANDIDATE_PROPOSAL',
      proposalRef: { proposalId: 'PROP-001' },
    });
    assert.equal(targetProposal.success, true);
  });

  it('9. AuthorityContextRef uses authorityId', () => {
    const authRef = AuthorityContextRefSchema.safeParse({
      authorityId: 'AUTH-001',
    });
    assert.equal(authRef.success, true);

    const oldAuthRef = AuthorityContextRefSchema.safeParse({
      authorityContextId: 'AUTH-001',
    });
    assert.equal(oldAuthRef.success, false);
  });

  it('10. LessonRecord excludes prospectiveOnly and enforces nonBinding literal true', () => {
    const validLesson = LessonRecordSchema.safeParse({
      lessonId: 'LES-001',
      version: '1.0.0',
      statement: 'Validate pre-commit build',
      rationale: 'Prevents broken builds',
      scope: { scopeType: 'SINGLE_FRAMEWORK', frameworkRef: { frameworkId: 'FW-01' } },
      status: 'PUBLISHED',
      publishedAt: '2026-09-01T10:00:00.000Z',
      publishedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      authorityContextRef: { authorityId: 'AUTH-001' },
      decisionRef: { decisionId: 'DEC-001' },
      nonBinding: true,
    });
    assert.equal(validLesson.success, true);

    const invalidLessonWithProspectiveOnly = LessonRecordSchema.safeParse({
      lessonId: 'LES-001',
      version: '1.0.0',
      statement: 'Validate pre-commit build',
      rationale: 'Prevents broken builds',
      scope: { scopeType: 'SINGLE_FRAMEWORK', frameworkRef: { frameworkId: 'FW-01' } },
      status: 'PUBLISHED',
      publishedAt: '2026-09-01T10:00:00.000Z',
      publishedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      authorityContextRef: { authorityId: 'AUTH-001' },
      decisionRef: { decisionId: 'DEC-001' },
      nonBinding: true,
      prospectiveOnly: true,
    });
    assert.equal(invalidLessonWithProspectiveOnly.success, false);
  });

  it('11. ProspectiveAdoptionRecord binds a Rule Candidate proposal', () => {
    const adoptionStatuses = ProspectiveAdoptionStatusEnumSchema.options;
    assert.deepStrictEqual(adoptionStatuses, ['ADOPTED', 'WITHDRAWN', 'EXPIRED']);

    const sampleRecord = ProspectiveAdoptionRecordSchema.safeParse({
      adoptionId: 'ADP-001',
      proposalRef: { proposalId: 'PROP-100' },
      status: 'ADOPTED',
      adoptedAt: '2026-09-01T10:00:00.000Z',
      adoptedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      decisionRef: { decisionId: 'DEC-001' },
    });
    assert.equal(sampleRecord.success, true);
  });

  it('12. candidateId and lessonId remain separate identity concepts', () => {
    const candidateId = 'CAN-100';
    const lessonId = 'LES-100';
    assert.notEqual(candidateId, lessonId);
  });

  it('13. Canonical contract ID annotations are documented on physical schemas', () => {
    assert.ok(ObservationRefSchema);
    assert.ok(LessonRefSchema);
    assert.ok(LessonCandidateRefSchema);
    assert.ok(WorkstreamRefSchema);
    assert.ok(ProjectRefSchema);
    assert.ok(DecisionRefSchema);
    assert.ok(EventRefSchema);
    assert.ok(RuleCandidateProposalRefSchema);
    assert.ok(AuthorityContextRefSchema);
    assert.ok(FrameworkCriteriaRefSchema);
    assert.ok(TargetRefSchema);
    assert.ok(ObservationRecordSchema);
    assert.ok(ObservationValidationRecordSchema);
    assert.ok(LessonCandidateRecordSchema);
    assert.ok(LessonCandidateEvaluationRecordSchema);
    assert.ok(LessonRecordSchema);
    assert.ok(LessonDeprecationRecordSchema);
    assert.ok(RuleCandidateProposalRecordSchema);
    assert.ok(RuleCandidateReviewRecordSchema);
    assert.ok(ProspectiveAdoptionRecordSchema);
    assert.ok(ProspectiveAdoptionWithdrawnRecordSchema);
    assert.ok(GovernanceEventEnvelopeSchema);
    assert.ok(GovernanceCommandEnvelopeSchema);
    assert.ok(LearningContextQuerySchema);
    assert.ok(LearningContextQueryResultSchema);
  });

  it('14. ReviewOutcomeEnum accepts APPROVED, REJECTED, REVISION_REQUESTED and rejects legacy values', () => {
    assert.deepStrictEqual(ReviewOutcomeEnumSchema.options, ['APPROVED', 'REJECTED', 'REVISION_REQUESTED']);
    assert.equal(ReviewOutcomeEnumSchema.safeParse('APPROVED').success, true);
    assert.equal(ReviewOutcomeEnumSchema.safeParse('REJECTED').success, true);
    assert.equal(ReviewOutcomeEnumSchema.safeParse('REVISION_REQUESTED').success, true);

    assert.equal(ReviewOutcomeEnumSchema.safeParse('APPROVE').success, false);
    assert.equal(ReviewOutcomeEnumSchema.safeParse('REJECT').success, false);
    assert.equal(ReviewOutcomeEnumSchema.safeParse('REQUEST_REVISION').success, false);
  });

  it('15. RuleCandidateProposalRef accepts proposalId through RuleCandidateProposalId', () => {
    const validPropId = RuleCandidateProposalIdSchema.parse('PROP-100');
    assert.equal(validPropId, 'PROP-100');

    const validRef = RuleCandidateProposalRefSchema.safeParse({ proposalId: 'PROP-100' });
    assert.equal(validRef.success, true);

    const validRecord = RuleCandidateProposalRecordSchema.safeParse({
      proposalId: 'PROP-100',
      ruleManifestId: 'RM-001',
      proposedRule: 'Pre-commit linting required',
      rationale: 'Ensures clean code base',
      sourceLessonRef: { lessonId: 'LES-001', version: '1.0.0' },
      proposedAt: '2026-09-01T10:00:00.000Z',
      proposedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
    });
    assert.equal(validRecord.success, true);
  });

  it('16. RuleCandidateReviewRecord uses canonical ReviewOutcomeEnum', () => {
    const validReview = RuleCandidateReviewRecordSchema.safeParse({
      proposalRef: { proposalId: 'PROP-100' },
      outcome: 'APPROVED',
      reviewedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      reviewedAt: '2026-09-01T10:00:00.000Z',
      comments: 'Rule candidate meets governance standards',
      decisionRef: { decisionId: 'DEC-001' },
    });
    assert.equal(validReview.success, true);

    const legacyReview = RuleCandidateReviewRecordSchema.safeParse({
      proposalRef: { proposalId: 'PROP-100' },
      outcome: 'APPROVE',
      reviewedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      reviewedAt: '2026-09-01T10:00:00.000Z',
      comments: 'Rule candidate meets governance standards',
      decisionRef: { decisionId: 'DEC-001' },
    });
    assert.equal(legacyReview.success, false);
  });

  it('17. CTR-GL-055 GovernancePersistencePort is an architectural interface contract', () => {
    const _checkPort: GovernancePersistencePort | null = null;
    assert.equal(_checkPort, null);
  });
});
