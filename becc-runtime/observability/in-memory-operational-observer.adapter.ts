/**
 * BECC v2 — In-Memory Operational Observer Adapter
 *
 * Implementation of BeccOperationalObserverPort for deterministic test snapshot verification
 * and metric inspection as specified in BECC-NEXT-004.
 */

import { BeccOperationalObserverPort } from './observability.port.js';
import {
  BeccOperationalContext,
  BeccOperationOutcome,
  BeccSafeOperationalError,
  BeccDependencyCallEvent,
  BeccHealthStateEvent,
  BeccOperationalLogRecord,
  BeccMetricsSnapshot,
  BeccOperationalResultStatus
} from './observability.types.js';
import { ObservabilitySecurityPolicy } from './observability-security.policy.js';

export interface InMemoryBeccOperationalObserverOptions {
  /**
   * Optional flag to simulate internal observer failure during tests to verify failure isolation.
   */
  simulateObserverFailure?: boolean;
}

export class InMemoryBeccOperationalObserver implements BeccOperationalObserverPort {
  private readonly events: BeccOperationalLogRecord[] = [];
  private readonly simulateFailure: boolean;

  private startedCount = 0;
  private completedCount = 0;
  private failedCount = 0;

  private readonly operationsByStatus: Record<BeccOperationalResultStatus, number> = {
    SUCCESS: 0,
    REFUSED: 0,
    INDETERMINATE: 0,
    ERROR: 0
  };

  private readonly operationsByType: Record<string, number> = {};
  private readonly dependenciesByNameAndStatus: Record<string, number> = {};

  constructor(options: InMemoryBeccOperationalObserverOptions = {}) {
    this.simulateFailure = options.simulateObserverFailure ?? false;
  }

  public operationStarted(context: BeccOperationalContext): void {
    try {
      if (this.simulateFailure) {
        throw new Error('Simulated observer adapter internal failure');
      }

      const safeCtx = ObservabilitySecurityPolicy.sanitizeContext(context);
      const record: BeccOperationalLogRecord = ObservabilitySecurityPolicy.sanitizeLogRecord({
        eventType: 'STARTED',
        operationType: safeCtx.operationType,
        operationId: safeCtx.operationId,
        correlationRef: safeCtx.correlationRef,
        causationRef: safeCtx.causationRef,
        projectRef: safeCtx.projectRef,
        workstreamRef: safeCtx.workstreamRef,
        dependencyName: safeCtx.dependencyName,
        occurredAt: safeCtx.occurredAt || new Date().toISOString()
      });

      this.events.push(record);
      this.startedCount++;

      const opTypeKey = safeCtx.operationType.toUpperCase();
      this.operationsByType[opTypeKey] = (this.operationsByType[opTypeKey] || 0) + 1;
    } catch (err) {
      // Best-effort failure isolation: observer failure must NEVER throw or mutate domain results
    }
  }

  public operationCompleted(context: BeccOperationalContext, outcome: BeccOperationOutcome): void {
    try {
      if (this.simulateFailure) {
        throw new Error('Simulated observer adapter internal failure');
      }

      const safeCtx = ObservabilitySecurityPolicy.sanitizeContext(context);
      const record: BeccOperationalLogRecord = ObservabilitySecurityPolicy.sanitizeLogRecord({
        eventType: 'COMPLETED',
        operationType: safeCtx.operationType,
        operationId: safeCtx.operationId,
        correlationRef: safeCtx.correlationRef,
        causationRef: safeCtx.causationRef,
        projectRef: safeCtx.projectRef,
        workstreamRef: safeCtx.workstreamRef,
        resultStatus: outcome.operationalResultStatus,
        domainResultStatus: outcome.domainResultStatus,
        durationMs: outcome.durationMs,
        auditRecordId: outcome.auditRecordId,
        occurredAt: safeCtx.occurredAt || new Date().toISOString()
      });

      this.events.push(record);
      this.completedCount++;

      const statusKey = outcome.operationalResultStatus;
      if (statusKey in this.operationsByStatus) {
        this.operationsByStatus[statusKey]++;
      }
    } catch (err) {
      // Best-effort failure isolation
    }
  }

