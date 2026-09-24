import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DeterministicEligibilityFilter, filterEligibleGuidance } from '../src/runtime/eligibility.js';
import { InMemoryGovernanceRepository } from '../src/runtime/persistence.js';

describe('DeterministicEligibilityFilter & filterEligibleGuidance (GL-IMPL-UNIT-008)', () => {
  let repository: InMemoryGovernanceRepository;
  let filter: DeterministicEligibilityFilter;

  const validTargetRef = {
    targetCategory: 'PROJECT',
    projectRef: { projectId: 'PRJ-ALPHA' },
  };

  beforeEach(() => {
    repository = new InMemoryGovernanceRepository();
    filter = new DeterministicEligibilityFilter(repository);
  });

  it('1. PUBLISHED lesson with matching target/scope is eligible', () => {
    const candidates = [
      {
        lessonId: 'LES-001',
        statement: 'Published advisory lesson',
        status: 'PUBLISHED',
        scope: {
          scopeType: 'SINGLE_FRAMEWORK',
          frameworkRef: { frameworkId: 'ASTRO_FW' },
        },
        publishedAt: '2026-09-01T10:00:00Z',
      },
    ];

    const res = filterEligibleGuidance(candidates, {
      targetRef: validTargetRef,
      frameworkId: 'ASTRO_FW',
    });

    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalCandidatesEvaluated, 1);
      assert.equal(res.data.eligibleItemsCount, 1);
      assert.equal(res.data.excludedItemsCount, 0);
      assert.equal(res.data.eligibleItems[0].status, 'PUBLISHED');
    }
  });

  it('2. DEPRECATED lesson is excluded', () => {
    const candidates = [
      {
        lessonId: 'LES-002',
        statement: 'Deprecated lesson',
        status: 'DEPRECATED',
      },
    ];

    const res = filterEligibleGuidance(candidates, { targetRef: validTargetRef });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 0);
      assert.equal(res.data.excludedItemsCount, 1);
      assert.equal(res.data.exclusionReasons[0].reason, 'EXCLUDED_INACTIVE_LESSON');
    }
  });

  it('3. SUPERSEDED lesson is excluded', () => {
    const candidates = [
      {
        lessonId: 'LES-003',
        statement: 'Superseded lesson',
        status: 'SUPERSEDED',
      },
    ];

    const res = filterEligibleGuidance(candidates, { targetRef: validTargetRef });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 0);
      assert.equal(res.data.excludedItemsCount, 1);
      assert.equal(res.data.exclusionReasons[0].reason, 'EXCLUDED_SUPERSEDED_LESSON');
    }
  });

  it('4. APPROVED is not treated as equivalent to PUBLISHED', () => {
    const candidates = [
      {
        lessonId: 'LES-004',
        statement: 'Approved physical schema lesson',
        status: 'APPROVED',
      },
    ];

    const res = filterEligibleGuidance(candidates, { targetRef: validTargetRef });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 0);
      assert.equal(res.data.excludedItemsCount, 1);
      assert.equal(res.data.exclusionReasons[0].reason, 'EXCLUDED_NON_PUBLISHED_STATUS_APPROVED');
    }
  });

  it('5. RETIRED is not treated as equivalent to DEPRECATED', () => {
    const candidates = [
      {
        lessonId: 'LES-005',
        statement: 'Retired physical schema lesson',
        status: 'RETIRED',
      },
    ];

    const res = filterEligibleGuidance(candidates, { targetRef: validTargetRef });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 0);
      assert.equal(res.data.excludedItemsCount, 1);
      assert.equal(res.data.exclusionReasons[0].reason, 'EXCLUDED_NON_PUBLISHED_STATUS_RETIRED');
    }
  });

  it('6. missing TargetRef returns ERROR (INV-GL-033)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'PUBLISHED', publishedAt: '2026-09-01T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, {});
    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'ERROR') {
      assert.ok(res.error.message.includes('INV-GL-033'));
    }
  });

  it('7. context-only fields cannot substitute for TargetRef', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'PUBLISHED', publishedAt: '2026-09-01T10:00:00Z' },
    ];

    for (const invalidQuery of [
      { frameworkId: 'ASTRO_FW' },
      { projectId: 'PRJ-ALPHA' },
      { workstreamId: 'WS-001' },
      { scope: { scopeType: 'SYSTEM_WIDE' } },
    ]) {
      const res = filterEligibleGuidance(candidates, invalidQuery as unknown as Record<string, unknown>);
      assert.equal(res.ok, false);
      if (!res.ok && res.category === 'ERROR') {
        assert.ok(res.error.message.includes('INV-GL-033'));
      }
    }
  });

  it('8. getEvents is never called during eligibility filtering', () => {
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
      getLessons: repository.getLessons.bind(repository),
    };

    const spyFilter = new DeterministicEligibilityFilter(testSpyRepository);
    const res = spyFilter.filterEligible(undefined, { targetRef: validTargetRef, frameworkId: 'ASTRO_FW' });

    assert.equal(res.ok, false);
    assert.equal(getEventsCalled, false);
  });

  it('9. identical runs return deeply equal results (full result determinism)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'PUBLISHED', publishedAt: '2026-09-01T10:00:00Z' },
      { lessonId: 'LES-002', status: 'PUBLISHED', publishedAt: '2026-09-02T10:00:00Z' },
    ];

    const queryParams = { targetRef: validTargetRef, frameworkId: 'ASTRO_FW' };

    const run1 = filterEligibleGuidance(candidates, queryParams);
    const run2 = filterEligibleGuidance(candidates, queryParams);

    assert.equal(run1.ok, true);
    assert.equal(run2.ok, true);
    if (run1.ok && run2.ok) {
      assert.deepStrictEqual(run1, run2);
    }
  });

  it('10. no limit or evaluatedAt behavior exists', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'PUBLISHED', publishedAt: '2026-09-01T10:00:00Z' },
      { lessonId: 'LES-002', status: 'PUBLISHED', publishedAt: '2026-09-02T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, { targetRef: validTargetRef });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal('limit' in res.data.queryParams, false);
      assert.equal((res.data as unknown as Record<string, unknown>).evaluatedAt, undefined);
    }
  });
});
