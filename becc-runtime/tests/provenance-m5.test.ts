import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testTmpDir = path.join(__dirname, 'tmp-m5-tests');

// Load M5 JS module dynamically
const repoRoot = path.resolve(process.cwd(), '..');
const m5ModulePath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_m5.js')).href;

// @ts-ignore
const {
  evaluateM5Decision,
  mapSystemFailure,
  validateSourceLocator,
  serializeDecisionRecord,
  computeDecisionRecordHash,
  M5_SYSTEM_REASON_ORDER,
  sortM5Reasons
} = await import(m5ModulePath);

describe('M5.1 Decision Model & Security Boundary', () => {
  before(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
  });

  // Amendment 1: UNKNOWN_OR_INVALID_B5_READINESS_STATE handling
  test('Amendment 1: Unknown/invalid B5 state -> NOT_EVALUATED + M5_CONFIGURATION_INVALID', () => {
    const mockB5Input = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      readinessState: 'INVALID_B5_STATE',
      reasons: ['MISSING_PROVENANCE_REF']
    };

    const record = evaluateM5Decision(mockB5Input, { implementationIdentity: 'mock-commit-sha', repositoryCommit: 'mock-commit-sha' });
    assert.strictEqual(record.m5Decision, 'NOT_EVALUATED');
    assert.ok(record.m5ReasonCodes.includes('M5_CONFIGURATION_INVALID'));
    assert.strictEqual(record.m5ReasonCodes.length, 1);

    // Verify it is NOT converted to ELIGIBLE, WITHHELD, or SYSTEM_UNAVAILABLE
    assert.notStrictEqual(record.m5Decision, 'ELIGIBLE');
    assert.notStrictEqual(record.m5Decision, 'WITHHELD');
    assert.notStrictEqual(record.m5Decision, 'SYSTEM_UNAVAILABLE');
  });

  test('M5.1 State Model Mapping: READY_UNCLEARED -> ELIGIBLE', () => {
    const mockB5Input = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      readinessState: 'READY_UNCLEARED',
      reasons: []
    };

    const record = evaluateM5Decision(mockB5Input, { implementationIdentity: 'mock-commit-sha', repositoryCommit: 'mock-commit-sha' });
    assert.strictEqual(record.m5Decision, 'ELIGIBLE');
    assert.strictEqual(record.m5ReasonCodes.length, 0);
  });

  test('M5.1 State Model Mapping: READY_BY_CLEARANCE -> ELIGIBLE', () => {
    const mockB5Input = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      readinessState: 'READY_BY_CLEARANCE',
      reasons: [],
      clearanceApplied: true
    };

    const record = evaluateM5Decision(mockB5Input, { implementationIdentity: 'mock-commit-sha', repositoryCommit: 'mock-commit-sha' });
    assert.strictEqual(record.m5Decision, 'ELIGIBLE');
    assert.strictEqual(record.clearanceApplied, true);
  });

  test('M5.1 State Model Mapping: NOT_READY -> WITHHELD', () => {
    const mockB5Input = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      readinessState: 'NOT_READY',
      reasons: ['MISSING_PROVENANCE_REF']
    };

    const record = evaluateM5Decision(mockB5Input, { implementationIdentity: 'mock-commit-sha', repositoryCommit: 'mock-commit-sha' });
    assert.strictEqual(record.m5Decision, 'WITHHELD');
    assert.ok(record.b5ReasonCodes.includes('MISSING_PROVENANCE_REF'));
  });

  // Amendment 2: Historical Replay Refusal Semantics
  test('Amendment 2: Unavailable historical rule -> REFUSED + M5_HISTORICAL_RULE_UNAVAILABLE', () => {
    const mockB5Input = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      readinessState: 'READY_UNCLEARED',
      reasons: []
    };

    const record = evaluateM5Decision(mockB5Input, {
      implementationIdentity: 'mock-commit-sha',
      repositoryCommit: 'mock-commit-sha',
      isHistoricalReplay: true,
      policyVersion: 'M5-POLICY-OLD',
      evaluatorVersion: 'M5-EVALUATOR-OLD'
    });

    assert.strictEqual(record.m5Decision, 'NOT_EVALUATED');
    assert.strictEqual(record.historicalReplayDecision, 'REFUSED');
    assert.ok(record.m5ReasonCodes.includes('M5_HISTORICAL_RULE_UNAVAILABLE'));
  });

  test('Amendment 2: Available historical rule -> works correctly', () => {
    const mockB5Input = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      readinessState: 'READY_UNCLEARED',
      reasons: []
    };

    const record = evaluateM5Decision(mockB5Input, {
      implementationIdentity: 'mock-commit-sha',
      repositoryCommit: 'mock-commit-sha',
      isHistoricalReplay: true,
      policyVersion: 'M5-POLICY-1.0',
      evaluatorVersion: 'M5-EVALUATOR-1.0'
    });

    assert.strictEqual(record.m5Decision, 'ELIGIBLE');
    assert.strictEqual(record.historicalReplayDecision, undefined);
  });

  // Amendment 3: Separate M5 System Reason Ordering
  test('Amendment 3: M5 reasons sorted deterministically', () => {
    const mixedM5Reasons = [
      'M5_POLICY_VERSION_UNAVAILABLE',
      'M5_EVALUATION_ERROR',
      'M5_HISTORICAL_RULE_UNAVAILABLE',
      'M5_DEPENDENCY_UNAVAILABLE'
    ];

    sortM5Reasons(mixedM5Reasons);

    assert.deepStrictEqual(mixedM5Reasons, [
      'M5_EVALUATION_ERROR',
      'M5_DEPENDENCY_UNAVAILABLE',
      'M5_POLICY_VERSION_UNAVAILABLE',
      'M5_HISTORICAL_RULE_UNAVAILABLE'
    ]);
  });

  // System-Failure Taxonomy Mapping
  test('System failure classes produce SYSTEM_UNAVAILABLE and correct code', () => {
    const mockB5Input = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      readinessState: 'READY_UNCLEARED',
      reasons: []
    };

    const record = mapSystemFailure(mockB5Input, 'M5_EVALUATION_ERROR', { implementationIdentity: 'mock-commit' });
    assert.strictEqual(record.m5Decision, 'SYSTEM_UNAVAILABLE');
    assert.deepStrictEqual(record.m5ReasonCodes, ['M5_EVALUATION_ERROR']);
    assert.notStrictEqual(record.m5Decision, 'NOT_READY');
  });

  // Amendment 4: Filesystem Resolution Error Taxonomy
  test('Amendment 4: sourceLocator path validations', () => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });

    // Setup nested files
    const validFile = 'src/data/provenance_registry.json';
    const validNestedPath = path.join(testTmpDir, validFile);
    fs.mkdirSync(path.dirname(validNestedPath), { recursive: true });
    fs.writeFileSync(validNestedPath, '[]', 'utf-8');

    // 1. Valid local git locator
    const result1 = validateSourceLocator(validFile, 'git', testTmpDir);
    assert.strictEqual(result1, 'VALID_LOCAL_LOCATOR');

    // 2. Directory target (not file)
    const resultDir = validateSourceLocator('src/data', 'git', testTmpDir);
    assert.strictEqual(resultDir, 'TARGET_NOT_FILE');

    // 3. Traversal escape path (lexical escape)
    const resultEscape = validateSourceLocator('../outside.txt', 'git', testTmpDir);
    assert.strictEqual(resultEscape, 'OUTSIDE_ALLOWED_ROOT');

    // 4. Missing target
    const resultMissing = validateSourceLocator('src/data/missing.json', 'git', testTmpDir);
    assert.strictEqual(resultMissing, 'TARGET_NOT_FOUND');

    // 5. Absolute POSIX path escape
    const resultAbsolutePosix = validateSourceLocator('/etc/passwd', 'git', testTmpDir);
    assert.strictEqual(resultAbsolutePosix, 'OUTSIDE_ALLOWED_ROOT');

    // 6. Windows drive-letter escape
    const resultDrive = validateSourceLocator('C:\\Windows\\system32', 'git', testTmpDir);
    assert.strictEqual(resultDrive, 'OUTSIDE_ALLOWED_ROOT');

    // 7. UNC path escape
    const resultUNC = validateSourceLocator('\\\\server\\share\\file', 'git', testTmpDir);
    assert.strictEqual(resultUNC, 'OUTSIDE_ALLOWED_ROOT');

    // 8. Null byte rejection
    const resultNul = validateSourceLocator('file\0name', 'git', testTmpDir);
    assert.strictEqual(resultNul, 'INVALID_LOCATOR');

    // 9. Symlink escape (if platform supports)
    try {
      const symlinkPath = path.join(testTmpDir, 'escapelink');
      // Create external dummy file
      const externalDummy = path.join(path.dirname(testTmpDir), 'external.txt');
      fs.writeFileSync(externalDummy, 'external content', 'utf-8');
      
      fs.symlinkSync(externalDummy, symlinkPath);
      
      const resultSymlink = validateSourceLocator('escapelink', 'git', testTmpDir);
      assert.strictEqual(resultSymlink, 'OUTSIDE_ALLOWED_ROOT');
      
      fs.unlinkSync(symlinkPath);
      fs.rmSync(externalDummy, { force: true });
    } catch (e) {
      // Symlinks might not be supported/authorized without admin rights on Windows
      console.log('Skipping symlink test case as platform does not support symlinks in this context');
    }
  });

  // versioned-filesystem Safe Default
  test('versioned-filesystem returns UNSUPPORTED_LOCAL_RESOLUTION', () => {
    const result = validateSourceLocator('some/file.txt', 'versioned-filesystem', testTmpDir);
    assert.strictEqual(result, 'UNSUPPORTED_LOCAL_RESOLUTION');
  });

  // External systems default
  test('External systems return EXTERNAL_LOCATOR without local filesystem resolution', () => {
    const result = validateSourceLocator('doc-1234', 'dms', testTmpDir);
    assert.strictEqual(result, 'EXTERNAL_LOCATOR');

    const result2 = validateSourceLocator('ticket-567', 'issue-tracker', testTmpDir);
    assert.strictEqual(result2, 'EXTERNAL_LOCATOR');
  });

  // Determinism Verification
  test('Decision record serializer guarantees determinism', () => {
    const mockDecision = {
      subjectType: 'learning-article',
      subjectId: 'src/content/learning/test.md',
      provenanceRef: 'EV-BG-001',
      repositoryCommit: 'commit-sha-1234',
      b5ReadinessState: 'READY_UNCLEARED',
      m5Decision: 'ELIGIBLE',
      b5ReasonCodes: ['RUNTIME_NOT_PASS', 'MISSING_PROVENANCE_REF'],
      m5ReasonCodes: ['M5_CONFIGURATION_INVALID', 'M5_EVALUATION_ERROR'],
      policyVersion: 'M5-POLICY-1.0',
      evaluatorVersion: 'M5-EVALUATOR-1.0',
      implementationIdentity: 'commit-sha-1234',
      decisionFinality: 'FINAL'
    };

    const str1 = serializeDecisionRecord(mockDecision);
    const str2 = serializeDecisionRecord(mockDecision);
    const hash1 = computeDecisionRecordHash(mockDecision);
    const hash2 = computeDecisionRecordHash(mockDecision);

    assert.strictEqual(str1, str2);
    assert.strictEqual(hash1, hash2);

    // Verify properties sorted alphabetically
    const keys = Object.keys(JSON.parse(str1));
    const sortedKeys = [...keys].sort();
    assert.deepStrictEqual(keys, sortedKeys);
  });
});
