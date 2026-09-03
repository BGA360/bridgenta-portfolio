---
title: "Sitemap-Vollständigkeit und Entdeckbarkeit: Wenn der Build grün ist, aber die Route fehlt"
description: "Warum ein erfolgreicher Website-Build keine Garantie für Suchmaschinen-Sichtbarkeit ist und wie automatisierte Build-Artefakt-Prüfungen Entdeckbarkeitslücken verhindern."
category: "softwarearchitektur"
learningLevel: "intermediate"
publicationState: "draft"
---

Beim Veröffentlichen von Webseiten verlassen sich Entwicklungsteams meist auf automatisierte Build-Pipelines. Wenn das Build-Werkzeug ohne Fehler durchläuft und alle HTML-Seiten ordnungsgemäß erzeugt werden, gilt der Deployment-Prozess als erfolgreich.

In der Praxis entsteht dabei jedoch häufig eine trügerische Sicherheit. Ein fehlerfreier Seitenerzeugungs-Schritt garantiert noch nicht, dass neue Inhalte auch von Suchmaschinen wie Google gefunden und indiziert werden.

## Die unbemerkte Entdeckbarkeitslücke

Bei einer statisch erzeugten Website können neben den eigentlichen HTML-Seiten für Besucher weitere Veröffentlichungsartefakte entstehen. Bei BridGenta gehört dazu eine strukturierte XML-Sitemap (`sitemap.xml`) für Web-Crawler.

Während des Builds kann eine neue Unterseite erfolgreich als HTML-Datei gerendert werden; es kann jedoch vorkommen, dass eine Seite erzeugt wurde, aber im erwarteten Sitemap-Artefakt fehlt.

Für menschliche Nutzer, die den direkten Link aufrufen oder der Navigation folgen, erscheint die Seite voll funktionsfähig. Für Suchmaschinen fehlt damit jedoch ein wichtiger technischer Hinweis auf die neue Seite. Die Seite kann zwar über direkte Verlinkung gefunden werden, verliert jedoch ein wesentliches Signal für die automatische Entdeckung.

## Wo ein erfolgreicher Build nicht ausreicht

Ein Prüfprozess kann zum Beispiel nur kontrollieren, ob der Build erfolgreich beendet wurde.

```text
Build-Befehl ausführen -> Exit-Code 0 -> Freigabe zur Veröffentlichung
```

Diese Prüflogik übersieht inhaltliche Auslassungen. Der Compiler meldet keinen Fehler, weil das Erstellen der HTML-Datei technisch einwandfrei verlief. Die fehlende Registrierung in der Sitemap stellt für den Seitengenerator keinen Syntaxfehler dar. Wenn ein Prüfprozess nur den Build-Erfolg kontrolliert und die Sitemap nicht separat prüft, kann eine fehlende Sitemap-Inklusion unentdeckt bleiben.

Die zentrale Frage für die Qualitätssicherung lautet daher: Wie lässt sich automatisch sicherstellen, dass jede freigegebene Zielseite nicht nur existiert, sondern auch in allen relevanten Entdeckbarkeits-Verzeichnissen enthalten ist?

## Erzeugung vs. Entdeckbarkeit

Um dieses Problem dauerhaft zu lösen, muss die Qualitätssicherung die didaktische und technische Kette präzise unterscheiden:

```text
Route erzeugt ≠ in Sitemap enthalten ≠ von Suchmaschine entdeckt ≠ indexiert
```

Ein Eintrag in der `sitemap.xml` ist ein Signal für die Vollständigkeit des Release-Artefakts. Er ist jedoch noch kein Beweis für die spätere Indexierung durch Suchmaschinen.

Im BridGenta-Build wird daher gezielt geprüft, ob ein veröffentlichter Lernartikel in der erzeugten `dist/sitemap.xml` enthalten ist. Für die Qualitätssicherung unterscheidet das System zwei Ebenen:

1. **Routen-Existenz (Page Generation):** Die HTML-Datei liegt im Ausgabeverzeichnis (`dist/lernen/mein-artikel/index.html`).
2. **Artefakt-Entdeckbarkeit (Discovery Inclusion):** Die Route ist im Verzeichnis-Index (`dist/lernen/index.html`), im Themen-Index und in der Sitemap (`dist/sitemap.xml`) eingetragen.

Erst wenn beide Ebenen bestätigt sind, gilt ein Lernartikel als vollständig veröffentlichungsfähig.

## Automatische Prüfung im Release-Gate

Anstatt manuelle Stichproben nach jedem Deployment durchzuführen, wird die Verifikations-Pipeline um eine direkte Artefakt-Inspektion erweitert.

Nach dem Generieren der Website prüft ein automatisiertes Skript das Dateisystem der fertigen Build-Ausgabe (`dist/`):

1. **Existenz der Ausgabedatei:** Liegt die kompilierte HTML-Datei vor?
2. **Ausschluss von Entwürfen:** Befindet sich die Datei außerhalb des Vorschau-Pfads?
3. **Sitemap-Inklusion:** Enthält `dist/sitemap.xml` die exakte kanonische URL des Artikels?

Sollte der Eintrag in der `sitemap.xml` fehlen, erkennt der automatisierte Publish-Check diesen konkreten Fehlerfall und beendet die Prüfung mit einem Fehlerstatus (`DISCOVERY: FAIL`). Damit dieser Fehlerstatus eine Veröffentlichung technisch blockiert, muss der Check zusätzlich in einen verbindlichen Merge- oder Release-Prozess eingebunden sein.

## Übertragbare Erkenntnis für Softwareprojekte

Verifikations-Pipelines sollten niemals nur das Ergebnis von Erzeugungsschritten abfragen, sondern stets die tatsächlichen Endprodukte (Artefakte) untersuchen.

Das Prinzip ist auf andere statisch erzeugte Websites übertragbar, wenn Seiten-Erzeugung und Discovery-/Sitemap-Artefakte getrennt geprüft werden können. Die Einbindung automatisierter Artefakt-Checks in einen verbindlichen Release-Prozess reduziert das Risiko, dass unvollständige Veröffentlichungsstände online gehen. So wird aus einem rein technischen Build-Erfolg ein verlässlich überprüfter Veröffentlichungs-Zustand.
