import { ISubValidator } from './types.js';
import { AssessmentContext, ValidationFinding, ValidationEvidence } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { createHash } from 'node:crypto';

export class TerminologyValidatorService implements ISubValidator {
  public readonly name = 'TerminologyValidator';

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

    if (!bundle.vocabulary || !Array.isArray(bundle.vocabulary)) {
      return { findings, evidence };
    }

    // Sanitize markdown to prevent matches in code blocks, blockquotes, and link targets
    const cleanText = candidateContent
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`\n]+`/g, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/^\s*>.*$/gm, '');

    for (const termItem of bundle.vocabulary) {
      const term = termItem.term;
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Respect word boundaries for alphabetical terms
      const regex = /^[a-zA-Z0-9_]+$/.test(term)
        ? new RegExp(`\\b${escapedTerm}\\b`, 'i')
        : new RegExp(escapedTerm, 'i');

      const isPresent = regex.test(cleanText);

      if (termItem.classification === 'forbidden' && isPresent) {
        const findingId = this.generateFindingId(context.targetDocument.path, `FORBIDDEN-${term}`, 'Terminology');
        
        // Find line number of match
        const lines = cleanText.split('\n');
        let matchedLine = 1;
        for (let i = 0; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            matchedLine = i + 1;
            break;
          }
        }

        findings.push({
          id: findingId,
          category: 'Terminology',
          severity: 'error',
          message: `Forbidden terminology detected: "${term}"`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path,
            startLine: matchedLine,
            endLine: matchedLine
          },
          recommendation: termItem.definition || 'Remove the forbidden term.'
        });

        // Add minimized evidence log
        const rawExcerpt = lines[matchedLine - 1] || '';
        const excerpt = rawExcerpt.substring(0, 100).trim();
        evidence.push({
          findingId,
          location: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path,
            startLine: matchedLine,
            endLine: matchedLine
          },
          expectedCondition: `Absence of forbidden term "${term}"`,
          observedCondition: `Found forbidden term "${term}" in: "${excerpt}"`,
          excerptHash: createHash('sha256').update(excerpt).digest('hex'),
          excerpt: context.publicationClassification === 'Public' ? undefined : excerpt
        });
      } else if (termItem.classification === 'required' && !isPresent) {
        const findingId = this.generateFindingId(context.targetDocument.path, `REQUIRED-MISSING-${term}`, 'Terminology');
        findings.push({
          id: findingId,
          category: 'Terminology',
          severity: 'error',
          message: `Required terminology missing from document: "${term}"`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path
          },
          recommendation: termItem.definition || `Include the required term "${term}".`
        });
      } else if (termItem.classification === 'preferred' && !isPresent) {
        // Preferred terms absent can be logged as warning/info
        const findingId = this.generateFindingId(context.targetDocument.path, `PREFERRED-MISSING-${term}`, 'Terminology');
        findings.push({
          id: findingId,
          category: 'Terminology',
          severity: 'warning',
          message: `Preferred terminology absent: "${term}"`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path
          },
          recommendation: termItem.definition || `Consider using the preferred term "${term}".`
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
