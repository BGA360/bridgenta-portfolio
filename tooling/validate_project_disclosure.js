import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultWorkspaceRoot = path.resolve(__dirname, '..');

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_RECURSION_DEPTH = 16;
const MAX_MATCHES_PER_RULE = 1000;

const TEXT_ARTIFACT_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.xml',
  '.json',
  '.js',
  '.mjs',
  '.css',
  '.txt',
  '.svg',
  '.webmanifest'
]);

const BINARY_ASSET_EXTENSIONS = new Set([
  '.woff2',
  '.woff',
  '.ttf',
  '.eot',
  '.otf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.avif',
  '.pdf'
]);

/**
 * Sanitizes filesystem paths for CI logs so private local paths are never exposed.
 * @param {string} targetPath
 * @param {string} workspaceRoot
 * @returns {string}
 */
export function sanitizePathForLog(targetPath, workspaceRoot = defaultWorkspaceRoot) {
  if (typeof targetPath !== 'string' || !targetPath) return '[REDACTED:PATH]';
  const resolvedRoot = path.resolve(workspaceRoot);
  const resolvedTarget = path.isAbsolute(targetPath)
    ? path.resolve(targetPath)
    : path.resolve(resolvedRoot, targetPath);
  const rel = path.relative(resolvedRoot, resolvedTarget);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return '[REDACTED:EXTERNAL_PATH]';
  }
  return rel.replace(/\\/g, '/');
}

/**
 * Redacts all sensitive matched values so secrets, fragments, internal hostnames,
 * DB roles, and paths are never printed in CI logs or test outputs.
 * @param {string} _text
 * @param {string} category
 * @returns {string}
 */
export function redactMatch(_text, category) {
  const safeCategory = typeof category === 'string' && category ? category : 'SENSITIVE_VALUE';
  return `[REDACTED:${safeCategory}]`;
}

/**
 * Loads and strictly validates disclosure rules from configuration.
 * Rejects missing files, malformed JSON, invalid schema, malformed regexes,
 * and zero-length-matching regex patterns.
 * @param {string} rulesPath
 * @param {string} [workspaceRoot]
 * @returns {object}
 */
