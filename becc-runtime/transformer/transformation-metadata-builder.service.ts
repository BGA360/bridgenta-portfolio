import { createHash } from 'node:crypto';
import { ITransformationMetadataBuilder } from './types.js';
import { TransformationMetadata } from '../shared/types.js';

export class TransformationMetadataBuilderService implements ITransformationMetadataBuilder {
  public build(
    promptText: string,
    modelId: string,
    durationMs: number,
    ruleIds: readonly string[]
  ): TransformationMetadata {
    const promptHash = createHash('sha256')
      .update(promptText || '')
      .digest('hex');

    const metadata: TransformationMetadata = {
      promptHash,
      modelId,
      durationMs,
      ruleHits: Object.freeze([...ruleIds])
    };

    return Object.freeze(metadata);
  }
}
