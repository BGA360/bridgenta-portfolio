# Article 04 Evidence & Narrative Plan
## Code-Fakten vs. strukturelle Korrektheit: Wenn grüne Tests nicht ausreichen

*   **Identifikator:** `BECC-A04-PLAN-v1.0`
*   **Ziel-Artikel:** `src/content/learning/code-fakten-vs-strukturelle-korrektheit.md`
*   **Lernniveau:** `ADVANCED`
*   **Provenienz-Referenz:** `EV-BG-004`
*   **Planungs-Status:** `FROZEN / READY FOR IMPLEMENTATION AUTHORIZATION`
*   **Basis-Standard:** `BECC-PLS-v1.0` (v1.0.0-Extension)
*   **Basis-Modell:** `BECC-LCMB-v1.0` (`CALIBRATED / ACTIVE`)
*   **Autorisierungs-Status:** `ARTICLE_04_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED`

---

## 1. Purpose

Dieses Dokument definiert das **Quell- und Evidenz-basierte Planungsmodell** für die Überarbeitung und Kalibrierung von **Artikel 04** (`code-fakten-vs-strukturelle-korrektheit.md`). 

Auf dem Sprachniveau `ADVANCED` muss Artikel 04 präzise zwischen der reinen statischen Existenz von Code/Dateien (`CODE_EXISTS` / `CODE_FACTS`), der formellen Eininhaltung von Linter-Regeln (`SYNTAX_CORRECTNESS`) und der tatsächlichen inhaltlichen sowie strukturellen Richtigkeit (`STRUCTURAL_CORRECTNESS` & `REQUIREMENT_FIDELITY`) unterscheiden.

Ziel dieser Planung ist es, vor jeglicher Textänderung am Artikel alle Behauptungen strikt an die nachgewiesene Evidenz des Provenienz-Ereignisses `EV-BG-004` zu binden und Übertreibungen oder Scheinsicherheiten auszuschließen.

---

## 2. Scope & Authority Boundary

*   **Geltungsbereich:** Dieses Dokument dient ausschließlich der didaktischen und evidenzbasierten Vorbereitung von Artikel 04.
*   **Hierarchie:**
    *   Der kanonische Standard `BECC-PLS-v1.0` und das Modell `BECC-LCMB-v1.0` bleiben die übergeordneten Instanzen.
    *   *Leitsatz: PLANNING_ARTIFACT_SUPERSEDES_STANDARD: NO.*
    *   *Leitsatz: PLANNING_ARTIFACT_SUPERSEDES_BASELINE: NO.*
*   **Freeze-Garantie:** In dieser Phase A8 werden weder der Quelltext von Artikel 04 noch andere Lernartikel oder Standards verändert.
*   **Implementierungs-Schranke:**
    *   *Leitsatz: ARTICLE_04_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED.*

---

## 3. Article 04 Current State

*   **Datei:** [code-fakten-vs-strukturelle-korrektheit.md](../../../src/content/learning/code-fakten-vs-strukturelle-korrektheit.md)
*   **Aktueller Status im Modell:** `ARTICLE_04_PLANNING_READY: YES`, `ARTICLE_04_CALIBRATION_READY: YES`.
*   **Ist-Zustand:** Der vorliegende Textentwurf beschreibt anhand von Commit `d2363e7` die Übersetzung von Überschriften in der Fallstudie *Lumina Praxis* (`luminapraxisds.md`).
*   **Audit-Befund:** Der bestehende Entwurf verwendet stellenweise vereinfachende Begriffe (z. B. "Der Test war grün" statt "Der Markdown-Linter meldete keine Syntaxfehler"), die auf `ADVANCED`-Niveau präzisiert und differenziert werden müssen.

---

## 4. Source Inventory

Alle im Rahmen der Evidenzanalyse genutzten Quell-Dateien und Artefakte:

| Source ID | Pfad / Locator | Revision / SHA | Rolle / Typ | Evidenz-Klasse | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SRC-01** | `src/content/learning/code-fakten-vs-strukturelle-korrektheit.md` | HEAD (`647c99c...`) | Ziel-Artikel (Kandidat) | `SPECIFICATION` | Present |
| **SRC-02** | `src/data/provenance_registry.json` (EV-BG-004) | HEAD (`647c99c...`) | Registriereintrag | `SPECIFICATION` | Present |
| **SRC-03** | `src/data/local_integrity_manifest.json` (EV-BG-004) | HEAD (`647c99c...`) | Integritäts-Manifest | `VERIFICATION` | Present |
| **SRC-04** | `stewardship/evidence/article-4-ev-bg-004-source-evidence.md` | HEAD (`647c99c...`) | Evidenz-Paket | `VERIFICATION` | Present |
| **SRC-05** | `stewardship/reviews/code-fakten-vs-strukturelle-korrektheit.review.md` | HEAD (`647c99c...`) | Source-Fidelity-Review | `ASSURANCE` | Present |
| **SRC-06** | `src/content/projects/luminapraxisds.md` | `d2363e776159090cff6613e020d41e3451587067` | Git Commit Diff (Übersetzung) | `EXECUTION` / `IMPLEMENTATION` | Present |

*Leitsatz: UNLISTED_EVIDENCE_SOURCE_USED: NO.*

---

## 5. EV-BG-004 Evidence Map

Für alle zentralen Konzepte von Artikel 04 gilt folgende Evidenzkette:

```text
BEHAUPTUNG (Claim)
  ↓
QUELLE (Source: Commit d2363e7 in luminapraxisds.md)
  ↓
DIREKTE BEOBACHTUNG (Observation: Diff zeigt Übersetzung englischer H2-Überschriften ins Deutsche)
  ↓
ZULÄSSIGER SCHLUSS (Allowed Conclusion: d2363e7 behob die Sprachabweichung im Dokument)
  ↓
EVIDENZGRENZE (Boundary: Linter prüfte nur Markdown-Syntax; Sprachregeln wurden manuell auditiert)
```

1.  **Behauptung 1:** In `src/content/projects/luminapraxisds.md` existierten englische H2-Überschriften (*"Executive Summary"*, *"Context"*, *"Problem"* etc.).
    *   *Evidenz:* `git show d2363e776159090cff6613e020d41e3451587067` zeigt die entfernten englischen Zeilen. `DIRECT_EVIDENCE`.
2.  **Behauptung 2:** Commit `d2363e7` ersetzte diese durch deutsche Begriffe (*"Kurzfassung"*, *"Ausgangssituation"*, *"Problemstellung"* etc.).
    *   *Evidenz:* `git show d2363e776159090cff6613e020d41e3451587067` zeigt die hinzugefügten deutschen Zeilen. `DIRECT_EVIDENCE`.
3.  **Behauptung 3:** Der automatisierte Markdown-Linter schlug vor Commit `d2363e7` nicht fehl.
    *   *Evidenz:* `tooling/lint_markdown.cjs` prüft H1-Struktur, relativen Link-Aufbau und Syntax, besitzt jedoch kein Sprach-Erkennungs-Modul. `INFERENCE` (aus Linter-Quellcode und Pipeline-Konfiguration).
4.  **Behauptung 4:** Die Abweichung wurde erst durch ein manuelles Review identifiziert.
    *   *Evidenz:* `stewardship/reviews/code-fakten-vs-strukturelle-korrektheit.review.md` (Result: `PASS`, Source-Fidelity Review). `DIRECT_EVIDENCE`.

*Leitsatz: MAJOR_CLAIMS_WITHOUT_EVIDENCE_MAP: 0.*

---

## 6. Evidence Classification

Alle Behauptungen im Artikel werden nach den 7 Becc-Evidenzklassen eingestuft:

