import test from 'node:test';
import assert from 'node:assert';
import { AssessmentRequest } from '../shared/types.js';
import { ProjectConnectorResult } from '../connector/types.js';
import { AssessmentContextBuilder } from '../context/assessment-context.builder.js';
import {
  MissingInputException,
  InputCorrelationMismatch,
  InvalidClassificationException,
  MalformedContextException
} from '../context/exceptions.js';

// Helper to generate a baseline request and matching connector result
function createMockInputs(overrides: {
  request?: Partial<AssessmentRequest>;
  result?: Partial<ProjectConnectorResult>;
} = {}) {
  const assessmentId = '4f52e1fc-ef73-495f-b1d6-2d00c4721890';
  const project = 'AEOcortex';
  const target = 'docs/assessment.md';
  const timestamp = '2026-07-15T12:00:00Z';
  const providerPreference = 'antigravity';

  const request: AssessmentRequest = {
    assessmentId,
    project,
    target,
    timestamp,
    providerPreference,
    ...overrides.request
  };

  const result: ProjectConnectorResult = {
    assessmentId,
    timestamp,
    providerPreference,
    project,
    target,
    repositoryRoot: '/path/to/repo',
    projectIdentity: {
      name: 'AEOcortex',
      id: 'aeocortex-id'
    },
    repositoryDetails: {
      remoteUri: 'https://github.com/org/aeocortex.git',
      branch: 'feature/wp-004-assessment-context',
      commitHash: '217a565816900cadac8f46effc8cd4a5638d971c',
      status: 'clean'
    },
    targetDocument: {
      path: 'docs/assessment.md',
      hash: 'cf5b8e0a12e1a3bc45e828f73f8cd4a5638d971c98a60e0a9d860e0a12e1a3bc'
    },
    projectType: 'specs',
    declaredClassification: 'public',
    status: 'success',
    runtimeMetadata: {
      env: 'test',
      os: 'win32',
      timestamp: '2026-07-15T12:00:02Z',
      processId: 1234
    },
    rawConfig: {
      project: 'AEOcortex'
    },
    ...overrides.result
  };

  return { request, result };
}

test('WP-004: Valid Construction and Field Mapping', () => {
  const { request, result } = createMockInputs();
  const context = AssessmentContextBuilder.build(request, result);

  // Assert correct field mappings
  assert.strictEqual(context.assessmentId, request.assessmentId);
  assert.strictEqual(context.project, request.project);
  assert.strictEqual(context.target, request.target);
  assert.strictEqual(context.projectIdentity.name, result.projectIdentity.name);
  assert.strictEqual(context.projectIdentity.id, result.projectIdentity.id);
  assert.strictEqual(context.repositoryDetails.remoteUri, result.repositoryDetails.remoteUri);
  assert.strictEqual(context.repositoryDetails.branch, result.repositoryDetails.branch);
  assert.strictEqual(context.repositoryDetails.commitHash, result.repositoryDetails.commitHash);
  assert.strictEqual(context.repositoryDetails.status, result.repositoryDetails.status);
  assert.strictEqual(context.targetDocument.path, result.targetDocument.path);
  assert.strictEqual(context.targetDocument.hash, result.targetDocument.hash);
  assert.strictEqual(context.projectType, result.projectType);
  assert.strictEqual(context.providerPreference, request.providerPreference);
  
  // Assert normalized / resolved facts
  assert.strictEqual(context.lifecyclePhase, 'Active');
  assert.strictEqual(context.publicationClassification, 'public');

  // Assert generated details
  assert.ok(context.traceabilityMetadata.signature);
  assert.ok(context.creationTimestamp);

  // Assert deterministic signature generation
  const context2 = AssessmentContextBuilder.build(request, result);
  assert.strictEqual(context.traceabilityMetadata.signature, context2.traceabilityMetadata.signature);
});

test('WP-004: Optional Provider Preference Handling', () => {
  const { request, result } = createMockInputs({
    request: { providerPreference: undefined },
    result: { providerPreference: undefined }
  });
  const context = AssessmentContextBuilder.build(request, result);
  assert.strictEqual(context.providerPreference, undefined);
});

test('WP-004: Correlation Failures Verification', () => {
  // Scenario A: Missing Request
  assert.throws(() => {
    AssessmentContextBuilder.build(null as any, createMockInputs().result);
  }, MissingInputException);

  // Scenario B: Mismatched assessmentId
  assert.throws(() => {
    const { request, result } = createMockInputs({
      result: { assessmentId: 'different-uuid-v4' }
    });
    AssessmentContextBuilder.build(request, result);
  }, InputCorrelationMismatch);

  // Scenario C: Mismatched project
  assert.throws(() => {
    const { request, result } = createMockInputs({
      result: { project: 'DifferentProjectName' }
    });
    AssessmentContextBuilder.build(request, result);
  }, InputCorrelationMismatch);

  // Scenario D: Mismatched target path
  assert.throws(() => {
    const { request, result } = createMockInputs({
      result: { target: 'docs/different_file.md' }
    });
    AssessmentContextBuilder.build(request, result);
  }, InputCorrelationMismatch);

  // Scenario E: Mismatched timestamp
  assert.throws(() => {
    const { request, result } = createMockInputs({
      result: { timestamp: '2026-07-16T12:00:00Z' }
    });
    AssessmentContextBuilder.build(request, result);
  }, InputCorrelationMismatch);

  // Scenario F: Mismatched providerPreference
  assert.throws(() => {
    const { request, result } = createMockInputs({
      result: { providerPreference: 'gemini' }
    });
    AssessmentContextBuilder.build(request, result);
  }, InputCorrelationMismatch);
});

