import type {
  BECCFindingEscalationInput,
  GovernedLearningIntegrationAdapter,
} from '../governed-learning/governed-learning-adapter.types.js';
import type {
  EscalationRequestInput,
  FindingEscalationResult,
  EscalationPipelineStage,
  BECCFindingEvidenceInput,
} from './finding-escalation.types.js';
import type { ValidationFinding } from '../shared/types.js';
import type { BeccAuditIntegrationService } from '../audit/audit-integration.service.js';
import type { BeccOperationalObserverPort } from '../observability/observability.port.js';
import { ObservabilitySecurityPolicy } from '../observability/observability-security.policy.js';
import type { BeccOperationalContext, BeccOperationalResultStatus } from '../observability/observability.types.js';

export interface FindingEscalationServiceOptions {
  readonly adapter: GovernedLearningIntegrationAdapter;
  readonly auditService?: BeccAuditIntegrationService;
  readonly observer?: BeccOperationalObserverPort;
}

/**
 * FindingEscalationService
 * BECC v2 IMPL-014 Finding -> Observation Escalation Pipeline Service.
 *
 * Orchestrates the escalation of a BECC validation finding defect into Governed Learning
 * by reusing existing IMPL-012 adapter capabilities:
 *   1. DraftObservation
 *   2. AttachEvidence (for 1..N truthful evidence attachments)
 *   3. SubmitObservation
 *
 * Guarantees & Epistemic Invariants:
 * 1. Observed != Learned != Approved != Binding Policy.
 * 2. Pipeline STOPS at SubmitObservation. Does NOT create lesson candidates, approve lessons, propose rules, or adopt rules.
 * 3. Reuses IMPL-012 GovernedLearningIntegrationAdapter via explicit injection.
 * 4. Zero direct database access (PostgreSQL/SQLite) or transaction context leakage.
 * 5. Uses ONLY public exported surface of @cep/governed-learning (no deep imports).
 * 6. Preserves canonical observation identity (obs_${draftCommandId}) throughout multi-step pipeline.
 * 7. Enforces stable, caller-supplied issuedAt timestamp on retries for GL Stage 8 replay.
 * 8. Fails closed on missing finding ID, blank issuedAt, missing authority context, or fabricated evidence location.
 * 9. Maintains findingId <-> observationId traceability.
 * 10. Multi-step workflow is EVENTUAL_IDEMPOTENT (no distributed transactions or unauthorized compensating mutations).
 */
export class FindingEscalationService {
  private readonly adapter: GovernedLearningIntegrationAdapter;
  private readonly auditService?: BeccAuditIntegrationService;
  private readonly observer?: BeccOperationalObserverPort;

  constructor(options: FindingEscalationServiceOptions) {
    if (!options || !options.adapter) {
      throw new Error(
        'GovernedLearningIntegrationAdapter instance is required for FindingEscalationService construction. Silent fallback to unconfigured runtime is forbidden.'
      );
    }
    this.adapter = options.adapter;
    this.auditService = options.auditService;
    this.observer = options.observer;
  }

