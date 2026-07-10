# Standard für technische Erklärbarkeit (Engineering Explainability Standard)

Dieses Dokument definiert den Standard für die verständliche und präzise Vermittlung technischer Konzepte auf BridGenta. Ziel ist es, technische Systeme so zu erklären, dass Leser das *Wie* und das *Warum* verstehen, ohne dass die Erklärungen an fachlicher Tiefe verlieren.

Dieser Standard befasst sich nicht mit Schreibmechanik oder Dokumenten-Layouts, sondern legt fest, wie technisches Wissen strukturiert und begründet werden muss.

---

## 1. Konstitutioneller Bezug

Dieser Standard baut direkt auf der [BECC-Mission](../00-foundation/MISSION.md), der [BECC-Vision](../00-foundation/VISION.md) und den [Leitlinien für technisches Schreiben](../01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md) auf. Alle zukünftigen operativen Dokumente (wie konkrete Textvorlagen, Checklisten und Review-Richtlinien) müssen diesem Standard entsprechen.

---

## 2. Prinzipien der Erklärbarkeit

### 2.1 Problem vor Lösung erklären (Explain Problems before Solutions)
Eine technische Lösung hat für den Leser erst dann einen Wert, wenn das zugrundeliegende Problem verstanden wurde. Jede Erklärung beginnt mit der Darstellung des Schmerzpunkts, des Engpasses oder der Ineffizienz, die behoben werden sollte.

### 2.2 Das „Warum“ vor dem „Wie“ (Explain Why before How)
Das Verständnis der Motivation hinter einem Systementwurf steht über der bloßen Beschreibung des Codes. Erst wenn der Leser versteht, *warum* ein Pfad gewählt wurde, machen die Details der Umsetzung Sinn.

### 2.3 Entscheidungen statt bloßer Technologien erklären (Explain Decisions, not just Technologies)
Technologielisten alleine haben keinen Belegwert. Technische Erklärungen müssen begründen, warum eine technologie gewählt wurde, welches konkrete Problem sie löst, welche Alternativen existierten und warum diese verworfen wurden.

### 2.4 Trade-offs explizit offenlegen (Explain Trade-offs Explicitly)
Jede Architekturentscheidung erfordert Kompromisse. Der offene Umgang mit Vorteilen, Nachteilen, akzeptierten Risiken und Einschränkungen erhöht die fachliche Glaubwürdigkeit und hilft dem Leser, das System realistisch zu bewerten.

### 2.5 Systeme als zusammenhängendes Ganzes beschreiben (Explain Systems as Connected Parts)
Wir beschreiben keine Technologien isoliert. Der Fokus liegt auf dem Systemkontext: Wie interagieren die Komponenten? Wie fließen die Daten? Wie sind die Verantwortlichkeiten (Separation of Concerns) verteilt? Leser müssen die Systemarchitektur verstehen, nicht nur die einzelnen Bausteine.

### 2.6 Progressiver Wissensaufbau (Build Understanding Incrementally)
Komplexe Themen werden schrittweise vermittelt. Als logisches Vermittlungsmodell gilt die folgende Kette:

```text
Beobachtung ➔ Kontext ➔ Problem ➔ Randbedingungen ➔ Entscheidung ➔ Umsetzung ➔ Verifizierung ➔ Belege ➔ Lerneffekte
```

Dieses Modell führt den Leser logisch von der Ausgangssituation bis zum messbaren Ergebnis.

### 2.7 Verständliche Fachsprache und Begriffs-Grounding (Explain Technical Terms Naturally)
Texte nutzen die in der IT-Praxis übliche deutsche Fachsprache. Hochspezialisierte Begriffe werden bei ihrem ersten Auftreten kurz in Klammern oder in einem kurzen Satz erklärt.
Beispiele:
- **Legacy-System** (ein älteres Softwaresystem, das oft schwer zu warten oder schlecht dokumentiert ist)
- **Architecture Drift** (das schleichende Auseinanderdriften von der ursprünglich geplanten Softwarestruktur zur tatsächlichen Implementierung)
- **Builder Execution Contract** (BEC; ein fest definierter Vertrag, der festlegt, welche Aufgaben ein Builder-System autonom durchführen darf)

Nach dieser einmaligen Einführung wird der Begriff konsistent ohne weitere Erklärung verwendet. Allgemein etablierte Branchenbegriffe werden nicht übererklärt.

