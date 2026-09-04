import { ValidationEvidence } from '../../../shared/types.js';

export interface CommunicationEvidence extends ValidationEvidence {
  readonly claimIds: readonly string[]; // Mapped claims backed by this evidence
  readonly sourceUrl?: string;
  readonly generatedFilePath?: string;
  readonly evidenceClass: string; // e.g. 'TEST_SUITE' | 'LIGHTHOUSE_METRIC'
  readonly artifactIds: readonly string[]; // Backing proof files
  readonly observedAt: string;
  readonly evidenceHash: string; // Integrity hash of evidence record
}
