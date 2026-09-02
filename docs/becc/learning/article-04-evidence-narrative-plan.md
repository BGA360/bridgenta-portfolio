# Article 04 Evidence & Narrative Plan
## Code-Fakten vs. strukturelle Korrektheit: Wenn grüne Tests nicht ausreichen

*   **Identifikator:** `BECC-A04-PLAN-v1.0-R1`
*   **Ziel-Artikel:** `src/content/learning/code-fakten-vs-strukturelle-korrektheit.md`
*   **Lernniveau:** `ADVANCED`
*   **Provenienz-Referenz:** `EV-BG-004`
*   **Planungs-Status:** `REMEDIATED / FROZEN / READY FOR IMPLEMENTATION AUTHORIZATION`
*   **Basis-Standard:** `BECC-PLS-v1.0` (`APPROVED / ACTIVE`)
*   **Basis-Modell:** `BECC-LCMB-v1.0` (`CALIBRATED / ACTIVE`)
*   **Autorisierungs-Status:** `ARTICLE_04_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED`

---

## 1. Purpose

Dieses Dokument definiert das **revidierte, quellen- und evidenzbasierte Planungsmodell** für die didaktische Überarbeitung von **Artikel 04** (`code-fakten-vs-strukturelle-korrektheit.md`).

Auf dem Sprachniveau `ADVANCED` trennt Artikel 04 präzise zwischen der statischen Existenz von Code/Dateien (`CODE_EXISTS` / `CODE_FACTS`), der formellen Eininhaltung von Linter-Regeln (`SYNTAX_CORRECTNESS`) und der tatsächlichen inhaltlichen sowie strukturellen Richtigkeit (`STRUCTURAL_CORRECTNESS` & `REQUIREMENT_FIDELITY`).

Diese Revisionsstufe R1 korrigiert frühere Übertreibungen:
*   Git-Commits werden ordnungsgemäß als **`IMPLEMENTATION`** (statische Repository-Änderung) statt als `EXECUTION` klassifiziert.
*   Das historische Linter-Verhalten wird sauber als beratende **`INFERENCE`** eingestuft, da kein historisches CI-Ausführungsprotokoll vorliegt.
*   Unbelegte Korrektheitsdimensionen (`ARCHITECTURAL_CORRECTNESS`, `RUNTIME_VERIFICATION`, `GOVERNANCE_AUTHORIZATION`) werden explizit als **`NOT_ESTABLISHED_BY_EV_BG_004`** deklariert.
*   Die Rolle des Source-Fidelity-Reviews wird präzise als **`VERIFICATION / REVIEW_EVIDENCE`** eingeordnet, statt unbegrenzte formelle `ASSURANCE` zu behaupten.

---

## 2. Scope & Authority Boundary

*   **Geltungsbereich:** Dieses Dokument dient ausschließlich der didaktischen und evidenzbasierten Vorbereitung von Artikel 04.
*   **Hierarchie:**
    *   Der kanonische Standard `BECC-PLS-v1.0` und das Modell `BECC-LCMB-v1.0` bleiben die übergeordneten Instanzen.
    *   *Leitsatz: PLANNING_ARTIFACT_SUPERSEDES_STANDARD: NO.*
    *   *Leitsatz: PLANNING_ARTIFACT_SUPERSEDES_BASELINE: NO.*
*   **Freeze-Garantie:** In Phase A8-R1 werden weder der Quelltext von Artikel 04 noch andere Lernartikel oder Standards verändert.
*   **Implementierungs-Schranke:**
    *   *Leitsatz: ARTICLE_04_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED.*

---

## 3. Article 04 Current State

