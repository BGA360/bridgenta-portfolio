import type { GovernancePersistencePort } from './persistence.js';
import type { RuntimeOperationResult } from './types.js';
import { RuntimeInvariantError } from './errors.js';

/**
 * NON_CONTRACT_INTERNAL_TYPE
 * Input parameters for Stage 1 deterministic eligibility filtering.
 */
export interface Stage1EligibilityQueryParams {
  readonly targetRef?: unknown;
  readonly scope?: unknown;
  readonly frameworkId?: string;
  readonly projectId?: string;
  readonly workstreamId?: string;
}

/**
 * NON_CONTRACT_INTERNAL_TYPE
 * Stage 1 deterministic eligibility filter result DTO.
 */
export interface Stage1EligibilityFilterResult {
  readonly queryParams: Stage1EligibilityQueryParams;
  readonly totalCandidatesEvaluated: number;
  readonly eligibleItemsCount: number;
  readonly excludedItemsCount: number;
  readonly eligibleItems: ReadonlyArray<Readonly<Record<string, unknown>>>;
  readonly exclusionReasons: ReadonlyArray<{
    readonly lessonId: string;
    readonly reason: string;
  }>;
}

/**
 * Deep clones an object for defensive immutability.
 */
function deepClone<T>(val: T): T {
  if (val === undefined || val === null) {
    return val;
  }
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(val);
    }
  } catch {
    // Fallback if structuredClone fails on non-serializable objects
  }
  return JSON.parse(JSON.stringify(val));
}

/**
 * Checks if a lesson scope is compatible with query framework constraints.
 */
function checkScopeCompatibility(
  lessonScope: Record<string, unknown> | undefined,
  queryFrameworkId?: string
): boolean {
  if (!queryFrameworkId) {
    return true; // No framework constraint in query
  }
  if (!lessonScope || typeof lessonScope !== 'object') {
    return true; // Unconstrained compatibility if missing explicit scope
  }

  const scopeType = lessonScope.scopeType as string | undefined;

  if (scopeType === 'SYSTEM_WIDE') {
    return true;
  }

  if (scopeType === 'SINGLE_FRAMEWORK') {
    const fwRef = lessonScope.frameworkRef as Record<string, unknown> | undefined;
    const fwId = fwRef?.frameworkId ?? (fwRef as unknown as string);
    return fwId === queryFrameworkId;
  }

  if (scopeType === 'CROSS_FRAMEWORK') {
    const fwRefs = lessonScope.frameworkRefs as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(fwRefs)) {
      return fwRefs.some((ref) => {
        const fwId = ref?.frameworkId ?? (ref as unknown as string);
        return fwId === queryFrameworkId;
      });
    }
  }

  return true;
}

/**
 * Checks if a lesson target is compatible with query target constraints.
 */
