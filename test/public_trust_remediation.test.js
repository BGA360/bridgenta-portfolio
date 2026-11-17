import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

test('Public Trust Remediation Acceptance Suite (BGDE-PUBLIC-TRUST-REMEDIATION-IMPL-001)', async (t) => {
  const distDir = path.join(workspaceRoot, 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  const layoutPath = path.join(workspaceRoot, 'src', 'layouts', 'Layout.astro');
  const footerJsonPath = path.join(workspaceRoot, 'src', 'content', 'pages', 'footer.json');
  const datenschutzPath = path.join(workspaceRoot, 'src', 'pages', 'datenschutz.astro');
  const amendmentProposalPath = path.join(workspaceRoot, 'docs', 'audit', 'BGDE-PRIVACY-POLICY-AMENDMENT-PROPOSAL-001.md');
  const cookieConsentComponentPath = path.join(workspaceRoot, 'src', 'components', 'CookieConsent.astro');

  assert.ok(fs.existsSync(distDir), 'Generated dist directory must exist for acceptance testing.');
  assert.ok(fs.existsSync(indexHtmlPath), 'dist/index.html must exist.');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const footerJson = JSON.parse(fs.readFileSync(footerJsonPath, 'utf8'));

  await t.test('1. Work Package A: Newsletter Form Elimination & Replacement', () => {
    // 1.1 Nonfunctional newsletter form is absent in source and dist
    assert.strictEqual(
      layoutContent.includes('class="newsletter-form"'),
      false,
      'Layout.astro must not contain .newsletter-form'
    );
    assert.strictEqual(
      layoutContent.includes('<form'),
      false,
      'Layout.astro must not contain any <form> element'
    );
    assert.strictEqual(
      indexHtml.includes('class="newsletter-form"'),
      false,
      'dist/index.html must not contain .newsletter-form'
    );
    assert.strictEqual(
      indexHtml.includes('Newsletter-Anmeldung (Demo)'),
      false,
      'dist/index.html must not contain obsolete Demo newsletter aria-label'
    );

    // 1.2 Approved German content is present
    assert.strictEqual(footerJson.contact.title, 'In Kontakt bleiben');
    assert.strictEqual(
      footerJson.contact.text,
      'Haben Sie Fragen zu meinen Projekten oder möchten Sie sich fachlich austauschen? Schreiben Sie mir gerne eine E-Mail.'
    );
    assert.strictEqual(footerJson.contact.actionText, 'E-Mail schreiben');

    assert.ok(
      indexHtml.includes('In Kontakt bleiben'),
      'Rendered HTML must contain approved heading'
    );
    assert.ok(
      indexHtml.includes('Haben Sie Fragen zu meinen Projekten oder möchten Sie sich fachlich austauschen? Schreiben Sie mir gerne eine E-Mail.'),
      'Rendered HTML must contain approved explanatory text'
    );
    assert.ok(
      indexHtml.includes('E-Mail schreiben'),
      'Rendered HTML must contain approved action button text'
    );

    // 1.3 Contact link uses the configured email address with mailto:
    const expectedMailto = `mailto:${footerJson.bottom.email}`;
    assert.ok(
      indexHtml.includes(`href="${expectedMailto}"`),
      `Rendered HTML must contain direct mailto link to ${expectedMailto}`
    );
    assert.ok(
      indexHtml.includes('class="footer-contact-btn"'),
      'Rendered HTML must style the contact action with .footer-contact-btn'
    );

    // 1.4 No false subscription-success messaging exists
    assert.strictEqual(
      indexHtml.includes('Newsletter abonniert'),
      false,
      'No simulated subscription success messaging allowed'
    );
  });

  await t.test('2. Work Package B: Cookie Consent Dialog Removal & Clean State', () => {
    // 2.1 Obsolete component file is removed
    assert.strictEqual(
      fs.existsSync(cookieConsentComponentPath),
      false,
      'src/components/CookieConsent.astro must be removed'
    );

    // 2.2 Shared layout does not import or render CookieConsent
    assert.strictEqual(
      layoutContent.includes('CookieConsent'),
      false,
      'Layout.astro must not reference CookieConsent'
    );
    assert.strictEqual(
      layoutContent.includes('btn-reopen-cookies'),
      false,
      'Layout.astro must not contain btn-reopen-cookies'
    );

    // 2.3 Generated HTML across routes lacks cookie banner elements
    assert.strictEqual(
      indexHtml.includes('cookie-consent-banner'),
      false,
      'dist/index.html must not contain cookie-consent-banner'
    );
    assert.strictEqual(
      indexHtml.includes('Datenschutzeinstellungen'),
      false,
      'dist/index.html must not contain cookie consent modal heading'
    );
    assert.strictEqual(
      indexHtml.includes('btn-cookie-necessary'),
      false,
      'dist/index.html must not contain cookie action buttons'
    );
    assert.strictEqual(
      indexHtml.includes('btn-reopen-cookies'),
      false,
      'dist/index.html must not contain footer reopen button'
    );

    // 2.4 Privacy policy link remains directly accessible in the footer
    assert.ok(
      indexHtml.includes('href="/datenschutz"'),
      'dist/index.html must retain accessible link to /datenschutz'
    );
  });

  await t.test('3. Verification Across All 6 Public Portfolio Routes', () => {
    const publicSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners', 'becc'];
    for (const slug of publicSlugs) {
      const pagePath = path.join(distDir, `project-${slug}`, 'index.html');
      assert.ok(fs.existsSync(pagePath), `Route project-${slug} must exist in dist`);
      const html = fs.readFileSync(pagePath, 'utf8');
      assert.strictEqual(html.includes('cookie-consent-banner'), false, `project-${slug} must not have cookie banner`);
      assert.strictEqual(html.includes('class="newsletter-form"'), false, `project-${slug} must not have newsletter form`);
      assert.ok(html.includes('href="mailto:ref@bridgenta.de"'), `project-${slug} must have genuine mailto link`);
    }
  });

  await t.test('4. Work Package C: Legal Publication Boundary & Proposal Preservation', () => {
    // 4.1 src/pages/datenschutz.astro must NOT be modified under this authorization
    const datenschutzContent = fs.readFileSync(datenschutzPath, 'utf8');
    assert.ok(
      datenschutzContent.includes('Datenschutzerklärung'),
      'datenschutz.astro must exist intact'
    );

    // 4.2 Amendment proposal exists and contains required legal analysis
    assert.ok(
      fs.existsSync(amendmentProposalPath),
      'docs/audit/BGDE-PRIVACY-POLICY-AMENDMENT-PROPOSAL-001.md must exist'
    );
    const proposalContent = fs.readFileSync(amendmentProposalPath, 'utf8');
    assert.ok(proposalContent.includes('LEGAL PUBLICATION GUARD'));
    assert.ok(proposalContent.includes('LQ-01'));
    assert.ok(proposalContent.includes('Mermaid.js'));
    assert.ok(proposalContent.includes('Service Worker'));
  });
});
