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
