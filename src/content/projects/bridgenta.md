---
title: "BridGenta"
subtitle: "IT-Rekonstruktion & Governance"
description: "AI-gestützte Plattform in privater Entwicklung. Die öffentliche Portfolio-Seite zeigt nur den technischen Entwicklungsansatz, nicht das unveröffentlichte Produkt."
sidebar:
  category: "Private Beta / IT-Rekonstruktion"
  status: "Private Beta"
  timeline: "März 2026"
  role: "System Architect & AI Workflow Designer"
  technologies: "Lovable (AI Builder), Produktarchitektur, AI-assisted Development"
  devStack:
    - TypeScript
    - Astro
    - Node.js
    - Static Analysis
    - GitHub Actions
    - Privacy-First Architecture
  aiBuilders:
    - Lovable
    - Claude
    - ChatGPT
    - Antigravity
  notice: "BridGenta befindet sich aktuell in einer kontrollierten privaten Entwicklungs- und Testphase. Die Produktfunktionen und Benutzeroberflächen werden erst nach Abschluss der ausgewählten Testphase öffentlich vorgestellt. Diese Portfolio-Seite beschreibt ausschließlich die technische Arbeitsweise, die Lernziele und den Entwicklungsansatz."
---

## Executive Summary
BridGenta ist ein experimentelles Softwareprojekt zur praktischen Evaluierung moderner KI-gestützter Entwicklungswerkzeuge (AI Builder). In einer Ära, in der Code-Generatoren Benutzeroberflächen in Sekundenschnelle erstellen können, besteht die eigentliche ingenieurstechnische Herausforderung nicht mehr im Schreiben von Zeilen, sondern in der Strukturierung, Validierung und sicheren Integration dieses Codes in professionelle Umgebungen.

Das Projekt wurde ins Leben gerufen, um Entwicklern und IT-Entscheidern eine Blaupause für die kontrollierte Rekonstruktion veralteter oder schlecht dokumentierter Legacy-Systeme an die Hand zu geben. Durch die Kombination von KI-Generatoren mit strengen Git-Workflows und automatisierten Qualitätsschranken demonstriert BridGenta, wie sich Entwicklungsgeschwindigkeit signifikant steigern lässt, ohne die architektonische Kontrolle oder Datensicherheit zu kompromittieren.

---

## Why This Project Exists
Die rasante Entwicklung von KI-gestützten Code-Generatoren (AI Builder) verändert die Softwareentwicklung grundlegend. Während Benutzeroberflächen und einfache Logiken heute in Sekundenschnelle generiert werden können, stehen Entwicklungsteams vor einer neuen Herausforderung: Wie lässt sich dieser unstrukturierte, oft unvollständige Code sicher in bestehende, geschäftskritische Systeme integrieren?

Klassische IT-Modernisierungs- und Rekonstruktionsprojekte scheitern häufig an mangelnder Dokumentation der Altsysteme, hohen manuellen Migrationskosten und dem Risiko, unbemerkt Sicherheitslücken einzuführen. Der Einsatz von KI kann diese Prozesse massiv beschleunigen, benötigt jedoch ein strenges Rahmenwerk (Governance), um unkontrollierten Code-Zuwachs und Architekturabweichungen zu verhindern. BridGenta wurde als praktischer Prüfstand entwickelt, um zu zeigen, wie menschliche Softwarearchitekten und generative KI-Modelle in einem kontrollierten, qualitätsgesicherten Workflow zusammenarbeiten können.

### Engineering Insight
Künstliche Intelligenz beschleunigt die Code-Erstellung, ersetzt jedoch nicht die architektonische Kontrolle. Ein erfolgreicher Rekonstruktionsprozess erfordert klar definierte Handoff-Grenzen und manuelle Freigabeketten.

---

## Context
Im Zentrum moderner Softwareabteilungen stehen oft historisch gewachsene Web-Applikationen (Legacy-Systeme). Diese zeichnen sich typischerweise durch fehlende Testabdeckungen, veraltete Bibliotheken und eine schleichende architektonische Fragmentierung (Architecture Drift) aus. Da das ursprüngliche Entwicklungsteam meist nicht mehr verfügbar ist, fehlt jegliches implizites Wissen über die Geschäftslogik.

Der Versuch, diese Systeme manuell neu aufzubauen, birgt enorme Risiken für den laufenden Betrieb. Gleichzeitig bietet die Evolution von Sprachmodellen die Möglichkeit, Altsysteme automatisiert zu analysieren, Code-Muster zu erkennen und in moderne Softwarearchitekturen zu übersetzen. Ohne strukturierte Prozesse führt dieser KI-gestützte Ansatz jedoch schnell zu instabilen Code-Umgebungen, da generative Modelle ohne Kontext dazu neigen, willkürliche Architekturentscheidungen zu treffen.

