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

export interface FindingEscalationServiceOptions {
  readonly adapter: GovernedLearningIntegrationAdapter;
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

  constructor(options: FindingEscalationServiceOptions) {
    if (!options || !options.adapter) {
      throw new Error(
        'GovernedLearningIntegrationAdapter instance is required for FindingEscalationService construction. Silent fallback to unconfigured runtime is forbidden.'
      );
    }
    this.adapter = options.adapter;
  }

  /**
   * Escalates a BECC validation finding through DraftObservation -> AttachEvidence -> SubmitObservation.
   */
  public async escalateFinding(input: EscalationRequestInput): Promise<FindingEscalationResult> {
    if (!input || !input.finding) {
      return {
        ok: false,
        category: 'REFUSED',
        findingId: 'unknown',
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'Finding object is required for escalation pipeline (failed closed)',
      };
    }

    const findingObj = input.finding;
    const findingId = 'id' in findingObj ? findingObj.id : (findingObj as BECCFindingEscalationInput).findingId;
    const statement = 'message' in findingObj ? findingObj.message : (findingObj as BECCFindingEscalationInput).statement;
    const category = input.category ?? this.mapFindingCategory(findingObj);

    if (!findingId || findingId.trim() === '') {
      return {
        ok: false,
        category: 'REFUSED',
        findingId: 'unknown',
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'findingId is required for escalation pipeline (failed closed)',
      };
    }

    if (!input.issuedAt || input.issuedAt.trim() === '') {
      return {
        ok: false,
        category: 'REFUSED',
        findingId,
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_INVARIANT_VIOLATION' as any,
        reason: 'issuedAt timestamp is required for stable escalation command identity (failed closed)',
      };
    }

    if (!input.authorityContextRef) {
      return {
        ok: false,
        category: 'REFUSED',
        findingId,
        attachedEvidenceCount: 0,
        failedStage: 'DRAFT',
        refusalCode: 'REFUSAL_AUTHORITY_LEVEL_UNAUTHORIZED' as any,
        reason: 'AuthorityContextRef is required for Governed Learning escalation (failed closed)',
      };
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
    const draftRes = await this.adapter.draftObservation(baseEscalationInput);

    if (!draftRes.ok || draftRes.category !== 'SUCCESS') {
      return {
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
    }

    if (draftRes.replayed) {
      replayedSteps.push('DRAFT');
    }

    // Capture canonical observation ID returned by GL or derived from commandId (obs_${commandId})
    const observationId =
      (draftRes.data as any)?.observationId ??
      (draftRes.data as any)?.observationRef?.observationId ??
      `obs_${draftRes.commandId}`;

    const observationRef = { observationId };

    // STEP 2: Collect & Attach Evidence
    const evidenceList = this.collectEvidenceItems(input, findingObj);
    let attachedEvidenceCount = 0;

    for (let i = 0; i < evidenceList.length; i++) {
      const item = evidenceList[i];
      if (!item.location || item.location.trim() === '') {
        return {
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
      }

      const attachInput: BECCFindingEscalationInput = {
        ...baseEscalationInput,
        evidenceType: item.evidenceType ?? 'ARTIFACT_DIFF',
        evidenceLocation: item.location,
        escalationVersion: input.escalationVersion ? `${input.escalationVersion}_att_${i}` : `att_${i}`,
      };

      const attachRes = await this.adapter.attachEvidence(attachInput, observationId);

      if (!attachRes.ok || attachRes.category !== 'SUCCESS') {
        return {
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
      }

      if (attachRes.replayed) {
        replayedSteps.push('ATTACH_EVIDENCE');
      }

      attachedEvidenceCount++;
    }

    // STEP 3: SubmitObservation
    const submitRes = await this.adapter.submitObservation(baseEscalationInput, observationId);

    if (!submitRes.ok || submitRes.category !== 'SUCCESS') {
      return {
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
    }

    if (submitRes.replayed) {
      replayedSteps.push('SUBMIT');
    }

    return {
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
