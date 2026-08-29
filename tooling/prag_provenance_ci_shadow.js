import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseFrontmatter } from "./prag_provenance_resolver.js";
import { resolveImplementationIdentity } from "./prag_provenance_identity.js";
import { evaluateReadiness } from "./prag_provenance_readiness.js";
import {
  evaluateM5Decision,
  mapSystemFailure,
  computeDecisionRecordHash
} from "./prag_provenance_m5.js";
import {
  buildPublicationProjection,
  computeProjectionHash
} from "./prag_provenance_projection.js";

/**
 * Discovers expected published subjects from src/content/learning using framework-independent parsing.
 * @param {string} workspaceRoot 
 * @returns {Array<{id: string, data: any}>}
 */
export function getExpectedPublishedArticles(workspaceRoot) {
  const learningDir = path.join(workspaceRoot, "src", "content", "learning");
  if (!fs.existsSync(learningDir)) return [];
  const files = fs.readdirSync(learningDir);
  const articles = [];
  for (const file of files) {
    if (!file.endsWith(".md") || file === ".gitkeep") continue;
    const filePath = path.join(learningDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const fm = parseFrontmatter(content);
    if (fm.publicationState === "published") {
      articles.push({
        id: file,
        data: fm
      });
    }
  }
  return articles;
}

/**
 * Runs the B5 -> M5 -> Projection shadow observation chain.
 * @param {string} workspaceRoot 
 * @returns {{ observation: any, observationHash: string }}
 */
export function evaluateShadowObservation(workspaceRoot) {
  const articles = getExpectedPublishedArticles(workspaceRoot);
  const expectedSubjects = articles.map(art => `src/content/learning/${art.id}`).sort();

  const identityRes = resolveImplementationIdentity();
  const commitSha = identityRes.identity;

  let m5Decisions = [];
  let globalDiagnostics = [];
  let shadowGateResult = "SHADOW_PASS";

  const registryPath = path.join(workspaceRoot, "src", "data", "provenance_registry.json");
  const manifestPath = path.join(workspaceRoot, "src", "data", "local_integrity_manifest.json");
  const clearancesPath = path.join(workspaceRoot, "stewardship", "reviews", "clearances_manifest.json");

  let registry = [];
  let manifest = [];
  let clearances = [];
  let systemErrorClass = null;

  if (identityRes.state === "UNAVAILABLE") {
    systemErrorClass = "M5_INPUT_STATE_UNVERIFIABLE";
  } else {
    try {
      if (fs.existsSync(registryPath)) {
        registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      } else {
        systemErrorClass = "M5_INPUT_STATE_UNVERIFIABLE";
      }
      if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      } else {
        systemErrorClass = "M5_INPUT_STATE_UNVERIFIABLE";
      }
      if (fs.existsSync(clearancesPath)) {
        clearances = JSON.parse(fs.readFileSync(clearancesPath, "utf-8"));
      }
    } catch (e) {
      systemErrorClass = "M5_CONFIGURATION_INVALID";
    }
  }

  if (systemErrorClass) {
    for (const subjId of expectedSubjects) {
      m5Decisions.push(mapSystemFailure({
        subjectId: subjId,
        readinessState: null,
        reasons: []
      }, systemErrorClass, { implementationIdentity: commitSha }));
    }
  } else {
    try {
      const b5Result = evaluateReadiness(workspaceRoot, registry, manifest, clearances);
      for (const b5Art of b5Result.articles) {
        const dec = evaluateM5Decision(b5Art, {
          implementationIdentity: commitSha
        });
        m5Decisions.push(dec);
      }
    } catch (err) {
      for (const subjId of expectedSubjects) {
        m5Decisions.push(mapSystemFailure({
          subjectId: subjId,
          readinessState: null,
          reasons: []
        }, "M5_EVALUATION_ERROR", { implementationIdentity: commitSha }));
      }
    }
  }

  return computeShadowObservationPayload(expectedSubjects, m5Decisions, commitSha, identityRes.state);
}

/**
 * Computes the observation payload and hash from expected subjects and M5 decision records.
 * Useful for framework-independent execution and unit testing diagnostics/failures.
 * @param {string[]} expectedSubjects 
 * @param {any[]} m5Decisions 
 * @param {string|null} commitSha 
 * @param {string} identityState 
 * @returns {{ observation: any, observationHash: string }}
 */
