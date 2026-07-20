/**
 * @file validator.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept Request & Response Integrity Validator
 */

import { AIRequest, AIResponse } from '../domain/types.js';
import { RequestValidationError, ResponseNormalizationError } from '../errors/provider.errors.js';

export class RequestValidator {
  public static validate(request: AIRequest): boolean {
    if (!request.request_id || request.request_id.trim() === '') {
      throw new RequestValidationError('request_id cannot be empty.');
    }
    if (!request.prompt || typeof request.prompt.user_input !== 'string' || request.prompt.user_input.trim() === '') {
      throw new RequestValidationError('prompt.user_input cannot be empty.');
    }
    return true;
  }
}

export class ResponseValidator {
  public static validate(response: AIResponse): boolean {
    if (!response.response_id || response.response_id.trim() === '') {
      throw new ResponseNormalizationError('response_id cannot be empty.');
    }
    if (!response.usage || typeof response.usage.total_tokens !== 'number') {
      throw new ResponseNormalizationError('usage.total_tokens must be a valid number.');
    }
    return true;
  }
}
