import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CommunicationValidationService } from '../validator/communication-validation.service.js';
import { CandidateMaterializerService } from '../validator/candidate-materializer.service.js';
import { StaleBaselineException, PathTraversalException, MalformedDiffException } from '../validator/exceptions.js';
import { AssessmentContext } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { ValidatorRegistryService } from '../validator/validator-registry.service.js';

// ==========================================
// TEST UTILITIES & MOCKS
// ==========================================

const repoRoot = path.resolve('tests/fixtures');
const tempFilePath = 'temp-validation-doc.md';
const tempFileAbsPath = path.resolve(repoRoot, tempFilePath);

function setupTempFile(content: string) {
  fs.writeFileSync(tempFileAbsPath, content, 'utf8');
}

function cleanupTempFile() {
  try {
    if (fs.existsSync(tempFileAbsPath)) {
      fs.unlinkSync(tempFileAbsPath);
    }
  } catch {}
}

function createMockContext(baselineContent: string): AssessmentContext {
  const hash = createHash('sha256').update(baselineContent).digest('hex');
  return {
    assessmentId: 'sess-validation-test',
    project: 'bridgenta-validation-test',
    target: tempFilePath,
    projectIdentity: {
      name: 'BridGenta Validation Test',
      id: 'proj-bga-val-test'
    },
    repositoryDetails: {
      remoteUri: 'https://github.com/BGA360/test.git',
      branch: 'main',
      commitHash: 'abcdef1234567890',
      status: 'clean',
      repositoryRoot: repoRoot
    } as any,
    targetDocument: {
      path: tempFilePath,
      hash
    },
    projectType: 'Documentation',
    lifecyclePhase: 'Active',
    publicationClassification: 'Internal',
    runtimeMetadata: {
      env: 'test',
      os: 'win32',
      timestamp: new Date().toISOString(),
      processId: 2020
    },
    traceabilityMetadata: {
      signature: 'sig-test-val'
    },
    creationTimestamp: new Date().toISOString()
  };
}

function createMockBundle(): IKnowledgeBundle {
  return {
    schemaVersion: '2.0.0',
    sessionId: 'sess-validation-test',
    rules: [
      {
        ruleId: 'RULE-001',
        heading: 'No forbidden terminology.',
        content: 'Do not use the term "blacklist".',
        precedenceTier: 'Canon',
        precedenceOrder: 1,
        filePath: 'rules/001.md',
        startLine: 1,
        endLine: 10,
        contentHash: 'hash1'
      },
      {
        ruleId: 'RULE-002',
        heading: 'Required sections.',
        content: 'Every document must contain a "Verification Plan" section.',
        precedenceTier: 'DomainSpec',
        precedenceOrder: 2,
        filePath: 'rules/002.md',
        startLine: 1,
        endLine: 10,
        contentHash: 'hash2'
      }
    ],
    vocabulary: [
      {
        term: 'blacklist',
        classification: 'forbidden',
        definition: 'Use blocklist instead.'
      },
      {
        term: 'blocklist',
        classification: 'preferred',
        definition: 'Preferred alternative.'
      },
      {
        term: 'BridGenta',
        classification: 'required',
        definition: 'Company brand name.'
      }
    ],
    resolutionEvidence: [],
    integrity: {
      bundleHash: 'bundlehash123',
      ruleCount: 2,
      timestamp: new Date().toISOString()
    },
    buildMetadata: {
      environment: 'test',
      buildTimestamp: new Date().toISOString()
    }
  } as any;
}

// ==========================================
// 1. MATERIALIZER TESTS
// ==========================================

test('WP-011: Materializer - Transiently applies correct diff hunks', () => {
  const materializer = new CandidateMaterializerService();
  const baseline = 'line 1\nline 2\nline 3\n';
  const diff = '@@ -2,2 +2,2 @@\n-line 2\n-line 3\n+line two\n+line three';

  const result = materializer.materialize(baseline, diff);
  assert.strictEqual(result, 'line 1\nline two\nline three\n');
});

