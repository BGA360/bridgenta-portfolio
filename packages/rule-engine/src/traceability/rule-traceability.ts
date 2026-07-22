/**
 * @file rule-traceability.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Traceability Manager
 */

import { TraceabilityReference } from '../domain/types.js';

export class RuleTraceabilityManager {
  public static readonly DEFAULT_TRACEABILITY: TraceabilityReference = {
    constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md (Deterministic Rule Evaluation)',
    contract_id: 'CTR-003 (Rule Evaluation Contract)',
    domain_concept: 'Rule, Finding, Rule Evaluation',
  };

  /**
   * Creates a canonical TraceabilityReference for a Rule or Finding.
   */
  public static createReference(customSource?: string): TraceabilityReference {
    return {
      constitutional_source: customSource || RuleTraceabilityManager.DEFAULT_TRACEABILITY.constitutional_source,
      contract_id: RuleTraceabilityManager.DEFAULT_TRACEABILITY.contract_id,
      domain_concept: RuleTraceabilityManager.DEFAULT_TRACEABILITY.domain_concept,
    };
  }

  /**
   * Verifies that a TraceabilityReference is valid and complete.
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
