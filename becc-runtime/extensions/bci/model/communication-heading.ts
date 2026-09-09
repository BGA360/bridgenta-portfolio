import { SourceLocation } from '../provenance/provenance-types.js';

export interface CommunicationHeading {
  readonly headingId: string;
  readonly sectionId: string;
  readonly level: number;
  readonly rawText: string;
  readonly normalizedText: string;
  readonly declaredLanguage?: string;
  readonly detectedLanguage?: string; // Placeholder for future semantic analyzer
  readonly sourceLocation?: SourceLocation;
}
