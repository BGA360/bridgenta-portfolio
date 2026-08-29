import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const M5_SYSTEM_REASON_ORDER = [
  "M5_EVALUATION_ERROR",
  "M5_DEPENDENCY_UNAVAILABLE",
  "M5_INPUT_STATE_UNVERIFIABLE",
  "M5_CONFIGURATION_INVALID",
  "M5_POLICY_VERSION_UNAVAILABLE",
  "M5_HISTORICAL_RULE_UNAVAILABLE"
];

export function sortM5Reasons(reasons) {
  reasons.sort((a, b) => {
    const idxA = M5_SYSTEM_REASON_ORDER.indexOf(a);
    const idxB = M5_SYSTEM_REASON_ORDER.indexOf(b);
    const posA = idxA === -1 ? M5_SYSTEM_REASON_ORDER.length : idxA;
    const posB = idxB === -1 ? M5_SYSTEM_REASON_ORDER.length : idxB;
    return posA - posB;
  });
  return reasons;
}

export function evaluateM5Decision(articleReadiness, options = {}) {
  const policyVersion = options.policyVersion || "M5-POLICY-1.0";
  const evaluatorVersion = options.evaluatorVersion || "M5-EVALUATOR-1.0";
  const implementationIdentity = options.implementationIdentity;
  const implementationIdentityScheme = options.implementationIdentityScheme || "M5-SOURCE-HASH-1";
  const repositoryCommit = options.repositoryCommit;

  if (!implementationIdentity) {
    throw new Error("Missing implementationIdentity.");
  }
  if (!repositoryCommit) {
    throw new Error("Missing repositoryCommit.");
  }

  const decisionRecord = {
    subjectType: articleReadiness.subjectType || "learning-article",
    subjectId: articleReadiness.subjectId || null,
    provenanceRef: articleReadiness.provenanceRef || null,
    repositoryCommit: repositoryCommit,
    b5ReadinessState: articleReadiness.readinessState || null,
    m5Decision: "NOT_EVALUATED",
    b5ReasonCodes: articleReadiness.reasons ? [...articleReadiness.reasons] : [],
    m5ReasonCodes: [],
    policyVersion,
    evaluatorVersion,
    implementationIdentity,
    implementationIdentityScheme,
    decisionFinality: "FINAL"
  };

  // 1. Historical Replay check
  if (options.isHistoricalReplay) {
    if (policyVersion !== "M5-POLICY-1.0" || evaluatorVersion !== "M5-EVALUATOR-1.0") {
      decisionRecord.m5Decision = "NOT_EVALUATED";
      decisionRecord.historicalReplayDecision = "REFUSED";
      decisionRecord.m5ReasonCodes.push("M5_HISTORICAL_RULE_UNAVAILABLE");
      return decisionRecord;
    }
  }

  // 2. Validate readinessState input
  const b5State = articleReadiness.readinessState;
  const validB5States = new Set(["READY_UNCLEARED", "READY_BY_CLEARANCE", "NOT_READY"]);

  if (!validB5States.has(b5State)) {
    decisionRecord.m5Decision = "NOT_EVALUATED";
    decisionRecord.m5ReasonCodes.push("M5_CONFIGURATION_INVALID");
    return decisionRecord;
  }

  // 3. Mapping B5 to M5
  if (b5State === "READY_UNCLEARED" || b5State === "READY_BY_CLEARANCE") {
    decisionRecord.m5Decision = "ELIGIBLE";
  } else if (b5State === "NOT_READY") {
    decisionRecord.m5Decision = "WITHHELD";
  }

  if (articleReadiness.clearanceApplied !== undefined) {
    decisionRecord.clearanceApplied = !!articleReadiness.clearanceApplied;
  }

  return decisionRecord;
}

export function mapSystemFailure(articleReadiness, failureClass, options = {}) {
  const policyVersion = options.policyVersion || "M5-POLICY-1.0";
  const evaluatorVersion = options.evaluatorVersion || "M5-EVALUATOR-1.0";
  const implementationIdentity = options.implementationIdentity || null;
  const implementationIdentityScheme = options.implementationIdentityScheme || "M5-SOURCE-HASH-1";
  const repositoryCommit = options.repositoryCommit || null;

  if (!implementationIdentity) {
    if (failureClass !== "M5_INPUT_STATE_UNVERIFIABLE") {
      throw new Error(`Missing implementationIdentity for failure class: ${failureClass}`);
    }
  }

  const VALID_M5_SYSTEM_REASONS = new Set(M5_SYSTEM_REASON_ORDER);
  if (!VALID_M5_SYSTEM_REASONS.has(failureClass)) {
    throw new Error(`Invalid M5 system failure class: ${failureClass}`);
  }

  const decisionRecord = {
    subjectType: articleReadiness ? (articleReadiness.subjectType || "learning-article") : "learning-article",
    subjectId: articleReadiness ? (articleReadiness.subjectId || null) : null,
    provenanceRef: articleReadiness ? (articleReadiness.provenanceRef || null) : null,
    repositoryCommit: repositoryCommit,
    b5ReadinessState: articleReadiness ? (articleReadiness.readinessState || null) : null,
    m5Decision: "SYSTEM_UNAVAILABLE",
    b5ReasonCodes: articleReadiness && articleReadiness.reasons ? [...articleReadiness.reasons] : [],
    m5ReasonCodes: [failureClass],
    policyVersion,
    evaluatorVersion,
    implementationIdentity,
    implementationIdentityScheme,
    decisionFinality: implementationIdentity ? "FINAL" : "NON_FINALIZABLE"
  };

  return decisionRecord;
}