test('WP-011: Materializer - Throws on hunk context mismatch', () => {
  const materializer = new CandidateMaterializerService();
  const baseline = 'line 1\nline 2\nline 3\n';
  const diff = '@@ -2,1 +2,1 @@\n-line mismatch\n+line two';

  assert.throws(() => {
    materializer.materialize(baseline, diff);
  }, MalformedDiffException);
});

// ==========================================
// 2. PATH & CONTAINMENT BOUNDARY TESTS
// ==========================================

test('WP-011: Security - Rejects target path traversal escapes', async () => {
  const service = new CommunicationValidationService();
  const context = createMockContext('some content');
  (context.targetDocument as any).path = '../../outside.txt';

  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent: '',
      targetFilePath: '../../outside.txt'
    },
    metadata: {
      includedRuleIds: [],
      providerReferencedRuleIds: []
    }
  };
  const bundle = createMockBundle();

  await assert.rejects(async () => {
    await service.validate(context, diff, bundle);
  }, PathTraversalException);
});

// ==========================================
// 3. BASELINE STALE DETECTION TESTS
// ==========================================

test('WP-011: Integrity - Rejects validation on target baseline drift', async () => {
  const service = new CommunicationValidationService();
  const baseline = 'original baseline content';
  setupTempFile(baseline);

  const context = createMockContext(baseline);
  // Modify baseline content on disk to cause hash mismatch
  fs.writeFileSync(tempFileAbsPath, 'mutated content on disk', 'utf8');

  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent: '',
      targetFilePath: tempFilePath
    },
    metadata: {
      includedRuleIds: [],
      providerReferencedRuleIds: []
    }
  };
  const bundle = createMockBundle();

  await assert.rejects(async () => {
    await service.validate(context, diff, bundle);
  }, StaleBaselineException);

  cleanupTempFile();
});

// ==========================================
// 4. RULE VALIDATION TESTS
// ==========================================

test('WP-011: Rules - Flags forbidden terminology violations', async () => {
  const service = new CommunicationValidationService();
  const baseline = '# Document\nThis document uses BridGenta brand.\n';
  setupTempFile(baseline);

  const context = createMockContext(baseline);
  // Diff adds forbidden word "blacklist"
  const diffContent = '@@ -2,1 +2,1 @@\n-This document uses BridGenta brand.\n+This document uses blacklist brand.';
  
  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent,
      targetFilePath: tempFilePath
    },
    metadata: {
      includedRuleIds: ['RULE-001'],
      providerReferencedRuleIds: ['RULE-001']
    }
  };
  const bundle = createMockBundle();

  const report = await service.validate(context, diff, bundle);

  assert.strictEqual(report.summary.status, 'failed');
  assert.ok(report.summary.errorCount >= 1, 'Should contain at least one error finding');
  const forbiddenFinding = report.findings.find(f => f.category === 'Terminology');
  assert.ok(forbiddenFinding);
  assert.strictEqual(forbiddenFinding.severity, 'error');
  assert.match(forbiddenFinding.message, /forbidden/i);

  cleanupTempFile();
});

test('WP-011: Completeness - Flags missing required section', async () => {
  const service = new CommunicationValidationService();
  // Baseline lacks the required "Verification Plan" section specified by RULE-002
  const baseline = '# Document\nThis document uses BridGenta brand.\n';
  setupTempFile(baseline);

  const context = createMockContext(baseline);
  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent: '',
      targetFilePath: tempFilePath
    },
    metadata: {
      includedRuleIds: ['RULE-002'],
      providerReferencedRuleIds: []
    }
  };
  const bundle = createMockBundle();

  const report = await service.validate(context, diff, bundle);

  assert.strictEqual(report.summary.status, 'failed');
  const sectionFinding = report.findings.find(f => f.category === 'Completeness');
  assert.ok(sectionFinding, 'Required section finding must be present');
  assert.strictEqual(sectionFinding.severity, 'error');

  cleanupTempFile();
});

