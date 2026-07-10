# Sprachstandard für technische Erklärungen (Engineering Language Standard)

Dieses Dokument definiert den permanenten Sprachstandard für alle technischen Dokumente, Berichte und Fallstudien (Case Studies) im BridGenta-Ökosystem. Es legt fest, wie Fachsprache, Übersetzungen und Terminologien verwendet werden müssen, um Verständlichkeit, Konsistenz und Glaubwürdigkeit zu gewährleisten.

Dieses Dokument regelt nicht die Textgestaltung oder die Formatierung von Dokumenten, sondern definiert die **linguistische Philosophie** von BridGenta.

---

## 1. Konstitutioneller Bezug

Dieser Sprachstandard baut direkt auf der [BECC-Mission](../00-foundation/MISSION.md), den [Leitlinien für technisches Schreiben](../01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md), dem [Standard für technische Erklärbarkeit](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md) und den [Kommunikationszielen](../03-communication-objectives/ENGINEERING_COMMUNICATION_OBJECTIVES.md) auf. 

Zukünftige operative Standards (wie das Stilhandbuch für Fachbegriffe, der Glossarstandard und die Übersetzungshilfen) beziehen ihre Gültigkeit aus diesem Dokument.

---

## 2. Sprachprinzipien für das Engineering

### 2.1 Praxisnahe deutsche Fachsprache (Familiar German Engineering Language)
Wir schreiben in der Sprache, die deutsche IT-Professionals und Softwareentwickler in ihrer täglichen Praxis sprechen und schreiben. Die Texte müssen für erfahrene Ingenieure sofort vertraut klingen. Künstliche Eindeutschungen oder ein übertrieben akademischer Schreibstil sind zu vermeiden.

### 2.2 Technische Präzision vor stilistischer Abwechslung (Precision before Stylistic Variety)
Fachliche Exaktheit schlägt literarische Eleganz. Ein etablierter technischer Begriff darf niemals durch ein vermeintlich schöneres Synonym ersetzt werden, nur um Abwechslung im Text zu erzeugen. Fachliche Eindeutigkeit geht vor Wortvielfalt.

### 2.3 Konsistenz vor Synonymen (Consistency before Synonyms)
Für ein und dasselbe technische Konzept nutzen wir dokumentenübergreifend immer denselben Begriff. Synonyme führen beim Leser zu Verwirrung und der Frage, ob zwei leicht unterschiedliche Dinge gemeint sind. Ein Konzept hat genau einen Namen.

### 2.4 Einmal erklären, konsistent weiterverwenden (Explain Once, Then Continue)
Führen wir einen spezialisierten Begriff ein, wird dieser beim ersten Vorkommen kurz und pragmatisch erklärt (z. B. in einer kurzen Klammerbemerkung).
- *Beispiel*: **Legacy-System** (ein altes, oft schlecht dokumentiertes Softwaresystem).

Danach wird der Begriff im restlichen Dokument ohne wiederholte Definition vorausgesetzt. Dies sichert den Lesefluss, ohne an Genauigkeit einzubüßen.

### 2.5 Branchenüblichen IT-Wortschatz respektieren (Use Familiar Industry Terminology)
Etablierte englische Begriffe werden nicht ins Deutsche übersetzt, wenn das in der IT-Praxis unüblich ist. Folgende Begriffe bleiben im englischen Original:
- API
- Branch
- Repository
- Pipeline
- Deployment
- Pull Request
- Frontend
- Backend
- CI/CD

Künstliche Übersetzungen (z. B. „Zieh-Anfrage“ statt „Pull Request“) verringern die Professionalität und werden verboten.

### 2.6 BridGenta-spezifische Begriffe klar einführen (Introduce BridGenta Terminology Clearly)
Projektinterne Begriffe oder Abkürzungen müssen bei der ersten Verwendung voll ausgeschrieben und erläutert werden.
- *Beispiel*: **Builder Execution Contract (BEC)**.

Danach wird die Abkürzung konsistent genutzt. Zukünftige BridGenta-Begriffe müssen diesem Namensschema folgen.

