import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(process.cwd(), '..');
const validatorPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_validator.js')).href;
const generatorPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_integrity_generator.js')).href;

// @ts-ignore
const { validateNamespaceMap, validateRegistry, validateManifest, validateClearances, PROJECT_NAMESPACE_MAP } = await import(validatorPath);

// @ts-ignore
const { generateIntegrityManifest } = await import(generatorPath);

test('B2: Namespace Map - Validates default project namespace map', () => {
  const result = validateNamespaceMap(PROJECT_NAMESPACE_MAP);
  assert.ok(result);
});

test('B2: Namespace Map - Rejects duplicate projectId', () => {
  const badMap = [
    { projectId: "p1", currentName: "n1", aliases: [], prefix: "PA", status: "ACTIVE" },
    { projectId: "p1", currentName: "n2", aliases: [], prefix: "PB", status: "ACTIVE" }
  ];
  assert.throws(() => validateNamespaceMap(badMap), /Duplicate projectId/);
});

test('B2: Namespace Map - Rejects duplicate currentName', () => {
  const badMap = [
    { projectId: "p1", currentName: "n1", aliases: [], prefix: "PA", status: "ACTIVE" },
    { projectId: "p2", currentName: "n1", aliases: [], prefix: "PB", status: "ACTIVE" }
  ];
  assert.throws(() => validateNamespaceMap(badMap), /Duplicate currentName/);
});

test('B2: Namespace Map - Rejects alias collision', () => {
  const badMap = [
    { projectId: "p1", currentName: "n1", aliases: ["collided"], prefix: "PA", status: "ACTIVE" },
    { projectId: "p2", currentName: "n2", aliases: ["collided"], prefix: "PB", status: "ACTIVE" }
  ];
  assert.throws(() => validateNamespaceMap(badMap), /Globally collided alias token/);
});

test('B2: Namespace Map - Rejects prefix collision', () => {
  const badMap = [
    { projectId: "p1", currentName: "n1", aliases: [], prefix: "PA", status: "ACTIVE" },
    { projectId: "p2", currentName: "n2", aliases: [], prefix: "PA", status: "ACTIVE" }
  ];
  assert.throws(() => validateNamespaceMap(badMap), /Duplicate prefix/);
});

test('B2: Namespace Map - Rejects retired token reuse', () => {
  const badMap = [
    { projectId: "p1", currentName: "n1", aliases: ["token-x"], prefix: "PA", status: "RETIRED" },
    { projectId: "p2", currentName: "token-x", aliases: [], prefix: "PB", status: "ACTIVE" }
  ];
  assert.throws(() => validateNamespaceMap(badMap), /Retired namespace token reused/);
});

test('B2: Namespace Map - Rejects additional property', () => {
  const badMap = [
    { projectId: "p1", currentName: "n1", aliases: [], prefix: "PA", status: "ACTIVE", unknownField: "bad" }
  ];
  assert.throws(() => validateNamespaceMap(badMap), /Additional properties not allowed/);
});

test('B2: Registry - Validates valid registry entry', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "bbbe2607af15443af1aca88ebad558cfb01fe2dc"
    }
  ];
  const result = validateRegistry(registry);
  assert.ok(result);
});

test('B2: Registry - Rejects invalid event ID syntax', () => {
  const invalidIds = ["BG-001", "EV-bg-001", "EV-B-001", "EV-ABCDE-001", "EV-BG-1", "EV-BG-123456"];
  for (const id of invalidIds) {
    const registry = [
      {
        eventId: id,
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "src/content/config.ts",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "bbbe2607af15443af1aca88ebad558cfb01fe2dc"
      }
    ];
    assert.throws(() => validateRegistry(registry), /Invalid eventId syntax/);
  }
});

test('B2: Registry - Rejects duplicate event ID', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    },
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  assert.throws(() => validateRegistry(registry), /Duplicate eventId in registry/);
});

test('B2: Registry - Rejects unsupported sourceSystem', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "unsupported-system-name",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  assert.throws(() => validateRegistry(registry), /UNSUPPORTED_SOURCE_SYSTEM/);
});

test('B2: Registry - Rejects historical AVAILABLE with null locator', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: null
    }
  ];
  assert.throws(() => validateRegistry(registry), /historicalLocator must be a non-empty string/);
});

test('B2: Registry - Rejects historical UNAVAILABLE with non-null locator', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: "some-locator-value"
    }
  ];
  assert.throws(() => validateRegistry(registry), /historicalLocator must be null/);
});

