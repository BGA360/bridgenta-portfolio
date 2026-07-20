/**
 * @file orchestration-traceability.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Orchestration Traceability Manager
 */

import { TraceabilityReference } from '../domain/types.js';

export class OrchestrationTraceabilityManager {
  public static readonly DEFAULT_TRACEABILITY: TraceabilityReference = {
    constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md (Pipeline Orchestration & Coordination)',
    contract_id: 'CTR-006 (Platform Orchestration Contract)',
    domain_concept: 'Platform Integration, Pipeline Orchestration, Execution Flow',
  };

  public static createReference(customSource?: string): TraceabilityReference {
    return {
      constitutional_source: customSource || OrchestrationTraceabilityManager.DEFAULT_TRACEABILITY.constitutional_source,
      contract_id: OrchestrationTraceabilityManager.DEFAULT_TRACEABILITY.contract_id,
      domain_concept: OrchestrationTraceabilityManager.DEFAULT_TRACEABILITY.domain_concept,
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
