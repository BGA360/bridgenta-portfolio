import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DeterministicEligibilityFilter, filterEligibleGuidance } from '../src/runtime/eligibility.js';
import { InMemoryGovernanceRepository } from '../src/runtime/persistence.js';

describe('DeterministicEligibilityFilter & filterEligibleGuidance (GL-IMPL-UNIT-008)', () => {
  let repository: InMemoryGovernanceRepository;
  let filter: DeterministicEligibilityFilter;

  beforeEach(() => {
    repository = new InMemoryGovernanceRepository();
    filter = new DeterministicEligibilityFilter(repository);
  });

  it('1. Rejects missing TargetRef or target criteria with RuntimeError (INV-GL-033)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, {});
    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'ERROR') {
      assert.ok(res.error.message.includes('INV-GL-033'));
    }
  });

  it('2. Passes active APPROVED and PUBLISHED lessons with matching framework scope', () => {
    const candidates = [
      {
        lessonId: 'LES-001',
        statement: 'Run build validation pre-commit',
        status: 'APPROVED',
        scope: {
          scopeType: 'SINGLE_FRAMEWORK',
          frameworkRef: { frameworkId: 'ASTRO_FW' },
        },
        approvedAt: '2026-09-01T10:00:00Z',
      },
      {
        lessonId: 'LES-002',
        statement: 'Published active lesson',
        status: 'PUBLISHED',
        scope: {
          scopeType: 'SINGLE_FRAMEWORK',
          frameworkRef: { frameworkId: 'ASTRO_FW' },
        },
        approvedAt: '2026-09-02T10:00:00Z',
      },
    ];

    const res = filterEligibleGuidance(candidates, { frameworkId: 'ASTRO_FW' });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalCandidatesEvaluated, 2);
      assert.equal(res.data.eligibleItemsCount, 2);
      assert.equal(res.data.excludedItemsCount, 0);
    }
  });

  it('3. Excludes scope mismatch for SINGLE_FRAMEWORK query', () => {
    const candidates = [
      {
        lessonId: 'LES-001',
        statement: 'Run build validation pre-commit',
        status: 'APPROVED',
        scope: {
          scopeType: 'SINGLE_FRAMEWORK',
          frameworkRef: { frameworkId: 'REACT_FW' },
        },
        approvedAt: '2026-09-01T10:00:00Z',
      },
    ];

    const res = filterEligibleGuidance(candidates, { frameworkId: 'ASTRO_FW' });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 0);
      assert.equal(res.data.excludedItemsCount, 1);
      assert.equal(res.data.exclusionReasons[0].reason, 'EXCLUDED_SCOPE_MISMATCH');
    }
  });

  it('4. Passes SYSTEM_WIDE scope lessons for any framework query', () => {
    const candidates = [
      {
        lessonId: 'LES-002',
        statement: 'Do not store API secrets in source code',
        status: 'APPROVED',
        scope: { scopeType: 'SYSTEM_WIDE' },
        approvedAt: '2026-09-02T10:00:00Z',
      },
    ];

    const res = filterEligibleGuidance(candidates, { frameworkId: 'ASTRO_FW' });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 1);
      assert.equal(res.data.eligibleItems[0].lessonId, 'LES-002');
    }
  });

  it('5. Excludes RETIRED, DEPRECATED, SUPERSEDED, and unapproved CANDIDATE lessons', () => {
    const candidates = [
      {
        lessonId: 'LES-010',
        statement: 'Approved lesson',
        status: 'APPROVED',
        approvedAt: '2026-09-01T10:00:00Z',
      },
      {
        lessonId: 'LES-011',
        statement: 'Retired lesson',
        status: 'RETIRED',
        approvedAt: '2026-09-01T10:00:00Z',
      },
      {
        lessonId: 'LES-012',
        statement: 'Superseded lesson',
        status: 'SUPERSEDED',
        approvedAt: '2026-09-01T10:00:00Z',
      },
      {
        lessonId: 'LES-013',
        statement: 'Candidate lesson',
        status: 'CANDIDATE',
        createdAt: '2026-09-01T10:00:00Z',
      },
      {
        lessonId: 'LES-014',
        statement: 'Deprecated lesson',
        status: 'DEPRECATED',
        approvedAt: '2026-09-01T10:00:00Z',
      },
    ];

    const res = filterEligibleGuidance(candidates, { frameworkId: 'ASTRO_FW' });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalCandidatesEvaluated, 5);
      assert.equal(res.data.eligibleItemsCount, 1);
      assert.equal(res.data.excludedItemsCount, 4);
      assert.equal(res.data.eligibleItems[0].lessonId, 'LES-010');
      const reasons = res.data.exclusionReasons.map((r) => r.reason);
      assert.ok(reasons.includes('EXCLUDED_INACTIVE_LESSON'));
      assert.ok(reasons.includes('EXCLUDED_SUPERSEDED_LESSON'));
      assert.ok(reasons.includes('EXCLUDED_UNAPPROVED_STATUS_CANDIDATE'));
    }
  });

  it('6. Excludes target mismatch for project and workstream criteria', () => {
    const candidates = [
      {
        lessonId: 'LES-020',
        statement: 'Project A specific adoption',
        status: 'APPROVED',
        adoptedByProjectRef: { projectId: 'PRJ-ALPHA' },
      },
    ];

    // Query for PRJ-BETA -> excluded due to target mismatch
    const resMismatch = filterEligibleGuidance(candidates, { projectId: 'PRJ-BETA' });
    assert.equal(resMismatch.ok, true);
    if (resMismatch.ok) {
      assert.equal(resMismatch.data.eligibleItemsCount, 0);
      assert.equal(resMismatch.data.exclusionReasons[0].reason, 'EXCLUDED_TARGET_MISMATCH');
    }

    // Query for PRJ-ALPHA -> passes
    const resMatch = filterEligibleGuidance(candidates, { projectId: 'PRJ-ALPHA' });
    assert.equal(resMatch.ok, true);
    if (resMatch.ok) {
      assert.equal(resMatch.data.eligibleItemsCount, 1);
    }
  });

  it('7. Deterministically orders eligible items by recency and lessonId tiebreaker', () => {
    const candidates = [
      {
        lessonId: 'LES-002',
        statement: 'Older approved lesson',
        status: 'APPROVED',
        approvedAt: '2026-09-01T10:00:00Z',
      },
      {
        lessonId: 'LES-001',
        statement: 'Newer approved lesson',
        status: 'APPROVED',
        approvedAt: '2026-09-05T10:00:00Z',
      },
      {
        lessonId: 'LES-003',
        statement: 'Same timestamp lesson B',
        status: 'APPROVED',
        approvedAt: '2026-09-05T10:00:00Z',
      },
    ];

    const res = filterEligibleGuidance(candidates, { frameworkId: 'ASTRO_FW' });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 3);
      assert.equal(res.data.eligibleItems[0].lessonId, 'LES-001');
      assert.equal(res.data.eligibleItems[1].lessonId, 'LES-003');
      assert.equal(res.data.eligibleItems[2].lessonId, 'LES-002');
    }
  });

  it('8. Produces deeply equal full results across consecutive executions without wall-clock evaluatedAt', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
      { lessonId: 'LES-002', status: 'APPROVED', approvedAt: '2026-09-02T10:00:00Z' },
    ];

    const queryParams = { frameworkId: 'ASTRO_FW' };

    const run1 = filterEligibleGuidance(candidates, queryParams);
    const run2 = filterEligibleGuidance(candidates, queryParams);

    assert.equal(run1.ok, true);
    assert.equal(run2.ok, true);
    if (run1.ok && run2.ok) {
      assert.deepStrictEqual(run1, run2);
      // Verify no evaluatedAt wall-clock property exists on DTO
      assert.equal((run1.data as unknown as Record<string, unknown>).evaluatedAt, undefined);
    }
  });

  it('9. Rejects call when no candidate items are provided without calling getEvents persistence fallback', () => {
    let getEventsCalled = false;
    const testSpyRepository = {
      appendEvent: repository.appendEvent.bind(repository),
      getEvents: () => {
        getEventsCalled = true;
        return repository.getEvents();
      },
      saveObservation: repository.saveObservation.bind(repository),
      getObservationByRef: repository.getObservationByRef.bind(repository),
      saveLesson: repository.saveLesson.bind(repository),
      getLessonByRef: repository.getLessonByRef.bind(repository),
      saveRuleCandidate: repository.saveRuleCandidate.bind(repository),
      getRuleCandidateById: repository.getRuleCandidateById.bind(repository),
    };

    const spyFilter = new DeterministicEligibilityFilter(testSpyRepository);
    const res = spyFilter.filterEligible(undefined, { frameworkId: 'ASTRO_FW' });

    assert.equal(res.ok, false);
    assert.equal(getEventsCalled, false);
  });

  it('10. Preserves input query and candidate immutability', () => {
    const candidates = [
      {
        lessonId: 'LES-001',
        statement: 'Test statement',
        status: 'APPROVED',
        scope: { scopeType: 'SYSTEM_WIDE' },
      },
    ];

    const candidatesCopy = JSON.parse(JSON.stringify(candidates));
    const queryParams = { frameworkId: 'ASTRO_FW', limit: 5 };
    const queryCopy = JSON.parse(JSON.stringify(queryParams));

    const res = filterEligibleGuidance(candidates, queryParams);
    assert.equal(res.ok, true);

    assert.deepEqual(candidates, candidatesCopy);
    assert.deepEqual(queryParams, queryCopy);
  });
});
