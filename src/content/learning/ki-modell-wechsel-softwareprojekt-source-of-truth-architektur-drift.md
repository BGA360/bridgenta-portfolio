---
title: "Was passiert, wenn mitten im Softwareprojekt das KI-Modell wechselt?"
description: "Ein Wechsel des KI-Modells erzeugt leicht unbemerkt Architektur-Drift. Warum verbindliche Projektregeln außerhalb des Modells liegen müssen, damit das System konsistent bleibt."
category: "ai-entwicklung"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-09-05"
provenanceRef: "EV-BG-012"
---

Beim Entwickeln mit KI entsteht schnell ein Gefühl von Kontinuität.

Man arbeitet mehrere Tage oder Wochen mit einem Modell.

Es kennt die bisherigen Entscheidungen.

Es kennt die Architektur.

Es kennt bestimmte Regeln.

Dann wechselt man das Modell.

Vielleicht weil ein anderes Modell besser programmieren kann.

Vielleicht weil es günstiger ist.

Vielleicht weil es bei einer bestimmten Aufgabe bessere Ergebnisse liefert.

Auf den ersten Blick klingt das einfach.

> **Neues Modell. Gleicher Auftrag. Weiter geht’s.**

Aber genau hier beginnt eine wichtige Frage:

> **Bleibt das Softwareprojekt wirklich gleich, wenn das KI-Modell wechselt?**

## Stellen wir uns ein Haus vor

![Illustration eines bestehenden Bauprojekts, zu dem ein neuer KI-Ingenieur hinzukommt.](/images/learning/ki-modell-wechsel-softwareprojekt-source-of-truth-architektur-drift.jpg)

Ein Architekt plant das Fundament.

Ein zweiter Architekt übernimmt später die Wände.

Ein dritter bevorzugt ein anderes System für Wasserleitungen.

Ein vierter möchte das Dach anders bauen.

Jede einzelne Entscheidung kann sinnvoll sein.

Jeder Architekt kann sehr gut in seinem Fach sein.

Das Problem entsteht woanders:

> **Alle arbeiten am selben Haus, aber vielleicht nicht nach denselben Regeln.**

Mit der Zeit kann das Gebäude seine innere Einheit verlieren.

In der Softwareentwicklung nennen wir so etwas oft **Drift**.

Einfach erklärt bedeutet das:

> Das Projekt bewegt sich langsam weg von seinen ursprünglichen Regeln und Entscheidungen.

## Bei KI kann etwas Ähnliches passieren

Auch KI-Modelle arbeiten nicht alle gleich.

Ein Modell bevorzugt vielleicht eine bestimmte Architektur.

Ein anderes schreibt Code anders.

Ein anderes strukturiert Tests anders.

Ein weiteres schlägt andere Bibliotheken oder Muster vor.

Das bedeutet nicht, dass eines dieser Modelle schlecht ist.

Das eigentliche Problem lautet:

> **Woher weiß das neue Modell, welche Regeln für dieses Projekt bereits gelten?**

Wenn diese Regeln nur im bisherigen Chat oder im „Gedächtnis“ des alten Modells stecken, entsteht ein Risiko.

Das neue Modell beginnt möglicherweise mit einer eigenen Interpretation.

Und genau dann kann Drift entstehen.

## Das KI-Modell sollte nicht die Quelle der Wahrheit sein

Hier hilft ein wichtiger technischer Begriff:

**Source of Truth** – auf Deutsch etwa: **verbindliche Quelle der Wahrheit**.

Das ist die Stelle, an der die gültigen Regeln eines Projekts festgehalten werden.

Zum Beispiel:

* Welche Architektur gilt?
* Welche Komponenten dürfen welche Aufgaben übernehmen?
* Welche Tests sind erforderlich?
* Welche Sicherheitsregeln müssen eingehalten werden?
* Welche Entscheidungen wurden bereits getroffen?
* Was darf nicht verändert werden?

Diese Informationen sollten nicht nur in einem Gespräch mit einem KI-Modell existieren.

Sie sollten im Projekt selbst dokumentiert sein.

