export interface RuntimeConfig {
  readonly sessionID: string;
  readonly env: 'production' | 'development' | 'test';
  readonly timeout: number;
  readonly logLevel: 'info' | 'warn' | 'error';
}

export interface LogEvent {
  readonly timestamp: string;
  readonly level: 'info' | 'warn' | 'error';
  readonly session_id: string;
  readonly module: 'bin';
  readonly event: string;
  readonly payload: Record<string, unknown>;
}

export interface HealthReport {
  readonly status: 'ready' | 'failed';
  readonly session_id: string;
  readonly node_version: string;
  readonly memory_usage: {
    readonly rss: number;
    readonly heapTotal: number;
    readonly heapUsed: number;
    readonly external: number;
  };
  readonly config: {
    readonly env: 'production' | 'development' | 'test';
    readonly timeout: number;
    readonly logLevel: 'info' | 'warn' | 'error';
  };
}

export interface AssessmentRequest {
  readonly assessmentId: string;
  readonly project: string;
  readonly target: string;
  readonly timestamp: string;
  readonly providerPreference?: string;
}

export interface ValidationErrorDetails {
  [field: string]: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationErrorDetails };

export interface AssessmentContext {
  readonly assessmentId: string;
  readonly project: string;
  readonly target: string;
  readonly projectIdentity: {
    readonly name: string;
    readonly id: string;
  };
  readonly repositoryDetails: {
    readonly remoteUri: string;
    readonly branch: string;
    readonly commitHash: string;
    readonly status: 'clean' | 'dirty';
  };
  readonly targetDocument: {
    readonly path: string;
    readonly hash: string;
  };
  readonly projectType: string;
  readonly lifecyclePhase: 'Design' | 'Active' | 'Review' | 'Release';
  readonly publicationClassification: string;
  readonly providerPreference?: string;
  readonly runtimeMetadata: {
    readonly env: 'production' | 'development' | 'test';
    readonly os: string;
    readonly timestamp: string;
    readonly processId: number;
  };
  readonly traceabilityMetadata: {
    readonly signature: string;
  };
  readonly creationTimestamp: string;
}export interface ProviderExecutionEnvelope {
  readonly sessionId: string;
  readonly promptText: string;
  readonly systemInstructions?: string;
  readonly bundleHash: string;
  readonly policy: {
    readonly temperature: number;
    readonly maxTokens: number;
  };
}

export interface IProviderResponse {
  readonly text: string;
  readonly stopReason: 'stop' | 'length' | 'content_filter' | 'other';
  readonly tokenUsage: {
    readonly inputTokens: number;
    readonly outputTokens: number;
  };
  readonly providerId: string;
  readonly metadata: {
    readonly requestId: string;
    readonly timestamp: string;
  };
}
