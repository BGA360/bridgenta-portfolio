import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { KnowledgeBundleBuilderService } from '../bundle/knowledge-bundle-builder.service.js';
import {
  EmptyBundleException,
  DuplicateRuleException,
  ConflictingVocabularyException,
  MalformedEvidenceException,
  StalePointerException,
  OversizedBundleException
} from '../bundle/exceptions.js';
import { IResolvedKnowledge } from '../resolver/types.js';

function createTempRepo(prefix: string) {
  const tempDir = fs.mkdtempSync(path.join(process.cwd(), `becc-test-bundle-${prefix}-`));
  return tempDir;
}

function cleanupTempRepo(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

const mockResolvedBase: IResolvedKnowledge = {
  sessionId: 'sess-abc',
  rulePointers: [],
  vocabularyList: [],
  resolutionEvidence: [],
  timestamp: new Date().toISOString()
};

test('WP-007: Identity & Versioning - Session ID correlation and schema version', async () => {
  const root = createTempRepo('identity');
  try {
    const file = path.join(root, 'rule.md');
    fs.writeFileSync(file, '## RULE-01: Heading\nRule content goes here.');

    const resolved: IResolvedKnowledge = {
      sessionId: 'test-session-uuid',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 2,
          contentHash: '',
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };

    const crypto = await import('node:crypto');
    const hash = crypto.createHash('sha256').update('Rule content goes here.').digest('hex');
    (resolved.rulePointers[0] as any).contentHash = hash;

    const builder = new KnowledgeBundleBuilderService({
      knowledgeRoots: [root],
      environment: 'test'
    });

    const bundle = builder.build(resolved);
    assert.strictEqual(bundle.sessionId, 'test-session-uuid');
    assert.strictEqual(bundle.schemaVersion, '2.0.0');
    assert.strictEqual(bundle.rules.length, 1);
    assert.strictEqual(bundle.rules[0].content, 'Rule content goes here.');
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-007: Materialization - Valid range, heading mismatch and hash drift', async () => {
  const root = createTempRepo('materialization');
  const crypto = await import('node:crypto');
  try {
    const file = path.join(root, 'rule.md');
    fs.writeFileSync(file, '## RULE-01: Heading\nContent line 1\nContent line 2');

    const correctHash = crypto.createHash('sha256').update('Content line 1\nContent line 2').digest('hex');

    const builder = new KnowledgeBundleBuilderService({
      knowledgeRoots: [root]
    });

    const resolvedHeadingMismatch: IResolvedKnowledge = {
      sessionId: 'sess-123',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Wrong Heading',
          startLine: 1,
          endLine: 3,
          contentHash: correctHash,
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };

    assert.throws(() => {
      builder.build(resolvedHeadingMismatch);
    }, StalePointerException);

    const resolvedHashMismatch: IResolvedKnowledge = {
      sessionId: 'sess-123',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 3,
          contentHash: 'incorrect-hash-digest',
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };

    assert.throws(() => {
      builder.build(resolvedHashMismatch);
    }, StalePointerException);
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-007: Determinism & Serialization - Stable sorting and reproducible hash', async () => {
  const root = createTempRepo('determinism');
  const crypto = await import('node:crypto');
  try {
    const file1 = path.join(root, 'rule1.md');
    fs.writeFileSync(file1, '## RULE-B\nBody B');
    const file2 = path.join(root, 'rule2.md');
    fs.writeFileSync(file2, '## RULE-A\nBody A');

    const hashB = crypto.createHash('sha256').update('Body B').digest('hex');
    const hashA = crypto.createHash('sha256').update('Body A').digest('hex');

    const resolved: IResolvedKnowledge = {
      sessionId: 'sess-123',
      rulePointers: [
        {
          ruleId: 'RULE-B',
          filePath: 'rule1.md',
          heading: 'RULE-B',
          startLine: 1,
          endLine: 2,
          contentHash: hashB,
          precedenceOrder: 5,
          precedenceTier: 'CoreVolume',
          authoritySource: 'rule1.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        },
        {
          ruleId: 'RULE-A',
          filePath: 'rule2.md',
          heading: 'RULE-A',
          startLine: 1,
          endLine: 2,
          contentHash: hashA,
          precedenceOrder: 2,
          precedenceTier: 'CoreVolume',
          authoritySource: 'rule2.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [
        { term: 'beta', classification: 'preferred' },
        { term: 'alpha', classification: 'forbidden' }
      ],
      resolutionEvidence: [
        {
          ruleId: 'RULE-B',
          selectedSourcePath: 'rule1.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'CoreVolume',
          appliedPrecedenceOrder: 5
        },
        {
          ruleId: 'RULE-A',
          selectedSourcePath: 'rule2.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'CoreVolume',
          appliedPrecedenceOrder: 2
        }
      ],
      timestamp: new Date().toISOString()
    };

    const builder = new KnowledgeBundleBuilderService({ knowledgeRoots: [root] });
    const bundle1 = builder.build(resolved);
    const bundle2 = builder.build(resolved);

    assert.strictEqual(bundle1.rules[0].ruleId, 'RULE-A');
    assert.strictEqual(bundle1.rules[1].ruleId, 'RULE-B');

    assert.strictEqual(bundle1.vocabulary[0].term, 'alpha');
    assert.strictEqual(bundle1.vocabulary[1].term, 'beta');

    assert.strictEqual(bundle1.resolutionEvidence[0].ruleId, 'RULE-A');
    assert.strictEqual(bundle1.resolutionEvidence[1].ruleId, 'RULE-B');

    assert.strictEqual(bundle1.integrity.bundleHash, bundle2.integrity.bundleHash);
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-007: Structural Validation - Empty bundle, duplicate rule IDs, vocabulary conflicts, orphan evidence', async () => {
  const root = createTempRepo('validation');
  const crypto = await import('node:crypto');
  try {
    const file = path.join(root, 'rule.md');
    fs.writeFileSync(file, '## RULE-01: Heading\nBody');
    const hash = crypto.createHash('sha256').update('Body').digest('hex');

    const builder = new KnowledgeBundleBuilderService({ knowledgeRoots: [root] });

    const emptyResolved: IResolvedKnowledge = { ...mockResolvedBase, rulePointers: [] };
    assert.throws(() => {
      builder.build(emptyResolved);
    }, EmptyBundleException);

    const duplicateResolved: IResolvedKnowledge = {
      sessionId: 'sess-abc',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 2,
          contentHash: hash,
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        },
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 2,
          contentHash: hash,
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };
    assert.throws(() => {
      builder.build(duplicateResolved);
    }, DuplicateRuleException);

    const conflictVocabResolved: IResolvedKnowledge = {
      sessionId: 'sess-abc',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 2,
          contentHash: hash,
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [
        { term: 'nominal-style', classification: 'forbidden' },
        { term: 'nominal-style', classification: 'required' }
      ],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };
    assert.throws(() => {
      builder.build(conflictVocabResolved);
    }, ConflictingVocabularyException);

    const orphanEvidenceResolved: IResolvedKnowledge = {
      sessionId: 'sess-abc',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 2,
          contentHash: hash,
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        },
        {
          ruleId: 'RULE-02',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };
    assert.throws(() => {
      builder.build(orphanEvidenceResolved);
    }, MalformedEvidenceException);
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-007: Size Limit & Immutability - Exceeds limit and deeply frozen verification', async () => {
  const root = createTempRepo('size-immutability');
  const crypto = await import('node:crypto');
  try {
    const file = path.join(root, 'rule.md');
    fs.writeFileSync(file, '## RULE-01: Heading\nBody text content');
    const hash = crypto.createHash('sha256').update('Body text content').digest('hex');

    const resolved: IResolvedKnowledge = {
      sessionId: 'sess-abc',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 2,
          contentHash: hash,
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };

    const builderOversized = new KnowledgeBundleBuilderService({
      knowledgeRoots: [root],
      maxSizeBytes: 50
    });

    assert.throws(() => {
      builderOversized.build(resolved);
    }, OversizedBundleException);

    const builderNormal = new KnowledgeBundleBuilderService({ knowledgeRoots: [root] });
    const bundle = builderNormal.build(resolved);

    assert.ok(Object.isFrozen(bundle));
    assert.ok(Object.isFrozen(bundle.rules));
    assert.ok(Object.isFrozen(bundle.vocabulary));
    assert.ok(Object.isFrozen(bundle.resolutionEvidence));
    assert.ok(Object.isFrozen(bundle.integrity));
    assert.ok(Object.isFrozen(bundle.buildMetadata));
    assert.ok(Object.isFrozen(bundle.rules[0]));
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-007: Scope Protection - No XML wrappers or provider leakage', async () => {
  const root = createTempRepo('scope-protection');
  const crypto = await import('node:crypto');
  try {
    const file = path.join(root, 'rule.md');
    fs.writeFileSync(file, '## RULE-01: Heading\nRule body text');
    const hash = crypto.createHash('sha256').update('Rule body text').digest('hex');

    const resolved: IResolvedKnowledge = {
      sessionId: 'sess-abc',
      rulePointers: [
        {
          ruleId: 'RULE-01',
          filePath: 'rule.md',
          heading: 'RULE-01: Heading',
          startLine: 1,
          endLine: 2,
          contentHash: hash,
          precedenceOrder: 1,
          precedenceTier: 'Canon',
          authoritySource: 'rule.md',
          originatingFramework: 'BGCF',
          versionIdentifier: '2.0.0'
        }
      ],
      vocabularyList: [],
      resolutionEvidence: [
        {
          ruleId: 'RULE-01',
          selectedSourcePath: 'rule.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ],
      timestamp: new Date().toISOString()
    };

    const builder = new KnowledgeBundleBuilderService({ knowledgeRoots: [root] });
    const bundle = builder.build(resolved);

    const content = bundle.rules[0].content;
    assert.ok(!content.includes('<CONSTRAINTS>'));
    assert.ok(!content.includes('</CONSTRAINTS>'));
    assert.ok(!content.includes('<VOCABULARY>'));

    assert.strictEqual((builder as any).selectRoute, undefined);
    assert.strictEqual((builder as any).validateCommunication, undefined);
  } finally {
    cleanupTempRepo(root);
  }
});
