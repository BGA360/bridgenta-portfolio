import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as parse5 from 'parse5';

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

    // Helper functions for DOM hierarchy inspection
    function findNodeByClass(node, className) {
      if (node.attrs) {
        const classAttr = node.attrs.find(a => a.name === 'class');
        if (classAttr && classAttr.value.split(/\s+/).includes(className)) {
          return node;
        }
      }
      if (node.childNodes) {
        for (const child of node.childNodes) {
          const found = findNodeByClass(child, className);
          if (found) return found;
        }
      }
      return null;
    }

    function findParent(root, target) {
      if (!root.childNodes) return null;
      for (const child of root.childNodes) {
        if (child === target) return root;
        const found = findParent(child, target);
        if (found) return found;
      }
      return null;
    }

    function isDescendant(parent, target) {
      if (!parent || !parent.childNodes) return false;
      for (const child of parent.childNodes) {
        if (child === target) return true;
        if (isDescendant(child, target)) return true;
      }
      return false;
    }

    const publicSlugs = ['becc', 'bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];

    for (const slug of publicSlugs) {
      const htmlPath = path.join(distDir, `project-${slug}`, 'index.html');
      if (!fs.existsSync(htmlPath)) continue;

      const html = fs.readFileSync(htmlPath, 'utf8');
      const document = parse5.parse(html);

      const detailGrid = findNodeByClass(document, 'detail-grid');
      const portfolioAside = findNodeByClass(document, 'portfolio-aside');
      const noticeBanner = findNodeByClass(document, 'project-notice-banner');

      assert.ok(detailGrid, `detailGrid must exist on /project-${slug}/`);
      assert.ok(portfolioAside, `portfolioAside must exist on /project-${slug}/`);

      // 1. Sidebar cleanliness: notices never exist inside .portfolio-aside
      assert.equal(
        isDescendant(portfolioAside, noticeBanner),
        false,
        `.project-notice-banner must not be a descendant of .portfolio-aside on /project-${slug}/`
      );
      const asideMatch = html.match(/<aside class="portfolio-aside"[\s\S]*?<\/aside>/);
      assert.ok(asideMatch, `Sidebar must exist on /project-${slug}/`);
      assert.equal(
        asideMatch[0].includes('class="notice"'),
        false,
        `Sidebar must not contain old .notice class on /project-${slug}/`
      );

      const hasNotice = slug === 'becc' || slug === 'bridgenta';

      if (hasNotice) {
        assert.ok(noticeBanner, `project-notice-banner must exist on /project-${slug}/`);

        // 2. DOM hierarchy validation:
        // .project-notice-banner must NOT be a descendant of .detail-grid
        assert.equal(
          isDescendant(detailGrid, noticeBanner),
          false,
          `.project-notice-banner must NOT be a descendant of .detail-grid on /project-${slug}/`
        );

        // .project-notice-banner must NOT be a descendant of .portfolio-aside
        assert.equal(
          isDescendant(portfolioAside, noticeBanner),
          false,
          `.project-notice-banner must NOT be a descendant of .portfolio-aside on /project-${slug}/`
        );

        // .project-notice-banner must be a sibling of .detail-grid sharing the same parent container
        const parentOfGrid = findParent(document, detailGrid);
        const parentOfBanner = findParent(document, noticeBanner);
        assert.ok(parentOfGrid, `detailGrid must have a parent container on /project-${slug}/`);
        assert.equal(
          parentOfBanner,
          parentOfGrid,
          `.project-notice-banner must be a sibling of .detail-grid sharing the same parent on /project-${slug}/`
        );

        // Sibling order: .project-notice-banner must follow .detail-grid
        const gridIndex = parentOfGrid.childNodes.indexOf(detailGrid);
        const bannerIndex = parentOfBanner.childNodes.indexOf(noticeBanner);
        assert.ok(
          bannerIndex > gridIndex,
          `.project-notice-banner must follow .detail-grid as a sibling in DOM order on /project-${slug}/`
        );

        // 3. Each notice banner appears exactly once
        const bannerElements = html.match(/<aside[^>]*class="[^"]*project-notice-banner/g) || [];
        assert.equal(bannerElements.length, 1, `Notice banner element must appear exactly once on /project-${slug}/`);

        // 4. Exact heading and frontmatter content preservation
        if (slug === 'becc') {
          assert.ok(html.includes('Aktueller Entwicklungsstand'), 'BECC must retain heading Aktueller Entwicklungsstand');
          assert.ok(
            html.includes('Die beschriebene Entwicklungsphase ist abgeschlossen. Die Fallstudie unterscheidet getestete Funktionen von eingerichteten und noch offenen Prüfungen. Die BECC Operations Console ist ein Interface-Entwurf und kein Nachweis für Live-Monitoring. Interne Zugangsdaten und sicherheitskritische Einstellungen werden nicht veröffentlicht.'),
            'BECC must preserve exact frontmatter notice text'
          );
        } else if (slug === 'bridgenta') {
          assert.ok(html.includes('Hinweis zur privaten Beta'), 'BridGenta must retain heading Hinweis zur privaten Beta');
          assert.ok(
            html.includes('BridGenta befindet sich in einer privaten Beta-Phase. Die öffentlich gezeigten Abbildungen dokumentieren ausgewählte, freigegebene Einblicke in die Methodik und Benutzeroberfläche. Nicht veröffentlichte Produktfunktionen, interne Abläufe und Implementierungsdetails bleiben vertraulich.'),
            'BridGenta must preserve exact frontmatter notice text'
          );
        }
      } else {
        // 5. Empty notices render no notice section
        assert.equal(
          noticeBanner,
          null,
          `Projects with no notice must not render .project-notice-banner (/project-${slug}/)`
        );
      }
    }
  });
});
