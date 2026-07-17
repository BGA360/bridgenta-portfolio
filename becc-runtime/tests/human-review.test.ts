import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { RuntimeStateMachine } from '../orchestrator/state-machine.js';
import { RuntimeEventType, OrchestratorState } from '../orchestrator/types.js';
import { KnowledgeBundleBuilderService } from '../bundle/knowledge-bundle-builder.service.js';
import { InvalidObligationMetadataException } from '../bundle/exceptions.js';
import { FindingAggregatorService } from '../validator/finding-aggregator.service.js';
import { FileReviewStateAdapter } from '../human-review/adapters/file-review-state.adapter.js';
import { HumanReviewService } from '../human-review/human-review.service.js';
import { VerifiedReviewer, HumanReviewSubmission } from '../human-review/types.js';
import {
  ReviewPackageExpiredError,
  SelfReviewNotPermittedError,
  ReviewerNotAuthorizedError,
  InvalidFindingDispositionError,
  UnresolvedBlockingObligationError,
  CandidateIntegrityMismatchError
} from '../human-review/exceptions.js';

// --- Helper Mocks ---

class MockIdentityPort {
  public async verify(assertion: string, context: any): Promise<VerifiedReviewer> {
    if (assertion === 'invalid') {
      throw new Error('Invalid assertion token');
    }
    const claim = JSON.parse(assertion);
    return {
      reviewerId: claim.reviewerId || 'rev-1',
      role: claim.role || 'Reviewer',
      projectIds: claim.projectIds || ['*'],
      classifications: claim.classifications || ['*']
    };
  }
}

class MockClock {
  public currentTime = '2026-07-17T12:00:00Z';
  public now() {
    return this.currentTime;
  }
}

// --- FSM and Event Bus Tests ---

test('FSM transitions to and from RevisionRequested', () => {
  const fsm = new RuntimeStateMachine();
  assert.strictEqual(fsm.getState(), 'Pending');

  fsm.transitionTo('Initializing');
  fsm.transitionTo('Running');
  fsm.transitionTo('Waiting');
  
  // Transition to RevisionRequested from Waiting
  fsm.transitionTo('RevisionRequested');
  assert.strictEqual(fsm.getState(), 'RevisionRequested');

  // Transition from RevisionRequested back to Pending
  fsm.transitionTo('Pending');
  assert.strictEqual(fsm.getState(), 'Pending');
});

// --- Obligation Compiling Tests ---

