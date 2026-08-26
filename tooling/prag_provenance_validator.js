/**
 * PRAG Provenance Validator - Phase B2 Structural Validation Contracts
 */

export const PROJECT_NAMESPACE_MAP = [
  {
    projectId: "bridgenta-core",
    currentName: "bridgenta-core",
    aliases: ["bridgenta-workspace", "bridgenta"],
    prefix: "BG",
    status: "ACTIVE"
  },
  {
    projectId: "starcleaners",
    currentName: "starcleaners",
    aliases: ["star-cleaners"],
    prefix: "SC",
    status: "ACTIVE"
  },
  {
    projectId: "luminapraxis",
    currentName: "luminapraxis",
    aliases: ["lumina-praxis"],
    prefix: "LP",
    status: "ACTIVE"
  },
  {
    projectId: "aeocortex",
    currentName: "aeocortex",
    aliases: ["aeo-cortex"],
    prefix: "AC",
    status: "ACTIVE"
  },
  {
    projectId: "test-project",
    currentName: "test-project",
    aliases: [],
    prefix: "TEST",
    status: "ACTIVE"
  },
  {
    projectId: "retired-project",
    currentName: "retired-project",
    aliases: [],
    prefix: "RET",
    status: "RETIRED"
  }
];

export const VALID_SOURCE_SYSTEMS = new Set([
  "git",
  "versioned-filesystem",
  "dms",
  "issue-tracker",
  "ci-artifact",
  "archive",
  "structured-doc"
]);

export const VALID_HISTORICAL_LOCATOR_STATES = new Set([
  "AVAILABLE",
  "UNAVAILABLE",
  "TEMPORARILY_UNAVAILABLE",
  "NOT_MACHINE_VERIFIABLE"
]);

export const VALID_LOCAL_VERIFICATION_STATES = new Set([
  "AVAILABLE",
  "NOT_AVAILABLE",
  "OPTIONAL_NOT_CAPTURED",
  "NOT_APPLICABLE"
]);

export const HUMAN_CLEARABLE_RESOLUTIONS = new Set([
  "SOURCE_UNAVAILABLE",
  "HISTORICAL_LOCATOR_UNAVAILABLE",
  "HISTORICAL_LOCATOR_NOT_MACHINE_VERIFIABLE",
  "HISTORICAL_LOCATOR_TEMPORARILY_UNAVAILABLE",
  "SOURCE_DELETED",
  "SOURCE_MOVED",
  "SOURCE_SUPERSEDED",
  "FIDELITY_UNCONFIRMED"
]);

// sourceSystem x localVerificationState Matrix Check
export function isValidSourceLocalPair(system, localState) {
  switch (system) {
    case "git":
    case "versioned-filesystem":
    case "archive":
    case "structured-doc":
      return localState === "AVAILABLE" || localState === "NOT_AVAILABLE";
    case "dms":
    case "ci-artifact":
      return localState === "AVAILABLE" || localState === "NOT_AVAILABLE" || localState === "OPTIONAL_NOT_CAPTURED";
    case "issue-tracker":
      return localState === "NOT_APPLICABLE";
    default:
      return false;
  }
}

// historicalLocatorState x localVerificationState Matrix Check
export function isValidHistoricalLocalPair(historicalState, localState) {
  if (historicalState === "AVAILABLE") {
    return true; // Any localVerificationState is valid
  }
  // All other states (UNAVAILABLE, TEMPORARILY_UNAVAILABLE, NOT_MACHINE_VERIFIABLE)
  // require that localVerificationState is NOT AVAILABLE
  return localState !== "AVAILABLE";
}

