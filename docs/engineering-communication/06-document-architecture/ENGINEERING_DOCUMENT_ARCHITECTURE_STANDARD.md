# Standard für Dokumentenarchitektur (Engineering Document Architecture Standard)

Dieses Dokument definiert den permanenten Standard für die Strukturierung und den logischen Aufbau von technischen Dokumenten, ADRs (Architecture Decision Records) und Fallstudien (Case Studies) im BridGenta-Ökosystem. Es legt fest, wie Informationen organisiert werden müssen, damit der Leser das System mit minimaler kognitiver Last versteht.

Dieses Dokument regelt nicht den sprachlichen Ausdruck oder das Design der Oberflächen, sondern definiert die **Informationsarchitektur** unserer Dokumente.

---

## 1. Konstitutioneller Bezug

Dieser Standard baut direkt auf der [BECC-Mission](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/00-foundation/MISSION.md), den [Leitlinien für technisches Schreiben](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md), dem [Standard für technische Erklärbarkeit](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md), den [Kommunikationszielen](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/03-communication-objectives/ENGINEERING_COMMUNICATION_OBJECTIVES.md), dem [Sprachstandard](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/04-language/ENGINEERING_LANGUAGE_STANDARD.md) und dem [Terminologie-Standard](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/05-terminology/ENGINEERING_TERMINOLOGY_STANDARD.md) auf. 

Zukünftige operative Vorlagen (z. B. ADR-Templates, Case-Study-Formate und Review-Checklisten) leiten ihre Berechtigung aus diesem Dokument ab.

---

## 2. Prinzipien der Dokumentenarchitektur

### 2.1 Verständnis des Lesers vor Vollständigkeit (Understanding before Completeness)
Das primäre Ziel jedes Dokuments ist der Erkenntnisgewinn des Lesers. Eine extrem detaillierte Dokumentation verliert ihren Wert, wenn sie durch ungeordnete Komplexität unlesbar wird. Die Informationsarchitektur muss das schrittweise Begreifen der Kernideen unterstützen.

### 2.2 Progressiver Wissensaufbau (Progressive Knowledge Building)
Informationen müssen in einer logischen Reihenfolge fließen. Jeder Abschnitt bereitet den Leser auf den nächsten vor. Neue Konzepte dürfen erst dann eingeführt werden, wenn der dafür notwendige Kontext etabliert ist.

### 2.3 Kontext vor Details (Context before Detail)
Der Leser muss zuerst verstehen, worum es im Dokument geht, warum es existiert und welches übergeordnete Ziel verfolgt wird, bevor Details zur konkreten Implementierung oder den eingesetzten Technologien geliefert werden.

### 2.4 Problem vor Lösung (Problem before Solution)
Jede Vorstellung einer technischen Lösung setzt die klare Definition des ursprünglichen Problems voraus. Die Präsentation von Lösungen ohne vorherigen Problemkontext behindert das Verständnis und verringert den Erklärungswert.

### 2.5 Architektur vor Komponenten (Architecture before Components)
Bevor einzelne Software-Bausteine, Klassen oder Services detailliert beschrieben werden, muss das Gesamtsystem (die Softwarearchitektur) erklärt sein. Der Leser muss wissen, wo eine Komponente im Gesamtsystem verortet ist, um deren interne Funktionsweise bewerten zu können.

### 2.6 Entscheidung vor Implementierung (Decisions before Implementation)
Wir dokumentieren, *warum* etwas so gebaut wurde, bevor wir zeigen, *wie* es gebaut wurde. Das Verständnis der Designgründe und Alternativen ist für nachfolgende Entwickler wertvoller als der nackte Quellcode.

### 2.7 Randbedingungen vor Trade-offs (Constraints before Trade-offs)
Jeder Kompromiss (Trade-off) wird durch Randbedingungen (wie Zeit, Speicher oder Richtlinien) erzwungen. Die Randbedingungen müssen im Dokument etabliert sein, bevor die getroffenen Architekturentscheidungen und deren Trade-offs logisch nachvollziehbar begründet werden können.

### 2.8 Validierung vor Ergebnissen (Validation before Results)
Ergebnisse und Leistungskennzahlen sind erst dann glaubwürdig, wenn die Validierungsmethode offengelegt wurde. Leser müssen verstehen, wie gemessen und geprüft wurde, bevor sie die Messergebnisse interpretieren.

### 2.9 Belege nah an Behauptungen platzieren (Evidence Close to Claims)
Nachweise (z. B. Logauszüge, Vorher-/Nachher-Tabellen) gehören unmittelbar in die Nähe der Behauptungen, die sie stützen. Eine räumliche Trennung zwischen These und Beleg erhöht die kognitive Last des Lesers.

