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
  WorkstreamIdSchema,
} from '../types/primitives.js';
import {
  ObservationCategoryEnumSchema,
  EvidenceTypeEnumSchema,
  ValidationVerdictEnumSchema,
  CommandTypeEnumSchema,
  GuidanceMatchStrategyEnumSchema,
} from '../types/enums.js';
import type { CommandTypeEnum } from '../types/enums.js';
import {
  ObservationRefSchema,
  EvidenceRefSchema,
  LessonRefSchema,
  LessonCandidateRefSchema,
  RuleCandidateProposalRefSchema,
  ActorIdentityRefSchema,
  AuthorityContextRefSchema,
  DecisionRefSchema,
  ProjectRefSchema,
  WorkstreamRefSchema,
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
    candidateRef: LessonCandidateRefSchema,
  })
  .strict();

// 8. InvalidateLessonCandidateCommandPayloadSchema
export const InvalidateLessonCandidateCommandPayloadSchema = z
  .object({
    candidateRef: LessonCandidateRefSchema,
    reason: z.string().min(1),
  })
  .strict();

// 9. ApproveLessonCommandPayloadSchema
export const ApproveLessonCommandPayloadSchema = z
  .object({
    candidateRef: LessonCandidateRefSchema,
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 10. RejectLessonCommandPayloadSchema
export const RejectLessonCommandPayloadSchema = z
  .object({
    candidateRef: LessonCandidateRefSchema,
    reason: z.string().min(1),
    decisionRef: DecisionRefSchema,
  })
  .strict();

// 11. RequestLessonRevisionCommandPayloadSchema
export const RequestLessonRevisionCommandPayloadSchema = z
  .object({
    candidateRef: LessonCandidateRefSchema,
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

// 14. AdoptProposalCommandPayloadSchema (Rule candidate prospective adoption)
export const AdoptProposalCommandPayloadSchema = z
  .object({
    proposalRef: RuleCandidateProposalRefSchema,
    targetProjectRef: ProjectRefSchema.optional(),
    targetWorkstreamRef: WorkstreamRefSchema.optional(),
    decisionRef: DecisionRefSchema,
  })
  .strict();

/** Alias for backward compatibility */
export const AdoptLessonCommandPayloadSchema = AdoptProposalCommandPayloadSchema;

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
