import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { verifyReleaseRecord } from '../tooling/verify_release_record.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
const HASH_C = 'c'.repeat(64);
const HASH_PREV = '9'.repeat(64);
const SHA_FEAT = '1'.repeat(40);
const SHA_MAIN = '2'.repeat(40);
const TREE_MATCH = '3'.repeat(40);
const TREE_DIFF = '4'.repeat(40);

function makeDraftRecord() {
  return {
    schemaVersion: 'bgde-release-record/1.0',
    recordTier: 'PUBLIC_SAFE',
    releaseId: 'BGDE-REL-2026-001',
    riskTier: 'T2_STANDARD',
    releaseScope: 'ORDINARY_ASTRO_WEBSITE',
    lifecycleState: 'DRAFT',
    stateHistory: [
      { state: 'DRAFT', timestampUtc: '2026-11-28T12:00:00Z', actor: 'Frank Duru' },
    ],
    createdAtUtc: '2026-11-28T12:00:00Z',
    updatedAtUtc: null,
    source: {
      repository: 'BGA360/bridgenta-portfolio',
      featureBranch: 'feat/synthetic-release',
      featureHeadSha: SHA_FEAT,
      pullRequestNumber: 901,
      mainSquashSha: null,
      featureTreeSha: null,
      mainTreeSha: null,
      sourceTreeEquivalent: null,
      reStagedAfterMerge: false,
    },
    governance: {
      applicableFrameworks: ['BGCF', 'BECC', 'PRAG', 'M5'],
      requiresFormalBpgaRag: false,
      bpgaCertified: false,
      bpgaRefs: null,
      reviewSignOff: {
        author: 'BGA360',
        approver: null,
        reviewIndependence: 'PENDING',
        approvedCommitSha: null,
        protectMainBypassed: false,
      },
    },
    ciVerification: {
      deployWorkflowRunUrl: null,
      requiredChecks: {
        build: 'PENDING',
        pragValidationGate: 'PENDING',
        postgresCi: 'PENDING',
        failureRecoveryCi: 'PENDING',
      },
      auxiliaryChecks: {
        m5Shadow: 'PENDING',
        m5Retain: 'PENDING',
        githubPagesDeploy: 'SKIPPED',
      },
    },
    staging: null,
    productionArtifact: null,
    ownerAuthorization: null,
    productionDeployment: null,
    postDeploymentVerification: null,
    rollback: {
      previousReleaseId: 'BGDE-005C-PROD-017',
      previousPackageRootSha256: HASH_PREV,
      archiveReferenceId: 'ARCHIVE-BGDE-005C-PROD-017',
      preDeploySnapshotVerified: false,
    },
    rollbackExecution: null,
    residualRisksAndLimitations: [],
    finalDisposition: null,
  };
}

function makeAuthorizedRecord() {
  const rec = makeDraftRecord();
  rec.lifecycleState = 'AUTHORIZED';
  rec.stateHistory.push(
    { state: 'VALIDATED', timestampUtc: '2026-11-28T12:10:00Z', actor: 'GitHub Actions' },
    { state: 'STAGING_ACCEPTED', timestampUtc: '2026-11-28T12:20:00Z', actor: 'Frank Duru' },
    { state: 'AUTHORIZED', timestampUtc: '2026-11-28T12:30:00Z', actor: 'Frank Duru' }
  );
  rec.source.mainSquashSha = SHA_MAIN;
  rec.source.featureTreeSha = TREE_MATCH;
  rec.source.mainTreeSha = TREE_MATCH;
  rec.source.sourceTreeEquivalent = true;
  rec.governance.reviewSignOff = {
    author: 'BGA360',
    approver: 'Bridmation',
    reviewIndependence: 'NON_INDEPENDENT_OWNER_SIGNOFF',
    approvedCommitSha: SHA_FEAT,
    protectMainBypassed: false,
  };
  rec.ciVerification = {
    deployWorkflowRunUrl: 'https://github.com/BGA360/bridgenta-portfolio/actions/runs/999999999',
    requiredChecks: {
      build: 'PASS',
      pragValidationGate: 'PASS',
      postgresCi: 'PASS',
      failureRecoveryCi: 'PASS',
    },
    auxiliaryChecks: {
      m5Shadow: 'PASS',
      m5Retain: 'PASS',
      githubPagesDeploy: 'SKIPPED',
    },
  };
  rec.staging = {
    targetUrl: 'https://bridgenta.com',
    stratoDirectory: '/bga/staging',
    basicAuthPreserved: true,
    stagingManifestSha256: HASH_A,
    stagingPackageRootSha256: HASH_B,
    postUploadSnapshotVerified: true,
    acceptedBy: 'Frank Duru',
    acceptedAtUtc: '2026-11-28T12:20:00Z',
  };
  rec.productionArtifact = {
    targetUrl: 'https://bridgenta.de',
    stratoDirectory: '/bga/production_de',
    packagerScript: 'tooling/package_strato_production.mjs',
    swRetirementProfile: 'transition-retirement-enabled',
    fileCount: 115,
    totalBytes: 7612893,
    integrityProofType: 'SHA256_HASH_MANIFEST',
    manifestSha256: HASH_A,
    packageRootSha256: HASH_C,
    verifyOnlyPassed: true,
    cryptographicSignature: null,
  };
  rec.ownerAuthorization = {
    decision: 'AUTHORIZED',
    authorizedBy: 'Frank Duru',
    authorizedAtUtc: '2026-11-28T12:30:00Z',
    approvedPackageRootSha256: HASH_C,
    dnsSslEmailChangesAuthorized: false,
    satisfiesFormalBpgaRag: false,
    conditions: [],
  };
  rec.rollback.preDeploySnapshotVerified = true;
  return rec;
}

