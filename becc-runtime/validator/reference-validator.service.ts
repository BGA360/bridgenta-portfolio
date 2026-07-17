import { ISubValidator } from './types.js';
import { AssessmentContext, ValidationFinding, ValidationEvidence } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { createHash } from 'node:crypto';

export class ReferenceValidatorService implements ISubValidator {
  public readonly name = 'ReferenceValidator';

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

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    const lines = candidateContent.split('\n');

    while ((match = linkRegex.exec(candidateContent)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2].trim();

      // Find line number of link
      let matchedLine = 1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(match[0])) {
          matchedLine = i + 1;
          break;
        }
      }

      // Check scheme safety
      const lowerUrl = linkUrl.toLowerCase();
      if (lowerUrl.startsWith('http://')) {
        const findingId = this.generateFindingId(context.targetDocument.path, `UNSAFE-SCHEME-${linkUrl}`, 'References');
        findings.push({
          id: findingId,
          category: 'References',
          severity: 'warning',
          message: `Unsafe reference URI scheme detected: "${linkUrl}". Use "https://" instead.`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path,
            startLine: matchedLine,
            endLine: matchedLine
          },
          recommendation: 'Change scheme to https:// or use relative links.'
        });
      } else if (lowerUrl.startsWith('javascript:')) {
        const findingId = this.generateFindingId(context.targetDocument.path, `BLOCKED-SCHEME-${linkUrl}`, 'References');
        findings.push({
          id: findingId,
          category: 'References',
          severity: 'error',
          message: `Forbidden javascript link URI detected: "${linkUrl}"`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path,
            startLine: matchedLine,
            endLine: matchedLine
          },
          recommendation: 'Remove javascript protocol references.'
        });
      } else if (lowerUrl.includes('..') || lowerUrl.startsWith('/')) {
        // Path traversal in relative link check
        const findingId = this.generateFindingId(context.targetDocument.path, `TRAVERSAL-LINK-${linkUrl}`, 'References');
        findings.push({
          id: findingId,
          category: 'References',
          severity: 'error',
          message: `Relative reference traverses containment bounds or uses absolute pathing: "${linkUrl}"`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path,
            startLine: matchedLine,
            endLine: matchedLine
          },
          recommendation: 'Ensure relative path is relative-contained and does not start with "/" or traverse upwards.'
        });
      }
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
