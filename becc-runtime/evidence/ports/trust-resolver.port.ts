import { TrustStatus } from '../types.js';

export interface ITrustResolverPort {
  verifyKeyTrust(keyReference: string, projectId: string): Promise<TrustStatus>;
}
