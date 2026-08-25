const fs = require('fs');
const path = require('path');

// Constants
const DIST_DIR = path.join(__dirname, '../dist');
const PROJECTS_CONTENT_DIR = path.join(__dirname, '../src/content/projects');
const PORTFOLIO_CONFIG_PATH = path.join(__dirname, '../src/config/portfolio.json');

// Paths to check for leakage (BECC-REG-006 equivalent)
const PATH_LEAK_REGEX = /(?:[a-zA-Z]:[\\\/](?:users|antigravity|tmp|home|var|usr)|\b[a-z]:\\[a-z]|(?<![a-z0-9])[\\\/](?:usr|home|tmp|var)[\\\/][a-z])/i;

function loadConfig() {
  if (!fs.existsSync(PORTFOLIO_CONFIG_PATH)) {
    throw new Error(`SSoT config not found at: ${PORTFOLIO_CONFIG_PATH}`);
  }
  return JSON.parse(fs.readFileSync(PORTFOLIO_CONFIG_PATH, 'utf8'));
}

function getExistingProjectSlugs() {
  if (!fs.existsSync(PROJECTS_CONTENT_DIR)) {
    return [];
  }
  return fs.readdirSync(PROJECTS_CONTENT_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.basename(file, '.md'));
}

function verifyBuild(distDirOverride) {
  const targetDistDir = distDirOverride || DIST_DIR;
  const errors = [];
  const config = loadConfig();
  const activeSlugs = config.activeProjectSlugs;

  console.log(`\n========================================`);
  console.log(`Starting Public Build Verification Gating`);
  console.log(`Target Directory: ${targetDistDir}`);
  console.log(`========================================\n`);

  if (!fs.existsSync(targetDistDir)) {
    errors.push(`FAIL: dist/ directory does not exist at ${targetDistDir}. Run 'npm run build' first.`);
    return { success: false, errors };
  }

  // 1. Expected Static Routes
  const staticRoutes = [
    { file: 'index.html', route: '/' },
    { file: 'about/index.html', route: '/about' },
    { file: 'projects/index.html', route: '/projects' },
    { file: 'contact/index.html', route: '/contact' },
    { file: 'impressum/index.html', route: '/impressum' },
    { file: 'datenschutz/index.html', route: '/datenschutz' }
  ];

  staticRoutes.forEach(sr => {
    const fullPath = path.join(targetDistDir, sr.file);
    if (!fs.existsSync(fullPath)) {
      errors.push(`FAIL: EXPECTED_ROUTE_MISSING - route: ${sr.route} (expected file: ${sr.file})`);
    }
  });

  // 2. SSoT Active Projects Routes
  activeSlugs.forEach(slug => {
    const fileRelPath = `project-${slug}/index.html`;
    const fullPath = path.join(targetDistDir, fileRelPath);
    if (!fs.existsSync(fullPath)) {
      errors.push(`FAIL: EXPECTED_PROJECT_ROUTE_MISSING - project: ${slug} (expected file: ${fileRelPath})`);
    }
  });

  // 3. Excluded Project Routes
  const allExistingSlugs = getExistingProjectSlugs();
  const excludedSlugs = allExistingSlugs.filter(slug => !activeSlugs.includes(slug));

  console.log(`Active Projects (SSoT): ${activeSlugs.join(', ')}`);
  console.log(`Excluded Draft Projects: ${excludedSlugs.join(', ')}`);

  excludedSlugs.forEach(slug => {
    const fileRelPath = `project-${slug}/index.html`;
    const fullPath = path.join(targetDistDir, fileRelPath);
    if (fs.existsSync(fullPath)) {
      errors.push(`FAIL: EXCLUDED_PROJECT_ROUTE_GENERATED - project: ${slug} (found file: ${fileRelPath} but it must be excluded)`);
    }
  });

  // 4. HTML Static Verifications (SEO, Accessibility, Landmarks, Path Leaks)
  const filesToVerify = [];

  // Add static files
  staticRoutes.forEach(sr => {
    const fullPath = path.join(targetDistDir, sr.file);
    if (fs.existsSync(fullPath)) {
      filesToVerify.push({ path: fullPath, route: sr.route });
    }
  });

  // Add active project files
  activeSlugs.forEach(slug => {
    const fullPath = path.join(targetDistDir, `project-${slug}/index.html`);
    if (fs.existsSync(fullPath)) {
      filesToVerify.push({ path: fullPath, route: `/project-${slug}` });
    }
  });

  filesToVerify.forEach(item => {
    const content = fs.readFileSync(item.path, 'utf8');

    // --- Path Leakage Check ---
    const pathLeakMatch = content.match(PATH_LEAK_REGEX);
    if (pathLeakMatch) {
      errors.push(`FAIL: PATH_LEAK_DETECTED - file: ${item.route} contains absolute internal path snippet: '${pathLeakMatch[0]}'`);
    }

    // --- HTML Accessibility Landmarks ---
    // Check main landmark
    if (!content.includes('<main id="main">') && !content.includes('<main>')) {
      errors.push(`FAIL: ACCESSIBILITY_LANDMARK_MISSING - file: ${item.route} has no <main> or <main id="main"> landmark`);
    }
    // Check nav landmark
    if (!/<nav/i.test(content)) {
      errors.push(`FAIL: ACCESSIBILITY_LANDMARK_MISSING - file: ${item.route} has no <nav> landmark`);
    }
    // Check footer landmark
    if (!/<footer/i.test(content)) {
      errors.push(`FAIL: ACCESSIBILITY_LANDMARK_MISSING - file: ${item.route} has no <footer> landmark`);
    }
    // Check skip link
    if (!content.includes('href="#main"') && item.route !== '/impressum' && item.route !== '/datenschutz') {
      errors.push(`FAIL: SKIP_LINK_MISSING - file: ${item.route} has no skip link referencing '#main'`);
    }
    // Check html lang
    if (!/<html[^>]*lang=["']\w+["']/i.test(content)) {
      errors.push(`FAIL: HTML_LANG_ATTRIBUTE_MISSING - file: ${item.route} has no html lang attribute`);
    }

    // --- SEO Essentials ---
    // Check non-empty title tag
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      errors.push(`FAIL: SEO_TITLE_MISSING - file: ${item.route} has no non-empty <title> tag`);
    }

    // Check meta description
    const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      content.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (!descMatch || !descMatch[1].trim()) {
      errors.push(`FAIL: SEO_DESCRIPTION_MISSING - file: ${item.route} has no non-empty meta description`);
    }

    // Check canonical link tag
    const canonicalMatches = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/gi) || [];
    if (canonicalMatches.length === 0) {
      errors.push(`FAIL: SEO_CANONICAL_LINK_MISSING - file: ${item.route} has no canonical link tag`);
    } else if (canonicalMatches.length > 1) {
      errors.push(`FAIL: SEO_DUPLICATE_CANONICAL_LINK - file: ${item.route} has ${canonicalMatches.length} canonical link tags`);
    } else {
      // Validate expected canonical URL value
      const expectedPath = item.route === '/' ? '' : item.route;
      const expectedCanonical = `https://bridgenta.de${expectedPath}`;
      const canonicalHrefMatch = canonicalMatches[0].match(/href=["']([^"']+)["']/i);
      if (canonicalHrefMatch && canonicalHrefMatch[1] !== expectedCanonical) {
        errors.push(`FAIL: SEO_CANONICAL_LINK_MISMATCH - file: ${item.route} expected canonical: '${expectedCanonical}', got: '${canonicalHrefMatch[1]}'`);
      }
    }
  });

  // 5. Sitemap Route Alignment Check
  const sitemapPath = path.join(targetDistDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const locMatches = sitemapContent.match(/<loc>([^<]+)<\/loc>/g) || [];
    const sitemapUrls = locMatches.map(m => m.replace(/<\/?loc>/g, '').trim());

    // Check sitemap contains exact set of active projects
    activeSlugs.forEach(slug => {
      const expectedUrl = `https://bridgenta.de/project-${slug}`;
      if (!sitemapUrls.includes(expectedUrl)) {
        errors.push(`FAIL: SITEMAP_ROUTE_MISMATCH - sitemap.xml is missing expected active project: ${expectedUrl}`);
      }
    });

    // Check sitemap does NOT contain any excluded projects
    excludedSlugs.forEach(slug => {
      const unexpectedUrl = `https://bridgenta.de/project-${slug}`;
      if (sitemapUrls.includes(unexpectedUrl)) {
        errors.push(`FAIL: SITEMAP_EXCLUDED_ROUTE_PRESENT - sitemap.xml contains excluded draft project: ${unexpectedUrl}`);
      }
    });

    console.log(`Verified sitemap.xml alignment against SSoT. Checked ${sitemapUrls.length} URLs.`);
  } else {
    errors.push(`FAIL: SITEMAP_XML_MISSING - sitemap.xml does not exist at ${sitemapPath}`);
  }

  // Summary and Exit code reporting
  console.log(`\n========================================`);
  if (errors.length === 0) {
    console.log(`PASSED: Public Build Verification Gate Successful.`);
    console.log(`========================================\n`);
    return { success: true, errors: [] };
  } else {
    console.log(`FAILED: Public Build Verification Gate Failed with ${errors.length} error(s):`);
    errors.forEach(err => console.error(`  - ${err}`));
    console.log(`========================================\n`);
    return { success: false, errors };
  }
}

// Run CLI execution if not imported directly by tests
if (require.main === module) {
  const result = verifyBuild();
  if (!result.success) {
    process.exit(1);
  }
  process.exit(0);
}

module.exports = {
  verifyBuild,
  PATH_LEAK_REGEX
};
