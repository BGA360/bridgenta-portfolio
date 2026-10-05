/**
 * BECC v2 — Operational Observability Factory
 *
 * Configures and resolves BeccOperationalObserverPort instances explicitly based on runtime environment
 * options or explicit configuration as specified in BECC-NEXT-004.
 */

import { BeccOperationalObserverPort } from './observability.port.js';
import { InMemoryBeccOperationalObserver } from './in-memory-operational-observer.adapter.ts';
import { StructuredConsoleBeccOperationalObserver } from './structured-console-operational-observer.adapter.js';
import { NoOpBeccOperationalObserver } from './no-op-operational-observer.adapter.js';

export type ObservabilityMode = 'in-memory' | 'structured-console' | 'none';

export interface ObservabilityFactoryOptions {
  mode?: ObservabilityMode;
  observer?: BeccOperationalObserverPort;
}

export class BeccObservabilityFactory {
  /**
   * Creates an operational observer instance based on explicit options or environment configuration.
   */
  public static createObserver(options: ObservabilityFactoryOptions = {}): BeccOperationalObserverPort {
    if (options.observer) {
      return options.observer;
    }

    const envMode = process.env.BECC_OBSERVABILITY_MODE as ObservabilityMode | undefined;
    const mode = options.mode || envMode || 'none';

    switch (mode) {
      case 'in-memory':
        return new InMemoryBeccOperationalObserver();
      case 'structured-console':
        return new StructuredConsoleBeccOperationalObserver();
      case 'none':
      default:
        return new NoOpBeccOperationalObserver();
    }
  }
}
