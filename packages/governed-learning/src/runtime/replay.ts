import type { GovernancePersistencePort } from './persistence.js';
import type {
  RuntimeOperationResult,
} from './types.js';
import { RuntimeInvariantError } from './errors.js';

/**
 * NON_CONTRACT_INTERNAL_TYPE
 * Parameters for executing a historical learning replay query (CTR-GL-038).
 */
export interface HistoricalReplayQueryParams {
  readonly targetTimestamp?: string;
  readonly eventOffset?: number;
  readonly filterByScope?: unknown;
}

/**
 * NON_CONTRACT_INTERNAL_TYPE
 * Reconstructed historical state snapshot result produced by historical replay (CTR-GL-039).
 */
export interface HistoricalReplayStateSnapshot {
  readonly targetTimestamp?: string;
  readonly eventOffset?: number;
  readonly totalEventsExamined: number;
  readonly eventsAppliedCount: number;
  readonly activeLessons: ReadonlyArray<Readonly<Record<string, unknown>>>;
  readonly observations: ReadonlyArray<Readonly<Record<string, unknown>>>;
  readonly preservedOpaqueEvents: ReadonlyArray<Readonly<Record<string, unknown>>>;
  readonly preservedOpaqueCommands: ReadonlyArray<Readonly<Record<string, unknown>>>;
  readonly derivedAt: string;
}

/**
 * Deep clones an object for defensive immutability.
 */
function deepClone<T>(val: T): T {
  if (val === undefined || val === null) {
    return val;
  }
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(val);
    }
  } catch {
    // Fallback if structuredClone fails on non-serializable objects
  }
  return JSON.parse(JSON.stringify(val));
}

/**
 * Extracts timestamp string from event object or envelope.
 */
function extractEventTimestamp(event: Record<string, unknown>): string | undefined {
  if (typeof event.occurredAt === 'string') return event.occurredAt;
  if (typeof event.eventTimestamp === 'string') return event.eventTimestamp;
  if (typeof event.timestamp === 'string') return event.timestamp;
  if (typeof event.issuedAt === 'string') return event.issuedAt;
  const payload = event.payload as Record<string, unknown> | undefined;
  if (payload) {
    if (typeof payload.occurredAt === 'string') return payload.occurredAt;
    if (typeof payload.eventTimestamp === 'string') return payload.eventTimestamp;
    if (typeof payload.timestamp === 'string') return payload.timestamp;
  }
  return undefined;
}

/**
 * Extracts event type discriminator from event object or envelope.
 */
function extractEventType(event: Record<string, unknown>): string | undefined {
  if (typeof event.eventType === 'string') return event.eventType;
  if (typeof event.commandType === 'string') return event.commandType;
  const payload = event.payload as Record<string, unknown> | undefined;
  if (payload && typeof payload.eventType === 'string') return payload.eventType;
  return undefined;
}

/**
 * Extracts unwrapped payload object from event object or envelope.
 */
function extractPayload(event: Record<string, unknown>): Record<string, unknown> {
  if (event.payload && typeof event.payload === 'object') {
    return event.payload as Record<string, unknown>;
  }
  return event;
}

/**
 * Helper function for replaying historical events.
 * Reconstructs historical learning state at target timestamp or event offset (CTR-GL-038, CTR-GL-039).
 */
