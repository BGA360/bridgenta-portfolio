import { ILedgerStoragePort } from './ports/ledger-storage.port.js';
import { ISignatureProviderPort } from './ports/signature-provider.port.js';
import { ITrustResolverPort } from './ports/trust-resolver.port.js';
import { IArtifactResolverPort } from './ports/artifact-resolver.port.js';
import { IClockPort } from './ports/clock.port.js';
import { CanonicalEvidenceBuilderService } from './canonical-evidence-builder.service.js';
import { EvidenceContentPolicyService } from './evidence-content-policy.js';
import {
  SignedEvidenceRecord,
  EvidencePayload,
  EvidenceRecordType,
  LedgerStatus,
  TrustStatus,
  EvidenceRecordingPolicy,
  LedgerVerificationResult
} from './types.js';
import { EvidenceIdempotencyConflictException, EvidenceChainConflictException, EvidenceTrustResolutionException } from './exceptions.js';
import { LedgerVerificationService } from './ledger-verification.service.js';
import { createHash } from 'node:crypto';

export interface EvidenceServiceConfig {
  projectId: string;
  keyReference: string;
  recordingPolicy: EvidenceRecordingPolicy;
  hmacSalt: string;
}

export class EvidenceService {
  private builder = new CanonicalEvidenceBuilderService();
  private policyService = new EvidenceContentPolicyService({ redactPaths: true, hmacReviewerIds: true });
  private verifier: LedgerVerificationService;

  constructor(
    private config: EvidenceServiceConfig,
    private storage: ILedgerStoragePort,
    private signatureProvider: ISignatureProviderPort,
    private trustResolver: ITrustResolverPort,
    private artifactResolver: IArtifactResolverPort,
    private clock: IClockPort
  ) {
    this.verifier = new LedgerVerificationService(signatureProvider, trustResolver, artifactResolver);
  }

