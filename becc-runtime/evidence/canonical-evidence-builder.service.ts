import { EvidencePayload, SignedEvidenceRecord, SignatureEnvelope, EvidenceRecordType } from './types.js';
import { canonicalizeJson } from '../shared/canonicalize.js';
import { createHash } from 'node:crypto';

export class CanonicalEvidenceBuilderService {
  public buildPayload(
    params: Omit<EvidencePayload, 'schemaVersion' | 'canonicalizationVersion' | 'recordedAt'>,
    recordedAt: string
  ): EvidencePayload {
    const payload: any = {
      schemaVersion: '1.0',
      canonicalizationVersion: '1.0',
      recordedAt,
      ...params
    };
    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    }
    return payload;
  }

  public hashPayload(payload: EvidencePayload): string {
    const serialized = canonicalizeJson(payload);
    return createHash('sha256').update(serialized).digest('hex');
  }

  public assembleRecord(
    payload: EvidencePayload,
    payloadHash: string,
    signature: SignatureEnvelope
  ): SignedEvidenceRecord {
    const envelope = {
      payload,
      payloadHash,
      signature
    };
    const serializedRecord = canonicalizeJson(envelope);
    const recordHash = createHash('sha256').update(serializedRecord).digest('hex');
    return {
      ...envelope,
      recordHash
    };
  }
}
