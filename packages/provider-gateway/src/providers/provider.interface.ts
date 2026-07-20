/**
 * @file provider.interface.ts
 * @module @cep/provider-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-008 (AI Provider Gateway Contract)
 * @domainConcept AIProvider Common Interface
 */

import {
  ProviderType,
  ProviderCapability,
  ProviderHealth,
  AIRequest,
  AIResponse,
} from '../domain/types.js';

export interface AIProvider {
  readonly providerType: ProviderType;

  /**
   * Connects or initializes provider configuration.
   */
  connect(config?: Record<string, string>): boolean;

  /**
   * Disconnects or resets provider state.
   */
  disconnect(): void;

  /**
   * Returns supported capabilities.
   */
  getCapabilities(): readonly ProviderCapability[];

  /**
   * Performs provider health check.
   */
  healthCheck(): ProviderHealth;

  /**
   * Submits a canonical AIRequest and returns a canonical AIResponse.
   */
  submitRequest(request: AIRequest): AIResponse;

  /**
   * Normalizes raw external response payload into canonical AIResponse.
   */
  normalizeResponse(rawResponse: unknown, request: AIRequest): AIResponse;

  /**
   * Returns connection status.
   */
  isConnected(): boolean;
}
