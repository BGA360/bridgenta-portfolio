import { AssessmentRequest, AssessmentContext } from '../shared/types.js';
import { ProjectConnectorResult } from '../connector/types.js';
import { AssessmentContextBuilder } from '../context/assessment-context.builder.js';
import {
  OrchestratorState,
  RuntimeEventType,
  IEventHeader,
  IOrchestratorEvent,
  IEventBus,
  IProjectConnector,
  IKnowledgeResolver,
  IKnowledgeBundleBuilder,
  IProviderBroker,
  ITransformationEngine,
  IValidationEngine,
  IHumanReviewEngine
} from './types.js';
import { RuntimeStateMachine } from './state-machine.js';
import {
  DomainTimeoutException,
  OrchestratorAbortedException,
  SessionNotFoundException
} from './exceptions.js';

export class RuntimeOrchestrator {
  private readonly sessions = new Map<string, RuntimeStateMachine>();
  private readonly globalTimers = new Map<string, NodeJS.Timeout>();
  private readonly activeContexts = new Map<string, AssessmentContext>();

  constructor(
    private readonly eventBus: IEventBus,
    private readonly connector: IProjectConnector,
    private readonly resolver: IKnowledgeResolver,
    private readonly builder: IKnowledgeBundleBuilder,
    private readonly broker: IProviderBroker,
    private readonly transformer: ITransformationEngine,
    private readonly validator: IValidationEngine,
    private readonly reviewEngine: IHumanReviewEngine
  ) {}

  /**
   * Orchestrates the BECC pipeline execution from ingest to automated validation completed.
   */
  public async orchestrate(request: AssessmentRequest): Promise<void> {
    const sessionId = request.assessmentId;
    const stateMachine = new RuntimeStateMachine();
    this.sessions.set(sessionId, stateMachine);

    // Set global execution timeout (Default: 30s)
    const globalTimeoutEnv = process.env.BECC_TIMEOUT ? parseInt(process.env.BECC_TIMEOUT, 10) : undefined;
    const globalLimitMs = globalTimeoutEnv || 30000;

    const globalTimer = setTimeout(() => {
      this.handleGlobalTimeout(sessionId, globalLimitMs);
    }, globalLimitMs);
    this.globalTimers.set(sessionId, globalTimer);

    let connectorResult: ProjectConnectorResult | undefined;

    try {
      // 1. Initializing
      stateMachine.transitionTo('Initializing');
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.RuntimeStarted, null));

      // 2. Project Connector Discovery (Timeout: 2s)
      connectorResult = await this.runWithTimeout(sessionId, 'connector', 2000, () =>
        this.connector.connect(request)
      );

