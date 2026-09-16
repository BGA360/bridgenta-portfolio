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

  it('1. Passes active APPROVED lessons with matching SINGLE_FRAMEWORK scope', () => {
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
    ];

    const res = filterEligibleGuidance(candidates, { frameworkId: 'ASTRO_FW' });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalCandidatesEvaluated, 1);
      assert.equal(res.data.eligibleItemsCount, 1);
      assert.equal(res.data.excludedItemsCount, 0);
      assert.equal(res.data.eligibleItems[0].lessonId, 'LES-001');
    }
  });

  it('2. Excludes scope mismatch for SINGLE_FRAMEWORK query', () => {
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

  it('3. Passes SYSTEM_WIDE scope lessons for any framework query', () => {
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

  it('4. Excludes RETIRED, SUPERSEDED, and unapproved CANDIDATE lessons', () => {
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
    ];

    const res = filterEligibleGuidance(candidates);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalCandidatesEvaluated, 4);
      assert.equal(res.data.eligibleItemsCount, 1);
      assert.equal(res.data.excludedItemsCount, 3);
      assert.equal(res.data.eligibleItems[0].lessonId, 'LES-010');
      const reasons = res.data.exclusionReasons.map((r) => r.reason);
      assert.ok(reasons.includes('EXCLUDED_RETIRED_LESSON'));
      assert.ok(reasons.includes('EXCLUDED_SUPERSEDED_LESSON'));
      assert.ok(reasons.includes('EXCLUDED_UNAPPROVED_STATUS_CANDIDATE'));
    }
  });

  it('5. Excludes target mismatch for project and workstream criteria', () => {
    const candidates = [
      {
        lessonId: 'LES-020',
        statement: 'Project A specific adoption',
        status: 'APPROVED',
        adoptedByProjectRef: { projectId: 'PRJ-ALPHA' },
      },
    ];

    // Query for PRJ-BETA -> should be excluded due to target mismatch
    const resMismatch = filterEligibleGuidance(candidates, { projectId: 'PRJ-BETA' });
    assert.equal(resMismatch.ok, true);
    if (resMismatch.ok) {
      assert.equal(resMismatch.data.eligibleItemsCount, 0);
      assert.equal(resMismatch.data.exclusionReasons[0].reason, 'EXCLUDED_TARGET_MISMATCH');
    }

    // Query for PRJ-ALPHA -> should pass
    const resMatch = filterEligibleGuidance(candidates, { projectId: 'PRJ-ALPHA' });
    assert.equal(resMatch.ok, true);
    if (resMatch.ok) {
      assert.equal(resMatch.data.eligibleItemsCount, 1);
    }
  });

  it('6. Deterministically orders eligible items by recency and lessonId tiebreaker', () => {
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

    const res = filterEligibleGuidance(candidates);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 3);
      // Recency descending: 2026-09-05 comes before 2026-09-01
      // For tie 2026-09-05: LES-001 comes before LES-003 (lessonId ascending tiebreaker)
      assert.equal(res.data.eligibleItems[0].lessonId, 'LES-001');
      assert.equal(res.data.eligibleItems[1].lessonId, 'LES-003');
      assert.equal(res.data.eligibleItems[2].lessonId, 'LES-002');
    }
  });

  it('7. Returns empty eligible set when no candidates pass filters', () => {
    const candidates = [
      {
        lessonId: 'LES-099',
        status: 'RETIRED',
      },
    ];

    const res = filterEligibleGuidance(candidates);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 0);
      assert.equal(res.data.excludedItemsCount, 1);
      assert.deepEqual(res.data.eligibleItems, []);
    }
  });

  it('8. Preserves input query and candidate immutability without mutation', () => {
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

    // Inputs must NOT be mutated
    assert.deepEqual(candidates, candidatesCopy);
    assert.deepEqual(queryParams, queryCopy);
  });

  it('9. DeterministicFilter class integrates with persistence port in read-only mode', () => {
    const res = filter.filterEligible([]);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalCandidatesEvaluated, 0);
    }
  });

  it('10. Operates purely deterministically without semantic ranking or AI scoring', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
      { lessonId: 'LES-002', status: 'APPROVED', approvedAt: '2026-09-02T10:00:00Z' },
    ];

    const run1 = filterEligibleGuidance(candidates);
    const run2 = filterEligibleGuidance(candidates);

    assert.equal(run1.ok, true);
    assert.equal(run2.ok, true);
    if (run1.ok && run2.ok) {
      assert.deepEqual(run1.data.eligibleItems, run2.data.eligibleItems);
    }
  });
});
