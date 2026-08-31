---
title: "Automatisierte Linter-Checks im CI-Gating: Grenzen maschineller Textprüfungen"
description: "Wie automatische Linter und manuelle Fresh-Reader-Audits zusammenwirken, um die Qualität von Projektbeschreibungen abzusichern."
category: "testen-verifizieren"
learningLevel: "intermediate"
publicationState: "published"
publishedAt: "2026-08-23"
provenanceRef: "EV-BG-001"
---

Ein automatischer Check läuft durch. Das Statussymbol springt auf Grün. Die definierten Prüfungen in der Pipeline melden keinen Fehler.

Das sieht überzeugend aus. Aber was genau wurde damit bewiesen? Und warum beweist ein grüner Haken nicht automatisch, dass jeder Inhalt eines Dokuments korrekt ist?

## Das automatisierte Gatter

In unserem System nutzen wir das Validierungsprogramm **PRAG** als automatischen Kontrollpunkt. In der Software-Entwicklung nennt man einen solchen Punkt auch **CI-Gate**. PRAG ist breiter aufgebaut als ein einfacher **Linter**, der nur Schreibfehler oder Formatierungen prüft. Es orchestriert als Controller eine Kette von verschiedenen **Validatoren**.

Ein Blick in das System zeigt, wie diese Gates strukturiert sind:

```javascript
this.validators = customValidators || [
  { name: 'Registry Validator', clazz: RegistryValidator, failFast: true },
  { name: 'Secret Scanner', clazz: SecretScanner, failFast: false },
  { name: 'Build Validator', clazz: BuildValidator, failFast: false },
  { name: 'Evidence Validator', clazz: EvidenceValidator, failFast: false }
];
```
*Quelle: `validation/automation_controller.js` in Commit `07aac848a4`*

Einige Validatoren sind als `failFast: true` deklariert. Wenn eine solche kritische Prüfung fehlschlägt, bricht der Controller den Prüflauf sofort ab und überspringt die restlichen Prüfungen. Andere Validatoren laufen weiter und können zusätzliche Ergebnisse sammeln, bevor der Lauf endet.

## Was die Prüfungen sehen

Jeder Validator besitzt einen eng begrenzten Bereich, den er auswerten kann.

Der **Build Validator** führt eine statische Syntax-Prüfung durch. Er prüft unter anderem offene Code-Blöcke und Klammern in Mermaid-Diagrammen, führt aber keinen Programmcode aus. Er beweist somit nicht, dass die Anwendung komplett ohne Fehler läuft.

Der **Secret Scanner** prüft Dateien nach vordefinierten regulären Ausdrücken auf bekannte API-Schlüssel-Muster. Er kann unbekannte Muster nicht sicher ausschließen.

Der **Evidence Validator** prüft, ob die erwarteten Belegdateien vorhanden, nicht leer, registriert und im vorgesehenen Inhalt referenziert sind. Er prüft damit definierte Evidenzstrukturen, nicht die faktische Wahrheit des Beleginhalts.

## Grenzen statischer Kontrollen

Ein bestandener PRAG-Lauf zeigt, dass die dafür implementierten Prüfungen erfolgreich waren. Daraus folgt nicht automatisch, dass jede inhaltliche Aussage im geprüften Dokument wahr ist. Eine Maschine kann prüfen, ob alle Links funktionieren oder ob die Pflichtfelder gefüllt sind. Sie kann aber nicht verstehen, ob die beschriebenen Messergebnisse der Wahrheit entsprechen oder ob die Sätze für Menschen Sinn ergeben.

Aus diesem Grund ergänzen wir automatisierte Kontrollen durch manuelle Reviews.

Der **Fresh-Reader-Review** prüft die Verständlichkeit und logische Hinführung ohne internes Vorwissen. Ein menschlicher Leser liest das Dokument aus der Sicht eines Außenstehenden.

Der **Source-Fidelity-Audit** vergleicht die im Text gemachten Aussagen direkt mit den Git-Commits und Protokollen des Quellprojekts (Single Source of Truth). Er stellt sicher, dass keine Chronologien, Messergebnisse oder Entwickler-Motivationen erfunden wurden.

Automatisierte Prüfungen und manuelle Reviews ergänzen sich. Sie beantworten unterschiedliche Fragen und liefern verschiedene Arten von Evidenz.

## Erkenntnisse für die Praxis

Wenn Sie Dokumente oder Berichte verifizieren, können Sie den Prüfprozess in drei komplementäre Dimensionen unterteilen:

* Führen Sie automatische Syntax- und Formatprüfungen aus, um triviale formale Fehler sofort abzufangen.
* Nutzen Sie einen unvoreingenommenen Leser, um die logische Verständlichkeit und die Erläuterung von Fachbegriffen zu prüfen.
* Vergleichen Sie die inhaltlichen Kernaussagen stichprobenartig mit dem echten Quellmaterial, um Übertreibungen oder ungenaue Behauptungen auszuschließen.

> Ein grüner Haken zeigt, dass die für diesen Lauf ausgeführten Prüfungen innerhalb ihres definierten Prüfumfangs erfolgreich waren. Er beweist nicht automatisch, dass der Inhalt wahr, vollständig oder verständlich ist.
