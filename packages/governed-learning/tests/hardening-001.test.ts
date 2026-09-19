import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  InMemoryIdempotencyStore,
  InMemoryRuntimeIntegrityUnitOfWork,
  createCommandFingerprint,
  compareCommandIdentityMetadata,
  canonicalizeValue,
  getConcurrencyScope,
  GovernanceCommandRecordSchema,
} from '../src/index.js';
import type { GovernanceCommandEnvelope, GovernanceCommandRecord } from '../src/index.js';

describe('GL-HARDENING-001 Runtime Integrity Contracts & Adapters', () => {
  // --- PART 12: IDEMPOTENCY STORE TESTS (1-7) ---

  it('1. empty lookup returns no record (data is undefined)', () => {
    const store = new InMemoryIdempotencyStore();
    const result = store.getCommandExecution('cmd_unseen_123');
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.strictEqual(result.category, 'SUCCESS');
      assert.strictEqual(result.data, undefined);
    }
  });

  it('2. command record can be stored', () => {
    const store = new InMemoryIdempotencyStore();
    const record: GovernanceCommandRecord = {
      commandId: 'cmd_001',
      commandFingerprint: 'fp_sha256_abcdef1234567890',
      commandType: 'DraftObservation',
      payloadVersion: '1.0.0',
      recordedAt: '2026-09-19T10:00:00.000Z',
      executionOutcome: {
        ok: true,
        category: 'SUCCESS',
        outcome: 'OBSERVATION_DRAFTED',
        data: { state: 'DRAFT' },
      },
    };

    const recordResult = store.recordCommandExecution(record);
    assert.strictEqual(recordResult.ok, true);
    if (recordResult.ok) {
      assert.strictEqual(recordResult.category, 'SUCCESS');
      assert.strictEqual(recordResult.data.recorded, true);
      assert.strictEqual(recordResult.data.record.commandId, 'cmd_001');
    }
  });

  it('3. stored record can be retrieved by commandId', () => {
    const store = new InMemoryIdempotencyStore();
    const record: GovernanceCommandRecord = {
      commandId: 'cmd_002',
      commandFingerprint: 'fp_sha256_9876543210fedcba',
      commandType: 'SubmitObservation',
      payloadVersion: '1.0.0',
      recordedAt: '2026-09-19T10:05:00.000Z',
      executionOutcome: {
        ok: true,
        category: 'SUCCESS',
        outcome: 'OBSERVATION_SUBMITTED',
        data: { state: 'SUBMITTED' },
      },
    };

    store.recordCommandExecution(record);
    const getResult = store.getCommandExecution('cmd_002');
    assert.strictEqual(getResult.ok, true);
    if (getResult.ok) {
      assert.strictEqual(getResult.data?.commandId, 'cmd_002');
      assert.strictEqual(getResult.data?.commandFingerprint, 'fp_sha256_9876543210fedcba');
      assert.strictEqual(getResult.data?.commandType, 'SubmitObservation');
    }
  });

  it('4. unrelated command IDs do not collide', () => {
    const store = new InMemoryIdempotencyStore();
    const rec1: GovernanceCommandRecord = {
      commandId: 'cmd_101',
      commandFingerprint: 'fp_101',
      commandType: 'DraftObservation',
      payloadVersion: '1.0.0',
      recordedAt: '2026-09-19T10:00:00.000Z',
      executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'DRAFTED' },
    };
    const rec2: GovernanceCommandRecord = {
      commandId: 'cmd_102',
      commandFingerprint: 'fp_102',
      commandType: 'SubmitObservation',
      payloadVersion: '1.0.0',
      recordedAt: '2026-09-19T10:00:00.000Z',
      executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'SUBMITTED' },
    };

    store.recordCommandExecution(rec1);
    store.recordCommandExecution(rec2);

    const res1 = store.getCommandExecution('cmd_101');
    const res2 = store.getCommandExecution('cmd_102');
    const res3 = store.getCommandExecution('cmd_103');

    assert.strictEqual(res1.ok && res1.data?.commandFingerprint, 'fp_101');
    assert.strictEqual(res2.ok && res2.data?.commandFingerprint, 'fp_102');
    assert.strictEqual(res3.ok && res3.data, undefined);
  });

  it('5. caller mutation cannot mutate stored internal state (defensive cloning)', () => {
    const store = new InMemoryIdempotencyStore();
    const payloadData: Record<string, unknown> = { state: 'DRAFT' };
    const record: GovernanceCommandRecord = {
      commandId: 'cmd_005',
      commandFingerprint: 'fp_005',
      commandType: 'DraftObservation',
      payloadVersion: '1.0.0',
      recordedAt: '2026-09-19T10:00:00.000Z',
      executionOutcome: {
        ok: true,
        category: 'SUCCESS',
        outcome: 'DRAFTED',
        data: payloadData,
      },
    };

    store.recordCommandExecution(record);
    // Mutate caller's original object
    payloadData.state = 'CORRUPTED_BY_CALLER';

    const getResult1 = store.getCommandExecution('cmd_005');
    assert.strictEqual(getResult1.ok, true);
    if (getResult1.ok && getResult1.data) {
      assert.strictEqual((getResult1.data.executionOutcome.data as Record<string, unknown>).state, 'DRAFT');
      // Mutate retrieved object
      (getResult1.data.executionOutcome.data as Record<string, unknown>).state = 'CORRUPTED_BY_GETTER';
    }

    const getResult2 = store.getCommandExecution('cmd_005');
    assert.strictEqual(getResult2.ok, true);
    if (getResult2.ok && getResult2.data) {
      assert.strictEqual((getResult2.data.executionOutcome.data as Record<string, unknown>).state, 'DRAFT');
    }
  });

  it('6. duplicate record handling is deterministic', () => {
    const store = new InMemoryIdempotencyStore();
    const record: GovernanceCommandRecord = {
      commandId: 'cmd_006',
      commandFingerprint: 'fp_006',
      commandType: 'DraftObservation',
      payloadVersion: '1.0.0',
      recordedAt: '2026-09-19T10:00:00.000Z',
      executionOutcome: { ok: true, category: 'SUCCESS', outcome: 'DRAFTED' },
    };

    const first = store.recordCommandExecution(record);
    assert.strictEqual(first.ok, true);
    if (first.ok) {
      assert.strictEqual(first.data.recorded, true);
    }

    // Exact duplicate recording
    const second = store.recordCommandExecution(record);
    assert.strictEqual(second.ok, true);
    if (second.ok) {
      assert.strictEqual(second.data.recorded, false);
      assert.strictEqual(second.data.record.commandId, 'cmd_006');
    }

    // Conflicting duplicate recording (same commandId, different fingerprint)
    const conflictingRecord: GovernanceCommandRecord = {
      ...record,
      commandFingerprint: 'fp_006_DIFFERENT',
    };
    const mismatchResult = store.recordCommandExecution(conflictingRecord);
    assert.strictEqual(mismatchResult.ok, false);
    assert.strictEqual(mismatchResult.category, 'ERROR');
  });

  it('7. store error path uses runtime error taxonomy where applicable', () => {
    const store = new InMemoryIdempotencyStore();
    const invalidRecord = {
      commandId: 'cmd_invalid',
      // missing required fields
    } as unknown as GovernanceCommandRecord;

    const result = store.recordCommandExecution(invalidRecord);
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.category, 'ERROR');
  });

  // --- PART 12: FINGERPRINTING TESTS (8-18) ---

  const baseEnvelope: GovernanceCommandEnvelope = {
    commandId: 'cmd_fp_001',
    commandType: 'DraftObservation',
    payloadVersion: '1.0.0',
    issuedAt: '2026-09-19T10:00:00.000Z',
    actorRef: { actorId: 'actor_alice', actorType: 'AGENT' },
    authorityContextRef: { authorityId: 'auth_sys' },
    payload: { category: 'ARCHITECTURE', statement: 'Test statement' },
  };

  it('8. identical validated commands produce identical fingerprints', () => {
    const fp1 = createCommandFingerprint(baseEnvelope);
    const fp2 = createCommandFingerprint({ ...baseEnvelope });
    assert.strictEqual(fp1, fp2);
    assert.strictEqual(typeof fp1, 'string');
    assert.strictEqual(fp1.length, 64); // SHA-256 hex string length
  });

  it('9. reordered JSON object keys produce identical fingerprints', () => {
    const env1: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { a: 1, b: 2, c: { x: 10, y: 20 } },
    };
    const env2: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { c: { y: 20, x: 10 }, b: 2, a: 1 },
    };
    assert.strictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('10. different payload produces different fingerprint', () => {
    const env1: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { statement: 'Statement A' },
    };
    const env2: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { statement: 'Statement B' },
    };
    assert.notStrictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('11. different command type produces different fingerprint', () => {
    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, commandType: 'DraftObservation' };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, commandType: 'SubmitObservation' };
    assert.notStrictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('12. different payload version produces different fingerprint', () => {
    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, payloadVersion: '1.0.0' };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, payloadVersion: '2.0.0' };
    assert.notStrictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('13. different actor produces different fingerprint', () => {
    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, actorRef: { actorId: 'alice', actorType: 'HUMAN' } };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, actorRef: { actorId: 'bob', actorType: 'HUMAN' } };
    assert.notStrictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('14. different authority context produces different fingerprint', () => {
    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, authorityContextRef: { authorityId: 'auth_1' } };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, authorityContextRef: { authorityId: 'auth_2' } };
    assert.notStrictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('15. arrays preserve element order', () => {
    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, payload: { items: [1, 2, 3] } };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, payload: { items: [3, 2, 1] } };
    assert.notStrictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('16. nested object key order remains deterministic', () => {
    const obj1 = canonicalizeValue({ z: { b: 1, a: 2 }, y: [1, { k: 'v', a: 'x' }] });
    const obj2 = canonicalizeValue({ y: [1, { a: 'x', k: 'v' }], z: { a: 2, b: 1 } });
    assert.deepStrictEqual(obj1, obj2);
    assert.strictEqual(JSON.stringify(obj1), JSON.stringify(obj2));
  });

  it('17. commandId does not affect fingerprint', () => {
    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, commandId: 'cmd_alpha' };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, commandId: 'cmd_beta' };
    assert.strictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));
  });

  it('18. document/test current issuedAt treatment (issuedAt is excluded from fingerprint)', () => {
    const env1: GovernanceCommandEnvelope = { ...baseEnvelope, issuedAt: '2026-09-19T10:00:00.000Z' };
    const env2: GovernanceCommandEnvelope = { ...baseEnvelope, issuedAt: '2026-09-19T10:07:00.000Z' };
    assert.strictEqual(createCommandFingerprint(env1), createCommandFingerprint(env2));

    // compareCommandIdentityMetadata helper verifies exact envelope identity match
    const identityMatch = compareCommandIdentityMetadata(env1, env2);
    assert.strictEqual(identityMatch.matches, true);
  });

  // --- PART 12: UNIT OF WORK / TRANSACTION CONTRACT TESTS (19-21) ---

  it('19. operation executes through the unit-of-work abstraction', async () => {
    const uow = new InMemoryRuntimeIntegrityUnitOfWork();
    let executed = false;

    const res = await uow.execute((ctx) => {
      executed = true;
      assert.ok(ctx.transactionId.startsWith('tx_mem_'));
      return 'RESULT';
    });

    assert.strictEqual(executed, true);
    assert.strictEqual(res, 'RESULT');
  });

  it('20. transaction context is passed consistently where defined', () => {
    const uow = new InMemoryRuntimeIntegrityUnitOfWork();
    uow.execute((ctx) => {
      assert.strictEqual(typeof ctx.transactionId, 'string');
      assert.strictEqual(typeof ctx.createdAt, 'string');
      assert.strictEqual(ctx.isDurable, false);
    });
  });

  it('21. Level 1 adapter does not claim durable guarantees (isDurable is false)', () => {
    const uow = new InMemoryRuntimeIntegrityUnitOfWork();
    uow.execute((ctx) => {
      assert.strictEqual(ctx.isDurable, false);
    });
  });

  // --- PART 12: CONCURRENCY SCOPE TESTS (22-23) ---

  it('22. getConcurrencyScope extracts deterministic aggregate keys and preserves multi-key sorting', () => {
    const envObs: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { observationRef: { observationId: 'obs_999' } },
    };
    assert.deepStrictEqual(getConcurrencyScope(envObs), ['obs:obs_999']);

    const envCand: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      payload: { candidateRef: { candidateId: 'cand_555' } },
    };
    assert.deepStrictEqual(getConcurrencyScope(envCand), ['cand:cand_555']);

    // Multi-aggregate supersession command (keys must be sorted alphabetically)
    const envSupersede: GovernanceCommandEnvelope = {
      ...baseEnvelope,
      commandType: 'SupersedeLesson',
      payload: {
        supersededLessonRef: { lessonId: 'les_zebra' },
        supersedingLessonRef: { lessonId: 'les_apple' },
      },
    };
    assert.deepStrictEqual(getConcurrencyScope(envSupersede), ['lesson:les_apple', 'lesson:les_zebra']);
  });

  it('23. GovernanceCommandRecordSchema validates correctly', () => {
    const record: GovernanceCommandRecord = {
      commandId: 'cmd_schema_check',
      commandFingerprint: 'fp_schema_check',
      commandType: 'DraftObservation',
      payloadVersion: '1.0.0',
      recordedAt: '2026-09-19T10:00:00.000Z',
      executionOutcome: {
        ok: true,
        category: 'SUCCESS',
        outcome: 'DRAFTED',
      },
    };

    const parseResult = GovernanceCommandRecordSchema.safeParse(record);
    assert.strictEqual(parseResult.success, true);
  });
});
