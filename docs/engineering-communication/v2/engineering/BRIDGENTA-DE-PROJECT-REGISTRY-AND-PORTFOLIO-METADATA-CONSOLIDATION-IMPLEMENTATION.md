# BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-IMPLEMENTATION

---

## 1. Executive Summary

This engineering implementation record documents the completion of workstream:

```text
BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-01
```

The objective was to eliminate fragile, dispersed, and hardcoded project visibility lists across `bridgenta.de`, establish a canonical Single Source of Truth (SSoT) Project Registry, and migrate all consumers without causing URL regressions, sitemap drift, or layout changes.

### Key Outcomes
- **Canonical Registry Established**: Implemented `src/data/project_registry.json` validated by a strict Zod schema in `src/utils/project_registry.ts`.
- **Duplicate Whitelists Removed**: Completely eliminated ad-hoc string whitelists (`primarySlugs`, `activeProjectSlugs`) from `src/pages/projects.astro`, `src/pages/project-[slug].astro`, `src/pages/sitemap.xml.ts`, `src/layouts/Layout.astro`, and `src/pages/index.astro`.
- **Zero URL / Route Regressions**: Exact 1:1 route parity maintained across all 5 public case study projects (`/project-bridgenta/`, `/project-aeocortex/`, `/project-luminapraxisds/`, `/project-rootedrealitygarden/`, `/project-starcleaners/`), with draft projects (`builddaddy`, `fdess`) safely withheld from production builds and sitemap.
- **Validation & Automated Tests Added**: Added build-blocking validation (`tooling/validate_project_registry.js`) and 12 comprehensive unit and invariant tests (`test/project_registry.test.js`), wired into `package.json` (`projects:validate`, `test:projects`) and `.github/workflows/deploy.yml`.
- **Gap Closure**: Directly closes `GAP-PORT-002` (Hardcoded Project Visibility & Filtering Architecture) while laying deterministic groundwork for `GAP-PORT-003` (Learning-to-Portfolio Evidence Disconnection) and `GAP-PORT-004` (BECC Production Engineering Showcase Absence).

---

## 2. Canonical Registry Schema Definition

The canonical Project Registry schema is governed by `src/utils/project_registry.ts` using Zod:

```typescript
export const LifecycleStateSchema = z.enum([
  'CONCEPT',
  'IN_DEVELOPMENT',
  'PRIVATE_BETA',
  'COMPLETED',
  'MAINTENANCE',
  'ARCHIVED',
]);

export const VisibilitySchema = z.enum([
  'PUBLIC',
  'UNLISTED',
  'PRIVATE',
  'DRAFT',
]);

export const SchemaTypeSchema = z.enum([
  'SoftwareApplication',
  'WebApplication',
  'CreativeWork',
]);

export const ProjectRegistryEntrySchema = z.object({
  projectId: z.string().regex(/^PRJ-[A-Z0-9_-]+$/, 'Invalid projectId format (must match ^PRJ-[A-Z0-9_-]+$)'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format (must be lowercase alphanumeric with hyphens)'),
  name: z.string().min(1),
  category: z.string().min(1),
  lifecycleState: LifecycleStateSchema,
  visibility: VisibilitySchema,
  featured: z.boolean(),
  featuredOrder: z.number().int().nonnegative().optional(),
  catalogOrder: z.number().int().nonnegative(),
  hasCaseStudy: z.boolean(),
  contentRef: z.string().min(1),
  cardImage: z.string(),
  heroImage: z.string(),
  schemaType: SchemaTypeSchema,
  learningRefs: z.array(z.string()).default([]),
}).refine(
  (data) => !data.hasCaseStudy || data.visibility === 'PUBLIC',
  {
    message: 'Only PUBLIC projects may have hasCaseStudy=true',
    path: ['hasCaseStudy'],
  }
);
```

### Invariants Enforced
1. **Unique IDs and Slugs**: All `projectId` values and `slug` values must be unique across the registry.
2. **Case Study Visibility Boundary**: A project cannot declare `hasCaseStudy: true` unless its visibility is `PUBLIC`.
3. **Content File Existence**: Every `contentRef` must reference an existing file under `src/content/projects/`.
4. **Markdown Exhaustion**: Every markdown file in `src/content/projects/` must map to an entry in the registry.

---

## 3. Populated Canonical Registry Dataset

The initial dataset in `src/data/project_registry.json` consolidates the 7 repository projects:

