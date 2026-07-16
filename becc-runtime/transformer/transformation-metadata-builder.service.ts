import { createHash } from 'node:crypto';
import { ITransformationMetadataBuilder } from './types.js';
import { TransformationMetadata } from '../shared/types.js';

export class TransformationMetadataBuilderService implements ITransformationMetadataBuilder {
  public build(
    promptText: string,
    modelId: string,
    durationMs: number,
    includedRuleIds: readonly string[],
    providerReferencedRuleIds: readonly string[]
  ): TransformationMetadata {
    const promptHash = createHash('sha256')
      .update(promptText || '')
      .digest('hex');

    const metadata: TransformationMetadata = {
      promptHash,
      modelId,
      durationMs,
      includedRuleIds: Object.freeze([...includedRuleIds]),
      providerReferencedRuleIds: Object.freeze([...providerReferencedRuleIds])
    };

    return Object.freeze(metadata);
  }
}
