# BECC Learning Canonical Model Baseline v1.0
## Kalibrierungs- und Auslegungsmodell für öffentliche Lerninhalte

*   **Identifikator:** `BECC-LCMB-v1.0`
*   **Status:** `CALIBRATED / ACTIVE`
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
*   **Primat-Regel:** Dieses Kalibrierungsmodell ersetzt, überschreibt oder modifiziert die normativen Bestimmungen des Standards zu keinem Zeitpunkt.
*   *Leitsatz: BASELINE_SUPERSEDES_STANDARD: NO.*

---

## 3. Eingefrorenes Referenz-Set (Frozen Reference Set)

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
*   **PREFERRED:** Ein Standardmuster, von dem nur abgewichen werden darf, wenn eine didaktisch oder technisch begründete Ausnahmesituation vorliegt.
*   **VARIABLE:** Ein Element, das sich von Artikel zu Artikel frei und dynamisch unterscheiden darf (unterstützt die sprachliche und inhaltliche Vielfalt).
*   **PROHIBITED:** Ein Muster oder Element, dessen Verwendung im Fließtext streng verboten ist oder das dem Lernmodell direkt widerspricht.
*   **UNRESOLVED:** Ein Aspekt, für den noch nicht genügend Evidenz oder Erfahrung vorliegt, um ihn sicher zu klassifizieren.

---

## 5. Invarianten (Invariants)

Folgende Aspekte des Lernmodells sind als **INVARIANT** klassifiziert und zwingend einzuhalten:

1.  **Didaktische Kern-Sequenz:** Die Abfolge **VERSTEHEN → BENENNEN → BELEGEN → ANWENDEN** ist zwingend einzuhalten.
2.  **Verständnis vor Begriff (Understand-First):** Die logische und inhaltliche Hinführung zu einem Problem MUSS der formalen Einführung des technischen Begriffs vorangestellt werden (`UNDERSTAND_FIRST → TERM_SECOND`).
3.  **Fakten- und Evidenzbindung:** Jede inhaltliche Behauptung muss an ein reales, dokumentiertes Ereignis des Quellprojekts gebunden sein. AI-Behauptungen oder freie Rekonstruktionen sind ausgeschlossen.
4.  **Transferierbarkeit:** Jeder Artikel muss eine allgemeine, über das Projekt hinausgehende Lektion vermitteln, die klar durch die Evidenz begrenzt ist (`TRANSFERABILITY_FUNCTION`).
5.  **Evidenz-Grenzprüfung (Evidence Boundary):** Der Text muss die genauen Grenzen der dargestellten Beweise offenlegen (z. B. ein Linter-Lauf beweist nur syntaktische Korrektheit, keine inhaltliche Wahrheit).
6.  **Sprachliche Entkopplung:** Komplexe Fachthemen dürfen nicht durch komplexe, verschachtelte Grammatik erschwert werden. Die didaktische Klarheit hat Vorrang vor grammatikalischer Komplexität.
7.  **Zentraler Erkenntnis-Takeaway:** Jeder Artikel muss am Ende eine komprimierte didaktische Kernbotschaft als Fazit enthalten.
8.  **Responsive Readability:** Die Lesbarkeit und der Lese-Rhythmus müssen auf Desktop, Tablet und Mobilgeräten gleichermaßen komfortabel sein.
9.  **Keine artikelspezifischen Stylesheets:** Alle Stilregeln müssen generisch im globalen CSS abgebildet sein.

---

## 6. Bevorzugte Muster (Preferred Patterns)

Folgende Aspekte sind als **PREFERRED** klassifiziert (Standard-Empfehlung):

1.  **Sequenz des Einstiegs:** Die Strukturierung des Starts gemäß der Kette `Beobachtung` → `Eindruck` → `Zweifel` → `Zentrale Frage` hat sich als optimaler didaktischer Einstieg bewährt.
2.  **Satzlängen-Formel (Short Anchor):** Ein Rhythmus aus kurzen Ankersätzen, gefolgt von einer präzisen, etwas längeren Erklärung, gefolgt von einer kognitiven Pause.
3.  **Glossar-Struktur:** Das Anbieten einer Begriffserklärung am Ende des Artikels in einer strukturierten Definitionsliste zur Erhöhung der Lesbarkeit.
4.  **Ebene der Kernfrage:** Die Formulierung einer leserorientierten Frage als natürlicher Übergang zum Hauptteil.

---

## 7. Variable Elemente (Variable Elements)

Folgende Aspekte sind als **VARIABLE** deklariert, um Starrheit zu vermeiden (*Stand: REFERENCE_NOT_COPYABLE_TEMPLATE: YES*):

1.  **Überschriftenstruktur und -anzahl:** H2-Zwischenüberschriften dürfen sich in Anzahl und Benennung frei nach dem inhaltlichen Bedarf richten.
2.  **Absatzanzahl und Textlänge:** Es gibt keine vorgegebene Mindest- oder Höchstzahl von Absätzen.
3.  **Visuelle Repräsentationsform der Evidenzgrenze:** Ob ein Callout-Block (`learning-evidence-boundary`), ein Code-Block oder Fließtext genutzt wird, ist variabel.
4.  **Visuelle Form des Takeaways:** Die konkrete Formatierung des abschließenden Takeaways (z. B. mit oder ohne H2-Überschrift, Einrückungstyp) darf variieren.
5.  **Glossar-Präsenz:** Ein Glossary am Ende ist optional (wie in Ref 03 bewiesen; dort wurden Begriffe direkt im Textfluss verständlich eingeführt).

