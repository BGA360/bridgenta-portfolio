/**
 * @file certification-traceability.ts
 * @module @cep/certification-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-005 (Certification Contract)
 * @domainConcept Certification Traceability Manager
 */

import { TraceabilityReference } from '../domain/types.js';

export class CertificationTraceabilityManager {
  public static readonly DEFAULT_TRACEABILITY: TraceabilityReference = {
    constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md (Formal Attestation & Trust)',
    contract_id: 'CTR-005 (Certification Contract)',
    domain_concept: 'Certification, Attestation, Trust Layer',
  };

  public static createReference(customSource?: string): TraceabilityReference {
    return {
      constitutional_source: customSource || CertificationTraceabilityManager.DEFAULT_TRACEABILITY.constitutional_source,
      contract_id: CertificationTraceabilityManager.DEFAULT_TRACEABILITY.contract_id,
      domain_concept: CertificationTraceabilityManager.DEFAULT_TRACEABILITY.domain_concept,
    };
  }

  public static verifyReference(ref: TraceabilityReference): boolean {
    return (
      Boolean(ref) &&
      typeof ref.constitutional_source === 'string' && ref.constitutional_source.trim().length > 0 &&
      typeof ref.contract_id === 'string' && ref.contract_id.trim().length > 0 &&
      typeof ref.domain_concept === 'string' && ref.domain_concept.trim().length > 0
    );
  }
}
