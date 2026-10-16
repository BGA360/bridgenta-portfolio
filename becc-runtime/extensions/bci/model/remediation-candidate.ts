import { CandidateCommunication } from '../../../shared/types.js';
import { SourceLocation, RuleIdentity } from '../provenance/provenance-types.js';

export interface RemediationCandidate extends CandidateCommunication {
  readonly candidateId: string;
  readonly findingIds: readonly string[];
  readonly targetLocation: SourceLocation;
  readonly currentContentHash: string;
  readonly currentContent?: string;
  readonly proposedContent: string;
  readonly transformationType: 'DETERMINISTIC' | 'SEMANTIC' | 'HUMAN_STYLE' | 'NONE';
  readonly ruleIdentity: RuleIdentity;
  readonly riskClass: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly reviewRequired: boolean;
}
