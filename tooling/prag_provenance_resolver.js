import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  validateRegistry,
  validateManifest,
  validateClearances,
  PROJECT_NAMESPACE_MAP
} from "./prag_provenance_validator.js";

// Parse YAML-like frontmatter from file content
export function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return {};
  const yamlStr = match[1];
  const data = {};
  for (const line of yamlStr.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
      const key = trimmed.slice(0, colonIndex).trim();
      const val = trimmed.slice(colonIndex + 1).trim();
      // Remove surrounding quotes
      const cleanVal = val.replace(/^["']|["']$/g, '');
      data[key] = cleanVal;
    }
  }
  return data;
}

// Extracted helper for review subject matching - strictly frontmatter-only
export function getReviewSubject(fileContent) {
  const fm = parseFrontmatter(fileContent);
  return (typeof fm.subject === "string" && fm.subject.trim()) ? fm.subject.trim() : null;
}

// Fingerprint calculation using canonical JSON serialization of exactly the bound fields
export function computeExpectedFingerprint(activeEvidence) {
  const {
    eventId,
    sourceProject,
    sourceSystem,
    sourceLocator,
    historicalLocatorState,
    historicalLocator,
    resolutionState,
    clearanceScope,
    subjectType,
    subjectId
  } = activeEvidence;

  let obj = {};
  if (clearanceScope === "EVENT") {
    obj = {
      eventId,
      sourceProject,
      sourceSystem,
      sourceLocator,
      historicalLocatorState,
      historicalLocator,
      resolutionState,
      clearanceScope
    };
  } else if (clearanceScope === "ARTICLE_EVENT") {
    obj = {
      eventId,
      sourceProject,
      sourceSystem,
      sourceLocator,
      historicalLocatorState,
      historicalLocator,
      resolutionState,
      clearanceScope,
      subjectType,
      subjectId
    };
  } else {
    throw new Error(`Invalid clearanceScope for fingerprint: '${clearanceScope}'.`);
  }

  // Canonical JSON serialization: deterministic key sorting
  const sortedKeys = Object.keys(obj).sort();
  const canonicalObj = {};
  for (const k of sortedKeys) {
    canonicalObj[k] = obj[k];
  }
  const serialized = JSON.stringify(canonicalObj);

  return crypto.createHash("sha256").update(serialized).digest("hex");
}