test('B2: Registry - Rejects event prefix / project prefix mismatch', () => {
  const customNamespaces = [
    {
      projectId: "bridgenta-core",
      currentName: "bridgenta-core",
      aliases: [],
      prefix: "BG",
      status: "ACTIVE"
    }
  ];
  const registry = [
    {
      eventId: "EV-LP-001", // LP prefix, but project is bridgenta-core (BG prefix)
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  assert.throws(() => validateRegistry(registry, customNamespaces), /EVENT_PROJECT_PREFIX_MISMATCH/);
});

test('B2: Registry - Validates correct prefix binding with aliases', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-workspace", // resolved via alias
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  const result = validateRegistry(registry);
  assert.ok(result);
});

test('B2: Registry - Rejects additional property', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/config.ts",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123",
      extraProperty: "unauthorized"
    }
  ];
  assert.throws(() => validateRegistry(registry), /Additional properties not allowed/);
});

test('B2: Manifest - Validates exact join/cardinality, fields, and correct verification states', () => {
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
      integrityEvidenceValue: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3", // 64 chars
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  const result = validateManifest(manifest, registry);
  assert.ok(result);
});

test('B2: Manifest - Rejects missing manifest entry', () => {
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
      eventId: "EV-BG-002",
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
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /Missing manifest entry for registry event/);
});

test('B2: Manifest - Rejects duplicate manifest entry', () => {
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
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    },
    {
      eventId: "EV-BG-001",
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123",
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /Duplicate eventId in manifest/);
});

test('B2: Manifest - Rejects orphan manifest entry', () => {
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
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    },
    {
      eventId: "EV-BG-002", // Orphan
      sourceSystem: "git",
      sourceLocator: "package.json",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123",
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /Orphan manifest entry found/);
});

test('B2: Manifest - Rejects AVAILABLE local verification with malformed checksum', () => {
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
      integrityEvidenceValue: "short-checksum", // malformed
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /integrityEvidenceValue must be a 64-char lowercase hex string/);
});

test('B2: Manifest - Rejects NOT_AVAILABLE local verification with non-null checksum', () => {
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
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: "sha256",
      integrityEvidenceValue: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3",
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /Integrity evidence must be null/);
});

test('B2: Manifest - Rejects invalid sourceSystem / localVerificationState combinations', () => {
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
      localVerificationState: "NOT_APPLICABLE", // Invalid for git
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /Invalid sourceSystem × localVerificationState combination/);
});

test('B2: Manifest - Rejects invalid historicalLocatorState / localVerificationState combinations', () => {
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
      localVerificationState: "AVAILABLE", // UNAVAILABLE historical state cannot yield AVAILABLE local state
      integrityEvidenceType: "sha256",
      integrityEvidenceValue: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3",
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /Invalid historicalLocatorState × localVerificationState combination/);
});

test('B2: Manifest - Accepts valid DMS OPTIONAL_NOT_CAPTURED case', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "dms",
      sourceLocator: "doc-id-123",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123"
    }
  ];
  const manifest = [
    {
      eventId: "EV-BG-001",
      sourceSystem: "dms",
      sourceLocator: "doc-id-123",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "123",
      localVerificationState: "OPTIONAL_NOT_CAPTURED",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z"
    }
  ];
  const result = validateManifest(manifest, registry);
  assert.ok(result);
});

test('B2: Manifest - Rejects additional property', () => {
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
      localVerificationState: "NOT_AVAILABLE",
      integrityEvidenceType: null,
      integrityEvidenceValue: null,
      capturedAt: "2026-08-26T10:00:00Z",
      unwantedProperty: "invalid"
    }
  ];
  assert.throws(() => validateManifest(manifest, registry), /Additional properties not allowed/);
});

test('B2: Clearances - Validates clearances with EVENT and ARTICLE_EVENT scopes', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: null,
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    },
    {
      eventId: "EV-BG-002",
      resolutionState: "FIDELITY_UNCONFIRMED",
      clearanceScope: "ARTICLE_EVENT",
      subjectType: "learning-article",
      subjectId: "src/content/learning/grenzen-automatisierter-linter-checks.md",
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-002.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer B",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  const result = validateClearances(clearances);
  assert.ok(result);
});

test('B2: Clearances - Rejects FIDELITY_UNCONFIRMED with EVENT clearance scope', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "FIDELITY_UNCONFIRMED",
      clearanceScope: "EVENT", // must be ARTICLE_EVENT
      subjectType: null,
      subjectId: null,
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /FIDELITY_UNCONFIRMED requires ARTICLE_EVENT/);
});

test('B2: Clearances - Rejects EVENT-scoped states with ARTICLE_EVENT clearance scope', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "ARTICLE_EVENT", // must be EVENT
      subjectType: "learning-article",
      subjectId: "src/content/learning/grenzen-automatisierter-linter-checks.md",
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /requires EVENT clearance scope/);
});