function makeAcceptedRecord({ withLimitations = false } = {}) {
  const rec = makeAuthorizedRecord();
  const terminal = withLimitations ? 'RELEASE_ACCEPTED_WITH_LIMITATIONS' : 'RELEASE_ACCEPTED';
  rec.lifecycleState = terminal;
  rec.stateHistory.push(
    { state: 'DEPLOYED_PENDING_VERIFICATION', timestampUtc: '2026-11-28T12:40:00Z', actor: 'Frank Duru' },
    { state: terminal, timestampUtc: '2026-11-28T12:50:00Z', actor: 'Frank Duru' }
  );
  rec.productionDeployment = {
    transferMethod: 'OWNER_MANUAL_SFTP_CHROOTED',
    deployedAtUtc: '2026-11-28T12:40:00Z',
    postUploadSnapshotVerified: true,
    matchedFiles: 115,
    missingOrUnexpectedFiles: 0,
  };
  rec.postDeploymentVerification = {
    verificationScope: 'STANDARD_T2',
    canonicalRedirectsVerified: true,
    privacyZeroStorageVerified: true,
    legalPagesVerified: true,
    consoleErrors: 0,
    verifiedAtUtc: '2026-11-28T12:50:00Z',
  };
  if (withLimitations) {
    rec.ownerAuthorization.decision = 'AUTHORIZED_WITH_OBSERVATIONS';
    rec.residualRisksAndLimitations = [
      'Safari/WebKit offline SW retirement residual risk accepted by owner.',
    ];
  }
  rec.finalDisposition = terminal;
  return rec;
}