// Resolve a single article's provenance
export function resolveArticleProvenance(articlePath, workspaceDir, registry, manifest, clearances, namespaceMap = PROJECT_NAMESPACE_MAP) {
  const fullArticlePath = path.join(workspaceDir, articlePath);
  if (!fs.existsSync(fullArticlePath)) {
    throw new Error(`Article file does not exist: '${articlePath}'.`);
  }

  const content = fs.readFileSync(fullArticlePath, "utf-8");
  const frontmatter = parseFrontmatter(content);
  const provenanceRef = frontmatter.provenanceRef || null;

  if (!provenanceRef) {
    return {
      subjectType: "learning-article",
      subjectId: articlePath,
      provenanceRef: null,
      baseResolutionState: null,
      effectiveGateResult: "PASS",
      clearanceApplied: false,
      reason: "NO_PROVENANCE_REF"
    };
  }

  // Validate syntax
  if (!/^EV-[A-Z]{2,4}-[0-9]{3,5}$/.test(provenanceRef)) {
    throw new Error(`Invalid provenanceRef syntax in article: '${provenanceRef}'.`);
  }

  // Validate registry, manifest, clearances structural logic
  validateRegistry(registry, namespaceMap);
  validateManifest(manifest, registry, namespaceMap);
  validateClearances(clearances);

  // Look up event in registry
  const matches = registry.filter(e => e.eventId === provenanceRef);
  if (matches.length === 0) {
    return {
      subjectType: "learning-article",
      subjectId: articlePath,
      provenanceRef,
      baseResolutionState: "UNKNOWN_EVENT",
      effectiveGateResult: "FAIL",
      clearanceApplied: false,
      reason: "UNKNOWN_EVENT"
    };
  }

  if (matches.length > 1) {
    throw new Error(`Duplicate eventId '${provenanceRef}' found in registry (structural failure).`);
  }

  const regEntry = matches[0];
  const manEntry = manifest.find(m => m.eventId === provenanceRef);

  if (!manEntry) {
    throw new Error(`Orphan manifest entry check failed (structural failure).`);
  }

  // Derive base resolution state
  let baseResolutionState = "RESOLVED";

  if (regEntry.historicalLocatorState === "UNAVAILABLE") {
    baseResolutionState = "HISTORICAL_LOCATOR_UNAVAILABLE";
  } else if (regEntry.historicalLocatorState === "TEMPORARILY_UNAVAILABLE") {
    baseResolutionState = "HISTORICAL_LOCATOR_TEMPORARILY_UNAVAILABLE";
  } else if (regEntry.historicalLocatorState === "NOT_MACHINE_VERIFIABLE") {
    baseResolutionState = "HISTORICAL_LOCATOR_NOT_MACHINE_VERIFIABLE";
  } else if (regEntry.historicalLocatorState === "AVAILABLE") {
    if (manEntry.localVerificationState === "NOT_AVAILABLE") {
      baseResolutionState = "SOURCE_UNAVAILABLE";
    } else if (manEntry.localVerificationState === "AVAILABLE") {
      // Find file checksum
      const pathsToTry = [
        path.join(workspaceDir, regEntry.sourceLocator),
        path.join(workspaceDir, regEntry.sourceProject, regEntry.sourceLocator)
      ];
      let resolvedPath = null;
      for (const p of pathsToTry) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          resolvedPath = p;
          break;
        }
      }

      if (!resolvedPath) {
        // File is missing locally but recorded as AVAILABLE in manifest -> fidelity issue
        baseResolutionState = "FIDELITY_UNCONFIRMED";
      } else {
        const fileContent = fs.readFileSync(resolvedPath);
        const computedHash = crypto.createHash("sha256").update(fileContent).digest("hex");
        if (computedHash === manEntry.integrityEvidenceValue) {
          baseResolutionState = "RESOLVED";
        } else {
          baseResolutionState = "FIDELITY_UNCONFIRMED";
        }
      }
    } else {
      // OPTIONAL_NOT_CAPTURED or NOT_APPLICABLE
      baseResolutionState = "RESOLVED";
    }
  }

  if (baseResolutionState === "RESOLVED") {
    return {
      subjectType: "learning-article",
      subjectId: articlePath,
      provenanceRef,
      baseResolutionState: "RESOLVED",
      effectiveGateResult: "PASS",
      clearanceApplied: false,
      reason: "RESOLVED"
    };
  }

  const expectedScope = baseResolutionState === "FIDELITY_UNCONFIRMED" ? "ARTICLE_EVENT" : "EVENT";

  let matchedClearance = null;

  for (const cl of clearances) {
    if (cl.eventId !== provenanceRef) continue;
    if (cl.clearanceState !== "APPROVED") continue;
    if (cl.reviewType !== "Source-Fidelity") continue;
    if (cl.result !== "PASS") continue;
    if (cl.clearanceScope !== expectedScope) continue;
    
    // B3R-02: Exact resolutionState matching only
    if (cl.resolutionState !== baseResolutionState) continue;

    if (expectedScope === "ARTICLE_EVENT") {
      if (cl.subjectType !== "learning-article") continue;
      if (cl.subjectId !== articlePath) continue;
    }

    // B3R-01: Runtime fingerprint verification from active validated evidence context
    const activeEvidence = {
      eventId: regEntry.eventId,
      sourceProject: regEntry.sourceProject,
      sourceSystem: regEntry.sourceSystem,
      sourceLocator: regEntry.sourceLocator,
      historicalLocatorState: regEntry.historicalLocatorState,
      historicalLocator: regEntry.historicalLocator,
      resolutionState: baseResolutionState,
      clearanceScope: expectedScope,
      subjectType: expectedScope === "ARTICLE_EVENT" ? "learning-article" : undefined,
      subjectId: expectedScope === "ARTICLE_EVENT" ? articlePath : undefined
    };

    const expectedFingerprint = computeExpectedFingerprint(activeEvidence);
    if (expectedFingerprint !== cl.evidenceFingerprint) {
      continue; // Fingerprint mismatch/staleness
    }

    // Check review reference target exists
    const fullReviewPath = path.join(workspaceDir, cl.reviewReference);
    if (!fs.existsSync(fullReviewPath)) {
      continue;
    }

    // Review subject matching (ARTICLE_EVENT scope)
    if (expectedScope === "ARTICLE_EVENT") {
      const reviewContent = fs.readFileSync(fullReviewPath, "utf-8");
      const reviewSubject = getReviewSubject(reviewContent);
      if (reviewSubject !== articlePath) {
        continue;
      }
    }

    // Found effective clearance!
    matchedClearance = cl;
    break;
  }

  if (matchedClearance) {
    return {
      subjectType: "learning-article",
      subjectId: articlePath,
      provenanceRef,
      baseResolutionState,
      effectiveGateResult: "PASS",
      clearanceApplied: true,
      reason: `CLEARED_${baseResolutionState}`
    };
  } else {
    return {
      subjectType: "learning-article",
      subjectId: articlePath,
      provenanceRef,
      baseResolutionState,
      effectiveGateResult: "FAIL",
      clearanceApplied: false,
      reason: `UNRESOLVED_${baseResolutionState}`
    };
  }
}

// Discover all articles in the content folder and resolve their provenance
export function resolveAllArticlesProvenance(workspaceDir, registry, manifest, clearances, namespaceMap = PROJECT_NAMESPACE_MAP) {
  const learningDir = path.join(workspaceDir, "src", "content", "learning");
  if (!fs.existsSync(learningDir)) {
    return [];
  }

  const files = fs.readdirSync(learningDir);
  const results = [];

  for (const file of files) {
    if (file.endsWith(".md") && file !== ".gitkeep") {
      const articlePath = path.join("src", "content", "learning", file).replace(/\\/g, "/");
      const res = resolveArticleProvenance(articlePath, workspaceDir, registry, manifest, clearances, namespaceMap);
      results.push(res);
    }
  }

  return results;
}
