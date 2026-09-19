import type { GovernanceCommandEnvelope } from '../contracts/envelopes.js';

/**
 * Extracts aggregate concurrency scope keys for a GovernanceCommandEnvelope (GL-HARDENING-001 Part 8).
 * Used by Stage 9 for deterministic per-aggregate serialization and concurrency control.
 * Multi-aggregate keys are deterministically sorted to prevent lock inversion/deadlocks.
 */
export function getConcurrencyScope(envelope: GovernanceCommandEnvelope): ReadonlyArray<string> {
  const keys: string[] = [];
  const payload = envelope.payload as Record<string, unknown> | null | undefined;

  if (payload && typeof payload === 'object') {
    // 1. Observation aggregate
    if ('observationRef' in payload && payload.observationRef && typeof payload.observationRef === 'object') {
      const obs = payload.observationRef as Record<string, unknown>;
      if (typeof obs.observationId === 'string') {
        keys.push(`obs:${obs.observationId}`);
      }
    }

    // 1b. Originating observation references (array on CreateLessonCandidate)
    if ('originatingObservationRefs' in payload && Array.isArray(payload.originatingObservationRefs)) {
      for (const ref of payload.originatingObservationRefs) {
        if (ref && typeof ref === 'object' && typeof (ref as Record<string, unknown>).observationId === 'string') {
          keys.push(`obs:${(ref as Record<string, unknown>).observationId}`);
        }
      }
    }

    // 2. Lesson candidate aggregate
    if ('candidateRef' in payload && payload.candidateRef && typeof payload.candidateRef === 'object') {
      const cand = payload.candidateRef as Record<string, unknown>;
      if (typeof cand.candidateId === 'string') {
        keys.push(`cand:${cand.candidateId}`);
      }
    }

    // 3. Lesson supersession aggregates (multi-aggregate)
    if ('supersededLessonRef' in payload && payload.supersededLessonRef && typeof payload.supersededLessonRef === 'object') {
      const sup = payload.supersededLessonRef as Record<string, unknown>;
      if (typeof sup.lessonId === 'string') {
        keys.push(`lesson:${sup.lessonId}`);
      }
    }
    if ('supersedingLessonRef' in payload && payload.supersedingLessonRef && typeof payload.supersedingLessonRef === 'object') {
      const sup = payload.supersedingLessonRef as Record<string, unknown>;
      if (typeof sup.lessonId === 'string') {
        keys.push(`lesson:${sup.lessonId}`);
      }
    }

    // 4. Retired lesson aggregate
    if ('retiredLessonRef' in payload && payload.retiredLessonRef && typeof payload.retiredLessonRef === 'object') {
      const ret = payload.retiredLessonRef as Record<string, unknown>;
      if (typeof ret.lessonId === 'string') {
        keys.push(`lesson:${ret.lessonId}`);
      }
    }

    // 5. Source lesson aggregate
    if ('sourceLessonRef' in payload && payload.sourceLessonRef && typeof payload.sourceLessonRef === 'object') {
      const src = payload.sourceLessonRef as Record<string, unknown>;
      if (typeof src.lessonId === 'string') {
        keys.push(`lesson:${src.lessonId}`);
      }
    }

    // 6. Rule candidate proposal aggregate
    if ('proposalRef' in payload && payload.proposalRef && typeof payload.proposalRef === 'object') {
      const prop = payload.proposalRef as Record<string, unknown>;
      if (typeof prop.proposalId === 'string') {
        keys.push(`prop:${prop.proposalId}`);
      }
    }

    // 7. Query ID
    if ('queryId' in payload && typeof payload.queryId === 'string') {
      keys.push(`query:${payload.queryId}`);
    }

    // 8. Rule Manifest ID
    if ('ruleManifestId' in payload && typeof payload.ruleManifestId === 'string') {
      keys.push(`manifest:${payload.ruleManifestId}`);
    }
  }

  // Fallback if no aggregate reference found in payload
  if (keys.length === 0) {
    keys.push(`actor:${envelope.actorRef.actorId}`);
  }

  // Deduplicate and sort deterministically
  return Array.from(new Set(keys)).sort();
}

import type { ConcurrencyLease, ConcurrencyCoordinatorPort } from '../contracts/ports.js';
import type { RuntimeOperationResult } from './types.js';
import { GovernedLearningRuntimeError, RuntimeInvariantError } from './errors.js';