| Project ID | Slug | Name | Lifecycle State | Visibility | Featured (Order) | Catalog Order | Has Case Study | Public Route |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PRJ-BRIDGENTA` | `bridgenta` | BridGenta | `COMPLETED` | `PUBLIC` | Yes (1) | 1 | Yes | `/project-bridgenta` |
| `PRJ-AEOCORTEX` | `aeocortex` | AEOCortex | `COMPLETED` | `PUBLIC` | Yes (2) | 2 | Yes | `/project-aeocortex` |
| `PRJ-LUMINAPRAXISDS` | `luminapraxisds` | LuminaPraxisDS | `COMPLETED` | `PUBLIC` | Yes (3) | 3 | Yes | `/project-luminapraxisds` |
| `PRJ-ROOTEDREALITY` | `rootedrealitygarden` | Rooted Reality Garden | `COMPLETED` | `PUBLIC` | Yes (4) | 4 | Yes | `/project-rootedrealitygarden` |
| `PRJ-STARCLEANERS` | `starcleaners` | StarCleaners | `COMPLETED` | `PUBLIC` | Yes (5) | 5 | Yes | `/project-starcleaners` |
| `PRJ-BUILDDADDY` | `builddaddy` | BuildDaddy | `CONCEPT` | `DRAFT` | No | 6 | No | *(None — Withheld)* |
| `PRJ-FDESS` | `fdess` | FDESS | `CONCEPT` | `DRAFT` | No | 7 | No | *(None — Withheld)* |

---

## 4. Consumers Migrated

All five metadata-consumer surfaces have been refactored to consume the canonical registry via query helper functions:

### 1. `src/pages/projects.astro` (Projects Catalog)
- **Previous State**: Relied on `activeProjectSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners']` and inline switch-case for badge CSS classes.
- **Migrated State**:
  - Replaced filter with `getPublicProjects()` which loads registered projects where `visibility === 'PUBLIC'`.
  - Replaced inline badge styling with canonical `getLifecycleBadgeClass(project.lifecycleState)`.

### 2. `src/pages/project-[slug].astro` (Dynamic Case Study Route)
- **Previous State**: Hardcoded `primarySlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners']` inside `getStaticPaths()`. Hardcoded fallback hero image path `project.data.heroImage || '/placeholder.png'`.
- **Migrated State**:
  - `getStaticPaths()` now queries `getCaseStudyProjects()`.
  - Content entries are resolved by matching `entry.slug === project.slug`.
  - Hero image resolves through registry `project.heroImage`.
  - Lifecycle badge class and label resolve through `getLifecycleBadgeClass` and `getLifecycleLabel`.

### 3. `src/pages/sitemap.xml.ts` (Dynamic XML Sitemap)
- **Previous State**: Filtered content collection using `activeProjectSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners']`.
- **Migrated State**:
  - Replaced hardcoded list with `getSitemapProjectRoutes()`.
  - Generates `<url><loc>https://bridgenta.de/project-${p.slug}</loc></url>` dynamically from canonical public projects.

### 4. `src/layouts/Layout.astro` (Site Footer Project Navigation)
- **Previous State**: Hardcoded list of 5 active slugs in the footer projects section.
- **Migrated State**:
  - Calls `getPublicProjects()` to dynamically render links to `/project-${p.slug}` using `p.name`.

### 5. `src/pages/index.astro` (Homepage Featured Projects)
- **Previous State**: Hardcoded static HTML markup for 5 cards with duplicated titles, tags, descriptions, and URLs.
- **Migrated State**:
  - Queries `getFeaturedProjects()` sorted by `featuredOrder`.
  - Maps entries dynamically while preserving byte-for-byte visual markup, CSS classes, tags, and descriptive copy.

---

## 5. Duplicate Whitelists Eliminated

A global search across `src/` for `primarySlugs` and `activeProjectSlugs` confirms total elimination:
- Occurrences before migration: 3 distinct hardcoded arrays.
- Occurrences after migration: 0.

---

## 6. Validation and Testing Tooling Added

Two validation tools were created:

### 1. Pre-build / CI Validator: `tooling/validate_project_registry.js`
- Validates `src/data/project_registry.json` against `ProjectRegistryEntrySchema`.
- Confirms file existence for every `contentRef`.
- Confirms that every file in `src/content/projects/*.md` is registered.
- Validates unique project IDs and slugs.
- Script wired to `npm run projects:validate` and added to `deploy.yml`.

### 2. Test Suite: `test/project_registry.test.js`
Contains 12 automated unit and invariant assertions:
1. All registered projects have unique project IDs matching canonical format (`^PRJ-[A-Z0-9_-]+$`).
2. All registered projects have unique lowercase URL-safe slugs.
3. Lifecycle state schema accepts valid enum values and rejects invalid values.
4. Visibility schema accepts valid enum values and rejects invalid values.
5. Every registry entry points to an existing markdown content file.
6. Every markdown content file in `src/content/projects/` is accounted for in the registry.
7. Public case-study projects generate exact expected 5 public routes.
8. Draft projects (`builddaddy`, `fdess`) are excluded from public case studies and sitemap.
9. Invariant: non-public projects cannot declare `hasCaseStudy=true`.
10. Learning-project reference resolution resolves stable IDs and slugs deterministically.
11. Lifecycle badge class and label helpers map canonical states correctly.
12. Featured projects return exactly 5 active projects sorted by `featuredOrder`.

