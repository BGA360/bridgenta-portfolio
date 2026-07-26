---
title: "AEOcortex"
subtitle: "AI-Suchmaschinen / AEO / GEO"
description: "Persönliches Entwicklungsprojekt zur praktischen Erprobung von AI Search, moderner Webentwicklung und KI-gestützter Softwareentwicklung."
sidebar:
  category: "AI-Suchmaschinen / AEO / GEO"
  status: "In Entwicklung"
  timeline: "Januar 2026"
  role: "AI Search Researcher & Developer"
  technologies: "JavaScript, AEO, GEO, Entity SEO, AI Search APIs"
  devStack:
    - JavaScript
    - Node.js
    - Cheerio
    - JSON-LD
    - Schema.org
  aiBuilders:
    - Claude
    - ChatGPT Search
    - Antigravity
---

## Kurzfassung
AEOcortex ist ein persönliches Entwicklungsprojekt zur praktischen Untersuchung von Suchmechanismen in KI-gestützten Systemen. Der Fokus liegt auf der Answer Engine Optimization (AEO) und der Generative Engine Optimization (GEO). Ziel des Projekts ist es, Web-Inhalte systematisch hinsichtlich der eindeutigen Deklaration von Entitäten, strukturierter Daten und menschlicher Lesbarkeit zu analysieren. Dadurch soll die technische Auslesbarkeit von Webinhalten für KI-Suchmaschinen auf Basis definierter Kriterien im Rahmen einer Testumgebung analysiert und bewertet werden.

---

## Ausgangssituation
Klassische Suchmaschinen bewerten Webseiten vorwiegend nach Kriterien wie Keywords und Backlinks. KI-gestützte Such- und Antwortsysteme können Webinhalte kontextuell auswerten und dabei unter anderem strukturierte Daten, Entitäten und semantische Beziehungen berücksichtigen. Neben der Textgestaltung gewinnt die Deklaration von Beziehungen zwischen Entitäten im HTML-Markup an Bedeutung, um Inhalte für automatisierte technische Analyseprozesse klarer zu strukturieren.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Der Übergang von klassischen Suchmaschinen zu generativen Antwortdiensten legt nahe, den Fokus von Keywords hin zur Deklaration von Beziehungen zwischen Entitäten im Code zu erweitern.</p>
</div>

---

## Problemstellung
Bei Webseiten ohne strukturierte Metadaten treten im HTML-Markup häufig technische Unklarheiten auf. Ohne eine strukturierte Validierung bleiben syntaktische Fehler in der JSON-LD-Struktur, Abweichungen in den robots.txt-Pfadvorgaben oder unvollständige Beziehungen zwischen Entitäten oft unentdeckt. Im Rahmen dieses Projekts wird eine automatisierte Testumgebung erprobt, um solche Fehler und Abweichungen systematisch zu identifizieren.

---

## Rahmenbedingungen
Das Projekt unterliegt logischen und technischen Rahmenbedingungen, die den Analyseumfang eingrenzen:
- **Ressourcen und Ratenbegrenzung**: Da die Analyse-Skripte externe Validierungs-APIs aufrufen, müssen Ratenbegrenzungen (Rate Limits) berücksichtigt werden, um Blockaden zu vermeiden.
- **Datenintegrität**: Die analysierten Daten dürfen keine sensiblen oder persönlichen Informationen enthalten (Privacy-by-Design).
- **Statische Präsentation**: Die Dokumentation der Analyseergebnisse muss ohne Datenbankabfragen auf einem statischen Webserver lauffähig sein.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Automatisierte Analyse-Tools müssen externe API-Grenzen respektieren und lokale Caching-Mechanismen nutzen, um eine zuverlässige und blockierungsfreie Validierung zu gewährleisten.</p>
</div>

---

