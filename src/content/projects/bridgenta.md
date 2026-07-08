---
title: "BridGenta"
subtitle: "IT-Rekonstruktion & Governance"
description: "Evidenzbasierte Rekonstruktionsplattform für Altsysteme zur Vorbereitung bestehender Softwaresysteme auf moderne KI-gestützte Entwicklungsplattformen."
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
BridGenta ist eine Plattform zur Rekonstruktion von Altsystemen. Das System analysiert bestehende Software. So bereitet es diese auf moderne AI Builder (ein KI-Werkzeug, das automatisch Code erstellt) vor.

Heute können Generatoren Oberflächen schnell erstellen. Die echte Herausforderung liegt aber nicht im Schreiben von Code. Ingenieure müssen das Wissen aus alten Systemen genau aufarbeiten und prüfen.

BridGenta erstellt strukturierte Modelle. Die Plattform erzeugt ein Reconstruction Package (ein strukturiertes Datenpaket mit allem Wissen über das Altsystem, das der KI als Grundlage dient). Das System zeigt, wie Entwickler veraltete Software schneller migrieren. Dabei bleibt die Sicherheit der Daten geschützt.

---

## Why This Project Exists
Neue Generatoren verändern die Entwicklung von Software sehr schnell. Zwar erstellen Programme einfache Logik heute in kurzer Zeit. Teams stehen aber vor einer großen Hürde. Sie müssen den neuen Code sicher in bestehende Legacy-Systeme (ein altes, oft schlecht dokumentiertes Softwaresystem) einbauen. Dafür fehlt ihnen oft das Vorwissen.

Klassische Modernisierungen scheitern oft. Der Grund ist meist eine schlechte Dokumentation. Auch hohe Kosten und neue Sicherheitslücken sind ein Risiko. Künstliche Intelligenz beschleunigt diese Arbeit. Sie braucht aber eine klare Governance (das Regelwerk, das Qualität und Sicherheit überwacht). Nur so lassen sich Code Bloat (unnötig aufgeblähter, schwer wartbarer Code) und Architecture Drift (eine schleichende Abweichung von der geplanten Systemstruktur) verhindern.

BridGenta kartiert alte Systeme. Die Plattform bewahrt das Wissen der Systeme auf. Sie stellt dieses Wissen als strukturierte Daten für die KI bereit.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Künstliche Intelligenz schreibt Code schneller. Sie braucht aber genaue Daten über das System. Entwickler müssen zuerst das Wissen erfassen, bevor die KI neuen Code generiert.</p>
</div>

---

## Context
In vielen IT-Abteilungen laufen historisch gewachsene Web-Anwendungen. Diesen Programmen fehlen oft Tests. Sie nutzen veraltete Bibliotheken. Auch weichen sie oft von ihrer Struktur ab. Meist arbeitet das alte Team nicht mehr im Unternehmen. Deshalb kennt niemand mehr die genaue Logik der Anwendung.

Ein manueller Neubau ist sehr riskant. Der Betrieb kann dadurch ausfallen. Zwar können moderne Sprachmodelle alte Systeme automatisch analysieren. Ohne strukturierte Modelle führt der Einsatz von KI jedoch zu Fehlern im Code. Ohne genauen Kontext treffen generative Modelle willkürliche Entscheidungen für die Struktur.

---

## Problem
Die Modernisierung alter Software kostet viel Zeit und verursacht Fehler. Wenn Entwickler KI-Generatoren ohne genauen Systemkontext nutzen, entstehen Probleme. Es drohen Sicherheitslücken und überflüssiger Code. Es fehlt ein klarer Ablauf. Dieser Ablauf muss das Wissen der Altsysteme erfassen, bevor die eigentliche Rekonstruktion beginnt. Erst danach kann man die Geschwindigkeit der KI sicher nutzen.

---

