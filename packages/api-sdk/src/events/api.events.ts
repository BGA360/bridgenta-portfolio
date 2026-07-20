/**
 * @file api.events.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Platform API Domain Events
 */

import { APIVersion, ContractVersion, Timestamp } from '../domain/types.js';

export interface BaseAPIEvent {
  readonly event_id: string;
  readonly event_name: string;
  readonly api_version: APIVersion;
  readonly contract_version: ContractVersion;
  readonly timestamp: Timestamp;
}

export interface SDKInitializedEvent extends BaseAPIEvent {
  readonly event_name: 'SDKInitialized';
  readonly client_id: string;
}

export interface APIRequestReceivedEvent extends BaseAPIEvent {
  readonly event_name: 'APIRequestReceived';
  readonly request_type: string;
  readonly request_id: string;
}

export interface APIRequestValidatedEvent extends BaseAPIEvent {
  readonly event_name: 'APIRequestValidated';
  readonly request_type: string;
  readonly request_id: string;
}

export interface PipelineExecutionRequestedEvent extends BaseAPIEvent {
  readonly event_name: 'PipelineExecutionRequested';
  readonly assessment_request_id: string;
  readonly project_ref: string;
}

export interface APIResponseGeneratedEvent extends BaseAPIEvent {
  readonly event_name: 'APIResponseGenerated';
  readonly request_id: string;
  readonly status: string;
}

export type PlatformAPIDomainEvent =
  | SDKInitializedEvent
  | APIRequestReceivedEvent
  | APIRequestValidatedEvent
  | PipelineExecutionRequestedEvent
  | APIResponseGeneratedEvent;
