/**
 * @file certification.aggregate.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Aggregate Root
 */

import {
  CertificationId,
  CertificationStatus,
  CertificationMetadata,
  CertificationTransitionRecord,
  TraceabilityReference,
  Timestamp,
} from './types.js';
import { CertificationValidationError } from '../errors/certification.errors.js';

export interface CertificationProps {
  id: CertificationId;
  assessment_id: string;
  policy_decision_id: string;
  metadata: CertificationMetadata;
  traceability: TraceabilityReference;
  status?: CertificationStatus;
  history?: readonly CertificationTransitionRecord[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export class Certification {
  private readonly _id: CertificationId;
  private readonly _assessment_id: string;
  private readonly _policy_decision_id: string;
  private readonly _metadata: CertificationMetadata;
  private readonly _traceability: TraceabilityReference;
  private _status: CertificationStatus;
  private readonly _history: CertificationTransitionRecord[];
  private readonly _created_at: Timestamp;
  private _updated_at: Timestamp;

  constructor(props: CertificationProps) {
    this._id = props.id;
    this._assessment_id = props.assessment_id;
    this._policy_decision_id = props.policy_decision_id;
    this._metadata = props.metadata;
    this._traceability = props.traceability;
    this._status = props.status || CertificationStatus.ISSUED;
    this._created_at = props.created_at || Timestamp.create();
    this._updated_at = props.updated_at || this._created_at;

    const initialTransition: CertificationTransitionRecord = {
      from_status: CertificationStatus.ISSUED,
      to_status: this._status,
      timestamp: this._created_at,
      reason: 'Initial certification creation.',
    };

    this._history = props.history ? [...props.history] : [initialTransition];
  }

  public get id(): CertificationId { return this._id; }
  public get assessment_id(): string { return this._assessment_id; }
  public get policy_decision_id(): string { return this._policy_decision_id; }
  public get metadata(): CertificationMetadata { return Object.freeze({ ...this._metadata }); }
  public get traceability(): TraceabilityReference { return Object.freeze({ ...this._traceability }); }
  public get status(): CertificationStatus { return this._status; }
  public get history(): readonly CertificationTransitionRecord[] { return Object.freeze([...this._history]); }
  public get created_at(): Timestamp { return this._created_at; }
  public get updated_at(): Timestamp { return this._updated_at; }

  /**
   * Transitions certification lifecycle status following strict state machine rules.
   *
   * @param targetStatus Goal CertificationStatus.
   * @param reason Explanatory rationale.
   */
  public transitionStatus(targetStatus: CertificationStatus, reason?: string): void {
    if (this._status === targetStatus) {
      return;
    }

    const allowed = this.isTransitionAllowed(this._status, targetStatus);
    if (!allowed) {
      throw new CertificationValidationError(
        `Illegal certification status transition from '${this._status}' to '${targetStatus}'.`
      );
    }

    const prevStatus = this._status;
    this._status = targetStatus;
    this._updated_at = Timestamp.create();

    this._history.push({
      from_status: prevStatus,
      to_status: targetStatus,
      timestamp: this._updated_at,
      reason: reason || `Status transitioned to ${targetStatus}.`,
    });
  }

  private isTransitionAllowed(from: CertificationStatus, to: CertificationStatus): boolean {
    switch (from) {
      case CertificationStatus.ISSUED:
        return (
          to === CertificationStatus.VERIFIED ||
          to === CertificationStatus.REVOKED ||
          to === CertificationStatus.ARCHIVED
        );
      case CertificationStatus.VERIFIED:
        return (
          to === CertificationStatus.ACTIVE ||
          to === CertificationStatus.SUSPENDED ||
          to === CertificationStatus.REVOKED ||
          to === CertificationStatus.ARCHIVED
        );
      case CertificationStatus.ACTIVE:
        return (
          to === CertificationStatus.SUSPENDED ||
          to === CertificationStatus.REVOKED ||
          to === CertificationStatus.ARCHIVED
        );
      case CertificationStatus.SUSPENDED:
        return (
          to === CertificationStatus.ACTIVE ||
          to === CertificationStatus.REVOKED ||
          to === CertificationStatus.ARCHIVED
        );
      case CertificationStatus.REVOKED:
        return to === CertificationStatus.ARCHIVED;
      case CertificationStatus.ARCHIVED:
        return false; // Terminal state
      default:
        return false;
    }
  }

  public toSnapshot(): CertificationProps {
    return {
      id: this._id,
      assessment_id: this._assessment_id,
      policy_decision_id: this._policy_decision_id,
      metadata: this._metadata,
      traceability: this._traceability,
      status: this._status,
      history: this.history,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }
}
