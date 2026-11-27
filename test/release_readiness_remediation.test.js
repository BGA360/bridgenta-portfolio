import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

test('BGDE-005C-PRIV-IMPLEMENT-006 Release Readiness & Remediation Suite', async (t) => {
  const distDir = path.join(workspaceRoot, 'dist');
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const datenschutzHtml = fs.readFileSync(path.join(distDir, 'datenschutz', 'index.html'), 'utf8');
  const impressumHtml = fs.readFileSync(path.join(distDir, 'impressum', 'index.html'), 'utf8');
  const contactHtml = fs.readFileSync(path.join(distDir, 'contact', 'index.html'), 'utf8');

  await t.test('1. Leverkusen / NRW Metadata Consistency (DEC-05)', () => {
    assert.ok(indexHtml.includes('<meta name="geo.region" content="DE-NW">') || indexHtml.includes('<meta name="geo.region" content="DE-NW" />'));
    assert.ok(indexHtml.includes('Leverkusen, Nordrhein-Westfalen, Deutschland'));
    assert.ok(indexHtml.includes('"addressLocality":"Leverkusen"') || indexHtml.includes('"addressLocality": "Leverkusen"'));
    assert.ok(indexHtml.includes('"addressRegion":"Nordrhein-Westfalen"') || indexHtml.includes('"addressRegion": "Nordrhein-Westfalen"'));

    // Unsupported coordinates and legacy Frankfurt/Hessen metadata removed
    assert.strictEqual(/geo\.position|name="ICBM"/i.test(indexHtml), false, 'Unsupported geo coordinates must be removed');
    assert.strictEqual(/GeoCoordinates/i.test(indexHtml), false, 'Unsupported JSON-LD GeoCoordinates must be removed');
    assert.strictEqual(/Frankfurt am Main|DE-HE|50\.1109/i.test(indexHtml), false, 'Legacy Frankfurt/Hessen metadata must be removed');
  });

  await t.test('2. Semantic German Legal-Page Content & Form Absence', () => {
    // Contact page has no <form> element
    assert.strictEqual(/<form[\s>]/i.test(contactHtml), false, '/contact/ must not contain a <form> element');

    // Datenschutzerklärung semantic checks (negation of Kontaktformular is valid & expected)
    assert.ok(datenschutzHtml.includes('STRATO Hosting Basic'));
    assert.ok(datenschutzHtml.includes('Version 3.6 vom 23. Januar 2026'));
    assert.ok(datenschutzHtml.includes('maximal 7 Tage'));
    assert.ok(datenschutzHtml.includes('Kein Kontaktformular'));
    assert.ok(datenschutzHtml.includes('Kein Newsletter'));
    assert.ok(datenschutzHtml.includes('registriert keinen Service Worker'));
    assert.ok(datenschutzHtml.includes('LDI NRW'));
    assert.strictEqual(/Berlin und Karlsruhe/i.test(datenschutzHtml), false, 'Must not assert unsupported STRATO data-center cities');
    assert.strictEqual(/STRATO E-Mail-Archivierung/i.test(datenschutzHtml), false, 'Must not assert unconfirmed email archiving');
    assert.strictEqual(/GitHub Pages/i.test(datenschutzHtml), false, 'Production privacy policy must describe STRATO target, not GitHub Pages');

    // Impressum semantic checks (§ 5 DDG, no legacy TMG/RStV, no invented VAT/phone/register)
    assert.ok(impressumHtml.includes('§ 5 DDG'));
    assert.ok(impressumHtml.includes('Frank Duru'));
    assert.ok(impressumHtml.includes('ref@bridgenta.de'));
    assert.strictEqual(/TMG|RStV/i.test(impressumHtml), false, 'Impressum must not reference obsolete TMG or RStV');
    assert.strictEqual(/USt-IdNr|Handelsregister|Telefon:/i.test(impressumHtml), false, 'Impressum must not invent VAT ID, register, or phone number');
  });

  await t.test('3. Production Packaging Rejects Unresolved Mandatory Placeholders by Default', () => {
    const tmpOutBase = fs.mkdtempSync(path.join(os.tmpdir(), 'bgde-prod-reject-test-'));
    try {
      const result = spawnSync(
        process.execPath,
        [path.join(workspaceRoot, 'tooling', 'package_strato_production.mjs'), '--out-base', tmpOutBase],
        { cwd: workspaceRoot, encoding: 'utf8' }
      );
      assert.notStrictEqual(result.status, 0, 'Production packager MUST fail closed when [OWNER_REQUIRED:...] placeholders remain');
      const combined = `${result.stdout}\n${result.stderr}`;
      assert.ok(
        combined.includes('UNRESOLVED_LEGAL_PLACEHOLDER'),
        `Expected UNRESOLVED_LEGAL_PLACEHOLDER error, got:\n${combined}`
      );
    } finally {
      fs.rmSync(tmpOutBase, { recursive: true, force: true });
    }
  });

  await t.test('4. Production Packaging Pipeline & Manifest Integrity (Transition Profile + Verify-Only)', () => {
    const tmpOutBase = fs.mkdtempSync(path.join(os.tmpdir(), 'bgde-prod-pkg-test-'));
    try {
      execFileSync(
        process.execPath,
        [
          path.join(workspaceRoot, 'tooling', 'package_strato_production.mjs'),
          '--out-base',
          tmpOutBase,
          '--with-sw-retirement',
          '--allow-placeholders-for-local-validation',
        ],
        { cwd: workspaceRoot, stdio: 'pipe' }
      );

      const manifestPath = path.join(tmpOutBase, 'production-artifact-manifest.json');
      assert.ok(fs.existsSync(manifestPath), 'Production manifest must be generated');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      assert.strictEqual(manifest.target.domain, 'https://bridgenta.de');
      assert.strictEqual(manifest.target.swRetirementProfile, 'transition-retirement-enabled');
      assert.strictEqual(manifest.releaseEligibility.releasable, false, 'Artifact with placeholders must be marked releasable=false');
      assert.ok(manifest.releaseEligibility.unresolvedLegalPlaceholders.length > 0);
      assert.ok(manifest.files.some((f) => f.path === 'service-worker.js'), 'Transition profile must include retirement service-worker.js');
      assert.ok(manifest.files.some((f) => f.path === 'sitemap.xml'), 'Production package must include sitemap.xml');
      assert.ok(manifest.files.some((f) => f.path === '.htaccess'), 'Production package must include production .htaccess');
      assert.strictEqual(manifest.files.some((f) => f.path === 'offline.html'), false, 'offline.html must not be packaged');

      // Re-verify with --verify-only
      const verifyOut = execFileSync(
        process.execPath,
        [
          path.join(workspaceRoot, 'tooling', 'package_strato_production.mjs'),
          '--verify-only',
          '--out-base',
          tmpOutBase,
          '--allow-placeholders-for-local-validation',
        ],
        { cwd: workspaceRoot, encoding: 'utf8' }
      );
      assert.ok(verifyOut.includes('[prod-verify] PASS'), `Expected --verify-only PASS, got: ${verifyOut}`);
    } finally {
      fs.rmSync(tmpOutBase, { recursive: true, force: true });
    }
  });
});