*   **Datei:** [code-fakten-vs-strukturelle-korrektheit.md](../../../src/content/learning/code-fakten-vs-strukturelle-korrektheit.md)
*   **Aktueller Status im Modell:** `ARTICLE_04_PLANNING_READY: YES`, `ARTICLE_04_CALIBRATION_READY: YES`.
*   **Ist-Zustand:** Der vorliegende Textentwurf beschreibt anhand von Commit `d2363e7` die Übersetzung von Überschriften in der Fallstudie *Lumina Praxis* (`luminapraxisds.md`).
*   **Audit-Befund (R1):** Der Entwurf übertreibt stellenweise ("Der Test war grün"). Die Überarbeitung wird klarstellen, dass der statische Markdown-Linter `lint_markdown.cjs` nur Syntax und Überschriftenhierarchie prüft, nicht jedoch natürliche Sprache oder Governance-Sprachregeln.

---

## 4. Source Inventory

Alle im Rahmen der Evidenzanalyse genutzten Quell-Dateien und Artefakte:

| Source ID | Pfad / Locator | Revision / SHA | Rolle / Typ | Evidenz-Klasse | Verfügbarkeit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SRC-01** | `src/content/learning/code-fakten-vs-strukturelle-korrektheit.md` | HEAD (`0055a97...`) | Ziel-Artikel (Kandidat) | `SPECIFICATION` | Present |
| **SRC-02** | `src/data/provenance_registry.json` (EV-BG-004) | HEAD (`0055a97...`) | Registriereintrag | `SPECIFICATION` | Present |
| **SRC-03** | `src/data/local_integrity_manifest.json` (EV-BG-004) | HEAD (`0055a97...`) | Integritäts-Manifest | `VERIFICATION` | Present |
| **SRC-04** | `stewardship/evidence/article-4-ev-bg-004-source-evidence.md` | HEAD (`0055a97...`) | Evidenz-Paket | `VERIFICATION` | Present |
| **SRC-05** | `stewardship/reviews/code-fakten-vs-strukturelle-korrektheit.review.md` | HEAD (`0055a97...`) | Source-Fidelity-Review | `VERIFICATION` / `REVIEW_EVIDENCE` | Present |
| **SRC-06** | `src/content/projects/luminapraxisds.md` | `d2363e776159090cff6613e020d41e3451587067` | Git Commit Diff (Übersetzung) | `IMPLEMENTATION` | Present |
| **SRC-07** | `tooling/lint_markdown.cjs` | HEAD (`0055a97...`) | Linter-Quellcode (Regelanalyse) | `SPECIFICATION` | Present |

*Leitsatz: UNLISTED_EVIDENCE_SOURCE_USED: NO.*

---

## 5. EV-BG-004 Evidence Map

Für alle zentralen Konzepte von Artikel 04 gilt folgende Evidenzkette:

```text
BEHAUPTUNG (Claim)
  ↓
QUELLE (Source: Commit d2363e7 in luminapraxisds.md & tooling/lint_markdown.cjs)
  ↓
DIREKTE BEOBACHTUNG (Observation: Diff zeigt Übersetzung englischer H2-Überschriften; Linter-Code zeigt nur Syntax-/Hierarchieprüfung)
  ↓
EVIDENZ-KLASSE (Evidence Class: IMPLEMENTATION / SPECIFICATION / INFERENCE)
  ↓
ZULÄSSIGER SCHLUSS (Allowed Conclusion: Commit d2363e7 behob Sprachabweichung; Linter-Regelbereich deckte Sprache nicht ab)
  ↓
EVIDENZGRENZE (Boundary: Linter-Quellcode belegt Regelumfang, aber keinen historischen Ausführungs-Log)
```

1.  **Behauptung 1:** In `src/content/projects/luminapraxisds.md` existierten englische H2-Überschriften (*"Executive Summary"*, *"Context"*, *"Problem"* etc.).
    *   *Evidenz:* `git show d2363e776159090cff6613e020d41e3451587067^:src/content/projects/luminapraxisds.md`. `IMPLEMENTATION` (`DIRECT_EVIDENCE`).
2.  **Behauptung 2:** Commit `d2363e7` ersetzte diese durch deutsche Begriffe (*"Kurzfassung"*, *"Ausgangssituation"*, *"Problemstellung"* etc.).
    *   *Evidenz:* `git show d2363e776159090cff6613e020d41e3451587067`. `IMPLEMENTATION` (`DIRECT_EVIDENCE`).
