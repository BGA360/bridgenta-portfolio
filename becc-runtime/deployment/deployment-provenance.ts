/**
 * BECC v2 — Deployment Provenance & Verification Contracts (GAP-PROD-008)
 *
 * Enforces production-like deployment provenance:
 * - DEPLOY_FROM_CANONICAL_MAIN_ONLY: All production deployments must originate from canonical 'main'.
 * - Exact release commit SHA pinning and immutable artifact traceability.
 * - Zero tolerance for untracked, dirty, or non-main builds in production.
 */

export class DeploymentProvenanceError extends Error {
  public readonly code = 'DEPLOYMENT_PROVENANCE_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'DeploymentProvenanceError';
  }
}

export interface DeploymentProvenanceRecord {
  sourceBranch: string;
  sourceCommitSha: string;
  releaseSha: string;
  artifactVersion: string;
  targetEnvironment: string;
  deploymentTimestamp: string;
  rollbackTargetSha: string;
  migrationState: string;
}

export class DeploymentProvenanceValidator {
  /**
   * Enforces DEPLOY_FROM_CANONICAL_MAIN_ONLY policy.
   * Rejects any branch other than 'main' for production release builds.
   */
  public static assertCanonicalMainOnly(sourceBranch: string, environment = 'production'): void {
    if (environment === 'production' && sourceBranch !== 'main') {
      throw new DeploymentProvenanceError(
        `POLICY VIOLATION: Deployments to environment '${environment}' must originate from canonical branch 'main'. Observed branch: '${sourceBranch}'.`
      );
    }
  }

  /**
   * Validates that release commit SHA is a full 40-character hex string.
   */
  public static assertValidReleaseSha(sha: string): void {
    if (!sha || !/^[0-9a-f]{40}$/i.test(sha.trim())) {
      throw new DeploymentProvenanceError(
        `Invalid release SHA '${sha}'. Must be an exact 40-character hex commit SHA.`
      );
    }
  }

  /**
   * Creates an immutable provenance record for a deployment.
   */
  public static createProvenanceRecord(
    record: Omit<DeploymentProvenanceRecord, 'deploymentTimestamp'>
  ): DeploymentProvenanceRecord {
    this.assertCanonicalMainOnly(record.sourceBranch, record.targetEnvironment);
    this.assertValidReleaseSha(record.sourceCommitSha);
    this.assertValidReleaseSha(record.releaseSha);
    this.assertValidReleaseSha(record.rollbackTargetSha);

    return Object.freeze({
      ...record,
      deploymentTimestamp: new Date().toISOString()
    });
  }
}
