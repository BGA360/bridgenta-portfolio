import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultWorkspaceRoot = path.resolve(__dirname, "..");

/**
 * Resolves git -C <workspaceRoot> rev-parse HEAD
 * @param {string} [workspaceRoot]
 * @returns {{ state: "RESOLVED"|"UNAVAILABLE", commit: string|null }}
 */
export function resolveRepositoryCommit(workspaceRoot) {
  let root = workspaceRoot || defaultWorkspaceRoot;
  if (!fs.existsSync(path.join(root, ".git"))) {
    root = defaultWorkspaceRoot;
  }
  try {
    const sha = execSync(`git -C "${root}" rev-parse HEAD`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (/^[0-9a-f]{40}$/i.test(sha)) {
      return { state: "RESOLVED", commit: sha };
    }
  } catch (e) {
    // ignore
  }
  return { state: "UNAVAILABLE", commit: null };
}

/**
 * Computes a content-based SHA-256 hash over the canonical governed evaluator files.
 * @param {string} [workspaceRoot]
 * @returns {{ state: "RESOLVED"|"UNAVAILABLE", identity: string|null }}
 */
export function computeM5ImplementationIdentity(workspaceRoot) {
  let root = workspaceRoot || defaultWorkspaceRoot;
  if (!fs.existsSync(path.join(root, "tooling/prag_provenance_m5.js"))) {
    root = defaultWorkspaceRoot;
  }
  
  const files = [
    "tooling/prag_provenance_m5.js",
    "tooling/prag_provenance_projection.js",
    "tooling/prag_provenance_ci_shadow.js",
    "tooling/prag_provenance_identity.js",
    "tooling/prag_provenance_readiness.js"
  ];
  
  // Sort paths deterministically ASC
  files.sort();

  const manifest = [];

  for (const relativePath of files) {
    const normalizedPath = relativePath.replace(/\\/g, "/");
    const absPath = path.join(root, normalizedPath);
    if (!fs.existsSync(absPath)) {
      return { state: "UNAVAILABLE", identity: null };
    }
    try {
      const content = fs.readFileSync(absPath, "utf-8");
      // Normalize line endings CRLF to LF
      const normalizedContent = content.replace(/\r\n/g, "\n");
      const sha256 = crypto.createHash("sha256").update(normalizedContent).digest("hex");
      manifest.push({
        path: normalizedPath,
        sha256
      });
    } catch (e) {
      return { state: "UNAVAILABLE", identity: null };
    }
  }

  // Canonical serialization of manifest
  const serialized = JSON.stringify(manifest);
  const identity = crypto.createHash("sha256").update(serialized).digest("hex");

  return { state: "RESOLVED", identity };
}

/**
 * Compatibility API. Never returns Git HEAD.
 * @param {string} [workspaceRoot]
 * @returns {{ state: "RESOLVED"|"UNAVAILABLE", identity: string|null }}
 */
export function resolveImplementationIdentity(workspaceRoot) {
  return computeM5ImplementationIdentity(workspaceRoot);
}
