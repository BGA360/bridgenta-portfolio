import test from 'node:test';
import assert from 'node:assert';
import { RuntimeStateMachine } from '../orchestrator/state-machine.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { RuntimeOrchestrator } from '../orchestrator/orchestrator.service.js';
import { RuntimeEventType, IOrchestratorEvent, OrchestratorState } from '../orchestrator/types.js';
import {
  InvalidStateTransitionException,
  DomainTimeoutException,
  SessionNotFoundException
} from '../orchestrator/exceptions.js';
import { AssessmentRequest } from '../shared/types.js';

// --- Mocks Definitions ---

class MockProjectConnector {
  public connectCalls = 0;
  public purgeCalls = 0;
  public resetCalls = 0;

  async connect(request: AssessmentRequest) {
    this.connectCalls++;
    return {
      assessmentId: request.assessmentId,
      timestamp: request.timestamp,
      project: request.project,
      target: request.target,
      providerPreference: request.providerPreference,
      repositoryRoot: '/mock/root',
      projectIdentity: { name: request.project, id: 'proj-123' },
      repositoryDetails: {
        remoteUri: 'https://github.com/org/repo',
        branch: 'main',
        commitHash: 'abcdef123456',
        status: 'clean' as const
      },
      targetDocument: { path: request.target, hash: 'hash123' },
      projectType: 'specs',
      declaredClassification: 'public',
      rawConfig: {},
      runtimeMetadata: {
        env: 'test' as const,
        os: 'windows',
        timestamp: new Date().toISOString(),
        processId: 123
      },
      status: 'success' as const
    };
  }

  async resetToCommit(sessionId: string, baselineSHA: string) {
    this.resetCalls++;
  }

  async purgeDraftFiles(sessionId: string) {
    this.purgeCalls++;
  }
}

class MockResolver {
  public resolveDelay = 0;
  async resolve(context: any) {
    if (this.resolveDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.resolveDelay));
    }
    return { rules: ['rule1', 'rule2'] };
  }
}

class MockBundleBuilder {
  async build(resolvedKnowledge: any) {
    return { compiledRules: resolvedKnowledge.rules };
  }
}

class MockBroker {
  async selectProvider(preference?: string) {
    return 'mock-provider';
  }
  async invokeAdapter(provider: any, context: any, bundle: any) {
    return 'mock-response';
  }
}

class MockTransformer {
  async transform(context: any, response: any) {
    return 'mock-diff';
  }
}

class MockValidator {
  async validate(context: any, diff: any, bundle: any) {
    return { success: true, errors: {} };
  }
}

class MockReviewEngine {
  public stagedCount = 0;
  async stageReview(context: any, report: any) {
    this.stagedCount++;
  }
}

// Helper to create a standard request
function createMockRequest(assessmentId: string): AssessmentRequest {
  return {
    assessmentId,
    project: 'AEOcortex',
    target: 'docs/assessment.md',
    timestamp: '2026-07-15T12:00:00Z',
    providerPreference: 'antigravity'
  };
}

// --- FSM Tests ---

test('WP-005: State Machine - Valid transitions', () => {
  const fsm = new RuntimeStateMachine();
  assert.strictEqual(fsm.getState(), 'Pending');

  fsm.transitionTo('Initializing');
  assert.strictEqual(fsm.getState(), 'Initializing');

  fsm.transitionTo('Running');
  assert.strictEqual(fsm.getState(), 'Running');

  fsm.transitionTo('Waiting');
  assert.strictEqual(fsm.getState(), 'Waiting');

  fsm.transitionTo('Completed');
  assert.strictEqual(fsm.getState(), 'Completed');
});

test('WP-005: State Machine - Invalid transitions', () => {
  const fsm = new RuntimeStateMachine();
  assert.throws(() => {
    fsm.transitionTo('Running'); // Skip Initializing
  }, InvalidStateTransitionException);
});

// --- Event Bus Tests ---

test('WP-005: Event Bus - Pub/Sub flow', async () => {
  const bus = new EventBus();
  let fired = false;
  let receivedSessionId = '';

  bus.subscribe(RuntimeEventType.RuntimeStarted, (event) => {
    fired = true;
    receivedSessionId = event.header.sessionId;
  });

  const event: IOrchestratorEvent<null> = {
    header: {
      sessionId: 'sess-123',
      timestamp: new Date().toISOString(),
      correlationId: 'sess-123'
    },
    type: RuntimeEventType.RuntimeStarted,
    payload: null
  };

  await bus.publish(event);
  assert.strictEqual(fired, true);
  assert.strictEqual(receivedSessionId, 'sess-123');
});

// --- Orchestrator Pipeline Tests ---