export function replayHistoricalEvents(
  eventsInput: ReadonlyArray<unknown>,
  params: HistoricalReplayQueryParams = {}
): RuntimeOperationResult<HistoricalReplayStateSnapshot> {
  if (!Array.isArray(eventsInput)) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Historical replay input events must be an array'),
    };
  }

  const { targetTimestamp, eventOffset } = params;
  const nowIso = new Date().toISOString();

  // Validate eventOffset bounds
  if (eventOffset !== undefined) {
    if (typeof eventOffset !== 'number' || !Number.isInteger(eventOffset) || eventOffset < 0) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_REPLAY_BOUNDS_EXCEEDED',
        reason: `Replay event offset ${eventOffset} is invalid or negative`,
      };
    }
    if (eventOffset > eventsInput.length) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_REPLAY_BOUNDS_EXCEEDED',
        reason: `Replay event offset ${eventOffset} exceeds total event count ${eventsInput.length}`,
      };
    }
  }

  // Parse and clone events defensively
  const clonedEvents = eventsInput.map((e) => deepClone(e) as Record<string, unknown>);

  // Compute max timestamp across historical events
  let maxHistoricalTimestamp = '';
  for (const ev of clonedEvents) {
    const ts = extractEventTimestamp(ev);
    if (ts && ts > maxHistoricalTimestamp) {
      maxHistoricalTimestamp = ts;
    }
  }

  // Validate targetTimestamp future refusal (INV-GL-036)
  if (targetTimestamp !== undefined) {
    if (typeof targetTimestamp !== 'string' || Number.isNaN(Date.parse(targetTimestamp))) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`Invalid targetTimestamp format: ${targetTimestamp}`),
      };
    }

    // Refuse if targetTimestamp is in the future relative to wall clock or max historical event timestamp
    if (targetTimestamp > nowIso || (maxHistoricalTimestamp !== '' && targetTimestamp > maxHistoricalTimestamp && targetTimestamp > nowIso)) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_REPLAY_TIMESTAMP_FUTURE',
        reason: `Target replay timestamp ${targetTimestamp} is in the future (INV-GL-036)`,
      };
    }
  }

  // Deterministic chronological ordering (eventTimestamp / occurredAt ascending, preserving original position on ties)
  const indexedEvents = clonedEvents.map((ev, originalIndex) => ({
    ev,
    originalIndex,
    ts: extractEventTimestamp(ev) ?? '',
  }));

  indexedEvents.sort((a, b) => {
    if (a.ts !== '' && b.ts !== '') {
      const cmp = a.ts.localeCompare(b.ts);
      if (cmp !== 0) return cmp;
    }
    return a.originalIndex - b.originalIndex;
  });

  // Filter events up to targetTimestamp or eventOffset
  let candidateEvents = indexedEvents.map((item) => item.ev);

  if (targetTimestamp !== undefined) {
    candidateEvents = candidateEvents.filter((ev) => {
      const ts = extractEventTimestamp(ev);
      return ts !== undefined && ts <= targetTimestamp;
    });
  }

  if (eventOffset !== undefined) {
    candidateEvents = candidateEvents.slice(0, eventOffset);
  }

  const observationsMap = new Map<string, Record<string, unknown>>();
  const lessonsMap = new Map<string, Record<string, unknown>>();
  const preservedOpaqueEvents: Array<Record<string, unknown>> = [];
  const preservedOpaqueCommands: Array<Record<string, unknown>> = [];

  let eventsAppliedCount = 0;

  for (const ev of candidateEvents) {
    eventsAppliedCount++;
    const branchType = ev.branchType as string | undefined;
    const eventType = extractEventType(ev);
    const payload = extractPayload(ev);

    // Opaque preservation envelopes (CTR-GL-056, CTR-GL-057)
    if (
      branchType === 'UNSUPPORTED_VERSION_HISTORICAL_EVENT' ||
      branchType === 'UNKNOWN_TYPE_HISTORICAL_EVENT' ||
      branchType === 'HISTORICAL_EVENT_PRESERVATION'
    ) {
      preservedOpaqueEvents.push(deepClone(ev));
      continue;
    }

    if (
      branchType === 'HISTORICAL_COMMAND_PRESERVATION' ||
      ev.commandId !== undefined ||
      ev.commandType !== undefined
    ) {
      preservedOpaqueCommands.push(deepClone(ev));
      continue;
    }

    // Process canonical supported event discriminators
    switch (eventType) {
      case 'OBSERVATION_CREATED': {
        const obsId = (payload.observationId as string) ?? (payload.value as string);
        if (obsId) {
          observationsMap.set(obsId, {
            observationId: obsId,
            category: payload.category,
            statement: payload.statement,
            evidenceRefs: deepClone(payload.evidenceRefs ?? []),
            status: 'UNVALIDATED',
            createdAt: extractEventTimestamp(ev) ?? nowIso,
          });
        }
        break;
      }

      case 'OBSERVATION_VALIDATED': {
        const obsId = (payload.observationId as string) ?? (payload.value as string);
        if (obsId && observationsMap.has(obsId)) {
          const obs = observationsMap.get(obsId)!;
          obs.status = 'VALIDATED';
          obs.validationRecord = {
            validationType: payload.validationType,
            verdict: payload.verdict,
            validatedBy: deepClone(payload.validatedBy),
            validatedAt: extractEventTimestamp(ev) ?? nowIso,
          };
        }
        break;
      }

      case 'LESSON_CANDIDATE_CREATED': {
        const lessonId = (payload.lessonId as string) ?? (payload.value as string);
        if (lessonId) {
          lessonsMap.set(lessonId, {
            lessonId,
            statement: payload.statement,
            originatingObservationRefs: deepClone(payload.originatingObservationRefs ?? []),
            status: 'CANDIDATE',
            createdAt: extractEventTimestamp(ev) ?? nowIso,
          });
        }
        break;
      }

      case 'LESSON_APPROVED': {
        const lessonRefObj = payload.lessonRef as Record<string, unknown> | string | undefined;
        const lessonId =
          typeof lessonRefObj === 'object' && lessonRefObj !== null
            ? ((lessonRefObj.lessonId as string) ?? (lessonRefObj.value as string))
            : (lessonRefObj as string);

        if (lessonId) {
          const existing = lessonsMap.get(lessonId) ?? { lessonId };
          lessonsMap.set(lessonId, {
            ...existing,
            lessonId,
            status: 'APPROVED',
            approvedAt: extractEventTimestamp(ev) ?? nowIso,
            decisionRef: deepClone(payload.decisionRef),
          });
        }
        break;
      }

      case 'LESSON_SUPERSEDED': {
        const supersededRefObj = payload.supersededLessonRef as Record<string, unknown> | string | undefined;
        const supersededId =
          typeof supersededRefObj === 'object' && supersededRefObj !== null
            ? ((supersededRefObj.lessonId as string) ?? (supersededRefObj.value as string))
            : (supersededRefObj as string);

        if (supersededId && lessonsMap.has(supersededId)) {
          const lesson = lessonsMap.get(supersededId)!;
          lesson.status = 'SUPERSEDED';
          lesson.supersededByLessonRef = deepClone(payload.supersedingLessonRef);
          lesson.effectiveUntil = extractEventTimestamp(ev) ?? nowIso;
        }
        break;
      }

      case 'LESSON_RETIRED': {
        const retiredRefObj = payload.retiredLessonRef as Record<string, unknown> | string | undefined;
        const retiredId =
          typeof retiredRefObj === 'object' && retiredRefObj !== null
            ? ((retiredRefObj.lessonId as string) ?? (retiredRefObj.value as string))
            : (retiredRefObj as string);

        if (retiredId && lessonsMap.has(retiredId)) {
          const lesson = lessonsMap.get(retiredId)!;
          lesson.status = 'RETIRED';
          lesson.retirementReason = payload.reason;
          lesson.effectiveUntil = extractEventTimestamp(ev) ?? nowIso;
        }
        break;
      }

      case 'LESSON_ADOPTED': {
        const lessonRefObj = payload.lessonRef as Record<string, unknown> | string | undefined;
        const lessonId =
          typeof lessonRefObj === 'object' && lessonRefObj !== null
            ? ((lessonRefObj.lessonId as string) ?? (lessonRefObj.value as string))
            : (lessonRefObj as string);

        if (lessonId && lessonsMap.has(lessonId)) {
          const lesson = lessonsMap.get(lessonId)!;
          lesson.adoptedByProjectRef = deepClone(payload.adoptedByProjectRef);
        }
        break;
      }

      default: {
        // Unknown or unsupported event discriminators preserved opaquely
        preservedOpaqueEvents.push(deepClone(ev));
        break;
      }
    }
  }

  // Active lessons = APPROVED lessons
  const activeLessons = Array.from(lessonsMap.values())
    .filter((l) => l.status === 'APPROVED')
    .map((l) => deepClone(l));

  const observations = Array.from(observationsMap.values()).map((o) => deepClone(o));

  const snapshot: HistoricalReplayStateSnapshot = {
    targetTimestamp,
    eventOffset,
    totalEventsExamined: eventsInput.length,
    eventsAppliedCount,
    activeLessons,
    observations,
    preservedOpaqueEvents: preservedOpaqueEvents.map((e) => deepClone(e)),
    preservedOpaqueCommands: preservedOpaqueCommands.map((c) => deepClone(c)),
    derivedAt: nowIso,
  };

  return {
    ok: true,
    category: 'SUCCESS',
    data: snapshot,
  };
}

