/**
 * @file provider.interface.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept RepositoryProvider Interface
 */

import {
  Repository,
  Branch,
  File,
  RepositoryMetadata,
  RepositoryProviderType,
} from '../domain/types.js';

export interface RepositoryProvider {
  readonly providerType: RepositoryProviderType;

  /**
   * Connects to target repository URI.
   */
  connect(uri: string, credentials?: Record<string, string>): boolean;

  /**
   * Discovers and returns canonical Repository model.
   */
  discoverRepository(): Repository;

  /**
   * Enumerates branches in the repository.
   */
  enumerateBranches(): readonly Branch[];

  /**
   * Enumerates files in the specified or default branch.
   */
  enumerateFiles(branchName?: string): readonly File[];

  /**
   * Collects observational repository metadata.
   */
  collectMetadata(): RepositoryMetadata;

  /**
   * Disconnects from target repository.
   */
  disconnect(): void;

  /**
   * Returns connection status.
   */
  isConnected(): boolean;
}
