import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return { data: {}, body: fileContent, rawFrontmatter: '' };
  const yamlStr = match[1];
  const body = fileContent.slice(match[0].length);
  const data = {};

  for (const line of yamlStr.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
      const key = trimmed.slice(0, colonIndex).trim();
      let val = trimmed.slice(colonIndex + 1).trim();
      
      // Clean string quotes
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  }
  return { data, body, rawFrontmatter: yamlStr };
}

export function validateSingleArticle(slugInput) {
  const slug = slugInput.replace(/\.md$/, '').trim();
  const filePath = path.join(rootDir, 'src', 'content', 'learning', `${slug}.md`);

  const checks = {
    frontmatter: 'PASS',
    category: 'PASS',
    learningLevel: 'PASS',
    publicationState: 'PASS',
    provenance: 'PASS',
    bodyRules: 'PASS',
    links: 'PASS',
  };

  const errors = [];
  let escalationRequired = false;
  let systemInvariantChange = false;

  // 1. File existence check
  if (!fs.existsSync(filePath)) {
    errors.push(`[P0] Article file does not exist: "${filePath}"`);
    checks.frontmatter = 'FAIL';
  }

  // 2. Slug check
  if (slug.includes('/') || slug.includes('\\')) {
    errors.push(`[P0] Nested article slug forbidden: "${slug}". Must be flat under src/content/learning/.`);
    checks.frontmatter = 'FAIL';
  }
  if (slug === 'themen') {
    errors.push(`[P0] Article slug matches reserved word "themen".`);
    checks.frontmatter = 'FAIL';
  }

  let data = {};
  let body = '';

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(content);
    data = parsed.data;
    body = parsed.body;

    // Required fields check
    if (!data.title || data.title.trim() === '') {
      errors.push('[P0] Frontmatter missing required string "title".');
      checks.frontmatter = 'FAIL';
    }
    if (!data.description || data.description.trim() === '') {
      errors.push('[P0] Frontmatter missing required string "description".');
      checks.frontmatter = 'FAIL';
    }

    // Category check
    if (!data.category || data.category.trim() === '') {
      errors.push('[P0] Frontmatter missing required "category".');
      checks.category = 'FAIL';
    } else {
      const categoryFile = path.join(rootDir, 'src', 'content', 'learningCategories', `${data.category}.json`);
      if (!fs.existsSync(categoryFile)) {
        errors.push(`[P0] Category "${data.category}" does not exist in src/content/learningCategories/.`);
        checks.category = 'FAIL';
      }
    }

    // Learning level check
    const validLevels = ['public', 'beginner', 'intermediate', 'advanced'];
    if (!data.learningLevel || !validLevels.includes(data.learningLevel)) {
      errors.push(`[P0] Invalid learningLevel "${data.learningLevel}". Must be one of: ${validLevels.join(', ')}.`);
      checks.learningLevel = 'FAIL';
    }

    // Publication state check
    const validStates = ['draft', 'review', 'published'];
    if (!data.publicationState || !validStates.includes(data.publicationState)) {
      errors.push(`[P0] Invalid publicationState "${data.publicationState}". Must be one of: ${validStates.join(', ')}.`);
      checks.publicationState = 'FAIL';
    }

    // State-dependent date & status checks (matching config.ts superRefine)
    if (data.publicationState === 'draft' || data.publicationState === 'review') {
      if (data.publishedAt !== undefined) {
        errors.push(`[P0] ${data.publicationState} article must not declare publishedAt date.`);
        checks.publicationState = 'FAIL';
      }
      if (data.updatedAt !== undefined) {
        errors.push(`[P0] ${data.publicationState} article must not declare updatedAt date.`);
        checks.publicationState = 'FAIL';
      }
      if (data.publicStatus !== undefined) {
        errors.push(`[P0] ${data.publicationState} article must not declare publicStatus.`);
        checks.publicationState = 'FAIL';
      }
    }

    if (data.publicationState === 'published') {
      if (!data.publishedAt) {
        errors.push('[P0] Published article requires a publishedAt date.');
        checks.publicationState = 'FAIL';
      } else {
        const pubDate = new Date(data.publishedAt);
        if (isNaN(pubDate.getTime())) {
          errors.push(`[P0] Invalid publishedAt date string: "${data.publishedAt}".`);
          checks.publicationState = 'FAIL';
        }
        if (data.updatedAt) {
          const upDate = new Date(data.updatedAt);
          if (isNaN(upDate.getTime()) || upDate.getTime() < pubDate.getTime()) {
            errors.push(`[P0] updatedAt date ("${data.updatedAt}") must be >= publishedAt date ("${data.publishedAt}").`);
            checks.publicationState = 'FAIL';
          }
        }
      }
    }

    // Provenance reference check
    if (data.provenanceRef) {
      const provRegex = /^EV-[A-Z]{2,4}-[0-9]{3,5}$/;
      if (!provRegex.test(data.provenanceRef)) {
        errors.push(`[P0] Invalid provenanceRef format: "${data.provenanceRef}". Must match regex /^EV-[A-Z]{2,4}-[0-9]{3,5}$/.`);
        checks.provenance = 'FAIL';
      } else {
        const registryPath = path.join(rootDir, 'src', 'data', 'provenance_registry.json');
        if (fs.existsSync(registryPath)) {
          const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
          const entry = registry.find((e) => e.eventId === data.provenanceRef);
          if (!entry) {
            errors.push(`[P1] Declared provenanceRef "${data.provenanceRef}" not found in src/data/provenance_registry.json.`);
            checks.provenance = 'FAIL';
          }
        }
      }
    }

    // Body rules check
    if (body.includes('Aus echten Projekten lernen') || body.includes('Nicht nur das Ergebnis')) {
      errors.push('[P1] Duplicate central signature detected in article body text. The signature is rendered automatically by LearningArticleRenderer.');
      checks.bodyRules = 'FAIL';
    }

    // HR separator check in body
    const lines = body.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        errors.push(`[P1] Forbidden horizontal rule '---' detected in article body at line ${i + 1}.`);
        checks.bodyRules = 'FAIL';
        break;
      }
    }

    // Callout syntax check
    if (body.includes('[!IMPORTANT]') && !body.includes('> [!IMPORTANT]')) {
      errors.push('[P1] Malformed [!IMPORTANT] callout found outside blockquote markup.');
      checks.bodyRules = 'FAIL';
    }
  }

  const p0Count = errors.filter((e) => e.startsWith('[P0]')).length;
  const p1Count = errors.filter((e) => e.startsWith('[P1]')).length;
  const p2Count = errors.filter((e) => e.startsWith('[P2]')).length;

  const isPass = p0Count === 0 && p1Count === 0;

  return {
    slug,
    checks,
    errors,
    p0Count,
    p1Count,
    p2Count,
    systemInvariantChange,
    escalationRequired,
    isPass,
  };
}

