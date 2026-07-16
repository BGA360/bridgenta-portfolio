import { ISubValidator } from './types.js';
import { AssessmentContext, ValidationFinding, ValidationEvidence } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { createHash } from 'node:crypto';

export class CompletenessValidatorService implements ISubValidator {
  public readonly name = 'CompletenessValidator';

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

    // 1. Extract headings from baseline and candidate
    const headingRegex = /^(#+)\s+(.+)$/gm;
    
    const getHeadings = (text: string) => {
      const headings: { level: number; text: string; raw: string; line: number }[] = [];
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const match = line.match(/^(#+)\s+(.+)$/);
        if (match) {
          headings.push({
            level: match[1].length,
            text: match[2].trim(),
            raw: line,
            line: i + 1
          });
        }
      }
      return headings;
    };

    const baselineHeadings = getHeadings(baselineContent);
    const candidateHeadings = getHeadings(candidateContent);

    // 2. Protected Section Deletion Check:
    // If a heading existed in baseline, it must not be removed in the candidate.
    for (const bh of baselineHeadings) {
      const stillExists = candidateHeadings.some(
        ch => ch.text.toLowerCase() === bh.text.toLowerCase() && ch.level === bh.level
      );
      if (!stillExists) {
        const findingId = this.generateFindingId(context.targetDocument.path, `PROTECTED-SECTION-DELETED-${bh.text}`, 'Completeness');
        findings.push({
          id: findingId,
          category: 'Completeness',
          severity: 'error',
          message: `Protected section deleted: "${bh.raw}"`,
          affectedLocation: {
            coordinateSystem: 'baseline',
            filePath: context.targetDocument.path,
            startLine: bh.line,
            endLine: bh.line
          },
          recommendation: `Restore the section "${bh.raw}" to preserve document integrity.`
        });
      }
    }

    // 3. Unique Section Check:
    // Ensure headings at the same level are not duplicated in the candidate.
    const seenHeadings = new Set<string>();
    for (const ch of candidateHeadings) {
      const key = `${ch.level}:${ch.text.toLowerCase()}`;
      if (seenHeadings.has(key)) {
        const findingId = this.generateFindingId(context.targetDocument.path, `DUPLICATE-SECTION-${key}`, 'Completeness');
        findings.push({
          id: findingId,
          category: 'Completeness',
          severity: 'warning',
          message: `Duplicate section heading detected: "${ch.raw}"`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path,
            startLine: ch.line,
            endLine: ch.line
          },
          recommendation: `Rename or merge the duplicate heading "${ch.raw}".`
        });
      } else {
        seenHeadings.add(key);
      }
    }

    // 4. Empty Section Check:
    // Ensure headings are not followed immediately by another heading or end of file (with only whitespace in between).
    const candidateLines = candidateContent.split('\n');
    for (let i = 0; i < candidateHeadings.length; i++) {
      const ch = candidateHeadings[i];
      const nextHeadingLine = i + 1 < candidateHeadings.length ? candidateHeadings[i + 1].line - 1 : candidateLines.length;

      let hasContent = false;
      for (let j = ch.line; j < nextHeadingLine; j++) {
        const lineText = (candidateLines[j] || '').trim();
        if (lineText !== '' && !lineText.startsWith('#')) {
          hasContent = true;
          break;
        }
      }

      if (!hasContent) {
        const findingId = this.generateFindingId(context.targetDocument.path, `EMPTY-SECTION-${ch.text}`, 'Completeness');
        findings.push({
          id: findingId,
          category: 'Completeness',
          severity: 'warning',
          message: `Empty section detected: "${ch.raw}" has no body content.`,
          affectedLocation: {
            coordinateSystem: 'candidate',
            filePath: context.targetDocument.path,
            startLine: ch.line,
            endLine: ch.line
          },
          recommendation: `Add content to section "${ch.raw}" or remove it if not required.`
        });
      }
    }

    // 5. Check if any rule demands a required section
    for (const rule of bundle.rules) {
      if (/must contain a.*section/i.test(rule.content) || /requires a.*section/i.test(rule.content)) {
        // Extract section name if possible from body, or just verify if the rule ID is noted
        // As a generic fallback, if the rule body mentions a heading in quotes, e.g. "Verification Plan", check for it.
        const match = rule.content.match(/"([^"]+)" section/i) || rule.content.match(/section "([^"]+)"/i);
        if (match) {
          const reqHeading = match[1].toLowerCase();
          const hasHeading = candidateHeadings.some(ch => ch.text.toLowerCase().includes(reqHeading));
          if (!hasHeading) {
            const findingId = this.generateFindingId(context.targetDocument.path, `REQUIRED-SECTION-MISSING-${reqHeading}`, 'Completeness');
            findings.push({
              id: findingId,
              category: 'Completeness',
              severity: 'error',
              message: `Required section missing: "${match[1]}" (originating from rule [${rule.ruleId}])`,
              affectedLocation: {
                coordinateSystem: 'candidate',
                filePath: context.targetDocument.path
              },
              originatingRuleId: rule.ruleId,
              recommendation: `Add the required section "${match[1]}".`
            });
          }
        }
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
