/**
 * @file orchestration.events.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Orchestration Domain Events
 */

import { ExecutionId, CorrelationId, PipelineStage, PipelineStatus, Timestamp } from '../domain/types.js';

export interface BaseOrchestrationEvent {
  readonly event_id: string;
  readonly event_name: string;
  readonly execution_id: ExecutionId;
  readonly correlation_id: CorrelationId;
  readonly timestamp: Timestamp;
}

export interface PipelineStartedEvent extends BaseOrchestrationEvent {
  readonly event_name: 'PipelineStarted';
  readonly assessment_request_id: string;
  readonly initial_stage: PipelineStage;
}

export interface StageCompletedEvent extends BaseOrchestrationEvent {
  readonly event_name: 'StageCompleted';
  readonly completed_stage: PipelineStage;
  readonly next_stage?: PipelineStage;
}

export interface StageFailedEvent extends BaseOrchestrationEvent {
  readonly event_name: 'StageFailed';
  readonly failed_stage: PipelineStage;
  readonly error_message: string;
  readonly error_code: string;
}

export interface PipelineCompletedEvent extends BaseOrchestrationEvent {
  readonly event_name: 'PipelineCompleted';
  readonly status: PipelineStatus.SUCCESS;
  readonly assessment_id: string;
  readonly certification_id: string;
  readonly duration_ms: number;
}

export interface PipelineAbortedEvent extends BaseOrchestrationEvent {
  readonly event_name: 'PipelineAborted';
  readonly status: PipelineStatus.ABORTED;
  readonly aborted_at_stage: PipelineStage;
  readonly reason: string;
}

export type OrchestrationDomainEvent =
  | PipelineStartedEvent
  | StageCompletedEvent
  | StageFailedEvent
  | PipelineCompletedEvent
  | PipelineAbortedEvent;
