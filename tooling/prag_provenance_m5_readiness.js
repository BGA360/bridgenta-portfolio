import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  resolveRepositoryCommit,
  computeM5ImplementationIdentity
} from "./prag_provenance_identity.js";

/**
 * Structural and cryptographic validation of a shadow observation report.
 * @param {any} report 
 * @returns {{ valid: boolean, reason?: string, observation?: any, hash?: string }}
 */
export function validateObservationReport(report) {
  const observation = report.observation || report;
  const recordedHash = report.observationHash || report.observation?.observationHash || null;

  if (!observation || typeof observation !== "object") {
    return { valid: false, reason: "INVALID_STRUCTURE" };
  }

  const {
    observationHash,
    repositoryCommit,
    policyVersion,
    evaluatorVersion,
    implementationIdentity,
    implementationIdentityScheme,
    observationMode,
    schemaVersion
  } = observation;

  const targetHash = recordedHash || observationHash;

  if (!targetHash || !repositoryCommit || !policyVersion || !evaluatorVersion || !observationMode || !schemaVersion) {
    return { valid: false, reason: "MISSING_REQUIRED_FIELDS" };
  }

  if (observationMode !== "SHADOW") {
    return { valid: false, reason: "INVALID_OBSERVATION_MODE" };
  }

  if (schemaVersion !== "M5-OBSERVATION-1.0") {
    return { valid: false, reason: "UNSUPPORTED_SCHEMA_VERSION" };
  }

  // Recompute observationHash to verify integrity
  const payloadToHash = {};
  for (const k of Object.keys(observation).sort()) {
    if (k !== "observationHash") {
      payloadToHash[k] = observation[k];
    }
  }

  const serialized = JSON.stringify(payloadToHash);
  const computedHash = crypto.createHash("sha256").update(serialized).digest("hex");

  if (computedHash !== targetHash) {
    return { valid: false, reason: "OBSERVATION_HASH_MISMATCH" };
  }

  payloadToHash.observationHash = targetHash;
  if (implementationIdentityScheme !== undefined) {
    payloadToHash.implementationIdentityScheme = implementationIdentityScheme;
  }
  return { valid: true, observation: payloadToHash, hash: targetHash };
}

/**
 * Groups observations by stability segment (same policy, evaluator, scheme, and implementation identity).
 * @param {any[]} observations 
 * @returns {any[]}
 */
export function buildStabilitySegments(observations) {
  const segmentsMap = new Map();
  for (const obs of observations) {
    const scheme = obs.implementationIdentityScheme || "LEGACY_UNDECLARED";
    const segKey = `${obs.policyVersion}|${obs.evaluatorVersion}|${scheme}|${obs.implementationIdentity}`;
    if (!segmentsMap.has(segKey)) {
      segmentsMap.set(segKey, []);
    }
    segmentsMap.get(segKey).push(obs);
  }

  const stabilitySegments = [];
  for (const [segKey, obsList] of segmentsMap.entries()) {
    const uniqueCommits = Array.from(new Set(obsList.map(o => o.repositoryCommit))).sort();
    const [policy, evaluator, scheme, identity] = segKey.split("|");
    
    obsList.sort((a, b) => a.observationHash.localeCompare(b.observationHash));

    stabilitySegments.push({
      policyVersion: policy,
      evaluatorVersion: evaluator,
      implementationIdentityScheme: scheme,
      implementationIdentity: identity === "null" ? null : identity,
      observationCount: obsList.length,
      uniqueRepositorySnapshots: uniqueCommits.length,
      observationHashes: obsList.map(o => o.observationHash),
      repositoryCommits: uniqueCommits
    });
  }

  stabilitySegments.sort((a, b) => {
    let cmp = a.policyVersion.localeCompare(b.policyVersion);
    if (cmp !== 0) return cmp;
    cmp = a.evaluatorVersion.localeCompare(b.evaluatorVersion);
    if (cmp !== 0) return cmp;
    cmp = a.implementationIdentityScheme.localeCompare(b.implementationIdentityScheme);
    if (cmp !== 0) return cmp;
    return (a.implementationIdentity || "").localeCompare(b.implementationIdentity || "");
  });

  return stabilitySegments;
}

