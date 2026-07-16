import path from 'node:path';
import { IKnowledgeBundle, IBundleConfig } from './types.js';
import { IResolvedKnowledge } from '../resolver/types.js';
import { BundleAssemblerService } from './bundle-assembler.service.js';
import { BundleValidatorService } from './bundle-validator.service.js';
import { BundleIntegrityService } from './bundle-integrity.service.js';
import { MissingResolvedKnowledgeException, OversizedBundleException } from './exceptions.js';

export class KnowledgeBundleBuilderService {
  private readonly assembler: BundleAssemblerService;
  private readonly validator: BundleValidatorService;
  private readonly integrity: BundleIntegrityService;
  private readonly config: IBundleConfig;

  constructor(
    config?: IBundleConfig,
    assembler = new BundleAssemblerService(),
    validator = new BundleValidatorService(),
    integrity = new BundleIntegrityService()
  ) {
    this.assembler = assembler;
    this.validator = validator;
    this.integrity = integrity;
    this.config = config || {};
  }

  /**
   * Compiles the canonical, immutable Knowledge Bundle from resolved references.
   */
  public build(resolved: IResolvedKnowledge): IKnowledgeBundle {
    if (!resolved) {
      throw new MissingResolvedKnowledgeException();
    }

    const defaultRoot = path.resolve(process.cwd(), 'docs');
    const roots = this.config.knowledgeRoots || [defaultRoot];

    const { rules, vocabulary, evidence } = this.assembler.assemble(
      resolved.rulePointers,
      resolved.vocabularyList,
      resolved.resolutionEvidence,
      roots
    );

    this.validator.validate(rules, vocabulary, evidence);

    const bundleHash = this.integrity.calculateHash(resolved.sessionId, rules, vocabulary, evidence);

    const tempBundle = {
      sessionId: resolved.sessionId,
      schemaVersion: '2.0.0',
      rules,
      vocabulary,
      resolutionEvidence: evidence,
      integrity: { bundleHash },
      buildMetadata: {
        timestamp: new Date().toISOString(),
        ruleCount: rules.length,
        sizeBytes: 0,
        environment: this.config.environment || 'production'
      }
    };
    const sizeBytes = Buffer.byteLength(JSON.stringify(tempBundle), 'utf8');

    const maxSizeBytes = this.config.maxSizeBytes || 150 * 1024;
    if (sizeBytes > maxSizeBytes) {
      throw new OversizedBundleException(sizeBytes, maxSizeBytes);
    }

    const bundle: IKnowledgeBundle = {
      sessionId: resolved.sessionId,
      schemaVersion: '2.0.0',
      rules: Object.freeze(rules.map(r => Object.freeze(r))),
      vocabulary: Object.freeze(vocabulary.map(v => Object.freeze(v))),
      resolutionEvidence: Object.freeze(evidence.map(e => Object.freeze(e))),
      integrity: Object.freeze({ bundleHash }),
      buildMetadata: Object.freeze({
        timestamp: new Date().toISOString(),
        ruleCount: rules.length,
        sizeBytes,
        environment: this.config.environment || 'production'
      })
    };

    return Object.freeze(bundle);
  }
}
