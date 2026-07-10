# Schreibstandard für technische Dokumentation (Engineering Writing Standard)

Dieses Dokument definiert den permanenten Schreibstandard für alle technischen Dokumente, Berichte und Fallstudien (Case Studies) im BridGenta-Ökosystem. Es legt fest, wie Ingenieure Sätze und Absätze formulieren sollen, um maximale Klarheit bei gleichzeitiger fachlicher Präzision zu gewährleisten.

Dieses Dokument regelt nicht die Gliederung oder das Layout, sondern definiert das **handwerkliche Schreiben** nach der Strukturierung des Dokuments.

---

## 1. Konstitutioneller Bezug

Dieser Schreibstandard operationalisiert direkt die [BECC-Mission](../00-foundation/MISSION.md), die [Leitlinien für technisches Schreiben](../01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md), den [Standard für technische Erklärbarkeit](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md), die [Kommunikationsziele](../03-communication-objectives/ENGINEERING_COMMUNICATION_OBJECTIVES.md), den [Sprachstandard](../04-language/ENGINEERING_LANGUAGE_STANDARD.md), den [Terminologie-Standard](../05-terminology/ENGINEERING_TERMINOLOGY_STANDARD.md) und den [Standard für Dokumentenarchitektur](../06-document-architecture/ENGINEERING_DOCUMENT_ARCHITECTURE_STANDARD.md).

Zukünftige operative Vorlagen (z. B. ADR-Templates oder Fallstudien-Richtlinien) müssen die hier festgelegten Schreibregeln einhalten.

---

## 2. Schreibprinzipien

### 2.1 Klarheit vor Komplexität (Clarity before Complexity)
Wir wählen immer die verständlichste Formulierung, die die fachliche Exaktheit wahrt. Das künstliche Aufblähen von Sätzen mit Fachbegriffen, nur um „technischer“ zu klingen, ist unzulässig. Einfache und präzise Erklärungen sind das Kennzeichen professionellen Engineerings.

### 2.2 Eine Idee pro Absatz (One Idea Per Paragraph)
Jeder Absatz behandelt genau einen thematischen Gedanken. Unterstützende Details oder Messwerte werden innerhalb dieses Absatzes aufgeführt, um diesen Gedanken zu untermauern. Sobald ein neuer Aspekt eingeführt wird, beginnt ein neuer Absatz.

### 2.3 Ein Zweck pro Satz (One Purpose Per Sentence)
Jeder Satz erfüllt genau eine logische Funktion (z. B. erklären, begründen, vergleichen, schlussfolgern oder veranschaulichen). Schachtelsätze, die mehrere unzusammenhängende technische Aussagen verknüpfen, müssen in einfache Sätze zerlegt werden.

### 2.4 Architekturentscheidungen erklären (Explain Engineering Decisions)
Wir beschreiben nicht nur, *was* implementiert wurde, sondern begründen stets die Entwurfsentscheidung. Jede wesentliche Code-Struktur muss durch das zugrundeliegende Systemproblem, die abgewogenen Alternativen und den gewählten Lösungsweg erklärt werden.

### 2.5 Schlussfolgerungen durch Belege stützen (Evidence Supports Conclusions)
Jede technische Behauptung oder Schlussfolgerung muss auf zuvor dargelegten Beobachtungen, Messdaten oder logischen Herleitungen basieren. Unbelegte Behauptungen (z. B. „Dieses Modul arbeitet hocheffizient.“ ohne Messwerte) sind unzulässig.

### 2.6 Progressiver Lesefluss (Progressive Reading Flow)
Absätze müssen so sequenziert sein, dass sie den Leser fließend auf das nächste Thema vorbereiten. Abrupte Gedankensprünge sind zu vermeiden. Übergangssätze müssen den logischen Zusammenhang zwischen den Abschnitten explizit machen.

### 2.7 Professioneller, sachlicher Ton (Professional Engineering Tone)
Die Schreibweise ist ruhig, objektiv und technisch selbstbewusst. Wir verzichten auf emotionale Adjektive, Ausrufezeichen, argumentative Überredungsversuche und jegliche werbliche Übertreibung.

### 2.8 Präzision vor Dekoration (Precision over Decoration)
Satzfüller und ausschmückende Metaphern haben in technischen Dokumenten keinen Platz. Jeder Satz muss einen inhaltlichen Beitrag zum Verständnis leisten.

### 2.9 Natürliche deutsche Fachsprache (Natural Engineering Language)
Wir schreiben in dem flüssigen, klaren Deutsch, das Softwareentwickler und Systemarchitekten im beruflichen Alltag nutzen. Bürokratische Formulierungen (Nominalstil) und künstliche wörtliche Übersetzungen aus dem Englischen sind verboten.

