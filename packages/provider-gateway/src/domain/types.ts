/**
 * @file types.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept Canonical AI Provider Model
 */

// Branded Value Objects
export type ProviderId = string & { readonly __brand: unique symbol };
export type RequestId = string & { readonly __brand: unique symbol };
export type ResponseId = string & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

export const ProviderId = {
  create: (id: string): ProviderId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ProviderId must be a non-empty string.');
    }
    return id.trim() as ProviderId;
  },
};

export const RequestId = {
  create: (id: string): RequestId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('RequestId must be a non-empty string.');
    }
    return id.trim() as RequestId;
  },
};

export const ResponseId = {
  create: (id: string): ResponseId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ResponseId must be a non-empty string.');
    }
    return id.trim() as ResponseId;
  },
};

export const Timestamp = {
  create: (isoString?: string): Timestamp => {
    const str = isoString || new Date().toISOString();
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error('Timestamp must be a valid ISO 8601 date string.');
    }
    return date.toISOString() as Timestamp;
  },
};

/**
 * Supported AI Provider Types.
 */
export enum ProviderType {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE_GEMINI = 'GOOGLE_GEMINI',
  XAI = 'XAI',
  OLLAMA = 'OLLAMA',
}

/**
 * AI Provider Capabilities.
 */
export enum ProviderCapability {
  CHAT_COMPLETION = 'CHAT_COMPLETION',
  STRUCTURED_OUTPUT = 'STRUCTURED_OUTPUT',
  STREAMING = 'STREAMING',
  TOOL_CALLING = 'TOOL_CALLING',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  REASONING_SUPPORT = 'REASONING_SUPPORT',
  FUNCTION_CALLING = 'FUNCTION_CALLING',
  EMBEDDINGS = 'EMBEDDINGS',
}

/**
 * Canonical Prompt Payload.
 */
export interface PromptPayload {
  readonly system_instruction?: string;
  readonly user_input: string;
  readonly context?: readonly string[];
  readonly attachments?: readonly { readonly name: string; readonly mime_type: string; readonly content: string }[];
  readonly generation_options?: {
    readonly temperature?: number;
    readonly max_tokens?: number;
    readonly top_p?: number;
    readonly stop_sequences?: readonly string[];
  };
  readonly metadata?: ReadonlyMap<string, unknown>;
}

/**
 * Canonical AI Request Model.
 */
export interface AIRequest {
  readonly request_id: RequestId;
  readonly provider_type: ProviderType;
  readonly capability: ProviderCapability;
  readonly prompt: PromptPayload;
  readonly created_at: Timestamp;
}

/**
 * Canonical Completion Payload.
 */
export interface CompletionPayload {
  readonly content: string;
  readonly finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
  readonly structured_output?: Record<string, unknown>;
}

/**
 * Token Usage Metrics.
 */
export interface TokenUsage {
  readonly prompt_tokens: number;
  readonly completion_tokens: number;
  readonly total_tokens: number;
}

/**
 * Canonical Provider Metadata.
 */
export interface ProviderMetadata {
  readonly name: string;
  readonly version: string;
  readonly model_name: string;
  readonly max_tokens?: number;
}

/**
 * Provider Health Status.
 */
export interface ProviderHealth {
  readonly status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  readonly latency_ms: number;
  readonly last_checked: Timestamp;
}

/**
 * Canonical Provider Reference.
 */
export interface ProviderReference {
  readonly provider_id: ProviderId;
  readonly provider_type: ProviderType;
  readonly model_name: string;
}

/**
 * Traceability Reference model.
 */
export interface TraceabilityReference {
  readonly constitutional_source: string;
  readonly contract_id: string;
  readonly domain_concept: string;
}

/**
 * Canonical AI Response Model.
 */
export interface AIResponse {
  readonly response_id: ResponseId;
  readonly request_id: RequestId;
  readonly provider_type: ProviderType;
  readonly completion: CompletionPayload;
  readonly usage: TokenUsage;
  readonly metadata: ProviderMetadata;
  readonly traceability: TraceabilityReference;
  readonly created_at: Timestamp;
}
