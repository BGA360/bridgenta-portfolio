export interface IArtifactResolverPort {
  /**
   * Verifies that the artifact content matches the expected hash.
   * Returns 'ARTIFACTS_VALID', 'ARTIFACTS_INVALID', or 'NOT_VERIFIED' if unavailable.
   */
  verifyArtifactHash(artifactId: string, expectedHash: string): Promise<'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID' | 'NOT_VERIFIED'>;
}
