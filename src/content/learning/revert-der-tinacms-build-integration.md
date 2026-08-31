---
title: "Der Revert der TinaCMS Build-Integration: Grenzen lokaler Sicherheitsbereiche"
description: "Warum wir eine Cloud-Schnittstelle aus dem Build-Prozess entfernt haben, um das lokale Offline-First-Prinzip des CMS-Adminbereichs zu wahren."
category: "softwarearchitektur"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-08-30"
provenanceRef: "EV-BG-003"
---

Eine neue Build-Integration wird eingeführt.

Mit ihr sollte ein konkretes Problem gelöst werden: der 404-Fehler der TinaCMS-Adminseite.

Kurz danach wird die Änderung wieder zurückgenommen.

Warum entfernt man eine Integration, obwohl sie ein konkretes Problem beheben sollte?

In Commit `4f83e40` wurde der normale Website-Build geändert.

Das Build-Skript in `package.json` rief nun zusätzlich `node tooling/build_tina.cjs` auf.

Dieses Skript stieß beim Build-Prozess eine Generierung der TinaCMS-Adminseite an.

Dabei konnte das Skript entweder im Cloud-Modus laufen oder im lokalen Modus.

Der lokale Modus übersprang externe Cloud-Prüfungen über `npx tinacms build --local --skip-cloud-checks`.

Mit diesem Schritt sollte der 404-Fehler beim Aufruf der Adminseite behoben werden.

Doch das Projekt hatte eine klare architektonische Vorgabe: Der CMS-Admin-Workflow sollte strikt lokal und offline-orientiert bleiben.

Die neue Build-Integration kollidierte jedoch mit dieser Vorgabe.

Der normale Website-Build war dadurch nicht mehr unabhängig vom CMS-Dienst.

So entstand ein direkter Konflikt zwischen der Integration und einer festgelegten Grenze im System-Design.

Deshalb wurde die Build-Integration in Commit `50a8c85` wieder rückgängig gemacht.

Die Datei `tooling/build_tina.cjs` wurde gelöscht.

Das Build-Skript kehrte zu `astro build` zurück.

Für den lokalen Entwicklungsworkflow bleibt TinaCMS über `tinacms dev` weiterhin im Einsatz.

Der normale, statische Website-Build läuft jedoch wieder komplett eigenständig.

Diese Entscheidung und das Zurücksetzen der Code-Änderung bezeichnen wir als **Revert**.

<div class="learning-evidence-boundary">

*   **Problem:** Der normale Build wurde um einen TinaCMS-Build-Schritt erweitert.
*   **Konflikt:** Das kollidierte mit der Vorgabe, den CMS-Admin-Workflow strikt lokal/offline-only zu halten.
*   **Lösung:** Die Build-Integration wurde zurückgenommen. Der normale Website-Build kehrte zu `astro build` zurück.

</div>

## Offline-First in der Praxis

Ein festgelegter Teil eines Systems soll auch ohne dauerhafte Internetverbindung nutzbar bleiben.

Dieses Prinzip bezeichnen wir als **Offline-First**.

Welche Bereiche eines Systems das genau betrifft, hängt von der jeweiligen Architektur ab.

In unserem Projekt betrifft diese Grenze den CMS-Admin-Workflow.

Der Admin-Workflow läuft lokal auf dem Rechner der Entwickler.

Der normale, statische Build der Webseite muss dagegen völlig unabhängig von externen CMS-Diensten ablaufen.

## Architekturgrenzen und ihre Bedeutung

In Systemen gelten für unterschiedliche Bereiche oft auch unterschiedliche Regeln.

Eine Trennlinie zwischen solchen Bereichen ist eine **Architekturgrenze**.

Sie trennt die Verantwortlichkeiten im System klar voneinander.

In diesem Projekt verläuft eine solche Grenze zwischen dem lokalen TinaCMS-Admin-Workflow und dem normalen Website-Build.

Die Build-Integration versuchte, diese Grenze aufzuheben.

Das führte zu dem architektonischen Konflikt.

Manchmal gibt es auch Grenzen, die den Schutz von Daten betreffen.

Eine **Sicherheitsgrenze** trennt Bereiche eines Systems, zwischen denen unterschiedliche Vertrauens-, Zugriffs- oder Schutzregeln gelten.

## Lektionen für die Praxis

Wenn wir externe Dienste in unsere Projekte einbinden, beachten wir diese Leitlinien:

*   **Architekturvorzug:** Architekturvorgaben können wichtiger sein als zusätzlicher Komfort. Die Unabhängigkeit des Systems hat Vorrang vor automatischen Abläufen.
*   **Konsequenter Rückbau:** Eine bereits implementierte Integration kann ungeeignet sein, wenn sie eine festgelegte Projektgrenze verletzt. Ein Revert ist hier eine legitime technische Entscheidung.
*   **Klare Trennung:** Entwicklungswerkzeuge und statische Build-Schritte sollten getrennt bleiben, wenn die Architektur diese Trennung ausdrücklich verlangt. So bleibt das System wartbar und stabil.

Diese Lektionen helfen vor allem in Projekten mit Offline-First-Architektur.

Sie gelten für statische Build-Workflows und Systeme, die eine rein lokale Admin-Verwaltung erfordern.

Sie betreffen auch Umgebungen, in denen wir die Abhängigkeiten beim Erstellen der Webseite bewusst begrenzen wollen.

## Begriffe einfach erklärt

**Revert**

Ein Revert macht eine frühere Code-Änderung rückgängig. Dadurch wird ein früherer Zustand wiederhergestellt oder eine konkrete Änderung entfernt.

**Offline-First**

Offline-First bedeutet, dass ein festgelegter Teil eines Systems auch ohne dauerhafte Internetverbindung nutzbar bleiben soll. Welche Teile das betrifft, hängt von der jeweiligen Architektur ab.

**Architekturgrenze**

Eine Architekturgrenze trennt Bereiche oder Verantwortlichkeiten eines Systems, für die unterschiedliche technische Regeln gelten.

## Die wichtigste Erkenntnis

> Eine bereits implementierte Funktion kann trotzdem ungeeignet sein, wenn sie eine festgelegte Architekturgrenze verletzt. In diesem Projekt hatte die lokale Offline-Grenze Vorrang vor der zusätzlichen Build-Integration.
