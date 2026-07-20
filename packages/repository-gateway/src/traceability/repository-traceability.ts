/**
 * @file repository-traceability.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Repository Gateway Traceability Manager
 */

import { TraceabilityReference } from '../domain/types.js';

export class RepositoryTraceabilityManager {
  public static readonly DEFAULT_TRACEABILITY: TraceabilityReference = {
    constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md (External Integration Boundary)',
    contract_id: 'CTR-007 (Repository Gateway Contract)',
    domain_concept: 'Repository Abstraction, Evidence Transformation, Provider Independence',
  };

  public static createReference(customSource?: string): TraceabilityReference {
    return {
      constitutional_source: customSource || RepositoryTraceabilityManager.DEFAULT_TRACEABILITY.constitutional_source,
      contract_id: RepositoryTraceabilityManager.DEFAULT_TRACEABILITY.contract_id,
      domain_concept: RepositoryTraceabilityManager.DEFAULT_TRACEABILITY.domain_concept,
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
