import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ObservationCreatedEventPayloadSchema,
  DraftObservationCommandPayloadSchema,
  CrossFrameworkScopeSchema,
  LessonRefSchema,
  VersionValueSchema,
} from '../src/index.js';

describe('Mandatory Negative Tests', () => {
  test('Wrong event payload rejects', () => {
    assert.throws(() =>
      ObservationCreatedEventPayloadSchema.parse({
        observationId: 'obs-1',
        category: 'INVALID_CATEGORY',
        statement: 'Statement',
        evidenceRefs: [],
      })
    );
  });

  test('Wrong command payload rejects', () => {
    assert.throws(() =>
      DraftObservationCommandPayloadSchema.parse({
        category: 'MECHANICAL',
        // missing required statement
      })
    );
  });

  test('CrossFramework duplicate frameworkId rejects', () => {
    assert.throws(() =>
      CrossFrameworkScopeSchema.parse({
        scopeType: 'CROSS_FRAMEWORK',
        frameworkRefs: [{ frameworkId: 'fw-1' }, { frameworkId: 'fw-1' }],
      })
    );
  });

  test('Unknown property on strict schema rejects', () => {
    assert.throws(() =>
      LessonRefSchema.parse({
        lessonId: 'les-1',
        version: 'v1',
        extraProperty: 'unexpected',
      })
    );
  });

  test('VersionValue accepts non-semver custom version strings', () => {
    const valid1 = VersionValueSchema.parse('1.0.0+build.5');
    assert.equal(valid1, '1.0.0+build.5');

    const valid2 = VersionValueSchema.parse('2026-09-REV1');
    assert.equal(valid2, '2026-09-REV1');

    assert.throws(() => VersionValueSchema.parse(''));
  });
});
