/**
 * @file provider.contract.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept CTR-008 Specification Data Models
 */

import { ProviderType, ProviderCapability } from '../domain/types.js';

export interface AIRequestSubmissionModel {
  provider_type: ProviderType;
  capability: ProviderCapability;
  system_instruction?: string;
  user_input: string;
  context?: string[];
}

export interface AIResponseResultModel {
  response_id: string;
  request_id: string;
  provider_type: ProviderType;
  content: string;
  finish_reason: string;
  total_tokens: number;
  model_name: string;
  created_at: string;
}

export interface ProviderCapabilityQueryModel {
  provider_type: ProviderType;
  supported_capabilities: ProviderCapability[];
  is_healthy: boolean;
}
