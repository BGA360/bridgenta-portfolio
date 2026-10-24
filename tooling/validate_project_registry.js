import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const registryPath = path.join(workspaceRoot, 'src', 'data', 'project_registry.json');
const projectsContentDir = path.join(workspaceRoot, 'src', 'content', 'projects');

console.log('==============================================');
console.log('   BRIDGENTA PROJECT REGISTRY VALIDATION      ');
console.log('==============================================');

if (!fs.existsSync(registryPath)) {
  console.error(`FAIL: Registry file not found at ${registryPath}`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
} catch (e) {
  console.error(`FAIL: Failed to parse ${registryPath} as JSON:`, e.message);
  process.exit(1);
}

if (!Array.isArray(registry)) {
  console.error('FAIL: Registry JSON root must be an array of project entries.');
  process.exit(1);
}

const errors = [];
const seenIds = new Set();
const seenSlugs = new Set();
const registeredContentRefs = new Set();

const VALID_LIFECYCLES = new Set(['CONCEPT', 'IN_DEVELOPMENT', 'PRIVATE_BETA', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED']);
const VALID_VISIBILITIES = new Set(['PUBLIC', 'UNLISTED', 'PRIVATE', 'DRAFT']);
const VALID_SCHEMAS = new Set(['SoftwareApplication', 'WebApplication', 'CreativeWork']);

for (let i = 0; i < registry.length; i++) {
  const p = registry[i];
  const prefix = `[Entry ${i} (${p.projectId || 'unnamed'})]`;

  if (!p.projectId || !/^PRJ-[A-Z0-9_-]+$/.test(p.projectId)) {
    errors.push(`${prefix} Invalid or missing projectId: ${p.projectId}`);
  } else if (seenIds.has(p.projectId)) {
    errors.push(`${prefix} Duplicate projectId: ${p.projectId}`);
  }
  seenIds.add(p.projectId);

  if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) {
    errors.push(`${prefix} Invalid or missing slug: ${p.slug}`);
  } else if (seenSlugs.has(p.slug)) {
    errors.push(`${prefix} Duplicate slug: ${p.slug}`);
  }
  seenSlugs.add(p.slug);

  if (!p.name || typeof p.name !== 'string') {
    errors.push(`${prefix} Missing or invalid name.`);
  }

  if (!p.category || typeof p.category !== 'string') {
    errors.push(`${prefix} Missing or invalid category.`);
  }

  if (!VALID_LIFECYCLES.has(p.lifecycleState)) {
    errors.push(`${prefix} Invalid lifecycleState: ${p.lifecycleState}. Expected one of: ${Array.from(VALID_LIFECYCLES).join(', ')}`);
  }

  if (!VALID_VISIBILITIES.has(p.visibility)) {
    errors.push(`${prefix} Invalid visibility: ${p.visibility}. Expected one of: ${Array.from(VALID_VISIBILITIES).join(', ')}`);
  }

  if (typeof p.featured !== 'boolean') {
    errors.push(`${prefix} 'featured' must be boolean.`);
  }

  if (typeof p.catalogOrder !== 'number' || p.catalogOrder < 0) {
    errors.push(`${prefix} 'catalogOrder' must be a non-negative number.`);
  }

  if (typeof p.hasCaseStudy !== 'boolean') {
    errors.push(`${prefix} 'hasCaseStudy' must be boolean.`);
  }

  if (p.hasCaseStudy && p.visibility !== 'PUBLIC') {
    errors.push(`${prefix} Invariant violated: hasCaseStudy=true but visibility=${p.visibility}. Only PUBLIC projects can have public case studies.`);
  }

  if (!VALID_SCHEMAS.has(p.schemaType)) {
    errors.push(`${prefix} Invalid schemaType: ${p.schemaType}. Expected one of: ${Array.from(VALID_SCHEMAS).join(', ')}`);
  }

  if (!p.contentRef || typeof p.contentRef !== 'string') {
    errors.push(`${prefix} Missing contentRef.`);
  } else {
    const fullContentPath = path.join(workspaceRoot, p.contentRef);
    if (!fs.existsSync(fullContentPath)) {
      errors.push(`${prefix} contentRef file does not exist: ${p.contentRef}`);
    }
    registeredContentRefs.add(path.normalize(fullContentPath));
  }
}

// Check for orphan markdown files in src/content/projects/
if (fs.existsSync(projectsContentDir)) {
  const diskFiles = fs.readdirSync(projectsContentDir).filter(f => f.endsWith('.md'));
  for (const file of diskFiles) {
    const fullPath = path.normalize(path.join(projectsContentDir, file));
    if (!registeredContentRefs.has(fullPath)) {
      errors.push(`Orphan content file found: src/content/projects/${file} is not declared in project_registry.json.`);
    }
  }
}

// Verify expected public projects
const publicProjects = registry.filter(p => p.visibility === 'PUBLIC' && p.hasCaseStudy);
const expectedPublicSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];
const actualPublicSlugs = publicProjects.map(p => p.slug).sort();
const expectedSorted = [...expectedPublicSlugs].sort();

if (JSON.stringify(actualPublicSlugs) !== JSON.stringify(expectedSorted)) {
  errors.push(`Public route parity failure. Expected slugs: [${expectedSorted.join(', ')}], found: [${actualPublicSlugs.join(', ')}]`);
}

console.log(`Registered projects count: ${registry.length}`);
console.log(`Public case-study projects: ${publicProjects.length} (${publicProjects.map(p => p.slug).join(', ')})`);
console.log(`Draft/unlisted projects:   ${registry.length - publicProjects.length} (${registry.filter(p => p.visibility !== 'PUBLIC').map(p => p.slug).join(', ')})`);

if (errors.length > 0) {
  console.error('\nVALIDATION FAILURES:');
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  console.log('==============================================');
  process.exit(1);
}

console.log('\nRESULT: ALL CHECKS PASS');
console.log('==============================================');
process.exit(0);
