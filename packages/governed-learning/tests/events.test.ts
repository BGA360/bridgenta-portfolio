import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PHYSICAL_EVENT_DISCRIMINATORS,
  constructObservationCreatedEventPayload,
  constructObservationValidatedEventPayload,
  constructLessonCandidateCreatedEventPayload,
  constructLessonApprovedEventPayload,
  constructLessonSupersededEventPayload,
  constructLessonRetiredEventPayload,
  constructLessonAdoptedEventPayload,
  constructCanonicalEventPayload,
  constructHistoricalEventPreservationEnvelope,
} from '../src/runtime/events.js';
import { RuntimeInvariantError } from '../src/runtime/errors.js';

describe('Governed Learning Runtime Wave 5 Event Construction & Preservation (GL-IMPL-UNIT-005)', () => {
  it('supports exactly seven physical canonical event discriminators', () => {
    assert.equal(PHYSICAL_EVENT_DISCRIMINATORS.length, 7);
    assert.deepEqual([...PHYSICAL_EVENT_DISCRIMINATORS], [
      'OBSERVATION_CREATED',
      'OBSERVATION_VALIDATED',
      'LESSON_CANDIDATE_CREATED',
      'LESSON_APPROVED',
      'LESSON_SUPERSEDED',
      'LESSON_RETIRED',
      'LESSON_ADOPTED',
    ]);
  });

  describe('1. OBSERVATION_CREATED Event Payload Construction', () => {
    it('constructs valid OBSERVATION_CREATED event payload', () => {
      const validPayload = {
        observationId: 'obs-001',
        category: 'MECHANICAL',
        statement: 'System latency increased during peak load',
        evidenceRefs: [{ evidenceId: 'ev-001' }],
      };

      const result = constructObservationCreatedEventPayload(validPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
        assert.deepEqual(result.data, validPayload);
      }
    });

    it('rejects invalid OBSERVATION_CREATED payload deterministically', () => {
      const invalidPayload = {
        observationId: 'obs-001',
        category: 'INVALID_CATEGORY',
        statement: '',
        evidenceRefs: [],
      };

      const result = constructObservationCreatedEventPayload(invalidPayload);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.category, 'ERROR');
        assert.ok(result.error instanceof RuntimeInvariantError);
      }
    });
  });

  describe('2. OBSERVATION_VALIDATED Event Payload Construction', () => {
    it('constructs valid OBSERVATION_VALIDATED event payload with recorded validatedBy actor', () => {
      const validPayload = {
        observationId: 'obs-001',
        validationType: 'INTERPRETIVE',
        verdict: 'VALIDATED',
        validatedBy: {
          actorId: 'user-reviewer-123',
          actorType: 'HUMAN',
        },
      };

      const result = constructObservationValidatedEventPayload(validPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
        assert.equal(result.data.validatedBy.actorId, 'user-reviewer-123');
        assert.equal(result.data.validatedBy.actorType, 'HUMAN');
      }
    });

    it('rejects OBSERVATION_VALIDATED when authority reference validatedBy is missing', () => {
      const invalidPayload = {
        observationId: 'obs-001',
        validationType: 'INTERPRETIVE',
        verdict: 'VALIDATED',
      };

      const result = constructObservationValidatedEventPayload(invalidPayload);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.category, 'ERROR');
        assert.ok(result.error instanceof RuntimeInvariantError);
      }
    });
  });

  describe('3. LESSON_CANDIDATE_CREATED Event Payload Construction', () => {
    it('constructs valid LESSON_CANDIDATE_CREATED event payload', () => {
      const validPayload = {
        lessonId: 'les-001',
        statement: 'Cache invalidation must occur synchronously on config update',
        originatingObservationRefs: [{ observationId: 'obs-001' }],
      };

      const result = constructLessonCandidateCreatedEventPayload(validPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
        assert.deepEqual(result.data, validPayload);
      }
    });

    it('rejects malformed LESSON_CANDIDATE_CREATED payload', () => {
      const result = constructLessonCandidateCreatedEventPayload({ lessonId: '' });
      assert.equal(result.ok, false);
    });
  });

  describe('4. LESSON_APPROVED Event Payload Construction', () => {
    it('constructs valid LESSON_APPROVED event payload with recorded decisionRef', () => {
      const validPayload = {
        lessonRef: {
          lessonId: 'les-001',
          version: '1.0.0',
        },
        decisionRef: {
          decisionId: 'dec-100',
        },
      };

      const result = constructLessonApprovedEventPayload(validPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
        assert.equal(result.data.decisionRef.decisionId, 'dec-100');
      }
    });

    it('rejects LESSON_APPROVED payload missing required decisionRef', () => {
      const invalidPayload = {
        lessonRef: {
          lessonId: 'les-001',
          version: '1.0.0',
        },
      };

      const result = constructLessonApprovedEventPayload(invalidPayload);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.category, 'ERROR');
      }
    });
  });

  describe('5. LESSON_SUPERSEDED Event Payload Construction', () => {
    it('constructs valid LESSON_SUPERSEDED event payload', () => {
      const validPayload = {
        supersededLessonRef: { lessonId: 'les-001', version: '1.0.0' },
        supersedingLessonRef: { lessonId: 'les-002', version: '1.0.0' },
      };

      const result = constructLessonSupersededEventPayload(validPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
      }
    });

    it('rejects circular self-supersession attempts', () => {
      const invalidPayload = {
        supersededLessonRef: { lessonId: 'les-001', version: '1.0.0' },
        supersedingLessonRef: { lessonId: 'les-001', version: '2.0.0' },
      };

      const result = constructLessonSupersededEventPayload(invalidPayload);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.category, 'ERROR');
        assert.ok(result.error.message.includes('Self-supersession is invalid'));
      }
    });
  });

  describe('6. LESSON_RETIRED Event Payload Construction', () => {
    it('constructs valid LESSON_RETIRED event payload', () => {
      const validPayload = {
        retiredLessonRef: { lessonId: 'les-001', version: '1.0.0' },
        reason: 'Superseded by updated architecture guidelines',
      };

      const result = constructLessonRetiredEventPayload(validPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
        assert.equal(result.data.reason, 'Superseded by updated architecture guidelines');
      }
    });

    it('rejects LESSON_RETIRED with empty reason', () => {
      const result = constructLessonRetiredEventPayload({
        retiredLessonRef: { lessonId: 'les-001', version: '1.0.0' },
        reason: '',
      });
      assert.equal(result.ok, false);
    });
  });

  describe('7. LESSON_ADOPTED Event Payload Construction', () => {
    it('constructs valid LESSON_ADOPTED event payload', () => {
      const validPayload = {
        lessonRef: { lessonId: 'les-001', version: '1.0.0' },
        adoptedByProjectRef: { projectId: 'proj-alpha' },
      };

      const result = constructLessonAdoptedEventPayload(validPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
        assert.equal(result.data.adoptedByProjectRef.projectId, 'proj-alpha');
      }
    });
  });

  describe('Canonical Dispatcher & Boundary Verification', () => {
    it('constructs payload via constructCanonicalEventPayload dispatcher', () => {
      const validPayload = {
        lessonRef: { lessonId: 'les-001', version: '1.0.0' },
        adoptedByProjectRef: { projectId: 'proj-alpha' },
      };

      const result = constructCanonicalEventPayload('LESSON_ADOPTED', validPayload);
      assert.equal(result.ok, true);
    });

    it('rejects unsupported event discriminator', () => {
      const result = constructCanonicalEventPayload('UNSUPPORTED_DISCRIMINATOR', {});
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.category, 'ERROR');
        assert.ok(result.error.message.includes('Unsupported physical event discriminator'));
      }
    });

    it('does not generate event IDs, timestamps, or version default policy', () => {
      const inputPayload = {
        observationId: 'obs-999',
        category: 'MECHANICAL',
        statement: 'Potential security vulnerability',
        evidenceRefs: [],
      };

      const result = constructObservationCreatedEventPayload(inputPayload);
      assert.equal(result.ok, true);
      if (result.ok) {
        // Output contains only canonical payload schema fields (no synthetic eventId or timestamp added)
        assert.equal('eventId' in (result.data as object), false);
        assert.equal('timestamp' in (result.data as object), false);
        assert.equal('occurredAt' in (result.data as object), false);
      }
    });
  });

  describe('CTR-GL-056 Structural Preservation', () => {
    it('constructs valid CTR-GL-056 UnsupportedVersionHistoricalEventEnvelope without mutating opaque payload', () => {
      const opaquePayload = {
        customV2Field: 'unsupported-version-data',
        nestedDetails: { count: 42 },
      };

      const envelopeInput = {
        branchType: 'UNSUPPORTED_VERSION_HISTORICAL_EVENT',
        eventId: 'evt-preservation-001',
        eventType: 'OBSERVATION_CREATED',
        payloadVersion: '2.0.0-unsupported',
        occurredAt: '2026-09-13T12:00:00.000Z',
        actorRef: { actorId: 'user-001', actorType: 'HUMAN' },
        authorityContextRef: { authorityContextId: 'auth-ctx-001' },
        payload: opaquePayload,
      };

      const result = constructHistoricalEventPreservationEnvelope(envelopeInput);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.category, 'SUCCESS');
        assert.equal(result.data.branchType, 'UNSUPPORTED_VERSION_HISTORICAL_EVENT');
        assert.deepEqual(result.data.payload, opaquePayload);
      }
    });

    it('rejects malformed CTR-GL-056 preservation envelope input', () => {
      const invalidEnvelope = {
        branchType: 'UNSUPPORTED_VERSION_HISTORICAL_EVENT',
        eventId: 'evt-preservation-001',
        // missing eventType and payloadVersion
      };

      const result = constructHistoricalEventPreservationEnvelope(invalidEnvelope);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.category, 'ERROR');
        assert.ok(result.error instanceof RuntimeInvariantError);
      }
    });
  });
});
