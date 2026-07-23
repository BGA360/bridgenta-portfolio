# BECC Public Page Reference Standard v1.0
## Guidelines for Governed Public Engineering Communication

This standard defines the rules and guidelines for publishing, auditing, and certifying public-facing project pages and portfolios under the BECC (BridGenta Engineering Communication Constitution) framework.

---

## 1. Core Structural Constraints

* **Single H1 Tag:** Each public case study or project page must have exactly one structural `H1` tag serving as the page title.
* **Heading Hierarchy:** Section headings must follow a strict semantic hierarchy (`H1` -> `H2` -> `H3` -> `H4`) without skipped levels.
* **German Translation Policy:** All structural, editorial, navigation, and section headings must be written in standard, professional German (CEFR B2–C1 register) to ensure accessibility to managers and recruiters.

---

## 2. Terminology Control

* **Compound Nouns:** Standard German compound nouns must be capitalized and written as unified terms (e.g. `Codegenerierung` instead of `Code-Generierung`).
* **Canonical English Terms:** Standard industry technical jargon or proprietary system layer names (e.g., `main branch`, `Repository`, `Preservation Layers`, `CI/CD`) should be preserved in English to prevent confusion.
* **Prohibited Guarantees:** Do not use absolute terms (e.g., `garantieren`, `Gewährleistung`, `ohne Ausfälle`, `auf ein Minimum`) when describing outcomes. Use active, scoped verbs.

---

## 3. Claim Scoping and Bounding

All quantitative, performance, or outcome-based statements must be explicitly:
1. Linked to documented test data.
2. Bounded to the specific environment in which they were observed (e.g., `im Pilotlauf`, `im Pilotbetrieb`).
3. Registered in a centralized evidence map with sample size, test duration, and dates.

---

## 4. Verification Workflow

Every update must pass through a strict four-step gate before deployment:
1. **Source Audit:** Lints markdown and links.
2. **Build Audit:** Astro production build verify.
3. **Render Audit:** Visual check at viewports: 320px, 375/390px, 768px, 1024px, 1440px, and 200% zoom.
4. **Deploy Audit:** Live-page HTTP 200, head metadata, and service worker cache check.
