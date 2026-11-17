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
 * Finds a suitable Chromium or Chrome binary across Linux, macOS, and Windows.
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
    // Linux / CI environments (e.g. GitHub Actions ubuntu-latest)
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

test('Mermaid Local Bundling Acceptance Suite (BGDE-MERMAID-LOCAL-BUNDLING-001 & RECONCILIATION-001)', async (t) => {
  const packageJsonPath = path.join(workspaceRoot, 'package.json');
  const projectPagePath = path.join(workspaceRoot, 'src', 'pages', 'project-[slug].astro');
  const stubPath = path.join(workspaceRoot, 'src', 'lib', 'mermaid-elk-stub.js');
  const distDir = path.join(workspaceRoot, 'dist');
  const distAstroDir = path.join(distDir, '_astro');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const projectPageContent = fs.readFileSync(projectPagePath, 'utf8');

  await t.test('1. Dependency Review: Explicitly versioned local mermaid dependency', () => {
    assert.ok(packageJson.dependencies, 'dependencies must exist in package.json');
    assert.strictEqual(
      packageJson.dependencies.mermaid,
      '10.9.3',
      'Mermaid must be pinned to compatible version 10.9.3 without wildcard or caret'
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
      projectPageContent.includes('securityLevel: "strict"') || projectPageContent.includes("securityLevel: 'strict'"),
      'Mermaid must configure securityLevel: strict'
    );
    assert.ok(
      projectPageContent.includes('startOnLoad: false') || projectPageContent.includes('startOnLoad: !1'),
      'Mermaid must configure startOnLoad: false'
    );
  });

  await t.test('3. Build Output Verification: Local first-party asset bundling & size optimization', () => {
    assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');
    assert.ok(fs.existsSync(distAstroDir), 'dist/_astro/ directory must exist');

    const astroFiles = fs.readdirSync(distAstroDir);
    const mermaidCoreChunk = astroFiles.find(f => f.startsWith('mermaid.core.') && f.endsWith('.js'));
    assert.ok(mermaidCoreChunk, 'dist/_astro/ must contain bundled mermaid.core chunk');

    const elkStubChunk = astroFiles.find(f => f.startsWith('mermaid-elk-stub.') && f.endsWith('.js'));
    assert.ok(elkStubChunk, 'dist/_astro/ must contain aliased mermaid-elk-stub chunk');

    const elkStubStat = fs.statSync(path.join(distAstroDir, elkStubChunk));
    assert.ok(
      elkStubStat.size < 2048,
      `ELK stub chunk must be tiny (< 2 KB), got ${elkStubStat.size} bytes (1.4 MB unused ELK successfully eliminated)`
    );

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

  await t.test('4. ELK Stub Module Contract & Controlled Error Verification', async () => {
    assert.ok(fs.existsSync(stubPath), 'src/lib/mermaid-elk-stub.js must exist');
    const stubUrl = new URL('../src/lib/mermaid-elk-stub.js', import.meta.url).href;
    const stubModule = await import(stubUrl);

    assert.ok(stubModule.diagram, 'ELK stub must export diagram definition');
    assert.ok(typeof stubModule.diagram.db === 'object', 'diagram.db must be an object');
    assert.ok(typeof stubModule.diagram.parser === 'object', 'diagram.parser must be an object');
    assert.ok(typeof stubModule.diagram.renderer === 'object', 'diagram.renderer must be an object');
    assert.ok(typeof stubModule.diagram.styles === 'function', 'diagram.styles must be a function');

    // Assert that parser.parse throws clear, controlled unsupported layout error
    assert.throws(
      () => stubModule.diagram.parser.parse('flowchart-elk\n A --> B;'),
      /Unsupported layout engine: ELK layout is not bundled in this build/
    );

    // Assert that renderer.draw throws clear, controlled unsupported layout error
    assert.throws(
      () => stubModule.diagram.renderer.draw(),
      /Unsupported layout engine: ELK layout is not bundled in this build/
    );
  });

  await t.test('5. Real Browser Execution via Chrome DevTools Protocol (CDP)', async () => {
    const browserBinary = findBrowserBinary();
    if (!browserBinary) {
      assert.fail(
        'Browser capability required for Acceptance verification: No Chrome or Chromium binary was detected in this environment. ' +
        'Set CHROME_BIN or ensure google-chrome/chromium is installed.'
      );
    }

    t.diagnostic(`[FIXTURE_CLASSIFICATION] Verified using an isolated test fixture in dist/ because current public project case studies do not yet embed .language-mermaid blocks.`);
    t.diagnostic(`[BROWSER_CAPABILITY] Using browser binary: ${browserBinary}`);

    // Locate bundled hoisted client script
    const astroFiles = fs.readdirSync(distAstroDir);
    const hoistedScript = astroFiles.find(f =>
      f.startsWith('hoisted.') &&
      f.endsWith('.js') &&
      fs.readFileSync(path.join(distAstroDir, f), 'utf8').includes('language-mermaid')
    );
    assert.ok(hoistedScript, 'Astro bundled client script for Mermaid must be present in dist/_astro/');

    // Create an isolated fixture in dist/ containing both a supported Dagre flowchart and an unsupported ELK layout
    const fixtureHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Mermaid Acceptance Test Fixture</title>
  <script type="module" src="/_astro/${hoistedScript}"></script>
</head>
<body>
  <h1>Mermaid Acceptance Test Fixture</h1>
  <div id="supported-flowchart-container">
    <pre class="language-mermaid">graph TD; A[Eingabe] --> B[Verarbeitung]; B --> C[Ausgabe];</pre>
  </div>
  <div id="unsupported-elk-container">
    <pre class="language-mermaid">flowchart-elk
  A --> B;</pre>
  </div>
</body>
</html>`;

    const fixturePath = path.join(distDir, 'test-mermaid-acceptance-cdp.html');
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
    const fixtureUrl = `http://127.0.0.1:${port}/test-mermaid-acceptance-cdp.html`;

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-mtest-'));
    const chrome = spawn(browserBinary, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
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

    for (let i = 0; i < 60; i++) {
      if (wsUrl) break;
      await new Promise(r => setTimeout(r, 100));
    }
    assert.ok(wsUrl, 'Chrome DevTools WebSocket endpoint must be established');

    const devtoolsPort = new URL(wsUrl).port;
    const listRes = await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`);
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page' && p.url.includes('test-mermaid-acceptance-cdp')) || pages[0];

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

    const networkRequests = [];
    const consoleLogs = [];
    const unhandledExceptions = [];

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Network.requestWillBeSent') {
        networkRequests.push(msg.params.request.url);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({
          type: msg.params.type,
          args: msg.params.args.map(a => a.value || a.description)
        });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        unhandledExceptions.push(msg.params.exceptionDetails);
      }
    });

    await send('Network.enable');
    await send('Runtime.enable');
    await send('Page.enable');

    // Wait for dynamic module import, execution, and DOM transformation
    await new Promise(r => setTimeout(r, 2500));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const supportedContainer = document.getElementById('supported-flowchart-container');
        const unsupportedContainer = document.getElementById('unsupported-elk-container');

        const supportedSvg = supportedContainer ? supportedContainer.querySelector('svg') : null;
        const unsupportedSvg = unsupportedContainer ? unsupportedContainer.querySelector('svg') : null;

        return {
          supported: {
            hasSvg: !!supportedSvg,
            ariaRoleDescription: supportedSvg ? supportedSvg.getAttribute('aria-roledescription') : null,
            hasLabelEingabe: supportedContainer ? supportedContainer.textContent.includes('Eingabe') : false,
            hasLabelVerarbeitung: supportedContainer ? supportedContainer.textContent.includes('Verarbeitung') : false,
            hasLabelAusgabe: supportedContainer ? supportedContainer.textContent.includes('Ausgabe') : false,
            hasEdgeMarkers: supportedSvg ? supportedSvg.innerHTML.includes('marker') || supportedSvg.innerHTML.includes('path') : false
          },
          unsupported: {
            hasSvg: !!unsupportedSvg,
            ariaRoleDescription: unsupportedSvg ? unsupportedSvg.getAttribute('aria-roledescription') : null,
            isErrorDiagram: unsupportedSvg ? unsupportedSvg.getAttribute('aria-roledescription') === 'error' : false,
            hasErrorText: unsupportedContainer ? unsupportedContainer.textContent.includes('Syntax error') : false,
            didNotRenderFlowchart: unsupportedSvg ? unsupportedSvg.getAttribute('aria-roledescription') !== 'flowchart' && unsupportedSvg.getAttribute('aria-roledescription') !== 'flowchart-v2' : true
          },
          pageHtmlSnippet: document.documentElement.outerHTML.substring(0, 500)
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

    // 1. Assert Network Integrity
    assert.ok(networkRequests.length > 0, 'Browser must make network requests for assets');
    for (const reqUrl of networkRequests) {
      // Allow localhost test server and ignore local security software hooks
      if (reqUrl.includes('kaspersky-labs.com')) continue;
      assert.strictEqual(
        reqUrl.includes('cdn.jsdelivr.net'),
        false,
        `Network request to cdn.jsdelivr.net forbidden: ${reqUrl}`
      );
      assert.ok(
        reqUrl.startsWith(`http://127.0.0.1:${port}`) || reqUrl.startsWith('data:'),
        `All requests must originate from tested local origin http://127.0.0.1:${port}, got: ${reqUrl}`
      );
    }

    // Verify actual local bundled assets were loaded
    const loadedHoisted = networkRequests.some(u => u.includes('/_astro/hoisted.'));
    const loadedMermaidCore = networkRequests.some(u => u.includes('/_astro/mermaid.core.'));
    assert.ok(loadedHoisted, 'Browser must request local bundled hoisted script');
    assert.ok(loadedMermaidCore, 'Browser must request local bundled mermaid.core chunk');

    // 2. Assert Supported Flowchart (Dagre)
    assert.ok(evalValue.supported.hasSvg, 'Supported diagram must successfully render an SVG element');
    assert.strictEqual(evalValue.supported.ariaRoleDescription, 'flowchart-v2', 'Supported diagram must use flowchart-v2 renderer');
    assert.ok(evalValue.supported.hasLabelEingabe, 'Rendered diagram must contain label "Eingabe"');
    assert.ok(evalValue.supported.hasLabelVerarbeitung, 'Rendered diagram must contain label "Verarbeitung"');
    assert.ok(evalValue.supported.hasLabelAusgabe, 'Rendered diagram must contain label "Ausgabe"');
    assert.ok(evalValue.supported.hasEdgeMarkers, 'Rendered diagram must contain edge connectors/markers');

    // 3. Assert Unsupported Layout (ELK)
    assert.ok(evalValue.unsupported.hasSvg, 'Unsupported diagram must produce an output element');
    assert.strictEqual(
      evalValue.unsupported.ariaRoleDescription,
      'error',
      'Unsupported ELK layout must produce a controlled error diagram with aria-roledescription="error"'
    );
    assert.ok(evalValue.unsupported.isErrorDiagram, 'Unsupported layout must be classified as an error');
    assert.ok(evalValue.unsupported.didNotRenderFlowchart, 'Unsupported layout must NOT render a flowchart');
  });

  await t.test('6. Service Worker Compatibility Analysis', () => {
    const swPath = path.join(workspaceRoot, 'public', 'service-worker.js');
    assert.ok(fs.existsSync(swPath), 'public/service-worker.js must exist');
    const swContent = fs.readFileSync(swPath, 'utf8');

    // (a) Local Asset Fetch Compatibility: GET requests are intercepted
    assert.ok(
      swContent.includes('event.request.method !== "GET"') || swContent.includes("event.request.method !== 'GET'"),
      'Service worker only intercepts GET requests'
    );

    // (b) Cache Eligibility: Successful 200 OK responses are cached
    assert.ok(
      swContent.includes('response.status === 200'),
      'Service worker validates response status is 200 before caching'
    );
    assert.ok(
      swContent.includes('caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));'),
      'Service worker caches successful local runtime assets under CACHE_NAME'
    );

    // (c) Cache-Version Update Behavior: cache key versioning and cleanup
    assert.ok(
      swContent.includes('const CACHE_NAME = "bridgenta-portfolio-v21";') || swContent.includes("const CACHE_NAME = 'bridgenta-portfolio-v21';"),
      'Service worker declares explicit versioned cache name'
    );
    assert.ok(
      swContent.includes('caches.delete(key)'),
      'Service worker purges outdated caches during activation'
    );
  });
});
