import type {
  ActorIdentityRef,
  AuthorityContextRef,
  RefusalCodeEnum,
  RuntimeResultCategory,
  ScopeContract,
} from '@cep/governed-learning';
import type { AssessmentContext } from '../shared/types.js';

/**
 * ResolvedGovernedGuidanceQueryInput
 * Bounded input DTO for resolving governed guidance from BECC context.
 */
export interface ResolvedGovernedGuidanceQueryInput {
  readonly queryId: string;
  readonly assessmentContext?: AssessmentContext;
  readonly projectRef?: { readonly projectId: string };
  readonly workstreamRef?: { readonly workstreamId: string };
  readonly matchStrategy?: 'STRICT' | 'INHERITED' | 'CROSS_FRAMEWORK';
  readonly actorRef: ActorIdentityRef;
  readonly authorityContextRef?: AuthorityContextRef;
  readonly issuedAt: string;
  readonly queryVersion?: string;
}

/**
 * BECCGovernedGuidanceItem
 * Normalized BECC-facing projection of a Governed Learning guidance item.
 * Preserves lessonRef, version, statement, rationale, and scope without modifying authority or eligibility.
 */
export interface BECCGovernedGuidanceItem {
  readonly lessonRef: {
    readonly lessonId: string;
    readonly version: string;
  };
  readonly statement: string;
  readonly rationale?: string;
  readonly scope: ScopeContract;
}

/**
 * ResolvedGovernedGuidanceResult
 * Bounded outcome from resolving governed guidance for a BECC context.
 * Distinguishes valid empty guidance store (SUCCESS with guidanceItems: []) from query failure (ERROR/REFUSED).
 */
export interface ResolvedGovernedGuidanceResult {
  readonly ok: boolean;
  readonly category: RuntimeResultCategory;
  readonly source: 'GOVERNED_LEARNING';
  readonly commandId: string;
  readonly queryId: string;
  readonly guidanceItems: ReadonlyArray<BECCGovernedGuidanceItem>;
  readonly evaluatedAt?: string;
  readonly replayed: boolean;
  readonly refusalCode?: RefusalCodeEnum;
  readonly reason?: string;
  readonly errorDetails?: string;
}
