/**
 * @file serializer.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Canonical JSON Serializer
 */

import { PipelineResponse } from '../domain/types.js';
import { APIValidationError } from '../errors/api.errors.js';

export class APISerializer {
  public static serializePipelineResponse(response: PipelineResponse): string {
    return JSON.stringify(response, null, 2);
  }

  public static deserializePipelineResponse(jsonString: string): PipelineResponse {
    try {
      const obj = JSON.parse(jsonString);
      if (!obj.execution_id || !obj.pipeline_status) {
        throw new APIValidationError('Deserialized JSON is missing pipeline fields.');
      }
      return obj as PipelineResponse;
    } catch (err) {
      if (err instanceof APIValidationError) throw err;
      throw new APIValidationError(`Failed to deserialize PipelineResponse JSON: ${err}`);
    }
  }
}
