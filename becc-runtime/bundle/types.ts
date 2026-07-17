import { HumanReviewObligationDefinition } from '../shared/types.js';

export interface ICompiledRule {
  readonly ruleId: string;
  readonly heading: string;
  readonly content: string;
  readonly precedenceTier: 'Canon' | 'CoreVolume' | 'DomainSpec';
  readonly precedenceOrder: number;
  readonly filePath: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly contentHash: string;
}

export interface IVocabularyTerm {
  readonly term: string;
  readonly classification: 'forbidden' | 'preferred' | 'required';
  readonly definition?: string;
}

export interface IResolutionEvidence {
  readonly ruleId: string;
  readonly selectedSourcePath: string;
  readonly overriddenSourcesPaths: readonly string[];
  readonly appliedPrecedenceTier: 'Canon' | 'CoreVolume' | 'DomainSpec';
  readonly appliedPrecedenceOrder: number;
}

export interface IBundleIntegrity {
  readonly bundleHash: string;
}

export interface IBuildMetadata {
  readonly timestamp: string;
  readonly ruleCount: number;
  readonly sizeBytes: number;
  readonly environment: string;
}


export interface IKnowledgeBundle {
  readonly sessionId: string;
  readonly schemaVersion: string;
  readonly rules: readonly ICompiledRule[];
  readonly vocabulary: readonly IVocabularyTerm[];
  readonly resolutionEvidence: readonly IResolutionEvidence[];
  readonly obligations: readonly HumanReviewObligationDefinition[];
  readonly integrity: IBundleIntegrity;
  readonly buildMetadata: IBuildMetadata;
}

export interface IBundleConfig {
  readonly maxSizeBytes?: number;
  readonly environment?: string;
  readonly knowledgeRoots?: readonly string[];
}
