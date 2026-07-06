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

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Künstliche Intelligenz beschleunigt die Code-Erstellung, ersetzt jedoch nicht die architektonische Kontrolle. Ein erfolgreicher Rekonstruktionsprozess erfordert klar definierte Handoff-Grenzen und manuelle Freigabeketten.</p>
</div>

---

## Context
Im Zentrum moderner Softwareabteilungen stehen oft historisch gewachsene Web-Applikationen (Legacy-Systeme). Diese zeichnen sich typischerweise durch fehlende Testabdeckungen, veraltete Bibliotheken und eine schleichende architektonischen Fragmentierung (Architecture Drift) aus. Da das ursprüngliche Entwicklungsteam meist nicht mehr verfügbar ist, fehlt jegliches implizites Wissen über die Geschäftslogik.

Der Versuch, diese Systeme manuell neu aufzubauen, birgt enorme Risiken für den laufenden Betrieb. Gleichzeitig bietet die Evolution von Sprachmodellen die Möglichkeit, Altsysteme automatisiert zu analysieren, Code-Muster zu erkennen und in moderne Softwarearchitekturen zu übersetzen. Ohne strukturierte Prozesse führt dieser KI-gestützte Ansatz jedoch schnell zu instabilen Code-Umgebungen, da generative Modelle ohne Kontext dazu neigen, willkürliche Architekturentscheidungen zu treffen.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Altsysteme können nicht durch rein generative Code-Erstellung modernisiert werden. Der Erfolg hängt von einer detaillierten Analyse und der präzisen Abgrenzung von Funktionsblöcken ab, bevor die erste Codezeile generiert wird.</p>
</div>

---

## Problem
Die manuelle Modernisierung von Altsystemen ist fehleranfällig und zeitintensiv, während der unregulierte Einsatz von KI-Generatoren zu übermäßigem Code-Zuwachs (Code Bloat), verdeckten Sicherheitslücken und einer Abweichung von etablierten Design-Systemen führt. Es fehlt ein deterministischer Prozess, der die Geschwindigkeit von KI-Buildern nutzt, ohne die Kontrolle über die Softwarearchitektur, die Datensicherheit und die Datenhoheit zu verlieren.

---

## Constraints
Das Projekt unterliegt strengen technischen und betrieblichen Randbedingungen, die den Entwicklungsrahmen definieren:

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title">Datensicherheit &amp; Geheimnisschutz</h4>
    <p class="evidence-card__value">Generative KI-Modelle dürfen keinen Zugriff auf sensible Produktionsdaten, Kundendaten oder API-Schlüssel erhalten. Dies erfordert eine strikte physische und logische Datentrennung zwischen dem Frontend und den Datenverarbeitungs-Gateways.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Manuelle Qualitätssicherung (Gating)</h4>
    <p class="evidence-card__value">Da KI-Modelle fehlerhaften Code (Halluzinationen) generieren können, darf kein Code automatisiert in den Hauptzweig (<code>main</code>) einfließen. Jedes Inkrement erfordert ein menschliches Review.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Architekturkonsistenz</h4>
    <p class="evidence-card__value">Die Anwendung muss streng modular aufgebaut bleiben, um sicherzustellen, dass KI-Modifikationen lokal isoliert bleiben und keine unkontrollierten Nebeneffekte in anderen Systemteilen auslösen.</p>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Sicherheits- und Datenschutzgrenzen müssen hart im System verankert sein. Sie dürfen niemals von der Zuverlässigkeit eines generativen KI-Modells abhängen, sondern müssen durch die Infrastruktur und den Git-Workflow erzwungen werden.</p>
</div>

---

