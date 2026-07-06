---
title: "Rooted Reality Gardens"
subtitle: "Regenerative Landschaftsgestaltung & Technical SEO"
description: "Website-Entwicklung und umfassende Suchmaschinen- und Answer-Engine-Optimierung für eine Agentur für regenerative Landschaftsgestaltung."
sidebar:
  category: "Unternehmens-Website / SEO"
  status: "Abgeschlossen"
  timeline: "Herbst 2025"
  role: "Technical Webmaster & Automation Engineer"
  technologies: "HTML5, CSS3, JavaScript, Technical SEO, AEO/GEO, JSON-LD Schema"
  devStack:
    - HTML5
    - CSS3
    - JavaScript
    - Python (Automation)
    - JSON-LD (Schema.org)
    - robots.txt & Sitemap
  aiBuilders:
    - Claude
    - Antigravity
---

## Executive Summary
Rooted Reality Gardens ist eine Webpräsenz für eine Agentur für regenerative Landschaftsgestaltung. Ziel des Projekts war der Aufbau einer ästhetischen, responsiven Website mit einer hochspezialisierten semantischen Struktur. Dadurch soll das Dienstleistungsangebot in der Nische der ökologischen Gartenplanung sowohl in klassischen Suchmaschinen als auch in modernen KI-gestützten Antwortdiensten optimal auffindbar und korrekt zitierbar sein.

---

## Context
Kleine Unternehmen in hochspezialisierten Nischen hängen stark von lokaler Auffindbarkeit ab. Regenerative Landschaftsgestaltung ist ein erklärungsbedürftiges Thema, das von herkömmlichen Suchmaschinen ohne semantische Daten oft falsch klassifiziert wird. Die Gründerin wollte ein anspruchsvolles Portfolio präsentieren, das ihre wissenschaftliche Methodik und Kompetenz unterstreicht. Die Website musste daher technisch so aufbereitet werden, dass sie sowohl Menschen als auch Crawlern präzise Informationen liefert.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Nischenunternehmen profitieren überproportional von semantischen Datenstrukturen, da diese thematische Missverständnisse bei automatisierten Crawlern verhindern.</p>
</div>

---

## Problem
In der Permakultur und regenerativen Landschaftsplanung reicht reine Keyword-Optimierung nicht aus. Suchmaschinen müssen verstehen, wie Dienstleistungen, Personen (die Gründerin) und wissenschaftliche Konzepte zusammenhängen. Zudem ist das manuelle Pflegen komplexer JSON-LD-Metadaten über mehrere statische Unterseiten hinweg fehleranfällig und zeitintensiv. Es fehlt ein automatisierter Workflow, der semantische Verknüpfungen fehlerfrei in alle HTML-Seiten injiziert.

---

## Constraints
Für das Projekt galten folgende Einschränkungen:
- **Statische Hosting-Infrastruktur**: Keine Datenbanken oder serverseitigen Skripte zur Laufzeit.
- **Minimale Admin-Ressourcen**: Der Pflegeaufwand für die Inhaberin musste extrem gering bleiben.
- **E-E-A-T-Konformität**: Strenge Ausrichtung an den Google-Qualitätsrichtlinien zur Etablierung von Fachkompetenz und Vertrauenswürdigkeit.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Der Einsatz von Build-Time-Generierungsskripten löst den Konflikt zwischen komplexen semantischen Graphen und wartungsarmen statischen Webseiten.</p>
</div>

---

## Engineering Thinking
Die technische Strategie basiert auf dem Prinzip der **automatisierten semantischen Strukturierung**. Statt Metadaten manuell in jede HTML-Datei einzupflegen, nutzen wir ein Build-Time-Skript. Dieses liest die logischen Bezüge aus einer zentralen Konfiguration und injiziert die validierten JSON-LD-Graphen direkt in den Header der jeweiligen Seiten. Dies sichert eine konsistente Datenstruktur über das gesamte Projekt hinweg.

---

## Architecture
Die Bereitstellungs-Pipeline trennt Quellcode und Metadaten-Generierung. Ein Python-Automatisierungsskript (`add_seo.py`) liest die strukturierten Definitionen von Dienstleistungen, Zertifizierungen und Personendaten ein. Es generiert den JSON-LD-Graphen für jede Unterseite und bettet diesen in die fertigen HTML-Dateien ein, bevor diese auf dem Webserver veröffentlicht werden.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Durch die Ausführung von Validierungs- und Injektionsskripten vor dem Deployment wird sichergestellt, dass ausschließlich syntaktisch valider Code veröffentlicht wird.</p>
</div>

---

## Engineering Decisions
Im Rahmen des Projekts wurden strategische Entscheidungen zur Code- und Metadatenstruktur getroffen:

<div class="decision-grid">
  <div class="decision-card">
    <h3 class="decision-card__title">Metadata Generation</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Manuelles Schreiben in HTML-Dateien</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Python-Skript zur automatisierten Injektion zur Vermeidung von Fehlern.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Entity Schema</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Flache, unverbundene Schema-Tags</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Vollständiger JSON-LD-Entity-Graph zur Verknüpfung von Person, Firma und Services.</p>
    </div>
  </div>