      // Transition to Running
      stateMachine.transitionTo('Running');
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.ContextResolved, null));

      // Build context
      const context = AssessmentContextBuilder.build(request, connectorResult);
      this.activeContexts.set(sessionId, context);

      // 3. Knowledge Resolver (Timeout: 3s)
      const resolvedKnowledge = await this.runWithTimeout(sessionId, 'resolver', 3000, () =>
        this.resolver.resolve(context)
      );
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.KnowledgeResolved, null));

      // 4. Bundle Builder (Timeout: 2s)
      const bundle = await this.runWithTimeout(sessionId, 'builder', 2000, () =>
        this.builder.build(resolvedKnowledge)
      );
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.BundleCompiled, null));

      // 5. Provider Broker Route (Timeout: 5s)
      const provider = await this.runWithTimeout(sessionId, 'broker', 5000, () =>
        this.broker.selectProvider(request.providerPreference)
      );
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.ProviderSelected, null));

      // 6. Provider Adapter API Invocation (Timeout: 10s)
      const providerResponse = await this.runWithTimeout(sessionId, 'adapter', 10000, () =>
        this.broker.invokeAdapter(provider, context, bundle)
      );
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.ProviderCompleted, null));

      // 7. Transformation Engine Diff (Timeout: 10s)
      const diff = await this.runWithTimeout(sessionId, 'transform', 10000, () =>
        this.transformer.transform(context, providerResponse)
      );
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.TransformationCompleted, null));

      // 8. Validation Engine (Timeout: 5s)
      const validationReport = await this.runWithTimeout(sessionId, 'validator', 5000, () =>
        this.validator.validate(context, diff, bundle)
      );
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.ValidationCompleted, null));

      // 9. Transition to Waiting for Human Review
      stateMachine.transitionTo('Waiting');
      await this.eventBus.publish(
        this.createEvent(sessionId, RuntimeEventType.HumanReviewRequested, validationReport)
      );

      // Stage the review page draft
      await this.reviewEngine.stageReview(context, validationReport);

    } catch (err) {
      await this.handleFailure(sessionId, err, connectorResult?.repositoryDetails?.commitHash);
      throw err;
    }
  }

  /**
   * Processes the Human Review decision outcome.
   */
  public async handleReviewDecision(sessionId: string, approved: boolean, validationReport: any): Promise<void> {
    const stateMachine = this.sessions.get(sessionId);
    if (!stateMachine) {
      throw new SessionNotFoundException(sessionId);
    }

    // Clear global timer since execution reached terminal phase
    const globalTimer = this.globalTimers.get(sessionId);
    if (globalTimer) {
      clearTimeout(globalTimer);
      this.globalTimers.delete(sessionId);
    }

    if (approved) {
      stateMachine.transitionTo('Completed');
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.HumanApproved, null));
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.RuntimeCompleted, { outcome: 'Approved' }));
    } else {
      stateMachine.transitionTo('Completed');
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.HumanRejected, null));
      await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.RuntimeCompleted, { outcome: 'Rejected' }));
      console.warn(`[Orchestrator] Session ${sessionId} rejected. External remediation is required.`);
    }

    this.cleanupSession(sessionId);
  }

  /**
   * Aborts an active execution session due to signal or abort command.
   */
  public async cancel(sessionId: string, reason: string): Promise<void> {
    const stateMachine = this.sessions.get(sessionId);
    if (!stateMachine) return;

    const currentState = stateMachine.getState();
    if (currentState === 'Completed' || currentState === 'Failed' || currentState === 'Cancelled') {
      return;
    }

    // Clear global timer
    const globalTimer = this.globalTimers.get(sessionId);
    if (globalTimer) {
      clearTimeout(globalTimer);
      this.globalTimers.delete(sessionId);
    }

    stateMachine.transitionTo('Cancelled');
    await this.eventBus.publish(this.createEvent(sessionId, RuntimeEventType.RuntimeCancelled, { reason }));

    // Coordinate rollback
    await this.rollbackWorkspace(sessionId);
    this.cleanupSession(sessionId);
  }

  public getSessionState(sessionId: string): OrchestratorState {
    const stateMachine = this.sessions.get(sessionId);
    if (!stateMachine) {
      throw new SessionNotFoundException(sessionId);
    }
    return stateMachine.getState();
  }

  private async runWithTimeout<T>(
    sessionId: string,
    domain: string,
    defaultLimitMs: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const state = this.getSessionState(sessionId);
    if (state === 'Failed' || state === 'Cancelled') {
      throw new OrchestratorAbortedException(`Session ${sessionId} is terminated.`);
    }

    const envKey = `TIMEOUT_${domain.toUpperCase()}`;
    const envVal = process.env[envKey];
    const limitMs = envVal ? parseInt(envVal, 10) : defaultLimitMs;

    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new DomainTimeoutException(domain, limitMs));
      }, limitMs);
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      if (timer) clearTimeout(timer);
      return result;
    } catch (err) {
      if (timer) clearTimeout(timer);
      throw err;
    }
  }

  private async handleFailure(sessionId: string, err: any, baselineCommit?: string): Promise<void> {
    const stateMachine = this.sessions.get(sessionId);
    if (!stateMachine) return;

    const currentState = stateMachine.getState();
    if (currentState === 'Completed' || currentState === 'Failed' || currentState === 'Cancelled') {
      return;
    }

    // Clear global timer
    const globalTimer = this.globalTimers.get(sessionId);
    if (globalTimer) {
      clearTimeout(globalTimer);
      this.globalTimers.delete(sessionId);
    }

    stateMachine.transitionTo('Failed');
    await this.eventBus.publish(
      this.createEvent(sessionId, RuntimeEventType.RuntimeFailed, {
        message: err instanceof Error ? err.message : String(err)
      })
    );

    await this.rollbackWorkspace(sessionId, baselineCommit);
    this.cleanupSession(sessionId);
  }

  private async handleGlobalTimeout(sessionId: string, limitMs: number): Promise<void> {
    const err = new Error(`Global timeout limit of ${limitMs}ms exceeded.`);
    console.error(`[Orchestrator] Global timeout triggered for session ${sessionId}`);
    await this.handleFailure(sessionId, err);
  }

  private async rollbackWorkspace(sessionId: string, baselineCommit?: string): Promise<void> {
    console.warn(`[Orchestrator] Rollback requested for session ${sessionId} (baseline: ${baselineCommit || 'unknown'}). External remediation is required.`);
  }

  private cleanupSession(sessionId: string): void {
    this.activeContexts.delete(sessionId);
  }

  private createEvent<T>(sessionId: string, type: RuntimeEventType, payload: T): IOrchestratorEvent<T> {
    const header: IEventHeader = {
      sessionId,
      timestamp: new Date().toISOString(),
      correlationId: sessionId
    };
    return { header, type, payload };
  }
}
