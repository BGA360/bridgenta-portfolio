import { calculateStringHash } from './content-hash.js';

/**
 * IDENTITY CLASSIFICATIONS:
 * 
 * CONTENT-STABLE: The identifier is derived directly from the canonical values
 * of the content itself. Updates to metadata, location, or layout of the page 
 * will not alter the identifier as long as the content remains identical.
 * 
 * LOCATION-STABLE: The identifier is tied to the physical layout, file structure,
 * or hierarchical position of the element (e.g. heading levels, line coordinates,
 * or sequential index indices). Moving the element inside the page changes this ID.
 * 
 * RUN-SCOPED: The identifier is unique to the execution instance/session of the
 * audit run and does not remain stable across separate subsequent executions.
 */

/**
 * Generates a stable page identifier.
 * Type: CONTENT-STABLE (tied to path or URL)
 */
export function generatePageId(pathOrUrl: string): string {
  return `page-${calculateStringHash(pathOrUrl.trim()).substring(0, 16)}`;
}

/**
 * Generates a stable section identifier.
 * Type: LOCATION-STABLE (tied to position in document flow)
 */
export function generateSectionId(pageId: string, headingText: string, position: number): string {
  const input = `${pageId}:${headingText.trim()}:${position}`;
  return `sec-${calculateStringHash(input).substring(0, 16)}`;
}

/**
 * Generates a stable heading identifier.
 * Type: LOCATION-STABLE (tied to heading hierarchy)
 */
export function generateHeadingId(sectionId: string, level: number, text: string): string {
  const input = `${sectionId}:${level}:${text.trim()}`;
  return `hd-${calculateStringHash(input).substring(0, 16)}`;
}

/**
 * Generates a stable claim identifier.
 * Type: CONTENT-STABLE (tied to claim content body and offset)
 */
export function generateClaimId(sectionId: string, rawText: string, offset: number): string {
  const input = `${sectionId}:${rawText.trim()}:${offset}`;
  return `clm-${calculateStringHash(input).substring(0, 16)}`;
}

/**
 * Generates a stable relation identifier.
 * Type: CONTENT-STABLE (tied to endpoints and type)
 */
export function generateRelationId(sourceId: string, targetId: string, type: string): string {
  const input = `${sourceId}:${targetId}:${type}`;
  return `rel-${calculateStringHash(input).substring(0, 16)}`;
}

/**
 * Generates a stable artifact identifier.
 * Type: CONTENT-STABLE (tied to relative path)
 */
export function generateArtifactId(filePath: string): string {
  return `art-${calculateStringHash(filePath.trim()).substring(0, 16)}`;
}

/**
 * Generates a stable link identifier.
 * Type: LOCATION-STABLE (tied to source coordinates)
 */
export function generateLinkId(pageId: string, href: string, line?: number, column?: number): string {
  const input = `${pageId}:${href.trim()}:${line ?? 0}:${column ?? 0}`;
  return `lnk-${calculateStringHash(input).substring(0, 16)}`;
}
