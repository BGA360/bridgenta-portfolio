import crypto from 'node:crypto';
import { IRulePointer, IVocabularyTerm } from './types.js';

export class RuleExtractorService {
  /**
   * Extracts rule sections from a parsed markdown body content.
   */
  public extractRules(
    contentBody: string,
    filePath: string,
    metadata: any
  ): IRulePointer[] {
    const lines = contentBody.split('\n');
    const rulePointers: IRulePointer[] = [];
    let currentRule: {
      ruleId: string;
      heading: string;
      startLine: number;
      lines: string[];
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(##|###)\s+(.+)$/);

      if (match) {
        if (currentRule) {
          rulePointers.push(this.createRulePointer(currentRule, i, filePath, metadata));
        }

        const heading = match[2].trim();
        const ruleId = this.extractRuleId(heading);

        currentRule = {
          ruleId,
          heading,
          startLine: i + 1,
          lines: []
        };
      } else if (currentRule) {
        currentRule.lines.push(line);
      }
    }

    if (currentRule) {
      rulePointers.push(this.createRulePointer(currentRule, lines.length, filePath, metadata));
    }

    return rulePointers;
  }

  /**
   * Extracts a rule ID from a heading string.
   */
  private extractRuleId(heading: string): string {
    const ruleIdMatch = heading.match(/(RULE-[A-Za-z0-9_-]+)/i);
    if (ruleIdMatch) {
      return ruleIdMatch[1].toUpperCase();
    }

    const parenMatch = heading.match(/\(([^)]+)\s+Rule\)/i);
    if (parenMatch) {
      return parenMatch[1].toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9_-]/g, '');
    }

    const slug = heading
      .toUpperCase()
      .replace(/[^A-Z0-9\s_-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return slug || 'UNNAMED-RULE';
  }

  /**
   * Helper to construct IRulePointer from a gathered rule block.
   */
  private createRulePointer(
    rule: { ruleId: string; heading: string; startLine: number; lines: string[] },
    endLine: number,
    filePath: string,
    metadata: any
  ): IRulePointer {
    const rawText = rule.lines.join('\n');
    const contentHash = this.calculateContentHash(rawText);

    const tier = metadata.precedenceTier || 'DomainSpec';
    let precedenceOrder = typeof metadata.precedenceOrder === 'number' ? metadata.precedenceOrder : 20;

    if (tier === 'Canon') {
      precedenceOrder = 1;
    } else if (tier === 'CoreVolume') {
      if (typeof metadata.precedenceOrder !== 'number') {
        const volumeMatch = filePath.match(/(\d+)-[A-Za-z0-9_-]+/);
        if (volumeMatch) {
          precedenceOrder = 1 + parseInt(volumeMatch[1], 10);
        } else {
          precedenceOrder = 10;
        }
      }
    } else {
      precedenceOrder = 20;
    }

    return {
      ruleId: rule.ruleId,
      filePath,
      heading: rule.heading,
      startLine: rule.startLine,
      endLine: endLine,
      contentHash,
      precedenceOrder,
      authoritySource: filePath,
      precedenceTier: tier,
      originatingFramework: metadata.framework || 'BGCF',
      versionIdentifier: metadata.version || '1.0.0'
    };
  }

  /**
   * Normalizes the rule text and computes its SHA-256 hexadecimal hash.
   */
  public calculateContentHash(text: string): string {
    let normalized = text.trim();
    normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    normalized = normalized.replace(/[ \t]+/g, ' ');

    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Extracts active vocabulary terms from a markdown table.
   */
  public extractVocabulary(contentBody: string): IVocabularyTerm[] {
    const lines = contentBody.split('\n');
    const terms: IVocabularyTerm[] = [];

    let insideTable = false;
    let headers: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map(cell => cell.trim());

        if (!insideTable) {
          headers = cells.map(h => h.toLowerCase());
          insideTable = true;
          continue;
        }

        if (cells.every(c => c.startsWith(':---') || c.startsWith('---') || c.endsWith('---:'))) {
          continue;
        }

        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = cells[idx] || '';
        });

        const term = row.term || row.word || row.ausdruck || row.begriff;
        const classificationRaw = row.classification || row.klasse || row.kategorie || row.status;
        const definition = row.definition || row.bedeutung || row.beschreibung;

        if (term && classificationRaw) {
          const classification = classificationRaw.toLowerCase();
          if (classification === 'forbidden' || classification === 'preferred' || classification === 'required') {
            terms.push({
              term,
              classification: classification as 'forbidden' | 'preferred' | 'required',
              definition: definition || undefined
            });
          }
        }
      } else {
        insideTable = false;
      }
    }

    return terms;
  }
}
