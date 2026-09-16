import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  EventPayloadSchemaRegistry,
  CommandPayloadSchemaRegistry,
  IsSupportedEventPayloadVersion,
  IsSupportedCommandPayloadVersion,
  ObservationCreatedEventPayloadSchema,
  DraftObservationCommandPayloadSchema,
  StoredHistoricalEventSchema,
} from '../src/index.js';

describe('Version Dispatch & Registries', () => {
  test('Event registry supports per-event-type version registration and predicate check', () => {
    EventPayloadSchemaRegistry.registerSchema('OBSERVATION_CREATED', 'v1.0.0', ObservationCreatedEventPayloadSchema);

    assert.equal(IsSupportedEventPayloadVersion('OBSERVATION_CREATED', 'v1.0.0'), true);
    assert.equal(IsSupportedEventPayloadVersion('OBSERVATION_CREATED', 'v2.0.0'), false);
    assert.equal(IsSupportedEventPayloadVersion('LESSON_APPROVED', 'v1.0.0'), false);
  });

  test('Command registry supports per-command-type version registration and predicate check', () => {
    CommandPayloadSchemaRegistry.registerSchema('DraftObservation', 'v1.0.0', DraftObservationCommandPayloadSchema);

    assert.equal(IsSupportedCommandPayloadVersion('DraftObservation', 'v1.0.0'), true);
    assert.equal(IsSupportedCommandPayloadVersion('DraftObservation', 'v2.0.0'), false);
    assert.equal(IsSupportedCommandPayloadVersion('ApproveLesson', 'v1.0.0'), false);
  });

  test('StoredHistoricalEvent 3-branch discriminated union', () => {
    const supportedBranch = StoredHistoricalEventSchema.parse({
      branchType: 'SUPPORTED_KNOWN_EVENT',
      eventId: 'evt-1',
      eventType: 'OBSERVATION_CREATED',
      payloadVersion: 'v1.0.0',
      occurredAt: '2026-09-11T12:00:00Z',
      actorRef: { actorId: 'act-1', actorType: 'SYSTEM' },
      authorityContextRef: { authorityId: 'auth-1' },
      payload: { observationId: 'obs-1', category: 'MECHANICAL', statement: 'Statement', evidenceRefs: [] },
    });
    assert.equal(supportedBranch.branchType, 'SUPPORTED_KNOWN_EVENT');

    const unsupportedVersionBranch = StoredHistoricalEventSchema.parse({
      branchType: 'UNSUPPORTED_VERSION_HISTORICAL_EVENT',
      eventId: 'evt-2',
      eventType: 'OBSERVATION_CREATED',
      payloadVersion: 'v99.0.0',
      occurredAt: '2026-09-11T12:00:00Z',
      actorRef: { actorId: 'act-1', actorType: 'SYSTEM' },
      authorityContextRef: { authorityId: 'auth-1' },
      payload: { opaqueField: 123 },
    });
    assert.equal(unsupportedVersionBranch.branchType, 'UNSUPPORTED_VERSION_HISTORICAL_EVENT');

    const unknownTypeBranch = StoredHistoricalEventSchema.parse({
      branchType: 'UNKNOWN_TYPE_HISTORICAL_EVENT',
      eventId: 'evt-3',
      eventType: 'UNKNOWN_CUSTOM_EVENT',
      payloadVersion: 'v1.0.0',
      occurredAt: '2026-09-11T12:00:00Z',
      actorRef: { actorId: 'act-1', actorType: 'SYSTEM' },
      authorityContextRef: { authorityId: 'auth-1' },
      payload: 'opaque scalar payload',
    });
    assert.equal(unknownTypeBranch.branchType, 'UNKNOWN_TYPE_HISTORICAL_EVENT');
  });
});