test('KnowledgeBundleBuilder extracts obligation metadata', () => {
  const builder = new KnowledgeBundleBuilderService({ maxSizeBytes: 100 * 1024 });

  const resolved: any = {
    sessionId: 'session-123',
    rulePointers: [
      {
        ruleId: 'RULE-TONE',
        filePath: 'mock-file.md',
        heading: 'Rule Tone',
        startLine: 1,
        endLine: 10,
        contentHash: 'hash-tone',
        precedenceOrder: 1,
        precedenceTier: 'Canon',
        authoritySource: 'Test',
        originatingFramework: 'Test',
        versionIdentifier: '1.0'
      }
    ],
    vocabularyList: [],
    resolutionEvidence: [
      {
        ruleId: 'RULE-TONE',
        selectedSourcePath: 'mock-file.md',
        overriddenSourcesPaths: [],
        appliedPrecedenceTier: 'Canon',
        appliedPrecedenceOrder: 1
      }
    ],
    timestamp: new Date().toISOString()
  };

  // Mock assembler returning rule content with HTML comments containing metadata
  (builder as any).assembler = {
    assemble: () => ({
      rules: [
        {
          ruleId: 'RULE-TONE',
          heading: 'Rule Tone',
          content: `This is the tone rule.\n<!-- HUMAN_REVIEW_OBLIGATION\nquestion: Is this tone appropriate?\nresponseType: boolean\nblocking: true\nrationaleRequired: true\nevidenceRequired: false\n-->`,
          precedenceTier: 'Canon',
          precedenceOrder: 1,
          filePath: 'mock-file.md',
          startLine: 1,
          endLine: 10,
          contentHash: 'hash-tone'
        }
      ],
      vocabulary: [],
      evidence: [
        {
          ruleId: 'RULE-TONE',
          selectedSourcePath: 'mock-file.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ]
    })
  };

  const bundle = builder.build(resolved);
  assert.strictEqual(bundle.obligations.length, 1);
  assert.strictEqual(bundle.obligations[0].ruleId, 'RULE-TONE');
  assert.strictEqual(bundle.obligations[0].question, 'Is this tone appropriate?');
  assert.strictEqual(bundle.obligations[0].responseType, 'boolean');
  assert.strictEqual(bundle.obligations[0].blocking, true);
});

test('KnowledgeBundleBuilder throws exception on invalid metadata', () => {
  const builder = new KnowledgeBundleBuilderService({ maxSizeBytes: 100 * 1024 });

  const resolved: any = {
    sessionId: 'session-123',
    rulePointers: [
      {
        ruleId: 'RULE-MALFORMED',
        filePath: 'mock-file.md',
        heading: 'Rule Malformed',
        startLine: 1,
        endLine: 10,
        contentHash: 'hash-malformed',
        precedenceOrder: 1,
        precedenceTier: 'Canon',
        authoritySource: 'Test',
        originatingFramework: 'Test',
        versionIdentifier: '1.0'
      }
    ],
    vocabularyList: [],
    resolutionEvidence: [
      {
        ruleId: 'RULE-MALFORMED',
        selectedSourcePath: 'mock-file.md',
        overriddenSourcesPaths: [],
        appliedPrecedenceTier: 'Canon',
        appliedPrecedenceOrder: 1
      }
    ],
    timestamp: new Date().toISOString()
  };

  // Obligation is missing the required question field
  (builder as any).assembler = {
    assemble: () => ({
      rules: [
        {
          ruleId: 'RULE-MALFORMED',
          heading: 'Rule Malformed',
          content: `This is the malformed rule.\n<!-- HUMAN_REVIEW_OBLIGATION\nresponseType: boolean\nblocking: true\n-->`,
          precedenceTier: 'Canon',
          precedenceOrder: 1,
          filePath: 'mock-file.md',
          startLine: 1,
          endLine: 10,
          contentHash: 'hash-malformed'
        }
      ],
      vocabulary: [],
      evidence: [
        {
          ruleId: 'RULE-MALFORMED',
          selectedSourcePath: 'mock-file.md',
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: 'Canon',
          appliedPrecedenceOrder: 1
        }
      ]
    })
  };

  assert.throws(() => {
    builder.build(resolved);
  }, InvalidObligationMetadataException);
});

// --- Finding Aggregator and Validation Mapping Tests ---

test('FindingAggregator appends applicable obligations to report', () => {
  const aggregator = new FindingAggregatorService();
  const obligations: any[] = [
    {
      obligationId: 'ob-1',
      ruleId: 'RULE-1',
      question: 'Question?',
      responseType: 'boolean',
      blocking: true,
      applicabilityEvidence: []
    }
  ];

  const report = aggregator.aggregate('session-1', [], [], 1, 0, obligations);
  assert.strictEqual(report.applicableObligations.length, 1);
  assert.strictEqual(report.applicableObligations[0].obligationId, 'ob-1');
});

// --- Decision Admissibility and Authority Tests ---

test('Admissibility blocks self-approval based on creator identity', async () => {
  const tempDir = path.join(process.cwd(), `.sessions-test-${randomUUID()}`);
  const repository = new FileReviewStateAdapter(tempDir);
  const identityPort = new MockIdentityPort();
  const clock = new MockClock();
  const reviewService = new HumanReviewService(repository, identityPort, clock);

  const context: any = {
    assessmentId: 'review-123',
    projectName: 'my-project',
    targetDocument: { path: 'file.md' },
    repositoryRoot: tempDir,
    publicationClassification: 'Public',
    authorId: 'author-123', // Author is author-123
    traceabilityMetadata: { commitAuthor: 'author-123' }
  };

  const validationReport: any = {
    sessionId: 'review-123',
    summary: { status: 'passed', errorCount: 0, warningCount: 0, infoCount: 0, evaluatedRuleCount: 1, nonEvaluableRuleCount: 0 },
    findings: [],
    evidence: [],
    applicableObligations: []
  };

  // Stage review package
  await reviewService.stageReview(context, validationReport);

  // Submit approval with same reviewer ID as author (prohibited self-review)
  const submission: HumanReviewSubmission = {
    packageId: 'review-123',
    decision: 'APPROVED',
    reviewerId: 'author-123', // Reviewer matches author
    assertion: JSON.stringify({ reviewerId: 'author-123', role: 'Reviewer', projectIds: ['*'], classifications: ['*'] }),
    dispositions: [],
    obligations: []
  };

  await assert.rejects(async () => {
    await reviewService.submitDecision(submission);
  }, SelfReviewNotPermittedError);

  // Clean up
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('Admissibility blocks approval if classification scope does not match', async () => {
  const tempDir = path.join(process.cwd(), `.sessions-test-${randomUUID()}`);
  const repository = new FileReviewStateAdapter(tempDir);
  const identityPort = new MockIdentityPort();
  const clock = new MockClock();
  const reviewService = new HumanReviewService(repository, identityPort, clock);

  const context: any = {
    assessmentId: 'review-124',
    projectName: 'my-project',
    targetDocument: { path: 'file.md' },
    repositoryRoot: tempDir,
    publicationClassification: 'Secret', // Secret classification
    authorId: 'author-123',
    traceabilityMetadata: { commitAuthor: 'author-123' }
  };

  const validationReport: any = {
    sessionId: 'review-124',
    summary: { status: 'passed', errorCount: 0, warningCount: 0, infoCount: 0, evaluatedRuleCount: 1, nonEvaluableRuleCount: 0 },
    findings: [],
    evidence: [],
    applicableObligations: []
  };

  await reviewService.stageReview(context, validationReport);

  // Reviewer has only 'Public' classification scope
  const submission: HumanReviewSubmission = {
    packageId: 'review-124',
    decision: 'APPROVED',
    reviewerId: 'reviewer-abc',
    assertion: JSON.stringify({ reviewerId: 'reviewer-abc', role: 'Reviewer', projectIds: ['*'], classifications: ['Public'] }),
    dispositions: [],
    obligations: []
  };

  await assert.rejects(async () => {
    await reviewService.submitDecision(submission);
  }, ReviewerNotAuthorizedError);

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('Admissibility blocks approval if errors lack rationales', async () => {
  const tempDir = path.join(process.cwd(), `.sessions-test-${randomUUID()}`);
  const repository = new FileReviewStateAdapter(tempDir);
  const identityPort = new MockIdentityPort();
  const clock = new MockClock();
  const reviewService = new HumanReviewService(repository, identityPort, clock);

  const context: any = {
    assessmentId: 'review-125',
    projectName: 'my-project',
    targetDocument: { path: 'file.md' },
    repositoryRoot: tempDir,
    publicationClassification: 'Public',
    authorId: 'author-123',
    traceabilityMetadata: { commitAuthor: 'author-123' }
  };

  const validationReport: any = {
    sessionId: 'review-125',
    summary: { status: 'failed', errorCount: 1, warningCount: 0, infoCount: 0, evaluatedRuleCount: 1, nonEvaluableRuleCount: 0 },
    findings: [
      { id: 'find-1', category: 'Constitutional', severity: 'error', message: 'Failing finding' }
    ],
    evidence: [],
    applicableObligations: []
  };

  await reviewService.stageReview(context, validationReport);

  // Submit decision with invalid short rationale for error finding
  const submission: HumanReviewSubmission = {
    packageId: 'review-125',
    decision: 'APPROVED',
    reviewerId: 'reviewer-abc',
    assertion: JSON.stringify({ reviewerId: 'reviewer-abc', role: 'Reviewer', projectIds: ['*'], classifications: ['*'] }),
    dispositions: [
      { findingId: 'find-1', code: 'risk_accepted', rationale: 'Short' } // short rationale (< 15 characters)
    ],
    obligations: []
  };

  await assert.rejects(async () => {
    await reviewService.submitDecision(submission);
  }, InvalidFindingDispositionError);

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('Admissibility blocks approval if blocking obligations are unanswered or false', async () => {
  const tempDir = path.join(process.cwd(), `.sessions-test-${randomUUID()}`);
  const repository = new FileReviewStateAdapter(tempDir);
  const identityPort = new MockIdentityPort();
  const clock = new MockClock();
  const reviewService = new HumanReviewService(repository, identityPort, clock);

  const context: any = {
    assessmentId: 'review-126',
    projectName: 'my-project',
    targetDocument: { path: 'file.md' },
    repositoryRoot: tempDir,
    publicationClassification: 'Public',
    authorId: 'author-123',
    traceabilityMetadata: { commitAuthor: 'author-123' }
  };

  const validationReport: any = {
    sessionId: 'review-126',
    summary: { status: 'passed', errorCount: 0, warningCount: 0, infoCount: 0, evaluatedRuleCount: 1, nonEvaluableRuleCount: 0 },
    findings: [],
    evidence: [],
    applicableObligations: [
      { obligationId: 'ob-126', ruleId: 'RULE-1', question: 'Verify?', responseType: 'boolean', blocking: true, applicabilityEvidence: [], rationaleRequired: true, evidenceRequired: false }
    ]
  };

  await reviewService.stageReview(context, validationReport);

  // Obligation response is answered false
  const submission: HumanReviewSubmission = {
    packageId: 'review-126',
    decision: 'APPROVED',
    reviewerId: 'reviewer-abc',
    assertion: JSON.stringify({ reviewerId: 'reviewer-abc', role: 'Reviewer', projectIds: ['*'], classifications: ['*'] }),
    dispositions: [],
    obligations: [
      { obligationId: 'ob-126', response: false, rationale: 'Long enough rationale.' }
    ]
  };

  await assert.rejects(async () => {
    await reviewService.submitDecision(submission);
  }, UnresolvedBlockingObligationError);

  fs.rmSync(tempDir, { recursive: true, force: true });
});