3.  **Behauptung 3:** Die Sprachabweichung lag außerhalb des Regelbereichs des Markdown-Linters.
    *   *Evidenz:* Quellcode von `tooling/lint_markdown.cjs` prüft nur H1-Anzahl und Hierarchiesprünge. `SPECIFICATION` (`DIRECT_EVIDENCE`).
    *   *Historischer Linter-Pass:* `INFERENCE` (`MODERATE_STRENGTH`).
4.  **Behauptung 4:** Ein späteres Source-Fidelity-Review bestätigte die Behebung der Sprachabweichung.
    *   *Evidenz:* `stewardship/reviews/code-fakten-vs-strukturelle-korrektheit.review.md` (Result: `PASS`). `VERIFICATION` (`DIRECT_EVIDENCE`).

*Leitsatz: MAJOR_CLAIMS_WITHOUT_EVIDENCE_MAP: 0.*

---

## 6. Evidence Classification

Alle Aussageelemente im Artikel werden strikt nach Becc-Evidenzklassen geordnet:

*   **CLAIM (AI-/Autoren-Behauptung):** "Automatisierte Syntax-Tests garantieren vollständige inhaltliche Korrektheit." (Wird im Artikel als verfrühte Annahme widerlegt).
*   **SPECIFICATION (Anforderung/Regelwerk):** Governance-Vorgabe für deutsche Überschriften sowie Quellcode-Definition in `tooling/lint_markdown.cjs`.
*   **IMPLEMENTATION (Statischer Code/Zustand):** Datei `luminapraxisds.md` in Revision `d2363e7` und `d2363e7^`.
*   **EXECUTION (Laufzeit-Protokoll):** Nicht direkt für historische Läufe verfügbar (`HISTORICAL_EXECUTION_EVIDENCE: NOT_AVAILABLE`).
*   **VERIFICATION (Test-/Review-Nachweis):** Source-Fidelity-Review `code-fakten-vs-strukturelle-korrektheit.review.md`.
*   **ASSURANCE (Formelles Gesamt-Attest):** Nur im Rahmen des spezifischen Audit-Scopes von Review `EV-BG-004` gegeben (`LIMITED_TO_SOURCE_FIDELITY_REVIEW`).
*   **OPEN (Ungeklärte Aspekte):** Automatische sprachliche Inhaltsprüfungen in CI pipelines (aktuell nicht implementiert).

---

## 7. Historical vs Current State

*   **Historischer Zustand (Commit `d2363e7^`):** Die Datei `luminapraxisds.md` enthielt englische H2-Überschriften.
*   **Aktueller Zustand (Commit `d2363e7` / HEAD):** Die Datei enthält korrekte deutsche Überschriften.
*   **Invariante:** *CURRENT_FILE DOES_NOT_AUTOMATICALLY_PROVE HISTORICAL_FILE.*
    Historische Zustände werden strikt über Commit-Hashes nachgewiesen.

---

## 8. Requirement-Fidelity Trace

Evidenzsicherer Nachweis-Pfad (ohne erfundene historische Fehlschlag-Stufen):

```text
GOVERNANCE REQUIREMENT (Deutsche Fallstudien-Überschriften)
  ↓
HISTORISCHER CODE-ZUSTAND MIT ENGLISCHEN ÜBERSCHRIFTEN (luminapraxisds.md in d2363e7^)
  ↓
KORREKTUR-COMMIT d2363e7 (Übersetzung ins Deutsche)
  ↓
AKTUELLER CODE-ZUSTAND MIT DEUTSCHEN ÜBERSCHRIFTEN (luminapraxisds.md in d2363e7)
  ↓
SPÄTERES SOURCE-FIDELITY REVIEW BESTÄTIGT DIE DOKUMENTEN-KONFORMITÄT (EV-BG-004 review.md)

--- SEPARATE LINTER-ANALYSE ---
QUELLCODE-INSPEKTION VON tooling/lint_markdown.cjs
  ↓
ZULÄSSIGE INFERENZ: Sprachabweichung lag außerhalb des konfigurierten Linter-Prüfumfangs
```