## Constraints
Das Projekt muss sich an strenge technische und operative Regeln halten. Diese Regeln bestimmen den Rahmen der Entwicklung:

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title">Datensicherheit &amp; Geheimnisschutz</h4>
    <p class="evidence-card__value">KI-Modelle dürfen keine echten Kundendaten oder geheimen Schlüssel lesen. Deshalb trennen wir das Frontend logisch und physisch von den Gateways.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Manuelle Qualitätssicherung (Gating)</h4>
    <p class="evidence-card__value">Generative KI erzeugt manchmal fehlerhaften Code. Deshalb darf das System Code nicht automatisch in den Hauptzweig übernehmen. Ein Mensch muss jede Änderung prüfen.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Architekturkonsistenz</h4>
    <p class="evidence-card__value">Wir bauen die Anwendung streng in einzelnen Modulen auf. So bleiben Änderungen der KI lokal begrenzt. Sie stören andere Teile der Software nicht.</p>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Entwickler müssen Grenzen für Sicherheit und Datenschutz fest im System einbauen. Diese Regeln dürfen nicht von der Zuverlässigkeit der KI abhängen. Die Infrastruktur und der Arbeitsablauf müssen diese Grenzen erzwingen.</p>
</div>

---

## Reconstruction Strategy
Die Methode von BridGenta teilt die Modernisierung in sechs Schritte. So bleibt der gesamte Prozess kontrolliert:

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 1</span> Observe (Beobachten)</h4>
    <p class="evidence-card__value">Das System analysiert die alte Anwendung und beobachtet die Datenströme im laufenden Betrieb.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 2</span> Understand (Verstehen)</h4>
    <p class="evidence-card__value">Der Architekt dokumentiert alle Abhängigkeiten und erfasst die Logik im Arbeitsbereich.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 3</span> Map (Kartieren)</h4>
    <p class="evidence-card__value">Wir legen die Schnittstellen fest und grenzen die neuen Teile des Systems ab.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 4</span> Reconstruct (Rekonstruieren)</h4>
    <p class="evidence-card__value">Die KI generiert den neuen Code in einem geschützten Bereich. Dazu nutzt sie genaue Anweisungen.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 5</span> Validate (Validieren)</h4>
    <p class="evidence-card__value">Automatische Tests und menschliche Prüfer kontrollieren den generierten Code sorgfältig.</p>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title"><span class="evidence-card__label">Phase 6</span> Handoff (Übergabe)</h4>
    <p class="evidence-card__value">Der geprüfte Code wird kontrolliert in das Hauptarchiv integriert.</p>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Ein Ablauf in Phasen senkt das Risiko im Projekt. Er trennt die Analyse der alten Software streng von der Erstellung des Codes. Die KI arbeitet nur mit klaren Vorgaben.</p>
</div>

---

## Engineering Thinking
Die Modernisierung wichtiger Systeme scheitern selten an der Geschwindigkeit. Meist scheitert sie an zu hoher Komplexität. Wenn Entwickler einen Greenfield-Ansatz (ein komplett neuer Aufbau des Systems, statt einer schrittweisen Modernisierung) wählen, geht oft altes Wissen verloren. Oft fehlt eine vollständige Dokumentation der alten Geschäftslogik. Deshalb nutzt BridGenta eine kontrollierte Rekonstruktion und tauscht nicht das ganze System auf einmal aus.

Der Prozess folgt einer klaren Regel: **Zuerst verstehen. Danach rekonstruieren.** Bevor eine KI Oberflächen oder Schnittstellen baut, analysieren wir die alte Logik. Wir zerlegen diese Logik in klare Bausteine.

Die KI dient als Beschleuniger, aber nicht als Architekt. KI-Werkzeuge können einzelne Bausteine sehr schnell schreiben. Ihnen fehlt jedoch der Überblick über das gesamte System. Sie erkennen schleichende Abweichungen nicht und beachten keine Sicherheitsgrenzen. Der menschliche Architekt leitet den Prozess und setzt strenge Regeln durch. So verhindert er, dass die KI schlechten Code oder Sicherheitsrisiken einbaut.

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Eine erfolgreiche Rekonstruktion trennt das Verstehen der Software vom Schreiben des Codes. Zuerst legt der Architekt die Schnittstellen fest. Erst danach generiert die KI den Code.</p>
</div>

---

## Capabilities &amp; Intelligence Domains
Die Plattform nutzt sieben Intelligence Domains (ein klar abgegrenzter Fähigkeitsbereich der Plattform). Diese Bereiche steuern den Ablauf genau.

