import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testTmpDir = path.join(__dirname, 'tmp-m5-4r-tests');

const repoRoot = path.resolve(process.cwd(), '..');
const m5IdentityPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_identity.js')).href;
const m5ModulePath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_m5.js')).href;
const m5ProjectionPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_projection.js')).href;
const m5ShadowPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_ci_shadow.js')).href;
const m5ReadinessPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_m5_readiness.js')).href;

// @ts-ignore
const { resolveRepositoryCommit, computeM5ImplementationIdentity } = await import(m5IdentityPath);
// @ts-ignore
const { evaluateM5Decision, serializeDecisionRecord, computeDecisionRecordHash } = await import(m5ModulePath);
// @ts-ignore
const { buildPublicationProjection, computeProjectionHash } = await import(m5ProjectionPath);
// @ts-ignore
const { computeShadowObservationPayload } = await import(m5ShadowPath);
// @ts-ignore
const { evaluateEnforcementReadiness } = await import(m5ReadinessPath);

describe('M5.4R Identity and Hashing Suite', () => {
  before(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
  });

  test('Identity Reproducibility Test', () => {
    const res1 = computeM5ImplementationIdentity(repoRoot);
    const res2 = computeM5ImplementationIdentity(repoRoot);

    assert.strictEqual(res1.state, 'RESOLVED');
    assert.strictEqual(res2.state, 'RESOLVED');
    assert.strictEqual(res1.identity, res2.identity);
    assert.ok(/^[0-9a-f]{64}$/.test(res1.identity));
  });

  test('CRLF / LF Equivalence Test', () => {
    // Write mock directory structure
    const mockRoot = path.join(testTmpDir, 'mock-crlf-lf');
    fs.mkdirSync(path.join(mockRoot, 'tooling'), { recursive: true });

    const files = [
      'tooling/prag_provenance_m5.js',
      'tooling/prag_provenance_projection.js',
      'tooling/prag_provenance_ci_shadow.js',
      'tooling/prag_provenance_identity.js',
      'tooling/prag_provenance_readiness.js'
    ];

    // Write CRLF content
    for (const f of files) {
      fs.writeFileSync(path.join(mockRoot, f), 'const x = 1;\r\nconst y = 2;\r\n');
    }
    const hashCRLF = computeM5ImplementationIdentity(mockRoot).identity;

    // Write LF content
    for (const f of files) {
      fs.writeFileSync(path.join(mockRoot, f), 'const x = 1;\nconst y = 2;\n');
    }
    const hashLF = computeM5ImplementationIdentity(mockRoot).identity;

    assert.strictEqual(hashCRLF, hashLF);
  });

  test('Missing Governed File Test', () => {
    const mockRoot = path.join(testTmpDir, 'mock-missing');
    fs.mkdirSync(path.join(mockRoot, 'tooling'), { recursive: true });

    fs.writeFileSync(path.join(mockRoot, 'tooling/prag_provenance_m5.js'), 'console.log();');
    // omit other required files

    const res = computeM5ImplementationIdentity(mockRoot);
    assert.strictEqual(res.state, 'UNAVAILABLE');
    assert.strictEqual(res.identity, null);
  });

  test('Non-Evaluator Change Test', () => {
    const mockRoot = path.join(testTmpDir, 'mock-non-eval');
    fs.mkdirSync(path.join(mockRoot, 'tooling'), { recursive: true });

    const files = [
      'tooling/prag_provenance_m5.js',
      'tooling/prag_provenance_projection.js',
      'tooling/prag_provenance_ci_shadow.js',
      'tooling/prag_provenance_identity.js',
      'tooling/prag_provenance_readiness.js'
    ];

    for (const f of files) {
      fs.writeFileSync(path.join(mockRoot, f), 'const code = 1;\n');
    }
    const identityBefore = computeM5ImplementationIdentity(mockRoot).identity;

    // Write unrelated file
    fs.writeFileSync(path.join(mockRoot, 'unrelated.md'), 'some documentation change');

    const identityAfter = computeM5ImplementationIdentity(mockRoot).identity;
    assert.strictEqual(identityBefore, identityAfter);
  });

  test('Evaluator Change Test', () => {
    const mockRoot = path.join(testTmpDir, 'mock-eval-change');
    fs.mkdirSync(path.join(mockRoot, 'tooling'), { recursive: true });

    const files = [
      'tooling/prag_provenance_m5.js',
      'tooling/prag_provenance_projection.js',
      'tooling/prag_provenance_ci_shadow.js',
      'tooling/prag_provenance_identity.js',
      'tooling/prag_provenance_readiness.js'
    ];

    for (const f of files) {
      fs.writeFileSync(path.join(mockRoot, f), 'const code = 1;\n');
    }
    const identityBefore = computeM5ImplementationIdentity(mockRoot).identity;

    // Modify a governed file
    fs.writeFileSync(path.join(mockRoot, 'tooling/prag_provenance_m5.js'), 'const code = 2;\n');

    const identityAfter = computeM5ImplementationIdentity(mockRoot).identity;
    assert.notStrictEqual(identityBefore, identityAfter);
  });

  test('Path Binding Test', () => {
    const mockRootA = path.join(testTmpDir, 'mock-path-a');
    fs.mkdirSync(path.join(mockRootA, 'tooling'), { recursive: true });
    
    // File content: A has 'X' on file1 and 'Y' on file2
    fs.writeFileSync(path.join(mockRootA, 'tooling/prag_provenance_m5.js'), 'X');
    fs.writeFileSync(path.join(mockRootA, 'tooling/prag_provenance_projection.js'), 'Y');
    fs.writeFileSync(path.join(mockRootA, 'tooling/prag_provenance_ci_shadow.js'), 'Z');
    fs.writeFileSync(path.join(mockRootA, 'tooling/prag_provenance_identity.js'), 'W');
    fs.writeFileSync(path.join(mockRootA, 'tooling/prag_provenance_readiness.js'), 'U');

    const hashA = computeM5ImplementationIdentity(mockRootA).identity;

    const mockRootB = path.join(testTmpDir, 'mock-path-b');
    fs.mkdirSync(path.join(mockRootB, 'tooling'), { recursive: true });

    // File content: B swaps contents: file1 has 'Y', file2 has 'X'
    fs.writeFileSync(path.join(mockRootB, 'tooling/prag_provenance_m5.js'), 'Y');
    fs.writeFileSync(path.join(mockRootB, 'tooling/prag_provenance_projection.js'), 'X');
    fs.writeFileSync(path.join(mockRootB, 'tooling/prag_provenance_ci_shadow.js'), 'Z');
    fs.writeFileSync(path.join(mockRootB, 'tooling/prag_provenance_identity.js'), 'W');
    fs.writeFileSync(path.join(mockRootB, 'tooling/prag_provenance_readiness.js'), 'U');

    const hashB = computeM5ImplementationIdentity(mockRootB).identity;

    assert.notStrictEqual(hashA, hashB);
  });

  test('Stable Evaluator Across Commits and Segmentation', () => {
    const candidateInfo = {
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      implementationIdentity: "eval_hash_x"
    };

    const observations = [];
    // 10 observations over 10 unique commits with same evaluator info
    for (let i = 0; i < 10; i++) {
      const commit = `commit-${i}`;
      observations.push({
        schemaVersion: "M5-OBSERVATION-1.0",
        repositoryCommit: commit,
        policyVersion: "M5-POLICY-1.0",
        evaluatorVersion: "M5-EVALUATOR-1.0",
        implementationIdentity: "eval_hash_x",
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
            projectionDiagnostics: []
          }
        ],
        globalDiagnostics: [],
        diagnosticMessages: [],
        projectionHash: "projHash",
        decisionHashes: [],
        observationHash: `obsHash-${i}`
      });
    }

    const res = evaluateEnforcementReadiness(observations, candidateInfo, testTmpDir, {
      requiredObservationCount: 10,
      requiredUniqueRepositorySnapshots: 5
    });

    assert.strictEqual(res.assessmentState, "ENFORCEMENT_READY");
    assert.strictEqual(res.stabilitySegments.length, 1);
    assert.strictEqual(res.stabilitySegments[0].uniqueRepositorySnapshots, 10);
  });

  test('Evaluator Change Splits Segment', () => {
    const candidateInfo = {
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      implementationIdentity: "eval_hash_x"
    };

    const obs1 = {
      schemaVersion: "M5-OBSERVATION-1.0",
      repositoryCommit: "commit-A",
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentity: "eval_hash_x",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      observationMode: "SHADOW",
      shadowGateResult: "SHADOW_PASS",
      subjectCount: 0,
      eligibleCount: 0,
      withheldCount: 0,
      undecidedCount: 0,
      articleResults: [],
      globalDiagnostics: [],
      diagnosticMessages: [],
      projectionHash: "projHash",
      decisionHashes: [],
      observationHash: "obsHash-1"
    };

    const obs2 = {
      ...obs1,
      implementationIdentity: "eval_hash_y", // different evaluator identity
      observationHash: "obsHash-2"
    };

    const res = evaluateEnforcementReadiness([obs1, obs2], candidateInfo, testTmpDir, {
      requiredObservationCount: 2,
      requiredUniqueRepositorySnapshots: 2
    });

    assert.strictEqual(res.stabilitySegments.length, 2);
    assert.strictEqual(res.assessmentState, "INSUFFICIENT_EVIDENCE"); // candidate segment has only 1 observation
  });

  test('Scheme Change Splits Segment', () => {
    const candidateInfo = {
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      implementationIdentity: "eval_hash_x"
    };

    const obs1 = {
      schemaVersion: "M5-OBSERVATION-1.0",
      repositoryCommit: "commit-A",
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentity: "eval_hash_x",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      observationMode: "SHADOW",
      shadowGateResult: "SHADOW_PASS",
      subjectCount: 0,
      eligibleCount: 0,
      withheldCount: 0,
      undecidedCount: 0,
      articleResults: [],
      globalDiagnostics: [],
      diagnosticMessages: [],
      projectionHash: "projHash",
      decisionHashes: [],
      observationHash: "obsHash-1"
    };

    const obs2 = {
      ...obs1,
      implementationIdentityScheme: "M5-SOURCE-HASH-2", // different scheme
      observationHash: "obsHash-2"
    };

    const res = evaluateEnforcementReadiness([obs1, obs2], candidateInfo, testTmpDir, {
      requiredObservationCount: 2,
      requiredUniqueRepositorySnapshots: 2
    });

    assert.strictEqual(res.stabilitySegments.length, 2);
  });

  test('Legacy-Only Evidence Assessment', () => {
    const candidateInfo = {
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      implementationIdentity: "eval_hash_x"
    };

    const obsLegacy = {
      schemaVersion: "M5-OBSERVATION-1.0",
      repositoryCommit: "commit-A",
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentity: "eval_hash_x",
      // implementationIdentityScheme: omitted (legacy)
      observationMode: "SHADOW",
      shadowGateResult: "SHADOW_PASS",
      subjectCount: 0,
      eligibleCount: 0,
      withheldCount: 0,
      undecidedCount: 0,
      articleResults: [],
      globalDiagnostics: [],
      diagnosticMessages: [],
      projectionHash: "projHash",
      decisionHashes: [],
      observationHash: "obsHash-1"
    };

    const res = evaluateEnforcementReadiness([obsLegacy], candidateInfo, testTmpDir, {
      requiredObservationCount: 1,
      requiredUniqueRepositorySnapshots: 1
    });

    assert.strictEqual(res.assessmentState, "INSUFFICIENT_EVIDENCE"); // does not join M5-SOURCE-HASH-1 segment
    assert.strictEqual(res.stabilitySegments[0].implementationIdentityScheme, "LEGACY_UNDECLARED");
  });

  test('Decision, Projection, and Observation Hashing binds Scheme', () => {
    const baseDec = {
      subjectType: "learning-article",
      subjectId: "src/content/learning/art1.md",
      provenanceRef: "EV-BG-105",
      repositoryCommit: "commit-A",
      b5ReadinessState: "READY_UNCLEARED",
      m5Decision: "ELIGIBLE",
      b5ReasonCodes: [],
      m5ReasonCodes: [],
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentity: "eval_hash_x",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      decisionFinality: "FINAL"
    };

    // 1. Decision hash binds scheme
    const dec2 = { ...baseDec, implementationIdentityScheme: "M5-SOURCE-HASH-2" };
    const hash1 = computeDecisionRecordHash(baseDec);
    const hash2 = computeDecisionRecordHash(dec2);
    assert.notStrictEqual(hash1, hash2);

    // 2. Projection hash binds scheme
    const proj1 = buildPublicationProjection({
      expectedSubjects: ["src/content/learning/art1.md"],
      m5DecisionRecords: [baseDec],
      options: {
        implementationIdentity: "eval_hash_x",
        implementationIdentityScheme: "M5-SOURCE-HASH-1",
        identityState: "RESOLVED"
      }
    });
    const proj2 = buildPublicationProjection({
      expectedSubjects: ["src/content/learning/art1.md"],
      m5DecisionRecords: [dec2],
      options: {
        implementationIdentity: "eval_hash_x",
        implementationIdentityScheme: "M5-SOURCE-HASH-2",
        identityState: "RESOLVED"
      }
    });
    const projHash1 = computeProjectionHash(proj1);
    const projHash2 = computeProjectionHash(proj2);
    assert.notStrictEqual(projHash1, projHash2);

    // 3. Observation hash binds scheme
    const obsRes1 = computeShadowObservationPayload(
      ["src/content/learning/art1.md"],
      [baseDec],
      {
        repositoryCommit: "commit-A",
        repositoryCommitState: "RESOLVED",
        implementationIdentity: "eval_hash_x",
        implementationIdentityState: "RESOLVED",
        implementationIdentityScheme: "M5-SOURCE-HASH-1"
      }
    );
    const obsRes2 = computeShadowObservationPayload(
      ["src/content/learning/art1.md"],
      [dec2],
      {
        repositoryCommit: "commit-A",
        repositoryCommitState: "RESOLVED",
        implementationIdentity: "eval_hash_x",
        implementationIdentityState: "RESOLVED",
        implementationIdentityScheme: "M5-SOURCE-HASH-2"
      }
    );
    assert.notStrictEqual(obsRes1.observationHash, obsRes2.observationHash);
  });

  test('Explicit Boundary - Missing First Governed File Test', () => {
    const fixtureRoot = path.join(testTmpDir, 'mock-missing-first-file');
    fs.mkdirSync(path.join(fixtureRoot, 'tooling'), { recursive: true });
    // Write tooling/ directory but omit tooling/prag_provenance_m5.js
    fs.writeFileSync(path.join(fixtureRoot, 'tooling/prag_provenance_projection.js'), 'const code = 1;\n');

    const res = computeM5ImplementationIdentity(fixtureRoot);
    assert.strictEqual(res.state, 'UNAVAILABLE');
    assert.strictEqual(res.identity, null);
  });

  test('Explicit Boundary - Completely Missing Root Test', () => {
    const nonexistentPath = path.join(testTmpDir, 'nonexistent-root-path-xyz');
    const res = computeM5ImplementationIdentity(nonexistentPath);
    assert.strictEqual(res.state, 'UNAVAILABLE');
    assert.strictEqual(res.identity, null);
  });

  test('Explicit Boundary - Explicit Non-Git Workspace Test', () => {
    const tempDirectory = path.join(testTmpDir, 'mock-nongit-workspace');
    fs.mkdirSync(tempDirectory, { recursive: true });

    const res = resolveRepositoryCommit(tempDirectory);
    assert.strictEqual(res.state, 'UNAVAILABLE');
    assert.strictEqual(res.commit, null);
  });

  test('Explicit Boundary - Nonexistent Git Root Test', () => {
    const nonexistentPath = path.join(testTmpDir, 'nonexistent-git-path-xyz');
    const res = resolveRepositoryCommit(nonexistentPath);
    assert.strictEqual(res.state, 'UNAVAILABLE');
    assert.strictEqual(res.commit, null);
  });

  test('Explicit Boundary - Default-Root Regression', () => {
    // resolveRepositoryCommit() without arguments still resolves the actual repository HEAD
    const resCommit = resolveRepositoryCommit();
    assert.strictEqual(resCommit.state, 'RESOLVED');
    assert.ok(/^[0-9a-f]{40}$/i.test(resCommit.commit));

    // computeM5ImplementationIdentity() without arguments still resolves the current M5 evaluator identity
    const resIdentity = computeM5ImplementationIdentity();
    assert.strictEqual(resIdentity.state, 'RESOLVED');
    assert.ok(/^[0-9a-f]{64}$/i.test(resIdentity.identity));
  });

  test('Explicit Boundary - Cross-Workspace Contamination Test', () => {
    // Workspace A: incomplete evaluator
    const workspaceA = path.join(testTmpDir, 'workspace-a-incomplete');
    fs.mkdirSync(path.join(workspaceA, 'tooling'), { recursive: true });
    fs.writeFileSync(path.join(workspaceA, 'tooling/prag_provenance_m5.js'), 'const a = 1;\n');

    // Call computeM5ImplementationIdentity(workspaceA) -> must be UNAVAILABLE, never fall back to repoRoot (Workspace B)
    const res = computeM5ImplementationIdentity(workspaceA);
    assert.strictEqual(res.state, 'UNAVAILABLE');
    assert.strictEqual(res.identity, null);
  });
});
