import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import nodeCrypto from 'node:crypto';

const repoRoot = path.resolve(process.cwd(), '..');
const resolverPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_resolver.js')).href;

// @ts-ignore
const {
  parseFrontmatter,
  getReviewSubject,
  computeExpectedFingerprint,
  resolveArticleProvenance,
  resolveAllArticlesProvenance
} = await import(resolverPath);

// Helper to write temporary files inside tests and clean them up
function withTempFile(filePath: string, content: string, fn: () => void) {
  const fullPath = path.join(repoRoot, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  try {
    fn();
  } finally {
    try {
      fs.unlinkSync(fullPath);
    } catch {
      // ignore
    }
  }
}

test('B3: Frontmatter Parser - parses basic frontmatter', () => {
  const content = `---\ntitle: "Test"\nprovenanceRef: "EV-BG-001"\n---`;
  const parsed = parseFrontmatter(content);
  assert.strictEqual(parsed.title, "Test");
  assert.strictEqual(parsed.provenanceRef, "EV-BG-001");
});

test('B3: Review Subject Parser - strict frontmatter-only matching', () => {
  // yaml frontmatter subject works
  const content = `---\nsubject: "src/content/learning/test.md"\n---`;
  assert.strictEqual(getReviewSubject(content), "src/content/learning/test.md");

  // missing subject works
  const contentNoSubject = `---\ntitle: "No subject"\n---`;
  assert.strictEqual(getReviewSubject(contentNoSubject), null);

  // sourceArtifact only does NOT work (B3R-03)
  const contentSourceArtifact = `---\nsourceArtifact: "src/content/learning/test.md"\n---`;
  assert.strictEqual(getReviewSubject(contentSourceArtifact), null);

  // free-form prose subject does NOT work (B3R-03)
  const contentProse = `* **Subject**: src/content/learning/test.md`;
  assert.strictEqual(getReviewSubject(contentProse), null);
});

test('B3: Fingerprint - canonical JSON serialization is deterministic', () => {
  const active1 = {
    eventId: "EV-BG-001",
    sourceProject: "bridgenta-core",
    sourceSystem: "git",
    sourceLocator: "package.json",
    historicalLocatorState: "AVAILABLE",
    historicalLocator: "123",
    resolutionState: "RESOLVED",
    clearanceScope: "EVENT"
  };
  // Shuffled keys in constructor input
  const active2 = {
    clearanceScope: "EVENT",
    historicalLocator: "123",
    historicalLocatorState: "AVAILABLE",
    sourceLocator: "package.json",
    sourceSystem: "git",
    sourceProject: "bridgenta-core",
    eventId: "EV-BG-001",
    resolutionState: "RESOLVED"
  };

  const hash1 = computeExpectedFingerprint(active1);
  const hash2 = computeExpectedFingerprint(active2);
  assert.strictEqual(hash1, hash2);
  assert.match(hash1, /^[a-f0-9]{64}$/);
});

test('B3: Article resolution - article without provenanceRef -> non-blocking', () => {
  const contentNoRef = `---\ntitle: "No Ref"\n---`;
  withTempFile('src/content/learning/temp-no-ref.md', contentNoRef, () => {
    const result = resolveArticleProvenance(
      'src/content/learning/temp-no-ref.md',
      repoRoot,
      [],
      [],
      []
    );
    assert.strictEqual(result.provenanceRef, null);
    assert.strictEqual(result.baseResolutionState, null);
    assert.strictEqual(result.effectiveGateResult, "PASS");
    assert.strictEqual(result.clearanceApplied, false);
    assert.strictEqual(result.reason, "NO_PROVENANCE_REF");
  });
});

test('B3: Article resolution - unknown event -> UNKNOWN_EVENT advisory', () => {
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    const result = resolveArticleProvenance(
      'src/content/learning/temp-test-article.md',
      repoRoot,
      [],
      [],
      []
    );
    assert.strictEqual(result.provenanceRef, "EV-BG-001");
    assert.strictEqual(result.baseResolutionState, "UNKNOWN_EVENT");
    assert.strictEqual(result.effectiveGateResult, "FAIL");
    assert.strictEqual(result.clearanceApplied, false);
    assert.strictEqual(result.reason, "UNKNOWN_EVENT");
  });
});

