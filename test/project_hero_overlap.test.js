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

test('Project Hero Responsive Overlap Regression Guard (BGDE-RESPONSIVE-PROJECT-HERO-OVERLAP-001)', async (t) => {
  const templatePath = path.join(workspaceRoot, 'src', 'pages', 'project-[slug].astro');
  const distDir = path.join(workspaceRoot, 'dist');
  const publicSlugs = ['becc', 'bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];
  const testBreakpoints = [360, 390, 600, 768, 820, 1024, 1280];

  assert.ok(fs.existsSync(templatePath), 'src/pages/project-[slug].astro must exist.');
  const templateSource = fs.readFileSync(templatePath, 'utf8');

  await t.test('1. Static CSS Contract: Responsive Spacing Accommodates Hero Bridge', () => {
    // 1.1 Desktop base padding-bottom is at least 12rem (192px) to clear 130px bridge
    assert.match(
      templateSource,
      /\.project-hero\s*\{[^}]*padding:\s*8\.5rem\s+var\(--space-2\)\s+12rem;/,
      'Desktop .project-hero must define 12rem bottom padding'
    );

    // 1.2 Tablet padding-bottom (@media max-width: 980px) is at least 9.5rem / 10rem to clear 100px bridge
    const tabletMatch = templateSource.match(/@media\s*\(max-width:\s*980px\)\s*\{([\s\S]*?)\}/);
    assert.ok(tabletMatch, 'Tablet media query @media (max-width: 980px) must exist');
    const tabletBlock = tabletMatch[1];

    assert.ok(
      tabletBlock.includes('.project-hero'),
      'Tablet media query must style .project-hero'
    );
    // Ensure padding-bottom is not the broken 4.25rem (68px)
    assert.strictEqual(
      tabletBlock.includes('4.25rem'),
      false,
      'Tablet media query must not use broken 4.25rem bottom padding'
    );
    assert.match(
      tabletBlock,
      /padding:\s*7rem\s+var\(--space-2\)\s+10rem\s*!important/,
      'Tablet .project-hero must provide 10rem bottom padding to clear 100px bridge'
    );

    // 1.3 Mobile padding-bottom (@media max-width: 640px) is at least 8rem / 8.5rem to clear 90px bridge
    const mobileMatch = templateSource.match(/@media\s*\(max-width:\s*640px\)\s*\{([\s\S]*?)\}/);
    assert.ok(mobileMatch, 'Mobile media query @media (max-width: 640px) must exist');
    const mobileBlock = mobileMatch[1];
    assert.ok(
      mobileBlock.includes('.project-hero'),
      'Mobile media query must style .project-hero'
    );
  });

  await t.test('2. Built Artifacts: All 6 Public Project Routes Contain Required Structure', () => {
    assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');

    for (const slug of publicSlugs) {
      const pagePath = path.join(distDir, `project-${slug}`, 'index.html');
      assert.ok(fs.existsSync(pagePath), `Rendered page for project-${slug} must exist`);

      const html = fs.readFileSync(pagePath, 'utf8');
      assert.ok(html.includes('class="project-hero"'), `project-${slug} must include .project-hero`);
      assert.ok(
        html.includes('class="project-hero__description"'),
        `project-${slug} must include .project-hero__description`
      );
      assert.ok(html.includes('class="hero-bridge"'), `project-${slug} must include .hero-bridge`);
      assert.ok(
        html.includes('class="hero-bridge__center"'),
        `project-${slug} must include .hero-bridge__center`
      );
    }
  });

  await t.test('3. Real Browser Execution (CDP): Clearance & Zero Horizontal Overflow Across Breakpoints', async (tSub) => {
    const chromeBin = findBrowserBinary();
    if (!chromeBin) {
      tSub.skip('No suitable Chrome/Chromium binary found for headless CDP verification.');
      return;
    }

    // Serve dist/ via local HTTP server
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath.endsWith('/')) reqPath += 'index.html';
      const filePath = path.join(distDir, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const port = server.address().port;

    const tmpUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-hero-test-'));
    const cdpPort = 9224;

    const chrome = spawn(chromeBin, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${tmpUserDataDir}`
    ]);

    try {
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

      const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      const pages = await listRes.json();
      const page = pages.find((p) => p.type === 'page') || pages[0];
      assert.ok(page && page.webSocketDebuggerUrl, 'Active browser page target must exist');

      const pageWs = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise((r) => { pageWs.onopen = r; });

      let msgId = 1;
      function sendCommand(method, params = {}) {
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

      await sendCommand('Page.enable');
      await sendCommand('Runtime.enable');

      for (const slug of publicSlugs) {
        for (const width of testBreakpoints) {
          await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: width,
            height: 900,
            deviceScaleFactor: 1,
            mobile: width < 1024
          });

          await sendCommand('Page.navigate', { url: `http://127.0.0.1:${port}/project-${slug}/` });
          await new Promise((r) => setTimeout(r, 250));

          const evalRes = await sendCommand('Runtime.evaluate', {
            expression: `(() => {
              const desc = document.querySelector('.project-hero__description');
              const bridge = document.querySelector('.hero-bridge');
              const center = document.querySelector('.hero-bridge__center');
              if (!desc || !bridge || !center) return { missing: true };

              const descRect = desc.getBoundingClientRect();
              const bridgeRect = bridge.getBoundingClientRect();
              const centerRect = center.getBoundingClientRect();
              const clearanceBridge = bridgeRect.top - descRect.bottom;
              const clearanceCenter = centerRect.top - descRect.bottom;
              const effectiveClearance = Math.min(clearanceBridge, clearanceCenter);

              return {
                missing: false,
                clearance: effectiveClearance,
                descBottom: descRect.bottom,
                bridgeTop: bridgeRect.top,
                centerTop: centerRect.top,
                scrollWidth: document.documentElement.scrollWidth,
                innerWidth: window.innerWidth
              };
            })()`,
            returnByValue: true
          });

          const data = evalRes.result.value;
          assert.strictEqual(data.missing, false, `DOM elements must exist on /project-${slug}/ at ${width}px`);

          // Assert positive clearance with at least 24px buffer
          assert.ok(
            data.clearance >= 24,
            `Expected clearance >= 24px on /project-${slug}/ at ${width}px, got ${data.clearance}px (descBottom: ${data.descBottom}, bridgeTop: ${data.bridgeTop})`
          );

          // Assert zero horizontal overflow
          assert.ok(
            data.scrollWidth <= data.innerWidth,
            `Expected no horizontal overflow on /project-${slug}/ at ${width}px: scrollWidth (${data.scrollWidth}) <= innerWidth (${data.innerWidth})`
          );
        }
      }

      pageWs.close();
    } finally {
      chrome.kill();
      server.close();
      try {
        fs.rmSync(tmpUserDataDir, { recursive: true, force: true });
      } catch {}
    }
  });
});
