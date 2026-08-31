# BECC Learning Canonical Model Baseline v1.0
## Kalibrierungs- und Auslegungsmodell für öffentliche Lerninhalte

*   **Identifikator:** `BECC-LCMB-v1.0`
*   **Status:** `CALIBRATED CANDIDATE / PENDING OWNER APPROVAL`
*   **Basis-Standard:** `BECC-PLS-v1.0` (v1.0.0-Extension)
*   **Version:** `1.0.0`
*   **Freigabe-Autorität:** Project Owner (Letztentscheidungsrecht)

---

## 1. Zweck (Purpose)

Dieses Dokument definiert den **kanonischen Modell-Baseline-Zustand** für die Erstellung, Strukturierung und Prüfung von Lernartikeln auf BridGenta.de. Auf Basis der ersten drei vollständig kalibrierten und eingefrorenen Referenzartikel sowie des aktiven Standards `BECC-PLS-v1.0` wird hiermit präzise festgehalten, welche didaktischen und strukturellen Muster invariant, bevorzugt, variabel, verboten oder noch ungeklärt sind. 

Ziel ist die Absicherung einer konsistenten pädagogischen Methodik, ohne die Artikel in eine starre, monotone Schablone zu zwingen.

---

## 2. Autoritäts-Verhältnis (Authority Relationship)

Dieses Dokument dient der praktischen Umsetzung und Operationalisierung des übergeordneten Standards `BECC-PLS-v1.0` im Redaktions- und Reviewprozess.
*   **Hierarchie:** Der kanonische Standard `BECC-PLS-v1.0` bleibt die höchste verfassungsrechtliche Instanz.
*   **Primat-Regel:** Dieses Kalibrierungsmodell ersetzt, überschreibt oder modifiziert die normativen Bestimmungen des Standards zu keinem Zeitpunkt. Es besitzt erläuternden und kalibrierenden Charakter für den Redaktionsbetrieb und wird erst nach formeller Freigabe durch den Project Owner und Merge wirksam.
*   *Leitsatz: BASELINE_SUPERSEDES_STANDARD: NO.*
*   *Leitsatz: BASELINE_INDEPENDENT_AUTHORITY: NO.*

---

## 3. Eigentliches Referenz-Set (Frozen Reference Set)

Dieses Modell stützt sich empirisch auf das kalibrierte und unveränderliche Referenz-Set der ersten drei Lernartikel (Kohorte 1):

1.  **Referenz 1 (Artikel 01):**
    *   *Datei:* [ai-generierte-nachweise-vs-reale-belege.md](../../../src/content/learning/ai-generierte-nachweise-vs-reale-belege.md)
    *   *Niveau:* `beginner`
    *   *Provenienz-Referenz:* `EV-BG-002` (Governance-Fehler GOV-FIND-002)
2.  **Referenz 2 (Artikel 02):**
    *   *Datei:* [revert-der-tinacms-build-integration.md](../../../src/content/learning/revert-der-tinacms-build-integration.md)
    *   *Niveau:* `beginner`
    *   *Provenienz-Referenz:* `EV-BG-003` (TinaCMS-Build-Revert)
3.  **Referenz 3 (Artikel 03):**
    *   *Datei:* [grenzen-automatisierter-linter-checks.md](../../../src/content/learning/grenzen-automatisierter-linter-checks.md)
    *   *Niveau:* `intermediate`
    *   *Provenienz-Referenz:* `EV-BG-001` (PRAG CI-Gating)

---

## 4. Kanonische Modell-Taxonomie (Canonical Model Taxonomy)

Jedes didaktische und strukturelle Element wird nach folgenden Klassen bewertet:

