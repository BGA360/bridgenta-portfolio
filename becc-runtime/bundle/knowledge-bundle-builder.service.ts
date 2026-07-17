import path from 'node:path';
import { createHash } from 'node:crypto';
import { IKnowledgeBundle, IBundleConfig } from './types.js';
import { IResolvedKnowledge } from '../resolver/types.js';
import { BundleAssemblerService } from './bundle-assembler.service.js';
import { BundleValidatorService } from './bundle-validator.service.js';
import { BundleIntegrityService } from './bundle-integrity.service.js';
import { MissingResolvedKnowledgeException, OversizedBundleException, InvalidObligationMetadataException } from './exceptions.js';
import { HumanReviewObligationDefinition } from '../shared/types.js';

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

    const obligations: HumanReviewObligationDefinition[] = [];
    for (const rule of rules) {
      const match = rule.content.match(/<!--\s*HUMAN_REVIEW_OBLIGATION\r?\n([\s\S]*?)\r?\n\s*-->/);
      if (match) {
        const block = match[1];
        const lines = block.split(/\r?\n/);
        const meta: any = { ruleId: rule.ruleId };
        for (const line of lines) {
          const colonIdx = line.indexOf(':');
          if (colonIdx !== -1) {
            const key = line.substring(0, colonIdx).trim();
            const val = line.substring(colonIdx + 1).trim();
            if (val === 'true') {
              meta[key] = true;
            } else if (val === 'false') {
              meta[key] = false;
            } else if (val.startsWith('[') && val.endsWith(']')) {
              try {
                meta[key] = JSON.parse(val.replace(/'/g, '"'));
              } catch {
                meta[key] = val;
              }
            } else {
              meta[key] = val.replace(/^["']|["']$/g, '');
            }
          }
        }

        // Validate obligation metadata
        if (!meta.question) {
          throw new InvalidObligationMetadataException(rule.ruleId, 'Missing required field: question');
        }
        if (!meta.responseType) {
          throw new InvalidObligationMetadataException(rule.ruleId, 'Missing required field: responseType');
        }
        const validTypes = ['boolean', 'choice', 'bounded_text', 'acknowledgement', 'evidence_reference'];
        if (!validTypes.includes(meta.responseType)) {
          throw new InvalidObligationMetadataException(rule.ruleId, `Invalid responseType: ${meta.responseType}`);
        }
        if (meta.blocking === undefined) {
          throw new InvalidObligationMetadataException(rule.ruleId, 'Missing required field: blocking');
        }

        const obligationId = createHash('sha256')
          .update(`${rule.ruleId}:${meta.question}`)
          .digest('hex');

        obligations.push({
          obligationId,
          ruleId: rule.ruleId,
          question: meta.question,
          responseType: meta.responseType as any,
          allowedValues: meta.allowedValues || undefined,
          blocking: meta.blocking,
          rationaleRequired: meta.rationaleRequired !== undefined ? meta.rationaleRequired : true,
          evidenceRequired: meta.evidenceRequired !== undefined ? meta.evidenceRequired : false
        });
      }
    }

    const bundleHash = this.integrity.calculateHash(resolved.sessionId, rules, vocabulary, evidence);

    const tempBundle = {
      sessionId: resolved.sessionId,
      schemaVersion: '2.0.0',
      rules,
      vocabulary,
      resolutionEvidence: evidence,
      obligations,
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
      obligations: Object.freeze(obligations.map(o => Object.freeze(o))),
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