---

## 8. Verbotene Muster (Prohibited Patterns)

Folgende Muster sind streng **PROHIBITED**:

1.  **Horizontale Trennlinien im Artikelkörper:** Sichtbare Trennlinien (`---` oder `<hr>`) im Fließtext sind verboten, da sie das Schriftbild fragmentieren und den Lesefluss unterbrechen.
2.  **AI-generierte Freigaben/Fakten:** Das Erfinden von Personen, Freigaben, Logs oder Code-Fakten.
3.  **Duplizierte Webseiten-Signaturen:** Das manuelle Hinzufügen der Signatur (*"Aus echten Projekten lernen..."*) im Markdown-Text ist verboten (dies erfolgt zentral im Layout).
4.  **Verschachtelte Schachtelsätze:** Sätze mit mehr als zwei Nebensätzen oder hoher grammatikalischer Verschachtelung.
5.  **Vorzeitige visuelle Abstraktionen:** Das Erstellen neuer, artikelspezifischer CSS-Klassen oder UI-Komponenten während der Kalibrierungsphase.

---

## 9. Unaufgelöste Aspekte (Unresolved Elements)

Aktuell sind folgende Punkte als **UNRESOLVED** klassifiziert (erfordern weitere Daten aus zukünftigen Phasen):

1.  **Optimale Dichte von Code-Beispielen:** Die genaue Balance zwischen Prose-Erklärung und Code-Menge auf Intermediate- und Advanced-Ebene.
2.  **Mehrstufige Begriffsketten:** Wie Begriffe mit zyklischen didaktischen Abhängigkeiten (Begriff A benötigt Begriff B, welcher wiederum A benötigt) linearisiert werden sollen.

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

BridGenta Learning deklariert folgende sprachdidaktische Grundsätze als invarianten Teil des Modells:

*   **Satz-Regel:** Jeder Satz fokussiert sich primär auf eine einzige kognitive Aufgabe (`ONE_SENTENCE ≈ ONE_COGNITIVE_JOB`).
*   **Absatz-Regel:** Jeder Absatz behandelt genau eine Kernidee. Ein neuer Gedanke erfordert zwingend einen neuen Absatz zur Entlastung des Arbeitsspeichers des Lesers.
*   **Didaktische Progression:** `SITUATION_FIRST → ABSTRACTION_LATER`. Erst das Problem greifbar machen, dann die Abstraktionsebene aufbauen.

---

## 12. Rendered Readability (Gerenderte Lesbarkeit)

Der tatsächliche Lesefluss wird maßgeblich durch visuelle Faktoren bestimmt:
$$\text{READING\_RHYTHM} = \text{SENTENCE\_RHYTHM} + \text{PARAGRAPH\_SPACING} + \text{HEADING\_SPACING} + \text{LINE\_HEIGHT} + \text{LIST\_SPACING}$$

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
*   Es liegen **keine** inhaltlichen oder didaktischen Konflikte vor.
*   *Stilistische Variationen:* Der Verzicht auf eine glossary Tabelle in Artikel 03 ist kein Widerspruch, sondern eine zulässige didaktische Variation, da die Begriffe dort direkt in die Prose eingebunden sind.

---

## 17. Lücken-Analyse (Gap Analysis)

*   **Status:** `GAP_STATUS: NO_GAP / REPORT_ONLY`
*   **Analyse:** Der aktuelle Standard `BECC-PLS-v1.0` bildet die didaktischen Prinzipien und Prüftore vollständig ab. 
*   *Empfehlung für künftige Standard-Updates:* Es gibt keinen unmittelbaren Änderungsbedarf an `BECC-PLS-v1.0`. Zukünftige Updates können den Aspekt der variablen Glossar-Präsenz (Ref 03) noch expliziter erwähnen, was jedoch in dieser Phase rein informativ berichtet wird.
*   *Leitsatz: CANONICAL_STANDARD_CHANGE_AUTHORIZATION: NOT_GRANTED.*

---

## 18. Planungs-Bereitschaft für Artikel 04 (Article 04 Readiness)

*   **Planungs-Status:** `ARTICLE_04_PLANNING_READY: YES`
*   **Kalibrierungs-Status:** `ARTICLE_04_CALIBRATION_READY: YES`
*   **Kandidat:** `code-fakten-vs-strukturelle-korrektheit.md`
*   **Kalibrierungs-Risiko:** Trennung von `CODE_EXISTS` (Code existiert statisch) und `STRUCTURAL_CORRECTNESS` (syntaktisch und strukturell korrekt deklariert) sowie die Vermeidung von Scheinsicherheit.
*   *Leitsatz: ARTICLE_04_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED.*

---

## 19. Finale Baseline-Entscheidung (Final Decision)

*   **Baseline-Status:** `CANONICAL_MODEL_BASELINE: ESTABLISHED`
*   Die Baseline ist hiermit formell für alle weiteren Phasen kalibriert und im Verzeichnis hinterlegt.
