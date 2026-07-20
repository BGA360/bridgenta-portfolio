/**
 * @file evidence.events.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Domain Events
 */

import {
  EvidenceId,
  AssessmentId,
  EvidenceChecksum,
  Timestamp,
  EvidenceStatus,
} from '../domain/types.js';

export interface BaseEvidenceEvent {
  readonly event_id: string;
  readonly event_name: string;
  readonly evidence_id: EvidenceId;
  readonly assessment_id: AssessmentId;
  readonly timestamp: Timestamp;
}

export interface EvidenceSubmittedEvent extends BaseEvidenceEvent {
  readonly event_name: 'EvidenceSubmitted';
  readonly checksum: EvidenceChecksum;
  readonly origin: string;
  readonly submitting_authority: string;
}

export interface EvidenceValidatedEvent extends BaseEvidenceEvent {
  readonly event_name: 'EvidenceValidated';
  readonly checksum: EvidenceChecksum;
  readonly validation_status: 'VERIFIED' | 'REJECTED';
}

export interface EvidenceAcceptedEvent extends BaseEvidenceEvent {
  readonly event_name: 'EvidenceAccepted';
  readonly status: EvidenceStatus.ACCEPTED;
}

export interface EvidenceReferencedEvent extends BaseEvidenceEvent {
  readonly event_name: 'EvidenceReferenced';
  readonly referenced_by: string; // e.g. RuleId or AssessmentId
}

export interface EvidenceArchivedEvent extends BaseEvidenceEvent {
  readonly event_name: 'EvidenceArchived';
  readonly archive_reason: string;
}

export type EvidenceDomainEvent =
  | EvidenceSubmittedEvent
  | EvidenceValidatedEvent
  | EvidenceAcceptedEvent
  | EvidenceReferencedEvent
  | EvidenceArchivedEvent;