*   **CLAIM (AI-/Autoren-Behauptung):** "Automatisierte Tests garantieren inhaltliche Fehlerfreiheit." (Falsche Behauptung, wird widerlegt).
*   **SPECIFICATION (Anforderung):** Governance-Vorgabe, dass öffentliche Fallstudien deutsche Überschriften nutzen müssen.
*   **IMPLEMENTATION (Statischer Code):** Existenz der Datei `luminapraxisds.md` mit H2-Tags `##`.
*   **EXECUTION (Git-Commit / Pipeline-Lauf):** Ausführung von Commit `d2363e7` und Durchlauf des Linters `lint_markdown.cjs`.
*   **VERIFICATION (Test- / Linter-Ergebnis):** Linter-Status `PASS` für formelle Syntax.
*   **ASSURANCE (Review-Attest):** Source-Fidelity-Audit `code-fakten-vs-strukturelle-korrektheit.review.md` attestiert die fachliche Behebung.
*   **OPEN (Ungeklärte Aspekte):** Automatische sprachliche Inhaltsprüfungen in CI pipelines (aktuell nicht implementiert).

---

## 7. Historical vs Current State

Es wird strikt zwischen dem historischen Zustand (vor Commit `d2363e7`) und dem aktuellen Repository-Zustand getrennt:

*   **Historischer Zustand (Commit `d2363e7^`):** Die Datei `luminapraxisds.md` enthielt englische H2-Überschriften. Der Syntax-Linter war grün.
*   **Aktueller Zustand (Commit `d2363e7` / HEAD):** Die Datei enthält korrekte deutsche Überschriften. Der Linter ist weiterhin grün.
*   **Invariante:** *CURRENT_FILE DOES_NOT_AUTOMATICALLY_PROVE HISTORICAL_FILE.*
    Der historische Zustand wird ausschließlich über Git-Commit-Hashes (`d2363e776159090cff6613e020d41e3451587067`) nachgewiesen.

---

## 8. Requirement-Fidelity Trace

Der Nachweis-Pfad von der Anforderung bis zur Verifizierung:

```text
GOVERNANCE REQUIREMENT (Deutsche Fallstudien-Überschriften)
  ↓
SPECIFICATION (BECC-Schreibstandard)
  ↓
IMPLEMENTATION DRAFT (Englische Überschriften in luminapraxisds.md)
  ↓
STATIC LINTING (PASSED — prüft nur Syntax)
  ↓
SOURCE-FIDELITY AUDIT (FAILED — deckt Sprachabweichung auf)
  ↓
REMEDIATION COMMIT d2363e7 (Deutsche Überschriften)
  ↓
SOURCE-FIDELITY REVIEW (PASSED — EV-BG-004 bestätigt)
```

Missing Stage Rule: Nicht nachgewiesene Stufen (z. B. ein automatischer NLP-Sprachprüfer) werden explizit als `NOT_AVAILABLE` deklariert und nicht erfunden.

---

## 9. Correctness Dimensions

Artikel 04 muss folgende 8 Korrektheits-Dimensionen begrifflich sauber trennen:

