import { z } from 'zod';
import { GuidanceQueryIdSchema, TimestampIsoSchema } from '../types/primitives.js';
import { GuidanceMatchStrategyEnumSchema, GuidanceResultStatusEnumSchema } from '../types/enums.js';
import { LessonRefSchema, TargetRefSchema } from './references.js';
import { ScopeContractSchema } from './scopes.js';
import { RefusalContractSchema, LessonRecordSchema } from './entities.js';

/**
 * CTR-GL-036: LearningContextQuery — Query Contract for Active Lessons
 */
export const LearningContextQuerySchema = z
  .object({
    targetRef: TargetRefSchema,
    scope: ScopeContractSchema.optional(),
    matchStrategy: GuidanceMatchStrategyEnumSchema.optional(),
  })
  .strict();
export type LearningContextQuery = z.infer<typeof LearningContextQuerySchema>;

/**
 * CTR-GL-037: LearningContextQueryResult — Ordered Non-Binding Lessons Matching Query
 */
export const LearningContextQueryResultSchema = z
  .object({
    queryId: GuidanceQueryIdSchema.optional(),
    matchedLessons: z.array(LessonRecordSchema),
    queriedAt: TimestampIsoSchema.optional(),
  })
  .strict();
export type LearningContextQueryResult = z.infer<typeof LearningContextQueryResultSchema>;

/**
 * NON_CONTRACT_INTERNAL_TYPE: ApplicableGuidance — Individual Guidance Item
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
 * NON_CONTRACT_INTERNAL_TYPE: ApplicableGuidanceSet — Collection of Matched Guidance Items
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
 * NON_CONTRACT_INTERNAL_TYPE: GuidanceQueryPort — Guidance Query DTO Schema
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
 * NON_CONTRACT_INTERNAL_TYPE: GuidanceQueryResult — Guidance Query Output DTO Schema
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