Wired to `npm run test:projects` and added to `deploy.yml`.

---

## 7. URL and Route Preservation Evidence

| Route URL | Pre-Migration Status | Post-Migration Status | Sitemap Inclusion |
| :--- | :--- | :--- | :--- |
| `https://bridgenta.de/projects` | `200 OK` (Catalog of 5) | `200 OK` (Catalog of 5) | Yes |
| `https://bridgenta.de/project-bridgenta` | `200 OK` (Case Study) | `200 OK` (Case Study) | Yes |
| `https://bridgenta.de/project-aeocortex` | `200 OK` (Case Study) | `200 OK` (Case Study) | Yes |
| `https://bridgenta.de/project-luminapraxisds` | `200 OK` (Case Study) | `200 OK` (Case Study) | Yes |
| `https://bridgenta.de/project-rootedrealitygarden` | `200 OK` (Case Study) | `200 OK` (Case Study) | Yes |
| `https://bridgenta.de/project-starcleaners` | `200 OK` (Case Study) | `200 OK` (Case Study) | Yes |
| `https://bridgenta.de/project-builddaddy` | `404 Not Found` (Draft) | `404 Not Found` (Draft) | No |
| `https://bridgenta.de/project-fdess` | `404 Not Found` (Draft) | `404 Not Found` (Draft) | No |

Total static pages built: **30 pages** (identical to pre-migration baseline).

---

## 8. Gap Closure & Forward Compatibility Assessment

### GAP-PORT-002: Hardcoded Project Visibility & Filtering Architecture
- **Status**: **CLOSED**.
- **Justification**: Project visibility, catalog ordering, featured placement, case study routing, and sitemap inclusion are now centrally governed by `src/data/project_registry.json`. No consumer defines an ad-hoc slug array. Changing a project's visibility or adding a new project requires updating only the canonical registry.

### GAP-PORT-003: Learning-to-Portfolio Evidence Disconnection
- **Status**: **NOT CLAIMED CLOSED (Foundational Groundwork Implemented)**.
- **Justification**: The Project Registry schema includes `learningRefs` and `resolveProjectRef(identifier)`. This allows learning articles to reference canonical project IDs (`PRJ-BRIDGENTA`, etc.) deterministically. Full closure requires migrating learning frontmatter and building cross-linking presentation, which belongs to its own dedicated workstream.

### GAP-PORT-004: BECC Production Engineering Showcase Absence
- **Status**: **NOT CLAIMED CLOSED (Foundational Groundwork Implemented)**.
- **Justification**: The Project Registry schema is prepared to host BECC as a canonical project entry (`PRJ-BECC`) when authorized. A dedicated case study, architectural diagrams, and production evidence links will be implemented in a subsequent workstream.

---

## 9. Security, Secret & PII Audit

- **Zero Secrets**: No API keys, database credentials, internal Render tokens, or bearer tokens are present in `src/data/project_registry.json` or helper code.
- **Zero Internal Data Leakage**: Draft projects (`builddaddy`, `fdess`) expose only high-level conceptual titles and categories, with content files remaining unrendered in production HTML.
- **Input Validation**: All entries are parsed and validated via Zod at build time.

---

## 10. Regression Verification Suite Results

| Test Suite / Tool | Command | Scope | Result | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Project Registry Tests** | `npm run test:projects` | Registry Unit Tests | **PASS** | 12 tests passing, 0 failures |
| **Project Registry Validation** | `npm run projects:validate` | Integrity & Schema Check | **PASS** | 7 projects verified, 0 errors |
| **Astro Diagnostics** | `npx astro check` | Type & Syntax Check | **PASS** | 30 files, 0 errors, 0 warnings |
| **Astro Static Build** | `npm run build` | Full Static Generation | **PASS** | 30 pages built cleanly |
| **HTML Link Audit** | `node tooling/audit_links.cjs` | Output Link Integrity | **PASS** | 32 HTML files audited, all links valid |
| **Markdown Lint** | `npm run lint` | Documentation Linter | **PASS** | All markdown files conforming |
| **Markdown Link Check** | `npm run check-links` | Doc Relative Links | **PASS** | All relative links valid |
| **Learning Article Validation** | `npm run learning:validate` | Learning Content SSoT | **PASS** | 14 articles valid |
| **Governed Learning Tests** | `npm test --prefix packages/governed-learning` | Domain & Engine Tests | **PASS** | 310 tests passing, 0 failures |
| **BECC Runtime Tests** | `npm test --prefix becc-runtime` | Runtime & HTTP Tests | **PASS** | 320 tests passing, 0 failures |

---

## 11. Sign-off Readiness Statement

The implementation is verified, stable, secret-free, and adheres strictly to the single-source-of-truth and change discipline policies.
It is ready for branch commit, pull request creation, and independent certification review (`R1`).