1.  **SYNTAX_CORRECTNESS:** Formelle Gültigkeit des Markdown-Codes (z. B. korrekt gesetzte `##`-Zeichen). *Ergebnis in EV-BG-004: ERFÜLLT.*
2.  **STRUCTURAL_CORRECTNESS:** Korrekte hierarchische Anordnung und Platzierung der Überschriften. *Ergebnis in EV-BG-004: ERFÜLLT.*
3.  **ARCHITECTURAL_CORRECTNESS:** Einhaltung der Content-Collection-Schema-Vorgaben in Astro. *Ergebnis in EV-BG-004: ERFÜLLT.*
4.  **REQUIREMENT_FIDELITY:** Inhaltliche Übereinstimmung mit der Anforderung (deutsche Sprache). *Ergebnis in EV-BG-004: ZUNÄCHST VERLETZT, SEIT d2363e7 ERFÜLLT.*
5.  **BEHAVIOURAL_CORRECTNESS:** Korrektes Verhalten interaktiver Komponenten (z. B. Rechner-Skripte). *Ergebnis in EV-BG-004: NICHT GEPRÜFT DURCH DIESEN COMMIT.*
6.  **RUNTIME_VERIFICATION:** Erfolgreicher Pipeline-Durchlauf von Linter und Build-Tools. *Ergebnis in EV-BG-004: ERFÜLLT.*
7.  **GOVERNANCE_AUTHORIZATION:** Formelle Freigabe des Commits durch das Team. *Ergebnis in EV-BG-004: ERFÜLLT.*
8.  **ASSURANCE:** Dokumentiertes Source-Fidelity-Audit in `stewardship/reviews/`. *Ergebnis in EV-BG-004: ERFÜLLT.*

*Leitsatz: ONE_CORRECTNESS_DIMENSION != ALL_CORRECTNESS_DIMENSIONS.*

---

## 10. Claim Ledger

Vollständiges Verzeichnis aller im Artikel zulässigen und verbotenen Aussagen:

| ID | Vorgeschlagener Claim | Evidenz-Klasse | Direkt-Quelle | Zustand | Stärke | Zulässige Formulierung | Verbotene Übertreibung | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CLM-01** | Entwurf von `luminapraxisds.md` enthielt englische H2-Überschriften. | `IMPLEMENTATION` | Commit `d2363e7` | Historical | `STRONG` | "Der initiale Entwurf enthielt englische Zwischenüberschriften." | "Das System war komplett fehlerhaft." | `APPROVED` |
| **CLM-02** | Commit `d2363e7` übersetzte die Überschriften ins Deutsche. | `EXECUTION` | Commit `d2363e7` | Historical | `STRONG` | "In Commit d2363e7 wurden die Überschriften ins Deutsche übersetzt." | "Der Commit hat alle inhaltlichen Fehler des Projekts gelöst." | `APPROVED` |
| **CLM-03** | Der Markdown-Linter schlug vor der Übersetzung nicht fehl. | `VERIFICATION` | `lint_markdown.cjs` | Historical | `STRONG` | "Der automatisierte Linter meldete keinen Fehler, da die Markdown-Syntax korrekt war." | "Die Pipeline hat den Fehler bestätigt." | `APPROVED` |
| **CLM-04** | Der Linter prüft Syntax und Links, aber keine Sprachregeln. | `SPECIFICATION` | `lint_markdown.cjs` | Current | `STRONG` | "Der Linter prüft formelle Syntaxregeln, besitzt jedoch keine Inhaltsprüfungs-Logik." | "Der Linter ist nutzlos." | `APPROVED` |
| **CLM-05** | Die Abweichung wurde durch ein manuelles Audit aufgedeckt. | `ASSURANCE` | Review `EV-BG-004` | Historical | `STRONG` | "Die Abweichung wurde durch ein strukturiertes Source-Fidelity-Audit aufgedeckt." | "Eine KI hat den Inhaltsfehler automatisch korrigiert." | `APPROVED` |
| **CLM-06** | Ein grüner Linter-Status beweist keine inhaltliche Korrektheit. | `INFERENCE` | Evidenz-Analyse | Current | `STRONG` | "Ein erfolgreicher Linter-Durchlauf beweist die Einhaltung formaler Regeln, nicht die inhaltliche Wahrheit." | "Tests sagen gar nichts aus." | `APPROVED` |
| **CLM-07** | Statische Code-Fakten zeigen Existenz, nicht Anforderungs-Konformität. | `INFERENCE` | Evidenz-Analyse | Current | `STRONG` | "Code-Fakten belegen, dass Strukturen existieren, nicht ob sie die inhaltliche Anforderung erfüllen." | "Code ist irrelevant für den Nachweis." | `APPROVED` |
| **CLM-08** | Kombination aus automatischer Syntax- und manueller Inhaltsprüfung sichert Qualität. | `INFERENCE` | Evidenz-Analyse | Current | `MODERATE` | "Automatisierte Checks und manuelle Reviews ergänzen sich didaktisch." | "Manuelle Reviews machen automatisierte Tests überflüssig." | `APPROVED` |
| **CLM-09** | Sprachregeln waren Teil der Projekt-Governance. | `SPECIFICATION` | Governance-Dokumente | Current | `STRONG` | "Die Verpflichtung zur deutschen Sprache ergab sich aus den Projekt-Governance-Vorgaben." | "Es handelte sich um ein universelles Naturgesetz." | `APPROVED` |

