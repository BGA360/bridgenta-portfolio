# Standard für technische Terminologie (Engineering Terminology Standard)

Dieses Dokument definiert den permanenten Terminologie-Standard für alle technischen Dokumente, Berichte und Fallstudien (Case Studies) im BridGenta-Ökosystem. Es legt fest, wie Fachbegriffe eingeführt, gepflegt, abgelöst und weiterentwickelt werden, um eine konsistente Fachsprache über alle Dokumente hinweg zu sichern.

Dieses Dokument regelt nicht die konkreten Wörterbucheinträge oder Übersetzungslisten, sondern definiert die **Terminologie-Governance** von BridGenta.

---

## 1. Konstitutioneller Bezug

Dieser Terminologie-Standard baut direkt auf der [BECC-Mission](../00-foundation/MISSION.md), den [Leitlinien für technisches Schreiben](../01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md), dem [Standard für technische Erklärbarkeit](../02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md), den [Kommunikationszielen](../03-communication-objectives/ENGINEERING_COMMUNICATION_OBJECTIVES.md) und dem [Sprachstandard](../04-language/ENGINEERING_LANGUAGE_STANDARD.md) auf. 

Alle operativen Werkzeuge wie das Stilhandbuch für Fachbegriffe, das Glossar, der Tooltip-Standard, die Übersetzungshilfen und das Begriffsregister leiten ihre Gültigkeit aus diesem Standard ab.

---

## 2. Terminologie-Prinzipien

### 2.1 Ein Konzept – Ein Begriff (One Concept – One Preferred Term)
Jedes technische Konzept hat genau einen bevorzugten Namen. Die Verwendung wechselnder Bezeichnungen für dasselbe Objekt (z. B. der Wechsel zwischen „Datenbank-Instanz“ und „Datenbanksystem“ im selben Dokument) ist unzulässig. Eindeutigkeit geht vor sprachliche Variation.

### 2.2 Stabilität der Begriffe (Stable Terminology)
Eingeführte Fachbegriffe bleiben stabil. Eine Änderung oder Umbenennung erfolgt nur dann, wenn ein nachweisbarer Nutzen für das technische Verständnis vorliegt. Begriffsänderungen erfordern eine kontrollierte Überarbeitung und Dokumentation.

### 2.3 Praxisnahe Branchenbegriffe (Familiar Industry Terminology)
Wir verwenden Begriffe, die in der täglichen Praxis deutscher Entwickler etabliert sind. Es werden keine künstlichen Ersatzbegriffe für Standard-Technologien oder -Methoden erfunden, um den Lesefluss nicht durch ungewohnte Formulierungen zu stören.

### 2.4 Englisch bei etabliertem IT-Standard (English Where Industry Uses English)
Begriffe, die im deutschen Sprachraum standardmäßig auf Englisch verwendet werden, bleiben unübersetzt.
- *Beispiele*: API, Branch, Repository, Pipeline, Deployment, Pull Request, Frontend, Backend, CI/CD.

Künstliche Übersetzungen ins Deutsche sind zu vermeiden, da sie die fachliche Präzision schmälern.

### 2.5 Deutsch bei besserer Lesbarkeit (German Where German Improves Understanding)
Gibt es einen etablierten deutschen Begriff, der die Verständlichkeit erhöht und die kognitive Last senkt, wird dieser bevorzugt (z. B. „Schnittstelle“ statt „Interface“, sofern dies im Kontext präziser ist). Das Ziel ist Verständlichkeit, nicht sprachliche Reinheit.

### 2.6 Einmal erklären, konsistent verwenden (Explain Once)
Spezialisierte oder weniger geläufige Begriffe erhalten bei der ersten Verwendung eine kurze, verständliche Erklärung (z. B. als Klammerbemerkung). Danach wird der Begriff vorausgesetzt. Die Erklärung muss sachlich, kompakt und verständlich sein.

### 2.7 BridGenta-Terminologie einführen (BridGenta Terminology)
Projektinterne Begriffe werden stets mit ihrem vollen Namen eingeführt, bevor Abkürzungen genutzt werden.
- *Beispiel*: **Builder Execution Contract (BEC)**.

