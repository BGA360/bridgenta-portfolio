import { z } from 'zod';
import { EventIdSchema, VersionValueSchema, TimestampIsoSchema, OpaquePayloadSchema } from '../types/primitives.js';
import { EventTypeEnumSchema } from '../types/enums.js';
import { ActorIdentityRefSchema, AuthorityContextRefSchema } from '../contracts/references.js';

/**
 * 1. SupportedKnownGovernanceEventEnvelopeSchema
 */
export const SupportedKnownGovernanceEventEnvelopeSchema = z
  .object({
    branchType: z.literal('SUPPORTED_KNOWN_EVENT'),
    eventId: EventIdSchema,
    eventType: EventTypeEnumSchema,
    payloadVersion: VersionValueSchema,
    occurredAt: TimestampIsoSchema,
    actorRef: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    payload: z.unknown(),
  })
  .strict();
export type SupportedKnownGovernanceEventEnvelope = z.infer<typeof SupportedKnownGovernanceEventEnvelopeSchema>;

/**
 * 2. UnsupportedVersionHistoricalEventEnvelopeSchema — Opaque preservation for known eventType with unsupported payloadVersion
 */
export const UnsupportedVersionHistoricalEventEnvelopeSchema = z
  .object({
    branchType: z.literal('UNSUPPORTED_VERSION_HISTORICAL_EVENT'),
    eventId: EventIdSchema,
    eventType: EventTypeEnumSchema,
    payloadVersion: VersionValueSchema,
    occurredAt: TimestampIsoSchema,
    actorRef: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    payload: OpaquePayloadSchema,
  })
  .strict();
export type UnsupportedVersionHistoricalEventEnvelope = z.infer<typeof UnsupportedVersionHistoricalEventEnvelopeSchema>;

/**
 * 3. UnknownTypeHistoricalEventEnvelopeSchema — Opaque preservation for unknown eventType
 */
export const UnknownTypeHistoricalEventEnvelopeSchema = z
  .object({
    branchType: z.literal('UNKNOWN_TYPE_HISTORICAL_EVENT'),
    eventId: EventIdSchema,
    eventType: z.string().min(1),
    payloadVersion: VersionValueSchema,
    occurredAt: TimestampIsoSchema,
    actorRef: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    payload: OpaquePayloadSchema,
  })
  .strict();
export type UnknownTypeHistoricalEventEnvelope = z.infer<typeof UnknownTypeHistoricalEventEnvelopeSchema>;

/**
 * 4. StoredHistoricalEventSchema — 3-Branch Mutually Exclusive Discriminated Union
 */
export const StoredHistoricalEventSchema = z.discriminatedUnion('branchType', [
  SupportedKnownGovernanceEventEnvelopeSchema,
  UnsupportedVersionHistoricalEventEnvelopeSchema,
  UnknownTypeHistoricalEventEnvelopeSchema,
]);
export type StoredHistoricalEvent = z.infer<typeof StoredHistoricalEventSchema>;
