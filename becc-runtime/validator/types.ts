import {
  AssessmentContext,
  ValidationResultReport,
  ValidationFinding,
  ValidationEvidence
} from '../shared/types.js';
import { IKnowledgeBundle } from '../bundle/types.js';

export interface IValidatorRegistry {
  register(validator: ISubValidator): void;
  getValidators(): readonly ISubValidator[];
}

export interface ISubValidator {
  readonly name: string;
  validate(
    context: AssessmentContext,
    diff: any, // Contains communication and metadata
    bundle: IKnowledgeBundle,
    candidateContent: string,
    baselineContent: string
  ): {
    readonly findings: readonly ValidationFinding[];
    readonly evidence: readonly ValidationEvidence[];
  };
}

export interface ICandidateMaterializer {
  materialize(
    baselineContent: string,
    diffContent: string
  ): string;
}