export function loadRules(rulesPath, workspaceRoot = defaultWorkspaceRoot) {
  const safePath = sanitizePathForLog(rulesPath, workspaceRoot);
  if (!fs.existsSync(rulesPath)) {
    throw new Error(`PUBSEC-ERR-CONFIG: Disclosure rules file not found (${safePath})`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  } catch (err) {
    throw new Error(`PUBSEC-ERR-CONFIG: Failed to parse disclosure rules JSON (${safePath}): ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('PUBSEC-ERR-CONFIG: Disclosure rules root must be a JSON object.');
  }

  const requiredGroups = ['secret_patterns', 'prohibited_claims', 'operational_denylist'];
  for (const groupName of requiredGroups) {
    if (!Array.isArray(parsed[groupName])) {
      throw new Error(`PUBSEC-ERR-CONFIG: Missing or non-array rule group "${groupName}".`);
    }
    for (const rule of parsed[groupName]) {
      if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
        throw new Error(`PUBSEC-ERR-CONFIG: Invalid rule entry in "${groupName}".`);
      }
      if (typeof rule.id !== 'string' || !rule.id.trim()) {
        throw new Error(`PUBSEC-ERR-CONFIG: Rule missing valid "id" in "${groupName}".`);
      }
      if (typeof rule.regex !== 'string' || rule.regex.length === 0) {
        throw new Error(`PUBSEC-ERR-CONFIG: Rule "${rule.id}" has empty or non-string regex.`);
      }
      if (typeof rule.category !== 'string' || !rule.category.trim()) {
        throw new Error(`PUBSEC-ERR-CONFIG: Rule "${rule.id}" missing valid "category".`);
      }
      if (typeof rule.severity !== 'string' || !rule.severity.trim()) {
        throw new Error(`PUBSEC-ERR-CONFIG: Rule "${rule.id}" missing valid "severity".`);
      }
      const rawFlags = typeof rule.flags === 'string' ? rule.flags : '';
      let compiled;
      try {
        compiled = new RegExp(rule.regex, rawFlags.replace(/g/g, ''));
      } catch (regexErr) {
        throw new Error(`PUBSEC-ERR-CONFIG: Rule "${rule.id}" has invalid regex: ${regexErr.message}`);
      }
      if (compiled.test('')) {
        throw new Error(`PUBSEC-ERR-CONFIG: Rule "${rule.id}" matches empty string (zero-length match prohibited).`);
      }
    }
  }

  return parsed;
}

function decodeHtmlEntitiesOnce(input) {
  return input
    .replace(/&#x([0-9a-fA-F]{1,6});/g, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _;
    })
    .replace(/&#([0-9]{1,7});/g, (_, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _;
    })
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'");
}

function decodePercentOnce(input) {
  return input.replace(/%[0-9a-fA-F]{2}/g, (seq) => {
    try {
      return decodeURIComponent(seq);
    } catch {
      return seq;
    }
  });
}

function stripHtmlTags(input) {
  return input.replace(/<[^>]{1,512}>/g, '');
}

function buildNormalizedVariants(content) {
  const variants = [{ label: 'RAW', text: content, lineIndexed: true }];

  const htmlDecoded = decodeHtmlEntitiesOnce(content);
  const urlDecoded = decodePercentOnce(htmlDecoded);
  const tagStripped = stripHtmlTags(urlDecoded);

  if (urlDecoded !== content) {
    variants.push({ label: 'DECODED', text: urlDecoded, lineIndexed: true });
  }
  if (tagStripped !== urlDecoded && tagStripped !== content) {
    variants.push({ label: 'HTML_TEXT', text: tagStripped, lineIndexed: true });
  }
  if (content.includes('\n') || content.includes('\r')) {
    variants.push({ label: 'MULTILINE', text: content, lineIndexed: false });
  }

  return variants;
}

function runRegexBounded(regex, text, onMatch) {
  let count = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[0].length === 0) {
      regex.lastIndex += 1;
      continue;
    }
    if (count >= MAX_MATCHES_PER_RULE) {
      return { exhausted: true, matchCount: count };
    }
    onMatch(match);
    count += 1;
  }
  return { exhausted: false, matchCount: count };
}

/**
 * Scans a given text buffer across validated rulesets (raw, bounded decoded,
 * HTML-tag-stripped, and multiline) and returns redacted findings.
 * @param {string} content
 * @param {string} sourceIdentifier
 * @param {object} rules
 * @returns {Array<object>}
 */
function isNegatedSecurityDisclaimer(text, matchIndex, matchLength) {
  const before = text.slice(Math.max(0, matchIndex - 40), matchIndex);
  if (/\b(?:kein(?:e[nmrs]?)?|nicht|no|without|ohne)\s+$/i.test(before)) {
    return true;
  }
  const after = text.slice(matchIndex + matchLength, matchIndex + matchLength + 90);
  const sentenceTail = after.split(/[.!?\r\n]/, 1)[0];
  if (/\b(?:nicht\s+möglich|unmöglich|nicht\s+garantiert|not\s+possible|cannot\s+be\s+guaranteed)\b/i.test(sentenceTail)) {
    return true;
  }
  return false;
}

export function scanContent(content, sourceIdentifier, rules) {
  const findings = [];
  const seenKeys = new Set();

  const ruleGroups = [
    { group: 'SECRETS', rules: rules.secret_patterns || [] },
    { group: 'PROHIBITED_CLAIMS', rules: rules.prohibited_claims || [] },
    { group: 'OPERATIONAL_DENYLIST', rules: rules.operational_denylist || [] }
  ];

  const variants = buildNormalizedVariants(content);

  for (const variant of variants) {
    if (variant.lineIndexed) {
      const lines = variant.text.split(/\r?\n/);
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const lineNumber = lineIndex + 1;
        for (const { group, rules: ruleList } of ruleGroups) {
          for (const rule of ruleList) {
            const rawFlags = rule.flags || '';
            const flags = rawFlags.includes('g') ? rawFlags : `${rawFlags}g`;
            const regex = new RegExp(rule.regex, flags);
            const runResult = runRegexBounded(regex, line, (match) => {
              if (rule.id === 'CLM-PAT-ABSOLUTE-SECURITY' && isNegatedSecurityDisclaimer(line, match.index, match[0].length)) {
                return;
              }
              const dedupKey = `${rule.id}|${lineNumber}|${rule.category}`;
              if (seenKeys.has(dedupKey)) return;
              seenKeys.add(dedupKey);
              findings.push({
                ruleId: rule.id,
                group,
                category: rule.category,
                severity: rule.severity,
                description: rule.description,
                file: sourceIdentifier,
                line: lineNumber,
                column: match.index + 1,
                matchedText: redactMatch(match[0], rule.category)
              });
            });
            if (runResult.exhausted) {
              const limitKey = `PUBSEC-ERR-MATCH-LIMIT-EXHAUSTED|${rule.id}|${lineNumber}`;
              if (!seenKeys.has(limitKey)) {
                seenKeys.add(limitKey);
                findings.push({
                  ruleId: 'PUBSEC-ERR-MATCH-LIMIT-EXHAUSTED',
                  group: 'SCANNER_LIMITS',
                  category: 'SCAN_INCOMPLETE_MATCH_LIMIT',
                  severity: 'CRITICAL',
                  description: `Regex match limit (${MAX_MATCHES_PER_RULE}) exhausted for rule ${rule.id}; scan incomplete`,
                  file: sourceIdentifier,
                  line: lineNumber,
                  column: 1,
                  matchedText: redactMatch(rule.id, 'SCAN_INCOMPLETE_MATCH_LIMIT')
                });
              }
            }
          }
        }
      }
    } else {
      for (const { group, rules: ruleList } of ruleGroups) {
        for (const rule of ruleList) {
          const rawFlags = rule.flags || '';
          const flags = rawFlags.includes('g') ? rawFlags : `${rawFlags}g`;
          const regex = new RegExp(rule.regex, flags);
          const runResult = runRegexBounded(regex, variant.text, (match) => {
            if (rule.id === 'CLM-PAT-ABSOLUTE-SECURITY' && isNegatedSecurityDisclaimer(variant.text, match.index, match[0].length)) {
              return;
            }
            const prefix = variant.text.slice(0, match.index);
            const lineNumber = prefix.split(/\r?\n/).length;
            const dedupKey = `${rule.id}|${lineNumber}|${rule.category}`;
            if (seenKeys.has(dedupKey)) return;
            seenKeys.add(dedupKey);
            findings.push({
              ruleId: rule.id,
              group,
              category: rule.category,
              severity: rule.severity,
              description: rule.description,
              file: sourceIdentifier,
              line: lineNumber,
              column: 1,
              matchedText: redactMatch(match[0], rule.category)
            });
          });
          if (runResult.exhausted) {
            const limitKey = `PUBSEC-ERR-MATCH-LIMIT-EXHAUSTED|${rule.id}|multiline`;
            if (!seenKeys.has(limitKey)) {
              seenKeys.add(limitKey);
              findings.push({
                ruleId: 'PUBSEC-ERR-MATCH-LIMIT-EXHAUSTED',
                group: 'SCANNER_LIMITS',
                category: 'SCAN_INCOMPLETE_MATCH_LIMIT',
                severity: 'CRITICAL',
                description: `Regex match limit (${MAX_MATCHES_PER_RULE}) exhausted for rule ${rule.id}; scan incomplete`,
                file: sourceIdentifier,
                line: 1,
                column: 1,
                matchedText: redactMatch(rule.id, 'SCAN_INCOMPLETE_MATCH_LIMIT')
              });
            }
          }
        }
      }
    }
  }

  return findings;
}

function hasVerifiedBinaryMagic(buf) {
  if (buf.length < 4) return false;
  // PNG
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return true;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // GIF
  if (buf.length >= 6 && (buf.subarray(0, 6).toString('ascii') === 'GIF87a' || buf.subarray(0, 6).toString('ascii') === 'GIF89a')) return true;
  // WebP (RIFF....WEBP)
  if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return true;
  // WOFF / WOFF2
  const sig4 = buf.subarray(0, 4).toString('ascii');
  if (sig4 === 'wOFF' || sig4 === 'wOF2' || sig4 === 'OTTO' || sig4 === '%PDF') return true;
  // ICO / TTF
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return true;
  if (buf[0] === 0x00 && buf[1] === 0x01 && buf[2] === 0x00 && buf[3] === 0x00) return true;
  // AVIF (ISO BMFF ftypavif / ftypavis)
  if (buf.length >= 12 && buf.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis') return true;
  }
  return false;
}

function inspectAndClassifyFile(absPath, workspaceRoot) {
  const safeRel = sanitizePathForLog(absPath, workspaceRoot);
  const stat = fs.lstatSync(absPath);
  if (stat.isSymbolicLink()) {
    throw new Error(`PUBSEC-ERR-SYMLINK: Symbolic link prohibited in scanned path (${safeRel})`);
  }
  const canonicalRoot = fs.realpathSync(workspaceRoot);
  const canonicalTarget = fs.realpathSync(absPath);
  const rel = path.relative(canonicalRoot, canonicalTarget);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`PUBSEC-ERR-PATH-ESCAPE: Path resolves outside workspace root (${safeRel})`);
  }
  if (stat.size > MAX_FILE_BYTES) {
    throw new Error(`PUBSEC-ERR-FILE-TOO-LARGE: File exceeds ${MAX_FILE_BYTES} bytes (${safeRel})`);
  }

  let buf;
  try {
    buf = fs.readFileSync(canonicalTarget);
  } catch (err) {
    return { kind: 'unreadable', safeRel, reason: err.code || 'READ_ERROR' };
  }

  if (buf.length === 0) {
    return { kind: 'text', safeRel, content: '' };
  }

  if (hasVerifiedBinaryMagic(buf)) {
    return { kind: 'binary', safeRel };
  }

  if (buf.includes(0x00)) {
    return { kind: 'ambiguous', safeRel, reason: 'NUL_BYTES_WITHOUT_VERIFIED_BINARY_MAGIC' };
  }

  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return { kind: 'ambiguous', safeRel, reason: 'INVALID_UTF8_WITHOUT_VERIFIED_BINARY_MAGIC' };
  }

  // Reject non-whitespace ASCII control characters in unknown/unverified text files
  const ext = path.extname(absPath).toLowerCase();
  if (!TEXT_ARTIFACT_EXTENSIONS.has(ext) && /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(decoded)) {
    return { kind: 'ambiguous', safeRel, reason: 'UNEXPECTED_CONTROL_BYTES' };
  }

  return { kind: 'text', safeRel, content: decoded };
}

function readSafeTextFile(absPath, workspaceRoot) {
  const safeRel = sanitizePathForLog(absPath, workspaceRoot);
  const stat = fs.lstatSync(absPath);
  if (stat.isSymbolicLink()) {
    throw new Error(`PUBSEC-ERR-SYMLINK: Symbolic link prohibited in scanned path (${safeRel})`);
  }
  const canonicalRoot = fs.realpathSync(workspaceRoot);
  const canonicalTarget = fs.realpathSync(absPath);
  const rel = path.relative(canonicalRoot, canonicalTarget);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`PUBSEC-ERR-PATH-ESCAPE: Path resolves outside workspace root (${safeRel})`);
  }
  if (stat.size > MAX_FILE_BYTES) {
    throw new Error(`PUBSEC-ERR-FILE-TOO-LARGE: File exceeds ${MAX_FILE_BYTES} bytes (${safeRel})`);
  }
  return fs.readFileSync(canonicalTarget, 'utf8');
}

function collectFilesSafely(
  rootDir,
  workspaceRoot,
  depth = 0,
  out = { allFiles: [], textFiles: [], binaryFiles: [], unknownFiles: [] }
) {
  if (depth > MAX_RECURSION_DEPTH) {
    throw new Error(`PUBSEC-ERR-MAX-DEPTH: Recursion depth exceeded ${MAX_RECURSION_DEPTH} in ${sanitizePathForLog(rootDir, workspaceRoot)}`);
  }
  const entries = fs.readdirSync(rootDir);
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry);
    const stat = fs.lstatSync(fullPath);
    if (stat.isSymbolicLink()) {
      throw new Error(`PUBSEC-ERR-SYMLINK: Symbolic link prohibited in scanned tree (${sanitizePathForLog(fullPath, workspaceRoot)})`);
    }
    if (stat.isDirectory()) {
      collectFilesSafely(fullPath, workspaceRoot, depth + 1, out);
    } else if (stat.isFile()) {
      out.allFiles.push(fullPath);
      const ext = path.extname(entry).toLowerCase();
      if (TEXT_ARTIFACT_EXTENSIONS.has(ext)) {
        out.textFiles.push(fullPath);
      } else if (BINARY_ASSET_EXTENSIONS.has(ext)) {
        out.binaryFiles.push(fullPath);
      } else {
        out.unknownFiles.push(fullPath);
      }
    }
  }
  return out;
}

function scanDeployableFiles(allFiles, workspaceRoot, rules, findings, counters, onTextFile = null) {
  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    const isKnownTextExt = TEXT_ARTIFACT_EXTENSIONS.has(ext);
    const inspection = inspectAndClassifyFile(filePath, workspaceRoot);

    if (inspection.kind === 'binary') {
      counters.binaryFilesVerified += 1;
      continue;
    }

    if (inspection.kind === 'ambiguous') {
      counters.ambiguousFilesBlocked += 1;
      findings.push({
        ruleId: 'PUBSEC-ERR-AMBIGUOUS-FILE',
        group: 'FILE_CLASSIFICATION',
        category: 'UNVERIFIED_DEPLOYABLE_FILE',
        severity: 'HIGH',
        description: `Ambiguous deployable file cannot be verified as safe binary or valid UTF-8 text (${inspection.reason})`,
        file: inspection.safeRel,
        line: 1,
        column: 1,
        matchedText: redactMatch(inspection.safeRel, 'UNVERIFIED_DEPLOYABLE_FILE')
      });
      continue;
    }

    if (inspection.kind === 'unreadable') {
      counters.unreadableFilesBlocked += 1;
      findings.push({
        ruleId: 'PUBSEC-ERR-UNREADABLE',
        group: 'FILE_CLASSIFICATION',
        category: 'UNREADABLE_DEPLOYABLE_FILE',
        severity: 'CRITICAL',
        description: `Deployable file could not be read for disclosure verification (${inspection.reason})`,
        file: inspection.safeRel,
        line: 1,
        column: 1,
        matchedText: redactMatch(inspection.safeRel, 'UNREADABLE_DEPLOYABLE_FILE')
      });
      continue;
    }

    counters.totalFilesScanned += 1;
    if (!isKnownTextExt) {
      counters.unknownTextFilesScanned += 1;
    }
    findings.push(...scanContent(inspection.content, inspection.safeRel, rules));
    if (onTextFile) {
      onTextFile(inspection.safeRel, inspection.content);
    }
  }
}

function parseMarkdownFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  return match ? match[1] : '';
}

function isPublishedLearningArticle(content) {
  const fm = parseMarkdownFrontmatter(content);
  return /publicationState:\s*['"]?published['"]?/i.test(fm);
}

function loadRegistrySafely(workspaceRoot) {
  const registryPath = path.join(workspaceRoot, 'src', 'data', 'project_registry.json');
  if (!fs.existsSync(registryPath)) {
    throw new Error('PUBSEC-ERR-CONFIG: Project registry not found (src/data/project_registry.json)');
  }
  let registry;
  try {
    registry = JSON.parse(readSafeTextFile(registryPath, workspaceRoot));
  } catch (err) {
    if (err.message.startsWith('PUBSEC-ERR-')) throw err;
    throw new Error(`PUBSEC-ERR-CONFIG: Failed to parse project registry JSON: ${err.message}`);
  }
  if (!Array.isArray(registry)) {
    throw new Error('PUBSEC-ERR-CONFIG: Project registry must be a JSON array.');
  }
  return { registryPath, registry };
}

function scanSourceMode(workspaceRoot, rules, registry, registryPath) {
  const findings = [];
  let totalFilesScanned = 0;
  let binaryFilesSkipped = 0;

  const publicProjects = registry.filter(p => p.visibility === 'PUBLIC' && p.hasCaseStudy);
  for (const project of publicProjects) {
    if (!project.contentRef) {
      findings.push({
        ruleId: 'PUBSEC-ERR-MALFORMED',
        group: 'REGISTRY',
        category: 'MISSING_CONTENT_REF',
        severity: 'CRITICAL',
        description: `Public project ${project.projectId || 'UNKNOWN'} is missing contentRef`,
        file: 'src/data/project_registry.json',
        line: 1,
        column: 1,
        matchedText: redactMatch(project.slug || 'missing', 'MISSING_CONTENT_REF')
      });
      continue;
    }

    const fullContentPath = path.resolve(workspaceRoot, project.contentRef);
    if (!fs.existsSync(fullContentPath)) {
      findings.push({
        ruleId: 'PUBSEC-ERR-MALFORMED',
        group: 'REGISTRY',
        category: 'CONTENT_FILE_NOT_FOUND',
        severity: 'CRITICAL',
        description: `Content file missing for public project ${project.slug}`,
        file: 'src/data/project_registry.json',
        line: 1,
        column: 1,
        matchedText: redactMatch(project.contentRef, 'CONTENT_FILE_NOT_FOUND')
      });
      continue;
    }

    const content = readSafeTextFile(fullContentPath, workspaceRoot);
    totalFilesScanned += 1;
    findings.push(...scanContent(content, sanitizePathForLog(fullContentPath, workspaceRoot), rules));

    const projectMetaText = JSON.stringify({
      title: project.title,
      shortName: project.shortName,
      summary: project.summary,
      description: project.description,
      heroImage: project.heroImage,
      tags: project.tags,
      externalUrl: project.externalUrl,
      repoUrl: project.repoUrl
    });
    findings.push(...scanContent(projectMetaText, `src/data/project_registry.json#${project.slug}`, rules));

    if (project.slug === 'becc') {
      if (project.heroImage && project.heroImage !== '') {
        findings.push({
          ruleId: 'PUBSEC-ERR-ASSET-MISMATCH',
          group: 'ASSET_POLICY',
          category: 'MISLEADING_IMAGERY',
          severity: 'HIGH',
          description: 'BECC project registry heroImage must remain cleared',
          file: 'src/data/project_registry.json',
          line: 1,
          column: 1,
          matchedText: redactMatch(project.heroImage, 'MISLEADING_IMAGERY')
        });
      }
      if (content.includes('BG-PA04-Governance.webp')) {
        findings.push({
          ruleId: 'PUBSEC-ERR-ASSET-MISMATCH',
          group: 'ASSET_POLICY',
          category: 'MISLEADING_IMAGERY',
          severity: 'HIGH',
          description: 'BECC markdown content must not reference BG-PA04-Governance.webp',
          file: sanitizePathForLog(fullContentPath, workspaceRoot),
          line: 1,
          column: 1,
          matchedText: redactMatch('BG-PA04-Governance.webp', 'MISLEADING_IMAGERY')
        });
      }
    }
  }

  // Public learning articles (published only)
  const learningDir = path.join(workspaceRoot, 'src', 'content', 'learning');
  if (fs.existsSync(learningDir)) {
    for (const entry of fs.readdirSync(learningDir)) {
      if (!entry.endsWith('.md')) continue;
      const fullPath = path.join(learningDir, entry);
      const content = readSafeTextFile(fullPath, workspaceRoot);
      if (!isPublishedLearningArticle(content)) continue;
      totalFilesScanned += 1;
      findings.push(...scanContent(content, sanitizePathForLog(fullPath, workspaceRoot), rules));
    }
  }

  // Learning categories, general pages content, and Astro pages
  const extraSourceDirs = [
    path.join(workspaceRoot, 'src', 'content', 'learningCategories'),
    path.join(workspaceRoot, 'src', 'content', 'pages'),
    path.join(workspaceRoot, 'src', 'pages')
  ];
  for (const dir of extraSourceDirs) {
    if (!fs.existsSync(dir)) continue;
    const collected = collectFilesSafely(dir, workspaceRoot);
    for (const filePath of [...collected.textFiles, ...collected.unknownFiles]) {
      const ext = path.extname(filePath).toLowerCase();
      if (!['.json', '.astro', '.ts', '.js', '.md'].includes(ext)) continue;
      const content = readSafeTextFile(filePath, workspaceRoot);
      totalFilesScanned += 1;
      findings.push(...scanContent(content, sanitizePathForLog(filePath, workspaceRoot), rules));
    }
  }

  // Public static assets under public/ (content-inspected; no directory or extension bypass)
  const deployableCounters = {
    totalFilesScanned: 0,
    unknownTextFilesScanned: 0,
    binaryFilesVerified: 0,
    ambiguousFilesBlocked: 0,
    unreadableFilesBlocked: 0
  };
  const publicDir = path.join(workspaceRoot, 'public');
  if (fs.existsSync(publicDir)) {
    const collected = collectFilesSafely(publicDir, workspaceRoot);
    scanDeployableFiles(collected.allFiles, workspaceRoot, rules, findings, deployableCounters);
    totalFilesScanned += deployableCounters.totalFilesScanned;
    binaryFilesSkipped += deployableCounters.binaryFilesVerified;
  }

  void registryPath;
  return {
    findings,
    totalFilesScanned,
    coverage: {
      mode: 'source',
      textFilesScanned: totalFilesScanned,
      unknownTextFilesScanned: deployableCounters.unknownTextFilesScanned,
      binaryFilesVerified: binaryFilesSkipped,
      binaryFilesSkipped,
      ambiguousFilesBlocked: deployableCounters.ambiguousFilesBlocked,
      unreadableFilesBlocked: deployableCounters.unreadableFilesBlocked,
      externalContentExcluded: true
    }
  };
}

function scanRenderedMode(workspaceRoot, rules, registry) {
  const distDir = path.join(workspaceRoot, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('PUBSEC-ERR-DIST-MISSING: Rendered output directory dist/ does not exist.');
  }

  const findings = [];
  let totalFilesScanned = 0;

  // Verify required generated routes exist
  const requiredRoutes = [
    'index.html',
    'about/index.html',
    'contact/index.html',
    'datenschutz/index.html',
    'impressum/index.html',
    'projects/index.html',
    'lernen/index.html',
    'sitemap.xml'
  ];

  const publicProjects = registry.filter(p => p.visibility === 'PUBLIC' && p.hasCaseStudy);
  for (const project of publicProjects) {
    requiredRoutes.push(`project-${project.slug}/index.html`);
  }

  const learningDir = path.join(workspaceRoot, 'src', 'content', 'learning');
  if (fs.existsSync(learningDir)) {
    for (const entry of fs.readdirSync(learningDir)) {
      if (!entry.endsWith('.md')) continue;
      const content = readSafeTextFile(path.join(learningDir, entry), workspaceRoot);
      if (!isPublishedLearningArticle(content)) continue;
      const slug = entry.replace(/\.md$/, '');
      requiredRoutes.push(`lernen/${slug}/index.html`);
    }
  }

  for (const relRoute of requiredRoutes) {
    const fullRoutePath = path.join(distDir, relRoute);
    if (!fs.existsSync(fullRoutePath)) {
      findings.push({
        ruleId: 'PUBSEC-ERR-MISSING-ROUTE',
        group: 'RENDERED_COVERAGE',
        category: 'MISSING_RENDERED_OUTPUT',
        severity: 'CRITICAL',
        description: `Expected generated public route missing: dist/${relRoute}`,
        file: `dist/${relRoute}`,
        line: 1,
        column: 1,
        matchedText: redactMatch(relRoute, 'MISSING_RENDERED_OUTPUT')
      });
    }
  }

  // Ensure draft/non-public projects never appear in dist/
  const nonPublicProjects = registry.filter(p => p.visibility !== 'PUBLIC' || !p.hasCaseStudy);
  for (const draft of nonPublicProjects) {
    const draftRoute = path.join(distDir, `project-${draft.slug}`, 'index.html');
    if (fs.existsSync(draftRoute)) {
      findings.push({
        ruleId: 'PUBSEC-ERR-DRAFT-LEAK',
        group: 'RENDERED_COVERAGE',
        category: 'DRAFT_CONTENT_LEAKAGE',
        severity: 'CRITICAL',
        description: `Non-public project route unexpectedly rendered in dist/`,
        file: `dist/project-${draft.slug}/index.html`,
        line: 1,
        column: 1,
        matchedText: redactMatch(draft.slug, 'DRAFT_CONTENT_LEAKAGE')
      });
    }
  }

  // Recursively inspect and scan all deployable files in dist/ (no directory or extension bypass)
  const collected = collectFilesSafely(distDir, workspaceRoot);
  const internalLeakIndicators = [
    'stewardship/reports',
    'becc-runtime/',
    'provenance_registry.json',
    'local_integrity_manifest.json'
  ];

  const deployableCounters = {
    totalFilesScanned: 0,
    unknownTextFilesScanned: 0,
    binaryFilesVerified: 0,
    ambiguousFilesBlocked: 0,
    unreadableFilesBlocked: 0
  };

  scanDeployableFiles(collected.allFiles, workspaceRoot, rules, findings, deployableCounters, (safeRel, content) => {
    for (const draft of nonPublicProjects) {
      if (safeRel === 'dist/projects/index.html' || safeRel === 'dist/sitemap.xml') {
        if (content.includes(`/project-${draft.slug}`)) {
          findings.push({
            ruleId: 'PUBSEC-ERR-DRAFT-LEAK',
            group: 'RENDERED_COVERAGE',
            category: 'DRAFT_CONTENT_LEAKAGE',
            severity: 'CRITICAL',
            description: `Non-public project slug referenced in ${safeRel}`,
            file: safeRel,
            line: 1,
            column: 1,
            matchedText: redactMatch(draft.slug, 'DRAFT_CONTENT_LEAKAGE')
          });
        }
      }
    }

    for (const indicator of internalLeakIndicators) {
      if (content.includes(indicator)) {
        findings.push({
          ruleId: 'PUBSEC-ERR-INTERNAL-REF',
          group: 'RENDERED_COVERAGE',
          category: 'INTERNAL_ARTIFACT_LEAKAGE',
          severity: 'HIGH',
          description: `Internal repository reference detected in ${safeRel}`,
          file: safeRel,
          line: 1,
          column: 1,
          matchedText: redactMatch(indicator, 'INTERNAL_ARTIFACT_LEAKAGE')
        });
      }
    }
  });

  totalFilesScanned += deployableCounters.totalFilesScanned;

  return {
    findings,
    totalFilesScanned,
    coverage: {
      mode: 'rendered',
      textFilesScanned: totalFilesScanned,
      unknownTextFilesScanned: deployableCounters.unknownTextFilesScanned,
      binaryFilesVerified: deployableCounters.binaryFilesVerified,
      binaryFilesSkipped: deployableCounters.binaryFilesVerified,
      ambiguousFilesBlocked: deployableCounters.ambiguousFilesBlocked,
      unreadableFilesBlocked: deployableCounters.unreadableFilesBlocked,
      externalContentExcluded: true
    }
  };
}

/**
 * Validates public-bound source content and/or rendered dist/ output against disclosure boundaries.
 * @param {object} [options]
 * @returns {{ pass: boolean, totalFilesScanned: number, findings: Array<object>, summary: object, coverage: object }}
 */
export function validateProjectDisclosure(options = {}) {
  const workspaceRoot = options.workspaceRoot || defaultWorkspaceRoot;
  const rulesPath = options.rulesPath || path.join(workspaceRoot, 'tooling', 'publication_security', 'disclosure_rules.json');
  let mode = options.mode;
  if (!mode) {
    mode = options.scanBuildOutput === false ? 'source' : 'all';
  }
  if (!['source', 'rendered', 'all'].includes(mode)) {
    throw new Error(`PUBSEC-ERR-CONFIG: Unsupported disclosure scan mode "${mode}".`);
  }

  const rules = loadRules(rulesPath, workspaceRoot);
  const { registryPath, registry } = loadRegistrySafely(workspaceRoot);

  const allFindings = [];
  let totalFilesScanned = 0;
  let binaryFilesSkipped = 0;
  let unknownTextFilesScanned = 0;
  let ambiguousFilesBlocked = 0;
  let unreadableFilesBlocked = 0;

  if (mode === 'source' || mode === 'all') {
    const srcRes = scanSourceMode(workspaceRoot, rules, registry, registryPath);
    allFindings.push(...srcRes.findings);
    totalFilesScanned += srcRes.totalFilesScanned;
    binaryFilesSkipped += srcRes.coverage.binaryFilesSkipped;
    unknownTextFilesScanned += srcRes.coverage.unknownTextFilesScanned;
    ambiguousFilesBlocked += srcRes.coverage.ambiguousFilesBlocked;
    unreadableFilesBlocked += srcRes.coverage.unreadableFilesBlocked;
  }

  if (mode === 'rendered' || mode === 'all') {
    const renRes = scanRenderedMode(workspaceRoot, rules, registry);
    allFindings.push(...renRes.findings);
    totalFilesScanned += renRes.totalFilesScanned;
    binaryFilesSkipped += renRes.coverage.binaryFilesSkipped;
    unknownTextFilesScanned += renRes.coverage.unknownTextFilesScanned;
    ambiguousFilesBlocked += renRes.coverage.ambiguousFilesBlocked;
    unreadableFilesBlocked += renRes.coverage.unreadableFilesBlocked;
  }

  const pass = allFindings.length === 0;
  return {
    pass,
    totalFilesScanned,
    findings: allFindings,
    summary: {
      totalFindings: allFindings.length,
      criticalCount: allFindings.filter(f => f.severity === 'CRITICAL').length,
      highCount: allFindings.filter(f => f.severity === 'HIGH').length,
      mediumCount: allFindings.filter(f => f.severity === 'MEDIUM').length,
      lowCount: allFindings.filter(f => f.severity === 'LOW').length
    },
    coverage: {
      mode,
      textFilesScanned: totalFilesScanned,
      unknownTextFilesScanned,
      binaryFilesVerified: binaryFilesSkipped,
      binaryFilesSkipped,
      ambiguousFilesBlocked,
      unreadableFilesBlocked,
      externalContentExcluded: true
    }
  };
}

function parseCliMode(argv) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--mode' && i + 1 < argv.length) {
      return argv[i + 1];
    }
    if (argv[i].startsWith('--mode=')) {
      return argv[i].slice('--mode='.length);
    }
  }
  return 'all';
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const mode = parseCliMode(process.argv.slice(2));
  console.log('====================================================');
  console.log('   BRIDGENTA PORTFOLIO PUBLICATION SECURITY GATE   ');
  console.log('====================================================');
  console.log(`Mode: ${mode}`);

  try {
    const result = validateProjectDisclosure({ workspaceRoot: process.cwd(), mode });
    console.log(`Scanned text files: ${result.totalFilesScanned}`);
    console.log(`Binary assets excluded (documented policy): ${result.coverage.binaryFilesSkipped}`);
    console.log(`Total findings: ${result.summary.totalFindings}`);

    if (!result.pass) {
      console.error('\n❌ PUBLICATION SECURITY VIOLATIONS DETECTED:');
      for (const f of result.findings) {
        console.error(` [${f.severity}] [${f.ruleId}] ${f.file}:${f.line}:${f.column} - ${f.description}`);
        console.error(`   Matched (redacted): ${f.matchedText}`);
      }
      console.log('====================================================');
      process.exit(1);
    }

    console.log('\n✅ RESULT: ALL PUBLICATION DISCLOSURE CHECKS PASS');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ FATAL GATE FAILURE: ${err.message}`);
    console.log('====================================================');
    process.exit(1);
  }
}