test('WP-004: Lifecycle Resolution & Precedence Rules', () => {
  // Git branch mapping tests
  const testBranches: Array<[string, 'Design' | 'Active' | 'Review' | 'Release']> = [
    ['main', 'Release'],
    ['master', 'Release'],
    ['release/v2.0', 'Release'],
    ['feature/new-feature', 'Active'],
    ['hotfix/security-patch', 'Active'],
    ['review/design-review', 'Review'],
    ['arbitrary-branch', 'Active']
  ];

  for (const [branch, expectedPhase] of testBranches) {
    const { request, result } = createMockInputs({
      result: {
        repositoryDetails: {
          remoteUri: 'https://github.com/org/repo.git',
          branch,
          commitHash: '217a565816900cadac8f46effc8cd4a5638d971c',
          status: 'clean'
        }
      }
    });
    const context = AssessmentContextBuilder.build(request, result);
    assert.strictEqual(context.lifecyclePhase, expectedPhase);
  }

  // Config metadata override tests (Metadata has precedence)
  const { request, result } = createMockInputs({
    result: {
      repositoryDetails: {
        remoteUri: 'https://github.com/org/repo.git',
        branch: 'feature/new-feature', // normally 'Active'
        commitHash: '217a565816900cadac8f46effc8cd4a5638d971c',
        status: 'clean'
      },
      rawConfig: {
        project: 'AEOcortex',
        lifecycle: 'Design' // config override
      }
    }
  });
  const context = AssessmentContextBuilder.build(request, result);
  assert.strictEqual(context.lifecyclePhase, 'Design');
});

test('WP-004: Classification Normalization & Validation', () => {
  // Normalization checks
  const { request, result } = createMockInputs({
    result: { declaredClassification: ' Restricted  ' }
  });
  const context = AssessmentContextBuilder.build(request, result);
  assert.strictEqual(context.publicationClassification, 'restricted');

  // Rejection checks
  assert.throws(() => {
    const { request: r, result: res } = createMockInputs({
      result: { declaredClassification: 'confidential' } // invalid classification
    });
    AssessmentContextBuilder.build(r, res);
  }, InvalidClassificationException);
});

test('WP-004: Context Integrity Signature', () => {
  const { request, result } = createMockInputs();
  const context1 = AssessmentContextBuilder.build(request, result);

  // Assert signature is stable for identical inputs
  const context2 = AssessmentContextBuilder.build(request, result);
  assert.strictEqual(context1.traceabilityMetadata.signature, context2.traceabilityMetadata.signature);

  // Assert signature changes when project metadata changes
  const { request: r, result: res } = createMockInputs({
    request: { project: 'AEOcortex-Modified' },
    result: {
      project: 'AEOcortex-Modified',
      projectIdentity: { name: 'AEOcortex-Modified', id: 'aeocortex-id' }
    }
  });
  const context3 = AssessmentContextBuilder.build(r, res);
  assert.notStrictEqual(context1.traceabilityMetadata.signature, context3.traceabilityMetadata.signature);
});

test('WP-004: Deep Immutability Enforcement', () => {
  const { request, result } = createMockInputs();
  const context = AssessmentContextBuilder.build(request, result);

  // Assert top-level mutation fails
  assert.throws(() => {
    (context as any).project = 'NewProjectName';
  }, TypeError);

  // Assert nested property mutation fails
  assert.throws(() => {
    (context as any).projectIdentity.name = 'NewIdentityName';
  }, TypeError);

  // Assert repository details mutation fails
  assert.throws(() => {
    (context as any).repositoryDetails.status = 'dirty';
  }, TypeError);

  // Assert source mutations do not affect the built context
  const reqSource = { ...request };
  const resSource = { ...result };
  const contextSource = AssessmentContextBuilder.build(reqSource, resSource);

  reqSource.project = 'MutatedName';
  assert.strictEqual(contextSource.project, 'AEOcortex'); // remains isolated
});

test('WP-004: Scope Protection - Exclusions Verification', () => {
  const { request, result } = createMockInputs();
  const context = AssessmentContextBuilder.build(request, result);

  // Ensure reviewMode is absent
  assert.strictEqual((context as any).reviewMode, undefined);

  // Ensure transformationMode is absent
  assert.strictEqual((context as any).transformationMode, undefined);

  // Ensure no event bus or executor hooks are present
  assert.strictEqual((context as any).eventBus, undefined);
  assert.strictEqual((context as any).execute, undefined);
});
