/**
 * @file types.ts
 * @module @cep/rule-engine
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-003 (Rule Evaluation Contract)
 * @domainConcept Rule Engine Types & Value Objects
 */

import { FindingStatus } from '@cep/assessment-core';

// Branded Types to prevent primitive confusion
export type RuleId = string & { readonly __brand: unique symbol };
export type FindingId = string & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

export const RuleId = {
  create: (id: string): RuleId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('RuleId must be a non-empty string.');
    }
    return id.trim() as RuleId;
  },
};

export const FindingId = {
  create: (id: string): FindingId => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('FindingId must be a non-empty string.');
    }
    return id.trim() as FindingId;
  },
};

export const Timestamp = {
  create: (isoString?: string): Timestamp => {
    const str = isoString || new Date().toISOString();
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error('Timestamp must be a valid ISO 8601 date string.');
    }
    return date.toISOString() as Timestamp;
  },
};

/**
 * Rule Category enumeration.
 */
export enum RuleCategory {
  STRUCTURAL = 'STRUCTURAL',
  SECURITY = 'SECURITY',
  COMMUNICATION = 'COMMUNICATION',
  GOVERNANCE = 'GOVERNANCE',
  PERFORMANCE = 'PERFORMANCE',
}

/**
 * Rule Severity enumeration.
 */
export enum RuleSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFORMATIONAL = 'INFORMATIONAL',
}

/**
 * Rule Status enumeration.
 */
export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Rule Metadata properties.
 */
export interface RuleMetadata {
  readonly name: string;
  readonly description: string;
  readonly framework_id: string; // e.g. "CEF", "BECC", "BGCF"
  readonly category: RuleCategory;
  readonly severity: RuleSeverity;
  readonly tags: readonly string[];
}

/**
 * Traceability Reference model.
 */
export interface TraceabilityReference {
  readonly constitutional_source: string;
  readonly contract_id: string;
  readonly domain_concept: string;
}

/**
 * Result of evaluating a single Rule against a single Evidence item.
 */
export interface RuleResult {
  readonly rule_id: RuleId;
  readonly evidence_id: string;
  readonly status: FindingStatus;
  readonly message: string;
  readonly finding_id?: FindingId;
  readonly evaluated_at: Timestamp;
}

/**
 * Immutable Finding generated during Rule evaluation.
 */
export interface Finding {
  readonly finding_id: FindingId;
  readonly rule_id: RuleId;
  readonly evidence_id: string;
  readonly severity: RuleSeverity;
  readonly status: FindingStatus;
  readonly description: string;
  readonly traceability: TraceabilityReference;
  readonly timestamp: Timestamp;
}

/**
 * Evaluation Trace summarizing execution details.
 */
export interface EvaluationTrace {
  readonly trace_id: string;
  readonly execution_order: readonly RuleId[];
  readonly evaluated_rules_count: number;
  readonly pass_count: number;
  readonly fail_count: number;
  readonly warn_count: number;
  readonly duration_ms: number;
}

/**
 * Complete Rule Evaluation outcome entity.
 */
export interface RuleEvaluation {
  readonly evaluation_id: string;
  readonly assessment_id: string;
  readonly rule_results: readonly RuleResult[];
  readonly findings: readonly Finding[];
  readonly trace: EvaluationTrace;
  readonly created_at: Timestamp;
}
