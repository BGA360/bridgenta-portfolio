import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  runRetention,
  verifyAppendOnlyHistoryDiff
} from "../tooling/prag_provenance_m5_retain.js";
import {
  resolveHistoryRecords,
  evaluateEnforcementReadiness,
  finalizeAssessmentForHistoryMode
} from "../tooling/prag_provenance_m5_readiness.js";
import { computeM5ImplementationIdentity } from "../tooling/prag_provenance_identity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function makeObservation(commitSha, extra = {}) {
  const base = {
    articleResults: [],
    eligibleCount: 0,
    evaluatorVersion: "M5-EVALUATOR-1.0",
    implementationIdentity: "3e5f71af9a514c70e44cbf791864b98ad4f691217253d14c2e3b6961ed314ed3",
    implementationIdentityScheme: "M5-SOURCE-HASH-1",
    observationMode: "SHADOW",
    policyVersion: "M5-POLICY-1.0",
    repositoryCommit: commitSha,
    schemaVersion: "M5-OBSERVATION-1.0",
    shadowGateResult: "SHADOW_PASS",
    subjectCount: 0,
    undecidedCount: 0,
    withheldCount: 0,
    ...extra
  };
  const payloadToHash = {};
  for (const k of Object.keys(base).sort()) {
    payloadToHash[k] = base[k];
  }
  const hash = crypto.createHash("sha256").update(JSON.stringify(payloadToHash)).digest("hex");
  return {
    execution: {
      branch: "main",
      job: "m5-shadow",
      runId: "1001",
      runner: "ubuntu-latest",
      timestamp: "2026-11-12T00:00:00.000Z",
      workflow: "Deploy to GitHub Pages"
    },
    observation: { ...payloadToHash, observationHash: hash },
    observationHash: hash
  };
}