## Technische Überlegungen
Das Kernkonzept von AEOcortex beruht auf der Arbeitshypothese, dass strukturierte Datenmodelle und klar segmentierte Texte die maschinelle Verarbeitung erleichtern können. Während die tatsächlichen Such- und Zitiermechanismen externer KI-Plattformen hochgradig variabel und nicht-deterministisch sind, zielt unser interner Analyseansatz darauf ab, definierte Struktur-, Metadaten- und Lesbarkeitssignale für automatisierte Analyseprozesse zu bewerten. Hierzu werden Webseiten lokal auf bekannte Datenformate und Metadaten-Standards (JSON-LD, Dublin Core) sowie dokumentierte technische Kriterien und öffentlich deklarierte Crawler-Regeln hin geprüft.

---

## Architektur
Die Plattform ist modular aufgebaut, um Analyse-Logik und Präsentationsschicht strikt voneinander zu trennen. Ein Node.js-basierter Parser lädt das HTML der Zielwebseite, extrahiert die semantischen Metadaten und führt strukturierte Validierungsprüfungen durch. Die Ergebnisse werden in einer lokalen JSON-Struktur abgelegt, welche anschließend von der Präsentationsschicht eingelesen wird, um das statische Berichts-Dashboard zu generieren.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Die Trennung von Parser-Logik (Node.js/Cheerio) und Präsentationsschicht ermöglicht eine performante, statische Berichtsgenerierung ohne serverseitigen Overhead.</p>
</div>

---

## Technische Entscheidungen
Im Rahmen des Projekts wurden wesentliche Designentscheidungen getroffen, um die Effizienz der Analyse zu sichern:

<div class="decision-grid">
  <div class="decision-card">
    <h3 class="decision-card__title">Parser-Wahl</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Puppeteer (vollständiges Browser-Rendering)</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Cheerio für schnelles, ressourcenschonendes HTML-Parsing im Speicher.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Metadaten-Standard</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Microdata direkt im HTML-Markup</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">JSON-LD für eine saubere Trennung von Layout und semantischen Datenstrukturen.</p>
    </div>
  </div>
</div>

---

## Umsetzung
Die Implementierung erfolgte in Form von modularen Skripten. Das Parser-Modul nutzt Cheerio zur Extraktion der Metadaten und prüft diese gegen die offiziellen Spezifikationen. Ein weiteres Modul bewertet die menschliche Lesbarkeit von Texten mithilfe des Flesch-Reading-Ease-Index, um neben den strukturellen Metadaten auch statistische Merkmale der menschlichen Textlesbarkeit als zusätzliche Heuristik für die Analyse zu erfassen.

---

## Öffentliche Projekteinblicke

<figure>
  <img src="/images/aeocortex-portfolio/AEO-PA01-Entity-Graph.webp" alt="AEOcortex Entity-Graph zur Visualisierung semantischer Entitäten" loading="lazy" width="1890" height="966" />
  <figcaption><strong>Artefakt 1: Entity-Graph und Beziehungsanalyse</strong> – Zweck: Visuelle Darstellung der erfassten Entitäten und ihrer Beziehungen sowie erkannte Themen, Beziehungen und kontextuelle Verbindungen innerhalb eines analysierten Projekts.</figcaption>
</figure>

<figure>
  <img src="/images/aeocortex-portfolio/AEO-PA02-Question-Portfolio.webp" alt="AEOcortex Fragenportfolio und Beobachtungsstruktur der Suchanfragen" loading="lazy" width="1593" height="900" />
  <figcaption><strong>Artefakt 2: Fragenportfolio und Beobachtungsstruktur</strong> – Zweck: Darstellung des Fragenmanagements, der Quellen-Zuordnung und der protokollierten Antwort-Beobachtungen.<br /><small>*Hinweis zur Metrik: Der im Interface visualisierte „Entity-Score“ (z. B. 95 %) ist eine rein interne Metrik der lokalen Testumgebung zur Bewertung der Metadatendichte. Er stellt keine Erfolgs- oder Platzierungswahrscheinlichkeit in externen KI-Suchmaschinen dar.</small></figcaption>
</figure>