*   **INVARIANT:** Eine zwingende Eigenschaft, die über alle zukünftigen Lernartikel hinweg ausnahmslos gültig sein MUSS.
*   **PREFERRED:** Ein Standardmuster (Advisory), von dem nur abgewichen werden darf, wenn eine didaktisch oder technisch begründete Ausnahmesituation vorliegt.
*   **VARIABLE:** Ein Element, das sich von Artikel zu Artikel frei und dynamisch unterscheiden darf (unterstützt die sprachliche und inhaltliche Vielfalt).
*   **PROHIBITED:** Ein Muster oder Element, dessen Verwendung im Fließtext standardmäßig ausgeschlossen ist oder das dem Lernmodell direkt widerspricht.
*   **UNRESOLVED:** Ein Aspekt, für den noch nicht genügend Evidenz oder Erfahrung vorliegt, um ihn sicher zu klassifizieren.

---

## 5. Invarianten (Invariants)

Folgende Aspekte des Lernmodells sind als **INVARIANT** klassifiziert und zwingend einzuhalten:

1.  **Didaktische Kern-Sequenz:** Die Abfolge **VERSTEHEN → BENENNEN → BELEGEN → ANWENDEN** ist zwingend einzuhalten.
2.  **Verständnis vor Begriff (Understand-First):** Die logische und inhaltliche Hinführung zu einem Problem MUSS der formalen Einführung des technischen Begriffs vorangestellt werden (`UNDERSTAND_FIRST → TERM_SECOND`).
3.  **Fakten- und Evidenzbindung:** Jede inhaltliche Behauptung muss an ein reales, dokumentiertes Ereignis des Quellprojekts gebunden sein. AI-Behauptungen oder freie Rekonstruktionen sind ausgeschlossen.
4.  **Transferierbarkeit:** Jeder Artikel muss eine allgemeine, über das Projekt hinausgehende Lektion vermitteln, die klar durch die Evidenz begrenzt ist (`TRANSFERABILITY_FUNCTION`).
5.  **Evidenz-Grenzprüfung (Evidence Boundary):** Der Text muss die genauen Grenzen der dargestellten Belege offenlegen (z. B. ein Linter-Lauf beweist nur die Einhaltung formaler Regeln, keine inhaltliche Wahrheit).
6.  **Vermeidung unnötiger grammatikalischer Verschachtelungen (AVOID_UNNECESSARY_GRAMMATICAL_NESTING):** Komplexe Fachthemen dürfen nicht durch unnötig komplexe oder verschachtelte Grammatik erschwert werden. Die didaktische Klarheit hat Vorrang vor grammatikalischer Komplexität.
7.  **Zentraler Erkenntnis-Takeaway:** Jeder Artikel muss am Ende eine komprimierte didaktische Kernbotschaft als Fazit enthalten.
8.  **Responsive Readability:** Die Lesbarkeit und der Lese-Rhythmus müssen auf Desktop, Tablet und Mobilgeräten gleichermaßen komfortabel sein.
9.  **Lernniveau-Funktion:** Die inhaltliche Tiefe eines Artikels muss strikt mit der im Frontmatter deklarierten Stufe (`learningLevel`) korrespondieren (`LEARNING_LEVEL_FUNCTION`).

---

## 6. Bevorzugte Muster (Preferred Patterns)

Folgende Aspekte sind als **PREFERRED** klassifiziert (Standard-Empfehlung):

1.  **Einstiegssequenz:** Die Strukturierung des Starts gemäß der Kette `Beobachtung` → `Eindruck` → `Zweifel` → `Zentrale Frage` hat sich als optimaler didaktischer Einstieg bewährt.
2.  **Satzlängen-Rhythmus (Short Anchor):** Ein Rhythmus aus kurzen Ankersätzen, gefolgt von einer präzisen, etwas längeren Erklärung, gefolgt von einer kognitiven Pause.
3.  **Zentrale Leserfrage (CENTRAL_QUESTION_FUNCTION):** Eine explizite, leserorientierte Frage dient als natürlicher Übergang zum Hauptteil.
4.  **Glossar-Struktur:** Das Anbieten einer Begriffserklärung am Ende des Artikels in einer strukturierten Definitionsliste zur Erhöhung der Lesbarkeit.
5.  **Glossar-Präsenz (GLOSSARY_FUNCTION):** Das Platzieren eines expliziten Glossars am Ende des Artikels wird standardmäßig empfohlen, um Fachbegriffe zu rekapitulieren.

---