// Uniqueness check for Project Namespace Map
export function validateNamespaceMap(map) {
  if (!Array.isArray(map)) {
    throw new Error("Namespace map must be an array.");
  }

  const projectIds = new Set();
  const currentNames = new Set();
  const allAliases = new Set();
  const prefixes = new Set();

  const retiredTokens = new Set();
  const activeTokens = new Set();

  for (const entry of map) {
    if (typeof entry.projectId !== "string" || !entry.projectId) {
      throw new Error("Invalid or missing projectId.");
    }
    if (typeof entry.currentName !== "string" || !entry.currentName) {
      throw new Error("Invalid or missing currentName.");
    }
    if (!Array.isArray(entry.aliases)) {
      throw new Error("Aliases must be an array.");
    }
    if (typeof entry.prefix !== "string" || !entry.prefix || !/^[A-Z]{2,4}$/.test(entry.prefix)) {
      throw new Error(`Invalid prefix: '${entry.prefix}'. Must be 2-4 uppercase letters.`);
    }
    if (entry.status !== "ACTIVE" && entry.status !== "RETIRED") {
      throw new Error(`Invalid status: '${entry.status}'.`);
    }

    // Uniqueness checks
    if (projectIds.has(entry.projectId)) {
      throw new Error(`Duplicate projectId: '${entry.projectId}'.`);
    }
    projectIds.add(entry.projectId);

    if (currentNames.has(entry.currentName)) {
      throw new Error(`Duplicate currentName: '${entry.currentName}'.`);
    }
    currentNames.add(entry.currentName);

    if (prefixes.has(entry.prefix)) {
      throw new Error(`Duplicate prefix: '${entry.prefix}'.`);
    }
    prefixes.add(entry.prefix);

    const projectTokenSet = new Set([entry.projectId, entry.currentName, ...entry.aliases]);

    // Check alias collisions globally and with self
    for (const alias of entry.aliases) {
      if (typeof alias !== "string" || !alias) {
        throw new Error("Aliases must be non-empty strings.");
      }
      if (allAliases.has(alias) || projectIds.has(alias) || currentNames.has(alias)) {
        throw new Error(`Globally collided alias token: '${alias}'.`);
      }
      allAliases.add(alias);
    }

    // Track tokens for retirement constraints
    const targetSet = entry.status === "RETIRED" ? retiredTokens : activeTokens;
    for (const token of projectTokenSet) {
      targetSet.add(token);
    }
    targetSet.add(entry.prefix);
  }

  // Enforce retired tokens are not reusable in active projects
  for (const token of retiredTokens) {
    if (activeTokens.has(token)) {
      throw new Error(`Retired namespace token reused in active project: '${token}'.`);
    }
  }

  // Cross-project token overlap check (disjoint sets)
  for (let i = 0; i < map.length; i++) {
    const tokensI = new Set([map[i].projectId, map[i].currentName, ...map[i].aliases]);
    for (let j = i + 1; j < map.length; j++) {
      const tokensJ = new Set([map[j].projectId, map[j].currentName, ...map[j].aliases]);
      for (const t of tokensI) {
        if (tokensJ.has(t)) {
          throw new Error(`Token overlap between projects: '${t}'.`);
        }
      }
    }
  }

  return true;
}

// Registry validation
export function validateRegistry(registry) {
  if (!Array.isArray(registry)) {
    throw new Error("Registry must be an array of event objects.");
  }

  const seenIds = new Set();

  for (const entry of registry) {
    if (typeof entry !== "object" || entry === null) {
      throw new Error("Each registry entry must be an object.");
    }

    const { eventId, sourceProject, sourceSystem, sourceLocator, historicalLocatorState, historicalLocator } = entry;

    // 1. Event ID validation
    if (typeof eventId !== "string" || !/^EV-[A-Z]{2,4}-[0-9]{3,5}$/.test(eventId)) {
      throw new Error(`Invalid eventId syntax: '${eventId}'.`);
    }

    if (seenIds.has(eventId)) {
      throw new Error(`Duplicate eventId in registry: '${eventId}'.`);
    }
    seenIds.add(eventId);

    // 2. Project Prefix Binding
    if (typeof sourceProject !== "string" || !sourceProject) {
      throw new Error("Missing or invalid sourceProject.");
    }

    const resolvedProject = PROJECT_NAMESPACE_MAP.find(p =>
      p.projectId === sourceProject || p.currentName === sourceProject || p.aliases.includes(sourceProject)
    );

    if (!resolvedProject) {
      throw new Error(`Unresolved sourceProject: '${sourceProject}'.`);
    }

    const eventPrefix = eventId.split("-")[1];
    if (eventPrefix !== resolvedProject.prefix) {
      throw new Error(`EVENT_PROJECT_PREFIX_MISMATCH: Event ID prefix '${eventPrefix}' does not match project prefix '${resolvedProject.prefix}' for project '${sourceProject}'.`);
    }

    // 3. Supported Source System taxonomy
    if (!VALID_SOURCE_SYSTEMS.has(sourceSystem)) {
      throw new Error(`UNSUPPORTED_SOURCE_SYSTEM: '${sourceSystem}'.`);
    }

    if (typeof sourceLocator !== "string" || !sourceLocator) {
      throw new Error("Missing or invalid sourceLocator.");
    }

    // 4. Historical Locator States
    if (!VALID_HISTORICAL_LOCATOR_STATES.has(historicalLocatorState)) {
      throw new Error(`Invalid historicalLocatorState: '${historicalLocatorState}'.`);
    }

    if (historicalLocatorState === "AVAILABLE") {
      if (typeof historicalLocator !== "string" || !historicalLocator) {
        throw new Error("historicalLocator must be a non-empty string when historicalLocatorState is AVAILABLE.");
      }
    } else {
      if (historicalLocator !== null) {
        throw new Error(`historicalLocator must be null when historicalLocatorState is '${historicalLocatorState}'.`);
      }
    }
  }

  return true;
}