- **Source Intelligence (Quellcode-Analyse)**: Dieses Werkzeug liest den alten Programmcode und sucht nach Fehlern. So deckt das System versteckte Abhängigkeiten und alte Technologien auf.
- **Reconstruction Intelligence (Schnittstellen-Erstellung)**: Diese Funktion entwirft Schnittstellen und legt fest, wie Daten fließen sollen. Sie beschreibt die Datenströme präzise und übersichtlich.
- **Preservation Intelligence (Verhaltens-Erhaltung)**: Diese Komponente speichert das Verhalten der alten Anwendung auf verschiedenen Ebenen. Dadurch bleibt die ursprüngliche Logik für die Zukunft erhalten.
- **Cross-Layer Intelligence (Schichten-Prüfung)**: Diese Funktion vergleicht die Daten aller Schichten der Anwendung. Sie verhindert, dass sich Fehler zwischen Oberfläche und Datenbank einschleichen.
- **Human Review (Menschliche Freigabe)**: Diese Ansicht zeigt dem Architekten alle Änderungen. Er behält die Kontrolle und trifft wichtige Entscheidungen selbst.
- **Governance (Regelwerks-Prüfung)**: Dieser Bereich überwacht die Qualität und prüft die Einhaltung aller Sicherheitsregeln. Er stellt sicher, dass kein unsicherer Code in das System gelangt.
- **Export Intelligence (Paket-Ausgabe)**: Diese Funktion bündelt das gesammelte Wissen über das Altsystem. Sie übergibt die Daten als fertiges Paket an andere Entwicklungsprogramme.

---

## Architecture &amp; Preservation Layers
Die Struktur der Software ist modular. Das System trennt die Module für die Analyse physisch von den echten Datenbanken.

Die Plattform nutzt drei Preservation Layers (eine Ebene, die bestimmte Eigenschaften des Altsystems – z. B. Design oder Verhalten – bewahrt). So übertragen wir alle Eigenschaften der alten Anwendung ohne Fehler.

- **Visibility Preservation Layer (VPL, Sichtbarkeitsebene)**: Diese Ebene misst die Observability (die Möglichkeit, den internen Zustand eines Systems von außen zu beobachten und zu messen). Sie erfasst alle Schnittstellen und sucht nach Fehlern im Code.
- **Experience Preservation Layer (EPL, Verhaltensebene)**: Diese Ebene sichert die Logik und Funktionen der Anwendung. Sie schreibt Benutzerpfade und Zustände genau auf.
- **Design Preservation Layer (DPL, Gestaltungsebene)**: Diese Ebene bewahrt das Aussehen der Benutzeroberfläche. Sie speichert Farben, Schriftarten und CSS-Klassen für das neue System.

Diese drei Ebenen erzeugen ein Abbild des Altsystems. Dieses Abbild dient als Reconstruction Package, um Fehler bei der Code-Generierung durch die KI zu vermeiden.

---

## Engineering Decisions
Vor dem Start traf das Team wichtige Entscheidungen für die Struktur. Diese Entscheidungen sichern die Stabilität und schützen die Daten der Plattform:

