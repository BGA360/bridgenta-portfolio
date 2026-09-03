# BECC Public Learning Standard v1.0 — Active Standard
## Governance-Richtlinie für öffentliche Lerninhalte und Provenienz-Sicherung

*   **Identifikator:** `BECC-PLS-v1.0`
*   **Status:** `APPROVED / ACTIVE`
*   **Version:** `v1.0.0-Extension`
*   **Änderungskategorie:** Kategorie B (Konstitutionelle Erweiterung)
*   **Einreicher:** Constitutional Architect
*   **Freigabe-Autorität:** Project Owner (Letztentscheidungsrecht)
*   **Inkrafttreten:** Formell genehmigt und aktiviert durch `AMD-0001` im Verfassungsänderungsregister (Originally introduced as an approval candidate, formally accepted and implemented through AMD-0001).

---

## 1. Geltungsbereich & Zweck (Scope)

Dieser Standard regelt die Erstellung, Prüfung, Veröffentlichung und Pflege aller bildungsorientierten Inhalte (Lernartikel, Fallstudien-Analysen, Konzepterklärungen) im `/lernen/`-Verzeichnishorizont von BridGenta.de. 

Der primäre Zweck ist die Gewährleistung einer lückenlosen, nachvollziehbaren, quellengetreuen und revisionsfähigen Verknüpfung öffentlicher Lerninhalte mit realen Software-Entwicklungsaktivitäten. 
*   **Qualitätsziel:** `ASSURANCE_GOAL: TRACEABLE_AND_EVIDENCE_BOUNDED`
*   *Dieser Standard garantiert keine absolute Fehlerfreiheit (Error-Free) von Inhalten, sondern etabliert ein Verfahren zur evidentiellen Nachvollziehbarkeit und Berichtigung.*

---

## 2. Quell-Autorität (Source Authority)

### 2.1 Die fundamentale Quell-Regel
> **`LEARNING_SOURCE_REQUIREMENT`**: Jeder öffentliche BridGenta-Lernartikel MUSS zwingend aus einem dokumentierten realen Software-Entwicklungsereignis (Development Event) hervorgehen.

### 2.2 SSoT-Primat
Die ursprüngliche Entwicklungsdokumentation und die zugehörigen Test- und Ausführungsprotokolle des Quellprojekts bilden die einzige **Single Source of Truth (SSoT)**. 
*   Der öffentliche Lernartikel ist eine pädagogische Ableitung (Derivat) dieser SSoT.
*   Der Lernartikel darf niemals selbst zur primären historischen Quelle von Projektfakten erhoben werden.
*   Das SSoT-Material wird niemals zum bloßen Zweck der Veröffentlichung in das Portfolio-Repository kopiert. Es verbleibt in seinem autoritativen, versionierten Ursprungssystem.

---

## 3. Provenienz-Anforderungen & Locator-Registrierung

### 3.1 Das Provenienz-Modell
Jeder Lernartikel muss über seine Metadaten eindeutig mit dem entsprechenden Entwicklungsereignis verknüpft werden. Diese Verknüpfung erfolgt über ein zweistufiges Modell:

1.  **Im Lernartikel (Frontmatter Schema):**
    Jeder Artikel deklariert exakt ein Provenienz-Attribut in seinen YAML-Metadaten:
    ```yaml
    provenanceRef: <canonical event reference>
    ```
2.  **Im lokalen Provenienz-Register (Registry File):**
    Das lokale Register fungiert als strukturierter **Locator (Index)**. Es verweist die Ereignis-ID (`provenanceRef`) auf die physischen Metadaten des Ursprungssystems:
    ```json
    {
      "eventId": "EV-BG-002",
      "sourceProject": "bridgenta-workspace",
      "sourceSystem": "git",
      "sourceLocator": "validation/automation_controller.js",
      "historicalLocator": "d1d0ef61d5464173b208c07b8acffa4894d87d12"
    }
    ```

### 3.2 Locator-Einschränkung (Locator Only)
*   **Prinzip:** `REGISTRY_ROLE: LOCATOR_ONLY`
*   Das Provenienz-Register dient ausschließlich dem Nachweis der Existenz und Verortung des Quell-Ereignisses. Es darf **keine** inhaltlichen Beschreibungen, Analysen, AI-Prompts, Fehlerursachen oder Entwicklerabsichten enthalten. Diese Details verbleiben im Quellprojekt-SSoT.

### 3.3 Interner Provenienz-Schutz (Internal Provenance Boundary)
*   **Prinzip:** `REGISTRY_PUBLICATION_STATUS: INTERNAL_ONLY`
*   Das Provenienz-Register und seine internen Attribute (wie private Datei-URIs, interne Repository-URLs oder Commit-SHAs) dienen der internen Governance und sind standardmäßig **nicht** für die öffentliche Rendering-Ebene bestimmt.
*   Die Verknüpfung `provenanceRef` ist intern. Event-IDs und Quell-Pfadbeschreibungen dürfen auf der öffentlichen Webseite nur ausgegeben werden, wenn dies:
    1.  nachweislich sicher zu veröffentlichen ist (keine Secret- oder Pfad-Leaks); und
    2.  einen klaren pädagogischen Nutzen für den Leser stiftet.
