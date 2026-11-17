import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  projectRegistry,
  getAllRegisteredProjects,
  getPublicProjects,
  getFeaturedProjects,
  getCaseStudyProjects,
  getSitemapProjectRoutes,
  getProjectBySlug,
  getProjectById,
  resolveProjectRef,
  getLifecycleBadgeClass,
  getLifecycleLabel,
  ProjectRegistryEntrySchema,
  LifecycleStateSchema,
  VisibilitySchema,
} from '../src/utils/project_registry.ts';

describe('Project Registry & Portfolio Metadata Consolidation', () => {
  it('1. All registered projects have unique project IDs matching canonical format', () => {
    const all = getAllRegisteredProjects();
    assert.ok(all.length >= 7, 'Expected at least 7 registered projects');

    const seenIds = new Set();
    for (const p of all) {
      assert.match(p.projectId, /^PRJ-[A-Z0-9_-]+$/, `projectId ${p.projectId} must match ^PRJ-[A-Z0-9_-]+$`);
      assert.equal(seenIds.has(p.projectId), false, `Duplicate projectId found: ${p.projectId}`);
      seenIds.add(p.projectId);
    }
  });

  it('2. All registered projects have unique lowercase URL-safe slugs', () => {
    const all = getAllRegisteredProjects();
    const seenSlugs = new Set();
    for (const p of all) {
      assert.match(p.slug, /^[a-z0-9-]+$/, `slug ${p.slug} must match ^[a-z0-9-]+$`);
      assert.equal(seenSlugs.has(p.slug), false, `Duplicate slug found: ${p.slug}`);
      seenSlugs.add(p.slug);
    }
  });

  it('3. Lifecycle state schema accepts valid enum values and rejects invalid values', () => {
    const valid = ['CONCEPT', 'IN_DEVELOPMENT', 'PRIVATE_BETA', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED'];
    for (const val of valid) {
      assert.equal(LifecycleStateSchema.parse(val), val);
    }
    assert.throws(() => LifecycleStateSchema.parse('INVALID_STATE'));
    assert.throws(() => LifecycleStateSchema.parse('In Entwicklung')); // raw string rejected in schema
  });

  it('4. Visibility schema accepts valid enum values and rejects invalid values', () => {
    const valid = ['PUBLIC', 'UNLISTED', 'PRIVATE', 'DRAFT'];
    for (const val of valid) {
      assert.equal(VisibilitySchema.parse(val), val);
    }
    assert.throws(() => VisibilitySchema.parse('HIDDEN'));
    assert.throws(() => VisibilitySchema.parse('VISIBLE'));
  });

  it('5. Every registry entry points to an existing markdown content file', () => {
    const all = getAllRegisteredProjects();
    for (const p of all) {
      assert.ok(p.contentRef, `Missing contentRef on ${p.projectId}`);
      const filePath = path.resolve(process.cwd(), p.contentRef);
      assert.equal(fs.existsSync(filePath), true, `File ${p.contentRef} does not exist on disk`);
    }
  });

  it('6. Every markdown content file in src/content/projects/ is accounted for in the registry', () => {
    const dir = path.resolve(process.cwd(), 'src', 'content', 'projects');
    const diskFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    const registeredFiles = new Set(
      getAllRegisteredProjects().map((p) => path.normalize(path.resolve(process.cwd(), p.contentRef)))
    );

    for (const file of diskFiles) {
      const fullPath = path.normalize(path.join(dir, file));
      assert.equal(
        registeredFiles.has(fullPath),
        true,
        `Orphan markdown file on disk: ${file} is not in project_registry.json`
      );
    }
  });

  it('7. Public case-study projects generate exact expected 6 public routes', () => {
    const routes = getSitemapProjectRoutes();
    const expected = [
      '/project-bridgenta/',
      '/project-aeocortex/',
      '/project-luminapraxisds/',
      '/project-rootedrealitygarden/',
      '/project-starcleaners/',
      '/project-becc/',
    ];
    assert.deepEqual(routes, expected);
  });

  it('8. Draft projects (builddaddy, fdess) are excluded from public case studies and sitemap', () => {
    const publicProjects = getPublicProjects();
    const publicSlugs = publicProjects.map((p) => p.slug);
    assert.equal(publicSlugs.includes('builddaddy'), false);
    assert.equal(publicSlugs.includes('fdess'), false);

    const routes = getSitemapProjectRoutes();
    assert.equal(routes.some((r) => r.includes('builddaddy')), false);
    assert.equal(routes.some((r) => r.includes('fdess')), false);

    const bd = getProjectBySlug('builddaddy');
    assert.ok(bd);
    assert.equal(bd.visibility, 'DRAFT');
    assert.equal(bd.hasCaseStudy, false);

    const fd = getProjectBySlug('fdess');
    assert.ok(fd);
    assert.equal(fd.visibility, 'DRAFT');
    assert.equal(fd.hasCaseStudy, false);
  });

  it('9. Invariant: non-public projects cannot declare hasCaseStudy=true', () => {
    assert.throws(() => {
      ProjectRegistryEntrySchema.parse({
        projectId: 'PRJ-TEST',
        slug: 'test',
        name: 'Test',
        category: 'Test',
        lifecycleState: 'CONCEPT',
        visibility: 'DRAFT',
        featured: false,
        catalogOrder: 10,
        hasCaseStudy: true, // violation
        contentRef: 'src/content/projects/test.md',
        cardImage: '',
        heroImage: '',
        schemaType: 'CreativeWork',
        learningRefs: [],
      });
    });
  });

  it('10. Learning-project reference resolution resolves stable IDs and slugs deterministically', () => {
    const byId = resolveProjectRef('PRJ-LUMINA');
    assert.ok(byId);
    assert.equal(byId.slug, 'luminapraxisds');

    const bySlug = resolveProjectRef('luminapraxisds');
    assert.ok(bySlug);
    assert.equal(bySlug.projectId, 'PRJ-LUMINA');

    const unknown = resolveProjectRef('PRJ-NONEXISTENT');
    assert.equal(unknown, undefined);
  });

  it('11. Lifecycle badge class and label helpers map canonical states correctly', () => {
    assert.equal(getLifecycleBadgeClass('PRIVATE_BETA'), 'badge--beta');
    assert.equal(getLifecycleLabel('PRIVATE_BETA'), 'Private Beta');

    assert.equal(getLifecycleBadgeClass('IN_DEVELOPMENT'), 'badge--dev');
    assert.equal(getLifecycleLabel('IN_DEVELOPMENT'), 'In Entwicklung');

    assert.equal(getLifecycleBadgeClass('COMPLETED'), 'badge--done');
    assert.equal(getLifecycleLabel('COMPLETED'), 'Abgeschlossen');

    assert.equal(getLifecycleBadgeClass('CONCEPT'), 'badge--concept');
    assert.equal(getLifecycleLabel('CONCEPT'), 'Konzept / Aufbau');
  });

  it('12. Featured projects return exactly 6 active projects sorted by featuredOrder', () => {
    const featured = getFeaturedProjects();
    assert.equal(featured.length, 6);
    assert.equal(featured[0].slug, 'bridgenta');
    assert.equal(featured[1].slug, 'aeocortex');
    assert.equal(featured[2].slug, 'luminapraxisds');
    assert.equal(featured[3].slug, 'rootedrealitygarden');
    assert.equal(featured[4].slug, 'starcleaners');
    assert.equal(featured[5].slug, 'becc');
  });

  it('13. Portfolio Notice Layout & Relocation Contract (BGDE-PORTFOLIO-NOTICE-LAYOUT-FIX-001)', () => {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      return;
    }

    const publicSlugs = ['becc', 'bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];

    for (const slug of publicSlugs) {
      const htmlPath = path.join(distDir, `project-${slug}`, 'index.html');
      if (!fs.existsSync(htmlPath)) continue;

      const html = fs.readFileSync(htmlPath, 'utf8');

      // 1. Notices appear outside .portfolio-aside
      const asideMatch = html.match(/<aside class="portfolio-aside"[\s\S]*?<\/aside>/);
      assert.ok(asideMatch, `Sidebar must exist on /project-${slug}/`);
      const asideHtml = asideMatch[0];
      assert.equal(
        asideHtml.includes('project-notice-banner'),
        false,
        `Sidebar must not contain project-notice-banner on /project-${slug}/`
      );
      assert.equal(
        asideHtml.includes('class="notice"'),
        false,
        `Sidebar must not contain old .notice class on /project-${slug}/`
      );

      // Check whether project has a notice configured
      const hasNotice = slug === 'becc' || slug === 'bridgenta';

      if (hasNotice) {
        // 2. Notices appear after .detail-grid and before related-projects
        const detailGridIdx = html.indexOf('class="detail-grid"');
        const detailGridEndIdx = html.indexOf('</div>', detailGridIdx);
        const bannerIdx = html.indexOf('project-notice-banner');
        const relatedIdx = html.indexOf('class="related-projects"');

        assert.ok(bannerIdx > detailGridEndIdx, `Notice must appear after .detail-grid on /project-${slug}/`);
        if (relatedIdx !== -1) {
          assert.ok(bannerIdx < relatedIdx, `Notice must appear before related-projects on /project-${slug}/`);
        }

        // 3. Each notice appears exactly once
        const bannerElements = html.match(/<aside[^>]*class="[^"]*project-notice-banner/g) || [];
        assert.equal(bannerElements.length, 1, `Notice banner element must appear exactly once on /project-${slug}/`);

        // 5 & 6. Heading and content preservation
        if (slug === 'becc') {
          assert.ok(html.includes('Aktueller Entwicklungsstand'), 'BECC must retain heading Aktueller Entwicklungsstand');
          assert.ok(
            html.includes('Die beschriebene Entwicklungsphase ist abgeschlossen.'),
            'BECC must preserve exact notice text'
          );
        } else if (slug === 'bridgenta') {
          assert.ok(html.includes('Hinweis zur privaten Beta'), 'BridGenta must retain heading Hinweis zur privaten Beta');
          assert.ok(
            html.includes('BridGenta befindet sich in einer privaten Beta-Phase.'),
            'BridGenta must preserve exact notice text'
          );
        }
      } else {
        // 4. Empty notices render no notice section
        assert.equal(
          html.includes('project-notice-banner'),
          false,
          `Projects with no notice must not render notice banner (/project-${slug}/)`
        );
      }
    }
  });
});
