import { z } from 'zod';
import {
  ObservationIdSchema,
  LessonIdSchema,
  LessonCandidateIdSchema,
  EvidenceIdSchema,
  VersionValueSchema,
  TimestampIsoSchema,
  ProjectIdSchema,
} from '../types/primitives.js';
import {
  ObservationCategoryEnumSchema,
  ValidationTypeEnumSchema,
  ValidationVerdictEnumSchema,
  PublishedLessonStatusEnumSchema,
  EventTypeEnumSchema,
} from '../types/enums.js';
import type { EventTypeEnum } from '../types/enums.js';
import {
  LessonRefSchema,
  LessonCandidateRefSchema,
  RuleCandidateProposalRefSchema,
  ObservationRefSchema,
  EvidenceRefSchema,
  ActorIdentityRefSchema,
  DecisionRefSchema,
  ProjectRefSchema,
  WorkstreamRefSchema,
} from '../contracts/references.js';

// 1. ObservationCreatedEventPayloadSchema
export const ObservationCreatedEventPayloadSchema = z
  .object({
    observationId: ObservationIdSchema,
    category: ObservationCategoryEnumSchema,
    statement: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema),
  })
  .strict();
export type ObservationCreatedEventPayload = z.infer<typeof ObservationCreatedEventPayloadSchema>;

// 2. ObservationValidatedEventPayloadSchema
export const ObservationValidatedEventPayloadSchema = z
  .object({
    observationId: ObservationIdSchema,
    validationType: ValidationTypeEnumSchema,
    verdict: ValidationVerdictEnumSchema,
    validatedBy: ActorIdentityRefSchema,
  })
  .strict();
export type ObservationValidatedEventPayload = z.infer<typeof ObservationValidatedEventPayloadSchema>;

// 3. LessonCandidateCreatedEventPayloadSchema
export const LessonCandidateCreatedEventPayloadSchema = z
  .object({
    candidateId: LessonCandidateIdSchema.optional(),
    lessonId: LessonIdSchema.optional(),
    statement: z.string().min(1),
    originatingObservationRefs: z.array(ObservationRefSchema),
  })
  .strict();
export type LessonCandidateCreatedEventPayload = z.infer<typeof LessonCandidateCreatedEventPayloadSchema>;

// 4. LessonApprovedEventPayloadSchema
export const LessonApprovedEventPayloadSchema = z
  .object({
    lessonRef: LessonRefSchema,
    candidateRef: LessonCandidateRefSchema.optional(),
    decisionRef: DecisionRefSchema,
    status: PublishedLessonStatusEnumSchema.optional(),
  })
  .strict();
export type LessonApprovedEventPayload = z.infer<typeof LessonApprovedEventPayloadSchema>;

// 5. LessonSupersededEventPayloadSchema
export const LessonSupersededEventPayloadSchema = z
  .object({
    supersededLessonRef: LessonRefSchema,
    supersedingLessonRef: LessonRefSchema,
  })
  .strict();
export type LessonSupersededEventPayload = z.infer<typeof LessonSupersededEventPayloadSchema>;

// 6. LessonRetiredEventPayloadSchema
export const LessonRetiredEventPayloadSchema = z
  .object({
    retiredLessonRef: LessonRefSchema,
    reason: z.string().min(1),
  })
  .strict();
export type LessonRetiredEventPayload = z.infer<typeof LessonRetiredEventPayloadSchema>;

// 7. LessonAdoptedEventPayloadSchema
export const LessonAdoptedEventPayloadSchema = z
  .object({
    proposalRef: RuleCandidateProposalRefSchema.optional(),
    lessonRef: LessonRefSchema.optional(),
    adoptedByProjectRef: z.object({ projectId: ProjectIdSchema }).strict().optional(),
    targetProjectRef: ProjectRefSchema.optional(),
    targetWorkstreamRef: WorkstreamRefSchema.optional(),
  })
  .strict();
export type LessonAdoptedEventPayload = z.infer<typeof LessonAdoptedEventPayloadSchema>;

/**
 * EventPayloadSchemaRegistry — Dynamic per-event-type registry
 */
export class EventPayloadSchemaRegistryClass {
  private registry = new Map<string, Map<string, z.ZodSchema>>();

  registerSchema(eventType: EventTypeEnum, payloadVersion: string, schema: z.ZodSchema): void {
    if (!this.registry.has(eventType)) {
      this.registry.set(eventType, new Map());
    }
    this.registry.get(eventType)!.set(payloadVersion, schema);
  }

  getSchema(eventType: string, payloadVersion: string): z.ZodSchema | undefined {
    return this.registry.get(eventType)?.get(payloadVersion);
  }

  isSupportedVersion(eventType: string, payloadVersion: string): boolean {
    return this.registry.get(eventType)?.has(payloadVersion) ?? false;
  }
}

export const EventPayloadSchemaRegistry = new EventPayloadSchemaRegistryClass();

export function IsSupportedEventPayloadVersion(eventType: string, payloadVersion: string): boolean {
  return EventPayloadSchemaRegistry.isSupportedVersion(eventType, payloadVersion);
}