<figure>
  <img src="/images/aeocortex-portfolio/AEO-PA03-Measurement-Workflow.webp" alt="AEOcortex Mess- und Analyseworkflow von der Projekteinrichtung bis zur Ergebnisbereitstellung" loading="lazy" width="1672" height="941" />
  <figcaption><strong>Artefakt 3: Mess- und Analyseworkflow</strong> – Zweck: Veranschaulichung des Datenflusses von der Projekteinrichtung über kontrollierte Messungen und interne Bewertung bis zur Ergebnisbereitstellung.</figcaption>
</figure>

<div class="architecture-note">
  <strong>Vergleichsmatrix (Fähigkeits-Nachweis)</strong> – Zweck: Gegenüberstellung manueller Stichproben und der in der Testumgebung automatisierten Prüfschritte.
</div>

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title">JSON-LD-Validierung</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Manuelle Prüfung</span>
        <p class="evidence-card__value">Punktuelle Überprüfung einzelner Seiten über externe Online-Validierungswerkzeuge.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Mit AEOcortex</span>
        <p class="evidence-card__value">Automatisierter syntaktischer Abgleich extrahierter JSON-LD-Strukturen im Testlauf gegen Schema-Spezifikationen.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">robots.txt-Konflikte</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Manuelle Prüfung</span>
        <p class="evidence-card__value">Stichprobenartige Sichtprüfung von robots.txt-Pfadregeln.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Mit AEOcortex</span>
        <p class="evidence-card__value">Automatisierte Prüfung von URL-Pfadvorgaben gegen blockierte Pfadmuster in der robots.txt.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Lokale Regelprüfung</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Manuelle Prüfung</span>
        <p class="evidence-card__value">Stichprobenartiger Abgleich von Webseitenelementen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Mit AEOcortex</span>
        <p class="evidence-card__value">Extraktion hinterlegter Metadaten und Berechnung des Flesch-Reading-Ease-Index im Parser.*</p>
      </div>
    </div>
  </div>
</div>

<p class="footnote">*Hinweis zur Lesbarkeit: Die Bewertung basiert auf dem Flesch-Reading-Ease-Index. Ein Wert über 60 wird in der internen Testumgebung als Hinweis auf allgemein gut lesbare Texte eingeordnet. Dieser Wert ist ein rein statistisches Maß für menschliche Lesbarkeit und misst nicht die tatsächliche maschinelle Verarbeitung, Indizierung, Zitierung oder Sichtbarkeit in externen Systemen.</p>

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Visualisierungen komplexer Beziehungen zwischen Entitäten und strukturierte Datenvergleiche erleichtern die Fehleridentifikation in der Metadatenstruktur erheblich.</p>
</div>

---

## Validierung

Die Validierung der Metadaten-Extraktion und der Textauswertung im AEOcortex-Parser erfolgt auf Basis vordefinierter Testverfahren:
- **Automatisierte Schema-Prüfung**: JSON-LD-Strukturen werden gegen die offiziellen Spezifikationen abgeglichen, um Syntaxfehler und fehlende Relationen zu erkennen.
- **Lesbarkeits-Kalkulation**: Textinhalte werden über standardisierte Metriken (wie den Flesch-Reading-Ease-Index) auf definierte Struktur-, Metadaten- und Lesbarkeitssignale für automatisierte Analyseprozesse hin untersucht.

### Testparameter und Umgebung
* **Mock-Dokumente**: Für Tests werden präparierte HTML-Dokumente mit typischen Markup-Fehlern (z. B. unvollständige Entity-Verschachtelungen) verwendet, um die Erkennungsgenauigkeit des Parsers zu validieren.
* **Rate-Limit-Checks**: Zugriffssimulationen auf Zielwebseiten erfolgen mit restriktiven Ratenbegrenzungen gemäß interner Konfigurationsvorgaben, um die Stabilität bei Webserver-Restriktionen im Testlauf zu untersuchen.

---

