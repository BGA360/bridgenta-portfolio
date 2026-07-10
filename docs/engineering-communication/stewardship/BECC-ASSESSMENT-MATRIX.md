# BridGenta Engineering Communication Constitution (BECC) — Bewertungsmatrix (Assessment Matrix)

Dieses Dokument definiert die offizielle **Bewertungsmatrix (Assessment Matrix)** zur Anwendung der **BridGenta Engineering Communication Constitution (BECC)** auf technische Dokumente. Die Matrix ordnet jedem Kapitel eines technischen Berichts oder einer Fallstudie die anwendbaren konstitutionellen Standards, standardisierte Prüffragen und Belegquellen zu.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **operatives Stewardship-Dokument** der Verfassungsverwaltung. Es dient als objektive Prüfanleitung für Reviewer und ändert oder erweitert die konstitutionellen Normen der BECC v1.0 nicht.

---

## 1. Zweck und Architektur (Purpose & Architecture)

Die Bewertungsmatrix löst ein zentrales Problem technischer Audits: die **Subjektivität und Varianz von Reviews**. 
*   **Zweck**: Festlegung eines deterministischen Bewertungspfads. Reviewer müssen nicht ad hoc entscheiden, welche Verfassungsregeln auf welchen Textabschnitt passen. Die Anwendbarkeit ist vorab vertraglich definiert.
*   **Beziehung zur BECC-Verfassung**: Die Verfassung definiert die qualitativen Soll-Zustände (z. B. Aktiv-Stimme, logischer Fluss). Die Matrix ordnet diese Regeln den realen Buchkapiteln zu.
*   **Beziehung zum Bewertungskonzept (Methodology)**: Das [Bewertungskonzept](./BECC-ASSESSMENT-METHODOLOGY.md) beschreibt das allgemeine Verfahren (**WIE** geprüft wird). Die Matrix definiert die konkrete Belegung (**WAS** in jedem Kapitel geprüft wird).

### Operatives Bewertungsmodell (Operational Assessment Model)

```text
  Technische Dokumentation (Artifact)
                  │
                  ▼
     Bewertungsmatrix (Matrix)
                  │
                  ▼
   Anwendbare Standards (Standards)
                  │
                  ▼
    Standardisierte Fragen (Questions)
                  │
                  ▼
     Nachweisführung (Evidence)
                  │
                  ▼
     Prüfungsergebnis (Result)
                  │
                  ▼
          Befund (Finding)
```

---

## 2. Operative Regeln (Operational Rules)

Für jeden Reviewer gelten folgende verbindliche Arbeitsregeln:
1.  **Pflichtstart**: Jede Konformitätsprüfung muss zwingend mit dieser Matrix initiiert werden.
2.  **Scope-Erzwingung**: Reviewer dürfen nur die Standards und Fragen prüfen, die für das jeweilige Kapitel in der Tabelle eingetragen sind.
3.  **Keine Ad-Hoc-Erweiterungen**: Es ist untersagt, während eines laufenden Audits neue Prüffragen oder nicht gelistete Standards einzuführen.
4.  **Evidenz-Pflicht**: Vor der Statusvergabe eines Kapitels müssen die in der Spalte *Erwartete Belegquelle* definierten Nachweise gesichtet und dokumentiert werden.
5.  **Stewardship-Vorbehalt**: Änderungen an dieser Matrix (z. B. neue Kapiteltypen oder modifizierte Fragen) dürfen nur über ein formelles Update der Verfassungsverwaltung (Stewardship) eingepflegt werden.

---

## 3. Die Bewertungsmatrix (The Assessment Matrix)

