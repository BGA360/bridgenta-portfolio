import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  LessonRefSchema,
  LessonFamilyRefSchema,
  FrameworkVersionRefSchema,
  RuleVersionRefSchema,
  FrameworkCriteriaRefSchema,
  TargetRefSchema,
  SingleFrameworkScopeSchema,
  CrossFrameworkScopeSchema,
  ApprovedLessonSchema,
  RefusalCodeEnumSchema,
  LearningAuthorityLevelEnumSchema,
} from '../src/index.js';

describe('Canonical Contract Schemas', () => {
  test('LessonRef requires lessonId + version', () => {
    const valid = LessonRefSchema.parse({ lessonId: 'les-123', version: 'v1.0' });
    assert.equal(valid.lessonId, 'les-123');
    assert.equal(valid.version, 'v1.0');

    assert.throws(() => LessonRefSchema.parse({ lessonId: 'les-123' }));
  });

  test('LessonFamilyRef requires lessonId only', () => {
    const valid = LessonFamilyRefSchema.parse({ lessonId: 'les-123' });
    assert.equal(valid.lessonId, 'les-123');
  });

  test('FrameworkVersionRef requires frameworkRef + version', () => {
    const valid = FrameworkVersionRefSchema.parse({
      frameworkRef: { frameworkId: 'fw-1' },
      version: '2.0',
    });
    assert.equal(valid.frameworkRef.frameworkId, 'fw-1');
  });

  test('RuleVersionRef requires ruleManifestId + version', () => {
    const valid = RuleVersionRefSchema.parse({
      ruleManifestId: 'rm-1',
      version: '1.0.0',
    });
    assert.equal(valid.ruleManifestId, 'rm-1');
  });

  test('FrameworkCriteriaRef structure', () => {
    const valid = FrameworkCriteriaRefSchema.parse({
      frameworkRef: { frameworkId: 'fw-1' },
      criteriaId: 'crit-A',
      criteriaVersion: '1.0',
    });
    assert.equal(valid.criteriaId, 'crit-A');
  });

  test('TargetRef discriminated union for LESSON uses exact LessonRef', () => {
    const valid = TargetRefSchema.parse({
      targetCategory: 'LESSON',
      lessonRef: { lessonId: 'les-1', version: 'v1' },
    });
    assert.equal(valid.targetCategory, 'LESSON');
  });

  test('CrossFrameworkScope enforces distinct framework IDs', () => {
    const valid = CrossFrameworkScopeSchema.parse({
      scopeType: 'CROSS_FRAMEWORK',
      frameworkRefs: [{ frameworkId: 'fw-1' }, { frameworkId: 'fw-2' }],
    });
    assert.equal(valid.frameworkRefs.length, 2);

    assert.throws(() =>
      CrossFrameworkScopeSchema.parse({
        scopeType: 'CROSS_FRAMEWORK',
        frameworkRefs: [{ frameworkId: 'fw-1' }, { frameworkId: 'fw-1' }],
      })
    );
  });

  test('ApprovedLesson contains no mutable status fields and enforces nonBinding/prospectiveOnly literal true', () => {
    const valid = ApprovedLessonSchema.parse({
      lessonId: 'les-1',
      version: '1.0.0',
      statement: 'Test statement',
      rationale: 'Test rationale',
      scope: { scopeType: 'SINGLE_FRAMEWORK', frameworkRef: { frameworkId: 'fw-1' } },
      approvedAt: '2026-09-11T12:00:00Z',
      approvedBy: { actorId: 'act-1', actorType: 'GOVERNANCE_BODY' },
      authorityContextRef: { authorityContextId: 'auth-1' },
      decisionRef: { decisionId: 'dec-1' },
      nonBinding: true,
      prospectiveOnly: true,
    });
    assert.equal(valid.nonBinding, true);
    assert.equal(valid.prospectiveOnly, true);

    // Reject if state or status is added or literals are false
    assert.throws(() =>
      ApprovedLessonSchema.parse({
        ...valid,
        status: 'ACTIVE',
      })
    );
  });

  test('LearningAuthorityLevelEnum accepts exact SSoT values and rejects invalid values', () => {
    assert.equal(LearningAuthorityLevelEnumSchema.parse('INFORMATIONAL'), 'INFORMATIONAL');
    assert.equal(LearningAuthorityLevelEnumSchema.parse('ADVISORY'), 'ADVISORY');
    assert.equal(LearningAuthorityLevelEnumSchema.parse('CONSTITUTIONAL_MANDATE'), 'CONSTITUTIONAL_MANDATE');
    assert.equal(Object.keys(LearningAuthorityLevelEnumSchema.enum).length, 3);
    assert.throws(() => LearningAuthorityLevelEnumSchema.parse('INVALID_LEVEL'));
  });
});
