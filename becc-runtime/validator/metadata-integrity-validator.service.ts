import { ISubValidator } from './types.js';
import { AssessmentContext, ValidationFinding, ValidationEvidence } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { createHash } from 'node:crypto';

export class MetadataIntegrityValidatorService implements ISubValidator {
  public readonly name = 'MetadataIntegrityValidator';

  public validate(
    context: AssessmentContext,
    diff: any,
    bundle: IKnowledgeBundle,
    candidateContent: string,
    baselineContent: string
  ): {
    readonly findings: readonly ValidationFinding[];
    readonly evidence: readonly ValidationEvidence[];
  } {
    const findings: ValidationFinding[] = [];
    const evidence: ValidationEvidence[] = [];

    const comm = diff.communication;
    if (!comm) {
      return { findings, evidence };
    }

    // Session Correlation Check
    if (comm.sessionId !== context.assessmentId) {
      const findingId = this.generateFindingId(context.targetDocument.path, 'SESSION-MISMATCH', 'Integrity');
      findings.push({
        id: findingId,
        category: 'Integrity',
        severity: 'error',
        message: `Candidate session correlation ID mismatch. Expected: "${context.assessmentId}", Found: "${comm.sessionId}"`,
        affectedLocation: { coordinateSystem: 'diff', filePath: comm.targetFilePath }
      });
    }

    // Baseline Hash Verification
    // Calculate hash of baselineContent passed from Orchestrator and check it matches context target document hash.
    const calculatedBaselineHash = createHash('sha256').update(baselineContent).digest('hex');
    if (calculatedBaselineHash !== context.targetDocument.hash) {
      const findingId = this.generateFindingId(context.targetDocument.path, 'BASELINE-HASH-MISMATCH', 'Integrity');
      findings.push({
        id: findingId,
        category: 'Integrity',
        severity: 'error',
        message: `Baseline target document hash drift detected. Context: "${context.targetDocument.hash}", Content: "${calculatedBaselineHash}"`,
        affectedLocation: { coordinateSystem: 'baseline', filePath: context.targetDocument.path }
      });
    }

    return {
      findings: Object.freeze(findings),
      evidence: Object.freeze(evidence)
    };
  }

  private generateFindingId(targetPath: string, code: string, category: string): string {
    return createHash('sha256')
      .update(`${targetPath}:${code}:${category}`)
      .digest('hex');
  }
}
