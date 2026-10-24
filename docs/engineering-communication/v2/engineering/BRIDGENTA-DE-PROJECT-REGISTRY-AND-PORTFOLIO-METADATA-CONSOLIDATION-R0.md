# BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-R0 — Gap Recovery, SSoT Boundary & Implementation Contract

**Document ID**: `BRIDGENTA-DE-PROJECT-REGISTRY-R0-001`  
**Workstream**: `BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-R0-01`  
**Date**: `2026-10-24`  
**Target Repository**: `bridgenta-portfolio` (`fdrefs`)  
**Status**: `COMPLETED & AUTHORIZED`  

---

## Executive Summary

This R0 specification defines the architectural boundary, Single Source of Truth (SSoT) contract, failure behaviors, migration strategy, and validation rules for:

`BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-01`

This document establishes that:
1. All 5 Post-BECC gaps (`GAP-PORT-001` through `GAP-PORT-005`) have been recovered from repository evidence.
2. The consolidation workstream directly targets and closes **GAP-PORT-002** (Hardcoded Project Visibility & Filtering Architecture), while establishing the foundational data structures for **GAP-PORT-003** (Learning-to-Portfolio Evidence Disconnection) and **GAP-PORT-004** (BECC Production Engineering Showcase Absence).
3. The canonical project registry (`src/data/project_registry.json`) replaces 5 duplicated occurrences of hardcoded project whitelists across 4 Astro page/component files, as well as hardcoded static HTML cards on the homepage.
4. BECC production infrastructure and `becc-runtime` remain strictly **FROZEN** and untouched.
5. The proprietary BridGenta Reconstruction platform and its "First 100 Testers" initiative remain strictly separate from `bridgenta.de`.
6. Implementation is **AUTHORIZED** under strict zero-URL-regression constraints.

---

## 1. Canonical Repository Baseline (Stage 0)

| Metric | Measured Value | Status |
| :--- | :--- | :--- |
| **Current Branch** | `main` | PASS |
| **Origin Main SHA** | `5476c5edc64927049506138ba324b4fd69756834` | PASS |
| **Working Tree State** | CLEAN (tracked tree has zero uncommitted modifications) | PASS |
| **Canonical Main CI** | PASS (GitHub Actions Run `40078824683`, 3m7s) | PASS |

---

## 2. Recovered Post-BECC Gap Definitions (Stage 1)

All five gaps identified in the Post-BECC review (`BRIDGENTA-DE-POST-BECC-PORTFOLIO-LEARNING-SYSTEM-STATE-REVIEW.md`) were verified against repository artifacts:

### GAP-PORT-001: M5 Shadow-to-Enforcement Readiness Deficit
- **Domain**: Learning System / Stewardship
- **Observed Evidence**: `stewardship/reports/m5-enforcement-readiness.json` reports `assessmentState: ENFORCEMENT_NOT_READY`. 93 observation reports record unreviewed attention cases because only 5 articles have `.review.md` files in `stewardship/reviews/`, and only 1 provenance event (`EV-BG-003`) is cleared in `clearances_manifest.json`.
- **Why It Matters**: Prevents closing the provenance verification loop. If M5 is switched from `SHADOW` to `ENFORCING`, 13 of 14 articles would be withheld from public indexing.
- **User Impact**: Potential loss of public access to valid learning content if policy enforcement is activated prematurely.
- **Technical Impact**: Blocks graduation from shadow observation to active gate enforcement.
- **Governance Impact**: Incomplete stewardship documentation prevents policy enforcement.
- **Severity**: P1 (High)
- **Urgency**: Medium-High
- **Dependencies**: Individual article stewardship reviews and clearance signing.
- **Implementation Scope**: Content reviews and clearance manifest updates.
- **Recommended Action**: Complete reviews for remaining 9 articles in a dedicated stewardship workstream.

