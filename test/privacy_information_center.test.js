import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

/**
 * Finds a suitable Chromium or Chrome binary across platforms.
 */
function findBrowserBinary() {
  const envBin = process.env.CHROME_BIN || process.env.BROWSER_PATH;
  if (envBin && fs.existsSync(envBin)) {
    return envBin;
  }

  const platform = os.platform();
  const candidates = [];

  if (platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
    );
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    );
  } else {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium'
    );
  }

  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

test('Privacy Information Center Acceptance Suite (BGDE-PRIVACY-INFORMATION-CENTER-001)', async (t) => {
  const distDir = path.join(workspaceRoot, 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  const componentPath = path.join(workspaceRoot, 'src', 'components', 'PrivacyInformationCenter.astro');
  const oldConsentPath = path.join(workspaceRoot, 'src', 'components', 'CookieConsent.astro');
  const layoutPath = path.join(workspaceRoot, 'src', 'layouts', 'Layout.astro');

  assert.ok(fs.existsSync(distDir), 'Generated dist/ directory must exist.');
  assert.ok(fs.existsSync(indexHtmlPath), 'dist/index.html must exist.');
  assert.ok(fs.existsSync(componentPath), 'src/components/PrivacyInformationCenter.astro must exist.');

  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const componentSource = fs.readFileSync(componentPath, 'utf8');
  const layoutSource = fs.readFileSync(layoutPath, 'utf8');

  await t.test('1. Component Architecture & Absence of Consent Semantics', () => {
    // 1.1 Old CookieConsent component is NOT restored
    assert.strictEqual(
      fs.existsSync(oldConsentPath),
      false,
      'Old CookieConsent.astro component must not exist'
    );

    // 1.2 Layout does not reference old CookieConsent or old cookie buttons
    assert.strictEqual(
      layoutSource.includes('CookieConsent'),
      false,
      'Layout.astro must not import or render CookieConsent'
    );
    assert.strictEqual(
      layoutSource.includes('btn-reopen-cookies'),
      false,
      'Layout.astro must not contain btn-reopen-cookies'
    );

    // 1.3 Layout imports and renders PrivacyInformationCenter
    assert.ok(
      layoutSource.includes('PrivacyInformationCenter'),
      'Layout.astro must import PrivacyInformationCenter'
    );
    assert.ok(
      layoutSource.includes('id="btn-reopen-privacy"'),
      'Layout.astro must provide footer button #btn-reopen-privacy'
    );
    assert.ok(
      layoutSource.includes('Datenschutzinformationen'),
      'Footer link must be labeled "Datenschutzinformationen"'
    );

    // 1.4 No misleading consent language exists in component or rendered HTML
    const forbiddenConsentPhrases = [
      'Alle akzeptieren',
      'Nur notwendige',
      'Auswahl speichern',
      'Optionale Dienste',
      'Cookie-Einstellungen',
      'cookie-consent-status',
      'cookie-opt-necessary',
      'cookie-opt-optional'
    ];

    for (const phrase of forbiddenConsentPhrases) {
      assert.strictEqual(
        componentSource.includes(phrase),
        false,
        `PrivacyInformationCenter source must not contain consent phrase: "${phrase}"`
      );
      assert.strictEqual(
        indexHtml.includes(phrase),
        false,
        `Rendered index.html must not contain consent phrase: "${phrase}"`
      );
    }
  });

  await t.test('2. Content & Factual Transparency Invariants', () => {
    // 2.1 Required title and heading
    assert.ok(
      componentSource.includes('Datenschutz &amp; Privatsphäre') || componentSource.includes('Datenschutz & Privatsphäre'),
      'Component must declare heading "Datenschutz & Privatsphäre"'
    );
    assert.ok(
      indexHtml.includes('Datenschutz &amp; Privatsphäre') || indexHtml.includes('Datenschutz & Privatsphäre'),
      'Rendered HTML must contain heading "Datenschutz & Privatsphäre"'
    );

    // 2.2 Approved transparent body text
    const expectedIntro = 'Wir informieren Sie transparent darüber, wie diese Website funktioniert und welche Daten dabei verarbeitet werden.';
    const expectedSubtext = 'Wir verwenden keine Analyse- oder Werbetracker. Für die Bereitstellung der Website können technische Verbindungsdaten verarbeitet und Inhalte für die Offline-Nutzung lokal zwischengespeichert werden.';
    
    assert.ok(indexHtml.includes(expectedIntro), 'Rendered HTML must contain approved introductory text');
    assert.ok(indexHtml.includes(expectedSubtext), 'Rendered HTML must contain approved subtext');

    // 2.3 Required action buttons
    assert.ok(
      indexHtml.includes('id="btn-privacy-dismiss"'),
      'Rendered HTML must contain dismiss button #btn-privacy-dismiss'
    );
    assert.ok(
      indexHtml.includes('Verstanden'),
      'Dismiss button must be labeled "Verstanden"'
    );
    assert.ok(
      indexHtml.includes('id="btn-privacy-details"'),
      'Rendered HTML must contain details toggle button #btn-privacy-details'
    );
    assert.ok(
      indexHtml.includes('Details anzeigen'),
      'Details button must be initially labeled "Details anzeigen"'
    );

    // 2.4 Required legal links
    assert.ok(
      indexHtml.includes('href="/datenschutz"'),
      'Panel must link to /datenschutz'
    );
    assert.ok(
      indexHtml.includes('href="/impressum"'),
      'Panel must link to /impressum'
    );
  });

  await t.test('3. Privacy Storage Invariants (Session-Only vs. LocalStorage)', () => {
    // 3.1 Script uses sessionStorage for dismissal, NEVER localStorage
    assert.ok(
      componentSource.includes('sessionStorage.setItem'),
      'Component script must record dismissal in sessionStorage'
    );
    assert.ok(
      componentSource.includes('sessionStorage.getItem'),
      'Component script must check dismissal via sessionStorage'
    );
    assert.strictEqual(
      componentSource.includes('localStorage.setItem'),
      false,
      'Component script must NOT write to localStorage'
    );
    assert.strictEqual(
      componentSource.includes('document.cookie ='),
      false,
      'Component script must NOT write HTTP cookies'
    );
  });

  await t.test('4. Accessibility, ARIA & Keyboard Contracts', () => {
    // 4.1 Accessible region container
    assert.ok(
      componentSource.includes('role="region"'),
      'Panel must declare role="region"'
    );
    assert.ok(
      componentSource.includes('aria-labelledby="privacy-info-title"'),
      'Panel must declare aria-labelledby="privacy-info-title"'
    );
    assert.ok(
      componentSource.includes('aria-describedby="privacy-info-desc"'),
      'Panel must declare aria-describedby="privacy-info-desc"'
    );

    // 4.2 Details accordion accessibility
    assert.ok(
      componentSource.includes('aria-expanded="false"'),
      'Details button must declare aria-expanded'
    );
    assert.ok(
      componentSource.includes('aria-controls="privacy-info-details"'),
      'Details button must declare aria-controls="privacy-info-details"'
    );

    // 4.3 Close button with accessible name
    assert.ok(
      componentSource.includes('aria-label="Hinweis schließen"'),
      'Close button must declare accessible aria-label'
    );

    // 4.4 Keyboard handler (Escape key) in script
    assert.ok(
      componentSource.includes('key === "Escape"'),
      'Script must handle Escape key for accessible dismissal'
    );

    // 4.5 Reduced motion media query and scrollable container for 200% zoom
    assert.ok(
      componentSource.includes('prefers-reduced-motion: reduce'),
      'Component must support prefers-reduced-motion: reduce'
    );
    assert.ok(
      componentSource.includes('overflow-y: auto'),
      'Panel must define overflow-y: auto for responsive & 200% zoom accessibility'
    );
  });

  await t.test('5. Presence Across All 6 Public Project Routes', () => {
    const publicSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners', 'becc'];
    for (const slug of publicSlugs) {
      const pagePath = path.join(distDir, `project-${slug}`, 'index.html');
      assert.ok(fs.existsSync(pagePath), `Route project-${slug} must exist in dist`);
      const html = fs.readFileSync(pagePath, 'utf8');

      assert.ok(html.includes('id="privacy-info-center"'), `project-${slug} must embed privacy-info-center`);
      assert.ok(html.includes('id="btn-reopen-privacy"'), `project-${slug} must embed #btn-reopen-privacy in footer`);
      assert.ok(html.includes('Datenschutzinformationen'), `project-${slug} footer must have "Datenschutzinformationen"`);
      assert.strictEqual(html.includes('cookie-consent-banner'), false, `project-${slug} must not contain cookie-consent-banner`);
      assert.strictEqual(html.includes('btn-cookie-necessary'), false, `project-${slug} must not contain btn-cookie-necessary`);
    }
  });

  await t.test('6. Real Browser Execution via Chrome DevTools Protocol (CDP)', async (tSub) => {
    const chromeBin = findBrowserBinary();
    if (!chromeBin) {
      tSub.skip('No suitable Chrome/Chromium binary found for headless CDP verification.');
      return;
    }

    // Serve dist/ via local HTTP server
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(distDir, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.json': 'application/json'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const tmpUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bgde-privacy-info-test-'));
    const cdpPort = 9223 + Math.floor(Math.random() * 500);

    const chrome = spawn(chromeBin, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${tmpUserDataDir}`
    ]);

    // Wait for CDP endpoint
    let wsUrl = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 100));
      try {
        const res = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
        if (res.ok) {
          const data = await res.json();
          wsUrl = data.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    assert.ok(wsUrl, 'Chrome CDP WebSocket URL must be available');

    // Retrieve active page target from /json/list
    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page') || pages[0];
    assert.ok(page && page.webSocketDebuggerUrl, 'Active browser page target must exist');

    const pageWs = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => { pageWs.onopen = r; });

    let pageMsgId = 1;
    function sendPageCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = pageMsgId++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            pageWs.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        pageWs.addEventListener('message', handler);
        pageWs.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendPageCommand('Page.enable');
    await sendPageCommand('Runtime.enable');

    // Navigate to local index.html and wait for DOM readiness
    await sendPageCommand('Page.navigate', { url: `http://127.0.0.1:${port}/` });
    await new Promise((r) => setTimeout(r, 1200));

    // Evaluate live DOM behavior
    const evalResult = await sendPageCommand('Runtime.evaluate', {
      expression: `(() => {
        const panel = document.getElementById('privacy-info-center');
        const initialDisplay = panel ? window.getComputedStyle(panel).display : 'none';
        const initialSession = sessionStorage.getItem('privacy-info-dismissed');
        const initialLocal = localStorage.getItem('cookie-consent-status');

        // Test details toggle
        const btnDetails = document.getElementById('btn-privacy-details');
        const details = document.getElementById('privacy-info-details');
        const detailsBefore = details ? window.getComputedStyle(details).display : 'none';
        if (btnDetails) btnDetails.click();
        const detailsAfterClick = details ? window.getComputedStyle(details).display : 'none';
        if (btnDetails) btnDetails.click();
        const detailsAfterSecondClick = details ? window.getComputedStyle(details).display : 'none';

        // Test dismissal via "Verstanden"
        const btnDismiss = document.getElementById('btn-privacy-dismiss');
        if (btnDismiss) btnDismiss.click();
        const displayAfterDismiss = panel ? window.getComputedStyle(panel).display : 'none';
        const sessionAfterDismiss = sessionStorage.getItem('privacy-info-dismissed');
        const localAfterDismiss = localStorage.getItem('cookie-consent-status');

        // Test footer reopening and focus placement
        const btnReopen = document.getElementById('btn-reopen-privacy');
        if (btnReopen) btnReopen.click();
        const displayAfterReopen = panel ? window.getComputedStyle(panel).display : 'none';
        const activeAfterReopen = document.activeElement ? document.activeElement.id : null;

        // Test close button and focus return to reopen link
        const btnClose = document.getElementById('btn-privacy-close');
        if (btnClose) btnClose.click();
        const displayAfterClose = panel ? window.getComputedStyle(panel).display : 'none';
        const activeAfterClose = document.activeElement ? document.activeElement.id : null;

        return {
          initialDisplay,
          initialSession,
          initialLocal,
          detailsBefore,
          detailsAfterClick,
          detailsAfterSecondClick,
          displayAfterDismiss,
          sessionAfterDismiss,
          localAfterDismiss,
          displayAfterReopen,
          activeAfterReopen,
          displayAfterClose,
          activeAfterClose
        };
      })()`,
      returnByValue: true
    });

    // Teardown browser
    try {
      const browserWs = new WebSocket(wsUrl);
      await new Promise((r) => {
        browserWs.onopen = () => {
          browserWs.send(JSON.stringify({ id: 999, method: 'Browser.close' }));
          setTimeout(r, 200);
        };
        browserWs.onerror = r;
      });
      browserWs.close();
    } catch {}

    try { pageWs.close(); } catch {}
    try { chrome.kill('SIGKILL'); } catch {}
    try { chrome.unref(); } catch {}
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    server.close();
    try { fs.rmSync(tmpUserDataDir, { recursive: true, force: true }); } catch {}

    const v = evalResult.result.value;

    // Assert live browser verification invariants
    assert.strictEqual(v.initialDisplay, 'block', 'Panel must be initially displayed for a new session');
    assert.strictEqual(v.initialSession, null, 'sessionStorage must be null prior to dismissal');
    assert.strictEqual(v.initialLocal, null, 'localStorage must be null (no cookie consent keys)');

    assert.strictEqual(v.detailsBefore, 'none', 'Details must be collapsed initially');
    assert.strictEqual(v.detailsAfterClick, 'block', 'Details must expand when clicking "Details anzeigen"');
    assert.strictEqual(v.detailsAfterSecondClick, 'none', 'Details must collapse when clicking again');

    assert.strictEqual(v.displayAfterDismiss, 'none', 'Panel must be hidden after clicking "Verstanden"');
    assert.strictEqual(v.sessionAfterDismiss, '1', 'sessionStorage must record "1" after dismissal');
    assert.strictEqual(v.localAfterDismiss, null, 'localStorage must remain completely empty after dismissal');

    assert.strictEqual(v.displayAfterReopen, 'block', 'Panel must reopen when clicking footer "Datenschutzinformationen"');
    assert.strictEqual(v.activeAfterReopen, 'btn-privacy-dismiss', 'Focus must move to dismiss button when reopened');
    assert.strictEqual(v.displayAfterClose, 'none', 'Panel must close when clicking close button');
    assert.strictEqual(v.activeAfterClose, 'btn-reopen-privacy', 'Focus must return to footer reopen button when dismissed');
  });
});