  /**
   * Escalates a BECC validation finding through DraftObservation -> AttachEvidence -> SubmitObservation.
   */
  public async escalateFinding(input: EscalationRequestInput): Promise<FindingEscalationResult> {
    const startTime = Date.now();
    const findingObj = input?.finding;
    const findingId = findingObj ? ('id' in findingObj ? findingObj.id : (findingObj as BECCFindingEscalationInput).findingId) : 'unknown';

    const context: BeccOperationalContext = ObservabilitySecurityPolicy.sanitizeContext({
      operationType: 'FINDING_ESCALATION',
      operationId: findingId || 'unknown-finding',
      correlationRef: findingId || 'unknown-finding',
      projectRef: (input as any)?.projectRef || (findingObj as any)?.projectRef,
      occurredAt: new Date().toISOString()
    });

    if (this.observer) {
      try {
        this.observer.operationStarted(context);
      } catch {
        // Failure isolation
      }
    }

    const emitOutcome = (res: FindingEscalationResult) => {
      const durationMs = Math.max(0, Date.now() - startTime);
      if (this.observer) {
        try {
          const opStatus: BeccOperationalResultStatus = res.ok
            ? 'SUCCESS'
            : (res.category === 'REFUSED' ? 'REFUSED' : 'ERROR');

          if (res.ok || res.category === 'REFUSED') {
            this.observer.operationCompleted(context, {
              operationalResultStatus: opStatus,
              domainResultStatus: res.category,
              durationMs
            });
          } else {
            const safeErr = ObservabilitySecurityPolicy.classifyError(res.errorDetails || res.reason || 'Escalation pipeline error');
            this.observer.operationFailed(context, safeErr, {
              operationalResultStatus: 'ERROR',
              domainResultStatus: 'ERROR',
              durationMs
            });
          }
        } catch {
          // Failure isolation
        }
      }
    };

    const observeGlCall = (op: string, res: { ok: boolean; category?: string; refusalCode?: string; reason?: string; errorDetails?: string }, durationMs: number) => {
      if (this.observer) {
        try {
          const status = res.ok ? 'SUCCESS' : (res.category === 'REFUSED' ? 'SUCCESS' : 'FAILURE');
          const safeErr = !res.ok ? ObservabilitySecurityPolicy.classifyError(res.errorDetails || res.reason || 'GL dependency call failed') : undefined;

          this.observer.dependencyCallObserved({
            dependencyName: 'GOVERNED_LEARNING',
            operation: op,
            status,
            durationMs,
            errorClass: safeErr?.errorClass,
            safeErrorCode: res.refusalCode || safeErr?.safeErrorCode,
            occurredAt: new Date().toISOString()
          });
        } catch {
          // Failure isolation
        }
      }
    };

    if (!input || !input.finding) {
      const result: FindingEscalationResult = {
        ok: false,
        category: 'REFUSED',
        findingId: 'unknown',
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'Finding object is required for escalation pipeline (failed closed)',
      };
      emitOutcome(result);
      return result;
    }

    const statement = 'message' in findingObj ? findingObj.message : (findingObj as BECCFindingEscalationInput).statement;
    const category = input.category ?? this.mapFindingCategory(findingObj);

    if (!findingId || findingId.trim() === '') {
      const result: FindingEscalationResult = {
        ok: false,
        category: 'REFUSED',
        findingId: 'unknown',
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'findingId is required for escalation pipeline (failed closed)',
      };
      emitOutcome(result);
      return result;
    }

    if (!input.issuedAt || input.issuedAt.trim() === '') {
      const result: FindingEscalationResult = {
        ok: false,
        category: 'REFUSED',
        findingId,
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'issuedAt timestamp is required for stable escalation command identity (failed closed)',
      };
      emitOutcome(result);
      return result;
    }

    if (!input.authorityContextRef) {
      const result: FindingEscalationResult = {
        ok: false,
        category: 'REFUSED',
        findingId,
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED' as any,
        reason: 'AuthorityContextRef is required for Governed Learning escalation (failed closed)',
      };
      emitOutcome(result);
      return result;
    }

    const replayedSteps: EscalationPipelineStage[] = [];

    // Construct base escalation input DTO
    const baseEscalationInput: BECCFindingEscalationInput = {
      findingId,
      category,
      statement,
      actorRef: input.actorRef,
      authorityContextRef: input.authorityContextRef,
      escalationVersion: input.escalationVersion,
      issuedAt: input.issuedAt,
    };

    // STEP 1: DraftObservation
    const draftStartTime = Date.now();
    let draftRes;
    try {
      draftRes = await this.adapter.draftObservation(baseEscalationInput);
      observeGlCall('draftObservation', draftRes, Math.max(0, Date.now() - draftStartTime));
    } catch (err) {
      observeGlCall('draftObservation', { ok: false, category: 'ERROR', errorDetails: String(err) }, Math.max(0, Date.now() - draftStartTime));
      throw err;
    }

    if (!draftRes.ok || draftRes.category !== 'SUCCESS') {
      const result: FindingEscalationResult = {
        ok: false,
        category: draftRes.category,
        findingId,
        draftCommandId: draftRes.commandId,
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: draftRes.refusalCode,
        reason: draftRes.reason,
        errorDetails: draftRes.errorDetails,
      };
      emitOutcome(result);
      return result;
    }

    if (draftRes.replayed) {
      replayedSteps.push('DRAFT');
    }

    // Extract canonical observation ID strictly from public Governed Learning draft response
    const observationId =
      draftRes.observationId ??
      draftRes.observationRef?.observationId ??
      (draftRes.data as any)?.observationId;

    if (!observationId || typeof observationId !== 'string' || observationId.trim() === '') {
      const result: FindingEscalationResult = {
        ok: false,
        category: 'ERROR',
        findingId,
        draftCommandId: draftRes.commandId,
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        reason: 'Governed Learning DraftObservation succeeded but returned no canonical observationId (failed closed)',
        errorDetails: 'Governed Learning DraftObservation succeeded but did not return a canonical observationId (failed closed)',
      };
      emitOutcome(result);
      return result;
    }

    const observationRef = { observationId: observationId.trim() };

    // STEP 2: Collect & Attach Evidence
    const evidenceList = this.collectEvidenceItems(input, findingObj);
    let attachedEvidenceCount = 0;

    for (let i = 0; i < evidenceList.length; i++) {
      const item = evidenceList[i];
      if (!item.location || item.location.trim() === '') {
        const result: FindingEscalationResult = {
          ok: false,
          category: 'REFUSED',
          findingId,
          observationId,
          observationRef,
          draftCommandId: draftRes.commandId,
          attachedEvidenceCount,
          failedStage: 'ATTACH_EVIDENCE',
          refusalCode: 'REFUSAL_INSUFFICIENT_EVIDENCE' as any,
          reason: `Evidence item at index ${i} has empty or fabricated location (failed closed)`,
        };
        emitOutcome(result);
        return result;
      }

      const attachInput: BECCFindingEscalationInput = {
        ...baseEscalationInput,
        evidenceType: item.evidenceType ?? 'ARTIFACT_DIFF',
        evidenceLocation: item.location,
        escalationVersion: input.escalationVersion ? `${input.escalationVersion}_att_${i}` : `att_${i}`,
      };

      const attachStartTime = Date.now();
      let attachRes;
      try {
        attachRes = await this.adapter.attachEvidence(attachInput, observationId);
        observeGlCall('attachEvidence', attachRes, Math.max(0, Date.now() - attachStartTime));
      } catch (err) {
        observeGlCall('attachEvidence', { ok: false, category: 'ERROR', errorDetails: String(err) }, Math.max(0, Date.now() - attachStartTime));
        throw err;
      }

      if (!attachRes.ok || attachRes.category !== 'SUCCESS') {
        const result: FindingEscalationResult = {
          ok: false,
          category: attachRes.category,
          findingId,
          observationId,
          observationRef,
          draftCommandId: draftRes.commandId,
          attachedEvidenceCount,
          failedStage: 'ATTACH_EVIDENCE',
          refusalCode: attachRes.refusalCode,
          reason: attachRes.reason,
          errorDetails: attachRes.errorDetails,
        };
        emitOutcome(result);
        return result;
      }

      if (attachRes.replayed) {
        replayedSteps.push('ATTACH_EVIDENCE');
      }

      attachedEvidenceCount++;
    }

    // STEP 3: SubmitObservation
    const submitStartTime = Date.now();
    let submitRes;
    try {
      submitRes = await this.adapter.submitObservation(baseEscalationInput, observationId);
      observeGlCall('submitObservation', submitRes, Math.max(0, Date.now() - submitStartTime));
    } catch (err) {
      observeGlCall('submitObservation', { ok: false, category: 'ERROR', errorDetails: String(err) }, Math.max(0, Date.now() - submitStartTime));
      throw err;
    }

    if (!submitRes.ok || submitRes.category !== 'SUCCESS') {
      const result: FindingEscalationResult = {
        ok: false,
        category: submitRes.category,
        findingId,
        observationId,
        observationRef,
        draftCommandId: draftRes.commandId,
        submitCommandId: submitRes.commandId,
        attachedEvidenceCount,
        failedStage: 'SUBMIT',
        refusalCode: submitRes.refusalCode,
        reason: submitRes.reason,
        errorDetails: submitRes.errorDetails,
      };
      emitOutcome(result);
      return result;
    }

    if (submitRes.replayed) {
      replayedSteps.push('SUBMIT');
    }

    const result: FindingEscalationResult = {
      ok: true,
      category: 'SUCCESS',
      findingId,
      observationId,
      observationRef,
      draftCommandId: draftRes.commandId,
      submitCommandId: submitRes.commandId,
      attachedEvidenceCount,
      completedStage: 'SUBMIT',
      replayedSteps: Object.freeze(replayedSteps),
    };

    emitOutcome(result);
    return this.finalizeResultWithAudit(input, result);
  }

