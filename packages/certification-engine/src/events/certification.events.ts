/**
 * @file certification.events.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Domain Events
 */

import { CertificationId, CertificationStatus, Timestamp } from '../domain/types.js';

export interface BaseCertificationEvent {
  readonly event_id: string;
  readonly event_name: string;
  readonly timestamp: Timestamp;
}

export interface CertificationIssuedEvent extends BaseCertificationEvent {
  readonly event_name: 'CertificationIssued';
  readonly certification_id: CertificationId;
  readonly assessment_id: string;
  readonly policy_decision_id: string;
  readonly status: CertificationStatus.ISSUED;
}

export interface CertificationVerifiedEvent extends BaseCertificationEvent {
  readonly event_name: 'CertificationVerified';
  readonly certification_id: CertificationId;
  readonly status: CertificationStatus.VERIFIED;
  readonly verification_hash: string;
}

export interface CertificationActivatedEvent extends BaseCertificationEvent {
  readonly event_name: 'CertificationActivated';
  readonly certification_id: CertificationId;
  readonly status: CertificationStatus.ACTIVE;
}

export interface CertificationRevokedEvent extends BaseCertificationEvent {
  readonly event_name: 'CertificationRevoked';
  readonly certification_id: CertificationId;
  readonly status: CertificationStatus.REVOKED;
  readonly reason: string;
}

export interface CertificationArchivedEvent extends BaseCertificationEvent {
  readonly event_name: 'CertificationArchived';
  readonly certification_id: CertificationId;
  readonly status: CertificationStatus.ARCHIVED;
}

export type CertificationDomainEvent =
  | CertificationIssuedEvent
  | CertificationVerifiedEvent
  | CertificationActivatedEvent
  | CertificationRevokedEvent
  | CertificationArchivedEvent;
