import { ITrustResolverPort } from '../ports/trust-resolver.port.js';
import { TrustStatus } from '../types.js';

export class ConfiguredTrustResolverAdapter implements ITrustResolverPort {
  private trustMap = new Map<string, { status: TrustStatus; projectId: string }>();

  public registerKeyTrust(keyReference: string, projectId: string, status: TrustStatus) {
    this.trustMap.set(`${keyReference}:${projectId}`, { status, projectId });
  }

  public async verifyKeyTrust(keyReference: string, projectId: string): Promise<TrustStatus> {
    const entry = this.trustMap.get(`${keyReference}:${projectId}`);
    if (!entry) {
      return TrustStatus.KEY_UNKNOWN;
    }
    return entry.status;
  }
}
