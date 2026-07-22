/**
 * @file index.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Repository Abstraction and Evidence Acquisition
 */

// Export Domain Types & Models
export {
  RepositoryId,
  CommitHash,
  BranchName,
  Timestamp,
  RepositoryProviderType,
  type Repository,
  type Branch,
  type Commit,
  type File,
  type Directory,
  type RepositoryMetadata,
  type RepositorySnapshot,
  type RepositoryReference,
  type TraceabilityReference,
} from './domain/types.js';

// Export Common Provider Interface
export { type RepositoryProvider } from './providers/provider.interface.js';

// Export Adapters
export { LocalGitAdapter } from './adapters/local-git.adapter.js';
export { GitHubAdapter } from './adapters/github.adapter.js';
export { GitLabAdapter } from './adapters/gitlab.adapter.js';
export { AzureDevOpsAdapter } from './adapters/azure-devops.adapter.js';

// Export Normalizer
export { RepositoryNormalizer } from './normalization/normalizer.js';

// Export Contracts
export {
  type RepositoryDiscoveryRequestModel,
  type RepositorySnapshotResultModel,
  type EvidenceGenerationResultModel,
} from './contracts/repository.contract.js';

// Export Errors
export {
  RepositoryGatewayError,
  RepositoryConnectionError,
  ProviderUnavailableError,
  RepositoryNotFoundError,
  RepositoryContractViolation,
  RepositoryNormalizationError,
  AdapterRegistrationError,
} from './errors/repository.errors.js';

// Export Events
export {
  type BaseRepositoryEvent,
  type RepositoryConnectedEvent,
  type RepositoryDiscoveredEvent,
  type RepositoryIndexedEvent,
  type EvidenceGeneratedEvent,
  type RepositoryDisconnectedEvent,
  type RepositoryGatewayDomainEvent,
} from './events/repository.events.js';

// Export Service & Factory
export {
  RepositoryGatewayService,
  createRepositoryGatewayService,
} from './gateway/repository-gateway.js';

// Export Traceability
export { RepositoryTraceabilityManager } from './traceability/repository-traceability.js';
