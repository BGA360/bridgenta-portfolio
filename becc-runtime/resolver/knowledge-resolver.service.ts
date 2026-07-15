import path from 'node:path';
import { IKnowledgeResolver } from '../orchestrator/types.js';
import { AssessmentContext } from '../shared/types.js';
import { IResolvedKnowledge, IResolverConfig, IRulePointer } from './types.js';
import { CrawlerService } from './crawler.service.js';
import { DocumentParserService } from './document-parser.service.js';
import { RuleExtractorService } from './rule-extractor.service.js';
import { OverrideResolverService } from './override-resolver.service.js';
import { MissingEntryPointException } from './exceptions.js';

export class KnowledgeResolverService implements IKnowledgeResolver {
  private readonly crawler: CrawlerService;
  private readonly parser: DocumentParserService;
  private readonly extractor: RuleExtractorService;
  private readonly overrideResolver: OverrideResolverService;
  private readonly config: IResolverConfig;

  constructor(
    config?: Partial<IResolverConfig>,
    crawler = new CrawlerService(),
    parser = new DocumentParserService(),
    extractor = new RuleExtractorService(),
    overrideResolver = new OverrideResolverService()
  ) {
    this.crawler = crawler;
    this.parser = parser;
    this.extractor = extractor;
    this.overrideResolver = overrideResolver;

    const defaultRoot = path.resolve(process.cwd(), 'docs');
    this.config = {
      knowledgeRoots: config?.knowledgeRoots || [defaultRoot],
      knowledgeEntryPoint: config?.knowledgeEntryPoint || path.join(defaultRoot, 'START_HERE.md'),
      exclusionPaths: config?.exclusionPaths || [
        path.join(defaultRoot, 'examples'),
        path.join(defaultRoot, 'templates')
      ],
      permittedFileTypes: config?.permittedFileTypes || ['.md'],
      traversalDepthLimit: typeof config?.traversalDepthLimit === 'number' ? config.traversalDepthLimit : 10
    };
  }

  /**
   * Resolves, crawls, parses, and resolves overriding precedence of active rules.
   */
  public async resolve(context: AssessmentContext): Promise<IResolvedKnowledge> {
    const roots = this.config.knowledgeRoots;
    const entryPoint = this.config.knowledgeEntryPoint;

    try {
      this.crawler.readFile(entryPoint, roots);
    } catch (err) {
      throw new MissingEntryPointException(path.basename(entryPoint));
    }

    const candidateFiles: string[] = [];
    for (const root of roots) {
      const files = this.crawler.discoverFiles(root, this.config);
      candidateFiles.push(...files);
    }

    const uniqueFiles = Array.from(new Set(candidateFiles));
    const allExtractedRules: IRulePointer[] = [];
    const vocabularyList: any[] = [];

    for (const file of uniqueFiles) {
      const fileContent = this.crawler.readFile(file, roots);
      const { metadata, contentBody } = this.parser.parseMetadata(fileContent, file);

      const isActive = this.parser.isDocumentActive(metadata);
      if (!isActive) {
        continue;
      }

      const isVocabularySource = path.basename(file).toLowerCase() === 'shared-vocabulary.md';
      if (isVocabularySource) {
        const terms = this.extractor.extractVocabulary(contentBody);
        vocabularyList.push(...terms);
      }

      const rules = this.extractor.extractRules(contentBody, file, metadata);
      allExtractedRules.push(...rules);
    }

    const { resolvedPointers, evidence } = this.overrideResolver.resolveOverrides(allExtractedRules);

    const resolvedKnowledge: IResolvedKnowledge = {
      sessionId: context.assessmentId,
      rulePointers: Object.freeze(resolvedPointers),
      vocabularyList: Object.freeze(vocabularyList),
      resolutionEvidence: Object.freeze(evidence),
      timestamp: new Date().toISOString()
    };

    return Object.freeze(resolvedKnowledge);
  }
}
