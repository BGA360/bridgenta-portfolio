---
title: "Code-Fakten vs. strukturelle Korrektheit: Wenn grüne Tests nicht ausreichen"
description: "Wie Übersetzungsfehler im Lumina-Case-Study-Entwurf trotz erfolgreicher Pipeline-Durchläufe aufgedeckt wurden."
category: "testen-verifizieren"
learningLevel: "advanced"
publicationState: "published"
publishedAt: "2026-08-30"
provenanceRef: "EV-BG-004"
---

Die automatische Prüfung in der Pipeline läuft durch. Das Symbol springt auf Grün. Das System meldet: kein Fehler gefunden. Doch die fertige Seite enthält falsche Überschriften und verletzt wichtige Projekt-Regeln.

Der Test war grün. Trotzdem war die Anforderung nicht erfüllt.

Genau das passierte bei der Integration der Fallstudie *Lumina Praxis* in Commit `d2363e7`. In diesem Artikel erklären wir am Praxis-Beispiel, warum automatische Tests inhaltliche Fehler oft übersehen und wie wir diese Lücke durch manuelle Kontrollen schließen.

---

## 1. Was ist passiert?

Beim Erstellen der Fallstudie *Lumina Praxis* (`src/content/projects/luminapraxisds.md`) liefen alle Pipeline-Checks erfolgreich durch. Dennoch gab es eine Abweichung von den Projektvorgaben:

*   **Die Anforderung**: Das System schreibt vor, dass alle sichtbaren Überschriften einheitlich auf Deutsch verfasst sein müssen.
*   **Die Abweichung**: Der Entwurf enthielt englische Überschriften (wie *„Overview“*, *„Problem“*, *„Approach“*).
*   **Das Problem**: Da die Markdown-Formatierung syntaktisch vollkommen fehlerfrei war, erkannte der automatische Linter keinen Fehler. Das Dokument war formal richtig, aber inhaltlich falsch strukturiert.

Der Fehler wurde erst durch ein manuelles **Source-Fidelity-Audit** aufgedeckt. In Commit `d2363e7` wurden die Überschriften korrigiert.

---

## 2. Der Begriff: Syntax-Prüfung vs. Inhaltliche Wahrheit

Dieser Vorfall verdeutlicht den Unterschied zwischen formaler und inhaltlicher Prüfung:

*   **Syntaktische Validierung (Syntax-Prüfung)**: Prüft, ob formale Regeln eingehalten wurden. Zum Beispiel: Funktionieren alle Links? Ist das Datenformat korrekt? Das können Computer automatisch prüfen.
*   **Semantische Korrektheit (Inhaltliche Wahrheit)**: Prüft, ob der Inhalt fachlich richtig ist und den inhaltlichen Anforderungen entspricht. Ein Linter prüft nur die Regeln, die für ihn definiert wurden. In diesem Fall wusste er nicht, dass die Überschriften auf Deutsch sein mussten.

<div class="learning-evidence-boundary">

Ein erfolgreicher Linter- oder Build-Lauf beweist nur, dass die formalen Regeln der Syntax erfüllt sind. Er ist kein Beweis dafür, dass der Inhalt fachlich korrekt ist.

</div>

---

## Lektionen für die Praxis (Anwenden)

Um semantische Abweichungen in Ihren Projekten zu verhindern, nutzen Sie dieses Prinzip der komplementären Prüfung:

*   **Prinzip 1 (Ebenen-Trennung):** Ein grüner Linter-Status darf im Freigabeprozess niemals als inhaltliche Freigabe gewertet werden.
    ```text
      [ Code & Syntax OK ]  --> Linter-Status GRÜN (Formelle Ebene)
              ≠
      [ Inhaltlich korrekt ] --> Manuelles Review OK (Semantische Ebene)
    ```
*   **Prinzip 2 (Keine Status-Schätzung):** Im BridGenta-Prüfmodell wird der inhaltliche Status nicht allein aus technischen Signalen (wie dem reinen Vorhandensein einer Datei) abgeleitet. Für die inhaltliche Freigabe ist ein expliziter Review-Schritt vorgesehen.
*   **Prinzip 3 (Dualer Prüfansatz):** Automatisieren Sie alles, was formal (syntaktisch) prüfbar ist, um Zeit zu sparen. Sichern Sie inhaltliche Konformität (Semantik) durch zusätzliche Prüfungen ab.

---

## Die wichtigste Erkenntnis

> [!IMPORTANT]
> Ein erfolgreicher Linter- oder Build-Lauf zeigt nur, dass die von diesen Prüfungen abgedeckten Regeln erfüllt wurden. Er beweist nicht automatisch, dass alle fachlichen Anforderungen erfüllt sind.

---

## Begriffe einfach erklärt

**Syntaktische Validierung**

Die Überprüfung formaler Grammatik-, Syntax- und Formatierungsregeln in einer Datei (z. B. durch einen Linter).

**Semantische Korrektheit**

Die tatsächliche inhaltliche und sachliche Richtigkeit von Texten oder Daten im Bezug auf die realen Projekt-Anforderungen.

**Source-Fidelity-Audit**

Eine manuelle inhaltliche Prüfung. Sie vergleicht, ob ein veröffentlichter Text mit den realen Entwicklungsdaten und Belegen übereinstimmt.
