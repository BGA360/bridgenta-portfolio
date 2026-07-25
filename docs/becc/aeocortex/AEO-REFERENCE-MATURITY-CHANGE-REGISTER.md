# AEOcortex BECC Phase 1 — Reference Maturity Change Register

This register logs all modifications, wording replacements, and corrections applied to the AEOcortex public project page.

---

## 1. Remediation Change Ledger

| Change ID | Phase | Section | Target Text (Before) | Replacement Text (After) | Type | Rationale | Verified |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **ARM-001** | Phase 1 | Headings | Executive Summary, Context, Problem, Constraints, Architecture, Decisions, etc. | Kurzfassung, Ausgangssituation, Problemstellung, Rahmenbedingungen, Architektur, Entscheidungen, etc. | Heading | German-only heading policy compliance. | Yes |
| **ARM-002** | Phase 1 | Kurzfassung | AEOcortex ist ein persönliches... (AEO... und GEO). Ziel des Projekts... | AEOcortex ist ein persönliches... KI-gestützten Systemen. Der Fokus liegt auf... GEO. Ziel des Projekts... | Wording | Split sentence; reduce cognitive load; remove bilingual parenthetical. | Yes |
| **ARM-003** | Phase 1 | Einblicke | robots.txt Konflikte | robots.txt-Konflikte | Terminology | Compound hyphenation alignment. | Yes |
| **ARM-004** | Phase 1 | Einblicke | LLM-Crawler Barrieren | LLM-Crawler-Barrieren | Terminology | Compound hyphenation alignment. | Yes |
| **ARM-005** | Phase 1 | Einblicke | 100% automatisierte Erkennung... | Automatisierte Erkennung... im Rahmen der Testumgebung. | Evidence | Bound claim, remove absolute promise. | Yes |
| **ARM-006** | Phase 1 | Erkenntnisse | ...sparen wertvolle Zeit und garantieren die Einhaltung... | ...sparen wertvolle Zeit und unterstützen die Einhaltung... | Claims | Replace prohibited guarantee verb `garantieren`. | Yes |
| **ARM-007** | Phase 2 | Einblicke | Entity-Score: 95% | Entity-Score: 95% (Pilotlauf) | Evidence | Scope score to pilot run. | Yes |
| **ARM-008** | Phase 2 | Einblicke | AEO-Auslesbarkeit: Hoch | AEO-Auslesbarkeit: Hoch* (+ Footnote) | Evidence | Scope readability rating. | Yes |
| **ARM-009** | Phase 2 | Einblicke | Detaillierte Analyse... LLM-Parser. | Strukturierte Analyse... im Parser. | Scope | Down-scoped over-scoped crawler claim. | Yes |
| **ARM-010** | Phase 2 | Ergebnisse | Entity-Prüfung: Zuverlässige Erkennung... (and results list) | Entity-Prüfung: Erkennung... im Testlauf... | Evidence | Qualify results to test bounds. | Yes |
| **ARM-011** | Phase 2 | Stack | `Astro` in `devStack` and references of `aeocortex.md` and `bridgenta.md` | Removed | Astro Boundary | Retained Astro only as portfolio publication infrastructure. | Yes |
| **ARM-012** | Phase 2 | Kurzfassung | `Dadurch soll die Sichtbarkeit...` | `Dadurch soll die technische Auslesbarkeit...` | Wording | Qualify visibility claims to internal test-run contexts. | Yes |
| **ARM-013** | Phase 2 | Problemstellung | `Dies führt dazu...` | `Dies kann dazu führen...` | Wording | Frame crawler processing as potential risks. | Yes |
| **ARM-014** | Phase 2 | Technische Überlegungen | `Das Kernkonzept...` | `Das Kernkonzept... beruht auf der Arbeitshypothese...` | Wording | Frame deterministic paths as working hypothesis. | Yes |
| **ARM-015** | Phase 2 | Umsetzung / Validierung | `...Verständlichkeit für LLM-Parsing-Prozesse zu bewerten` | `...definierte Struktur-, Metadaten- und Lesbarkeitssignale für automatisierte Analyseprozesse bewerten` | Wording | Prefer evaluation of signals over claims of machine understanding. | Yes |
| **ARM-016** | Phase 2 | Einblicke | `Vergleichsmatrix (Ergebnis-Nachweis)` / `AEO-Auslesbarkeit: Hoch` | `Vergleichsmatrix (Fähigkeits-Nachweis)` / `Text-Lesbarkeit (interner Flesch-Wert)` | Classifications | Align comparison matrix and readability to internal classifications. | Yes |
| **ARM-017** | Phase 2 | Validierung | `maximal 100 HTTP-Anfragen pro Minute` | `restriktive Ratenbegrenzungen gemäß interner Konfigurationsvorgaben` | Wording | Replace numerical rate limit with non-numerical bounded wording. | Yes |
| **ARM-018** | Phase 2 | Risiken | (None) | Added two-dimensional risk matrix rubric explanation | Rubric | Add risk impact and likelihood methodology. | Yes |
| **ARM-019** | Phase 5.1 | Problem / Technik | `bekannten Crawler-Spezifikationen` / `syntaktische Spezifikationen` | `dokumentierten technischen Kriterien und öffentlich deklarierten Crawler-Regeln` | Wording | Remediation of remaining wording gap (AEO-OBS-001) for narrow evidence bounding. | Yes |
| **ARM-020** | Phase 5.2 | Evidence Map | `improves compliance...` | `is designed to align with...` | Wording | Replaced "improves compliance" to eliminate comparative wording risk in boundaries. | Yes |

