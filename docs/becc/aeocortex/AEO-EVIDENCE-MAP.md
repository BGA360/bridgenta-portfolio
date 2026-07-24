# AEOcortex BECC Phase 2 — Evidence Map

This map registers, scopes, and traces all quantitative, technical, and outcome-related claims published on the AEOcortex project page.

---

## 1. Claims and Evidence Ledger

| Claim ID | Section | Public Claim / Statement | Classification | Scope / Bounding | Evidence Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AEO-CLM-001** | `Öffentliche Projekteinblicke` | `Entity-Score: 95%` | Pilot Result / Calculated Score | Bounded to the pilot run on `bridgenta.de` under test run date 2026-01-15. | Test log `/tests/aeo_score.test.js` |
| **AEO-CLM-002** | `Öffentliche Projekteinblicke` | `AEO-Auslesbarkeit: Hoch` | Calculated Score | Based on Flesch-Reading-Ease score > 60 and zero structural schema warnings. | Readability index calculation logic in `/src/utils/readability.js` |
| **AEO-CLM-003** | `Öffentliche Projekteinblicke` | `Automatisierte Erkennung fehlerhafter Graphstrukturen im Rahmen der Testumgebung.` | Tested Capability / Observed Result | Limited to syntax validation checks against Schema.org draft specifications. | Validator script `/src/workflow/validator.js` |
| **AEO-CLM-004** | `Öffentliche Projekteinblicke` | `Sofortige Warnmeldung bei blockierten Hauptentitäten.` | Observed Result | Based on crawler script identifying `Disallow` rules in robots.txt matching target canonical URLs. | Robots test `/tests/robots.test.js` |
| **AEO-CLM-005** | `Öffentliche Projekteinblicke` | `Detaillierte Analyse der Auslesbarkeit für alle großen LLM-Parser.` | Reasoned Inference / Unsupported | *Over-scoped.* The parser evaluates standard HTML metrics but cannot simulate proprietary LLM proprietary crawler logic. | Needs wording remediation. |
| **AEO-CLM-006** | `Validierung` | `maximal 100 HTTP-Anfragen pro Minute` | Tested Capability | Bounded to local test config file simulations. | Config `/config/rate_limit.json` |

---

## 2. Technical System and Capability Boundaries

To preserve technical integrity, the assessment establishes clear boundaries:
* **Implemented Heuristics:** The system parses HTML structures in memory using Cheerio and computes standard readability metrics.
* **Non-Implemented Crawlers:** The tool does not execute JavaScript payloads or run headless browsers.
* **Causality Limit:** The page must not claim that using JSON-LD *guarantees* high search ranking or citation rates, but rather that it *improves* compliance with crawler specifications.
