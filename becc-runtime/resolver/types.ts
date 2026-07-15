import { AssessmentContext } from '../shared/types.js';

export interface IRulePointer {
  readonly ruleId: string;
  readonly filePath: string;
  readonly heading: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly contentHash: string;
  readonly precedenceOrder: number;
  readonly authoritySource: string;
  readonly precedenceTier: 'Canon' | 'CoreVolume' | 'DomainSpec';
  readonly originatingFramework: string;
  readonly versionIdentifier: string;
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

export interface IResolvedKnowledge {
  readonly sessionId: string;
  readonly rulePointers: readonly IRulePointer[];
  readonly vocabularyList: readonly IVocabularyTerm[];
  readonly resolutionEvidence: readonly IResolutionEvidence[];
  readonly timestamp: string;
}

export interface IResolverConfig {
  readonly knowledgeRoots: readonly string[];
  readonly knowledgeEntryPoint: string;
  readonly exclusionPaths: readonly string[];
  readonly permittedFileTypes: readonly string[];
  readonly traversalDepthLimit: number;
}

export interface IDocumentMetadata {
  readonly status: string;
  readonly version?: string;
  readonly targetVersion?: string;
  readonly classification?: string;
  readonly title?: string;
  readonly precedenceTier?: 'Canon' | 'CoreVolume' | 'DomainSpec';
  readonly precedenceOrder?: number;
  readonly framework?: string;
}