test('BGDE-OPS-001C Canonical Release Record Validator Suite', async (t) => {
  await t.test('0. Public template file validates cleanly as DRAFT', () => {
    const tplPath = path.join(
      workspaceRoot,
      'stewardship',
      'releases',
      'templates',
      'release-record.public.template.json'
    );
    const tpl = JSON.parse(fs.readFileSync(tplPath, 'utf8'));
    const res = verifyReleaseRecord(tpl);
    assert.strictEqual(res.structuralValidity, 'PASS', JSON.stringify(res.errors));
    assert.strictEqual(res.externalEvidence.ciEvidenceCheck, 'UNVERIFIED');
  });

  await t.test('1. Valid draft release record passes structural validation', () => {
    const res = verifyReleaseRecord(makeDraftRecord());
    assert.strictEqual(res.structuralValidity, 'PASS', JSON.stringify(res.errors));
    assert.strictEqual(res.errors.length, 0);
  });

  await t.test('2. Valid authorized release record passes structural validation', () => {
    const res = verifyReleaseRecord(makeAuthorizedRecord());
    assert.strictEqual(res.structuralValidity, 'PASS', JSON.stringify(res.errors));
  });

  await t.test('3. Valid accepted release record passes structural validation', () => {
    const res = verifyReleaseRecord(makeAcceptedRecord());
    assert.strictEqual(res.structuralValidity, 'PASS', JSON.stringify(res.errors));
  });

  await t.test('4. Missing owner authorization fails AUTHORIZED state', () => {
    const rec = makeAuthorizedRecord();
    rec.ownerAuthorization = null;
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'FAIL');
    assert.ok(res.errors.some((e) => e.code === 'ERR_MISSING_OWNER_AUTH'));
  });

  await t.test('5. Incorrect or mismatched SHA-256 digest fails (both in-record and vs local manifest)', () => {
    const rec = makeAuthorizedRecord();
    rec.ownerAuthorization.approvedPackageRootSha256 = 'f'.repeat(64);
    const res1 = verifyReleaseRecord(rec);
    assert.strictEqual(res1.structuralValidity, 'FAIL');
    assert.ok(res1.errors.some((e) => e.code === 'ERR_DIGEST_MISMATCH'));

    // Also test against a local synthetic manifest file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bgde-rel-manifest-'));
    try {
      const manifestObj = { packageSummary: { packageRootSha256: HASH_C } };
      const manifestStr = JSON.stringify(manifestObj, null, 2);
      const manifestFile = path.join(tmpDir, 'production-artifact-manifest.json');
      fs.writeFileSync(manifestFile, manifestStr, 'utf8');
      const actualManifestSha = crypto.createHash('sha256').update(Buffer.from(manifestStr, 'utf8')).digest('hex');

      const recGood = makeAuthorizedRecord();
      recGood.productionArtifact.manifestSha256 = actualManifestSha;
      const resPass = verifyReleaseRecord(recGood, { manifestPath: manifestFile });
      assert.strictEqual(resPass.structuralValidity, 'PASS', JSON.stringify(resPass.errors));
      assert.strictEqual(resPass.externalEvidence.manifestCheck, 'VERIFIED');

      const recBad = makeAuthorizedRecord();
      recBad.productionArtifact.manifestSha256 = 'e'.repeat(64);
      const resMismatch = verifyReleaseRecord(recBad, { manifestPath: manifestFile });
      assert.strictEqual(resMismatch.structuralValidity, 'FAIL');
      assert.strictEqual(resMismatch.externalEvidence.manifestCheck, 'MISMATCH');
      assert.ok(resMismatch.errors.some((e) => e.code === 'ERR_DIGEST_MISMATCH'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  await t.test('6. Invalid source-tree equivalence claim fails', () => {
    const rec = makeAuthorizedRecord();
    rec.source.mainTreeSha = TREE_DIFF;
    rec.source.sourceTreeEquivalent = true;
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'FAIL');
    assert.ok(res.errors.some((e) => e.code === 'ERR_TREE_EQUIVALENCE'));
  });

  await t.test('7. Invalid lifecycle transition fails', () => {
    const rec = makeAuthorizedRecord();
    rec.stateHistory = [
      { state: 'DRAFT', timestampUtc: '2026-11-28T12:00:00Z', actor: 'Frank Duru' },
      { state: 'AUTHORIZED', timestampUtc: '2026-11-28T12:30:00Z', actor: 'Frank Duru' },
    ];
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'FAIL');
    assert.ok(res.errors.some((e) => e.code === 'ERR_INVALID_TRANSITION'));
  });

  await t.test('8. Claimed deployment without deployment evidence fails', () => {
    const rec = makeAuthorizedRecord();
    rec.lifecycleState = 'DEPLOYED_PENDING_VERIFICATION';
    rec.stateHistory.push({
      state: 'DEPLOYED_PENDING_VERIFICATION',
      timestampUtc: '2026-11-28T12:40:00Z',
      actor: 'Frank Duru',
    });
    rec.productionDeployment = null;
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'FAIL');
    assert.ok(res.errors.some((e) => e.code === 'ERR_DEPLOYMENT_EVIDENCE'));
  });

  await t.test('9. Claimed acceptance without verification evidence fails', () => {
    const rec = makeAcceptedRecord();
    rec.postDeploymentVerification = null;
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'FAIL');
    assert.ok(res.errors.some((e) => e.code === 'ERR_VERIFICATION_EVIDENCE'));
  });

  await t.test('10. EPPS release missing required BPGA ERR/RAG references fails (and procedural owner auth cannot satisfy RAG)', () => {
    const rec = makeAuthorizedRecord();
    rec.releaseScope = 'EPPS_INCLUDED_WEBSITE';
    rec.governance.requiresFormalBpgaRag = true;
    rec.governance.bpgaRefs = null;
    const resMissing = verifyReleaseRecord(rec);
    assert.strictEqual(resMissing.structuralValidity, 'FAIL');
    assert.ok(resMissing.errors.some((e) => e.code === 'ERR_MISSING_BPGA_REFS'));

    // Also verify procedural owner authorization claiming satisfiesFormalBpgaRag=true is rejected
    const recMisclass = makeAuthorizedRecord();
    recMisclass.ownerAuthorization.satisfiesFormalBpgaRag = true;
    const resMisclass = verifyReleaseRecord(recMisclass);
    assert.strictEqual(resMisclass.structuralValidity, 'FAIL');
    assert.ok(resMisclass.errors.some((e) => e.code === 'ERR_BPGA_MISCLASSIFICATION'));
  });

  await t.test('11. Unsupported cryptographic signature claim fails', () => {
    const rec = makeAuthorizedRecord();
    rec.productionArtifact.cryptographicSignature = 'synthetic-fake-gpg-sig';
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'FAIL');
    assert.ok(res.errors.some((e) => e.code === 'ERR_UNSUPPORTED_SIGNATURE'));
  });

  await t.test('12. Public record containing token, local path, or prohibited private metadata fails', () => {
    const recToken = makeDraftRecord();
    recToken.stateHistory[0].note = 'Leaked synthetic token ghp_1234567890abcdefghij123456';
    const resToken = verifyReleaseRecord(recToken);
    assert.strictEqual(resToken.structuralValidity, 'FAIL');
    assert.ok(resToken.errors.some((e) => e.code === 'ERR_PUBLIC_DISCLOSURE'));

    const recPath = makeDraftRecord();
    recPath.stateHistory[0].note = 'Backed up to C:\\Users\\owner\\backups\\release';
    const resPath = verifyReleaseRecord(recPath);
    assert.strictEqual(resPath.structuralValidity, 'FAIL');
    assert.ok(resPath.errors.some((e) => e.code === 'ERR_PUBLIC_DISCLOSURE'));

    const recSftp = makeDraftRecord();
    recSftp.stateHistory[0].note = 'Uploaded via sftp://ssh.strato.de/bga/production_de';
    const resSftp = verifyReleaseRecord(recSftp);
    assert.strictEqual(resSftp.structuralValidity, 'FAIL');
    assert.ok(resSftp.errors.some((e) => e.code === 'ERR_PUBLIC_DISCLOSURE'));
  });

  await t.test('13. Missing external evidence is classified as UNVERIFIED, never PASS', () => {
    const rec = makeAcceptedRecord();
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'PASS', JSON.stringify(res.errors));
    assert.strictEqual(res.externalEvidence.manifestCheck, 'UNVERIFIED');
    assert.strictEqual(res.externalEvidence.gitTreeCheck, 'UNVERIFIED');
    assert.strictEqual(res.externalEvidence.ciEvidenceCheck, 'UNVERIFIED');
  });

  await t.test('14. Valid owner-authorized release with documented residual limitations passes', () => {
    const rec = makeAcceptedRecord({ withLimitations: true });
    const res = verifyReleaseRecord(rec);
    assert.strictEqual(res.structuralValidity, 'PASS', JSON.stringify(res.errors));
    assert.strictEqual(rec.finalDisposition, 'RELEASE_ACCEPTED_WITH_LIMITATIONS');
  });

  await t.test('15. Rollback governance requires explicit sourceCodeDisposition and forbids automatic Git revert', () => {
    const rec = makeAcceptedRecord();
    rec.lifecycleState = 'ROLLED_BACK';
    rec.stateHistory.push({
      state: 'ROLLED_BACK',
      timestampUtc: '2026-11-28T13:05:00Z',
      actor: 'Frank Duru',
    });
    rec.finalDisposition = 'ROLLED_BACK';
    rec.rollbackExecution = {
      rollbackMode: 'FULL_RELEASE',
      ownerAuthorized: true,
      authorizedBy: 'Frank Duru',
      executedAtUtc: '2026-11-28T13:05:00Z',
      postRollbackVerified: true,
      restoredPackageRootSha256: HASH_PREV,
      sourceCodeDisposition: 'NO_CODE_CHANGE_DEPLOYMENT_FAILURE',
      autoGitRevertTriggered: false,
      followUpPrUrl: null,
    };
    const resOk = verifyReleaseRecord(rec);
    assert.strictEqual(resOk.structuralValidity, 'PASS', JSON.stringify(resOk.errors));

    rec.rollbackExecution.autoGitRevertTriggered = true;
    const resAuto = verifyReleaseRecord(rec);
    assert.strictEqual(resAuto.structuralValidity, 'FAIL');
    assert.ok(resAuto.errors.some((e) => e.code === 'ERR_ROLLBACK_GOVERNANCE'));
  });
});
