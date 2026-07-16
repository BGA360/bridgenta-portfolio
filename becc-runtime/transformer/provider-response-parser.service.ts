import { IProviderResponseParser } from './types.js';
import { InvalidResponseFormatException } from './exceptions.js';

export class ProviderResponseParserService implements IProviderResponseParser {
  public parseDiff(text: string): string {
    if (!text || text.trim() === '') {
      throw new InvalidResponseFormatException('Empty response received.');
    }

    // Refusal detection
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes('i cannot') ||
      lowerText.includes('i am sorry') ||
      lowerText.includes('i apologize') ||
      lowerText.includes('as an ai')
    ) {
      throw new InvalidResponseFormatException('Provider refused to generate a response.');
    }

    // Detect multiple fenced blocks
    const fenceMatches = [...text.matchAll(/```(?:diff)?\n([\s\S]*?)```/g)];
    if (fenceMatches.length > 1) {
      throw new InvalidResponseFormatException('Ambiguous response containing multiple code blocks.');
    }

    let parsedDiff = '';
    if (fenceMatches.length === 1) {
      parsedDiff = fenceMatches[0][1].trim();
    } else {
      // Check if it's a raw unfenced diff
      const cleanText = text.trim();
      if (cleanText.startsWith('---') || cleanText.includes('@@')) {
        parsedDiff = cleanText;
      } else {
        throw new InvalidResponseFormatException('Response contains arbitrary raw prose instead of a valid diff.');
      }
    }

    if (parsedDiff === '') {
      throw new InvalidResponseFormatException('Extracted diff content is empty.');
    }

    // Truncated check
    if (parsedDiff.endsWith('@@') || parsedDiff.endsWith('+') || parsedDiff.endsWith('-')) {
      throw new InvalidResponseFormatException('Diff is truncated or incomplete.');
    }

    // Detect multi-file changes
    const targetFileLines = parsedDiff.split('\n').filter(line => line.startsWith('+++ '));
    const targetFiles = new Set(targetFileLines.map(line => line.substring(4).trim()));
    if (targetFiles.size > 1) {
      throw new InvalidResponseFormatException('Multi-file patches are rejected.');
    }

    return parsedDiff;
  }
}
