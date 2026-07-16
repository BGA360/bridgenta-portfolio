import { ITransformationEngine, IKnowledgeBundle } from './types.js';
import {
  AssessmentContext,
  ProviderExecutionEnvelope,
  IProviderResponse,
  CandidateCommunication,
  TransformationMetadata
} from '../shared/types.js';
import { EnvelopeBuilderService } from './envelope-builder.service.js';
import { ProviderResponseParserService } from './provider-response-parser.service.js';
import { CandidateCommunicationBuilderService } from './candidate-communication-builder.service.js';
import { TransformationMetadataBuilderService } from './transformation-metadata-builder.service.js';

export class CommunicationTransformationService implements ITransformationEngine {
  private readonly envelopeBuilder = new EnvelopeBuilderService();
  private readonly parser = new ProviderResponseParserService();
  private readonly communicationBuilder = new CandidateCommunicationBuilderService();
  private readonly metadataBuilder = new TransformationMetadataBuilderService();

  public assembleExecutionEnvelope(
    context: AssessmentContext,
    bundle: IKnowledgeBundle,
    fileContent: string
  ): ProviderExecutionEnvelope {
    return this.envelopeBuilder.buildWithContent(context, bundle, fileContent);
  }

  public transformProviderResponse(
    response: IProviderResponse,
    context: AssessmentContext,
    bundle: IKnowledgeBundle,
    durationMs: number
  ): {
    readonly communication: CandidateCommunication;
    readonly metadata: TransformationMetadata;
  } {
    const diffContent = this.parser.parseDiff(response.text);
    const communication = this.communicationBuilder.build(
      context.assessmentId,
      diffContent,
      context.targetDocument.path
    );

    const ruleIds = bundle.rules.map(r => r.id);
    const promptText = `Generate a unified diff for the following target file to make it comply with the rules:
Path: ${context.targetDocument.path}
Session ID: ${context.assessmentId}

Target File Content:
<target_file>
</target_file>`; // Stable representation for trace referencing

    const metadata = this.metadataBuilder.build(
      promptText,
      response.providerId,
      durationMs,
      ruleIds
    );

    const result = {
      communication,
      metadata
    };

    return Object.freeze(result);
  }
}
