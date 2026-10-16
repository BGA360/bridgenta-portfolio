export type RelationType =
  | 'APPEARS_IN'
  | 'SUPPORTED_BY'
  | 'CONTRADICTED_BY'
  | 'REPEATED_IN'
  | 'GOVERNED_BY'
  | 'CONFORMS_TO'
  | 'DEVIATES_FROM'
  | 'REFERENCES'
  | 'DERIVED_FROM';

export interface CommunicationRelation {
  readonly relationId: string;
  readonly sourceId: string; // ID of source node
  readonly targetId: string; // ID of target node
  readonly relationType: RelationType;
  readonly confidenceClass: 'DETERMINISTIC' | 'HEURISTIC' | 'SEMANTIC' | 'HUMAN';
  readonly origin: string; // e.g. rule ID or algorithm identifier
  readonly provenance?: string;
}
