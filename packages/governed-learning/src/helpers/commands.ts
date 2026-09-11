import { z } from 'zod';
import {
  ObservationIdSchema,
  EvidenceIdSchema,
  LessonIdSchema,
  RuleManifestIdSchema,
  RuleCandidateIdSchema,
  ProjectIdSchema,
  DecisionIdSchema,
  GuidanceQueryIdSchema,
} from '../types/primitives.js';
import {
  ObservationCategoryEnumSchema,
  EvidenceTypeEnumSchema,
  ValidationVerdictEnumSchema,
  CommandTypeEnum,
  GuidanceMatchStrategyEnumSchema,
} from '../types/enums.js';
import {
  ObservationRefSchema,
  EvidenceRefSchema,
  LessonRefSchema,
  LessonFamilyRefSchema,
  ActorIdentityRefSchema,
  AuthorityContextRefSchema,
  DecisionRefSchema,
  TargetRefSchema,
} from '../contracts/references.js';
import { ScopeContractSchema } from '../contracts/scopes.js';
import { GovernanceCommandEnvelopeSchema } from '../contracts/envelopes.js';

// 1. DraftObservationCommandPayloadSchema
export const DraftObservationCommandPayloadSchema = z
  .object({
    category: ObservationCategoryEnumSchema,
    statement: z.string().min(1),
  })
  .strict();

// 2. AttachEvidenceCommandPayloadSchema
export const AttachEvidenceCommandPayloadSchema = z
  .object({
    observationRef: ObservationRefSchema,
    evidenceType: EvidenceTypeEnumSchema,
    location: z.string().min(1),
  })
  .strict();

// 3. SubmitObservationCommandPayloadSchema
export const SubmitObservationCommandPayloadSchema = z
  .object({
    observationRef: ObservationRefSchema,
  })
  .strict();

// 4. ValidateMechanicalObservationCommandPayloadSchema
export const ValidateMechanicalObservationCommandPayloadSchema = z
  .object({
    observationRef: ObservationRefSchema,
    verdict: ValidationVerdictEnumSchema,
  })
  .strict();

// 5. RecordInterpretiveValidationCommandPayloadSchema
export const RecordInterpretiveValidationCommandPayloadSchema = z
  .object({
    observationRef: ObservationRefSchema,
    verdict: ValidationVerdictEnumSchema,
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 6. CreateLessonCandidateCommandPayloadSchema
export const CreateLessonCandidateCommandPayloadSchema = z
  .object({
    statement: z.string().min(1),
    rationale: z.string().min(1),
    scope: ScopeContractSchema,
    originatingObservationRefs: z.array(ObservationRefSchema),
  })
  .strict();

// 7. SubmitLessonForReviewCommandPayloadSchema
export const SubmitLessonForReviewCommandPayloadSchema = z
  .object({
    lessonFamilyRef: LessonFamilyRefSchema,
  })
  .strict();

// 8. InvalidateLessonCandidateCommandPayloadSchema
export const InvalidateLessonCandidateCommandPayloadSchema = z
  .object({
    lessonFamilyRef: LessonFamilyRefSchema,
    reason: z.string().min(1),
  })
  .strict();

// 9. ApproveLessonCommandPayloadSchema
export const ApproveLessonCommandPayloadSchema = z
  .object({
    lessonFamilyRef: LessonFamilyRefSchema,
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 10. RejectLessonCommandPayloadSchema
export const RejectLessonCommandPayloadSchema = z
  .object({
    lessonFamilyRef: LessonFamilyRefSchema,
    reason: z.string().min(1),
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 11. RequestLessonRevisionCommandPayloadSchema
export const RequestLessonRevisionCommandPayloadSchema = z
  .object({
    lessonFamilyRef: LessonFamilyRefSchema,
    feedback: z.string().min(1),
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 12. SupersedeLessonCommandPayloadSchema
export const SupersedeLessonCommandPayloadSchema = z
  .object({
    supersededLessonRef: LessonRefSchema,
    supersedingLessonRef: LessonRefSchema,
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 13. RetireLessonCommandPayloadSchema
export const RetireLessonCommandPayloadSchema = z
  .object({
    retiredLessonRef: LessonRefSchema,
    reason: z.string().min(1),
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 14. AdoptLessonCommandPayloadSchema
export const AdoptLessonCommandPayloadSchema = z
  .object({
    lessonRef: LessonRefSchema,
    projectRef: z.object({ projectId: ProjectIdSchema }).strict(),
  })
  .strict();

// 15. BuildGuidanceSetQueryCommandPayloadSchema
export const BuildGuidanceSetQueryCommandPayloadSchema = z
  .object({
    queryId: GuidanceQueryIdSchema,
    targetRef: TargetRefSchema,
    matchStrategy: GuidanceMatchStrategyEnumSchema,
  })
  .strict();

// 16. ProposeRuleCandidateCommandPayloadSchema
export const ProposeRuleCandidateCommandPayloadSchema = z
  .object({
    ruleManifestId: RuleManifestIdSchema,
    proposedRule: z.string().min(1),
    sourceLessonRef: LessonRefSchema,
  })
  .strict();

/**
 * CommandPayloadSchemaRegistry — Dynamic per-command-type registry
 */
export class CommandPayloadSchemaRegistryClass {
  private registry = new Map<string, Map<string, z.ZodSchema>>();

  registerSchema(commandType: CommandTypeEnum, payloadVersion: string, schema: z.ZodSchema): void {
    if (!this.registry.has(commandType)) {
      this.registry.set(commandType, new Map());
    }
    this.registry.get(commandType)!.set(payloadVersion, schema);
  }

  getSchema(commandType: string, payloadVersion: string): z.ZodSchema | undefined {
    return this.registry.get(commandType)?.get(payloadVersion);
  }

  isSupportedVersion(commandType: string, payloadVersion: string): boolean {
    return this.registry.get(commandType)?.has(payloadVersion) ?? false;
  }
}

export const CommandPayloadSchemaRegistry = new CommandPayloadSchemaRegistryClass();

export function IsSupportedCommandPayloadVersion(commandType: string, payloadVersion: string): boolean {
  return CommandPayloadSchemaRegistry.isSupportedVersion(commandType, payloadVersion);
}

/**
 * KnownCommandEnvelopeSchema — Envelope validation helper
 */
export const KnownCommandEnvelopeSchema = GovernanceCommandEnvelopeSchema;
