/**
 * @file evidence-service.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Application Service
 */

import {
  EvidenceId,
  AssessmentId,
  EvidenceChecksum,
  Timestamp,
  EvidenceStatus,
  EvidenceBundle,
  EvidenceReference,
} from '../domain/types.js';
import { Evidence } from '../domain/evidence.aggregate.js';
import { EvidenceSubmissionModel, EvidenceIngestionReceiptModel } from '../contracts/evidence.contract.js';
import { EvidenceValidator } from '../validation/evidence-validator.js';
import { EvidenceTraceabilityManager } from '../traceability/evidence-traceability.js';
import {
  DuplicateEvidenceError,
  EvidenceNotFoundError,
} from '../errors/evidence.errors.js';
import {
  EvidenceDomainEvent,
  EvidenceSubmittedEvent,
  EvidenceValidatedEvent,
  EvidenceAcceptedEvent,
  EvidenceReferencedEvent,
  EvidenceArchivedEvent,
} from '../events/evidence.events.js';

export class EvidenceService {
  private readonly store = new Map<string, Evidence>();
  private readonly events: EvidenceDomainEvent[] = [];

  /**
   * Ingests and validates a new evidence submission according to CTR-002.
   *
   * @param submission Evidence submission request payload.
   * @returns EvidenceIngestionReceiptModel confirmation receipt.
   */
  public submitEvidence(submission: EvidenceSubmissionModel): EvidenceIngestionReceiptModel {
    EvidenceValidator.validateSubmission(submission);

    const evidenceIdStr = `evi-${submission.submission_id}`;
    if (this.store.has(evidenceIdStr)) {
      throw new DuplicateEvidenceError(evidenceIdStr);
    }

    const evidenceId = EvidenceId.create(evidenceIdStr);
    const assessmentId = AssessmentId.create(submission.assessment_id);
    const checksum = EvidenceChecksum.create(submission.content_checksum);
    const now = Timestamp.create();

    const evidence = new Evidence({
      id: evidenceId,
      assessment_id: assessmentId,
      metadata: {
        size_bytes: new TextEncoder().encode(submission.raw_payload).length,
        mime_type: 'text/plain',
        category: submission.category,
        type: submission.type,
        tags: submission.tags || [],
      },
      provenance: {
        origin: submission.origin,
        collection_timestamp: now,
        submitting_authority: submission.submitting_authority,
        correlation_id: submission.correlation_id,
      },
      checksum: checksum,
      traceability: EvidenceTraceabilityManager.createReference(submission.constitutional_source),
      raw_payload: submission.raw_payload,
      status: EvidenceStatus.SUBMITTED,
      created_at: now,
    });

    this.store.set(evidenceId, evidence);

    // Emit EvidenceSubmitted Event
    const event: EvidenceSubmittedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'EvidenceSubmitted',
      evidence_id: evidenceId,
      assessment_id: assessmentId,
      checksum: checksum,
      origin: submission.origin,
      submitting_authority: submission.submitting_authority,
      timestamp: now,
    };
    this.events.push(event);

    return {
      receipt_id: `rcpt-${submission.submission_id}`,
      evidence_id: evidenceId,
      assessment_id: assessmentId,
      status: EvidenceStatus.SUBMITTED,
      checksum: checksum,
      ingested_at: now,
    };
  }

  /**
   * Verifies the SHA-256 digest of an ingested evidence item and transitions status to VALIDATED.
   */
  public validateEvidenceIntegrity(evidenceId: string, computedChecksumHex: string): Evidence {
    const evidence = this.getEvidence(evidenceId);
    evidence.verifyIntegrity(computedChecksumHex);

    evidence.transitionStatus(EvidenceStatus.VALIDATED, 'SHA-256 digest integrity verified.');

    const event: EvidenceValidatedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'EvidenceValidated',
      evidence_id: evidence.id,
      assessment_id: evidence.assessment_id,
      checksum: evidence.checksum,
      validation_status: 'VERIFIED',
      timestamp: Timestamp.create(),
    };
    this.events.push(event);

    return evidence;
  }

  /**
   * Accepts validated evidence into the platform evidence registry.
   */
  public acceptEvidence(evidenceId: string): Evidence {
    const evidence = this.getEvidence(evidenceId);
    evidence.transitionStatus(EvidenceStatus.ACCEPTED, 'Evidence accepted by platform steward.');

    const event: EvidenceAcceptedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'EvidenceAccepted',
      evidence_id: evidence.id,
      assessment_id: evidence.assessment_id,
      status: EvidenceStatus.ACCEPTED,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);

    return evidence;
  }

  /**
   * Marks accepted evidence as referenced by a specific rule or assessment run.
   */
  public referenceEvidence(evidenceId: string, referencedBy: string): Evidence {
    const evidence = this.getEvidence(evidenceId);
    evidence.transitionStatus(EvidenceStatus.REFERENCED, `Referenced by ${referencedBy}`);

    const event: EvidenceReferencedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'EvidenceReferenced',
      evidence_id: evidence.id,
      assessment_id: evidence.assessment_id,
      referenced_by: referencedBy,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);

    return evidence;
  }

  /**
   * Archives an evidence item.
   */
  public archiveEvidence(evidenceId: string, reason: string): Evidence {
    const evidence = this.getEvidence(evidenceId);
    evidence.transitionStatus(EvidenceStatus.ARCHIVED, reason);

    const event: EvidenceArchivedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'EvidenceArchived',
      evidence_id: evidence.id,
      assessment_id: evidence.assessment_id,
      archive_reason: reason,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);

    return evidence;
  }

  /**
   * Assembles a sealed Evidence Bundle for an assessment.
   */
  public createEvidenceBundle(assessmentIdStr: string, evidenceIdStrs: string[]): EvidenceBundle {
    const assessmentId = AssessmentId.create(assessmentIdStr);
    const items: EvidenceReference[] = [];
    let combinedHashes = '';

    for (const idStr of evidenceIdStrs) {
      const evidence = this.getEvidence(idStr);
      items.push({
        evidence_id: evidence.id,
        checksum: evidence.checksum,
        status: evidence.status,
      });
      combinedHashes += evidence.checksum;
    }

    // Mock deterministic 64-char hex sealed checksum
    let hashVal = 0;
    for (let i = 0; i < combinedHashes.length; i++) {
      hashVal = (hashVal << 5) - hashVal + combinedHashes.charCodeAt(i);
      hashVal |= 0;
    }
    const hexHash = Math.abs(hashVal).toString(16).padStart(64, 'a');

    return {
      bundle_id: `bundle-${Date.now()}`,
      assessment_id: assessmentId,
      evidence_items: items,
      sealed_checksum: EvidenceChecksum.create(hexHash),
      created_at: Timestamp.create(),
    };
  }

  /**
   * Retrieves an Evidence aggregate by ID.
   */
  public getEvidence(evidenceId: string): Evidence {
    const evidence = this.store.get(evidenceId);
    if (!evidence) {
      throw new EvidenceNotFoundError(evidenceId);
    }
    return evidence;
  }

  /**
   * Returns read-only array of all emitted domain events.
   */
  public getEvents(): readonly EvidenceDomainEvent[] {
    return Object.freeze([...this.events]);
  }
}

export function createEvidenceService(): EvidenceService {
  return new EvidenceService();
}
