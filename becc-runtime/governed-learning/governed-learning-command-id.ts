import { createHash } from 'node:crypto';

/**
 * Derives a deterministic Governed Learning Command ID for a given BECC finding escalation step.
 *
 * Guaranteed Invariants:
 * 1. Same logical finding + command type + pipeline step + escalation version → Identical commandId
 * 2. Different pipeline step (e.g. DraftObservation vs AttachEvidence) → Different commandId
 * 3. Stable across retries to ensure Stage 8 idempotency reuse without random ID drift.
 */
export function deriveGovernedLearningCommandId(
  findingId: string,
  commandType: string,
  pipelineStep: string,
  escalationVersion: string = '1.0.0'
): string {
  if (!findingId || !findingId.trim()) {
    throw new Error('findingId must not be empty');
  }
  if (!commandType || !commandType.trim()) {
    throw new Error('commandType must not be empty');
  }
  if (!pipelineStep || !pipelineStep.trim()) {
    throw new Error('pipelineStep must not be empty');
  }

  const rawString = `${findingId.trim()}:${commandType.trim()}:${pipelineStep.trim()}:${escalationVersion.trim()}`;
  const digestHex = createHash('sha256').update(rawString, 'utf8').digest('hex').slice(0, 32);

  return `cmd_becc_${digestHex}`;
}
