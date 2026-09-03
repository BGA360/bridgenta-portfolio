---
title: "Entwurfs-Vorschau vs. Veröffentlichungsstand: Sichere Sichtprüfung ohne Frühveröffentlichung"
description: "Wie eine getrennte Vorschau-Route Entwürfe im echten Seitendesign sichtbar macht, ohne sie als öffentliche Lernartikel zu generieren."
category: "softwarearchitektur"
learningLevel: "intermediate"
publicationState: "draft"
---

Wer Artikel für eine Plattform verfasst, muss das fertige Layout vor der Veröffentlichung prüfen. Textformatierung, Bilder und Hinweis-Boxen sehen im Quellcode anders aus als auf dem Bildschirm.

Beim Aufbau der Veröffentlichungs-Pipeline für BridGenta stand das Entwicklungs-Team vor einer konkreten Architekturfrage: Wie lässt sich ein Entwurf lokal im echten Seitendesign der Anwendung prüfen, ohne dass er als regulärer öffentlicher Lernartikel generiert wird?

In diesem Artikel erklären wir am Praxis-Beispiel unserer Routing-Architektur, wie eine getrennte Vorschau-Route den Freigabeprozess absichert.

## Das Schauplatz-Problem im Redaktions-Workflow

Beim Erstellen neuer Lernartikel entsteht zunächst eine Entwurfs-Datei. Dieser Entwurf enthält das Attribut `publicationState: "draft"`.

Damit die Redaktion den Artikel im originalen Seitendesign bewerten kann, muss das System die Markdown-Datei in HTML umwandeln und anzeigen. Wird hierfür fälschlicherweise die öffentliche Haupt-Route verwendet, könnten unbeabsichtigte Auslieferungsrisiken entstehen:

* Öffentliche Übersichtsseiten könnten unfertige Artikel anzeigen.
* Automatische Sitemaps oder Feed-Generatoren könnten Entwürfe erfassen.
* Suchmaschinen-Crawler könnten unvollständige Texte verarbeiten.

Eine Sichtprüfung über die reguläre öffentliche Route würde somit die gewollte Freigabegrenze untergraben.

## Warum die Routentrennung entscheidend ist

In einer kontrollierten Software-Architektur gilt das Prinzip der klaren Zustandstrennung. Ein Artikel im Zustand „Entwurf“ unterscheidet sich grundlegend von einem Artikel im Zustand „Veröffentlicht“.

Wenn die Routengenerierung nicht strikt zwischen diesen beiden Zuständen unterscheidet, entstehen ungewollte Veröffentlichungswege. Leser sehen unfertige Texte, und Suchmaschinen verarbeiten gegebenenfalls Zwischenstände.

Welches Architekturmuster verhindert, dass Entwürfe bei der Vorschau im öffentlichen Veröffentlichungsweg landen?

## Die technische Lösung: Die getrennte Vorschau-Route

Die Lösung besteht in einer klaren Trennung der Routenauswahl im Build-Prozess.

In Commit `d45de9d` wurde eine isolierte Vorschau-Route für die lokale Entwicklung eingeführt (`src/pages/lernen/preview/[slug].astro`). Die Routengenerierung unterscheidet nun strikt:

* **Öffentliche Route (`/lernen/[slug]`):** Filtert die Content-Kollektion. Es werden ausschließlich Artikel generiert, deren Status `publicationState: "published"` lautet.
* **Isolierte Vorschau-Route (`/lernen/preview/[slug]`):** Steht im lokalen Entwicklungsmodus (`DEV`) zur Verfügung und wählt gezielt Artikel mit `publicationState: "draft"` aus. Die Seite nutzt den gemeinsamen Artikel-Renderer, setzt jedoch Schutz-Signale für Suchmaschinen (`noindex, nofollow`) und unterdrückt öffentliche URL-Metadaten.

Durch diese Aufteilung bleibt der öffentliche Veröffentlichungsweg frei von unfertigen Inhalten, während Entwürfe im lokalen Browser-Design geprüft werden können.

<div class="learning-evidence-boundary">

Die Implementierung in Commit d45de9d belegt die Trennung der Routenauswahl im Build-Prozess (DEV-Vorschau für Entwürfe, öffentliche Route für freigegebene Artikel). Sie beweist nicht automatisch den vollständigen Schutz vor allen externen Indexierungsversuchen oder Caching-Effekten.

</div>

## Übertragbare Praxis-Regel für Content-Systeme

Wenn Sie Vorschau-Funktionen in inhaltsbasierten Web-Anwendungen bauen, nutzen Sie dieses Drei-Stufen-Prinzip zur Absicherung:

1. **Öffentliche Filterung erzwingen:** Stellen Sie sicher, dass öffentliche Haupt-Routen ausschließlich freigegebene Inhalte generieren.
2. **Getrennte Vorschau-Pfade nutzen:** Richten Sie für interne Prüfungen einen separaten Pfad ein, der im Produktions-Build nicht generiert wird.
3. **Indexierungssignale setzen:** Nutzen Sie Meta-Tags wie `noindex, nofollow` und schließen Sie Vorschau-Pfade aus öffentlichen Sitemaps aus.

## Die zentrale Erkenntnis

> [!IMPORTANT]
> Vorschau-Zugriff ist keine Veröffentlichung. Entwürfe gehören zur Sichtprüfung in getrennte Vorschau-Pfade, niemals in den öffentlichen Veröffentlichungsweg.

## Begriffserklärung

**Content Collection (Inhalts-Kollektion)**
Eine strukturierte Sammlung von Inhaltsdateien, die vom Web-Framework typsicher eingelesen und gefiltert werden kann.

**Vorschau-Route (Preview Route)**
Ein spezieller Pfad im Web-System, der unfertige Inhalte im Entwicklungsmodus ausschließlich zum Zweck der internen Sichtprüfung und Qualitätskontrolle anzeigt.