*   *Leitsatz: SAFE_TO_DISCLOSE ≠ SHOULD_BE_DISPLAYED.*

---

## 4. Derivationsgrenzen & Verbot freier Rekonstruktion

Bei der Übersetzung der technischen SSoT-Dokumentation in einen Lernartikel gilt ein striktes **Wahrheits-Erhaltungsgebot**:

*   **Zulässige didaktische Vereinfachung:** Der Text darf komplexe Systemstrukturen reduzieren, Analogien verwenden oder nebensächliche technische Details weglassen, um die kognitive Last zu minimieren.
*   **Verbotene freie Rekonstruktion:** Es ist streng verboten, inhaltliche Aspekte zu erfinden oder hinzuzufügen, die nicht durch die SSoT gestützt sind. Dazu gehören:
    *   Erfundene Fehlerursachen oder Chronologien.
    *   Erfundene Prompts oder AI-Antworten.
    *   Erfundene Entwickler-Motivationen.
    *   Überspitzte oder verfälschte Leistungsergebnisse.
*   **Leitsatz:** *Das Lernniveau darf die sprachliche Komplexität ändern; der zugrundeliegende Wahrheitsgehalt des Projekts darf sich nicht ändern.*

---

## 5. Wahrheitskonservierung über Lernniveaus (Truth Preservation)

Wenn ein einzelnes Entwicklungsereignis als Grundlage für mehrere Lernartikel unterschiedlicher kognitiver Niveaus (PUBLIC, BEGINNER, INTERMEDIATE, ADVANCED) dient, gilt:

*   **Laterale Ableitung:** Alle Artikelstufen leiten sich unabhängig und parallel direkt aus dem SSoT-Ereignis ab.
*   **Verbot kaskadierender Wahrheit:** Ein Niveau darf seine inhaltliche Wahrheit nicht aus einem anderen Niveau ableiten (z. B. Beginner leitet sich von Public ab). Jedes Derivat muss eigenständig gegen das Quellereignis verifiziert werden.
*   **Eindeutigkeit:** Die Artikel müssen unter separaten, eindeutigen Dateinamen (Slugs) abgelegt werden, teilen sich jedoch dieselbe `provenanceRef` im Frontmatter.

---

## 6. Aufteilung von Projektfakten und Transfer-Lehren

*   **Prinzip:** Projektbezogene Fakten und transferierbare Lehren MÜSSEN für Leser und Reviewer eindeutig unterscheidbar sein.
*   **Umsetzung:** Die Abgrenzung kann im Text durch prose, spezifische Überschriften, visuelle Boxen (Callouts) oder Fußnoten erfolgen. Es wird kein bestimmtes visuelles UI-Element oder Schema-Feld erzwungen.
*   **Fakten-Bindung:** Projektbezogene Fakten müssen an ihre Messumgebung gebunden und als solche benannt werden (z. B. *"im Pilotlauf gemessen"*). Transferierbare Lehren dürfen nicht als allgemeingültige Garantien formuliert werden.

---

## 7. Grenzen der Evidenzstärke (Evidence Boundary)

Kein Lerninhalt darf Behauptungen aufstellen, die über die tatsächliche Aussagekraft der vorhandenen Belege hinausgehen.

*   **Beispiel:** Ein erfolgreicher Linter-Durchlauf (grüner Haken) beweist die Einhaltung formaler Regeln. Er darf im Text niemals als Beweis für die inhaltliche Wahrheit oder die Abwesenheit von logischen Fehlern dargestellt werden.
*   **Transparenz:** Der Artikel muss dem Leser die Grenzen der gezeigten Evidenz offenlegen (was beweist dieser Beleg und was beweist er ausdrücklich nicht).

---

## 8. Historische Korrekturen & Revisionsverwaltung

Änderungen am Quell-Projekt-SSoT verändern nicht automatisch rückwirkend den historischen Lernartikel:

*   **Prinzip:** `SOURCE_REVISION_ARTICLE_STATUS: HUMAN_DECISION`
*   Wird das ursprüngliche Entwicklungsdokument korrigiert oder aktualisiert, löst dies ein manuelles **Source-Fidelity Impact Review** aus. 
*   **Review-Entscheidung:** Der Reviewer entscheidet, welche Auswirkung die Änderung auf den Lernartikel besitzt. Mögliche Zustände sind:
    *   *NO CHANGE:* Keine Änderung nötig, die Lehre bleibt intakt.
    *   *CURRENT:* Der Artikel wird aktualisiert, um den aktuellen Stand abzubilden.
    *   *HISTORICAL:* Der Artikel wird unverändert gelassen und als historischer Stand markiert.
    *   *CORRECTED:* Der Artikel wird korrigiert. In den Metadaten wird `publicStatus: corrected` gesetzt, was automatisch eine standardisierte Notice im Layout einblendet. Die Korrekturdetails werden chronologisch im Text dokumentiert.