### 2.7 Sprache als Werkzeug der Erklärbarkeit (Language should Support Explainability)
Die gewählte Sprache muss die kognitive Last des Lesers minimieren. Fachbegriffe dürfen nicht als Barrieren wirken, sondern müssen komplexe Architekturen verständlicher machen, ohne die fachliche Tiefe zu reduzieren.

### 2.8 Präzision vor absoluten Aussagen (Precision before Absolute Claims)
Technische Aussagen müssen sachlich und präzise formuliert sein. Absolute Behauptungen (z. B. „garantiert fehlerfrei“) sind unzulässig, sofern sie nicht mathematisch oder empirisch bewiesen werden können. Es muss sprachlich klar unterschieden werden zwischen:
- Beobachtungen (z. B. „Der Build läuft erfolgreich.“),
- Belegen (z. B. „Laut Logfile des Commits...“),
- Annahmen (z. B. „Wir nehmen an, dass der Client...“),
- Interpretationen (z. B. „Dies lässt darauf schließen, dass...“),
- Schlussfolgerungen (z. B. „Daraus folgt...“).

### 2.9 Fachlichkeit vor Marketing (Engineering before Marketing)
Die Sprache beschreibt und erklärt Systeme, anstatt sie zu bewerben. Wir verzichten auf Marketing-Floskeln, Hype-Wörter, übertriebene Claims und persuasive Sprache. Vertrauen wird durch nachvollziehbar dokumentierte Logik und Belege aufgebaut.

### 2.10 Schutz des geistigen Eigentums wahren (Protect Intellectual Property)
Die gewählte Fachsprache muss erklären, wie ein System konzipiert ist und warum Entscheidungen getroffen wurden, ohne Betriebsgeheimnisse, proprietäre Quellcodes, vertrauliche AI-Workflows oder Kunden-Interna offenzulegen. Die Kommunikation verbleibt auf einer erklärenden, methodischen Ebene.

---

## 3. Sprachphilosophie

Die Linguistik auf BridGenta folgt einem klaren Muster:
- **Deutsch** ist die primäre Verfassungssprache für die Kommunikation.
- **Englisch** wird dort beibehalten, wo es dem etablierten Industriestandard entspricht.
- **Abkürzungen** werden nach dem Muster „Name (Abkürzung)“ beim ersten Verwenden definiert.
- **Erklärungen** erfolgen kurz parenthetisch (in Klammern), um den Lesefluss nicht zu stören.
- **Klarheit** geht immer vor sprachlicher Dekoration.

---

## 4. Sprach-Anti-Muster (Language Anti-Patterns)

Die folgenden Sprachgewohnheiten verschlechtern die Dokumentenqualität und sind zu vermeiden:
- **Wortwörtliche Übersetzungen**: Englische Sätze oder Metaphern, die direkt ins Deutsche übersetzt wurden und unnatürlich klingen.
- **Unvorbereitete Abkürzungen**: Verwendung von IDs oder Akronymen ohne vorherige Definition beim Erstkontakt.
- **Inkonsistente Begriffe**: Der Wechsel zwischen synonymen Bezeichnungen (z. B. „Codebase“, „Repository“ und „Quellcodeverzeichnis“ im selben Text).
- **Akademischer Nominalstil**: Lange Schachtelsätze mit unnötig vielen Substantivierungen und passiven Konstruktionen.
- **Marketing- und Hypesprache**: Verwendung werblicher Adjektive (z. B. „die ultimative Lösung“).
- **Generische AI-Phrasen**: Füllsätze ohne echten Informationsgehalt.
- **Substantivketten**: Unleserliche deutsche Wortzusammensetzungen, die die Lesegeschwindigkeit verlangsamen.

---

## 5. Zukünftige operative Standards

Dieses Dokument dient als verfassungsrechtliche Basis für nachgelagerte, operative Sprachwerkzeuge. Diese werden in späteren Sprints implementiert und dürfen die hier verankerten Grundsätze nicht verletzen:
- Stilhandbuch für Fachbegriffe (Technical Term Style Guide)
- Tooltip-Standard (Tooltip Standard)
- Engineering-Glossar (Engineering Glossary)
- BridGenta-Begriffsregister (BridGenta Terminology Registry)
- Übersetzungshilfe (Translation Guidance)

---

[Zurück zur BECC-Übersicht](../README.md)
