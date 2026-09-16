import { z } from 'zod';

/**
 * Generic Non-Empty Version String (Not restricted to SemVer regex)
 */
export const VersionValueSchema = z.string().min(1, 'Version string must not be empty');
export type VersionValue = z.infer<typeof VersionValueSchema>;

/**
 * ISO-8601 Timestamp String
 */
export const TimestampIsoSchema = z
  .string()
  .datetime({ offset: true, message: 'Timestamp must be ISO-8601 compliant' });
export type TimestampIso = z.infer<typeof TimestampIsoSchema>;

/**
 * Integrity Digest String
 */
export const DigestValueSchema = z.string().min(1, 'Digest string must not be empty');
export type DigestValue = z.infer<typeof DigestValueSchema>;

// Semantic ID Schemas (CTR-GL-001 through CTR-GL-013 + aliases)
export const ObservationIdSchema = z.string().min(1, 'ObservationId must not be empty');
export type ObservationId = z.infer<typeof ObservationIdSchema>;

export const EvidenceIdSchema = z.string().min(1, 'EvidenceId must not be empty');
export type EvidenceId = z.infer<typeof EvidenceIdSchema>;

export const LessonIdSchema = z.string().min(1, 'LessonId must not be empty');
export type LessonId = z.infer<typeof LessonIdSchema>;

export const LessonCandidateIdSchema = z.string().min(1, 'LessonCandidateId must not be empty');
export type LessonCandidateId = z.infer<typeof LessonCandidateIdSchema>;

export const RuleManifestIdSchema = z.string().min(1, 'RuleManifestId must not be empty');
export type RuleManifestId = z.infer<typeof RuleManifestIdSchema>;

export const FrameworkIdSchema = z.string().min(1, 'FrameworkId must not be empty');
export type FrameworkId = z.infer<typeof FrameworkIdSchema>;

export const AuthorityContextIdSchema = z.string().min(1, 'AuthorityContextId must not be empty');
export type AuthorityContextId = z.infer<typeof AuthorityContextIdSchema>;

export const ActorIdSchema = z.string().min(1, 'ActorId must not be empty');
export type ActorId = z.infer<typeof ActorIdSchema>;

export const ProjectIdSchema = z.string().min(1, 'ProjectId must not be empty');
export type ProjectId = z.infer<typeof ProjectIdSchema>;

export const WorkstreamIdSchema = z.string().min(1, 'WorkstreamId must not be empty');
export type WorkstreamId = z.infer<typeof WorkstreamIdSchema>;

export const DecisionIdSchema = z.string().min(1, 'DecisionId must not be empty');
export type DecisionId = z.infer<typeof DecisionIdSchema>;

export const EventIdSchema = z.string().min(1, 'EventId must not be empty');
export type EventId = z.infer<typeof EventIdSchema>;

export const CommandIdSchema = z.string().min(1, 'CommandId must not be empty');
export type CommandId = z.infer<typeof CommandIdSchema>;

export const RuleCandidateIdSchema = z.string().min(1, 'RuleCandidateId must not be empty');
export type RuleCandidateId = z.infer<typeof RuleCandidateIdSchema>;

export const RuleCandidateProposalIdSchema = z.string().min(1, 'RuleCandidateProposalId must not be empty');
export type RuleCandidateProposalId = z.infer<typeof RuleCandidateProposalIdSchema>;

export const CriteriaIdSchema = z.string().min(1, 'CriteriaId must not be empty');
export type CriteriaId = z.infer<typeof CriteriaIdSchema>;

export const GuidanceQueryIdSchema = z.string().min(1, 'GuidanceQueryId must not be empty');
export type GuidanceQueryId = z.infer<typeof GuidanceQueryIdSchema>;

/**
 * Opaque Historical Payload — z.unknown()
 * Allowed ONLY for historical preservation of unsupported versions or unknown types.
 */
export const OpaquePayloadSchema = z.unknown();
export type OpaquePayload = z.infer<typeof OpaquePayloadSchema>;
