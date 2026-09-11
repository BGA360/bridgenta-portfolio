import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RefusalCodeEnumSchema } from '../src/index.js';

describe('Refusal Code Enum Integrity', () => {
  test('RefusalCodeEnum contains exactly 20 domain refusal codes', () => {
    const options = RefusalCodeEnumSchema.options;
    assert.equal(options.length, 20);

    const expectedCodes = [
      'OBSERVATION_NOT_FOUND',
      'OBSERVATION_ALREADY_VALIDATED',
      'INVALID_OBSERVATION_STATE',
      'EVIDENCE_ATTACHMENT_FAILED',
      'LESSON_CANDIDATE_NOT_FOUND',
      'INVALID_LESSON_CANDIDATE_STATE',
      'LESSON_NOT_APPROVED',
      'LESSON_ALREADY_SUPERSEDED',
      'LESSON_ALREADY_RETIRED',
      'UNAUTHORIZED_ACTOR',
      'AUTHORITY_CONTEXT_INVALID',
      'AUTHORITY_CONTEXT_EXPIRED',
      'SCOPE_VIOLATION',
      'CROSS_FRAMEWORK_REQUIRES_DISTINCT_FRAMEWORKS',
      'SUCCESSOR_VERSION_INVALID',
      'SUPERSEDING_LESSON_NOT_FOUND',
      'RULE_CANDIDATE_NOT_FOUND',
      'INVALID_RULE_CANDIDATE_STATE',
      'DUPLICATE_LESSON_ADOPTION',
      'UNSUPPORTED_GOVERNANCE_OPERATION',
    ];

    assert.deepEqual(options, expectedCodes);
  });

  test('RefusalCodeEnum does NOT contain parser failure codes', () => {
    const options = RefusalCodeEnumSchema.options as string[];
    assert.equal(options.includes('UNRECOGNIZED_EVENT_TYPE'), false);
    assert.equal(options.includes('UNSUPPORTED_PAYLOAD_VERSION'), false);
    assert.equal(options.includes('INVALID_KNOWN_SUPPORTED_PAYLOAD'), false);
    assert.equal(options.includes('UNSUPPORTED_COMMAND_PAYLOAD_VERSION'), false);
  });
});
