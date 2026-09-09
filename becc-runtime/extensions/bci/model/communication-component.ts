import { SourceLocation } from '../provenance/provenance-types.js';

export type ComponentType =
  | 'IMAGE'
  | 'DIAGRAM'
  | 'TABLE'
  | 'CODE_BLOCK'
  | 'CALLOUT'
  | 'METRIC'
  | 'ARTIFACT_CARD'
  | 'LIST'
  | 'QUOTE'
  | 'OTHER';

export interface CommunicationComponent {
  readonly componentId: string;
  readonly sectionId: string;
  readonly type: ComponentType;
  readonly contentHash: string;
  readonly sourceLocation?: SourceLocation;
  readonly accessibleLabel?: string; // e.g. alt text or ARIA label if known
  readonly referencedArtifactIds: readonly string[]; // IDs of backing artifacts
}
