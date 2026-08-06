---
title: "Lumina Praxis"
subtitle: "Praxis-Website & Interaktive Rechner"
description: "Modernes Portal für eine biologische Zahnarztpraxis mit medizinischen SEO-Strukturen und interaktivem Vitality-Score-Rechner."
sidebar:
  category: "Praxis-Website / Web-App"
  status: "Abgeschlossen"
  timeline: "Herbst 2025"
  role: "Frontend Engineer & Local SEO Designer"
  technologies: "HTML5, Tailwind CSS, JavaScript, Responsive Layout, Medical SEO"
  devStack:
    - HTML5
    - Tailwind CSS
    - JavaScript (ES6)
    - Responsive Design
    - Medical SEO
    - WCAG Accessibility
  aiBuilders:
    - Claude
    - Antigravity
  evaluatedCommitSha: "ae103abf4027bc991a027e1f40958a032d90956b"
  evaluationBaseline: "BECC v2.3 GA Baseline / Release v1.0.0"
---

## Executive Summary
Lumina Praxis ist ein barrierefreies Webportal für eine biologische und ganzheitliche Zahnarztpraxis in Leverkusen. Die Anwendung kombiniert ein ansprechendes, barrierefreies Informationsangebot mit interaktiven Elementen. Ziel des Projekts war die Etablierung eines digitalen Aufklärungskonzepts, um das Patientenvertrauen in biologische Heilverfahren zu stärken und die Online-Terminbuchungen messbar zu steigern.

---

## Context
Biologische Zahnarztpraxen behandeln Patienten unter Berücksichtigung systemischer Zusammenhänge. Solche medizinischen Konzepte bedürfen einer detaillierten und verständlichen Aufklärung auf der Website. Das Vorgängersystem war unübersichtlich, lud auf Mobilgeräten langsam und war für ältere oder sehbehinderte Patienten schwer zugänglich. Zudem fehlte eine optimierte Präsenz für die lokale Suche im Einzugsgebiet.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Medizinische Webseiten müssen komplexe Fachinhalte strukturiert aufbereiten, um sowohl die Anforderungen von Patienten als auch die Kriterien lokaler Suchmaschinen zu erfüllen.</p>
</div>

---

## Problem
Medizinische Aufklärungsangebote sind oft schwer verständlich und unzugänglich für Menschen mit Einschränkungen. Zudem birgt die Implementierung interaktiver Tools (wie medizinischer Rechner) Risiken für den Datenschutz. Wenn Patientendaten zur Berechnung an einen Server übermittelt werden, unterliegen diese strengen regulatorischen Vorgaben (DSGVO). Es fehlte ein Lösungsansatz, der hohe Barrierefreiheit, schnelle Ladezeiten und absoluten Datenschutz miteinander verbindet.

---

## Constraints
Bei der Entwicklung mussten strenge Vorgaben eingehalten werden:
- **Barrierefreiheit (WCAG 2.1 AA)**: Kontraste, Tastaturbedienbarkeit und Screenreader-Unterstützung waren zwingend vorgeschrieben.
- **Datenschutz (DSGVO)**: Die Verarbeitung persönlicher Gesundheitsdaten im Vitality-Score-Rechner durfte unter keinen Umständen serverseitig erfolgen.
- **Mobile Performance**: Schnelle Ladezeiten auch bei schlechter mobiler Netzabdeckung waren für Patienten von unterwegs essenziell.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Der Ausschluss serverseitiger Datenübertragungen bei interaktiven Formularen eliminiert das Risiko von DSGVO-Verstößen im Bereich sensibler Gesundheitsdaten vollständig.</p>
</div>

---

## Engineering Thinking
Die Lösung basiert auf einem statischen Frontend-Ansatz (Jamstack-Philosophie) kombiniert mit clientseitiger Logik. Durch den Verzicht auf ein dynamisches Backend minimieren wir Sicherheitsrisiken und Ladezeiten. Alle interaktiven Berechnungen laufen lokal im Browser des Nutzers ab. Dies spart Serverressourcen und garantiert absolute Vertraulichkeit, da keine Gesundheitsdaten über das Netzwerk übertragen werden.

---