*   *PRAG darf den inhaltlichen Artikel-Status nicht automatisch aus der Git-Historie ableiten.*

---

## 9. Prüfprozesse: Fresh-Reader- & Source-Fidelity-Reviews

Jeder Lernartikel muss vor der Veröffentlichungsfreigabe zwei separate manuelle Prüfungen durchlaufen. Die Ergebnisse werden in einem **dokumentierten, attribuierbaren und separat attestierbaren Review-Protokoll** erfasst:

*   **Prinzip:** `SEPARATE_AND_SEPARATELY_ATTESTED_REVIEW_DIMENSIONS`
*   Die beiden Prüfungen können von derselben Person oder von verschiedenen Personen durchgeführt werden (Workflow-Leitlinie), müssen aber als getrennte Nachweis-Schritte protokolliert werden.

### 9.1 Fresh-Reader-Audit (Verständlichkeits-Prüfung)
*   **Fokus:** `COMPREHENSION_REVIEW`. Kognitive Zugänglichkeit, Logik und sprachliche Qualität für Leser ohne internes Projektwissen.
*   **Prüfpunkte:**
    *   Ist der Text ohne internes Projektwissen verständlich?
    *   Werden Fachbegriffe bei Erstverwendung ausreichend erklärt (First-Use-Regel)?
    *   Werden die advisory Heuristiken (Satzlängen, Absätze) berücksichtigt?
*   **Lesbarkeits-Heuristiken:**
    *   *Heuristik-Regel:* `READABILITY_HEURISTICS: ADVISORY`
    *   Linguistische Satz- und Absatzgrenzen (z. B. <15 Wörter) dienen als advisory Heuristik. Abweichungen sind zulässig, wenn die technische Genauigkeit oder natürliche Lesbarkeit dies erfordern.
    *   *Satz-Prüfung:* `READABILITY_HEURISTIC_PASS ≠ CEFR_PROOF` (Ein formaler Satzlängencheck beweist keine tatsächliche CEFR-Klassifizierung).

### 9.2 Source-Fidelity-Audit (Fakten-Prüfung)
*   **Fokus:** `EVIDENCE_TRUTH_REVIEW`. Übereinstimmung mit der SSoT und Provenienz-Korrektheit.
*   **Prüfpunkte:**
    *   Ist das referenzierte Ereignis im Quellprojekt real dokumentiert?
    *   Stützen die internen Testprotokolle die im Artikel gemachten Leistungsaussagen?
    *   Werden die Evidenzgrenzen eingehalten und absolute Garantien vermieden?
    *   Liegen keine erfundenen Chronologien, Prompts oder Motivationen vor?

### 9.3 A2–B1 Sprachniveau-Richtlinie (CEFR-Klarstellung)
*   **Prinzip:** `TECHNICAL_DEPTH_DECOUPLED_FROM_GRAMMATICAL_COMPLEXITY`.
*   BridGenta Learning nutzt eine an A2–B1 orientierte deutsche Satzstruktur, wo immer dies möglich und sinnvoll ist.
*   Professionelles, technisches Fachvokabular bleibt erlaubt und notwendig. Fachbegriffe müssen bei Erstverwendung durch eine einfache Erklärung eingeführt werden (Verständnis zuerst, Begriff danach).
*   Höhere technische Komplexität (z. B. auf Intermediate- oder Advanced-Niveau) darf nicht zu einer unnötig verschachtelten oder komplexen Grammatik führen. Jede Erkenntnis muss in klaren, kurzen Sätzen formuliert werden.

