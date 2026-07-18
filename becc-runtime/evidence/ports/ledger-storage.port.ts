import { SignedEvidenceRecord, LedgerStatus } from '../types.js';

export interface ILedgerStoragePort {
  initializeLedger(projectId: string, genesisRecord: SignedEvidenceRecord): Promise<void>;
  ledgerExists(projectId: string): Promise<boolean>;
  readLedger(projectId: string): Promise<SignedEvidenceRecord[]>;
  appendRecord(projectId: string, record: SignedEvidenceRecord): Promise<void>;
  getLedgerStatus(projectId: string): Promise<LedgerStatus>;
  
  // Lock coordination
  acquireLock(projectId: string): Promise<string>; // returns lockId/ownerToken
  releaseLock(projectId: string, ownerToken: string): Promise<void>;
}
