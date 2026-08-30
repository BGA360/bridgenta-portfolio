---
title: "Automatisierte Linter-Checks im CI-Gating: Grenzen maschineller Textprüfungen"
description: "Wie automatische Linter und manuelle Fresh-Reader-Audits zusammenwirken, um die Qualität von Projektbeschreibungen abzusichern."
category: "testen-verifizieren"
learningLevel: "intermediate"
publicationState: "published"
publishedAt: "2026-08-23"
provenanceRef: "EV-BG-001"
---

Ein automatischer Check in der CI-Pipeline läuft durch. Das Statussymbol springt auf Grün. Die dafür definierten automatischen Prüfungen melden keinen Fehler. 

Doch ist damit auch bewiesen, dass jede inhaltliche Aussage im Dokument korrekt ist?

Nein. Ein grüner Haken bedeutet lediglich: Alle vordefinierten Regeln sind erfüllt. Er beweist nicht automatisch, dass der Inhalt wahr oder verständlich ist. Genau hier liegt der Unterschied zwischen maschineller Regelprüfung und inhaltlicher Verifikation.

---

## Was PRAG automatisch prüfen kann

In unserem Validierungssystem **PRAG** setzen wir auf ein automatisiertes Prüfverfahren. Dabei schalten wir automatisierte Prüfungen als Kontrollpunkte ("Gates") in die Pipeline. Diese können Änderungen stoppen, wenn eine definierte Prüfung fehlschlägt.

PRAG ist breiter aufgebaut als ein einzelner Linter. Es orchestriert mehrere Validatoren. Einige davon arbeiten ähnlich wie klassische Linter. Andere prüfen zusätzliche technische Bedingungen.

Ein Teil dieser Prüfungen arbeitet statisch und regelbasiert. Andere Validatoren prüfen zusätzliche Bedingungen. Sie kontrollieren zum Beispiel, ob die in einem Paket deklarierten Assets existieren und ob Diagramm-Syntaxen valide sind.

Ein Blick in den Kern unseres Validierungssystems zeigt, wie diese Gates strukturiert sind:

```javascript
    this.validators = customValidators || [
      { name: 'Registry Validator', clazz: RegistryValidatorWrapper, failFast: true },
      { name: 'Metadata Validator', clazz: MetadataValidatorWrapper, failFast: true },
      { name: 'EPPS Validator', clazz: EPPSValidator, failFast: true },
      { name: 'Manifest Validator', clazz: ManifestValidator, failFast: true },
      { name: 'Secret Scanner', clazz: SecretScanner, failFast: false },
      { name: 'Classification Validator', clazz: ClassificationValidator, failFast: false },
      { name: 'Link Validator', clazz: LinkValidator, failFast: false },
      { name: 'Build Validator', clazz: BuildValidator, failFast: false },
      { name: 'Evidence Validator', clazz: EvidenceValidator, failFast: false },
      { name: 'Hash Validator', clazz: HashValidator, failFast: false }
    ];
```
*Quelle: `validation/automation_controller.js` im Quellprojekt*

Dieses Code-Snippet zeigt die Validator-Kette. Der PRAG-Controller koordiniert hierbei eine definierte Sequenz von Prüfungen. Die Namen zeigen unterschiedliche technische Prüfbereiche, zum Beispiel Metadaten, Secrets, Links, Builds und Hashes.

Welche konkrete Regel ein Validator im Detail durchsetzt, ergibt sich aus seiner jeweiligen Implementierung.

---

## Was der grüne Check nicht beweist

<div class="learning-evidence-boundary">

Die Pipeline kann definierte formale und technische Regelverstöße erkennen und je nach Validator den Prüfprozess fehlschlagen lassen. Dennoch stößt sie an klare Grenzen:

> **PRAG kann mit seinen statischen Prüfungen nicht feststellen, ob eine Aussage inhaltlich wahr ist.**

Ein kurzes Beispiel verdeutlicht dies. Ein Entwickler schreibt in einer Dokumentation:
*"Das Modul erzielt eine Zeitersparnis von 95%."*

* **Was PRAG prüfen kann**: ob die dafür implementierten Regeln verletzt werden.
* **Was daraus nicht folgt**: ob die behauptete Zeitersparnis tatsächlich gemessen und belegt wurde.

Ein bestandener PRAG-Lauf zeigt, dass die dafür definierten Prüfungen erfolgreich waren. Er dient dabei als automatisierter Prüfmechanismus. Er beweist jedoch nicht automatisch, dass jede Aussage im geprüften Inhalt wahr ist.

</div>

---

## Regelprüfung und inhaltliche Verifikation sind zwei verschiedene Aufgaben

Maschinelle Regelprüfungen und inhaltliche Verifikation beantworten unterschiedliche Fragen:

1. **Die maschinelle Regelprüfung fragt**: *Erfüllt das Dokument die definierten maschinellen Regeln?*
2. **Die inhaltliche Verifikation fragt**: *Sind die Aussagen korrekt und durch Belege gedeckt?*

Für diese inhaltliche Prüfung eignet sich ein manuelles **Fresh-Reader-Audit**. Ein Fresh Reader liest die Seite wie ein neuer Besucher – also ohne das interne Projektwissen der Person, die den Text geschrieben hat.

Der Reviewer besitzt kein internes Vorwissen zum Text. Er achtet auf folgende Aspekte:
* Sind die Argumentationsketten im Text schlüssig?
* Werden technische Fachbegriffe ausreichend erklärt?
* Sind die verlinkten Belege nachvollziehbar und stützen sie die Behauptungen?

Im BridGenta-Prüfmodell ergänzen sich automatisierte Regelprüfungen und eine separate inhaltliche Prüfung. Sie liefern unterschiedliche Arten von Evidenz für unterschiedliche Qualitätsfragen.

---

## Erkenntnisse für die Praxis

Für Entwickler und Autoren ergeben sich drei Lehren:

* **Automatisieren, was möglich ist**: Automatisieren Sie Prüfungen, für die klare maschinelle Regeln existieren. Dazu gehören zum Beispiel klar definierte Format-, Struktur- oder technische Regeln.
* **Kein Freifahrtschein**: Ein grüner Prüfstatus zeigt zunächst nur, dass die dafür definierten Prüfungen bestanden wurden. Er beweist keine inhaltliche Wahrheit.
* **Inhaltliche Qualität**: Konzentrieren Sie sich auf Fragen außerhalb der Regeln. Prüfen Sie Verständlichkeit, Logik und Belege.

---

## Begriffe einfach erklärt

*   **CI (Continuous Integration)**: Ein automatisiertes Verfahren, bei dem Code-Änderungen fortlaufend zusammengeführt und automatisch getestet werden.
*   **Linter**: Ein Werkzeug, das Quellcode automatisch auf formale Fehler, Stilregeln oder Programmierfehler hin untersucht.
*   **Validator**: Eine Prüffunktion, die kontrolliert, ob bestimmte Daten oder Strukturen definierten Regeln und Schemas entsprechen.
*   **Evidenz**: Ein nachprüfbarer, dokumentierter Beleg (z. B. ein Testbericht oder ein Git-Commit), der die Einhaltung einer Qualitätsanforderung beweist.