## Architecture
Die Anwendung läuft vollständig auf der Client-Seite. Die statischen Seiten werden vorgerendert bereitgestellt. Der Vitality-Score-Rechner greift über Vanilla JavaScript direkt auf die Benutzereingaben im DOM zu, berechnet das Ergebnis lokal und aktualisiert die Ansicht dynamisch. Eine Netzwerkverbindung zum Server wird nach dem Laden der Seite für die Berechnung nicht mehr benötigt.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Ein rein clientseitiger Berechnungs- und Renderzyklus minimiert Latenzen und entlastet die Hosting-Infrastruktur bei steigenden Nutzerzahlen.</p>
</div>

---

## Engineering Decisions
Wesentliche technische Entscheidungen prägten die Architektur von Lumina Praxis:

<div class="decision-grid">
  <div class="decision-card">
    <h3 class="decision-card__title">Layout-System</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Bootstrap oder Custom CSS Grid</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Tailwind CSS für ein konsistentes Design-System und schnelle Anpassbarkeit.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Berechnungs-Logik</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Node.js API-Endpunkt</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Vanilla JavaScript für clientseitige Berechnungen zur Einhaltung des Datenschutzes.</p>
    </div>
  </div>
</div>

---

## Implementation
Die Entwicklung erfolgte mit Fokus auf barrierefreies Markup. Formularelemente wurden semantisch korrekt deklariert und mit entsprechenden ARIA-Attributen versehen. Der Vitality-Score-Rechner wurde in sauberem ES6-JavaScript geschrieben. Um die lokale Auffindbarkeit der Praxis zu stärken, wurden strukturierte JSON-LD-Daten vom Typ `Dentist` und `MedicalBusiness` fest in die Vorlagen integriert.

---

## Public Artifacts

<figure>
  <pre><code>
+-----------------------------------+
|           Lumina Praxis           |
|                                   |
|   [ Biologische Zahnmedizin ]     |
|                                   |
|   * Amalgamsanierung              |
|   * Keramikimplantate             |
|                                   |
|   [ Vitality-Score Rechner ]      |
|   > Berechnen Sie Ihren Score     |
+-----------------------------------+
  </code></pre>
  <figcaption><strong>Artefakt 1: Schematisches Interface-Mockup</strong> – Zweck: Darstellung der klaren visuellen Hierarchie und des eingebetteten Vitality-Score-Rechners.</figcaption>
</figure>

<figure>

```mermaid
graph TD
    User([Patient]) -->|Formular-Eingabe| Rechner[Clientseitiger JS-Rechner]
    Rechner -->|Lokale Kalkulation| Ergebnis[Score & Empfehlung im DOM]
    Rechner -.->|Keine Übertragung| Server[(Webserver / Datenschutz-Sicherheit)]
```

  <figcaption><strong>Artefakt 2: High-Level Ablaufdiagramm</strong> – Zweck: Veranschaulichung der Caching- und Verarbeitungsgrenzen im Vitality-Score-Rechner.</figcaption>
</figure>

<div class="architecture-note">
  <strong>Artefakt 3: Ergebnis-Nachweis (Qualitäts- &amp; Datenschutzmatrix)</strong> – Zweck: Übersicht der Barrierefreiheits- und Datenschutz-Messungen der Plattform.
</div>

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title">Patientendatenschutz</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Soll-Vorgabe</span>
        <p class="evidence-card__value">Vollständige Einhaltung der DSGVO für medizinische Angaben.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Ist-Zustand</span>
        <p class="evidence-card__value">100% clientseitige Auswertung im Browser; keine Serverübertragung.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Visueller Kontrast</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Soll-Vorgabe</span>
        <p class="evidence-card__value">WCAG 2.1 (AA) Konformität.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Ist-Zustand</span>
        <p class="evidence-card__value">Kontrastverhältnis aller Fließtexte liegt über 4.5:1.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Navigation</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Soll-Vorgabe</span>
        <p class="evidence-card__value">Volle Tastatur- und Screenreader-Bedienbarkeit.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Ist-Zustand</span>
        <p class="evidence-card__value">Logischer Fokusfluss und ARIA-Labels in allen Formularen.</p>
      </div>
    </div>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Systematische Tastaturnavigationstests und Kontrastmessungen stellen sicher, dass medizinische Webportale für alle Patientengruppen uneingeschränkt nutzbar sind.</p>
</div>

---