export function computeShadowObservationPayload(expectedSubjects, m5Decisions, commitSha, identityState) {
  // Ensure decisions are ordered by subjectId ascending
  m5Decisions.sort((a, b) => a.subjectId.localeCompare(b.subjectId));

  // Build publication projection
  const projection = buildPublicationProjection({
    expectedSubjects,
    m5DecisionRecords: m5Decisions,
    options: {
      implementationIdentity: commitSha || null,
      identityState: identityState
    }
  });
  const projectionHash = computeProjectionHash(projection);

  // Compute counts
  let subjectCount = expectedSubjects.length;
  let eligibleCount = 0;
  let withheldCount = 0;
  let undecidedCount = 0;

  const articleResults = [];
  const decisionHashes = [];
  const globalDiagnostics = [];

  for (const dec of m5Decisions) {
    const projRecord = projection.records.find(r => r.subjectId === dec.subjectId);
    const pubEligibility = projRecord ? projRecord.publicationEligibility : "PUBLICATION_UNDECIDED";

    if (pubEligibility === "PUBLICATION_ELIGIBLE") {
      eligibleCount++;
    } else if (pubEligibility === "PUBLICATION_WITHHELD") {
      withheldCount++;
    } else {
      undecidedCount++;
    }

    articleResults.push({
      subjectId: dec.subjectId,
      publicationEligibility: pubEligibility,
      m5Decision: dec.m5Decision,
      decisionFinality: dec.decisionFinality
    });

    decisionHashes.push({
      subjectId: dec.subjectId,
      decisionHash: computeDecisionRecordHash(dec)
    });
  }

  // Extract global diagnostics from records[*].projectionDiagnostics
  const uniqueDiagCodes = new Set();
  for (const record of projection.records) {
    if (record.projectionDiagnostics) {
      for (const code of record.projectionDiagnostics) {
        if (code) {
          uniqueDiagCodes.add(code);
        }
      }
    }
  }
  for (const code of uniqueDiagCodes) {
    globalDiagnostics.push(code);
  }

  const diagnosticMessages = projection.diagnostics || [];

  // Check version coherence across decisions
  let hasMixedPolicy = false;
  let hasMixedEvaluator = false;
  let hasMixedImplementation = false;
  let hasMixedCommit = false;

  if (m5Decisions.length > 0) {
    const firstDec = m5Decisions[0];
    for (const dec of m5Decisions) {
      if (dec.policyVersion !== firstDec.policyVersion) hasMixedPolicy = true;
      if (dec.evaluatorVersion !== firstDec.evaluatorVersion) hasMixedEvaluator = true;
      if (dec.implementationIdentity !== firstDec.implementationIdentity) hasMixedImplementation = true;
      if (dec.repositoryCommit !== firstDec.repositoryCommit) hasMixedCommit = true;
    }
  }

  if (hasMixedPolicy) globalDiagnostics.push("MIXED_POLICY_VERSION");
  if (hasMixedEvaluator) globalDiagnostics.push("MIXED_EVALUATOR_VERSION");
  if (hasMixedImplementation) globalDiagnostics.push("MIXED_IMPLEMENTATION_IDENTITY");
  if (hasMixedCommit) globalDiagnostics.push("MIXED_REPOSITORY_COMMIT");

  // Determine shadowGateResult:
  // SHADOW_NOT_EVALUATED > SHADOW_SYSTEM_UNAVAILABLE > SHADOW_ATTENTION > SHADOW_PASS
  let shadowGateResult = "SHADOW_PASS";
  const hasNotEvaluatedDiag = globalDiagnostics.some(code => 
    code === "DECISION_MISSING" ||
    code === "DECISION_DUPLICATE" ||
    code === "PROJECTION_CONFIGURATION_INVALID" ||
    code === "MIXED_POLICY_VERSION" ||
    code === "MIXED_EVALUATOR_VERSION" ||
    code === "MIXED_IMPLEMENTATION_IDENTITY" ||
    code === "MIXED_REPOSITORY_COMMIT"
  );

  const hasNonFinalizable = m5Decisions.some(dec => dec.decisionFinality === "NON_FINALIZABLE");

  if (hasNotEvaluatedDiag) {
    shadowGateResult = "SHADOW_NOT_EVALUATED";
  } else if (hasNonFinalizable || m5Decisions.some(dec => dec.m5Decision === "SYSTEM_UNAVAILABLE")) {
    shadowGateResult = "SHADOW_SYSTEM_UNAVAILABLE";
  } else if (withheldCount > 0) {
    shadowGateResult = "SHADOW_ATTENTION";
  } else {
    shadowGateResult = "SHADOW_PASS";
  }

  // Sort canonical arrays
  articleResults.sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  decisionHashes.sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  globalDiagnostics.sort();

  const payload = {
    schemaVersion: "M5-OBSERVATION-1.0",
    repositoryCommit: commitSha || null,
    policyVersion: m5Decisions.length > 0 ? m5Decisions[0].policyVersion : "M5-POLICY-1.0",
    evaluatorVersion: m5Decisions.length > 0 ? m5Decisions[0].evaluatorVersion : "M5-EVALUATOR-1.0",
    implementationIdentity: commitSha || null,
    observationMode: "SHADOW",
    shadowGateResult,
    subjectCount,
    eligibleCount,
    withheldCount,
    undecidedCount,
    articleResults,
    globalDiagnostics,
    diagnosticMessages,
    projectionHash,
    decisionHashes
  };

  // Sort payload keys alphabetically for deterministic serialization
  const sortedPayload = {};
  for (const k of Object.keys(payload).sort()) {
    sortedPayload[k] = payload[k];
  }

  const serialized = JSON.stringify(sortedPayload);
  const observationHash = crypto.createHash("sha256").update(serialized).digest("hex");

  return {
    observation: sortedPayload,
    observationHash
  };
}

