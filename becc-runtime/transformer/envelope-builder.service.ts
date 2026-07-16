import { IEnvelopeBuilder, IKnowledgeBundle } from './types.js';
import { AssessmentContext, ProviderExecutionEnvelope } from '../shared/types.js';
import { InstructionComposerService } from './instruction-composer.service.js';

export class EnvelopeBuilderService implements IEnvelopeBuilder {
  constructor(private readonly composer = new InstructionComposerService()) {}

  public build(
    context: AssessmentContext,
    bundle: IKnowledgeBundle,
    temperature = 0.1,
    maxTokens = 2048
  ): ProviderExecutionEnvelope {
    // Generate prompt text and instructions from composer
    const systemInstructions = this.composer.composeSystemInstructions(bundle);
    // Note: The caller passes the fileContent through the main facade, which will invoke PromptComposer
    // But for the general build signature we default prompt compilation.
    const promptText = this.composer.composePromptText(context, '');

    const envelope: ProviderExecutionEnvelope = {
      sessionId: context.assessmentId,
      promptText,
      systemInstructions,
      bundleHash: bundle.metadata.bundleHash,
      policy: {
        temperature,
        maxTokens
      }
    };

    return Object.freeze(envelope);
  }

  public buildWithContent(
    context: AssessmentContext,
    bundle: IKnowledgeBundle,
    fileContent: string,
    temperature = 0.1,
    maxTokens = 2048
  ): ProviderExecutionEnvelope {
    const systemInstructions = this.composer.composeSystemInstructions(bundle);
    const promptText = this.composer.composePromptText(context, fileContent);

    const envelope: ProviderExecutionEnvelope = {
      sessionId: context.assessmentId,
      promptText,
      systemInstructions,
      bundleHash: bundle.metadata.bundleHash,
      policy: {
        temperature,
        maxTokens
      }
    };

    return Object.freeze(envelope);
  }
}
