/**
 * BECC v2 — No-Op Operational Observer Adapter
 *
 * Passive default implementation of BeccOperationalObserverPort.
 */

import { BeccOperationalObserverPort } from './observability.port.js';
import {
  BeccOperationalContext,
  BeccOperationOutcome,
  BeccSafeOperationalError,
  BeccDependencyCallEvent,
  BeccHealthStateEvent
} from './observability.types.js';

export class NoOpBeccOperationalObserver implements BeccOperationalObserverPort {
  public operationStarted(_context: BeccOperationalContext): void {}
  public operationCompleted(_context: BeccOperationalContext, _outcome: BeccOperationOutcome): void {}
  public operationFailed(
    _context: BeccOperationalContext,
    _error: BeccSafeOperationalError,
    _outcome?: BeccOperationOutcome
  ): void {}
  public dependencyCallObserved(_event: BeccDependencyCallEvent): void {}
  public healthStateObserved(_event: BeccHealthStateEvent): void {}
}
