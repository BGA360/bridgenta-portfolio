import { IProviderAdapter, ITransportClient, ICredentialResolver } from './types.js';
import { MockAdapter } from './mock-adapter.js';
import { GeminiAdapter } from './gemini-adapter.js';
import { AdapterResolutionException } from './exceptions.js';
import { TransportClientService } from './transport-client.js';

export class EnvCredentialResolver implements ICredentialResolver {
  public resolve(providerId: string): string | undefined {
    if (providerId === 'provider-gemini') {
      return process.env.BECC_GEMINI_KEY || process.env.GEMINI_API_KEY;
    }
    return undefined;
  }
}

export class AdapterFactory {
  private readonly mockInstance = new MockAdapter();

  constructor(
    private readonly transportClient: ITransportClient = new TransportClientService(),
    private readonly credentialResolver: ICredentialResolver = new EnvCredentialResolver()
  ) {}

  public getAdapter(providerId: string): IProviderAdapter {
    if (providerId === 'provider-mock') {
      return this.mockInstance;
    }
    if (providerId === 'provider-gemini') {
      return new GeminiAdapter(this.transportClient, this.credentialResolver);
    }
    throw new AdapterResolutionException(providerId);
  }
}
