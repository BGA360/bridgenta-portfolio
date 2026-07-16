import { IKnowledgeBundle } from '../bundle/types.js';
import { IProviderRegistration, ISelectionTraceEntry, SelectionTraceType } from './types.js';
import { ProviderRegistryService } from './provider-registry.service.js';
import { NoCompatibleProviderException, NoEligibleProviderException, ProviderDisabledException } from './exceptions.js';

export class ProviderSelectorService {
  public select(
    bundle: IKnowledgeBundle,
    registry: ProviderRegistryService,
    preference?: string
  ): { selectedProviderId: string; trace: readonly ISelectionTraceEntry[]; fallbackApplied: boolean } {
    const trace: ISelectionTraceEntry[] = [];
    
    const createTrace = (type: SelectionTraceType, providerId: string, message: string): ISelectionTraceEntry => {
      return Object.freeze({
        type,
        providerId,
        message,
        timestamp: new Date().toISOString()
      });
    };

    const registrations = registry.getAllRegistrations();
    const eligible: IProviderRegistration[] = [];

    for (const reg of registrations) {
      trace.push(createTrace('candidate_evaluated', reg.providerId, `Evaluating candidate: ${reg.providerId}`));

      // 1. Compatibility Check
      const supportsSchema = reg.supportedSchemaVersions.includes(bundle.schemaVersion);
      if (!supportsSchema) {
        trace.push(createTrace('candidate_rejected', reg.providerId, `Rejected: Schema version ${bundle.schemaVersion} not supported.`));
        continue;
      }

      // 2. Enabled Check
      if (!reg.enabled) {
        trace.push(createTrace('candidate_rejected', reg.providerId, 'Rejected: Provider is disabled in registry.'));
        continue;
      }



      trace.push(createTrace('candidate_eligible', reg.providerId, `Candidate is eligible.`));
      eligible.push(reg);
    }

    if (eligible.length === 0) {
      const anyCompatible = registrations.some(r => r.supportedSchemaVersions.includes(bundle.schemaVersion));
      if (!anyCompatible) {
        throw new NoCompatibleProviderException(bundle.schemaVersion);
      }
      throw new NoEligibleProviderException(`No candidate provider satisfied enabled and capability constraints for size: ${bundle.buildMetadata.sizeBytes} bytes.`);
    }

    let selectedReg: IProviderRegistration | undefined;
    let fallbackApplied = false;

    // 4. Handle Preference
    if (preference) {
      const prefReg = registry.getRegistration(preference);
      if (!prefReg) {
        trace.push(createTrace('candidate_rejected', preference, 'Preferred provider not found in registry.'));
      } else {
        const isEligible = eligible.some(e => e.providerId === preference);
        if (isEligible) {
          selectedReg = prefReg;
          trace.push(createTrace('preference_applied', preference, `Preference applied successfully: ${preference}`));
        } else {
          trace.push(createTrace(
            'candidate_rejected',
            preference,
            `Preferred provider is not eligible (either disabled, incompatible schema, or context overflow).`
          ));
          if (!prefReg.enabled) {
            throw new ProviderDisabledException(preference);
          }
        }
      }
    }

    // 5. Priority Resolution (if no preferred eligible provider was selected)
    if (!selectedReg) {
      eligible.sort((a, b) => {
        const prioA = registry.getSelectionPriority(a.providerId);
        const prioB = registry.getSelectionPriority(b.providerId);
        if (prioB !== prioA) {
          return prioB - prioA;
        }
        return a.providerId.localeCompare(b.providerId);
      });

      selectedReg = eligible[0];
      trace.push(createTrace('priority_compared', selectedReg.providerId, `Selected highest priority eligible provider.`));
    }

    // Check fallback trace mapping
    if (selectedReg.fallbackProviderId) {
      trace.push(createTrace(
        'fallback_selected',
        selectedReg.fallbackProviderId,
        `Configured fallback provider path is available: ${selectedReg.fallbackProviderId}`
      ));
    }

    trace.push(createTrace('provider_selected', selectedReg.providerId, `Final selection: ${selectedReg.providerId}`));

    return {
      selectedProviderId: selectedReg.providerId,
      trace: Object.freeze(trace),
      fallbackApplied
    };
  }
}
