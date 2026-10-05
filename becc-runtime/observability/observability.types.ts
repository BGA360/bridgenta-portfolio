/**
 * BECC v2 — Operational Observability Types
 *
 * Defines bounded, machine-readable operational types, status taxonomy,
 * dependency telemetry objects, and health structures as specified in BECC-NEXT-004.
 */

export type BeccOperationalResultStatus = 'SUCCESS' | 'REFUSED' | 'INDETERMINATE' | 'ERROR';

export type BeccOperationalErrorClass =
  | 'VALIDATION'
  | 'AUTHORIZATION'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'DEPENDENCY_TIMEOUT'
  | 'PERSISTENCE'
  | 'SCHEMA_MISMATCH'
  | 'CONFLICT'
  | 'INTERNAL';

export type BeccHealthState = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'MISCONFIGURED';

export interface BeccOperationalContext {
  operationType: string;
  operationId: string;
  correlationRef: string;
  causationRef?: string;
  projectRef?: string;
  workstreamRef?: string;
  dependencyName?: string;
  occurredAt?: string;
}

export interface BeccOperationOutcome {
  operationalResultStatus: BeccOperationalResultStatus;
  domainResultStatus?: string;
  durationMs: number;
  auditRecordId?: string;
}

export interface BeccSafeOperationalError {
  errorClass: BeccOperationalErrorClass;
  safeErrorCode: string;
  safeMessage: string;
}

export interface BeccDependencyCallEvent {
  dependencyName: string;
  operation: string;
  status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT' | 'UNAVAILABLE';
  durationMs: number;
  errorClass?: BeccOperationalErrorClass;
  safeErrorCode?: string;
  occurredAt: string;
}

export interface BeccHealthStateEvent {
  component: string;
  healthState: BeccHealthState;
  liveness: boolean;
  readiness: boolean;
  details?: {
    safeMessage?: string;
    checkDurationMs?: number;
  };
  occurredAt: string;
}

export interface BeccOperationalLogRecord {
  eventType: 'STARTED' | 'COMPLETED' | 'FAILED' | 'DEPENDENCY' | 'HEALTH';
  operationType?: string;
  operationId?: string;
  operation?: string;
  correlationRef?: string;
  causationRef?: string;
  projectRef?: string;
  workstreamRef?: string;
  resultStatus?: BeccOperationalResultStatus;
  domainResultStatus?: string;
  durationMs?: number;
  occurredAt: string;
  component?: string;
  dependencyName?: string;
  errorClass?: BeccOperationalErrorClass;
  safeErrorCode?: string;
  safeMessage?: string;
  auditRecordId?: string;
  healthState?: BeccHealthState;
  liveness?: boolean;
  readiness?: boolean;
}

export interface BeccMetricsSnapshot {
  totalOperationsStarted: number;
  totalOperationsCompleted: number;
  totalOperationsFailed: number;
  operationsByStatus: Record<BeccOperationalResultStatus, number>;
  operationsByType: Record<string, number>;
  dependenciesByNameAndStatus: Record<string, number>;
  eventsCount: number;
}
