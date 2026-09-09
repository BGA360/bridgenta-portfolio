import { SourceLocation } from '../provenance/provenance-types.js';

export type ClaimClass =
  | 'IMPLEMENTATION_DESCRIPTION'
  | 'DESIGN_REQUIREMENT'
  | 'DESIGN_INTENT'
  | 'VERIFIED_IMPLEMENTATION'
  | 'VALIDATED_RESULT'
  | 'EXTERNAL_OUTCOME'
  | 'BUSINESS_OUTCOME'
  | 'ACCESSIBILITY'
  | 'PERFORMANCE'
  | 'LEGAL_COMPLIANCE'
  | 'PRIVACY'
  | 'SECURITY'
  | 'OTHER'
  | 'UNKNOWN';

export interface CommunicationClaim {
  readonly claimId: string;
  readonly sectionId: string;
  readonly rawText: string;
  readonly normalizedText: string;
  readonly claimClass: ClaimClass;
  readonly sourceLocation?: SourceLocation;
  readonly evidenceRequirement?: string; // Stated verification requirements
  readonly evidenceIds: readonly string[]; // IDs of backing CommunicationEvidence
  readonly origin: 'LEXICAL' | 'SEMANTIC' | 'HUMAN';
}
