# AEOcortex BECC Phase 2 — Proposed Remediation Plan

This plan outlines the specific evidence-bounding and terminology transformations proposed to resolve Phase 2 compliance findings.

*Approval Status:* **`PROPOSED / PENDING REVIEW`**

---

## 1. Proposed Evidence-Bounding Transformations

### Item AEO-RM-201 (Entity-Score Bounding)
* **Target (Line 115):**
  ```markdown
  |   > Entity-Score: 95%             |
  ```
* **Proposed Replacement:**
  ```markdown
  |   > Entity-Score: 95% (Pilotlauf) |
  ```
* **Rationale:** Bounds the displayed score to the pilot test run context in the ASCII mock dashboard.

### Item AEO-RM-202 (AEO Readability Bounding)
* **Target (Line 116):**
  ```markdown
  |   > AEO-Auslesbarkeit: Hoch       |
  ```
* **Proposed Replacement:**
  ```markdown
  |   > AEO-Auslesbarkeit: Hoch*      |
  ```
  *(With a footnote added under the ASCII diagram)*
  `*Hinweis: Basierend auf Flesch-Readability-Index >60 im Pilotlauf.`
* **Rationale:** Scopes readability rating to the pilot run context and Flesch heuristic.

### Item AEO-RM-203 (LLM Parser Scope Reduction)
* **Target (Lines 180-181):**
  ```markdown
  <p class="evidence-card__value">Detaillierte Analyse der Auslesbarkeit für alle großen LLM-Parser.</p>
  ```
* **Proposed Replacement:**
  ```markdown
  <p class="evidence-card__value">Strukturierte Analyse von Metadaten und Lesbarkeits-Metriken im Parser.</p>
  ```
* **Rationale:** Reduces over-scoped claim to accurately represent the actual capabilities of the Cheerio parser (Finding `AEO-FIND-006`).

### Item AEO-RM-204 (Results Section Bounding)
* **Target (Lines 207-209):**
  ```markdown
  - **Entity-Prüfung**: Zuverlässige Erkennung unvollständiger oder fehlerhafter JSON-LD-Graphstrukturen im Build-Prozess.
  - **Lesbarkeits-Indikator**: Funktionierende Heuristik zur Bewertung der Eindeutigkeit von Textpassagen für generative Sprachmodelle.
  - **Prozess-Optimierung**: Erfolgreiche Beseitigung struktureller Crawling-Barrieren bei realen Testprojekten.
  ```
* **Proposed Replacement:**
  ```markdown
  - **Entity-Prüfung**: Erkennung unvollständiger oder fehlerhafter JSON-LD-Graphstrukturen im Testlauf des Build-Prozesses.
  - **Lesbarkeits-Indikator**: Heuristische Bewertung der Eindeutigkeit von Textpassagen für generative Sprachmodelle im Testlauf.
  - **Prozess-Optimierung**: Beseitigung identifizierter struktureller Crawling-Barrieren im Rahmen der Testprojekte.
  ```
* **Rationale:** Qualifies outcomes to the test-run and pilot parameters to prevent unqualified general guarantees.
