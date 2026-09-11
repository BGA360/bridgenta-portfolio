import { z } from 'zod';

export const DigestAlgorithmEnumSchema = z.enum(['SHA256', 'SHA512']);
export type DigestAlgorithmEnum = z.infer<typeof DigestAlgorithmEnumSchema>;

export const ObservationCategoryEnumSchema = z.enum(['MECHANICAL', 'INTERPRETIVE', 'HYBRID']);
export type ObservationCategoryEnum = z.infer<typeof ObservationCategoryEnumSchema>;

export const ValidationTypeEnumSchema = z.enum(['MECHANICAL', 'INTERPRETIVE']);
export type ValidationTypeEnum = z.infer<typeof ValidationTypeEnumSchema>;

export const ValidationVerdictEnumSchema = z.enum(['VALIDATED', 'INVALIDATED', 'INCONCLUSIVE']);
export type ValidationVerdictEnum = z.infer<typeof ValidationVerdictEnumSchema>;

export const LessonStatusEnumSchema = z.enum([
  'CANDIDATE',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'REVISION_REQUESTED',
  'SUPERSEDED',
  'RETIRED',
  'ADOPTED',
]);
export type LessonStatusEnum = z.infer<typeof LessonStatusEnumSchema>;

export const ReviewOutcomeEnumSchema = z.enum(['APPROVE', 'REJECT', 'REQUEST_REVISION']);
export type ReviewOutcomeEnum = z.infer<typeof ReviewOutcomeEnumSchema>;

export const ActorTypeEnumSchema = z.enum(['HUMAN', 'AGENT', 'SYSTEM', 'GOVERNANCE_BODY']);
export type ActorTypeEnum = z.infer<typeof ActorTypeEnumSchema>;

export const AuthorityTypeEnumSchema = z.enum([
  'CONSTITUTIONAL_ARCHITECT',
  'DOMAIN_STEWARD',
  'QUALITY_GATE',
  'SYSTEM_ADMIN',
]);
export type AuthorityTypeEnum = z.infer<typeof AuthorityTypeEnumSchema>;

export const ScopeTypeEnumSchema = z.enum(['SINGLE_FRAMEWORK', 'CROSS_FRAMEWORK', 'SYSTEM_WIDE']);
export type ScopeTypeEnum = z.infer<typeof ScopeTypeEnumSchema>;

export const TargetCategoryEnumSchema = z.enum([
  'OBSERVATION',
  'LESSON',
  'LESSON_CANDIDATE',
  'WORKSTREAM',
  'PROJECT',
  'DECISION',
  'EVENT',
  'RULE_CANDIDATE_PROPOSAL',
  'AUTHORITY_CONTEXT',
]);
export type TargetCategoryEnum = z.infer<typeof TargetCategoryEnumSchema>;

export const EvidenceTypeEnumSchema = z.enum([
  'LOG',
  'METRIC',
  'TRACE',
  'ARTIFACT_DIFF',
  'SCREENSHOT',
  'TEST_RESULT',
  'GOVERNANCE_RECEIPT',
  'OTHER',
]);
export type EvidenceTypeEnum = z.infer<typeof EvidenceTypeEnumSchema>;

/**
 * RefusalCodeEnum — Frozen Domain Refusal Codes (Exactly 20)
 * MUST NOT be modified or appended with schema/parser outcomes.
 */
export const RefusalCodeEnumSchema = z.enum([
  'OBSERVATION_NOT_FOUND',
  'OBSERVATION_ALREADY_VALIDATED',
  'INVALID_OBSERVATION_STATE',
  'EVIDENCE_ATTACHMENT_FAILED',
  'LESSON_CANDIDATE_NOT_FOUND',
  'INVALID_LESSON_CANDIDATE_STATE',
  'LESSON_NOT_APPROVED',
  'LESSON_ALREADY_SUPERSEDED',
  'LESSON_ALREADY_RETIRED',
  'UNAUTHORIZED_ACTOR',
  'AUTHORITY_CONTEXT_INVALID',
  'AUTHORITY_CONTEXT_EXPIRED',
  'SCOPE_VIOLATION',
  'CROSS_FRAMEWORK_REQUIRES_DISTINCT_FRAMEWORKS',
  'SUCCESSOR_VERSION_INVALID',
  'SUPERSEDING_LESSON_NOT_FOUND',
  'RULE_CANDIDATE_NOT_FOUND',
  'INVALID_RULE_CANDIDATE_STATE',
  'DUPLICATE_LESSON_ADOPTION',
  'UNSUPPORTED_GOVERNANCE_OPERATION',
]);
export type RefusalCodeEnum = z.infer<typeof RefusalCodeEnumSchema>;

export const EventTypeEnumSchema = z.enum([
  'OBSERVATION_CREATED',
  'OBSERVATION_VALIDATED',
  'LESSON_CANDIDATE_CREATED',
  'LESSON_APPROVED',
  'LESSON_SUPERSEDED',
  'LESSON_RETIRED',
  'LESSON_ADOPTED',
]);
export type EventTypeEnum = z.infer<typeof EventTypeEnumSchema>;

export const CommandTypeEnumSchema = z.enum([
  'DraftObservation',
  'AttachEvidence',
  'SubmitObservation',
  'ValidateMechanicalObservation',
  'RecordInterpretiveValidation',
  'CreateLessonCandidate',
  'SubmitLessonForReview',
  'InvalidateLessonCandidate',
  'ApproveLesson',
  'RejectLesson',
  'RequestLessonRevision',
  'SupersedeLesson',
  'RetireLesson',
  'AdoptLesson',
  'BuildGuidanceSetQuery',
  'ProposeRuleCandidate',
]);
export type CommandTypeEnum = z.infer<typeof CommandTypeEnumSchema>;

export const GuidanceMatchStrategyEnumSchema = z.enum(['STRICT', 'INHERITED', 'CROSS_FRAMEWORK']);
export type GuidanceMatchStrategyEnum = z.infer<typeof GuidanceMatchStrategyEnumSchema>;

export const GuidanceResultStatusEnumSchema = z.enum(['SUCCESS', 'NO_MATCH', 'REFUSED']);
export type GuidanceResultStatusEnum = z.infer<typeof GuidanceResultStatusEnumSchema>;

// Parser / Schema outcomes (distinct from RefusalCodeEnum)
export const EventDispatchOutcomeEnumSchema = z.enum([
  'SUPPORTED_KNOWN_EVENT',
  'UNKNOWN_EVENT_TYPE',
  'UNSUPPORTED_EVENT_PAYLOAD_VERSION',
  'INVALID_SUPPORTED_EVENT_PAYLOAD',
  'INVALID_EVENT_ENVELOPE',
  'UNSUPPORTED_VERSION_HISTORICAL_EVENT',
  'UNKNOWN_TYPE_HISTORICAL_EVENT',
  'INVALID_KNOWN_SUPPORTED_EVENT',
]);
export type EventDispatchOutcomeEnum = z.infer<typeof EventDispatchOutcomeEnumSchema>;

export const CommandDispatchOutcomeEnumSchema = z.enum([
  'SUPPORTED_KNOWN_COMMAND',
  'UNKNOWN_COMMAND_TYPE',
  'UNSUPPORTED_COMMAND_PAYLOAD_VERSION',
  'INVALID_SUPPORTED_COMMAND_PAYLOAD',
  'INVALID_COMMAND_ENVELOPE',
]);
export type CommandDispatchOutcomeEnum = z.infer<typeof CommandDispatchOutcomeEnumSchema>;