---

## 9. Correctness Dimensions

Reconcilierte Bewertung aller 8 Korrektheits-Dimensionen für EV-BG-004:

1.  **SYNTAX_CORRECTNESS:** Formelle Gültigkeit des Markdown-Codes. *Evidenz-Basis:* Abgeleitet aus Quellcode-Inspektion von `lint_markdown.cjs`. (`INFERRED_FROM_LINTER_SCOPE`).
2.  **STRUCTURAL_CORRECTNESS:** Einordnung von Überschriften-Tags. *Evidenz-Basis:* EV-BG-004 belegt primär die sprachliche Konformität der Überschriften-Labels. (`PRIMARY_VERIFIED_DIMENSION_LIMITED_TO_LANGUAGE_CONFORMITY`).
3.  **ARCHITECTURAL_CORRECTNESS:** Einhaltung übergeordneter Systemarchitektur. *Evidenz-Basis:* `NOT_ESTABLISHED_BY_EV_BG_004`.
4.  **REQUIREMENT_FIDELITY:** Übereinstimmung mit Sprachregeln. *Evidenz-Basis:* Historisch abweichend in `d2363e7^`, korrigiert in `d2363e7`. (`HISTORICALLY_VIOLATED_THEN_REMEDIATED`).
5.  **BEHAVIOURAL_CORRECTNESS:** Laufzeitverhalten von Skripten. *Evidenz-Basis:* `NOT_EVALUATED`.
6.  **RUNTIME_VERIFICATION:** Protokollierte historische Pipeline-Ausführung. *Evidenz-Basis:* `NOT_DIRECTLY_ESTABLISHED` (Kein historisches Run-Log vorhanden).
7.  **GOVERNANCE_AUTHORIZATION:** Formelle Einzel-Freigabe von Commit `d2363e7`. *Evidenz-Basis:* `NOT_ESTABLISHED` (Kein expliziter Freigabe-Record für diesen Commit).
8.  **ASSURANCE:** Qualifizierte Review-Bestätigung. *Evidenz-Basis:* Reicht genau so weit wie der Scope des Source-Fidelity-Reviews. (`LIMITED_TO_SOURCE_FIDELITY_REVIEW`).

*Leitsatz: UNSUPPORTED_CORRECTNESS_DIMENSIONS_MARKED_FULFILLED: 0.*

---

## 10. Claim Ledger

Reconciliertes Verzeichnis aller 9 Material Claims für Artikel 04:

