import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { CrawlerService } from '../resolver/crawler.service.js';
import { DocumentParserService } from '../resolver/document-parser.service.js';
import { RuleExtractorService } from '../resolver/rule-extractor.service.js';
import { OverrideResolverService } from '../resolver/override-resolver.service.js';
import { KnowledgeResolverService } from '../resolver/knowledge-resolver.service.js';
import {
  PathTraversalException,
  ConflictingOverridesException,
  DuplicateRuleException,
  MalformedMetadataException
} from '../resolver/exceptions.js';
import { AssessmentContext } from '../shared/types.js';

function createTempRepo(prefix: string) {
  const tempDir = fs.mkdtempSync(path.join(process.cwd(), `becc-test-resolver-${prefix}-`));
  return tempDir;
}

function cleanupTempRepo(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

const mockContext: AssessmentContext = {
  assessmentId: 'sess-123',
  project: 'AEOcortex',
  target: 'docs/START_HERE.md',
  projectIdentity: { name: 'AEOcortex', id: 'aeocortex-id' },
  repositoryDetails: {
    remoteUri: 'https://github.com/org/repo',
    branch: 'main',
    commitHash: 'abcdef123456',
    status: 'clean'
  },
  targetDocument: { path: 'docs/START_HERE.md', hash: 'hash123' },
  projectType: 'specs',
  lifecyclePhase: 'Release',
  publicationClassification: 'public',
  runtimeMetadata: {
    env: 'test',
    os: 'windows',
    timestamp: new Date().toISOString(),
    processId: 123
  },
  traceabilityMetadata: { signature: 'sig123' },
  creationTimestamp: new Date().toISOString()
};

test('WP-006: Traversal - Configured Knowledge Root and file discovery', () => {
  const root = createTempRepo('traversal');
  try {
    const crawler = new CrawlerService();
    fs.writeFileSync(path.join(root, 'START_HERE.md'), 'Content');
    fs.mkdirSync(path.join(root, 'subdir'));
    fs.writeFileSync(path.join(root, 'subdir', 'file1.md'), 'Content 1');
    fs.writeFileSync(path.join(root, 'subdir', 'file2.txt'), 'Content 2');

    const config = {
      knowledgeRoots: [root],
      knowledgeEntryPoint: path.join(root, 'START_HERE.md'),
      exclusionPaths: [],
      permittedFileTypes: ['.md'],
      traversalDepthLimit: 5
    };

    const files = crawler.discoverFiles(root, config);
    assert.strictEqual(files.length, 2);
    assert.ok(files.includes(path.join(root, 'START_HERE.md')));
    assert.ok(files.includes(path.join(root, 'subdir', 'file1.md')));
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-006: Traversal - Traversal depth limit and exclusion paths', () => {
  const root = createTempRepo('traversal-depth');
  try {
    const crawler = new CrawlerService();
    fs.writeFileSync(path.join(root, 'START_HERE.md'), 'Content');
    
    let nested = root;
    for (let i = 1; i <= 4; i++) {
      nested = path.join(nested, `dir${i}`);
      fs.mkdirSync(nested);
      fs.writeFileSync(path.join(nested, 'file.md'), 'Content');
    }

    const excludedDir = path.join(root, 'examples');
    fs.mkdirSync(excludedDir);
    fs.writeFileSync(path.join(excludedDir, 'file.md'), 'Excluded');

    const config = {
      knowledgeRoots: [root],
      knowledgeEntryPoint: path.join(root, 'START_HERE.md'),
      exclusionPaths: [excludedDir],
      permittedFileTypes: ['.md'],
      traversalDepthLimit: 2
    };

    const files = crawler.discoverFiles(root, config);
    assert.strictEqual(files.length, 3);
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-006: Traversal - Path Traversal Boundary Escape Rejection', () => {
  const root = createTempRepo('boundary-escape');
  try {
    const crawler = new CrawlerService();
    
    assert.throws(() => {
      crawler.resolveAndValidatePath(path.join(root, '..'), [root]);
    }, PathTraversalException);

    assert.throws(() => {
      crawler.resolveAndValidatePath(path.join(root, 'some-file/../../outside'), [root]);
    }, PathTraversalException);
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-006: Metadata Parsing - Frontmatter parsing and status validation', () => {
  const parser = new DocumentParserService();

  const fileContent = `---\nstatus: active\nversion: 2.0.0\nprecedenceTier: CoreVolume\n---\n## Heading`;
  const result = parser.parseMetadata(fileContent, 'test-file.md');
  assert.strictEqual(result.metadata.status, 'active');
  assert.strictEqual(result.metadata.version, '2.0.0');
  assert.strictEqual(result.metadata.precedenceTier, 'CoreVolume');
  assert.strictEqual(result.contentBody.trim(), '## Heading');

  assert.strictEqual(parser.isDocumentActive({ status: 'archive' }), false);
  assert.strictEqual(parser.isDocumentActive({ status: 'historical' }), false);
  assert.strictEqual(parser.isDocumentActive({ status: 'active' }), true);
});

test('WP-006: Metadata Parsing - Malformed frontmatter throws exception', () => {
  const parser = new DocumentParserService();
  const fileContent = `---\nstatus: active\nversion: 2.0.0\nprecedenceTier: [invalid\n---\n## Heading`;
  assert.throws(() => {
    parser.parseMetadata(fileContent, 'test-file.md');
  }, MalformedMetadataException);
});

test('WP-006: Rule Extraction - Headings, ranges, and content hashing', () => {
  const extractor = new RuleExtractorService();
  const content = `Some intro text\n\n## RULE-01: Rule Title\nLine 1\nLine 2\n\n### RULE-02: Sub Rule\nLine 3\n`;

  const rules = extractor.extractRules(content, 'file.md', { precedenceTier: 'Canon' });
  assert.strictEqual(rules.length, 2);

  assert.strictEqual(rules[0].ruleId, 'RULE-01');
  assert.strictEqual(rules[0].heading, 'RULE-01: Rule Title');
  assert.strictEqual(rules[0].startLine, 3);
  assert.strictEqual(rules[0].endLine, 6);

  assert.strictEqual(rules[1].ruleId, 'RULE-02');
  assert.strictEqual(rules[1].heading, 'RULE-02: Sub Rule');
  assert.strictEqual(rules[1].startLine, 7);
  assert.strictEqual(rules[1].endLine, 9);

  const text1 = '  Hello   World  \r\n';
  const text2 = 'Hello World\n';
  assert.strictEqual(extractor.calculateContentHash(text1), extractor.calculateContentHash(text2));
});

test('WP-006: Precedence Resolution - Canon, Volume ordering and conflicts', () => {
  const resolver = new OverrideResolverService();

  const ruleA: any = {
    ruleId: 'RULE-01',
    filePath: 'canon/README.md',
    precedenceTier: 'Canon',
    precedenceOrder: 1
  };

  const ruleB: any = {
    ruleId: 'RULE-01',
    filePath: 'project/04-cst/README.md',
    precedenceTier: 'CoreVolume',
    precedenceOrder: 5
  };

  const result = resolver.resolveOverrides([ruleA, ruleB]);
  assert.strictEqual(result.resolvedPointers.length, 1);
  assert.strictEqual(result.resolvedPointers[0].filePath, 'canon/README.md');
  assert.strictEqual(result.evidence[0].overriddenSourcesPaths[0], 'project/04-cst/README.md');

  const ruleC: any = {
    ruleId: 'RULE-01',
    filePath: 'project/08-other/README.md',
    precedenceTier: 'CoreVolume',
    precedenceOrder: 5
  };
  assert.throws(() => {
    resolver.resolveOverrides([ruleB, ruleC]);
  }, ConflictingOverridesException);

  const ruleD: any = {
    ruleId: 'RULE-01',
    filePath: 'project/04-cst/README.md',
    precedenceTier: 'CoreVolume',
    precedenceOrder: 5
  };
  assert.throws(() => {
    resolver.resolveOverrides([ruleB, ruleD]);
  }, DuplicateRuleException);
});

test('WP-006: Vocabulary - Extract table terms', () => {
  const extractor = new RuleExtractorService();
  const tableContent = `
| Term | Classification | Definition |
| :--- | :--- | :--- |
| nominal-style | Forbidden | Avoid nominal noun formulations. |
| active-voice | Preferred | Use active sentence formulations. |
  `;

  const terms = extractor.extractVocabulary(tableContent);
  assert.strictEqual(terms.length, 2);
  assert.strictEqual(terms[0].term, 'nominal-style');
  assert.strictEqual(terms[0].classification, 'forbidden');
  assert.strictEqual(terms[1].term, 'active-voice');
  assert.strictEqual(terms[1].classification, 'preferred');
});

test('WP-006: Immutability - Resolved output deep freeze', async () => {
  const root = createTempRepo('immutability');
  try {
    fs.writeFileSync(path.join(root, 'START_HERE.md'), `---\nprecedenceTier: Canon\n---\n## RULE-01\nText`);
    
    const resolver = new KnowledgeResolverService({
      knowledgeRoots: [root],
      knowledgeEntryPoint: path.join(root, 'START_HERE.md')
    });

    const result = await resolver.resolve(mockContext);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.rulePointers));
    assert.ok(Object.isFrozen(result.vocabularyList));
    assert.ok(Object.isFrozen(result.resolutionEvidence));
  } finally {
    cleanupTempRepo(root);
  }
});

test('WP-006: Scope Protection - Decoupled from bundle builder and providers', () => {
  const resolver = new KnowledgeResolverService();
  assert.strictEqual((resolver as any).build, undefined);
  assert.strictEqual((resolver as any).selectProvider, undefined);
  assert.strictEqual((resolver as any).invokeAdapter, undefined);
});