## 7. Variable Elemente (Variable Elements)

Folgende Aspekte sind als **VARIABLE** deklariert, um Starrheit zu vermeiden (*Stand: REFERENCE_NOT_COPYABLE_TEMPLATE: YES*):

1.  **Überschriftenstruktur und -anzahl:** H2-Zwischenüberschriften dürfen sich in Anzahl und Benennung frei nach dem inhaltlichen Bedarf richten.
2.  **Absatzanzahl und Textlänge:** Es gibt keine vorgegebene Mindest- oder Höchstzahl von Absätzen.
3.  **Visuelle Repräsentationsform der Evidenzgrenze (EVIDENCE_BOUNDARY_UI_FORM):** Ob ein Callout-Block (`learning-evidence-boundary`), ein Code-Block oder Fließtext genutzt wird, ist variabel.
4.  **Visuelle Form des Takeaways (TAKEAWAY_VISUAL_FORM):** Die konkrete Formatierung des abschließenden Takeaways (z. B. mit oder ohne H2-Überschrift, Einrückungstyp) darf variieren.
5.  **Glossar-Wegfall:** In begründeten Fällen kann auf eine separate Glossar-Tabelle verzichtet werden, sofern alle Fachbegriffe direkt im Fließtext verständlich erklärt werden (wie in Ref 03 bewiesen).
6.  **Position der zentralen Frage (CENTRAL_QUESTION_EXACT_POSITION):** Die genaue Platzierung der Leserfrage kann sich flexibel nach der Erklärungsstruktur richten.

---

## 8. Verbotene Muster (Prohibited Patterns)

Folgende Muster sind **PROHIBITED** bzw. wie angegeben eingeschränkt:

1.  **Trennlinien im Fließtext (BODY_HORIZONTAL_RULES: PROHIBITED_BY_DEFAULT):** Sichtbare Trennlinien (`---`) sind im Fließtext der Artikel standardmäßig zu vermeiden, da sie das Schriftbild fragmentieren und den Lesefluss unterbrechen (Frontmatter-Delimiter sind hiervon ausgeschlossen).
2.  **AI-generierte Freigaben/Fakten:** Das Erfinden von Personen, Freigaben, Logs oder Code-Fakten.
3.  **Duplizierte Webseiten-Signaturen:** Das manuelle Hinzufügen der Signatur (*"Aus echten Projekten lernen..."*) im Markdown-Text ist verboten (dies erfolgt zentral im Layout).
4.  **Permanente visuelle Abstraktionen während der Kalibrierungsphase (PERMANENT_REUSABLE_ABSTRACTION_DURING_CALIBRATION):** Die Deklaration von wiederverwendbaren UI-Komponenten als permanente System-Primitive ist während der Kalibrierungsphase verboten. Bounded einseitige visuelle Experimente (BOUNDED_ONE_OFF_VISUAL_EXPERIMENT) sind unter Auflagen (barrierefrei, datenschutzkonform, keine Beförderung zu permanenten Primitiven) erlaubt.
5.  **Permanente artikelspezifische Stil-Primitive (PERMANENT_ARTICLE_SPECIFIC_STYLE_PRIMITIVE):** Artikelspezifische Design-Ausnahmen, die als dauerhafte Primitive dienen, sind verboten. Bounded experimentelle Präsentationen (BOUNDED_EXPERIMENTAL_PRESENTATION) sind unter den gleichen Bedingungen wie visuelle Experimente gestattet.

---

## 9. Unaufgelöste Aspekte (Unresolved Elements)

Aktuell sind folgende Punkte als **UNRESOLVED** klassifiziert (erfordern weitere Daten aus zukünftigen Phasen):

1.  **Optimale Dichte von Code-Beispielen:** Die genaue Balance zwischen Prose-Erklärung und Code-Menge auf Intermediate- und Advanced-Ebene.
2.  **Mehrstufige Begriffsketten:** Wie Begriffe mit zyklischen didaktischen Abhängigkeiten (Begriff A benötigt Begriff B, welcher wiederum A benötigt) linearisiert werden sollen.
3.  **Genaue grammatikalische Komplexitätsgrenze (EXACT_MAX_SUBORDINATE_CLAUSES):** Es gibt keine feste numerische Obergrenze für Nebensätze, solange die didaktische Verständlichkeit gewahrt bleibt.