function checkTargetCompatibility(
  lesson: Record<string, unknown>,
  queryProjectId?: string,
  queryWorkstreamId?: string,
  queryTargetRef?: Record<string, unknown>
): boolean {
  if (queryProjectId) {
    const adoptedRef = lesson.adoptedByProjectRef as Record<string, unknown> | undefined;
    if (adoptedRef) {
      const projId =
        (adoptedRef.adoptedByProjectRef as Record<string, unknown>)?.projectId ??
        adoptedRef.projectId;
      if (projId && projId !== queryProjectId) {
        return false;
      }
    }
  }

  if (queryTargetRef && typeof queryTargetRef === 'object') {
    const targetCategory = queryTargetRef.targetCategory as string | undefined;

    if (targetCategory === 'PROJECT') {
      const pRef = queryTargetRef.projectRef as Record<string, unknown> | undefined;
      const targetProjId = pRef?.projectId ?? (pRef as unknown as string);
      if (targetProjId && queryProjectId && targetProjId !== queryProjectId) {
        return false;
      }
    }

    if (targetCategory === 'WORKSTREAM') {
      const wRef = queryTargetRef.workstreamRef as Record<string, unknown> | undefined;
      const targetWorkstreamId = wRef?.workstreamId ?? (wRef as unknown as string);
      if (targetWorkstreamId && queryWorkstreamId && targetWorkstreamId !== queryWorkstreamId) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Filter eligible guidance items deterministically (GL-IMPL-UNIT-008).
 * Applies Stage 1 deterministic eligibility rules:
 * - Enforces TargetRef requirement strictly (INV-GL-033). Context parameter substitution is NOT permitted.
 * - Excludes inactive lessons (RETIRED, SUPERSEDED, DEPRECATED, CANDIDATE, IN_REVIEW, REJECTED).
 * - Excludes scope mismatches (frameworkRef).
 * - Excludes target mismatches (projectId, workstreamId, targetRef).
 * - Orders results deterministically by recency (approvedAt / createdAt descending) and lessonId ascending.
 */
export function filterEligibleGuidance(
  candidatesInput: ReadonlyArray<unknown>,
  queryParams: Stage1EligibilityQueryParams = {}
): RuntimeOperationResult<Stage1EligibilityFilterResult> {
  if (!Array.isArray(candidatesInput)) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('Input candidates for deterministic eligibility filter must be an array'),
    };
  }

  // Enforce INV-GL-033: LearningContextQuery MUST specify TargetRef literally.
  // Context parameter substitution (frameworkId/projectId/workstreamId/scope without targetRef) is strictly forbidden.
  const hasTargetRef = queryParams.targetRef !== undefined && queryParams.targetRef !== null;

  if (!hasTargetRef) {
    return {
      ok: false,
      category: 'ERROR',
      error: new RuntimeInvariantError('LearningContextQuery must specify TargetRef (INV-GL-033)'),
    };
  }

  // Extract explicit query framework and target criteria
  let frameworkId = queryParams.frameworkId;
  let projectId = queryParams.projectId;
  let workstreamId = queryParams.workstreamId;

  // Extract target criteria from targetRef
  if (typeof queryParams.targetRef === 'object') {
    const targetRefObj = queryParams.targetRef as Record<string, unknown>;
    const targetCategory = targetRefObj.targetCategory as string | undefined;

    if (targetCategory === 'PROJECT' && !projectId) {
      const pRef = targetRefObj.projectRef as Record<string, unknown> | undefined;
      projectId = (pRef?.projectId as string) ?? (pRef as unknown as string);
    } else if (targetCategory === 'WORKSTREAM' && !workstreamId) {
      const wRef = targetRefObj.workstreamRef as Record<string, unknown> | undefined;
      workstreamId = (wRef?.workstreamId as string) ?? (wRef as unknown as string);
    }
  }

  const clonedCandidates = candidatesInput.map((item) => deepClone(item) as Record<string, unknown>);

  const eligibleItems: Array<Record<string, unknown>> = [];
  const exclusionReasons: Array<{ lessonId: string; reason: string }> = [];

  for (const item of clonedCandidates) {
    const lessonId =
      (item.lessonId as string) ??
      (item.lessonRef as Record<string, unknown>)?.lessonId ??
      'UNKNOWN_LESSON';

    const status = item.status as string | undefined;

    if (status === 'DEPRECATED') {
      exclusionReasons.push({ lessonId: String(lessonId), reason: 'EXCLUDED_INACTIVE_LESSON' });
      continue;
    }

    if (status === 'SUPERSEDED') {
      exclusionReasons.push({ lessonId: String(lessonId), reason: 'EXCLUDED_SUPERSEDED_LESSON' });
      continue;
    }

    // Under SSoT Option A, only PUBLISHED status represents an active advisory lesson eligible for forward query.
    // Non-PUBLISHED statuses (APPROVED, RETIRED, CANDIDATE, IN_REVIEW, REJECTED, etc.) are excluded without implicit cross-model mapping.
    if (status !== 'PUBLISHED') {
      exclusionReasons.push({ lessonId: String(lessonId), reason: `EXCLUDED_NON_PUBLISHED_STATUS_${status ?? 'UNDEFINED'}` });
      continue;
    }

    // 2. Check Scope Compatibility
    const scope = item.scope as Record<string, unknown> | undefined;
    if (!checkScopeCompatibility(scope, frameworkId)) {
      exclusionReasons.push({ lessonId: String(lessonId), reason: 'EXCLUDED_SCOPE_MISMATCH' });
      continue;
    }

    // 3. Check Target Compatibility
    if (!checkTargetCompatibility(item, projectId, workstreamId, queryParams.targetRef as Record<string, unknown> | undefined)) {
      exclusionReasons.push({ lessonId: String(lessonId), reason: 'EXCLUDED_TARGET_MISMATCH' });
      continue;
    }

    // Item passed Stage 1 deterministic eligibility filter
    eligibleItems.push(deepClone(item));
  }

  // Deterministic Recency Ordering (publishedAt / approvedAt / createdAt descending, lessonId ascending tiebreaker)
  eligibleItems.sort((a, b) => {
    const tsA = (a.publishedAt as string) ?? (a.approvedAt as string) ?? (a.createdAt as string) ?? '';
    const tsB = (b.publishedAt as string) ?? (b.approvedAt as string) ?? (b.createdAt as string) ?? '';

    if (tsA !== '' && tsB !== '') {
      const cmp = tsB.localeCompare(tsA); // recency descending
      if (cmp !== 0) return cmp;
    }

    const idA = (a.lessonId as string) ?? '';
    const idB = (b.lessonId as string) ?? '';
    return idA.localeCompare(idB);
  });

  const result: Stage1EligibilityFilterResult = {
    queryParams: deepClone(queryParams),
    totalCandidatesEvaluated: candidatesInput.length,
    eligibleItemsCount: eligibleItems.length,
    excludedItemsCount: exclusionReasons.length,
    eligibleItems: eligibleItems.map((item) => deepClone(item)),
    exclusionReasons: exclusionReasons.map((r) => deepClone(r)),
  };

  return {
    ok: true,
    category: 'SUCCESS',
    data: result,
  };
}

/**
 * Deterministic Eligibility Filter (GL-IMPL-UNIT-008)
 * Class implementing Stage 1 deterministic eligibility filtering without semantic ranking or AI scoring.
 */
export class DeterministicEligibilityFilter {
  constructor(private readonly persistencePort?: GovernancePersistencePort) {}

  /**
   * Filters a candidate set of lessons or guidance items deterministically.
   * Requires explicit candidate items array. Does NOT fetch or misuse event logs from persistence.
   */
  public filterEligible(
    candidates?: ReadonlyArray<unknown>,
    queryParams?: Stage1EligibilityQueryParams
  ): RuntimeOperationResult<Stage1EligibilityFilterResult> {
    if (!candidates) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError('No candidate items provided for eligibility filtering'),
      };
    }

    return filterEligibleGuidance(candidates, queryParams);
  }
}
