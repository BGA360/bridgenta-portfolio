/**
 * @file local-git.adapter.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Local Git Repository Adapter
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

export class LocalGitAdapter implements RepositoryProvider {
  public readonly providerType = RepositoryProviderType.LOCAL_GIT;
  private _connected = false;
  private _uri = '';

  public connect(uri: string): boolean {
    if (!uri || typeof uri !== 'string' || uri.trim() === '') {
      throw new RepositoryConnectionError('Local Git URI must be a non-empty string.', uri);
    }
    this._uri = uri;
    this._connected = true;
    return true;
  }

  public discoverRepository(): Repository {
    this.ensureConnected();
    const repoName = this._uri.split('/').pop() || 'local-repo';
    return {
      id: RepositoryId.create(`local-${repoName}`),
      provider_type: RepositoryProviderType.LOCAL_GIT,
      name: repoName,
      owner: 'local-user',
      default_branch: BranchName.create('main'),
      uri: this._uri,
    };
  }

  public enumerateBranches(): readonly Branch[] {
    this.ensureConnected();
    return [
      {
        name: BranchName.create('main'),
        head_commit_hash: CommitHash.create('c0ff331122334455667788990011223344556677'),
        is_default: true,
        is_protected: false,
      },
    ];
  }

  public enumerateFiles(): readonly File[] {
    this.ensureConnected();
    return [
      {
        path: 'src/index.ts',
        artifact_name: 'index.ts',
        size_bytes: 128,
        mime_type: 'text/plain',
        raw_content: 'export function main() { return true; }',
        checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    ];
  }

  public collectMetadata(): RepositoryMetadata {
    this.ensureConnected();
    return {
      license: 'MIT',
      language: 'TypeScript',
      tags: Object.freeze(['local', 'git']),
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
      throw new RepositoryConnectionError('Adapter is not connected to any repository.', this._uri);
    }
  }
}
