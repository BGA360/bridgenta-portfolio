import { ProviderExecutionEnvelope, IProviderResponse } from '../shared/types.js';

export interface IProviderExecutionResult {
  readonly response: IProviderResponse;
  readonly executionTrace: {
    readonly attemptCount: number;
    readonly totalDurationMs: number;
    readonly isMocked: boolean;
  };
}

export interface ITransportClient {
  post(
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs: number,
    signal?: AbortSignal
  ): Promise<{ status: number; data: any; headers: Record<string, string> }>;
}

export interface ICredentialResolver {
  resolve(providerId: string): string | undefined;
}

export interface IEndpointResolver {
  resolve(providerId: string): string;
}

export interface ITokenizerPort {
  countTokens(text: string): number;
}

export interface IResponseNormalizer {
  normalize(rawResponse: any, providerId: string): IProviderResponse;
}

export interface IProviderAdapter {
  execute(
    envelope: ProviderExecutionEnvelope,
    signal?: AbortSignal
  ): Promise<IProviderExecutionResult>;
}
