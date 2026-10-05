/**
 * BECC v2 — Operational Observer Port
 *
 * Provider-neutral abstraction for BECC operational observability as specified in BECC-NEXT-004.
 * Emits machine-readable operational lifecycle, timing, dependency, and health events.
 */

import {
  BeccOperationalContext,
  BeccOperationOutcome,
  BeccSafeOperationalError,
  BeccDependencyCallEvent,
  BeccHealthStateEvent
} from './observability.types.js';

export interface BeccOperationalObserverPort {
  /**
   * Emitted when a bounded BECC operation starts.
   */
  operationStarted(context: BeccOperationalContext): void;

  /**
   * Emitted when a bounded BECC operation completes with a outcome (SUCCESS, REFUSED, INDETERMINATE).
   */
  operationCompleted(context: BeccOperationalContext, outcome: BeccOperationOutcome): void;

  /**
   * Emitted when a bounded BECC operation fails with a safe error classification.
   */
  operationFailed(
    context: BeccOperationalContext,
    error: BeccSafeOperationalError,
    outcome?: BeccOperationOutcome
  ): void;

  /**
   * Emitted when a call to an external or sub-system dependency occurs.
   */
  dependencyCallObserved(event: BeccDependencyCallEvent): void;

  /**
   * Emitted when component liveness/readiness health status is checked or observed.
   */
  healthStateObserved(event: BeccHealthStateEvent): void;
}