### 9.4 BridGenta Learning Core Teaching Sequence & Reader Orientation
*   **Prinzip:** `BRIDGENTA_LEARNING_CORE_TEACHING_SEQUENCE`.
*   Jeder Lernartikel muss der didaktischen Reihenfolge **VERSTEHEN → BENENNEN → BELEGEN → ANWENDEN** folgen.
*   **Leser-Orientierungs-Gebot (Reader Orientation Requirement):** Der Leser muss in der Lage sein, sich die konkrete Entwicklungs- oder Governance-Situation bildlich vorzustellen, bevor der Artikel ihn auffordert, das abstrakte Konzept zu verstehen. Es gilt: `CONTEXT BEFORE CONCEPT`, `SCENE BEFORE LESSON`, `PROCESS BEFORE ABSTRACTION`.
*   **VERSTEHEN (Understand):** Zuerst muss die konkrete Situation oder das Problem ohne Fachbegriffe verständlich beschrieben werden. Der Leser muss begreifen, was passiert ist, wo im Prozess man sich befindet, warum das Problem wichtig ist und welche zentrale Frage beantwortet wird (`SITUATION_FIRST → ABSTRACTION_LATER`). Unter-Sequenz: `SCOPE → CONTEXT → EVENT → SIGNIFICANCE → CENTRAL_QUESTION`.
*   **BENENNEN (Name):** Erst danach wird der korrekte technische Begriff eingeführt und in einfachem Deutsch erklärt. Fachbegriffe dürfen nicht entfernt werden, sondern müssen verständlich mit der bekannten Situation verknüpft werden (`UNDERSTAND_FIRST → TERM_SECOND`). Unter-Sequenz: `TECHNICAL_TERM → SIMPLE_DEFINITION → RELATION_TO_KNOWN_SITUATION`.
*   **BELEGEN (Evidence):** Die Aussagen und Erkenntnisse müssen durch nachprüfbare Belege (Evidenz) gestützt sein. Der Leser muss zwischen reiner Erklärung, Behauptung, Schlussfolgerung und tatsächlicher Projektevidenz (z. B. Git-Commits oder Testberichte) klar unterscheiden können. Unter-Sequenz: `PROJECT_FACT → EVIDENCE_CLASS → EVIDENCE_LIMIT`.
*   **ANWENDEN (Apply):** Jeder Artikel muss dem Leser mindestens ein übertragbares und direkt anwendbares Werkzeug (eine Frage, eine Regel, eine Unterscheidung, ein mentales Modell, eine Checkliste, ein Entscheidungsprinzip oder eine Methode) mitgeben (`READ → UNDERSTAND → APPLY_ELSEWHERE`). Unter-Sequenz: `COMPRESSION → REUSABLE_PRINCIPLE → PRACTICAL_TRANSFER`.
*   **TRANSFERABILITY_BOUNDARY:** Eine übertragbare Lektion darf nicht breiter oder sicherer formuliert werden, als es die Evidenz stützt. Es gilt der Grundsatz: `TRANSFERABLE != UNIVERSAL` und `REUSABLE != ABSOLUTE`. Ein projektspezifischer Befund oder eine Governance-Regel darf nicht als allgemeingültiges technisches Gesetz dargestellt werden.

### 9.5 Pädagogisches Funktions-Modell (Pedagogical Function Model)
Um didaktische Vollständigkeit zu gewährleisten, ohne Artikel in starre Textschablonen zu zwingen, definiert der Standard zehn **Pädagogische Funktionen (F0–F9)** (wobei `F0–F8` als inhaltliche Pflichtfunktionen [`MUST / INVARIANT`] und `F9` als lernniveauspezifische Begriffs-Orientierung [`LEVEL_AWARE`] klassifiziert sind):

1. **F0 — SCOPE:** Welcher Teil des Systems, des Codes oder des Governance-Prozesses wird betrachtet?
2. **F1 — CONTEXT:** Wo im realen Entwicklungs- oder Veröffentlichungsprozess befinden wir uns?
3. **F2 — EVENT:** Was genau ist passiert oder was wurde beobachtet?
4. **F3 — SIGNIFICANCE:** Warum ist diese Beobachtung wichtig und relevant?
5. **F4 — EXPLANATION:** Wie funktioniert der technische Mechanismus oder die Unterscheidung?
6. **F5 — RESPONSE / STATE:** Was wurde geändert, entschieden, korrigiert oder verifiziert – oder was blieb explizit offen? *(Hinweis: Eine Lösung ist didaktisch NICHT zwingend erforderlich, wohl aber der klare Nachweis der Reaktion oder des ungelösten Zustands; `SOLUTION_REQUIRED: NO`, `RESPONSE_OR_STATE_REQUIRED: YES`).*
7. **F6 — EVIDENCE:** Was stützt die Schlussfolgerung und was beweist diese Evidenz ausdrücklich nicht?
8. **F7 — COMPRESSION:** Was ist die einprägsame zentrale Regel oder Unterscheidung?
9. **F8 — APPLICATION:** Wie kann der Leser diese Erkenntnis in anderen Projekten erkennen, wiederverwenden oder anwenden?
10. **F9 — TERMINOLOGY:** Welche Fachbegriffe benötigen für dieses Lernniveau eine verständliche Orientierung? *(Klassifikation: `LEVEL_AWARE`. Ein explizites Glossar ist optional [`DEDICATED_GLOSSARY: OPTIONAL`]. Erstverwendungs-Verständlichkeit `UNDERSTAND_FIRST → TERM_SECOND` bleibt unberührt).*

* **Gegenstands-Verhältnis:** `PEDAGOGICAL_FUNCTION: GOVERNED` vs. `HEADING_TEXT: VARIABLE`.
* **Standardisierungs-Grundsatz:** Standardisiere, was der Leser verstehen muss (`STANDARDIZE_WHAT_READER_MUST_UNDERSTAND`), nicht die exakten Überschriften, mit denen dies erreicht wird (`DO_NOT_STANDARDIZE_EXACT_HEADINGS`). Didaktische Konsistenz ist keine visuelle Schablonen-Wiederholung (`PEDAGOGICAL_CONSISTENCY != VISIBLE_TEMPLATE_REPETITION`).

