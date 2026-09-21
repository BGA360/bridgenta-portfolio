import type { LearningAuthorityLevelEnum, RefusalCodeEnum } from '../types/enums.js';
import type { GovernedLearningRuntimeError } from './errors.js';

/**
 * Internal runtime result classification categories.
 * Distinguishes successful outcomes from domain refusals and runtime errors.
 */
export type RuntimeResultCategory = 'SUCCESS' | 'REFUSED' | 'ERROR';

/**
 * Successful runtime operation wrapper containing result payload and optional execution metadata.
 */
export interface RuntimeSuccessResult<T> {
  readonly ok: true;
  readonly category: 'SUCCESS';
  readonly data: T;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Domain refusal result wrapper referencing a canonical domain RefusalCodeEnum.
 */
export interface RuntimeRefusalResult {
  readonly ok: false;
  readonly category: 'REFUSED';
  readonly refusalCode: RefusalCodeEnum;
  readonly reason: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly rollbackRequired?: boolean;
}

/**
 * Internal runtime execution error wrapper.
 */
export interface RuntimeErrorResult {
  readonly ok: false;
  readonly category: 'ERROR';
  readonly error: GovernedLearningRuntimeError;
}

/**
 * Discriminated union of all internal runtime operation outcomes.
 */
export type RuntimeOperationResult<T> =
  | RuntimeSuccessResult<T>
  | RuntimeRefusalResult
  | RuntimeErrorResult;

/**
 * Internal authority reference linking a canonical LearningAuthorityLevelEnum
 * to its originating authority source identifier.
 */
export interface RuntimeAuthorityRef {
  readonly level: LearningAuthorityLevelEnum;
  readonly sourceId: string;
}

/**
 * Internal metadata snapshot for tracking runtime execution stage status.
 */
export interface RuntimeExecutionStageOutcome {
  readonly stageId: string;
  readonly status: 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
  readonly timestamp: string;
  readonly durationMs?: number;
}