test('WP-011: Completeness - Flags duplicate section headings', async () => {
  const service = new CommunicationValidationService();
  // Document with duplicate heading levels
  const baseline = '# Document\n# Document\n';
  setupTempFile(baseline);

  const context = createMockContext(baseline);
  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent: '',
      targetFilePath: tempFilePath
    },
    metadata: {
      includedRuleIds: [],
      providerReferencedRuleIds: []
    }
  };
  // Pre-load required terms to avoid error
  const bundle = createMockBundle();
  (bundle.vocabulary as any)[2] = { term: 'Document', classification: 'required' };

  const report = await service.validate(context, diff, bundle);

  const duplicateFinding = report.findings.find(f => f.message.includes('Duplicate'));
  assert.ok(duplicateFinding, 'Should flag duplicate headings');
  assert.strictEqual(duplicateFinding.severity, 'warning');

  cleanupTempFile();
});

test('WP-011: Reference - Flags unsafe scheme URIs', async () => {
  const service = new CommunicationValidationService();
  const baseline = '# Document\n[Unsafe Link](http://unsafe.com)\n[Secure Link](https://secure.com)\n';
  setupTempFile(baseline);

  const context = createMockContext(baseline);
  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent: '',
      targetFilePath: tempFilePath
    },
    metadata: {
      includedRuleIds: [],
      providerReferencedRuleIds: []
    }
  };
  const bundle = createMockBundle();

  const report = await service.validate(context, diff, bundle);

  const refFinding = report.findings.find(f => f.category === 'References');
  assert.ok(refFinding);
  assert.strictEqual(refFinding.severity, 'warning');

  cleanupTempFile();
});

test('WP-011: Immutability - Generated ValidationResultReport is frozen', async () => {
  const service = new CommunicationValidationService();
  const baseline = '# Document\n';
  setupTempFile(baseline);

  const context = createMockContext(baseline);
  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent: '',
      targetFilePath: tempFilePath
    },
    metadata: {
      includedRuleIds: [],
      providerReferencedRuleIds: []
    }
  };
  const bundle = createMockBundle();

  const report = await service.validate(context, diff, bundle);

  assert.throws(() => {
    (report as any).sessionId = 'mutated';
  }, TypeError);

  cleanupTempFile();
});

test('WP-011: Evidence - Redacts excerpt for Public classification', async () => {
  const service = new CommunicationValidationService();
  const baseline = '# Document\nThis document uses BridGenta brand.\n';
  setupTempFile(baseline);

  const context = createMockContext(baseline);
  (context as any).publicationClassification = 'Public';
  
  // Diff adds forbidden word "blacklist"
  const diffContent = '@@ -2,1 +2,1 @@\n-This document uses BridGenta brand.\n+This document uses blacklist brand.';
  
  const diff = {
    communication: {
      sessionId: 'sess-validation-test',
      diffContent,
      targetFilePath: tempFilePath
    },
    metadata: {
      includedRuleIds: ['RULE-001'],
      providerReferencedRuleIds: ['RULE-001']
    }
  };
  const bundle = createMockBundle();

  const report = await service.validate(context, diff, bundle);

  const termEvidence = report.evidence.find(ev => ev.expectedCondition.includes('blacklist'));
  assert.ok(termEvidence);
  assert.strictEqual(termEvidence.excerpt, undefined, 'Excerpt must be redacted (undefined) for Public classification');

  cleanupTempFile();
});

test('WP-011: Registry - Rejects duplicate validator registration', () => {
  const registry = new ValidatorRegistryService();
  const mockVal = { name: 'DuplicateTest', validate: () => ({ findings: [], evidence: [] }) };

  registry.register(mockVal);
  registry.register(mockVal);

  assert.strictEqual(registry.getValidators().length, 1);
});

