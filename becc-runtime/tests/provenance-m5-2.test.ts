import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testTmpDir = path.join(__dirname, 'tmp-m5-2-tests');

// Load M5 JS modules dynamically
const repoRoot = path.resolve(process.cwd(), '..');
const m5ModulePath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_m5.js')).href;
const projectionModulePath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_projection.js')).href;
const adapterModulePath = pathToFileURL(path.join(repoRoot, 'src', 'utils', 'm5_adapter.ts')).href;

const resolverPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_resolver.js')).href;
// @ts-ignore
const { computeExpectedFingerprint } = await import(resolverPath);
// @ts-ignore
const { evaluateM5Decision } = await import(m5ModulePath);
// @ts-ignore
const { buildPublicationProjection, serializeProjection, computeProjectionHash } = await import(projectionModulePath);
// @ts-ignore
const { getM5Projection, getShadowPublicationView } = await import(adapterModulePath);

describe('M5.2 Publication Eligibility Projection', () => {
  before(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
  });

  // Section 23: State Mappings
  test('ELIGIBLE -> PUBLICATION_ELIGIBLE', () => {
    const expectedSubjects = ['src/content/learning/art1.md'];
    const decisions = [
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'ELIGIBLE',
        b5ReasonCodes: [],
        m5ReasonCodes: []
      }
    ];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.strictEqual(result.records[0].publicationEligibility, 'PUBLICATION_ELIGIBLE');
    assert.deepStrictEqual(result.eligibleSubjectIds, ['src/content/learning/art1.md']);
    assert.deepStrictEqual(result.withheldSubjectIds, []);
    assert.deepStrictEqual(result.undecidedSubjectIds, []);
  });

  test('WITHHELD -> PUBLICATION_WITHHELD', () => {
    const expectedSubjects = ['src/content/learning/art1.md'];
    const decisions = [
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'WITHHELD',
        b5ReasonCodes: ['MISSING_PROVENANCE_REF'],
        m5ReasonCodes: []
      }
    ];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.strictEqual(result.records[0].publicationEligibility, 'PUBLICATION_WITHHELD');
    assert.deepStrictEqual(result.eligibleSubjectIds, []);
    assert.deepStrictEqual(result.withheldSubjectIds, ['src/content/learning/art1.md']);
    assert.deepStrictEqual(result.undecidedSubjectIds, []);
  });

  test('SYSTEM_UNAVAILABLE -> PUBLICATION_UNDECIDED', () => {
    const expectedSubjects = ['src/content/learning/art1.md'];
    const decisions = [
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'SYSTEM_UNAVAILABLE',
        b5ReasonCodes: [],
        m5ReasonCodes: ['M5_EVALUATION_ERROR']
      }
    ];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.strictEqual(result.records[0].publicationEligibility, 'PUBLICATION_UNDECIDED');
    assert.deepStrictEqual(result.undecidedSubjectIds, ['src/content/learning/art1.md']);
  });

  test('NOT_EVALUATED -> PUBLICATION_UNDECIDED', () => {
    const expectedSubjects = ['src/content/learning/art1.md'];
    const decisions = [
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'NOT_EVALUATED',
        b5ReasonCodes: [],
        m5ReasonCodes: ['M5_CONFIGURATION_INVALID']
      }
    ];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.strictEqual(result.records[0].publicationEligibility, 'PUBLICATION_UNDECIDED');
    assert.deepStrictEqual(result.undecidedSubjectIds, ['src/content/learning/art1.md']);
  });

  test('Unknown M5 state -> PUBLICATION_UNDECIDED + PROJECTION_CONFIGURATION_INVALID diagnostic', () => {
    const expectedSubjects = ['src/content/learning/art1.md'];
    const decisions = [
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'UNKNOWN_M5_STATE',
        b5ReasonCodes: [],
        m5ReasonCodes: []
      }
    ];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.strictEqual(result.records[0].publicationEligibility, 'PUBLICATION_UNDECIDED');
    assert.ok(result.records[0].projectionDiagnostics.includes('PROJECTION_CONFIGURATION_INVALID'));
  });

  // Section 24, 25, 26: Cardinality checking
  test('Zero decisions (missing) -> PUBLICATION_UNDECIDED + DECISION_MISSING', () => {
    const expectedSubjects = ['src/content/learning/art1.md'];
    const decisions: any[] = [];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.strictEqual(result.records[0].publicationEligibility, 'PUBLICATION_UNDECIDED');
    assert.ok(result.records[0].projectionDiagnostics.includes('DECISION_MISSING'));
  });

  test('Duplicate decisions -> PUBLICATION_UNDECIDED + DECISION_DUPLICATE', () => {
    const expectedSubjects = ['src/content/learning/art1.md'];
    const decisions = [
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'ELIGIBLE',
        b5ReasonCodes: [],
        m5ReasonCodes: []
      },
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'WITHHELD',
        b5ReasonCodes: [],
        m5ReasonCodes: []
      }
    ];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.strictEqual(result.records[0].publicationEligibility, 'PUBLICATION_UNDECIDED');
    assert.ok(result.records[0].projectionDiagnostics.includes('DECISION_DUPLICATE'));
  });

  test('One subject failure does not affect another subject', () => {
    const expectedSubjects = ['src/content/learning/art1.md', 'src/content/learning/art2.md'];
    const decisions = [
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art1.md',
        m5Decision: 'ELIGIBLE',
        b5ReasonCodes: [],
        m5ReasonCodes: []
      },
      {
        subjectType: 'learning-article',
        subjectId: 'src/content/learning/art2.md',
        m5Decision: 'WITHHELD',
        b5ReasonCodes: ['MISSING_PROVENANCE_REF'],
        m5ReasonCodes: []
      }
    ];

    const result = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions,
      options: { implementationIdentity: 'mock-commit' }
    });

    const art1 = result.records.find((r: any) => r.subjectId === 'src/content/learning/art1.md');
    const art2 = result.records.find((r: any) => r.subjectId === 'src/content/learning/art2.md');

    assert.ok(art1);
    assert.ok(art2);
    assert.strictEqual(art1.publicationEligibility, 'PUBLICATION_ELIGIBLE');
    assert.strictEqual(art2.publicationEligibility, 'PUBLICATION_WITHHELD');
  });

  test('Input order reversed yields same canonical output', () => {
    const expectedSubjects = ['src/content/learning/art1.md', 'src/content/learning/art2.md'];
    const decisions1 = [
      { subjectId: 'src/content/learning/art1.md', m5Decision: 'ELIGIBLE' },
      { subjectId: 'src/content/learning/art2.md', m5Decision: 'WITHHELD' }
    ];
    const decisions2 = [
      { subjectId: 'src/content/learning/art2.md', m5Decision: 'WITHHELD' },
      { subjectId: 'src/content/learning/art1.md', m5Decision: 'ELIGIBLE' }
    ];

    const res1 = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions1,
      options: { implementationIdentity: 'mock-commit' }
    });

    const res2 = buildPublicationProjection({
      expectedSubjects,
      m5DecisionRecords: decisions2,
      options: { implementationIdentity: 'mock-commit' }
    });

    assert.deepStrictEqual(res1, res2);
  });

  // Section 18: Avoid mutating inputs during serialization
  test('Serialization does not mutate caller inputs', () => {
    const projectionInput = {
      records: [
        {
          subjectType: 'learning-article',
          subjectId: 'src/content/learning/art1.md',
          m5Decision: 'WITHHELD',
          publicationEligibility: 'PUBLICATION_WITHHELD',
          b5ReasonCodes: ['RUNTIME_NOT_PASS', 'MISSING_PROVENANCE_REF'],
          m5ReasonCodes: ['M5_INPUT_STATE_UNVERIFIABLE', 'M5_EVALUATION_ERROR'],
          projectionDiagnostics: ['DECISION_DUPLICATE'],
          policyVersion: 'M5-POLICY-1.0',
          evaluatorVersion: 'M5-EVALUATOR-1.0',
          implementationIdentity: 'mock-commit'
        }
      ],
      eligibleSubjectIds: [],
      withheldSubjectIds: ['src/content/learning/art1.md'],
      undecidedSubjectIds: [],
      diagnostics: []
    };

    // Deep copy input for mutation checks
    const b5Original = [...projectionInput.records[0].b5ReasonCodes];
    const m5Original = [...projectionInput.records[0].m5ReasonCodes];

    const str1 = serializeProjection(projectionInput);
    const str2 = serializeProjection(projectionInput);
    const hash1 = computeProjectionHash(projectionInput);
    const hash2 = computeProjectionHash(projectionInput);

    // Verify byte-identical outputs
    assert.strictEqual(str1, str2);
    assert.strictEqual(hash1, hash2);

    // Verify original object arrays are NOT mutated/sorted in-place
    assert.deepStrictEqual(projectionInput.records[0].b5ReasonCodes, b5Original);
    assert.deepStrictEqual(projectionInput.records[0].m5ReasonCodes, m5Original);
  });

  test('Future-Enforcement Simulation returns correct filter set', () => {
    const mockArticles = [
      { id: 'art-eligible.md', data: { publicationState: 'published' } },
      { id: 'art-withheld.md', data: { publicationState: 'published' } }
    ];

    const mockRepoRoot = path.join(testTmpDir, 'sim-root');
    fs.rmSync(mockRepoRoot, { recursive: true, force: true });
    fs.mkdirSync(path.join(mockRepoRoot, 'src', 'content', 'learning'), { recursive: true });
    fs.mkdirSync(path.join(mockRepoRoot, 'src', 'data'), { recursive: true });
    fs.mkdirSync(path.join(mockRepoRoot, 'stewardship', 'reviews'), { recursive: true });
    fs.mkdirSync(path.join(mockRepoRoot, 'stewardship', 'evidence'), { recursive: true });

    // 1. Write mock content files
    fs.writeFileSync(path.join(mockRepoRoot, 'src', 'content', 'learning', 'art-eligible.md'), '---\ntitle: "Eligible"\npublicationState: "published"\nprovenanceRef: "EV-BG-105"\n---\nbody', 'utf-8');
    fs.writeFileSync(path.join(mockRepoRoot, 'src', 'content', 'learning', 'art-withheld.md'), '---\ntitle: "Withheld"\npublicationState: "published"\nprovenanceRef: "EV-BG-106"\n---\nbody', 'utf-8');

    // Write review file
    fs.writeFileSync(path.join(mockRepoRoot, 'stewardship', 'reviews', 'sf-pass.review.md'), '---\nsubject: "src/content/learning/art-eligible.md"\nreviewType: "Source-Fidelity"\nresult: "PASS"\n---\nMatches [evidence](stewardship/evidence/sf-pass-ev-bg-105.md)', 'utf-8');

    // Write evidence file
    fs.writeFileSync(path.join(mockRepoRoot, 'stewardship', 'evidence', 'sf-pass-ev-bg-105.md'), `
- **eventId**: \`EV-BG-105\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`src/content/learning/art-eligible.md\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`07aac848a4a48282c8b83169179308bdb17db0c6\`
`, 'utf-8');

    // 2. Write registry
    const registry = [
      {
        eventId: "EV-BG-105",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "src/content/learning/art-eligible.md",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "07aac848a4a48282c8b83169179308bdb17db0c6"
      },
      {
        eventId: "EV-BG-106",
        sourceProject: "bridgenta-core",
        sourceSystem: "git",
        sourceLocator: "src/content/learning/art-withheld.md",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "07aac848a4a48282c8b83169179308bdb17db0c6"
      }
    ];
    fs.writeFileSync(path.join(mockRepoRoot, 'src', 'data', 'provenance_registry.json'), JSON.stringify(registry), 'utf-8');

    // 3. Write manifest
    const manifest = [
      {
        eventId: "EV-BG-105",
        sourceSystem: "git",
        sourceLocator: "src/content/learning/art-eligible.md",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "07aac848a4a48282c8b83169179308bdb17db0c6",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        capturedAt: "2026-08-26T13:46:36.584Z"
      },
      {
        eventId: "EV-BG-106",
        sourceSystem: "git",
        sourceLocator: "src/content/learning/art-withheld.md",
        historicalLocatorState: "AVAILABLE",
        historicalLocator: "07aac848a4a48282c8b83169179308bdb17db0c6",
        localVerificationState: "AVAILABLE",
        integrityEvidenceType: "sha256",
        integrityEvidenceValue: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        capturedAt: "2026-08-26T13:46:36.584Z"
      }
    ];
    fs.writeFileSync(path.join(mockRepoRoot, 'src', 'data', 'local_integrity_manifest.json'), JSON.stringify(manifest), 'utf-8');

    // Compute clearance fingerprint
    const activeEvidence = {
      eventId: "EV-BG-105",
      sourceProject: "bridgenta-core",
      sourceSystem: "git",
      sourceLocator: "src/content/learning/art-eligible.md",
      historicalLocatorState: "AVAILABLE",
      historicalLocator: "07aac848a4a48282c8b83169179308bdb17db0c6",
      resolutionState: "FIDELITY_UNCONFIRMED",
      clearanceScope: "ARTICLE_EVENT",
      subjectType: "learning-article",
      subjectId: "src/content/learning/art-eligible.md"
    };

    const fingerprint = computeExpectedFingerprint(activeEvidence);

    // 4. Write clearances reviews
    const clearances = [
      {
        eventId: "EV-BG-105",
        resolutionState: "FIDELITY_UNCONFIRMED",
        clearanceScope: "ARTICLE_EVENT",
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-eligible.md",
        reviewType: "Source-Fidelity",
        result: "PASS",
        reviewReference: "stewardship/reviews/sf-pass.review.md",
        reviewedAt: "2026-08-26T14:30:00Z",
        reviewerOrRole: "Steward",
        clearanceState: "APPROVED",
        evidenceFingerprint: fingerprint
      }
    ];
    fs.writeFileSync(path.join(mockRepoRoot, 'stewardship', 'reviews', 'clearances_manifest.json'), JSON.stringify(clearances), 'utf-8');

    const resultView = getShadowPublicationView(mockArticles, { workspaceDir: mockRepoRoot });

    // Validate only art-eligible.md is returned in simulated view
    assert.strictEqual(resultView.length, 1);
    assert.strictEqual(resultView[0].id, 'art-eligible.md');
  });

  // Section 15: Production Projection Truth
  test('Production projection has exactly 1 eligible article and zero withheld/undecided', () => {
    // Run evaluation against current production learning articles
    const mockCollection = [
      { id: 'grenzen-automatisierter-linter-checks.md', data: { publicationState: 'published' } }
    ];

    const projection = getM5Projection(mockCollection);
    
    assert.strictEqual(projection.records.length, 1);
    
    const rec = projection.records[0];
    assert.strictEqual(rec.subjectId, 'src/content/learning/grenzen-automatisierter-linter-checks.md');
    assert.strictEqual(rec.publicationEligibility, 'PUBLICATION_ELIGIBLE');
    
    assert.strictEqual(projection.eligibleSubjectIds.length, 1);
    assert.strictEqual(projection.withheldSubjectIds.length, 0);
    assert.strictEqual(projection.undecidedSubjectIds.length, 0);
  });
});
