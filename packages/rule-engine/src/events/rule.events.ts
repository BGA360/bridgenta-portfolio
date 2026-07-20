/**
 * @file rule.events.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Domain Events
 */

import { FindingStatus } from '@cep/assessment-core';
import { RuleId, FindingId, Timestamp, RuleSeverity } from '../domain/types.js';

export interface BaseRuleEvent {
  readonly event_id: string;
  readonly event_name: string;
  readonly timestamp: Timestamp;
}

export interface RuleRegisteredEvent extends BaseRuleEvent {
  readonly event_name: 'RuleRegistered';
  readonly rule_id: RuleId;
  readonly framework_id: string;
}

export interface RuleEvaluatedEvent extends BaseRuleEvent {
  readonly event_name: 'RuleEvaluated';
  readonly rule_id: RuleId;
  readonly evidence_id: string;
  readonly status: FindingStatus;
}

export interface FindingGeneratedEvent extends BaseRuleEvent {
  readonly event_name: 'FindingGenerated';
  readonly finding_id: FindingId;
  readonly rule_id: RuleId;
  readonly evidence_id: string;
  readonly severity: RuleSeverity;
  readonly status: FindingStatus;
}

export interface RuleArchivedEvent extends BaseRuleEvent {
  readonly event_name: 'RuleArchived';
  readonly rule_id: RuleId;
  readonly reason: string;
}

export type RuleDomainEvent =
  | RuleRegisteredEvent
  | RuleEvaluatedEvent
  | FindingGeneratedEvent
  | RuleArchivedEvent;