*Leitsatz: CLAIM_LEDGER_COMPLETENESS: ALL_MATERIAL_CLAIMS.*

---

## 11. Contradiction Register

| ID | Quelle / Konflikt | Typ | Analyse / Einordnung | Erforderliche Korrektur im Artikel |
| :--- | :--- | :--- | :--- | :--- |
| **CON-01** | Entwurfstext spricht von "Übersetzungsfehler" vs. reine Sprachwahl. | `OVERSTATEMENT` | Es handelte sich um englische Begriffe im deutschen Kontext, keinen syntaktischen Übersetzungscrash. | Begriff präzisieren: "Abweichung von der Sprachvorgabe (Englisch statt Deutsch)". |
| **CON-02** | Entwurfstext nennt Linter-Prüfung pauschal "der Test war grün". | `STALE_WORDING` | Markdown-Linting ist ein statischer Syntax-Check, kein Verhaltenstest. | Präzisieren: "Der statische Linter-Check war grün". |
| **CON-03** | Entwurf impliziert, dass Linter den Fehler finden *müsste*. | `OVERSTATEMENT` | Ein Syntax-Linter kann ohne NLP-Regeln keine Sprache interpretieren. | Aufklären: Linter tat genau das, wofür er konfiguriert war (Syntax-Check). |

---

## 12. Narrative Risk Register

| Risk ID | Schweregrad | Stelle im Text | Risiko | Erforderliche Behandlung |
| :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | `HIGH` | Einleitung | Gleichsetzung von Linter-Check mit Verhaltenstest erzeugt Scheinsicherheit. | Statische Linter-Prüfung explizit von dynamischen Unit-Tests abgrenzen. |
| **RISK-02** | `MEDIUM` | Hauptteil | Begriff "Strukturelle Korrektheit" wird ohne vorherige Erklärung eingeführt. | Hinführung nach `UNDERSTAND_FIRST -> TERM_SECOND` strukturieren. |
| **RISK-03** | `MEDIUM` | Lektionen | Formulierung erweckt den Eindruck, automatisierte Linte-Checks seien wertlos. | Didaktische Rolle des Linters als notwendige, aber nicht hinreichende Stufe stärken. |

---

## 13. Central Transferable Lesson

**Didaktische Kernbotschaft:**
> Statische Code-Fakten und erfolgreiche Linter-Checks beweisen zuverlässig, dass Dateien existieren und formelle Syntaxregeln einhalten. Sie beweisen nicht automatisch, dass der Inhalt fachlich richtig ist oder allen inhaltlichen Governance-Anforderungen entspricht.

*Leitsatz: CENTRAL_TRANSFERABLE_LESSON: ONE.*

---

## 14. Transferability Boundary

*   **Gültigkeitsbereich:** Die Lektion gilt für statische Dokumentations-Prüfungen, Content-Pipeline-Builds, Markdown-Linting und die Interpretation von CI-Signalen in der Software-Entwicklung.
*   **Abgrenzung:** Die Lektion besagt *nicht*, dass automatisierte Tests nutzlos sind, sondern definiert deren Grenzen. Sie gilt nur insoweit, als formelle Regelsätze (Syntax) von inhaltlich-semantischen Anforderungen (Bedeutung/Sprache) getrennt sind.
*   *Leitsatz: TRANSFERABLE != UNIVERSAL.*
*   *Leitsatz: TRANSFERABILITY_BOUNDARY: EXPLICIT.*