### 2.8 Verifizierbarkeit von Aussagen (Make Claims Verifiable)
Es muss für den Leser klar ersichtlich sein, ob es sich bei einer Aussage um eine beobachtete Tatsache, eine begründete Annahme, eine Interpretation oder eine logische Schlussfolgerung handelt. Alle technischen Behauptungen müssen durch Belege (Diagramme, Benchmarks, Logfiles) überprüfbar sein. Unbelegte Absolutheitsansprüche sind unzulässig.

### 2.9 Schutz des geistigen Eigentums (Preserve Intellectual Property)
Dokumente müssen Methodik, Architektur und Entscheidungsgründe glaubhaft darlegen, ohne sensible Details offenzulegen. Betriebsgeheimnisse, proprietäre Algorithmen, geschützte AI-Workflows oder Kunden-Interna dürfen nicht dokumentiert werden. Erkläre die Methodik so tief, dass sie Vertrauen schafft, ohne die Schutzwürdigkeit von Assets zu verletzen.

### 2.10 Menschliches Verständnis als primäre Metrik (Human Understanding is the Success Metric)
Der Erfolg eines Erklärdokuments bemisst sich daran, ob der Leser den Entwurfsprozess und die Trade-offs verstanden hat – und nicht daran, wie viele Fachbegriffe oder Frameworks genannt wurden.

---

## 3. Erklärungs-Muster (Explainability Patterns)

Erklärungen stellen logische Beziehungen her. Die folgenden Muster sind bevorzugt zu verwenden:

| Muster | Zweck | Beispiel |
| :--- | :--- | :--- |
| **Problem ➔ Entscheidung** | Verbindet Herausforderung mit der Lösung. | *„Um die Netzwerklast zu senken (Problem), haben wir uns für lokales Caching entschieden (Entscheidung).“* |
| **Entscheidung ➔ Begründung** | Liefert den logischen Kern. | *„Wir nutzen Astro (Entscheidung), da wir statische Portfolioseiten ohne Client-side Runtime ausliefern wollen (Begründung).“* |
| **Constraint ➔ Lösung** | Zeigt das Reagieren auf Grenzen. | *„Da kein Netzwerkzugriff erlaubt war (Constraint), haben wir einen Offline-Validator implementiert (Lösung).“* |
| **Beobachtung ➔ Beleg** | Untermauert Feststellungen. | *„Der Build-Prozess läuft stabiler (Beobachtung), wie die fehlerfreien GitHub Actions Logs im Walkthrough zeigen (Beleg).“* |
| **Beleg ➔ Schlussfolgerung** | Schließt Argumentationsketten. | *„Die Ladezeit liegt unter 100ms (Beleg), woraus folgt, dass die statische Generierung greift (Schlussfolgerung).“* |
| **Komponente ➔ Verantwortung** | Klärt Zuständigkeiten im System. | *„Das ECG (Komponente) prüft ausschließlich die Vollständigkeit der Metadaten (Verantwortung).“* |

---

## 4. Erklärungs-Anti-Muster (Explainability Anti-Patterns)

Folgende Fehler behindern das technische Verständnis und sind zu vermeiden:

- **Technology Dumping**: Das bloße Aufzählen von Frameworks und Libraries, ohne zu erklären, warum sie im System nützlich sind.
- **Features ohne Begründung**: Listen von Systemfunktionen, ohne das gelöste Problem darzustellen.
- **Architektur ohne Kontext**: Diagramme und Systemskizzen, die ohne einleitende Problemstellung im Raum stehen.
- **Verschweigen von Trade-offs**: Einseitige Darstellung einer Technologie als fehlerfrei und ohne Alternativen.
- **Unvorbereitete Fachbegriffe**: Die Nutzung von Fachwörtern oder Abkürzungen, ohne sie bei Erstverwendung einzuführen.
- **Marketing- und Hypesprache**: Verwendung von Wörtern wie *„revolutionär“*, *„bahnbrechend“* oder *„perfekt“*.
- **Akademische Abstraktion**: Künstlich komplizierte, theoretische Formulierungen statt einfacher, greifbarer Beispiele.
- **Generische AI-Phrasen**: Inhaltsleere Füllsätze, die typisch für ungesteuerte Sprachmodelle sind.
- **Beleglose Behauptungen**: Aussagen über Stabilität oder Performance ohne verweisende Logfiles oder Messdaten.
- **Unerklärte Diagramme**: Das Einfügen komplexer Grafiken ohne erklärenden Text, der die Kernaussage der Grafik beschreibt.

---

[Zurück zur BECC-Übersicht](../README.md)
