import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testTmpDir = path.join(__dirname, 'tmp-readiness-tests');

// Load JS modules dynamically using pathToFileURL to satisfy TypeScript compiler
const repoRoot = path.resolve(process.cwd(), '..');
const resolverPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_resolver.js')).href;
const readinessPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_readiness.js')).href;

// @ts-ignore
const { computeExpectedFingerprint } = await import(resolverPath);
// @ts-ignore
const { evaluateReadiness, parseEvidencePacket, matchEvidencePacket } = await import(readinessPath);

// Helper to write mock content files
function writeMockArticle(filename: string, frontmatter: string) {
  const contentDir = path.join(testTmpDir, 'src', 'content', 'learning');
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(path.join(contentDir, filename), frontmatter + '\n\nProse content here.', 'utf-8');
}

function writeMockReview(filename: string, frontmatter: string, body: string = '') {
  const reviewsDir = path.join(testTmpDir, 'stewardship', 'reviews');
  fs.mkdirSync(reviewsDir, { recursive: true });
  fs.writeFileSync(path.join(reviewsDir, filename), frontmatter + '\n\n' + body, 'utf-8');
}

function writeMockEvidence(filename: string, content: string) {
  const evidenceDir = path.join(testTmpDir, 'stewardship', 'evidence');
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, filename), content, 'utf-8');
}

