/**
 * @file provider-traceability.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept AI Provider Gateway Traceability Manager
 */

import { TraceabilityReference } from '../domain/types.js';

export class ProviderTraceabilityManager {
  public static readonly DEFAULT_TRACEABILITY: TraceabilityReference = {
    constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md (AI Provider Abstraction)',
    contract_id: 'CTR-008 (AI Provider Gateway Contract)',
    domain_concept: 'AI Provider Abstraction, Canonical AI Model, Provider Independence',
  };

  public static createReference(customSource?: string): TraceabilityReference {
    return {
      constitutional_source: customSource || ProviderTraceabilityManager.DEFAULT_TRACEABILITY.constitutional_source,
      contract_id: ProviderTraceabilityManager.DEFAULT_TRACEABILITY.contract_id,
      domain_concept: ProviderTraceabilityManager.DEFAULT_TRACEABILITY.domain_concept,
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