test('B3: Article resolution - duplicate event ID -> structural failure', () => {
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    },
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    assert.throws(() => {
      resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        [],
        []
      );
    }, /Duplicate eventId/);
  });
});

test('B3: Article resolution - EVENT clearance matching', () => {
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null
    }
  ];
  const manifest = [
    {
      eventId: "EV-BG-001",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null,
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];

  const activeEvidence = {
    eventId: "EV-BG-001",
    sourceProject: "bridgenta-core",
    sourceSystem: "git",
    sourceLocator: "package.json",
    historicalLocatorState: "UNAVAILABLE",
    historicalLocator: null,
    resolutionState: "HISTORICAL_LOCATOR_UNAVAILABLE",
    clearanceScope: "EVENT"
  };

  const clearance = {
    eventId: "EV-BG-001",
    resolutionState: "HISTORICAL_LOCATOR_UNAVAILABLE",
    clearanceScope: "EVENT",
    subjectType: null,
    subjectId: null,
    reviewType: "Source-Fidelity",
    result: "PASS",
    reviewReference: "stewardship/reviews/test-rev.review.md",
    reviewedAt: "2026-08-26T10:00:00Z",
    reviewerOrRole: "Reviewer A",
    clearanceState: "APPROVED",
    evidenceFingerprint: computeExpectedFingerprint(activeEvidence)
  };

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    withTempFile('stewardship/reviews/test-rev.review.md', 'Some review text', () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [clearance]
      );
      assert.strictEqual(result.effectiveGateResult, "PASS");
      assert.strictEqual(result.clearanceApplied, true);
      assert.strictEqual(result.baseResolutionState, "HISTORICAL_LOCATOR_UNAVAILABLE");
      assert.strictEqual(result.reason, "CLEARED_HISTORICAL_LOCATOR_UNAVAILABLE");
    });
  });
});

test('B3: Article resolution - evidence field changes invalidate EVENT clearance (B3R-01)', () => {
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null
    }
  ];
  const manifest = [
    {
      eventId: "EV-BG-001",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null,
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];

  // Fingerprint computed for a DIFFERENT sourceProject ("other-project")
  const alteredEvidence = {
    eventId: "EV-BG-001",
    sourceProject: "other-project", // mismatched field
    sourceSystem: "git",
    sourceLocator: "package.json",
    historicalLocatorState: "UNAVAILABLE",
    historicalLocator: null,
    resolutionState: "HISTORICAL_LOCATOR_UNAVAILABLE",
    clearanceScope: "EVENT"
  };

  const clearance = {
    eventId: "EV-BG-001",
    resolutionState: "HISTORICAL_LOCATOR_UNAVAILABLE",
    clearanceScope: "EVENT",
    subjectType: null,
    subjectId: null,
    reviewType: "Source-Fidelity",
    result: "PASS",
    reviewReference: "stewardship/reviews/test-rev.review.md",
    reviewedAt: "2026-08-26T10:00:00Z",
    reviewerOrRole: "Reviewer A",
    clearanceState: "APPROVED",
    evidenceFingerprint: computeExpectedFingerprint(alteredEvidence)
  };

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    withTempFile('stewardship/reviews/test-rev.review.md', 'Some review text', () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [clearance]
      );
      // Fingerprint mismatch renders clearance ineffective
      assert.strictEqual(result.effectiveGateResult, "FAIL");
      assert.strictEqual(result.clearanceApplied, false);
    });
  });
});