Danach wird ausschließlich die Abkürzung BEC verwendet. Zukünftige BridGenta-Begriffe müssen nach diesem Namensschema aufgebaut sein.

### 2.8 Abkürzungs-Richtlinie (Abbreviation Policy)
Keine Abkürzung darf im Text stehen, bevor ihr vollständiger Name eingeführt wurde. Abkürzungen dienen der Vereinfachung des Leseflusses und dürfen keine Hürden für neue Leser aufbauen.

### 2.9 Kognitive Vertrautheit (Cognitive Familiarity)
Terminologie muss das technische Erfassen beschleunigen. Leser sollen vertraute Muster sofort wiedererkennen. Unbekannte Konzepte werden behutsam und progressiv aufgebaut.

### 2.10 Terminologie dient dem Verständnis (Terminology Supports Explainability)
Die Fachbegriffe sind Werkzeuge der Erklärbarkeit, kein Selbstzweck. Sie dürfen niemals die Kommunikation verkomplizieren. Verständliche Erklärungen stehen immer über der Anhäufung komplexer Fachwörter.

### 2.11 Nutzwert vor Begriffserfindung (Evidence Before Terminology)
Neue Begriffe werden nur dann eingeführt, wenn sie einen nachweisbaren Kommunikationswert bieten. Wir vermeiden das Erfinden neuer Namen für bereits existierende Industriestandards oder geringfügig veränderte Prozesse.

---

## 3. Terminologie-Lebenszyklus (Terminology Lifecycle)

Die Governance für die Einführung und Pflege von Fachbegriffen folgt vier Phasen:

1. **Einführung (Introduction)**: Neue Begriffe müssen einen klaren Belegwert aufweisen. Sie werden bei Erstnennung voll ausgeschrieben und parenthetisch erklärt.
2. **Stabilisierung (Stabilization)**: Ein Begriff wird nach seiner Etablierung in allen Dokumenten einheitlich und unverändert verwendet.
3. **Abkündigung (Deprecating)**: Begriffe, die veraltet sind oder durch bessere Industriestandards ersetzt wurden, werden als veraltet (deprecated) markiert und nicht mehr für neue Dokumente verwendet.
4. **Ersetzung (Replacement)**: Wird ein Begriff ersetzt, muss die Dokumentations-Historie gepflegt werden, um sicherzustellen, dass alte Referenzen nachvollziehbar bleiben.

---

## 4. Beziehungen zukünftiger Assets

Dieser Governance-Standard bildet das Fundament für nachgelagerte, operative Dokumente und Datenbestände:

```text
Engineering Terminology Standard (Dieses Dokument — Richtlinie)
                  ↓
Technical Term Style Guide (Schreibweisen und Zeichenregeln)
                  ↓
Engineering Glossary (Die inhaltlichen Definitionen)
                  ↓
Tooltip Standard / Terminology Registry (Technische Hilfen im Frontend)
```

---

## 5. Terminologie-Anti-Muster (Terminology Anti-Patterns)

Die folgenden Fehler verringern die Kommunikationsqualität und sind unzulässig:
- **Begriffs-Drift**: Verwendung unterschiedlicher Begriffe für dasselbe Konzept innerhalb des Projekts.
- **Unerklärte Akronyme**: Verwendung von Abkürzungen ohne vorherige Definition beim Erstkontakt.
- **Künstliche Eindeutschung**: Zwanghaftes Übersetzen etablierter englischer IT-Begriffe ins Deutsche.
- **Unnötiger Anglizismus**: Die Verwendung englischer Wörter für Begriffe, die im Deutschen präziser oder üblicher sind.
- **Hype-Begriffe**: Ersetzen technischer Termini durch werbliche Phrasen.
- **Wortschöpfungen ohne Mehrwert**: Erfinden neuer Namen für Standard-Entwurfsmuster.
- **Inkonsistenz**: Abweichende Fachbegriffe zwischen Architekturdiagrammen und Erklärungstexten.

---

[Zurück zur BECC-Übersicht](../README.md)
