import { ICandidateMaterializer } from './types.js';
import { MalformedDiffException } from './exceptions.js';

interface Hunk {
  oldStart: number;
  oldLen: number;
  newStart: number;
  newLen: number;
  lines: string[];
}

export class CandidateMaterializerService implements ICandidateMaterializer {
  public materialize(baselineContent: string, diffContent: string): string {
    if (!diffContent || diffContent.trim() === '') {
      return baselineContent;
    }

    const baselineLines = baselineContent.split(/\r?\n/);
    const diffLines = diffContent.split(/\r?\n/);
    const hunks: Hunk[] = [];

    let currentHunk: Hunk | null = null;

    for (const line of diffLines) {
      if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('index ')) {
        continue;
      }

      if (line.startsWith('@@')) {
        // Parse hunk header: @@ -oldStart,oldLen +newStart,newLen @@
        const match = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
        if (!match) {
          throw new MalformedDiffException(`Invalid hunk header: ${line}`);
        }

        const oldStart = parseInt(match[1], 10);
        const oldLen = match[2] !== undefined ? parseInt(match[2], 10) : 1;
        const newStart = parseInt(match[3], 10);
        const newLen = match[4] !== undefined ? parseInt(match[4], 10) : 1;

        currentHunk = {
          oldStart,
          oldLen,
          newStart,
          newLen,
          lines: []
        };
        hunks.push(currentHunk);
      } else if (currentHunk) {
        currentHunk.lines.push(line);
      }
    }

    if (hunks.length === 0) {
      throw new MalformedDiffException('No diff hunks resolved.');
    }

    // Sort hunks descending by oldStart to prevent offset shifting problems
    hunks.sort((a, b) => b.oldStart - a.oldStart);

    const resultLines = [...baselineLines];

    for (const hunk of hunks) {
      // Apply the hunk bottom-to-top
      const oldIdx = hunk.oldStart - 1; // 0-indexed
      const newLines: string[] = [];
      let baselineOffset = 0;

      for (const hl of hunk.lines) {
        if (hl.startsWith(' ')) {
          const originalLine = resultLines[oldIdx + baselineOffset];
          const contextLine = hl.substring(1);
          if (originalLine !== undefined && originalLine !== contextLine) {
            throw new MalformedDiffException(`Hunk context mismatch at line ${hunk.oldStart + baselineOffset}. Expected: "${contextLine}", Found: "${originalLine}"`);
          }
          newLines.push(contextLine);
          baselineOffset++;
        } else if (hl.startsWith('-')) {
          // Verify context matches baseline content
          const originalLine = resultLines[oldIdx + baselineOffset];
          const deletedLine = hl.substring(1);
          if (originalLine !== undefined && originalLine !== deletedLine) {
            throw new MalformedDiffException(`Hunk context mismatch at line ${hunk.oldStart + baselineOffset}. Expected: "${deletedLine}", Found: "${originalLine}"`);
          }
          baselineOffset++;
        } else if (hl.startsWith('+')) {
          newLines.push(hl.substring(1));
        }
      }

      // Replace the baseline slice with the new lines
      resultLines.splice(oldIdx, hunk.oldLen, ...newLines);
    }

    return resultLines.join('\n');
  }
}
