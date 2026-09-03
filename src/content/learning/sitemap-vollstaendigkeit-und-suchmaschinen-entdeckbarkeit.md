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

Moderne statische Seitengeneratoren erstellen beim Kompilieren zwei unterschiedliche Arten von Ausgabedateien: die eigentlichen HTML-Seiten für menschliche Besucher sowie strukturierte Metadaten-Dateien für Web-Crawler. Die wichtigste Metadaten-Datei ist die XML-Sitemap (`sitemap.xml`).

Während des Builds kann es vorkommen, dass eine neue Unterseite erfolgreich als HTML-Datei gerendert wird, ihr Eintrag in der `sitemap.xml` jedoch aufgrund von Filterregeln oder Konfigurationsfehlern fehlt.

Für menschliche Nutzer, die den direkten Link aufrufen oder der Navigation folgen, erscheint die Seite voll funktionsfähig. Für automatisierte Suchmaschinen-Indexierer hingegen bleibt der neue Inhalt unsichtbar.

## Wo ein erfolgreicher Build nicht ausreicht

Herkömmliche Prüfskripte in Continuous-Integration-Pipelines beschränken sich oft darauf, den Beendigungscode (Exit-Code) des Build-Befehls abzufragen.

```text
Build-Befehl ausführen -> Exit-Code 0 -> Freigabe zur Veröffentlichung
```

Diese Prüflogik übersieht inhaltliche Auslassungen. Der Compiler meldet keinen Fehler, weil das Erstellen der HTML-Datei technisch einwandfrei verlief. Die fehlende Registrierung in der Sitemap stellt für den Seitengenerator keinen Syntaxfehler dar.

Die zentrale Frage für die Qualitätssicherung lautet daher: Wie lässt sich automatisch sicherstellen, dass jede freigegebene Zielseite nicht nur existiert, sondern auch in allen relevanten Entdeckbarkeits-Verzeichnissen enthalten ist?

## Erzeugung vs. Entdeckbarkeit

Um dieses Problem dauerhaft zu lösen, muss die Qualitätssicherung zwischen zwei Ebenen unterscheiden:

1. **Routen-Existenz (Page Generation):** Die HTML-Datei liegt im Ausgabeverzeichnis (`dist/lernen/mein-artikel/index.html`).
2. **Artefakt-Entdeckbarkeit (Discovery Inclusion):** Die Route ist im Verzeichnis-Index (`dist/lernen/index.html`), im Themen-Index und in der Sitemap (`dist/sitemap.xml`) eingetragen.

Erst wenn beide Ebenen bestätigt sind, gilt ein Lernartikel als vollständig veröffentlichungsfähig.

## Automatische Prüfung im Release-Gate

Anstatt manuelle Stichproben nach jedem Deployment durchzuführen, wird die Verifikations-Pipeline um eine direkte Artefakt-Inspektion erweitert.

Nach dem Generieren der Website prüft ein automatisiertes Skript das Dateisystem der fertigen Build-Ausgabe (`dist/`):

1. **Existenz der Ausgabedatei:** Liegt die kompilierte HTML-Datei vor?
2. **Ausschluss von Entwürfen:** Befindet sich die Datei außerhalb des Vorschau-Pfads?
3. **Sitemap-Inklusion:** Enthält `dist/sitemap.xml` die exakte kanonische URL des Artikels?

Sollte der Eintrag in der `sitemap.xml` fehlen, bricht das Prüfskript mit einer klaren Fehlermeldung (`DISCOVERY: FAIL`) und einem Exit-Code ungleich null ab. Das Veröffentlichen wird blockiert, bevor unvollständige Staging-Zustände online gehen.

## Übertragbare Erkenntnis für Softwareprojekte

Verifikations-Pipelines sollten niemals nur das Ergebnis von Erzeugungsschritten abfragen, sondern stets die tatsächlichen Endprodukte (Artefakte) untersuchen.

Indem Entwickler automatisierte Abgleiche zwischen den generierten Seiten und den zugehörigen Index-Dateien etablieren, verhindern sie Entdeckbarkeitsfehler systematisch. So wird aus einem rein technischen Build-Erfolg ein verlässlich überprüfter Veröffentlichungs-Zustand.
