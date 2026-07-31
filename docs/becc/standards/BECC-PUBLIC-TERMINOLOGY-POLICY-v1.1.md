# BECC Public Terminology Policy v1.1

*   **Status**: `PROPOSED — PENDING REVIEW`
*   **Version**: `1.1-Candidate`
*   **Release Gate**: Framework-Only Amendment Candidate
*   **Effective Date**: Pending Authorization

This policy governs vocabulary selection, spelling compound standards, proper nouns, and readability rules in German public engineering portfolios.

---

## 1. Terminology Classification

To maintain high linguistic quality, terms are classified into distinct categories:

### 1.1 Technical Proper Nouns (Framework & Product Names)
Platform names and proprietary ecosystem layers (e.g. `BridGenta`, `AEOcortex`, `CEF`, `BGCF`, `BECC`, `BPGA`) must always be capitalized and written in their canonical forms.

### 1.2 Code Identifiers
Programmatic symbols, function names, routing keys, or file paths (e.g. `getStaticPaths()`, `activeProjectSlugs`, `package.json`, `tooling/`) must always be wrapped in code backticks. They are exempt from spelling and translation checks.

### 1.3 Established Technical Terms
Standard industry jargon that does not have a direct, non-ambiguous German translation (e.g. `main branch`, `Repository`, `Workspace`, `CI/CD pipeline`, `Service Worker`) should remain in English to avoid translation ambiguity.

### 1.4 First-Use Explanatory Terms
Any established technical term or English technical jargon must be accompanied by a brief German explanation upon its first occurrence in prose (e.g. `main branch (Hauptzweig des Repositories)`).

### 1.5 Protected Proper Nouns
Third-party brands, tools, and libraries (e.g. `Lovable`, `Claude`, `ChatGPT`, `Astro`, `Cheerio`) must be preserved in their native forms and capitalized correctly.

### 1.6 Ordinary English Prose
The use of ordinary English prose (non-technical vocabulary) on public German pages is prohibited.

---

## 2. Grammar and Capitalization

- **German Compounds**: English words imported into German technical compound structures must follow standard capitalization and hyphenation rules (e.g. `die Branches`, `der Static-Site-Builder`).
- **Ampersands**: The symbol `&` must not be used in German prose headings. It must be written as `und` unless it forms part of a proprietary brand name (e.g. `CI/CD`).

---

## 3. Readability & Governance

- **German B2–C1 Target**: Prose must align with the CEFR B2–C1 register. Style must be active, precise, and devoid of marketing superlatives.
- **Advisory vs. Mandatory Readability Checks**:
  * *Mandatory*: Rejection of absolute warranties (e.g. `garantieren`, `Gewährleistung`, `fehlerfrei`, `lückenloser Schutz`) and mixed-language heading structures (e.g., "Engineering Insight").
  * *Advisory*: Readability metrics (e.g., Flesch Reading Ease score for German TECHNICAL prose). An automated score below target does not automatically fail the gate, provided the prose is clear.
- **Exception Handling**: Historical quotations or exact quotations from third-party audits are exempt from the terminology checks.
- **Human Approval**: Any deviations, vocabulary exemptions, or overrides of terminology checks require the written authorization of the Lead Editor.