## Reconstruction Strategy
Die BridGenta-Methodik teilt den Migrationsprozess in sechs aufeinanderfolgende Phasen auf, um eine kontrollierte IT-Rekonstruktion zu gewährleisten:

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 1</span> Observe (Beobachten)</h4>
    <p class="evidence-card__value">Erfassung und Analyse der bestehenden Legacy-Applikation sowie der aktiven Datenströme im laufenden Betrieb.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 2</span> Understand (Verstehen)</h4>
    <p class="evidence-card__value">Rekonstruktion der Geschäftslogik und Dokumentation der Systemabhängigkeiten im Workspace.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 3</span> Map (Kartieren)</h4>
    <p class="evidence-card__value">Definition der exakten Schnittstellen (API-Spezifikation) und Abgrenzung der modernisierten Komponenten.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 4</span> Reconstruct (Rekonstruieren)</h4>
    <p class="evidence-card__value">Strukturierte Generierung des Codes durch KI-Assistenten auf Basis präziser, kontextreicher Prompts in isolierten Zweigen.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 5</span> Validate (Validieren)</h4>
    <p class="evidence-card__value">Überprüfung des generierten Codes durch automatisierte Qualitätsschranken (Build-Tests, Typprüfungen) und manuelles Code-Review.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 6</span> Handoff (Übergabe)</h4>
    <p class="evidence-card__value">Kontrollierte Integration der validierten Komponenten in das Haupt-Repository.</p>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Ein phasenbasierter Migrationsprozess minimiert das Projektrisiko, indem er die Analyse des Altsystems strikt von der Code-Generierung trennt und sicherstellt, dass die KI nur mit klaren Grenzspezifikationen arbeitet.</p>
</div>

---

## Engineering Thinking
Die Modernisierung kritischer IT-Systeme scheitern in der Praxis selten an mangelnder Entwicklungsgeschwindigkeit, sondern an unkontrollierter Komplexität. Beim Neuaufbau komplexer Legacy-Systeme (Greenfield-Ansatz) geht oft wertvolle, über Jahre gereifte Geschäftslogik verloren, da diese unvollständig dokumentiert ist. Daher setzt BridGenta auf das Prinzip der **kontrollierten IT-Rekonstruktion** anstelle eines vollständigen, riskanten Systemaustauschs.

Dieses Vorgehen basiert auf einer strikten Trennung von Systemanalyse (Discovery) und Code-Generierung (Implementation). Bevor ein AI-Builder zur Generierung von Benutzeroberflächen oder Schnittstellen herangezogen wird, muss die bestehende Logik manuell analysiert, strukturiert und in klare Funktionsblöcke zerlegt werden.

Die Rolle der Künstlichen Intelligenz wird dabei bewusst als **Beschleuniger**, nicht als Architekt definiert. AI-Builder sind hervorragend darin, isolierte Funktionskomponenten in kurzer Zeit zu schreiben. Ihnen fehlt jedoch das globale Systemverständnis, die Sensibilität für langfristige Softwarewartung (Architecture Drift) und das Bewusstsein für Sicherheitsgrenzen. Der menschliche Softwarearchitekt steuert den Prozess und etabliert strenge Governance-Regeln, um zu verhindern, dass die generative KI unstrukturierte Code-Strukturen oder Sicherheitsrisiken in das Hauptsystem einbringt.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Erfolgreiche IT-Rekonstruktion trennt das Verstehen des Systems vom Schreiben des Codes. Erst wenn der menschliche Architekt die Schnittstellengrenzen definiert hat, kann die KI als effizienter Code-Generierungsmotor genutzt werden.</p>
</div>

---

## Architecture

**Architecture diagram planned for Sprint 38.**

## Content Gap
Das Architekturdiagramm und die Schnittstellenbeschreibung der Rekonstruktions-Plattform werden in einem zukünftigen Sprint erstellt.

---

## Engineering Decisions

Bevor mit der technischen Implementierung begonnen wurde, wurden wesentliche strategische und architektonische Entscheidungen getroffen, um die Stabilität und Datensicherheit der Plattform zu garantieren.

