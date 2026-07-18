import { ILedgerStoragePort } from './ports/ledger-storage.port.js';
import { ISignatureProviderPort } from './ports/signature-provider.port.js';
import { ITrustResolverPort } from './ports/trust-resolver.port.js';
import { IArtifactResolverPort } from './ports/artifact-resolver.port.js';
import { LedgerVerificationResult, LedgerStatus, SignedEvidenceRecord, EvidenceVerificationResult, TrustStatus } from './types.js';
import { CanonicalEvidenceBuilderService } from './canonical-evidence-builder.service.js';

export class LedgerVerificationService {
  private builder = new CanonicalEvidenceBuilderService();

  constructor(
    private signatureProvider: ISignatureProviderPort,
    private trustResolver: ITrustResolverPort,
    private artifactResolver: IArtifactResolverPort
  ) {}

  public async verifyLedger(projectId: string, records: SignedEvidenceRecord[]): Promise<LedgerVerificationResult> {
    if (records.length === 0) {
      return {
        ledgerStatus: LedgerStatus.LEDGER_INVALID,
        verifiedPrefixLength: 0,
        totalEntriesCount: 0,
        records: []
      };
    }

    const verificationResults: EvidenceVerificationResult[] = [];
    let currentStatus = LedgerStatus.LEDGER_VALID;
    let verifiedPrefixLength = 0;

    // Check genesis first
    const genesis = records[0];
    if (
      genesis.payload.recordType !== 'GENESIS' ||
      genesis.payload.sequenceNumber !== 0 ||
      genesis.payload.previousEntryHash !== null ||
      genesis.payload.entryId !== 'GENESIS' ||
      genesis.payload.ledgerId !== `ledger-${projectId}`
    ) {
      return {
        ledgerStatus: LedgerStatus.LEDGER_INVALID,
        verifiedPrefixLength: 0,
        totalEntriesCount: records.length,
        records: []
      };
    }

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      // Verify sequence number
      if (record.payload.sequenceNumber !== i) {
        verificationResults.push({
          entryId: record.payload.entryId,
          signatureStatus: 'SIGNATURE_INVALID',
          trustStatus: TrustStatus.KEY_UNKNOWN,
          artifactStatus: 'NOT_VERIFIED'
        });
        currentStatus = LedgerStatus.LEDGER_INVALID;
        break;
      }

      // Verify previous hash chain
      if (i > 0) {
        const prev = records[i - 1];
        if (record.payload.previousEntryHash !== prev.recordHash) {
          verificationResults.push({
            entryId: record.payload.entryId,
            signatureStatus: 'SIGNATURE_INVALID',
            trustStatus: TrustStatus.KEY_UNKNOWN,
            artifactStatus: 'NOT_VERIFIED'
          });
          currentStatus = LedgerStatus.LEDGER_INVALID;
          break;
        }
      }

      // Re-hash and verify local payloadHash and recordHash integrity
      const calculatedPayloadHash = this.builder.hashPayload(record.payload);
      if (calculatedPayloadHash !== record.payloadHash) {
        verificationResults.push({
          entryId: record.payload.entryId,
          signatureStatus: 'SIGNATURE_INVALID',
          trustStatus: TrustStatus.KEY_UNKNOWN,
          artifactStatus: 'NOT_VERIFIED'
        });
        currentStatus = LedgerStatus.LEDGER_INVALID;
        break;
      }

      const calculatedRecord = this.builder.assembleRecord(record.payload, record.payloadHash, record.signature);
      if (calculatedRecord.recordHash !== record.recordHash) {
        verificationResults.push({
          entryId: record.payload.entryId,
          signatureStatus: 'SIGNATURE_INVALID',
          trustStatus: TrustStatus.KEY_UNKNOWN,
          artifactStatus: 'NOT_VERIFIED'
        });
        currentStatus = LedgerStatus.LEDGER_INVALID;
        break;
      }

      // Verify cryptographic signature
      let signatureStatus: 'SIGNATURE_VALID' | 'SIGNATURE_INVALID' = 'SIGNATURE_VALID';
      try {
        const sigValid = await this.signatureProvider.verify(record.payloadHash, record.signature);
        if (!sigValid) {
          signatureStatus = 'SIGNATURE_INVALID';
        }
      } catch {
        signatureStatus = 'SIGNATURE_INVALID';
      }

      // Verify trust scope
      const trustStatus = await this.trustResolver.verifyKeyTrust(record.signature.keyReference, projectId);

      // Verify artifact hashes
      let artifactStatus: 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID' | 'NOT_VERIFIED' = 'ARTIFACTS_VALID';
      if (record.payload.recordType === 'RUN_EVIDENCE') {
        const checkBaseline = await this.artifactResolver.verifyArtifactHash(
          record.payload.candidateId,
          record.payload.candidateHash
        );
        if (checkBaseline === 'ARTIFACTS_INVALID') {
          artifactStatus = 'ARTIFACTS_INVALID';
        } else if (checkBaseline === 'NOT_VERIFIED') {
          artifactStatus = 'NOT_VERIFIED';
        }
      }

      verificationResults.push({
        entryId: record.payload.entryId,
        signatureStatus,
        trustStatus,
        artifactStatus
      });

      if (signatureStatus === 'SIGNATURE_INVALID') {
        currentStatus = LedgerStatus.LEDGER_INVALID;
        break;
      }

      verifiedPrefixLength++;
    }

    // If verification broke before processing all records, it is a corrupted chain
    if (verifiedPrefixLength < records.length) {
      currentStatus = LedgerStatus.LEDGER_INVALID;
    } else {
      // Check trust issues
      const hasRevoked = verificationResults.some(r => r.trustStatus === TrustStatus.KEY_REVOKED);
      const hasUnknown = verificationResults.some(r => r.trustStatus === TrustStatus.KEY_UNKNOWN);
      const hasExpired = verificationResults.some(r => r.trustStatus === TrustStatus.KEY_EXPIRED);
      const hasOutOfScope = verificationResults.some(r => r.trustStatus === TrustStatus.KEY_OUT_OF_SCOPE);

      if (hasRevoked) {
        currentStatus = LedgerStatus.LEDGER_INVALID;
      } else if (hasUnknown || hasOutOfScope) {
        currentStatus = LedgerStatus.LEDGER_TRUST_UNKNOWN;
      } else if (verificationResults.some(r => r.artifactStatus === 'NOT_VERIFIED')) {
        currentStatus = LedgerStatus.LEDGER_ARTIFACTS_UNAVAILABLE;
      }
    }

    return {
      ledgerStatus: currentStatus,
      verifiedPrefixLength,
      totalEntriesCount: records.length,
      records: verificationResults
    };
  }
}
