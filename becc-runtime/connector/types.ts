import { AssessmentRequest } from '../shared/types.js';

export interface ProjectConfig {
  readonly project?: string;
  readonly projectId?: string;
  readonly projectType?: string;
  readonly classification?: string;
  readonly lifecycle?: string;
}

export interface ProjectConnectorResult {
  readonly assessmentId: string;
  readonly timestamp: string;
  readonly providerPreference?: string;
  readonly project: string;
  readonly target: string;
  readonly repositoryRoot: string;
  readonly projectIdentity: {
    readonly name: string;
    readonly id: string;
  };
  readonly repositoryDetails: {
    readonly remoteUri: string;
    readonly branch: string;
    readonly commitHash: string;
    readonly status: 'clean' | 'dirty';
  };
  readonly targetDocument: {
    readonly path: string; // Relative to repository root
    readonly hash: string; // SHA-256 hash of the target document contents
  };
  readonly projectType: string;
  readonly declaredClassification?: string;
  readonly classificationSource?: 'document' | 'config';
  readonly rawConfig: ProjectConfig;
  readonly runtimeMetadata: {
    readonly env: 'production' | 'development' | 'test';
    readonly os: string;
    readonly timestamp: string;
    readonly processId: number;
  };
  readonly status: 'success';
}