</div>

---

## Implementation
Das Python-Skript nutzt BeautifulSoup zum Parsen der HTML-Struktur und injiziert die generierten Metadaten. Die Schema-Graphen deklarieren Bezüge vom Typ `LocalBusiness`, verlinken die Gründerin als `Person` und verknüpfen Dienstleistungen über `Service`-Knoten mit wissenschaftlichen Permakultur-Entitäten. Zur Absicherung wurden die Konfigurationen der `robots.txt` und der Sitemap optimiert.

---

## Public Artifacts

<figure>
  <pre><code>
+-----------------------------------+
|      Rooted Reality Gardens       |
|                                   |
|   [ Ökologische Gartenplanung ]   |
|                                   |
|   * Bodenregeneration             |
|   * Heimische Pflanzen            |
|   * Permakultur-Systeme           |
|                                   |
|   [Mehr erfahren]     [Kontakt]   |
+-----------------------------------+
  </code></pre>
  <figcaption><strong>Artefakt 1: Schematische Layout-Skizze</strong> – Zweck: Veranschaulichung des übersichtlichen, mobiltauglichen Portfoliodesigns.</figcaption>
</figure>

<figure>

```mermaid
graph TD
    Organization[Unternehmen] -->|Gründerin| Person[Personen-Entität]
    Organization -->|Dienstleistung| Service[Regenerative Landschaftsgestaltung]
    Organization -->|Einsatzgebiet| Place[Geografischer Dienstleistungsbereich]
```

  <figcaption><strong>Artefakt 2: High-Level Ablaufdiagramm</strong> – Zweck: Logische Darstellung der verknüpften semantischen Entitäten im JSON-LD-Schema-Graphen.</figcaption>
</figure>

<div class="architecture-note">
  <strong>Artefakt 3: Ergebnis-Nachweis (SEO- &amp; Entity-Matrix)</strong> – Zweck: Vergleich der Suchmaschinen-Indizierung vor und nach der semantischen Optimierung.
</div>

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title">Entity-Zuordnung</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Vorher (Ohne Graph)</span>
        <p class="evidence-card__value">Nicht klassifizierte, unzusammenhängende Keyword-Fragmente.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Nachher (Mit Graph)</span>
        <p class="evidence-card__value">Eindeutig verknüpfte Relationen zwischen Organisation, Person und Services.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Suchmaschinen-Erfassung</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Vorher (Ohne Graph)</span>
        <p class="evidence-card__value">Reine Keyword-Indexierung ohne Rich Snippets.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Nachher (Mit Graph)</span>
        <p class="evidence-card__value">Aktivierte Rich Snippets und verbesserte Platzierung in lokalen Maps.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">KI-Suchmaschinen-Zitate</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Vorher (Ohne Graph)</span>
        <p class="evidence-card__value">Keine Erfassung oder unvollständige Nennungen in Antworten.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Nachher (Mit Graph)</span>
        <p class="evidence-card__value">Als primäre lokale Quelle in AEO/GEO-Suchanfragen zitiert.</p>
      </div>
    </div>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Verknüpfte Entitätsschemata erhöhen die Erkennungsrate von Kerninformationen durch automatisierte Suchmaschinen-Algorithmen nachweisbar.</p>
</div>

---

## Results
- **Crawler-Optimierung**: Fehlerfreie maschinelle Lesbarkeit durch vollständig validierte Entity-Verknüpfungen.
- **Zitierbarkeit**: Nachweisbare Zitate und korrekte Zuordnung des Dienstleistungsangebots in KI-gestützten Suchanfragen im Zielgebiet.
- **Wartbarkeit**: Reduzierung des manuellen Pflegeaufwands für Metadaten durch das automatisierte Injektionsskript.

---

## Lessons Learned
Dieses Projekt hat verdeutlicht, dass strukturierte Entity-Verknüpfungen (JSON-LD) die Brücke zwischen klassischer und KI-basierter Websuche schlagen. Durch die automatisierte Injektion valider Metadaten konnte die lokale Relevanz der Dienstleistungen in Antwortmaschinen nachweisbar gestärkt werden. Die Entwicklung wiederverwendbarer Injektionsskripte hat zudem gezeigt, wie sich administrative Webmaster-Aufgaben effizient automatisieren lassen, was den langfristigen Wartungsaufwand minimiert.

---

## Future Evolution
In einer zukünftigen Version soll das Python-Skript um eine Bildanalyse erweitert werden. Diese soll automatisch alt-Attribute und Bild-Metadaten (z. B. auf Basis geographischer Koordinaten der Gärten) generieren, um die Relevanz der Bildersuche für lokale Dienstleister weiter zu optimieren.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Lokalisierte Bildmetadaten stärken den geographischen Relevanzbezug statischer Webportale bei regionalen Suchanfragen.</p>
</div>
---
