---
title: "Entwurfs-Vorschau vs. Veröffentlichungsstand: Sichere Sichtprüfung ohne Frühveröffentlichung"
description: "Wie eine isolierte Vorschau-Route im Frontend-Routing verhindert, dass unveröffentlichte Entwürfe vorzeitig im öffentlichen Such-Index landen."
category: "softwarearchitektur"
learningLevel: "intermediate"
publicationState: "draft"
---

Wer Artikel für eine Plattform verfasst, muss das fertige Layout vor der Veröffentlichung prüfen. Textformatierung, Bilder und Hinweis-Boxen sehen im Quellcode anders aus als auf dem Bildschirm.

Beim Aufbau der Veröffentlichungs-Pipeline für BridGenta stand das Entwicklungs-Team vor einer konkreten Architekturfrage: Wie lässt sich ein Entwurf auf der echten Webseite gründlich prüfen, ohne dass er vorzeitig in öffentlichen Übersichten erscheint oder von Suchmaschinen erfasst wird?

In diesem Artikel erklären wir am Praxis-Beispiel unserer Routing-Architektur, warum die Verwechslung von Vorschau und Veröffentlichung gefährlich ist und wie eine isolierte Vorschau-Route dieses Problem löst.

## Das Schauplatz-Problem im Redaktions-Workflow

Beim Erstellen neuer Lernartikel entsteht zunächst eine Entwurfs-Datei. Dieser Entwurf enthält das Attribut `publicationState: "draft"`. 

Damit die Redaktion den Artikel im originalen Seitendesign bewerten kann, muss das System die Markdown-Datei in HTML umwandeln und anzeigen. Wird hierfür die normale Haupt-Route der Webseite (wie `/lernen/[slug]`) verwendet, entsteht ein ernsthaftes Veröffentlichungs-Risiko:

* Öffentliche Übersichtsseiten greifen auf dieselbe Routen-Logik zu.
* Automatische Generatoren für Sitemaps oder RSS-Feeds erfassen den Artikel gegebenenfalls ungefragt.
* Suchmaschinen-Crawler können den unveröffentlichten Entwurf indizieren, bevor der Inhalt überhaupt freigegeben wurde.

Eine Sichtprüfung über den normalen Hauptpfad hebelt somit die Freigabegrenze des Systems aus.

## Warum die Routentrennung entscheidend ist

In einer kontrollierten Software-Architektur gilt das Prinzip der klaren Zustandstrennung. Ein Artikel im Zustand „Entwurf“ unterscheidet sich grundlegend von einem Artikel im Zustand „Veröffentlicht“.

Wenn das Routing nicht strikt zwischen diesen beiden Zuständen unterscheidet, entstehen ungewollte Veröffentlichungen (Draft Leaks). Leser sehen unfertige Texte, und Suchmaschinen speichern fehlerhafte Zwischenstände.

Welches Architekturmuster verhindert, dass Entwürfe bei der Vorschau in den öffentlichen Produktions-Index geraten?

## Die technische Lösung: Die isolierte Vorschau-Route

Die Lösung besteht in einer vollständigen Entkopplung des Vorschau-Routings vom öffentlichen Hauptpfad.

In Commit `d45de9d` wurde eine eigene Vorschau-Route im System verankert (`src/pages/lernen/preview/[slug].astro`). Die Architektur trennt die Pfade nun strikt nach Aufgaben:

* **Öffentliche Route (`/lernen/[slug]`):** Filtert die Content-Kollektion streng. Nur Artikel mit dem Status `publicationState: "published"` werden gerendert. Alle Entwürfe werden automatisch ignoriert.
* **Isolierte Vorschau-Route (`/lernen/preview/[slug]`):** Lädt den gewünschten Entwurf gezielt für die interne Redaktionsansicht. Diese Route ist von der automatischen Sitemap ausgeschlossen und mit Schutz-Signalen für Crawler versehen.

Durch diese Aufteilung bleibt der öffentliche Bereich der Webseite garantiert frei von unfertigen Inhalten, während das Redaktions-Team jeden Entwurf im echten Browser-Design prüfen kann.

<div class="learning-evidence-boundary">

Die Einführung von src/pages/lernen/preview/[slug].astro in Commit d45de9d belegt die technische Trennung der Vorschau-Route vom öffentlichen Index. Sie garantiert nicht automatisch die Freiheit von Cache-Problemen im Webbrowser, sichert aber das serverseitige Routing ab.

</div>

## Übertragbare Praxis-Regel für Content-Systeme

Wenn Sie Vorschau-Funktionen in inhaltsbasierten Web-Anwendungen bauen, nutzen Sie dieses Drei-Stufen-Prinzip zur Absicherung:

1. **Öffentliche Filterung erzwingen:** Stellen Sie sicher, dass öffentliche Haupt-Routen und Listen-Seiten ausschließlich freigegebene Inhalte abfragen.
2. **Dedizierte Vorschau-Endpunkte nutzen:** Richten Sie für interne Reviews einen separaten Pfad ein (z. B. `/preview/`), der nicht über öffentliche Links erreichbar ist.
3. **Indexierung unterbinden:** Schließen Sie Vorschau-Routen explizit aus Sitemaps aus und versehen Sie die HTML-Köpfe dieser Pfade mit entsprechenden Schutz-Tags.

## Die zentrale Erkenntnis

> [!IMPORTANT]
> Vorschau-Zugriff ist keine Veröffentlichung. Entwürfe gehören zur Sichtprüfung in isolierte Vorschau-Pfade, niemals in den öffentlichen Produktions-Index.

## Begriffserklärung

**Content Collection (Inhalts-Kollektion)**
Eine strukturierte Sammlung von Inhaltsdateien (z. B. Markdown-Dateien), die vom Web-Framework typsicher eingelesen und gefiltert werden kann.

**Staging und Preview-Route**
Eine spezielle Adresse im Web-System, die Inhalte ausschließlich zum Zweck der internen Sichtprüfung und Qualitätskontrolle anzeigt.