### 9.6 Die fünf obligatorischen Prüftore (Conformance Gates)
Jeder Lernartikel wird im Review-Prozess gegen fünf Prüftore evaluiert:
1. **UNDERSTAND_GATE:** Kann ein Erstleser innerhalb der Einleitung/Eröffnung visualisieren, wo das Ereignis stattgefunden hat, in welchem Prozess oder Systembereich er sich befindet und welchen Geltungsbereich der Artikel abdeckt, bevor Fachbegriffe vorausgesetzt werden? (Pass-Kriterium: konkrete Szene/Prozesskontext und Problemstellung zuerst, kein vorzeitiges Jargon-Stacking; `SITUATION_FIRST`).
2. **NAME_GATE:** Werden Fachbegriffe erst nach der inhaltlichen Hinführung benannt und verständlich eingeführt? (Pass-Kriterium: präzise Fachbegriffe vorhanden, aber didaktisch eingeleitet).
3. **EVIDENCE_GATE:** Ist die Evidenz sichtbar und von Interpretationen getrennt? (Pass-Kriterium: Einhaltung der Evidenzgrenzen, keine unbewiesenen Behauptungen).
4. **REUSE_GATE:** Bietet der Artikel ein nützliches Werkzeug zur Wiederverwendung in anderen Projekten? (Pass-Kriterium: mindestens ein konkretes Werkzeug wie eine Checkliste oder Entscheidungsregel).
5. **TRANSFERABILITY_BOUNDARY_GATE:** Bewahrt die übertragbare Lektion den genauen Gültigkeitsbereich und Grad der Gewissheit der zugrundeliegenden Evidenz? (Pass-Kriterium: keine ungestützte Verallgemeinerung, projektspezifische Governance-Regeln sind als solche gekennzeichnet, allgemeine Leitlinien werden nicht als absolute Gesetze formuliert).

### 9.7 Lernniveau-differenzierte Orientierung & Terminologie
Das Ausmaß der Terminologie- und Szene-Orientierung richtet sich nach dem Zielgruppen-Niveau:
* **PUBLIC:** Starke Szenen-Orientierung, hohes Warum-es-wichtig-ist, einfache Begriffserklärung, eine klare übertragbare Lektion.
* **BEGINNER:** Stärkste Orientierung, ausführliche Begriffs-Erklärung, expliziter Aufbau eines mentalen Modells, praktische Anwendung.
* **INTERMEDIATE:** Starke Orientierung, realer Prozess-Kontext, technischer Mechanismus, Evidenz-Abgrenzung, Terminologie-Orientierung bei Bedarf, Anwendung.
* **ADVANCED:** Szene-Orientierung weiterhin erforderlich, geringere Glossar-Abhängigkeit, maximale Evidenz- und Provenienz-Tiefe, klare Architektur-, Governance- und Autoritätsgrenzen.

### 9.8 Internes Redaktions-Werkzeug (Article Function Map)
Für die Erstellung von Lernartikeln steht Redakteuren die `ARTICLE_FUNCTION_MAP` als internes Planungswerkzeug zur Verfügung.
* **Prinzip:** `FUNCTION_MAP: INTERNAL_EDITORIAL_TOOL`, `PUBLIC_TEMPLATE: NO`.
* Die Function Map dient der Strukturierung des Entwurfs vor dem Schreiben und ersetzt keine öffentlichen Layouts oder Schema-Felder.
* Die Einführung der Function Map erzeugt keinen neuen formalen Genehmigungsschritt im Routine-Workflow (`NEW_ROUTINE_APPROVAL_STAGE: NO`).

---

## 10. Konstitutionelle Autoritäts-Grenzbereiche

Zur Vermeidung von Kompetenzüberschneidungen werden folgende Grenzen festgeschrieben:
1.  **BECC Public Learning Standard:** Bestimmt die fachlichen Governance- und Zulässigkeitsregeln für Lerninhalte.
2.  **Schema / Zod:** Validiert ausschließlich strukturelle Datentypen und erlaubte Felder (z. B. Typprüfung des `provenanceRef`-Feldes).
3.  **PRAG:** Validiert ausschließlich die deterministische Einhaltung von Regeln (z. B. Vorhandensein der ID bei Veröffentlichung, Auflösbarkeit im Register).
4.  **Source Fidelity Review:** Verifiziert die inhaltliche und chronologische Wahrheit der Prose gegenüber dem Quell-SSoT.
5.  **Fresh Reader Review:** Verifiziert die Lesbarkeit und das sprachliche Niveau.
6.  **Publication Governance:** Regelt die Freigabe und Autorisation für das Deployment und Merging in `main` (gemäß `docs/publication-governance.md`).
*   *Keine Ebene darf stillschweigend Kompetenzen oder Freigabe-Autorität einer anderen Ebene übernehmen.*

---

## 11. Keine vorzeitige Abstraktion (No Premature Abstraction)