  private async finalizeResultWithAudit(
    input: EscalationRequestInput | undefined,
    result: FindingEscalationResult
  ): Promise<FindingEscalationResult> {
    if (!this.auditService || !input || !input.issuedAt || isNaN(Date.parse(input.issuedAt))) {
      return result;
    }

    try {
      const findingObj = input.finding;
      const evidenceList = this.collectEvidenceItems(input, findingObj);
      const validEvidenceItems = evidenceList
        .filter((e): e is BECCFindingEvidenceInput & { evidenceId: string } => typeof e.evidenceId === 'string' && e.evidenceId.trim().length > 0)
        .map((e) => ({ evidenceId: e.evidenceId }));

      await this.auditService.recordFindingEscalationAudit({
        escalationInput: {
          escalationId: `esc_${result.findingId || 'unknown'}_${input.issuedAt}`,
          findingId: result.findingId || 'unknown',
          actorRef: typeof input.actorRef === 'string' ? input.actorRef : (input.actorRef as any)?.actorId,
          evidenceItems: validEvidenceItems
        },
        escalationResult: {
          status: result.ok ? 'SUCCESS' : (result.category === 'REFUSED' ? 'REFUSED' : 'ERROR'),
          observationId: result.observationId,
          details: result.reason || result.errorDetails
        },
        occurredAt: input.issuedAt
      });
    } catch (_err) {
      // Audit recording is BEST_EFFORT, domain result is unaffected
    }

    return result;
  }

