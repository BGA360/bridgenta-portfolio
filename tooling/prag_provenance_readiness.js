import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseFrontmatter,
  getReviewSubject,
  resolveArticleProvenance,
  computeExpectedFingerprint
} from "./prag_provenance_resolver.js";
import {
  validateRegistry,
  validateManifest,
  validateClearances,
  PROJECT_NAMESPACE_MAP
} from "./prag_provenance_validator.js";

// B5 Provenance Readiness Evaluator
export function evaluateReadiness(workspaceDir, registry, manifest, clearances, namespaceMap = PROJECT_NAMESPACE_MAP) {
  const learningDir = path.join(workspaceDir, "src", "content", "learning");
  
  const defaultResult = {
    counters: {
      TOTAL_PUBLISHED_ARTICLES: 0,
      WITH_PROVENANCE_REF: 0,
      WITHOUT_PROVENANCE_REF: 0,
      REGISTRY_RESOLVED: 0,
      REGISTRY_UNRESOLVED: 0,
      MANIFEST_RESOLVED: 0,
      MANIFEST_UNRESOLVED: 0,
      SOURCE_FIDELITY_PASS: 0,
      SOURCE_FIDELITY_FAIL_OR_MISSING: 0,
      RUNTIME_PASS: 0,
      RUNTIME_FAIL: 0,
      READY_UNCLEARED: 0,
      READY_BY_CLEARANCE: 0,
      NOT_READY: 0
    },
    articles: [],
    m5Preflight: "NOT_READY" // Default safe posture for zero published articles
  };

  if (!fs.existsSync(learningDir)) {
    return defaultResult;
  }

  const files = fs.readdirSync(learningDir);
  const articles = [];

  // Corpus readiness counters
  let totalPublished = 0;
  let withProvenanceRef = 0;
  let withoutProvenanceRef = 0;
  let registryResolved = 0;
  let registryUnresolved = 0;
  let manifestResolved = 0;
  let manifestUnresolved = 0;
  let sourceFidelityPass = 0;
  let sourceFidelityFailOrMissing = 0;
  let runtimePass = 0;
  let runtimeFail = 0;
  let readyUncleared = 0;
  let readyByClearance = 0;
  let notReady = 0;

  for (const file of files) {
    if (!file.endsWith(".md") || file === ".gitkeep") continue;
    const repoRelativePath = `src/content/learning/${file}`;
    const fullPath = path.join(learningDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const fm = parseFrontmatter(content);

    // B5 scans only published learning articles
    if (fm.publicationState !== "published") continue;

    totalPublished++;

    const provenanceRef = fm.provenanceRef || null;
    const reasons = [];

    // R1: Provenance ref presence
    const r1 = !!provenanceRef;
    if (!r1) {
      reasons.push("MISSING_PROVENANCE_REF");
      withoutProvenanceRef++;
    } else {
      withProvenanceRef++;
    }

    // R2: Provenance ref syntax check
    let r2 = false;
    if (r1) {
      r2 = /^EV-[A-Z]{2,4}-[0-9]{3,5}$/.test(provenanceRef);
      if (!r2) {
        reasons.push("INVALID_PROVENANCE_REF_SYNTAX");
      }
    }

    // R3: Registry existence & uniqueness
    let r3 = false;
    let regEntry = null;
    if (r2) {
      const matches = registry.filter(e => e.eventId === provenanceRef);
      if (matches.length === 1) {
        r3 = true;
        regEntry = matches[0];
        registryResolved++;
      } else {
        reasons.push(matches.length === 0 ? "UNKNOWN_EVENT" : "REGISTRY_INVALID");
        registryUnresolved++;
      }
    } else if (r1) {
      registryUnresolved++;
    }

    // R4: Registry entry structural validity
    let r4 = false;
    if (r3 && regEntry) {
      try {
        validateRegistry([regEntry], namespaceMap);
        r4 = true;
      } catch (e) {
        r4 = false;
        reasons.push("REGISTRY_INVALID");
      }
    }

    // R5: Manifest entry existence & uniqueness
    let r5 = false;
    let manEntry = null;
    if (r2) {
      const matches = manifest.filter(m => m.eventId === provenanceRef);
      if (matches.length === 1) {
        r5 = true;
        manEntry = matches[0];
        manifestResolved++;
      } else {
        reasons.push("MANIFEST_INVALID");
        manifestUnresolved++;
      }
    } else if (r1) {
      manifestUnresolved++;
    }

    // R6: Manifest entry structural validity
    let r6 = false;
    if (r5 && manEntry && regEntry) {
      try {
        validateManifest([manEntry], [regEntry], namespaceMap);
        r6 = true;
      } catch (e) {
        r6 = false;
        reasons.push("MANIFEST_INVALID");
      }
    }

    // R7: B3 Advisory Resolution check
    let r7 = false;
    let b3Result = null;
    if (r1) {
      try {
        b3Result = resolveArticleProvenance(repoRelativePath, workspaceDir, registry, manifest, clearances, namespaceMap);
        if (b3Result.effectiveGateResult === "PASS") {
          r7 = true;
          runtimePass++;
        } else {
          reasons.push("RUNTIME_NOT_PASS");
          runtimeFail++;
        }
      } catch (e) {
        reasons.push("RUNTIME_NOT_PASS");
        runtimeFail++;
      }
    }

    // R8 & R9: Source-Fidelity review attribution and evidence packet checks
    let r8 = false;
    let r9 = false;
    if (r1) {
      // Discover reviews
      const reviewsDir = path.join(workspaceDir, "stewardship", "reviews");
      let matchedReviews = [];
      if (fs.existsSync(reviewsDir)) {
        const reviewFiles = fs.readdirSync(reviewsDir);
        for (const rf of reviewFiles) {
          if (rf.endsWith(".review.md")) {
            const rfPath = path.join(reviewsDir, rf);
            const rfContent = fs.readFileSync(rfPath, "utf-8");
            const reviewSubject = getReviewSubject(rfContent);
            if (reviewSubject === repoRelativePath) {
              const reviewFm = parseFrontmatter(rfContent);
              if (reviewFm.reviewType === "Source-Fidelity") {
                matchedReviews.push({ path: rfPath, frontmatter: reviewFm, content: rfContent });
              }
            }
          }
        }
      }

      if (matchedReviews.length === 1) {
        const review = matchedReviews[0];
        r9 = review.frontmatter.result === "PASS";
        if (!r9) {
          reasons.push("SOURCE_FIDELITY_NOT_PASS");
        }

        // R8: Evidence packet lookup
        // Extract links to stewardship/evidence/*.md
        const evidenceMatches = review.content.match(/stewardship\/evidence\/[a-zA-Z0-9_-]+\.md/g);
        if (evidenceMatches && evidenceMatches.length > 0) {
          // Check files exist and correspond to provenanceRef
          let allEvidenceValid = true;
          for (const evRel of evidenceMatches) {
            const evPath = path.join(workspaceDir, evRel);
            if (fs.existsSync(evPath)) {
              const evContent = fs.readFileSync(evPath, "utf-8");
              if (!evContent.includes(provenanceRef)) {
                allEvidenceValid = false;
              }
            } else {
              allEvidenceValid = false;
            }
          }
          if (allEvidenceValid) {
            r8 = true;
          } else {
            reasons.push("SOURCE_FIDELITY_MISSING");
          }
        } else {
          reasons.push("SOURCE_FIDELITY_MISSING");
        }
      } else if (matchedReviews.length > 1) {
        reasons.push("MULTIPLE_SOURCE_FIDELITY_REVIEWS");
      } else {
        reasons.push("SOURCE_FIDELITY_MISSING");
      }
    }

    if (r8 && r9) {
      sourceFidelityPass++;
    } else if (r1) {
      sourceFidelityFailOrMissing++;
    }

    // R10: Clearance satisfied if required
    let r10 = true;
    if (b3Result && b3Result.clearanceApplied && regEntry) {
      // Find the applied clearance from manifest matching eventId, state APPROVED, and correct fingerprint
      const activeEvidence = {
        eventId: regEntry.eventId,
        sourceProject: regEntry.sourceProject,
        sourceSystem: regEntry.sourceSystem,
        sourceLocator: regEntry.sourceLocator,
        historicalLocatorState: regEntry.historicalLocatorState,
        historicalLocator: regEntry.historicalLocator,
        resolutionState: b3Result.baseResolutionState,
        clearanceScope: b3Result.baseResolutionState === "FIDELITY_UNCONFIRMED" ? "ARTICLE_EVENT" : "EVENT",
        subjectType: b3Result.baseResolutionState === "FIDELITY_UNCONFIRMED" ? "learning-article" : undefined,
        subjectId: b3Result.baseResolutionState === "FIDELITY_UNCONFIRMED" ? repoRelativePath : undefined
      };
      const expectedFingerprint = computeExpectedFingerprint(activeEvidence);
      const matchedCl = clearances.find(cl => 
        cl.eventId === provenanceRef &&
        cl.clearanceState === "APPROVED" &&
        cl.evidenceFingerprint === expectedFingerprint
      );

      if (matchedCl) {
        try {
          validateClearances([matchedCl]);
          // Check reviewReference exists
          const fullReviewPath = path.join(workspaceDir, matchedCl.reviewReference);
          if (!fs.existsSync(fullReviewPath)) {
            r10 = false;
            reasons.push("CLEARANCE_INEFFECTIVE");
          }
        } catch (e) {
          r10 = false;
          reasons.push("CLEARANCE_INEFFECTIVE");
        }
      } else {
        r10 = false;
        reasons.push("CLEARANCE_INEFFECTIVE");
      }
    }

    // Determine readinessState
    let readinessState = "NOT_READY";
    const isReady = r1 && r2 && r3 && r4 && r5 && r6 && r7 && r8 && r9 && r10;
    if (isReady) {
      if (b3Result && b3Result.clearanceApplied) {
        readinessState = "READY_BY_CLEARANCE";
        readyByClearance++;
      } else {
        readinessState = "READY_UNCLEARED";
        readyUncleared++;
      }
    } else {
      notReady++;
    }

    articles.push({
      subjectType: "learning-article",
      subjectId: repoRelativePath,
      publicationState: fm.publicationState,
      provenanceRef,
      baseResolutionState: b3Result ? b3Result.baseResolutionState : null,
      effectiveGateResult: b3Result ? b3Result.effectiveGateResult : "FAIL",
      clearanceApplied: b3Result ? b3Result.clearanceApplied : false,
      sourceFidelity: r9 ? "PASS" : "FAIL",
      readinessState,
      reasons
    });
  }

  const m5Preflight = (totalPublished > 0 && notReady === 0) ? "READY" : "NOT_READY";

  return {
    counters: {
      TOTAL_PUBLISHED_ARTICLES: totalPublished,
      WITH_PROVENANCE_REF: withProvenanceRef,
      WITHOUT_PROVENANCE_REF: withoutProvenanceRef,
      REGISTRY_RESOLVED: registryResolved,
      REGISTRY_UNRESOLVED: registryUnresolved,
      MANIFEST_RESOLVED: manifestResolved,
      MANIFEST_UNRESOLVED: manifestUnresolved,
      SOURCE_FIDELITY_PASS: sourceFidelityPass,
      SOURCE_FIDELITY_FAIL_OR_MISSING: sourceFidelityFailOrMissing,
      RUNTIME_PASS: runtimePass,
      RUNTIME_FAIL: runtimeFail,
      READY_UNCLEARED: readyUncleared,
      READY_BY_CLEARANCE: readyByClearance,
      NOT_READY: notReady
    },
    articles,
    m5Preflight
  };
}

// CLI runner entry point
async function runCli() {
  const workspaceDir = path.resolve(".");
  
  const registryPath = path.join(workspaceDir, "src", "data", "provenance_registry.json");
  const manifestPath = path.join(workspaceDir, "src", "data", "local_integrity_manifest.json");
  const clearancesPath = path.join(workspaceDir, "stewardship", "reviews", "clearances_manifest.json");

  const registry = fs.existsSync(registryPath) ? JSON.parse(fs.readFileSync(registryPath, "utf-8")) : [];
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf-8")) : [];
  const clearances = fs.existsSync(clearancesPath) ? JSON.parse(fs.readFileSync(clearancesPath, "utf-8")) : [];

  const checkResult = evaluateReadiness(workspaceDir, registry, manifest, clearances);

  const reportsDir = path.join(workspaceDir, "stewardship", "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const reportPath = path.join(reportsDir, "provenance-readiness.json");
  fs.writeFileSync(reportPath, JSON.stringify(checkResult, null, 2) + "\n", "utf-8");

  console.log(`B5 Provenance Readiness Report generated successfully at: ${reportPath}`);
  console.log(`TOTAL ARTICLES: ${checkResult.counters.TOTAL_PUBLISHED_ARTICLES}`);
  console.log(`READY_UNCLEARED: ${checkResult.counters.READY_UNCLEARED}`);
  console.log(`READY_BY_CLEARANCE: ${checkResult.counters.READY_BY_CLEARANCE}`);
  console.log(`NOT_READY: ${checkResult.counters.NOT_READY}`);
  console.log(`M5 PREFLIGHT DISPOSITION: ${checkResult.m5Preflight}`);
}

const currentFile = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(currentFile) ||
  process.argv[1].endsWith("prag_provenance_readiness.js")
);

if (isMain) {
  runCli().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
