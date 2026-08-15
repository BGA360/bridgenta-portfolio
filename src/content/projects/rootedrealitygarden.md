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

## Kurzfassung
Rooted Reality Gardens ist eine Webpräsenz für eine Agentur für regenerative Landschaftsgestaltung. Ziel des Projekts war der Aufbau einer ästhetischen, responsiven Website mit einer spezialisierten semantischen Struktur zur Unterstützung der strukturierten Auffindbarkeit und Zitierbarkeit des Dienstleistungsangebots in Suchmaschinen und KI-gestützten Antwortdiensten.

---

## Ausgangssituation
Kleine Unternehmen in hochspezialisierten Nischen hängen stark von lokaler Auffindbarkeit ab. Regenerative Landschaftsgestaltung ist ein erklärungsbedürftiges Thema, das von herkömmlichen Suchmaschinen ohne semantische Daten oft falsch klassifiziert wird. Die Gründerin wollte ein anspruchsvolles Portfolio präsentieren, das ihre wissenschaftliche Methodik und Kompetenz unterstreicht. Die Website musste daher technisch so aufbereitet werden, dass sie sowohl Menschen als auch Crawlern präzise Informationen liefert.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Nischenunternehmen können von strukturierten semantischen Daten profitieren, da diese thematische Missverständnisse bei automatisierten Crawlern minimieren helfen.</p>
</div>

---

## Problemstellung
In der Permakultur und regenerativen Landschaftsplanung reicht reine Keyword-Optimierung nicht aus. Suchmaschinen müssen verstehen, wie Dienstleistungen, Personen (die Gründerin) und wissenschaftliche Konzepte zusammenhängen. Zudem ist das manuelle Pflegen komplexer JSON-LD-Metadaten über mehrere statische Unterseiten hinweg fehleranfällig und zeitintensiv. Ziel des Projekts war daher der Entwurf eines automatisierten Workflows, um semantische Verknüpfungen konsistent in alle HTML-Seiten zu injizieren.

---

## Rahmenbedingungen
Für das Projekt galten folgende Einschränkungen:
- **Statische Hosting-Infrastruktur**: Keine Datenbanken oder serverseitigen Skripte zur Laufzeit.
- **Minimale Admin-Ressourcen**: Der Pflegeaufwand für die Inhaberin musste gering bleiben.
- **E-E-A-T-Ausrichtung**: Ausrichtung an E-E-A-T-orientierten Qualitätsprinzipien zur Unterstützung der Fachkompetenz und Vertrauenswürdigkeit.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Der Einsatz von Build-Time-Skripten unterstützt die Bereitstellung komplexer semantischer Graphen auf wartungsarmen statischen Webseiten.</p>
</div>

---

## Technische Überlegungen
Die technische Strategie basiert auf dem Prinzip der **automatisierten semantischen Strukturierung**. Statt Metadaten manuell in jede HTML-Datei einzupflegen, wurde im ursprünglichen Projektkontext ein Build-Time-Skript entworfen. Dieses liest die logischen Bezüge aus einer zentralen Konfiguration und injiziert die generierten JSON-LD-Graphen direkt in den Header der jeweiligen Seiten (Hinweis: Das Skript gehörte zur dokumentierten Entwicklungs- und Bereitstellungspipeline des ursprünglichen Projekts und ist nicht Bestandteil dieses Portfoliorepositories). Dies unterstützt eine konsistente Datenstruktur über die verschiedenen Seiten hinweg.

---

## Architektur
Nach der dokumentierten Projektbeschreibung wurde ein Python-Automatisierungsskript (`add_seo.py`) für die Metadaten-Generierung eingesetzt. Es sollte strukturierte Definitionen von Dienstleistungen, Zertifizierungen und Personendaten verarbeiten, daraus JSON-LD-Graphen für die jeweiligen Unterseiten erzeugen und diese vor der Veröffentlichung in die HTML-Dateien integrieren.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Die Ausführung von Generierungs- und Prüfskripten vor dem Deployment unterstützt die Einhaltung standardisierter Datenstrukturen im veröffentlichten Code.</p>
</div>

---

## Technische Entscheidungen
Im Rahmen des Projekts wurden strategische Entscheidungen zur Code- und Metadatenstruktur getroffen:

<div class="decision-grid">
  <div class="decision-card">
    <h3 class="decision-card__title">Metadaten-Generierung</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Manuelles Schreiben in HTML-Dateien</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Python-Skript zur automatisierten Injektion zur Reduzierung manueller Übertragungsfehler.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Entitäten-Schema</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Flache, unverbundene Schema-Tags</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Integrierter JSON-LD-Entity-Graph zur Verknüpfung von Person, Firma und Services.</p>
    </div>
  </div>
</div>

---

## Umsetzung
Die dokumentierte Umsetzung beschreibt ein Python-Skript mit BeautifulSoup zum Parsen der HTML-Struktur und zur Metadaten-Injektion. Demnach deklarierten die Schema-Graphen Bezüge vom Typ `LocalBusiness`, verlinkten die Gründerin als `Person` und verknüpften Dienstleistungen über `Service`-Knoten mit wissenschaftlichen Permakultur-Entitäten. Zur Absicherung wurden die Konfigurationen der `robots.txt` und der Sitemap optimiert.

---

## Öffentliche Projekteinblicke

### Artefakt 1: Layout-Struktur