<div class="decision-grid">
  <div class="decision-card">
    <h3 class="decision-card__title">Inkrementelle IT-Rekonstruktion</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Minimierung des Betriebsrisikos im Vergleich zu Big-Bang-Migrationen.</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Sichere, schrittweise Systemmodernisierung ohne Ausfallzeiten.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">KI-gestützte Frontend-Generierung</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Beschleunigung von Routine-UI-Implementierungen.</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Hohe Frontend-Entwicklungsgeschwindigkeit bei voller Qualitätskontrolle.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Logische Datentrennung (Gateway)</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Schutz sensitiver Schnittstellendaten vor KI-Systemzugriffen.</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Vollständige Datensicherheit; KI arbeitet nur auf UI-Ebene.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Git-basiertes Branch-Gating</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Verhinderung von unkontrolliertem Code-Einzug (AI Hallucinations).</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Jeder KI-Code durchläuft manuelle Reviews vor der Systemintegration.</p>
    </div>
  </div>
</div>

---

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title">Inkrementelle Rekonstruktion statt vollständiger Systemablösung (Big Bang)</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Entscheidung</span>
        <p class="evidence-card__value">Die Migration des Legacy-Systems erfolgt schrittweise in abgegrenzten Modulen, anstatt die gesamte Applikation in einem einzigen großen Release neu zu veröffentlichen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">Eine Big-Bang-Ablösung birgt das Risiko, nicht dokumentierte Geschäftslogik zu übersehen, was zu unvorhersehbaren Systemausfällen führen kann. Die inkrementelle Migration erlaubt es, einzelne Module isoliert zu testen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Vollständige Neuentwicklung (Greenfield-Ansatz). Diese wurde aufgrund des unverhältnismäßig hohen Risikos unvollständiger Anforderungsanalysen verworfen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Module können nacheinander modernisiert, verifiziert und ausgerollt werden, wodurch das Risiko im laufenden Betrieb gegen Null sinkt.</p>
      </div>
    </div>
  </div>

  <div class="evidence-card">
    <h4 class="evidence-card__title">KI-gestützte Frontend-Generierung mit menschlicher Governance</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Entscheidung</span>
        <p class="evidence-card__value">Für die UI-Gestaltung und Standard-Frontend-Logik werden spezialisierte AI-Builder eingesetzt, während die Systemarchitektur und Core-Logik manuell definiert werden.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">AI-Builder beschleunigen die Erstellung von Benutzeroberflächen erheblich. Die architektonische Kontrolle bleibt jedoch in menschlicher Hand, um unstrukturierten Code-Zuwachs (Code Bloat) zu verhindern.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Reine manuelle Codierung des Frontends. Verworfen aufgrund des hohen zeitlichen Aufwands für repetitive Standardkomponenten.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Eine erhebliche Zeitersparnis bei der Oberflächenerstellung, ohne Abstriche bei der Systemwartbarkeit machen zu müssen.</p>
      </div>
    </div>
  </div>

  <div class="evidence-card">
    <h4 class="evidence-card__title">Physische und logische Datentrennung (Frontend vs. Backend-Gateway)</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Entscheidung</span>
        <p class="evidence-card__value">Das generative UI-Frontend besitzt keinen direkten Zugriff auf API-Schlüssel, Datenbanken oder vertrauliche Logik. Datenabfragen werden über ein gesichertes, separates Backend-Gateway geroutet.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">Generative KI-Modelle dürfen im Entwicklungsprozess nicht mit produktiven Anmeldedaten in Konktakt kommen, um unbeabsichtigte Leaks oder Trainingsdaten-Verunreinigungen zu verhindern.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Eine monolithische Anwendungsstruktur, bei der UI und Datenschnittstellen eng verzahnt sind. Verworfen aus Sicherheits- und Datenschutzgründen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Maximale Sicherheit. Die KI arbeitet im isolierten Frontend ausschließlich mit anonymisierten Schemas und Mock-Daten.</p>
      </div>
    </div>
  </div>

  <div class="evidence-card">
    <h4 class="evidence-card__title">Git-basiertes Branch-Gating (Manuelle Handoff-Grenzen)</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Entscheidung</span>
        <p class="evidence-card__value">KI-generierter Code wird in separaten Handoff-Zweigen abgelegt und muss automatisierte Qualitätsschranken (CI-Builds) sowie ein manuelles Code-Review bestehen, bevor er in den Entwicklungszweig (<code>develop</code>) gemergt wird.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">Syntaktisch korrekter Code kann dennoch logische Lücken oder Sicherheitsrisiken enthalten. Ein automatisches Mergen würde die Stabilität des Hauptsystems gefährden.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Automatischer Merge bei erfolgreichem CI-Build. Verworfen, da rein maschinelle Tests keine strukturelle Design-Konformität oder logische Schwachstellen prüfen können.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Schutz vor fehlerhaften KI-Modifikationen (Halluzinationen) und Erhalt einer sauberen, nachvollziehbaren Git-Historie.</p>
      </div>
    </div>
  </div>
