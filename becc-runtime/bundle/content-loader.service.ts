import fs from 'node:fs';
import path from 'node:path';
import { StalePointerException, InvalidLineRangeException } from './exceptions.js';
import { CrawlerService } from '../resolver/crawler.service.js';

export class ContentLoaderService {
  private readonly crawler: CrawlerService;

  constructor(crawler = new CrawlerService()) {
    this.crawler = crawler;
  }

  /**
   * Reads exact line ranges from file path within configured knowledge roots.
   */
  public loadLines(filePath: string, startLine: number, endLine: number, roots: readonly string[]): string {
    if (startLine <= 0 || endLine <= 0 || startLine > endLine) {
      throw new InvalidLineRangeException('', `Line numbers must be positive and startLine (${startLine}) <= endLine (${endLine})`);
    }

    let absolutePath = filePath;
    if (!path.isAbsolute(filePath)) {
      for (const root of roots) {
        const candidate = path.join(root, filePath);
        if (fs.existsSync(candidate)) {
          absolutePath = candidate;
          break;
        }
      }
    }

    let validatedPath: string;
    try {
      validatedPath = this.crawler.resolveAndValidatePath(absolutePath, roots);
    } catch (err) {
      throw new StalePointerException('', `File path '${filePath}' escapes configured knowledge roots.`);
    }

    if (!fs.existsSync(validatedPath)) {
      throw new StalePointerException('', `Source file '${filePath}' not found.`);
    }

    const fileContent = fs.readFileSync(validatedPath, 'utf8');
    const lines = fileContent.split(/\r?\n/);

    if (startLine > lines.length || endLine > lines.length) {
      throw new InvalidLineRangeException('', `Line range [${startLine}, ${endLine}] is out of bounds (file has ${lines.length} lines)`);
    }

    const ruleLines = lines.slice(startLine - 1, endLine);
    return ruleLines.join('\n');
  }
}
