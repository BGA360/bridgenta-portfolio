/**
 * @file execution-context.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Immutable Execution Context
 */

import {
  ExecutionId,
  CorrelationId,
  PipelineStage,
  TraceabilityReference,
  Timestamp,
} from '../domain/types.js';

export interface ExecutionContextProps {
  execution_id: ExecutionId;
  correlation_id: CorrelationId;
  current_stage: PipelineStage;
  traceability: TraceabilityReference;
  assessment_id?: string;
  completed_stages?: readonly PipelineStage[];
  metadata?: ReadonlyMap<string, unknown>;
  start_timestamp?: Timestamp;
  completion_timestamp?: Timestamp;
}

export class ExecutionContext {
  private readonly _execution_id: ExecutionId;
  private readonly _correlation_id: CorrelationId;
  private readonly _current_stage: PipelineStage;
  private readonly _completed_stages: readonly PipelineStage[];
  private readonly _metadata: ReadonlyMap<string, unknown>;
  private readonly _traceability: TraceabilityReference;
  private readonly _assessment_id?: string;
  private readonly _start_timestamp: Timestamp;
  private readonly _completion_timestamp?: Timestamp;

  constructor(props: ExecutionContextProps) {
    this._execution_id = props.execution_id;
    this._correlation_id = props.correlation_id;
    this._current_stage = props.current_stage;
    this._completed_stages = props.completed_stages ? Object.freeze([...props.completed_stages]) : Object.freeze([]);
    this._metadata = props.metadata ? new Map(props.metadata) : new Map();
    this._traceability = Object.freeze({ ...props.traceability });
    this._assessment_id = props.assessment_id;
    this._start_timestamp = props.start_timestamp || Timestamp.create();
    this._completion_timestamp = props.completion_timestamp;
  }

  public get execution_id(): ExecutionId { return this._execution_id; }
  public get correlation_id(): CorrelationId { return this._correlation_id; }
  public get current_stage(): PipelineStage { return this._current_stage; }
  public get completed_stages(): readonly PipelineStage[] { return this._completed_stages; }
  public get metadata(): ReadonlyMap<string, unknown> { return this._metadata; }
  public get traceability(): TraceabilityReference { return this._traceability; }
  public get assessment_id(): string | undefined { return this._assessment_id; }
  public get start_timestamp(): Timestamp { return this._start_timestamp; }
  public get completion_timestamp(): Timestamp | undefined { return this._completion_timestamp; }

  /**
   * Returns a new ExecutionContext with updated current_stage and added completed stage.
   */
  public advanceStage(nextStage: PipelineStage): ExecutionContext {
    const updatedCompleted = [...this._completed_stages, this._current_stage];
    return new ExecutionContext({
      execution_id: this._execution_id,
      correlation_id: this._correlation_id,
      current_stage: nextStage,
      completed_stages: updatedCompleted,
      metadata: this._metadata,
      traceability: this._traceability,
      assessment_id: this._assessment_id,
      start_timestamp: this._start_timestamp,
    });
  }

  /**
   * Returns a new ExecutionContext with assessment_id bound.
   */
  public bindAssessmentId(assessmentId: string): ExecutionContext {
    return new ExecutionContext({
      execution_id: this._execution_id,
      correlation_id: this._correlation_id,
      current_stage: this._current_stage,
      completed_stages: this._completed_stages,
      metadata: this._metadata,
      traceability: this._traceability,
      assessment_id: assessmentId,
      start_timestamp: this._start_timestamp,
    });
  }

  /**
   * Marks execution completed.
   */
  public complete(): ExecutionContext {
    return new ExecutionContext({
      execution_id: this._execution_id,
      correlation_id: this._correlation_id,
      current_stage: this._current_stage,
      completed_stages: this._completed_stages,
      metadata: this._metadata,
      traceability: this._traceability,
      assessment_id: this._assessment_id,
      start_timestamp: this._start_timestamp,
      completion_timestamp: Timestamp.create(),
    });
  }
}
