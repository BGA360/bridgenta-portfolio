import { test } from 'node:test';
import assert from 'node:assert';
import { AssessmentContext, IProviderResponse } from '../shared/types.js';
import { IKnowledgeBundle } from '../transformer/types.js';
import { CommunicationTransformationService } from '../transformer/communication-transformation.service.js';
import { InstructionComposerService } from '../transformer/instruction-composer.service.js';
import { ProviderResponseParserService } from '../transformer/provider-response-parser.service.js';

// ==========================================
// MOCK DATA GENERATION FOR TRANSFORMATION
// ==========================================

function createMockContext(): AssessmentContext {
  return {
    assessmentId: 'sess-transformation-test',
    project: 'bridgenta-test',
    target: 'docs/sample.md',
    projectIdentity: {
      name: 'BridGenta Test',
      id: 'proj-bga-test'
    },
    repositoryDetails: {
      remoteUri: 'https://github.com/BGA360/test.git',
      branch: 'main',
      commitHash: 'abcdef1234567890',
      status: 'clean'
    },
    targetDocument: {
      path: 'docs/sample.md',
      hash: 'filehash123'
    },
    projectType: 'Documentation',
    lifecyclePhase: 'Active',
    publicationClassification: 'Internal',
    runtimeMetadata: {
      env: 'test',
      os: 'win32',
      timestamp: new Date().toISOString(),
      processId: 1010
    },
    traceabilityMetadata: {
      signature: 'sig-test'
    },
    creationTimestamp: new Date().toISOString()
  };
}

function createMockBundle(): IKnowledgeBundle {
  return {
    schemaVersion: '2.0.0',
    metadata: {
      bundleHash: 'bundlehash123',
      ruleCount: 2,
      timestamp: new Date().toISOString()
    },
    rules: [
      {
        id: 'RULE-001',
        type: 'Guideline',
        summary: 'Use active voice.',
        body: 'Always write in active voice.'
      },
      {
        id: 'RULE-002',
        type: 'Canon',
        summary: 'Include meta headers.',
        body: 'Every doc must have metadata headers.'
      }
    ]
  };
}

function createMockResponse(text: string): IProviderResponse {
  return {
    text,
    stopReason: 'stop',
    tokenUsage: {
      inputTokens: 100,
      outputTokens: 50
    },
    providerId: 'provider-mock',
    metadata: {
      requestId: 'req-123',
      timestamp: new Date().toISOString()
    }
  };
}

// ==========================================
// 1. INSTRUCTION COMPOSITION & PRECEDENCE TESTS
// ==========================================

test('WP-010: Precedence - Preserves packaged bundle rule order', () => {
  const composer = new InstructionComposerService();
  const bundle = createMockBundle();
  const instructions = composer.composeSystemInstructions(bundle);

  const rule1Index = instructions.indexOf('RULE-001');
  const rule2Index = instructions.indexOf('RULE-002');

  assert.ok(rule1Index !== -1, 'RULE-001 must be present');
  assert.ok(rule2Index !== -1, 'RULE-002 must be present');
  assert.ok(rule1Index < rule2Index, 'Rules must follow the exact order in the bundle');
});

test('WP-010: Snapshot Projection - Encloses source code in XML tags', () => {
  const composer = new InstructionComposerService();
  const context = createMockContext();
  const fileContent = 'sample content of target doc';

  const promptText = composer.composePromptText(context, fileContent);
  assert.ok(promptText.includes('<target_file>'), 'Prompt must contain XML opening tag');
  assert.ok(promptText.includes('sample content of target doc'), 'Prompt must contain source content');
  assert.ok(promptText.includes('</target_file>'), 'Prompt must contain XML closing tag');
});

// ==========================================
// 2. ENVELOPE ASSEMBLY & IMMUTABILITY TESTS
// ==========================================

test('WP-010: Phase A - Compiles frozen ProviderExecutionEnvelope', () => {
  const service = new CommunicationTransformationService();
  const context = createMockContext();
  const bundle = createMockBundle();
  const fileContent = 'original text';

  const envelope = service.assembleExecutionEnvelope(context, bundle, fileContent);

  assert.strictEqual(envelope.sessionId, 'sess-transformation-test');
  assert.ok(envelope.promptText.includes('original text'));
  assert.strictEqual(envelope.bundleHash, 'bundlehash123');

  // Verify immutability
  assert.throws(() => {
    (envelope as any).sessionId = 'mutated';
  }, TypeError);
});

// ==========================================
// 3. POST-EXECUTION DIFF RECONSTRUCTION TESTS
// ==========================================

test('WP-010: Parser - Strips markdown code fences from LLM responses', () => {
  const parser = new ProviderResponseParserService();

  const formattedResponse = 'Here is the diff:\n```diff\n- old text\n+ new text\n```\nHope this helps!';
  const parsedDiff = parser.parseDiff(formattedResponse);

  assert.strictEqual(parsedDiff, '- old text\n+ new text');
});

test('WP-010: Parser - Returns raw response if no fences exist', () => {
  const parser = new ProviderResponseParserService();
  const rawText = 'simple plain text diff content';
  const parsedDiff = parser.parseDiff(rawText);

  assert.strictEqual(parsedDiff, 'simple plain text diff content');
});

// ==========================================
// 4. TRANSFORMATION FACADE & PROVENANCE TESTS
// ==========================================

test('WP-010: Phase B - Creates CandidateCommunication and TransformationMetadata with provenance', () => {
  const service = new CommunicationTransformationService();
  const context = createMockContext();
  const bundle = createMockBundle();
  
  const responseText = '```diff\n- old\n+ new\n```';
  const response = createMockResponse(responseText);

  const result = service.transformProviderResponse(response, context, bundle, 450);

  // Validate Communication
  assert.strictEqual(result.communication.sessionId, 'sess-transformation-test');
  assert.strictEqual(result.communication.diffContent, '- old\n+ new');
  assert.strictEqual(result.communication.targetFilePath, 'docs/sample.md');
  assert.strictEqual(result.communication.status, 'success');

  // Validate Metadata & Provenance
  assert.strictEqual(result.metadata.modelId, 'provider-mock');
  assert.strictEqual(result.metadata.durationMs, 450);
  assert.deepStrictEqual(result.metadata.ruleHits, ['RULE-001', 'RULE-002']);
  assert.ok(result.metadata.promptHash.length === 64, 'promptHash must be a valid SHA256 hex string');

  // Verify Deep Immutability
  assert.throws(() => {
    (result as any).communication = {} as any;
  }, TypeError);

  assert.throws(() => {
    (result.communication as any).status = 'failed';
  }, TypeError);

  assert.throws(() => {
    (result.metadata.ruleHits as any)[0] = 'MUTATED';
  }, TypeError);
});