### Engineering Insight
Altsysteme können nicht durch rein generative Code-Erstellung modernisiert werden. Der Erfolg hängt von einer detaillierten Analyse und der präzisen Abgrenzung von Funktionsblöcken ab, bevor die erste Codezeile generiert wird.

---

## Problem
Die manuelle Modernisierung von Altsystemen ist fehleranfällig und zeitintensiv, während der unregulierte Einsatz von KI-Generatoren zu übermäßigem Code-Zuwachs (Code Bloat), verdeckten Sicherheitslücken und einer Abweichung von etablierten Design-Systemen führt. Es fehlt ein deterministischer Prozess, der die Geschwindigkeit von KI-Buildern nutzt, ohne die Kontrolle über die Softwarearchitektur, die Datensicherheit und die Datenhoheit zu verlieren.

---

## Constraints
Das Projekt unterliegt strengen technischen und betrieblichen Randbedingungen, die den Entwicklungsrahmen definieren:
* **Datensicherheit und Geheimnisschutz**: Generative KI-Modelle dürfen keinen Zugriff auf sensible Produktionsdaten, Kundendaten oder API-Schlüssel erhalten. Dies erfordert eine strikte physische und logische Datentrennung zwischen dem Frontend und den Datenverarbeitungs-Gateways.
* **Manuelle Qualitätssicherung (Gating)**: Da KI-Modelle fehlerhaften Code (Halluzinationen) generieren können, darf kein Code automatisiert in den Hauptzweig (`main`) einfließen. Jedes Inkrement erfordert ein menschliches Review.
* **Architekturkonsistenz**: Die Anwendung muss streng modular aufgebaut bleiben, um sicherzustellen, dass KI-Modifikationen lokal isoliert bleiben und keine unkontrollierten Nebeneffekte in anderen Systemteilen auslösen.

### Engineering Insight
Sicherheits- und Datenschutzgrenzen müssen hart im System verankert sein. Sie dürfen niemals von der Zuverlässigkeit eines generativen KI-Modells abhängen, sondern müssen durch die Infrastruktur und den Git-Workflow erzwungen werden.

---

## Reconstruction Strategy
Die BridGenta-Methodik teilt den Migrationsprozess in sechs aufeinanderfolgende Phasen auf, um eine kontrollierte IT-Rekonstruktion zu gewährleisten:

1. **Observe (Beobachten)**: Erfassung und Analyse der bestehenden Legacy-Applikation sowie der aktiven Datenströme im laufenden Betrieb.
2. **Understand (Verstehen)**: Rekonstruktion der Geschäftslogik und Dokumentation der Systemabhängigkeiten im Workspace.
3. **Map (Kartieren)**: Definition der exakten Schnittstellen (API-Spezifikation) und Abgrenzung der modernisierten Komponenten.
4. **Reconstruct (Rekonstruieren)**: Strukturierte Generierung des Codes durch KI-Assistenten auf Basis präziser, kontextreicher Prompts in isolierten Zweigen.
5. **Validate (Validieren)**: Überprüfung des generierten Codes durch automatisierte Qualitätsschranken (Build-Tests, Typprüfungen) und manuelles Code-Review.
6. **Handoff (Übergabe)**: Kontrollierte Integration der validierten Komponenten in das Haupt-Repository.

### Engineering Insight
Ein phasenbasierter Migrationsprozess minimiert das Projektrisiko, indem er die Analyse des Altsystems strikt von der Code-Generierung trennt und sicherstellt, dass die KI nur mit klaren Grenzspezifikationen arbeitet.

---

## Engineering Thinking

## Content Gap
Die strategische Begründung für das Zusammenspiel aus Automatisierung und manueller Kontrolle wird in einem zukünftigen Sprint ausgearbeitet.

---

## Architecture

**Architecture diagram planned for Sprint 38.**

## Content Gap
Das Architekturdiagramm und die Schnittstellenbeschreibung der Rekonstruktions-Plattform werden in einem zukünftigen Sprint erstellt.

---

## Engineering Decisions

## Content Gap
Die detaillierten Entscheidungsgründe für den Einsatz des AI-Builders und der Handoff-Grenzen werden in einem zukünftigen Sprint dokumentiert.

---

## Implementation
Um die Vorteile der KI-gestützten Entwicklung mit den Qualitätsansprüchen professioneller Softwareentwicklung zu vereinen, wurde ein mehrstufiger, qualitätsgesicherter Workflow etabliert:

### Workspace: Systemanalyse & Isolierung
Der Workspace bildet den operativen Einstiegspunkt jeder Rekonstruktion. Hier werden die veralteten Systemteile systematisch erfasst, Abhängigkeiten kartiert und Datenflüsse isoliert, bevor KI-generierter Code geschrieben wird. Dies stellt sicher, dass wir die bestehende Anwendungsstruktur vollständig durchdringen und die Schnittstellen präzise definieren.

