import path from 'node:path';
import { IRulePointer, IResolutionEvidence } from './types.js';
import { ConflictingOverridesException, DuplicateRuleException } from './exceptions.js';

export class OverrideResolverService {
  /**
   * Resolves conflicts among extracted rules using absolute precedence ordering.
   */
  public resolveOverrides(allPointers: IRulePointer[]): {
    resolvedPointers: IRulePointer[];
    evidence: IResolutionEvidence[];
  } {
    const groups = new Map<string, IRulePointer[]>();
    for (const p of allPointers) {
      const list = groups.get(p.ruleId) || [];
      list.push(p);
      groups.set(p.ruleId, list);
    }

    const resolvedPointers: IRulePointer[] = [];
    const evidence: IResolutionEvidence[] = [];

    for (const [ruleId, pointers] of groups) {
      if (pointers.length === 1) {
        resolvedPointers.push(pointers[0]);
        evidence.push({
          ruleId,
          selectedSourcePath: pointers[0].filePath,
          overriddenSourcesPaths: [],
          appliedPrecedenceTier: pointers[0].precedenceTier,
          appliedPrecedenceOrder: pointers[0].precedenceOrder
        });
        continue;
      }

      // Sort by precedenceOrder ascending (lower number = higher priority)
      pointers.sort((a, b) => a.precedenceOrder - b.precedenceOrder);

      const top = pointers[0];
      const second = pointers[1];

      if (top.precedenceOrder === second.precedenceOrder) {
        if (top.filePath === second.filePath) {
          throw new DuplicateRuleException(ruleId);
        } else {
          const nameA = path.basename(top.filePath);
          const nameB = path.basename(second.filePath);
          throw new ConflictingOverridesException(ruleId, nameA, nameB);
        }
      }

      resolvedPointers.push(top);

      const overriddenSources = pointers.slice(1).map(p => p.filePath);
      evidence.push({
        ruleId,
        selectedSourcePath: top.filePath,
        overriddenSourcesPaths: overriddenSources,
        appliedPrecedenceTier: top.precedenceTier,
        appliedPrecedenceOrder: top.precedenceOrder
      });
    }

    return { resolvedPointers, evidence };
  }
}
