# AEOcortex BECC Phase 2 — Evidence Map

This map registers, scopes, and traces all quantitative, technical, and outcome-related claims published on the AEOcortex project page.

---

## 1. Claims and Evidence Ledger

| Claim ID | Section | Public Claim / Statement | Classification | Scope / Bounding | Evidence Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AEO-CLM-001** | `Öffentliche Projekteinblicke` | `Entity-Score (in figcaption qualified)` | Internal Local-Test Metric | Bounded to internal local-test evaluation of metadata density, not an external success probability. | Test log `/tests/aeo_score.test.js` |
| **AEO-CLM-002** | `Öffentliche Projekteinblicke` | `Text-Lesbarkeit (interner Flesch-Wert)` | Calculated Score | Based on Flesch-Reading-Ease score > 60 in local test runs. Does not measure external visibility. | Readability index calculation logic in `/src/utils/readability.js` |
| **AEO-CLM-003** | `Öffentliche Projekteinblicke` | `Automatisierte Erkennung fehlerhafter Graphstrukturen im Rahmen der Testumgebung.` | Tested Capability / Observed Result | Limited to syntax validation checks against Schema.org draft specifications. | Validator script `/src/workflow/validator.js` |
| **AEO-CLM-004** | `Öffentliche Projekteinblicke` | `Warnmeldung bei blockierten Hauptentitäten im lokalen Prüflauf.` | Observed Result | Based on crawler script identifying `Disallow` rules in robots.txt matching target canonical URLs. | Robots test `/tests/robots.test.js` |
| **AEO-CLM-005** | `Öffentliche Projekteinblicke` | `Strukturierte Analyse von Metadaten und Lesbarkeits-Metriken im Parser.*` | Implemented Capability | Scoped to standard metadata checks and Flesch readability calculations. | Readability index calculation logic in `/src/utils/readability.js` |
| **AEO-CLM-006** | `Validierung` | `restriktive Ratenbegrenzungen gemäß interner Konfigurationsvorgaben` | Implemented Safety Limit | Bounded to local config safety guidelines. | Config `/config/rate_limit.json` |

---

## 2. Technical System and Capability Boundaries

To preserve technical integrity, the assessment establishes clear boundaries:
* **Implemented Heuristics:** The system parses HTML structures in memory using Cheerio and computes standard readability metrics.
* **Non-Implemented Crawlers:** The tool does not execute JavaScript payloads or run headless browsers.
* **Causality Limit:** The page must not claim that using JSON-LD *guarantees* high search ranking or citation rates, but rather that it is designed to align with documented technical criteria and publicly declared crawler rules.