---

## 15. ADVANCED Narrative Architecture

Vorgesehene didaktische Sequenz für die Überarbeitung (Funktionale Blöcke):

1.  **Block 1 (Reale technische Situation):** Einlieferung der Fallstudie *Lumina Praxis* in das Repository.
2.  **Block 2 (Direkte Beobachtung):** Der CI-Linter meldet einen grünen Haken. Formell ist die Datei perfekt.
3.  **Block 3 (Trügerischer Eindruck):** Das grüne Signal vermittelt das Gefühl vollständiger Korrektheit.
4.  **Block 4 (Der Zweifel / Die Entdeckung):** Ein manuelles Source-Fidelity-Audit zeigt: Die Überschriften sind auf Englisch verfasst, obwohl die Governance deutsche Sprache vorschreibt.
5.  **Block 5 (Erkenntnis / Kognitive Pause):** Warum hat der Linter das nicht gemeldet? Weil er nur Syntax prüft, keine Sprache.
6.  **Block 6 (Begriffseinführung):** Abgrenzung von *Code-Fakten* (Datei existiert, Syntax stimmt) und *struktureller/semantischer Korrektheit* (Inhalt erfüllt die Governance).
7.  **Block 7 (Evidenz-Schritt - Commit d2363e7):** Gezielte Korrektur der Überschriften im Quelltext.
8.  **Block 8 (Evidenz-Grenzprüfung):** Was belegt die Pipeline? Was erfordert weiterhin menschliches Attest?
9.  **Block 9 (Praxis-Transfer):** Checkliste für Entwicklungs-Teams zur Ebenentrennung von Syntax und Semantik.
10. **Block 10 (Zentraler Takeaway):** Komprimierte Zusammenfassung als Callout.
11. **Block 11 (Glossar):** Begriffserklärungen am Ende.

*Status: ADVANCED_NARRATIVE_ARCHITECTURE: FROZEN.*

---

## 16. Terminology Plan

Relevante Fachbegriffe und deren schrittweise didaktische Einführung (`UNDERSTAND_FIRST → TERM_SECOND`):

1.  **Code-Fakt (Code Fact):**
    *   *1. Einfache Erklärung:* Die reine, maschinell messbare Tatsache, dass eine Zeile Code oder eine Datei im Repository existiert.
    *   *2. Technischer Begriff:* Statische Repository-Existenz.
    *   *3. Reales Beispiel:* Das Vorhandensein von `## Context` in `luminapraxisds.md`.
2.  **Syntaktische Validierung (Syntax Checking):**
    *   *1. Einfache Erklärung:* Die automatische Prüfung, ob formelle Schreibregeln (z. B. Klammern, Überschriften-Zeichen) eingehalten wurden.
    *   *2. Technischer Begriff:* Linter-Prüfung / Parsing.
    *   *3. Reales Beispiel:* `node tooling/lint_markdown.cjs`.
3.  **Semantische Korrektheit / Anforderungs-Konformität (Requirement Fidelity):**
    *   *1. Einfache Erklärung:* Die tatsächliche inhaltliche Richtigkeit eines Textes oder Programms gemessen an den realen Projektregeln.
    *   *2. Technischer Begriff:* Semantic correctness & domain rule compliance.
    *   *3. Reales Beispiel:* Übersetzen von "Context" zu "Ausgangssituation".
