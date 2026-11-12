import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateObservationReport } from "./prag_provenance_m5_readiness.js";

/**
 * Constructs a deterministic canonical retained envelope.
 * @param {any} observation 
 * @param {string} observationHash 
 * @param {any} execution 
 * @returns {any}
 */
export function buildCanonicalEnvelope(observation, observationHash, execution) {
  // Sort observation keys
  const sortedObs = {};
  for (const k of Object.keys(observation || {}).sort()) {
    sortedObs[k] = observation[k];
  }

  // Build canonical execution metadata
  const canonicalExecution = {
    branch: execution?.branch || null,
    job: execution?.job || null,
    runId: execution?.runId || null,
    runner: execution?.runner || null,
    timestamp: execution?.timestamp || null,
    workflow: execution?.workflow || null
  };

  return {
    execution: canonicalExecution,
    observation: sortedObs,
    observationHash: observationHash
  };
}

/**
 * Deterministically serializes a retained envelope.
 * @param {any} envelope 
 * @returns {string}
 */
export function serializeEnvelope(envelope) {
  const canonical = buildCanonicalEnvelope(
    envelope.observation,
    envelope.observationHash,
    envelope.execution
  );
  return JSON.stringify(canonical, null, 2) + "\n";
}

/**
 * Validates and persists a shadow observation working report into the durable history directory.
 * @param {string} workspaceRoot 
 * @param {string|null} [customReportPath] 
 * @param {{ historyRoot?: string|null, allowExecutionMetadataDiff?: boolean }} [options]
 * @returns {{ status: "PERSISTED"|"IDEMPOTENT_NOOP", hash: string }}
 */
