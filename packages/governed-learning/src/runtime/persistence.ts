import type { RuntimeOperationResult } from './types.js';
import { RuntimeInvariantError } from './errors.js';
import type { TransactionContext } from '../contracts/ports.js';

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
 * CTR-GL-055: GovernancePersistencePort — Infrastructure Port Contract
 * Shared persistence interface contract used by the Governed Learning module.
 */
export interface GovernancePersistencePort {
  /**
   * Appends an event to the append-only governance event log.
   */
  appendEvent(
    event: unknown,
    transactionContext?: TransactionContext
  ):
    | Promise<RuntimeOperationResult<{ readonly eventRef?: string; readonly appended: boolean }>>
    | RuntimeOperationResult<{ readonly eventRef?: string; readonly appended: boolean }>;

  /**
   * Retrieves stored governance events in deterministic append order.
   */
  getEvents(
    filter?: { readonly eventRef?: string; readonly eventType?: string },
    transactionContext?: TransactionContext
  ): Promise<RuntimeOperationResult<ReadonlyArray<unknown>>> | RuntimeOperationResult<ReadonlyArray<unknown>>;

  /**
   * Stores an observation or verified observation.
   */
  saveObservation(
    observation: unknown,
    transactionContext?: TransactionContext
  ):
    | Promise<RuntimeOperationResult<{ readonly observationRef: string; readonly saved: boolean }>>
    | RuntimeOperationResult<{ readonly observationRef: string; readonly saved: boolean }>;

  /**
   * Retrieves an observation by reference.
   */
  getObservationByRef(
    observationRef: string,
    transactionContext?: TransactionContext,
    forUpdate?: boolean
  ): Promise<RuntimeOperationResult<unknown>> | RuntimeOperationResult<unknown>;

  /**
   * Stores a lesson candidate or approved lesson.
   */
  saveLesson(
    lesson: unknown,
    transactionContext?: TransactionContext
  ):
    | Promise<RuntimeOperationResult<{ readonly lessonRef: string; readonly saved: boolean }>>
    | RuntimeOperationResult<{ readonly lessonRef: string; readonly saved: boolean }>;

  /**
   * Retrieves a lesson by reference.
   */
  getLessonByRef(
    lessonRef: string,
    transactionContext?: TransactionContext,
    forUpdate?: boolean
  ): Promise<RuntimeOperationResult<unknown>> | RuntimeOperationResult<unknown>;

  /**
   * Stores a rule candidate proposal.
   */
  saveRuleCandidate(
    proposal: unknown,
    transactionContext?: TransactionContext
  ):
    | Promise<RuntimeOperationResult<{ readonly ruleCandidateId: string; readonly saved: boolean }>>
    | RuntimeOperationResult<{ readonly ruleCandidateId: string; readonly saved: boolean }>;

  /**
   * Retrieves a rule candidate proposal by ID.
   */
  getRuleCandidateById(
    ruleCandidateId: string,
    transactionContext?: TransactionContext,
    forUpdate?: boolean
  ): Promise<RuntimeOperationResult<unknown>> | RuntimeOperationResult<unknown>;
}

/**
 * Bounded transient in-memory repository adapter implementing GovernancePersistencePort (CTR-GL-055).
 * 
 * Rules:
 * - Append-only event history (APPEND_ONLY_LEARNING_HISTORY).
 * - Rejects historical mutation, in-place replacements, silent overwrites, and retroactive edits.
 * - Defensive copying via deep cloning on storage and retrieval to prevent caller reference mutation.
 * - Does not generate IDs, timestamps, or versions.
 * - Does not implement idempotency policy (OPEN-GL-RUNTIME-005) or concurrency control (OPEN-GL-RUNTIME-006).
 * - Does not implement replay, eligibility filtering, database IO, or durable storage.
 */
export class InMemoryGovernanceRepository implements GovernancePersistencePort {
  private readonly events: Array<unknown> = [];
  private readonly observations: Map<string, unknown> = new Map();
  private readonly lessons: Map<string, unknown> = new Map();
  private readonly ruleCandidates: Map<string, unknown> = new Map();

  /**
   * Appends an event to the append-only log.
   */
  public appendEvent(
    event: unknown,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly eventRef?: string; readonly appended: boolean }> {
    if (!event || typeof event !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot append null or invalid event to persistence log'),
      };
    }

    // Defensive copy on append to prevent reference mutation
    const cloned = deepClone(event);
    this.events.push(cloned);

    const eventRef = (cloned as Record<string, unknown>)?.eventRef;
    const refStr = typeof eventRef === 'object' && eventRef !== null ? (eventRef as Record<string, unknown>).value : eventRef;

