/**
 * @file platform-api.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Public Platform API Interface
 */

import {
  APIVersionInfo,
  AssessmentRequest,
  AssessmentResponse,
  EvidenceSubmissionRequest,
  EvidenceResponse,
  PipelineExecutionRequest,
  PipelineResponse,
  CertificationResponse,
  ExecutionStatusResponse,
  ProviderExecutionRequest,
  ProviderResponse,
} from '../domain/types.js';

export interface PlatformAPI {
  /**
   * Returns API versioning metadata.
   */
  getAPIVersionInfo(): APIVersionInfo;

  /**
   * Initiates a new Assessment.
   */
  createAssessment(request: AssessmentRequest): AssessmentResponse;

  /**
   * Submits evidence for an assessment.
   */
  submitEvidence(submission: EvidenceSubmissionRequest): EvidenceResponse;

  /**
   * Executes a full CEP platform pipeline.
   */
  executePipeline(request: PipelineExecutionRequest): PipelineResponse;

  /**
   * Retrieves certification details by certification ID.
   */
  retrieveCertification(certificationId: string): CertificationResponse;

  /**
   * Queries execution status by execution ID.
   */
  queryExecutionStatus(executionId: string): ExecutionStatusResponse;

  /**
   * Submits an AI request through the AI Provider Gateway.
   */
  executeAIProvider(request: ProviderExecutionRequest): ProviderResponse;

  /**
   * Discovers repository metadata through the Repository Gateway.
   */
  discoverRepository(uri: string, providerType: string): any;
}
