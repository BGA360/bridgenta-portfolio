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

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

test('Privacy Information Center Acceptance Suite (DEC-02 Storage-Free Footer-Activated)', async (t) => {
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
    assert.strictEqual(fs.existsSync(oldConsentPath), false, 'Old CookieConsent.astro must not exist');
    assert.strictEqual(layoutSource.includes('CookieConsent'), false, 'Layout.astro must not reference CookieConsent');
    assert.strictEqual(layoutSource.includes('btn-reopen-cookies'), false, 'Layout.astro must not contain btn-reopen-cookies');
    assert.ok(layoutSource.includes('PrivacyInformationCenter'), 'Layout.astro must import PrivacyInformationCenter');
    assert.ok(layoutSource.includes('id="btn-reopen-privacy"'), 'Layout.astro must provide footer button #btn-reopen-privacy');
    assert.ok(layoutSource.includes('Datenschutzinformationen'), 'Footer button must be labeled "Datenschutzinformationen"');

    const forbiddenConsentPhrases = [
      'Alle akzeptieren',
      'Nur notwendige',
      'Auswahl speichern',
      'Optionale Dienste',
      'Cookie-Einstellungen',
      'cookie-consent-status',
      'cookie-opt-necessary',
      'cookie-opt-optional',
    ];
    for (const phrase of forbiddenConsentPhrases) {
      assert.strictEqual(componentSource.includes(phrase), false, `Component must not contain consent phrase: "${phrase}"`);
      assert.strictEqual(indexHtml.includes(phrase), false, `Rendered HTML must not contain consent phrase: "${phrase}"`);
    }
  });

  await t.test('2. Semantic Content & Architecture Alignment (No Active SW, Informational Only)', () => {
    assert.ok(componentSource.includes('Datenschutzhinweis'), 'Component must declare heading "Datenschutzhinweis"');
    assert.ok(indexHtml.includes('keine Einwilligungsabfrage'), 'Panel must clearly state it is not a consent prompt');
    assert.ok(indexHtml.includes('keinen Service Worker'), 'Panel must accurately state no Service Worker is used');
    assert.ok(indexHtml.includes('STRATO'), 'Panel must identify STRATO hosting');
    assert.ok(indexHtml.includes('maximal 7 Tage'), 'Panel must state 7-day maximum visitor log retention');
    assert.ok(indexHtml.includes('HTTP-Caching') || indexHtml.includes('HTTP-Browser-Caching'), 'Panel must not claim normal browser HTTP caching is disabled');

    // Must not describe disabled Service Worker caching as active
    assert.strictEqual(componentSource.includes('Offline-Nutzung lokal zwischengespeichert'), false, 'Component must not claim active offline SW caching');
    assert.strictEqual(componentSource.includes('Ein browserinterner Service Worker speichert'), false, 'Component must not describe active Service Worker caching');

    assert.ok(indexHtml.includes('id="btn-privacy-dismiss"'), 'Panel must contain dismiss/close button');
    assert.ok(indexHtml.includes('id="btn-privacy-details"'), 'Panel must contain details toggle button');
    assert.ok(indexHtml.includes('href="/datenschutz"'), 'Panel must link to /datenschutz');
    assert.ok(indexHtml.includes('href="/impressum"'), 'Panel must link to /impressum');
  });

  await t.test('3. Zero Website-Owned Browser Storage Invariants (DEC-02)', () => {
    const scriptMatch = componentSource.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    assert.ok(scriptMatch, 'Component must contain an inline script block');
    const scriptBlock = scriptMatch[1];
    assert.strictEqual(scriptBlock.includes('sessionStorage'), false, 'Component script must NOT read or write sessionStorage');
    assert.strictEqual(scriptBlock.includes('localStorage'), false, 'Component script must NOT read or write localStorage');
    assert.strictEqual(scriptBlock.includes('document.cookie'), false, 'Component script must NOT read or write HTTP cookies');
    assert.strictEqual(scriptBlock.includes('indexedDB'), false, 'Component script must NOT access IndexedDB');
  });

  await t.test('4. Accessibility, ARIA & Keyboard Contracts', () => {
    assert.ok(componentSource.includes('role="region"'), 'Panel must declare role="region"');
    assert.ok(componentSource.includes('aria-labelledby="privacy-info-title"'), 'Panel must declare aria-labelledby');
    assert.ok(componentSource.includes('aria-describedby="privacy-info-desc"'), 'Panel must declare aria-describedby');
    assert.ok(componentSource.includes('aria-hidden="true"'), 'Panel must start with aria-hidden="true"');
    assert.ok(componentSource.includes('aria-expanded="false"'), 'Details button must declare aria-expanded');
    assert.ok(componentSource.includes('aria-controls="privacy-info-details"'), 'Details button must declare aria-controls');
    assert.ok(componentSource.includes('aria-label="Hinweis schließen"'), 'Close button must declare accessible aria-label');
    assert.ok(componentSource.includes('key === "Escape"'), 'Script must handle Escape key');
    assert.ok(componentSource.includes('prefers-reduced-motion: reduce'), 'Component must support reduced motion');
    assert.ok(componentSource.includes('overflow-y: auto'), 'Panel must support 200% zoom scroll');
    assert.ok(componentSource.includes('nav.classList.contains("is-open")'), 'Script must respect open mobile nav drawer on Escape');
  });

  await t.test('5. Presence Across All 6 Public Project Routes', () => {
    const publicSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners', 'becc'];
    for (const slug of publicSlugs) {
      const pagePath = path.join(distDir, `project-${slug}`, 'index.html');
      assert.ok(fs.existsSync(pagePath), `Route project-${slug} must exist in dist`);
      const html = fs.readFileSync(pagePath, 'utf8');
      assert.ok(html.includes('id="privacy-info-center"'), `project-${slug} must embed privacy-info-center`);
      assert.ok(html.includes('id="btn-reopen-privacy"'), `project-${slug} must embed #btn-reopen-privacy in footer`);
      assert.strictEqual(html.includes('cookie-consent-banner'), false, `project-${slug} must not contain cookie-consent-banner`);
    }
  });

  await t.test('6. Real Browser Execution via CDP (Footer-Only Open, Scoped Storage Delta, Zero Third-Party Requests)', async (tSub) => {
    const chromeBin = findBrowserBinary();
    if (!chromeBin) {
      tSub.skip('No suitable Chrome/Chromium binary found for headless CDP verification.');
      return;
    }

    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      let filePath = path.join(distDir, reqPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.json': 'application/json',
          '.woff2': 'font/woff2',
          '.webp': 'image/webp',
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
    const origin = `http://127.0.0.1:${port}`;

    const tmpUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bgde-privacy-info-test-'));
    const cdpPort = 9223 + Math.floor(Math.random() * 500);

    const chrome = spawn(chromeBin, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${tmpUserDataDir}`,
    ]);

    let wsUrl = null;
    let pageWs = null;
    let evalResult = null;
    const externalRequests = [];

    try {
      for (let i = 0; i < 100; i++) {
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

      const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      const pages = await listRes.json();
      const page = pages.find((p) => p.type === 'page') || pages[0];
      assert.ok(page && page.webSocketDebuggerUrl, 'Active browser page target must exist');

      pageWs = new WebSocket(page.webSocketDebuggerUrl);
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

      pageWs.addEventListener('message', (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.method === 'Network.requestWillBeSent') {
          const url = msg.params?.request?.url || '';
          // Only inspect HTTP(S) network requests; exclude browser-internal chrome:// UI and local host AV proxy injections
          const isHttp = /^https?:\/\//i.test(url);
          const isLocalAvInjection = /kaspersky-labs\.com/i.test(url);
          if (isHttp && !url.startsWith(origin) && !isLocalAvInjection) {
            externalRequests.push(url);
          }
        }
      });

      await sendPageCommand('Page.enable');
      await sendPageCommand('Runtime.enable');
      await sendPageCommand('Network.enable');

      // First navigate to seed unrelated canary storage entries
      await sendPageCommand('Page.navigate', { url: `${origin}/` });
      await new Promise((r) => setTimeout(r, 800));

      await sendPageCommand('Runtime.evaluate', {
        expression: `(() => {
          localStorage.setItem('unrelated-canary-ls', 'keep-me');
          sessionStorage.setItem('unrelated-canary-ss', 'keep-me');
        })()`,
      });

      // Reload cleanly to test initial page load + interaction delta
      await sendPageCommand('Page.reload', { ignoreCache: true });
      await new Promise((r) => setTimeout(r, 900));

      evalResult = await sendPageCommand('Runtime.evaluate', {
        expression: `(async () => {
          const panel = document.getElementById('privacy-info-center');
          const initialDisplay = panel ? window.getComputedStyle(panel).display : 'missing';
          const initialAriaHidden = panel ? panel.getAttribute('aria-hidden') : null;

          // Open via footer control
          const btnReopen = document.getElementById('btn-reopen-privacy');
          btnReopen.click();
          const displayAfterOpen = window.getComputedStyle(panel).display;
          const ariaHiddenAfterOpen = panel.getAttribute('aria-hidden');
          const activeAfterOpen = document.activeElement ? document.activeElement.id : null;

          // Toggle details
          const btnDetails = document.getElementById('btn-privacy-details');
          const details = document.getElementById('privacy-info-details');
          const detailsBefore = window.getComputedStyle(details).display;
          btnDetails.click();
          const detailsAfterClick = window.getComputedStyle(details).display;
          btnDetails.click();
          const detailsAfterSecondClick = window.getComputedStyle(details).display;

          // Escape must NOT close while mobile nav drawer is open
          const nav = document.querySelector('.nav');
          if (nav) nav.classList.add('is-open');
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          const displayAfterEscapeNavOpen = window.getComputedStyle(panel).display;
          if (nav) nav.classList.remove('is-open');

          // Escape closes when mobile nav drawer is closed & restores focus
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          const displayAfterEscapeNavClosed = window.getComputedStyle(panel).display;
          const activeAfterEscape = document.activeElement ? document.activeElement.id : null;

          // Reopen and close via dismiss button
          btnReopen.click();
          document.getElementById('btn-privacy-dismiss').click();
          const displayAfterDismiss = window.getComputedStyle(panel).display;
          const activeAfterDismiss = document.activeElement ? document.activeElement.id : null;

          // Reopen and close via close icon button
          btnReopen.click();
          document.getElementById('btn-privacy-close').click();
          const displayAfterClose = window.getComputedStyle(panel).display;
          const activeAfterClose = document.activeElement ? document.activeElement.id : null;

          // Scoped storage delta check
          const lsKeys = Object.keys(localStorage).sort();
          const ssKeys = Object.keys(sessionStorage).sort();
          const cookies = document.cookie;
          const swRegs = 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0;

          return {
            initialDisplay,
            initialAriaHidden,
            displayAfterOpen,
            ariaHiddenAfterOpen,
            activeAfterOpen,
            detailsBefore,
            detailsAfterClick,
            detailsAfterSecondClick,
            displayAfterEscapeNavOpen,
            displayAfterEscapeNavClosed,
            activeAfterEscape,
            displayAfterDismiss,
            activeAfterDismiss,
            displayAfterClose,
            activeAfterClose,
            lsKeys,
            ssKeys,
            canaryLs: localStorage.getItem('unrelated-canary-ls'),
            canarySs: sessionStorage.getItem('unrelated-canary-ss'),
            cookies,
            swRegs,
          };
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });
    } finally {
      if (wsUrl) {
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
      }
      try { if (pageWs) pageWs.close(); } catch {}
      try { chrome.kill('SIGKILL'); } catch {}
      try { chrome.unref(); } catch {}
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      server.close();
      try { fs.rmSync(tmpUserDataDir, { recursive: true, force: true }); } catch {}
    }

    const v = evalResult.result.value;

    // Footer-only open invariants
    assert.strictEqual(v.initialDisplay, 'none', 'Panel MUST NOT auto-open on page load (DEC-02)');
    assert.strictEqual(v.initialAriaHidden, 'true', 'Panel must start aria-hidden="true"');
    assert.strictEqual(v.displayAfterOpen, 'block', 'Panel must open when clicking footer #btn-reopen-privacy');
    assert.strictEqual(v.ariaHiddenAfterOpen, 'false', 'Panel must set aria-hidden="false" when open');
    assert.strictEqual(v.activeAfterOpen, 'btn-privacy-dismiss', 'Focus must move into panel on open');

    // Details & keyboard invariants
    assert.strictEqual(v.detailsBefore, 'none');
    assert.strictEqual(v.detailsAfterClick, 'block');
    assert.strictEqual(v.detailsAfterSecondClick, 'none');
    assert.strictEqual(v.displayAfterEscapeNavOpen, 'block');
    assert.strictEqual(v.displayAfterEscapeNavClosed, 'none');
    assert.strictEqual(v.activeAfterEscape, 'btn-reopen-privacy');
    assert.strictEqual(v.displayAfterDismiss, 'none');
    assert.strictEqual(v.activeAfterDismiss, 'btn-reopen-privacy');
    assert.strictEqual(v.displayAfterClose, 'none');
    assert.strictEqual(v.activeAfterClose, 'btn-reopen-privacy');

    // Scoped storage delta invariants (canary preserved, zero website-owned writes)
    assert.deepStrictEqual(v.lsKeys, ['unrelated-canary-ls'], 'Website must not write any localStorage keys');
    assert.deepStrictEqual(v.ssKeys, ['unrelated-canary-ss'], 'Website must not write any sessionStorage keys');
    assert.strictEqual(v.canaryLs, 'keep-me', 'Unrelated localStorage canary must remain intact');
    assert.strictEqual(v.canarySs, 'keep-me', 'Unrelated sessionStorage canary must remain intact');
    assert.strictEqual(v.cookies, '', 'Website must set zero HTTP cookies');
    assert.strictEqual(v.swRegs, 0, 'Website must register zero Service Workers (DEC-01 Option B)');

    // Zero automatic third-party requests
    assert.deepStrictEqual(externalRequests, [], `Expected 0 automatic third-party requests, got: ${externalRequests.join(', ')}`);
  });
});