4.  **Source-Fidelity-Audit:**
    *   *1. Einfache Erklärung:* Das gezielte Nachprüfen, ob veröffentlichte Inhalte exakt mit den echten Entwicklungsdaten übereinstimmen.
    *   *2. Technischer Begriff:* Manuelle Auditierung der Quellentreue.
    *   *3. Reales Beispiel:* Review-Prozess zu EV-BG-004.

---

## 17. Cognitive Load Plan

*   **Regel 1 (ONE_COGNITIVE_JOB_PER_SENTENCE: PREFERRED):** Sätze im Hauptteil erklären jeweils genau eine Beziehung (z. B. Trennung von Linter-Funktion und Sprach-Regel).
*   **Regel 2 (ONE_MAIN_IDEA_PER_SHORT_PARAGRAPH: PREFERRED):** Absätze umfassen maximal 3-4 Sätze und gewähren kognitive Pausen.
*   **Sprachniveau:** A2-B1 Satzgrammatik kombiniert mit hoher didaktischer Präzision auf `ADVANCED`-Niveau.
*   *Leitsatz: ADVANCED_TECHNICAL_CONCEPT != ADVANCED_GERMAN_GRAMMAR.*

---

## 18. Evidence Presentation Plan

*   **Evidenz-Grenzprüfung (Function):** `INVARIANT` (MUSS enthalten sein).
*   **Visuelle Darstellung (Form):** `VARIABLE` (Nutzung eines dedizierten Callout-Blocks `<div class="learning-evidence-boundary">` zur Hervorhebung der Linter-Grenzen).
*   **Inhalt der Abgrenzung:** Der Callout betont explizit, dass ein grüner Linter-Lauf formelle Syntax belegt, aber keine Inhaltsprüfung ersetzt.

---

## 19. Code Excerpt Plan

Sparsamer und zweckgebundener Einsatz von Code-Zeilen:

*   **Auszug 1 (Diff-Vergleich):**
    ```markdown
    - ## Context
    + ## Ausgangssituation
    ```
*   **Zweck:** Visueller Nachweis der korrigierten Sprachabweichung in Commit `d2363e7`.
*   **Auszug 2 (Ebenen-Schema in Textform):**
    ```text
    [ Code & Syntax OK ]  --> Linter-Status GRÜN (Formelle Ebene)
            ≠
    [ Inhaltlich korrekt ] --> Manuelles Review OK (Semantische Ebene)
    ```
*   *Leitsatz: CODE_EXCERPT_WITHOUT_EVIDENCE_PURPOSE: PROHIBITED.*

---

## 20. Verification Evidence Plan

Übersicht der technischen Prüfungen und deren Reichweite für EV-BG-004:

| Prüf-Medium | Was wurde geprüft? | Was war das Ergebnis? | Was bleibt ungeprüft? |
| :--- | :--- | :--- | :--- |
| **`lint_markdown.cjs`** | H1-Existenz, relative Links, Syntax | `PASS` (Formell korrekt) | Sprachwahl (Englisch vs. Deutsch) |
| **`astro build`** | Statisches HTML-Rendern | `PASS` (Seite kompiliert) | Fachliche Richtigkeit der Überschriften |
| **Source-Fidelity Audit** | Abgleich mit Governance-Vorgaben | `PASS` (Nach Commit `d2363e7`) | Automatische Regressionstests für Sprache |

---

## 21. Evidence Gaps

*   **Lücken-Register:**

| Gap ID | Fehlende Evidenz | Warum wichtig? | Auswirkung auf Artikel | Kann Artikel fortfahren? | Erforderliche Zukunftsevidenz |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | Automatischer NLP-Linter für Sprache | Zeigt, ob Sprachprüfung automatisierbar wäre | Keine (Artikel betont bewusst manuelle Audit-Notwendigkeit) | `YES` (Non-blocking) | Eventuelles künftiges Tooling |

*   **Blockierende Lücken (P0/P1):** `0`.
*   *Status: BLOCKING_EVIDENCE_GAPS: 0.*

---

## 22. Refusal / Weakening Rules

