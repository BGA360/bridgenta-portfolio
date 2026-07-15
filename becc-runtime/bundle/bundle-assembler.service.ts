import { ICompiledRule, IVocabularyTerm, IResolutionEvidence } from './types.js';
import { IRulePointer, IVocabularyTerm as IResolverVocabularyTerm, IResolutionEvidence as IResolverEvidence } from '../resolver/types.js';
import { ContentLoaderService } from './content-loader.service.js';
import { RuleExtractorService } from '../resolver/rule-extractor.service.js';
import { StalePointerException } from './exceptions.js';

export class BundleAssemblerService {
  private readonly loader: ContentLoaderService;
  private readonly ruleExtractor: RuleExtractorService;

  constructor(loader = new ContentLoaderService(), ruleExtractor = new RuleExtractorService()) {
    this.loader = loader;
    this.ruleExtractor = ruleExtractor;
  }

  /**
   * Materializes rules, verifies content hashes, and sorts collections deterministically.
   */
  public assemble(
    rulePointers: readonly IRulePointer[],
    resolverVocabulary: readonly IResolverVocabularyTerm[],
    resolverEvidence: readonly IResolverEvidence[],
    roots: readonly string[]
  ): {
    rules: ICompiledRule[];
    vocabulary: IVocabularyTerm[];
    evidence: IResolutionEvidence[];
  } {
    const rules: ICompiledRule[] = [];
    for (const ptr of rulePointers) {
      const rawContent = this.loader.loadLines(ptr.filePath, ptr.startLine, ptr.endLine, roots);
      const lines = rawContent.split(/\r?\n/);
      if (lines.length === 0) {
        throw new StalePointerException(ptr.ruleId, 'Rule content is empty.');
      }

      const firstLine = lines[0].trim();
      const cleanHeading = ptr.heading.trim();
      if (!firstLine.includes(cleanHeading)) {
        throw new StalePointerException(ptr.ruleId, `Heading mismatch. Expected heading containing '${cleanHeading}' but found '${firstLine}'`);
      }

      const bodyText = lines.slice(1).join('\n');
      const calculatedHash = this.ruleExtractor.calculateContentHash(bodyText);
      if (calculatedHash !== ptr.contentHash) {
        throw new StalePointerException(ptr.ruleId, `Content hash mismatch. Expected hash '${ptr.contentHash}' but calculated '${calculatedHash}'`);
      }

      rules.push({
        ruleId: ptr.ruleId,
        heading: ptr.heading,
        content: bodyText,
        precedenceTier: ptr.precedenceTier,
        precedenceOrder: ptr.precedenceOrder,
        filePath: ptr.filePath,
        startLine: ptr.startLine,
        endLine: ptr.endLine,
        contentHash: ptr.contentHash
      });
    }

    const sortedRules = [...rules].sort((a, b) => {
      if (a.precedenceOrder !== b.precedenceOrder) {
        return a.precedenceOrder - b.precedenceOrder;
      }
      return a.ruleId.localeCompare(b.ruleId);
    });

    const vocabulary: IVocabularyTerm[] = resolverVocabulary.map(v => ({
      term: v.term,
      classification: v.classification as 'forbidden' | 'preferred' | 'required',
      definition: v.definition
    }));
    const sortedVocabulary = [...vocabulary].sort((a, b) => a.term.localeCompare(b.term));

    const evidence: IResolutionEvidence[] = resolverEvidence.map(e => ({
      ruleId: e.ruleId,
      selectedSourcePath: e.selectedSourcePath,
      overriddenSourcesPaths: e.overriddenSourcesPaths,
      appliedPrecedenceTier: e.appliedPrecedenceTier,
      appliedPrecedenceOrder: e.appliedPrecedenceOrder
    }));
    const sortedEvidence = [...evidence].sort((a, b) => a.ruleId.localeCompare(b.ruleId));

    return {
      rules: sortedRules,
      vocabulary: sortedVocabulary,
      evidence: sortedEvidence
    };
  }
}