### 2.10 Diagramme unterstützen den Text (Diagrams Support Explanation)
Grafische Visualisierungen (wie Mermaid-Diagramme) dienen der Verdeutlichung komplexer Abläufe und Schnittstellen. Sie ersetzen niemals den Fließtext. Jedes Diagramm muss im Text referenziert, kontextualisiert und interpretiert werden.

### 2.11 Progressive Komplexität (Progressive Complexity)
Komplexität wird schrittweise aufgebaut. Wir starten mit einer High-Level-Übersicht des Systems und dringen danach tiefer in Subsysteme und detaillierte Code-Strukturen vor. Dies verhindert eine Überforderung des Lesers zu Beginn des Dokuments.

### 2.12 Unabhängige Abschnitte (Independent Sections)
Jeder Abschnitt erfüllt genau eine strukturelle Aufgabe. Informationen werden nicht über mehrere Kapitel hinweg redundant wiederholt. Redundanz bläht Dokumente auf und erschwert die Pflege.

---

## 3. Der kanonische Informationsfluss (Canonical Engineering Flow)

Für die logische Gliederung komplexer technischer Dokumente gilt der folgende kanonische Informationsfluss als bevorzugte Struktur. Dieser Aufbau führt den Leser methodisch von der abstrakten Einleitung bis zur empirischen Validierung:

```text
Executive Summary
       ▼
System-Kontext (Situation & Challenge)
       ▼
Problemstellung (Bottleneck / Issue)
       ▼
Ziele (Objectives)
       ▼
Randbedingungen (Constraints)
       ▼
Leitprinzipien (Principles)
       ▼
Systemarchitektur (Overall System)
       ▼
Komponenten & Schnittstellen (Components)
       ▼
Architekturentscheidungen (Decisions & Trade-offs)
       ▼
Validierungsstrategie (Validation)
       ▼
Ergebnisse & empirische Belege (Results & Evidence)
       ▼
Lerneffekte & Lessons Learned
       ▼
Zukünftige Systementwicklung (Future Evolution)
```

Diese Gliederung wird nicht als starres Template verordnet, sondern dient als konzeptionelle Richtlinie zur Gewährleistung eines stabilen roten Gefühls.

---

## 4. Informationshierarchie und kognitiver Fluss

### 4.1 Priorisierung von Informationen (Information Hierarchy)
- **Wichtiges zuerst**: Kernkonzepte und Architekturentwürfe stehen am Anfang der Kapitel.
- **Details danach**: Quellcodes, Parameterlisten und Konfigurationen folgen nachgelagert.
- **Begründung vor Code**: Die Motivation einer Lösung steht immer vor der technischen Umsetzung.
- **Räumliche Nähe**: Belege stehen in unmittelbarer Nähe zu den Schlussfolgerungen.

### 4.2 Kognitive Last minimieren (Cognitive Flow)
- **Logische Übergänge**: Jeder Absatz muss sich logisch aus dem vorherigen ergeben.
- **Progressive Offenlegung**: Details werden erst dann eingeblendet (z. B. durch Dropdowns oder nachgelagerte Kapitel), wenn sie für die aktuelle Argumentation zwingend nötig sind.
- **Kontextwechsel vermeiden**: Wir springen im Text nicht zwischen verschiedenen Abstraktionsebenen (z. B. zwischen Geschäftslogik und API-Endpoints) hin und her.

---

## 5. Dokumenten-Anti-Muster (Document Anti-Patterns)

Folgende strukturelle Mängel verschlechtern die Dokumentenqualität und sind unzulässig:
- **Technologie-Zentrierung (Technology-first)**: Das Dokument startet direkt mit einer Liste von NPM-Packages oder Codezeilen, ohne das Systemproblem zu benennen.
- **Kontext-Vakuum**: Technische Details werden ohne Einbettung in die Systemlandschaft gezeigt.
- **Verlorene Diagramme**: Diagramme ohne Textreferenz oder Erklärung.
- **Umsetzung vor Begründung**: Code-Kopien stehen vor den Architekturentscheidungen.
- **Verteilte Nachweise**: Testergebnisse oder Performance-Belege befinden sich in anderen Dokumenten oder weit entfernt von den Behauptungen.
- **Redundanz-Schleifen**: Mehrfaches Wiederholen derselben Systemgrenzen in verschiedenen Kapiteln.
- **Strukturloses Chaos**: Informationen sind ohne erkennbare Reihenfolge aneinandergereiht.

---

## 6. Zukünftige operative Standards

Dieses Dokument dient als verfassungsrechtliche Basis für nachgelagerte, operative Dokumente und Vorlagen:
- Engineering Writing Standard (Detaillierter Schreibstandard)
- Case Study Standard (Fallstudien-Richtlinie)
- Architecture Document Standard (Architektur-Dokumenten-Richtlinie)
- ADR Standard (ADR-Richtlinie)
- Technische Berichte (Technical Report Standard)
- Projekt-Dokumentenvorlagen (Project Documentation Templates)

---

[Zurück zur BECC-Übersicht](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/README.md)
