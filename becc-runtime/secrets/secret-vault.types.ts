/**
 * BECC v2 — Future Cloud Vault Adapter Contracts & Boundary Specification (Phase 12)
 *
 * Defines the contract boundary for external cloud secret stores:
 * - Render Secret Store (Environment Groups / API Key)
 * - AWS Secrets Manager
 * - Azure Key Vault
 * - GCP Secret Manager
 * - HashiCorp Vault
 *
 * This contract enables zero-downtime secret rotation, leased credentials,
 * and external vault resolution without mutating caller code.
 */

import { ISecretProvider } from './secret-provider.port.js';

export type CloudVaultProviderType =
  | 'ENVIRONMENT'
  | 'RENDER_SECRET_STORE'
  | 'AWS_SECRETS_MANAGER'
  | 'AZURE_KEY_VAULT'
  | 'GCP_SECRET_MANAGER'
  | 'HASHICORP_VAULT';

export interface CloudVaultMetadata {
  providerType: CloudVaultProviderType;
  vaultId?: string;
  region?: string;
  connected: boolean;
  lastSyncTimestamp?: string;
}

export interface ICloudVaultProvider extends ISecretProvider {
  readonly providerType: CloudVaultProviderType;
  getVaultMetadata(): CloudVaultMetadata;
  refreshSecrets?(): Promise<void>;
}
