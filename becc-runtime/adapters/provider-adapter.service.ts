import { ProviderExecutionEnvelope } from '../shared/types.js';
import { IProviderExecutionResult } from './types.js';
import { AdapterFactory } from './adapter-factory.js';

export class ProviderAdapterService {
  constructor(private readonly factory = new AdapterFactory()) {}

  public async execute(
    providerId: string,
    envelope: ProviderExecutionEnvelope,
    signal?: AbortSignal
  ): Promise<IProviderExecutionResult> {
    const adapter = this.factory.getAdapter(providerId);
    return adapter.execute(envelope, signal);
  }
}