<div class="decision-grid">
  <div class="decision-card">
    <h3 class="decision-card__title">Inkrementelle IT-Rekonstruktion</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Wir senken das Risiko im Betrieb im Vergleich zu einer Big-Bang-Migration (eine Umstellung des gesamten Systems auf einmal, statt in Etappen).</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Wir modernisieren das System Schritt für Schritt ohne Ausfälle.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Kontextreiche Wissensmodellierung</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Wir vermeiden AI Hallucinations (Fehler der KI, bei denen sie falsche Fakten erfindet). Diese entstehen durch fehlenden Kontext.</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Die Plattform liefert genaue Datenpakete als Arbeitsgrundlage.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Logische Datentrennung (Gateway)</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Wir schützen sensible Daten vor dem Zugriff der KI.</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Daten bleiben sicher. Die KI arbeitet nur auf der UI (die Benutzeroberfläche, auf der der Nutzer arbeitet).</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Git-basiertes Branch-Gating</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Primärer Grund</span>
      <p class="decision-card__text">Wir verhindern, dass die KI ungeprüften Code in das System einfügt.</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Resultat</span>
      <p class="decision-card__text">Ein Mensch prüft jeden Code der KI vor dem Einbau.</p>
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
        <p class="evidence-card__value">Wir modernisieren das System Schritt für Schritt in einzelnen Modulen. Wir veröffentlichen nicht alles in einem einzigen großen Schritt.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">Bei einer schnellen Umstellung übersehen Entwickler leicht geheime Geschäftslogik. Das kann zu Ausfällen führen. Die schrittweise Modernisierung erlaubt es uns, Module einzeln zu testen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Ein Greenfield-Ansatz. Diesen haben wir wegen des hohen Risikos verworfen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Wir modernisieren, prüfen und aktivieren die Module nacheinander. Das Risiko für den Betrieb sinkt damit fast auf Null.</p>
      </div>
    </div>
  </div>

  <div class="evidence-card">
    <h4 class="evidence-card__title">Kontextreiche Wissensmodellierung statt reiner Code-Generierung</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Entscheidung</span>
        <p class="evidence-card__value">Wir erstellen genaue Pakete mit dem Wissen über das System. Wir lassen die KI nicht direkt Code schreiben.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">Generative Modelle brauchen genaue Grenzen. Ohne diese Vorbereitung baut die KI schnell Fehler und Code Bloat in das System ein.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Die direkte Generierung von Code ohne Schutz am Live-System. Das haben wir wegen des Risikos für die Stabilität verworfen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Die KI erhält genaue Vorgaben. Das erhöht die Genauigkeit und spart Zeit bei der Korrektur.</p>
      </div>
    </div>
  </div>

  <div class="evidence-card">
    <h4 class="evidence-card__title">Physische und logische Datentrennung (Frontend vs. Backend-Gateway)</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Entscheidung</span>
        <p class="evidence-card__value">Die Benutzeroberfläche greift nicht direkt auf Datenbanken oder Schlüssel zu. Ein sicheres Gateway leitet alle Anfragen weiter.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">Die KI darf im Prozess nicht mit echten Passwörtern arbeiten. So verhindern wir den Diebstahl von Daten.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Ein eng verzahntes System ohne Trennung. Das haben wir aus Gründen des Datenschutzes verworfen.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Das System bietet hohe Sicherheit. Die KI arbeitet nur mit Mock-Daten (künstliche Testdaten, die keine echten, sensiblen Informationen enthalten).</p>
      </div>
    </div>
  </div>

  <div class="evidence-card">
    <h4 class="evidence-card__title">Git-basiertes Branch-Gating (Manuelle Handoff-Grenzen)</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Entscheidung</span>
        <p class="evidence-card__value">Das System legt neuen Code in eigenen Zweigen ab. Der Code muss Tests bestehen und von Menschen geprüft werden.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Warum</span>
        <p class="evidence-card__value">Auch fehlerfreier Code kann Sicherheitsrisiken enthalten. Ein automatischer Einbau gefährdet die Stabilität des Hauptsystems.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Alternative</span>
        <p class="evidence-card__value">Ein automatischer Einbau nach dem Testlauf. Das haben wir verworfen, da Maschinen das Design nicht bewerten können.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Resultat</span>
        <p class="evidence-card__value">Das Gating (eine Kontrollstufe, die Code erst nach Prüfung durchlässt) schützt das Archiv vor Fehlern der KI.</p>
      </div>
    </div>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Engineering Insight</div>
  <p class="engineering-insight__text">Entwickler müssen wichtige Entscheidungen über technische Grenzen erzwingen. Sie dürfen der KI nicht blind vertrauen. Die Struktur und die Prozesse müssen die Einhaltung der Regeln sichern.</p>
</div>

---

## Implementation
Um die Vorteile der KI-gestützten Entwicklung mit den Qualitätsansprüchen professioneller Softwareentwicklung zu vereinen, wurde ein mehrstufiger, qualitätsgesicherter Workflow innerhalb der Entwicklungsplattform etabliert:

### Workspace: Systemanalyse & Isolierung
Der Arbeitsbereich bildet den Einstieg für jede Rekonstruktion. Hier erfassen wir die alten Systemteile und kartieren alle Abhängigkeiten. Das Team isoliert die Datenströme. So verstehen wir die alte Struktur und legen Schnittstellen fest.

<div class="architecture-note">
  <strong>Key Takeaway:</strong> Die visuelle Isolation im Arbeitsbereich verhindert ungeplante Änderungen. Sie stellt sicher, dass wir nur ausgewählte Module erneuern.
</div>

### Workflow: Strukturierte Code-Generierung
Der Arbeitsablauf steuert die Rekonstruktion. Wir instruieren die Generatoren über diesen Leitfaden gezielt. Der neue Code fließt über Handoff (die kontrollierte Übergabe von Code an den nächsten Schritt) Zweige in die Pipeline (eine automatisierte Kette von Arbeitsschritten). Dort prüfen automatische Systeme und menschliche Reviewer den Code.

