/**
 * @file certification-serializer.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Canonical JSON Serializer
 */

import { Certification, CertificationProps } from '../domain/certification.aggregate.js';
import { CertificationValidationError } from '../errors/certification.errors.js';

export interface CanonicalCertificationDto {
  schema_version: '1.0.0';
  id: string;
  assessment_id: string;
  policy_decision_id: string;
  metadata: CertificationProps['metadata'];
  traceability: CertificationProps['traceability'];
  status: CertificationProps['status'];
  history: CertificationProps['history'];
  created_at: string;
  updated_at: string;
}

export class CertificationSerializer {
  public static readonly CURRENT_SCHEMA_VERSION = '1.0.0';

  /**
   * Serializes a Certification aggregate root to a canonical JSON string.
   */
  public static serialize(certification: Certification): string {
    const snapshot = certification.toSnapshot();

    const dto: CanonicalCertificationDto = {
      schema_version: CertificationSerializer.CURRENT_SCHEMA_VERSION,
      id: snapshot.id,
      assessment_id: snapshot.assessment_id,
      policy_decision_id: snapshot.policy_decision_id,
      metadata: snapshot.metadata,
      traceability: snapshot.traceability,
      status: snapshot.status!,
      history: snapshot.history!,
      created_at: snapshot.created_at!,
      updated_at: snapshot.updated_at!,
    };

    return JSON.stringify(dto, null, 2);
  }

  /**
   * Deserializes a canonical JSON string back into a Certification aggregate root.
   */
  public static deserialize(jsonString: string): Certification {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new CertificationValidationError('Cannot deserialize null or invalid JSON string.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new CertificationValidationError('Failed to parse certification JSON payload.');
    }

    const dto = parsed as CanonicalCertificationDto;

    if (!dto || dto.schema_version !== CertificationSerializer.CURRENT_SCHEMA_VERSION) {
      throw new CertificationValidationError(
        `Unsupported certification schema version '${(dto as any)?.schema_version}'. Expected '${CertificationSerializer.CURRENT_SCHEMA_VERSION}'.`
      );
    }

    const props: CertificationProps = {
      id: dto.id as any,
      assessment_id: dto.assessment_id,
      policy_decision_id: dto.policy_decision_id,
      metadata: dto.metadata,
      traceability: dto.traceability,
      status: dto.status,
      history: dto.history,
      created_at: dto.created_at as any,
      updated_at: dto.updated_at as any,
    };

    return new Certification(props);
  }
}
