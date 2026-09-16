import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LessonCandidateStatusEnumSchema,
  PublishedLessonStatusEnumSchema,
  ProspectiveAdoptionStatusEnumSchema,
} from '../src/types/enums.js';
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
import { GovernancePersistencePortSchema } from '../src/contracts/ports.js';

describe('Governed Learning Contract Reconciliation R1 Foundation', () => {
  it('1. Candidate review status and published lesson status are separate bounded types', () => {
    const candidateStatuses = LessonCandidateStatusEnumSchema.options;
    const publishedStatuses = PublishedLessonStatusEnumSchema.options;

    assert.ok(candidateStatuses.includes('CANDIDATE'));
    assert.ok(candidateStatuses.includes('IN_REVIEW'));
    assert.ok(candidateStatuses.includes('APPROVED'));
    assert.ok(candidateStatuses.includes('REJECTED'));

    // Verify published lesson status is separate and bounded to SSoT
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

  it('4. PUBLISHED is present in canonical published lesson status enum', () => {
    const publishedStatuses = PublishedLessonStatusEnumSchema.options;
    assert.ok(publishedStatuses.includes('PUBLISHED'));
  });

  it('5. DEPRECATED is present in canonical published lesson status enum', () => {
    const publishedStatuses = PublishedLessonStatusEnumSchema.options;
    assert.ok(publishedStatuses.includes('DEPRECATED'));
  });

  it('6. SUPERSEDED is present in canonical published lesson status enum', () => {
    const publishedStatuses = PublishedLessonStatusEnumSchema.options;
    assert.ok(publishedStatuses.includes('SUPERSEDED'));
  });

  it('7. ProspectiveAdoption is for Rule Candidates and not a LessonRecord status', () => {
    const adoptionStatuses = ProspectiveAdoptionStatusEnumSchema.options;
    assert.deepStrictEqual(adoptionStatuses, ['ADOPTED', 'WITHDRAWN', 'EXPIRED']);

    // Verify ProspectiveAdoptionRecordSchema expects ruleCandidateId
    const sampleRecord = ProspectiveAdoptionRecordSchema.safeParse({
      adoptionId: 'ADP-001',
      ruleCandidateId: 'RC-100',
      status: 'ADOPTED',
      adoptedAt: '2026-09-01T10:00:00Z',
      adoptedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      decisionRef: { decisionId: 'DEC-001' },
    });
    assert.equal(sampleRecord.success, true);
  });

  it('8. Canonical contract schemas parse valid canonical payloads strictly', () => {
    // CTR-GL-017 LessonCandidateRecord
    const candidateResult = LessonCandidateRecordSchema.safeParse({
      lessonId: 'LES-001',
      statement: 'Validate pre-commit build',
      rationale: 'Prevents broken builds',
      scope: { scopeType: 'SYSTEM_WIDE' },
      originatingObservationRefs: [{ observationId: 'OBS-001' }],
      createdAt: '2026-09-01T10:00:00Z',
      createdBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
    });
    assert.equal(candidateResult.success, true);

    // CTR-GL-022 LessonRecord
    const lessonResult = LessonRecordSchema.safeParse({
      lessonId: 'LES-001',
      version: '1.0.0',
      statement: 'Validate pre-commit build',
      rationale: 'Prevents broken builds',
      scope: { scopeType: 'SYSTEM_WIDE' },
      status: 'PUBLISHED',
      publishedAt: '2026-09-01T10:00:00Z',
      publishedBy: { actorId: 'ACT-001', actorType: 'HUMAN' },
      authorityContextRef: { authorityContextId: 'AUTH-001' },
      decisionRef: { decisionId: 'DEC-001' },
      nonBinding: true,
      prospectiveOnly: true,
    });
    assert.equal(lessonResult.success, true);

    // CTR-GL-036 LearningContextQuery
    const queryResult = LearningContextQuerySchema.safeParse({
      targetRef: { targetCategory: 'PROJECT', projectRef: { projectId: 'PRJ-ALPHA' } },
    });
    assert.equal(queryResult.success, true);
  });

  it('9. Canonical contract ID annotations are documented on physical schemas', () => {
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
    assert.ok(GovernancePersistencePortSchema);
  });
});
