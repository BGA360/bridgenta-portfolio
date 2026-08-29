import { evaluateReadiness } from '../../tooling/prag_provenance_readiness.js';
import { evaluateM5Decision, mapSystemFailure } from '../../tooling/prag_provenance_m5.js';
import { buildPublicationProjection } from '../../tooling/prag_provenance_projection.js';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Get implementation identity (Commit SHA)
let commitSha = '0000000000000000000000000000000000000000';
try {
  commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
} catch (e) {
  // Use fallback if git is not available
}

export function getM5Projection(articles: any[], options: { workspaceDir?: string } = {}) {
  const publishedArticles = articles.filter(
    (art) => art.data.publicationState === 'published'
  );

  let workspaceRoot = options.workspaceDir || process.cwd();
  if (path.basename(workspaceRoot) === 'becc-runtime') {
    workspaceRoot = path.resolve(workspaceRoot, '..');
  }

  const registryPath = path.join(workspaceRoot, 'src', 'data', 'provenance_registry.json');
  const manifestPath = path.join(workspaceRoot, 'src', 'data', 'local_integrity_manifest.json');
  const clearancesPath = path.join(workspaceRoot, 'stewardship', 'reviews', 'clearances_manifest.json');

  let registry = [];
  let manifest = [];
  let clearances = [];

  let systemErrorClass: string | null = null;

  try {
    if (fs.existsSync(registryPath)) {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    } else {
      systemErrorClass = 'M5_INPUT_STATE_UNVERIFIABLE';
    }
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } else {
      systemErrorClass = 'M5_INPUT_STATE_UNVERIFIABLE';
    }
    if (fs.existsSync(clearancesPath)) {
      clearances = JSON.parse(fs.readFileSync(clearancesPath, 'utf-8'));
    }
  } catch (e) {
    systemErrorClass = 'M5_CONFIGURATION_INVALID';
  }

  const expectedSubjects = publishedArticles.map(art => `src/content/learning/${art.id}`);

  let m5Decisions = [];

  if (systemErrorClass) {
    // Map system failure for all expected subjects
    for (const subjId of expectedSubjects) {
      m5Decisions.push(mapSystemFailure({
        subjectId: subjId,
        readinessState: 'NOT_READY',
        reasons: []
      }, systemErrorClass, { implementationIdentity: commitSha }));
    }
  } else {
    try {
      const b5Result = evaluateReadiness(workspaceRoot, registry, manifest, clearances);
      for (const b5Art of b5Result.articles) {
        const dec = evaluateM5Decision(b5Art, {
          implementationIdentity: commitSha
        });
        m5Decisions.push(dec);
      }
    } catch (err) {
      // General evaluator/dependency error
      for (const subjId of expectedSubjects) {
        m5Decisions.push(mapSystemFailure({
          subjectId: subjId,
          readinessState: 'NOT_READY',
          reasons: []
        }, 'M5_EVALUATION_ERROR', { implementationIdentity: commitSha }));
      }
    }
  }

  const projection = buildPublicationProjection({
    expectedSubjects,
    m5DecisionRecords: m5Decisions,
    options: {
      implementationIdentity: commitSha
    }
  });

  return projection;
}

// Shadow/Advisory API
export function observeArticleEligibility(articles: any[]) {
  try {
    const projection = getM5Projection(articles);
    console.log('[M5 SHADOW OBSERVATION] Publication eligibility diagnostics:');
    console.log(`  Eligible: ${projection.eligibleSubjectIds.length}`);
    console.log(`  Withheld: ${projection.withheldSubjectIds.length}`);
    console.log(`  Undecided: ${projection.undecidedSubjectIds.length}`);
    for (const rec of projection.records) {
      if (rec.publicationEligibility === 'PUBLICATION_WITHHELD') {
        console.warn(`  [WOULD_WITHHOLD] Article ${rec.subjectId} is withheld due to readiness failure.`);
      } else if (rec.publicationEligibility === 'PUBLICATION_UNDECIDED') {
        console.warn(`  [UNDECIDED] Article ${rec.subjectId} is undecided. Diagnostics: ${rec.projectionDiagnostics.join(', ')}`);
      }
    }
  } catch (e) {
    console.error('[M5 SHADOW ERROR] Failed to compute shadow projection:', e);
  }

  // Shadow Mode Rule: return all input articles unmodified
  return articles;
}

export function observeCategoryEligibility(categories: any[], articles: any[]) {
  // Shadow Mode Rule: return all input categories unmodified
  return categories;
}

// Simulation API (used in tests and verification)
export function getShadowPublicationView(articles: any[], options: { workspaceDir?: string } = {}) {
  const projection = getM5Projection(articles, options);
  const eligibleSet = new Set(projection.eligibleSubjectIds);

  const published = articles.filter(
    (art) => art.data.publicationState === 'published'
  );

  const eligibleArticles = published.filter(
    (art) => eligibleSet.has(`src/content/learning/${art.id}`)
  );

  return eligibleArticles;
}
