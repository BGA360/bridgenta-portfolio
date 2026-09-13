import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGovernanceCommandEnvelope,
  parseGovernanceEventEnvelope,
  parseActorIdentityRef,
  parseAuthorityContextRef,
  parseTargetRef,
  parsePayloadWithSchema,
} from '../src/runtime/parsers.js';
import { LessonRefSchema } from '../src/contracts/references.js';
import { GovernedLearningRuntimeError } from '../src/runtime/errors.js';

describe('Governed Learning Runtime Wave 2 Parsers', () => {
  const validActorRef = {
    actorId: 'act-00000000-0000-4000-8000-000000000001',
    actorType: 'HUMAN',
  };

  const validAuthorityContextRef = {
    authorityContextId: 'actx-00000000-0000-4000-8000-000000000001',
  };

  const validCommandEnvelope = {
    commandId: 'cmd-00000000-0000-4000-8000-000000000001',
    commandType: 'SubmitObservation',
    payloadVersion: '1.0.0',
    issuedAt: '2026-01-01T00:00:00.000Z',
    actorRef: validActorRef,
    authorityContextRef: validAuthorityContextRef,
    payload: { sample: 'data' },
  };

  const validEventEnvelope = {
    eventId: 'evt-00000000-0000-4000-8000-000000000001',
    eventType: 'OBSERVATION_CREATED',
    payloadVersion: '1.0.0',
    occurredAt: '2026-01-01T00:00:00.000Z',
    actorRef: validActorRef,
    authorityContextRef: validAuthorityContextRef,
    payload: { sample: 'data' },
  };

  test('parseGovernanceCommandEnvelope accepts valid command envelope', () => {
    const result = parseGovernanceCommandEnvelope(validCommandEnvelope);
    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');
    if (result.ok) {
      assert.equal(result.data.commandId, validCommandEnvelope.commandId);
      assert.equal(result.data.commandType, 'SubmitObservation');
    }
  });

  test('parseGovernanceCommandEnvelope rejects invalid command envelope (missing field / unknown field)', () => {
    const invalidCommand = { ...validCommandEnvelope, commandId: '' };
    const result = parseGovernanceCommandEnvelope(invalidCommand);
    assert.equal(result.ok, false);
    assert.equal(result.category, 'ERROR');
    if (!result.ok && result.category === 'ERROR') {
      assert.ok(result.error instanceof GovernedLearningRuntimeError);
      assert.equal(result.error.category, 'INVARIANT_ERROR');
    }

    const extraFieldCommand = { ...validCommandEnvelope, unknownField: 'not-allowed' };
    const strictResult = parseGovernanceCommandEnvelope(extraFieldCommand);
    assert.equal(strictResult.ok, false);
    assert.equal(strictResult.category, 'ERROR');
  });

  test('parseGovernanceEventEnvelope accepts valid event envelope', () => {
    const result = parseGovernanceEventEnvelope(validEventEnvelope);
    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');
    if (result.ok) {
      assert.equal(result.data.eventId, validEventEnvelope.eventId);
      assert.equal(result.data.eventType, 'OBSERVATION_CREATED');
    }
  });

  test('parseGovernanceEventEnvelope rejects invalid event envelope', () => {
    const invalidEvent = { ...validEventEnvelope, payloadVersion: '' };
    const result = parseGovernanceEventEnvelope(invalidEvent);
    assert.equal(result.ok, false);
    assert.equal(result.category, 'ERROR');
  });

  test('parseActorIdentityRef validates actor identity reference structurally (GL-RUNTIME-SEC-001)', () => {
    const validResult = parseActorIdentityRef(validActorRef);
    assert.equal(validResult.ok, true);
    assert.equal(validResult.category, 'SUCCESS');
    if (validResult.ok) {
      assert.equal(validResult.data.actorId, validActorRef.actorId);
      assert.equal(validResult.data.actorType, 'HUMAN');
    }

    const invalidActorRef = { actorId: '', actorType: 'INVALID_TYPE' };
    const invalidResult = parseActorIdentityRef(invalidActorRef);
    assert.equal(invalidResult.ok, false);
    assert.equal(invalidResult.category, 'ERROR');
  });

  test('parseAuthorityContextRef accepts valid authority context reference', () => {
    const result = parseAuthorityContextRef(validAuthorityContextRef);
    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');
    if (result.ok) {
      assert.equal(result.data.authorityContextId, validAuthorityContextRef.authorityContextId);
    }
  });

  test('parseTargetRef accepts valid target reference discriminated union', () => {
    const target = {
      targetCategory: 'OBSERVATION',
      observationRef: { observationId: 'obs-00000000-0000-4000-8000-000000000001' },
    };
    const result = parseTargetRef(target);
    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');

    const invalidTarget = { targetCategory: 'UNKNOWN_CATEGORY' };
    const invalidResult = parseTargetRef(invalidTarget);
    assert.equal(invalidResult.ok, false);
    assert.equal(invalidResult.category, 'ERROR');
  });

  test('parsePayloadWithSchema validates payload with explicitly provided schema', () => {
    const validLessonRef = {
      lessonId: 'lsn-00000000-0000-4000-8000-000000000001',
      version: '1.0.0',
    };
    const result = parsePayloadWithSchema(validLessonRef, LessonRefSchema);
    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');

    const invalidLessonRef = { lessonId: '' };
    const invalidResult = parsePayloadWithSchema(invalidLessonRef, LessonRefSchema);
    assert.equal(invalidResult.ok, false);
    assert.equal(invalidResult.category, 'ERROR');
  });

  test('Input immutability is preserved across all parsers', () => {
    const inputCopy = JSON.parse(JSON.stringify(validCommandEnvelope));
    parseGovernanceCommandEnvelope(validCommandEnvelope);
    assert.deepEqual(validCommandEnvelope, inputCopy);
  });

  test('Parser errors are categorized as ERROR and never converted to domain REFUSED', () => {
    const result = parseGovernanceCommandEnvelope(null);
    assert.equal(result.ok, false);
    assert.equal(result.category, 'ERROR');
    if (!result.ok && result.category === 'ERROR') {
      assert.equal(result.error.category, 'INVARIANT_ERROR');
      assert.equal('refusalCode' in result, false);
    }
  });
});
