import {
  ValidationResultReport,
  ValidationFinding,
  ValidationEvidence,
  ValidationSummary
} from '../shared/types.js';

export class FindingAggregatorService {
  public aggregate(
    sessionId: string,
    rawFindings: readonly ValidationFinding[],
    rawEvidence: readonly ValidationEvidence[],
    evaluatedRuleCount: number,
    nonEvaluableRuleCount: number
  ): ValidationResultReport {
    // 1. Deduplicate findings by finding ID
    const uniqueFindingsMap = new Map<string, ValidationFinding>();
    for (const f of rawFindings) {
      uniqueFindingsMap.set(f.id, f);
    }
    const deduplicatedFindings = [...uniqueFindingsMap.values()];

    // 2. Sort findings: error -> warning -> info, then alphabetically by message
    deduplicatedFindings.sort((a, b) => {
      const severityPriority = { error: 0, warning: 1, info: 2 };
      const priorityDiff = severityPriority[a.severity] - severityPriority[b.severity];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.message.localeCompare(b.message);
    });

    // 3. Deduplicate and clean evidence logs
    const uniqueEvidenceMap = new Map<string, ValidationEvidence>();
    for (const ev of rawEvidence) {
      const key = `${ev.findingId}:${ev.location.startLine || 0}:${ev.excerptHash}`;
      uniqueEvidenceMap.set(key, ev);
    }
    const deduplicatedEvidence = [...uniqueEvidenceMap.values()];

    // 4. Calculate error and warning counts
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    for (const f of deduplicatedFindings) {
      if (f.severity === 'error') {
        errorCount++;
      } else if (f.severity === 'warning') {
        warningCount++;
      } else {
        infoCount++;
      }
    }

    // 5. Establish validation status
    let status: 'passed' | 'failed' | 'warnings_present' = 'passed';
    if (errorCount > 0) {
      status = 'failed';
    } else if (warningCount > 0) {
      status = 'warnings_present';
    }

    const summary: ValidationSummary = {
      status,
      errorCount,
      warningCount,
      infoCount,
      evaluatedRuleCount,
      nonEvaluableRuleCount
    };

    const report: ValidationResultReport = {
      sessionId,
      summary,
      findings: Object.freeze(deduplicatedFindings),
      evidence: Object.freeze(deduplicatedEvidence)
    };

    return Object.freeze(report);
  }
}
