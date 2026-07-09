# Leitlinien für technisches Schreiben (Engineering Writing Principles)

Dieses Dokument definiert die grundlegenden Prinzipien für das Verfassen technischer Beschreibungen auf BridGenta. Es übersetzt die konstitutionelle Philosophie der BECC in praktische Richtlinien, die beschreiben, wie technische Inhalte aufgebaut und vermittelt werden sollen.

Dieses Dokument stellt keine mechanischen Schreibregeln (wie Satzlängen oder Grammatikkontrollen) auf. Es beschreibt vielmehr das **Konzept der technischen Vermittlung** selbst.

---

## 1. Konstitutioneller Bezug

Diese Prinzipien leiten ihre Gültigkeit und Autorität direkt aus der [BECC-Mission](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/00-foundation/MISSION.md), der [BECC-Vision](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/00-foundation/VISION.md) und den übergeordneten [BECC-Prinzipien](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/00-foundation/PRINCIPLES.md) ab. Zukünftige detaillierte Schreibstandards, Glossare und Vorlagen müssen mit den hier verankerten Grundsätzen übereinstimmen.

---

## 2. Die Prinzipien für technisches Schreiben

### 2.1 Engineering vor Technologie (Engineering before Technology)
Die technische Dokumentation stellt das gelöste Problem und den ingenieurwissenschaftlichen Ansatz in den Vordergrund. Technologien und Werkzeuge sind Mittel zum Zweck und unterstützen die Argumentation. Sie dürfen niemals die Erklärung dominieren. Leser müssen zuerst das *Problem* verstehen, bevor sie erfahren, welche Tools verwendet wurden.

### 2.2 Entscheidungen erklären, nicht nur Features (Explain Decisions, not Features)
Dokumente müssen das *Warum* beantworten. Reine Feature-Listen demonstrieren keine Ingenieursleistung. Im Fokus stehen die Entscheidungsfindung, die Abwägung von Alternativen, die Analyse von Trade-offs und die Akzeptanz von Systemgrenzen.

### 2.3 Mit Kontext beginnen (Start with Context)
Jede technische Erklärung setzt am Ausgangspunkt an. Bevor eine Lösung präsentiert wird, müssen die Ausgangssituation, die spezifische Herausforderung und die einschränkenden Randbedingungen (Constraints) klar definiert sein. Ohne diesen Kontext ist der Wert der Lösung für den Leser nicht messbar.

### 2.4 Eine technische Kernidee pro Abschnitt (One Engineering Idea per Section)
Jeder Inhaltsabschnitt beantwortet genau eine primäre technische Fragestellung. Die Vermischung verschiedener Themenbereiche (wie Code-Implementierung, System-Architektur, Qualitätssicherung und Governance) innerhalb eines einzelnen Abschnitts erhöht die kognitive Last des Lesers und ist zu vermeiden.

### 2.5 Strukturierter Erkenntnisweg (Build Understanding Progressively)
Die Vermittlung von Inhalten folgt einem logischen Pfad. Als bevorzugtes Kommunikationsmodell gilt der strukturierte Erkenntnisweg:

```text
Problem ➔ Kontext ➔ Randbedingungen ➔ Entscheidung ➔ Implementierung ➔ Validierung ➔ Belege ➔ Lerneffekte
```

Dieses Modell dient nicht als starre Schablone, sondern als Leitlinie für die logische Abfolge technischer Beschreibungen.

### 2.6 Natürliche Fachsprache (Explain Technical Terms Naturally)
Wir kommunizieren in der gängigen Fachsprache deutscher Softwareentwickler und IT-Professionals. Etablierte englische Begriffe werden präzise verwendet, ohne künstlich eingedeutscht zu werden. Tritt ein hochspezialisierter Begriff zum ersten Mal auf, wird er kurz und präzise erklärt. Geläufige Branchenbegriffe werden nicht übererklärt.

### 2.7 Vertrauen durch Belege (Use Evidence to Build Trust)
Aussagen über Software-Qualität, Performance oder Zuverlässigkeit werden durch empirische Nachweise belegt. Als Belege dienen Systemarchitektur-Diagramme, Testergebnisse, Messprotokolle, Vorher-/Nachher-Vergleiche und überprüfbare Logfiles. Qualität wird demonstriert, nicht bloß behauptet.

### 2.8 Respekt vor der Aufmerksamkeit des Lesers (Respect Reader Attention)
Texte müssen so kompakt wie möglich und so ausführlich wie nötig sein. Jedes Wort, jeder Satz und jeder Absatz muss zum technischen Verständnis des Lesers beitragen. Unnötige Wiederholungen, schmückende Beschreibungen, Hype-Wörter und künstliche Komplexität sind zu eliminieren.

### 2.9 Ingenieurmäßiges Denken sichtbar machen (Demonstrate Engineering Thinking)
Dokumente müssen die methodische und strukturierte Arbeitsweise des Autors abbilden. Leser müssen nach der Lektüre die logische Kette verstehen, die von einer Systemanforderung zu der finalen technischen Realisierung geführt hat.

### 2.10 Systeme statt isolierter Komponenten (Communicate Systems, not Components)
Einzelne Module, Frameworks oder Services werden stets als Teile eines größeren Gesamtsystems beschrieben. Die Beziehungen, Datenflüsse und Schnittstellen zwischen den Komponenten müssen klar hervorgehen, um isolierte Technologiebetrachtungen zu vermeiden.

---

[Zurück zur BECC-Übersicht](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/README.md)
