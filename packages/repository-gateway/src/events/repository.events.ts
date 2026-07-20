/**
 * @file repository.events.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Gateway Domain Events
 */

import { RepositoryId, RepositoryProviderType, Timestamp } from '../domain/types.js';

export interface BaseRepositoryEvent {
  readonly event_id: string;
  readonly event_name: string;
  readonly repository_id: RepositoryId;
  readonly provider_type: RepositoryProviderType;
  readonly timestamp: Timestamp;
}

export interface RepositoryConnectedEvent extends BaseRepositoryEvent {
  readonly event_name: 'RepositoryConnected';
  readonly uri: string;
}

export interface RepositoryDiscoveredEvent extends BaseRepositoryEvent {
  readonly event_name: 'RepositoryDiscovered';
  readonly name: string;
  readonly owner: string;
  readonly default_branch: string;
}

export interface RepositoryIndexedEvent extends BaseRepositoryEvent {
  readonly event_name: 'RepositoryIndexed';
  readonly commit_hash: string;
  readonly files_count: number;
}

export interface EvidenceGeneratedEvent extends BaseRepositoryEvent {
  readonly event_name: 'EvidenceGenerated';
  readonly assessment_id: string;
  readonly evidence_submissions_count: number;
}

export interface RepositoryDisconnectedEvent extends BaseRepositoryEvent {
  readonly event_name: 'RepositoryDisconnected';
  readonly uri: string;
}

export type RepositoryGatewayDomainEvent =
  | RepositoryConnectedEvent
  | RepositoryDiscoveredEvent
  | RepositoryIndexedEvent
  | EvidenceGeneratedEvent
  | RepositoryDisconnectedEvent;
