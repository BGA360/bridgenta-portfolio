import { ICompiledRule, IVocabularyTerm, IResolutionEvidence } from './types.js';
import {
  EmptyBundleException,
  DuplicateRuleException,
  MalformedVocabularyException,
  ConflictingVocabularyException,
  MalformedEvidenceException
} from './exceptions.js';

export class BundleValidatorService {
  /**
   * Performs structural validation audits on the assembled bundle datasets.
   */
  public validate(
    rules: readonly ICompiledRule[],
    vocabulary: readonly IVocabularyTerm[],
    evidence: readonly IResolutionEvidence[]
  ): void {
    if (rules.length === 0) {
      throw new EmptyBundleException();
    }

    const seenRuleIds = new Set<string>();
    for (const rule of rules) {
      if (seenRuleIds.has(rule.ruleId)) {
        throw new DuplicateRuleException(rule.ruleId);
      }
      seenRuleIds.add(rule.ruleId);
    }

    const seenTerms = new Map<string, 'forbidden' | 'preferred' | 'required'>();
    for (const item of vocabulary) {
      if (!item.term || !item.term.trim()) {
        throw new MalformedVocabularyException(item.term || 'unnamed', 'Vocabulary term must not be empty.');
      }
      if (!item.classification || !['forbidden', 'preferred', 'required'].includes(item.classification)) {
        throw new MalformedVocabularyException(item.term, `Invalid classification: '${item.classification}'`);
      }

      const cleanTerm = item.term.trim().toLowerCase();
      if (seenTerms.has(cleanTerm)) {
        const prevClass = seenTerms.get(cleanTerm);
        if (prevClass !== item.classification) {
          throw new ConflictingVocabularyException(item.term, `Term defined with conflicting classifications: '${prevClass}' vs '${item.classification}'`);
        }
      }
      seenTerms.set(cleanTerm, item.classification);
    }

    const ruleIds = new Set(rules.map(r => r.ruleId));
    const seenEvidenceRules = new Set<string>();

    for (const ev of evidence) {
      if (!ev.ruleId) {
        throw new MalformedEvidenceException('unnamed', 'Evidence is missing ruleId.');
      }
      if (seenEvidenceRules.has(ev.ruleId)) {
        throw new MalformedEvidenceException(ev.ruleId, 'Duplicate evidence record.');
      }
      seenEvidenceRules.add(ev.ruleId);

      if (!ruleIds.has(ev.ruleId)) {
        throw new MalformedEvidenceException(ev.ruleId, 'Orphan evidence record with no corresponding compiled rule.');
      }
    }

    for (const rule of rules) {
      if (!seenEvidenceRules.has(rule.ruleId)) {
        throw new MalformedEvidenceException(rule.ruleId, 'Rule is missing its corresponding resolution evidence.');
      }
    }
  }
}
