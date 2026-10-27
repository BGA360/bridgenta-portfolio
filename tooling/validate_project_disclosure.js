import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultWorkspaceRoot = path.resolve(__dirname, '..');

/**
 * Redacts sensitive matched text so secrets are never printed in logs or test outputs.
 * @param {string} text 
 * @param {string} category 
 * @returns {string}
 */
export function redactMatch(text, category) {
  if (category === 'CREDENTIAL_EMBEDDED_URI') {
    return text.replace(/:([^@/\s:]+)@/, ':***REDACTED_PASSWORD***@');
  }
  if (category === 'PRIVATE_KEY') {
    return '-----BEGIN [REDACTED PRIVATE KEY]-----';
  }
  if (category === 'AWS_ACCESS_KEY' || category === 'GITHUB_TOKEN' || category === 'SLACK_TOKEN' || category === 'HARDCODED_SECRET_VARIABLE') {
    if (text.length <= 8) return '***REDACTED_SECRET***';
    return text.slice(0, 4) + '***REDACTED_SECRET***' + text.slice(-3);
  }
  return text;
}

/**
 * Loads disclosure rules from configuration.
 * @param {string} rulesPath 
 * @returns {object}
 */
export function loadRules(rulesPath) {
  if (!fs.existsSync(rulesPath)) {
    throw new Error(`PUBSEC-ERR-CONFIG: Disclosure rules file not found at ${rulesPath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  } catch (err) {
    throw new Error(`PUBSEC-ERR-CONFIG: Failed to parse disclosure rules JSON: ${err.message}`);
  }
}

/**
 * Scans a given text buffer across rulesets and returns findings.
 * @param {string} content 
 * @param {string} sourceIdentifier 
 * @param {object} rules 
 * @returns {Array<object>}
 */
export function scanContent(content, sourceIdentifier, rules) {
  const findings = [];
  const lines = content.split(/\r?\n/);

  // Grouped rule groups to evaluate
  const ruleGroups = [
    { group: 'SECRETS', rules: rules.secret_patterns || [], defaultSeverity: 'CRITICAL' },
    { group: 'PROHIBITED_CLAIMS', rules: rules.prohibited_claims || [], defaultSeverity: 'HIGH' },
    { group: 'OPERATIONAL_DENYLIST', rules: rules.operational_denylist || [], defaultSeverity: 'HIGH' }
  ];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineNumber = lineIndex + 1;

    for (const { group, rules: ruleList } of ruleGroups) {
      for (const rule of ruleList) {
        try {
          const rawFlags = rule.flags || '';
          const flags = rawFlags.includes('g') ? rawFlags : `${rawFlags}g`;
          const regex = new RegExp(rule.regex, flags);
          let match;
          while ((match = regex.exec(line)) !== null) {
            const rawMatch = match[0];
            const redacted = redactMatch(rawMatch, rule.category);
            findings.push({
              ruleId: rule.id,
              group,
              category: rule.category,
              severity: rule.severity,
              description: rule.description,
              file: sourceIdentifier,
              line: lineNumber,
              column: match.index + 1,
              matchedText: redacted
            });
          }
        } catch (regexErr) {
          findings.push({
            ruleId: 'PUBSEC-ERR-REGEX',
            group: 'INTERNAL_ERROR',
            category: 'REGEX_ERROR',
            severity: 'CRITICAL',
            description: `Invalid regex in rule ${rule.id}: ${regexErr.message}`,
            file: sourceIdentifier,
            line: lineNumber,
            column: 1,
            matchedText: 'N/A'
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Validates public project case studies and optional rendered build output against disclosure boundaries.
 * @param {object} options 
 * @returns {{ pass: boolean, totalScanned: number, findings: Array<object>, summary: object }}
 */
export function validateProjectDisclosure(options = {}) {
  const workspaceRoot = options.workspaceRoot || defaultWorkspaceRoot;
  const rulesPath = options.rulesPath || path.join(workspaceRoot, 'tooling', 'publication_security', 'disclosure_rules.json');
  const registryPath = path.join(workspaceRoot, 'src', 'data', 'project_registry.json');
  const distDir = path.join(workspaceRoot, 'dist');
  const scanBuildOutput = options.scanBuildOutput ?? true;

  const rules = loadRules(rulesPath);
  const allFindings = [];
  let totalFilesScanned = 0;

  // 1. Load and parse Project Registry
  if (!fs.existsSync(registryPath)) {
    throw new Error(`PUBSEC-ERR-CONFIG: Project registry not found at ${registryPath}`);
  }
  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch (err) {
    throw new Error(`PUBSEC-ERR-CONFIG: Failed to parse project registry JSON: ${err.message}`);
  }

  // 2. Filter public projects with case studies
  const publicProjects = registry.filter(p => p.visibility === 'PUBLIC' && p.hasCaseStudy);

  for (const project of publicProjects) {
    if (!project.contentRef) {
      allFindings.push({
        ruleId: 'PUBSEC-ERR-MALFORMED',
        group: 'REGISTRY',
        category: 'MISSING_CONTENT_REF',
        severity: 'CRITICAL',
        description: `Public project ${project.projectId} (${project.slug}) is missing contentRef`,
        file: registryPath,
        line: 1,
        column: 1,
        matchedText: project.slug
      });
      continue;
    }

    const fullContentPath = path.resolve(workspaceRoot, project.contentRef);
    if (!fs.existsSync(fullContentPath)) {
      allFindings.push({
        ruleId: 'PUBSEC-ERR-MALFORMED',
        group: 'REGISTRY',
        category: 'CONTENT_FILE_NOT_FOUND',
        severity: 'CRITICAL',
        description: `Content file for ${project.slug} not found at ${project.contentRef}`,
        file: registryPath,
        line: 1,
        column: 1,
        matchedText: project.contentRef
      });
      continue;
    }

    // Scan Markdown content file (both frontmatter and body)
    const content = fs.readFileSync(fullContentPath, 'utf8');
    totalFilesScanned++;
    const contentFindings = scanContent(content, project.contentRef, rules);
    allFindings.push(...contentFindings);

    // Specific asset reference boundary check:
    // Ensure BECC never references BridGenta governance hero/card imagery
    if (project.slug === 'becc') {
      if (project.heroImage && project.heroImage !== '') {
        allFindings.push({
          ruleId: 'PUBSEC-ERR-ASSET-MISMATCH',
          group: 'ASSET_POLICY',
          category: 'MISLEADING_IMAGERY',
          severity: 'HIGH',
          description: `BECC project registry heroImage must be cleared, found: "${project.heroImage}"`,
          file: registryPath,
          line: 1,
          column: 1,
          matchedText: project.heroImage
        });
      }
      if (content.includes('BG-PA04-Governance.webp')) {
        allFindings.push({
          ruleId: 'PUBSEC-ERR-ASSET-MISMATCH',
          group: 'ASSET_POLICY',
          category: 'MISLEADING_IMAGERY',
          severity: 'HIGH',
          description: `BECC markdown content must not reference BG-PA04-Governance.webp`,
          file: project.contentRef,
          line: 1,
          column: 1,
          matchedText: 'BG-PA04-Governance.webp'
        });
      }
    }

    // 3. Optional post-build rendered output scan
    if (scanBuildOutput && fs.existsSync(distDir)) {
      const renderedSlugPath = path.join(distDir, `project-${project.slug}`, 'index.html');
      if (fs.existsSync(renderedSlugPath)) {
        const renderedHtml = fs.readFileSync(renderedSlugPath, 'utf8');
        totalFilesScanned++;
        const renderedFindings = scanContent(renderedHtml, `dist/project-${project.slug}/index.html`, rules);
        allFindings.push(...renderedFindings);
      }
    }
  }

  // Also scan catalog index if dist exists
  if (scanBuildOutput && fs.existsSync(distDir)) {
    const catalogPath = path.join(distDir, 'projects', 'index.html');
    if (fs.existsSync(catalogPath)) {
      const catalogHtml = fs.readFileSync(catalogPath, 'utf8');
      totalFilesScanned++;
      const catalogFindings = scanContent(catalogHtml, 'dist/projects/index.html', rules);
      allFindings.push(...catalogFindings);
    }
  }

  const pass = allFindings.length === 0;
  const criticalCount = allFindings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = allFindings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = allFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = allFindings.filter(f => f.severity === 'LOW').length;

  return {
    pass,
    totalFilesScanned,
    findings: allFindings,
    summary: {
      totalFindings: allFindings.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount
    }
  };
}

// CLI execution block
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  console.log('====================================================');
  console.log('   BRIDGENTA PORTFOLIO PUBLICATION SECURITY GATE   ');
  console.log('====================================================');

  try {
    const result = validateProjectDisclosure();
    console.log(`Scanned files: ${result.totalFilesScanned}`);
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
