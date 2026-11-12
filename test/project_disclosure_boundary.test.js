import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

import {
  scanContent,
  loadRules,
  redactMatch,
  sanitizePathForLog,
  validateProjectDisclosure
} from '../tooling/validate_project_disclosure.js';
import { getPublicProjects } from '../src/utils/project_registry.ts';

function createSyntheticWorkspace(tmpDir) {
  fs.mkdirSync(path.join(tmpDir, 'tooling', 'publication_security'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'src', 'data'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'src', 'content', 'projects'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'src', 'content', 'learning'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'src', 'content', 'pages'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'public'), { recursive: true });

  fs.copyFileSync(
    path.join(process.cwd(), 'tooling', 'publication_security', 'disclosure_rules.json'),
    path.join(tmpDir, 'tooling', 'publication_security', 'disclosure_rules.json')
  );

  const registry = [
    {
      projectId: 'PRJ-PUB',
      slug: 'public-demo',
      title: 'Public Demo',
      shortName: 'PublicDemo',
      visibility: 'PUBLIC',
      hasCaseStudy: true,
      contentRef: 'src/content/projects/public-demo.md',
      summary: 'Clean public summary',
      description: 'Clean public description',
      heroImage: '',
      tags: ['Node.js']
    },
    {
      projectId: 'PRJ-DRAFT',
      slug: 'secret-draft',
      title: 'Secret Draft',
      shortName: 'SecretDraft',
      visibility: 'DRAFT',
      hasCaseStudy: false,
      contentRef: 'src/content/projects/secret-draft.md',
      summary: 'Draft summary',
      description: 'Draft description',
      heroImage: '',
      tags: []
    }
  ];
  fs.writeFileSync(path.join(tmpDir, 'src', 'data', 'project_registry.json'), JSON.stringify(registry, null, 2), 'utf8');
  fs.writeFileSync(path.join(tmpDir, 'src', 'content', 'projects', 'public-demo.md'), '# Public Demo\nClean case study.\n', 'utf8');
  fs.writeFileSync(path.join(tmpDir, 'src', 'content', 'projects', 'secret-draft.md'), '# Draft\nDraft content.\n', 'utf8');
  fs.writeFileSync(
    path.join(tmpDir, 'src', 'content', 'learning', 'sample-article.md'),
    '---\ntitle: "Sample"\npublicationState: "published"\n---\nClean learning article.\n',
    'utf8'
  );
  fs.writeFileSync(path.join(tmpDir, 'src', 'content', 'pages', 'home.json'), '{"headline":"Clean Home"}', 'utf8');
  fs.writeFileSync(path.join(tmpDir, 'public', 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');
}

function populateSyntheticDist(tmpDir) {
  const routes = [
    'index.html',
    'about/index.html',
    'contact/index.html',
    'datenschutz/index.html',
    'impressum/index.html',
    'projects/index.html',
    'lernen/index.html',
    'lernen/sample-article/index.html',
    'project-public-demo/index.html',
    'sitemap.xml'
  ];
  for (const rel of routes) {
    const full = path.join(tmpDir, 'dist', rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, '<html><body>Clean public page</body></html>', 'utf8');
  }
}

describe('Universal Portfolio Publication Disclosure & Security Gate V2', () => {
  const workspaceRoot = process.cwd();
  const rulesPath = path.join(workspaceRoot, 'tooling', 'publication_security', 'disclosure_rules.json');
  const rules = loadRules(rulesPath, workspaceRoot);

  it('1. Clean general public technical content passes without false positives', () => {
    const cleanSample = `
# Moderne Web-Architektur
Wir nutzen Node.js, TypeScript und PostgreSQL 16.8 in der Cloud-Region Frankfurt am Main.
Das System folgt dem Least-Privilege-Prinzip mit Append-Only-Auditierung.
Die Datenbankverbindung erzwingt TLS mit strict CA-Prüfung (rejectUnauthorized: true).
Automatisierte PITR-Backups schützen vor Datenverlust.
    `.trim();
    const findings = scanContent(cleanSample, 'test/clean_sample.md', rules);
    assert.equal(findings.length, 0);
  });

  it('2. Known credentials and tokens are detected with complete redaction (no fragments)', () => {
    const syntheticToken = 'ghp_' + '0123456789abcdef0123456789abcdef0123';
    const syntheticAws = 'AKIA' + '0000000000000000';
    const secretSample = [
      'postgres://demo_user:SyntheticPass999!@db.example.invalid:5432/demodb',
      `const token = "${syntheticToken}";`,
      `const awsKey = "${syntheticAws}";`,
      "api_key: 'synthetic_api_key_example_123456'"
    ].join('\n');

    const findings = scanContent(secretSample, 'test/secret_sample.md', rules);
    assert.ok(findings.length >= 4);
    for (const f of findings) {
      assert.equal(f.severity, 'CRITICAL');
      assert.equal(f.matchedText, `[REDACTED:${f.category}]`);
      assert.equal(f.matchedText.includes('SyntheticPass999!'), false);
      assert.equal(f.matchedText.includes('ghp_'), false);
      assert.equal(f.matchedText.includes('AKIA'), false);
      assert.equal(f.matchedText.includes('synthetic_api_key'), false);
    }
  });

  it('3. Operational details are detected and fully redacted', () => {
    const opsSample = [
      'Host: synthetic-db.onrender.com:5432',
      'Role: postgres_admin and becc_app',
      'Table: becc.becc_audit_records',
      'Instance: becc-test-runtime',
      'Ticket: GAP-PROD-999 and DEC-OWNER-999'
    ].join('\n');

    const findings = scanContent(opsSample, 'test/ops_sample.md', rules);
    assert.ok(findings.length >= 5);
    for (const f of findings) {
      assert.equal(f.matchedText, `[REDACTED:${f.category}]`);
      assert.equal(f.matchedText.includes('synthetic-db.onrender.com'), false);
      assert.equal(f.matchedText.includes('postgres_admin'), false);
      assert.equal(f.matchedText.includes('becc_app'), false);
    }
  });

  it('4. URL-encoded and HTML-entity-encoded sensitive values are detected', () => {
    const encodedSample = [
      'Link: postgres%3A%2F%2Fuser%3ASyntheticPass99%40db.example.invalid%3A5432%2Fapp',
      'Entity: api_key&#58; &#39;synthetic_entity_secret_123456&#39;'
    ].join('\n');

    const findings = scanContent(encodedSample, 'test/encoded.html', rules);
    const categories = new Set(findings.map(f => f.category));
    assert.ok(categories.has('CREDENTIAL_EMBEDDED_URI'));
    assert.ok(categories.has('HARDCODED_SECRET_VARIABLE'));
  });

  it('5. HTML-split and multiline secrets are detected', () => {
    const splitAndMultiline = [
      '<p><span>ghp_</span><span>' + 'a'.repeat(36) + '</span></p>',
      '-----BEGIN RSA PRIVATE KEY-----',
      'MIIEowIBAAKCAQEA0000000000000000',
      '-----END RSA PRIVATE KEY-----'
    ].join('\n');

    const findings = scanContent(splitAndMultiline, 'dist/split.html', rules);
    const categories = new Set(findings.map(f => f.category));
    assert.ok(categories.has('GITHUB_TOKEN'));
    assert.ok(categories.has('PRIVATE_KEY'));
  });

  it('6. Missing or malformed ruleset fails closed', () => {
    assert.throws(
      () => loadRules(path.join(workspaceRoot, 'tooling', 'publication_security', 'non_existent.json'), workspaceRoot),
      /PUBSEC-ERR-CONFIG/
    );
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-bad-rules-'));
    try {
      const badJsonPath = path.join(tmp, 'bad.json');
      fs.writeFileSync(badJsonPath, '{"secret_patterns": "not-an-array"}', 'utf8');
      assert.throws(() => loadRules(badJsonPath, tmp), /PUBSEC-ERR-CONFIG/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('7. Invalid and empty regex patterns fail safely without hanging', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-bad-regex-'));
    try {
      const emptyRegexPath = path.join(tmp, 'empty-regex.json');
      fs.writeFileSync(
        emptyRegexPath,
        JSON.stringify({
          secret_patterns: [{ id: 'R1', regex: '', category: 'X', severity: 'HIGH', description: 'empty' }],
          prohibited_claims: [],
          operational_denylist: []
        }),
        'utf8'
      );
      assert.throws(() => loadRules(emptyRegexPath, tmp), /PUBSEC-ERR-CONFIG/);

      const zeroLenPath = path.join(tmp, 'zero-len.json');
      fs.writeFileSync(
        zeroLenPath,
        JSON.stringify({
          secret_patterns: [{ id: 'R2', regex: 'a*', category: 'X', severity: 'HIGH', description: 'zero-len' }],
          prohibited_claims: [],
          operational_denylist: []
        }),
        'utf8'
      );
      assert.throws(() => loadRules(zeroLenPath, tmp), /zero-length match prohibited/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('8. Source-only mode works without dist/', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-source-only-'));
    try {
      createSyntheticWorkspace(tmp);
      const res = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'source' });
      assert.equal(res.pass, true);
      assert.equal(res.coverage.mode, 'source');
      assert.ok(res.totalFilesScanned >= 4);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('9. Rendered mode fails closed when dist/ is missing', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-no-dist-'));
    try {
      createSyntheticWorkspace(tmp);
      assert.throws(
        () => validateProjectDisclosure({ workspaceRoot: tmp, mode: 'rendered' }),
        /PUBSEC-ERR-DIST-MISSING/
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('10. Missing required generated routes fail closed in rendered mode', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-missing-route-'));
    try {
      createSyntheticWorkspace(tmp);
      populateSyntheticDist(tmp);
      fs.rmSync(path.join(tmp, 'dist', 'project-public-demo', 'index.html'));
      const res = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'rendered' });
      assert.equal(res.pass, false);
      assert.ok(res.findings.some(f => f.category === 'MISSING_RENDERED_OUTPUT'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('11. Unexpected deployable text artifacts (JS/SVG/XML/CSS) in dist/ are scanned', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-unexpected-dist-'));
    try {
      createSyntheticWorkspace(tmp);
      populateSyntheticDist(tmp);
      fs.mkdirSync(path.join(tmp, 'dist', '_astro'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'dist', '_astro', 'bundle.js'),
        'const leaked = "AKIA' + '0000000000000000";',
        'utf8'
      );
      const res = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'rendered' });
      assert.equal(res.pass, false);
      assert.ok(res.findings.some(f => f.file === 'dist/_astro/bundle.js' && f.category === 'AWS_ACCESS_KEY'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('12. Draft/private project leakage and internal artifact references in dist/ are detected', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-draft-leak-'));
    try {
      createSyntheticWorkspace(tmp);
      populateSyntheticDist(tmp);
      const draftDir = path.join(tmp, 'dist', 'project-secret-draft');
      fs.mkdirSync(draftDir, { recursive: true });
      fs.writeFileSync(path.join(draftDir, 'index.html'), '<html>Leaked draft</html>', 'utf8');
      fs.writeFileSync(path.join(tmp, 'dist', 'sitemap.xml'), '<url>/project-secret-draft</url>', 'utf8');

      const res = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'rendered' });
      assert.equal(res.pass, false);
      assert.ok(res.findings.some(f => f.category === 'DRAFT_CONTENT_LEAKAGE'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('13. CI CLI output contains no raw sensitive matched values or private local paths', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-cli-redact-'));
    try {
      createSyntheticWorkspace(tmp);
      const rawSecret = 'postgres://leak_user:NeverPrintThisSecret!@internal-host.onrender.com:5432/db';
      fs.writeFileSync(
        path.join(tmp, 'src', 'content', 'projects', 'public-demo.md'),
        `# Leak\n${rawSecret}\n`,
        'utf8'
      );
      const proc = spawnSync(
        process.execPath,
        [path.join(workspaceRoot, 'tooling', 'validate_project_disclosure.js'), '--mode', 'source'],
        { cwd: tmp, encoding: 'utf8' }
      );
      assert.notEqual(proc.status, 0);
      const combined = `${proc.stdout}\n${proc.stderr}`;
      assert.ok(combined.includes('[REDACTED:CREDENTIAL_EMBEDDED_URI]'));
      assert.equal(combined.includes('NeverPrintThisSecret!'), false);
      assert.equal(combined.includes('internal-host.onrender.com'), false);
      assert.equal(combined.includes(tmp), false);
      assert.equal(sanitizePathForLog('/outside/secret/path', tmp), '[REDACTED:EXTERNAL_PATH]');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('14. Existing BECC-specific disclosure regression guard executes and passes', () => {
    execFileSync(process.execPath, ['--test', 'test/becc_disclosure_boundary.test.js'], {
      cwd: workspaceRoot,
      stdio: 'pipe'
    });
  });

  it('15. Public project discovery responds dynamically to governed registry changes', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-registry-dyn-'));
    try {
      createSyntheticWorkspace(tmp);
      const regPath = path.join(tmp, 'src', 'data', 'project_registry.json');
      const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      reg.push({
        projectId: 'PRJ-NEW',
        slug: 'new-public',
        title: 'New Public',
        shortName: 'NewPublic',
        visibility: 'PUBLIC',
        hasCaseStudy: true,
        contentRef: 'src/content/projects/new-public.md',
        summary: 'Clean',
        description: 'Clean',
        heroImage: '',
        tags: []
      });
      fs.writeFileSync(regPath, JSON.stringify(reg, null, 2), 'utf8');
      fs.writeFileSync(
        path.join(tmp, 'src', 'content', 'projects', 'new-public.md'),
        '# New\nClean? No: ghp_' + 'z'.repeat(36),
        'utf8'
      );
      const res = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'source' });
      assert.equal(res.pass, false);
      assert.ok(res.findings.some(f => f.file === 'src/content/projects/new-public.md'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('16. Public learning articles and general page content are covered in source mode', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-pages-learning-'));
    try {
      createSyntheticWorkspace(tmp);
      fs.writeFileSync(
        path.join(tmp, 'src', 'content', 'pages', 'about.json'),
        '{"bio":"Admin role postgres_admin"}',
        'utf8'
      );
      fs.writeFileSync(
        path.join(tmp, 'src', 'content', 'learning', 'sample-article.md'),
        '---\ntitle: "Sample"\npublicationState: "published"\n---\nHost: bad-svc.onrender.com\n',
        'utf8'
      );
      const res = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'source' });
      assert.equal(res.pass, false);
      assert.ok(res.findings.some(f => f.file === 'src/content/pages/about.json'));
      assert.ok(res.findings.some(f => f.file === 'src/content/learning/sample-article.md'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('17. Bounded decoding cannot hang on malformed percent-encoding or repeated encoding', () => {
    const adversarial = '%ZZ%E0%A4%A' + '%25'.repeat(200) + 'normal text';
    const start = Date.now();
    const findings = scanContent(adversarial, 'test/adversarial.txt', rules);
    const elapsed = Date.now() - start;
    assert.equal(findings.length, 0);
    assert.ok(elapsed < 2000, `Expected bounded scan under 2000ms, took ${elapsed}ms`);
  });

  it('18. Required CI build job executes source scan, post-build rendered scan, and disclosure tests', () => {
    const deployYml = fs.readFileSync(path.join(workspaceRoot, '.github', 'workflows', 'deploy.yml'), 'utf8');
    assert.ok(deployYml.includes('npm run projects:security-scan -- --mode source'));
    assert.ok(deployYml.includes('npm run projects:security-scan -- --mode rendered'));
    assert.ok(deployYml.includes('npm run test:projects'));
    assert.ok(deployYml.includes('node --test test/m5_history_retention.test.js'));

    const pkg = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'package.json'), 'utf8'));
    assert.ok(pkg.scripts['test:projects'].includes('test/project_disclosure_boundary.test.js'));
    assert.equal(getPublicProjects().length, 6);
  });

  it('19. Negated GDPR security disclaimer is allowed while unnegated or cross-sentence claims fail', () => {
    const allowedText = 'Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.';
    assert.equal(scanContent(allowedText, 'src/pages/datenschutz.astro', rules).length, 0);

    const unnegatedClaim = 'Wir bieten lückenloser Schutz für alle Systeme.';
    assert.ok(scanContent(unnegatedClaim, 'src/pages/marketing.astro', rules).some(f => f.ruleId === 'CLM-PAT-ABSOLUTE-SECURITY'));

    const crossSentenceClaim = 'Wir sind 100% sicher. Nicht möglich ist ein Ausfall.';
    assert.ok(scanContent(crossSentenceClaim, 'src/pages/marketing.astro', rules).some(f => f.ruleId === 'CLM-PAT-ABSOLUTE-SECURITY'));
  });

  it('20. Prebuilt admin vendor assets are explicitly excluded in coverage rather than silently ignored', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubsec-vendor-coverage-'));
    try {
      createSyntheticWorkspace(tmp);
      fs.mkdirSync(path.join(tmp, 'public', 'admin', 'assets'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'public', 'admin', 'assets', 'index-demo.js'), 'const x = "C:\\\\Users\\\\dev\\\\build";', 'utf8');
      const srcRes = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'source' });
      assert.equal(srcRes.pass, true);
      assert.equal(srcRes.coverage.vendorAssetsExcluded, 1);
      assert.deepEqual(srcRes.coverage.vendorAssetsExcludedPaths, ['public/admin/assets']);

      populateSyntheticDist(tmp);
      fs.mkdirSync(path.join(tmp, 'dist', 'admin', 'assets'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'dist', 'admin', 'assets', 'index-demo.js'), 'const x = "C:\\\\Users\\\\dev\\\\build";', 'utf8');
      const distRes = validateProjectDisclosure({ workspaceRoot: tmp, mode: 'rendered' });
      assert.equal(distRes.pass, true);
      assert.equal(distRes.coverage.vendorAssetsExcluded, 1);
      assert.deepEqual(distRes.coverage.vendorAssetsExcludedPaths, ['dist/admin/assets']);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