*Key Takeaway*: Die visuelle Isolation im Workspace verhindert unstrukturierte Modifikationen und stellt sicher, dass wir nur exakt definierte Komponenten modernisieren.

### Workflow: Strukturierte Code-Generierung
Der Workflow leitet den eigentlichen Rekonstruktionsprozess. Über diesen transparenten Leitfaden werden Frontend-Generatoren (wie Lovable) gezielt instruiert. Der generierte Code wird über isolierte Handoff-Zweige (Handoff Branches) in die Pipeline eingespeist, wo er manuellen Reviews und automatischen Qualitätsschranken unterliegt.

*Key Takeaway*: Der strukturierte Handoff verhindert Scope Creep und stellt sicher, dass KI-Modelle keine unkontrollierten Designabweichungen einführen.

### Governance: Validierung & Qualitätskontrolle
Die Governance-Ebene fungiert als Gatekeeper der Plattform. Jede Codeänderung wird auf Lizenzkonformität, Sicherheitsrichtlinien und Datenschutzkompatibilität geprüft. Erst nach erfolgreicher automatisierter Build-Verifizierung und dem Review durch den Systemarchitekten erfolgt die Freigabe für die produktive Umgebung.

*Key Takeaway*: Ein strenges Regelwerk ist unerlässlich, um das Risiko unbeabsichtigter Datenabflüsse oder Sicherheitslücken bei KI-generiertem Code zu eliminieren.

---

## Public Artifacts

### Workspace-Interface
Zweck: Visuelle Erfassung der Systemtopologie und Analyse der Handoff-Grenzen vor Beginn der Code-Generierung.
<figure>
  <img src="/images/bga-portfolio/BG-PA02-Workspace.webp" alt="BridGenta Workspace Interface" loading="lazy" width="1600" height="900" />
</figure>

### Modernisierungs-Workflow
Zweck: Die Pipeline steuert die Handoff-Grenzen und leitet Code-Inkremente sicher in das Git-Repository.
<figure>
  <img src="/images/bga-portfolio/BG-PA03-Workflow.webp" alt="BridGenta Workflow Interface" loading="lazy" width="1600" height="900" />
</figure>

### Governance-Dashboard
Zweck: Die Kontrollschranke zur automatisierten Überprüfung von Code-Sicherheit und Architekturkonformität.
<figure>
  <img src="/images/bga-portfolio/BG-PA04-Governance.webp" alt="BridGenta Governance Interface" loading="lazy" width="1600" height="900" />
</figure>

---

## Results
Durch die konsequente Anwendung dieses structured Prozesses konnten messbare Fortschritte erzielt werden:

<div class="results-grid">
  <div class="result-card">
    <div class="result-card__icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon-svg"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <div class="result-card__content">
      <h3>Handoff-Stabilität</h3>
      <p>Erfolgreiche Vermeidung unkontrollierter Code-Überschreibungen durch klar definierte Git-Handoff-Zweige.</p>
    </div>
  </div>
  <div class="result-card">
    <div class="result-card__icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon-svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
    <div class="result-card__content">
      <h3>Sicherheit</h3>
      <p>Keine unbeabsichtigten Leaks von API-Schlüsseln oder Zugangsdaten durch strikte Filterregeln.</p>
    </div>
  </div>
  <div class="result-card">
    <div class="result-card__icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon-svg"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    </div>
    <div class="result-card__content">
      <h3>Wartbarkeit</h3>
      <p>Erhalt einer sauberen, modularen Code-Struktur durch manuelle Qualitätskontrollen nach der KI-Generierung.</p>
    </div>
  </div>
</div>

---

## Lessons Learned
Die Erprobung KI-gestützter Entwicklungswerkzeuge hat gezeigt, dass die Kombination aus hoher Code-Generierungsgeschwindigkeit und traditioneller Qualitätskontrolle der Schlüssel zu stabilen Anwendungen ist. KI-Assistenten können Routineaufgaben erheblich beschleunigen, bedürfen jedoch einer klaren Prozessführung und manueller Code-Reviews, um Architekturdrift und unkontrollierten Code-Zuwachs zu verhindern.

Die Etablierung restriktiver Git-Workflows und automatisierter CI-Prüfungen erwies sich als unverzichtbar, um die Codebasis sauber to halten und die Isolierung sensibler Anwendungsdaten zu gewährleisten.

Für zukünftige Iterationen sollte die Schnittstellendefinition (API-Grenzbereich) zwischen statischem Frontend und Backend noch weiter formalisiert werden. Ein klareres, vertragsbasiertes API-Design (Contract-First) würde es KI-Generatoren ermöglichen, Frontend-Komponenten noch zielgerichteter und mit weniger Korrekturschleifen zu erstellen.

---

## Next Evolution

## Content Gap
Die zukünftigen Ausbaustufen der Rekonstruktions-Pipeline werden in einem späteren Sprint erfasst.