export class NoOpConcurrencyLease implements ConcurrencyLease {
  public readonly scopeKeys: ReadonlyArray<string>;
  public readonly acquiredAt: string;

  constructor(scopeKeys: ReadonlyArray<string>) {
    this.scopeKeys = Array.from(new Set(scopeKeys)).sort();
    this.acquiredAt = new Date().toISOString();
  }

  public release(): void {
    // No-op
  }
}

/**
 * Level 1 In-Process Concurrency Coordinator.
 * Prevents conflicting Governed Learning commands from silently interleaving against the same aggregate state.
 * Multi-aggregate keys are deterministically deduplicated and sorted to prevent lock inversion/deadlocks.
 */
export class InMemoryConcurrencyCoordinator implements ConcurrencyCoordinatorPort {
  private readonly activeLocks = new Map<string, Promise<void>>();

  /**
   * Acquires exclusive scope lease for specified aggregate keys.
   */
  public acquireScope(scopeKeys: ReadonlyArray<string>): RuntimeOperationResult<ConcurrencyLease> {
    const sortedKeys = Array.from(new Set(scopeKeys)).sort();

    // Check if any key is currently locked by sync or async execution
    for (const key of sortedKeys) {
      if (this.activeLocks.has(key)) {
        return {
          ok: false,
          category: 'REFUSED',
          refusalCode: 'REFUSAL_INVARIANT_VIOLATION',
          reason: `Concurrency contention for scope key '${key}'`,
        };
      }
    }

    let resolver!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    for (const key of sortedKeys) {
      this.activeLocks.set(key, promise);
    }

    let isReleased = false;
    const lease: ConcurrencyLease = {
      scopeKeys: sortedKeys,
      acquiredAt: new Date().toISOString(),
      release: () => {
        if (isReleased) return;
        isReleased = true;
        resolver();
        for (const key of sortedKeys) {
          if (this.activeLocks.get(key) === promise) {
            this.activeLocks.delete(key);
          }
        }
      },
    };

    return {
      ok: true,
      category: 'SUCCESS',
      data: lease,
    };
  }

  /**
   * Executes a synchronous operation within exclusive scope lease.
   */
  public executeWithinScope<T>(
    scopeKeys: ReadonlyArray<string>,
    operation: () => T
  ): RuntimeOperationResult<T> {
    const acquireRes = this.acquireScope(scopeKeys);
    if (!acquireRes.ok) {
      return acquireRes;
    }

    const lease = acquireRes.data;
    try {
      const data = operation();
      return {
        ok: true,
        category: 'SUCCESS',
        data,
      };
    } catch (err) {
      const error =
        err instanceof GovernedLearningRuntimeError
          ? err
          : new RuntimeInvariantError(err instanceof Error ? err.message : String(err));
      return {
        ok: false,
        category: 'ERROR',
        error,
      };
    } finally {
      lease.release();
    }
  }

  /**
   * Executes an asynchronous operation within exclusive scope lease.
   * Queues waiters for aggregate keys in sorted order without deadlocking.
   */
  public async executeWithinScopeAsync<T>(
    scopeKeys: ReadonlyArray<string>,
    operation: () => Promise<T>
  ): Promise<RuntimeOperationResult<T>> {
    const sortedKeys = Array.from(new Set(scopeKeys)).sort();

    // Collect prior promises for required keys synchronously
    const priorPromises: Promise<void>[] = [];
    for (const key of sortedKeys) {
      const prior = this.activeLocks.get(key);
      if (prior) {
        priorPromises.push(prior);
      }
    }

    let resolver!: () => void;
    const nextPromise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    // Register nextPromise synchronously BEFORE yielding execution
    for (const key of sortedKeys) {
      this.activeLocks.set(key, nextPromise);
    }

    try {
      if (priorPromises.length > 0) {
        await Promise.all(priorPromises);
      }
      const data = await operation();
      return {
        ok: true,
        category: 'SUCCESS',
        data,
      };
    } catch (err) {
      const error =
        err instanceof GovernedLearningRuntimeError
          ? err
          : new RuntimeInvariantError(err instanceof Error ? err.message : String(err));
      return {
        ok: false,
        category: 'ERROR',
        error,
      };
    } finally {
      resolver();
      for (const key of sortedKeys) {
        if (this.activeLocks.get(key) === nextPromise) {
          this.activeLocks.delete(key);
        }
      }
    }
  }
}