### 2.10 Bewusstsein für geistiges Eigentum (Intellectual Property Awareness)
Technische Sachverhalte und Architekturen müssen verständlich erklärt werden, ohne proprietäre Quellcodes, vertrauliche AI-Algorithmen oder geschützte Kundendaten im Dokument preiszugeben. Wir beschreiben Methodik und Architekturmuster statt Rohdaten.

---

## 3. Richtlinien für Absätze (Paragraph Guidelines)

- **Absatzlänge**: Ein guter Absatz umfasst 3 bis maximal 6 Sätze. Kürzere Absätze (Ein-Satz-Absätze) sind nur zur bewussten Hervorhebung wichtiger Schlussfolgerungen zulässig.
- **Informationsdichte**: Absätze müssen ausbalanciert sein. Zu viele technische Fakten ohne erklärenden Kontext überfordern den Leser; zu viel Fließtext ohne Fakten verwässert die Dokumentation.
- **Logische Übergänge**: Der erste Satz eines Absatzes stellt die Verbindung zum vorherigen Absatz her, während der letzte Satz den Übergang zum nächsten Thema andeutet.
- **Sequenzierung**: Absätze müssen dem Muster „These → Erklärung → Nachweis/Beispiel“ folgen.

---

## 4. Richtlinien für Sätze (Sentence Guidelines)

- **Satzlänge**: Sätze sollten idealerweise 12 bis maximal 20 Wörter umfassen. Sätze mit mehr als 25 Wörtern müssen aufgeteilt werden.
- **Aktiv-Stimme (Active Voice)**: Wir bevorzugen die aktive Formulierung, da sie klarer benennt, welche Komponente welche Aktion ausführt.
  - *Negativ*: „Vom Server wird die Verbindung getrennt.“
  - *Positiv*: „Der Server trennt die Verbindung.“
- **Technische Genauigkeit**: Nutzen Sie exakte Verben. Vermeiden Sie schwammige Verben wie „machen“, „tun“ oder „haben“, wenn präzisere Verben wie „initialisieren“, „berechnen“ oder „bereitstellen“ existieren.
- **Satzstruktur**: Nutzen Sie den normalen deutschen Satzbau (Subjekt-Prädikat-Objekt) und vermeiden Sie verschachtelte Nebensätze.

---

## 5. Das technische Narrativ (Engineering Narrative)

Technische Dokumentation soll den Entstehungsprozess einer Systemlandschaft wie eine logische Kette erzählen. Ein exzellenter Schreibfluss führt den Leser entlang des roten Fadens der Entscheidungsfindung:

```text
Problemstellung (Der Schmerzpunkt)
       ▼
Analyse & Randbedingungen (Warum der Schmerz existiert)
       ▼
Optionen (Welche Wege möglich waren)
       ▼
Entscheidung (Warum wir genau diesen Weg gewählt haben)
       ▼
Validierung (Wie wir bewiesen haben, dass es funktioniert)
       ▼
Ergebnis (Der Mehrwert der Implementierung)
```

Das Schreiben darf die Entwurfsgedanken nicht verstecken, sondern muss den logischen Pfad des Ingenieurs offenlegen.

---

## 6. Schreib-Anti-Muster (Writing Anti-Patterns)

- **Passiv-Häufung**: Zu viele passive Sätze verschleiern, welche Systemkomponente die ausführende Instanz ist.
- **Substantivierungsketten**: Unnötige Verkettung deutscher Substantive (z. B. „Systemschnittstellenkonfigurationsänderungsfreigabe“).
- **Technologie-Ablagen (Technology Dumping)**: Aufzählen von Versionen und Libraries ohne syntaktische Anbindung an die Problemlösung.
- **Unerklärte Behauptungen**: Aufstellen von Thesen ohne verweisenden Link zu Protokollen oder Logs.
- **Marketing-Floskeln**: Verwendung wertender Begriffe wie „bahnbrechend“, „ultraschnell“ oder „revolutionär“.
- **AI-Schablonensprache**: Phrasen ohne Mehrwert (z. B. „Es ist wichtig zu erwähnen, dass...“).
- **Akademische Verschachtelung**: Das Schreiben extrem langer Schachtelsätze zur künstlichen Demonstration wissenschaftlicher Tiefe.

---

## 7. Zukünftige operative Dokumente

Dieser Schreibstandard bildet das Fundament für nachgelagerte Dokumente und Templates:
- Case Study Standard (Fallstudien-Handbuch)
- Architecture Document Standard (Architektur-Handbuch)
- ADR Standard (ADR-Schreibregeln)
- Technische Berichte (Technical Report Standard)
- White Paper Standard
- Projekt-Dokumentenvorlagen (Project Documentation Templates)

---

[Zurück zur BECC-Übersicht](../README.md)
