import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateObservationReport } from "./prag_provenance_m5_readiness.js";

/**
 * Validates and persists a shadow observation working report into the durable history directory.
 * @param {string} workspaceRoot 
 * @param {string|null} [customReportPath] 
 * @returns {{ status: "PERSISTED"|"IDEMPOTENT_NOOP", hash: string }}
 */
export function runRetention(workspaceRoot, customReportPath = null) {
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

  const historyDir = path.join(workspaceRoot, "stewardship", "reports", "history", "m5-shadow", obs.repositoryCommit);
  const destPath = path.join(historyDir, `${obsHash}.json`);

  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

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

    // Check if semantically identical
    if (valExisting.hash === obsHash) {
      return { status: "IDEMPOTENT_NOOP", hash: obsHash };
    } else {
      throw new Error("HISTORICAL_EVIDENCE_CORRUPTION: Content mismatch for same hash.");
    }
  }

  // Deterministic serialization: stable property sorting and trailing newline
  const payloadToHash = {};
  for (const k of Object.keys(executionEnvelope.observation).sort()) {
    payloadToHash[k] = executionEnvelope.observation[k];
  }
  const cleanEnvelope = {
    observation: payloadToHash,
    observationHash: executionEnvelope.observationHash,
    execution: executionEnvelope.execution || null
  };

  const serialized = JSON.stringify(cleanEnvelope, null, 2) + "\n";
  fs.writeFileSync(destPath, serialized, "utf-8");
  return { status: "PERSISTED", hash: obsHash };
}

// CLI Entrypoint helper
function fileURLToPathLocal(url) {
  if (url.startsWith("file://")) {
    return fileURLToPath(url);
  }
  return url;
}

function main() {
  try {
    const workspaceRoot = process.cwd();
    const result = runRetention(workspaceRoot);
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
