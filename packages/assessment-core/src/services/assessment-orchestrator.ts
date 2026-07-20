/**
 * @file assessment-orchestrator.ts
 * @module @cep/assessment-core
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-001 (Assessment Contract)
 * @domainConcept Assessment, Assessment Orchestration
 */

import {
  AssessmentRequestModel,
  AssessmentResultModel,
  AssessmentState,
  FindingStatus,
} from '../models/assessment.types.js';
import {
  ValidationError,
  StateTransitionError,
  AssessmentNotFoundError,
} from '../errors/assessment.errors.js';

/**
 * Valid state transitions table based on docs/domain/DOMAIN-LIFECYCLES.md.
 */
const ALLOWED_TRANSITIONS: Record<AssessmentState, AssessmentState[]> = {
  [AssessmentState.UNINITIALIZED]: [AssessmentState.REQUESTED],
  [AssessmentState.REQUESTED]: [
    AssessmentState.COLLECTING_EVIDENCE,
    AssessmentState.FAILED,
    AssessmentState.ARCHIVED,
  ],
  [AssessmentState.COLLECTING_EVIDENCE]: [
    AssessmentState.UNDER_REVIEW,
    AssessmentState.FAILED,
    AssessmentState.ARCHIVED,
  ],
  [AssessmentState.UNDER_REVIEW]: [
    AssessmentState.COMPLETED,
    AssessmentState.FAILED,
    AssessmentState.ARCHIVED,
  ],
  [AssessmentState.COMPLETED]: [
    AssessmentState.CERTIFIED,
    AssessmentState.FAILED,
    AssessmentState.ARCHIVED,
  ],
  [AssessmentState.CERTIFIED]: [AssessmentState.ARCHIVED],
  [AssessmentState.FAILED]: [AssessmentState.ARCHIVED],
  [AssessmentState.ARCHIVED]: [],
};

/**
 * Executable orchestrator service managing assessment initialization, validation, state machine transitions, inspection, and serialization.
 */
export class AssessmentOrchestrator {
  private readonly store = new Map<string, AssessmentResultModel>();

  /**
   * Creates a new assessment instance after validating the request payload against CTR-001.
   *
   * @param request Input Assessment Request model.
   * @returns Newly created AssessmentResultModel in REQUESTED state.
   */
  public createAssessment(request: AssessmentRequestModel): AssessmentResultModel {
    this.validateRequest(request);

    const now = new Date().toISOString();
    const assessment: AssessmentResultModel = {
      assessment_id: request.request_id,
      request: {
        ...request,
        created_at: request.created_at || now,
      },
      state: AssessmentState.REQUESTED,
      findings: [],
      governance_level: request.target_governance_level,
      overall_status: FindingStatus.PASS,
      created_at: now,
      updated_at: now,
    };

    this.store.set(assessment.assessment_id, assessment);
    return this.cloneAssessment(assessment);
  }

  /**
   * Validates an Assessment Request payload against CTR-001 specification requirements.
   *
   * @param request Candidate request model.
   * @throws ValidationError (ERR-VAL-001) if validation rules fail.
   */
  public validateRequest(request: AssessmentRequestModel): void {
    const errors: string[] = [];

    if (!request || typeof request !== 'object') {
      throw new ValidationError('Assessment request must be a valid non-null object.');
    }

    if (!request.request_id || typeof request.request_id !== 'string' || request.request_id.trim() === '') {
      errors.push('Field "request_id" is required and must be a non-empty string.');
    }

    if (!request.project_ref || typeof request.project_ref !== 'string' || request.project_ref.trim() === '') {
      errors.push('Field "project_ref" is required and must be a non-empty string.');
    }

    if (
      !Array.isArray(request.scope_manifest) ||
      request.scope_manifest.length === 0 ||
      request.scope_manifest.some((item) => typeof item !== 'string' || item.trim() === '')
    ) {
      errors.push('Field "scope_manifest" must be a non-empty array of strings.');
    }

    if (
      typeof request.target_governance_level !== 'number' ||
      !Number.isInteger(request.target_governance_level) ||
      request.target_governance_level < 0 ||
      request.target_governance_level > 5
    ) {
      errors.push('Field "target_governance_level" must be an integer between 0 and 5.');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Assessment request validation failed: ${errors.join(' ')}`, errors);
    }
  }

  /**
   * Transitions an active assessment to a new state if allowed by the lifecycle state machine.
   *
   * @param assessmentId ID of the assessment to transition.
   * @param targetState Desired target state.
   * @returns Updated AssessmentResultModel.
   * @throws AssessmentNotFoundError if assessmentId is not found.
   * @throws StateTransitionError if transition is forbidden.
   */
  public transitionState(assessmentId: string, targetState: AssessmentState): AssessmentResultModel {
    const assessment = this.store.get(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    const currentState = assessment.state;
    const allowed = ALLOWED_TRANSITIONS[currentState] || [];

    if (!allowed.includes(targetState)) {
      throw new StateTransitionError(currentState, targetState);
    }

    assessment.state = targetState;
    assessment.updated_at = new Date().toISOString();

    this.store.set(assessmentId, assessment);
    return this.cloneAssessment(assessment);
  }

  /**
   * Inspects and returns a cloned snapshot of an active assessment by ID.
   *
   * @param assessmentId ID of the assessment to inspect.
   * @returns Cloned AssessmentResultModel snapshot.
   * @throws AssessmentNotFoundError if assessmentId is not found.
   */
  public inspectAssessment(assessmentId: string): AssessmentResultModel {
    const assessment = this.store.get(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }
    return this.cloneAssessment(assessment);
  }

  /**
   * Serializes an AssessmentResultModel instance into a deterministic JSON string.
   *
   * @param assessment Assessment result model to serialize.
   * @returns Formatted JSON string representation.
   */
  public serializeAssessment(assessment: AssessmentResultModel): string {
    if (!assessment || typeof assessment !== 'object') {
      throw new ValidationError('Cannot serialize invalid assessment entity.');
    }
    return JSON.stringify(assessment, null, 2);
  }

  /**
   * Deserializes and validates a JSON string into an AssessmentResultModel.
   *
   * @param jsonString Input JSON string.
   * @returns Parsed and validated AssessmentResultModel.
   * @throws ValidationError if JSON parsing fails or required fields are missing.
   */
  public deserializeAssessment(jsonString: string): AssessmentResultModel {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new ValidationError('Failed to parse assessment JSON: invalid JSON syntax.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new ValidationError('Deserialized JSON payload is not an object.');
    }

    const candidate = parsed as Partial<AssessmentResultModel>;
    if (
      !candidate.assessment_id ||
      !candidate.state ||
      !candidate.request ||
      typeof candidate.governance_level !== 'number'
    ) {
      throw new ValidationError('Deserialized JSON payload missing mandatory Assessment fields.');
    }

    return candidate as AssessmentResultModel;
  }

  /**
   * Deep clones an assessment model to prevent external state mutation.
   */
  private cloneAssessment(assessment: AssessmentResultModel): AssessmentResultModel {
    return JSON.parse(JSON.stringify(assessment)) as AssessmentResultModel;
  }
}

/**
 * Factory function creating a new AssessmentOrchestrator instance.
 */
export function createAssessmentOrchestrator(): AssessmentOrchestrator {
  return new AssessmentOrchestrator();
}
