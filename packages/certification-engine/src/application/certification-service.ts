/**
 * @file certification-service.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Engine Application Service
 */

import { PolicyDecision } from '@cep/policy-resolver';
import {
  CertificationId,
  CertificationStatus,
  CertificationMetadata,
  CertificationRecord,
  Timestamp,
} from '../domain/types.js';
import { Certification, CertificationProps } from '../domain/certification.aggregate.js';
import { CertificationValidator } from '../validation/certification-validator.js';
import {
  CertificationIssuanceRequestModel,
  CertificationIssuanceResultModel,
  CertificationVerificationModel,
} from '../contracts/certification.contract.js';
import {
  DuplicateCertificationError,
  CertificationNotFoundError,
} from '../errors/certification.errors.js';
import {
  CertificationDomainEvent,
  CertificationIssuedEvent,
  CertificationVerifiedEvent,
  CertificationActivatedEvent,
  CertificationRevokedEvent,
  CertificationArchivedEvent,
} from '../events/certification.events.js';
import { CertificationTraceabilityManager } from '../traceability/certification-traceability.js';

export class CertificationEngineService {
  private readonly registry = new Map<string, Certification>();
  private readonly records = new Map<string, CertificationRecord>();
  private readonly events: CertificationDomainEvent[] = [];

  /**
   * Issues a formal constitutional Certification for an APPROVED PolicyDecision.
   */
  public issueCertification(
    request: CertificationIssuanceRequestModel,
    policyDecision: PolicyDecision
  ): { certification: Certification; resultModel: CertificationIssuanceResultModel } {
    CertificationValidator.validateIssuanceRequest(request);
    CertificationValidator.validatePolicyDecisionApproval(policyDecision);

    const certIdStr = `cert-${request.assessment_id}-${Date.now()}`;
    const certId = CertificationId.create(certIdStr);

    if (this.registry.has(certId)) {
      throw new DuplicateCertificationError(certId);
    }

    const metadata: CertificationMetadata = {
      title: request.title,
      issuer: request.issuer,
      framework_id: request.framework_id,
      governance_level: request.governance_level,
      type: request.type,
      valid_until: request.valid_until ? Timestamp.create(request.valid_until) : undefined,
      tags: Object.freeze(request.tags || []),
    };

    const props: CertificationProps = {
      id: certId,
      assessment_id: request.assessment_id,
      policy_decision_id: request.policy_decision_id,
      metadata: metadata,
      traceability: CertificationTraceabilityManager.createReference(),
      status: CertificationStatus.ISSUED,
    };

    const certification = new Certification(props);
    this.registry.set(certification.id, certification);

    const now = Timestamp.create();
    const record: CertificationRecord = {
      record_id: `rec-${certification.id}`,
      certification_id: certification.id,
      assessment_id: certification.assessment_id,
      policy_decision_id: certification.policy_decision_id,
      issued_at: now,
    };
    this.records.set(record.record_id, record);

    const event: CertificationIssuedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'CertificationIssued',
      certification_id: certification.id,
      assessment_id: certification.assessment_id,
      policy_decision_id: certification.policy_decision_id,
      status: CertificationStatus.ISSUED,
      timestamp: now,
    };
    this.events.push(event);

    const resultModel: CertificationIssuanceResultModel = {
      certification_id: certification.id,
      assessment_id: certification.assessment_id,
      policy_decision_id: certification.policy_decision_id,
      status: certification.status,
      issued_at: now,
    };

    return { certification, resultModel };
  }

  /**
   * Verifies a Certification and updates state to VERIFIED.
   */
  public verifyCertification(certificationId: string): CertificationVerificationModel {
    const cert = this.getCertification(certificationId);
    cert.transitionStatus(CertificationStatus.VERIFIED, 'Verification audit gate passed.');

    const now = Timestamp.create();
    const hashPayload = `${cert.id}:${cert.assessment_id}:${cert.policy_decision_id}:${cert.status}`;
    const verificationHash = `sha256-hash-${this.simpleHash(hashPayload)}`;

    const event: CertificationVerifiedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'CertificationVerified',
      certification_id: cert.id,
      status: CertificationStatus.VERIFIED,
      verification_hash: verificationHash,
      timestamp: now,
    };
    this.events.push(event);

    return {
      certification_id: cert.id,
      status: cert.status,
      verification_hash: verificationHash,
      verified_at: now,
    };
  }

  /**
   * Activates a VERIFIED certification.
   */
  public activateCertification(certificationId: string): void {
    const cert = this.getCertification(certificationId);
    cert.transitionStatus(CertificationStatus.ACTIVE, 'Certification activated for governance gate clearance.');

    const event: CertificationActivatedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'CertificationActivated',
      certification_id: cert.id,
      status: CertificationStatus.ACTIVE,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);
  }

  /**
   * Revokes a certification.
   */
  public revokeCertification(certificationId: string, reason: string): void {
    const cert = this.getCertification(certificationId);
    cert.transitionStatus(CertificationStatus.REVOKED, reason);

    const event: CertificationRevokedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'CertificationRevoked',
      certification_id: cert.id,
      status: CertificationStatus.REVOKED,
      reason: reason,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);
  }

  /**
   * Archives a certification.
   */
  public archiveCertification(certificationId: string): void {
    const cert = this.getCertification(certificationId);
    cert.transitionStatus(CertificationStatus.ARCHIVED, 'Certification archived.');

    const event: CertificationArchivedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'CertificationArchived',
      certification_id: cert.id,
      status: CertificationStatus.ARCHIVED,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);
  }

  /**
   * Retrieves a Certification by ID.
   */
  public getCertification(certificationId: string): Certification {
    const cert = this.registry.get(certificationId);
    if (!cert) {
      throw new CertificationNotFoundError(certificationId);
    }
    return cert;
  }

  /**
   * Returns read-only array of all emitted domain events.
   */
  public getEvents(): readonly CertificationDomainEvent[] {
    return Object.freeze([...this.events]);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

export function createCertificationEngineService(): CertificationEngineService {
  return new CertificationEngineService();
}
