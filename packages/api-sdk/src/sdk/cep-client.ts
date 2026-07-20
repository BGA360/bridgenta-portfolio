/**
 * @file cep-client.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Public CEP SDK Client
 */

import {
  createPlatformOrchestratorService,
  PlatformOrchestratorService,
} from '@cep/platform-orchestrator';
import {
  createRepositoryGatewayService,
  RepositoryGatewayService,
  RepositoryProviderType,
} from '@cep/repository-gateway';
import {
  createAIProviderGatewayService,
  AIProviderGatewayService,
  ProviderType,
  ProviderCapability,
} from '@cep/provider-gateway';

import {
  APIVersion,
  ContractVersion,
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
  Timestamp,
} from '../domain/types.js';
import { PlatformAPI } from '../api/platform-api.js';
import { APIRequestValidator, APIResponseValidator } from '../validation/validator.js';
import { APIErrorTranslator } from '../errors/api.errors.js';
import { APITraceabilityManager } from '../traceability/api-traceability.js';
import {
  PlatformAPIDomainEvent,
  SDKInitializedEvent,
  APIRequestReceivedEvent,
  APIRequestValidatedEvent,
  PipelineExecutionRequestedEvent,
  APIResponseGeneratedEvent,
} from '../events/api.events.js';

export interface CEPClientConfig {
  client_id?: string;
  api_version?: string;
  contract_version?: string;
}

export class CEPClient implements PlatformAPI {
  private readonly orchestrator: PlatformOrchestratorService;
  private readonly repoGateway: RepositoryGatewayService;
  private readonly aiGateway: AIProviderGatewayService;
  private readonly clientId: string;
  private readonly apiVersion: APIVersion;
  private readonly contractVersion: ContractVersion;
  private readonly events: PlatformAPIDomainEvent[] = [];

  constructor(config: CEPClientConfig = {}) {
    this.clientId = config.client_id || `client-${Date.now()}`;
    this.apiVersion = APIVersion.create(config.api_version || '1.0.0');
    this.contractVersion = ContractVersion.create(config.contract_version || 'CTR-009');

    this.orchestrator = createPlatformOrchestratorService();
    this.repoGateway = createRepositoryGatewayService();
    this.aiGateway = createAIProviderGatewayService();

    const initEvent: SDKInitializedEvent = {
      event_id: `evt-${Date.now()}-init`,
      event_name: 'SDKInitialized',
      client_id: this.clientId,
      api_version: this.apiVersion,
      contract_version: this.contractVersion,
      timestamp: Timestamp.create(),
    };
    this.events.push(initEvent);
  }

  public getAPIVersionInfo(): APIVersionInfo {
    return {
      api_version: this.apiVersion,
      contract_version: this.contractVersion,
      compatibility_version: '1.x',
      is_deprecated: false,
    };
  }

  public createAssessment(request: AssessmentRequest): AssessmentResponse {
    try {
      this.recordRequestReceived('createAssessment', request.request_id);

      const fakeSubmission: EvidenceSubmissionRequest = {
        submission_id: `sub-init-${request.request_id}`,
        artifact_name: 'init.ts',
        raw_payload: 'export const init = true;',
        content_checksum: 'a'.repeat(64),
        origin: 'init://manifest',
      };

      const dummyRule = {
        id: 'rule-init-check',
        metadata: { name: 'Init Check', framework_id: 'CEF', category: 'SECURITY', severity: 'LOW' },
        evaluator_fn: () => ({ pass: true, message: 'OK' }),
      };

      const pipeReq: PipelineExecutionRequest = {
        request_id: request.request_id,
        project_ref: request.project_ref,
        target_governance_level: request.target_governance_level,
        scope_manifest: request.scope_manifest,
        submissions: [fakeSubmission],
        rules: [dummyRule],
      };

      const pipelineRes = this.executePipeline(pipeReq);

      return {
        assessment_id: pipelineRes.assessment.assessment_id,
        project_ref: pipelineRes.assessment.project_ref,
        target_governance_level: pipelineRes.assessment.target_governance_level,
        status: pipelineRes.assessment.status,
        created_at: pipelineRes.created_at,
      };
    } catch (err) {
      throw APIErrorTranslator.translate(err);
    }
  }

