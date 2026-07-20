/**
 * @file pipeline.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Sequential Pipeline Execution Engine
 */

import {
  createAssessmentOrchestrator,
  AssessmentRequestModel,
  AssessmentState,
  FindingStatus as AssessmentFindingStatus,
} from '@cep/assessment-core';
import {
  createEvidenceService,
  EvidenceSubmissionModel,
  EvidenceStatus,
  Evidence,
} from '@cep/evidence-manager';
import {
  createRuleEngineService,
  RuleProps,
} from '@cep/rule-engine';
import {
  createPolicyResolverService,
  PolicyLevel,
  PolicyStatus,
} from '@cep/policy-resolver';
import {
  createCertificationEngineService,
  CertificationLevel,
  CertificationType,
  CertificationStatus,
} from '@cep/certification-engine';

import {
  ExecutionId,
  CorrelationId,
  PipelineStage,
  PipelineStatus,
  ExecutionSummary,
  Timestamp,
} from '../domain/types.js';
import { ExecutionContext } from '../context/execution-context.js';
import {
  OrchestrationDomainEvent,
  PipelineStartedEvent,
  StageCompletedEvent,
  StageFailedEvent,
  PipelineCompletedEvent,
  PipelineAbortedEvent,
} from '../events/orchestration.events.js';
import { OrchestrationTraceabilityManager } from '../traceability/orchestration-traceability.js';

export interface PipelineExecutionConfig {
  governance_level?: CertificationLevel;
  certification_title?: string;
  certification_issuer?: string;
  framework_id?: string;
}

export class PipelineEngine {
  private readonly events: OrchestrationDomainEvent[] = [];

  public getEvents(): readonly OrchestrationDomainEvent[] {
    return Object.freeze([...this.events]);
  }

  public execute(
    request: AssessmentRequestModel,
    submissions: readonly EvidenceSubmissionModel[],
    rules: readonly RuleProps[],
    config: PipelineExecutionConfig = {}
  ): { context: ExecutionContext; summary: ExecutionSummary } {
    const startTimeMs = Date.now();
    const execId = ExecutionId.create(`exec-${request.request_id}-${startTimeMs}`);
    const corrId = CorrelationId.create(`corr-${request.request_id}`);
    const traceability = OrchestrationTraceabilityManager.createReference();

    let context = new ExecutionContext({
      execution_id: execId,
      correlation_id: corrId,
      current_stage: PipelineStage.ASSESSMENT_INITIATION,
      traceability: traceability,
    });

    const startEvent: PipelineStartedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'PipelineStarted',
      execution_id: execId,
      correlation_id: corrId,
      assessment_request_id: request.request_id,
      initial_stage: PipelineStage.ASSESSMENT_INITIATION,
      timestamp: Timestamp.create(),
    };
    this.events.push(startEvent);

    // -------------------------------------------------------------
    // Stage 1: Assessment Initiation (@cep/assessment-core)
    // -------------------------------------------------------------
    const assessmentOrchestrator = createAssessmentOrchestrator();
    let assessmentModel = assessmentOrchestrator.createAssessment(request);
    context = context.bindAssessmentId(assessmentModel.assessment_id);

    assessmentOrchestrator.transitionState(
      assessmentModel.assessment_id,
      AssessmentState.COLLECTING_EVIDENCE
    );

