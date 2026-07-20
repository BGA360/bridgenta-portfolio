/**
 * @file normalizer.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept Request & Response Normalizers
 */

import { AIRequest, AIResponse, Timestamp, RequestId } from '../domain/types.js';
import { RequestValidationError, ResponseNormalizationError } from '../errors/provider.errors.js';

export class RequestNormalizer {
  public static normalize(request: Partial<AIRequest>): AIRequest {
    if (!request.provider_type) {
      throw new RequestValidationError('Missing required provider_type.');
    }
    if (!request.capability) {
      throw new RequestValidationError('Missing required capability.');
    }
    if (!request.prompt || typeof request.prompt.user_input !== 'string') {
      throw new RequestValidationError('Prompt must contain valid user_input string.');
    }

    return {
      request_id: request.request_id || RequestId.create(`req-${Date.now()}`),
      provider_type: request.provider_type,
      capability: request.capability,
      prompt: {
        system_instruction: request.prompt.system_instruction,
        user_input: request.prompt.user_input,
        context: request.prompt.context ? [...request.prompt.context] : undefined,
        attachments: request.prompt.attachments ? [...request.prompt.attachments] : undefined,
        generation_options: request.prompt.generation_options ? { ...request.prompt.generation_options } : undefined,
        metadata: request.prompt.metadata,
      },
      created_at: request.created_at || Timestamp.create(),
    };
  }
}

export class ResponseNormalizer {
  public static validate(response: AIResponse): boolean {
    if (!response.response_id || !response.request_id || !response.provider_type) {
      throw new ResponseNormalizationError('AIResponse missing fundamental identifiers.');
    }
    if (!response.completion || typeof response.completion.content !== 'string') {
      throw new ResponseNormalizationError('AIResponse completion missing valid content.');
    }
    return true;
  }
}