// Manifest validation
export function validateManifest(manifest, registry) {
  if (!Array.isArray(manifest)) {
    throw new Error("Manifest must be an array.");
  }

  // Validate registry first
  validateRegistry(registry);

  const registryMap = new Map(registry.map(e => [e.eventId, e]));
  const seenManifestIds = new Set();

  for (const entry of manifest) {
    if (typeof entry !== "object" || entry === null) {
      throw new Error("Each manifest entry must be an object.");
    }

    const {
      eventId,
      sourceSystem,
      sourceLocator,
      historicalLocatorState,
      historicalLocator,
      localVerificationState,
      integrityEvidenceType,
      integrityEvidenceValue,
      capturedAt
    } = entry;

    if (typeof eventId !== "string") {
      throw new Error("Missing or invalid eventId in manifest.");
    }

    if (seenManifestIds.has(eventId)) {
      throw new Error(`Duplicate eventId in manifest: '${eventId}'.`);
    }
    seenManifestIds.add(eventId);

    const regEntry = registryMap.get(eventId);
    if (!regEntry) {
      throw new Error(`Orphan manifest entry found (no matching registry event): '${eventId}'.`);
    }

    // Ensure metadata match exactly between registry and manifest
    if (sourceSystem !== regEntry.sourceSystem) {
      throw new Error(`sourceSystem mismatch for '${eventId}': registry='${regEntry.sourceSystem}', manifest='${sourceSystem}'.`);
    }
    if (sourceLocator !== regEntry.sourceLocator) {
      throw new Error(`sourceLocator mismatch for '${eventId}'.`);
    }
    if (historicalLocatorState !== regEntry.historicalLocatorState) {
      throw new Error(`historicalLocatorState mismatch for '${eventId}'.`);
    }
    if (historicalLocator !== regEntry.historicalLocator) {
      throw new Error(`historicalLocator mismatch for '${eventId}'.`);
    }

    // Validate localVerificationState
    if (!VALID_LOCAL_VERIFICATION_STATES.has(localVerificationState)) {
      throw new Error(`Invalid localVerificationState: '${localVerificationState}'.`);
    }

    // Integrity evidence checks
    if (localVerificationState === "AVAILABLE") {
      if (integrityEvidenceType !== "sha256") {
        throw new Error(`integrityEvidenceType must be sha256 when localVerificationState is AVAILABLE.`);
      }
      if (typeof integrityEvidenceValue !== "string" || !/^[a-f0-9]{64}$/.test(integrityEvidenceValue)) {
        throw new Error(`integrityEvidenceValue must be a 64-char lowercase hex string for event '${eventId}'.`);
      }
    } else {
      if (integrityEvidenceType !== null || integrityEvidenceValue !== null) {
        throw new Error(`Integrity evidence must be null when localVerificationState is '${localVerificationState}'.`);
      }
    }

    // Matrix validations
    if (!isValidSourceLocalPair(sourceSystem, localVerificationState)) {
      throw new Error(`Invalid sourceSystem × localVerificationState combination: '${sourceSystem}' with '${localVerificationState}'.`);
    }

    if (!isValidHistoricalLocalPair(historicalLocatorState, localVerificationState)) {
      throw new Error(`Invalid historicalLocatorState × localVerificationState combination: '${historicalLocatorState}' with '${localVerificationState}'.`);
    }

    // capturedAt parsing check
    if (typeof capturedAt !== "string" || isNaN(Date.parse(capturedAt))) {
      throw new Error(`Invalid capturedAt timestamp: '${capturedAt}'.`);
    }
  }

  // Cardinality checks: manifest size must match registry size
  if (seenManifestIds.size < registryMap.size) {
    // Missing entries
    for (const registryId of registryMap.keys()) {
      if (!seenManifestIds.has(registryId)) {
        throw new Error(`Missing manifest entry for registry event: '${registryId}'.`);
      }
    }
  }

  return true;
}