/**
 * Historical Replay Engine (GL-IMPL-UNIT-007)
 * Engine class for executing read-only historical learning context replay.
 */
export class HistoricalReplayEngine {
  constructor(private readonly persistencePort?: GovernancePersistencePort) {}

  /**
   * Replays historical events directly from an in-memory or port event log.
   */
  public replayEvents(
    events?: ReadonlyArray<unknown>,
    params?: HistoricalReplayQueryParams
  ): RuntimeOperationResult<HistoricalReplayStateSnapshot> {
    let eventsToReplay = events;

    if (!eventsToReplay && this.persistencePort) {
      const getRes = this.persistencePort.getEvents();
      if (getRes && typeof (getRes as any).then === 'function') {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError('Synchronous replay requires a synchronous persistence port'),
        };
      }
      const syncGetRes = getRes as RuntimeOperationResult<ReadonlyArray<unknown>>;
      if (!syncGetRes.ok) {
        return syncGetRes as any;
      }
      eventsToReplay = syncGetRes.data;
    }

    if (!eventsToReplay) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('No events provided for historical replay'),
      };
    }

    return replayHistoricalEvents(eventsToReplay, params);
  }

  /**
   * Reads events from the persistence port and replays up to the specified target.
   */
  public replayFromPersistence(
    params?: HistoricalReplayQueryParams
  ): RuntimeOperationResult<HistoricalReplayStateSnapshot> {
    if (!this.persistencePort) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE',
        reason: 'Governance persistence port is required for replayFromPersistence',
      };
    }

    const getRes = this.persistencePort.getEvents();
    if (getRes && typeof (getRes as any).then === 'function') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Synchronous replay requires a synchronous persistence port'),
      };
    }

    const syncGetRes = getRes as RuntimeOperationResult<ReadonlyArray<unknown>>;
    if (!syncGetRes.ok) {
      return syncGetRes as any;
    }

    return replayHistoricalEvents(syncGetRes.data, params);
  }
}
