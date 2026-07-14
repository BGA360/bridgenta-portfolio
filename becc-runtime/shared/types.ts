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
