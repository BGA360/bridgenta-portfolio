import { z } from 'zod';
import { EventDispatchOutcomeEnumSchema, CommandDispatchOutcomeEnumSchema } from '../types/enums.js';

export const EventDispatchOutcomeSchema = z
  .object({
    outcome: EventDispatchOutcomeEnumSchema,
    message: z.string().min(1),
    details: z.record(z.unknown()).optional(),
  })
  .strict();
export type EventDispatchOutcome = z.infer<typeof EventDispatchOutcomeSchema>;

export const CommandDispatchOutcomeSchema = z
  .object({
    outcome: CommandDispatchOutcomeEnumSchema,
    message: z.string().min(1),
    details: z.record(z.unknown()).optional(),
  })
  .strict();
export type CommandDispatchOutcome = z.infer<typeof CommandDispatchOutcomeSchema>;