    return {
      ok: true,
      category: 'SUCCESS',
      data: {
        eventRef: typeof refStr === 'string' ? refStr : undefined,
        appended: true,
      },
    };
  }

  /**
   * Retrieves stored events in deterministic append order without mutation.
   */
  public getEvents(
    filter?: { readonly eventRef?: string; readonly eventType?: string },
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<ReadonlyArray<unknown>> {
    let result = this.events;

    if (filter?.eventRef) {
      result = result.filter((e) => {
        const refObj = (e as Record<string, unknown>)?.eventRef;
        const refStr = typeof refObj === 'object' && refObj !== null ? (refObj as Record<string, unknown>).value : refObj;
        return refStr === filter.eventRef;
      });
    }

    if (filter?.eventType) {
      result = result.filter((e) => {
        const typeStr =
          (e as Record<string, unknown>)?.eventType ??
          ((e as Record<string, unknown>)?.payload as Record<string, unknown>)?.eventType;
        return typeStr === filter.eventType;
      });
    }

    // Defensive copy on read
    return {
      ok: true,
      category: 'SUCCESS',
      data: result.map((e) => deepClone(e)),
    };
  }

  /**
   * Stores an observation or verified observation.
   */
  public saveObservation(
    observation: unknown,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly observationRef: string; readonly saved: boolean }> {
    if (!observation || typeof observation !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot save null or invalid observation'),
      };
    }

    const refObj = (observation as Record<string, unknown>)?.observationRef;
    const ref = typeof refObj === 'object' && refObj !== null ? (refObj as Record<string, unknown>).value : refObj;

    if (!ref || typeof ref !== 'string') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Observation must possess a valid observationRef'),
      };
    }

    // Rejects overwrite of historical records
    if (this.observations.has(ref)) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
        reason: `Observation reference ${ref} already exists and historical mutation is denied`,
      };
    }

    const cloned = deepClone(observation);
    this.observations.set(ref, cloned);

    return {
      ok: true,
      category: 'SUCCESS',
      data: {
        observationRef: ref,
        saved: true,
      },
    };
  }

  /**
   * Retrieves an observation by reference.
   */
  public getObservationByRef(
    observationRef: string,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<unknown> {
    const item = this.observations.get(observationRef);
    if (!item) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE',
        reason: `Observation ${observationRef} not found in persistence store`,
      };
    }

    return {
      ok: true,
      category: 'SUCCESS',
      data: deepClone(item),
    };
  }

  /**
   * Stores a lesson candidate or approved lesson.
   */
  public saveLesson(
    lesson: unknown,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly lessonRef: string; readonly saved: boolean }> {
    if (!lesson || typeof lesson !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot save null or invalid lesson'),
      };
    }

    const refObj =
      (lesson as Record<string, unknown>)?.lessonRef ??
      (lesson as Record<string, unknown>)?.lessonCandidateRef;
    const ref = typeof refObj === 'object' && refObj !== null ? (refObj as Record<string, unknown>).value : refObj;

    if (!ref || typeof ref !== 'string') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Lesson must possess a valid lessonRef or lessonCandidateRef'),
      };
    }

    // Rejects overwrite of historical records
    if (this.lessons.has(ref)) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
        reason: `Lesson reference ${ref} already exists and historical mutation is denied`,
      };
    }

    const cloned = deepClone(lesson);
    this.lessons.set(ref, cloned);

    return {
      ok: true,
      category: 'SUCCESS',
      data: {
        lessonRef: ref,
        saved: true,
      },
    };
  }

  /**
   * Retrieves a lesson by reference.
   */
  public getLessonByRef(
    lessonRef: string,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<unknown> {
    const item = this.lessons.get(lessonRef);
    if (!item) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE',
        reason: `Lesson ${lessonRef} not found in persistence store`,
      };
    }

    return {
      ok: true,
      category: 'SUCCESS',
      data: deepClone(item),
    };
  }

  /**
   * Stores a rule candidate proposal.
   */
  public saveRuleCandidate(
    proposal: unknown,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly ruleCandidateId: string; readonly saved: boolean }> {
    if (!proposal || typeof proposal !== 'object') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Cannot save null or invalid rule candidate proposal'),
      };
    }

    const idObj = (proposal as Record<string, unknown>)?.ruleCandidateId;
    const id = typeof idObj === 'object' && idObj !== null ? (idObj as Record<string, unknown>).value : idObj;

    if (!id || typeof id !== 'string') {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('Rule candidate proposal must possess a valid ruleCandidateId'),
      };
    }

    if (this.ruleCandidates.has(id)) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_HISTORICAL_MUTATION_DENIED',
        reason: `Rule candidate ID ${id} already exists and historical mutation is denied`,
      };
    }

    const cloned = deepClone(proposal);
    this.ruleCandidates.set(id, cloned);

    return {
      ok: true,
      category: 'SUCCESS',
      data: {
        ruleCandidateId: id,
        saved: true,
      },
    };
  }

  /**
   * Retrieves a rule candidate proposal by ID.
   */
  public getRuleCandidateById(
    ruleCandidateId: string,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<unknown> {
    const item = this.ruleCandidates.get(ruleCandidateId);
    if (!item) {
      return {
        ok: false,
        category: 'REFUSED',
        refusalCode: 'REFUSAL_PERSISTENCE_PORT_UNAVAILABLE',
        reason: `Rule candidate ${ruleCandidateId} not found in persistence store`,
      };
    }

    return {
      ok: true,
      category: 'SUCCESS',
      data: deepClone(item),
    };
  }

  /**
   * Test-only reset method for clearing in-memory transient state.
   * This is explicitly local adapter lifecycle behavior for unit tests, NOT a governed deletion API.
   */
  public resetForTesting(): void {
    this.events.length = 0;
    this.observations.clear();
    this.lessons.clear();
    this.ruleCandidates.clear();
  }
}
