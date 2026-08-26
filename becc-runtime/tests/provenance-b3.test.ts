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
  computeClearanceFingerprint,
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

test('B3: Review Subject Parser - extracts subject from review file', () => {
  const content = `---\nsubject: "src/content/learning/test.md"\n---`;
  assert.strictEqual(getReviewSubject(content), "src/content/learning/test.md");

  const content2 = `* **Subject**: src/content/learning/test2.md`;
  assert.strictEqual(getReviewSubject(content2), "src/content/learning/test2.md");

  const content3 = `Source Artifact: src/content/learning/test3.md`;
  assert.strictEqual(getReviewSubject(content3), "src/content/learning/test3.md");
});

test('B3: Article resolution - article without provenanceRef -> non-blocking', () => {
  // Use production article which has no provenanceRef
  const result = resolveArticleProvenance(
    'src/content/learning/grenzen-automatisierter-linter-checks.md',
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

test('B3: Article resolution - unknown event -> UNKNOWN_EVENT advisory', () => {
  // Use a temporary article with provenanceRef
  const articleContent = `---\ntitle: "Temp"\nprovenanceRef: "EV-BG-001"\n---`;
  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    const result = resolveArticleProvenance(
      'src/content/learning/temp-test-article.md',
      repoRoot,
      [], // Empty registry
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

test('B3: Article resolution - valid provenanceRef + matching registry event -> resolves', () => {
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
      localVerificationState: "NOT_AVAILABLE", // resolved with source unavailable
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
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
    assert.strictEqual(result.provenanceRef, "EV-BG-001");
    assert.strictEqual(result.baseResolutionState, "SOURCE_UNAVAILABLE");
    assert.strictEqual(result.effectiveGateResult, "FAIL");
    assert.strictEqual(result.clearanceApplied, false);
    assert.strictEqual(result.reason, "UNRESOLVED_SOURCE_UNAVAILABLE");
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
      eventId: "EV-BG-001", // Duplicate
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
    evidenceFingerprint: ""
  };
  clearance.evidenceFingerprint = computeClearanceFingerprint(clearance);

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

test('B3: Article resolution - ARTICLE_EVENT clearance matching and wrong-subject rejection', () => {
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

  // Positive clearance matching
  const clearance = {
    eventId: "EV-BG-001",
    resolutionState: "FIDELITY_UNCONFIRMED",
    clearanceScope: "ARTICLE_EVENT",
    subjectType: "learning-article",
    subjectId: "src/content/learning/temp-test-article.md",
    reviewType: "Source-Fidelity",
    result: "PASS",
    reviewReference: "stewardship/reviews/test-rev2.review.md",
    reviewedAt: "2026-08-26T10:00:00Z",
    reviewerOrRole: "Reviewer A",
    clearanceState: "APPROVED",
    evidenceFingerprint: ""
  };
  clearance.evidenceFingerprint = computeClearanceFingerprint(clearance);

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    // 1. Positive case: Subject matches review content
    const reviewContent = `---\nsubject: "src/content/learning/temp-test-article.md"\n---`;
    withTempFile('stewardship/reviews/test-rev2.review.md', reviewContent, () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [clearance]
      );
      assert.strictEqual(result.effectiveGateResult, "PASS");
      assert.strictEqual(result.clearanceApplied, true);
      assert.strictEqual(result.baseResolutionState, "FIDELITY_UNCONFIRMED");
    });

    // 2. Negative case: Wrong subject path in review content
    const reviewContentWrong = `---\nsubject: "src/content/learning/some-other-article.md"\n---`;
    withTempFile('stewardship/reviews/test-rev2.review.md', reviewContentWrong, () => {
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

    // 3. Negative case: Wrong subjectId in clearance record
    const badClearance = { ...clearance, subjectId: "src/content/learning/wrong-path.md" };
    badClearance.evidenceFingerprint = computeClearanceFingerprint(badClearance);
    withTempFile('stewardship/reviews/test-rev2.review.md', reviewContent, () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [badClearance]
      );
      assert.strictEqual(result.effectiveGateResult, "FAIL");
    });
  });
});

test('B3: Article resolution - expired/revoked clearance ineffective', () => {
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

  const expiredClearance = {
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
    clearanceState: "EXPIRED", // EXPIRED
    evidenceFingerprint: ""
  };
  expiredClearance.evidenceFingerprint = computeClearanceFingerprint(expiredClearance);

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    withTempFile('stewardship/reviews/test-rev.review.md', 'Some review text', () => {
      const result = resolveArticleProvenance(
        'src/content/learning/temp-test-article.md',
        repoRoot,
        registry,
        manifest,
        [expiredClearance]
      );
      assert.strictEqual(result.effectiveGateResult, "FAIL");
      assert.strictEqual(result.clearanceApplied, false);
    });
  });
});

test('B3: Article resolution - missing reviewReference target -> ineffective', () => {
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

  const clearance = {
    eventId: "EV-BG-001",
    resolutionState: "HISTORICAL_LOCATOR_UNAVAILABLE",
    clearanceScope: "EVENT",
    subjectType: null,
    subjectId: null,
    reviewType: "Source-Fidelity",
    result: "PASS",
    reviewReference: "stewardship/reviews/non-existent-review-file.review.md", // missing file
    reviewedAt: "2026-08-26T10:00:00Z",
    reviewerOrRole: "Reviewer A",
    clearanceState: "APPROVED",
    evidenceFingerprint: ""
  };
  clearance.evidenceFingerprint = computeClearanceFingerprint(clearance);

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
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

test('B3: Article resolution - fingerprint mismatch -> ineffective', () => {
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
    evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3" // tampered fingerprint
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

test('B3: Article resolution - historical locator unavailable -> no fallback', () => {
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

  withTempFile('src/content/learning/temp-test-article.md', articleContent, () => {
    const result = resolveArticleProvenance(
      'src/content/learning/temp-test-article.md',
      repoRoot,
      registry,
      manifest,
      []
    );
    assert.strictEqual(result.effectiveGateResult, "FAIL");
    assert.strictEqual(result.baseResolutionState, "HISTORICAL_LOCATOR_UNAVAILABLE");
  });
});

test('B3: Article resolution - empty production registry does not break site build', () => {
  const results = resolveAllArticlesProvenance(repoRoot, [], [], []);
  // Should successfully complete and contain the production article with PASS/NO_PROVENANCE_REF
  assert.ok(Array.isArray(results));
  const prodArticleResult = results.find(r => r.subjectId === 'src/content/learning/grenzen-automatisierter-linter-checks.md');
  assert.ok(prodArticleResult);
  assert.strictEqual(prodArticleResult.effectiveGateResult, "PASS");
  assert.strictEqual(prodArticleResult.reason, "NO_PROVENANCE_REF");
});