### GAP-PORT-002: Hardcoded Project Visibility & Filtering Architecture
- **Domain**: Portfolio Architecture / SSoT
- **Observed Evidence**: The array `['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners']` is copy-pasted across `src/pages/projects.astro` (L7), `src/pages/project-[slug].astro` (L10, L22), `src/pages/sitemap.xml.ts` (L10), and `src/layouts/Layout.astro` (L46). The homepage `src/pages/index.astro` (L118-200) contains hardcoded static HTML project cards. Inactive projects `builddaddy.md` and `fdess.md` are unrouted orphans.
- **Why It Matters**: Direct violation of the Single Source of Truth (SSoT) principle. Adding or changing a project requires synchronizing 5 files. Route drift and broken links are an ongoing operational risk.
- **User Impact**: Inconsistent project listings or 404 errors if templates drift.
- **Technical Impact**: Tight coupling between presentation templates and arbitrary string arrays.
- **Governance Impact**: Absence of a single authoritative project registry.
- **Severity**: P1 (High)
- **Urgency**: High (Foundational)
- **Dependencies**: None.
- **Implementation Scope**: Introduce canonical JSON registry, typed query API, update templates, eliminate hardcoded arrays.
- **Recommended Action**: Implement `BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-01`.

### GAP-PORT-003: Learning-to-Portfolio Evidence Disconnection
- **Domain**: Portfolio & Learning Integration
- **Observed Evidence**: Learning articles cite concrete engineering incidents and provenance events (`EV-BG-001`..`EV-BG-014`) from real portfolio projects (e.g. Lumina Praxis CSS collisions, TinaCMS revert), but project case study templates (`src/pages/project-[slug].astro`) do not cross-reference these learning articles.
- **Why It Matters**: Competency claims in portfolio case studies lack direct links to published technical evidence.
- **User Impact**: Technical recruiters cannot easily navigate from a project claim to the underlying technical lesson.
- **Technical Impact**: Siloed collections with no relational querying between projects and articles.
- **Governance Impact**: Weakens the portfolio's evidence-first claim.
- **Severity**: P2 (Medium)
- **Urgency**: Medium
- **Dependencies**: GAP-PORT-002 (requires stable project IDs).
- **Implementation Scope**: Linkage data model and case study UI components.
- **Recommended Action**: Follow-up workstream following registry consolidation.

### GAP-PORT-004: BECC Production Engineering Showcase Absence
- **Domain**: Portfolio Showcase / Evidence
- **Observed Evidence**: The live, verified BECC v2 production runtime (`becc.bridgenta.de`, persistent PostgreSQL, strict CA-verified TLS, automated backups, 7-day PITR, 630 passing tests) is completely missing from the portfolio project list.
- **Why It Matters**: Significant proof of backend, cloud infrastructure, and DevOps capability is hidden from visitors.
- **User Impact**: Visitors only see frontend case studies, missing verified backend engineering competency.
- **Technical Impact**: Missing project entry and route.
- **Governance Impact**: Incomplete showcase of the owner's actual engineering stack.
- **Severity**: P2 (Medium)
- **Urgency**: Medium
- **Dependencies**: GAP-PORT-002 (registry enables clean registration of BECC v2).
- **Implementation Scope**: Authoring BECC v2 project entry and case study.
- **Recommended Action**: Author BECC v2 case study following registry consolidation.

### GAP-PORT-005: Webmaster Experience Evidence Depth Gap
- **Domain**: Portfolio Content / History
- **Observed Evidence**: Trust badges cite "Webmaster seit 2009", but only one static card exists on `/projects` linking to `/about`. No structured historical case studies exist for pre-2025 systems.
- **Why It Matters**: Longstanding experience is asserted without structured case study evidence.
- **User Impact**: Potential clients cannot review past webmaster project case studies.
- **Technical Impact**: Content gap.
- **Governance Impact**: Historical claims lack structured documentation.
- **Severity**: P3 (Low)
- **Urgency**: Low
- **Dependencies**: None.
- **Implementation Scope**: Content authoring.
- **Recommended Action**: Author historical case studies when priorities permit.

---

## 3. Gap Coverage Mapping (Stage 2)

| Gap ID | Proposed Registry Workstream Classification | Rationale |
| :--- | :--- | :--- |
| **GAP-PORT-002** | **DIRECTLY_CLOSED** | The registry workstream establishes the canonical metadata SSoT, eliminates duplicated whitelists, and reconciles orphan content. |
| **GAP-PORT-003** | **PARTIALLY_ADDRESSED** | Establishes the stable project identifiers (`projectId`) and schema relations needed for learning article linkage. |
| **GAP-PORT-004** | **PARTIALLY_ADDRESSED** | Enables declaring BECC v2 as an active project cleanly in metadata without hacking template whitelists. |
| **GAP-PORT-001** | **OUT_OF_SCOPE** | Belongs to stewardship reviews and clearance signing; independent of project metadata. |
| **GAP-PORT-005** | **OUT_OF_SCOPE** | Involves retrospective content authoring; independent of registry architecture. |