*   **Prinzip:** `NO_PREMATURE_ABSTRACTION`
*   Während der Kalibrierungsphase mit fünf Artikeln (`CALIBRATION ARTICLE 01` bis `CALIBRATION ARTICLE 05`) dürfen keine wiederverwendbaren UI-Komponenten (wie `LearningMentalModel`, `EvidenceBoundary`, `AnalogyBlock` etc.) als permanente System-Primitive deklariert oder erzwungen werden.
*   Einmalige, abgrenzbare visuelle Experimente in einzelnen Artikeln sind zulässig, sofern sie barrierefrei und datenschutzkonform sind. Sie werden erst nach Abschluss der Kohorte abstrahiert.

---

## 12. Migrations- & Einführungsmodell

Die Einführung der Provenienzpflicht folgt einem stufenweisen Phasenmodell ohne harte Datumsgrenzen:

*   **M0 — Keine Durchsetzung:** (Historischer Zustand) Keine Provenienzprüfung aktiv.
*   **M1 — Schema-Fähigkeit:** Das Schema in `config.ts` wird erweitert, um das optionale `provenanceRef` Feld aufzunehmen. Bestehende Entwürfe bleiben valide.
*   **M2 — Advisory-Validierung:** PRAG scannt veröffentlichte Artikel und gibt Warnungen aus, falls `provenanceRef` fehlt. Der Build schlägt nicht fehl.
*   **M3 — Migration bestehender Inhalte:** Die bestehenden Lernartikel (insb. Artikel 1) werden mit gültiger Provenienz ausgestattet, sobald das Quellereignis verifiziert ist.
*   **M4 — Formelle Aktivierung:** Der Project Owner aktiviert den Standard formell über die Annahme von `AMD-0001`.
*   **M5 — Blockierende Prüfung:** Jeder Artikel, dessen Status `publicationState: 'published'` ist, MUSS über eine gültige und auflösbare `provenanceRef` verfügen. PRAG blockiert den Build für jeden veröffentlichten Artikel, der dieses Kriterium nicht erfüllt.

---

## 13. Behandlung von Artikel 1 (Kalibrierungs-Fixture)

*   **Status:** `ARTICLE_1_EVENT_ID: RESOLVED`
*   Artikel 1 wurde erfolgreich auf die Event-ID `EV-BG-002` abgebildet und normativ in die Provenienz-Sicherung integriert.
*   *Historischer Hinweis:* Vor Abschluss der Provenienz-Prüfung war dieses Fixture als unresolved gelistet, und `EV-BG-002` diente vorübergehend als nicht-normatives Beispiel.

---

## 14. Normatives Regel- und Prüfungs-Verzeichnis

Jede Anforderung wird nachfolgend klassifiziert:

| Regel ID | Anforderung | Verbindlichkeit | Klasse | Schema | PRAG | Human Review | Autorität |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **LR-01** | `LEARNING_SOURCE_REQUIREMENT` erfüllt | **MUST** | GOVERNANCE | Nein | Nein | Ja (Fidelity) | Project Owner |
| **LR-02** | `provenanceRef` im Frontmatter vorhanden | **MUST** | DETERMINISTIC | Ja (Zod) | Ja (M5 blockiert)| Nein | PRAG / Zod |
| **LR-03** | `provenanceRef` im Register auflösbar | **MUST** | DETERMINISTIC | Nein | Ja (M5 blockiert)| Nein | PRAG |
| **LR-04** | Narratives Verbot freier Rekonstruktion | **MUST** | SEMANTIC | Nein | Nein | Ja (Fidelity) | Lead Editor |
| **LR-05** | Unterscheidbarkeit Fakten / Lehre gegeben | **MUST** | EDITORIAL | Nein | Nein | Ja (Fidelity) | Lead Editor |
| **LR-06** | Evidenzgrenzen eingehalten | **MUST** | SEMANTIC | Nein | Nein | Ja (Fidelity) | Lead Architect |
| **LR-07** | Korrekturen deklariert (`corrected`) | **MUST** | GOVERNANCE | Ja (Zod) | Ja (Status check)| Ja (Fidelity) | Lead Editor |
| **LR-08** | Lesbarkeits-Heuristiken geprüft | **SHOULD** | EDITORIAL | Nein | Ja (Advisory) | Ja (Fresh Reader)| Fresh Reader |
| **LR-09** | Keine permanenten UI-Abstraktionen | **MUST** | VISUAL | Nein | Nein | Ja (Calibration) | Architect |
| **LR-10** | Freigabe nach BPS eingeholt | **MUST** | GOVERNANCE | Nein | Nein | Ja (Attestation) | BPGA |
| **LR-11** | `UNDERSTAND_GATE` bestanden | **MUST** | SEMANTIC | Nein | Nein | Ja (Fresh Reader) | Lead Editor |
| **LR-12** | `NAME_GATE` bestanden | **MUST** | SEMANTIC | Nein | Nein | Ja (Fresh Reader) | Lead Editor |
| **LR-13** | `EVIDENCE_GATE` bestanden | **MUST** | SEMANTIC | Nein | Nein | Ja (Fidelity) | Lead Architect |
| **LR-14** | `REUSE_GATE` bestanden | **MUST** | EDITORIAL | Nein | Nein | Ja (Fresh Reader) | Lead Editor |
| **LR-15** | `TRANSFERABILITY_BOUNDARY_GATE` bestanden | **MUST** | SEMANTIC | Nein | Nein | Ja (Fidelity) | Lead Architect |
| **LR-16** | `READER_ORIENTATION_REQUIREMENT` erfüllt | **MUST** | SEMANTIC | Nein | Nein | Ja (Fresh Reader) | Lead Editor |
| **LR-17** | `PEDAGOGICAL_FUNCTION_COMPLETENESS` (F0-F8) gegeben | **MUST** | EDITORIAL | Nein | Nein | Ja (Fresh Reader) | Lead Editor |
| **LR-18** | `ARTICLE_FUNCTION_MAP` für Entwurf genutzt | **SHOULD** | EDITORIAL | Nein | Nein | Ja (Editorial) | Lead Editor |
| **LR-19** | `TERMINOLOGY_ORIENTATION` (F9) niveau-entsprechend | **SHOULD** | EDITORIAL | Nein | Nein | Ja (Fresh Reader) | Lead Editor |

