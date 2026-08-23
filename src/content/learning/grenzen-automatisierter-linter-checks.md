---
title: "Automatisierte Linter-Checks im CI-Gating: Grenzen maschineller Textprüfungen"
description: "Wie automatische Linter und manuelle Fresh-Reader-Audits zusammenwirken, um die Qualität von Projektbeschreibungen abzusichern."
category: "testen-verifizieren"
learningLevel: "intermediate"
publicationState: "draft"
---

Ein automatischer Check in der CI-Pipeline läuft durch. Das Statussymbol springt auf Grün. Keine formale Regel wurde verletzt. Alle erforderlichen Metadatenfelder sind vorhanden, und die Syntax ist fehlerfrei. 

Doch ist damit auch bewiesen, dass jede inhaltliche Aussage im Dokument korrekt ist?

Nein. Ein grüner Haken bedeutet lediglich: Alle vordefinierten Regeln sind erfüllt. Er beweist nicht automatisch, dass der Inhalt wahr oder verständlich ist. Genau hier liegt der Unterschied zwischen maschineller Regelprüfung und inhaltlicher Verifikation.

---

## Was PRAG automatisch prüfen kann

In unserem Validierungssystem **PRAG** setzen wir auf ein automatisiertes Prüfverfahren. Dabei schalten wir automatisierte Prüfungen als Kontrollpunkte ("Gates") in die Pipeline. Diese blockieren fehlerhafte Änderungen.

Diese Kontrollen basieren auf statischen Prüfungen. Sie untersuchen Dokumente formal, ohne das System auszuführen. Sie folgen deterministischen Regeln.

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
*Quelle: `bridgenta-workspace/validation/automation_controller.js`*

Dieses Code-Snippet zeigt die Validator-Kette. Ein **Linter** analysiert Text oder Code. Er prüft formale Konventionen und bekannte Fehlerbilder.

Die einzelnen Module prüfen feste Bedingungen:
* **Secret Scanner**: Findet API-Schlüssel, Passwörter oder persönliche Daten.
* **Link Validator**: Prüft Links auf Erreichbarkeit.
* **Metadata Validator**: Kontrolliert Pflichtfelder im Frontmatter.
* **Hash Validator**: Vergleicht Prüfsummen geänderter Dateien.

---

## Was der grüne Check nicht beweist

Diese Pipeline blockiert formale Mängel und Sicherheitsrisiken sehr effektiv. Dennoch stößt sie an klare Grenzen:

> **PRAG kann mit seinen statischen Prüfungen nicht feststellen, ob eine Aussage inhaltlich wahr ist.**

Ein kurzes Beispiel verdeutlicht dies. Ein Entwickler schreibt in einer Dokumentation:
*"Das Modul erzielt eine Zeitersparnis von 95%."*

* **Was PRAG tut**: Der Linter prüft die Syntax. Er scannt nach sensiblen Begriffen.
* **Was PRAG nicht kann**: Das System bewertet keine Fakten. Es kann nicht erkennen, ob der Wert auf echten Messungen beruht.

Ein bestandener Check sichert nur die formale Qualität der Codebasis. Er ist unentbehrlich als Schutzfilter, aber kein Beweis für Wahrheit.

---

## Regelprüfung und inhaltliche Verifikation sind zwei verschiedene Aufgaben

Maschinelle Regelprüfungen und inhaltliche Verifikation beantworten unterschiedliche Fragen:

1. **Die maschinelle Regelprüfung fragt**: *Ist das Dokument formal korrekt und sicher aufgebaut?*
2. **Die inhaltliche Verifikation fragt**: *Sind die Aussagen korrekt und durch Belege gedeckt?*

Für diese zweite Frage nutzen wir das manuelle **Fresh-Reader-Audit**.

Der Reviewer liest das Dokument wie ein neuer Besucher. Er besitzt kein internes Vorwissen zum Text. Der Reviewer prüft:
* Sind die Argumentationsketten logisch?
* Werden Fachbegriffe ausreichend erklärt?
* Sind die Belege nachvollziehbar? Stützen sie die Behauptungen im Text?

Das Dokument gilt erst nach zwei Schritten als verifiziert. Zuerst läuft die automatische Pipeline (Layer 1). Danach folgt das manuelle Audit (Layer 3).

---

## Erkenntnisse für die Praxis

Für Entwickler und Autoren ergeben sich drei Lehren:

* **Formale Qualität erzwingen**: Überlassen Sie Metadaten, Links und Secrets dem Linter. Nutzen Sie automatisches CI-Gating.
* **Kein Freifahrtschein**: Der grüne Build ist nur die Mindesthürde. Er ersetzt keine fachliche Prüfung.
* **Vier-Augen-Prinzip fokussieren**: Verschwenden Sie keine Zeit mit Tippfehlern oder defekten Links. Das erledigt die Maschine.
