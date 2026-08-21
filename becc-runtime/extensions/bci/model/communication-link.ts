import { SourceLocation } from '../provenance/provenance-types.js';

export type LinkClass = 'INTERNAL' | 'EXTERNAL' | 'ANCHOR' | 'ASSET' | 'UNKNOWN';

export interface CommunicationLink {
  readonly linkId: string;
  readonly pageId: string;
  readonly sectionId?: string;
  readonly rawHref: string;
  readonly resolvedUrl?: string; // Resolved target URL placeholder
  readonly linkClass: LinkClass;
  readonly sourceLocation?: SourceLocation;
}
