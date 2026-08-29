import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testTmpDir = path.join(__dirname, 'tmp-m5-4-tests');

const repoRoot = path.resolve(process.cwd(), '..');
const m5ReadinessPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_m5_readiness.js')).href;

// @ts-ignore
const {
  validateObservationReport,
  buildStabilitySegments,
  evaluateEnforcementReadiness,
  computeReadinessAssessmentHash
} = await import(m5ReadinessPath);

describe('M5.4 Enforcement Readiness Assessment', () => {
  before(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
  });

  const candidateInfo = {
    policyVersion: "M5-POLICY-1.0",
    evaluatorVersion: "M5-EVALUATOR-1.0",
    implementationIdentityScheme: "M5-SOURCE-HASH-1",
    implementationIdentity: "e2b2203ceb8373abadcebf1784efadda67e438a8"
  };

  const baseObs = {
    schemaVersion: "M5-OBSERVATION-1.0",
    repositoryCommit: "e2b2203ceb8373abadcebf1784efadda67e438a8",
    policyVersion: "M5-POLICY-1.0",
    evaluatorVersion: "M5-EVALUATOR-1.0",
    implementationIdentity: "e2b2203ceb8373abadcebf1784efadda67e438a8",
    implementationIdentityScheme: "M5-SOURCE-HASH-1",
    observationMode: "SHADOW",
    shadowGateResult: "SHADOW_PASS",
    subjectCount: 1,
    eligibleCount: 1,
    withheldCount: 0,
    undecidedCount: 0,
    articleResults: [
      {
        subjectId: "src/content/learning/art1.md",
        publicationEligibility: "PUBLICATION_ELIGIBLE",
        m5Decision: "ELIGIBLE",
        projectionDiagnostics: [],
        decisionFinality: "FINAL"
      }
    ],
    globalDiagnostics: [],
    diagnosticMessages: [],
    projectionHash: "e9143904bc5f57239d244832045b222b47cb222ff130efc2aba20880cc0c54b6",
    decisionHashes: [
      {
        subjectId: "src/content/learning/art1.md",
        decisionHash: "d25a3445ba45ee820d7854281ad9fcc74e17e826cd8b3e079bf3f6fcf4004365"
      }
    ],
    observationHash: "mockHash1"
  };

  test('insufficient evidence state', () => {
    const res = evaluateEnforcementReadiness(
      [baseObs],
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 10, requiredUniqueRepositorySnapshots: 5 }
    );

    assert.strictEqual(res.assessmentState, "INSUFFICIENT_EVIDENCE");
    assert.strictEqual(res.eligibleObservationCount, 1);
    assert.strictEqual(res.shadowPassCount, 1);
  });

  test('determinism failure state', () => {
    const obs2 = {
      ...baseObs,
      observationHash: "mockHash2", // different hash
      shadowGateResult: "SHADOW_ATTENTION" // different result / payload
    };

    const res = evaluateEnforcementReadiness(
      [baseObs, obs2],
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 10, requiredUniqueRepositorySnapshots: 5 }
    );

    assert.strictEqual(res.assessmentState, "ENFORCEMENT_NOT_READY");
    assert.ok(res.blockingReasons.includes("DETERMINISM_FAILURE"));
    assert.strictEqual(res.determinismFailures.length, 1);
  });

  test('determinism pass (unique snapshots vs reruns)', () => {
    const obsRerun = {
      ...baseObs // same hash
    };

    const res = evaluateEnforcementReadiness(
      [baseObs, obsRerun],
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 10, requiredUniqueRepositorySnapshots: 5 }
    );

    assert.strictEqual(res.assessmentState, "INSUFFICIENT_EVIDENCE");
    assert.strictEqual(res.determinismFailures.length, 0);
    assert.strictEqual(res.eligibleObservationCount, 1); // deduplicated
  });

  test('system unavailable threshold failure', () => {
    const obsList = [];
    for (let i = 0; i < 9; i++) {
      obsList.push({
        ...baseObs,
        repositoryCommit: `commit${i}`,
        observationHash: `hash${i}`
      });
    }
    obsList.push({
      ...baseObs,
      repositoryCommit: "commit9",
      observationHash: "hash9",
      shadowGateResult: "SHADOW_SYSTEM_UNAVAILABLE"
    });

    const res = evaluateEnforcementReadiness(
      obsList,
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 10, requiredUniqueRepositorySnapshots: 5 }
    );

    assert.strictEqual(res.assessmentState, "ENFORCEMENT_NOT_READY");
    assert.ok(res.blockingReasons.includes("SYSTEM_UNAVAILABLE_ABOVE_THRESHOLD"));
    assert.strictEqual(res.shadowSystemUnavailableCount, 1);
  });

  test('not evaluated threshold failure', () => {
    const obsList = [];
    for (let i = 0; i < 9; i++) {
      obsList.push({
        ...baseObs,
        repositoryCommit: `commit${i}`,
        observationHash: `hash${i}`
      });
    }
    obsList.push({
      ...baseObs,
      repositoryCommit: "commit9",
      observationHash: "hash9",
      shadowGateResult: "SHADOW_NOT_EVALUATED"
    });

    const res = evaluateEnforcementReadiness(
      obsList,
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 10, requiredUniqueRepositorySnapshots: 5 }
    );

    assert.strictEqual(res.assessmentState, "ENFORCEMENT_NOT_READY");
    assert.ok(res.blockingReasons.includes("NOT_EVALUATED_ABOVE_THRESHOLD"));
  });

  test('legitimate attention does not block', () => {
    // Write mock review file for art1.md
    const reviewsDir = path.join(testTmpDir, "stewardship", "reviews");
    fs.mkdirSync(reviewsDir, { recursive: true });
    fs.writeFileSync(
      path.join(reviewsDir, "sf-rev1.review.md"),
      `---
subject: "src/content/learning/art1.md"
result: "PASS"
---`
    );

    const obsAttention = {
      ...baseObs,
      shadowGateResult: "SHADOW_ATTENTION",
      withheldCount: 1,
      eligibleCount: 0,
      articleResults: [
        {
          subjectId: "src/content/learning/art1.md",
          publicationEligibility: "PUBLICATION_WITHHELD",
          m5Decision: "WITHHELD",
          projectionDiagnostics: []
        }
      ]
    };

    const obsList = [];
    for (let i = 0; i < 9; i++) {
      obsList.push({
        ...baseObs,
        repositoryCommit: `commit${i}`,
        observationHash: `hash${i}`
      });
    }
    obsList.push({
      ...obsAttention,
      repositoryCommit: "commit9",
      observationHash: "hash9"
    });

    const res = evaluateEnforcementReadiness(
      obsList,
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 10, requiredUniqueRepositorySnapshots: 5 }
    );

    assert.strictEqual(res.assessmentState, "ENFORCEMENT_READY");
    assert.strictEqual(res.blockingReasons.length, 0);
    assert.strictEqual(res.unresolvedCases.length, 0);
  });

  test('unresolved attention warns', () => {
    // Empty reviews dir
    const reviewsDir = path.join(testTmpDir, "stewardship", "reviews");
    fs.rmSync(reviewsDir, { recursive: true, force: true });

    const obsAttention = {
      ...baseObs,
      shadowGateResult: "SHADOW_ATTENTION",
      withheldCount: 1,
      eligibleCount: 0,
      articleResults: [
        {
          subjectId: "src/content/learning/art1.md",
          publicationEligibility: "PUBLICATION_WITHHELD",
          m5Decision: "WITHHELD",
          projectionDiagnostics: []
        }
      ]
    };

    const res = evaluateEnforcementReadiness(
      [obsAttention],
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 1, requiredUniqueRepositorySnapshots: 1 }
    );

    assert.ok(res.warnings.includes("ATTENTION_CASES_UNREVIEWED"));
    assert.strictEqual(res.unresolvedCases.length, 1);
  });

  test('cardinality failure blocks', () => {
    const obsCardFail = {
      ...baseObs,
      subjectCount: 2, // mismatch with articleResults.length (1)
      observationHash: "mockHashCard"
    };

    const res = evaluateEnforcementReadiness(
      [obsCardFail],
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 1, requiredUniqueRepositorySnapshots: 1 }
    );

    assert.strictEqual(res.assessmentState, "ENFORCEMENT_NOT_READY");
    assert.ok(res.blockingReasons.includes("CARDINALITY_INVARIANT_FAILURE"));
    assert.strictEqual(res.cardinalityFailures.length, 1);
  });

  test('mixed evaluator versions are segmented', () => {
    const obsOldVersion = {
      ...baseObs,
      evaluatorVersion: "M5-EVALUATOR-0.9", // old version
      observationHash: "mockHashOld"
    };

    const res = evaluateEnforcementReadiness(
      [baseObs, obsOldVersion],
      candidateInfo,
      testTmpDir,
      { requiredObservationCount: 2, requiredUniqueRepositorySnapshots: 2 }
    );

    // Should be insufficient evidence because candidate version segment only has 1 observation
    assert.strictEqual(res.assessmentState, "INSUFFICIENT_EVIDENCE");
    assert.strictEqual(res.stabilitySegments.length, 2);
  });
});
