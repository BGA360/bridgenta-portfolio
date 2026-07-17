import { ISubValidator } from './types.js';
import { AssessmentContext, ValidationFinding, ValidationEvidence } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { createHash } from 'node:crypto';

export class StructureValidatorService implements ISubValidator {
  public readonly name = 'StructureValidator';

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

    // Path traversal check
    const normalizedPath = (comm.targetFilePath || '').replace(/\\/g, '/');
    if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
      const findingId = this.generateFindingId(context.targetDocument.path, 'PATH-TRAVERSAL', 'Structure');
      findings.push({
        id: findingId,
        category: 'Structure',
        severity: 'error',
        message: `Path traversal detected in target file path: ${comm.targetFilePath}`,
        affectedLocation: { coordinateSystem: 'diff', filePath: comm.targetFilePath }
      });
    }

    // Diff path matches context path
    if (comm.targetFilePath !== context.targetDocument.path) {
      const findingId = this.generateFindingId(context.targetDocument.path, 'PATH-MISMATCH', 'Structure');
      findings.push({
        id: findingId,
        category: 'Structure',
        severity: 'error',
        message: `Target file path mismatch. Expected: ${context.targetDocument.path}, Found: ${comm.targetFilePath}`,
        affectedLocation: { coordinateSystem: 'diff', filePath: comm.targetFilePath }
      });
    }

    // Check for renames or mode changes
    if (comm.diffContent.includes('rename from') || comm.diffContent.includes('rename to') || comm.diffContent.includes('new file mode')) {
      const findingId = this.generateFindingId(context.targetDocument.path, 'UNSUPPORTED-OP', 'Structure');
      findings.push({
        id: findingId,
        category: 'Structure',
        severity: 'error',
        message: 'File rename, creation, or deletion operations are not authorized.',
        affectedLocation: { coordinateSystem: 'diff', filePath: comm.targetFilePath }
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
