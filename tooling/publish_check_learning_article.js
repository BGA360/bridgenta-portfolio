import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return {};
  const yamlStr = match[1];
  const data = {};
  for (const line of yamlStr.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
      const key = trimmed.slice(0, colonIndex).trim();
      let val = trimmed.slice(colonIndex + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  }
  return data;
}

export function publishCheckLearningArticle(slugInput, options = {}) {
  if (!slugInput) {
    console.error('ERROR: No article slug provided.');
    console.error('Usage: node tooling/publish_check_learning_article.js <article-slug> [--authorized-head <sha>]');
    process.exit(1);
  }

  const slug = slugInput.replace(/\.md$/, '').trim();
  const filePath = path.join(rootDir, 'src', 'content', 'learning', `${slug}.md`);

  const results = {
    publicationState: 'PASS',
    publishedAt: 'PASS',
    provenance: 'PASS',
    publicRoute: 'PASS',
    previewExclusion: 'PASS',
    discovery: 'PASS',
    build: 'PASS',
    m5Shadow: 'PASS',
    worktreeClean: 'YES',
    authorizedHeadSha: options.authorizedHead || 'NOT_SUPPLIED',
    currentHeadSha: 'UNKNOWN',
    headDrift: 'NOT_EVALUATED',
    articlePublicOutputExists: 'NO',
    articlePreviewOutputExists: 'NO',
    articleInLearningIndex: 'NO',
    articleInCategoryOutput: 'NO',
    articleInSitemap: 'NO',
  };

  const errors = [];

  // 1. Git HEAD & Worktree Clean checks
  try {
    const currentSha = execSync('git rev-parse HEAD', { cwd: rootDir, stdio: 'pipe' }).toString().trim();
    results.currentHeadSha = currentSha;

    const gitStatus = execSync('git status --porcelain', { cwd: rootDir, stdio: 'pipe' }).toString();
    const modifiedTracked = gitStatus
      .split('\n')
      .filter((line) => line && !line.startsWith('??'))
      .length;
    results.worktreeClean = modifiedTracked === 0 ? 'YES' : 'NO';

    if (options.authorizedHead) {
      if (currentSha === options.authorizedHead) {
        results.headDrift = 'NO';
      } else {
        results.headDrift = 'YES';
        errors.push(`[P0] Authorized HEAD SHA mismatch: expected "${options.authorizedHead}", got "${currentSha}".`);
      }
    } else {
      results.headDrift = 'NOT_EVALUATED';
    }
  } catch (_) {
    results.currentHeadSha = 'UNKNOWN';
  }

  // 2. Article file check
  let data = {};
  if (!fs.existsSync(filePath)) {
    errors.push(`[P0] Article file does not exist: "${filePath}"`);
    results.publicationState = 'FAIL';
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    data = parseFrontmatter(content);

    // 3. Publication state check
    if (data.publicationState !== 'published') {
      errors.push(`[P0] Publication check requires publicationState === 'published'. Found: "${data.publicationState}".`);
      results.publicationState = 'FAIL';
    }

    // 4. PublishedAt date check
    if (!data.publishedAt) {
      errors.push('[P0] Published article requires a valid publishedAt date.');
      results.publishedAt = 'FAIL';
    } else {
      const pubDate = new Date(data.publishedAt);
      if (isNaN(pubDate.getTime())) {
        errors.push(`[P0] Invalid publishedAt date: "${data.publishedAt}".`);
        results.publishedAt = 'FAIL';
      }
    }

    // 5. ProvenanceRef check & Hardening
    if (!data.provenanceRef) {
      errors.push('[P0] Published article requires a valid provenanceRef.');
      results.provenance = 'FAIL';
    } else {
      const registryPath = path.join(rootDir, 'src', 'data', 'provenance_registry.json');
      if (!fs.existsSync(registryPath)) {
        errors.push('[P0] Provenance registry src/data/provenance_registry.json does not exist.');
        results.provenance = 'FAIL';
      } else {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        const matchingEntries = registry.filter((e) => e.eventId === data.provenanceRef);
        if (matchingEntries.length === 0) {
          errors.push(`[P0] provenanceRef "${data.provenanceRef}" does not exist in src/data/provenance_registry.json.`);
          results.provenance = 'FAIL';
        } else if (matchingEntries.length > 1) {
          errors.push(`[P0] Duplicate eventId "${data.provenanceRef}" found in src/data/provenance_registry.json.`);
          results.provenance = 'FAIL';
        } else {
          const entry = matchingEntries[0];
          if (!entry.sourceLocator || entry.sourceLocator.trim() === '') {
            errors.push(`[P0] Provenance entry "${data.provenanceRef}" has empty sourceLocator.`);
            results.provenance = 'FAIL';
          }
          if (!entry.historicalLocatorState || entry.historicalLocatorState !== 'AVAILABLE') {
            errors.push(`[P0] Provenance entry "${data.provenanceRef}" has invalid historicalLocatorState: "${entry.historicalLocatorState}". Must be 'AVAILABLE'.`);
            results.provenance = 'FAIL';
          }

          // Hardening: Require non-empty historicalLocator when AVAILABLE
          if (entry.historicalLocatorState === 'AVAILABLE') {
            if (!entry.historicalLocator || entry.historicalLocator.trim() === '') {
              errors.push(`[P0] Provenance entry "${data.provenanceRef}" requires a non-empty historicalLocator when historicalLocatorState is 'AVAILABLE'.`);
              results.provenance = 'FAIL';
            } else if (entry.sourceSystem === 'git') {
              // Local git commit verification
              try {
                execSync(`git cat-file -t ${entry.historicalLocator}`, { cwd: rootDir, stdio: 'pipe' });
              } catch (_) {
                errors.push(`[P0] Provenance git historicalLocator commit "${entry.historicalLocator}" not found in local git history.`);
                results.provenance = 'FAIL';
              }
            }
          }
        }
      }
    }
  }

  // 6. Site build check
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
    results.build = 'PASS';
  } catch (err) {
    errors.push(`[P0] npm run build failed: ${err.message}`);
    results.build = 'FAIL';
  }

  // 7. Verify actual dist/ build artifacts (DEFECT-03 fix)
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir) && results.build === 'PASS') {
    // 7.1 Public Route HTML output check
    const articlePublicHtml = path.join(distDir, 'lernen', slug, 'index.html');
    if (fs.existsSync(articlePublicHtml)) {
      results.articlePublicOutputExists = 'YES';
      results.publicRoute = 'PASS';
    } else {
      results.articlePublicOutputExists = 'NO';
      results.publicRoute = 'FAIL';
      errors.push(`[P0] Expected public article HTML output missing in dist/lernen/${slug}/index.html.`);
    }

    // 7.2 Preview Route exclusion check
    const articlePreviewHtml = path.join(distDir, 'lernen', 'preview', slug, 'index.html');
    if (fs.existsSync(articlePreviewHtml)) {
      results.articlePreviewOutputExists = 'YES';
      results.previewExclusion = 'FAIL';
      errors.push(`[P0] Forbidden preview route artifact found in production build: dist/lernen/preview/${slug}/index.html.`);
    } else {
      results.articlePreviewOutputExists = 'NO';
      results.previewExclusion = 'PASS';
    }

    // 7.3 Learning root index category reference check
    const learningIndexHtmlPath = path.join(distDir, 'lernen', 'index.html');
    if (fs.existsSync(learningIndexHtmlPath)) {
      const indexContent = fs.readFileSync(learningIndexHtmlPath, 'utf8');
      if (data.category && (indexContent.includes(`/lernen/themen/${data.category}/`) || indexContent.includes(`/lernen/themen/${data.category}`))) {
        results.articleInLearningIndex = 'YES';
      } else {
        results.articleInLearningIndex = 'NO';
        results.discovery = 'FAIL';
        errors.push(`[P0] Category route "/lernen/themen/${data.category}/" for article missing from dist/lernen/index.html.`);
      }
    }

    // 7.4 Category index inclusion check
    if (data.category) {
      const categoryHtmlPath = path.join(distDir, 'lernen', 'themen', data.category, 'index.html');
      if (fs.existsSync(categoryHtmlPath)) {
        const catContent = fs.readFileSync(categoryHtmlPath, 'utf8');
        if (catContent.includes(`/lernen/${slug}/`) || catContent.includes(`/lernen/${slug}`)) {
          results.articleInCategoryOutput = 'YES';
        } else {
          results.articleInCategoryOutput = 'NO';
          results.discovery = 'FAIL';
          errors.push(`[P0] Published article "/lernen/${slug}/" missing from dist/lernen/themen/${data.category}/index.html.`);
        }
      }
    }

    // 7.5 Sitemap inclusion check
    const sitemapPath = path.join(distDir, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      if (sitemapContent.includes(`/lernen/${slug}/`) || sitemapContent.includes(`/lernen/${slug}`)) {
        results.articleInSitemap = 'YES';
      } else {
        results.articleInSitemap = 'NO';
      }
    }

    if (results.articleInLearningIndex === 'YES' && results.articleInCategoryOutput === 'YES') {
      results.discovery = 'PASS';
    }
  }

  // 8. M5 shadow observation check
  try {
    execSync('npm run m5:shadow', { cwd: rootDir, stdio: 'pipe' });
    results.m5Shadow = 'PASS';
  } catch (err) {
    errors.push(`[P0] npm run m5:shadow failed: ${err.message}`);
    results.m5Shadow = 'FAIL';
  }

  const p0Count = errors.filter((e) => e.startsWith('[P0]')).length;
  const p1Count = errors.filter((e) => e.startsWith('[P1]')).length;
  const isPass = p0Count === 0 && p1Count === 0;

  console.log('BECC_LEARNING_PUBLISH_CHECK\n');
  console.log(`ARTICLE:\n${slug}\n`);
  console.log(`PUBLICATION_STATE:\n${results.publicationState}\n`);
  console.log(`PUBLISHED_AT:\n${results.publishedAt}\n`);
  console.log(`PROVENANCE:\n${results.provenance}\n`);
  console.log(`PUBLIC_ROUTE:\n${results.publicRoute}\n`);
  console.log(`PREVIEW_EXCLUSION:\n${results.previewExclusion}\n`);
  console.log(`DISCOVERY:\n${results.discovery}\n`);
  console.log(`BUILD:\n${results.build}\n`);
  console.log(`M5_SHADOW:\n${results.m5Shadow}\n`);
  console.log(`WORKTREE_CLEAN:\n${results.worktreeClean}\n`);
  console.log(`AUTHORIZED_HEAD_SHA:\n${results.authorizedHeadSha}\n`);
  console.log(`CURRENT_HEAD_SHA:\n${results.currentHeadSha}\n`);
  console.log(`HEAD_DRIFT:\n${results.headDrift}\n`);
  console.log(`ARTICLE_PUBLIC_OUTPUT_EXISTS:\n${results.articlePublicOutputExists}\n`);
  console.log(`ARTICLE_PREVIEW_OUTPUT_EXISTS:\n${results.articlePreviewOutputExists}\n`);
  console.log(`ARTICLE_IN_LEARNING_INDEX:\n${results.articleInLearningIndex}\n`);
  console.log(`ARTICLE_IN_CATEGORY_OUTPUT:\n${results.articleInCategoryOutput}\n`);
  console.log(`ARTICLE_IN_SITEMAP:\n${results.articleInSitemap}\n`);
  console.log(`P0:\n${p0Count}\n`);
  console.log(`P1:\n${p1Count}\n`);

  if (!isPass) {
    console.log('ERRORS:');
    errors.forEach((err) => console.log(` - ${err}`));
    console.log('\nRESULT:\nFAIL');
    process.exit(1);
  }

  console.log('RESULT:\nPASS');
  process.exit(0);
}

// CLI Execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const targetSlug = args[0];
  let authorizedHead = null;

  const authIndex = args.indexOf('--authorized-head');
  if (authIndex !== -1 && args[authIndex + 1]) {
    authorizedHead = args[authIndex + 1];
  }

  publishCheckLearningArticle(targetSlug, { authorizedHead });
}