---

## 15. BridGenta Natural Learning Rhythm (BRIDGENTA_NATURAL_LEARNING_RHYTHM)

Die prose-Ebene der Lernartikel folgt dem BridGenta Natural Learning Rhythm, um eine verständliche, fließende und kognitiv zugängliche Erklärungsstruktur zu schaffen.

### 15.1 Die zwölf Prinzipien des natürlichen Lernrhythmus
1. **CONCRETE BEFORE ABSTRACT**: Beschreibe zuerst eine konkrete Beobachtung oder Situation, bevor du zu abstrakten Begriffen oder verallgemeinerten Definitionen übergehst.
2. **UNDERSTAND BEFORE TERMINOLOGY**: Stelle sicher, dass der Leser den inhaltlichen Zusammenhang oder die Situation versteht, bevor der formelle Fachbegriff eingeführt wird.
3. **ONE COGNITIVE JOB PER SENTENCE WHERE PRACTICAL**: Jeder Satz sollte sich nach Möglichkeit darauf konzentrieren, genau eine konzeptionelle Beziehung oder einen Gedanken zu erklären.
4. **SHORT ANCHOR → EXPLANATION → PAUSE**: Nutze eine natürliche Satzlängen-Variation. Beginne mit einem kurzen Anker-Satz, gefolgt von einer detaillierteren Erklärung, und schließe mit einer kognitiven Pause.
5. **ONE MAIN IDEA PER SHORT PARAGRAPH**: Packe nicht mehrere neue Konzepte in einen einzigen Absatz. Ein Absatz darf aus einem einzigen Satz bestehen, wenn dies eine sinnvolle Pause erzeugt.
6. **QUESTIONS MAY CARRY NATURAL TRANSITIONS**: Verwende natürliche, leserorientierte Fragen (z. B. „Was ist hier eigentlich passiert?“) als Übergänge anstelle von starren Arbeitsplan-Überschriften.
7. **EXPLAIN PARTS BEFORE COMPRESSING INTO A RULE**: Erkläre die einzelnen Komponenten und Zusammenhänge einer Regel, bevor du die komprimierte Regel präsentierst.
8. **USE REPETITION FOR REINFORCEMENT, NOT DUPLICATION**: Wiederholungen zur Festigung des Lernstoffs sind erlaubt, aber vermeide redundante Satzstrukturen oder starre Pattern-Wiederholungen ohne neuen didaktischen Nutzen.
9. **STANDARDIZE PEDAGOGY, NOT VISIBLE ARTICLE SHAPE**: Stelle sicher, dass die didaktische Reihenfolge (VERSTEHEN → BENENNEN → BELEGEN → ANWENDEN) gewahrt bleibt, aber lasse zu, dass Überschriften, Absatzanzahlen und Textstrukturen flexibel variieren.
10. **REMOVE BODY HORIZONTAL RULES BY DEFAULT**: Verzichte auf Trennlinien (`---`) im Fließtext der Artikel. Nutze stattdessen Absätze, Zwischenüberschriften und Leerraum, um Struktur zu erzeugen.
11. **PRESERVE NATURAL VARIATION BETWEEN ARTICLES**: Jeder Artikel darf eine eigene Dynamik, Wortwahl und Struktur besitzen. Die Konsistenz liegt in der Didaktik, nicht in einer identischen Textmaske.
12. **THE READER SHOULD NOT NOTICE THE FRAMEWORK**: Der Leser soll einer natürlichen Erklärung folgen und nicht das Gefühl haben, ein mechanisch generiertes Formular zu lesen.

* **SOURCE_LINE_BREAK != COGNITIVE_PAUSE**: Ein Zeilenumbruch im Markdown-Quellcode ist keine hinreichende Bedingung für eine gedankliche Pause des Lesers. Jede kognitive Pause muss im gerenderten Artikel im Browser visuell deutlich wahrnehmbar sein (durch Abstände und Absätze).
* **SOURCE_FORMATTING_ALONE DOES_NOT_PROVE READER_PERCEIVED_RHYTHM**: Die Formatierung im Quelltext allein garantiert keinen guten Lesefluss; ausschlaggebend ist das im Browser sichtbare Ergebnis.