---

## 4. Current Project-Metadata Sources & Authority Map (Stage 3)

The audit revealed **8 distinct locations** managing project metadata:

| Source ID | File / Location | Data Owned | Authority Type | Consumers | Drift Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SRC-01** | `src/content/projects/*.md` (7 files) | Narrative, title, subtitle, sidebar details | CANONICAL (Content) | `project-[slug].astro`, `projects.astro` | Low for text; High for lifecycle |
| **SRC-02** | `src/content/config.ts` | Zod schema for project frontmatter | CANONICAL (Schema) | Astro content collection loader | Medium (loose strings, no enums) |
| **SRC-03** | `src/pages/projects.astro` (L7) | `primarySlugs = [...]` | HARDCODED / DUPLICATE | Project index `/projects` | High (governs visibility) |
| **SRC-04** | `src/pages/project-[slug].astro` (L10) | `activeProjectSlugs = [...]` in `getStaticPaths` | HARDCODED / DUPLICATE | Astro route generator | Critical (governs route existence) |
| **SRC-05** | `src/pages/project-[slug].astro` (L22) | `activeProjectSlugs = [...]` in pagination | HARDCODED / DUPLICATE | Prev/Next navigation | High (pagination drift) |
| **SRC-06** | `src/pages/sitemap.xml.ts` (L10) | `activeProjectSlugs = [...]` | HARDCODED / DUPLICATE | Search engine sitemap | High (discovery drift) |
| **SRC-07** | `src/layouts/Layout.astro` (L46) | `activeProjectSlugs = [...]` | HARDCODED / DUPLICATE | Footer project links | Medium (footer drift) |
| **SRC-08** | `src/pages/index.astro` (L118-200) | 5 static HTML project cards | HARDCODED / SILO | Homepage featured section | High (does not use collections) |

---

## 5. Hardcoded Routing & Visibility Logic Findings (Stage 4)

1. **FINDING-01 (`src/pages/projects.astro`, L7)**:
   - `const primarySlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];`
   - Filters out any other markdown file in `src/content/projects/`.
   - *Replacement*: `getPublicProjects()` derived from registry.
2. **FINDING-02 (`src/pages/project-[slug].astro`, L10)**:
   - `const activeProjectSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];`
   - Restricts dynamic route generation in `getStaticPaths()`.
   - *Replacement*: `getCaseStudyProjects()` derived from registry.
3. **FINDING-03 (`src/pages/project-[slug].astro`, L22)**:
   - Duplicates the exact same array to compute previous and next project pagination.
   - *Replacement*: `getOrderedPublicProjects()` derived from registry.
4. **FINDING-04 (`src/pages/sitemap.xml.ts`, L10)**:
   - Duplicates the exact same array to decide which `/project-${slug}/` URLs are included in `sitemap.xml`.
   - *Replacement*: `getSitemapProjectRoutes()` derived from registry.
5. **FINDING-05 (`src/layouts/Layout.astro`, L46)**:
   - Duplicates the exact same array to query projects for the global footer.
   - *Replacement*: `getPublicProjects()` derived from registry.
6. **FINDING-06 (`src/pages/index.astro`, L118-200)**:
   - 5 featured project cards are completely hardcoded HTML blocks.
   - *Replacement*: Dynamic mapping of `getFeaturedProjects()` derived from registry.
7. **FINDING-07 (`src/content/projects/builddaddy.md` & `fdess.md`)**:
   - Two valid markdown files exist on disk but are completely invisible because they are excluded from the hardcoded whitelists.
   - *Replacement*: Explicitly registered with `lifecycleState: "CONCEPT"` and `visibility: "DRAFT"`.

---

## 6. Authority Evaluation (Stage 5)

