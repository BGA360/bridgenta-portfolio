import { evaluateReadiness } from '../../tooling/prag_provenance_readiness.js';
import { evaluateM5Decision, mapSystemFailure } from '../../tooling/prag_provenance_m5.js';
import { buildPublicationProjection } from '../../tooling/prag_provenance_projection.js';
import fs from 'node:fs';
import path from 'node:path';

import {
  resolveRepositoryCommit,
  computeM5ImplementationIdentity,
  resolveImplementationIdentity
} from '../../tooling/prag_provenance_identity.js';
export { resolveImplementationIdentity };

export function getM5Projection(articles: any[], options: { workspaceDir?: string } = {}) {
  const publishedArticles = articles.filter(
    (art) => art.data.publicationState === 'published'
  );

  let workspaceRoot = options.workspaceDir || process.cwd();
  if (path.basename(workspaceRoot) === 'becc-runtime') {
    workspaceRoot = path.resolve(workspaceRoot, '..');
  }

  const expectedSubjects = publishedArticles.map(art => `src/content/learning/${art.id}`);

  let m5Decisions = [];
  const repoCommitRes = resolveRepositoryCommit(workspaceRoot);
  const evalIdentityRes = computeM5ImplementationIdentity(workspaceRoot);

  const commitSha = repoCommitRes.commit;
  const implementationIdentity = evalIdentityRes.identity;
  const implementationIdentityScheme = 'M5-SOURCE-HASH-1';

  if (evalIdentityRes.state === 'UNAVAILABLE') {
    // Identity unavailable -> produce SYSTEM_UNAVAILABLE with null readiness and null identity
    for (const subjId of expectedSubjects) {
      m5Decisions.push(mapSystemFailure({
        subjectId: subjId,
        readinessState: null,
        reasons: []
      }, 'M5_INPUT_STATE_UNVERIFIABLE', {
        implementationIdentity: null,
        implementationIdentityScheme,
        repositoryCommit: commitSha
      }));
    }
  } else {
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

    if (systemErrorClass) {
      // Map system failure for all expected subjects
      for (const subjId of expectedSubjects) {
        m5Decisions.push(mapSystemFailure({
          subjectId: subjId,
          readinessState: null,
          reasons: []
        }, systemErrorClass, {
          implementationIdentity,
          implementationIdentityScheme,
          repositoryCommit: commitSha
        }));
      }
    } else {
      try {
        const b5Result = evaluateReadiness(workspaceRoot, registry, manifest, clearances);
        for (const b5Art of b5Result.articles) {
          const dec = evaluateM5Decision(b5Art, {
            implementationIdentity,
            implementationIdentityScheme,
            repositoryCommit: commitSha
          });
          m5Decisions.push(dec);
        }
      } catch (err) {
        // General evaluator/dependency error
        for (const subjId of expectedSubjects) {
          m5Decisions.push(mapSystemFailure({
            subjectId: subjId,
            readinessState: null,
            reasons: []
          }, 'M5_EVALUATION_ERROR', {
            implementationIdentity,
            implementationIdentityScheme,
            repositoryCommit: commitSha
          }));
        }
      }
    }
  }

  const projection = buildPublicationProjection({
    expectedSubjects,
    m5DecisionRecords: m5Decisions,
    options: {
      implementationIdentity,
      implementationIdentityScheme,
      identityState: evalIdentityRes.state
    }
  });

  return projection;
}

// Enforcement State Helper
export function isEnforcementActive(): boolean {
  // Operational Enforcement is enabled by default.
  // Fail-safe rollback: set M5_ENFORCEMENT=disabled or M5_SHADOW_MODE=true in environment.
  if (process.env.M5_ENFORCEMENT === 'disabled' || process.env.M5_SHADOW_MODE === 'true') {
    return false;
  }
  return true;
}

// Operational M5 Publication Filtering & Diagnostics
export function observeArticleEligibility(articles: any[]) {
  const projection = getM5Projection(articles);
  const eligibleSet = new Set(projection.eligibleSubjectIds);

  if (!isEnforcementActive()) {
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
    return articles;
  }

  console.log('[M5 ENFORCEMENT ACTIVE] Publication eligibility filtering:');
  console.log(`  Eligible: ${projection.eligibleSubjectIds.length}`);
  console.log(`  Withheld: ${projection.withheldSubjectIds.length}`);
  console.log(`  Undecided: ${projection.undecidedSubjectIds.length}`);

  for (const rec of projection.records) {
    if (rec.publicationEligibility === 'PUBLICATION_WITHHELD') {
      console.warn(`  [ENFORCED_WITHHELD] Article ${rec.subjectId} is withheld from publication due to readiness failure.`);
    } else if (rec.publicationEligibility === 'PUBLICATION_UNDECIDED') {
      console.warn(`  [ENFORCED_UNDECIDED] Article ${rec.subjectId} is undecided. Diagnostics: ${rec.projectionDiagnostics.join(', ')}`);
    }
  }

  // Enforced Filtering: published articles must be in eligibleSet; draft articles are preserved for preview
  return articles.filter((art) => {
    if (art.data.publicationState !== 'published') {
      return true;
    }
    return eligibleSet.has(`src/content/learning/${art.id}`);
  });
}

export function observeCategoryEligibility(categories: any[], publishedArticles: any[]) {
  if (!isEnforcementActive()) {
    return categories;
  }
  return categories.filter((cat) =>
    publishedArticles.some((art) => art.data.category.id === cat.id)
  );
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