export function runRetention(workspaceRoot, customReportPath = null, options = {}) {
  const reportPath = customReportPath || path.join(workspaceRoot, "stewardship", "reports", "m5-ci-shadow-observation.json");
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Working report not found at: ${reportPath}`);
  }

  const content = fs.readFileSync(reportPath, "utf-8");
  const executionEnvelope = JSON.parse(content);

  const valRes = validateObservationReport(executionEnvelope);
  if (!valRes.valid) {
    throw new Error(`Validation failed: ${valRes.reason}`);
  }

  const obs = valRes.observation;
  const obsHash = valRes.hash;

  // Check required fields
  if (!obs.repositoryCommit || !obs.policyVersion || !obs.evaluatorVersion || !obs.implementationIdentity || !obs.implementationIdentityScheme) {
    throw new Error("Missing required identity fields.");
  }

  const targetRoot = options.historyRoot || workspaceRoot;
  const historyDir = path.join(targetRoot, "stewardship", "reports", "history", "m5-shadow", obs.repositoryCommit);
  const destPath = path.join(historyDir, `${obsHash}.json`);

  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

  const incomingSerialized = serializeEnvelope(executionEnvelope);

  if (fs.existsSync(destPath)) {
    // Idempotency / content verification (Section 13)
    const existingContent = fs.readFileSync(destPath, "utf-8");
    let existingEnvelope;
    try {
      existingEnvelope = JSON.parse(existingContent);
    } catch (e) {
      throw new Error("HISTORICAL_EVIDENCE_CORRUPTION: Existing history file is malformed JSON.");
    }

    // Validate existing record
    const valExisting = validateObservationReport(existingEnvelope);
    if (!valExisting.valid) {
      throw new Error("HISTORICAL_EVIDENCE_CORRUPTION: Existing history file fails validation.");
    }

    let existingSerialized;
    try {
      existingSerialized = serializeEnvelope(existingEnvelope);
    } catch (e) {
      throw new Error("HISTORICAL_EVIDENCE_CORRUPTION: Existing history file cannot be serialized.");
    }

    // Check if semantically identical canonical envelope
    if (existingSerialized === incomingSerialized) {
      return { status: "IDEMPOTENT_NOOP", hash: obsHash };
    }

    if (options.allowExecutionMetadataDiff) {
      const existingObsOnly = JSON.stringify(
        buildCanonicalEnvelope(valExisting.observation, valExisting.hash, null).observation
      );
      const incomingObsOnly = JSON.stringify(
        buildCanonicalEnvelope(obs, obsHash, null).observation
      );
      if (valExisting.hash === obsHash && existingObsOnly === incomingObsOnly) {
        return { status: "IDEMPOTENT_NOOP", hash: obsHash };
      }
    }

    throw new Error("HISTORICAL_EVIDENCE_CORRUPTION: Content mismatch between existing envelope and incoming envelope.");
  }

  // Write new record deterministically
  fs.writeFileSync(destPath, incomingSerialized, "utf-8");
  return { status: "PERSISTED", hash: obsHash };
}

/**
 * Verifies that HEAD in historyRoot is a strict append-only fast-forward of baseRef:
 * - No commits missing from baseRef (fast-forward only)
 * - No dirty/untracked files
 * - Only newly added ('A') files under stewardship/reports/history/m5-shadow/<commit>/<hash>.json
 * - Zero modifications, deletions, renames, or out-of-scope changes
 * @param {string} historyRoot
 * @param {string} [baseRef]
 * @returns {{ verified: true, addedFiles: string[] }}
 */
export function verifyAppendOnlyHistoryDiff(historyRoot, baseRef = "origin/m5-history") {
  const runGit = (args) => execFileSync("git", args, {
    cwd: historyRoot,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  const behindCount = Number.parseInt(runGit(["rev-list", "--count", `HEAD..${baseRef}`]).trim(), 10);
  if (!Number.isFinite(behindCount) || behindCount !== 0) {
    throw new Error(`HISTORICAL_INTEGRITY_VIOLATION: HEAD is not a fast-forward descendant of ${baseRef} (behind by ${behindCount}).`);
  }

  const porcelain = runGit(["status", "--porcelain"]).trim();
  if (porcelain.length > 0) {
    throw new Error(`HISTORICAL_INTEGRITY_VIOLATION: Uncommitted changes present in history workspace.`);
  }

  const diffOut = runGit(["diff", "--name-status", "--no-renames", `${baseRef}..HEAD`]).trim();
  if (!diffOut) {
    return { verified: true, addedFiles: [] };
  }

  const addedFiles = [];
  const lines = diffOut.split(/\r?\n/);
  for (const line of lines) {
    const parts = line.split("\t");
    const status = parts[0];
    const relPath = parts[1];
    if (status !== "A" || parts.length !== 2) {
      throw new Error(`HISTORICAL_INTEGRITY_VIOLATION: Non-append-only git change detected (${line}).`);
    }

    const match = /^stewardship\/reports\/history\/m5-shadow\/([^/]+)\/([^/]+)\.json$/.exec(relPath);
    if (!match) {
      throw new Error(`HISTORICAL_INTEGRITY_VIOLATION: Added file outside m5-shadow history layout (${relPath}).`);
    }

    const [, dirCommit, fileHash] = match;
    const absPath = path.join(historyRoot, relPath);
    const parsed = JSON.parse(fs.readFileSync(absPath, "utf-8"));
    const valRes = validateObservationReport(parsed);
    if (!valRes.valid) {
      throw new Error(`HISTORICAL_INTEGRITY_VIOLATION: Added file failed validation (${relPath}: ${valRes.reason}).`);
    }
    if (valRes.observation.repositoryCommit !== dirCommit || valRes.hash !== fileHash) {
      throw new Error(`HISTORICAL_INTEGRITY_VIOLATION: Added file path does not match commit/hash (${relPath}).`);
    }
    addedFiles.push(relPath);
  }

  return { verified: true, addedFiles };
}

// CLI Entrypoint helper
function fileURLToPathLocal(url) {
  if (url.startsWith("file://")) {
    return fileURLToPath(url);
  }
  return url;
}

function parseCliArgs(argv) {
  let historyRoot = null;
  let reportPath = null;
  let allowExecutionMetadataDiff = false;
  let verifyAppendOnly = false;
  let baseRef = "origin/m5-history";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--ci-rerun-idempotent") {
      allowExecutionMetadataDiff = true;
    } else if (arg === "--verify-append-only") {
      verifyAppendOnly = true;
    } else if (arg === "--base-ref" && i + 1 < argv.length) {
      baseRef = argv[++i];
    } else if (arg === "--history-root" && i + 1 < argv.length) {
      historyRoot = path.resolve(argv[++i]);
    } else if (arg === "--report" && i + 1 < argv.length) {
      reportPath = path.resolve(argv[++i]);
    }
  }

  return { historyRoot, reportPath, allowExecutionMetadataDiff, verifyAppendOnly, baseRef };
}

function main() {
  try {
    const workspaceRoot = process.cwd();
    const {
      historyRoot,
      reportPath,
      allowExecutionMetadataDiff,
      verifyAppendOnly,
      baseRef
    } = parseCliArgs(process.argv.slice(2));

    if (verifyAppendOnly) {
      const targetRoot = historyRoot || workspaceRoot;
      const check = verifyAppendOnlyHistoryDiff(targetRoot, baseRef);
      console.log(`Append-only history diff verified (${check.addedFiles.length} added record(s)).`);
      process.exitCode = 0;
      return;
    }

    const result = runRetention(workspaceRoot, reportPath, {
      historyRoot,
      allowExecutionMetadataDiff
    });
    if (result.status === "IDEMPOTENT_NOOP") {
      console.log(`IDEMPOTENT_NOOP: Observation ${result.hash} already preserved.`);
    } else {
      console.log(`Observation ${result.hash} durably preserved in history.`);
    }
    process.exitCode = 0;
  } catch (error) {
    console.error("Retention failed:", error.message || error);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPathLocal(import.meta.url)) {
  main();
}