- **PROJECT_LIFECYCLE_AUTHORITY**: **CONFLICTING**
  - Markdown frontmatter declares freeform German strings (`'In Entwicklung'`, `'Private Beta'`, `'Abgeschlossen'`, `'Konzept / Aufbau'`).
  - Template code switches on exact German strings to assign badge CSS classes.
  - Schema.org logic checks for `'In Entwicklung'` only.
  - *Resolution*: Introduce canonical enum `LifecycleStateEnum`.
- **PROJECT_VISIBILITY_AUTHORITY**: **DUPLICATED**
  - Visibility is controlled by hardcoded arrays across 4 files.
  - Markdown files declare no visibility fields.
  - *Resolution*: Introduce canonical enum `VisibilityEnum` in the registry.
- **PROJECT_PUBLICATION_AUTHORITY**: **FRAGILE**
  - Publication is an implicit side-effect of presence in the hardcoded whitelist arrays.
  - *Resolution*: Canonical registry dictates `visibility === 'PUBLIC' && hasCaseStudy === true`.

---

## 7. Canonical Project Registry Boundary & Field Contract (Stage 6)

The canonical registry file will be located at:
`src/data/project_registry.json`

### Field Ownership Contract

| Field Name | Type | Owner | Valid Values / Constraints | Required? | Consumer / Derivation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `projectId` | `string` | Registry | Regex `^PRJ-[A-Z0-9_-]+$` (e.g. `PRJ-BRIDGENTA`) | YES | Permanent identity for evidence linkages |
| `slug` | `string` | Registry | Lowercase URL slug (e.g. `bridgenta`) | YES | Generates `/project-${slug}/` URL |
| `name` | `string` | Registry | Non-empty string | YES | Display title for listings and schema |
| `category` | `string` | Registry | Category label (e.g. `Praxis-Website / Web-App`) | YES | Card metadata, Schema.org |
| `lifecycleState`| `enum` | Registry | `CONCEPT`, `IN_DEVELOPMENT`, `PRIVATE_BETA`, `COMPLETED`, `MAINTENANCE`, `ARCHIVED` | YES | Determines badge class and status |
| `visibility` | `enum` | Registry | `PUBLIC`, `UNLISTED`, `PRIVATE`, `DRAFT` | YES | Determines public catalog and sitemap inclusion |
| `featured` | `boolean` | Registry | `true`, `false` | YES | Determines homepage inclusion |
| `featuredOrder`| `number` | Registry | Non-negative integer (optional) | NO | Sort order on homepage |
| `catalogOrder` | `number` | Registry | Non-negative integer | YES | Sort order on `/projects` page |
| `hasCaseStudy` | `boolean` | Registry | `true`, `false` | YES | Determines route generation in `getStaticPaths` |
| `contentRef` | `string` | Registry | Relative path to markdown file in `src/content/projects/` | YES | Links registry entry to narrative content |
| `heroImage` | `string` | Registry | Relative asset path (e.g. `/images/.../Hero.webp`) | YES | Card visual and detail header |
| `schemaType` | `enum` | Registry | `SoftwareApplication`, `WebApplication`, `CreativeWork` | YES | Schema.org `@type` |
| `learningRefs` | `string[]` | Registry | Array of learning article slugs or event IDs | NO | Cross-links to published learning evidence |

### Content-Owned Fields (Remains in Markdown)
- `subtitle`, `description`, `seoTitle`, `seoDescription`
- `sidebar.technologies`, `sidebar.devStack`, `sidebar.aiBuilders`, `sidebar.notice`
- `artifacts`, `resultsGrid`, `cta`, `sectionTitles`
- Long-form markdown body (Problem, Solution, Architectural insights)

---

## 8. Non-Ownership Boundaries (Stage 7)

The Canonical Project Registry must **NOT** own:
1. Long-form prose and case study narrative (owned exclusively by markdown content files).
2. Deployed runtime state, database connection strings, or cloud secrets (managed by Render / BECC runtime).
3. Governed learning domain aggregated entities or candidate review records (owned by `packages/governed-learning`).
4. Proprietary algorithms, pilot code, or commercial data of the BridGenta Reconstruction platform.
5. BridGenta Reconstruction **First 100 Testers** workflows, testing data, or reviewer credentials.
6. Binary media files (stored under `/public/images/`).

---

## 9. Canonical Data Flow (Stage 8)