| ID | Vorgeschlagener Claim | Evidenz-Klasse | Direkt-Quelle | Zustand | Stärke | Zulässige Formulierung | Verbotene Übertreibung | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CLM-01** | Entwurf von `luminapraxisds.md` enthielt englische H2-Überschriften. | `IMPLEMENTATION` | Commit `d2363e7^` | Historical | `STRONG` | "Der frühere Entwurf enthielt englische Zwischenüberschriften." | "Das gesamte System war fehlerhaft." | `APPROVED` |
| **CLM-02** | Commit `d2363e7` ersetzte die Begriffe durch deutsche Überschriften. | `IMPLEMENTATION` | Commit `d2363e7` | Historical | `STRONG` | "In Commit d2363e7 wurden die Überschriften ins Deutsche übersetzt." | "Der Commit hat alle Projekt-Probleme gelöst." | `APPROVED` |
| **CLM-03** | Sprachabweichung lag außerhalb des konfigurierten Linter-Scope. | `INFERENCE` | `lint_markdown.cjs` | Historical | `MODERATE` | "Die Evidenz stützt die Inferenz, dass die Sprachabweichung außerhalb des Linter-Prüfumfangs lag." | "Der Linter schlug historisch garantiert grün fehl." | `APPROVED` |
| **CLM-04** | Der Linter prüft H1-Anzahl und Hierarchie, aber keine natürlichen Sprachen. | `SPECIFICATION` | `lint_markdown.cjs` | Current | `STRONG` | "Der Linter prüft formelle Überschriftenregeln, besitzt jedoch keine Sprachprüfungs-Logik." | "Der Linter ist nutzlos." | `APPROVED` |
| **CLM-05** | Ein späteres Source-Fidelity-Review bestätigte die Behebung. | `VERIFICATION` | Review `EV-BG-004` | Historical | `STRONG` | "Ein späteres Source-Fidelity-Review bestätigte die Behebung der Sprachabweichung." | "Das Review hat die Entdeckung erst ausgelöst." | `APPROVED` |
| **CLM-06** | Ein Syntax-Linter-Pass beweist keine inhaltliche Anforderungs-Erfüllung. | `INFERENCE` | Evidenz-Analyse | Current | `STRONG` | "Ein erfolgreicher Linter-Check beweist formelle Regeltreue, nicht die inhaltliche Richtigkeit." | "Linter-Checks sind irreführend." | `APPROVED` |
| **CLM-07** | Statische Code-Fakten belegen Existenz, nicht inhaltliche Korrektheit. | `INFERENCE` | Evidenz-Analyse | Current | `STRONG` | "Code-Fakten zeigen, dass Zeilen existieren, nicht ob sie fachlich korrekt sind." | "Code-Fakten sind wertlos." | `APPROVED` |
| **CLM-08** | Statische Checks und manuelle Reviews ergänzen sich ebenenspezifisch. | `INFERENCE` | Evidenz-Analyse | Current | `MODERATE` | "Automatisierte Syntax-Checks und manuelle Inhalts-Reviews ergänzen sich ebenenspezifisch." | "Reviews ersetzen automatisierte Prüfungen komplett." | `APPROVED` |
| **CLM-09** | Sprachregeln stützten sich auf die Dokumentations-Governance. | `SPECIFICATION` | Governance-Dokumente | Current | `STRONG` | "Die Verpflichtung zu deutschen Überschriften ergab sich aus den Governance-Vorgaben." | "Es handelte sich um ein Naturgesetz." | `APPROVED` |

*Leitsatz: CLAIM_LEDGER_COMPLETE: YES.*

---

## 11. Contradiction Register

| ID | Quelle / Konflikt | Typ | Analyse / Einordnung | Erforderliche Korrektur im Artikel |
| :--- | :--- | :--- | :--- | :--- |
| **CON-01** | Entwurfstext spricht von "Übersetzungsfehler" vs. reine Sprachwahl. | `OVERSTATEMENT` | Es handelte sich um englische Begriffe im deutschen Kontext. | Präzisieren: "Abweichung von der Sprachvorgabe (Englisch statt Deutsch)". |
| **CON-02** | Entwurfstext nennt Linter-Prüfung pauschal "der Test war grün". | `STALE_WORDING` | Markdown-Linting ist ein statischer Syntax-Check, kein Verhaltenstest. | Präzisieren: "Der statische Linter-Check war formell grün". |
| **CON-03** | Entwurf impliziert, Linter hätte Fehler erkennen müssen. | `OVERSTATEMENT` | Linter prüft ohne NLP-Regeln keine Sprache. | Aufklären: Linter arbeitete gemäß seiner Konfiguration korrekt. |

---

## 12. Narrative Risk Register

| Risk ID | Schweregrad | Stelle im Text | Risiko | Erforderliche Behandlung |
| :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | `HIGH` | Einleitung | Gleichsetzung von Linter-Check mit Verhaltenstest erzeugt Scheinsicherheit. | Statische Linter-Prüfung explizit von Verhaltenstests abgrenzen. |
| **RISK-02** | `MEDIUM` | Hauptteil | Begriff "Strukturelle Korrektheit" wird ohne vorherige Erklärung eingeführt. | Hinführung nach `UNDERSTAND_FIRST -> TERM_SECOND` strukturieren. |
| **RISK-03** | `MEDIUM` | Lektionen | Formulierung erweckt den Eindruck, automatisierte Linter-Checks seien wertlos. | Rolle des Linters als notwendige Syntax-Stufe stärken. |

---

