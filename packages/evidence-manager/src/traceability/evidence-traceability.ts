/**
 * @file evidence-traceability.ts
 * @module @cep/evidence-manager
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-002 (Evidence Submission Contract)
 * @domainConcept Evidence Traceability Manager
 */

import { TraceabilityReference } from '../domain/types.js';

export class EvidenceTraceabilityManager {
  public static readonly DEFAULT_TRACEABILITY: TraceabilityReference = {
    constitutional_source: 'docs/project/CEP-ENGINEERING-PRINCIPLES.md (Principle 2: Evidence Before Assertion)',
    contract_id: 'CTR-002 (Evidence Submission Contract)',
    domain_concept: 'Evidence, Evidence Bundle, Evidence Provenance',
  };

  /**
   * Generates a canonical TraceabilityReference for ingested evidence.
   */
  public static createReference(customSource?: string): TraceabilityReference {
    return {
      constitutional_source: customSource || EvidenceTraceabilityManager.DEFAULT_TRACEABILITY.constitutional_source,
      contract_id: EvidenceTraceabilityManager.DEFAULT_TRACEABILITY.contract_id,
      domain_concept: EvidenceTraceabilityManager.DEFAULT_TRACEABILITY.domain_concept,
    };
  }

  /**
   * Verifies that a TraceabilityReference contains valid non-empty fields.
   */
  public static verifyReference(ref: TraceabilityReference): boolean {
    return (
      Boolean(ref) &&
      typeof ref.constitutional_source === 'string' && ref.constitutional_source.trim().length > 0 &&
      typeof ref.contract_id === 'string' && ref.contract_id.trim().length > 0 &&
      typeof ref.domain_concept === 'string' && ref.domain_concept.trim().length > 0
    );
  }
}