<div class="architecture-note">
  <strong>Key Takeaway:</strong> Die Übergabe verhindert Scope Creep (ein unkontrolliertes Anwachsen der Projektanforderungen). Sie sorgt dafür, dass das Aussehen der Anwendung einheitlich bleibt.
</div>

### Governance: Validierung & Qualitätskontrolle
Die Governance-Ebene prüft jede Änderung, bevor sie freigegeben wird. Das System kontrolliert Lizenzen, Datenschutz und Sicherheitsregeln. Erst nach einem erfolgreichen Testlauf und dem Review durch den Architekten geben wir den Code für die Produktion frei.

<div class="architecture-note">
  <strong>Key Takeaway:</strong> Ein strenges Regelwerk ist wichtig. Es verhindert den Abfluss von Daten und schützt vor Fehlern im KI-Code.
</div>

---

## Public Artifacts

<figure>
  <img src="/images/bga-portfolio/BG-PA02-Workspace.webp" alt="BridGenta Workspace Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Workspace-Interface</strong> – Dieses Bild zeigt das System und hilft dem Architekten, die Grenzen für den Code vor dem Start festzulegen.</figcaption>
</figure>

<figure>
  <img src="/images/bga-portfolio/BG-PA03-Workflow.webp" alt="BridGenta Workflow Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Modernisierungs-Workflow</strong> – Dieser Prozess leitet neue Programmteile sicher in das Archiv weiter.</figcaption>
</figure>

<figure>
  <img src="/images/bga-portfolio/BG-PA04-Governance.webp" alt="BridGenta Governance Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Governance-Dashboard</strong> – Diese Übersicht zeigt dem Prüfer alle Tests zur Sicherheit und zur Struktur des Codes.</figcaption>
</figure>

---

## Results
Durch den klaren Prozess hat das Team im Testlauf messbare Erfolge erzielt:

<div class="results-grid">
  <div class="result-card">
    <div class="result-card__icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon-svg"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <div class="result-card__content">
      <h3>Handoff-Stabilität</h3>
      <p>Wir verhindern das Überschreiben von Code durch klare Zweige im Testlauf.</p>
    </div>
  </div>
  <div class="result-card">
    <div class="result-card__icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon-svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
    <div class="result-card__content">
      <h3>Sicherheit</h3>
      <p>Filterregeln verhindern den Diebstahl von Passwörtern und Schlüsseln.</p>
    </div>
  </div>
  <div class="result-card">
    <div class="result-card__icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon-svg"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    </div>
    <div class="result-card__content">
      <h3>Wartbarkeit</h3>
      <p>Menschliche Prüfer sichern eine saubere Struktur des neuen Codes.</p>
    </div>
  </div>
</div>

---

## Lessons Learned
Die Tests mit der KI zeigen ein klares Ergebnis. Die Verbindung aus hoher Geschwindigkeit und klassischer Kontrolle sichert stabile Programme. Die KI beschleunigt einfache Aufgaben. Sie braucht aber klare Regeln und menschliche Prüfer. Nur so verhindern wir Fehler und unordentlichen Code.

Strenge Arbeitsabläufe in Git und automatische Tests sind unverzichtbar. Sie halten den Quellcode sauber und schützen sensible Daten.

In Zukunft wollen wir Schnittstellen noch genauer festlegen. Ein Contract-First (ein ansatz, bei dem zuerst die Schnittstelle festgelegt wird, bevor man Code schreibt) Design hilft der KI. Sie kann Oberflächen dann mit weniger Fehlern erstellen.

---

## Next Evolution
Das Team plant weitere Schritte für die Plattform. Wir wollen die Analyse ausbauen und den Export von Daten erleichtern.

- **Erweiterung der Quellcode-Analyse**: Das System soll alte Entwurfsmuster automatisch erkennen.
- **API-Formalisierung**: Wir bauen das Schnittstellen-Design aus und generieren Schemas automatisch.
- **Optimierung der Datenpakete**: Wir verbessern die Exportformate. So kann die KI die Daten direkt lesen.
- **Automatisierte Validierung**: Wir bauen neue Sicherheitsprüfungen in die automatischen Abläufe ein.
