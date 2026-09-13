import type { z } from 'zod';
import {
  GovernanceCommandEnvelopeSchema,
  GovernanceEventEnvelopeSchema,
} from '../contracts/envelopes.js';
import type {
  GovernanceCommandEnvelope,
  GovernanceEventEnvelope,
} from '../contracts/envelopes.js';
import {
  ActorIdentityRefSchema,
  AuthorityContextRefSchema,
  TargetRefSchema,
} from '../contracts/references.js';
import type {
  ActorIdentityRef,
  AuthorityContextRef,
  TargetRef,
} from '../contracts/references.js';
import type { RuntimeSuccessResult, RuntimeErrorResult } from './types.js';
import { RuntimeInvariantError } from './errors.js';

/**
 * Parses and validates a command envelope against the canonical GovernanceCommandEnvelopeSchema (CTR-GL-054).
 * Returns a typed success result or a runtime error result on structural parse failure.
 */
export function parseGovernanceCommandEnvelope(
  input: unknown
): RuntimeSuccessResult<GovernanceCommandEnvelope> | RuntimeErrorResult {
  const result = GovernanceCommandEnvelopeSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid GovernanceCommandEnvelope structure', {
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
 * Parses and validates an event envelope against the canonical GovernanceEventEnvelopeSchema (CTR-GL-053).
 * Returns a typed success result or a runtime error result on structural parse failure.
 */
export function parseGovernanceEventEnvelope(
  input: unknown
): RuntimeSuccessResult<GovernanceEventEnvelope> | RuntimeErrorResult {
  const result = GovernanceEventEnvelopeSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid GovernanceEventEnvelope structure', {
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
 * GL-RUNTIME-SEC-001: Validates actor reference structure against canonical ActorIdentityRefSchema (CTR-GL-025).
 * Note: Performs structural schema validation only; does not authenticate real-world identity.
 */
export function parseActorIdentityRef(
  input: unknown
): RuntimeSuccessResult<ActorIdentityRef> | RuntimeErrorResult {
  const result = ActorIdentityRefSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid ActorIdentityRef structure', {
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
 * Parses and validates authority context reference structure against canonical AuthorityContextRefSchema (CTR-GL-024).
 */
export function parseAuthorityContextRef(
  input: unknown
): RuntimeSuccessResult<AuthorityContextRef> | RuntimeErrorResult {
  const result = AuthorityContextRefSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid AuthorityContextRef structure', {
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
 * Parses and validates target reference discriminated union against canonical TargetRefSchema (CTR-GL-057).
 */
export function parseTargetRef(
  input: unknown
): RuntimeSuccessResult<TargetRef> | RuntimeErrorResult {
  const result = TargetRefSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid TargetRef structure', {
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
 * Parses a payload against an explicitly caller-provided canonical Zod schema.
 * Wave 2 payload parsing mechanism; does not perform automatic version/type dispatching.
 */
export function parsePayloadWithSchema<T>(
  input: unknown,
  payloadSchema: z.ZodType<T>
): RuntimeSuccessResult<T> | RuntimeErrorResult {
  const result = payloadSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Invalid payload structure for provided schema', {
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
