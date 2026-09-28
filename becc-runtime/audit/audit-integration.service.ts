/**
 * BECC v2 — Audit Integration Service
 *
 * Provides centralized audit logging for BECC operations (guidance queries,
 * finding escalations, readiness evaluations) as specified in BECC-V2-IMPL-016.
 *
 * EPISTEMIC BOUNDARY:
 * Audit recording proves that a BECC operation occurred and captures its inputs/outputs/provenance.
 * It does NOT grant publication release authority, recompute Governed Learning guidance, or
 * duplicate Governed Learning state machines.
 */

import { BeccAuditLedgerPort } from './audit-ledger.port.js';
import {
  BeccAuditRecord,
  BeccAuditRecordInput,
  BeccAuditRecordStatus,
  ProvenanceRef,
  BeccAuditAuthorityBoundary
} from './audit-ledger.types.js';

export interface AuditGuidanceQueryContext {
  queryInput: {
    commandId: string;
    projectRef?: string;
    workstreamRef?: string;
    actorRef?: string;
  };
  queryResult: {
    status: string;
    guidanceSet?: {
      lessons?: Array<{ lessonRef: string; version?: string }>;
    };
  };
  occurredAt: string;
  correlationRef?: string;
  causationRef?: string;
}

export interface AuditFindingEscalationContext {
  escalationInput: {
    escalationId: string;
    findingId: string;
    projectRef?: string;
    evidenceItems: Array<{ evidenceId: string }>;
    actorRef?: string;
  };
  escalationResult: {
    status: string;
    observationId?: string;
    details?: string;
  };
  occurredAt: string;
  correlationRef?: string;
  causationRef?: string;
}

export interface AuditReadinessEvaluationContext {
  evaluationInput: {
    evaluationId: string;
    projectRef: string;
    candidateRef?: string;
    issuedAt: string;
    evidenceItems: Array<{ evidenceId: string }>;
    actorRef?: string;
  };
  evaluationResult: {
    status: string;
    ruleSourceRef: string;
    ruleSourceRevision?: string;
    evidenceRefs: string[];
  };
  occurredAt: string;
  correlationRef?: string;
  causationRef?: string;
}

export class BeccAuditIntegrationService {
  private readonly ledger: BeccAuditLedgerPort;

  constructor(ledger: BeccAuditLedgerPort) {
    if (!ledger) {
      throw new Error('Explicit BeccAuditLedgerPort dependency is required');
    }
    this.ledger = ledger;
  }

  getAuthorityBoundary(): BeccAuditAuthorityBoundary {
    return {
      finalPublicationAuthority: 'M5 / PRAG Governance',
      beccOwnsFinalAuthority: false,
      auditIsGovernanceDecision: false,
      auditOnly: true
    };
  }

  /**
   * Records a BECC Audit Record directly.
   */
  async recordAudit(input: BeccAuditRecordInput): Promise<BeccAuditRecord> {
    if (!input || !input.operationId || !input.operationType) {
      throw new Error('Audit record input requires valid operationId and operationType');
    }

    if (!input.occurredAt || isNaN(Date.parse(input.occurredAt))) {
      throw new Error('Audit record requires a valid caller-supplied occurredAt timestamp');
    }

    const auditRecordId =
      input.auditRecordId || `audit_${input.operationType.toLowerCase()}_${input.operationId}`;

    const record: BeccAuditRecord = {
      auditRecordId,
      operationType: input.operationType,
      operationId: input.operationId,
      projectRef: input.projectRef,
      candidateRef: input.candidateRef,
      workstreamRef: input.workstreamRef,
      actorRef: input.actorRef,
      authorityContextRef: input.authorityContextRef,
      assessmentContextRef: input.assessmentContextRef,
      correlationRef: input.correlationRef,
      causationRef: input.causationRef,
      inputRefs: [...(input.inputRefs || [])],
      evidenceRefs: [...(input.evidenceRefs || [])],
      provenanceRefs: [...(input.provenanceRefs || [])],
      resultStatus: input.resultStatus,
      resultRef: input.resultRef,
      occurredAt: input.occurredAt,
      externalAuthorityBoundary: input.externalAuthorityBoundary || 'M5 / PRAG Governance',
      metadata: input.metadata ? { ...input.metadata } : undefined
    };

    await this.ledger.append(record);
    return record;
  }

