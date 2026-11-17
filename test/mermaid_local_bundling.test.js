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

test('Mermaid Local Bundling Acceptance Suite (BGDE-MERMAID-LOCAL-BUNDLING-001)', async (t) => {
  const packageJsonPath = path.join(workspaceRoot, 'package.json');
  const projectPagePath = path.join(workspaceRoot, 'src', 'pages', 'project-[slug].astro');
  const distDir = path.join(workspaceRoot, 'dist');
  const distAstroDir = path.join(distDir, '_astro');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const projectPageContent = fs.readFileSync(projectPagePath, 'utf8');

  await t.test('1. Dependency Review: Explicitly versioned local mermaid dependency', () => {
    assert.ok(packageJson.dependencies, 'dependencies must exist in package.json');
    assert.strictEqual(
      packageJson.dependencies.mermaid,
      '10.9.3',
      'Mermaid must be pinned to compatible version 10.9.3'
    );
  });

  await t.test('2. Source Verification: CDN loader completely removed from project template', () => {
    assert.strictEqual(
      projectPageContent.includes('cdn.jsdelivr.net'),
      false,
      'src/pages/project-[slug].astro must NOT contain cdn.jsdelivr.net'
    );
    assert.strictEqual(
      projectPageContent.includes('document.createElement("script")'),
      false,
      'src/pages/project-[slug].astro must NOT dynamically inject script tags'
    );
    assert.ok(
      projectPageContent.includes('import("mermaid")'),
      'src/pages/project-[slug].astro must dynamically import mermaid via Vite pipeline'
    );
    assert.ok(
      projectPageContent.includes("securityLevel: \"strict\"") || projectPageContent.includes("securityLevel: 'strict'"),
      'Mermaid must configure securityLevel: strict'
    );
  });

  await t.test('3. Build Output Verification: Local first-party asset bundling', () => {
    assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');
    assert.ok(fs.existsSync(distAstroDir), 'dist/_astro/ directory must exist');

    const astroFiles = fs.readdirSync(distAstroDir);
    const mermaidCoreChunk = astroFiles.find(f => f.startsWith('mermaid.core.') && f.endsWith('.js'));
    assert.ok(mermaidCoreChunk, 'dist/_astro/ must contain bundled mermaid.core chunk');

    // Verify all 6 project HTML pages do not contain cdn.jsdelivr.net
    const projectSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners', 'becc'];
    for (const slug of projectSlugs) {
      const pagePath = path.join(distDir, `project-${slug}`, 'index.html');
      assert.ok(fs.existsSync(pagePath), `project-${slug}/index.html must exist`);
      const pageHtml = fs.readFileSync(pagePath, 'utf8');
      assert.strictEqual(
        pageHtml.includes('cdn.jsdelivr.net'),
        false,
        `project-${slug} must not contain cdn.jsdelivr.net`
      );
    }
  });

  await t.test('4. Real Browser Execution & Diagram Rendering in Headless Chrome via CDP', async () => {
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    const browserBinary = chromePaths.find(p => fs.existsSync(p));
    assert.ok(browserBinary, 'A valid browser binary (Chrome or Edge) must be available on the testbed');

    // Locate bundled hoisted client script
    const astroFiles = fs.readdirSync(distAstroDir);
    const hoistedScript = astroFiles.find(f =>
      f.startsWith('hoisted.') &&
      f.endsWith('.js') &&
      fs.readFileSync(path.join(distAstroDir, f), 'utf8').includes('language-mermaid')
    );
    assert.ok(hoistedScript, 'Astro bundled client script for Mermaid must be present');

    // Create an isolated fixture in dist/ referencing the local bundled script
    const fixtureHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Mermaid Local Bundling Test</title>
  <script type="module" src="/_astro/${hoistedScript}"></script>
</head>
<body>
  <h1>Test Diagram</h1>
  <pre class="language-mermaid">graph TD; A[Web Client]-->B[Local Mermaid Bundle];</pre>
</body>
</html>`;

    const fixturePath = path.join(distDir, 'test-mermaid-cdp-suite.html');
    fs.writeFileSync(fixturePath, fixtureHtml, 'utf8');

    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml'
    };

    const server = http.createServer((req, res) => {
      const cleanUrl = req.url.split('?')[0];
      const filePath = path.join(distDir, cleanUrl);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.end(fs.readFileSync(filePath));
      } else {
        res.statusCode = 404;
        res.end('Not found');
      }
    });

    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const fixtureUrl = `http://127.0.0.1:${port}/test-mermaid-cdp-suite.html`;

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-mtest-'));
    const chrome = spawn(browserBinary, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--user-data-dir=${tmpDir}`,
      '--remote-debugging-port=0',
      fixtureUrl
    ]);

    let wsUrl = null;
    chrome.stderr.on('data', chunk => {
      const text = chunk.toString();
      const match = text.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[^\s]+)/);
      if (match) {
        wsUrl = match[1];
      }
    });

    for (let i = 0; i < 50; i++) {
      if (wsUrl) break;
      await new Promise(r => setTimeout(r, 100));
    }
    assert.ok(wsUrl, 'Chrome DevTools WebSocket endpoint must be established');

    const devtoolsPort = new URL(wsUrl).port;
    const listRes = await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`);
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page' && p.url.includes('test-mermaid-cdp-suite')) || pages[0];

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const curId = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send('Runtime.enable');
    await send('Page.enable');

    // Wait for async dynamic bundle import and Mermaid render
    await new Promise(r => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const svg = document.querySelector('svg');
        const mermaidDiv = document.querySelector('.mermaid');
        return {
          hasSvg: !!svg,
          svgTag: svg ? svg.outerHTML.substring(0, 150) : null,
          hasLocalMermaidText: document.body.innerHTML.includes('Local Mermaid Bundle'),
          containsJsdelivr: document.documentElement.outerHTML.includes('cdn.jsdelivr.net')
        };
      })()`,
      returnByValue: true
    });

    ws.close();
    chrome.kill('SIGKILL');
    await new Promise(r => setTimeout(r, 300));
    server.close();
    fs.rmSync(fixturePath, { force: true });
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

    const evalValue = evalRes.result.value;
    assert.ok(evalValue.hasSvg, 'Rendered page must contain an SVG element generated by Mermaid');
    assert.ok(evalValue.hasLocalMermaidText, 'Rendered SVG must contain diagram node text');
    assert.strictEqual(evalValue.containsJsdelivr, false, 'No references to cdn.jsdelivr.net allowed');
  });

  await t.test('5. Service Worker Compatibility Check', () => {
    const swPath = path.join(workspaceRoot, 'public', 'service-worker.js');
    assert.ok(fs.existsSync(swPath), 'public/service-worker.js must exist');
    const swContent = fs.readFileSync(swPath, 'utf8');

    // Service worker caches GET responses matching 200 OK
    assert.ok(
      swContent.includes('caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));'),
      'Service worker correctly caches successful local runtime assets'
    );
  });
});
