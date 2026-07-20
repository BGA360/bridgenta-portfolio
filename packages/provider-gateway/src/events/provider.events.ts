/**
 * @file provider.events.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept AI Provider Gateway Domain Events
 */

import { ProviderType, ProviderCapability, RequestId, ResponseId, Timestamp } from '../domain/types.js';

export interface BaseProviderEvent {
  readonly event_id: string;
  readonly event_name: string;
  readonly provider_type: ProviderType;
  readonly timestamp: Timestamp;
}

export interface ProviderRegisteredEvent extends BaseProviderEvent {
  readonly event_name: 'ProviderRegistered';
  readonly capabilities: readonly ProviderCapability[];
}

export interface ProviderConnectedEvent extends BaseProviderEvent {
  readonly event_name: 'ProviderConnected';
  readonly status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
}

export interface RequestSubmittedEvent extends BaseProviderEvent {
  readonly event_name: 'RequestSubmitted';
  readonly request_id: RequestId;
  readonly capability: ProviderCapability;
}

export interface ResponseReceivedEvent extends BaseProviderEvent {
  readonly event_name: 'ResponseReceived';
  readonly response_id: ResponseId;
  readonly request_id: RequestId;
  readonly total_tokens: number;
}

export interface ProviderDisconnectedEvent extends BaseProviderEvent {
  readonly event_name: 'ProviderDisconnected';
}

export type ProviderGatewayDomainEvent =
  | ProviderRegisteredEvent
  | ProviderConnectedEvent
  | RequestSubmittedEvent
  | ResponseReceivedEvent
  | ProviderDisconnectedEvent;
