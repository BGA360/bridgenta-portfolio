/**
 * @file assessment.types.ts
 * @module @cep/assessment-core
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-001 (Assessment Contract)
 * @domainConcept Assessment, Assessment Request, Assessment Result, Finding
 */

/**
 * Legal state machine states for an Assessment entity per docs/domain/DOMAIN-LIFECYCLES.md.
 */
export enum AssessmentState {
  UNINITIALIZED = 'UNINITIALIZED',
  REQUESTED = 'REQUESTED',
  COLLECTING_EVIDENCE = 'COLLECTING_EVIDENCE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  CERTIFIED = 'CERTIFIED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Finding severity levels per docs/domain/DOMAIN-MODEL.md.
 */
export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFORMATIONAL = 'INFORMATIONAL',
}

/**
 * Finding status evaluation outcome.
 */
export enum FindingStatus {
  PASS = 'PASS',
  WARN = 'WARN',
  FAIL = 'FAIL',
}

/**
 * Conceptual Finding model attached to an Assessment.
 */
export interface FindingModel {
  finding_id: string;
  rule_id: string;
  severity: FindingSeverity;
  status: FindingStatus;
  evidence_ref?: string;
  message: string;
  created_at: string;
}

/**
 * Conceptual Assessment Request payload model per CTR-001.
 */
export interface AssessmentRequestModel {
  request_id: string;
  project_ref: string;
  scope_manifest: string[];
  target_governance_level: number; // Integer between 0 and 5
  trigger_event?: string;
  created_at?: string;
}

/**
 * Complete Assessment Result entity model per CTR-001 and Sprint B1 Domain Model.
 */
export interface AssessmentResultModel {
  assessment_id: string;
  request: AssessmentRequestModel;
  state: AssessmentState;
  findings: FindingModel[];
  governance_level: number;
  overall_status: FindingStatus;
  created_at: string;
  updated_at: string;
}
