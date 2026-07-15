import { AssessmentRequest, AssessmentContext } from '../shared/types.js';
import { ProjectConnectorResult } from '../connector/types.js';

export type OrchestratorState =
  | 'Pending'
  | 'Initializing'
  | 'Running'
  | 'Waiting'
  | 'Completed'
  | 'Cancelled'
  | 'Failed';

export enum RuntimeEventType {
  RuntimeStarted = 'RuntimeStarted',
  ContextResolved = 'ContextResolved',
  KnowledgeResolved = 'KnowledgeResolved',
  BundleCompiled = 'BundleCompiled',
  ProviderSelected = 'ProviderSelected',
  ProviderCompleted = 'ProviderCompleted',
  TransformationCompleted = 'TransformationCompleted',
  ValidationCompleted = 'ValidationCompleted',
  HumanReviewRequested = 'HumanReviewRequested',
  HumanApproved = 'HumanApproved',
  HumanRejected = 'HumanRejected',
  RuntimeCancelled = 'RuntimeCancelled',
  RuntimeFailed = 'RuntimeFailed',
  RuntimeCompleted = 'RuntimeCompleted'
}

export interface IEventHeader {
  readonly sessionId: string;
  readonly timestamp: string;
  readonly correlationId: string;
}

export interface IOrchestratorEvent<T = unknown> {
  readonly header: IEventHeader;
  readonly type: RuntimeEventType;
  readonly payload: T;
}

export type EventHandler<T> = (event: IOrchestratorEvent<T>) => Promise<void> | void;

export interface IEventBus {
  publish<T>(event: IOrchestratorEvent<T>): Promise<void>;
  subscribe<T>(type: RuntimeEventType, handler: EventHandler<T>): void;
}

// Injected Bounded Context Domain Interfaces (WP-003 - WP-012)
export interface IProjectConnector {
  connect(request: AssessmentRequest): Promise<ProjectConnectorResult>;
  resetToCommit(sessionId: string, baselineSHA: string): Promise<void>;
  purgeDraftFiles(sessionId: string): Promise<void>;
}

export interface IKnowledgeResolver {
  resolve(context: AssessmentContext): Promise<any>;
}

export interface IKnowledgeBundleBuilder {
  build(resolvedKnowledge: any): Promise<any>;
}

export interface IProviderBroker {
  selectProvider(preference?: string): Promise<any>;
  invokeAdapter(provider: any, context: AssessmentContext, bundle: any): Promise<any>;
}

export interface ITransformationEngine {
  transform(context: AssessmentContext, providerResponse: any): Promise<any>;
}

export interface IValidationEngine {
  validate(context: AssessmentContext, diff: any, bundle: any): Promise<any>;
}

export interface IHumanReviewEngine {
  stageReview(context: AssessmentContext, validationReport: any): Promise<any>;
}