// Clearance validation
export function validateClearances(clearances) {
  if (!Array.isArray(clearances)) {
    throw new Error("Clearances must be an array.");
  }

  for (const entry of clearances) {
    if (typeof entry !== "object" || entry === null) {
      throw new Error("Each clearance entry must be an object.");
    }

    const {
      eventId,
      resolutionState,
      clearanceScope,
      subjectType,
      subjectId,
      reviewType,
      result,
      reviewReference,
      reviewedAt,
      reviewerOrRole,
      clearanceState,
      evidenceFingerprint
    } = entry;

    if (typeof eventId !== "string" || !/^EV-[A-Z]{2,4}-[0-9]{3,5}$/.test(eventId)) {
      throw new Error(`Invalid eventId: '${eventId}'.`);
    }

    if (!HUMAN_CLEARABLE_RESOLUTIONS.has(resolutionState)) {
      throw new Error(`Invalid resolutionState: '${resolutionState}'.`);
    }

    if (clearanceScope !== "EVENT" && clearanceScope !== "ARTICLE_EVENT") {
      throw new Error(`Invalid clearanceScope: '${clearanceScope}'.`);
    }

    // Scope Binding
    if (resolutionState === "FIDELITY_UNCONFIRMED") {
      if (clearanceScope !== "ARTICLE_EVENT") {
        throw new Error("FIDELITY_UNCONFIRMED requires ARTICLE_EVENT clearance scope.");
      }
    } else {
      if (clearanceScope !== "EVENT") {
        throw new Error(`Resolution state '${resolutionState}' requires EVENT clearance scope.`);
      }
    }

    // Subject conditional
    if (clearanceScope === "EVENT") {
      if (subjectType !== null || subjectId !== null) {
        throw new Error("EVENT-scoped clearances must have null subjectType and subjectId.");
      }
    } else if (clearanceScope === "ARTICLE_EVENT") {
      if (subjectType !== "learning-article") {
        throw new Error("ARTICLE_EVENT-scoped clearances must have subjectType 'learning-article'.");
      }
      if (typeof subjectId !== "string" || !/^src\/content\/learning\/[a-z0-9-_.]+\.md$/.test(subjectId)) {
        throw new Error(`Invalid subjectId: '${subjectId}'. Must be a repository-relative path under src/content/learning/.`);
      }
    }

    if (typeof reviewType !== "string" || !reviewType) {
      throw new Error("Missing or invalid reviewType.");
    }

    if (typeof result !== "string" || !result) {
      throw new Error("Missing or invalid result.");
    }

    // Review Reference check
    if (typeof reviewReference !== "string" || !/^stewardship\/reviews\/[a-z0-9-]+\.review\.md$/.test(reviewReference)) {
      throw new Error(`Invalid reviewReference format: '${reviewReference}'. Must be repository-relative stewardship/reviews/*.review.md.`);
    }

    if (typeof reviewedAt !== "string" || isNaN(Date.parse(reviewedAt))) {
      throw new Error(`Invalid reviewedAt date: '${reviewedAt}'.`);
    }

    if (typeof reviewerOrRole !== "string" || !reviewerOrRole) {
      throw new Error("Missing or invalid reviewerOrRole.");
    }

    if (typeof clearanceState !== "string" || !clearanceState) {
      throw new Error("Missing or invalid clearanceState.");
    }

    // Evidence Fingerprint check
    if (typeof evidenceFingerprint !== "string" || !/^[a-f0-9]{64}$/.test(evidenceFingerprint)) {
      throw new Error(`Invalid evidenceFingerprint format: '${evidenceFingerprint}'.`);
    }
  }

  return true;
}