  /**
   * Maps a BECC finding category to GL ObservationCategoryEnum.
   */
  private mapFindingCategory(finding: ValidationFinding | BECCFindingEscalationInput): any {
    if ('category' in finding && (finding as any).category) {
      const cat = (finding as any).category;
      if (cat === 'MECHANICAL' || cat === 'INTERPRETIVE' || cat === 'HYBRID') {
        return cat;
      }
      if (cat === 'Constitutional' || cat === 'Terminology' || cat === 'Vocabulary') {
        return 'INTERPRETIVE';
      }
    }
    return 'MECHANICAL';
  }

  /**
   * Collects evidence items from input or finding object without fabrication.
   */
  private collectEvidenceItems(
    input: EscalationRequestInput,
    finding: ValidationFinding | BECCFindingEscalationInput
  ): BECCFindingEvidenceInput[] {
    const list: BECCFindingEvidenceInput[] = [];

    if (input.evidenceItems && input.evidenceItems.length > 0) {
      return [...input.evidenceItems];
    }

    if ('affectedLocation' in finding && finding.affectedLocation?.filePath) {
      list.push({
        evidenceType: 'ARTIFACT_DIFF',
        location: finding.affectedLocation.filePath,
      });
    } else if ('evidenceLocation' in finding && finding.evidenceLocation) {
      list.push({
        evidenceType: (finding as BECCFindingEscalationInput).evidenceType ?? 'ARTIFACT_DIFF',
        location: finding.evidenceLocation,
      });
    } else if ('sourceArtifactRef' in finding && finding.sourceArtifactRef) {
      list.push({
        evidenceType: 'ARTIFACT_DIFF',
        location: finding.sourceArtifactRef,
      });
    }

    return list;
  }
}
