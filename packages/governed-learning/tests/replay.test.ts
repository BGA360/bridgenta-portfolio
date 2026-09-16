import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { HistoricalReplayEngine, replayHistoricalEvents } from '../src/runtime/replay.js';
import { InMemoryGovernanceRepository } from '../src/runtime/persistence.js';
import type { GovernanceEventEnvelope } from '../src/contracts/envelopes.js';

describe('HistoricalReplayEngine & replayHistoricalEvents (GL-IMPL-UNIT-007)', () => {
  let repository: InMemoryGovernanceRepository;
  let engine: HistoricalReplayEngine;

  const actorRef = { actorId: 'ACTOR-001', role: 'GOVERNANCE_OFFICER' };
  const authorityContextRef = { authorityId: 'AUTH-001', level: 'SYSTEM' };

  beforeEach(() => {
    repository = new InMemoryGovernanceRepository();
    engine = new HistoricalReplayEngine(repository);
  });

  it('1. Reconstructs empty history gracefully', () => {
    const res = replayHistoricalEvents([]);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalEventsExamined, 0);
      assert.equal(res.data.eventsAppliedCount, 0);
      assert.deepEqual(res.data.activeLessons, []);
      assert.deepEqual(res.data.observations, []);
      assert.deepEqual(res.data.preservedOpaqueEvents, []);
      assert.deepEqual(res.data.preservedOpaqueCommands, []);
    }
  });

  it('2. Reconstructs historical observation lifecycle up to target timestamp (CTR-GL-038, CTR-GL-039)', () => {
    const events: Array<GovernanceEventEnvelope> = [
      {
        eventId: 'EVT-001',
        eventType: 'OBSERVATION_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          observationId: 'OBS-001',
          category: 'PROCESS_DEVIATION',
          statement: 'Observed build step latency increase',
          evidenceRefs: [{ evidenceId: 'EVI-001' }],
        },
      },
      {
        eventId: 'EVT-002',
        eventType: 'OBSERVATION_VALIDATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-02T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          observationId: 'OBS-001',
          validationType: 'MECHANICAL',
          verdict: 'VALIDATED',
          validatedBy: actorRef,
        },
      },
    ];

    // Replay at 2026-09-01T12:00:00Z (after OBS_CREATED, before OBS_VALIDATED)
    const resPartial = replayHistoricalEvents(events, { targetTimestamp: '2026-09-01T12:00:00Z' });
    assert.equal(resPartial.ok, true);
    if (resPartial.ok) {
      assert.equal(resPartial.data.eventsAppliedCount, 1);
      assert.equal(resPartial.data.observations.length, 1);
      assert.equal(resPartial.data.observations[0].status, 'UNVALIDATED');
    }

    // Replay at 2026-09-03T10:00:00Z (after both)
    const resFull = replayHistoricalEvents(events, { targetTimestamp: '2026-09-03T10:00:00Z' });
    assert.equal(resFull.ok, true);
    if (resFull.ok) {
      assert.equal(resFull.data.eventsAppliedCount, 2);
      assert.equal(resFull.data.observations.length, 1);
      assert.equal(resFull.data.observations[0].status, 'VALIDATED');
    }
  });

  it('3. Reconstructs lesson lifecycle transitions including candidate, approval, adoption, supersession, and retirement', () => {
    const events: Array<GovernanceEventEnvelope> = [
      {
        eventId: 'EVT-010',
        eventType: 'LESSON_CANDIDATE_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          lessonId: 'LES-001',
          statement: 'Always run build checks prior to PR submission',
          originatingObservationRefs: [{ observationId: 'OBS-001' }],
        },
      },
      {
        eventId: 'EVT-011',
        eventType: 'LESSON_APPROVED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-02T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          lessonRef: { lessonId: 'LES-001' },
          decisionRef: { decisionId: 'DEC-001' },
        },
      },
      {
        eventId: 'EVT-012',
        eventType: 'LESSON_ADOPTED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-03T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          lessonRef: { lessonId: 'LES-001' },
          adoptedByProjectRef: { projectId: 'PRJ-ALPHA' },
        },
      },
      {
        eventId: 'EVT-013',
        eventType: 'LESSON_CANDIDATE_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-04T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          lessonId: 'LES-002',
          statement: 'Always run containerized build checks prior to PR submission',
          originatingObservationRefs: [{ observationId: 'OBS-001' }],
        },
      },
      {
        eventId: 'EVT-014',
        eventType: 'LESSON_APPROVED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-05T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          lessonRef: { lessonId: 'LES-002' },
          decisionRef: { decisionId: 'DEC-002' },
        },
      },
      {
        eventId: 'EVT-015',
        eventType: 'LESSON_SUPERSEDED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-06T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: {
          supersededLessonRef: { lessonId: 'LES-001' },
          supersedingLessonRef: { lessonId: 'LES-002' },
        },
      },
    ];

    // Replay at 2026-09-03T12:00:00Z -> LES-001 active and approved
    const resMid = replayHistoricalEvents(events, { targetTimestamp: '2026-09-03T12:00:00Z' });
    assert.equal(resMid.ok, true);
    if (resMid.ok) {
      assert.equal(resMid.data.activeLessons.length, 1);
      assert.equal(resMid.data.activeLessons[0].lessonId, 'LES-001');
    }

    // Replay at 2026-09-07T12:00:00Z -> LES-001 superseded, LES-002 active
    const resFinal = replayHistoricalEvents(events, { targetTimestamp: '2026-09-07T12:00:00Z' });
    assert.equal(resFinal.ok, true);
    if (resFinal.ok) {
      assert.equal(resFinal.data.activeLessons.length, 1);
      assert.equal(resFinal.data.activeLessons[0].lessonId, 'LES-002');
    }
  });

  it('4. Reconstructs historical state by eventOffset (EVENT_OFFSET_REPLAY)', () => {
    const events: Array<GovernanceEventEnvelope> = [
      {
        eventId: 'EVT-001',
        eventType: 'LESSON_CANDIDATE_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { lessonId: 'LES-001', statement: 'Statement 1', originatingObservationRefs: [] },
      },
      {
        eventId: 'EVT-002',
        eventType: 'LESSON_APPROVED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-02T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { lessonRef: { lessonId: 'LES-001' }, decisionRef: { decisionId: 'DEC-001' } },
      },
      {
        eventId: 'EVT-003',
        eventType: 'LESSON_RETIRED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-03T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { retiredLessonRef: { lessonId: 'LES-001' }, reason: 'Outdated policy' },
      },
    ];

    // Offset = 2 (first 2 events processed -> LES-001 is approved)
    const resOffset2 = replayHistoricalEvents(events, { eventOffset: 2 });
    assert.equal(resOffset2.ok, true);
    if (resOffset2.ok) {
      assert.equal(resOffset2.data.eventsAppliedCount, 2);
      assert.equal(resOffset2.data.activeLessons.length, 1);
      assert.equal(resOffset2.data.activeLessons[0].lessonId, 'LES-001');
    }

    // Offset = 3 (all 3 processed -> LES-001 retired, 0 active lessons)
    const resOffset3 = replayHistoricalEvents(events, { eventOffset: 3 });
    assert.equal(resOffset3.ok, true);
    if (resOffset3.ok) {
      assert.equal(resOffset3.data.eventsAppliedCount, 3);
      assert.equal(resOffset3.data.activeLessons.length, 0);
    }
  });

  it('5. Opaquely preserves unsupported-version and unknown events without mutating historical state (CTR-GL-056)', () => {
    const events: Array<unknown> = [
      {
        branchType: 'SUPPORTED_KNOWN_EVENT',
        eventId: 'EVT-001',
        eventType: 'LESSON_CANDIDATE_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { lessonId: 'LES-001', statement: 'Statement 1', originatingObservationRefs: [] },
      },
      {
        branchType: 'UNSUPPORTED_VERSION_HISTORICAL_EVENT',
        eventId: 'EVT-002',
        eventType: 'LESSON_APPROVED',
        payloadVersion: '99.0.0',
        occurredAt: '2026-09-02T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { opaqueBytes: '0x123456' },
      },
      {
        branchType: 'UNKNOWN_TYPE_HISTORICAL_EVENT',
        eventId: 'EVT-003',
        eventType: 'EXPERIMENTAL_FUTURE_EVENT',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-03T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { futureData: 'custom' },
      },
    ];

    const res = replayHistoricalEvents(events);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalEventsExamined, 3);
      assert.equal(res.data.preservedOpaqueEvents.length, 2);
      // Opaque events MUST NOT mutate interpreted active lesson state
      assert.equal(res.data.activeLessons.length, 0);
    }
  });

  it('6. Opaquely preserves historical command envelopes without mutating historical state (CTR-GL-057)', () => {
    const events: Array<unknown> = [
      {
        branchType: 'HISTORICAL_COMMAND_PRESERVATION',
        commandId: 'CMD-001',
        commandType: 'PROPOSE_LESSON_CANDIDATE',
        payloadVersion: '1.0.0',
        issuedAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { commandData: 'opaque' },
      },
    ];

    const res = replayHistoricalEvents(events);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.preservedOpaqueCommands.length, 1);
      assert.equal(res.data.activeLessons.length, 0);
    }
  });

  it('7. Refuses future target timestamp queries with REFUSAL_REPLAY_TIMESTAMP_FUTURE (INV-GL-036)', () => {
    const events: Array<GovernanceEventEnvelope> = [
      {
        eventId: 'EVT-001',
        eventType: 'LESSON_CANDIDATE_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { lessonId: 'LES-001', statement: 'Statement 1', originatingObservationRefs: [] },
      },
    ];

    const futureTimestamp = '2099-12-31T23:59:59Z';
    const res = replayHistoricalEvents(events, { targetTimestamp: futureTimestamp });

    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'REFUSED') {
      assert.equal(res.refusalCode, 'REFUSAL_REPLAY_TIMESTAMP_FUTURE');
      assert.ok(res.reason.includes('future'));
    }
  });

  it('8. Refuses invalid or negative eventOffset with REFUSAL_REPLAY_BOUNDS_EXCEEDED', () => {
    const events: Array<GovernanceEventEnvelope> = [
      {
        eventId: 'EVT-001',
        eventType: 'LESSON_CANDIDATE_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { lessonId: 'LES-001', statement: 'Statement 1', originatingObservationRefs: [] },
      },
    ];

    const resNeg = replayHistoricalEvents(events, { eventOffset: -1 });
    assert.equal(resNeg.ok, false);
    if (!resNeg.ok && resNeg.category === 'REFUSED') {
      assert.equal(resNeg.refusalCode, 'REFUSAL_REPLAY_BOUNDS_EXCEEDED');
    }

    const resOver = replayHistoricalEvents(events, { eventOffset: 99 });
    assert.equal(resOver.ok, false);
    if (!resOver.ok && resOver.category === 'REFUSED') {
      assert.equal(resOver.refusalCode, 'REFUSAL_REPLAY_BOUNDS_EXCEEDED');
    }
  });

  it('9. Performs replay deterministically and does not mutate input event arrays or persistence records', () => {
    const originalEvents: Array<GovernanceEventEnvelope> = [
      {
        eventId: 'EVT-001',
        eventType: 'LESSON_CANDIDATE_CREATED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-01T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { lessonId: 'LES-001', statement: 'Statement 1', originatingObservationRefs: [] },
      },
      {
        eventId: 'EVT-002',
        eventType: 'LESSON_APPROVED',
        payloadVersion: '1.0.0',
        occurredAt: '2026-09-02T10:00:00Z',
        actorRef,
        authorityContextRef,
        payload: { lessonRef: { lessonId: 'LES-001' }, decisionRef: { decisionId: 'DEC-001' } },
      },
    ];

    const inputCopy = JSON.parse(JSON.stringify(originalEvents));

    // Append to repository
    repository.appendEvent(originalEvents[0]);
    repository.appendEvent(originalEvents[1]);

    const res1 = engine.replayFromPersistence();
    const res2 = engine.replayEvents(originalEvents);

    assert.equal(res1.ok, true);
    assert.equal(res2.ok, true);

    if (res1.ok && res2.ok) {
      assert.deepEqual(res1.data.activeLessons, res2.data.activeLessons);
      assert.equal(res1.data.totalEventsExamined, 2);
    }

    // Input events array must NOT be mutated
    assert.deepEqual(originalEvents, inputCopy);
  });

  it('10. Refuses replayFromPersistence when persistencePort is unavailable', () => {
    const standaloneEngine = new HistoricalReplayEngine();
    const res = standaloneEngine.replayFromPersistence();

    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'REFUSED') {
      assert.equal(res.refusalCode, 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE');
    }
  });
});