  /**
   * Captures audit traceability for a Governed Guidance Query (IMPL-013).
   * Does NOT recompute GL guidance logic.
   */
  async recordGuidanceQueryAudit(
    context: AuditGuidanceQueryContext
  ): Promise<BeccAuditRecord> {
    const { queryInput, queryResult, occurredAt, correlationRef, causationRef } = context;

    let resultStatus: BeccAuditRecordStatus = 'ERROR';
    if (queryResult.status === 'SUCCESS') {
      resultStatus = 'SUCCESS';
    } else if (queryResult.status === 'REFUSED') {
      resultStatus = 'REFUSED';
    }

    const provenanceRefs: ProvenanceRef[] = [];
    if (queryResult.guidanceSet?.lessons) {
      for (const lesson of queryResult.guidanceSet.lessons) {
        provenanceRefs.push({
          refType: 'GL_LESSON',
          ref: lesson.lessonRef,
          revision: lesson.version
        });
      }
    }

    return this.recordAudit({
      operationType: 'GUIDANCE_QUERY',
      operationId: queryInput.commandId,
      projectRef: queryInput.projectRef,
      workstreamRef: queryInput.workstreamRef,
      actorRef: queryInput.actorRef,
      correlationRef,
      causationRef,
      inputRefs: [queryInput.commandId],
      evidenceRefs: [],
      provenanceRefs,
      resultStatus,
      resultRef: queryInput.commandId,
      occurredAt
    });
  }

  /**
   * Captures audit traceability for a Finding -> Observation Escalation (IMPL-014).
   * Does NOT duplicate GL escalation state machine.
   */
  async recordFindingEscalationAudit(
    context: AuditFindingEscalationContext
  ): Promise<BeccAuditRecord> {
    const { escalationInput, escalationResult, occurredAt, correlationRef, causationRef } = context;

    let resultStatus: BeccAuditRecordStatus = 'ERROR';
    if (escalationResult.status === 'SUCCESS') {
      resultStatus = 'SUCCESS';
    } else if (escalationResult.status === 'REFUSED') {
      resultStatus = 'REFUSED';
    } else if (escalationResult.status === 'INDETERMINATE') {
      resultStatus = 'INDETERMINATE';
    }

    const provenanceRefs: ProvenanceRef[] = [
      {
        refType: 'BECC_FINDING',
        ref: escalationInput.findingId
      }
    ];

    if (escalationResult.observationId) {
      provenanceRefs.push({
        refType: 'GL_OBSERVATION',
        ref: escalationResult.observationId
      });
    }

    return this.recordAudit({
      operationType: 'FINDING_ESCALATION',
      operationId: escalationInput.escalationId,
      projectRef: escalationInput.projectRef,
      actorRef: escalationInput.actorRef,
      correlationRef,
      causationRef: causationRef || escalationInput.findingId,
      inputRefs: [escalationInput.findingId],
      evidenceRefs: escalationInput.evidenceItems.map((e) => e.evidenceId),
      provenanceRefs,
      resultStatus,
      resultRef: escalationResult.observationId,
      occurredAt
    });
  }

  /**
   * Captures audit traceability for a Publication & Portfolio Readiness Evaluation (IMPL-015).
   * Does NOT grant publication release authority.
   */
  async recordReadinessEvaluationAudit(
    context: AuditReadinessEvaluationContext
  ): Promise<BeccAuditRecord> {
    const { evaluationInput, evaluationResult, occurredAt, correlationRef, causationRef } = context;

    let resultStatus: BeccAuditRecordStatus = 'ERROR';
    if (evaluationResult.status === 'READY_BY_EVIDENCE') {
      resultStatus = 'SUCCESS';
    } else if (evaluationResult.status === 'NOT_READY') {
      resultStatus = 'REFUSED';
    } else if (evaluationResult.status === 'INDETERMINATE') {
      resultStatus = 'INDETERMINATE';
    }

    const provenanceRefs: ProvenanceRef[] = [
      {
        refType: 'RULE_SOURCE',
        ref: evaluationResult.ruleSourceRef,
        revision: evaluationResult.ruleSourceRevision
      }
    ];

    return this.recordAudit({
      operationType: 'READINESS_EVALUATION',
      operationId: evaluationInput.evaluationId,
      projectRef: evaluationInput.projectRef,
      candidateRef: evaluationInput.candidateRef,
      actorRef: evaluationInput.actorRef,
      correlationRef,
      causationRef,
      inputRefs: [evaluationInput.evaluationId],
      evidenceRefs: evaluationResult.evidenceRefs || [],
      provenanceRefs,
      resultStatus,
      resultRef: evaluationResult.status,
      occurredAt,
      externalAuthorityBoundary: 'M5 / PRAG Governance'
    });
  }
}
