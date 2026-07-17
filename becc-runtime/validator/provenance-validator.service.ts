import { ISubValidator } from './types.js';
import { AssessmentContext, ValidationFinding, ValidationEvidence } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { createHash } from 'node:crypto';

export class ProvenanceValidatorService implements ISubValidator {
  public readonly name = 'ProvenanceValidator';

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

    const meta = diff.metadata;
    if (!meta) {
      return { findings, evidence };
    }

    const bundleRuleIds = new Set(bundle.rules.map(r => r.ruleId));

    // Verify includedRuleIds in metadata exist in the active bundle
    if (meta.includedRuleIds) {
      for (const ruleId of meta.includedRuleIds) {
        if (!bundleRuleIds.has(ruleId)) {
          const findingId = this.generateFindingId(context.targetDocument.path, `UNKNOWN-INCLUDED-RULE-${ruleId}`, 'Provenance');
          findings.push({
            id: findingId,
            category: 'Provenance',
            severity: 'error',
            message: `Execution envelope refers to unknown rule ID: "${ruleId}"`,
            affectedLocation: { coordinateSystem: 'diff', filePath: context.targetDocument.path }
          });
        }
      }
    }

    // Verify providerReferencedRuleIds in metadata exist in the active bundle
    if (meta.providerReferencedRuleIds) {
      for (const ruleId of meta.providerReferencedRuleIds) {
        if (!bundleRuleIds.has(ruleId)) {
          const findingId = this.generateFindingId(context.targetDocument.path, `UNKNOWN-REFERENCED-RULE-${ruleId}`, 'Provenance');
          findings.push({
            id: findingId,
            category: 'Provenance',
            severity: 'error',
            message: `Provider response references unknown rule ID: "${ruleId}"`,
            affectedLocation: { coordinateSystem: 'diff', filePath: context.targetDocument.path }
          });
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
