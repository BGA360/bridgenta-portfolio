/**
 * @file repository-gateway.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Repository Gateway Central Service
 */

import { EvidenceSubmissionModel } from '@cep/evidence-manager';

import {
  RepositoryProviderType,
  RepositorySnapshot,
  Timestamp,
  CommitHash,
} from '../domain/types.js';
import { RepositoryProvider } from '../providers/provider.interface.js';
import { LocalGitAdapter } from '../adapters/local-git.adapter.js';
import { GitHubAdapter } from '../adapters/github.adapter.js';
import { GitLabAdapter } from '../adapters/gitlab.adapter.js';
import { AzureDevOpsAdapter } from '../adapters/azure-devops.adapter.js';
import { RepositoryNormalizer } from '../normalization/normalizer.js';
import {
  RepositoryDiscoveryRequestModel,
  RepositorySnapshotResultModel,
  EvidenceGenerationResultModel,
} from '../contracts/repository.contract.js';
import {
  ProviderUnavailableError,
  RepositoryConnectionError,
} from '../errors/repository.errors.js';
import {
  RepositoryGatewayDomainEvent,
  RepositoryConnectedEvent,
  RepositoryDiscoveredEvent,
  RepositoryIndexedEvent,
  EvidenceGeneratedEvent,
} from '../events/repository.events.js';

export class RepositoryGatewayService {
  private readonly adapterFactories = new Map<RepositoryProviderType, () => RepositoryProvider>();
  private readonly events: RepositoryGatewayDomainEvent[] = [];

  constructor() {
    // Register default initial adapters
    this.registerAdapter(RepositoryProviderType.LOCAL_GIT, () => new LocalGitAdapter());
    this.registerAdapter(RepositoryProviderType.GITHUB, () => new GitHubAdapter());
    this.registerAdapter(RepositoryProviderType.GITLAB, () => new GitLabAdapter());
    this.registerAdapter(RepositoryProviderType.AZURE_DEVOPS, () => new AzureDevOpsAdapter());
  }

  /**
   * Registers a custom or standard provider adapter factory.
   */
  public registerAdapter(
    providerType: RepositoryProviderType,
    factory: () => RepositoryProvider
  ): void {
    this.adapterFactories.set(providerType, factory);
  }

  /**
   * Connects to a repository URI and discovers a canonical RepositorySnapshot.
   */
  public discoverSnapshot(request: RepositoryDiscoveryRequestModel): {
    snapshot: RepositorySnapshot;
    resultModel: RepositorySnapshotResultModel;
  } {
    const factory = this.adapterFactories.get(request.provider_type);
    if (!factory) {
      throw new ProviderUnavailableError(request.provider_type);
    }

    const adapter = factory();
    const connected = adapter.connect(request.uri, request.credentials);
    if (!connected || !adapter.isConnected()) {
      throw new RepositoryConnectionError('Adapter connect returned false.', request.uri);
    }

    const repository = adapter.discoverRepository();
    const branches = adapter.enumerateBranches();
    const defaultBranch = branches.find((b) => b.is_default) || branches[0];
    const files = adapter.enumerateFiles(defaultBranch ? defaultBranch.name : undefined);
    const metadata = adapter.collectMetadata();

    const commit = {
      hash: defaultBranch ? defaultBranch.head_commit_hash : CommitHash.create('0000000000000000000000000000000000000000'),
      message: 'Head commit snapshot',
      author: 'git-author',
      timestamp: Timestamp.create(),
      parent_hashes: [],
    };

    const snapshot = RepositoryNormalizer.normalizeSnapshot(
      repository,
      defaultBranch,
      commit,
      files,
      metadata
    );

    const now = Timestamp.create();

    // Record domain events
    const connEvent: RepositoryConnectedEvent = {
      event_id: `evt-${Date.now()}-conn`,
      event_name: 'RepositoryConnected',
      repository_id: repository.id,
      provider_type: repository.provider_type,
      uri: request.uri,
      timestamp: now,
    };
    this.events.push(connEvent);

    const discEvent: RepositoryDiscoveredEvent = {
      event_id: `evt-${Date.now()}-disc`,
      event_name: 'RepositoryDiscovered',
      repository_id: repository.id,
      provider_type: repository.provider_type,
      name: repository.name,
      owner: repository.owner,
      default_branch: repository.default_branch,
      timestamp: now,
    };
    this.events.push(discEvent);

    const idxEvent: RepositoryIndexedEvent = {
      event_id: `evt-${Date.now()}-idx`,
      event_name: 'RepositoryIndexed',
      repository_id: repository.id,
      provider_type: repository.provider_type,
      commit_hash: commit.hash,
      files_count: files.length,
      timestamp: now,
    };
    this.events.push(idxEvent);

    adapter.disconnect();

    const resultModel: RepositorySnapshotResultModel = {
      repository_id: repository.id,
      provider_type: repository.provider_type,
      default_branch: repository.default_branch,
      commit_hash: commit.hash,
      files_count: files.length,
      captured_at: now,
    };

    return { snapshot, resultModel };
  }

  /**
   * Transforms a canonical RepositorySnapshot into EvidenceSubmissionModel instances.
   */
  public generateEvidenceSubmissions(
    snapshot: RepositorySnapshot,
    assessmentId: string,
    correlationId: string
  ): { submissions: EvidenceSubmissionModel[]; resultModel: EvidenceGenerationResultModel } {
    const submissions = RepositoryNormalizer.transformSnapshotToEvidenceSubmissions(
      snapshot,
      assessmentId,
      correlationId
    );

    const now = Timestamp.create();

    const event: EvidenceGeneratedEvent = {
      event_id: `evt-${Date.now()}-evi`,
      event_name: 'EvidenceGenerated',
      repository_id: snapshot.repository.id,
      provider_type: snapshot.repository.provider_type,
      assessment_id: assessmentId,
      evidence_submissions_count: submissions.length,
      timestamp: now,
    };
    this.events.push(event);

    const resultModel: EvidenceGenerationResultModel = {
      repository_id: snapshot.repository.id,
      assessment_id: assessmentId,
      evidence_submissions_count: submissions.length,
      generated_at: now,
    };

    return { submissions, resultModel };
  }

  /**
   * Returns read-only array of emitted domain events.
   */
  public getEvents(): readonly RepositoryGatewayDomainEvent[] {
    return Object.freeze([...this.events]);
  }
}

export function createRepositoryGatewayService(): RepositoryGatewayService {
  return new RepositoryGatewayService();
}