function runGit(cwd, args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

describe("M5 History Retention Migration", () => {
  test("five certified source-hash files remain unchanged", () => {
    const res = computeM5ImplementationIdentity(repoRoot);
    assert.equal(res.state, "RESOLVED");
    assert.equal(
      res.identity,
      "3e5f71af9a514c70e44cbf791864b98ad4f691217253d14c2e3b6961ed314ed3"
    );
  });

  test("runRetention supports historyRoot, ci-rerun idempotency, and rejects observation conflicts", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "m5-retain-test-"));
    try {
      const workspace = path.join(tmp, "workspace");
      const historyRoot = path.join(tmp, "history-checkout");
      fs.mkdirSync(path.join(workspace, "stewardship", "reports"), { recursive: true });
      fs.mkdirSync(historyRoot, { recursive: true });

      const commitSha = "a".repeat(40);
      const env1 = makeObservation(commitSha);
      const reportPath = path.join(workspace, "stewardship", "reports", "m5-ci-shadow-observation.json");
      fs.writeFileSync(reportPath, JSON.stringify(env1), "utf-8");

      const first = runRetention(workspace, reportPath, { historyRoot });
      assert.equal(first.status, "PERSISTED");

      const destPath = path.join(
        historyRoot,
        "stewardship",
        "reports",
        "history",
        "m5-shadow",
        commitSha,
        `${env1.observationHash}.json`
      );
      assert.ok(fs.existsSync(destPath));
      const originalBytes = fs.readFileSync(destPath, "utf-8");

      const env2 = {
        ...env1,
        execution: { ...env1.execution, runId: "2002", timestamp: "2026-11-12T01:00:00.000Z" }
      };
      fs.writeFileSync(reportPath, JSON.stringify(env2), "utf-8");

      assert.throws(() => runRetention(workspace, reportPath, { historyRoot }), /HISTORICAL_EVIDENCE_CORRUPTION/);
      assert.equal(fs.readFileSync(destPath, "utf-8"), originalBytes);

      const rerun = runRetention(workspace, reportPath, {
        historyRoot,
        allowExecutionMetadataDiff: true
      });
      assert.equal(rerun.status, "IDEMPOTENT_NOOP");
      assert.equal(fs.readFileSync(destPath, "utf-8"), originalBytes);

      fs.writeFileSync(reportPath, JSON.stringify(env1), "utf-8");
      const tamperedValid = makeObservation(commitSha, { shadowGateResult: "SHADOW_ATTENTION" });
      fs.writeFileSync(destPath, JSON.stringify(tamperedValid), "utf-8");
      assert.throws(
        () => runRetention(workspace, reportPath, { historyRoot, allowExecutionMetadataDiff: true }),
        /HISTORICAL_EVIDENCE_CORRUPTION/
      );
      assert.equal(JSON.parse(fs.readFileSync(destPath, "utf-8")).observationHash, tamperedValid.observationHash);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("verifyAppendOnlyHistoryDiff allows only new records and rejects modifications, deletions, or relocations", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "m5-append-only-"));
    try {
      const bareRemote = path.join(tmp, "remote.git");
      const clone = path.join(tmp, "clone");
      fs.mkdirSync(bareRemote, { recursive: true });
      runGit(bareRemote, ["init", "--bare"]);

      runGit(tmp, ["clone", bareRemote, clone]);
      runGit(clone, ["config", "user.name", "Bridmation"]);
      runGit(clone, ["config", "user.email", "355237203+Bridmation@users.noreply.github.com"]);
      runGit(clone, ["checkout", "-b", "m5-history"]);

      const commit1 = "1".repeat(40);
      const env1 = makeObservation(commit1);
      const file1Rel = `stewardship/reports/history/m5-shadow/${commit1}/${env1.observationHash}.json`;
      const file1Abs = path.join(clone, file1Rel);
      fs.mkdirSync(path.dirname(file1Abs), { recursive: true });
      fs.writeFileSync(file1Abs, JSON.stringify(env1, null, 2) + "\n", "utf-8");

      runGit(clone, ["add", "."]);
      runGit(clone, ["commit", "-m", "initial m5-history"]);
      runGit(clone, ["push", "-u", "origin", "m5-history"]);

      // Valid append-only addition passes
      const commit2 = "2".repeat(40);
      const env2 = makeObservation(commit2);
      const file2Abs = path.join(clone, `stewardship/reports/history/m5-shadow/${commit2}/${env2.observationHash}.json`);
      fs.mkdirSync(path.dirname(file2Abs), { recursive: true });
      fs.writeFileSync(file2Abs, JSON.stringify(env2, null, 2) + "\n", "utf-8");
      runGit(clone, ["add", "."]);
      runGit(clone, ["commit", "-m", "append commit2"]);

      const ok = verifyAppendOnlyHistoryDiff(clone, "origin/m5-history");
      assert.equal(ok.verified, true);
      assert.equal(ok.addedFiles.length, 1);

      // Modified historical record fails closed
      fs.writeFileSync(file1Abs, fs.readFileSync(file1Abs, "utf-8") + "\n", "utf-8");
      runGit(clone, ["add", "."]);
      runGit(clone, ["commit", "-m", "modify existing"]);
      assert.throws(() => verifyAppendOnlyHistoryDiff(clone, "origin/m5-history"), /HISTORICAL_INTEGRITY_VIOLATION/);

      // Reset and test deleted historical record
      runGit(clone, ["reset", "--hard", "origin/m5-history"]);
      fs.rmSync(file1Abs);
      runGit(clone, ["add", "."]);
      runGit(clone, ["commit", "-m", "delete existing"]);
      assert.throws(() => verifyAppendOnlyHistoryDiff(clone, "origin/m5-history"), /HISTORICAL_INTEGRITY_VIOLATION/);

      // Reset and test relocated historical record
      runGit(clone, ["reset", "--hard", "origin/m5-history"]);
      const relocatedAbs = path.join(clone, `stewardship/reports/history/m5-shadow/${"9".repeat(40)}/${env1.observationHash}.json`);
      fs.mkdirSync(path.dirname(relocatedAbs), { recursive: true });
      fs.renameSync(file1Abs, relocatedAbs);
      runGit(clone, ["add", "."]);
      runGit(clone, ["commit", "-m", "relocate existing"]);
      assert.throws(() => verifyAppendOnlyHistoryDiff(clone, "origin/m5-history"), /HISTORICAL_INTEGRITY_VIOLATION/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("concurrent retention pushes and fetch/rebase retry preserve all records or fail closed on conflict", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "m5-concurrent-"));
    try {
      const bareRemote = path.join(tmp, "remote.git");
      const cloneA = path.join(tmp, "cloneA");
      const cloneB = path.join(tmp, "cloneB");
      fs.mkdirSync(bareRemote, { recursive: true });
      runGit(bareRemote, ["init", "--bare"]);

      runGit(tmp, ["clone", bareRemote, cloneA]);
      runGit(cloneA, ["config", "user.name", "Bridmation"]);
      runGit(cloneA, ["config", "user.email", "355237203+Bridmation@users.noreply.github.com"]);
      runGit(cloneA, ["checkout", "-b", "m5-history"]);

      const commit1 = "1".repeat(40);
      const env1 = makeObservation(commit1);
      const f1 = path.join(cloneA, `stewardship/reports/history/m5-shadow/${commit1}/${env1.observationHash}.json`);
      fs.mkdirSync(path.dirname(f1), { recursive: true });
      fs.writeFileSync(f1, JSON.stringify(env1, null, 2) + "\n", "utf-8");
      runGit(cloneA, ["add", "."]);
      runGit(cloneA, ["commit", "-m", "seed"]);
      runGit(cloneA, ["push", "-u", "origin", "m5-history"]);

      runGit(tmp, ["clone", "-b", "m5-history", bareRemote, cloneB]);
      runGit(cloneB, ["config", "user.name", "Bridmation"]);
      runGit(cloneB, ["config", "user.email", "355237203+Bridmation@users.noreply.github.com"]);

      // Clone A retains commit2 and pushes
      const commit2 = "2".repeat(40);
      const env2 = makeObservation(commit2);
      const f2 = path.join(cloneA, `stewardship/reports/history/m5-shadow/${commit2}/${env2.observationHash}.json`);
      fs.mkdirSync(path.dirname(f2), { recursive: true });
      fs.writeFileSync(f2, JSON.stringify(env2, null, 2) + "\n", "utf-8");
      runGit(cloneA, ["add", "."]);
      runGit(cloneA, ["commit", "-m", "retain commit2"]);
      assert.equal(verifyAppendOnlyHistoryDiff(cloneA, "origin/m5-history").verified, true);
      runGit(cloneA, ["push", "origin", "HEAD:m5-history"]);

      // Clone B concurrently retains commit3; initial push fails, rebase + re-verify succeeds
      const commit3 = "3".repeat(40);
      const env3 = makeObservation(commit3);
      const f3 = path.join(cloneB, `stewardship/reports/history/m5-shadow/${commit3}/${env3.observationHash}.json`);
      fs.mkdirSync(path.dirname(f3), { recursive: true });
      fs.writeFileSync(f3, JSON.stringify(env3, null, 2) + "\n", "utf-8");
      runGit(cloneB, ["add", "."]);
      runGit(cloneB, ["commit", "-m", "retain commit3"]);

      assert.throws(() => runGit(cloneB, ["push", "origin", "HEAD:m5-history"]));
      runGit(cloneB, ["fetch", "origin", "m5-history"]);
      runGit(cloneB, ["rebase", "origin/m5-history"]);
      assert.equal(verifyAppendOnlyHistoryDiff(cloneB, "origin/m5-history").verified, true);
      runGit(cloneB, ["push", "origin", "HEAD:m5-history"]);

      // Both commit2 and commit3 are present on origin/m5-history
      runGit(cloneA, ["fetch", "origin", "m5-history"]);
      const treeOut = runGit(cloneA, ["ls-tree", "-r", "--name-only", "origin/m5-history"]);
      assert.ok(treeOut.includes(`${commit1}/${env1.observationHash}.json`));
      assert.ok(treeOut.includes(`${commit2}/${env2.observationHash}.json`));
      assert.ok(treeOut.includes(`${commit3}/${env3.observationHash}.json`));

      // Rebase failure (conflicting file at same path) fails closed
      runGit(cloneA, ["fetch", "origin", "m5-history"]);
      runGit(cloneA, ["rebase", "origin/m5-history"]);
      const cloneC = path.join(tmp, "cloneC");
      runGit(tmp, ["clone", "-b", "m5-history", bareRemote, cloneC]);
      runGit(cloneC, ["config", "user.name", "Bridmation"]);
      runGit(cloneC, ["config", "user.email", "355237203+Bridmation@users.noreply.github.com"]);

      const commit4 = "4".repeat(40);
      const env4a = makeObservation(commit4, { shadowGateResult: "SHADOW_PASS" });
      const f4a = path.join(cloneA, `stewardship/reports/history/m5-shadow/${commit4}/shared.json`);
      fs.mkdirSync(path.dirname(f4a), { recursive: true });
      fs.writeFileSync(f4a, JSON.stringify(env4a), "utf-8");
      runGit(cloneA, ["add", "."]);
      runGit(cloneA, ["commit", "-m", "conflict A"]);
      runGit(cloneA, ["push", "origin", "HEAD:m5-history"]);

      const env4b = makeObservation(commit4, { shadowGateResult: "SHADOW_ATTENTION" });
      const f4c = path.join(cloneC, `stewardship/reports/history/m5-shadow/${commit4}/shared.json`);
      fs.mkdirSync(path.dirname(f4c), { recursive: true });
      fs.writeFileSync(f4c, JSON.stringify(env4b), "utf-8");
      runGit(cloneC, ["add", "."]);
      runGit(cloneC, ["commit", "-m", "conflict C"]);
      runGit(cloneC, ["fetch", "origin", "m5-history"]);
      assert.throws(() => runGit(cloneC, ["rebase", "origin/m5-history"]));
      runGit(cloneC, ["rebase", "--abort"]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("resolveHistoryRecords validates paths, rejects misplaced/conflicting records, and handles cases 1-5", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "m5-history-modes-"));
    try {
      const bareRemote = path.join(tmp, "remote.git");
      const work = path.join(tmp, "work");
      fs.mkdirSync(bareRemote, { recursive: true });
      fs.mkdirSync(work, { recursive: true });

      runGit(bareRemote, ["init", "--bare"]);
      runGit(work, ["init", "-b", "main"]);
      runGit(work, ["config", "user.name", "Bridmation"]);
      runGit(work, ["config", "user.email", "355237203+Bridmation@users.noreply.github.com"]);

      const commit1 = "1".repeat(40);
      const env1 = makeObservation(commit1);
      const localHistDir = path.join(work, "stewardship", "reports", "history", "m5-shadow", commit1);
      fs.mkdirSync(localHistDir, { recursive: true });
      fs.writeFileSync(path.join(localHistDir, `${env1.observationHash}.json`), JSON.stringify(env1), "utf-8");

      runGit(work, ["add", "."]);
      runGit(work, ["commit", "-m", "baseline"]);
      runGit(work, ["remote", "add", "origin", bareRemote]);
      runGit(work, ["push", "-u", "origin", "main"]);

      // Case 1: absent
      assert.throws(() => resolveHistoryRecords(work), /M5_HISTORY_BRANCH_MISSING/);

      // Case 4: offline-local + non-authoritative labeling
      const offline = resolveHistoryRecords(work, { offlineLocal: true });
      assert.equal(offline.mode, "OFFLINE_LOCAL");
      assert.equal(offline.observations.length, 1);
      assert.ok(offline.warnings.includes("OFFLINE_LOCAL_HISTORY_ONLY"));

      const offlineAssessment = finalizeAssessmentForHistoryMode(
        evaluateEnforcementReadiness(
          offline.observations,
          {
            policyVersion: "M5-POLICY-1.0",
            evaluatorVersion: "M5-EVALUATOR-1.0",
            implementationIdentityScheme: "M5-SOURCE-HASH-1",
            implementationIdentity: env1.observation.implementationIdentity
          },
          work,
          { requiredObservationCount: 1, requiredUniqueRepositorySnapshots: 1 }
        ),
        offline.mode,
        offline.warnings,
        offline.hashMismatchFiles
      );
      assert.equal(offlineAssessment.assessmentState, "ENFORCEMENT_NOT_READY");
      assert.ok(offlineAssessment.blockingReasons.includes("OFFLINE_LOCAL_NON_AUTHORITATIVE"));
      assert.ok(offlineAssessment.warnings.includes("OFFLINE_LOCAL_HISTORY_ONLY"));

      // Push m5-history with commit2
      const seed = path.join(tmp, "seed");
      runGit(tmp, ["clone", bareRemote, seed]);
      runGit(seed, ["config", "user.name", "Bridmation"]);
      runGit(seed, ["config", "user.email", "355237203+Bridmation@users.noreply.github.com"]);
      runGit(seed, ["checkout", "-b", "m5-history"]);

      const commit2 = "2".repeat(40);
      const env2 = makeObservation(commit2);
      const seedHistDir = path.join(seed, "stewardship", "reports", "history", "m5-shadow", commit2);
      fs.mkdirSync(seedHistDir, { recursive: true });
      fs.writeFileSync(path.join(seedHistDir, `${env2.observationHash}.json`), JSON.stringify(env2), "utf-8");
      runGit(seed, ["add", "."]);
      runGit(seed, ["commit", "-m", "retain commit2"]);
      runGit(seed, ["push", "-u", "origin", "m5-history"]);

      // Case 2: unfetched
      assert.throws(() => resolveHistoryRecords(work, { skipRemoteFetch: true }), /M5_HISTORY_NOT_FETCHED/);

      // Case 5: merge without double-counting
      const auth = resolveHistoryRecords(work);
      assert.equal(auth.mode, "AUTHORITATIVE");
      assert.equal(auth.observations.length, 2);
      assert.equal(auth.hashMismatchFiles.length, 0);

      // Misplaced local record (wrong commit dir) is rejected
      const wrongDir = path.join(work, "stewardship", "reports", "history", "m5-shadow", "9".repeat(40));
      fs.mkdirSync(wrongDir, { recursive: true });
      fs.writeFileSync(path.join(wrongDir, `${env1.observationHash}.json`), JSON.stringify(env1), "utf-8");
      const misplacedRes = resolveHistoryRecords(work);
      assert.ok(misplacedRes.hashMismatchFiles.some(p => p.includes("9".repeat(40))));
      fs.rmSync(wrongDir, { recursive: true, force: true });

      // Conflicting local vs remote record under same path/hash is rejected
      const remoteConflict = makeObservation(commit2, { shadowGateResult: "SHADOW_ATTENTION" });
      const localCommit2Dir = path.join(work, "stewardship", "reports", "history", "m5-shadow", commit2);
      fs.mkdirSync(localCommit2Dir, { recursive: true });
      fs.writeFileSync(
        path.join(localCommit2Dir, `${remoteConflict.observationHash}.json`),
        JSON.stringify(remoteConflict),
        "utf-8"
      );
      // Also write remoteConflict into env2's path locally? No, write conflicting env2 content at env2's filename (hash mismatch)
      fs.writeFileSync(
        path.join(localCommit2Dir, `${env2.observationHash}.json`),
        JSON.stringify(remoteConflict),
        "utf-8"
      );
      const conflictRes = resolveHistoryRecords(work);
      assert.ok(conflictRes.hashMismatchFiles.some(p => p.includes(env2.observationHash)));
      fs.rmSync(localCommit2Dir, { recursive: true, force: true });

      // Case 3: fetch failure
      runGit(work, ["remote", "set-url", "origin", path.join(tmp, "nonexistent.git")]);
      assert.throws(() => resolveHistoryRecords(work), /M5_HISTORY_FETCH_FAILED/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("all 104 baseline records in repository remain ENFORCEMENT_READY in authoritative mode", () => {
    const resolved = resolveHistoryRecords(repoRoot);
    assert.equal(resolved.mode, "AUTHORITATIVE");
    assert.ok(resolved.observations.length >= 104);
    assert.equal(resolved.hashMismatchFiles.length, 0);

    const evalId = computeM5ImplementationIdentity(repoRoot);
    const assessment = finalizeAssessmentForHistoryMode(
      evaluateEnforcementReadiness(
        resolved.observations,
        {
          policyVersion: "M5-POLICY-1.0",
          evaluatorVersion: "M5-EVALUATOR-1.0",
          implementationIdentityScheme: "M5-SOURCE-HASH-1",
          implementationIdentity: evalId.identity
        },
        repoRoot
      ),
      resolved.mode,
      resolved.warnings,
      resolved.hashMismatchFiles
    );
    assert.equal(assessment.assessmentState, "ENFORCEMENT_READY");
    assert.ok(assessment.eligibleObservationCount >= 104);
    assert.deepEqual(assessment.blockingReasons, []);
  });
});