Der spätere Text MUSS folgende Formulierungen verweigern oder abschwächen:

1.  **Refusal 1:** Aussagen, die den Linter als "fehlerhaft" bezeichnen, sind zu verweigern (der Linter arbeitete gemäß seiner Konfiguration korrekt).
2.  **Refusal 2:** Aussagen, dass grüne Pipeline-Durchläufe wertlos seien, sind abzuschwächen (sie sichern die Syntax, aber nicht die Semantik).
3.  **Refusal 3:** Die Behauptung, dass statische Code-Fakten die Anforderungs-Erfüllung beweisen, ist strikt zu verweigern.

*Status: OVERCLAIM_REFUSAL_RULES: DEFINED.*

---

## 23. Current Article Disposition Map

Zuordnung der Abschnitte des aktuellen Textentwurfs zur künftigen Überarbeitung:

| Aktueller Abschnitt | Geplante Disposition | Begründung / Erforderliche Anpassung |
| :--- | :--- | :--- |
| **Frontmatter** | `KEEP` | Provenienz `EV-BG-004` und Niveau `advanced` sind korrekt gesetzt. |
| **Einleitung** | `REWRITE_LATER` | Schärfere Hinführung zum trügerischen Eindruck des grünen Linter-Hakens. |
| **Abschnitt 1 (Was ist passiert?)** | `REWRITE_LATER` | Präzises Benennen der H2-Übersetzungsabweichung in Commit `d2363e7`. |
| **Abschnitt 2 (Der Begriff)** | `SPLIT_LATER` | Deutlichere Trennung von Syntax-Prüfung und semantischer Korrektheit nach `UNDERSTAND_FIRST`. |
| **Callout (Evidence Boundary)** | `KEEP` | Inhaltlich exakt, wird im Layout beibehalten. |
| **Lektionen (Anwenden)** | `WEAKEN_LATER` | Prinzipien klar als Ebenentrennung (Syntax vs. Semantik) formulieren. |
| **Takeaway & Glossar** | `KEEP` | Begriffe *Syntaktische Validierung* und *Semantische Korrektheit* beibehalten. |

---

## 24. Implementation Readiness Decision

*   **Claim Ledger:** Vollständig (`9/9` Material Claims evidenciasabgesichert).
*   **Evidenz-Map:** Vollständig an `EV-BG-004` gebunden.
*   **Blockierende Lücken:** `0`.
*   **Transferierbare Lektion:** Bounded & gefroren.
*   **Narrativ-Architektur:** Gefroren.
*   **Übertreibungs-Schranken:** Definiert.
*   **Lern-Gates:** `UNDERSTAND_GATE: PASS`, `NAME_GATE: PASS`, `EVIDENCE_GATE: PASS`, `REUSE_GATE: PASS`, `TRANSFERABILITY_BOUNDARY_GATE: PASS`.

**Entscheidung zur Implementierungs-Bereitschaft:**
```text
ARTICLE_04_IMPLEMENTATION_READY: YES
ARTICLE_04_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED
```

---

## 25. Gate Status & Checklist Verification

```text
UNDERSTAND_GATE: PASS
NAME_GATE: PASS
EVIDENCE_GATE: PASS
REUSE_GATE: PASS
TRANSFERABILITY_BOUNDARY_GATE: PASS

TERMINOLOGY_PLAN_COMPLETE: YES
COGNITIVE_LOAD_PLAN_COMPLETE: YES
EVIDENCE_PRESENTATION_PLAN_COMPLETE: YES
CODE_EXCERPT_PLAN_COMPLETE: YES
VERIFICATION_EVIDENCE_PLAN_COMPLETE: YES
OVERCLAIM_REFUSAL_RULES: DEFINED
CURRENT_ARTICLE_DISPOSITION_MAP_COMPLETE: YES

ARTICLE_IMPLEMENTATION_PERFORMED: NO
```
