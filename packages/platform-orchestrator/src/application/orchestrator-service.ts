/**
 * @file orchestrator-service.ts
 * @module @cep/platform-orchestrator
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-006 (Platform Orchestration Contract)
 * @domainConcept Platform Orchestrator Application Service
 */

import { AssessmentRequestModel } from '@cep/assessment-core';
import { EvidenceSubmissionModel } from '@cep/evidence-manager';
import { RuleProps } from '@cep/rule-engine';

import { ExecutionSummary } from '../domain/types.js';
import { ExecutionContext } from '../context/execution-context.js';
import { PipelineEngine, PipelineExecutionConfig } from '../workflow/pipeline.js';
import { OrchestrationDomainEvent } from '../events/orchestration.events.js';

export class PlatformOrchestratorService {
  private readonly summaries = new Map<string, ExecutionSummary>();
  private readonly events: OrchestrationDomainEvent[] = [];

  /**
   * Executes full constitutional pipeline.
   */
  public executePipeline(
    request: AssessmentRequestModel,
    submissions: readonly EvidenceSubmissionModel[],
    rules: readonly RuleProps[],
    config?: PipelineExecutionConfig
  ): { context: ExecutionContext; summary: ExecutionSummary } {
    const engine = new PipelineEngine();
    const result = engine.execute(request, submissions, rules, config);

    this.summaries.set(result.summary.execution_id, result.summary);
    this.events.push(...engine.getEvents());

    return result;
  }

  /**
   * Retrieves an ExecutionSummary by executionId.
   */
  public getExecutionSummary(executionId: string): ExecutionSummary | undefined {
    return this.summaries.get(executionId);
  }

  /**
   * Returns read-only array of all emitted orchestration events.
   */
  public getEvents(): readonly OrchestrationDomainEvent[] {
    return Object.freeze([...this.events]);
  }
}

export function createPlatformOrchestratorService(): PlatformOrchestratorService {
  return new PlatformOrchestratorService();
}