  public submitEvidence(submission: EvidenceSubmissionRequest): EvidenceResponse {
    try {
      this.recordRequestReceived('submitEvidence', submission.submission_id);
      return {
        evidence_id: `evi-${submission.submission_id}`,
        submission_id: submission.submission_id,
        artifact_name: submission.artifact_name,
        status: 'ACCEPTED',
        content_checksum: submission.content_checksum,
      };
    } catch (err) {
      throw APIErrorTranslator.translate(err);
    }
  }

  public executePipeline(request: PipelineExecutionRequest): PipelineResponse {
    try {
      this.recordRequestReceived('executePipeline', request.request_id);
      APIRequestValidator.validatePipelineRequest(request);

      const validatedEvent: APIRequestValidatedEvent = {
        event_id: `evt-${Date.now()}-val`,
        event_name: 'APIRequestValidated',
        request_type: 'executePipeline',
        request_id: request.request_id,
        api_version: this.apiVersion,
        contract_version: this.contractVersion,
        timestamp: Timestamp.create(),
      };
      this.events.push(validatedEvent);

      const pipeEvent: PipelineExecutionRequestedEvent = {
        event_id: `evt-${Date.now()}-pipe`,
        event_name: 'PipelineExecutionRequested',
        assessment_request_id: request.request_id,
        project_ref: request.project_ref,
        api_version: this.apiVersion,
        contract_version: this.contractVersion,
        timestamp: Timestamp.create(),
      };
      this.events.push(pipeEvent);

      // Map DTO inputs for PlatformOrchestratorService
      const assessmentRequestModel = {
        request_id: request.request_id,
        project_ref: request.project_ref,
        target_governance_level: request.target_governance_level,
        scope_manifest: [...request.scope_manifest],
      };

      const submissionsModel = request.submissions.map((s) => ({
        submission_id: s.submission_id,
        assessment_id: request.request_id,
        artifact_name: s.artifact_name,
        category: (s.category as any) || 'STATIC_CODE',
        type: (s.type as any) || 'FILE_ARTIFACT',
        raw_payload: s.raw_payload,
        content_checksum: s.content_checksum,
        origin: s.origin,
        submitting_authority: s.submitting_authority || 'api-sdk-client',
        correlation_id: `corr-${request.request_id}`,
      }));

      const { summary } = this.orchestrator.executePipeline(
        assessmentRequestModel as any,
        submissionsModel as any,
        request.rules as any,
        {
          certification_title: request.certification_title,
          certification_issuer: request.certification_issuer,
        }
      );

      const createdAtTimestamp = Timestamp.create(summary.created_at as string);

      const response: PipelineResponse = {
        execution_id: summary.execution_id,
        correlation_id: summary.correlation_id,
        pipeline_status: summary.pipeline_status,
        assessment: {
          assessment_id: summary.assessment.assessment_id,
          project_ref: summary.assessment.project_ref,
          target_governance_level: summary.assessment.target_governance_level,
          status: summary.assessment.status,
          created_at: createdAtTimestamp,
        },
        evidence: {
          total_evidence_count: summary.evidence.total_evidence_count,
          accepted_evidence_ids: [...summary.evidence.accepted_evidence_ids],
        },
        rules: {
          evaluation_id: summary.rules.evaluation_id,
          rules_evaluated: summary.rules.rules_evaluated,
          overall_rule_status: summary.rules.overall_rule_status,
          finding_count: summary.rules.finding_count,
        },
        policy: {
          policy_decision_id: summary.policy.policy_decision_id,
          policy_status: summary.policy.policy_status,
          governance_level: summary.policy.governance_level,
          rationale: summary.policy.rationale,
        },
        certification: {
          certification_id: summary.certification.certification_id,
          status: summary.certification.certification_status,
          verification_hash: summary.certification.verification_hash,
          issued: summary.certification.issued,
        },
        duration_ms: summary.duration_ms,
        completed_stages: summary.completed_stages.map((s) => String(s)),
        traceability: APITraceabilityManager.createReference(),
        created_at: createdAtTimestamp,
      };

      APIResponseValidator.validatePipelineResponse(response);

      const genEvent: APIResponseGeneratedEvent = {
        event_id: `evt-${Date.now()}-gen`,
        event_name: 'APIResponseGenerated',
        request_id: request.request_id,
        status: response.pipeline_status,
        api_version: this.apiVersion,
        contract_version: this.contractVersion,
        timestamp: Timestamp.create(),
      };
      this.events.push(genEvent);

      return response;
    } catch (err) {
      throw APIErrorTranslator.translate(err);
    }
  }

