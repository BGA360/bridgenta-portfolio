export interface CommunicationArtifact {
  readonly artifactId: string;
  readonly artifactType: string; // e.g. 'SCREENSHOT' | 'LIGHTHOUSE_REPORT'
  readonly publicOrPrivateClassification: 'PUBLIC' | 'PRIVATE';
  readonly sourceReference?: string; // Stays private; does not leak to public outputs
  readonly contentHash: string;
  readonly mimeType?: string;
  readonly createdAt?: string;
  readonly commitSha?: string;
}
