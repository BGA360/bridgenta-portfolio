import { CommunicationMetadata } from './communication-metadata.js';

export interface CommunicationPage {
  readonly pageId: string;
  readonly canonicalUrl?: string;
  readonly sourceIdentity?: string; // Repository-backed file path, if known
  readonly title: string;
  readonly declaredLanguage?: string;
  readonly detectedLanguage?: string; // Placeholder for heuristic analyzer
  readonly contentHash: string;
  readonly crawlTimestamp?: string; // Crawl or parsing timestamp placeholder
  readonly metadata: CommunicationMetadata;
  readonly sections: readonly string[]; // IDs of mapped CommunicationSections
  readonly links: readonly string[]; // IDs of mapped CommunicationLinks
  readonly components: readonly string[]; // IDs of mapped CommunicationComponents
}