## Ergebnisse
- Entity-Prüfung: Erkennung unvollständiger oder fehlerhafter JSON-LD-Graphstrukturen im Testlauf des Build-Prozesses.
- Lesbarkeits-Indikator: Erfassung statistischer Merkmale der menschlichen Textlesbarkeit (Flesch-Reading-Ease) im lokalen Testlauf.
- Strukturierte Validierung: Automatisierte Überprüfung von robots.txt-Pfaden und Vorhandensein definierter Metadaten-Felder im Testlauf.

---

## Erkenntnisse aus der Entwicklung
Dieses Forschungsprojekt hat das Verständnis für die Funktionsweise generativer Suchmaschinen und semantischer Parsing-Modelle vertieft. Die Analyse von Beziehungen zwischen Entitäten hat gezeigt, dass präzise deklarierte und validierte Metadaten die technische Prüfung strukturierter Zusammenhänge unterstützen. Zudem wurde verdeutlicht, wie wichtig automatisierte Prüfverfahren im Entwicklungsprozess sind. Die manuelle Überprüfung strukturierter Daten ist aufwendig; automatisierte Validierungsskripte können die Wiederholbarkeit der Tests sichern und eine konsistente Einhaltung definierter Kriterien unterstützen.

---

## Risiken

Die Bewertung erfolgt auf Basis einer vereinfachten zweidimensionalen Risikomatrix. Die Schadensklasse (Schadensausmaß bei Eintritt: Hoch/Mittel/Gering) und die Eintrittswahrscheinlichkeit (Eintrittschance innerhalb eines Betriebsjahres: Hoch/Mittel/Gering) bestimmen gemeinsam die Priorisierung der Gegenmaßnahmen.

Die automatisierte Analyse von Webinhalten für KI-Suchmaschinen birgt technische und operative Risiken, die durch gezielte Absicherungsmaßnahmen (Mitigations) minimiert werden:

| Risiko-ID | Risikobeschreibung | Schadensklasse | Eintrittswahrscheinlichkeit | Gegenmaßnahme (Mitigation) |
| :--- | :--- | :--- | :--- | :--- |
| **RISK-AC-001** | IP-Blockaden durch Webserver der Zielseiten bei zu hoher Anfragedichte. | **Mittel** | **Mittel** | Einhaltung strenger Ratenbegrenzungen (Rate Limiting) und lokales Caching abgerufener Seiten. |
| **RISK-AC-002** | Schema-Drift durch Aktualisierungen der Standarddefinitionen auf Schema.org. | **Mittel** | **Gering** | Kontinuierliche Überwachung der Validierungs-Fehlerraten im Build-Prozess und regelmäßige Spec-Updates. |

---

## Nächste Entwicklungsschritte
Für die nächste Phase des Projekts ist die Integration der Analyse-Skripte direkt in CI/CD-Pipelines (z. B. GitHub Actions) geplant. Dadurch sollen Schema- und Lesbarkeitsprüfungen bei jedem Commit automatisch ausgeführt werden. Weiterhin soll ein interaktives Dashboard zur Live-Validierung beliebiger URLs aufgebaut werden, um die Benutzerfreundlichkeit des Tools zu erhöhen.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Die Integration semantischer Prüfungen in den CI/CD-Prozess soll dazu beitragen, das Einschleusen fehlerhafter Metadaten oder syntaktischer Fehler in robots.txt-Dateien in die Produktionsumgebung zu minimieren.</p>
</div>

---

## Quellen und Referenzen

* **Cheerio HTML Parser**: [Cheerio API-Referenz](https://cheerio.js.org/) — Kernbibliothek für schnelles HTML-Parsing im Speicher.
* **Schema.org Spezifikationen**: [Schema.org-Standards](https://schema.org/) — Referenz für strukturierte Metadaten.
* **BECC-Bewertungsrichtlinien**: Interne Referenz auf die [BECC-Matrix](https://github.com/BGA360/bridgenta-portfolio/blob/main/docs/engineering-communication/stewardship/BECC-ASSESSMENT-MATRIX.md) für Konformitätsbewertungen im Repository.
