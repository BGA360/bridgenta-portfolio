import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

function findBrowserBinary() {
  const envBin = process.env.CHROME_BIN || process.env.BROWSER_PATH;
  if (envBin && fs.existsSync(envBin)) return envBin;

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
  return candidates.find((c) => fs.existsSync(c)) || null;
}

const LEGACY_SW_V21 = `
const CACHE_NAME = "bridgenta-portfolio-v21";
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(["/", "/datenschutz/", "/impressum/"]))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
`;

test('Service Worker Retirement Verification Suite (DEC-01 Option B)', async (t) => {
  const swPath = path.join(workspaceRoot, 'public', 'service-worker.js');
  const scriptJsPath = path.join(workspaceRoot, 'src', 'scripts', 'script.js');
  const offlineHtmlPath = path.join(workspaceRoot, 'public', 'offline.html');

  assert.ok(fs.existsSync(swPath), 'public/service-worker.js must exist');
  const retirementSwSource = fs.readFileSync(swPath, 'utf8');

  await t.test('1. Source Invariants: Registration Removed & Obsolete Offline Page Removed', () => {
    const scriptJs = fs.readFileSync(scriptJsPath, 'utf8');
    assert.strictEqual(
      /serviceWorker\.register/i.test(scriptJs),
      false,
      'src/scripts/script.js must NOT register a Service Worker'
    );
    assert.strictEqual(
      fs.existsSync(offlineHtmlPath),
      false,
      'public/offline.html must be removed under DEC-01 Option B'
    );
    assert.strictEqual(
      /addEventListener\s*\(\s*['"]fetch['"]/i.test(retirementSwSource),
      false,
      'Retirement SW must NOT attach a fetch handler'
    );
  });

  await t.test('2. Observable Cache-Deletion Failure Reporting (Even When Unregister Succeeds)', async () => {
    const listeners = {};
    const deletedAttempts = [];
    const clientMessages = [];
    const errorLogs = [];

    const mockSelf = {
      addEventListener(type, fn) {
        listeners[type] = fn;
      },
      skipWaiting: async () => {},
      registration: {
        unregister: async () => true,
      },
      clients: {
        matchAll: async () => [
          {
            postMessage(msg) {
              clientMessages.push(msg);
            },
          },
        ],
      },
    };

    const mockCaches = {
      keys: async () => [
        'bridgenta-portfolio-v21',
        'bridgenta-portfolio-v20',
        'unrelated-origin-cache',
      ],
      delete: async (key) => {
        deletedAttempts.push(key);
        if (key === 'bridgenta-portfolio-v20') return false; // Simulate failed deletion
        return true;
      },
    };

    const sandbox = {
      self: mockSelf,
      caches: mockCaches,
      console: {
        error: (...args) => errorLogs.push(args),
      },
      Promise,
    };

    vm.runInNewContext(retirementSwSource, sandbox);

    let activatePromise = null;
    listeners.activate({
      waitUntil(p) {
        activatePromise = p;
      },
    });
    await activatePromise;

    // Must ONLY attempt deletion of bridgenta-portfolio-* caches
    assert.deepStrictEqual(
      deletedAttempts.sort(),
      ['bridgenta-portfolio-v20', 'bridgenta-portfolio-v21'],
      'Must never attempt to delete unrelated-origin-cache'
    );

    assert.strictEqual(clientMessages.length, 1, 'Must post retirement report to window clients');
    const report = JSON.parse(JSON.stringify(clientMessages[0]));
    assert.strictEqual(report.type, 'BGDE_SW_RETIREMENT_RESULT');
    assert.strictEqual(report.unregistered, true, 'unregister() succeeded');
    assert.strictEqual(
      report.cacheCleanupSucceeded,
      false,
      'cacheCleanupSucceeded MUST be false when any owned cache fails to delete'
    );
    assert.deepStrictEqual(report.deletedCaches, ['bridgenta-portfolio-v21']);
    assert.strictEqual(report.failedCaches.length, 1);
    assert.strictEqual(report.failedCaches[0].key, 'bridgenta-portfolio-v20');
    assert.ok(errorLogs.length >= 1, 'Failed cache deletion must be logged via console.error');
  });

  await t.test('3. Real Browser E2E Transition (Legacy v21 -> Offline/Reconnect -> STRATO Retirement)', async (tSub) => {
    const chromeBin = findBrowserBinary();
    if (!chromeBin) {
      tSub.skip('No Chrome/Chromium binary available for headless CDP test.');
      return;
    }

    let phase = 'legacy'; // 'legacy' | 'strato'

    const server = http.createServer((req, res) => {
      const reqPath = req.url.split('?')[0];

      if (reqPath === '/service-worker.js') {
        if (phase === 'legacy') {
          res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
          res.end(LEGACY_SW_V21);
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          });
          res.end(retirementSwSource);
        }
        return;
      }

      if (reqPath === '/' || reqPath === '/datenschutz/' || reqPath === '/impressum/') {
        const marker = phase === 'legacy' ? 'LEGACY_GITHUB_PAGES_LEGAL_V21' : 'STRATO_PRODUCTION_LEGAL_V22';
        const registerSnippet =
          phase === 'legacy'
            ? `<script>navigator.serviceWorker.register('/service-worker.js');</script>`
            : '';
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        });
        res.end(`<!DOCTYPE html><html lang="de"><head><title>${marker}</title></head><body><main data-version="${marker}">${marker} (${reqPath})</main>${registerSnippet}</body></html>`);
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const origin = `http://127.0.0.1:${port}`;

    const tmpUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bgde-sw-retire-test-'));
    const cdpPort = 9750 + Math.floor(Math.random() * 400);

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
    let freshDatenschutz = null;
    let freshImpressum = null;

    try {
      for (let i = 0; i < 100; i++) {
        await new Promise((r) => setTimeout(r, 100));
        try {
          const res = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
          if (res.ok) {
            wsUrl = (await res.json()).webSocketDebuggerUrl;
            break;
          }
        } catch {}
      }
      assert.ok(wsUrl, 'Chrome CDP WebSocket URL must be available');

      const pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
      const page = pages.find((p) => p.type === 'page') || pages[0];
      pageWs = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise((r) => { pageWs.onopen = r; });

      let msgId = 1;
      function send(method, params = {}) {
        return new Promise((resolve, reject) => {
          const id = msgId++;
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

      await send('Page.enable');
      await send('Runtime.enable');
      await send('Network.enable');

      // Step 1: Load legacy page, register v21 SW, populate v21 cache + unrelated canary storage
      await send('Page.navigate', { url: `${origin}/` });
      await new Promise((r) => setTimeout(r, 1000));

      const legacyState = await send('Runtime.evaluate', {
        expression: `(async () => {
          await navigator.serviceWorker.ready;
          localStorage.setItem('unrelated-ls', 'preserve-me');
          sessionStorage.setItem('unrelated-ss', 'preserve-me');
          document.cookie = 'unrelated_cookie=preserve_me; path=/';
          const canaryCache = await caches.open('unrelated-canary-cache');
          await canaryCache.put('/canary.txt', new Response('canary-ok'));
          await new Promise((resolve, reject) => {
            const req = indexedDB.open('unrelated-canary-db', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('store');
            req.onsuccess = () => {
              const tx = req.result.transaction('store', 'readwrite');
              tx.objectStore('store').put('idb-ok', 'k1');
              tx.oncomplete = () => { req.result.close(); resolve(); };
            };
            req.onerror = () => reject(req.error);
          });
          const regs = await navigator.serviceWorker.getRegistrations();
          const keys = (await caches.keys()).sort();
          return { regCount: regs.length, keys };
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });

      assert.strictEqual(legacyState.result.value.regCount, 1, 'Legacy v21 SW must be registered');
      assert.ok(
        legacyState.result.value.keys.includes('bridgenta-portfolio-v21'),
        'Legacy v21 cache must exist before cutover'
      );

      // Step 2: Verify offline cached legal page still works under v21 without crashing
      await send('Network.emulateNetworkConditions', {
        offline: true,
        latency: 0,
        downloadThroughput: 0,
        uploadThroughput: 0,
      });
      await send('Page.navigate', { url: `${origin}/datenschutz/` });
      await new Promise((r) => setTimeout(r, 700));
      const offlineLegal = await send('Runtime.evaluate', {
        expression: `document.querySelector('main')?.getAttribute('data-version')`,
        returnByValue: true,
      });
      assert.strictEqual(
        offlineLegal.result.value,
        'LEGACY_GITHUB_PAGES_LEGAL_V21',
        'Offline v21 client should serve cached legacy legal page prior to reconnect'
      );

      // Step 3: Switch server to STRATO cutover phase and reconnect client online
      phase = 'strato';
      await send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
      });

      // Navigate online to trigger browser SW update check -> fetches retirement /service-worker.js
      await send('Page.navigate', { url: `${origin}/` });
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 150));
        const check = await send('Runtime.evaluate', {
          expression: `(async () => (await navigator.serviceWorker.getRegistrations()).length)()`,
          awaitPromise: true,
          returnByValue: true,
        });
        if (check?.result?.value === 0) break;
      }

      // Trigger a fresh navigation to /datenschutz/ after retirement completes
      await send('Page.navigate', { url: `${origin}/datenschutz/` });
      await new Promise((r) => setTimeout(r, 700));
      freshDatenschutz = await send('Runtime.evaluate', {
        expression: `(async () => {
          const version = document.querySelector('main')?.getAttribute('data-version');
          const regs = await navigator.serviceWorker.getRegistrations();
          const controllerPresent = navigator.serviceWorker.controller !== null;
          const cacheKeys = (await caches.keys()).sort();
          const canaryResp = await (await caches.open('unrelated-canary-cache')).match('/canary.txt');
          const canaryCacheText = canaryResp ? await canaryResp.text() : null;
          const idbValue = await new Promise((resolve, reject) => {
            const req = indexedDB.open('unrelated-canary-db', 1);
            req.onsuccess = () => {
              const tx = req.result.transaction('store', 'readonly');
              const getReq = tx.objectStore('store').get('k1');
              getReq.onsuccess = () => { req.result.close(); resolve(getReq.result); };
            };
            req.onerror = () => reject(req.error);
          });
          return {
            version,
            regCount: regs.length,
            controllerPresent,
            cacheKeys,
            canaryCacheText,
            canaryLs: localStorage.getItem('unrelated-ls'),
            canarySs: sessionStorage.getItem('unrelated-ss'),
            canaryCookie: document.cookie,
            idbValue,
          };
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });

      // Also verify fresh /impressum/ navigation
      await send('Page.navigate', { url: `${origin}/impressum/` });
      await new Promise((r) => setTimeout(r, 600));
      freshImpressum = await send('Runtime.evaluate', {
        expression: `document.querySelector('main')?.getAttribute('data-version')`,
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
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      server.close();
      try { fs.rmSync(tmpUserDataDir, { recursive: true, force: true }); } catch {}
    }

    const r = freshDatenschutz.result.value;

    // 5 Distinct Tightened Outcomes:
    // 1. Registration successfully removed
    assert.strictEqual(r.regCount, 0, 'Outcome 1: Service Worker registration must be removed');
    // 2. BridGenta-owned caches successfully removed
    assert.strictEqual(
      r.cacheKeys.some((k) => k.startsWith('bridgenta-portfolio-')),
      false,
      'Outcome 2: All bridgenta-portfolio-* caches must be deleted'
    );
    // 3. Existing controlled tab transitioned safely
    assert.strictEqual(r.controllerPresent, false, 'Outcome 3: Active tab must no longer be SW-controlled');
    // 4. New navigation loads fresh STRATO HTML
    assert.strictEqual(r.version, 'STRATO_PRODUCTION_LEGAL_V22', 'Outcome 4a: /datenschutz/ must serve fresh STRATO HTML');
    assert.strictEqual(freshImpressum.result.value, 'STRATO_PRODUCTION_LEGAL_V22', 'Outcome 4b: /impressum/ must serve fresh STRATO HTML');
    // 5. Unrelated storage remains unchanged
    assert.ok(r.cacheKeys.includes('unrelated-canary-cache'), 'Outcome 5a: Unrelated Cache Storage must remain');
    assert.strictEqual(r.canaryCacheText, 'canary-ok', 'Outcome 5b: Unrelated Cache Storage content must remain');
    assert.strictEqual(r.canaryLs, 'preserve-me', 'Outcome 5c: Unrelated localStorage must remain');
    assert.strictEqual(r.canarySs, 'preserve-me', 'Outcome 5d: Unrelated sessionStorage must remain');
    assert.ok(r.canaryCookie.includes('unrelated_cookie=preserve_me'), 'Outcome 5e: Unrelated cookie must remain');
    assert.strictEqual(r.idbValue, 'idb-ok', 'Outcome 5f: Unrelated IndexedDB must remain');
  });
});