### 15.2 Stilistische Leitplanken
* **HUMANIZED != CASUAL**: Der Text bleibt professionell und respektvoll, spricht den Leser aber auf Augenhöhe an.
* **SIMPLE != SHALLOW**: Fachliche Tiefe wird beibehalten, aber durch klare Sprache zugänglich gemacht.
* **STRUCTURED != FORMULAIC**: Logischer Aufbau statt starrer Textschablonen.
* **CONSISTENT != REPETITIVE**: Gleiche didaktische Ziele, aber abwechslungsreiche sprachliche Umsetzung.
* **ADVANCED_TECHNICAL_CONCEPT != ADVANCED_GERMAN_GRAMMAR**: Komplexe technische Sachverhalte dürfen nicht durch komplexe Schachtelsätze erschwert werden.

---

## 16. Cognitive Load Principle (BRIDGENTA_COGNITIVE_LOAD_PRINCIPLE)

Das kognitive Belastungsprinzip stellt sicher, dass der Leser zu keinem Zeitpunkt mit zu vielen neuen Informationen gleichzeitig konfrontiert wird.

### 16.1 Die kognitive Kette
Didaktisch wird der Lernprozess in einzelne, aufeinander aufbauende Schritte zerlegt:
`SITUATION` → `ONE OBSERVATION` → `ONE CONTRAST` → `ONE QUESTION` → `ONE EXPLANATION` → `ONE TERM` → `ONE EVIDENCE STEP` → `ONE REUSABLE LESSON`

### 16.2 Satz- und Absatz-Rhythmus
* **Satz-Schnittstelle:** Jeder Satz sollte in der Regel nur eine einzige kognitive Aufgabe übernehmen (`ONE_SENTENCE ≈ ONE_COGNITIVE_JOB`). Längere Sätze sind erlaubt, sofern sie genau eine Beziehung verständlich erklären.
* **Satz-Dichte:** Vermeide Sätze mit mehreren Nebensätzen, vielen Qualifikationen oder verschachtelten Kausalitätsbeziehungen.
* **Absatz-Schnittstelle:** Ein Absatz behandelt genau eine Kernidee (`ONE_MAIN_IDEA → ONE_SHORT_PARAGRAPH → COGNITIVE_PAUSE`).
* **Satzlängen-Formel:** `SHORT_WHEN_POSSIBLE`, `LONGER_WHEN_NECESSARY`, `NEVER_DENSE_WITHOUT_NEED`.

### 16.3 Rendered Readability Principle (BRIDGENTA_RENDERED_READABILITY_PRINCIPLE)
Der tatsächliche Lesefluss ergibt sich aus der Summe von inhaltlichem Satzrhythmus und visuellem Layout:
`READING_RHYTHM = SENTENCE_RHYTHM + PARAGRAPH_SPACING + HEADING_SPACING + LINE_HEIGHT + LIST_SPACING + CALLOUT_SPACING`

Für die Darstellung gelten folgende qualitative Zielvorgaben auf Desktop, Tablet und Mobilgeräten:
- `DESKTOP_LINE_HEIGHT`: COMFORTABLE (angenehme Zeilenhöhe für flüssiges Lesen)
- `TABLET_LINE_HEIGHT`: COMFORTABLE
- `MOBILE_LINE_HEIGHT`: COMFORTABLE
- `PARAGRAPH_SEPARATION`: VISIBLE (Absätze heben sich deutlich voneinander ab)
- `HEADING_SEPARATION`: CLEAR (Überschriften grenzen sich klar vom vorherigen und nachfolgenden Text ab)
- `LIST_ITEM_SPACING`: READABLE (Listenpunkte wirken nicht komprimiert)
- `GLOSSARY_TERM_SPACING`: READABLE (Fachbegriffe und ihre Erläuterungen sind leicht scannbar)
- `CALLOUT_SPACING`: READABLE (Hervorhebungen und Boxen haben Luft zum Atmen)
- `NO_TEXT_BLOCK_FEELS_COMPRESSED`: YES
- `NO_VISUAL_FRAGMENTATION`: YES (Der Leerraum darf die inhaltliche Verbundenheit der Abschnitte nicht zerreißen)
- `SHARED_STYLE_RULES_GENERIC`: Gemeinsame Darstellungsstile müssen streng generisch bleiben (z. B. grundlegende Abstände, Zeilenhöhen, Listen- und Zitat-Layouts) und dürfen keine artikelspezifischen Design-Ausnahmen erzwingen. Jede Änderung an den gemeinsamen Stylesheets erfordert eine visuelle Regressionsprüfung auf Desktop, Tablet und Mobilgeräten über alle bereits veröffentlichten Lernartikel der Kohorte.


