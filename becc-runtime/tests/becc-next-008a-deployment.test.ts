/**
 * BECC v2 — BECC-NEXT-008A Deployment & Rollback Playbook Test Suite (GAP-PROD-008)
 *
 * Verifies:
 * - DEPLOY_FROM_CANONICAL_MAIN_ONLY enforcement
 * - Pre-deployment verification gate
 * - Post-deployment operational health gate
 * - Deterministic rollback execution & target pinning
 * - Simulated rollback drill execution
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  DeploymentProvenanceValidator,
  DeploymentProvenanceError,
  RollbackController
} from '../deployment/index.js';

describe('BECC-NEXT-008A: Pinned Deployment & Rollback (GAP-PROD-008)', () => {
  const shaA = '1111111111111111111111111111111111111111';
  const shaB = '2222222222222222222222222222222222222222';

  describe('Deployment Provenance', () => {
    it('enforces DEPLOY_FROM_CANONICAL_MAIN_ONLY rule for production', () => {
      // Must not throw for 'main'
      DeploymentProvenanceValidator.assertCanonicalMainOnly('main', 'production');

      // Must throw for non-main branch in production
      assert.throws(
        () => DeploymentProvenanceValidator.assertCanonicalMainOnly('feature/experimental', 'production'),
        (err: any) => {
          assert.ok(err instanceof DeploymentProvenanceError);
          assert.ok(err.message.includes('POLICY VIOLATION'));
          return true;
        }
      );
    });

    it('enforces full 40-character commit SHA format', () => {
      DeploymentProvenanceValidator.assertValidReleaseSha(shaA);

      assert.throws(
        () => DeploymentProvenanceValidator.assertValidReleaseSha('short-sha'),
        (err: any) => {
          assert.ok(err instanceof DeploymentProvenanceError);
          return true;
        }
      );
    });
  });

  describe('Pre-Deployment Gate', () => {
    it('passes when all pre-deployment prerequisites are met', () => {
      const res = RollbackController.evaluatePreDeploymentGate({
        worktreeClean: true,
        branch: 'main',
        targetSha: shaB,
        ciPassed: true,
        testsPassed: true,
        requiredSecretsPresent: true,
        rollbackTargetSha: shaA,
        schemaMigrationCompatible: true
      });

      assert.strictEqual(res.passed, true);
      assert.strictEqual(res.blockers.length, 0);
    });

    it('fails closed when dirty worktree, non-main branch, or CI failure is present', () => {
      const res = RollbackController.evaluatePreDeploymentGate({
        worktreeClean: false,
        branch: 'feature/unreviewed',
        targetSha: shaB,
        ciPassed: false,
        testsPassed: true,
        requiredSecretsPresent: true,
        rollbackTargetSha: shaA,
        schemaMigrationCompatible: true
      });

      assert.strictEqual(res.passed, false);
      assert.ok(res.blockers.some((b) => b.includes('Worktree is not clean')));
      assert.ok(res.blockers.some((b) => b.includes('must originate from \'main\'')));
      assert.ok(res.blockers.some((b) => b.includes('CI checks did not pass')));
    });
  });

  describe('Post-Deployment Verification Gate', () => {
    it('verifies healthy post-deployment state', () => {
      const res = RollbackController.evaluatePostDeploymentVerification({
        httpStatus: 200,
        healthState: 'HEALTHY',
        liveness: true,
        readiness: true,
        runningVersion: '2.0.0-GA',
        runningReleaseSha: shaB,
        expectedReleaseSha: shaB,
        storageReachable: true,
        secretsLeaked: false
      });

      assert.strictEqual(res.verified, true);
      assert.strictEqual(res.rollbackRequired, false);
      assert.strictEqual(res.reasons.length, 0);
    });

    it('demands rollback when release SHA mismatches or health probe fails', () => {
      const res = RollbackController.evaluatePostDeploymentVerification({
        httpStatus: 503,
        healthState: 'UNAVAILABLE',
        liveness: true,
        readiness: false,
        runningVersion: '2.0.0-GA',
        runningReleaseSha: shaA, // Old SHA still running
        expectedReleaseSha: shaB,
        storageReachable: false,
        secretsLeaked: false
      });

      assert.strictEqual(res.verified, false);
      assert.strictEqual(res.rollbackRequired, true);
      assert.ok(res.reasons.some((r) => r.includes('HTTP status 503')));
      assert.ok(res.reasons.some((r) => r.includes('Release SHA mismatch')));
    });
  });

  describe('Local Rollback Drill', () => {
    it('executes a simulated rollback drill restoring prior release SHA', () => {
      const drillResult = RollbackController.executeRollbackDrill({
        currentReleaseSha: shaB,
        rollbackTargetSha: shaA,
        triggerReason: 'High error rate on release B',
        databaseCompatible: true,
        simulateFailureOnCurrent: true
      });

      assert.strictEqual(drillResult.drillCompleted, true);
      assert.strictEqual(drillResult.priorReleaseRestored, true);
      assert.strictEqual(drillResult.provenanceMaintained, true);
      assert.strictEqual(drillResult.activeShaAfterRollback, shaA);
      assert.ok(drillResult.log.some((l) => l.includes('Switching active release pointer')));
    });
  });
});
