/**
 * @file validator.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Request & Response Schema Validator
 */

import { PipelineExecutionRequest, PipelineResponse } from '../domain/types.js';
import { APIValidationError } from '../errors/api.errors.js';

export class APIRequestValidator {
  public static validatePipelineRequest(request: PipelineExecutionRequest): boolean {
    if (!request.request_id || request.request_id.trim() === '') {
      throw new APIValidationError('request_id cannot be empty.');
    }
    if (!request.project_ref || request.project_ref.trim() === '') {
      throw new APIValidationError('project_ref cannot be empty.');
    }
    if (request.target_governance_level < 0 || request.target_governance_level > 5) {
      throw new APIValidationError('target_governance_level must be between 0 and 5.');
    }
    if (!request.scope_manifest || request.scope_manifest.length === 0) {
      throw new APIValidationError('scope_manifest cannot be empty.');
    }
    if (!request.submissions || request.submissions.length === 0) {
      throw new APIValidationError('submissions cannot be empty.');
    }
    return true;
  }
}

export class APIResponseValidator {
  public static validatePipelineResponse(response: PipelineResponse): boolean {
    if (!response.execution_id || !response.correlation_id || !response.pipeline_status) {
      throw new APIValidationError('PipelineResponse missing fundamental execution metadata.');
    }
    return true;
  }
}
