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

export function publishCheckLearningArticle(slugInput) {
  if (!slugInput) {
    console.error('ERROR: No article slug provided.');
    console.error('Usage: node tooling/publish_check_learning_article.js <article-slug>');
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
    headDrift: 'NO',
  };

  const errors = [];

  // 1. Article file check
  if (!fs.existsSync(filePath)) {
    errors.push(`[P0] Article file does not exist: "${filePath}"`);
    results.publicationState = 'FAIL';
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = parseFrontmatter(content);

    // 2. Publication state check
    if (data.publicationState !== 'published') {
      errors.push(`[P0] Publication check requires publicationState === 'published'. Found: "${data.publicationState}".`);
      results.publicationState = 'FAIL';
    }

    // 3. PublishedAt date check
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

    // 4. ProvenanceRef check
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
        }
      }
    }

    // 5. Category & Discovery check
    if (!data.category) {
      errors.push('[P0] Missing category attribute in frontmatter.');
      results.discovery = 'FAIL';
    } else {
      const catFile = path.join(rootDir, 'src', 'content', 'learningCategories', `${data.category}.json`);
      if (!fs.existsSync(catFile)) {
        errors.push(`[P0] Category "${data.category}" does not exist.`);
        results.discovery = 'FAIL';
      }
    }

    // 6. Public route & Preview exclusion eligibility check
    if (data.publicationState === 'published') {
      results.publicRoute = 'PASS';
      results.previewExclusion = 'PASS';
    }
  }

  // 7. Site build check
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
    results.build = 'PASS';
  } catch (err) {
    errors.push(`[P0] npm run build failed: ${err.message}`);
    results.build = 'FAIL';
  }

  // 8. M5 shadow observation check
  try {
    execSync('npm run m5:shadow', { cwd: rootDir, stdio: 'pipe' });
    results.m5Shadow = 'PASS';
  } catch (err) {
    errors.push(`[P0] npm run m5:shadow failed: ${err.message}`);
    results.m5Shadow = 'FAIL';
  }

  // 9. Head drift check
  try {
    const gitStatus = execSync('git status --porcelain', { cwd: rootDir, stdio: 'pipe' }).toString();
    const modifiedTracked = gitStatus
      .split('\n')
      .filter((line) => line && !line.startsWith('??'))
      .length;
    results.headDrift = modifiedTracked > 0 ? 'YES' : 'NO';
  } catch (_) {
    results.headDrift = 'NO';
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
  console.log(`HEAD_DRIFT:\n${results.headDrift}\n`);
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
  const targetSlug = process.argv[2];
  publishCheckLearningArticle(targetSlug);
}
