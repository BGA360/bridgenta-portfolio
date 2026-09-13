import { z } from 'zod';
import { FrameworkRefSchema } from './references.js';

/**
 * CTR-GL-037: SingleFrameworkScope
 */
export const SingleFrameworkScopeSchema = z
  .object({
    scopeType: z.literal('SINGLE_FRAMEWORK'),
    frameworkRef: FrameworkRefSchema,
  })
  .strict();
export type SingleFrameworkScope = z.infer<typeof SingleFrameworkScopeSchema>;

/**
 * CTR-GL-038: CrossFrameworkScope Base Schema
 */
export const CrossFrameworkScopeBaseSchema = z
  .object({
    scopeType: z.literal('CROSS_FRAMEWORK'),
    frameworkRefs: z.array(FrameworkRefSchema).min(2, 'CrossFrameworkScope requires at least 2 framework references'),
  })
  .strict();

/**
 * CTR-GL-038: CrossFrameworkScope — Enforces minimum 2 distinct frameworks
 */
export const CrossFrameworkScopeSchema = CrossFrameworkScopeBaseSchema.superRefine((data, ctx) => {
  const ids = data.frameworkRefs.map((ref) => ref.frameworkId);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'CrossFrameworkScope requires distinct frameworkId values',
      path: ['frameworkRefs'],
    });
  }
});
export type CrossFrameworkScope = z.infer<typeof CrossFrameworkScopeSchema>;

/**
 * CTR-GL-039: SystemWideScope
 */
export const SystemWideScopeSchema = z
  .object({
    scopeType: z.literal('SYSTEM_WIDE'),
  })
  .strict();
export type SystemWideScope = z.infer<typeof SystemWideScopeSchema>;

/**
 * CTR-GL-040: ScopeContract — Discriminated Union of Scopes
 */
export const ScopeContractSchema = z.discriminatedUnion('scopeType', [
  SingleFrameworkScopeSchema,
  CrossFrameworkScopeBaseSchema,
  SystemWideScopeSchema,
]);
export type ScopeContract = z.infer<typeof ScopeContractSchema>;