<figure>
  <img src="/images/rooted-reality-portfolio/rooted-reality-artifact-01-layout-structure.webp" alt="Dokumentationsrekonstruktion der Rooted-Reality-Gardens-Seitenstruktur mit Leistungsbereichen und semantischer JSON-LD-Einbindung." loading="lazy" width="1672" height="941" />
  <figcaption><strong>Artefakt 1: Schematische Layout-Struktur &amp; semantischer Aufbau</strong> – Typ: DOCUMENTATION RECONSTRUCTION. Zweck: Veranschaulichung des beabsichtigten, mobiltauglichen Portfoliodesigns der ursprünglichen Website. Dieses Schema dient der strukturellen Veranschaulichung und stellt keinen direkten Screenshot der Live-Umgebung dar.</figcaption>
</figure>

### Artefakt 2: Semantische Entitäten-Struktur

<figure>
  <img src="/images/rooted-reality-portfolio/rooted-reality-artifact-02-entity-architecture.webp" alt="Architekturdiagramm der semantischen Rooted-Reality-Gardens-Entitäten mit LocalBusiness, Person, Service und Place sowie ihren Beziehungen." loading="lazy" width="1672" height="941" />
  <figcaption><strong>Artefakt 2: Semantische Entitäten-Architektur (JSON-LD)</strong> – Typ: ARCHITECTURE DIAGRAM. Zweck: Logische Darstellung der verknüpften semantischen Entitäten im JSON-LD-Schema-Graphen des ursprünglichen Projekts.</figcaption>
</figure>

### Artefakt 3: Konzeptioneller Metadaten-Vergleich

<figure>
  <img src="/images/rooted-reality-portfolio/rooted-reality-artifact-03-metadata-comparison.webp" alt="Konzeptioneller Vergleich der semantischen Metadatenstruktur ohne Entity-Graph und mit explizit modellierten Entitätsbeziehungen." loading="lazy" width="1672" height="941" />
  <figcaption><strong>Artefakt 3: Konzeptioneller Metadaten-Vergleich</strong> – Typ: DOCUMENTATION RECONSTRUCTION / CONCEPTUAL COMPARISON. Zweck: Gegenüberstellung der angestrebten Suchmaschinen-Indizierung mit und ohne semantische Datenstruktur. Diese Tabelle veranschaulicht das konzeptionelle Ziel und dokumentiert keine Echtzeit-Messdaten des Repositories.</figcaption>
</figure>

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Verknüpfte Entitätsschemata können die Erkennungsrate von Kerninformationen durch automatisierte Suchmaschinen-Algorithmen unterstützen.</p>
</div>

---

## Ergebnisse

### Dokumentierte Umsetzung
- **Schema.org-Metadaten**: Die Projektbeschreibung dokumentiert die Einbettung strukturierter JSON-LD-Daten zur maschinellen Verarbeitung semantischer Zusammenhänge.

### Technische Eigenschaften
- **Entitäten-Verknüpfung**: Modellierung von Relationen zwischen den Entitäten LocalBusiness, Person, Service und Place.

### Projektziele
- **Zitierbarkeit**: Erhöhung der strukturellen Präzision zur Unterstützung der Zuordnung bei KI-basierten Suchanfragen (AEO/GEO).
- **Wartungseffizienz**: Entwurf automatisierter Injektionsskripte zur Reduzierung des Pflegeaufwands bei statischen Seiten.

### Nachweisgrenze
- **Systemumgebung**: Die tatsächliche Ausführung des Python-Injektionsskripts sowie die daraus resultierenden Live-Suchmaschinen-Ergebnisse beziehen sich auf die ursprüngliche Produktionsumgebung des Kundenprojekts. Sie sind nicht Bestandteil dieses statischen Portfoliorepositories und werden im Rahmen dieses Codebestands nicht live verifiziert.

---

## Erkenntnisse aus der Entwicklung
Dieses Projekt hat verdeutlicht, dass strukturierte Entity-Verknüpfungen (JSON-LD) die Brücke zwischen klassischer und KI-basierter Websuche schlagen können. Durch die geplante automatisierte Injektion strukturierter Metadaten wird die semantische Zuordnungsbasis von Dienstleistungen gestärkt. Die Entwicklung wiederverwendbarer Skripte zeigt zudem Wege auf, wie sich administrative Webmaster-Aufgaben effizienter gestalten lassen, um den langfristigen manuellen Wartungsaufwand zu reduzieren.

---

## Nächste Entwicklungsschritte
In einer zukünftigen Version soll das Python-Skript um eine Bildanalyse erweitert werden. Diese soll automatisch alt-Attribute und Bild-Metadaten (z. B. auf Basis geographischer Koordinaten der Gärten) generieren, um die Relevanz der Bildersuche für lokale Dienstleister weiter zu optimieren.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Lokalisierte Bildmetadaten können den geographischen Relevanzbezug statischer Webportale bei regionalen Suchanfragen unterstützen.</p>
</div>

---

## Quellen und Referenzen
- **Schema.org**: [LocalBusiness Schema-Spezifikation](https://schema.org/LocalBusiness) – Referenz für die Modellierung lokaler Unternehmensdaten.
- **W3C JSON-LD Spezifikation**: [JSON-LD 1.1 Standard](https://www.w3.org/TR/json-ld11/) – Standard für die Serialisierung verknüpfter Daten.
- **Google Search Central**: [Ausrichtung an Qualitätsprinzipien (E-E-A-T)](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) – Richtlinien zur Bereitstellung hilfreicher, vertrauenswürdiger Inhalte.
