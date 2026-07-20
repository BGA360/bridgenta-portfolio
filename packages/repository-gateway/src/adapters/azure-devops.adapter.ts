/**
 * @file azure-devops.adapter.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Azure DevOps Repository Adapter
 */

import {
  Repository,
  Branch,
  File,
  RepositoryMetadata,
  RepositoryProviderType,
  RepositoryId,
  CommitHash,
  BranchName,
} from '../domain/types.js';
import { RepositoryProvider } from '../providers/provider.interface.js';
import { RepositoryConnectionError } from '../errors/repository.errors.js';

export class AzureDevOpsAdapter implements RepositoryProvider {
  public readonly providerType = RepositoryProviderType.AZURE_DEVOPS;
  private _connected = false;
  private _uri = '';

  public connect(uri: string): boolean {
    if (!uri || typeof uri !== 'string' || (!uri.includes('dev.azure.com') && !uri.includes('visualstudio.com'))) {
      throw new RepositoryConnectionError('Invalid Azure DevOps repository URI.', uri);
    }
    this._uri = uri;
    this._connected = true;
    return true;
  }

  public discoverRepository(): Repository {
    this.ensureConnected();
    const name = 'azure-repo';
    return {
      id: RepositoryId.create(`az-${name}`),
      provider_type: RepositoryProviderType.AZURE_DEVOPS,
      name: name,
      owner: 'azure-org',
      default_branch: BranchName.create('main'),
      uri: this._uri,
    };
  }

  public enumerateBranches(): readonly Branch[] {
    this.ensureConnected();
    return [
      {
        name: BranchName.create('main'),
        head_commit_hash: CommitHash.create('c3d4e5f678901234567890abcdef123456789012'),
        is_default: true,
        is_protected: true,
      },
    ];
  }

  public enumerateFiles(): readonly File[] {
    this.ensureConnected();
    return [
      {
        path: 'src/azure-pipeline.ts',
        artifact_name: 'azure-pipeline.ts',
        size_bytes: 312,
        mime_type: 'text/plain',
        raw_content: 'export const azurePipeline = true;',
        checksum: 'b2c3c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    ];
  }

  public collectMetadata(): RepositoryMetadata {
    this.ensureConnected();
    return {
      stars: 10,
      forks: 2,
      license: 'Commercial',
      language: 'TypeScript',
      tags: Object.freeze(['azure', 'devops']),
    };
  }

  public disconnect(): void {
    this._connected = false;
  }

  public isConnected(): boolean {
    return this._connected;
  }

  private ensureConnected(): void {
    if (!this._connected) {
      throw new RepositoryConnectionError('Adapter is not connected.', this._uri);
    }
  }
}