Dann kann auch ein neues Modell sie lesen.

## Einfaches Beispiel

Stellen wir uns vor, ein Projekt hat diese Regel:

> **Der Orchestrator koordiniert nur den Ablauf. Er übernimmt nicht die Fachlogik anderer Komponenten.**

Das erste KI-Modell kennt diese Regel.

Später übernimmt ein anderes Modell.

Wenn die Regel nur im alten Chat stand, kennt das neue Modell sie vielleicht nicht.

Es könnte dann eine Funktion direkt in den Orchestrator einbauen.

Der Code funktioniert vielleicht sogar.

Aber die Architektur beginnt sich zu verändern.

Wenn die Regel dagegen in einer verbindlichen Projektdokumentation steht, kann das neue Modell sie prüfen und berücksichtigen.

Dann gilt:

```
NEUES KI-MODELL
↓
LIEST DIESELBEN PROJEKTREGELN
↓
ARBEITET MIT DENSELBEN GRENZEN
↓
ERGEBNIS KANN GEGEN DIESELBEN REGELN GEPRÜFT WERDEN
```

Das ist deutlich stabiler.

## Der wichtige Unterschied

Hier liegt die zentrale Erkenntnis:

> **Ein gleiches KI-Modell sorgt nicht automatisch für ein konsistentes Projekt.**

Und umgekehrt:

> **Ein Projekt kann mit verschiedenen KI-Modellen konsistent bleiben, wenn seine Regeln außerhalb des Modells festgehalten sind.**

Der technische Gedanke dahinter ist:

```
KI-MODELL
!=
SOURCE OF TRUTH
```

Das Modell ist ein Teilnehmer am Entwicklungsprozess.

Die Projektregeln sollten aber unabhängig vom Modell bestehen.

## Was bedeutet das für die Praxis?

Wer mit KI Software entwickelt, sollte sich nicht nur fragen:

> Welches Modell ist am besten?

Eine wichtigere Frage ist:

> **Kann jedes Modell erkennen, nach welchen Regeln dieses Projekt gebaut werden muss?**

Dafür braucht ein Projekt zum Beispiel:

* dokumentierte Architekturentscheidungen,
* klare Zuständigkeiten,
* definierte Schnittstellen,
* nachvollziehbar Anforderungen,
* Testregeln,
* Governance-Regeln,
* eine klare Quelle für verbindliche Entscheidungen.

Dann wird ein Modellwechsel weniger gefährlich.

Nicht weil alle Modelle gleich arbeiten.

Sondern weil das Projekt ihnen Grenzen vorgibt.

## Was wir aus echten Projekten lernen können

In realen Softwareprojekten sehen wir immer wieder, wie wichtig stabile Regeln und klare Verantwortlichkeiten sind.

Ein System kann so gebaut werden, dass unterschiedliche Anbieter oder KI-Dienste genutzt werden können, ohne dass die grundlegenden Projektregeln jedes Mal neu erfunden werden müssen.

Dafür müssen technische Verträge, Zuständigkeiten und Entscheidungsregeln außerhalb des einzelnen KI-Modells liegen.

Wichtig ist dabei aber auch die Beleggrenze:

> Wir können daraus nicht automatisch behaupten, dass jeder Modellwechsel zu Architektur-Drift führt.

Dafür müsste ein konkreter Modellwechsel mit einem nachgewiesenen Drift-Fall dokumentiert sein.

Was wir sicher sagen können:

> **Je stärker die Regeln eines Projekts außerhalb des KI-Modells verankert sind, desto weniger hängt die Kontinuität des Projekts von einem einzelnen Modell ab.**

## Die wichtigste Erkenntnis

Vielleicht wird die Zukunft der KI-gestützten Softwareentwicklung nicht davon bestimmt, welches Modell gerade das beste ist.

Vielleicht wird sie stärker davon bestimmt, ob ein Projekt auch dann stabil bleibt, wenn morgen ein anderes Modell weiterarbeitet.

> **Das KI-Modell kann wechseln.**
>
> **Die Regeln des Projekts sollten bleiben.**
