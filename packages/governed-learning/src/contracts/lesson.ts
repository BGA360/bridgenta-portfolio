import { z } from 'zod';
import { GuidanceQueryIdSchema, TimestampIsoSchema } from '../types/primitives.js';
import { GuidanceMatchStrategyEnumSchema, GuidanceResultStatusEnumSchema } from '../types/enums.js';
import { LessonRefSchema, TargetRefSchema } from './references.js';
import { ScopeContractSchema } from './scopes.js';
import { RefusalContractSchema } from './entities.js';

/**
 * CTR-GL-044: ApplicableGuidance — Individual Guidance Item Matched by Query
 */
export const ApplicableGuidanceSchema = z
  .object({
    lessonRef: LessonRefSchema,
    statement: z.string().min(1),
    rationale: z.string().min(1),
    scope: ScopeContractSchema,
  })
  .strict();
export type ApplicableGuidance = z.infer<typeof ApplicableGuidanceSchema>;

/**
 * CTR-GL-045: ApplicableGuidanceSet — Collection of Matched Guidance Items
 */
export const ApplicableGuidanceSetSchema = z
  .object({
    queryId: GuidanceQueryIdSchema,
    matchedGuidance: z.array(ApplicableGuidanceSchema),
    evaluatedAt: TimestampIsoSchema,
    matchStrategy: GuidanceMatchStrategyEnumSchema,
  })
  .strict();
export type ApplicableGuidanceSet = z.infer<typeof ApplicableGuidanceSetSchema>;

/**
 * CTR-GL-051: GuidanceQueryPort — DTO Schema for Guidance Queries
 */
export const GuidanceQueryPortSchema = z
  .object({
    queryId: GuidanceQueryIdSchema,
    targetRef: TargetRefSchema,
    matchStrategy: GuidanceMatchStrategyEnumSchema,
  })
  .strict();
export type GuidanceQueryPort = z.infer<typeof GuidanceQueryPortSchema>;

/**
 * CTR-GL-052: GuidanceQueryResult — DTO Schema for Guidance Query Output
 */
export const GuidanceQueryResultSchema = z
  .object({
    queryId: GuidanceQueryIdSchema,
    status: GuidanceResultStatusEnumSchema,
    guidanceSet: ApplicableGuidanceSetSchema.optional(),
    refusal: RefusalContractSchema.optional(),
  })
  .strict();
export type GuidanceQueryResult = z.infer<typeof GuidanceQueryResultSchema>;
