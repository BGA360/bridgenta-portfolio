#!/usr/bin/env node
/**
 * BGDE-005C-PRIV-IMPLEMENT-006
 * Deterministic, isolated STRATO Hosting Basic production build, sanitization,
 * release-gate verification, and SHA-256 manifest generator for https://bridgenta.de/.
 *
 * Does NOT modify existing staging tooling or staging artifacts.
 * Does NOT upload anything to STRATO.
 *
 * Usage:
 *   node tooling/package_strato_production.mjs [--out-base <dir>] [--with-sw-retirement] [--allow-placeholders-for-local-validation]
 *   node tooling/package_strato_production.mjs --verify-only [--out-base <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const DEFAULT_PROD_SITE_URL = 'https://bridgenta.de';

const ALWAYS_EXCLUDED_EXACT_PATHS = new Set([
  '.htpasswd',
  '_redirects',
  'offline.html',
  'uploads/FDPP-001.png',
]);

const ALWAYS_EXCLUDED_PREFIXES = [
  'admin/',
  'uploads/',
  'lernen/preview/',
];

function isForbiddenPath(relPosix, { includeSwRetirement }) {
  const segments = relPosix.split('/');
  const baseName = segments[segments.length - 1];
  const baseLower = baseName.toLowerCase();

  if (ALWAYS_EXCLUDED_EXACT_PATHS.has(relPosix)) {
    return `excluded exact path: ${relPosix}`;
  }
  if (!includeSwRetirement && relPosix === 'service-worker.js') {
    return 'service-worker.js excluded outside approved SW retirement transition profile';
  }
  for (const prefix of ALWAYS_EXCLUDED_PREFIXES) {
    if (relPosix.startsWith(prefix)) return `excluded directory prefix: ${prefix}`;
  }
  if (baseLower === '.htpasswd') {
    return `forbidden Apache auth credential file: ${relPosix}`;
  }
  if (baseLower === '.htaccess' && relPosix !== '.htaccess') {
    return `unexpected nested .htaccess file: ${relPosix}`;
  }
  if (baseLower === '.env' || baseLower.startsWith('.env.')) {
    return `forbidden environment file: ${relPosix}`;
  }
  if (
    baseLower.endsWith('.key') ||
    baseLower.endsWith('.pem') ||
    baseLower.endsWith('.p12') ||
    baseLower.endsWith('.pfx')
  ) {
    return `forbidden credential/key file: ${relPosix}`;
  }
  if (baseLower.endsWith('.map')) {
    return `forbidden source map: ${relPosix}`;
  }
  if (baseLower === '.ds_store' || baseLower === 'thumbs.db') {
    return `forbidden OS metadata file: ${relPosix}`;
  }
  // Allow only root .htaccess as dotfile
  if (segments.some((seg) => seg.startsWith('.')) && relPosix !== '.htaccess') {
    return `unexpected dotfile/dotdir: ${relPosix}`;
  }
  return null;
}

function parseArgs(argv) {
  let verifyOnly = false;
  let withSwRetirement = false;
  let allowPlaceholdersForLocalValidation = false;
  let outBase = path.join(REPO_ROOT, 'scratch', 'strato-production-006');
  let siteUrl = (process.env.PUBLIC_SITE_URL || DEFAULT_PROD_SITE_URL).replace(/\/+$/, '');

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--verify-only') {
      verifyOnly = true;
    } else if (arg === '--with-sw-retirement') {
      withSwRetirement = true;
    } else if (arg === '--allow-placeholders-for-local-validation') {
      allowPlaceholdersForLocalValidation = true;
    } else if (arg === '--out-base' && argv[i + 1]) {
      outBase = path.resolve(REPO_ROOT, argv[++i]);
    } else if (arg === '--site-url' && argv[i + 1]) {
      siteUrl = argv[++i].replace(/\/+$/, '');
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return {
    verifyOnly,
    withSwRetirement,
    allowPlaceholdersForLocalValidation,
    outBase,
    siteUrl,
  };
}

function walkFiles(dir, baseDir = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, baseDir));
    } else if (entry.isFile()) {
      const relPosix = path.relative(baseDir, full).split(path.sep).join('/');
      results.push({ full, relPosix });
    }
  }
  results.sort((a, b) => (a.relPosix < b.relPosix ? -1 : a.relPosix > b.relPosix ? 1 : 0));
  return results;
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function sha256String(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

function runCmd(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function getGitMetadata() {
  const currentBranch = runCmd('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const currentCommit = runCmd('git', ['rev-parse', 'HEAD']);
  const statusRaw = execFileSync('git', ['status', '--porcelain'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const statusLines = statusRaw.split(/\r?\n/).filter((l) => l.length > 0);
  const modifiedFiles = statusLines
    .filter((l) => !l.startsWith('??'))
    .map((l) => l.slice(3).trim())
    .sort();
  const untrackedFiles = statusLines
    .filter((l) => l.startsWith('??'))
    .map((l) => l.slice(3).trim())
    .sort();

  return {
    repository: 'BGA360/bridgenta-portfolio',
    currentBranch,
    currentCommit,
    workingTreeModifiedFiles: modifiedFiles,
    workingTreeUntrackedFiles: untrackedFiles,
  };
}

function buildProduction(rawDistDir, siteUrl) {
  fs.rmSync(rawDistDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(rawDistDir), { recursive: true });
  const astroBin = path.join(REPO_ROOT, 'node_modules', 'astro', 'astro.js');
  if (!fs.existsSync(astroBin)) {
    throw new Error(`Astro CLI not found at ${astroBin}`);
  }
  const relOutDir = path.relative(REPO_ROOT, rawDistDir).split(path.sep).join('/');
  console.log(`[prod-build] Building Astro production output (${siteUrl}) into ${relOutDir} ...`);
  execFileSync(process.execPath, [astroBin, 'build'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      PUBLIC_SITE_URL: siteUrl,
      PUBLIC_ROBOTS_NOINDEX: 'false',
      PUBLIC_EXCLUDE_SITEMAP: 'false',
      PUBLIC_DISABLE_SW: 'true',
      ASTRO_OUT_DIR: relOutDir,
    },
  });
}

function packageWebroot(rawDistDir, webrootDir, { withSwRetirement }) {
  fs.rmSync(webrootDir, { recursive: true, force: true });
  fs.mkdirSync(webrootDir, { recursive: true });

  const rawFiles = walkFiles(rawDistDir);
  const excludedRecords = [];

  for (const { full, relPosix } of rawFiles) {
    const reason = isForbiddenPath(relPosix, { includeSwRetirement: withSwRetirement });
    if (reason) {
      excludedRecords.push({ path: relPosix, reason });
      continue;
    }
    const dest = path.join(webrootDir, ...relPosix.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(full, dest);
  }

  return excludedRecords;
}

function verifyWebroot(
  webrootDir,
  siteUrl,
  { withSwRetirement, allowPlaceholdersForLocalValidation = false }
) {
  const files = walkFiles(webrootDir);
  const exactSet = new Set(files.map((f) => '/' + f.relPosix));
  const lowerMap = new Map(files.map((f) => ['/' + f.relPosix.toLowerCase(), '/' + f.relPosix]));
  const errors = [];
  const placeholderFindings = [];

  // 1. Forbidden-file rejection gate
  for (const { relPosix } of files) {
    const reason = isForbiddenPath(relPosix, { includeSwRetirement: withSwRetirement });
    if (reason) {
      errors.push(`FORBIDDEN_FILE: ${relPosix} (${reason})`);
    }
  }

  // 2. Required production routes
  const requiredRoutes = [
    'index.html',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    '.htaccess',
    'favicon.svg',
    'about/index.html',
    'contact/index.html',
    'datenschutz/index.html',
    'impressum/index.html',
    'projects/index.html',
    'project-aeocortex/index.html',
    'project-becc/index.html',
    'project-bridgenta/index.html',
    'project-luminapraxisds/index.html',
    'project-rootedrealitygarden/index.html',
    'project-starcleaners/index.html',
    'lernen/index.html',
    'lernen/themen/ai-entwicklung/index.html',
    'lernen/themen/ki-agenten/index.html',
    'lernen/themen/softwarearchitektur/index.html',
    'lernen/themen/testen-verifizieren/index.html',
  ];
  if (withSwRetirement) {
    requiredRoutes.push('service-worker.js');
  }
  for (const route of requiredRoutes) {
    if (!exactSet.has('/' + route)) {
      errors.push(`MISSING_REQUIRED_ROUTE: ${route}`);
    }
  }

  // 3. Production robots.txt check
  const robotsPath = path.join(webrootDir, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    if (!/Allow:\s*\//i.test(robots)) {
      errors.push('INVALID_ROBOTS_TXT: production robots.txt must Allow: /');
    }
    if (/Disallow:\s*\/\s*$/m.test(robots)) {
      errors.push('INVALID_ROBOTS_TXT: production robots.txt must NOT Disallow: /');
    }
    if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
      errors.push(`INVALID_ROBOTS_TXT: missing Sitemap: ${siteUrl}/sitemap.xml`);
    }
  }

  // 4. Production sitemap.xml check
  const sitemapPath = path.join(webrootDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    if (!sitemap.includes(`<loc>${siteUrl}/</loc>`)) {
      errors.push(`INVALID_SITEMAP_XML: missing root <loc>${siteUrl}/</loc>`);
    }
    if (/bridgenta\.com/i.test(sitemap)) {
      errors.push('STAGING_DOMAIN_LEAK_SITEMAP: bridgenta.com found in sitemap.xml');
    }
  }

  // 5. Production .htaccess check (must NOT contain staging Basic Auth)
  const htaccessPath = path.join(webrootDir, '.htaccess');
  if (fs.existsSync(htaccessPath)) {
    const htaccess = fs.readFileSync(htaccessPath, 'utf8');
    if (/AuthType\s+Basic|AuthUserFile|\.htpasswd/i.test(htaccess)) {
      errors.push('STAGING_AUTH_IN_PROD_HTACCESS: production .htaccess must not contain Basic Auth directives');
    }
    if (withSwRetirement && !/service-worker\.js/i.test(htaccess)) {
      errors.push('MISSING_SW_NO_CACHE_HEADER: production .htaccess must set no-cache headers for service-worker.js');
    }
  }

  // 6. Service Worker retirement file check (only when --with-sw-retirement is enabled)
  if (withSwRetirement) {
    const swPath = path.join(webrootDir, 'service-worker.js');
    if (fs.existsSync(swPath)) {
      const sw = fs.readFileSync(swPath, 'utf8');
      if (/addEventListener\s*\(\s*['"]fetch['"]/i.test(sw)) {
        errors.push('INVALID_RETIREMENT_SW: retirement service-worker.js must NOT attach a fetch handler');
      }
      if (/caches\.open\s*\(/i.test(sw)) {
        errors.push('INVALID_RETIREMENT_SW: retirement service-worker.js must NOT call caches.open()');
      }
      if (!sw.includes('bridgenta-portfolio-') || !sw.includes('unregister')) {
        errors.push('INVALID_RETIREMENT_SW: retirement service-worker.js must scope cleanup to bridgenta-portfolio- and call unregister()');
      }
    }
  }

  // 7. Inspect HTML, JS, CSS files
  let htmlCount = 0;
  for (const { full, relPosix } of files) {
    if (relPosix.endsWith('.html')) {
      htmlCount++;
      const html = fs.readFileSync(full, 'utf8');

      const isNonLayoutHtml = relPosix === '404.html' || relPosix === 'google9f0efa0116a68770.html';

      // Public pages must NOT carry staging noindex, nofollow (404.html may be noindex)
      if (!isNonLayoutHtml && /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/?>/i.test(html)) {
        errors.push(`UNEXPECTED_STAGING_NOINDEX: ${relPosix}`);
      }
      // Sitemap link must be present on standard layout pages
      if (!isNonLayoutHtml && !/<link[^>]+rel="sitemap"/i.test(html)) {
        errors.push(`MISSING_SITEMAP_LINK: ${relPosix}`);
      }
      // No staging domain leak
      if (/bridgenta\.com/i.test(html)) {
        errors.push(`STAGING_DOMAIN_LEAK_HTML: ${relPosix}`);
      }
      // Canonical URL must point to production siteUrl
      const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
      if (!isNonLayoutHtml) {
        if (!canonicalMatch || !canonicalMatch[1].startsWith(`${siteUrl}/`)) {
          errors.push(`INVALID_CANONICAL_URL: ${relPosix} -> ${canonicalMatch ? canonicalMatch[1] : 'missing'}`);
        }
      }
      // No active serviceWorker.register calls in HTML
      if (/serviceWorker\.register/i.test(html)) {
        errors.push(`UNEXPECTED_SW_REGISTRATION_HTML: ${relPosix}`);
      }
      // No Frankfurt/Hessen legacy geo tags
      if (/Frankfurt am Main|DE-HE|50\.1109/i.test(html)) {
        errors.push(`LEGACY_GEO_METADATA_LEAK: ${relPosix}`);
      }

      // Mandatory legal placeholder rejection gate
      if (relPosix === 'datenschutz/index.html' || relPosix === 'impressum/index.html') {
        const matches = html.match(/\[OWNER_REQUIRED:[^\]]+\]/g);
        if (matches && matches.length > 0) {
          for (const m of matches) {
            placeholderFindings.push(`${relPosix}: ${m}`);
          }
          if (!allowPlaceholdersForLocalValidation) {
            errors.push(`UNRESOLVED_LEGAL_PLACEHOLDER: ${relPosix} contains ${matches.length} unresolved mandatory field(s)`);
          }
        }
      }

      // Exact-case local href/src check
      const attrRegex = /(?:href|src)="([^"]+)"/gi;
      let m;
      while ((m = attrRegex.exec(html)) !== null) {
        const u = m[1];
        if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(u)) continue;
        const clean = u.split(/[?#]/)[0];
        if (!clean.startsWith('/')) continue;
        const candidates = clean.endsWith('/')
          ? [clean + 'index.html']
          : [clean, clean + '/index.html'];
        const foundExact = candidates.some((c) => exactSet.has(c));
        if (!foundExact) {
          const foundCI = candidates.some((c) => lowerMap.has(c.toLowerCase()));
          errors.push(
            foundCI
              ? `CASE_MISMATCH: ${relPosix} -> ${u}`
              : `BROKEN_LOCAL_REF: ${relPosix} -> ${u}`
          );
        }
      }
    } else if (relPosix.endsWith('.js') && relPosix !== 'service-worker.js') {
      const js = fs.readFileSync(full, 'utf8');
      if (/serviceWorker\.register/i.test(js)) {
        errors.push(`UNEXPECTED_SW_REGISTRATION_JS: ${relPosix}`);
      }
    } else if (relPosix.endsWith('.css')) {
      const css = fs.readFileSync(full, 'utf8');
      const urlRegex = /url\(["']?([^)"']+)["']?\)/gi;
      let m;
      while ((m = urlRegex.exec(css)) !== null) {
        const u = m[1];
        if (/^(https?:|data:)/i.test(u)) continue;
        const clean = u.split(/[?#]/)[0];
        if (!clean.startsWith('/')) continue;
        if (!exactSet.has(clean)) {
          errors.push(`BROKEN_CSS_URL: ${relPosix} -> ${u}`);
        }
      }
    }
  }

  return {
    passed: errors.length === 0,
    releasable: errors.length === 0 && placeholderFindings.length === 0,
    htmlCount,
    fileCount: files.length,
    placeholderFindings,
    errors,
  };
}

function buildManifest(webrootDir, excludedRecords, verification, siteUrl, { withSwRetirement }) {
  const files = walkFiles(webrootDir);
  const pkgJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  const npmVersion =
    process.platform === 'win32'
      ? runCmd('cmd.exe', ['/d', '/s', '/c', 'npm --version'])
      : runCmd('npm', ['--version']);

  let totalBytes = 0;
  const inventory = files.map(({ full, relPosix }) => {
    const stat = fs.statSync(full);
    const sha256 = sha256File(full);
    totalBytes += stat.size;
    return {
      path: relPosix,
      bytes: stat.size,
      sha256,
    };
  });

  const digestInput = inventory.map((f) => `${f.path}:${f.bytes}:${f.sha256}`).join('\n');
  const packageRootSha256 = sha256String(digestInput);

  return {
    schemaVersion: '1.0.0',
    milestone: 'BGDE-005C-PRIV-IMPLEMENT-006',
    buildTimestampUtc: new Date().toISOString(),
    target: {
      provider: 'STRATO Hosting Basic',
      domain: siteUrl,
      environment: 'production',
      swRetirementProfile: withSwRetirement ? 'transition-retirement-enabled' : 'post-retirement-no-sw',
    },
    source: getGitMetadata(),
    buildConfig: {
      PUBLIC_SITE_URL: siteUrl,
      PUBLIC_ROBOTS_NOINDEX: 'false',
      PUBLIC_EXCLUDE_SITEMAP: 'false',
      PUBLIC_DISABLE_SW: 'true',
      withSwRetirement,
      nodeVersion: process.version,
      npmVersion,
      astroVersionSpec: pkgJson.dependencies?.astro || 'unknown',
    },
    releaseEligibility: {
      releasable: verification.releasable,
      unresolvedLegalPlaceholders: verification.placeholderFindings,
    },
    exclusionsApplied: excludedRecords,
    verificationSummary: {
      passed: verification.passed,
      htmlCount: verification.htmlCount,
      errorCount: verification.errors.length,
    },
    packageSummary: {
      fileCount: inventory.length,
      totalBytes,
      packageRootSha256,
    },
    files: inventory,
  };
}

function verifyAgainstManifest(webrootDir, manifestPath, { allowPlaceholdersForLocalValidation = false }) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const actualFiles = walkFiles(webrootDir);
  const errors = [];

  const manifestMap = new Map(manifest.files.map((f) => [f.path, f]));
  const actualMap = new Map(actualFiles.map((f) => [f.relPosix, f.full]));

  for (const [relPath, entry] of manifestMap.entries()) {
    if (!actualMap.has(relPath)) {
      errors.push(`MISSING_FROM_WEBROOT: ${relPath}`);
      continue;
    }
    const full = actualMap.get(relPath);
    const stat = fs.statSync(full);
    const actualHash = sha256File(full);
    if (stat.size !== entry.bytes) {
      errors.push(`SIZE_MISMATCH: ${relPath} (expected ${entry.bytes}, got ${stat.size})`);
    }
    if (actualHash !== entry.sha256) {
      errors.push(`HASH_MISMATCH: ${relPath} (expected ${entry.sha256}, got ${actualHash})`);
    }
  }

  for (const relPath of actualMap.keys()) {
    if (!manifestMap.has(relPath)) {
      errors.push(`UNEXPECTED_FILE_IN_WEBROOT: ${relPath}`);
    }
  }

  const digestInput = manifest.files.map((f) => `${f.path}:${f.bytes}:${f.sha256}`).join('\n');
  const recomputedRoot = sha256String(digestInput);
  if (recomputedRoot !== manifest.packageSummary.packageRootSha256) {
    errors.push(
      `ROOT_DIGEST_MISMATCH: expected ${manifest.packageSummary.packageRootSha256}, got ${recomputedRoot}`
    );
  }

  const expectedSiteUrl = manifest.buildConfig?.PUBLIC_SITE_URL || DEFAULT_PROD_SITE_URL;
  const withSwRetirement = Boolean(manifest.buildConfig?.withSwRetirement);
  const webrootVerification = verifyWebroot(webrootDir, expectedSiteUrl, {
    withSwRetirement,
    allowPlaceholdersForLocalValidation,
  });
  errors.push(...webrootVerification.errors);

  if (errors.length > 0) {
    console.error(`[prod-verify] FAILED with ${errors.length} error(s):`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `[prod-verify] PASS (releasable=${webrootVerification.releasable}): ${manifest.packageSummary.fileCount} files (${manifest.packageSummary.totalBytes} bytes), root SHA-256 = ${manifest.packageSummary.packageRootSha256}`
  );
}

function main() {
  const {
    verifyOnly,
    withSwRetirement,
    allowPlaceholdersForLocalValidation,
    outBase,
    siteUrl,
  } = parseArgs(process.argv);

  const rawDistDir = path.join(outBase, 'raw-dist');
  const webrootDir = path.join(outBase, 'webroot');
  const manifestPath = path.join(outBase, 'production-artifact-manifest.json');

  if (verifyOnly) {
    verifyAgainstManifest(webrootDir, manifestPath, { allowPlaceholdersForLocalValidation });
    return;
  }

  buildProduction(rawDistDir, siteUrl);
  const excludedRecords = packageWebroot(rawDistDir, webrootDir, { withSwRetirement });
  const verification = verifyWebroot(webrootDir, siteUrl, {
    withSwRetirement,
    allowPlaceholdersForLocalValidation,
  });

  if (!verification.passed) {
    console.error(`[prod-package] FAILED verification with ${verification.errors.length} error(s):`);
    for (const err of verification.errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  const manifest = buildManifest(webrootDir, excludedRecords, verification, siteUrl, {
    withSwRetirement,
  });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`[prod-package] Wrote manifest outside webroot: ${path.relative(REPO_ROOT, manifestPath)}`);

  verifyAgainstManifest(webrootDir, manifestPath, { allowPlaceholdersForLocalValidation });
}

main();