## 13. Central Transferable Lesson

**Didaktische Kernbotschaft (Evidenzbasiert):**
> Statische Code-Fakten zeigen zuverlässig, welche Strukturen in einer Datei existieren. Ein Linter prüft genau die Regeln, für die er konfiguriert wurde. Weder Code-Existenz noch ein erfolgreicher Linter-Check beweisen automatisch, dass inhaltliche Fach- oder Governance-Anforderungen erfüllt sind.

*Leitsatz: CENTRAL_TRANSFERABLE_LESSON_EVIDENCE_BOUND: YES.*

---

## 14. Transferability Boundary

*   **Gültigkeitsbereich:** Die Lektion gilt für statische Dokumentations-Prüfungen, Content-Pipeline-Builds, Markdown-Linting und die Interpretation von CI-Signalen in der Software-Entwicklung.
*   **Abgrenzung:** Die Lektion besagt *nicht*, dass automatisierte Tests nutzlos sind, sondern definiert deren Grenzen. Sie gilt nur insoweit, als formelle Regelsätze (Syntax) von inhaltlich-semantischen Anforderungen (Bedeutung/Sprache) getrennt sind.
*   *Leitsatz: TRANSFERABLE != UNIVERSAL.*
*   *Leitsatz: TRANSFERABILITY_BOUNDARY: EXPLICIT.*

---

## 15. ADVANCED Narrative Architecture

Revidierte didaktische Sequenz für die spätere Überarbeitung (Funktionale Blöcke):

1.  **Block 1 (Reale technische Situation):** Einlieferung der Fallstudie *Lumina Praxis* in das Repository.
2.  **Block 2 (Direkte Beobachtung):** Der CI-Linter meldet formell grünes Licht für die Syntax.
3.  **Block 3 (Trügerischer Eindruck):** Das grüne Signal vermittelt das Gefühl vollständiger Anforderungs-Erfüllung.
4.  **Block 4 (Die Entdeckung):** Die Überprüfung zeigt: Die Überschriften sind auf Englisch verfasst (Abweichung von der Sprachvorgabe).
5.  **Block 5 (Erkenntnis / Kognitive Pause):** Warum meldete der Linter dies nicht? Weil sein Prüfumfang auf Syntax und Hierarchie beschränkt ist.
6.  **Block 6 (Begriffseinführung):** Abgrenzung von *Code-Fakten* (Code existiert, Syntax stimmt) und *Anforderungs-Konformität* (Inhalt erfüllt Governance).
7.  **Block 7 (Evidenz-Schritt - Commit d2363e7):** Übersetzung der Überschriften im Quelltext.
8.  **Block 8 (Evidenz-Grenzprüfung):** Was belegt die Pipeline? Was erfordert weiterhin spezifische Review-Informatik?
9.  **Block 9 (Praxis-Transfer):** Checkliste für Entwicklungs-Teams zur Ebenentrennung von Syntax und Semantik.
10. **Block 10 (Zentraler Takeaway):** Komprimierte Zusammenfassung als Callout.
11. **Block 11 (Glossar):** Begriffserklärungen am Ende.

*Status: ADVANCED_NARRATIVE_ARCHITECTURE: REVISED_AND_FROZEN.*

---

## 16. Terminology Plan

Relevante Fachbegriffe und deren schrittweise didaktische Einführung (`UNDERSTAND_FIRST → TERM_SECOND`):

1.  **Code-Fakt (Code Fact):**
    *   *1. Einfache Erklärung:* Die reine, messbare Tatsache, dass bestimmte Zeilen Code oder Dateien im Repository existieren.
    *   *2. Technischer Begriff:* Statische Repository-Existenz / Code fact.
    *   *3. Reales Beispiel:* Das Vorhandensein von `## Context` in `luminapraxisds.md` (d2363e7^).
2.  **Syntaktische Validierung (Syntax Checking):**
    *   *1. Einfache Erklärung:* Die automatische Prüfung, ob formelle Grammatik- oder Formatierungsregeln eingehalten wurden.
    *   *2. Technischer Begriff:* Linter-Prüfung / Parsing.
    *   *3. Reales Beispiel:* `tooling/lint_markdown.cjs`.