export function validateSourceLocator(sourceLocator, sourceSystem, repositoryRoot) {
  const VALID_SOURCE_SYSTEMS = new Set([
    "git",
    "versioned-filesystem",
    "dms",
    "issue-tracker",
    "ci-artifact",
    "archive",
    "structured-doc"
  ]);

  if (!VALID_SOURCE_SYSTEMS.has(sourceSystem)) {
    return "INVALID_LOCATOR";
  }

  if (sourceSystem !== "git") {
    if (sourceSystem === "versioned-filesystem") {
      return "UNSUPPORTED_LOCAL_RESOLUTION";
    }
    return "EXTERNAL_LOCATOR";
  }

  if (typeof sourceLocator !== "string" || !sourceLocator.trim()) {
    return "INVALID_LOCATOR";
  }

  if (sourceLocator.includes("\0")) {
    return "INVALID_LOCATOR";
  }

  if (sourceLocator.startsWith("\\\\") || sourceLocator.startsWith("//")) {
    return "OUTSIDE_ALLOWED_ROOT";
  }

  if (path.isAbsolute(sourceLocator)) {
    return "OUTSIDE_ALLOWED_ROOT";
  }

  if (/^[a-zA-Z]:/.test(sourceLocator)) {
    return "OUTSIDE_ALLOWED_ROOT";
  }

  const candidatePath = path.resolve(repositoryRoot, sourceLocator);

  const relativeLexical = path.relative(path.resolve(repositoryRoot), candidatePath);
  if (relativeLexical.startsWith("..") || path.isAbsolute(relativeLexical)) {
    return "OUTSIDE_ALLOWED_ROOT";
  }

  try {
    if (!fs.existsSync(candidatePath)) {
      return "TARGET_NOT_FOUND";
    }

    const canonicalRoot = fs.realpathSync(repositoryRoot);
    const canonicalTarget = fs.realpathSync(candidatePath);

    const relativeCanonical = path.relative(canonicalRoot, canonicalTarget);
    if (relativeCanonical.startsWith("..") || path.isAbsolute(relativeCanonical)) {
      return "OUTSIDE_ALLOWED_ROOT";
    }

    const stat = fs.statSync(canonicalTarget);
    if (!stat.isFile()) {
      return "TARGET_NOT_FILE";
    }

    return "VALID_LOCAL_LOCATOR";
  } catch (err) {
    if (err.code === "ENOENT") {
      return "TARGET_NOT_FOUND";
    }
    return "RESOLUTION_ERROR";
  }
}

export function serializeDecisionRecord(decisionRecord) {
  const finality = decisionRecord.decisionFinality;
  if (finality !== "FINAL" && finality !== "NON_FINALIZABLE") {
    throw new Error(`Invalid or missing decisionFinality value: ${finality}`);
  }

  if (decisionRecord.b5ReasonCodes) {
    const ORDERED_REASONS = [
      "MISSING_PROVENANCE_REF",
      "INVALID_PROVENANCE_REF_SYNTAX",
      "UNKNOWN_EVENT",
      "REGISTRY_INVALID",
      "MANIFEST_INVALID",
      "SOURCE_FIDELITY_MISSING",
      "MULTIPLE_SOURCE_FIDELITY_REVIEWS",
      "SOURCE_FIDELITY_NOT_PASS",
      "SOURCE_FIDELITY_EVIDENCE_MISSING",
      "SOURCE_FIDELITY_EVIDENCE_AMBIGUOUS",
      "RUNTIME_NOT_PASS",
      "CLEARANCE_INEFFECTIVE"
    ];
    decisionRecord.b5ReasonCodes.sort((a, b) => {
      const idxA = ORDERED_REASONS.indexOf(a);
      const idxB = ORDERED_REASONS.indexOf(b);
      const posA = idxA === -1 ? ORDERED_REASONS.length : idxA;
      const posB = idxB === -1 ? ORDERED_REASONS.length : idxB;
      return posA - posB;
    });
  }

  if (decisionRecord.m5ReasonCodes) {
    sortM5Reasons(decisionRecord.m5ReasonCodes);
  }

  const orderedPayload = {
    subjectType: decisionRecord.subjectType,
    subjectId: decisionRecord.subjectId,
    provenanceRef: decisionRecord.provenanceRef,
    repositoryCommit: decisionRecord.repositoryCommit,
    b5ReadinessState: decisionRecord.b5ReadinessState,
    m5Decision: decisionRecord.m5Decision,
    b5ReasonCodes: decisionRecord.b5ReasonCodes,
    m5ReasonCodes: decisionRecord.m5ReasonCodes,
    policyVersion: decisionRecord.policyVersion,
    evaluatorVersion: decisionRecord.evaluatorVersion,
    implementationIdentity: decisionRecord.implementationIdentity,
    implementationIdentityScheme: decisionRecord.implementationIdentityScheme !== undefined ? decisionRecord.implementationIdentityScheme : null,
    decisionFinality: finality
  };

  if (decisionRecord.historicalReplayDecision !== undefined) {
    orderedPayload.historicalReplayDecision = decisionRecord.historicalReplayDecision;
  }
  if (decisionRecord.clearanceApplied !== undefined) {
    orderedPayload.clearanceApplied = decisionRecord.clearanceApplied;
  }

  const jsonString = JSON.stringify(orderedPayload, Object.keys(orderedPayload).sort());
  return jsonString;
}

export function computeDecisionRecordHash(decisionRecord) {
  const jsonString = serializeDecisionRecord(decisionRecord);
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}
