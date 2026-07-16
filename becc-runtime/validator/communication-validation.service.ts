import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { IValidationEngine } from '../orchestrator/types.js';
import { AssessmentContext, ValidationResultReport, ValidationFinding, ValidationEvidence } from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';
import { CandidateMaterializerService } from './candidate-materializer.service.js';
import { ValidatorRegistryService } from './validator-registry.service.js';
import { FindingAggregatorService } from './finding-aggregator.service.js';
import { StructureValidatorService } from './structure-validator.service.js';
import { TerminologyValidatorService } from './terminology-validator.service.js';
import { CompletenessValidatorService } from './completeness-validator.service.js';
import { ProvenanceValidatorService } from './provenance-validator.service.js';
import { MetadataIntegrityValidatorService } from './metadata-integrity-validator.service.js';
import { ReferenceValidatorService } from './reference-validator.service.js';
import { StaleBaselineException, PathTraversalException } from './exceptions.js';

export class CommunicationValidationService implements IValidationEngine {
  private readonly materializer = new CandidateMaterializerService();
  private readonly registry = new ValidatorRegistryService();
  private readonly aggregator = new FindingAggregatorService();

  constructor() {
    // Register all active sub-validators
    this.registry.register(new StructureValidatorService());
    this.registry.register(new TerminologyValidatorService());
    this.registry.register(new CompletenessValidatorService());
    this.registry.register(new ProvenanceValidatorService());
    this.registry.register(new MetadataIntegrityValidatorService());
    this.registry.register(new ReferenceValidatorService());
  }

  /**
   * Runs the complete WP-011 validation pipeline.
   *
   * @param context Upstream assessment context
   * @param diff Transformation output (contains communication and metadata)
   * @param bundle Materialized knowledge bundle
   */
  public async validate(
    context: AssessmentContext,
    diff: any,
    bundle: IKnowledgeBundle
  ): Promise<ValidationResultReport> {
    if (!context) {
      throw new Error('AssessmentContext must not be null or undefined.');
    }
    if (!diff) {
      throw new Error('Diff object must not be null or undefined.');
    }
    if (!bundle) {
      throw new Error('Knowledge bundle must not be null or undefined.');
    }

    const repoRoot = (context.repositoryDetails as any).repositoryRoot || process.cwd();

    // Resolve and validate baseline file path safely
    const targetFilePath = context.targetDocument.path;
    const validatedBaselinePath = this.resolveAndValidatePath(targetFilePath, repoRoot);

    const diffTargetFilePath = diff.communication?.targetFilePath;
    if (diffTargetFilePath) {
      this.resolveAndValidatePath(diffTargetFilePath, repoRoot);
    }

    // Read target baseline content synchronously (read-only)
    let baselineContent = '';
    try {
      baselineContent = fs.readFileSync(validatedBaselinePath, 'utf8');
    } catch (err: any) {
      throw new StaleBaselineException(`Failed to read baseline target file: ${err.message}`);
    }

    const calculatedBaselineHash = createHash('sha256').update(baselineContent).digest('hex');
    if (calculatedBaselineHash !== context.targetDocument.hash) {
      throw new StaleBaselineException(`Baseline target document hash drift detected. Expected: ${context.targetDocument.hash}, Found: ${calculatedBaselineHash}`);
    }

    const diffContent = diff.communication?.diffContent || '';

    // Reconstruct the transient candidate in memory
    const candidateContent = this.materializer.materialize(baselineContent, diffContent);

    // Execute sub-validators sequentially
    const allFindings: ValidationFinding[] = [];
    const allEvidence: ValidationEvidence[] = [];

    const validators = this.registry.getValidators();
    for (const validator of validators) {
      const { findings, evidence } = validator.validate(
        context,
        diff,
        bundle,
        candidateContent,
        baselineContent
      );
      allFindings.push(...findings);
      allEvidence.push(...evidence);
    }

    // Map rule metrics
    const evaluatedRuleCount = bundle.rules.length;
    const nonEvaluableRuleCount = bundle.rules.filter(
      r => r.content.toLowerCase().includes('clarity') || r.content.toLowerCase().includes('appropriate')
    ).length;

    // Aggregate findings to compile the final report
    return this.aggregator.aggregate(
      context.assessmentId,
      allFindings,
      allEvidence,
      evaluatedRuleCount,
      nonEvaluableRuleCount
    );
  }

  /**
   * Safely resolves a target path relative to repo root and checks containment.
   */
  private resolveAndValidatePath(targetPath: string, root: string): string {
    const absoluteRoot = path.resolve(root);
    const resolvedPath = path.resolve(absoluteRoot, targetPath);

    // Block traversal sequences
    const normalizedTarget = targetPath.replace(/\\/g, '/');
    if (normalizedTarget.includes('../') || normalizedTarget.includes('..\\')) {
      throw new PathTraversalException('Path traversal detected');
    }

    if (!resolvedPath.startsWith(absoluteRoot + path.sep) && resolvedPath !== absoluteRoot) {
      throw new PathTraversalException('Path is outside repository containment bounds.');
    }

    // Block symlink escapes
    try {
      const realPath = fs.realpathSync(resolvedPath);
      if (!realPath.startsWith(absoluteRoot + path.sep) && realPath !== absoluteRoot) {
        throw new PathTraversalException('Symlink path traversal detected');
      }
      return realPath;
    } catch {
      throw new PathTraversalException('Invalid or missing target file path');
    }
  }
}
