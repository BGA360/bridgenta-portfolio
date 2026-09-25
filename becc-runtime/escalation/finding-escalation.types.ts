import type {
  ActorIdentityRef,
  AuthorityContextRef,
  EvidenceTypeEnum,
  ObservationCategoryEnum,
  RefusalCodeEnum,
  RuntimeResultCategory,
} from '@cep/governed-learning';
import type { ValidationFinding } from '../shared/types.js';
import type { BECCFindingEscalationInput } from '../governed-learning/governed-learning-adapter.types.js';

export type EscalationPipelineStage = 'DRAFT' | 'ATTACH_EVIDENCE' | 'SUBMIT';

/**
 * BECCFindingEvidenceInput
 * Individual evidence location/type input for escalation.
 */
export interface BECCFindingEvidenceInput {
  readonly evidenceType?: EvidenceTypeEnum;
  readonly location: string;
}

/**
 * EscalationRequestInput
 * Caller request payload to escalate a BECC finding defect to Governed Learning.
 */
export interface EscalationRequestInput {
  readonly finding: ValidationFinding | BECCFindingEscalationInput;
  readonly category?: ObservationCategoryEnum;
  readonly actorRef: ActorIdentityRef;
  readonly authorityContextRef?: AuthorityContextRef;
  readonly evidenceItems?: readonly BECCFindingEvidenceInput[];
  readonly issuedAt: string;
  readonly escalationVersion?: string;
}

/**
 * FindingEscalationResult
 * Outcome DTO resulting from orchestrating a BECC finding escalation pipeline.
 */
export interface FindingEscalationResult {
  readonly ok: boolean;
  readonly category: RuntimeResultCategory;
  readonly findingId: string;
  readonly observationId?: string;
  readonly observationRef?: { readonly observationId: string };
  readonly draftCommandId?: string;
  readonly submitCommandId?: string;
  readonly attachedEvidenceCount: number;
  readonly completedStage?: EscalationPipelineStage;
  readonly failedStage?: EscalationPipelineStage;
  readonly refusalCode?: RefusalCodeEnum;
  readonly reason?: string;
  readonly errorDetails?: string;
  readonly replayedSteps?: readonly EscalationPipelineStage[];
}
