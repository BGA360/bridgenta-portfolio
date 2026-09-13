import {
  ObservationCreatedEventPayloadSchema,
  ObservationValidatedEventPayloadSchema,
  LessonCandidateCreatedEventPayloadSchema,
  LessonApprovedEventPayloadSchema,
  LessonSupersededEventPayloadSchema,
  LessonRetiredEventPayloadSchema,
  LessonAdoptedEventPayloadSchema,
} from '../helpers/events.js';
import type {
  ObservationCreatedEventPayload,
  ObservationValidatedEventPayload,
  LessonCandidateCreatedEventPayload,
  LessonApprovedEventPayload,
  LessonSupersededEventPayload,
  LessonRetiredEventPayload,
  LessonAdoptedEventPayload,
} from '../helpers/events.js';
import { UnsupportedVersionHistoricalEventEnvelopeSchema } from '../helpers/historical.js';
import type { UnsupportedVersionHistoricalEventEnvelope } from '../helpers/historical.js';
import type { RuntimeSuccessResult, RuntimeErrorResult } from './types.js';
import { RuntimeInvariantError } from './errors.js';

/**
  * Canonical Physical Event Discriminator Set (Exactly 7 Discriminators)
  */
export const PHYSICAL_EVENT_DISCRIMINATORS = [
  'OBSERVATION_CREATED',
  'OBSERVATION_VALIDATED',
  'LESSON_CANDIDATE_CREATED',
  'LESSON_APPROVED',
  'LESSON_SUPERSEDED',
  'LESSON_RETIRED',
  'LESSON_ADOPTED',
] as const;

export type PhysicalEventDiscriminator = (typeof PHYSICAL_EVENT_DISCRIMINATORS)[number];

/**
  * 1. Constructs and validates OBSERVATION_CREATED event payload.
  */
export function constructObservationCreatedEventPayload(
  input: unknown
): RuntimeSuccessResult<ObservationCreatedEventPayload> | RuntimeErrorResult {
  const result = ObservationCreatedEventPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid OBSERVATION_CREATED event payload structure', {
        issues: result.error.issues,
      }),
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}

/**
  * 2. Constructs and validates OBSERVATION_VALIDATED event payload.
  * Authority-sensitive: Requires already-recorded validatedBy (ActorIdentityRef) input.
  */
export function constructObservationValidatedEventPayload(
  input: unknown
): RuntimeSuccessResult<ObservationValidatedEventPayload> | RuntimeErrorResult {
  const result = ObservationValidatedEventPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid OBSERVATION_VALIDATED event payload structure', {
        issues: result.error.issues,
      }),
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}

/**
  * 3. Constructs and validates LESSON_CANDIDATE_CREATED event payload.
  */
export function constructLessonCandidateCreatedEventPayload(
  input: unknown
): RuntimeSuccessResult<LessonCandidateCreatedEventPayload> | RuntimeErrorResult {
  const result = LessonCandidateCreatedEventPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid LESSON_CANDIDATE_CREATED event payload structure', {
        issues: result.error.issues,
      }),
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}

/**
  * 4. Constructs and validates LESSON_APPROVED event payload.
  * Authority-sensitive: Requires already-recorded decisionRef input.
  */
export function constructLessonApprovedEventPayload(
  input: unknown
): RuntimeSuccessResult<LessonApprovedEventPayload> | RuntimeErrorResult {
  const result = LessonApprovedEventPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid LESSON_APPROVED event payload structure', {
        issues: result.error.issues,
      }),
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}

/**
  * 5. Constructs and validates LESSON_SUPERSEDED event payload.
  * Authority-sensitive: Requires already-recorded supersededLessonRef and supersedingLessonRef inputs.
  */
export function constructLessonSupersededEventPayload(
  input: unknown
): RuntimeSuccessResult<LessonSupersededEventPayload> | RuntimeErrorResult {
  const result = LessonSupersededEventPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid LESSON_SUPERSEDED event payload structure', {
        issues: result.error.issues,
      }),
    };
  }

  // Reject circular self-supersession if lesson IDs are equal
  if (result.data.supersededLessonRef.lessonId === result.data.supersedingLessonRef.lessonId) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Self-supersession is invalid: superseded and superseding lesson IDs cannot match', {
        supersededLessonRef: result.data.supersededLessonRef,
        supersedingLessonRef: result.data.supersedingLessonRef,
      }),
    };
  }

  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}

/**
  * 6. Constructs and validates LESSON_RETIRED event payload.
  * Authority-sensitive: Requires already-recorded retiredLessonRef and reason inputs.
  */
export function constructLessonRetiredEventPayload(
  input: unknown
): RuntimeSuccessResult<LessonRetiredEventPayload> | RuntimeErrorResult {
  const result = LessonRetiredEventPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid LESSON_RETIRED event payload structure', {
        issues: result.error.issues,
      }),
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}

/**
  * 7. Constructs and validates LESSON_ADOPTED event payload.
  * Authority-sensitive: Requires already-recorded adoptedByProjectRef input.
  */
export function constructLessonAdoptedEventPayload(
  input: unknown
): RuntimeSuccessResult<LessonAdoptedEventPayload> | RuntimeErrorResult {
  const result = LessonAdoptedEventPayloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid LESSON_ADOPTED event payload structure', {
        issues: result.error.issues,
      }),
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}

/**
  * Canonical Physical Event Payload Constructor Dispatcher
  * Constructs and validates a physical canonical event payload by eventType discriminator.
  */
export function constructCanonicalEventPayload(
  eventType: string,
  input: unknown
): RuntimeSuccessResult<unknown> | RuntimeErrorResult {
  switch (eventType) {
    case 'OBSERVATION_CREATED':
      return constructObservationCreatedEventPayload(input);
    case 'OBSERVATION_VALIDATED':
      return constructObservationValidatedEventPayload(input);
    case 'LESSON_CANDIDATE_CREATED':
      return constructLessonCandidateCreatedEventPayload(input);
    case 'LESSON_APPROVED':
      return constructLessonApprovedEventPayload(input);
    case 'LESSON_SUPERSEDED':
      return constructLessonSupersededEventPayload(input);
    case 'LESSON_RETIRED':
      return constructLessonRetiredEventPayload(input);
    case 'LESSON_ADOPTED':
      return constructLessonAdoptedEventPayload(input);
    default:
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`Unsupported physical event discriminator: ${eventType}`, {
          eventType,
        }),
      };
  }
}

/**
  * CTR-GL-056: Structural Preservation of Unsupported Event Payload Versions
  * Validates and constructs an UnsupportedVersionHistoricalEventEnvelope without mutating the opaque payload.
  */
export function constructHistoricalEventPreservationEnvelope(
  input: unknown
): RuntimeSuccessResult<UnsupportedVersionHistoricalEventEnvelope> | RuntimeErrorResult {
  const result = UnsupportedVersionHistoricalEventEnvelopeSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid UnsupportedVersionHistoricalEventEnvelope structure (CTR-GL-056)', {
        issues: result.error.issues,
      }),
    };
  }
  return {
    ok: true,
    category: 'SUCCESS',
    data: result.data,
  };
}
