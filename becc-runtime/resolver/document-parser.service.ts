import path from 'node:path';
import YAML from 'yaml';
import { MalformedMetadataException } from './exceptions.js';
import { IDocumentMetadata } from './types.js';

// Extend local config/type support if needed
export interface IDocumentParsedResult {
  readonly metadata: IDocumentMetadata;
  readonly contentBody: string;
}

export class DocumentParserService {
  /**
   * Parses the YAML frontmatter of a markdown file.
   */
  public parseMetadata(content: string, filePath: string): IDocumentParsedResult {
    const fileName = path.basename(filePath);
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    if (!normalizedContent.startsWith('---\n')) {
      // If no frontmatter is found, default status is active, content body is the whole file
      return {
        metadata: { status: 'active' },
        contentBody: normalizedContent
      };
    }

    const nextDashIndex = normalizedContent.indexOf('\n---\n', 4);
    if (nextDashIndex === -1) {
      throw new MalformedMetadataException(fileName, 'Closing frontmatter delimiter "---" not found.');
    }

    const frontmatterString = normalizedContent.substring(4, nextDashIndex);
    const contentBody = normalizedContent.substring(nextDashIndex + 5);

    let parsed: any;
    try {
      parsed = YAML.parse(frontmatterString);
    } catch (err: any) {
      throw new MalformedMetadataException(fileName, `YAML parsing failed: ${err.message}`);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new MalformedMetadataException(fileName, 'YAML frontmatter is not a valid key-value object.');
    }

    const status = parsed.status ? String(parsed.status).toLowerCase() : 'active';

    const metadata = {
      status,
      version: parsed.version ? String(parsed.version) : undefined,
      targetVersion: parsed.targetVersion ? String(parsed.targetVersion) : undefined,
      classification: parsed.classification ? String(parsed.classification) : undefined,
      title: parsed.title ? String(parsed.title) : undefined,
      precedenceTier: parsed.precedenceTier,
      precedenceOrder: typeof parsed.precedenceOrder === 'number' ? parsed.precedenceOrder : undefined,
      framework: parsed.framework ? String(parsed.framework) : undefined,
    };

    return { metadata, contentBody };
  }

  /**
   * Evaluates if the parsed document is active and matches target version filters.
   */
  public isDocumentActive(metadata: any, targetVersionFilter?: string): boolean {
    if (metadata.status === 'archive' || metadata.status === 'historical') {
      return false;
    }

    if (targetVersionFilter && metadata.version) {
      return metadata.version === targetVersionFilter;
    }

    return true;
  }
}
