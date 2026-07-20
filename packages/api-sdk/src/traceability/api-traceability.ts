/**
 * @file api-traceability.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Platform API & SDK Traceability Manager
 */

import { TraceabilityReference } from '../domain/types.js';

export class APITraceabilityManager {
  public static readonly DEFAULT_TRACEABILITY: TraceabilityReference = {
    constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md (Public API Surface)',
    contract_id: 'CTR-009 (Platform API & SDK Contract)',
    domain_concept: 'Public API Surface, SDK Abstraction, Developer Interface',
  };

  public static createReference(customSource?: string): TraceabilityReference {
    return {
      constitutional_source: customSource || APITraceabilityManager.DEFAULT_TRACEABILITY.constitutional_source,
      contract_id: APITraceabilityManager.DEFAULT_TRACEABILITY.contract_id,
      domain_concept: APITraceabilityManager.DEFAULT_TRACEABILITY.domain_concept,
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