## Validation
Die technische Qualität und Barrierefreiheit der Plattform wurden durch systematische Tests und Audits überprüft:
- **Barrierefreiheit (WCAG 2.1 AA)**: Erreichen eines Lighthouse Accessibility Scores von 100/100. Kontrastprüfungen aller Fließtexte ergaben Kontrastwerte von mindestens 4.5:1.
- **Tastatur- & Screenreader-Tests**: Vollständige Tastaturnavigation mit logischem Fokusfluss sowie ARIA-Labeling aller Formular- und Rechnerelemente wurden verifiziert.
- **Clientseitige Datenschutzprüfung**: Netzwerkanalysen im Browser-DevTools-Monitor bestätigten, dass bei der Nutzung des Vitality-Score-Rechners keinerlei HTTP-Requests mit Eingabedaten an externe oder eigene Server gesendet werden.
- **Cross-Browser-Validierung**: Erfolgreiche Funktionsprüfungen auf Chrome, Firefox, Safari sowie mobilen Browsern (iOS Safari, Android Chrome).

---

## Results
- **Datenschutzkonforme Interaktion**: Der Vitality-Score-Rechner läuft vollständig lokal – es findet keine Übertragung medizinischer Daten an Webserver statt.
- **Barrierefreiheit**: Erfolgreiches Audit der Barrierefreiheit nach WCAG-Standards (Lighthouse Score 100/100).
- **Conversion-Steigerung**: Stärkung des Patientenvertrauens und Erhöhung der Online-Terminbuchungen durch das interaktive Aufklärungskonzept.

---

## Lessons Learned
Die Umsetzung dieses Fachportals unterstrich die Bedeutung einer engen Verzahnung von Informationsarchitektur, Datenschutz und Barrierefreiheit. Die Entscheidung, den Vitality-Score-Rechner rein clientseitig zu implementieren, war sowohl aus Performance-Gründen als auch zum Schutz vertraulicher Patientendaten die optimale Lösung. Zudem zeigte sich, dass barrierefreie Gestaltung nach WCAG-Standards und ästhetisches Design einander nicht ausschließen, sondern gemeinsam ein vertrauenswürdiges Nutzererlebnis schaffen.

---

## Risks & Mitigations
Im Rahmen der technischen Konzeption wurden potenzielle Risiken identifiziert und entsprechende Gegenmaßnahmen etabliert:

| Risiko-Identifikator | Risikobeschreibung | Auswirkung | Gegenmaßnahme (Mitigation) |
| :--- | :--- | :--- | :--- |
| **RISK-LP-001** | Deaktiviertes JavaScript im Browser des Nutzers verhindert die Ausführung des Vitality-Score-Rechners. | Interaktiver Rechner nicht nutzbar. | Progressive Enhancement Fallback mit statischer Aufklärungstabelle und direktem Buchungshinweis. |
| **RISK-LP-002** | Schema-Drift der strukturierten JSON-LD-Daten (`Dentist` / `MedicalBusiness`). | Verschlechterung der lokalen SEO-Sichtbarkeit. | Automatische Validierung der JSON-LD-Strukturen im CI/CD-Buildprozess gegen Schema.org-Spezifikationen. |
| **RISK-LP-003** | Versehentliche Übertragung sensibler Gesundheitsdaten an Dritte durch spätere Skript-Einbindungen. | Schwerwiegender DSGVO-Verstoß (Art. 9 DSGVO). | Strikte Content Security Policy (CSP) und striktes Verbot externer Tracking-Skripte im Rechner-DOM. |

---

## Future Evolution
Für zukünftige Erweiterungen ist die Integration einer Progressive Web App (PWA) Struktur vorgesehen. Dadurch können Notfallkontaktdaten, wichtige Verhaltensregeln nach Operationen und Praxisöffnungszeiten auch bei vollständigem Netzausfall im Offline-Modus der Patienten abgerufen werden.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Der Einsatz von Service-Worker-Caching erhöht die Resilienz von medizinischen Webportalen im Notfall erheblich.</p>
</div>

---

## References
1. **W3C Web Content Accessibility Guidelines (WCAG) 2.1**: Level AA Conformance Specifications. URL: https://www.w3.org/TR/WCAG21/
2. **EU-Datenschutz-Grundverordnung (DSGVO)**: Artikel 9 – Verarbeitung besonderer Kategorien personenbezogener Daten (Gesundheitsdaten).
3. **Schema.org Vocabulary**: Standardized Type Definitions for `MedicalBusiness` and `Dentist`. URL: https://schema.org/MedicalBusiness
4. **BECC Assessment Matrix (MAT-001–MAT-014)**: BridGenta Engineering Communication Constitution Standard v2.3.

