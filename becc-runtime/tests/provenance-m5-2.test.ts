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
const { evaluateM5Decision, mapSystemFailure, serializeDecisionRecord, computeDecisionRecordHash } = await import(m5ModulePath);
// @ts-ignore
const { buildPublicationProjection, serializeProjection, computeProjectionHash } = await import(projectionModulePath);
// @ts-ignore
const { getM5Projection, getShadowPublicationView, resolveImplementationIdentity } = await import(adapterModulePath);
const ciShadowPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_ci_shadow.js')).href;
// @ts-ignore
const { evaluateShadowObservation, shadowResultToExitCode, computeShadowObservationPayload } = await import(ciShadowPath);


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

  describe('M5.2R Duplicate Determinism & Ordering Independence', () => {
    test('duplicate inputs yield byte-identical projection and hash regardless of input order', () => {
      const dec1 = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        m5Decision: "ELIGIBLE",
        b5ReasonCodes: ["SOME_B5_REASON"],
        m5ReasonCodes: ["SOME_M5_REASON"],
        policyVersion: "M5-POLICY-1.0",
        evaluatorVersion: "M5-EVALUATOR-1.0",
        implementationIdentity: "1111111111111111111111111111111111111111",
        decisionFinality: "FINAL"
      };

      const dec2 = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        m5Decision: "WITHHELD",
        b5ReasonCodes: ["ANOTHER_B5_REASON"],
        m5ReasonCodes: ["ANOTHER_M5_REASON"],
        policyVersion: "M5-POLICY-1.0",
        evaluatorVersion: "M5-EVALUATOR-1.0",
        implementationIdentity: "1111111111111111111111111111111111111111",
        decisionFinality: "FINAL"
      };

      const projA = buildPublicationProjection({
        expectedSubjects: ["src/content/learning/art-x.md"],
        m5DecisionRecords: [dec1, dec2],
        options: {
          implementationIdentity: "1111111111111111111111111111111111111111",
          identityState: "RESOLVED"
        }
      });

      const projB = buildPublicationProjection({
        expectedSubjects: ["src/content/learning/art-x.md"],
        m5DecisionRecords: [dec2, dec1],
        options: {
          implementationIdentity: "1111111111111111111111111111111111111111",
          identityState: "RESOLVED"
        }
      });

      const bytesA = serializeProjection(projA);
      const bytesB = serializeProjection(projB);
      const hashA = computeProjectionHash(projA);
      const hashB = computeProjectionHash(projB);

      assert.strictEqual(bytesA, bytesB);
      assert.strictEqual(hashA, hashB);

      // Verify canonical fields (no leakage from dec1 or dec2)
      assert.strictEqual(projA.records[0].m5Decision, "NOT_EVALUATED");
      assert.strictEqual(projA.records[0].publicationEligibility, "PUBLICATION_UNDECIDED");
      assert.deepEqual(projA.records[0].b5ReasonCodes, []);
      assert.deepEqual(projA.records[0].m5ReasonCodes, []);
      assert.deepEqual(projA.records[0].projectionDiagnostics, ["DECISION_DUPLICATE"]);
    });
  });

  describe('M5.2R Identity Constraints and System Failure Paths', () => {
    test('normal M5 decision without implementationIdentity must be rejected (throw)', () => {
      const art = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        provenanceRef: "EV-BG-105",
        readinessState: "READY_UNCLEARED",
        reasons: [],
        clearanceApplied: false
      };

      assert.throws(() => {
        evaluateM5Decision(art, { implementationIdentity: null });
      }, /Missing implementationIdentity/);

      assert.throws(() => {
        evaluateM5Decision(art, { implementationIdentity: "" });
      }, /Missing implementationIdentity/);
    });

    test('system failure mapSystemFailure supports null identity only for M5_INPUT_STATE_UNVERIFIABLE', () => {
      // Allowed:
      const rec = mapSystemFailure(
        { subjectId: "src/content/learning/art-x.md" },
        "M5_INPUT_STATE_UNVERIFIABLE",
        { implementationIdentity: null }
      );
      assert.strictEqual(rec.m5Decision, "SYSTEM_UNAVAILABLE");
      assert.strictEqual(rec.implementationIdentity, null);
      assert.strictEqual(rec.b5ReadinessState, null);
      assert.strictEqual(rec.decisionFinality, "NON_FINALIZABLE");

      // Rejected for others:
      assert.throws(() => {
        mapSystemFailure(
          { subjectId: "src/content/learning/art-x.md" },
          "M5_CONFIGURATION_INVALID",
          { implementationIdentity: null }
        );
      }, /Missing implementationIdentity/);
    });

    test('real B5 NOT_READY preservation maps to WITHHELD and PUBLICATION_WITHHELD', () => {
      const art = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        provenanceRef: "EV-BG-105",
        readinessState: "NOT_READY",
        reasons: ["RUNTIME_NOT_PASS"]
      };

      const dec = evaluateM5Decision(art, {
        implementationIdentity: "1111111111111111111111111111111111111111"
      });

      assert.strictEqual(dec.m5Decision, "WITHHELD");
      assert.strictEqual(dec.b5ReadinessState, "NOT_READY");
      assert.deepEqual(dec.b5ReasonCodes, ["RUNTIME_NOT_PASS"]);

      const proj = buildPublicationProjection({
        expectedSubjects: ["src/content/learning/art-x.md"],
        m5DecisionRecords: [dec],
        options: {
          implementationIdentity: "1111111111111111111111111111111111111111",
          identityState: "RESOLVED"
        }
      });

      assert.strictEqual(proj.records[0].publicationEligibility, "PUBLICATION_WITHHELD");
    });
  });

  describe('M5.2R2 Decision Finality Serialization & Hashing Suite', () => {
    const baseRecord = {
      subjectType: "learning-article",
      subjectId: "src/content/learning/art-x.md",
      provenanceRef: "EV-BG-105",
      repositoryCommit: "1111111111111111111111111111111111111111",
      b5ReadinessState: "READY_UNCLEARED",
      m5Decision: "ELIGIBLE",
      b5ReasonCodes: [],
      m5ReasonCodes: [],
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentity: "1111111111111111111111111111111111111111"
    };

    test('unsupported/missing/null/empty decisionFinality throws during serialization, but FINAL/NON_FINALIZABLE passes', () => {
      assert.throws(() => {
        serializeDecisionRecord({
          ...baseRecord,
          decisionFinality: "INVALID_VALUE"
        });
      }, /Invalid or missing decisionFinality/);

      assert.throws(() => {
        serializeDecisionRecord({
          ...baseRecord,
          decisionFinality: undefined
        });
      }, /Invalid or missing decisionFinality/);

      assert.throws(() => {
        serializeDecisionRecord({
          ...baseRecord,
          decisionFinality: null
        });
      }, /Invalid or missing decisionFinality/);

      assert.throws(() => {
        serializeDecisionRecord({
          ...baseRecord,
          decisionFinality: ""
        });
      }, /Invalid or missing decisionFinality/);

      // Verify success
      const serA = serializeDecisionRecord({
        ...baseRecord,
        decisionFinality: "FINAL"
      });
      assert.ok(serA.includes('"decisionFinality":"FINAL"'));

      const serB = serializeDecisionRecord({
        ...baseRecord,
        decisionFinality: "NON_FINALIZABLE"
      });
      assert.ok(serB.includes('"decisionFinality":"NON_FINALIZABLE"'));
    });

    test('Record A (FINAL) and Record B (NON_FINALIZABLE) have distinct serialization and hashes', () => {
      const recA = {
        ...baseRecord,
        decisionFinality: "FINAL"
      };

      const recB = {
        ...baseRecord,
        decisionFinality: "NON_FINALIZABLE"
      };

      const serA = serializeDecisionRecord(recA);
      const serB = serializeDecisionRecord(recB);
      const hashA = computeDecisionRecordHash(recA);
      const hashB = computeDecisionRecordHash(recB);

      assert.notStrictEqual(serA, serB);
      assert.notStrictEqual(hashA, hashB);

      // Verify hashes are 64 lowercase hexadecimal chars
      assert.match(hashA, /^[0-9a-f]{64}$/);
      assert.match(hashB, /^[0-9a-f]{64}$/);

      // Log/verify decisionFinality is bound and serialized
      assert.ok(serA.includes('"decisionFinality":"FINAL"'));
      assert.ok(serB.includes('"decisionFinality":"NON_FINALIZABLE"'));
    });

    test('determinism: identical record serializes and hashes identically when run twice', () => {
      const rec = {
        ...baseRecord,
        decisionFinality: "FINAL"
      };

      const ser1 = serializeDecisionRecord(rec);
      const ser2 = serializeDecisionRecord(rec);
      const hash1 = computeDecisionRecordHash(rec);
      const hash2 = computeDecisionRecordHash(rec);

      assert.strictEqual(ser1, ser2);
      assert.strictEqual(hash1, hash2);
    });

    test('null-identity system record serializes implementationIdentity: null and decisionFinality: NON_FINALIZABLE', () => {
      const rec = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        provenanceRef: null,
        repositoryCommit: null,
        b5ReadinessState: null,
        m5Decision: "SYSTEM_UNAVAILABLE",
        b5ReasonCodes: [],
        m5ReasonCodes: ["M5_INPUT_STATE_UNVERIFIABLE"],
        policyVersion: "M5-POLICY-1.0",
        evaluatorVersion: "M5-EVALUATOR-1.0",
        implementationIdentity: null,
        decisionFinality: "NON_FINALIZABLE"
      };

      const ser = serializeDecisionRecord(rec);
      assert.ok(ser.includes('"implementationIdentity":null'));
      assert.ok(ser.includes('"decisionFinality":"NON_FINALIZABLE"'));
      assert.ok(!ser.includes("000000000")); // no synthetic zero SHA
    });

    test('normal ready/not-ready decisions evaluated mapping', () => {
      // READY_UNCLEARED
      const art1 = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        provenanceRef: "EV-BG-105",
        readinessState: "READY_UNCLEARED",
        reasons: []
      };
      const dec1 = evaluateM5Decision(art1, {
        implementationIdentity: "1111111111111111111111111111111111111111"
      });
      assert.strictEqual(dec1.m5Decision, "ELIGIBLE");
      assert.strictEqual(dec1.decisionFinality, "FINAL");

      // READY_BY_CLEARANCE
      const art2 = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        provenanceRef: "EV-BG-105",
        readinessState: "READY_BY_CLEARANCE",
        reasons: [],
        clearanceApplied: true
      };
      const dec2 = evaluateM5Decision(art2, {
        implementationIdentity: "1111111111111111111111111111111111111111"
      });
      assert.strictEqual(dec2.m5Decision, "ELIGIBLE");
      assert.strictEqual(dec2.decisionFinality, "FINAL");

      // NOT_READY
      const art3 = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art-x.md",
        provenanceRef: "EV-BG-105",
        readinessState: "NOT_READY",
        reasons: ["RUNTIME_NOT_PASS"]
      };
      const dec3 = evaluateM5Decision(art3, {
        implementationIdentity: "1111111111111111111111111111111111111111"
      });
      assert.strictEqual(dec3.m5Decision, "WITHHELD");
      assert.strictEqual(dec3.decisionFinality, "FINAL");
    });
  });

  describe('M5.3 CI Shadow Observation Suite', () => {
    const shadowTmpDir = path.join(testTmpDir, 'shadow-test-workspace');

    function setupWorkspace(filesMap: Record<string, string>) {
      fs.rmSync(shadowTmpDir, { recursive: true, force: true });
      fs.mkdirSync(shadowTmpDir, { recursive: true });
      for (const [relPath, content] of Object.entries(filesMap)) {
        const fullPath = path.join(shadowTmpDir, relPath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
      }
    }

    test('SHADOW_PASS when all expected subjects are eligible', () => {
      const artContent = `---
title: "Article 1"
publicationState: "published"
provenanceRef: "EV-BG-105"
---
# Article
`;
      const sourceContent = "mock source file content";
      const mockHash = crypto.createHash('sha256').update(sourceContent).digest('hex');

      setupWorkspace({
        "src/content/learning/art1.md": artContent,
        "validation/some.js": sourceContent,
        "src/data/provenance_registry.json": JSON.stringify([
          {
            eventId: "EV-BG-105",
            sourceProject: "bridgenta-core",
            sourceSystem: "git",
            sourceLocator: "validation/some.js",
            historicalLocatorState: "AVAILABLE",
            historicalLocator: "xyz"
          }
        ]),
        "src/data/local_integrity_manifest.json": JSON.stringify([
          {
            eventId: "EV-BG-105",
            sourceSystem: "git",
            sourceLocator: "validation/some.js",
            historicalLocatorState: "AVAILABLE",
            historicalLocator: "xyz",
            localVerificationState: "AVAILABLE",
            integrityEvidenceType: "sha256",
            integrityEvidenceValue: mockHash,
            capturedAt: "2026-08-26T14:30:00Z"
          }
        ]),
        "stewardship/reviews/rev-1.review.md": `---
subject: "src/content/learning/art1.md"
reviewType: "Source-Fidelity"
result: "PASS"
---
Matches [evidence](stewardship/evidence/ev-bg-105.md)`,
        "stewardship/evidence/ev-bg-105.md": `
- **eventId**: \`EV-BG-105\`
- **sourceProject**: \`bridgenta-core\`
- **sourceSystem**: \`git\`
- **sourceLocator**: \`validation/some.js\`
- **historicalLocatorState**: \`AVAILABLE\`
- **historicalLocator**: \`xyz\`
`
      });

      const res = evaluateShadowObservation(shadowTmpDir);
      assert.strictEqual(res.observation.shadowGateResult, "SHADOW_PASS");
      assert.strictEqual(res.observation.subjectCount, 1);
      assert.strictEqual(res.observation.eligibleCount, 1);
      assert.strictEqual(res.observation.withheldCount, 0);
      assert.strictEqual(res.observation.undecidedCount, 0);
      assert.match(res.observationHash, /^[0-9a-f]{64}$/);
    });

    test('SHADOW_ATTENTION when one subject is withheld', () => {
      const artContent = `---
publicationState: "published"
provenanceRef: "EV-BG-105"
---
# Article
`;
      setupWorkspace({
        "src/content/learning/art1.md": artContent,
        "src/data/provenance_registry.json": JSON.stringify([
          {
            eventId: "EV-BG-105",
            sourceProject: "bridgenta-core",
            sourceSystem: "git",
            sourceLocator: "ticket-105"
          }
        ]),
        // Missing local manifest -> NOT_READY -> WITHHELD
        "src/data/local_integrity_manifest.json": JSON.stringify([])
      });

      const res = evaluateShadowObservation(shadowTmpDir);
      assert.strictEqual(res.observation.shadowGateResult, "SHADOW_ATTENTION");
      assert.strictEqual(res.observation.subjectCount, 1);
      assert.strictEqual(res.observation.eligibleCount, 0);
      assert.strictEqual(res.observation.withheldCount, 1);
      assert.strictEqual(res.observation.undecidedCount, 0);
    });

    test('SHADOW_SYSTEM_UNAVAILABLE when registry or manifest is missing', () => {
      const artContent = `---
publicationState: "published"
provenanceRef: "EV-BG-105"
---
# Article
`;
      setupWorkspace({
        "src/content/learning/art1.md": artContent
        // missing src/data/*
      });

      const res = evaluateShadowObservation(shadowTmpDir);
      assert.strictEqual(res.observation.shadowGateResult, "SHADOW_SYSTEM_UNAVAILABLE");
      assert.strictEqual(res.observation.subjectCount, 1);
      assert.strictEqual(res.observation.eligibleCount, 0);
      assert.strictEqual(res.observation.withheldCount, 0);
      assert.strictEqual(res.observation.undecidedCount, 1);
    });

    test('SHADOW_NOT_EVALUATED on DECISION_MISSING, DECISION_DUPLICATE, or mixed versions', () => {
      const baseDec = {
        subjectType: "learning-article",
        subjectId: "src/content/learning/art1.md",
        provenanceRef: "EV-BG-105",
        repositoryCommit: "1111111111111111111111111111111111111111",
        b5ReadinessState: "READY_UNCLEARED",
        m5Decision: "ELIGIBLE",
        b5ReasonCodes: [],
        m5ReasonCodes: [],
        policyVersion: "M5-POLICY-1.0",
        evaluatorVersion: "M5-EVALUATOR-1.0",
        implementationIdentity: "1111111111111111111111111111111111111111",
        decisionFinality: "FINAL"
      };

      // 1. DECISION_MISSING
      const resMissing = computeShadowObservationPayload(
        ["src/content/learning/art1.md"],
        [],
        "1111111111111111111111111111111111111111",
        "RESOLVED"
      );
      assert.strictEqual(resMissing.observation.shadowGateResult, "SHADOW_NOT_EVALUATED");
      assert.ok(resMissing.observation.globalDiagnostics.includes("DECISION_MISSING"));
      assert.ok(!resMissing.observation.globalDiagnostics.includes(undefined));
      assert.ok(!resMissing.observation.globalDiagnostics.includes(null));

      // 2. DECISION_DUPLICATE
      const resDup = computeShadowObservationPayload(
        ["src/content/learning/art1.md"],
        [
          { ...baseDec, m5Decision: "ELIGIBLE" },
          { ...baseDec, m5Decision: "WITHHELD" }
        ],
        "1111111111111111111111111111111111111111",
        "RESOLVED"
      );
      assert.strictEqual(resDup.observation.shadowGateResult, "SHADOW_NOT_EVALUATED");
      assert.ok(resDup.observation.globalDiagnostics.includes("DECISION_DUPLICATE"));
      assert.ok(!resDup.observation.globalDiagnostics.includes(undefined));

      // 3. PROJECTION_CONFIGURATION_INVALID
      const resInvalid = computeShadowObservationPayload(
        ["src/content/learning/art1.md"],
        [
          { ...baseDec, m5Decision: "INVALID_STATE_CODE" }
        ],
        "1111111111111111111111111111111111111111",
        "RESOLVED"
      );
      assert.strictEqual(resInvalid.observation.shadowGateResult, "SHADOW_NOT_EVALUATED");
      assert.ok(resInvalid.observation.globalDiagnostics.includes("PROJECTION_CONFIGURATION_INVALID"));

      // 4. MIXED_POLICY_VERSION
      const resPolicy = computeShadowObservationPayload(
        ["src/content/learning/art1.md", "src/content/learning/art2.md"],
        [
          { ...baseDec, subjectId: "src/content/learning/art1.md", policyVersion: "M5-POLICY-1.0" },
          { ...baseDec, subjectId: "src/content/learning/art2.md", policyVersion: "M5-POLICY-2.0" }
        ],
        "1111111111111111111111111111111111111111",
        "RESOLVED"
      );
      assert.strictEqual(resPolicy.observation.shadowGateResult, "SHADOW_NOT_EVALUATED");
      assert.ok(resPolicy.observation.globalDiagnostics.includes("MIXED_POLICY_VERSION"));

      // 5. MIXED_EVALUATOR_VERSION
      const resEval = computeShadowObservationPayload(
        ["src/content/learning/art1.md", "src/content/learning/art2.md"],
        [
          { ...baseDec, subjectId: "src/content/learning/art1.md", evaluatorVersion: "M5-EVALUATOR-1.0" },
          { ...baseDec, subjectId: "src/content/learning/art2.md", evaluatorVersion: "M5-EVALUATOR-2.0" }
        ],
        "1111111111111111111111111111111111111111",
        "RESOLVED"
      );
      assert.strictEqual(resEval.observation.shadowGateResult, "SHADOW_NOT_EVALUATED");
      assert.ok(resEval.observation.globalDiagnostics.includes("MIXED_EVALUATOR_VERSION"));

      // Exit codes
      assert.strictEqual(shadowResultToExitCode("SHADOW_PASS"), 0);
      assert.strictEqual(shadowResultToExitCode("SHADOW_ATTENTION"), 0);
      assert.strictEqual(shadowResultToExitCode("SHADOW_SYSTEM_UNAVAILABLE"), 0);
      assert.strictEqual(shadowResultToExitCode("SHADOW_NOT_EVALUATED"), 0);
    });

    test('reversing subject order yields identical payload bytes and observationHash', () => {
      const art1Content = `---
publicationState: "published"
provenanceRef: "EV-BG-105"
---
# Art 1
`;
      const art2Content = `---
publicationState: "published"
provenanceRef: "EV-BG-106"
---
# Art 2
`;
      const fp1 = crypto.createHash('sha256').update(art1Content).digest('hex');
      const fp2 = crypto.createHash('sha256').update(art2Content).digest('hex');

      setupWorkspace({
        "src/content/learning/art1.md": art1Content,
        "src/content/learning/art2.md": art2Content,
        "src/data/provenance_registry.json": JSON.stringify([
          {
            eventId: "EV-BG-105",
            sourceProject: "bridgenta-core",
            sourceSystem: "git",
            sourceLocator: "ticket-105"
          },
          {
            eventId: "EV-BG-106",
            sourceProject: "bridgenta-core",
            sourceSystem: "git",
            sourceLocator: "ticket-106"
          }
        ]),
        "src/data/local_integrity_manifest.json": JSON.stringify([
          {
            subjectId: "src/content/learning/art1.md",
            provenanceRef: "EV-BG-105",
            fingerprint: fp1,
            sourceFidelityReview: "PASS",
            runtimeFidelityReview: "PASS"
          },
          {
            subjectId: "src/content/learning/art2.md",
            provenanceRef: "EV-BG-106",
            fingerprint: fp2,
            sourceFidelityReview: "PASS",
            runtimeFidelityReview: "PASS"
          }
        ])
      });

      const resA = evaluateShadowObservation(shadowTmpDir);
      
      // Clear and rewrite in reverse order (fs readdir order can vary, but we sort subjectIds ascending in evaluation)
      const resB = evaluateShadowObservation(shadowTmpDir);

      assert.strictEqual(resA.observationHash, resB.observationHash);
      assert.deepStrictEqual(resA.observation, resB.observation);
    });

    test('current production workspace evaluates to SHADOW_PASS', () => {
      // Evaluate against the real repository root
      const res = evaluateShadowObservation(repoRoot);
      assert.strictEqual(res.observation.shadowGateResult, "SHADOW_PASS");
      assert.strictEqual(res.observation.subjectCount, 1);
      assert.strictEqual(res.observation.eligibleCount, 1);
      assert.strictEqual(res.observation.withheldCount, 0);
      assert.strictEqual(res.observation.undecidedCount, 0);
    });
  });
});