function writeMockSourceFile(filename: string, content: string) {
  const fullPath = path.join(testTmpDir, filename);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

describe('B5 Provenance Readiness Evaluator', () => {
  before(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
  });

  test('R1: published article missing provenanceRef -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-missing.md', `---
title: "Article Missing"
publicationState: "published"
---`);

    const result = evaluateReadiness(testTmpDir, [], [], []);
    assert.strictEqual(result.counters.TOTAL_PUBLISHED_ARTICLES, 1);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.strictEqual(result.articles[0].readinessState, 'NOT_READY');
    assert.ok(result.articles[0].reasons.includes('MISSING_PROVENANCE_REF'));
    assert.strictEqual(result.m5Preflight, 'NOT_READY');
  });

  test('R2: invalid provenanceRef syntax -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-invalid-syntax.md', `---
title: "Article Invalid"
publicationState: "published"
provenanceRef: "INVALID-EVENT-123"
---`);

    const result = evaluateReadiness(testTmpDir, [], [], []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('INVALID_PROVENANCE_REF_SYNTAX'));
  });

  test('R3: unknown event in registry -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-unknown.md', `---
title: "Article Unknown"
publicationState: "published"
provenanceRef: "EV-BG-100"
---`);

    const result = evaluateReadiness(testTmpDir, [], [], []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('UNKNOWN_EVENT'));
  });

  test('R4: invalid registry structural check -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-struct-invalid.md', `---
title: "Article Invalid"
publicationState: "published"
provenanceRef: "EV-BG-101"
---`);

    // Registry entry has invalid historicalLocatorState
    const registry = [
      {
        eventId: "EV-BG-101",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "BAD_STATE",
        historicalLocator: "xyz"
      }
    ];

    const result = evaluateReadiness(testTmpDir, registry, [], []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('REGISTRY_INVALID'));
  });

  test('R5 & R6: missing or invalid manifest -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-no-manifest.md', `---
title: "Article No Manifest"
publicationState: "published"
provenanceRef: "EV-BG-102"
---`);

    const registry = [
      {
        eventId: "EV-BG-102",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    const result = evaluateReadiness(testTmpDir, registry, [], []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('MANIFEST_INVALID'));
  });

  test('R8 & R9: missing Source-Fidelity review -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-no-review.md', `---
title: "Article No Review"
publicationState: "published"
provenanceRef: "EV-BG-103"
---`);

    const registry = [
      {
        eventId: "EV-BG-103",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];
    const manifest = [
      {
        eventId: "EV-BG-103",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "NOT_AVAILABLE",
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_MISSING'));
  });

  test('R8 & R9: Source-Fidelity FAIL -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-sf-fail.md', `---
title: "Article SF Fail"
publicationState: "published"
provenanceRef: "EV-BG-104"
---`);

    const registry = [
      {
        eventId: "EV-BG-104",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];
    const manifest = [
      {
        eventId: "EV-BG-104",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "NOT_AVAILABLE",
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    // Write a review with result: FAIL
    writeMockReview('sf-fail.review.md', `---
subject: "src/content/learning/article-sf-fail.md"
reviewType: "Source-Fidelity"
result: "FAIL"
---`, 'Matches [evidence](stewardship/evidence/sf-fail-ev-bg-104.md)');

    writeMockEvidence('sf-fail-ev-bg-104.md', `
- **eventId**: \`EV-BG-104\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_NOT_PASS'));
  });

  test('R10: valid effective clearance -> READY_BY_CLEARANCE', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    const articleName = 'article-cleared.md';
    writeMockArticle(articleName, `---
title: "Article Cleared"
publicationState: "published"
provenanceRef: "EV-BG-105"
---`);

    const registry = [
      {
        eventId: "EV-BG-105",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];
    const manifest = [
      {
        eventId: "EV-BG-105",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE", // will result in FIDELITY_UNCONFIRMED because file doesn't exist
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: "f26eec55fb363ff00281f4d9ddf00391fb1b3477031005c5042be1aa36c58280",
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('sf-pass.review.md', `---
subject: "src/content/learning/article-cleared.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/sf-pass-ev-bg-105.md)');

    writeMockEvidence('sf-pass-ev-bg-105.md', `
- **eventId**: \`EV-BG-105\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    // Expected fingerprint for ARTICLE_EVENT scope
    const activeEvidence = {
      eventId: "EV-BG-105",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "validation/some.js",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "xyz",
      resolutionState: "FIDELITY_UNCONFIRMED",
      clearanceScope: "ARTICLE_EVENT",
      subjectType: "learning-article",
      subjectId: "src/content/learning/article-cleared.md"
    };

    const fingerprint = computeExpectedFingerprint(activeEvidence);

    // Write clearance matching ARTICLE_EVENT scope
    const clearances = [
      {
        eventId: "EV-BG-105",
        resolutionState: "FIDELITY_UNCONFIRMED",
        clearanceScope: "ARTICLE_EVENT",
        subjectType: "learning-article",
        subjectId: "src/content/learning/article-cleared.md",
        reviewType: "Source-Fidelity",
        result: "PASS",
        reviewReference: "stewardship/reviews/sf-pass.review.md",
        reviewedAt: "2026-08-26T14:30:00Z",
        reviewerOrRole: "Steward",
        clearanceState: "APPROVED",
        evidenceFingerprint: fingerprint
      }
    ];

    const result = evaluateReadiness(testTmpDir, registry, manifest, clearances);
    assert.strictEqual(result.counters.READY_BY_CLEARANCE, 1);
    assert.strictEqual(result.articles[0].readinessState, 'READY_BY_CLEARANCE');
    assert.strictEqual(result.m5Preflight, 'READY');
  });

  test('R10: ineffective clearance -> NOT_READY', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    const articleName = 'article-cleared-ineffective.md';
    writeMockArticle(articleName, `---
title: "Article Cleared Ineffective"
publicationState: "published"
provenanceRef: "EV-BG-106"
---`);

    const registry = [
      {
        eventId: "EV-BG-106",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];
    const manifest = [
      {
        eventId: "EV-BG-106",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: "f26eec55fb363ff00281f4d9ddf00391fb1b3477031005c5042be1aa36c58280",
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('sf-pass-2.review.md', `---
subject: "src/content/learning/article-cleared-ineffective.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/sf-pass-ev-bg-106.md)');

    writeMockEvidence('sf-pass-ev-bg-106.md', `
- **eventId**: \`EV-BG-106\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    // Clearance has WRONG fingerprint
    const clearances = [
      {
        eventId: "EV-BG-106",
        resolutionState: "FIDELITY_UNCONFIRMED",
        clearanceScope: "ARTICLE_EVENT",
        subjectType: "learning-article",
        subjectId: "src/content/learning/article-cleared-ineffective.md",
        reviewType: "Source-Fidelity",
        result: "PASS",
        reviewReference: "stewardship/reviews/sf-pass-2.review.md",
        reviewedAt: "2026-08-26T14:30:00Z",
        reviewerOrRole: "Steward",
        clearanceState: "APPROVED",
        evidenceFingerprint: "WRONG_FINGERPRINT_123456"
      }
    ];

    const result = evaluateReadiness(testTmpDir, registry, manifest, clearances);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('RUNTIME_NOT_PASS') || result.articles[0].reasons.includes('CLEARANCE_INEFFECTIVE'));
  });

  test('Counter tests - Natural scope and invariant checks', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    // 1. Write multiple articles referencing the same event
    writeMockArticle('article-a.md', `---
title: "Article A"
publicationState: "published"
provenanceRef: "EV-BG-107"
---`);
    writeMockArticle('article-b.md', `---
title: "Article B"
publicationState: "published"
provenanceRef: "EV-BG-107"
---`);

    const registry = [
      {
        eventId: "EV-BG-107",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];
    const manifest = [
      {
        eventId: "EV-BG-107",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "NOT_AVAILABLE",
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    // Reviews for both subjects
    writeMockReview('rev-a.review.md', `---
subject: "src/content/learning/article-a.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-107.md)');
    writeMockReview('rev-b.review.md', `---
subject: "src/content/learning/article-b.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-107.md)');

    writeMockEvidence('ev-bg-107.md', `
- **eventId**: \`EV-BG-107\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    
    assert.strictEqual(result.counters.TOTAL_PUBLISHED_ARTICLES, 2);
    assert.strictEqual(result.counters.NOT_READY, 2);

    // Verify counter sum invariant
    const sum = result.counters.READY_UNCLEARED + result.counters.READY_BY_CLEARANCE + result.counters.NOT_READY;
    assert.strictEqual(sum, result.counters.TOTAL_PUBLISHED_ARTICLES);
  });

  test('Counter tests - Zero published articles case is handled safely', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    const result = evaluateReadiness(testTmpDir, [], [], []);
    assert.strictEqual(result.counters.TOTAL_PUBLISHED_ARTICLES, 0);
    assert.strictEqual(result.counters.NOT_READY, 0);
    assert.strictEqual(result.m5Preflight, 'NOT_READY'); // Safe posture
  });

  test('B5R-01: Test 1 — Exact identity ready path', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.READY_UNCLEARED, 1);
    assert.strictEqual(result.articles[0].readinessState, 'READY_UNCLEARED');
    assert.deepStrictEqual(result.articles[0].reasons, []);
  });

  test('B5R-01: Test 2 — sourceProject mismatch', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    // sourceProject has mismatched value "other-project"
    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`other-project\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_EVIDENCE_MISSING'));
  });

  test('B5R-01: Test 3 — sourceSystem mismatch', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    // sourceSystem has mismatched value "dms"
    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`dms\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_EVIDENCE_MISSING'));
  });

  test('B5R-01: Test 4 — sourceLocator mismatch', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    // sourceLocator has mismatched value
    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/other.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_EVIDENCE_MISSING'));
  });

  test('B5R-01: Test 5 — historicalLocatorState mismatch', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    // historicalLocatorState has mismatched value
    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`UNAVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_EVIDENCE_MISSING'));
  });

  test('B5R-01: Test 6 — historicalLocator mismatch', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    // historicalLocator has mismatched value (xyz2 vs xyz)
    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz2\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_EVIDENCE_MISSING'));
  });

  test('B5R-01: Test 7 — zero exact evidence packets', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`); // no evidence links at all

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_EVIDENCE_MISSING'));
  });

  test('B5R-01: Test 8 — multiple exact evidence packets', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    // Reference two different files
    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence1](stewardship/evidence/ev-bg-108-a.md) and [evidence2](stewardship/evidence/ev-bg-108-b.md)');

    // Both have exact identical content matching the registry
    const exactEvidence = `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`;
    writeMockEvidence('ev-bg-108-a.md', exactEvidence);
    writeMockEvidence('ev-bg-108-b.md', exactEvidence);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('SOURCE_FIDELITY_EVIDENCE_AMBIGUOUS'));
  });

  test('B5R-01: Test 9 — multiple Source-Fidelity reviews', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    // Write two reviews with the same subject and reviewType
    writeMockReview('rev-1.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    writeMockReview('rev-2.review.md', `---
subject: "src/content/learning/article-1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.NOT_READY, 1);
    assert.ok(result.articles[0].reasons.includes('MULTIPLE_SOURCE_FIDELITY_REVIEWS'));
  });

  test('B5R-02: Test 10 — reverse filesystem/write order', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    // Write multiple articles. Their names are chosen to be in reverse alphabetical order of insertion
    writeMockArticle('c-article.md', `---
title: "Article C"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);
    writeMockArticle('a-article.md', `---
title: "Article A"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);
    writeMockArticle('b-article.md', `---
title: "Article B"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const result = evaluateReadiness(testTmpDir, [], [], []);
    
    // They must be returned sorted by subjectId ascending
    assert.strictEqual(result.articles.length, 3);
    assert.strictEqual(result.articles[0].subjectId, 'src/content/learning/a-article.md');
    assert.strictEqual(result.articles[1].subjectId, 'src/content/learning/b-article.md');
    assert.strictEqual(result.articles[2].subjectId, 'src/content/learning/c-article.md');
  });

  test('B5R-02: Test 11 — deterministic serialized JSON', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    writeMockArticle('article-1.md', `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    const result1 = evaluateReadiness(testTmpDir, registry, [], []);
    const result2 = evaluateReadiness(testTmpDir, registry, [], []);

    const json1 = JSON.stringify(result1, null, 2);
    const json2 = JSON.stringify(result2, null, 2);

    assert.strictEqual(json1, json2);
  });

  test('B5R-02: Test 12 — one NOT_READY article does not block another article', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    // Article A is invalid (missing provenanceRef)
    writeMockArticle('a-article.md', `---
title: "Article A"
publicationState: "published"
---`);

    // Article B is valid
    writeMockArticle('b-article.md', `---
title: "Article B"
publicationState: "published"
provenanceRef: "EV-BG-108"
---`);

    const registry = [
      {
        eventId: "EV-BG-108",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz"
      }
    ];

    writeMockSourceFile("validation/some.js", "mock source file content");
    const mockHash = crypto.createHash('sha256').update('mock source file content').digest('hex');

    const manifest = [
      {
        eventId: "EV-BG-108",
        sourceSystem: "git",
        sourceLocator: "validation/some.js",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "xyz",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: mockHash,
        capturedAt: "2026-08-26T14:30:00Z"
      }
    ];

    writeMockReview('rev-b.review.md', `---
subject: "src/content/learning/b-article.md"
reviewType: "Source-Fidelity"
result: "PASS"
---`, 'Matches [evidence](stewardship/evidence/ev-bg-108.md)');

    writeMockEvidence('ev-bg-108.md', `
- **eventId**: \`EV-BG-108\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`);

    const result = evaluateReadiness(testTmpDir, registry, manifest, []);
    assert.strictEqual(result.counters.TOTAL_PUBLISHED_ARTICLES, 2);
    
    // a-article should be NOT_READY
    const artA = result.articles.find((a: any) => a.subjectId === 'src/content/learning/a-article.md');
    assert.ok(artA);
    assert.strictEqual(artA.readinessState, 'NOT_READY');

    // b-article should be READY_UNCLEARED
    const artB = result.articles.find((a: any) => a.subjectId === 'src/content/learning/b-article.md');
    assert.ok(artB);
    assert.strictEqual(artB.readinessState, 'READY_UNCLEARED');
  });

  test('B5R-V1-03: Null Test 1 — Canonical null is parsed to JavaScript null and matches', () => {
    const registryEntry = {
      eventId: "EV-BG-109",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "validation/some.js",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null
    };

    const evidenceContent = `
- **eventId**: \`EV-BG-109\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`UNAVAILABLE\`
- **historicalLocator**: \`null\`
`;

    const parsed = parseEvidencePacket(evidenceContent);
    assert.strictEqual(parsed.historicalLocator, null);
    
    const matched = matchEvidencePacket(parsed, registryEntry);
    assert.strictEqual(matched, true);
  });

  test('B5R-V1-03: Null Test 2 — Missing field does not match', () => {
    const registryEntry = {
      eventId: "EV-BG-109",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "validation/some.js",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null
    };

    const evidenceContent = `
- **eventId**: \`EV-BG-109\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`UNAVAILABLE\`
`;

    const parsed = parseEvidencePacket(evidenceContent);
    const matched = matchEvidencePacket(parsed, registryEntry);
    assert.strictEqual(matched, false);
  });

  test('B5R-V1-03: Null Test 3 — Empty field does not match', () => {
    const registryEntry = {
      eventId: "EV-BG-109",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "validation/some.js",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null
    };

    const evidenceContent = `
- **eventId**: \`EV-BG-109\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`UNAVAILABLE\`
- **historicalLocator**:
`;

    const parsed = parseEvidencePacket(evidenceContent);
    const matched = matchEvidencePacket(parsed, registryEntry);
    assert.strictEqual(matched, false);
  });

  test('B5R-V1-03: Null Test 4 — Quoted string null does not match', () => {
    const registryEntry = {
      eventId: "EV-BG-109",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "validation/some.js",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null
    };

    const evidenceContent = `
- **eventId**: \`EV-BG-109\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`UNAVAILABLE\`
- **historicalLocator**: "null"
`;

    const parsed = parseEvidencePacket(evidenceContent);
    assert.strictEqual(parsed.historicalLocator, '"null"');
    const matched = matchEvidencePacket(parsed, registryEntry);
    assert.strictEqual(matched, false);
  });

  test('B5R-V1-03: Field-specific normalization test — conversion is not generic parser-wide coercion', () => {
    const evidenceContent = `
- **historicalLocator**: \`null\`
- **someOtherField**: \`null\`
`;

    const parsed = parseEvidencePacket(evidenceContent);
    // historicalLocator must be normalized to JavaScript null
    assert.strictEqual(parsed.historicalLocator, null);
    // someOtherField must remain string "null", not gained identity authority or generically coerced
    assert.strictEqual(parsed.someOtherField, "null");
  });
});