</div>

---

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Wichtige Systementscheidungen sollten durch technische Grenzen (wie API-Gateways) und organisatorische Prozesse (wie Git-Branch-Gating) erzwungen werden. Sie dürfen niemals auf dem Vertrauen in eine korrekte KI-Generierung beruhen.</p>
</div>

---

## Implementation
Um die Vorteile der KI-gestützten Entwicklung mit den Qualitätsansprüchen professioneller Softwareentwicklung zu vereinen, wurde ein mehrstufiger, qualitätsgesicherter Workflow etabliert:

### Workspace: Systemanalyse & Isolierung
Der Workspace bildet den operativen Einstiegspunkt jeder Rekonstruktion. Hier werden die veralteten Systemteile systematisch erfasst, Abhängigkeiten kartiert und Datenflüsse isoliert, bevor KI-generierter Code geschrieben wird. Dies stellt sicher, dass wir die bestehende Anwendungsstruktur vollständig durchdringen und die Schnittstellen präzise definieren.

<div class="architecture-note">
  <strong>Key Takeaway:</strong> Die visuelle Isolation im Workspace verhindert unstrukturierte Modifikationen und stellt sicher, dass wir nur exakt definierte Komponenten modernisieren.
</div>

### Workflow: Strukturierte Code-Generierung
Der Workflow leitet den eigentlichen Rekonstruktionsprozess. Über diesen transparenten Leitfaden werden Frontend-Generatoren (wie Lovable) gezielt instruiert. Der generierte Code wird über isolierte Handoff-Zweige (Handoff Branches) in die Pipeline eingespeist, wo er manuellen Reviews und automatischen Qualitätsschranken unterliegt.

<div class="architecture-note">
  <strong>Key Takeaway:</strong> Der strukturierte Handoff verhindert Scope Creep und stellt sicher, dass KI-Modelle keine unkontrollierten Designabweichungen einführen.
</div>

### Governance: Validierung & Qualitätskontrolle
Die Governance-Ebene fungiert als Gatekeeper der Plattform. Jede Codeänderung wird auf Lizenzkonformität, Sicherheitsrichtlinien und Datenschutzkompatibilität geprüft. Erst nach erfolgreicher automatisierter Build-Verifizierung und dem Review durch den Systemarchitekten erfolgt die Freigabe für die produktive Umgebung.

<div class="architecture-note">
  <strong>Key Takeaway:</strong> Ein strenges Regelwerk ist unerlässlich, um das Risiko unbeabsichtigter Datenabflüsse oder Sicherheitslücken bei KI-generiertem Code zu eliminieren.
</div>

---

## Public Artifacts

<figure>
  <img src="/images/bga-portfolio/BG-PA02-Workspace.webp" alt="BridGenta Workspace Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Workspace-Interface</strong> – Zweck: Visuelle Erfassung der Systemtopologie und Analyse der Handoff-Grenzen vor Beginn der Code-Generierung.</figcaption>
</figure>

<figure>
  <img src="/images/bga-portfolio/BG-PA03-Workflow.webp" alt="BridGenta Workflow Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Modernisierungs-Workflow</strong> – Zweck: Die Pipeline steuert die Handoff-Grenzen und leitet Code-Inkremente sicher in das Git-Repository.</figcaption>
</figure>

<figure>
  <img src="/images/bga-portfolio/BG-PA04-Governance.webp" alt="BridGenta Governance Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Governance-Dashboard</strong> – Zweck: Die Kontrollschranke zur automatisierten Überprüfung von Code-Sicherheit und Architekturkonformität.</figcaption>
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