---

## 10. Evidenz- & Provenienz-Disziplin (Evidence Discipline)

Das Zusammenspiel der drei Referenzen belegt eine strikte hierarchische Trennung der Evidenzstufen:

*   **Evidenzstufen:**
    *   `CLAIM` (AI-Behauptung): Geringste Glaubwürdigkeit.
    *   `SPECIFICATION` (Dokumentierte Anforderung / Standard): Normative Vorgabe.
    *   `IMPLEMENTATION` (Code-Zustand): Statischer Nachweis.
    *   `EXECUTION` (Pipeline-Lauf): Dynamischer Zustandsnachweis.
    *   `VERIFICATION` (Review / Test): Menschliches/Maschinelles Attest.
    *   `ASSURANCE` (Formelle Freigabe): Governance-Freigabe.
*   **Invariante Abgrenzungs-Regel:**
    `IMPLEMENTED ≠ EXECUTED` (Code-Existenz beweist keine Ausführung).
    `EXECUTED ≠ VERIFIED` (Ausführung beweist keine inhaltliche Korrektheit).
    `VERIFIED ≠ ASSURED` (Ein automatischer Test ersetzt kein formelles Review).

---

## 11. Kognitive Last & Sprachmodell (Cognitive Load)

BridGenta Learning deklariert folgende sprachdidaktische Grundsätze als Teil des Modells:

*   **Satz-Empfehlung (ONE_COGNITIVE_JOB_PER_SENTENCE: PREFERRED / ADVISORY):** Jeder Satz sollte sich nach Möglichkeit darauf konzentrieren, genau eine konzeptionelle Beziehung oder einen Gedanken zu erklären. Längere Sätze sind zulässig, solange sie der technischen Präzision dienen.
*   **Absatz-Empfehlung (ONE_MAIN_IDEA_PER_SHORT_PARAGRAPH: PREFERRED / ADVISORY):** Ein Absatz sollte sich idealerweise auf eine Kernidee konzentrieren (`ONE_MAIN_IDEA_PER_SHORT_PARAGRAPH`). Ein neuer Absatz wird bevorzugt, wenn eine neue konzeptionelle Beziehung beginnt, um dem Leser eine kognitive Pause zu ermöglichen.
*   **Satzlängen-Prüfung vs. Sprachniveau:** Eine bestandene automatisierte Satzlängenprüfung ist kein Beleg für ein CEFR-Sprachniveau (`READABILITY_HEURISTIC_PASS != CEFR_PROOF`).
*   **Didaktische Progression:** `SITUATION_FIRST → ABSTRACTION_LATER`. Erst das Problem greifbar machen, dann die Abstraktionsebene aufbauen.

---

## 12. Rendered Readability (Gerenderte Lesbarkeit)

Der tatsächliche Lesefluss wird maßgeblich durch visuelle Faktoren bestimmt:
$$\text{READING\_RHYTHM} = \text{SENTENCE\_RHYTHM} + \text{PARAGRAPH\_SPACING} + \text{HEADING\_SPACING} + \text{LINE\_HEIGHT} + \text{LIST\_SPACING} + \text{CALLOUT\_SPACING}$$

*   **Verbindliche Vorgabe:** Keine Textblöcke dürfen gestaucht oder fragmentiert wirken. Der vertikale Fluss (Verhältnis von Leerraum zu Schrifthöhe) must auf allen drei Viewport-Klassen (Desktop, Tablet, Mobile) durchgehend ausbalanciert sein.

---

## 13. Lernniveau-Funktionen (Learning Levels)

Lernniveaus sind rein didaktische Abgrenzungen der inhaltlichen Tiefe und dürfen nicht als Berechtigungs- oder Zugriffskontrollen missverstanden werden (`LEARNING_LEVEL ≠ ACCESS_RIGHT`):

