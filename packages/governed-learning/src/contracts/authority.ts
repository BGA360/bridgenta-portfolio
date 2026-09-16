import { z } from 'zod';
import { AuthorityContextIdSchema, DecisionIdSchema, TimestampIsoSchema } from '../types/primitives.js';
import { AuthorityTypeEnumSchema } from '../types/enums.js';
import { ActorIdentityRefSchema, AuthorityContextRefSchema } from './references.js';
import { IntegrityDigestSchema } from './entities.js';

/**
 * NON_CONTRACT_INTERNAL_TYPE: AuthorityContextContract — Full Governance Context Record
 */
export const AuthorityContextContractSchema = z
  .object({
    authorityContextId: AuthorityContextIdSchema,
    authorityType: AuthorityTypeEnumSchema,
    actorIdentityRef: ActorIdentityRefSchema,
    validFrom: TimestampIsoSchema,
    validUntil: TimestampIsoSchema,
    restrictions: z.array(z.string()).optional(),
  })
  .strict();
export type AuthorityContextContract = z.infer<typeof AuthorityContextContractSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: AttributedDecisionRecord — Governed Attributed Decision
 */
export const AttributedDecisionRecordSchema = z
  .object({
    decisionId: DecisionIdSchema,
    decisionType: z.string().min(1),
    actorIdentityRef: ActorIdentityRefSchema,
    authorityContextRef: AuthorityContextRefSchema,
    timestamp: TimestampIsoSchema,
    summary: z.string().min(1),
    digest: IntegrityDigestSchema.optional(),
  })
  .strict();
export type AttributedDecisionRecord = z.infer<typeof AttributedDecisionRecordSchema>;