/**
 * Performs readiness assessment based on candidate identity and ingested observations.
 * @param {any[]} observations 
 * @param {{ policyVersion: string, evaluatorVersion: string, implementationIdentityScheme: string, implementationIdentity: string|null, currentRepositoryCommit?: string|null }} candidateInfo 
 * @param {string} workspaceRoot 
 * @param {any} policyOptions 
 * @returns {any}
 */
export function evaluateEnforcementReadiness(observations, candidateInfo, workspaceRoot, policyOptions = {}) {
  const requiredObservationCount = policyOptions.requiredObservationCount || 10;
  const requiredUniqueRepositorySnapshots = policyOptions.requiredUniqueRepositorySnapshots || 5;
  const systemUnavailableRateThreshold = policyOptions.systemUnavailableRateThreshold || 0;
  const notEvaluatedRateThreshold = policyOptions.notEvaluatedRateThreshold || 0;

  const {
    policyVersion: candidatePolicy,
    evaluatorVersion: candidateEvaluator,
    implementationIdentityScheme: candidateScheme,
    implementationIdentity: candidateIdentity
  } = candidateInfo;

  const stabilitySegments = buildStabilitySegments(observations);

  // Ingest unique observations by hash to avoid duplicate counts
  const uniqueObsMap = new Map();
  for (const obs of observations) {
    uniqueObsMap.set(obs.observationHash, obs);
  }
  const uniqueObservations = Array.from(uniqueObsMap.values());

  // Filter observations matching the candidate segment
  const candidateObsList = uniqueObservations.filter(obs => 
    obs.policyVersion === candidatePolicy &&
    obs.evaluatorVersion === candidateEvaluator &&
    (obs.implementationIdentityScheme || "LEGACY_UNDECLARED") === candidateScheme &&
    obs.implementationIdentity === candidateIdentity
  );

  const eligibleObservationCount = candidateObsList.length;
  const uniqueRepositorySnapshots = Array.from(new Set(candidateObsList.map(o => o.repositoryCommit))).length;

  let shadowPassCount = 0;
  let shadowAttentionCount = 0;
  let shadowSystemUnavailableCount = 0;
  let shadowNotEvaluatedCount = 0;

  for (const obs of candidateObsList) {
    if (obs.shadowGateResult === "SHADOW_PASS") shadowPassCount++;
    else if (obs.shadowGateResult === "SHADOW_ATTENTION") shadowAttentionCount++;
    else if (obs.shadowGateResult === "SHADOW_SYSTEM_UNAVAILABLE") shadowSystemUnavailableCount++;
    else if (obs.shadowGateResult === "SHADOW_NOT_EVALUATED") shadowNotEvaluatedCount++;
  }

  const systemUnavailableRate = eligibleObservationCount > 0 ? shadowSystemUnavailableCount / eligibleObservationCount : 0;
  const notEvaluatedRate = eligibleObservationCount > 0 ? shadowNotEvaluatedCount / eligibleObservationCount : 0;

  const determinismFailures = [];
  const versionCoherenceFailures = [];
  const cardinalityFailures = [];
  const warnings = [];
  const blockingReasons = [];

  // Determinism check (on all observations with same commit, versions, scheme, identity)
  const determinismMap = new Map();
  for (const obs of uniqueObservations) {
    const scheme = obs.implementationIdentityScheme || "LEGACY_UNDECLARED";
    const key = `${obs.repositoryCommit}|${obs.policyVersion}|${obs.evaluatorVersion}|${scheme}|${obs.implementationIdentity}`;
    if (!determinismMap.has(key)) {
      determinismMap.set(key, new Set());
    }
    determinismMap.get(key).add(obs.observationHash);
  }
  for (const [key, hashes] of determinismMap.entries()) {
    if (hashes.size > 1) {
      determinismFailures.push(`Commit key ${key} yielded multiple hashes: ${Array.from(hashes).sort().join(", ")}`);
    }
  }

  // Cardinality Invariants check
  for (const obs of candidateObsList) {
    const inv1 = (obs.subjectCount === obs.articleResults?.length);
    const inv2 = (obs.subjectCount === (obs.eligibleCount + obs.withheldCount + obs.undecidedCount));
    if (!inv1 || !inv2) {
      cardinalityFailures.push(`Cardinality contradiction in observation ${obs.observationHash}`);
    }
  }

  // False positive / unresolved cases analysis
  const unresolvedCases = [];
  const falsePositiveCases = [];
  const falseNegativeCases = [];

  for (const obs of candidateObsList) {
    for (const art of obs.articleResults || []) {
      if (art.publicationEligibility === "PUBLICATION_WITHHELD") {
        const reviewsDir = path.join(workspaceRoot, "stewardship", "reviews");
        let hasReview = false;
        if (fs.existsSync(reviewsDir)) {
          const files = fs.readdirSync(reviewsDir);
          for (const f of files) {
            if (f.endsWith(".review.md")) {
              const content = fs.readFileSync(path.join(reviewsDir, f), "utf-8");
              if (content.includes(art.subjectId)) {
                hasReview = true;
                break;
              }
            }
          }
        }
        if (!hasReview) {
          unresolvedCases.push({
            subjectId: art.subjectId,
            observationHash: obs.observationHash,
            reason: "ATTENTION_CASE_UNREVIEWED"
          });
        }
      }
    }
  }

  if (unresolvedCases.length > 0) {
    warnings.push("ATTENTION_CASES_UNREVIEWED");
  }

  // Build blocking reasons
  if (determinismFailures.length > 0) {
    blockingReasons.push("DETERMINISM_FAILURE");
  }
  if (cardinalityFailures.length > 0) {
    blockingReasons.push("CARDINALITY_INVARIANT_FAILURE");
  }
  if (systemUnavailableRate > systemUnavailableRateThreshold) {
    blockingReasons.push("SYSTEM_UNAVAILABLE_ABOVE_THRESHOLD");
  }
  if (notEvaluatedRate > notEvaluatedRateThreshold) {
    blockingReasons.push("NOT_EVALUATED_ABOVE_THRESHOLD");
  }

  // Assessment state mapping logic
  let assessmentState = "INSUFFICIENT_EVIDENCE";
  const meetsMinEvidence = (eligibleObservationCount >= requiredObservationCount && uniqueRepositorySnapshots >= requiredUniqueRepositorySnapshots);

  if (blockingReasons.length > 0) {
    assessmentState = "ENFORCEMENT_NOT_READY";
  } else if (!meetsMinEvidence) {
    assessmentState = "INSUFFICIENT_EVIDENCE";
  } else {
    assessmentState = "ENFORCEMENT_READY";
  }

  // Canonical sorting for arrays
  const sourceObservationHashes = Array.from(new Set(candidateObsList.map(o => o.observationHash))).sort();
  const sourceRepositoryCommits = Array.from(new Set(candidateObsList.map(o => o.repositoryCommit))).sort();
  blockingReasons.sort();
  warnings.sort();
  determinismFailures.sort();
  cardinalityFailures.sort();

  unresolvedCases.sort((a, b) => a.subjectId.localeCompare(b.subjectId) || a.observationHash.localeCompare(b.observationHash));
  falsePositiveCases.sort((a, b) => a.subjectId.localeCompare(b.subjectId) || a.observationHash.localeCompare(b.observationHash));
  falseNegativeCases.sort((a, b) => a.subjectId.localeCompare(b.subjectId) || a.observationHash.localeCompare(b.observationHash));

  const assessment = {
    schemaVersion: "M5-READINESS-ASSESSMENT-1.0",
    assessmentMode: "READINESS_ONLY",
    assessmentState,
    windowPolicy: {
      requiredObservationCount,
      requiredUniqueRepositorySnapshots,
      systemUnavailableRateThreshold,
      notEvaluatedRateThreshold
    },
    currentRepositoryCommit: candidateInfo.currentRepositoryCommit || null,
    eligibleObservationCount,
    requiredObservationCount,
    shadowPassCount,
    shadowAttentionCount,
    shadowSystemUnavailableCount,
    shadowNotEvaluatedCount,
    systemUnavailableRate,
    notEvaluatedRate,
    determinismFailures,
    versionCoherenceFailures,
    cardinalityFailures,
    falsePositiveCases,
    falseNegativeCases,
    unresolvedCases,
    blockingReasons,
    warnings,
    sourceObservationHashes,
    sourceRepositoryCommits,
    stabilitySegments
  };

  const assessmentHash = computeReadinessAssessmentHash(assessment);
  assessment.assessmentHash = assessmentHash;

  return assessment;
}