/**
 * Maps a shadowGateResult to process exit code.
 * @param {string} result 
 * @returns {number}
 */
export function shadowResultToExitCode(result) {
  const exitCodes = {
    "SHADOW_PASS": 0,
    "SHADOW_ATTENTION": 0,
    "SHADOW_SYSTEM_UNAVAILABLE": 0,
    "SHADOW_NOT_EVALUATED": 0
  };
  return exitCodes[result] !== undefined ? exitCodes[result] : 0;
}

// CLI Execution Entrypoint
function main() {
  try {
    const workspaceRoot = process.cwd();
    const result = evaluateShadowObservation(workspaceRoot);

    const reportPath = path.join(workspaceRoot, "stewardship", "reports", "m5-ci-shadow-observation.json");
    const reportsDir = path.dirname(reportPath);

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const executionEnvelope = {
      observation: result.observation,
      observationHash: result.observationHash,
      execution: {
        workflow: process.env.GITHUB_WORKFLOW || null,
        job: process.env.GITHUB_JOB || null,
        runId: process.env.GITHUB_RUN_ID || null,
        timestamp: new Date().toISOString(),
        runner: process.env.RUNNER_NAME || "local",
        branch: process.env.GITHUB_REF || null
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(executionEnvelope, null, 2), "utf-8");

    console.log("=========================================");
    console.log("         M5 CI SHADOW OBSERVATION        ");
    console.log("=========================================");
    console.log(`Commit:                 ${result.observation.repositoryCommit}`);
    console.log(`Subjects:               ${result.observation.subjectCount}`);
    console.log(`Eligible:               ${result.observation.eligibleCount}`);
    console.log(`Withheld:               ${result.observation.withheldCount}`);
    console.log(`Undecided:              ${result.observation.undecidedCount}`);
    console.log(`Shadow result:          ${result.observation.shadowGateResult}`);
    console.log(`Observation hash:       ${result.observationHash}`);
    console.log(`Operational enforcement: DISABLED`);
    console.log("=========================================");

    if (result.observation.withheldCount > 0) {
      console.log("\n[Shadow Attention] The following articles would be withheld:");
      for (const art of result.observation.articleResults) {
        if (art.publicationEligibility === "PUBLICATION_WITHHELD") {
          console.log(`  - ${art.subjectId}`);
        }
      }
    }

    process.exitCode = shadowResultToExitCode(result.observation.shadowGateResult);
  } catch (error) {
    console.error("TOOL EXECUTION FAILURE:", error);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

// Helper function to resolve fileURLToPath if needed
function fileURLToPath(url) {
  return url.replace(/^file:\/\/\/?/, "").replace(/\//g, path.sep);
}
