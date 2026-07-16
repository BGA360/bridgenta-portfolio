export interface IProviderCapability {
  readonly maxContextTokens: number;
  readonly supportsSystemInstructions: boolean;
  readonly supportsTools: boolean;
}

export type ProviderCategory = 'cloud' | 'local' | 'internal' | 'constitutional';

export interface IProviderRegistration {
  readonly providerId: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly category: ProviderCategory;
  readonly capabilities: IProviderCapability;
  readonly supportedSchemaVersions: readonly string[];
  readonly fallbackProviderId?: string;
}

export interface IProviderBrokerConfig {
  readonly registrations: readonly IProviderRegistration[];
  readonly selectionPriority: Record<string, number>;
  readonly defaultProviderId: string;
  readonly environment: string;
}

export type SelectionTraceType =
  | 'candidate_evaluated'
  | 'candidate_rejected'
  | 'candidate_eligible'
  | 'preference_applied'
  | 'priority_compared'
  | 'fallback_selected'
  | 'provider_selected';

export interface ISelectionTraceEntry {
  readonly type: SelectionTraceType;
  readonly providerId: string;
  readonly message: string;
  readonly timestamp: string;
}

export interface IProviderSelectionResult {
  readonly selectedProviderId: string;
  readonly sessionId: string;
  readonly bundleHash: string;
  readonly timestamp: string;
  readonly selectionTrace: readonly ISelectionTraceEntry[];
  readonly fallbackApplied: boolean;
}