*   **PUBLIC:** Einordnung des Ereignisses und Relevanz für Außenstehende.
*   **BEGINNER:** Fundamentale Konzepte, Terminologie-Hinführung, einfache Praxisregeln.
*   **INTERMEDIATE:** Entwicklungspfade, Systemarchitektur, Code-Auschnitte und Pipeline-Logik.
*   **ADVANCED:** Vollständige Evidenzkette, mathematische/logische Modellabsicherung.

---

## 14. Transferabilitäts-Regeln (Transferability)

*   **Lokale Grenzen:** Eine übertragbare Lektion darf niemals allgemeingültiger formuliert werden, als die zugrundeliegende Projektevidenz es erlaubt.
*   **Beispiel:** Eine Governance-Regel für das BridGenta-Repository darf nicht als universelles Gesetz für alle Git-Repositories der Welt deklariert werden.
*   *Leitsatz: TRANSFERABLE ≠ UNIVERSAL.*

---

## 15. Referenz- vs. Vorlagen-Grenze (Reference vs Template)

*   **Keine Vorlagen-Kopie:** Keiner der drei Referenzartikel darf als strukturelle Kopiervorlage (Text-Schablone) missbraucht werden. 
*   **Ziel der Konsistenz:** Die didaktische Methodik ist invariant; die Formulierung, der Textaufbau und die visuelle Komposition sind variabel und lebendig.
*   *Leitsatz: STANDARDIZE_THE_REASONING, NOT_THE_SENTENCES.*

---

## 16. Widerspruchs-Analyse (Contradiction Analysis)

Eine vergleichende Analyse der drei eingefrorenen Referenzartikel zeigt:
*   **Ergebnis:** `CONTRADICTION_STATUS: PASS`
*   Es liegen **keine** inhaltlichen oder didaktischen Konflikte zwischen den Referenzartikeln und dem kanonischen Standard vor.
*   *Reinigungs-Notiz (R1):* Zuvor identifizierte Abweichungen des ersten Baseline-Entwurfs vom Standard (wie die Überhöhung beratender Heuristiken zu harten Invarianten) wurden erfolgreich korrigiert. Die Widerspruchsfreiheit ist somit vollständig hergestellt.

---

## 17. Lücken-Analyse (Gap Analysis)

*   **Status:** `GAP_STATUS: NO_GAP / REPORT_ONLY`
*   **Analyse:** Der aktuelle Standard `BECC-PLS-v1.0` bildet die didaktischen Prinzipien und Prüftore vollständig ab. 
*   *Empfehlung für künftige Standard-Updates:* Es gibt keinen unmittelbaren Änderungsbedarf an `BECC-PLS-v1.0`. Zukünftige Updates können den Aspekt der variablen Glossar-Präsenz (Ref 03) noch expliziter erwähnen, was jedoch in dieser Phase rein informativ berichtet wird.
*   *Leitsatz: CANONICAL_STANDARD_CHANGE_AUTHORIZATION: NOT_GRANTED.*

---

## 18. Planungs-Bereitschaft für Artikel 04 (Article 04 Readiness)

*   **Planungs-Status:** `ARTICLE_04_PLANNING_READY: CONDITIONAL`
*   **Kalibrierungs-Status:** `ARTICLE_04_CALIBRATION_READY: NO_UNTIL_BASELINE_APPROVED`
*   **Kandidat:** `code-fakten-vs-strukturelle-korrektheit.md`
*   **Kalibrierungs-Risiko:** Trennung von `CODE_EXISTS` (Code existiert statisch) und `STRUCTURAL_CORRECTNESS` (syntaktisch und strukturell korrekt deklariert) sowie die Vermeidung von Scheinsicherheit.
*   *Leitsatz: ARTICLE_04_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED.*

---

## 19. Finale Baseline-Entscheidung (Final Decision)

*   **Baseline-Status:** `CANONICAL_MODEL_BASELINE: READY_FOR_OWNER_APPROVAL`
*   Die Baseline ist vorbereitet und wartet auf die formelle Freigabe und den Merge durch den Project Owner.
