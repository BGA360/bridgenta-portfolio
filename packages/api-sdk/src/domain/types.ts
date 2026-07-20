/**
 * @file types.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Canonical API & SDK Domain Models
 */

// Branded Value Objects
export type APIVersion = string & { readonly __brand: unique symbol };
export type ContractVersion = string & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

export const APIVersion = {
  create: (ver: string = '1.0.0'): APIVersion => {
    if (!ver || typeof ver !== 'string' || ver.trim() === '') {
      throw new Error('APIVersion must be a non-empty string.');
    }
    return ver.trim() as APIVersion;
  },
};

export const ContractVersion = {
  create: (ver: string = 'CTR-009'): ContractVersion => {
    if (!ver || typeof ver !== 'string' || ver.trim() === '') {
      throw new Error('ContractVersion must be a non-empty string.');
    }
    return ver.trim() as ContractVersion;
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
 * Versioning Information Model.
 */
export interface APIVersionInfo {
  readonly api_version: APIVersion;
  readonly contract_version: ContractVersion;
  readonly compatibility_version: string;
  readonly is_deprecated: boolean;
}

/**
 * Public Assessment Request Model.
 */
export interface AssessmentRequest {
  readonly request_id: string;
  readonly project_ref: string;
  readonly target_governance_level: number;
  readonly scope_manifest: readonly string[];
}

/**
 * Public Evidence Submission Request Model.
 */
export interface EvidenceSubmissionRequest {
  readonly submission_id: string;
  readonly artifact_name: string;
  readonly raw_payload: string;
  readonly content_checksum: string;
  readonly origin: string;
  readonly category?: string;
  readonly type?: string;
  readonly submitting_authority?: string;
}

/**
 * Public Pipeline Execution Request Model.
 */
export interface PipelineExecutionRequest {
  readonly request_id: string;
  readonly project_ref: string;
  readonly target_governance_level: number;
  readonly scope_manifest: readonly string[];
  readonly submissions: readonly EvidenceSubmissionRequest[];
  readonly rules: readonly any[];
  readonly certification_title?: string;
  readonly certification_issuer?: string;
}

/**
 * Public Certification Request Model.
 */
export interface CertificationRequest {
  readonly assessment_id: string;
  readonly policy_decision_id: string;
  readonly title: string;
  readonly issuer: string;
  readonly governance_level: number;
}

/**
 * Public AI Provider Execution Request Model.
 */
export interface ProviderExecutionRequest {
  readonly provider_type: string;
  readonly capability: string;
  readonly system_instruction?: string;
  readonly user_input: string;
  readonly context?: readonly string[];
}

/**
 * Public Assessment Response Model.
 */
export interface AssessmentResponse {
  readonly assessment_id: string;
  readonly project_ref: string;
  readonly target_governance_level: number;
  readonly status: string;
  readonly created_at: Timestamp;
}

/**
 * Public Evidence Response Model.
 */
export interface EvidenceResponse {
  readonly evidence_id: string;
  readonly submission_id: string;
  readonly artifact_name: string;
  readonly status: string;
  readonly content_checksum: string;
}

/**
 * Public Certification Response Model.
 */
export interface CertificationResponse {
  readonly certification_id?: string;
  readonly assessment_id?: string;
  readonly status?: string;
  readonly title?: string;
  readonly issuer?: string;
  readonly governance_level?: number;
  readonly verification_hash?: string;
  readonly issued: boolean;
}

/**
 * Public Pipeline Execution Response Model.
 */
export interface PipelineResponse {
  readonly execution_id: string;
  readonly correlation_id: string;
  readonly pipeline_status: string;
  readonly assessment: AssessmentResponse;
  readonly evidence: {
    readonly total_evidence_count: number;
    readonly accepted_evidence_ids: readonly string[];
  };
  readonly rules: {
    readonly evaluation_id: string;
    readonly rules_evaluated: number;
    readonly overall_rule_status: string;
    readonly finding_count: number;
  };
  readonly policy: {
    readonly policy_decision_id: string;
    readonly policy_status: string;
    readonly governance_level: string;
    readonly rationale: string;
  };
  readonly certification: CertificationResponse;
  readonly duration_ms: number;
  readonly completed_stages: readonly string[];
  readonly traceability: TraceabilityReference;
  readonly created_at: Timestamp;
}

/**
 * Public AI Provider Response Model.
 */
export interface ProviderResponse {
  readonly response_id: string;
  readonly request_id: string;
  readonly provider_type: string;
  readonly content: string;
  readonly finish_reason: string;
  readonly total_tokens: number;
  readonly model_name: string;
  readonly created_at: Timestamp;
}

/**
 * Public Execution Status Response Model.
 */
export interface ExecutionStatusResponse {
  readonly execution_id: string;
  readonly pipeline_status: string;
  readonly current_stage?: string;
  readonly completed_stages: readonly string[];
}

/**
 * Traceability Reference Model.
 */
export interface TraceabilityReference {
  readonly constitutional_source: string;
  readonly contract_id: string;
  readonly domain_concept: string;
}
