import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { runRetention } from "../tooling/prag_provenance_m5_retain.js";
import {
  resolveHistoryRecords,
  evaluateEnforcementReadiness
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

      // Different execution metadata (CI rerun)
      const env2 = {
        ...env1,
        execution: { ...env1.execution, runId: "2002", timestamp: "2026-11-12T01:00:00.000Z" }
      };
      fs.writeFileSync(reportPath, JSON.stringify(env2), "utf-8");

      // Strict default preserves existing contract
      assert.throws(() => runRetention(workspace, reportPath, { historyRoot }), /HISTORICAL_EVIDENCE_CORRUPTION/);
      assert.equal(fs.readFileSync(destPath, "utf-8"), originalBytes);

      // CI rerun idempotent mode succeeds without overwriting
      const rerun = runRetention(workspace, reportPath, {
        historyRoot,
        allowExecutionMetadataDiff: true
      });
      assert.equal(rerun.status, "IDEMPOTENT_NOOP");
      assert.equal(fs.readFileSync(destPath, "utf-8"), originalBytes);

      // Conflicting observation content under same hash still fails even with allowExecutionMetadataDiff
      const tampered = {
        ...env2,
        observation: { ...env2.observation, shadowGateResult: "SHADOW_ATTENTION" }
      };
      // Write directly to destPath to simulate conflicting stored content vs incoming valid report
      fs.writeFileSync(reportPath, JSON.stringify(env1), "utf-8");
      const tamperedValid = makeObservation(commitSha, { shadowGateResult: "SHADOW_ATTENTION" });
      fs.writeFileSync(destPath, JSON.stringify(tamperedValid), "utf-8");
      assert.throws(
        () => runRetention(workspace, reportPath, { historyRoot, allowExecutionMetadataDiff: true }),
        /HISTORICAL_EVIDENCE_CORRUPTION/
      );
      // Confirm tampered file was not overwritten
      assert.equal(JSON.parse(fs.readFileSync(destPath, "utf-8")).observationHash, tamperedValid.observationHash);
      void tampered;
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("resolveHistoryRecords handles cases 1-5 (absent, unfetched, fetch-failed, offline-local, remote+local merge)", () => {
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

      // Case 1: m5-history genuinely absent on remote
      assert.throws(() => resolveHistoryRecords(work), /M5_HISTORY_BRANCH_MISSING/);

      // Case 4: Intentional offline local-only
      const offline = resolveHistoryRecords(work, { offlineLocal: true });
      assert.equal(offline.mode, "OFFLINE_LOCAL");
      assert.equal(offline.observations.length, 1);
      assert.ok(offline.warnings.includes("OFFLINE_LOCAL_HISTORY_ONLY"));

      // Push m5-history with an additional observation (commit2) from a separate clone
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

      // Case 2: Remote branch exists but not fetched locally yet
      assert.throws(
        () => resolveHistoryRecords(work, { skipRemoteFetch: true }),
        /M5_HISTORY_NOT_FETCHED/
      );

      // Case 5: Authoritative fetch + merge without double-counting commit1
      const auth = resolveHistoryRecords(work);
      assert.equal(auth.mode, "AUTHORITATIVE");
      assert.equal(auth.observations.length, 2);
      assert.equal(auth.hashMismatchFiles.length, 0);

      // Case 3: Fetch failure (unreachable remote)
      runGit(work, ["remote", "set-url", "origin", path.join(tmp, "nonexistent.git")]);
      assert.throws(() => resolveHistoryRecords(work), /M5_HISTORY_FETCH_FAILED/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("existing 104-record repository baseline remains ENFORCEMENT_READY", () => {
    const resolved = resolveHistoryRecords(repoRoot, { offlineLocal: true });
    assert.ok(resolved.observations.length >= 104);
    assert.equal(resolved.hashMismatchFiles.length, 0);

    const evalId = computeM5ImplementationIdentity(repoRoot);
    const assessment = evaluateEnforcementReadiness(
      resolved.observations,
      {
        policyVersion: "M5-POLICY-1.0",
        evaluatorVersion: "M5-EVALUATOR-1.0",
        implementationIdentityScheme: "M5-SOURCE-HASH-1",
        implementationIdentity: evalId.identity
      },
      repoRoot
    );
    assert.equal(assessment.assessmentState, "ENFORCEMENT_READY");
    assert.ok(assessment.eligibleObservationCount >= 104);
    assert.deepEqual(assessment.blockingReasons, []);
  });
});
