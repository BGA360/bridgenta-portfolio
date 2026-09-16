import { z } from 'zod';
import { EventIdSchema, CommandIdSchema, VersionValueSchema, TimestampIsoSchema } from '../types/primitives.js';
import { EventTypeEnumSchema, CommandTypeEnumSchema } from '../types/enums.js';
import { ActorIdentityRefSchema, AuthorityContextRefSchema } from './references.js';

/**
 * CTR-GL-040: GovernanceEventEnvelope — Canonical Architectural Event Envelope
 */
export const GovernanceEventEnvelopeSchema = z
  .object({
    eventId: EventIdSchema,
    eventType: EventTypeEnumSchema,
    payloadVersion: VersionValueSchema,
    occurredAt: TimestampIsoSchema,
    actorRef: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    payload: z.unknown(),
  })
  .strict();
export type GovernanceEventEnvelope = z.infer<typeof GovernanceEventEnvelopeSchema>;

/**
 * CTR-GL-041: GovernanceCommandEnvelope — Canonical Architectural Command Envelope
 */
export const GovernanceCommandEnvelopeSchema = z
  .object({
    commandId: CommandIdSchema,
    commandType: CommandTypeEnumSchema,
    payloadVersion: VersionValueSchema,
    issuedAt: TimestampIsoSchema,
    actorRef: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    payload: z.unknown(),
  })
  .strict();
export type GovernanceCommandEnvelope = z.infer<typeof GovernanceCommandEnvelopeSchema>;
