/**
 * @file github.adapter.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept GitHub Repository Adapter
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

export class GitHubAdapter implements RepositoryProvider {
  public readonly providerType = RepositoryProviderType.GITHUB;
  private _connected = false;
  private _uri = '';

  public connect(uri: string): boolean {
    if (!uri || typeof uri !== 'string' || !uri.includes('github.com')) {
      throw new RepositoryConnectionError('Invalid GitHub repository URI.', uri);
    }
    this._uri = uri;
    this._connected = true;
    return true;
  }

  public discoverRepository(): Repository {
    this.ensureConnected();
    const parts = this._uri.replace(/^https?:\/\/github\.com\//, '').split('/');
    const owner = parts[0] || 'github-owner';
    const name = parts[1] || 'github-repo';

    return {
      id: RepositoryId.create(`gh-${owner}-${name}`),
      provider_type: RepositoryProviderType.GITHUB,
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
        head_commit_hash: CommitHash.create('a1b2c3d4e5f678901234567890abcdef12345678'),
        is_default: true,
        is_protected: true,
      },
    ];
  }

  public enumerateFiles(): readonly File[] {
    this.ensureConnected();
    return [
      {
        path: 'src/app.ts',
        artifact_name: 'app.ts',
        size_bytes: 256,
        mime_type: 'text/plain',
        raw_content: 'export const app = { name: "CEP" };',
        checksum: 'f4b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    ];
  }

  public collectMetadata(): RepositoryMetadata {
    this.ensureConnected();
    return {
      stars: 100,
      forks: 20,
      open_issues: 0,
      license: 'Apache-2.0',
      language: 'TypeScript',
      tags: Object.freeze(['github', 'scms']),
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
