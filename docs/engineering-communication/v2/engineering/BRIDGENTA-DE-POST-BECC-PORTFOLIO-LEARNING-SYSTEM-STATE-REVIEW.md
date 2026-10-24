# bridgenta.de — Post-BECC Portfolio & Learning-System State Review

**Document ID**: `BRIDGENTA-DE-POST-BECC-STATE-REVIEW-001`  
**Workstream**: `BRIDGENTA-DE-POST-BECC-PORTFOLIO-LEARNING-SYSTEM-STATE-REVIEW-01`  
**Date**: `2026-10-24`  
**Target Repository**: `bridgenta-portfolio` (`fdrefs`)  
**Status**: `COMPLETED`  

---

## Executive Summary

Following the successful provisioning, live verification, and operational baseline establishment of the **BECC v2 deployed runtime** (`becc.bridgenta.de`, closed gaps `GAP-PROD-001..005`, PR #337, commit `60486b8b374d4eab92c73cf23f8c38bb2b5e2f4a`), this state review provides an evidence-first assessment of the broader `bridgenta.de` system.

`bridgenta.de` is the personal engineering portfolio, learning system, and technical evidence environment of **Frank Duru** (webmaster since 2009, software engineer focused on structured web solutions, IT security, system administration, and AI-assisted development). 

The system currently comprises:
1. An **Astro static web application** presenting the public portfolio, qualifications, and 5 detailed project case studies.
2. A **Learning System** (`/lernen/`) containing 14 validated technical articles across 4 thematic categories.
3. A **Governed Learning Domain Package** (`packages/governed-learning`) with 310 passing unit and integration tests.
4. A **BECC Runtime Foundation** (`becc-runtime`, `https://becc.bridgenta.de/`) with 320 passing tests, persistent PostgreSQL, automated daily backups, 7-day PITR, and strict CA-verified TLS.

While technical quality across the automated test suites is exceptionally high (630 passing unit/integration tests, zero lint or markdown link errors, clean static builds), the review identifies material gaps in **project visibility architecture**, **M5 shadow-to-enforcement readiness**, and **evidence cross-linking between learning articles and portfolio claims**.

Crucially, **BECC operational infrastructure is now stable and frozen**. It must not be subjected to further speculative refactoring. Future workstreams should focus on consolidating portfolio metadata and evidence integrity.

---

## 1. Canonical Repository Baseline (Stage 0)

| Metric | Measured Value | Verification Command | Status |
| :--- | :--- | :--- | :--- |
| **Local Branch** | `main` | `git branch --show-current` | PASS |
| **Local Head SHA** | `5476c5edc64927049506138ba324b4fd69756834` | `git rev-parse HEAD` | PASS |
| **Origin Main SHA** | `5476c5edc64927049506138ba324b4fd69756834` | `git rev-parse origin/main` | PASS |
| **Working Tree State** | CLEAN (0 tracked modifications) | `git status` | PASS |
| **Canonical Main CI** | PASS (Run ID `40078824683`, 3m7s) | `gh run list --branch main` | PASS |

---

## 2. System Purpose & Role Clarification (Stage 1)

`bridgenta.de` operates as a multi-layered engineering and professional communication platform. Each constituent subsystem serves a distinct and bounded purpose:

```
+-----------------------------------------------------------------------------------+
|                                  bridgenta.de                                     |
|           Frank Duru — Web Development, Security & AI-Assisted Engineering        |
+---------------------------------------------------------+-------------------------+
                                                          │
          ┌───────────────────────────────────────────────┴───────────────────────────────┐
          ▼                                                                               ▼
+-----------------------------------+                           +-----------------------------------+
|         PORTFOLIO PLANE           |                           |       LEARNING SYSTEM PLANE       |
|  - Public Portfolio Presentation  |                           |  - Knowledge Base (/lernen/)      |
|  - Project Case Studies           |                           |  - 14 Technical Articles          |
|  - Qualifications & Trust Badges  |                           |  - PRAG/M5 Shadow Observation     |
|  - Contact & Recruiter Outreach   |                           |  - Real Incident Refusal Analysis |
+-----------------+-----------------+                           +-----------------+-----------------+
                  │                                                               │
                  └───────────────────────────────┬───────────────────────────────┘
                                                  ▼
                        +---------------------------------------------------+
                        |             GOVERNANCE & RUNTIME PLANE            |
                        |  - Governed Learning (packages/governed-learning) |
                        |  - BECC Runtime (becc-runtime / becc.bridgenta.de)|
                        |  - CA-Verified Database & Audit Ledger            |
                        +---------------------------------------------------+
```

### Subsystem Purpose Register
- **Portfolio Plane**: Establishes verified professional credibility with engineering recruiters, clients, and collaborators. Documents practical execution across web engineering, local/medical SEO, progressive web applications (PWAs), Answer Engine Optimization (AEO), and AI-builder workflows.
- **Learning System Plane (`/lernen/`)**: Provides an open, verifiable technical journal of real software engineering incidents, trade-offs, and governance lessons (e.g., memory vs. evidence, linter boundaries, architectural drift during AI model changes, mobile layout collisions).
- **Governed Learning Domain Plane (`packages/governed-learning`)**: Enforces bounded domain aggregates, 20 canonical refusal codes, idempotency stores, concurrency locks, and deterministic replay to prevent unverified learning claims from being promoted into authoritative rules.
- **BECC Runtime Plane (`becc-runtime` / `https://becc.bridgenta.de/`)**: Serves as a headless, deployed communication and evaluation engine. It verifies readiness criteria, manages an immutable audit ledger on persistent PostgreSQL, and exposes operational telemetry (`/health`, `/ready`, `/version`, `/`).
- **Scope Boundary Assertion**: `bridgenta.de` is strictly separate from the proprietary **BridGenta Reconstruction Platform** and its own **First 100 Testers** initiative. The portfolio features a high-level case study of the Reconstruction platform in private beta, but does not contain or execute Reconstruction code.

---

## 3. High-Level System Map (Stage 2)

| Subsystem Domain | Code Location / Host | Primary Responsibilities | Current Operational State |
| :--- | :--- | :--- | :--- |
| **Portfolio Frontend** | `src/pages/`, `src/layouts/`, `src/components/` | Astro SSR/SSG rendering of responsive UI, semantic HTML, Schema.org JSON-LD graph. | Healthy (30 pages generated cleanly) |
| **Portfolio Content** | `src/content/pages/`, `src/content/projects/` | Structured JSON pages and Markdown project case studies. | Functional; relies on hardcoded whitelists |
| **Learning Content** | `src/content/learning/`, `src/content/learningCategories/` | 14 markdown articles, 4 categories (`ai-entwicklung`, `ki-agenten`, `softwarearchitektur`, `testen-verifizieren`). | Validated (14/14 PASS); M5 shadow mode |
| **Governed Learning** | `packages/governed-learning/` | Domain entity schemas, historical replay engine, concurrency locks, idempotency. | 310 unit tests pass (100% green) |
| **BECC Runtime** | `becc-runtime/` | Deployed HTTP service, PostgreSQL audit ledger, readiness evaluation service, broker. | 320 unit/integration tests pass (100% green) |
| **BECC Cloud Infrastructure** | Render Frankfurt (`frankfurt.render.com`) | Always-on Starter Node service (`0.5c/512MB`), persistent PostgreSQL (`basic_1gb`). | Verified live ($14.00/mo <= €15.00 ceiling) |
| **Public Ingress & DNS** | Strato AG & GitHub Pages | CNAME `becc.bridgenta.de` -> Render; apex/www `bridgenta.de` -> GitHub Pages. | Verified live; valid public TLS certificates |
| **Stewardship & Provenance** | `stewardship/`, `tooling/` | Provenance registry, local integrity manifest, M5 shadow observation history. | Shadow mode active; 93 unreviewed cases |

---

## 4. Subsystem Audits

### 4.1 Portfolio Audit (Stage 3)
- **Strengths**: Professional layout with clear typography (Inter & Fraunces), responsive navigation, high-contrast accessible color scheme, and structured data (JSON-LD `ProfilePage`, `SoftwareApplication`, `CreativeWork`).
- **Weaknesses**:
  - The portfolio presents 5 active case studies (`bridgenta`, `aeocortex`, `luminapraxisds`, `rootedrealitygarden`, `starcleaners`), but filters them using hardcoded string arrays in template files (`primarySlugs = [...]`).
  - Two projects (`builddaddy.md` and `fdess.md`) remain in `src/content/projects/` as unrendered orphans.
  - The homepage emphasizes "Webmaster seit 2009", but the detailed project case studies reflect 2025–2026 work; historical webmaster evidence is only represented by a single summary card linking to `/about`.

### 4.2 Learning-System Audit (Stage 4)
- **Strengths**: 14 articles with excellent technical clarity, discussing authentic engineering trade-offs derived from repository commits. All articles satisfy structural validation (`npm run learning:validate`).
- **Weaknesses**:
  - **M5 Shadow Readiness Deficit**: `tooling/prag_provenance_m5_readiness.js` reports `assessmentState: ENFORCEMENT_NOT_READY`. 93 observation reports flag unreviewed attention cases because only 5 articles have `.review.md` files in `stewardship/reviews/` and only 1 provenance event (`EV-BG-003`) is cleared in `stewardship/reviews/clearances_manifest.json`.
  - If M5 were changed from `SHADOW` to `ENFORCING`, 13 of the 14 articles would be withheld from public indexing.

### 4.3 Learning-to-Portfolio Evidence Flow Audit (Stage 5)
- **Finding**: A major functional disconnect exists between the Learning System and the Portfolio.
- The learning articles cite real development incidents from portfolio projects (e.g., `layout-absicherung-in-mobilen-ansichten.md` derives from mobile CSS collisions; `revert-der-tinacms-build-integration.md` derives from CMS integration failures).
- However, the project case study templates (`src/pages/project-[slug].astro`) do **not** surface or link to these learning articles. The learning system and the portfolio showcase function as isolated silos rather than an integrated proof network.

### 4.4 Project Lifecycle Audit (Stage 6)
- **Maturity Classifications**:
  1. `bridgenta`: Private Beta (proprietary pilot, architecture case study).
  2. `aeocortex`: In Entwicklung (AI Search, AEO/GEO experimental sandbox).
  3. `luminapraxisds`: Abgeschlossen (Production dental portal & Vitality calculator).
  4. `rootedrealitygarden`: Abgeschlossen (Production permaculture landscaping site & technical SEO).
  5. `starcleaners`: Abgeschlossen (Production luxury cleaning service PWA).
  6. `builddaddy`: Inactive Concept (orphaned in content directory).
  7. `fdess`: Inactive Concept (orphaned in content directory).
- **Governance Finding**: Project visibility is enforced imperatively in UI code rather than declaratively through content collection schemas or a centralized project registry.

### 4.5 Governance & SSoT Audit (Stage 7)
- **SSoT Health**: Documentation in `docs/` is extensive and structured. However, project visibility suffers from code-level duplication:
  - Whitelist `['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners']` is duplicated in:
    - `src/pages/projects.astro` (L7)
    - `src/pages/project-[slug].astro` (L10, L22)
    - `src/layouts/Layout.astro` (L46)
- This violates the Single Source of Truth principle. A project added to `src/content/projects/` will not appear or build routes unless all three templates are manually edited.

### 4.6 BECC Boundary Review (Stage 8)
- **BECC Boundary Isolation**:
  - The BECC deployed runtime is completely decoupled from the static Astro build.
  - Zero secrets or internal database credentials exist in client-side code.
  - Public endpoints (`https://becc.bridgenta.de/`, `/health`, `/ready`, `/version`) provide operational transparency without exposing internal system details.
- **Missed Showcase Opportunity**: While BECC is an impressive demonstration of production-grade backend engineering, cloud infrastructure provisioning, and strict CA-verified TLS under strict budget constraints, it is not mentioned anywhere in the public portfolio project list.

### 4.7 UX & Information Architecture Audit (Stage 9)
- Navigation is responsive and clear across desktop and mobile.
- Clean URL routing structure:
  - Primary routes: `/`, `/projects`, `/project-[slug]`, `/lernen/`, `/lernen/themen/[category]`, `/lernen/[slug]`, `/about`, `/contact`.
  - Utility routes: `/datenschutz`, `/impressum`, `/sitemap.xml`.
- Breadcrumbs are fully implemented on all learning pages and case studies.

### 4.8 Technical Quality Audit (Stage 10)
All repository test suites and quality gates were executed directly:

| Quality Gate | Command | Test Count | Result |
| :--- | :--- | :--- | :--- |
| **Governed Learning Tests** | `npm run --prefix packages/governed-learning test` | 310 tests, 32 suites | **PASS** (0 fail, 12.9s) |
| **BECC Runtime Tests** | `npm test --prefix becc-runtime` | 320 tests, 31 suites | **PASS** (0 fail, 14.5s) |
| **Astro Type Check** | `npx astro check` | 30 pages / components | **PASS** (0 errors) |
| **Astro Production Build** | `npm run build` | 30 static pages generated | **PASS** (0 errors) |
| **Markdown Linting** | `npm run lint` | 56 markdown files audited | **PASS** (0 errors) |
| **Markdown Link Integrity** | `npm run check-links` | All relative links audited | **PASS** (0 broken links) |
| **Learning Article Validation** | `npm run learning:validate` | 14 articles verified | **PASS** (14/14 PASS) |

**Total Automated Tests**: **630 passing tests** across runtime, domain, and tooling.

### 4.9 Security & Privacy Boundary Review (Stage 11)
- Verified: Zero credentials, API keys, or database connection strings exist in git-tracked files.
- The BECC runtime database connection is managed strictly via Render environment variables.
- The BridGenta Reconstruction platform case study respects privacy boundaries: only approved architectural diagrams and UI mockups are shown; proprietary reconstruction engine source code is entirely absent.

### 4.10 Content & Technical Communication Audit (Stage 12)
- Content tone is sober, authentic, and technically grounded.
- Clear distinction between "In Entwicklung", "Private Beta", and "Abgeschlossen".
- The previous misapplication of the "First 100 Testers" label to BECC was completely excised in PR #337; no residual terminology contamination was detected.

---

## 5. Normalized Gap Register (Stage 13)

| Gap ID | Title | Priority | Impact Area | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GAP-PORT-001** | M5 Shadow-to-Enforcement Readiness Deficit | **P1 (High)** | Learning System / Stewardship | 9 of 14 learning articles lack `.review.md` stewardship reviews, and only 1 provenance event (`EV-BG-003`) is cleared in `clearances_manifest.json`. M5 readiness assessment is blocked at `ENFORCEMENT_NOT_READY` (93 unreviewed attention cases). |
| **GAP-PORT-002** | Hardcoded Project Visibility & Filtering Architecture | **P1 (High)** | Portfolio Architecture / SSoT | Project visibility is governed by hardcoded `primarySlugs` whitelist arrays duplicated across three Astro templates rather than declarative metadata in content schemas or a project registry. Leaves orphaned content files. |
| **GAP-PORT-003** | Learning-to-Portfolio Evidence Disconnection | **P2 (Medium)** | Portfolio & Learning Integration | Project case studies assert engineering capabilities but do not cross-reference the corresponding published learning articles and provenance events that substantiate those claims. |
| **GAP-PORT-004** | BECC Production Engineering Showcase Absence | **P2 (Medium)** | Portfolio Showcase / Evidence | The live, certified BECC v2 production runtime (`becc.bridgenta.de`, persistent PostgreSQL, strict CA TLS, PITR, 630 tests) is an operational achievement but is not represented as an engineering case study in the portfolio. |
| **GAP-PORT-005** | Webmaster Experience Evidence Depth Gap | **P3 (Low)** | Portfolio Content / History | Trust badges cite "Webmaster seit 2009", but historical CMS, hosting, and systems engineering achievements lack structured case study documentation comparable to 2025–2026 projects. |

---

## 6. Priority Ranking & Dependency Graph (Stage 14)

```
                     ┌─────────────────────────────────────────┐
                     │              GAP-PORT-002               │
                     │  Consolidate Project Registry & SSoT    │
                     │           (Priority P1)                 │
                     └────────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
   ┌─────────────────────────────┐                 ┌─────────────────────────────┐
   │        GAP-PORT-003         │                 │        GAP-PORT-004         │
   │ Cross-Link Learning Evidence│                 │ Showcase BECC v2 as Project │
   │        (Priority P2)        │                 │        (Priority P2)        │
   └─────────────────────────────┘                 └─────────────────────────────┘

   ┌─────────────────────────────┐                 ┌─────────────────────────────┐
   │        GAP-PORT-001         │                 │        GAP-PORT-005         │
   │ Complete Stewardship Reviews│                 │ Deepen Webmaster Experience │
   │ & Clear M5 Readiness (P1)   │                 │        (Priority P3)        │
   └─────────────────────────────┘                 └─────────────────────────────┘
```

- **Ranking Rationale**:
  1. **GAP-PORT-002** must be addressed first among implementation tasks: establishing a Single Source of Truth for project metadata eliminates fragile hardcoded whitelists and creates the data model required for GAP-PORT-003 and GAP-PORT-004.
  2. **GAP-PORT-001** can proceed independently or in parallel as a stewardship review task (closing the 9 unreviewed articles and updating clearances).
  3. **GAP-PORT-003** and **GAP-PORT-004** enrich the portfolio with verified evidence once the project data model is unified.
  4. **GAP-PORT-005** is low urgency and can be scheduled at convenience.

---

## 7. Freeze Register — What NOT to Change (Stage 15)

To prevent scope creep, regression, and accidental disruption of certified production systems, the following domains are **FROZEN**:

1. **BECC Cloud Infrastructure & Topology**:
   - Single-Provider Render Frankfurt (DEC-OWNER-001) is frozen.
   - €15.00/month recurring cost ceiling (DEC-OWNER-002) is frozen.
   - OPTION-3A strict CA-verified TLS with `rejectUnauthorized: true` (DEC-OWNER-003) is frozen.
   - Production domain `becc.bridgenta.de` and ingress routing (DEC-OWNER-004) are frozen.
   - Persistent PostgreSQL instance (`basic_1gb`), automated daily backups, and 7-day PITR are frozen.
   - Starter runtime instance (`0.5c/512MB`) is frozen.
   - Operational endpoints (`/`, `/health`, `/ready`, `/version`) and operations runbook are frozen.
2. **Governed Learning Core**:
   - The 20 canonical refusal codes, domain contracts, and historical replay engine in `packages/governed-learning` are frozen.
3. **Reconstruction Platform Boundary**:
   - No Reconstruction project code, tests, or "First 100 Testers" workflows may be introduced into `bridgenta.de`.

---

## 8. Next Implementation Workstream Recommendation (Stage 16)

### Recommended Workstream
`BRIDGENTA-DE-PROJECT-REGISTRY-AND-PORTFOLIO-METADATA-CONSOLIDATION-01`

### Rationale
Resolving **GAP-PORT-002** directly cures technical debt and template-level duplication without touching infrastructure or risking runtime regressions. By replacing hardcoded string arrays (`primarySlugs`) with a centralized, schema-validated project registry (or enriched Astro Content Collection schema with explicit publication states), the project achieves:
- Strict adherence to the Single Source of Truth (SSoT) principle.
- Clean separation between active projects, private beta showcases, and drafts/concepts.
- The foundational data structure needed to link learning articles (GAP-PORT-003) and showcase the BECC runtime (GAP-PORT-004).

### Scope Boundaries
- **In Scope**:
  - Define declarative project lifecycle and visibility metadata (e.g. `visibility: "featured" | "standard" | "concept" | "archive"`).
  - Update `src/pages/projects.astro`, `src/pages/project-[slug].astro`, and `src/layouts/Layout.astro` to consume canonical collection metadata.
  - Reconcile `builddaddy.md` and `fdess.md` metadata so their unrendered status is intentional and schema-governed.
  - Run full test and build suites (`astro check`, `astro build`, `npm run lint`, `npm run check-links`).
- **Out of Scope**:
  - Modifying BECC runtime code or Render infrastructure.
  - Modifying visual styles or layout CSS.
  - Writing new project case studies or learning articles.
  - Activating M5 enforcement.

### Success Criteria
1. Zero hardcoded slug whitelists in Astro page templates.
2. All 5 active project routes render identically with zero visual or URL regression.
3. `astro check` and `npm run build` pass with zero errors.
4. `npm run check-links` passes with zero broken links.
5. All 630 automated unit and integration tests remain green.

### Hard Stop Conditions
- Any requirement to modify BECC deployed infrastructure or Render configurations.
- Any breaking change to existing public URLs (`/projects`, `/project-bridgenta`, `/project-aeocortex`, etc.).
- Any modification to `packages/governed-learning` contracts.
