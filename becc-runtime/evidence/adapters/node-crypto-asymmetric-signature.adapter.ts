import { ISignatureProviderPort } from '../ports/signature-provider.port.js';
import { SignatureEnvelope } from '../types.js';
import { EvidenceSignatureException } from '../exceptions.js';
import crypto from 'node:crypto';

export class NodeCryptoAsymmetricSignatureAdapter implements ISignatureProviderPort {
  private keysMap = new Map<string, { privateKey: crypto.KeyObject | string; publicKey: crypto.KeyObject | string }>();

  public registerKey(keyReference: string, privateKey: string, publicKey: string) {
    this.keysMap.set(keyReference, { privateKey, publicKey });
  }

  public async sign(payloadHash: string, keyReference: string): Promise<SignatureEnvelope> {
    const keyPair = this.keysMap.get(keyReference);
    if (!keyPair) {
      throw new EvidenceSignatureException(`Signing key not registered: ${keyReference}`);
    }

    try {
      const sign = crypto.createSign('SHA256');
      sign.update(payloadHash);
      const signature = sign.sign(keyPair.privateKey, 'hex');
      return {
        algorithm: 'SHA256withECDSA',
        providerId: 'NodeCrypto',
        keyReference,
        signature,
        signedAt: new Date().toISOString()
      };
    } catch (err: any) {
      throw new EvidenceSignatureException(`Signing failed: ${err.message}`);
    }
  }

  public async verify(payloadHash: string, envelope: SignatureEnvelope): Promise<boolean> {
    if (envelope.algorithm !== 'SHA256withECDSA') {
      return false;
    }

    const keyPair = this.keysMap.get(envelope.keyReference);
    if (!keyPair) {
      return false;
    }

    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(payloadHash);
      return verify.verify(keyPair.publicKey, envelope.signature, 'hex');
    } catch {
      return false;
    }
  }
}
