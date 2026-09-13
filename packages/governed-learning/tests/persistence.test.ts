import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryGovernanceRepository } from '../src/runtime/persistence.js';
import type { GovernancePersistencePort } from '../src/runtime/persistence.js';

describe('Wave 6 Persistence — GovernancePersistencePort & InMemoryGovernanceRepository', () => {
  let repo: InMemoryGovernanceRepository;
  let port: GovernancePersistencePort;

  beforeEach(() => {
    repo = new InMemoryGovernanceRepository();
    port = repo;
  });

  it('1. initial state of empty in-memory store', () => {
    const eventsResult = port.getEvents();
    assert.equal(eventsResult.ok, true);
    if (eventsResult.ok) {
      assert.deepEqual(eventsResult.data, []);
    }

    const obsResult = port.getObservationByRef('obs-nonexistent');
    assert.equal(obsResult.ok, false);
    if (!obsResult.ok) {
      assert.equal(obsResult.category, 'REFUSED');
      assert.equal(obsResult.refusalCode, 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE');
    }
  });

  it('2. append one canonical event', () => {
    const eventPayload = {
      eventType: 'OBSERVATION_CREATED',
      observationRef: { value: 'obs-ref-001' },
      observedAt: '2026-09-13T10:00:00Z',
    };
    const eventEnvelope = {
      eventRef: { value: 'evt-ref-001' },
      eventType: 'OBSERVATION_CREATED',
      payloadVersion: '1.0.0',
      payload: eventPayload,
    };

    const appendRes = port.appendEvent(eventEnvelope);
    assert.equal(appendRes.ok, true);
    if (appendRes.ok) {
      assert.equal(appendRes.data.appended, true);
      assert.equal(appendRes.data.eventRef, 'evt-ref-001');
    }

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal(getRes.data.length, 1);
      assert.deepEqual(getRes.data[0], eventEnvelope);
    }
  });

  it('3. append multiple canonical events', () => {
    const evt1 = { eventRef: { value: 'evt-001' }, eventType: 'OBSERVATION_CREATED' };
    const evt2 = { eventRef: { value: 'evt-002' }, eventType: 'OBSERVATION_VALIDATED' };
    const evt3 = { eventRef: { value: 'evt-003' }, eventType: 'LESSON_APPROVED' };

    port.appendEvent(evt1);
    port.appendEvent(evt2);
    port.appendEvent(evt3);

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal(getRes.data.length, 3);
    }
  });

  it('4. preserve deterministic append order', () => {
    const evtA = { eventRef: { value: 'evt-A' }, seq: 1 };
    const evtB = { eventRef: { value: 'evt-B' }, seq: 2 };
    const evtC = { eventRef: { value: 'evt-C' }, seq: 3 };

    port.appendEvent(evtA);
    port.appendEvent(evtB);
    port.appendEvent(evtC);

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal((getRes.data[0] as any).seq, 1);
      assert.equal((getRes.data[1] as any).seq, 2);
      assert.equal((getRes.data[2] as any).seq, 3);
    }
  });

  it('5. retrieve persisted events without mutation', () => {
    const evt = { eventRef: { value: 'evt-001' }, data: 'original' };
    port.appendEvent(evt);

    const res1 = port.getEvents();
    assert.equal(res1.ok, true);
    if (res1.ok) {
      (res1.data[0] as any).data = 'mutated_by_caller';
    }

    const res2 = port.getEvents();
    assert.equal(res2.ok, true);
    if (res2.ok) {
      assert.equal((res2.data[0] as any).data, 'original');
    }
  });

  it('6. caller reference mutation does not affect stored history', () => {
    const mutableObj = {
      eventRef: { value: 'evt-mutable' },
      details: { count: 100 },
    };

    port.appendEvent(mutableObj);

    // Mutate original caller object
    mutableObj.details.count = 999;

    const res = port.getEvents();
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal((res.data[0] as any).details.count, 100);
    }
  });

  it('7. adapter does not synthesize IDs', () => {
    const rawEvent = { payloadVersion: '1.0.0' }; // No eventRef
    port.appendEvent(rawEvent);

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal((getRes.data[0] as any).eventRef, undefined);
      assert.equal((getRes.data[0] as any).eventId, undefined);
    }
  });

  it('8. adapter does not synthesize timestamps', () => {
    const rawEvent = { eventRef: { value: 'evt-no-time' } };
    port.appendEvent(rawEvent);

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal((getRes.data[0] as any).timestamp, undefined);
      assert.equal((getRes.data[0] as any).appendedAt, undefined);
      assert.equal((getRes.data[0] as any).effectiveFrom, undefined);
    }
  });

  it('9. adapter does not default versions', () => {
    const rawEvent = { eventRef: { value: 'evt-no-version' } };
    port.appendEvent(rawEvent);

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal((getRes.data[0] as any).payloadVersion, undefined);
      assert.equal((getRes.data[0] as any).version, undefined);
    }
  });

  it('10. historical record mutation is denied on overwrite attempt', () => {
    const obs = {
      observationRef: { value: 'obs-001' },
      content: 'Original Observation',
    };

    const save1 = port.saveObservation(obs);
    assert.equal(save1.ok, true);

    const obsDuplicate = {
      observationRef: { value: 'obs-001' },
      content: 'Attempted Overwrite',
    };

    const save2 = port.saveObservation(obsDuplicate);
    assert.equal(save2.ok, false);
    if (!save2.ok) {
      assert.equal(save2.category, 'REFUSED');
      assert.equal(save2.refusalCode, 'REFUSAL_HISTORICAL_MUTATION_DENIED');
    }

    // Verify store still holds original content
    const getRes = port.getObservationByRef('obs-001');
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal((getRes.data as any).content, 'Original Observation');
    }
  });

  it('11. does not implement historical replay semantics', () => {
    // Port contains no replay method or time-travel reconstruction
    assert.equal((port as any).replay, undefined);
    assert.equal((port as any).reconstructStateAt, undefined);
  });

  it('12. does not implement idempotency policy resolution', () => {
    // Appending identical payload twice appends twice to storage without deduplication policy
    const evt = { eventRef: { value: 'evt-dup' }, payload: 'test' };
    port.appendEvent(evt);
    port.appendEvent(evt);

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.equal(getRes.data.length, 2);
    }
  });

  it('13. does not implement concurrency control policy', () => {
    // Port contains no locking, transactions, or ETag checks
    assert.equal((port as any).acquireLock, undefined);
    assert.equal((port as any).checkETag, undefined);
  });

  it('14. supports CTR-GL-056 UnsupportedVersionHistoricalEventEnvelope preservation without mutation', () => {
    const opaqueEnvelope = {
      preservationKind: 'UNSUPPORTED_VERSION_HISTORICAL_EVENT',
      opaquePayload: { unknownField: 'preserved-value', rawVersion: '99.0.0' },
    };

    const res = port.appendEvent(opaqueEnvelope);
    assert.equal(res.ok, true);

    const getRes = port.getEvents();
    assert.equal(getRes.ok, true);
    if (getRes.ok) {
      assert.deepEqual(getRes.data[0], opaqueEnvelope);
    }
  });

  it('15. test-local adapter isolation via resetForTesting()', () => {
    port.appendEvent({ eventRef: { value: 'evt-temp' } });
    port.saveObservation({ observationRef: { value: 'obs-temp' } });

    assert.equal((port.getEvents() as any).data.length, 1);
    assert.equal((port.getObservationByRef('obs-temp') as any).ok, true);

    repo.resetForTesting();

    assert.equal((port.getEvents() as any).data.length, 0);
    assert.equal((port.getObservationByRef('obs-temp') as any).ok, false);
  });
});
