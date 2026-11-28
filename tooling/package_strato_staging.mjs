#!/usr/bin/env node
/**
 * BGDE-STRATO-STAGING-ARTIFACT-BUILD-004
 * Deterministic, isolated staging build, sanitization, verification, and manifest generator
 * for STRATO Hosting Basic protected staging (https://bridgenta.com/ -> /bga/staging).
 *
 * Usage:
 *   node tooling/package_strato_staging.mjs [--out-base <dir>]
 *   node tooling/package_strato_staging.mjs --verify-only [--out-base <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const APPROVED_SOURCE_BRANCH = 'integration/public-trust-and-privacy-001';
const APPROVED_BASELINE_COMMIT = '61521b542f8bbeb84d756a5fb0176ef76b8616b6';
const DEFAULT_STAGING_SITE_URL = 'https://bridgenta.com';
const STAGING_ROBOTS_TXT = 'User-agent: *\nDisallow: /\n';

const EXCLUDED_EXACT_PATHS = new Set([
  '.htaccess',
  '.htpasswd',
  '_redirects',
  'google9f0efa0116a68770.html',
  'service-worker.js',
  'sitemap.xml',
  'offline.html',
  'uploads/FDPP-001.png',
]);

const EXCLUDED_PREFIXES = [
  'admin/',
  'uploads/',
  'lernen/preview/',
];

function isForbiddenPath(relPosix) {
  const lower = relPosix.toLowerCase();
  const segments = relPosix.split('/');
  const baseName = segments[segments.length - 1];
  const baseLower = baseName.toLowerCase();

  if (EXCLUDED_EXACT_PATHS.has(relPosix)) return `excluded exact path: ${relPosix}`;
  for (const prefix of EXCLUDED_PREFIXES) {
    if (relPosix.startsWith(prefix)) return `excluded directory prefix: ${prefix}`;
  }
  if (baseLower === '.htaccess' || baseLower === '.htpasswd') {
    return `forbidden Apache auth/config dotfile: ${relPosix}`;
  }
  if (baseLower === '.env' || baseLower.startsWith('.env.')) {
    return `forbidden environment file: ${relPosix}`;
  }
  if (baseLower.endsWith('.key') || baseLower.endsWith('.pem') || baseLower.endsWith('.p12') || baseLower.endsWith('.pfx')) {
    return `forbidden credential/key file: ${relPosix}`;
  }
  if (baseLower.endsWith('.map')) {
    return `forbidden source map: ${relPosix}`;
  }
  if (baseLower === '.ds_store' || baseLower === 'thumbs.db') {
    return `forbidden OS metadata file: ${relPosix}`;
  }
  if (segments.some((seg) => seg.startsWith('.'))) {
    return `unexpected dotfile/dotdir: ${relPosix}`;
  }
  return null;
}

function parseArgs(argv) {
  let verifyOnly = false;
  let outBase = path.join(REPO_ROOT, 'scratch', 'strato-staging-004');
  let siteUrl = (process.env.PUBLIC_SITE_URL || DEFAULT_STAGING_SITE_URL).replace(/\/+$/, '');
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--verify-only') {
      verifyOnly = true;
    } else if (arg === '--out-base' && argv[i + 1]) {
      outBase = path.resolve(REPO_ROOT, argv[++i]);
    } else if (arg === '--site-url' && argv[i + 1]) {
      siteUrl = argv[++i].replace(/\/+$/, '');
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return { verifyOnly, outBase, siteUrl };
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
  let baselineIsAncestor = false;
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', APPROVED_BASELINE_COMMIT, 'HEAD'], {
      cwd: REPO_ROOT,
      stdio: 'ignore',
    });
    baselineIsAncestor = true;
  } catch {
    baselineIsAncestor = false;
  }
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
    approvedSourceBranch: APPROVED_SOURCE_BRANCH,
    approvedBaselineCommit: APPROVED_BASELINE_COMMIT,
    baselineIsAncestor,
    currentBranch,
    currentCommit,
    workingTreeModifiedFiles: modifiedFiles,
    workingTreeUntrackedFiles: untrackedFiles,
  };
}

function buildStaging(rawDistDir, siteUrl) {
  fs.rmSync(rawDistDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(rawDistDir), { recursive: true });
  const astroBin = path.join(REPO_ROOT, 'node_modules', 'astro', 'astro.js');
  if (!fs.existsSync(astroBin)) {
    throw new Error(`Astro CLI not found at ${astroBin}`);
  }
  const relOutDir = path.relative(REPO_ROOT, rawDistDir).split(path.sep).join('/');
  console.log(`[staging-build] Building Astro static output (${siteUrl}) into ${relOutDir} ...`);
  execFileSync(process.execPath, [astroBin, 'build'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      PUBLIC_SITE_URL: siteUrl,
      PUBLIC_ROBOTS_NOINDEX: 'true',
      PUBLIC_EXCLUDE_SITEMAP: 'true',
      PUBLIC_DISABLE_SW: 'true',
      ASTRO_OUT_DIR: relOutDir,
    },
  });
}

function packageWebroot(rawDistDir, webrootDir) {
  fs.rmSync(webrootDir, { recursive: true, force: true });
  fs.mkdirSync(webrootDir, { recursive: true });

  const rawFiles = walkFiles(rawDistDir);
  const excludedRecords = [];

  for (const { full, relPosix } of rawFiles) {
    const reason = isForbiddenPath(relPosix);
    if (reason) {
      excludedRecords.push({ path: relPosix, reason });
      continue;
    }
    const dest = path.join(webrootDir, ...relPosix.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(full, dest);
  }

  // Write deterministic staging robots.txt
  const robotsPath = path.join(webrootDir, 'robots.txt');
  fs.writeFileSync(robotsPath, STAGING_ROBOTS_TXT, 'utf8');

  return excludedRecords;
}

function verifyWebroot(webrootDir, siteUrl) {
  const files = walkFiles(webrootDir);
  const exactSet = new Set(files.map((f) => '/' + f.relPosix));
  const lowerMap = new Map(files.map((f) => ['/' + f.relPosix.toLowerCase(), '/' + f.relPosix]));
  const errors = [];

  // 1. Forbidden-file rejection gate
  for (const { relPosix } of files) {
    const reason = isForbiddenPath(relPosix);
    if (reason) {
      errors.push(`FORBIDDEN_FILE: ${relPosix} (${reason})`);
    }
  }

  // 2. Expected core routes check
  const requiredRoutes = [
    'index.html',
    '404.html',
    'robots.txt',
    'manifest.json',
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
  for (const route of requiredRoutes) {
    if (!exactSet.has('/' + route)) {
      errors.push(`MISSING_REQUIRED_ROUTE: ${route}`);
    }
  }

  // 3. Staging robots.txt exact content check
  const robotsFile = path.join(webrootDir, 'robots.txt');
  if (fs.existsSync(robotsFile)) {
    const robotsContent = fs.readFileSync(robotsFile, 'utf8');
    if (robotsContent !== STAGING_ROBOTS_TXT) {
      errors.push(`INVALID_ROBOTS_TXT: expected exact Disallow: /, got ${JSON.stringify(robotsContent)}`);
    }
  }

  // 4. Inspect HTML & CSS & JS files
  let htmlCount = 0;
  let learningBreadcrumbCount = 0;
  for (const { full, relPosix } of files) {
    if (relPosix.endsWith('.html')) {
      htmlCount++;
      const html = fs.readFileSync(full, 'utf8');

      // SEO: noindex, nofollow
      if (!/<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/?>/i.test(html)) {
        errors.push(`MISSING_NOINDEX: ${relPosix}`);
      }
      // Sitemap link must be absent
      if (/<link[^>]+rel="sitemap"/i.test(html)) {
        errors.push(`UNEXPECTED_SITEMAP_LINK: ${relPosix}`);
      }
      // Production domain href escape check
      if (/href="https:\/\/bridgenta\.de/i.test(html)) {
        errors.push(`PROD_DOMAIN_HREF_ESCAPE: ${relPosix}`);
      }
      // Service worker registration check in HTML
      if (/serviceWorker\.register|\/service-worker\.js/i.test(html)) {
        errors.push(`UNEXPECTED_SW_REFERENCE_HTML: ${relPosix}`);
      }
      // Learning breadcrumbs must use configured staging domain
      if (relPosix.startsWith('lernen/') && html.includes('aria-label="Brotkrümelnavigation"')) {
        learningBreadcrumbCount++;
        if (!html.includes(`href="${siteUrl}/`)) {
          errors.push(`MISSING_STAGING_BREADCRUMB: ${relPosix} (expected ${siteUrl}/)`);
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
    } else if (relPosix.endsWith('.js')) {
      const js = fs.readFileSync(full, 'utf8');
      if (/serviceWorker\.register|\/service-worker\.js/i.test(js)) {
        errors.push(`UNEXPECTED_SW_REFERENCE_JS: ${relPosix}`);
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
    htmlCount,
    learningBreadcrumbCount,
    fileCount: files.length,
    errors,
  };
}

function buildManifest(webrootDir, excludedRecords, verification, siteUrl) {
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
    schemaVersion: '1.1.0',
    milestone: 'BGDE-STRATO-STAGING-ARTIFACT-BUILD-004',
    milestoneRevision: '1.1',
    buildTimestampUtc: new Date().toISOString(),
    target: {
      provider: 'STRATO Hosting Basic',
      domain: siteUrl,
      domainAllocation: 'TEMPORARY (BGDE-DOMAIN-RESERVATION-001)',
      documentRoot: '/bga/staging',
      serverManagedPreserved: [
        '.htaccess (Apache Basic Authentication)',
        '.htpasswd (outside document root)',
        'Provider/nginx HTTP-to-HTTPS 301 redirect',
      ],
    },
    source: getGitMetadata(),
    buildConfig: {
      PUBLIC_SITE_URL: siteUrl,
      PUBLIC_ROBOTS_NOINDEX: 'true',
      PUBLIC_EXCLUDE_SITEMAP: 'true',
      PUBLIC_DISABLE_SW: 'true',
      nodeVersion: process.version,
      npmVersion,
      astroVersionSpec: pkgJson.dependencies?.astro || 'unknown',
    },
    exclusionsApplied: excludedRecords,
    verificationSummary: {
      passed: verification.passed,
      htmlCount: verification.htmlCount,
      learningBreadcrumbCount: verification.learningBreadcrumbCount,
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

function verifyAgainstManifest(webrootDir, manifestPath) {
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
    errors.push(`ROOT_DIGEST_MISMATCH: expected ${manifest.packageSummary.packageRootSha256}, got ${recomputedRoot}`);
  }

  const expectedSiteUrl = manifest.buildConfig?.PUBLIC_SITE_URL || DEFAULT_STAGING_SITE_URL;
  const webrootVerification = verifyWebroot(webrootDir, expectedSiteUrl);
  errors.push(...webrootVerification.errors);

  if (errors.length > 0) {
    console.error(`[staging-verify] FAILED with ${errors.length} error(s):`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `[staging-verify] PASS: ${manifest.packageSummary.fileCount} files (${manifest.packageSummary.totalBytes} bytes), root SHA-256 = ${manifest.packageSummary.packageRootSha256}`
  );
}

function main() {
  const { verifyOnly, outBase, siteUrl } = parseArgs(process.argv);
  const rawDistDir = path.join(outBase, 'raw-dist');
  const webrootDir = path.join(outBase, 'webroot');
  const manifestPath = path.join(outBase, 'staging-artifact-manifest.json');

  if (verifyOnly) {
    verifyAgainstManifest(webrootDir, manifestPath);
    return;
  }

  buildStaging(rawDistDir, siteUrl);
  const excludedRecords = packageWebroot(rawDistDir, webrootDir);
  const verification = verifyWebroot(webrootDir, siteUrl);

  if (!verification.passed) {
    console.error(`[staging-package] FAILED verification with ${verification.errors.length} error(s):`);
    for (const err of verification.errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  const manifest = buildManifest(webrootDir, excludedRecords, verification, siteUrl);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`[staging-package] Wrote manifest outside webroot: ${path.relative(REPO_ROOT, manifestPath)}`);

  // Self-verify packaged webroot against generated manifest
  verifyAgainstManifest(webrootDir, manifestPath);
}

main();
