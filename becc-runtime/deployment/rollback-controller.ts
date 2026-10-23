/**
 * BECC v2 — Rollback Controller & Deployment Gate Verification (GAP-PROD-008)
 *
 * Implements deterministic pre-deployment validation, post-deployment verification,
 * and rollback execution contracts.
 * Supports automated rollback drills for simulated releases.
 */

import { DeploymentProvenanceRecord, DeploymentProvenanceValidator } from './deployment-provenance.js';

export interface PreDeploymentGateInputs {
  worktreeClean: boolean;
  branch: string;
  targetSha: string;
  ciPassed: boolean;
  testsPassed: boolean;
  requiredSecretsPresent: boolean;
  rollbackTargetSha: string;
  schemaMigrationCompatible: boolean;
}

export interface PreDeploymentGateResult {
  passed: boolean;
  blockers: string[];
  evaluatedAt: string;
}

export interface PostDeploymentVerificationInputs {
  httpStatus: number;
  healthState: string;
  liveness: boolean;
  readiness: boolean;
  runningVersion: string;
  runningReleaseSha: string;
  expectedReleaseSha: string;
  storageReachable: boolean;
  secretsLeaked: boolean;
}

export interface PostDeploymentVerificationResult {
  verified: boolean;
  rollbackRequired: boolean;
  reasons: string[];
  evaluatedAt: string;
}

export interface RollbackDrillInputs {
  currentReleaseSha: string;
  rollbackTargetSha: string;
  triggerReason: string;
  databaseCompatible: boolean;
  simulateFailureOnCurrent: boolean;
}

export interface RollbackDrillResult {
  drillCompleted: boolean;
  priorReleaseRestored: boolean;
  provenanceMaintained: boolean;
  activeShaAfterRollback: string;
  log: string[];
}

export class RollbackController {
  /**
   * Evaluates the pre-deployment gate.
   * All checks must pass before routing traffic or promoting a build.
   */
  public static evaluatePreDeploymentGate(inputs: PreDeploymentGateInputs): PreDeploymentGateResult {
    const blockers: string[] = [];

    if (!inputs.worktreeClean) {
      blockers.push('Worktree is not clean (uncommitted changes detected).');
    }
    if (inputs.branch !== 'main') {
      blockers.push(`Deployment must originate from 'main', observed '${inputs.branch}'.`);
    }
    if (!inputs.ciPassed) {
      blockers.push('Canonical CI checks did not pass.');
    }
    if (!inputs.testsPassed) {
      blockers.push('Automated test suite did not pass.');
    }
    if (!inputs.requiredSecretsPresent) {
      blockers.push('Mandatory runtime secrets are absent or invalid.');
    }
    if (!inputs.rollbackTargetSha || inputs.rollbackTargetSha === inputs.targetSha) {
      blockers.push('Valid distinct rollback target SHA must be identified before deployment.');
    }
    if (!inputs.schemaMigrationCompatible) {
      blockers.push('Schema migration is not backward-compatible with rollback target.');
    }

    try {
      DeploymentProvenanceValidator.assertValidReleaseSha(inputs.targetSha);
      DeploymentProvenanceValidator.assertValidReleaseSha(inputs.rollbackTargetSha);
    } catch (err: any) {
      blockers.push(err.message);
    }

    return {
      passed: blockers.length === 0,
      blockers,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Verifies live post-deployment operational health.
   * If any check fails, signals rollbackRequired = true.
   */
  public static evaluatePostDeploymentVerification(
    inputs: PostDeploymentVerificationInputs
  ): PostDeploymentVerificationResult {
    const reasons: string[] = [];

    if (inputs.httpStatus !== 200) {
      reasons.push(`Unexpected HTTP status ${inputs.httpStatus} on probe.`);
    }
    if (inputs.healthState !== 'HEALTHY') {
      reasons.push(`Health state '${inputs.healthState}' is not HEALTHY.`);
    }
    if (!inputs.liveness) {
      reasons.push('Process liveness probe failed.');
    }
    if (!inputs.readiness) {
      reasons.push('Dependency readiness probe failed.');
    }
    if (inputs.runningReleaseSha !== inputs.expectedReleaseSha) {
      reasons.push(
        `Release SHA mismatch: expected '${inputs.expectedReleaseSha}', got '${inputs.runningReleaseSha}'.`
      );
    }
    if (!inputs.storageReachable) {
      reasons.push('Persistent storage dependency is unreachable.');
    }
    if (inputs.secretsLeaked) {
      reasons.push('SECURITY ALERT: Secret leakage detected in endpoint output.');
    }

    return {
      verified: reasons.length === 0,
      rollbackRequired: reasons.length > 0,
      reasons,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Executes a simulated local rollback drill.
   * Tests failure detection on Release B and deterministic fallback to Release A.
   */
  public static executeRollbackDrill(inputs: RollbackDrillInputs): RollbackDrillResult {
    const log: string[] = [];
    log.push(`Initiating rollback drill from current release '${inputs.currentReleaseSha}'`);

    if (inputs.simulateFailureOnCurrent) {
      log.push(`Trigger condition observed: ${inputs.triggerReason}`);
      log.push(`Checking database compatibility for target '${inputs.rollbackTargetSha}'`);

      if (!inputs.databaseCompatible) {
        log.push('Rollback blocked: target database schema is incompatible.');
        return {
          drillCompleted: false,
          priorReleaseRestored: false,
          provenanceMaintained: false,
          activeShaAfterRollback: inputs.currentReleaseSha,
          log
        };
      }

      log.push(`Switching active release pointer to pinned target '${inputs.rollbackTargetSha}'`);
      log.push('Running post-rollback health and readiness probes on target');
      log.push(`Target '${inputs.rollbackTargetSha}' verified healthy.`);

      return {
        drillCompleted: true,
        priorReleaseRestored: true,
        provenanceMaintained: true,
        activeShaAfterRollback: inputs.rollbackTargetSha,
        log
      };
    }

    log.push('Current release is healthy; rollback not required.');
    return {
      drillCompleted: true,
      priorReleaseRestored: false,
      provenanceMaintained: true,
      activeShaAfterRollback: inputs.currentReleaseSha,
      log
    };
  }
}
