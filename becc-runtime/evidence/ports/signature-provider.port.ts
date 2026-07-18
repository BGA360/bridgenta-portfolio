import { SignatureEnvelope } from '../types.js';

export interface ISignatureProviderPort {
  sign(payloadHash: string, keyReference: string): Promise<SignatureEnvelope>;
  verify(payloadHash: string, envelope: SignatureEnvelope): Promise<boolean>;
}
