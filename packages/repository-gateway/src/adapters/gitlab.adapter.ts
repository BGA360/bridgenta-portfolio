/**
 * @file gitlab.adapter.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept GitLab Repository Adapter
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

export class GitLabAdapter implements RepositoryProvider {
  public readonly providerType = RepositoryProviderType.GITLAB;
  private _connected = false;
  private _uri = '';

  public connect(uri: string): boolean {
    if (!uri || typeof uri !== 'string' || !uri.includes('gitlab.')) {
      throw new RepositoryConnectionError('Invalid GitLab repository URI.', uri);
    }
    this._uri = uri;
    this._connected = true;
    return true;
  }

  public discoverRepository(): Repository {
    this.ensureConnected();
    const parts = this._uri.replace(/^https?:\/\/gitlab\.[^/]+\//, '').split('/');
    const owner = parts[0] || 'gitlab-group';
    const name = parts[1] || 'gitlab-project';

    return {
      id: RepositoryId.create(`gl-${owner}-${name}`),
      provider_type: RepositoryProviderType.GITLAB,
      name: name,
      owner: owner,
      default_branch: BranchName.create('main'),
      uri: this._uri,
    };
  }

  public enumerateBranches(): readonly Branch[] {
    this.ensureConnected();
    return [
      {
        name: BranchName.create('main'),
        head_commit_hash: CommitHash.create('b2c3d4e5f678901234567890abcdef1234567890'),
        is_default: true,
        is_protected: true,
      },
    ];
  }

  public enumerateFiles(): readonly File[] {
    this.ensureConnected();
    return [
      {
        path: 'src/gitlab-config.ts',
        artifact_name: 'gitlab-config.ts',
        size_bytes: 192,
        mime_type: 'text/plain',
        raw_content: 'export const gitlab = true;',
        checksum: 'a1b2c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    ];
  }

  public collectMetadata(): RepositoryMetadata {
    this.ensureConnected();
    return {
      stars: 45,
      forks: 5,
      open_issues: 1,
      license: 'MIT',
      language: 'TypeScript',
      tags: Object.freeze(['gitlab', 'ci']),
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