  public operationFailed(
    context: BeccOperationalContext,
    error: BeccSafeOperationalError,
    outcome?: BeccOperationOutcome
  ): void {
    try {
      if (this.simulateFailure) {
        throw new Error('Simulated observer adapter internal failure');
      }

      const safeCtx = ObservabilitySecurityPolicy.sanitizeContext(context);
      const safeErr = ObservabilitySecurityPolicy.classifyError(error);

      const record: BeccOperationalLogRecord = ObservabilitySecurityPolicy.sanitizeLogRecord({
        eventType: 'FAILED',
        operationType: safeCtx.operationType,
        operationId: safeCtx.operationId,
        correlationRef: safeCtx.correlationRef,
        causationRef: safeCtx.causationRef,
        projectRef: safeCtx.projectRef,
        workstreamRef: safeCtx.workstreamRef,
        resultStatus: outcome?.operationalResultStatus || 'ERROR',
        domainResultStatus: outcome?.domainResultStatus,
        durationMs: outcome?.durationMs ?? 0,
        errorClass: safeErr.errorClass,
        safeErrorCode: safeErr.safeErrorCode,
        safeMessage: safeErr.safeMessage,
        auditRecordId: outcome?.auditRecordId,
        occurredAt: safeCtx.occurredAt || new Date().toISOString()
      });

      this.events.push(record);
      this.failedCount++;

      const statusKey = outcome?.operationalResultStatus || 'ERROR';
      if (statusKey in this.operationsByStatus) {
        this.operationsByStatus[statusKey]++;
      }
    } catch (err) {
      // Best-effort failure isolation
    }
  }

  public dependencyCallObserved(event: BeccDependencyCallEvent): void {
    try {
      if (this.simulateFailure) {
        throw new Error('Simulated observer adapter internal failure');
      }

      const safeErr = event.errorClass
        ? { errorClass: event.errorClass, safeErrorCode: event.safeErrorCode || 'ERR_DEP', safeMessage: '' }
        : undefined;

      const record: BeccOperationalLogRecord = ObservabilitySecurityPolicy.sanitizeLogRecord({
        eventType: 'DEPENDENCY',
        dependencyName: ObservabilitySecurityPolicy.sanitizeString(event.dependencyName),
        operation: ObservabilitySecurityPolicy.sanitizeString(event.operation),
        resultStatus: event.status === 'SUCCESS' ? 'SUCCESS' : 'ERROR',
        durationMs: event.durationMs,
        errorClass: safeErr?.errorClass,
        safeErrorCode: safeErr?.safeErrorCode,
        occurredAt: event.occurredAt || new Date().toISOString()
      });

      this.events.push(record);

      const metricLabel = ObservabilitySecurityPolicy.buildBoundedMetricLabel(
        undefined,
        event.status,
        event.dependencyName,
        event.safeErrorCode,
        event.errorClass
      );

      this.dependenciesByNameAndStatus[metricLabel] =
        (this.dependenciesByNameAndStatus[metricLabel] || 0) + 1;
    } catch (err) {
      // Best-effort failure isolation
    }
  }

  public healthStateObserved(event: BeccHealthStateEvent): void {
    try {
      if (this.simulateFailure) {
        throw new Error('Simulated observer adapter internal failure');
      }

      const record: BeccOperationalLogRecord = ObservabilitySecurityPolicy.sanitizeLogRecord({
        eventType: 'HEALTH',
        component: ObservabilitySecurityPolicy.sanitizeString(event.component),
        healthState: event.healthState,
        liveness: event.liveness,
        readiness: event.readiness,
        safeMessage: event.details?.safeMessage
          ? ObservabilitySecurityPolicy.sanitizeString(event.details.safeMessage)
          : undefined,
        durationMs: event.details?.checkDurationMs,
        occurredAt: event.occurredAt || new Date().toISOString()
      });

      this.events.push(record);
    } catch (err) {
      // Best-effort failure isolation
    }
  }

  /**
   * Deterministic test query method to view captured operational events.
   */
  public getEvents(): readonly BeccOperationalLogRecord[] {
    return [...this.events];
  }

  /**
   * Deterministic metric snapshot for test assertions.
   */
  public getMetricsSnapshot(): BeccMetricsSnapshot {
    return {
      totalOperationsStarted: this.startedCount,
      totalOperationsCompleted: this.completedCount,
      totalOperationsFailed: this.failedCount,
      operationsByStatus: { ...this.operationsByStatus },
      operationsByType: { ...this.operationsByType },
      dependenciesByNameAndStatus: { ...this.dependenciesByNameAndStatus },
      eventsCount: this.events.length
    };
  }

  /**
   * Resets captured events and counters.
   */
  public clear(): void {
    this.events.length = 0;
    this.startedCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.operationsByStatus.SUCCESS = 0;
    this.operationsByStatus.REFUSED = 0;
    this.operationsByStatus.INDETERMINATE = 0;
    this.operationsByStatus.ERROR = 0;
    Object.keys(this.operationsByType).forEach((k) => delete this.operationsByType[k]);
    Object.keys(this.dependenciesByNameAndStatus).forEach((k) => delete this.dependenciesByNameAndStatus[k]);
  }
}