/**
 * Computes deterministic SHA-256 hash of assessment payload.
 * @param {any} assessment 
 * @returns {string}
 */
export function computeReadinessAssessmentHash(assessment) {
  const payloadToHash = {
    schemaVersion: assessment.schemaVersion,
    assessmentMode: assessment.assessmentMode,
    assessmentState: assessment.assessmentState,
    windowPolicy: assessment.windowPolicy,
    eligibleObservationCount: assessment.eligibleObservationCount,
    requiredObservationCount: assessment.requiredObservationCount,
    shadowPassCount: assessment.shadowPassCount,
    shadowAttentionCount: assessment.shadowAttentionCount,
    shadowSystemUnavailableCount: assessment.shadowSystemUnavailableCount,
    shadowNotEvaluatedCount: assessment.shadowNotEvaluatedCount,
    systemUnavailableRate: assessment.systemUnavailableRate,
    notEvaluatedRate: assessment.notEvaluatedRate,
    determinismFailures: assessment.determinismFailures,
    versionCoherenceFailures: assessment.versionCoherenceFailures,
    cardinalityFailures: assessment.cardinalityFailures,
    falsePositiveCases: assessment.falsePositiveCases,
    falseNegativeCases: assessment.falseNegativeCases,
    unresolvedCases: assessment.unresolvedCases,
    blockingReasons: assessment.blockingReasons,
    warnings: assessment.warnings,
    sourceObservationHashes: assessment.sourceObservationHashes,
    sourceRepositoryCommits: assessment.sourceRepositoryCommits,
    stabilitySegments: assessment.stabilitySegments
  };

  const sortedPayload = {};
  for (const k of Object.keys(payloadToHash).sort()) {
    sortedPayload[k] = payloadToHash[k];
  }

  const serialized = JSON.stringify(sortedPayload);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

// Helper to resolve fileURLToPath if needed
function fileURLToPathLocal(url) {
  if (url.startsWith("file://")) {
    return fileURLToPath(url);
  }
  return url;
}

function getJsonFilesRecursive(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsonFilesRecursive(filePath));
    } else if (file.endsWith(".json")) {
      results.push(filePath);
    }
  }
  return results;
}

