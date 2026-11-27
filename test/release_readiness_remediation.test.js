import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

test('BGDE-005C-PRIV-IMPLEMENT-006 / PROD-PREP-017 Release Readiness & Remediation Suite', async (t) => {
  const distDir = path.join(workspaceRoot, 'dist');
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const datenschutzHtml = fs.readFileSync(path.join(distDir, 'datenschutz', 'index.html'), 'utf8');
  const impressumHtml = fs.readFileSync(path.join(distDir, 'impressum', 'index.html'), 'utf8');
  const contactHtml = fs.readFileSync(path.join(distDir, 'contact', 'index.html'), 'utf8');
  const deployWorkflow = fs.readFileSync(path.join(workspaceRoot, '.github', 'workflows', 'deploy.yml'), 'utf8');

  await t.test('1. Leverkusen / NRW Metadata Consistency (DEC-05)', () => {
    assert.ok(indexHtml.includes('<meta name="geo.region" content="DE-NW">') || indexHtml.includes('<meta name="geo.region" content="DE-NW" />'));
    assert.ok(indexHtml.includes('Leverkusen, Nordrhein-Westfalen, Deutschland'));
    assert.ok(indexHtml.includes('"addressLocality":"Leverkusen"') || indexHtml.includes('"addressLocality": "Leverkusen"'));
    assert.ok(indexHtml.includes('"addressRegion":"Nordrhein-Westfalen"') || indexHtml.includes('"addressRegion": "Nordrhein-Westfalen"'));

    assert.strictEqual(/geo\.position|name="ICBM"/i.test(indexHtml), false, 'Unsupported geo coordinates must be removed');
    assert.strictEqual(/GeoCoordinates/i.test(indexHtml), false, 'Unsupported JSON-LD GeoCoordinates must be removed');
    assert.strictEqual(/Frankfurt am Main|DE-HE|50\.1109/i.test(indexHtml), false, 'Legacy Frankfurt/Hessen metadata must be removed');
  });

  await t.test('2. Semantic German Legal-Page Content, Resolved Placeholders & Form Absence', () => {
    assert.strictEqual(/<form[\s>]/i.test(contactHtml), false, '/contact/ must not contain a <form> element');

    assert.ok(datenschutzHtml.includes('STRATO Hosting Basic'));
    assert.ok(datenschutzHtml.includes('Version 3.6 vom 23. Januar 2026'));
    assert.ok(datenschutzHtml.includes('maximal 7 Tage'));
    assert.ok(datenschutzHtml.includes('Kein Kontaktformular'));
    assert.ok(datenschutzHtml.includes('Kein Newsletter'));
    assert.ok(datenschutzHtml.includes('registriert keinen Service Worker'));
    assert.ok(datenschutzHtml.includes('LDI NRW'));
    assert.ok(datenschutzHtml.includes('November 2026'), 'Datenschutzerklärung must display confirmed publication date November 2026');
    assert.strictEqual(/\[OWNER_REQUIRED:/i.test(datenschutzHtml), false, 'datenschutz.astro must have zero unresolved placeholders');
    assert.strictEqual(/Berlin und Karlsruhe/i.test(datenschutzHtml), false, 'Must not assert unsupported STRATO data-center cities');
    assert.strictEqual(/STRATO E-Mail-Archivierung/i.test(datenschutzHtml), false, 'Must not assert unconfirmed email archiving');
    assert.strictEqual(/GitHub Pages/i.test(datenschutzHtml), false, 'Production privacy policy must describe STRATO target, not GitHub Pages');

    assert.ok(impressumHtml.includes('§ 5 DDG'));
    assert.ok(impressumHtml.includes('Frank Duru'));
    assert.ok(impressumHtml.includes('ref@bridgenta.de'));
    assert.strictEqual(/\[OWNER_REQUIRED:/i.test(impressumHtml), false, 'impressum.astro must have zero unresolved placeholders');
    assert.strictEqual(/TMG|RStV/i.test(impressumHtml), false, 'Impressum must not reference obsolete TMG or RStV');
    assert.strictEqual(/USt-IdNr|Handelsregister|Telefon:/i.test(impressumHtml), false, 'Impressum must not invent VAT ID, register, or phone number');
  });

  await t.test('3. GitHub Pages Deployment Safeguard (Manual Explicit Dispatch Only)', () => {
    assert.ok(
      deployWorkflow.includes('deploy_github_pages:'),
      'deploy.yml must declare explicit workflow_dispatch boolean input deploy_github_pages'
    );
    assert.ok(
      deployWorkflow.includes("if: github.ref == 'refs/heads/main' && github.event_name == 'workflow_dispatch' && inputs.deploy_github_pages == true"),
      'deploy job must execute ONLY on manual workflow_dispatch from main with inputs.deploy_github_pages == true'
    );
  });

  await t.test('4. Releasable Production Packaging + Fail-Closed Placeholder Gate Verification', () => {
    const tmpOutBase = fs.mkdtempSync(path.join(os.tmpdir(), 'bgde-prod-pkg-017-'));
    try {
      // 4a. Normal production packaging with --with-sw-retirement (NO placeholder override) must PASS with releasable=true
      execFileSync(
        process.execPath,
        [
          path.join(workspaceRoot, 'tooling', 'package_strato_production.mjs'),
          '--out-base',
          tmpOutBase,
          '--with-sw-retirement',
        ],
        { cwd: workspaceRoot, stdio: 'pipe' }
      );

      const manifestPath = path.join(tmpOutBase, 'production-artifact-manifest.json');
      assert.ok(fs.existsSync(manifestPath), 'Production manifest must be generated');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      assert.strictEqual(manifest.target.domain, 'https://bridgenta.de');
      assert.strictEqual(manifest.target.swRetirementProfile, 'transition-retirement-enabled');
      assert.strictEqual(manifest.releaseEligibility.releasable, true, 'Completed legal pages must yield releasable=true');
      assert.deepStrictEqual(manifest.releaseEligibility.unresolvedLegalPlaceholders, []);
      assert.ok(manifest.files.some((f) => f.path === 'service-worker.js'), 'Transition profile must include retirement service-worker.js');
      assert.ok(manifest.files.some((f) => f.path === 'sitemap.xml'), 'Production package must include sitemap.xml');
      assert.ok(manifest.files.some((f) => f.path === '.htaccess'), 'Production package must include production .htaccess');
      assert.strictEqual(manifest.files.some((f) => f.path === 'offline.html'), false, 'offline.html must not be packaged');

      // 4b. Strict --verify-only must PASS with releasable=true
      const verifyOut = execFileSync(
        process.execPath,
        [
          path.join(workspaceRoot, 'tooling', 'package_strato_production.mjs'),
          '--verify-only',
          '--out-base',
          tmpOutBase,
        ],
        { cwd: workspaceRoot, encoding: 'utf8' }
      );
      assert.ok(verifyOut.includes('[prod-verify] PASS (releasable=true)'), `Expected --verify-only PASS (releasable=true), got: ${verifyOut}`);

      // 4c. Prove fail-closed placeholder gate still rejects any unresolved [OWNER_REQUIRED:...] in an isolated temp artifact
      const dsFile = path.join(tmpOutBase, 'webroot', 'datenschutz', 'index.html');
      const tampered = fs.readFileSync(dsFile, 'utf8').replace('November 2026', '[OWNER_REQUIRED: SYNTHETIC_TEST]');
      fs.writeFileSync(dsFile, tampered, 'utf8');
      const newBytes = fs.statSync(dsFile).size;
      const newSha = crypto.createHash('sha256').update(fs.readFileSync(dsFile)).digest('hex');
      const entry = manifest.files.find((f) => f.path === 'datenschutz/index.html');
      entry.bytes = newBytes;
      entry.sha256 = newSha;
      const digestInput = manifest.files.map((f) => `${f.path}:${f.bytes}:${f.sha256}`).join('\n');
      manifest.packageSummary.packageRootSha256 = crypto.createHash('sha256').update(digestInput, 'utf8').digest('hex');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

      const rejectResult = spawnSync(
        process.execPath,
        [
          path.join(workspaceRoot, 'tooling', 'package_strato_production.mjs'),
          '--verify-only',
          '--out-base',
          tmpOutBase,
        ],
        { cwd: workspaceRoot, encoding: 'utf8' }
      );
      assert.notStrictEqual(rejectResult.status, 0, 'Fail-closed verifier MUST reject unresolved [OWNER_REQUIRED:...] placeholders');
      assert.ok(
        `${rejectResult.stdout}\n${rejectResult.stderr}`.includes('UNRESOLVED_LEGAL_PLACEHOLDER'),
        'Verifier must emit UNRESOLVED_LEGAL_PLACEHOLDER on unresolved placeholder'
      );
    } finally {
      fs.rmSync(tmpOutBase, { recursive: true, force: true });
    }
  });
});