test('WP-005: Pipeline Integration - Happy Path to Waiting state', async () => {
  const bus = new EventBus();
  const connector = new MockProjectConnector();
  const resolver = new MockResolver();
  const builder = new MockBundleBuilder();
  const broker = new MockBroker();
  const transformer = new MockTransformer();
  const validator = new MockValidator();
  const reviewEngine = new MockReviewEngine();

  const orchestrator = new RuntimeOrchestrator(
    bus,
    connector,
    resolver,
    builder,
    broker,
    transformer,
    validator,
    reviewEngine
  );

  const request = createMockRequest('sess-integration-1');
  const events: RuntimeEventType[] = [];

  // Track event sequence
  for (const type of Object.values(RuntimeEventType)) {
    bus.subscribe(type, (e) => {
      events.push(e.type);
    });
  }

  await orchestrator.orchestrate(request);

  // Assert pipeline state reached Waiting
  assert.strictEqual(orchestrator.getSessionState('sess-integration-1'), 'Waiting');
  assert.strictEqual(reviewEngine.stagedCount, 1);
  assert.strictEqual(connector.connectCalls, 1);

  // Assert expected events resolved sequentially
  assert.ok(events.includes(RuntimeEventType.RuntimeStarted));
  assert.ok(events.includes(RuntimeEventType.ContextResolved));
  assert.ok(events.includes(RuntimeEventType.KnowledgeResolved));
  assert.ok(events.includes(RuntimeEventType.BundleCompiled));
  assert.ok(events.includes(RuntimeEventType.ProviderSelected));
  assert.ok(events.includes(RuntimeEventType.ProviderCompleted));
  assert.ok(events.includes(RuntimeEventType.TransformationCompleted));
  assert.ok(events.includes(RuntimeEventType.ValidationCompleted));
  assert.ok(events.includes(RuntimeEventType.HumanReviewRequested));

  // Process human review approval
  await orchestrator.handleReviewDecision('sess-integration-1', true, { success: true });
  assert.strictEqual(orchestrator.getSessionState('sess-integration-1'), 'Completed');
  assert.ok(events.includes(RuntimeEventType.HumanApproved));
  assert.ok(events.includes(RuntimeEventType.RuntimeCompleted));
});

test('WP-005: Pipeline Integration - Human Review Rejection and Cleanup', async () => {
  const bus = new EventBus();
  const connector = new MockProjectConnector();
  const resolver = new MockResolver();
  const builder = new MockBundleBuilder();
  const broker = new MockBroker();
  const transformer = new MockTransformer();
  const validator = new MockValidator();
  const reviewEngine = new MockReviewEngine();

  const orchestrator = new RuntimeOrchestrator(
    bus,
    connector,
    resolver,
    builder,
    broker,
    transformer,
    validator,
    reviewEngine
  );

  const request = createMockRequest('sess-integration-2');
  await orchestrator.orchestrate(request);

  // Process human review rejection
  await orchestrator.handleReviewDecision('sess-integration-2', false, { success: true });
  assert.strictEqual(orchestrator.getSessionState('sess-integration-2'), 'Completed');
  assert.strictEqual(connector.purgeCalls, 1); // purgeDraftFiles called
});

test('WP-005: Timeout Enforcement - Domain execution timeout', async () => {
  const bus = new EventBus();
  const connector = new MockProjectConnector();
  const resolver = new MockResolver();
  const builder = new MockBundleBuilder();
  const broker = new MockBroker();
  const transformer = new MockTransformer();
  const validator = new MockValidator();
  const reviewEngine = new MockReviewEngine();

  // Inject timeout latency of 40ms in the resolver
  resolver.resolveDelay = 40;
  // Override configuration limit for resolver to 10ms
  process.env.TIMEOUT_RESOLVER = '10';

  const orchestrator = new RuntimeOrchestrator(
    bus,
    connector,
    resolver,
    builder,
    broker,
    transformer,
    validator,
    reviewEngine
  );

  const request = createMockRequest('sess-timeout-1');

  await assert.rejects(async () => {
    await orchestrator.orchestrate(request);
  }, DomainTimeoutException);

  assert.strictEqual(orchestrator.getSessionState('sess-timeout-1'), 'Failed');
  assert.strictEqual(connector.purgeCalls, 1); // workspace cleaned up on fail

  // Clean env variable
  delete process.env.TIMEOUT_RESOLVER;
});

test('WP-005: Cancellation - Terminate active session', async () => {
  const bus = new EventBus();
  const connector = new MockProjectConnector();
  const resolver = new MockResolver();
  const builder = new MockBundleBuilder();
  const broker = new MockBroker();
  const transformer = new MockTransformer();
  const validator = new MockValidator();
  const reviewEngine = new MockReviewEngine();

  const orchestrator = new RuntimeOrchestrator(
    bus,
    connector,
    resolver,
    builder,
    broker,
    transformer,
    validator,
    reviewEngine
  );

  const request = createMockRequest('sess-cancel-1');

  // Trigger cancel before orchestrate is called
  orchestrator.cancel('sess-cancel-1', 'SIGINT');

  assert.throws(() => {
    orchestrator.getSessionState('sess-cancel-1');
  }, SessionNotFoundException);
});
