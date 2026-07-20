/**
 * @file rule.aggregate.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Aggregate Root
 */

import {
  RuleId,
  RuleMetadata,
  RuleStatus,
  TraceabilityReference,
  Timestamp,
} from './types.js';
import { RuleExecutionError } from '../errors/rule.errors.js';

export type RuleEvaluationFn = (evidencePayload: string) => { pass: boolean; message: string };

export interface RuleProps {
  id: RuleId;
  metadata: RuleMetadata;
  traceability: TraceabilityReference;
  evaluator_fn: RuleEvaluationFn;
  status?: RuleStatus;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export class Rule {
  private readonly _id: RuleId;
  private readonly _metadata: RuleMetadata;
  private readonly _traceability: TraceabilityReference;
  private readonly _evaluator_fn: RuleEvaluationFn;
  private _status: RuleStatus;
  private readonly _created_at: Timestamp;
  private _updated_at: Timestamp;

  constructor(props: RuleProps) {
    this._id = props.id;
    this._metadata = props.metadata;
    this._traceability = props.traceability;
    this._evaluator_fn = props.evaluator_fn;
    this._status = props.status || RuleStatus.ACTIVE;
    this._created_at = props.created_at || Timestamp.create();
    this._updated_at = props.updated_at || this._created_at;
  }

  public get id(): RuleId { return this._id; }
  public get metadata(): RuleMetadata { return Object.freeze({ ...this._metadata }); }
  public get traceability(): TraceabilityReference { return Object.freeze({ ...this._traceability }); }
  public get status(): RuleStatus { return this._status; }
  public get created_at(): Timestamp { return this._created_at; }
  public get updated_at(): Timestamp { return this._updated_at; }

  /**
   * Executes this Rule deterministically against an evidence payload string.
   * Does NOT mutate input payload or rule state.
   */
  public evaluate(evidencePayload: string): { pass: boolean; message: string } {
    if (this._status !== RuleStatus.ACTIVE) {
      throw new RuleExecutionError(`Cannot evaluate rule '${this._id}' in '${this._status}' status. Rule must be ACTIVE.`);
    }

    try {
      return this._evaluator_fn(evidencePayload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new RuleExecutionError(`Rule evaluation failed for rule '${this._id}': ${msg}`, this._id);
    }
  }

  /**
   * Transitions the status of this Rule.
   */
  public setStatus(targetStatus: RuleStatus): void {
    this._status = targetStatus;
    this._updated_at = Timestamp.create();
  }
}
