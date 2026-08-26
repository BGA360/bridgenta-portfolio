import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, "..");

const registryPath = path.join(workspaceDir, "src", "data", "provenance_registry.json");
const manifestPath = path.join(workspaceDir, "src", "data", "local_integrity_manifest.json");

export function generateIntegrityManifest(registry, existingManifest = []) {
  const existingMap = new Map(existingManifest.map(entry => [entry.eventId, entry]));
  const result = [];

  for (const entry of registry) {
    const { eventId, sourceProject, sourceSystem, sourceLocator, historicalLocatorState, historicalLocator } = entry;

    let localVerificationState = "NOT_AVAILABLE";
    let integrityEvidenceType = null;
    let integrityEvidenceValue = null;

    if (sourceSystem === "issue-tracker") {
      localVerificationState = "NOT_APPLICABLE";
    } else {
      // Resolve path
      const pathsToTry = [
        path.join(workspaceDir, sourceLocator),
        path.join(workspaceDir, sourceProject, sourceLocator)
      ];
      let resolvedPath = null;
      for (const p of pathsToTry) {
        try {
          if (fs.existsSync(p) && fs.statSync(p).isFile()) {
            resolvedPath = p;
            break;
          }
        } catch {
          // ignore
        }
      }

      if (resolvedPath) {
        const content = fs.readFileSync(resolvedPath);
        const hash = crypto.createHash("sha256").update(content).digest("hex");
        localVerificationState = "AVAILABLE";
        integrityEvidenceType = "sha256";
        integrityEvidenceValue = hash;
      } else {
        if (sourceSystem === "dms" || sourceSystem === "ci-artifact") {
          localVerificationState = "OPTIONAL_NOT_CAPTURED";
        } else {
          localVerificationState = "NOT_AVAILABLE";
        }
      }
    }

    // Preserve capturedAt timestamp for determinism
    const existing = existingMap.get(eventId);
    const capturedAt = existing ? existing.capturedAt : new Date().toISOString();

    result.push({
      eventId,
      sourceSystem,
      sourceLocator,
      historicalLocatorState,
      historicalLocator,
      localVerificationState,
      integrityEvidenceType,
      integrityEvidenceValue,
      capturedAt
    });
  }

  // Sort by eventId deterministically
  result.sort((a, b) => a.eventId.localeCompare(b.eventId));
  return result;
}

function run() {
  if (!fs.existsSync(registryPath)) {
    console.error(`Registry file does not exist at ${registryPath}`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  let existingManifest = [];
  if (fs.existsSync(manifestPath)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      // ignore malformed existing manifest
    }
  }

  const newManifest = generateIntegrityManifest(registry, existingManifest);
  fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2), "utf-8");
  console.log(`Generated manifest successfully with ${newManifest.length} entries.`);
}

// Only run automatically if executed directly from terminal
if (process.argv[1] && (process.argv[1] === __filename || process.argv[1].endsWith("prag_integrity_generator.js"))) {
  run();
}
