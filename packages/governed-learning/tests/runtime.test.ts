import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LearningAuthorityLevelEnumSchema,
  RefusalCodeEnumSchema,
} from '../src/types/enums.js';
import type { LearningAuthorityLevelEnum } from '../src/types/enums.js';
import type {
  RuntimeOperationResult,
  RuntimeSuccessResult,
  RuntimeRefusalResult,
  RuntimeErrorResult,
  RuntimeAuthorityRef,
} from '../src/runtime/types.js';
import {
  GovernedLearningRuntimeError,
  RuntimeConfigurationError,
  RuntimeInvariantError,
  RuntimeDependencyError,
  RuntimeUnsupportedOperationError,
} from '../src/runtime/errors.js';

describe('Governed Learning Runtime Wave 1 Foundation', () => {
  test('Runtime consumes canonical LearningAuthorityLevelEnum from schema layer', () => {
    const level: LearningAuthorityLevelEnum = 'CONSTITUTIONAL_MANDATE';
    const parsed = LearningAuthorityLevelEnumSchema.parse(level);
    assert.equal(parsed, 'CONSTITUTIONAL_MANDATE');

    const authRef: RuntimeAuthorityRef = {
      level: 'ADVISORY',
      sourceId: 'auth-source-001',
    };
    assert.equal(authRef.level, 'ADVISORY');
    assert.equal(authRef.sourceId, 'auth-source-001');
  });

  test('RuntimeOperationResult discriminated union handles SUCCESS, REFUSED, and ERROR', () => {
    const success: RuntimeSuccessResult<string> = {
      ok: true,
      category: 'SUCCESS',
      data: 'payload-001',
    };
    assert.equal(success.ok, true);
    assert.equal(success.category, 'SUCCESS');
    assert.equal(success.data, 'payload-001');

    const validRefusalCode = RefusalCodeEnumSchema.parse('REFUSAL_NON_BINDING_OVERRIDE_ATTEMPT');
    const refusal: RuntimeRefusalResult = {
      ok: false,
      category: 'REFUSED',
      refusalCode: validRefusalCode,
      reason: 'Lesson contains prohibited mutable field',
    };
    assert.equal(refusal.ok, false);
    assert.equal(refusal.category, 'REFUSED');
    assert.equal(refusal.refusalCode, 'REFUSAL_NON_BINDING_OVERRIDE_ATTEMPT');

    const runtimeError = new RuntimeInvariantError('Internal invariant check failed');
    const errorResult: RuntimeErrorResult = {
      ok: false,
      category: 'ERROR',
      error: runtimeError,
    };
    assert.equal(errorResult.ok, false);
    assert.equal(errorResult.category, 'ERROR');
    assert.equal(errorResult.error.category, 'INVARIANT_ERROR');
  });

  test('GovernedLearningRuntimeError hierarchy sets categories and internal flags correctly', () => {
    const configErr = new RuntimeConfigurationError('Missing config key');
    assert.ok(configErr instanceof GovernedLearningRuntimeError);
    assert.equal(configErr.category, 'CONFIGURATION_ERROR');
    assert.equal(configErr.isInternal, true);

    const depErr = new RuntimeDependencyError('Store offline', { targetStore: 'main' });
    assert.equal(depErr.category, 'DEPENDENCY_ERROR');
    assert.equal(depErr.details?.targetStore, 'main');

    const unsuppErr = new RuntimeUnsupportedOperationError('Operation not supported in Wave 1');
    assert.equal(unsuppErr.category, 'UNSUPPORTED_OPERATION');
  });
});