| Matrix-ID | Kapitel | Zweck des Kapitels | Primärer BECC-Standard | Unterstützende Standards | Prüffragen-IDs | Standardisierte Prüffragen | Erwartete Belegquelle | Priorität | Prüfung erforderlich | Konzept-Referenz | Anmerkungen |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MAT-001** | **Executive Summary** | Bietet eine kompakte Management-Übersicht des Projekts. | [Explainability Standard](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md) | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md), [Language Standard](../04-language/ENGINEERING_LANGUAGE_STANDARD.md) | `AQ-ES-001`<br>`AQ-ES-002`<br>`AQ-ES-003` | 1. Wird das übergeordnete Projektziel klar beschrieben?<br>2. Wird die Zielgruppe des Dokuments explizit benannt?<br>3. Werden die Scope-Grenzen des Berichts verständlich abgegrenzt? | Kapitel "Executive Summary" (Textkörper) | **Critical** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Fokus auf Zielgruppenausrichtung. |
| **MAT-002** | **Context** | Beschreibt den Hintergrund und die Ausgangssituation des Systems. | [Explainability Standard](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md) | [Writing Principles](../01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md) | `AQ-CO-001`<br>`AQ-CO-002` | 1. Wird die Vorgeschichte/Ausgangslage logisch strukturiert dargestellt?<br>2. Verweist der Kontext auf bestehende Infrastrukturen oder Vorgängersysteme? | Kapitel "Context" / "Hintergrund" | **High** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Verknüpfung mit technischer Historie. |
| **MAT-003** | **Problem Statement** | Isoliert die konkrete technische Problemstellung. | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | [Explainability Standard](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md) | `AQ-PS-001`<br>`AQ-PS-002` | 1. Wird das technische Problem präzise isoliert und verständlich beschrieben?<br>2. Wird begründet, warum der Ist-Zustand unzureichend ist? | Kapitel "Problem Statement" / "Problemstellung" | **High** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Vermeidung von verschwommenen Fehlerbeschreibungen. |
| **MAT-004** | **Constraints** | Listet einschränkende technische Rahmenbedingungen auf. | [Terminology Standard](../05-terminology/ENGINEERING_TERMINOLOGY_STANDARD.md) | [Language Standard](../04-language/ENGINEERING_LANGUAGE_STANDARD.md) | `AQ-CN-001`<br>`AQ-CN-002` | 1. Werden technische Randbedingungen (z.B. Performance, Legacy-Systeme) explizit gelistet?<br>2. Werden Constraints klar von funktionalen Anforderungen abgegrenzt? | Kapitel "Constraints" / "Randbedingungen" | **High** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Abgleich mit Terminologieregister. |
| **MAT-005** | **Engineering Insight** | Beschreibt den technischen Durchbruch oder die Kernidee. | [Explainability Standard](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md) | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | `AQ-EI-001`<br>`AQ-EI-002` | 1. Wird die Kern-Erkenntnis oder der technische Durchbruch verständlich dokumentiert?<br>2. Ist die logische Herleitung dieses Lösungsansatzes nachvollziehbar? | Kapitel "Engineering Insight" / "Kernidee" | **Critical** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Kern des Explainability-Audits. |
| **MAT-006** | **Architecture** | Beschreibt die technische System- und Softwarearchitektur. | [Document Architecture Standard](../06-document-architecture/ENGINEERING_DOCUMENT_ARCHITECTURE_STANDARD.md) | [Explainability Standard](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md) | `AQ-AR-001`<br>`AQ-AR-002`<br>`AQ-AR-003` | 1. Folgt die Architekturbeschreibung dem Why-before-How-Prinzip?<br>2. Werden Komponenten und Schnittstellen strukturiert dargestellt?<br>3. Sind Architekturdiagramme durch begleitenden Fließtext ausreichend erklärt? | Kapitel "Architecture" / "Architektur" (Diagramme & Text) | **Critical** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Prüfung auf logischen Strukturfluss. |
| **MAT-007** | **Engineering Decisions** | Dokumentiert die getroffenen technischen Entscheidungen (ADRs). | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | [Explainability Standard](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md) | `AQ-ED-001`<br>`AQ-ED-002`<br>`AQ-ED-003` | 1. Ist jede wesentliche Architekturentscheidung als separater Eintrag dokumentiert?<br>2. Wird die zugrundeliegende Engineering-Begründung schlüssig dargelegt?<br>3. Werden evaluierte Lösungsalternativen neutral gegenübergestellt? | Kapitel "Engineering Decisions" / "Entscheidungen" | **Critical** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Traceability-Prüfung der EDRs. |
| **MAT-008** | **Implementation** | Beschreibt die softwareseitige Umsetzung im Quellcode. | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | [Language Standard](../04-language/ENGINEERING_LANGUAGE_STANDARD.md) | `AQ-IM-001`<br>`AQ-IM-002` | 1. Wird die Implementierung abstrakt erläutert, bevor Code-Details gezeigt werden?<br>2. Werden Bezüge zu Klassen, Modulen oder Pfaden präzise und fehlerfrei angegeben? | Kapitel "Implementation" / "Implementierung" | **Medium** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Vermeidung von redundantem Code-Spam. |
| **MAT-009** | **Validation** | Beschreibt das Testkonzept und die Verifikationsergebnisse. | [QA Standard](../09-quality-assurance/ENGINEERING_COMMUNICATION_QA_STANDARD.md) | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | `AQ-VA-001`<br>`AQ-VA-002` | 1. Wird die Strategie zur Verifikation der Systemqualität detailliert beschrieben?<br>2. Unterscheidet das Kapitel sauber zwischen automatisierten Tests und manuellen Prüfungen? | Kapitel "Validation" / "Verifikation" | **High** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Fokus auf Reproduzierbarkeit. |
| **MAT-010** | **Results** | Präsentiert die konkreten Messergebnisse und Metriken. | [Language Standard](../04-language/ENGINEERING_LANGUAGE_STANDARD.md) | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | `AQ-RE-001`<br>`AQ-RE-002` | 1. Sind alle Leistungsdaten und Messergebnisse durch Belege/Datenreihen gestützt?<br>2. Werden Metriken übersichtlich (z.B. in strukturierten Tabellen) visualisiert? | Kapitel "Results" / "Ergebnisse" (Tabellen & Metriken) | **High** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Keine wertenden Adjektive ohne Datenbeleg. |
| **MAT-011** | **Lessons Learned** | Reflektiert Erkenntnisse und Optimierungspotenziale. | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | [Writing Principles](../01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md) | `AQ-LL-001`<br>`AQ-LL-002` | 1. Sind die gelernten Lektionen als konstruktive Handlungsempfehlungen formuliert?<br>2. Stehen die Lektionen im logischen Bezug zu den Testergebnissen oder Entscheidungen? | Kapitel "Lessons Learned" / "Erkenntnisse" | **Medium** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Fokus auf Wissenstransfer. |
| **MAT-012** | **Risks** | Analysiert verbleibende Restrisiken und deren Abhilfe. | [QA Standard](../09-quality-assurance/ENGINEERING_COMMUNICATION_QA_STANDARD.md) | [Language Standard](../04-language/ENGINEERING_LANGUAGE_STANDARD.md) | `AQ-RI-001`<br>`AQ-RI-002` | 1. Werden verbleibende technische Risiken vollständig aufgelistet?<br>2. Sind für alle schwerwiegenden Risiken konkrete Gegenmaßnahmen (Mitigations) definiert? | Kapitel "Risks" / "Risiken" | **High** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Risikoklassifizierung. |
| **MAT-013** | **Future Evolution** | Beschreibt geplante zukünftige Ausbaustufen. | [Document Architecture Standard](../06-document-architecture/ENGINEERING_DOCUMENT_ARCHITECTURE_STANDARD.md) | [Writing Principles](../01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md) | `AQ-FE-001`<br>`AQ-FE-002` | 1. Werden zukünftige Erweiterungen klar vom aktuellen Scope abgegrenzt?<br>2. Stehen die zukünftigen Phasen im Einklang mit der offiziellen Roadmap? | Kapitel "Future Evolution" / "Ausblick" | **Low** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Vermeidung von Scope-Drift im Hauptteil. |
| **MAT-014** | **References** | Listet genutzte Standards, Spezifikationen und Quellen. | [QA Standard](../09-quality-assurance/ENGINEERING_COMMUNICATION_QA_STANDARD.md) | [Review Standard](../08-review-feedback/ENGINEERING_REVIEW_FEEDBACK_STANDARD.md) | `AQ-RF-001`<br>`AQ-RF-002` | 1. Sind alle externen Referenzen und Normen vollständig und mit Links angegeben?<br>2. Sind alle repository-internen Links als relative Pfade realisiert? | Kapitel "References" / "Literatur" (Verlinkungen) | **High** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Portabilitäts- und Linkprüfung. |
| **MAT-015** | **Appendices** | Enthält Rohdaten, Konfigurationen und lange Code-Listings. | [Document Architecture Standard](../06-document-architecture/ENGINEERING_DOCUMENT_ARCHITECTURE_STANDARD.md) | [Writing Standard](../07-writing/ENGINEERING_WRITING_STANDARD.md) | `AQ-AP-001`<br>`AQ-AP-002` | 1. Werden große Datenmengen und Rohdaten konsequent in den Anhang ausgelagert?<br>2. Verweist der Haupttext bei jedem Anhangselement explizit auf dieses? | Anhänge (Appendices) / Haupttext-Referenzen | **Low** | Ja | [Kapitel 4](./BECC-ASSESSMENT-METHODOLOGY.md#4-bewertungsablauf-assessment-process) | Trennung von Haupt- und Nebeninformationen. |

---

## 4. Validierung der Prüffragen (Question Validation)

Alle in dieser Matrix formulierten Prüffragen (`AQ-ES-001` bis `AQ-AP-002`) erfüllen folgende Kriterien:
*   **Objektivität**: Jede Frage kann eindeutig mit "Ja", "Nein" oder "Teilweise" beantwortet werden. Sie verzichten auf vage Formulierungen wie "Ist der Stil ansprechend?" oder "Liest sich der Text gut?".
*   **Evidenzbasierung**: Jede Frage verweist auf konkrete, beobachtbare Artefaktmerkmale (z.B. relative Pfade, Ablaufdiagramme, ADR-Rationales).
*   **Projektunabhängigkeit**: Keine Frage enthält spezifische Annahmen über BridGenta-Code. Sie sind universell auf jedes technische Dokument anwendbar.

---

[Zurück zur BECC-Übersicht](../README.md)
