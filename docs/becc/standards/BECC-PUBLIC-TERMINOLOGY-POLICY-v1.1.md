# BECC Public Terminology Policy v1.1

*   **Status**: `PROPOSED — PENDING REVIEW`
*   **Version**: `1.1-Candidate`
*   **Release Gate**: Framework-Only Amendment Candidate
*   **Effective Date**: PENDING AUTHORIZATION

> [!IMPORTANT]
> **Shared Status & Separation Boundary**
> *   This policy candidate has no active enforcement, certification, publication, or supersession effect until formally approved.
>
> ```text
> Machine validation
> ≠ author or engineering self-review
> ≠ authorized semantic fresh-reader review
> ≠ independent certification review
> ≠ constitutional or designated approval
> ≠ merge authorization
> ≠ publication authorization
> ≠ activation
> ```

This policy governs vocabulary selection, spelling compound standards, proper nouns, and readability rules in German public engineering portfolios and learning branches.

---

## 1. Governance Boundaries & Profile Scope

BECC establishes two distinct communication registers to manage technical documentation:

### 1.1 Professional Communication Profile (CEFR B2–C1)
Technical prose must align with the CEFR B2–C1 register. Style must be active, precise, and devoid of marketing superlatives. Structured readability scores and sentence length targets serve as advisory metrics.

### 1.2 Learning Accessibility Profile (CEFR A2–B1)
Prose targeting learning or educational content must align with the CEFR A2–B1 register. The profile explicitly covers all learning branch levels:
*   **PUBLIC**
*   **BEGINNER**
*   **INTERMEDIATE**
*   **ADVANCED**

Grammar, sentence structures, and explanations must be kept accessible across all four levels. Advanced technical depth does not dictate advanced language complexity.

---

## 2. Terminology Classification & Preservation

To maintain high linguistic quality while ensuring technical accuracy, terms are classified into distinct categories:

### 2.1 Technical Proper Nouns (Framework & Product Names)
Platform names and proprietary ecosystem layers (e.g. `BridGenta`, `AEOcortex`, `CEF`, `BGCF`, `BECC`, `BPGA`) must always be capitalized and written in their canonical forms.

### 2.2 Code Identifiers
Programmatic symbols, function names, routing keys, or file paths (e.g. `getStaticPaths()`, `activeProjectSlugs`, `package.json`, `tooling/`) must always be wrapped in code backticks. They are exempt from spelling and translation checks.

### 2.3 Preserved Technical Terms
Standard industry jargon that does not have a direct, non-ambiguous German translation (e.g. `main branch`, `Repository`, `Workspace`, `CI/CD pipeline`, `Service Worker`, `Abstraktionsebene`, `Runtime`, `Determinismus`) should remain in English or technical German. They must NOT be automatically banned as complex vocabulary. The profile governs explanatory accessibility, not vocabulary purity.

### 2.4 Explanation Close to First Use
Any preserved technical term or English technical jargon must be accompanied by a clear explanation close to its first meaningful use when needed. Authors may use inline definitions, parenthetical annotations, concrete examples, tooltips, or glossary links to satisfy this rule.

### 2.5 Protected Proper Nouns
Third-party brands, tools, and libraries (e.g. `Lovable`, `Claude`, `ChatGPT`, `Astro`, `Cheerio`) must be preserved in their native forms and capitalized correctly.

### 2.6 Ordinary English Prose
Untranslated ordinary English prose should not be used as the default language of German public pages, except where preserving the original wording is necessary and clearly identified.

#### Bounded Exceptions:
Linguistic check exemptions are permitted for:
*   exact quotations
*   official product and feature names
*   UI labels
*   citations
*   evidence excerpts
*   legally required wording
*   source-language evidence
*   multilingual examples
*   accessibility labels where translation would alter meaning

*Terminology examples are protective proper nouns; the maintained terminology register controls canonical wording. Where the terminology register does not resolve a term, the wording remains pending human editorial adjudication.*

---

## 3. Grammar and Capitalization

- **German Compounds**: English words imported into German technical compound structures must follow standard capitalization and hyphenation rules (e.g. `die Branches`, `der Static-Site-Builder`).
- **Ampersands**: The symbol `&` must not be used in German prose headings. It must be written as `und` unless it forms part of a proprietary brand name (e.g. `CI/CD`).

---

## 4. Readability & Governance

Linguistic checks and automated readability statistics are advisory supporting signals. They are not CEFR compliance rules and must never masquerade as semantic assurance.

### 4.1 Supporting Signals (Advisory)
- **Advisory Flesch Thresholds:** Readability metrics (e.g., Flesch Reading Ease score for German technical prose) serve as supporting signals. An automated score below target does not automatically fail the gate, provided the prose is clear and is approved by a human fresh-reader review.
- **Experimental Heuristics:** Sentence length limits (e.g. maximum 15 words for A2–B1) and paragraph density limits (e.g. maximum 5 sentences) are advisory heuristics to flag dense prose. They are not blocking validation gates.
- **Passive Voice:** Passive voice checks serve purely as editorial advisories. Passive structures may be used when necessary, natural, or technically appropriate.

### 4.2 Mandatory Restrictions (Blocking Gates)
- Rejection of absolute warranties (e.g. `garantieren`, `Gewährleistung`, `fehlerfrei`, `lückenloser Schutz`) and mixed-language heading structures (e.g., "Engineering Insight"). Absolute warranties and categorical absence-of-event claims remain impermissible even when a pilot, test, staging, or limited environment is named.
- Alteration of technical meaning, causality chains, or evidence/provenance metrics during learning transformations.

### 4.3 Human Adjudication
- **Fresh-Reader Review:** Holds sole authority to judge linguistic accessibility and explanation clarity.
- **Technical/Evidence Review:** Judges technical correctness and evidence fidelity.
- **BECC/PRAG Pipelines:** Govern publication eligibility (security, secrets, structure checks).
- **Authorized Human Approval:** Governs final publication, merging, and activation.