function validateShadowHistoryRelPath(relFromM5Shadow, observation, hash) {
  const normalized = relFromM5Shadow.replace(/\\/g, "/");
  const segments = normalized.split("/");
  if (segments.length !== 2) {
    return false;
  }
  const [dirCommit, fileName] = segments;
  if (!dirCommit || !fileName.endsWith(".json")) {
    return false;
  }
  return dirCommit === observation.repositoryCommit && fileName === `${hash}.json`;
}

function ingestLocalReports(reportsDir) {
  const recordsByHash = new Map();
  const hashMismatchFiles = [];

  if (!fs.existsSync(reportsDir)) {
    return { recordsByHash, hashMismatchFiles };
  }

  const addRecord = (obs, hash, label) => {
    const existing = recordsByHash.get(hash);
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(obs)) {
        hashMismatchFiles.push(label);
      }
      return;
    }
    recordsByHash.set(hash, obs);
  };

  const files = fs.readdirSync(reportsDir);
  for (const file of files) {
    if (file.endsWith(".json") && (file === "m5-ci-shadow-observation.json" || file.startsWith("m5-ci-shadow-observation"))) {
      const filePath = path.join(reportsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      try {
        const report = JSON.parse(content);
        const valRes = validateObservationReport(report);
        if (valRes.valid) {
          addRecord(valRes.observation, valRes.hash, file);
        } else {
          hashMismatchFiles.push(file);
        }
      } catch (e) {
        hashMismatchFiles.push(file);
      }
    }
  }

  const historyDir = path.join(reportsDir, "history");
  if (fs.existsSync(historyDir)) {
    const histFiles = fs.readdirSync(historyDir);
    for (const file of histFiles) {
      if (file.endsWith(".json")) {
        const filePath = path.join(historyDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        try {
          const report = JSON.parse(content);
          const valRes = validateObservationReport(report);
          if (valRes.valid) {
            addRecord(valRes.observation, valRes.hash, file);
          } else {
            hashMismatchFiles.push(file);
          }
        } catch (e) {
          hashMismatchFiles.push(file);
        }
      }
    }
  }

  const m5ShadowHistoryDir = path.join(reportsDir, "history", "m5-shadow");
  if (fs.existsSync(m5ShadowHistoryDir)) {
    const histFiles = getJsonFilesRecursive(m5ShadowHistoryDir);
    for (const filePath of histFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const relativeName = path.relative(m5ShadowHistoryDir, filePath).replace(/\\/g, "/");
      try {
        const report = JSON.parse(content);
        const valRes = validateObservationReport(report);
        if (valRes.valid && validateShadowHistoryRelPath(relativeName, valRes.observation, valRes.hash)) {
          addRecord(valRes.observation, valRes.hash, relativeName);
        } else {
          hashMismatchFiles.push(relativeName);
        }
      } catch (e) {
        hashMismatchFiles.push(relativeName);
      }
    }
  }

  return { recordsByHash, hashMismatchFiles };
}

/**
 * Resolves M5 history records from local workspace and (in authoritative mode) remote m5-history branch.
 * Fails closed if authoritative mode cannot verify/fetch m5-history.
 * @param {string} workspaceRoot
 * @param {{ offlineLocal?: boolean, remoteName?: string, historyBranch?: string, skipRemoteFetch?: boolean }} [options]
 * @returns {{ mode: "AUTHORITATIVE"|"OFFLINE_LOCAL", observations: any[], hashMismatchFiles: string[], warnings: string[] }}
 */
export function resolveHistoryRecords(workspaceRoot, options = {}) {
  const offlineLocal = Boolean(options.offlineLocal);
  const remoteName = options.remoteName || "origin";
  const historyBranch = options.historyBranch || "m5-history";
  const skipRemoteFetch = Boolean(options.skipRemoteFetch);

  const reportsDir = path.join(workspaceRoot, "stewardship", "reports");
  const { recordsByHash, hashMismatchFiles } = ingestLocalReports(reportsDir);
  const warnings = [];

  if (offlineLocal) {
    warnings.push("OFFLINE_LOCAL_HISTORY_ONLY");
    return {
      mode: "OFFLINE_LOCAL",
      observations: Array.from(recordsByHash.values()),
      hashMismatchFiles,
      warnings
    };
  }

  const trackingRef = `refs/remotes/${remoteName}/${historyBranch}`;
  const runGit = (args) => execFileSync("git", args, {
    cwd: workspaceRoot,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (!skipRemoteFetch) {
    let lsRemoteOut;
    try {
      lsRemoteOut = runGit(["ls-remote", "--heads", remoteName, historyBranch]).trim();
    } catch (err) {
      throw new Error(`M5_HISTORY_FETCH_FAILED: Unable to query ${remoteName}/${historyBranch}: ${err.message}`);
    }

    if (!lsRemoteOut) {
      throw new Error(`M5_HISTORY_BRANCH_MISSING: Remote branch ${remoteName}/${historyBranch} does not exist.`);
    }

    try {
      runGit(["fetch", remoteName, `${historyBranch}:${trackingRef}`]);
    } catch (err) {
      throw new Error(`M5_HISTORY_FETCH_FAILED: Failed to fetch ${remoteName}/${historyBranch}: ${err.message}`);
    }
  }

  try {
    runGit(["rev-parse", "--verify", trackingRef]);
  } catch (err) {
    throw new Error(`M5_HISTORY_NOT_FETCHED: Tracking ref ${trackingRef} is not available locally.`);
  }

  const treePrefix = "stewardship/reports/history/m5-shadow";
  const lsTreeOut = runGit(["ls-tree", "-r", "--name-only", trackingRef, "--", treePrefix]).trim();
  const remoteFiles = lsTreeOut ? lsTreeOut.split(/\r?\n/).filter(f => f.endsWith(".json")) : [];

  for (const relPath of remoteFiles) {
    const normalizedRel = relPath.replace(/\\/g, "/");
    const relFromM5Shadow = normalizedRel.startsWith(`${treePrefix}/`)
      ? normalizedRel.slice(treePrefix.length + 1)
      : normalizedRel;
    const content = runGit(["show", `${trackingRef}:${relPath}`]);
    try {
      const report = JSON.parse(content);
      const valRes = validateObservationReport(report);
      if (valRes.valid && validateShadowHistoryRelPath(relFromM5Shadow, valRes.observation, valRes.hash)) {
        const existing = recordsByHash.get(valRes.hash);
        if (existing) {
          if (JSON.stringify(existing) !== JSON.stringify(valRes.observation)) {
            hashMismatchFiles.push(relPath);
          }
        } else {
          recordsByHash.set(valRes.hash, valRes.observation);
        }
      } else {
        hashMismatchFiles.push(relPath);
      }
    } catch (e) {
      hashMismatchFiles.push(relPath);
    }
  }

  return {
    mode: "AUTHORITATIVE",
    observations: Array.from(recordsByHash.values()),
    hashMismatchFiles,
    warnings
  };
}

export function finalizeAssessmentForHistoryMode(assessment, mode, historyWarnings = [], hashMismatchFiles = []) {
  if (historyWarnings.length > 0) {
    assessment.warnings.push(...historyWarnings);
    assessment.warnings = Array.from(new Set(assessment.warnings)).sort();
  }

  if (mode === "OFFLINE_LOCAL") {
    assessment.blockingReasons.push("OFFLINE_LOCAL_NON_AUTHORITATIVE");
    assessment.blockingReasons = Array.from(new Set(assessment.blockingReasons)).sort();
    assessment.assessmentState = "ENFORCEMENT_NOT_READY";
  }

  if (hashMismatchFiles.length > 0) {
    assessment.blockingReasons.push("HISTORICAL_EVIDENCE_CORRUPTION");
    assessment.blockingReasons = Array.from(new Set(assessment.blockingReasons)).sort();
    assessment.warnings.push("EVIDENCE_CORRUPTION_DETECTED");
    assessment.warnings = Array.from(new Set(assessment.warnings)).sort();
    assessment.assessmentState = "ENFORCEMENT_NOT_READY";
  }

  assessment.assessmentHash = computeReadinessAssessmentHash(assessment);
  return assessment;
}

function main() {
  try {
    const workspaceRoot = process.cwd();
    const reportsDir = path.join(workspaceRoot, "stewardship", "reports");
    const offlineLocal = process.argv.includes("--offline-local");

    const repoCommitRes = resolveRepositoryCommit(workspaceRoot);
    const evalIdentityRes = computeM5ImplementationIdentity(workspaceRoot);

    const candidateIdentity = evalIdentityRes.identity || null;
    const currentRepositoryCommit = repoCommitRes.commit || null;

    const candidateInfo = {
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      implementationIdentity: candidateIdentity,
      currentRepositoryCommit
    };

    const {
      mode,
      observations: ingestedReports,
      hashMismatchFiles,
      warnings: historyWarnings
    } = resolveHistoryRecords(workspaceRoot, { offlineLocal });

    const initialPolicy = {
      requiredObservationCount: 10,
      requiredUniqueRepositorySnapshots: 5,
      systemUnavailableRateThreshold: 0,
      notEvaluatedRateThreshold: 0
    };

    const assessment = evaluateEnforcementReadiness(ingestedReports, candidateInfo, workspaceRoot, initialPolicy);
    finalizeAssessmentForHistoryMode(assessment, mode, historyWarnings, hashMismatchFiles);

    const reportPath = path.join(reportsDir, "m5-enforcement-readiness.json");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(assessment, null, 2), "utf-8");

    console.log("=========================================");
    console.log("   M5 ENFORCEMENT READINESS ASSESSMENT   ");
    console.log("=========================================");
    console.log(`History Mode:           ${mode === "OFFLINE_LOCAL" ? "OFFLINE_LOCAL (NON-AUTHORITATIVE)" : mode}`);
    console.log(`Candidate Policy:       ${candidateInfo.policyVersion}`);
    console.log(`Candidate Evaluator:    ${candidateInfo.evaluatorVersion}`);
    console.log(`Candidate Identity:     ${candidateInfo.implementationIdentity}`);
    console.log(`Current commit:         ${candidateInfo.currentRepositoryCommit}`);
    console.log(`Eligible observations:  ${assessment.eligibleObservationCount} / ${assessment.requiredObservationCount} required`);
    console.log(`Unique snapshots:       ${assessment.sourceRepositoryCommits.length} / ${assessment.windowPolicy.requiredUniqueRepositorySnapshots} required`);
    console.log(`Determinism:            ${assessment.determinismFailures.length === 0 ? "PASS" : "FAIL"}`);
    console.log(`System unavailable:     ${assessment.shadowSystemUnavailableCount}`);
    console.log(`Not evaluated:          ${assessment.shadowNotEvaluatedCount}`);
    console.log(`Assessment:             ${assessment.assessmentState}`);
    console.log(`Enforcement:            NOT ACTIVATED`);
    console.log("=========================================");

    process.exitCode = 0;
  } catch (error) {
    console.error("READINESS ASSESSMENT FAILURE:", error);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPathLocal(import.meta.url)) {
  main();
}