test('B2: Clearances - Rejects ARTICLE_EVENT missing subjectId', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "FIDELITY_UNCONFIRMED",
      clearanceScope: "ARTICLE_EVENT",
      subjectType: "learning-article",
      subjectId: "", // empty
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /Invalid subjectId/);
});

test('B2: Clearances - Rejects EVENT with non-null subjectId', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: "src/content/learning/some-article.md", // non-null
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /EVENT-scoped clearances must have null subjectType and subjectId/);
});

test('B2: Clearances - Rejects invalid reviewReference format', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: null,
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "file:///stewardship/reviews/rev-001.review.md", // invalid absolute format
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /Invalid reviewReference format/);
});

test('B2: Clearances - Rejects invalid fingerprint format', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: null,
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "short-fingerprint" // invalid length
    }
  ];
  assert.throws(() => validateClearances(clearances), /Invalid evidenceFingerprint format/);
});

test('B2: Clearances - Rejects reviewType != Source-Fidelity', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: null,
      reviewType: "fidelity-check", // not Source-Fidelity
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /Must be exactly 'Source-Fidelity'/);
});

test('B2: Clearances - Rejects result != PASS', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: null,
      reviewType: "Source-Fidelity",
      result: "FAIL", // not PASS
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /Must be exactly 'PASS'/);
});

test('B2: Clearances - Rejects invalid clearanceState', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: null,
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "PENDING", // not APPROVED | EXPIRED | REVOKED
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3"
    }
  ];
  assert.throws(() => validateClearances(clearances), /Must be APPROVED, EXPIRED, or REVOKED/);
});

test('B2: Clearances - Rejects additional property', () => {
  const clearances = [
    {
      eventId: "EV-BG-001",
      resolutionState: "SOURCE_UNAVAILABLE",
      clearanceScope: "EVENT",
      subjectType: null,
      subjectId: null,
      reviewType: "Source-Fidelity",
      result: "PASS",
      reviewReference: "stewardship/reviews/rev-001.review.md",
      reviewedAt: "2026-08-26T10:00:00Z",
      reviewerOrRole: "Reviewer A",
      clearanceState: "APPROVED",
      evidenceFingerprint: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3d3d3d3d3d3d3d3d3d3d3d3d3",
      extraKey: "unwanted"
    }
  ];
  assert.throws(() => validateClearances(clearances), /Additional properties not allowed/);
});

test('B2: Integrity Generator - Deterministic behavior and capturedAt preservation', () => {
  const registry = [
    {
      eventId: "EV-BG-001",
      sourceProject: "bridgenta-core",
      sourceSystem: "issue-tracker",
      sourceLocator: "package.json",
      historicalLocatorState: "UNAVAILABLE",
      historicalLocator: null
    }
  ];

  // 1. Generate first manifest
  const manifest1 = generateIntegrityManifest(registry, []);
  assert.strictEqual(manifest1.length, 1);
  assert.ok(manifest1[0].capturedAt);

  // 2. Generate second manifest with manifest1 as existing input
  // It must preserve capturedAt timestamp
  const manifest2 = generateIntegrityManifest(registry, manifest1);
  assert.strictEqual(manifest2.length, 1);
  assert.strictEqual(manifest2[0].capturedAt, manifest1[0].capturedAt);

  // 3. Verify deterministic sorting/matching of outputs
  const manifest3 = generateIntegrityManifest(registry, []);
  assert.deepStrictEqual(
    manifest1.map((m: any) => ({ ...m, capturedAt: 'mocked' })),
    manifest3.map((m: any) => ({ ...m, capturedAt: 'mocked' }))
  );
});

test('B2: Integrity Generator - B2R-02 Regression: Non-AVAILABLE historical states with existing file', () => {
  // Let's use "package.json" which exists locally, but set historical locator to non-AVAILABLE states
  const nonAvailableHistoricalStates = ["UNAVAILABLE", "TEMPORARILY_UNAVAILABLE", "NOT_MACHINE_VERIFIABLE"];

  for (const state of nonAvailableHistoricalStates) {
    const registry = [
      {
        eventId: "EV-BG-001",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "package.json",
        historicalLocatorState: state,
        historicalLocator: null
      }
    ];

    const manifest = generateIntegrityManifest(registry, []);
    assert.strictEqual(manifest.length, 1);
    
    // Invariant: generated localVerificationState MUST NOT be AVAILABLE
    assert.notStrictEqual(manifest[0].localVerificationState, "AVAILABLE");
    assert.strictEqual(manifest[0].integrityEvidenceType, null);
    assert.strictEqual(manifest[0].integrityEvidenceValue, null);

    // Roundtrip verification: manifest must pass validateManifest
    const isValid = validateManifest(manifest, registry);
    assert.ok(isValid);
  }
});