  public async recordEvidence(params: {
    sessionId: string;
    assessmentId: string;
    candidateId: string;
    baselineHash: string;
    candidateHash: string;
    knowledgeBundleHash: string;
    validationResultId: string;
    validationResultHash: string;
    validationStatus: 'passed' | 'failed' | 'warnings_present';
    humanReviewResultId?: string;
    humanReviewResultHash?: string;
    humanDecision?: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED' | 'ESCALATION_REQUESTED';
    reviewerId?: string;
    finalOutcome: string;
    targetDocumentPath: string;
    parentEntryId?: string;
    recordType?: EvidenceRecordType;
  }): Promise<SignedEvidenceRecord | null> {
    if (this.config.recordingPolicy === EvidenceRecordingPolicy.DISABLED) {
      return null;
    }

    try {
      const projectId = this.config.projectId;
      
      // Acquire Lock
      const token = await this.storage.acquireLock(projectId);

      try {
        // 1. Initialize or Read Ledger
        let records: SignedEvidenceRecord[] = [];
        const exists = await this.storage.ledgerExists(projectId);
        if (exists) {
          records = await this.storage.readLedger(projectId);
        } else {
          // Create signed GENESIS record
          const genesisPayload = this.builder.buildPayload({
            ledgerId: `ledger-${projectId}`,
            entryId: 'GENESIS',
            recordType: EvidenceRecordType.GENESIS,
            sequenceNumber: 0,
            previousEntryHash: null,
            projectId,
            assessmentId: 'GENESIS',
            sessionId: 'GENESIS',
            candidateId: 'GENESIS',
            baselineHash: '0'.repeat(64),
            candidateHash: '0'.repeat(64),
            knowledgeBundleHash: '0'.repeat(64),
            validationResultId: 'GENESIS',
            validationResultHash: '0'.repeat(64),
            finalOutcome: 'GENESIS'
          }, this.clock.now());

          const genesisHash = this.builder.hashPayload(genesisPayload);
          const genesisSig = await this.signatureProvider.sign(genesisHash, this.config.keyReference);
          const genesisRecord = this.builder.assembleRecord(genesisPayload, genesisHash, genesisSig);

          await this.storage.initializeLedger(projectId, genesisRecord);
          records = [genesisRecord];
        }

        // Verify current ledger chain before appending
        const verifyResult = await this.verifier.verifyLedger(projectId, records);
        if (verifyResult.ledgerStatus === LedgerStatus.LEDGER_INVALID) {
          throw new EvidenceChainConflictException('Current ledger chain verification failed.');
        }
        if (verifyResult.ledgerStatus === LedgerStatus.LEDGER_TRUST_UNKNOWN) {
          throw new EvidenceTrustResolutionException('Ledger verification failed due to trust resolution issue.');
        }

        // Also check if the current signing key is trusted
        const currentKeyTrust = await this.trustResolver.verifyKeyTrust(this.config.keyReference, projectId);
        if (currentKeyTrust !== TrustStatus.KEY_TRUSTED) {
          throw new EvidenceTrustResolutionException(`Signing key reference is not trusted: ${currentKeyTrust}`);
        }

        const head = records[records.length - 1];

        // 2. Check Idempotency
        const recordType = params.recordType || EvidenceRecordType.RUN_EVIDENCE;
        const idempotencyKey = createHash('sha256').update(
          projectId +
          params.assessmentId +
          params.sessionId +
          params.candidateId +
          params.validationResultId +
          (params.humanReviewResultId || '') +
          params.finalOutcome +
          recordType
        ).digest('hex');

        // Check if duplicate entry already exists
        const existing = records.find(r => r.payload.entryId === idempotencyKey);
        if (existing) {
          // Verify canonical content matches
          const testPayload = this.builder.buildPayload({
            ledgerId: head.payload.ledgerId,
            entryId: idempotencyKey,
            recordType,
            sequenceNumber: existing.payload.sequenceNumber,
            previousEntryHash: existing.payload.previousEntryHash,
            projectId,
            assessmentId: params.assessmentId,
            sessionId: params.sessionId,
            candidateId: params.candidateId,
            baselineHash: params.baselineHash,
            candidateHash: params.candidateHash,
            knowledgeBundleHash: params.knowledgeBundleHash,
            validationResultId: params.validationResultId,
            validationResultHash: params.validationResultHash,
            humanReviewResultId: params.humanReviewResultId,
            humanReviewResultHash: params.humanReviewResultHash,
            finalOutcome: params.finalOutcome,
            parentEntryId: params.parentEntryId
          }, existing.payload.recordedAt);

          if (this.builder.hashPayload(testPayload) !== existing.payloadHash) {
            throw new EvidenceIdempotencyConflictException('Conflict: Different payload submitted for existing idempotency key.');
          }
          return existing;
        }

        // 3. Construct Next Record
        const nextSequence = head.payload.sequenceNumber + 1;
        const prevHash = head.recordHash;

        const payload = this.builder.buildPayload({
          ledgerId: head.payload.ledgerId,
          entryId: idempotencyKey,
          recordType,
          sequenceNumber: nextSequence,
          previousEntryHash: prevHash,
          projectId,
          assessmentId: params.assessmentId,
          sessionId: params.sessionId,
          candidateId: params.candidateId,
          baselineHash: params.baselineHash,
          candidateHash: params.candidateHash,
          knowledgeBundleHash: params.knowledgeBundleHash,
          validationResultId: params.validationResultId,
          validationResultHash: params.validationResultHash,
          humanReviewResultId: params.humanReviewResultId,
          humanReviewResultHash: params.humanReviewResultHash,
          finalOutcome: params.finalOutcome,
          parentEntryId: params.parentEntryId
        }, this.clock.now());

        const payloadHash = this.builder.hashPayload(payload);
        const signature = await this.signatureProvider.sign(payloadHash, this.config.keyReference);
        const nextRecord = this.builder.assembleRecord(payload, payloadHash, signature);

        // Append record
        await this.storage.appendRecord(projectId, nextRecord);
        return nextRecord;
      } finally {
        // Release Lock
        await this.storage.releaseLock(projectId, token);
      }
    } catch (error) {
      if (this.config.recordingPolicy === EvidenceRecordingPolicy.OPTIONAL) {
        console.warn(`Evidence recording failed under OPTIONAL policy: ${error}`);
        return null;
      }
      throw error;
    }
  }

  public async getVerificationResult(projectId: string): Promise<LedgerVerificationResult> {
    const exists = await this.storage.ledgerExists(projectId);
    if (!exists) {
      return {
        ledgerStatus: LedgerStatus.LEDGER_INVALID,
        verifiedPrefixLength: 0,
        totalEntriesCount: 0,
        records: []
      };
    }
    const records = await this.storage.readLedger(projectId);
    return this.verifier.verifyLedger(projectId, records);
  }
}