test('B3: Article resolution - resolutionState exact matching (B3R-02)', () => {
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  const manifest = [
    {
      eventId: "EV-BG-001",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123",
      localVerificationState: "NOT_AVAILABLE", // derives SOURCE_UNAVAILABLE
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];

  // Try SOURCE_DELETED clearance to clear SOURCE_UNAVAILABLE base state. Must fail.
  const activeEvidence = {
    eventId: "EV-BG-001",
    sourceProject: "bridgenta-core",
    sourceSystem: "git",
    sourceLocator: "package.json",
    historicalLocatorState: "AVAILABLE",
    historicalLocator: "123",
    resolutionState: "SOURCE_DELETED", // mismatched resolution state
    clearanceScope: "EVENT"
  };

  const clearance = {
    eventId: "EV-BG-001",
    resolutionState: "SOURCE_DELETED",
    clearanceScope: "EVENT",
    subjectType: null,
    subjectId: null,
    reviewType: "Source-Fidelity",
    result: "PASS",
    reviewReference: "stewardship/reviews/test-rev.review.md",
    reviewedAt: "2026-08-26T10:00:00Z",
    reviewerOrRole: "Reviewer A",
    clearanceState: "APPROVED",
    evidenceFingerprint: computeExpectedFingerprint(activeEvidence)
  };

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    withTempFile('stewardship/reviews/test-rev.review.md', 'Some review text', () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [clearance]
      );
      assert.strictEqual(result.effectiveGateResult, "FAIL");
      assert.strictEqual(result.clearanceApplied, false);
    });
  });
});

test('B3: Article resolution - ARTICLE_EVENT exact review subject matching (B3R-03)', () => {
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  const manifest = [
    {
      eventId: "EV-BG-001",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123",
      localVerificationState: "AVAILABLE",
      integrityEvidenceType: "sha256",
      integrityEvidenceValue: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3", // simulated mismatch
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];

  const activeEvidence = {
    eventId: "EV-BG-001",
    sourceProject: "bridgenta-core",
    sourceSystem: "git",
    sourceLocator: "package.json",
    historicalLocatorState: "AVAILABLE",
    historicalLocator: "123",
    resolutionState: "FIDELITY_UNCONFIRMED",
    clearanceScope: "ARTICLE_EVENT",
    subjectType: "learning-article",
    subjectId: "src/content/learning/temp-test-article.md"
  };

  const clearance = {
    eventId: "EV-BG-001",
    resolutionState: "FIDELITY_UNCONFIRMED",
    clearanceScope: "ARTICLE_EVENT",
    subjectType: "learning-article",
    subjectId: "src/content/learning/temp-test-article.md",
    reviewType: "Source-Fidelity",
    result: "PASS",
    reviewReference: "stewardship/reviews/test-rev.review.md",
    reviewedAt: "2026-08-26T10:00:00Z",
    reviewerOrRole: "Reviewer A",
    clearanceState: "APPROVED",
    evidenceFingerprint: computeExpectedFingerprint(activeEvidence)
  };

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    // 1. Success case: Exact yaml subject matches
    const reviewSuccess = `---\nsubject: "src/content/learning/temp-test-article.md"\n---`;
    withTempFile('stewardship/reviews/test-rev.review.md', reviewSuccess, () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [clearance]
      );
      assert.strictEqual(result.effectiveGateResult, "PASS");
      assert.strictEqual(result.clearanceApplied, true);
      assert.strictEqual(result.baseResolutionState, "FIDELITY_UNCONFIRMED"); // base state preserved
    });

    // 2. Failure case: Missing subject in review frontmatter
    const reviewMissing = `---\ntitle: "Messed up"\n---`;
    withTempFile('stewardship/reviews/test-rev.review.md', reviewMissing, () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [clearance]
      );
      assert.strictEqual(result.effectiveGateResult, "FAIL");
    });

    // 3. Failure case: Mismatched subject value in review
    const reviewWrong = `---\nsubject: "src/content/learning/wrong-path.md"\n---`;
    withTempFile('stewardship/reviews/test-rev.review.md', reviewWrong, () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [clearance]
      );
      assert.strictEqual(result.effectiveGateResult, "FAIL");
    });
  });
});

test('B3: Article resolution - valid checksum match', () => {
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];

  const fileContent = fs.readFileSync(path.join(repoRoot, 'package.json'));
  const computedHash = nodeCrypto.createHash('sha256').update(fileContent).digest('hex');

  const manifest = [
    {
      eventId: "EV-BG-001",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123",
      localVerificationState: "AVAILABLE",
      integrityEvidenceType: "sha256",
      integrityEvidenceValue: computedHash,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    const result = resolveArticleProvenance(
      'src/content/learning/temp-test-article.md',
      repoRoot,
      registry,
      manifest,
      []
    );
    assert.strictEqual(result.effectiveGateResult, "PASS");
    assert.strictEqual(result.baseResolutionState, "RESOLVED");
  });
});

