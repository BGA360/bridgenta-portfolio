const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { verifyBuild } = require('../verify_public_build.cjs');

const TEMP_FIXTURE_DIR = path.join(__dirname, 'temp_fixtures');

function cleanup() {
  if (fs.existsSync(TEMP_FIXTURE_DIR)) {
    fs.rmSync(TEMP_FIXTURE_DIR, { recursive: true, force: true });
  }
}

function setupMockDist(filesMap) {
  cleanup();
  fs.mkdirSync(TEMP_FIXTURE_DIR, { recursive: true });
  
  Object.keys(filesMap).forEach(fileRelPath => {
    const fullPath = path.join(TEMP_FIXTURE_DIR, fileRelPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, filesMap[fileRelPath], 'utf8');
  });
}

const VALID_HTML_CONTENT = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Valid Title</title>
  <meta name="description" content="Valid meta description for SEO purposes.">
  <link rel="canonical" href="https://bridgenta.de" />
</head>
<body>
  <a class="skip-link" href="#main">Zum Inhalt springen</a>
  <nav>Navigation</nav>
  <main id="main">Main content area</main>
  <footer>Footer content</footer>
</body>
</html>
`;

test.afterEach(() => {
  cleanup();
});

test('verifyBuild succeeds on completely valid build output', () => {
  setupMockDist({
    'index.html': VALID_HTML_CONTENT,
    'about/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/about'),
    'projects/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/projects'),
    'contact/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/contact'),
    'impressum/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/impressum'),
    'datenschutz/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/datenschutz'),
    'project-bridgenta/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/project-bridgenta'),
    'project-aeocortex/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/project-aeocortex'),
    'project-luminapraxisds/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/project-luminapraxisds'),
    'project-rootedrealitygarden/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/project-rootedrealitygarden'),
    'project-starcleaners/index.html': VALID_HTML_CONTENT.replace('https://bridgenta.de', 'https://bridgenta.de/project-starcleaners'),
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://bridgenta.de</loc></url>
  <url><loc>https://bridgenta.de/about</loc></url>
  <url><loc>https://bridgenta.de/projects</loc></url>
  <url><loc>https://bridgenta.de/contact</loc></url>
  <url><loc>https://bridgenta.de/impressum</loc></url>
  <url><loc>https://bridgenta.de/datenschutz</loc></url>
  <url><loc>https://bridgenta.de/project-bridgenta</loc></url>
  <url><loc>https://bridgenta.de/project-aeocortex</loc></url>
  <url><loc>https://bridgenta.de/project-luminapraxisds</loc></url>
  <url><loc>https://bridgenta.de/project-rootedrealitygarden</loc></url>
  <url><loc>https://bridgenta.de/project-starcleaners</loc></url>
</urlset>`
  });

  const result = verifyBuild(TEMP_FIXTURE_DIR);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.errors.length, 0);
});

test('verifyBuild fails if an expected route is missing', () => {
  setupMockDist({
    'index.html': VALID_HTML_CONTENT,
    // missing about/index.html
    'sitemap.xml': `<urlset><url><loc>https://bridgenta.de</loc></url></urlset>`
  });

  const result = verifyBuild(TEMP_FIXTURE_DIR);
  assert.strictEqual(result.success, false);
  const hasMissingRouteError = result.errors.some(err => err.includes('EXPECTED_ROUTE_MISSING') && err.includes('/about'));
  assert.strictEqual(hasMissingRouteError, true);
});

test('verifyBuild fails if an excluded draft project route is generated', () => {
  setupMockDist({
    'index.html': VALID_HTML_CONTENT,
    'about/index.html': VALID_HTML_CONTENT,
    'projects/index.html': VALID_HTML_CONTENT,
    'contact/index.html': VALID_HTML_CONTENT,
    'impressum/index.html': VALID_HTML_CONTENT,
    'datenschutz/index.html': VALID_HTML_CONTENT,
    'project-bridgenta/index.html': VALID_HTML_CONTENT,
    'project-aeocortex/index.html': VALID_HTML_CONTENT,
    'project-luminapraxisds/index.html': VALID_HTML_CONTENT,
    'project-rootedrealitygarden/index.html': VALID_HTML_CONTENT,
    'project-starcleaners/index.html': VALID_HTML_CONTENT,
    // builddaddy should be excluded but exists:
    'project-builddaddy/index.html': VALID_HTML_CONTENT,
    'sitemap.xml': `<urlset></urlset>`
  });

  const result = verifyBuild(TEMP_FIXTURE_DIR);
  assert.strictEqual(result.success, false);
  const hasExcludedRouteError = result.errors.some(err => err.includes('EXCLUDED_PROJECT_ROUTE_GENERATED') && err.includes('builddaddy'));
  assert.strictEqual(hasExcludedRouteError, true);
});

test('verifyBuild fails if a local absolute path leakage is detected', () => {
  const leakedContent = VALID_HTML_CONTENT.replace('Main content area', 'System workspace C:\\Users\\cstfd\\project files');
  setupMockDist({
    'index.html': leakedContent,
    'sitemap.xml': `<urlset></urlset>`
  });

  const result = verifyBuild(TEMP_FIXTURE_DIR);
  assert.strictEqual(result.success, false);
  const hasLeakError = result.errors.some(err => err.includes('PATH_LEAK_DETECTED') && err.includes('C:\\Users'));
  assert.strictEqual(hasLeakError, true);
});

test('verifyBuild fails if canonical url is missing or mismatches', () => {
  const badCanonicalContent = VALID_HTML_CONTENT.replace('<link rel="canonical" href="https://bridgenta.de" />', '<link rel="canonical" href="https://badurl.de/project-bridgenta" />');
  setupMockDist({
    'index.html': badCanonicalContent,
    'sitemap.xml': `<urlset></urlset>`
  });

  const result = verifyBuild(TEMP_FIXTURE_DIR);
  assert.strictEqual(result.success, false);
  const hasMismatchError = result.errors.some(err => err.includes('SEO_CANONICAL_LINK_MISMATCH'));
  assert.strictEqual(hasMismatchError, true);
});

test('verifyBuild fails if active project is missing from sitemap.xml', () => {
  setupMockDist({
    'index.html': VALID_HTML_CONTENT,
    'about/index.html': VALID_HTML_CONTENT,
    'projects/index.html': VALID_HTML_CONTENT,
    'contact/index.html': VALID_HTML_CONTENT,
    'impressum/index.html': VALID_HTML_CONTENT,
    'datenschutz/index.html': VALID_HTML_CONTENT,
    'project-bridgenta/index.html': VALID_HTML_CONTENT,
    'project-aeocortex/index.html': VALID_HTML_CONTENT,
    'project-luminapraxisds/index.html': VALID_HTML_CONTENT,
    'project-rootedrealitygarden/index.html': VALID_HTML_CONTENT,
    'project-starcleaners/index.html': VALID_HTML_CONTENT,
    // sitemap missing project-starcleaners:
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://bridgenta.de/project-bridgenta</loc></url>
  <url><loc>https://bridgenta.de/project-aeocortex</loc></url>
  <url><loc>https://bridgenta.de/project-luminapraxisds</loc></url>
  <url><loc>https://bridgenta.de/project-rootedrealitygarden</loc></url>
</urlset>`
  });

  const result = verifyBuild(TEMP_FIXTURE_DIR);
  assert.strictEqual(result.success, false);
  const hasSitemapMismatchError = result.errors.some(err => err.includes('SITEMAP_ROUTE_MISMATCH') && err.includes('project-starcleaners'));
  assert.strictEqual(hasSitemapMismatchError, true);
});
