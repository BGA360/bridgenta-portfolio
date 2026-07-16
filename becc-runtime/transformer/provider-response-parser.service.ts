import { IProviderResponseParser } from './types.js';

export class ProviderResponseParserService implements IProviderResponseParser {
  public parseDiff(text: string): string {
    if (!text) {
      return '';
    }

    // Match code fence patterns: ```diff ... ``` or ``` ... ```
    const match = text.match(/```(?:diff)?\n([\s\S]*?)```/);
    if (match) {
      return match[1].trim();
    }

    // Fallback: strip inline backticks or return clean trim
    return text.trim();
  }
}