    const stage1Completed: StageCompletedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'StageCompleted',
      execution_id: execId,
      correlation_id: corrId,
      completed_stage: PipelineStage.ASSESSMENT_INITIATION,
      next_stage: PipelineStage.EVIDENCE_COLLECTION,
      timestamp: Timestamp.create(),
    };
    this.events.push(stage1Completed);
    context = context.advanceStage(PipelineStage.EVIDENCE_COLLECTION);

    // -------------------------------------------------------------
    // Stage 2: Evidence Collection (@cep/evidence-manager)
    // -------------------------------------------------------------
    const evidenceService = createEvidenceService();
    const collectedEvidences: Evidence[] = [];

    for (const sub of submissions) {
      const receipt = evidenceService.submitEvidence(sub);
      const evi = evidenceService.getEvidence(receipt.evidence_id);
      evidenceService.validateEvidenceIntegrity(evi.id, sub.content_checksum);
      const acceptedEvi = evidenceService.acceptEvidence(evi.id);
      collectedEvidences.push(acceptedEvi);
    }

    assessmentOrchestrator.transitionState(
      assessmentModel.assessment_id,
      AssessmentState.UNDER_REVIEW
    );

    const stage2Completed: StageCompletedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'StageCompleted',
      execution_id: execId,
      correlation_id: corrId,
      completed_stage: PipelineStage.EVIDENCE_COLLECTION,
      next_stage: PipelineStage.RULE_EVALUATION,
      timestamp: Timestamp.create(),
    };
    this.events.push(stage2Completed);
    context = context.advanceStage(PipelineStage.RULE_EVALUATION);

    // -------------------------------------------------------------
    // Stage 3: Rule Evaluation (@cep/rule-engine)
    // -------------------------------------------------------------
    const ruleEngine = createRuleEngineService();
    for (const ruleProps of rules) {
      ruleEngine.registerRule(ruleProps);
    }

    const targetEvidenceIds = collectedEvidences.map((e) => e.id);
    const { evaluation, resultModel: ruleResultModel } = ruleEngine.evaluateEvidence(
      {
        evaluation_id: `eval-${assessmentModel.assessment_id}`,
        assessment_id: assessmentModel.assessment_id,
        target_evidence_ids: targetEvidenceIds,
      },
      collectedEvidences
    );

    const stage3Completed: StageCompletedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'StageCompleted',
      execution_id: execId,
      correlation_id: corrId,
      completed_stage: PipelineStage.RULE_EVALUATION,
      next_stage: PipelineStage.POLICY_RESOLUTION,
      timestamp: Timestamp.create(),
    };
    this.events.push(stage3Completed);
    context = context.advanceStage(PipelineStage.POLICY_RESOLUTION);

    // -------------------------------------------------------------
    // Stage 4: Policy Resolution (@cep/policy-resolver)
    // -------------------------------------------------------------
    const policyResolver = createPolicyResolverService();
    const govLevel = (config.governance_level as string as PolicyLevel) || PolicyLevel.LEVEL_3;
    const policyDecision = policyResolver.createPolicyDecision(
      assessmentModel.assessment_id,
      evaluation.evaluation_id,
      ruleResultModel.overall_status as any,
      govLevel
    );

    if (policyDecision.status !== PolicyStatus.APPROVED) {
      assessmentOrchestrator.transitionState(
        assessmentModel.assessment_id,
        AssessmentState.FAILED
      );

      const stageFailed: StageFailedEvent = {
        event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        event_name: 'StageFailed',
        execution_id: execId,
        correlation_id: corrId,
        failed_stage: PipelineStage.POLICY_RESOLUTION,
        error_message: policyDecision.rationale,
        error_code: 'ERR-ORC-002',
        timestamp: Timestamp.create(),
      };
      this.events.push(stageFailed);

      const pipelineAborted: PipelineAbortedEvent = {
        event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        event_name: 'PipelineAborted',
        execution_id: execId,
        correlation_id: corrId,
        status: PipelineStatus.ABORTED,
        aborted_at_stage: PipelineStage.POLICY_RESOLUTION,
        reason: policyDecision.rationale,
        timestamp: Timestamp.create(),
      };
      this.events.push(pipelineAborted);

      const durationMs = Date.now() - startTimeMs;
      const abortedSummary: ExecutionSummary = {
        execution_id: execId,
        correlation_id: corrId,
        pipeline_status: PipelineStatus.ABORTED,
        assessment: {
          assessment_id: assessmentModel.assessment_id,
          project_ref: request.project_ref,
          target_governance_level: request.target_governance_level,
          status: AssessmentState.FAILED,
        },
        evidence: {
          total_evidence_count: collectedEvidences.length,
          accepted_evidence_ids: Object.freeze(targetEvidenceIds),
        },
        rules: {
          evaluation_id: evaluation.evaluation_id,
          rules_evaluated: rules.length,
          overall_rule_status: ruleResultModel.overall_status,
          finding_count: ruleResultModel.total_findings_generated,
        },
        policy: {
          policy_decision_id: policyDecision.decision_id,
          policy_status: policyDecision.status,
          governance_level: policyDecision.governance_level,
          rationale: policyDecision.rationale,
        },
        certification: {
          issued: false,
        },
        duration_ms: durationMs,
        completed_stages: context.completed_stages,
        traceability: traceability,
        created_at: context.start_timestamp,
      };

      return { context, summary: abortedSummary };
    }

    const stage4Completed: StageCompletedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'StageCompleted',
      execution_id: execId,
      correlation_id: corrId,
      completed_stage: PipelineStage.POLICY_RESOLUTION,
      next_stage: PipelineStage.CERTIFICATION_ISSUANCE,
      timestamp: Timestamp.create(),
    };
    this.events.push(stage4Completed);
    context = context.advanceStage(PipelineStage.CERTIFICATION_ISSUANCE);

    // -------------------------------------------------------------
    // Stage 5: Certification Issuance (@cep/certification-engine)
    // -------------------------------------------------------------
    const certEngine = createCertificationEngineService();
    const { certification, resultModel: certResultModel } = certEngine.issueCertification(
      {
        assessment_id: assessmentModel.assessment_id,
        policy_decision_id: policyDecision.decision_id,
        title: config.certification_title || 'Constitutional Attestation Certificate',
        issuer: config.certification_issuer || 'BPGA Release Authority',
        framework_id: config.framework_id || 'CEF',
        governance_level: config.governance_level || CertificationLevel.LEVEL_3,
        type: CertificationType.CONSTITUTIONAL_COMPLIANCE,
      },
      policyDecision
    );

    const verification = certEngine.verifyCertification(certification.id);
    certEngine.activateCertification(certification.id);

    assessmentOrchestrator.transitionState(
      assessmentModel.assessment_id,
      AssessmentState.COMPLETED
    );
    assessmentOrchestrator.transitionState(
      assessmentModel.assessment_id,
      AssessmentState.CERTIFIED
    );

    const stage5Completed: StageCompletedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'StageCompleted',
      execution_id: execId,
      correlation_id: corrId,
      completed_stage: PipelineStage.CERTIFICATION_ISSUANCE,
      next_stage: PipelineStage.EXECUTION_SUMMARY,
      timestamp: Timestamp.create(),
    };
    this.events.push(stage5Completed);
    context = context.advanceStage(PipelineStage.EXECUTION_SUMMARY).complete();

    const durationMs = Date.now() - startTimeMs;

    const pipelineCompleted: PipelineCompletedEvent = {
      event_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_name: 'PipelineCompleted',
      execution_id: execId,
      correlation_id: corrId,
      status: PipelineStatus.SUCCESS,
      assessment_id: assessmentModel.assessment_id,
      certification_id: certification.id,
      duration_ms: durationMs,
      timestamp: Timestamp.create(),
    };
    this.events.push(pipelineCompleted);

    const successSummary: ExecutionSummary = {
      execution_id: execId,
      correlation_id: corrId,
      pipeline_status: PipelineStatus.SUCCESS,
      assessment: {
        assessment_id: assessmentModel.assessment_id,
        project_ref: request.project_ref,
        target_governance_level: request.target_governance_level,
        status: AssessmentState.CERTIFIED,
      },
      evidence: {
        total_evidence_count: collectedEvidences.length,
        accepted_evidence_ids: Object.freeze(targetEvidenceIds),
      },
      rules: {
        evaluation_id: evaluation.evaluation_id,
        rules_evaluated: rules.length,
        overall_rule_status: ruleResultModel.overall_status,
        finding_count: ruleResultModel.total_findings_generated,
      },
      policy: {
        policy_decision_id: policyDecision.decision_id,
        policy_status: policyDecision.status,
        governance_level: policyDecision.governance_level,
        rationale: policyDecision.rationale,
      },
      certification: {
        certification_id: certification.id,
        certification_status: certification.status,
        verification_hash: verification.verification_hash,
        issued: true,
      },
      duration_ms: durationMs,
      completed_stages: context.completed_stages,
      traceability: traceability,
      created_at: context.start_timestamp,
    };

    return { context, summary: successSummary };
  }
}
