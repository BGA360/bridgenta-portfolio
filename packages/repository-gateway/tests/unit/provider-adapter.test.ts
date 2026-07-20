/**
 * @file provider-adapter.test.ts
 * @module @cep/repository-gateway
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  LocalGitAdapter,
  GitHubAdapter,
  GitLabAdapter,
  AzureDevOpsAdapter,
  RepositoryProviderType,
  RepositoryConnectionError,
} from '../../src/index.js';

describe('Repository Gateway — Unit Tests (Adapters)', () => {
  test('should connect and discover repository model with LocalGitAdapter', () => {
    const adapter = new LocalGitAdapter();
    assert.equal(adapter.providerType, RepositoryProviderType.LOCAL_GIT);
    assert.equal(adapter.isConnected(), false);

    adapter.connect('/path/to/my-repo');
    assert.equal(adapter.isConnected(), true);

    const repo = adapter.discoverRepository();
    assert.equal(repo.name, 'my-repo');
    assert.equal(repo.provider_type, RepositoryProviderType.LOCAL_GIT);

    const branches = adapter.enumerateBranches();
    assert.equal(branches.length, 1);
    assert.equal(branches[0].name, 'main');

    const files = adapter.enumerateFiles();
    assert.equal(files.length, 1);
    assert.equal(files[0].artifact_name, 'index.ts');

    adapter.disconnect();
    assert.equal(adapter.isConnected(), false);
  });

  test('should connect and discover repository model with GitHubAdapter', () => {
    const adapter = new GitHubAdapter();
    adapter.connect('https://github.com/BGA360/bridgenta-portfolio');
    const repo = adapter.discoverRepository();

    assert.equal(repo.owner, 'BGA360');
    assert.equal(repo.name, 'bridgenta-portfolio');
    assert.equal(repo.provider_type, RepositoryProviderType.GITHUB);
  });

  test('should connect and discover repository model with GitLabAdapter', () => {
    const adapter = new GitLabAdapter();
    adapter.connect('https://gitlab.com/group/project');
    const repo = adapter.discoverRepository();

    assert.equal(repo.provider_type, RepositoryProviderType.GITLAB);
    assert.equal(repo.name, 'project');
  });

  test('should connect and discover repository model with AzureDevOpsAdapter', () => {
    const adapter = new AzureDevOpsAdapter();
    adapter.connect('https://dev.azure.com/org/project/_git/repo');
    const repo = adapter.discoverRepository();

    assert.equal(repo.provider_type, RepositoryProviderType.AZURE_DEVOPS);
    assert.equal(repo.name, 'azure-repo');
  });

  test('should throw RepositoryConnectionError when connecting with invalid URI', () => {
    const adapter = new GitHubAdapter();
    assert.throws(
      () => adapter.connect('invalid-uri'),
      RepositoryConnectionError
    );
  });
});
