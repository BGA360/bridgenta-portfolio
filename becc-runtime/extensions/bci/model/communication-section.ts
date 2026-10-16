import { SourceLocation } from '../provenance/provenance-types.js';

export type SemanticFunction =
  | 'SUMMARY'
  | 'CONTEXT'
  | 'PROBLEM'
  | 'CONSTRAINTS'
  | 'ENGINEERING_REASONING'
  | 'ARCHITECTURE'
  | 'DECISIONS'
  | 'IMPLEMENTATION'
  | 'VALIDATION'
  | 'ARTIFACTS'
  | 'RESULTS'
  | 'RISKS'
  | 'LESSONS'
  | 'FUTURE'
  | 'SOURCES'
  | 'CUSTOM'
  | 'UNKNOWN';

export interface CommunicationSection {
  readonly sectionId: string;
  readonly pageId: string;
  readonly parentSectionId?: string;
  readonly semanticFunction: SemanticFunction;
  readonly headingId: string; // References the heading entity
  readonly orderedPosition: number; // Order index within the parent page
  readonly rawTextHash: string;
  readonly sourceLocation?: SourceLocation;
  readonly childSectionIds: readonly string[]; // Subsections
  readonly claimIds: readonly string[]; // Linked claims
  readonly componentIds: readonly string[]; // Linked visual components
}
