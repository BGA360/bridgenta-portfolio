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

  it('1. targetRef present -> eligible filtering proceeds', () => {
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

    const res = filterEligibleGuidance(candidates, {
      targetRef: validTargetRef,
      frameworkId: 'ASTRO_FW',
    });

    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.totalCandidatesEvaluated, 1);
      assert.equal(res.data.eligibleItemsCount, 1);
      assert.equal(res.data.excludedItemsCount, 0);
    }
  });

  it('2. no targetRef -> ERROR (INV-GL-033)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, {});
    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'ERROR') {
      assert.ok(res.error.message.includes('INV-GL-033'));
    }
  });

  it('3. frameworkId without targetRef -> ERROR (INV-GL-033)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, { frameworkId: 'ASTRO_FW' });
    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'ERROR') {
      assert.ok(res.error.message.includes('INV-GL-033'));
    }
  });

  it('4. projectId without targetRef -> ERROR (INV-GL-033)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, { projectId: 'PRJ-ALPHA' });
    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'ERROR') {
      assert.ok(res.error.message.includes('INV-GL-033'));
    }
  });

  it('5. workstreamId without targetRef -> ERROR (INV-GL-033)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, { workstreamId: 'WS-001' });
    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'ERROR') {
      assert.ok(res.error.message.includes('INV-GL-033'));
    }
  });

  it('6. scope without targetRef -> ERROR (INV-GL-033)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, { scope: { scopeType: 'SYSTEM_WIDE' } });
    assert.equal(res.ok, false);
    if (!res.ok && res.category === 'ERROR') {
      assert.ok(res.error.message.includes('INV-GL-033'));
    }
  });

  it('7. limit does not exist in query behavior', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
      { lessonId: 'LES-002', status: 'APPROVED', approvedAt: '2026-09-02T10:00:00Z' },
      { lessonId: 'LES-003', status: 'APPROVED', approvedAt: '2026-09-03T10:00:00Z' },
    ];

    const res = filterEligibleGuidance(candidates, { targetRef: validTargetRef });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 3);
      assert.equal('limit' in res.data.queryParams, false);
    }
  });

  it('8. identical inputs produce deeply equal results (full result determinism)', () => {
    const candidates = [
      { lessonId: 'LES-001', status: 'APPROVED', approvedAt: '2026-09-01T10:00:00Z' },
      { lessonId: 'LES-002', status: 'APPROVED', approvedAt: '2026-09-02T10:00:00Z' },
    ];

    const queryParams = { targetRef: validTargetRef, frameworkId: 'ASTRO_FW' };

    const run1 = filterEligibleGuidance(candidates, queryParams);
    const run2 = filterEligibleGuidance(candidates, queryParams);

    assert.equal(run1.ok, true);
    assert.equal(run2.ok, true);
    if (run1.ok && run2.ok) {
      assert.deepStrictEqual(run1, run2);
      assert.equal((run1.data as unknown as Record<string, unknown>).evaluatedAt, undefined);
    }
  });

  it('9. getEvents is never used during eligibility filtering', () => {
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
    const res = spyFilter.filterEligible(undefined, { targetRef: validTargetRef, frameworkId: 'ASTRO_FW' });

    assert.equal(res.ok, false);
    assert.equal(getEventsCalled, false);
  });

  it('10. no implicit lifecycle mapping is introduced (SSoT / schema drift OPEN)', () => {
    const candidates = [
      {
        lessonId: 'LES-001',
        statement: 'Physical schema active APPROVED lesson',
        status: 'APPROVED',
        approvedAt: '2026-09-01T10:00:00Z',
      },
      {
        lessonId: 'LES-002',
        statement: 'SSoT active PUBLISHED lesson',
        status: 'PUBLISHED',
        approvedAt: '2026-09-02T10:00:00Z',
      },
    ];

    const res = filterEligibleGuidance(candidates, { targetRef: validTargetRef });
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.eligibleItemsCount, 2);
      // Verify literal status values are preserved without mapping
      assert.equal(res.data.eligibleItems.find((i) => i.lessonId === 'LES-001')?.status, 'APPROVED');
      assert.equal(res.data.eligibleItems.find((i) => i.lessonId === 'LES-002')?.status, 'PUBLISHED');
    }
  });
});
