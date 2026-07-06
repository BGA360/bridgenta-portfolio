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
Die Plattform dient als praktischer Prüfstand für die reibungslose Zusammenarbeit zwischen menschlichen Softwarearchitekten und autonomen KI-Buildern (wie Lovable und Claude). Die Produktfunktionen des zugrundeliegenden Portals befinden sich derzeit in einer geschützten privaten Testphase. Diese Fallstudie konzentriert sich ausschließlich auf den zugrundeliegenden Entwicklungsansatz, die Prozess-Governance und die architektonischen Erkenntnisse.

---

## Context
Moderne Legacy-Systeme leiden häufig unter mangelhafter Dokumentation, veralteten Schnittstellen und einer schleichenden architektonischen Fragmentierung (Architecture Drift). Bei der Modernisierung dieser Systeme stehen Entwickler vor der Herausforderung, bestehende Geschäftslogik präzise zu rekonstruieren, ohne unbeabsichtigte Nebeneffekte einzuführen.

---

## Problem
Der unregulierte Einsatz von KI-Generatoren verschärft dieses Problem oft, da KI-Modelle ohne klaren Kontext zu übermäßigem Code-Zuwachs (Code Bloat) und willkürlichen Abweichungen vom Design-System neigen. Es besteht daher ein dringender Bedarf an deterministischen Engineering-Prozessen.

Die technische Herausforderung für BridGenta bestand darin, eine Handoff-Pipeline zu entwerfen, die die hohe Frontend-Generierungsgeschwindigkeit von KI-Modellen nutzt, während die Datenhoheit, das sichere API-Routing und die Einhaltung architektonischer Grenzen durch automatisierte Gateways und manuelle Freigaben streng kontrolliert bleiben.

---

## Constraints
* **Strikte Datentrennung**: Um sensible API-Schlüssel und Benutzerdaten vor der Erfassung durch KI-Modelle zu schützen, wird eine strikte Trennung erzwungen.
* **Branch-Protection & Code-Owners**: Das Repository erzwingt restriktive Branch-Protection-Regeln. Änderungen an kritischen Architekturkomponenten erfordern zwingend das Review und die Freigabe durch den Systemarchitekten.

---

## Reconstruction Strategy

## Content Gap
Die methodischen Phasen der IT-Rekonstruktion werden in einem zukünftigen Sprint dokumentiert.

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
Durch die konsequente Anwendung dieses strukturierten Prozesses konnten messbare Fortschritte erzielt werden:

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

Die Etablierung restriktiver Git-Workflows und automatisierter CI-Prüfungen erwies sich als unverzichtbar, um die Codebasis sauber zu halten und die Isolierung sensibler Anwendungsdaten zu gewährleisten.

Für zukünftige Iterationen sollte die Schnittstellendefinition (API-Grenzbereich) zwischen statischem Frontend und Backend noch weiter formalisiert werden. Ein klareres, vertragsbasiertes API-Design (Contract-First) würde es KI-Generatoren ermöglichen, Frontend-Komponenten noch zielgerichteter und mit weniger Korrekturschleifen zu erstellen.

---

## Next Evolution

## Content Gap
Die zukünftigen Ausbaustufen der Rekonstruktions-Pipeline werden in einem späteren Sprint erfasst.
