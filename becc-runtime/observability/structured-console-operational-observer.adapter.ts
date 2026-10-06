/**
 * BECC v2 — Structured Console Operational Observer Adapter
 *
 * Machine-readable structured JSON console logger implementing BeccOperationalObserverPort
 * as specified in BECC-NEXT-004.
 */

import { BeccOperationalObserverPort } from './observability.port.js';
import {
  BeccOperationalContext,
  BeccOperationOutcome,
  BeccSafeOperationalError,
  BeccDependencyCallEvent,
  BeccHealthStateEvent,
  BeccOperationalLogRecord
} from './observability.types.js';
import { ObservabilitySecurityPolicy } from './observability-security.policy.js';

export class StructuredConsoleBeccOperationalObserver implements BeccOperationalObserverPort {
  public operationStarted(context: BeccOperationalContext): void {
    try {
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

      console.log(JSON.stringify(record));
    } catch (err) {
      // Best-effort failure isolation
    }
  }

  public operationCompleted(context: BeccOperationalContext, outcome: BeccOperationOutcome): void {
    try {
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

      console.log(JSON.stringify(record));
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

      console.error(JSON.stringify(record));
    } catch (err) {
      // Best-effort failure isolation
    }
  }

  public dependencyCallObserved(event: BeccDependencyCallEvent): void {
    try {
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

      if (event.status === 'SUCCESS') {
        console.log(JSON.stringify(record));
      } else {
        console.error(JSON.stringify(record));
      }
    } catch (err) {
      // Best-effort failure isolation
    }
  }

  public healthStateObserved(event: BeccHealthStateEvent): void {
    try {
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

      if (event.healthState === 'HEALTHY') {
        console.log(JSON.stringify(record));
      } else {
        console.error(JSON.stringify(record));
      }
    } catch (err) {
      // Best-effort failure isolation
    }
  }
}
