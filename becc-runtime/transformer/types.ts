import {
  AssessmentContext,
  ProviderExecutionEnvelope,
  IProviderResponse,
  CandidateCommunication,
  TransformationMetadata
} from '../shared/types.js';

export interface IKnowledgeBundle {
  readonly schemaVersion: string;
  readonly metadata: {
    readonly bundleHash: string;
    readonly ruleCount: number;
    readonly timestamp: string;
  };
  readonly rules: readonly {
    readonly id: string;
    readonly type: 'Canon' | 'Guideline';
    readonly summary: string;
    readonly body: string;
  }[];
}

export interface IEnvelopeBuilder {
  build(
    context: AssessmentContext,
    bundle: IKnowledgeBundle,
    temperature?: number,
    maxTokens?: number
  ): ProviderExecutionEnvelope;
}

export interface IInstructionComposer {
  composeSystemInstructions(bundle: IKnowledgeBundle): string;
  composePromptText(context: AssessmentContext, fileContent: string): string;
}

export interface IProviderResponseParser {
  parseDiff(text: string): string;
}

export interface ICandidateCommunicationBuilder {
  build(
    sessionId: string,
    diffContent: string,
    targetFilePath: string
  ): CandidateCommunication;
}

export interface ITransformationMetadataBuilder {
  build(
    promptText: string,
    modelId: string,
    durationMs: number,
    includedRuleIds: readonly string[],
    providerReferencedRuleIds: readonly string[]
  ): TransformationMetadata;
}

export interface ITransformationEngine {
  assembleExecutionEnvelope(
    context: AssessmentContext,
    bundle: IKnowledgeBundle,
    fileContent: string
  ): ProviderExecutionEnvelope;

  transformProviderResponse(
    response: IProviderResponse,
    context: AssessmentContext,
    bundle: IKnowledgeBundle,
    durationMs: number
  ): {
    readonly communication: CandidateCommunication;
    readonly metadata: TransformationMetadata;
  };
}