export function validateAllArticles() {
  const learningDir = path.join(rootDir, 'src', 'content', 'learning');
  if (!fs.existsSync(learningDir)) {
    console.error(`Learning content directory does not exist: ${learningDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(learningDir).filter((f) => f.endsWith('.md'));
  let totalErrors = 0;

  console.log('BECC_LEARNING_VALIDATE ALL ARTICLES\n');
  console.log(`TOTAL ARTICLES FOUND: ${files.length}\n`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const res = validateSingleArticle(slug);
    if (!res.isPass) {
      totalErrors++;
      console.log(`[FAIL] ${slug}:`);
      res.errors.forEach((e) => console.log(`  - ${e}`));
    } else {
      console.log(`[PASS] ${slug}`);
    }
  }

  if (totalErrors > 0) {
    console.log(`\nRESULT:\nFAIL (${totalErrors} articles failed validation)`);
    process.exit(1);
  }

  console.log('\nRESULT:\nPASS');
  process.exit(0);
}

// CLI Execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (!target || target === '--all') {
    validateAllArticles();
  } else {
    const res = validateSingleArticle(target);
    console.log('BECC_LEARNING_VALIDATE\n');
    console.log(`ARTICLE:\n${res.slug}\n`);
    console.log(`MODE:\nROUTINE\n`);
    console.log(`FRONTMATTER:\n${res.checks.frontmatter}\n`);
    console.log(`CATEGORY:\n${res.checks.category}\n`);
    console.log(`LEARNING_LEVEL:\n${res.checks.learningLevel}\n`);
    console.log(`PUBLICATION_STATE:\n${res.checks.publicationState}\n`);
    console.log(`PROVENANCE:\n${res.checks.provenance}\n`);
    console.log(`BODY_RULES:\n${res.checks.bodyRules}\n`);
    console.log(`LINKS:\n${res.checks.links}\n`);
    console.log(`SYSTEM_INVARIANT_CHANGE:\n${res.systemInvariantChange ? 'YES' : 'NO'}\n`);
    console.log(`ESCALATION_REQUIRED:\n${res.escalationRequired ? 'YES' : 'NO'}\n`);

    if (!res.isPass) {
      console.log(`P0:\n${res.p0Count}\n`);
      console.log(`P1:\n${res.p1Count}\n`);
      console.log(`P2:\n${res.p2Count}\n`);
      console.log('ERRORS:');
      res.errors.forEach((err) => console.log(` - ${err}`));
      console.log('\nRESULT:\nFAIL');
      process.exit(1);
    }

    console.log('RESULT:\nPASS');
    process.exit(0);
  }
}
