import { execSync } from "node:child_process";

/**
 * Exposes a shared, framework-independent resolver for the repository commit identity.
 * @returns {{ state: "RESOLVED"|"UNAVAILABLE", identity: string|null }}
 */
export function resolveImplementationIdentity() {
  try {
    const sha = execSync("git rev-parse HEAD", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (/^[0-9a-f]{40}$/i.test(sha)) {
      return { state: "RESOLVED", identity: sha };
    }
  } catch (e) {
    // ignore
  }
  return { state: "UNAVAILABLE", identity: null };
}
