import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  GovernanceProcessingPipeline,
  dispatchGovernanceCommand,
  dispatchGovernanceEvent,
} from '../src/runtime/pipeline.js';
import {
  CommandPayloadSchemaRegistry,
  SubmitObservationCommandPayloadSchema,
} from '../src/helpers/commands.js';
import {
  EventPayloadSchemaRegistry,
  ObservationCreatedEventPayloadSchema,
} from '../src/helpers/events.js';
import { GovernedLearningRuntimeError } from '../src/runtime/errors.js';
import type { RuntimeExecutionStageOutcome } from '../src/runtime/types.js';

describe('Governed Learning Runtime Wave 3 Pipeline & Dispatcher', () => {
  const validActorRef = {
    actorId: 'act-00000000-0000-4000-8000-000000000001',
    actorType: 'HUMAN',
  };

  const validAuthorityContextRef = {
    authorityContextId: 'actx-00000000-0000-4000-8000-000000000001',
  };

  const validSubmitObservationCommand = {
    commandId: 'cmd-00000000-0000-4000-8000-000000000001',
    commandType: 'SubmitObservation',
    payloadVersion: '1.0.0',
    issuedAt: '2026-01-01T00:00:00.000Z',
    actorRef: validActorRef,
    authorityContextRef: validAuthorityContextRef,
    payload: {
      observationRef: { observationId: 'obs-00000000-0000-4000-8000-000000000001' },
    },
  };

  const validObservationCreatedEvent = {
    eventId: 'evt-00000000-0000-4000-8000-000000000001',
    eventType: 'OBSERVATION_CREATED',
    payloadVersion: '1.0.0',
    occurredAt: '2026-01-01T00:00:00.000Z',
    actorRef: validActorRef,
    authorityContextRef: validAuthorityContextRef,
    payload: {
      observationId: 'obs-00000000-0000-4000-8000-000000000001',
      category: 'MECHANICAL',
      statement: 'Sample mechanical telemetry statement',
      evidenceRefs: [],
    },
  };

  before(() => {
    // Register schemas for testing bounded dispatch
    CommandPayloadSchemaRegistry.registerSchema(
      'SubmitObservation',
      '1.0.0',
      SubmitObservationCommandPayloadSchema
    );
    EventPayloadSchemaRegistry.registerSchema(
      'OBSERVATION_CREATED',
      '1.0.0',
      ObservationCreatedEventPayloadSchema
    );
  });

  test('dispatchGovernanceCommand routes supported known command correctly', () => {
    const result = dispatchGovernanceCommand(validSubmitObservationCommand);
    assert.equal(result.ok, true);
    assert.equal(result.outcome, 'SUPPORTED_KNOWN_COMMAND');
    assert.equal(result.commandType, 'SubmitObservation');
    assert.equal(result.payloadVersion, '1.0.0');
  });

  test('dispatchGovernanceCommand identifies invalid command envelope', () => {
    const malformedEnvelope = { ...validSubmitObservationCommand, commandId: '' };
    const result = dispatchGovernanceCommand(malformedEnvelope);
    assert.equal(result.ok, false);
    assert.equal(result.outcome, 'INVALID_COMMAND_ENVELOPE');
  });

  test('dispatchGovernanceCommand identifies unknown command type', () => {
    const unknownCommand = { ...validSubmitObservationCommand, commandType: 'UnknownCommand' };
    const result = dispatchGovernanceCommand(unknownCommand);
    assert.equal(result.ok, false);
    assert.equal(result.outcome, 'UNKNOWN_COMMAND_TYPE');
  });

  test('dispatchGovernanceCommand identifies unsupported command payload version', () => {
    const unsupportedVerCommand = { ...validSubmitObservationCommand, payloadVersion: '99.0.0' };
    const result = dispatchGovernanceCommand(unsupportedVerCommand);
    assert.equal(result.ok, false);
    assert.equal(result.outcome, 'UNSUPPORTED_COMMAND_PAYLOAD_VERSION');
  });

  test('dispatchGovernanceCommand identifies invalid supported command payload', () => {
    const invalidPayloadCommand = {
      ...validSubmitObservationCommand,
      payload: { observationRef: { observationId: '' } },
    };
    const result = dispatchGovernanceCommand(invalidPayloadCommand);
    assert.equal(result.ok, false);
    assert.equal(result.outcome, 'INVALID_SUPPORTED_COMMAND_PAYLOAD');
  });

  test('dispatchGovernanceEvent routes supported known event correctly', () => {
    const result = dispatchGovernanceEvent(validObservationCreatedEvent);
    assert.equal(result.ok, true);
    assert.equal(result.outcome, 'SUPPORTED_KNOWN_EVENT');
    assert.equal(result.eventType, 'OBSERVATION_CREATED');
  });

  test('GovernanceProcessingPipeline executes all 11 stages sequentially for valid command', () => {
    const pipeline = new GovernanceProcessingPipeline();
    const result = pipeline.processCommand(validSubmitObservationCommand);
    assert.equal(result.ok, true);
    assert.equal(result.category, 'SUCCESS');
    assert.equal(result.currentStage, 'DISPATCH_ROUTER');
    assert.equal(result.stageOutcomes.length, 11);

    const stageIds = result.stageOutcomes.map((s: RuntimeExecutionStageOutcome) => s.stageId);
    assert.deepEqual(stageIds, [
      'ENVELOPE_STRUCTURAL_PARSE',
      'TYPE_DISCRIMINATOR_CHECK',
      'VERSION_SUPPORT_CHECK',
      'PAYLOAD_STRUCTURAL_PARSE',
      'ACTOR_REF_STRUCTURAL_CHECK',
      'AUTHORITY_CONTEXT_REF_CHECK',
      'PROVENANCE_REF_CHECK',
      'IDEMPOTENCY_DETERMINISTIC_CHECK',
      'CONCURRENCY_CONTROL_CHECK',
      'DETERMINISTIC_POLICY_GATE',
      'DISPATCH_ROUTER',
    ]);
  });

  test('GovernanceProcessingPipeline short-circuits on malformed envelope at stage 1', () => {
    const pipeline = new GovernanceProcessingPipeline();
    const malformed = { ...validSubmitObservationCommand, commandId: '' };
    const result = pipeline.processCommand(malformed);
    assert.equal(result.ok, false);
    assert.equal(result.category, 'ERROR');
    assert.equal(result.currentStage, 'ENVELOPE_STRUCTURAL_PARSE');
    assert.equal(result.stageOutcomes[0].status, 'FAILED');
    assert.equal(result.stageOutcomes[1].status, 'SKIPPED');
  });

  test('GovernanceProcessingPipeline short-circuits on malformed actorRef at stage 1 envelope parse', () => {
    const pipeline = new GovernanceProcessingPipeline();
    const invalidActorRef = {
      ...validSubmitObservationCommand,
      actorRef: { actorId: '', actorType: 'INVALID' },
    };
    const result = pipeline.processCommand(invalidActorRef);
    assert.equal(result.ok, false);
    assert.equal(result.category, 'ERROR');
    assert.equal(result.currentStage, 'ENVELOPE_STRUCTURAL_PARSE');
    assert.equal(result.stageOutcomes[0].status, 'FAILED');
    assert.equal(result.stageOutcomes[1].status, 'SKIPPED');
  });

  test('Pipeline is deterministic and preserves input immutability', () => {
    const pipeline = new GovernanceProcessingPipeline();
    const inputCopy = JSON.parse(JSON.stringify(validSubmitObservationCommand));
    const r1 = pipeline.processCommand(validSubmitObservationCommand);
    const r2 = pipeline.processCommand(validSubmitObservationCommand);

    assert.equal(r1.ok, r2.ok);
    assert.equal(r1.currentStage, r2.currentStage);
    assert.deepEqual(validSubmitObservationCommand, inputCopy);
  });

  test('Pipeline errors remain runtime ERRORs and are not converted to domain REFUSED', () => {
    const pipeline = new GovernanceProcessingPipeline();
    const result = pipeline.processCommand(null);
    assert.equal(result.ok, false);
    assert.equal(result.category, 'ERROR');
    assert.ok(result.error instanceof GovernedLearningRuntimeError);
    assert.equal('refusalCode' in result, false);
  });

  test('Stage 8 (idempotency) and Stage 9 (concurrency) function as pass-through neutral placeholders', () => {
    const pipeline = new GovernanceProcessingPipeline();
    const result = pipeline.processCommand(validSubmitObservationCommand);
    assert.equal(result.ok, true);
    const stage8 = result.stageOutcomes.find((s: RuntimeExecutionStageOutcome) => s.stageId === 'IDEMPOTENCY_DETERMINISTIC_CHECK');
    const stage9 = result.stageOutcomes.find((s: RuntimeExecutionStageOutcome) => s.stageId === 'CONCURRENCY_CONTROL_CHECK');
    assert.equal(stage8?.status, 'COMPLETED');
    assert.equal(stage9?.status, 'COMPLETED');
  });
});
