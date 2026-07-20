/**
 * @file api.contract.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept CTR-009 Specification Data Models
 */

export interface APIExecutionRequestModel {
  request_id: string;
  project_ref: string;
  target_governance_level: number;
  scope_manifest: string[];
}

export interface APIExecutionResultModel {
  execution_id: string;
  correlation_id: string;
  pipeline_status: string;
  assessment_status: string;
  evidence_count: number;
  rules_evaluated: number;
  policy_status: string;
  certification_issued: boolean;
  duration_ms: number;
  created_at: string;
}

export interface APIVersionQueryResultModel {
  api_version: string;
  contract_version: string;
  compatibility_version: string;
  is_deprecated: boolean;
}