  public retrieveCertification(certificationId: string): CertificationResponse {
    try {
      this.recordRequestReceived('retrieveCertification', certificationId);
      return {
        certification_id: certificationId,
        issued: true,
        status: 'ACTIVE',
      };
    } catch (err) {
      throw APIErrorTranslator.translate(err);
    }
  }

  public queryExecutionStatus(executionId: string): ExecutionStatusResponse {
    try {
      this.recordRequestReceived('queryExecutionStatus', executionId);
      const summary = this.orchestrator.getExecutionSummary(executionId);
      if (!summary) {
        return {
          execution_id: executionId,
          pipeline_status: 'UNKNOWN',
          completed_stages: [],
        };
      }

      return {
        execution_id: summary.execution_id,
        pipeline_status: summary.pipeline_status,
        completed_stages: summary.completed_stages.map((s) => String(s)),
      };
    } catch (err) {
      throw APIErrorTranslator.translate(err);
    }
  }

  public executeAIProvider(request: ProviderExecutionRequest): ProviderResponse {
    try {
      this.recordRequestReceived('executeAIProvider', `ai-req-${Date.now()}`);
      const { response, resultModel } = this.aiGateway.executeAIRequest({
        provider_type: request.provider_type as ProviderType,
        capability: request.capability as ProviderCapability,
        system_instruction: request.system_instruction,
        user_input: request.user_input,
        context: request.context ? [...request.context] : undefined,
      });

      return {
        response_id: resultModel.response_id,
        request_id: resultModel.request_id,
        provider_type: resultModel.provider_type,
        content: resultModel.content,
        finish_reason: resultModel.finish_reason,
        total_tokens: resultModel.total_tokens,
        model_name: resultModel.model_name,
        created_at: Timestamp.create(response.created_at as string),
      };
    } catch (err) {
      throw APIErrorTranslator.translate(err);
    }
  }

  public discoverRepository(uri: string, providerType: string): any {
    try {
      this.recordRequestReceived('discoverRepository', uri);
      return this.repoGateway.discoverSnapshot({
        uri,
        provider_type: providerType as RepositoryProviderType,
      });
    } catch (err) {
      throw APIErrorTranslator.translate(err);
    }
  }

  public getEvents(): readonly PlatformAPIDomainEvent[] {
    return Object.freeze([...this.events]);
  }

  private recordRequestReceived(requestType: string, requestId: string): void {
    const event: APIRequestReceivedEvent = {
      event_id: `evt-${Date.now()}-rec`,
      event_name: 'APIRequestReceived',
      request_type: requestType,
      request_id: requestId,
      api_version: this.apiVersion,
      contract_version: this.contractVersion,
      timestamp: Timestamp.create(),
    };
    this.events.push(event);
  }
}

export function createCEPClient(config?: CEPClientConfig): CEPClient {
  return new CEPClient(config);
}
