import type {
  ActorIdentityRef,
  AuthorityContextRef,
  ObservationCategoryEnum,
  EvidenceTypeEnum,
  RefusalCodeEnum,
  RuntimeResultCategory,
  TargetRef,
  ApplicableGuidanceSet,
} from '@cep/governed-learning';

/**
 * BECCFindingEscalationInput
 * Bounded input DTO representing a BECC validation finding or document compliance defect
 * to be escalated to Governed Learning's observation pipeline.
 */
export interface BECCFindingEscalationInput {
  readonly findingId: string;
  readonly category: ObservationCategoryEnum;
  readonly statement: string;
  readonly sourceArtifactRef?: string;
  readonly actorRef: ActorIdentityRef;
  readonly authorityContextRef?: AuthorityContextRef;
  readonly evidenceType?: EvidenceTypeEnum;
  readonly evidenceLocation?: string;
  readonly escalationVersion?: string;
  readonly issuedAt: string;
}

/**
 * BECCEscalationResult
 * Bounded outcome resulting from dispatching a BECC finding to Governed Learning.
 * Preserves Governed Learning runtime categories (SUCCESS, REFUSED, ERROR).
 */
export interface BECCEscalationResult<T = unknown> {
  readonly ok: boolean;
  readonly category: RuntimeResultCategory;
  readonly commandId: string;
  readonly data?: T;
  readonly refusalCode?: RefusalCodeEnum;
  readonly reason?: string;
  readonly errorDetails?: string;
  readonly replayed?: boolean;
}

/**
 * BECCGuidanceQueryInput
 * Bounded input DTO representing a request from BECC to query Governed Learning guidance.
 */
export interface BECCGuidanceQueryInput {
  readonly queryId: string;
  readonly targetRef?: TargetRef;
  readonly matchStrategy?: 'STRICT' | 'INHERITED' | 'CROSS_FRAMEWORK';
  readonly actorRef: ActorIdentityRef;
  readonly authorityContextRef?: AuthorityContextRef;
  readonly issuedAt: string;
  readonly queryVersion?: string;
}

/**
 * BECCGuidanceQueryResult
 * Bounded outcome resulting from querying Governed Learning guidance.
 * Preserves Governed Learning runtime categories (SUCCESS, REFUSED, ERROR),
 * replayed signal, evaluatedAt, and raw ApplicableGuidanceSet.
 */
export interface BECCGuidanceQueryResult {
  readonly ok: boolean;
  readonly category: RuntimeResultCategory;
  readonly commandId: string;
  readonly guidanceSet?: ApplicableGuidanceSet;
  readonly refusalCode?: RefusalCodeEnum;
  readonly reason?: string;
  readonly errorDetails?: string;
  readonly replayed?: boolean;
}

/**
 * GovernedLearningIntegrationAdapter Interface
 * Narrow BECC-owned interface wrapping public GovernedLearningRuntime service invocations.
 */
export interface GovernedLearningIntegrationAdapter {
  draftObservation(input: BECCFindingEscalationInput): Promise<BECCEscalationResult>;
  attachEvidence(input: BECCFindingEscalationInput, observationId: string): Promise<BECCEscalationResult>;
  submitObservation(input: BECCFindingEscalationInput, observationId: string): Promise<BECCEscalationResult>;
  queryGuidance(input: BECCGuidanceQueryInput): Promise<BECCGuidanceQueryResult>;
}

