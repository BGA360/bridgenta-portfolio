import { IKnowledgeBundle } from '../bundle/types.js';
import { IProviderSelectionResult } from './types.js';
import { ProviderRegistryService } from './provider-registry.service.js';
import { ProviderSelectorService } from './provider-selector.service.js';

export class ProviderBrokerService {
  private readonly selector: ProviderSelectorService;

  constructor(selector = new ProviderSelectorService()) {
    this.selector = selector;
  }

  public route(
    bundle: IKnowledgeBundle,
    registry: ProviderRegistryService,
    preference?: string
  ): IProviderSelectionResult {
    if (!bundle) {
      throw new Error('Knowledge bundle must not be null or undefined.');
    }
    if (!bundle.sessionId || bundle.sessionId.trim() === '') {
      throw new Error('Bundle sessionId is missing or empty.');
    }
    if (!bundle.schemaVersion || bundle.schemaVersion.trim() === '') {
      throw new Error('Bundle schemaVersion is missing or empty.');
    }
    if (!bundle.integrity || !bundle.integrity.bundleHash) {
      throw new Error('Bundle integrity metadata is missing.');
    }
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    if (!hashRegex.test(bundle.integrity.bundleHash)) {
      throw new Error('Bundle integrity bundleHash is malformed.');
    }
    if (!bundle.rules || !Array.isArray(bundle.rules)) {
      throw new Error('Bundle rules section is missing or invalid.');
    }
    if (!bundle.vocabulary || !Array.isArray(bundle.vocabulary)) {
      throw new Error('Bundle vocabulary section is missing or invalid.');
    }

    const { selectedProviderId, trace, fallbackApplied } = this.selector.select(
      bundle,
      registry,
      preference
    );

    const result: IProviderSelectionResult = {
      selectedProviderId,
      sessionId: bundle.sessionId,
      bundleHash: bundle.integrity.bundleHash,
      timestamp: new Date().toISOString(),
      selectionTrace: trace,
      fallbackApplied
    };

    return Object.freeze(result);
  }
}
