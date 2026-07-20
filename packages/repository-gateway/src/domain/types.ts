/**
 * @file types.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Canonical Repository Model
 */

// Branded Value Objects
export type RepositoryId = string & { readonly __brand: unique symbol };
export type CommitHash = string & { readonly __brand: unique symbol };
export type BranchName = string & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

export const RepositoryId = {
  create: (id: string): RepositoryId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('RepositoryId must be a non-empty string.');
    }
    return id.trim() as RepositoryId;
  },
};

export const CommitHash = {
  create: (hash: string): CommitHash => {
    if (!hash || typeof hash !== 'string' || hash.trim() === '') {
      throw new Error('CommitHash must be a non-empty string.');
    }
    return hash.trim() as CommitHash;
  },
};

export const BranchName = {
  create: (name: string): BranchName => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('BranchName must be a non-empty string.');
    }
    return name.trim() as BranchName;
  },
};

export const Timestamp = {
  create: (isoString?: string): Timestamp => {
    const str = isoString || new Date().toISOString();
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error('Timestamp must be a valid ISO 8601 date string.');
    }
    return date.toISOString() as Timestamp;
  },
};

/**
 * Supported SCM Repository Provider Types.
 */
export enum RepositoryProviderType {
  LOCAL_GIT = 'LOCAL_GIT',
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  AZURE_DEVOPS = 'AZURE_DEVOPS',
}

/**
 * Canonical Repository Model.
 */
export interface Repository {
  readonly id: RepositoryId;
  readonly provider_type: RepositoryProviderType;
  readonly name: string;
  readonly owner: string;
  readonly default_branch: BranchName;
  readonly uri: string;
}

/**
 * Canonical Branch Model.
 */
export interface Branch {
  readonly name: BranchName;
  readonly head_commit_hash: CommitHash;
  readonly is_default: boolean;
  readonly is_protected: boolean;
}

/**
 * Canonical Commit Model.
 */
export interface Commit {
  readonly hash: CommitHash;
  readonly message: string;
  readonly author: string;
  readonly timestamp: Timestamp;
  readonly parent_hashes: readonly CommitHash[];
}

/**
 * Canonical File Model.
 */
export interface File {
  readonly path: string;
  readonly artifact_name: string;
  readonly size_bytes: number;
  readonly mime_type: string;
  readonly raw_content: string;
  readonly checksum: string; // SHA-256 hex
}

/**
 * Canonical Directory Model.
 */
export interface Directory {
  readonly path: string;
  readonly children_files: readonly File[];
  readonly children_directories: readonly Directory[];
}

/**
 * Canonical Repository Metadata.
 */
export interface RepositoryMetadata {
  readonly stars?: number;
  readonly forks?: number;
  readonly open_issues?: number;
  readonly license?: string;
  readonly language?: string;
  readonly tags: readonly string[];
}

/**
 * Canonical Repository Snapshot (Point-in-time observational state).
 */
export interface RepositorySnapshot {
  readonly repository: Repository;
  readonly branch: Branch;
  readonly commit: Commit;
  readonly file_tree: readonly File[];
  readonly metadata: RepositoryMetadata;
  readonly captured_at: Timestamp;
}

/**
 * Canonical Repository Reference.
 */
export interface RepositoryReference {
  readonly repository_id: RepositoryId;
  readonly commit_hash: CommitHash;
  readonly target_file_path: string;
  readonly checksum: string;
}

/**
 * Traceability Reference model.
 */
export interface TraceabilityReference {
  readonly constitutional_source: string;
  readonly contract_id: string;
  readonly domain_concept: string;
}