```
                       +-----------------------------------+
                       |    src/data/project_registry.json  | (SSoT)
                       +-----------------+-----------------+
                                         │
                                         ▼
                       +-----------------------------------+
                       |    src/utils/project_registry.ts   | (Validated Query API)
                       +-----------------+-----------------+
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
+-------------------+           +-------------------+           +-------------------+
| /projects         |           | /project-[slug]   |           | sitemap.xml.ts    |
| (getPublicProjects)|          | (getCaseStudy... ) |          | (getSitemapRoutes)|
+-------------------+           +-------------------+           +-------------------+
         │                               │                               │
         ▼                               ▼                               ▼
+-------------------+           +-------------------+           +-------------------+
| Homepage Featured |           | Layout Footer     |           | Schema.org Graph  |
| (getFeatured... ) |           | (getPublicProjects)|          | (getProjectSchema)|
+-------------------+           +-------------------+           +-------------------+
```

---

## 10. Learning-Evidence Project Reference Contract (Stage 9)

- Every project has a permanent `projectId` formatted as `PRJ-[A-Z0-9_-]+`.
- Learning articles referencing a project MUST reference this stable `projectId` (e.g. `projectRef: "PRJ-LUMINA"`).
- Renaming a URL slug does not break historical learning references because references bind to `projectId`, not `slug`.
- If a learning article references a `projectId` that does not exist in `project_registry.json`, the validation fails closed (`FAIL_BUILD`).
- If a referenced project has `visibility: "PRIVATE"`, the reference resolves with `visibilityState: "PRIVATE"` without exposing private metadata.

---

## 11. Migration Strategy (Stage 10)

The implementation must follow a 6-phase zero-downtime, exact-parity migration:

1. **Phase 1 — Introduction**: Create `src/data/project_registry.json` and `src/utils/project_registry.ts` with Zod schema validation.
2. **Phase 2 — Ingestion of Truth**: Populate the registry with all 7 projects:
   - `PRJ-BRIDGENTA` (`slug: "bridgenta"`, `visibility: "PUBLIC"`, `featured: true`, `order: 1`)
   - `PRJ-AEOCORTEX` (`slug: "aeocortex"`, `visibility: "PUBLIC"`, `featured: true`, `order: 2`)
   - `PRJ-LUMINA` (`slug: "luminapraxisds"`, `visibility: "PUBLIC"`, `featured: true`, `order: 3`)
   - `PRJ-ROOTED` (`slug: "rootedrealitygarden"`, `visibility: "PUBLIC"`, `featured: true`, `order: 4`)
   - `PRJ-STARCLEANERS` (`slug: "starcleaners"`, `visibility: "PUBLIC"`, `featured: true`, `order: 5`)
   - `PRJ-BUILDDADDY` (`slug: "builddaddy"`, `visibility: "DRAFT"`, `hasCaseStudy: false`, `order: 6`)
   - `PRJ-FDESS` (`slug: "fdess"`, `visibility: "DRAFT"`, `hasCaseStudy: false`, `order: 7`)
3. **Phase 3 — Parity Verification**: Run validation to verify that registry-derived public projects match the current hardcoded lists with 100% identity.
4. **Phase 4 — Consumer Cutover**: Refactor `projects.astro`, `project-[slug].astro`, `sitemap.xml.ts`, `Layout.astro`, and `index.astro` to call `project_registry.ts` APIs.
5. **Phase 5 — Cleanup**: Delete the hardcoded whitelist arrays and obsolete German string mappings.
6. **Phase 6 — Regression Testing**: Verify `astro check`, `astro build`, `npm run lint`, `npm run check-links`, and confirm all 30 HTML output paths are preserved.

---

## 12. Failure & Refusal Contract (Stage 11)

| Condition | Deterministic Action |
| :--- | :--- |
| Duplicate `projectId` | `FAIL_BUILD` |
| Duplicate `slug` | `FAIL_BUILD` |
| Missing required field in registry | `FAIL_BUILD` |
| Invalid `lifecycleState` or `visibility` enum | `FAIL_BUILD` |
| Registry `contentRef` points to non-existent markdown file | `FAIL_BUILD` |
| Markdown file in `src/content/projects/` not in registry | `FAIL_VALIDATION` (orphan content rejection) |
| Learning article references unknown `projectId` | `FAIL_BUILD` |
| Private project marked `hasCaseStudy: true` | `FAIL_VALIDATION` & `EXCLUDE_FROM_PUBLIC_OUTPUT` |

