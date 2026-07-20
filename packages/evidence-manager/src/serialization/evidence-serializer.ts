/**
 * @file evidence-serializer.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Serializer
 */

import { Evidence, EvidenceProps } from '../domain/evidence.aggregate.js';
import { EvidenceId, AssessmentId, EvidenceChecksum, Timestamp } from '../domain/types.js';
import { EvidenceValidationError } from '../errors/evidence.errors.js';

export interface SerializedEvidencePayload {
  readonly schema_version: '1.0.0';
  readonly data: EvidenceProps;
}

export class EvidenceSerializer {
  public static readonly SCHEMA_VERSION = '1.0.0';

  /**
   * Serializes an Evidence aggregate into a canonical JSON string payload.
   *
   * @param evidence Aggregate root instance.
   * @returns Formatted JSON string.
   */
  public static serialize(evidence: Evidence): string {
    if (!evidence || !(evidence instanceof Evidence)) {
      throw new EvidenceValidationError('Cannot serialize invalid Evidence aggregate instance.');
    }

    const payload: SerializedEvidencePayload = {
      schema_version: EvidenceSerializer.SCHEMA_VERSION,
      data: evidence.toObject(),
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Deserializes a canonical JSON string payload into an Evidence aggregate instance.
   *
   * @param jsonString Input JSON string.
   * @returns Reconstituted Evidence Aggregate instance.
   * @throws EvidenceValidationError if JSON is malformed or schema version is invalid.
   */
  public static deserialize(jsonString: string): Evidence {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new EvidenceValidationError('Failed to deserialize Evidence JSON: invalid syntax.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new EvidenceValidationError('Deserialized payload is not a valid object.');
    }

    const payload = parsed as Partial<SerializedEvidencePayload>;
    if (payload.schema_version !== EvidenceSerializer.SCHEMA_VERSION) {
      throw new EvidenceValidationError(
        `Unsupported schema version '${payload.schema_version}'. Expected '${EvidenceSerializer.SCHEMA_VERSION}'.`
      );
    }

    if (!payload.data || typeof payload.data !== 'object') {
      throw new EvidenceValidationError('Deserialized payload missing data section.');
    }

    const data = payload.data as EvidenceProps;

    return new Evidence({
      id: EvidenceId.create(data.id),
      assessment_id: AssessmentId.create(data.assessment_id),
      metadata: { ...data.metadata },
      provenance: {
        origin: data.provenance.origin,
        collection_timestamp: Timestamp.create(data.provenance.collection_timestamp),
        submitting_authority: data.provenance.submitting_authority,
        correlation_id: data.provenance.correlation_id,
      },
      checksum: EvidenceChecksum.create(data.checksum),
      traceability: { ...data.traceability },
      raw_payload: data.raw_payload,
      status: data.status,
      history: data.history ? data.history.map((h) => ({ ...h, timestamp: Timestamp.create(h.timestamp) })) : [],
      created_at: Timestamp.create(data.created_at),
      updated_at: Timestamp.create(data.updated_at),
    });
  }
}
