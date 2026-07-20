/**
 * @file types.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Platform Orchestration Domain Types & Models
 */

// Branded Value Objects
export type ExecutionId = string & { readonly __brand: unique symbol };
export type CorrelationId = string & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

export const ExecutionId = {
  create: (id: string): ExecutionId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ExecutionId must be a non-empty string.');
    }
    return id.trim() as ExecutionId;
  },
};

export const CorrelationId = {
  create: (id: string): CorrelationId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('CorrelationId must be a non-empty string.');
    }
    return id.trim() as CorrelationId;
  },
};

export const Timestamp = {
  create: (isoString?: string): Timestamp => {
    const str = isoString || new Date().toISOString();
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error('Timestamp must be a valid ISO 8601 date string.');
    }
    return date.toISOString() as Timestamp;
  },
};

/**
 * Pipeline Stage enumeration representing the 5 sequential stages.
 */
export enum PipelineStage {
  ASSESSMENT_INITIATION = 'ASSESSMENT_INITIATION',
  EVIDENCE_COLLECTION = 'EVIDENCE_COLLECTION',
  RULE_EVALUATION = 'RULE_EVALUATION',
  POLICY_RESOLUTION = 'POLICY_RESOLUTION',
  CERTIFICATION_ISSUANCE = 'CERTIFICATION_ISSUANCE',
  EXECUTION_SUMMARY = 'EXECUTION_SUMMARY',
}

/**
 * Overall Pipeline execution status.
 */
export enum PipelineStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ABORTED = 'ABORTED',
}

/**
 * Stage assessment summary.
 */
export interface AssessmentSummary {
  readonly assessment_id: string;
  readonly project_ref: string;
  readonly target_governance_level: number;
  readonly status: string;
}

/**
 * Stage evidence summary.
 */
export interface EvidenceSummary {
  readonly total_evidence_count: number;
  readonly accepted_evidence_ids: readonly string[];
}

/**
 * Stage rule summary.
 */
export interface RuleSummary {
  readonly evaluation_id: string;
  readonly rules_evaluated: number;
  readonly overall_rule_status: string;
  readonly finding_count: number;
}

/**
 * Stage policy summary.
 */
export interface PolicySummary {
  readonly policy_decision_id: string;
  readonly policy_status: string;
  readonly governance_level: string;
  readonly rationale: string;
}

/**
 * Stage certification summary.
 */
export interface CertificationSummary {
  readonly certification_id?: string;
  readonly certification_status?: string;
  readonly verification_hash?: string;
  readonly issued: boolean;
}

/**
 * Canonical Execution Summary.
 */
export interface ExecutionSummary {
  readonly execution_id: ExecutionId;
  readonly correlation_id: CorrelationId;
  readonly pipeline_status: PipelineStatus;
  readonly assessment: AssessmentSummary;
  readonly evidence: EvidenceSummary;
  readonly rules: RuleSummary;
  readonly policy: PolicySummary;
  readonly certification: CertificationSummary;
  readonly duration_ms: number;
  readonly completed_stages: readonly PipelineStage[];
  readonly traceability: TraceabilityReference;
  readonly created_at: Timestamp;
}

/**
 * Traceability Reference model.
 */
export interface TraceabilityReference {
  readonly constitutional_source: string;
  readonly contract_id: string;
  readonly domain_concept: string;
}
