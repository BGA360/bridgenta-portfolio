import { ValidationFinding } from '../shared/types.js';
import { FindingDisposition } from './types.js';
import {
  UnknownFindingError,
  DuplicateFindingDispositionError,
  InvalidFindingDispositionError
} from './exceptions.js';

export class FindingDispositionValidatorService {
  public validate(
    findings: readonly ValidationFinding[],
    dispositions: readonly FindingDisposition[],
    isApproved: boolean
  ): void {
    const findingsMap = new Map<string, ValidationFinding>();
    for (const f of findings) {
      findingsMap.set(f.id, f);
    }

    const seenDispositions = new Set<string>();

    for (const disp of dispositions) {
      // 1. Check unknown finding ID
      const finding = findingsMap.get(disp.findingId);
      if (!finding) {
        throw new UnknownFindingError(disp.findingId);
      }

      // 2. Check duplicates
      if (seenDispositions.has(disp.findingId)) {
        throw new DuplicateFindingDispositionError(disp.findingId);
      }
      seenDispositions.add(disp.findingId);

      // 3. Validate code by severity
      if (finding.severity === 'error' && disp.code === 'acknowledged') {
        throw new InvalidFindingDispositionError(disp.findingId, 'Error findings cannot be simply acknowledged.');
      }

      // 4. Validate rationales
      if ((disp.code === 'false_positive' || disp.code === 'risk_accepted') && (!disp.rationale || disp.rationale.trim().length < 15)) {
        throw new InvalidFindingDispositionError(disp.findingId, 'Disposition rationale must be at least 15 characters long.');
      }
    }

    // If decision is APPROVED, check all errors and warnings have a valid disposition
    if (isApproved) {
      for (const finding of findings) {
        if (finding.severity === 'error' || finding.severity === 'warning') {
          if (!seenDispositions.has(finding.id)) {
            throw new InvalidFindingDispositionError(finding.id, `Missing mandatory disposition for severity '${finding.severity}'.`);
          }
        }
      }
    }
  }
}