3.  **Anforderungs-Konformität (Requirement Fidelity):**
    *   *1. Einfache Erklärung:* Die tatsächliche inhaltliche Richtigkeit eines Textes gemessen an den Governance-Vorgaben.
    *   *2. Technischer Begriff:* Requirement fidelity & semantic correctness.
    *   *3. Reales Beispiel:* Ersetzen von "Context" durch "Ausgangssituation".
4.  **Source-Fidelity-Review:**
    *   *1. Einfache Erklärung:* Ein Überprüfungs-Schritt, der nachweist, dass Aussagen exakt mit den realen Entwicklungsdaten übereinstimmen.
    *   *2. Technischer Begriff:* Source fidelity review.
    *   *3. Reales Beispiel:* Review-Prozess zu EV-BG-004.

---

## 17. Cognitive Load Plan

*   **Regel 1 (ONE_COGNITIVE_JOB_PER_SENTENCE: PREFERRED):** Sätze im Hauptteil erklären jeweils genau eine Beziehung.
*   **Regel 2 (ONE_MAIN_IDEA_PER_SHORT_PARAGRAPH: PREFERRED):** Absätze umfassen maximal 3-4 Sätze.
*   **Sprachniveau:** A2-B1 Satzgrammatik kombiniert mit hohem technischen Gehalt auf `ADVANCED`-Niveau.
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
*   **Zweck:** Visueller Nachweis der Übersetzung in Commit `d2363e7`.
*   **Auszug 2 (Ebenen-Schema in Textform):**
    ```text
    [ Code & Syntax OK ]  --> Linter-Status GRÜN (Formelle Ebene)
            ≠
    [ Inhaltlich korrekt ] --> Review / Governance OK (Semantische Ebene)
    ```
*   *Leitsatz: CODE_EXCERPT_WITHOUT_EVIDENCE_PURPOSE: PROHIBITED.*

---

## 20. Verification Evidence Plan

Übersicht der technischen Prüfungen und deren Reichweite für EV-BG-004:

| Prüf-Medium | Was wurde geprüft? | Was war das Ergebnis? | Was bleibt ungeprüft? |
| :--- | :--- | :--- | :--- |
| **`lint_markdown.cjs`** | H1-Existenz, Hierarchie, Syntax | `PASS` (Formell korrekt) | Sprachwahl (Englisch vs. Deutsch) |
| **`astro build`** | Statisches HTML-Rendern | `PASS` (Seite kompiliert) | Fachliche Richtigkeit der Überschriften |
| **Source-Fidelity Review** | Abgleich mit Governance-Vorgaben | `PASS` (EV-BG-004 review.md) | Automatische NLP-Regressionstests |

---

## 21. Evidence Gaps

*   **Lücken-Register:**

| Gap ID | Fehlende Evidenz | Warum wichtig? | Auswirkung auf Artikel | Kann Artikel fortfahren? | Erforderliche Zukunftsevidenz |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | Historisches CI-Lauf-Log für d2363e7^ | Würde exakte Linter-Ausführung belegen | Keine (Linter-Regelbereich belegt Inferenz ausreichend) | `YES` (Non-blocking) | Eventuelle historische CI-Logs |

*   **Blockierende Lücken (P0/P1):** `0`.
*   *Status: BLOCKING_EVIDENCE_GAPS: 0.*

---

## 22. Refusal / Weakening Rules

Der spätere Text MUSS folgende Formulierungen verweigern oder abschwächen:

1.  **Refusal 1:** Aussagen, die den Linter als "fehlerhaft" bezeichnen, sind zu verweigern (der Linter arbeitete gemäß seiner Konfiguration korrekt).
2.  **Refusal 2:** Aussagen, dass Linter-Checks nutzlos seien, sind abzuschwächen (sie sichern die Syntax, aber nicht die Semantik).
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
*   **Narrativ-Architektur:** Revidiert & gefroren.
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
