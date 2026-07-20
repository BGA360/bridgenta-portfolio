/**
 * @file repository.contract.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept CTR-007 Specification Data Models
 */

import { RepositoryProviderType } from '../domain/types.js';

export interface RepositoryDiscoveryRequestModel {
  uri: string;
  provider_type: RepositoryProviderType;
  credentials?: Record<string, string>;
}

export interface RepositorySnapshotResultModel {
  repository_id: string;
  provider_type: RepositoryProviderType;
  default_branch: string;
  commit_hash: string;
  files_count: number;
  captured_at: string;
}

export interface EvidenceGenerationResultModel {
  repository_id: string;
  assessment_id: string;
  evidence_submissions_count: number;
  generated_at: string;
}
