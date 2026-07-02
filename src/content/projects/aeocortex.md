---
title: "AEOcortex"
category: "AI Search / AEO / GEO"
status: "In Entwicklung"
technologies: "JavaScript, AEO, GEO, Entity SEO, AI Search APIs"
description: "Persönliches Entwicklungsprojekt zur praktischen Erprobung von AI Search, moderner Webentwicklung und KI-gestützter Softwareentwicklung."
---

## 1. Projektübersicht
AEOcortex is ein persönliches Entwicklungsprojekt zur praktischen Untersuchung und Erprobung von Suchmechanismen in KI-gestützten Systemen (Answer Engine Optimization und Generative Engine Optimization).

Ziel des Projekts ist es, Web-Inhalte systematisch auf Entity-Klarheit, strukturierte Daten und Lesbarkeit hin zu analysieren. Dadurch soll die Sichtbarkeit und korrekte Zitierbarkeit von Webinhalten in modernen KI-Suchmaschinen (wie Perplexity, ChatGPT Search und Google Gemini) bewertet und optimiert werden.

## 2. Die Herausforderung
Klassische SEO-Methoden basieren primär auf Keywords und Backlinks. KI-Modelle interpretieren Inhalte hingegen kontextuell und greifen auf strukturierte Wissensgraphen zurück. Die technische Herausforderung bestand darin, eine Analyse-Infrastruktur aufzubauen, um Antwortqualität (Eindeutigkeit für LLM-Parser), semantische Dichte (Vollständigkeit von Schema-Auszeichnungen) und Crawler-Optimierung (robots.txt, Sitemap) präzise bewerten zu können.

## 3. Meine Rolle & Beitrag
Ich bin der alleinige Initiator und Entwickler dieses Forschungsprojekts:
* **Entwicklung der Analyse-Logik**: Konzeption und Programmierung der modular aufgebauten JavaScript-Prüfmodule.
* **Architektur**: Aufbau der static-site-basierten Dokumentations- und Auswertungsoberfläche mittels Astro.
* **Modellierung**: Entwurf strukturierter JSON-LD-Vorlagen zur semantischen Verknüpfung komplexer Entity-Beziehungen.
* **Evaluation**: Praktische Erprobung und Validierung der Analyse-Ergebnisse an realen Web-Inhalten.

## 4. Technologie-Stack
* **Programmiersprache**: Modern JavaScript (Node.js für Parser-Skripte, ES6+ für UI-Interaktion).
* **Framework**: Astro (für die statische static-site Dokumentation).
* **Parser-Bibliotheken**: Cheerio (zur HTML-Struktur-Analyse).
* **Datenformate**: JSON-LD, Dublin Core RDF.

## 5. Ergebnisse
* **Entity-Prüfung**: Zuverlässige Erkennung unvollständiger oder fehlerhafter JSON-LD-Graphstrukturen.
* **Lesbarkeits-Indikator**: Funktionierende Heuristik zur Bewertung der Eindeutigkeit von Textpassagen für generative Sprachmodelle.
* **Prozess-Optimierung**: Erfolgreiche Beseitigung struktureller Crawling-Barrieren (wie fehlerhafte robots.txt-Direktiven) bei realen Testprojekten.

## 6. Projektdokumentation (Artefakte)

### Artefakt 1: Projekt-Visualisierung
*(Hinweis: Da sich das Tool in aktiver Entwicklung befindet, zeigt diese Skizze das konzeptionelle Berichts-Layout.)*

```
+-----------------------------------+
|             AEOcortex             |
|                                   |
|   [ URL-Analyse: bridgenta.de ]   |
|   > Entity-Score: 95%             |
|   > AEO-Auslesbarkeit: Hoch       |
|                                   |
|   Empfehlungen:                   |
|   * robots.txt Direktive korrigiert|
|   * Dublin-Core Tags hinzufügen   |
+-----------------------------------+
```

### Artefakt 2: High-Level Ablaufdiagramm
Das folgende Diagramm beschreibt den Datenfluss des Analyse- und Bewertungsprozesses von AEOcortex:

```mermaid
graph LR
    HTML[Webseiten-HTML] --> Parser[HTML-Parser]
    Parser --> SchemaCheck[Schema- & Entity-Prüfung]
    Parser --> TextCheck[Lesbarkeits-Kalkulation]
    SchemaCheck --> Report[Berichts-Generierung]
    TextCheck --> Report
```

### Artefakt 3: Ergebnis-Nachweis
Vergleich der Fehlererkennungsrate vor und nach dem Einsatz der AEOcortex-Module:

| Prüfbereich | Erkennung manuell | Erkennung mit AEOcortex-Skripten |
| :--- | :--- | :--- |
| JSON-LD Validierungsfehler | Sporadisch | 100% automatisiert |
| robots.txt Konflikte | Schwer auffindbar | Sofortige Warnmeldung |
| LLM-Crawler Barrieren | Unbekannt | Detaillierte Analyse der Auslesbarkeit |