test('B3: Article resolution - empty production registry does not break site build', () => {
  const results = resolveAllArticlesProvenance(repoRoot, [], [], []);
  assert.ok(Array.isArray(results));
  const prodArticleResult = results.find(r => r.subjectId === 'src/content/learning/grenzen-automatisierter-linter-checks.md');
  assert.ok(prodArticleResult);
  assert.strictEqual(prodArticleResult.provenanceRef, "EV-BG-001");
  assert.strictEqual(prodArticleResult.effectiveGateResult, "FAIL");
  assert.strictEqual(prodArticleResult.reason, "UNKNOWN_EVENT");
});

test('B4: Article 1 resolves to PASS and RESOLVED with production registry', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'data', 'provenance_registry.json'), 'utf-8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'data', 'local_integrity_manifest.json'), 'utf-8'));
  const clearances = JSON.parse(fs.readFileSync(path.join(repoRoot, 'stewardship', 'reviews', 'clearances_manifest.json'), 'utf-8'));

  const result = resolveArticleProvenance(
    'src/content/learning/grenzen-automatisierter-linter-checks.md',
    repoRoot,
    registry,
    manifest,
    clearances
  );

  assert.strictEqual(result.provenanceRef, "EV-BG-001");
  assert.strictEqual(result.baseResolutionState, "RESOLVED");
  assert.strictEqual(result.effectiveGateResult, "PASS");
  assert.strictEqual(result.clearanceApplied, false);
});

test('B4R: Evidence packet and Source-Fidelity review compliance checks', () => {
  // 1. Verify evidence packet existence and key properties
  const evidencePath = path.join(repoRoot, 'stewardship', 'evidence', 'article-1-ev-bg-001-source-evidence.md');
  assert.ok(fs.existsSync(evidencePath), "Evidence packet must exist.");
  const evidenceContent = fs.readFileSync(evidencePath, 'utf-8');
  assert.ok(evidenceContent.includes('eventId'), "Evidence must bind eventId.");
  assert.ok(evidenceContent.includes('EV-BG-001'), "Evidence must bind EV-BG-001.");
  assert.ok(evidenceContent.includes('historicalLocator'), "Evidence must bind historicalLocator.");
  assert.ok(evidenceContent.includes('07aac848a4a48282c8b83169179308bdb17db0c6'), "Evidence must bind historical commit.");
  assert.ok(evidenceContent.includes('SOURCE_FILE_HASH_AT_HISTORICAL_REVISION'), "Evidence must record historical file hash.");
  assert.ok(evidenceContent.includes('f26eec55fb363ff00281f4d9ddf00391fb1b3477031005c5042be1aa36c58280'), "Evidence must record correct hash value.");
  assert.ok(evidenceContent.includes('LOCAL_GIT_EVIDENCE'), "Evidence must specify local git evidence.");

  // 2. Verify corrected review timestamp format and content
  const reviewPath = path.join(repoRoot, 'stewardship', 'reviews', 'grenzen-automatisierter-linter-checks.review.md');
  assert.ok(fs.existsSync(reviewPath), "Fidelity review must exist.");
  const reviewContent = fs.readFileSync(reviewPath, 'utf-8');
  
  // Extract and check frontmatter reviewedAt
  const fm = parseFrontmatter(reviewContent);
  assert.ok(fm.reviewedAt, "reviewedAt timestamp must be defined.");
  assert.match(fm.reviewedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/, "reviewedAt must be valid ISO 8601.");
  
  // Verify classifications corrected
  assert.ok(reviewContent.includes('DERIVED') || reviewContent.includes('INFERENCE'), "Review must contain corrected DERIVED / INFERENCE classifications.");
  assert.ok(reviewContent.includes('DIRECT'), "Review must contain DIRECT classifications.");
  
  // Verify Fresh Reader locators
  assert.ok(reviewContent.includes('docs/becc/standards/BECC-PUBLIC-LEARNING-STANDARD-v1.0.md'), "Review must contain exact Fresh-Reader locator.");
  assert.ok(reviewContent.includes('a92301010557193bfb1e6696b39d26f0880f832c'), "Review must contain exact Fresh-Reader commit SHA.");
});