---

## 13. Validation Contract (Stage 12)

The implementation workstream will create `tooling/validate_project_registry.js` integrated into `npm run projects:validate` and CI, validating:
1. All `projectId` values conform to `^PRJ-[A-Z0-9_-]+$`.
2. All `slug` values conform to `^[a-z0-9-]+$`.
3. Bi-directional integrity between `src/data/project_registry.json` and `src/content/projects/*.md`.
4. The exact 5 canonical routes are generated and no private routes leak:
   - `/project-bridgenta/`
   - `/project-aeocortex/`
   - `/project-luminapraxisds/`
   - `/project-rootedrealitygarden/`
   - `/project-starcleaners/`
5. Zero occurrences of hardcoded whitelist arrays remain in `.astro` or `.ts` files.

---

## 14. Security & Privacy Boundary (Stage 13)

- **PUBLIC_FIELDS**: `projectId`, `slug`, `name`, `category`, `lifecycleState`, `visibility`, `featured`, `catalogOrder`, `heroImage`, `routePath`.
- **INTERNAL_FIELDS**: `contentRef`, `learningRefs`.
- **FORBIDDEN_FIELDS**: Secrets, passwords, API tokens, database connection URIs, customer PII, internal IP addresses, proprietary Reconstruction pilot source code.
- **Exposure Risk**: **NO**. The registry is a static JSON file containing only published metadata.

---

## 15. Implementation Scope & File Breakdown (Stage 14)

### NEW Files
- `src/data/project_registry.json` (canonical SSoT data)
- `src/utils/project_registry.ts` (typed query helper module)
- `tooling/validate_project_registry.js` (validation script)

### MODIFIED Files
- `src/pages/projects.astro` (use `getPublicProjects()`)
- `src/pages/project-[slug].astro` (use `getCaseStudyProjects()`)
- `src/pages/sitemap.xml.ts` (use `getSitemapProjectRoutes()`)
- `src/layouts/Layout.astro` (use `getPublicProjects()`)
- `src/pages/index.astro` (use `getFeaturedProjects()`)
- `src/content/config.ts` (align collection schema)
- `package.json` (add `projects:validate` script)

### DO NOT TOUCH Files
- `becc-runtime/*` (frozen BECC infrastructure)
- `packages/governed-learning/*` (frozen domain contracts)
- `src/styles/styles.css` (visual styles)
- `docs/engineering-communication/v2/engineering/BECC-NEXT-*` (BECC certificates)

---

## 16. Out of Scope (Stage 15)

1. Modifying Render cloud services, PostgreSQL database, or TLS configuration.
2. Modifying `becc-runtime` HTTP endpoints or code.
3. Modifying `packages/governed-learning` contracts or refusal codes.
4. Authoring new project case study narratives.
5. Modifying BridGenta Reconstruction governance or importing "First 100 Testers".
6. Overhauling portfolio layout, themes, or CSS.
7. Activating M5 policy enforcement.

---

## 17. Success Criteria & Stop Conditions (Stages 16 & 17)

### Acceptance Criteria
- One canonical project registry exists at `src/data/project_registry.json`.
- All 7 existing projects (`bridgenta`, `aeocortex`, `luminapraxisds`, `rootedrealitygarden`, `starcleaners`, `builddaddy`, `fdess`) are formally registered.
- All 5 public project URLs remain 100% identical and render properly.
- All hardcoded project whitelists are removed from page templates.
- `npx astro check`, `npm run build`, `npm run lint`, `npm run check-links` pass with zero errors.
- All 630 automated unit and integration tests remain green.

### Stop Conditions (Hard Stops)
- Any URL regression or broken link on public project pages.
- Any leakage of private/concept projects into public routes.
- Any modification to BECC production infrastructure or `becc-runtime`.
- Any leakage of Reconstruction "First 100 Testers" scope into `bridgenta.de`.
- Any test suite regression.

---

## 18. Authorization Decision (Stage 18)

- **IMPLEMENTATION_AUTHORIZATION**: **AUTHORIZED**
- **PRECONDITIONS**: None.
- **OWNER_DECISIONS_REQUIRED**: None.
- **NEXT_WORKSTREAM**: `BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-01`
