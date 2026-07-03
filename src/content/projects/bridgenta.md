---
title: "BridGenta"
category: "Private Beta / IT-Rekonstruktion"
status: "Private Beta"
technologies: "Lovable (AI Builder), Produktarchitektur, AI-assisted Development"
description: "AI-gestützte Plattform in privater Entwicklung. Die öffentliche Portfolio-Seite zeigt nur den technischen Entwicklungsansatz, nicht das unveröffentlichte Produkt."
notice: "BridGenta befindet sich aktuell in einer kontrollierten privaten Entwicklungs- und Testphase. Die Produktfunktionen und Benutzeroberflächen werden erst nach Abschluss der ausgewählten Testphase öffentlich vorgestellt. Diese Portfolio-Seite beschreibt ausschließlich die technische Arbeitsweise, die Lernziele und den Entwicklungsansatz."
---

## 1. Executive Summary
BridGenta ist ein experimentelles Softwareprojekt zur praktischen Evaluierung moderner KI-gestützter Entwicklungswerkzeuge (AI Builder). Im Mittelpunkt steht die Fragestellung, wie sich die Frontend-Generierung durch KI-Assistenten (wie Lovable) steuern und in einen professionellen Softwareentwicklungs-Workflow mit Git-Versionskontrolle, automatisierten Qualitätsprüfungen und Branch-Protection integrieren lässt.

Die Produktfunktionen des zugrundeliegenden Portals befinden sich derzeit in einer geschützten privaten Testphase.

## 2. Challenge
KI-Entwicklungswerkzeuge ermöglichen eine hohe Entwicklungsgeschwindigkeit, neigen jedoch ohne architektonischen Rahmen zu ungeplanten Designänderungen (Scope Creep) und Code-Duplikationen (Code Bloat). Die technische Herausforderung bestand darin, einen Prozess zu definieren, der die Entwicklungsgeschwindigkeit von KI-Modellen optimal nutzt, die architektonische Kontrolle über Datenstrukturen und Routing aufrechterhält sowie sensible API-Schlüssel und Benutzerdaten strikt von den KI-Generierungskontexten isoliert.

## 3. Approach
In meiner Rolle als technischer Webmaster verantworte ich die Konzeption, das Workflow-Design und die quality-gesicherte Git-Pipeline:
* **Workflow-Design**: Definition der Schnittstelle (Handoff-Grenze) zwischen KI-generiertem Code und dem produktiven Git-Repository.
* **Qualitätssicherung**: Implementierung automatisierter Build- und Qualitätsprüfungen (CI/CD-Pipelines via GitHub Actions).
* **Architektur-Kontrolle**: Gewährleistung der strikten Trennung zwischen statischem Frontend (Astro) und dynamischer Produkt-API.
* **Prozess-Governance**: Etablierung restriktiver Branch-Protection-Regeln und Codeowner-Reviews zur Erhöhung der Betriebssicherheit.

## 4. Public Artifacts

### Hero
<figure>
  <img src="/images/bga-portfolio/BG-PA01-Hero.webp" alt="BridGenta Reconstruction Platform illustrating structured modernization of legacy web applications while preserving architecture, experience, and business intent." width="1672" height="941" />
</figure>

### Workspace
<figure>
  <img src="/images/bga-portfolio/BG-PA02-Workspace.webp" alt="BridGenta workspace interface used for structured reconstruction, project analysis, and privacy-first processing." loading="lazy" width="1600" height="900" />
  <figcaption>Workspace for project reconstruction and structured analysis.</figcaption>
</figure>

### Workflow
<figure>
  <img src="/images/bga-portfolio/BG-PA03-Workflow.webp" alt="BridGenta reconstruction workflow illustrating analysis, preservation, validation, and modernization stages." loading="lazy" width="1600" height="900" />
  <figcaption>Structured reconstruction workflow demonstrating project analysis and modernization.</figcaption>
</figure>

### Governance
<figure>
  <img src="/images/bga-portfolio/BG-PA04-Governance.webp" alt="BridGenta governance interface demonstrating audit, validation, and reconstruction quality controls." loading="lazy" width="1600" height="900" />
  <figcaption>Governance and validation layer supporting transparent reconstruction decisions.</figcaption>
</figure>

## 5. Results
* **Handoff-Stabilität**: Erfolgreiche Vermeidung unkontrollierter Code-Überschreibungen durch klar definierte Git-Handoff-Zweige.
* **Sicherheit**: Keine unbeabsichtigten Leaks von API-Schlüsseln oder Zugangsdaten durch strikte Filterregeln.
* **Wartbarkeit**: Erhalt einer sauberen, modularen Code-Struktur durch manuelle Qualitätskontrollen nach der KI-Generierung.

## 6. Lessons Learned
Die Erprobung KI-gestützter Entwicklungswerkzeuge hat gezeigt, dass die Kombination aus hoher Code-Generierungsgeschwindigkeit und traditioneller Qualitätskontrolle der Schlüssel zu stabilen Anwendungen ist. KI-Assistenten können Routineaufgaben erheblich beschleunigen, bedürfen jedoch einer klaren Prozessführung und manueller Code-Reviews, um Architekturdrift und unkontrollierten Code-Zuwachs zu verhindern.

Die Etablierung restriktiver Git-Workflows und automatisierter CI-Prüfungen erwies sich als unverzichtbar, um die Codebasis sauber zu halten und die Isolierung sensibler Anwendungsdaten zu gewährleisten.
