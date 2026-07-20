/**
 * @file evidence.aggregate.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Aggregate Root
 */

import {
  EvidenceId,
  AssessmentId,
  EvidenceChecksum,
  Timestamp,
  EvidenceStatus,
  EvidenceMetadata,
  EvidenceSource,
  TraceabilityReference,
  EvidenceTransitionRecord,
} from './types.js';
import { InvalidEvidenceTransitionError, EvidenceIntegrityError } from '../errors/evidence.errors.js';

/**
 * Valid lifecycle state transition rules for Evidence.
 */
const ALLOWED_EVIDENCE_TRANSITIONS: Record<EvidenceStatus, EvidenceStatus[]> = {
  [EvidenceStatus.SUBMITTED]: [EvidenceStatus.VALIDATED, EvidenceStatus.ARCHIVED],
  [EvidenceStatus.VALIDATED]: [EvidenceStatus.ACCEPTED, EvidenceStatus.ARCHIVED],
  [EvidenceStatus.ACCEPTED]: [EvidenceStatus.REFERENCED, EvidenceStatus.ARCHIVED],
  [EvidenceStatus.REFERENCED]: [EvidenceStatus.ARCHIVED],
  [EvidenceStatus.ARCHIVED]: [],
};

/**
 * Initial properties required to instantiate an Evidence Aggregate.
 */
export interface EvidenceProps {
  id: EvidenceId;
  assessment_id: AssessmentId;
  metadata: EvidenceMetadata;
  provenance: EvidenceSource;
  checksum: EvidenceChecksum;
  traceability: TraceabilityReference;
  raw_payload: string;
  status?: EvidenceStatus;
  history?: EvidenceTransitionRecord[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

/**
 * Evidence Aggregate Root enforcing identity, provenance immutability, state transitions, and history retention.
 */
export class Evidence {
  private readonly _id: EvidenceId;
  private readonly _assessment_id: AssessmentId;
  private readonly _metadata: EvidenceMetadata;
  private _provenance: EvidenceSource;
  private _checksum: EvidenceChecksum;
  private readonly _traceability: TraceabilityReference;
  private readonly _raw_payload: string;
  private _status: EvidenceStatus;
  private readonly _history: EvidenceTransitionRecord[];
  private readonly _created_at: Timestamp;
  private _updated_at: Timestamp;

  constructor(props: EvidenceProps) {
    this._id = props.id;
    this._assessment_id = props.assessment_id;
    this._metadata = props.metadata;
    this._provenance = props.provenance;
    this._checksum = props.checksum;
    this._traceability = props.traceability;
    this._raw_payload = props.raw_payload;
    this._status = props.status || EvidenceStatus.SUBMITTED;
    this._history = props.history ? [...props.history] : [];
    this._created_at = props.created_at || Timestamp.create();
    this._updated_at = props.updated_at || this._created_at;
  }

  // Getters
  public get id(): EvidenceId { return this._id; }
  public get assessment_id(): AssessmentId { return this._assessment_id; }
  public get metadata(): EvidenceMetadata { return Object.freeze({ ...this._metadata }); }
  public get provenance(): EvidenceSource { return Object.freeze({ ...this._provenance }); }
  public get checksum(): EvidenceChecksum { return this._checksum; }
  public get traceability(): TraceabilityReference { return Object.freeze({ ...this._traceability }); }
  public get raw_payload(): string { return this._raw_payload; }
  public get status(): EvidenceStatus { return this._status; }
  public get history(): readonly EvidenceTransitionRecord[] { return Object.freeze([...this._history]); }
  public get created_at(): Timestamp { return this._created_at; }
  public get updated_at(): Timestamp { return this._updated_at; }

  /**
   * Executes a legal state transition for this Evidence item.
   *
   * @param targetStatus Desired target state.
   * @param reason Optional rationale for state transition.
   * @throws InvalidEvidenceTransitionError if transition is forbidden.
   */
  public transitionStatus(targetStatus: EvidenceStatus, reason?: string): void {
    const allowed = ALLOWED_EVIDENCE_TRANSITIONS[this._status] || [];
    if (!allowed.includes(targetStatus)) {
      throw new InvalidEvidenceTransitionError(this._status, targetStatus);
    }

    const previousStatus = this._status;
    const now = Timestamp.create();

    this._status = targetStatus;
    this._updated_at = now;

    this._history.push({
      from_status: previousStatus,
      to_status: targetStatus,
      timestamp: now,
      reason: reason || `Transitioned from ${previousStatus} to ${targetStatus}`,
    });
  }

  /**
   * Verifies that the raw payload matches the declared SHA-256 checksum.
   *
   * @throws EvidenceIntegrityError if checksum fails match.
   */
  public verifyIntegrity(computedChecksumHex: string): void {
    const validChecksum = EvidenceChecksum.create(computedChecksumHex);
    if (validChecksum !== this._checksum) {
      throw new EvidenceIntegrityError(
        `Evidence integrity check failed: computed checksum '${validChecksum}' does not match declared checksum '${this._checksum}'.`,
        this._id
      );
    }
  }

  /**
   * Exports plain Javascript object representation of this Aggregate.
   */
  public toObject(): EvidenceProps {
    return {
      id: this._id,
      assessment_id: this._assessment_id,
      metadata: { ...this._metadata },
      provenance: { ...this._provenance },
      checksum: this._checksum,
      traceability: { ...this._traceability },
      raw_payload: this._raw_payload,
      status: this._status,
      history: [...this._history],
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }
}
