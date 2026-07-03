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

### Artefakt 1: Projekt-Visualisierung (Hero)
Das Einstiegsportal zur Visualisierung des rekonstruierten Systems:

![BridGenta Hero-Ansatz](/images/bga-portfolio/BG-PA01-Hero.webp)

### Artefakt 2: High-Level Ablaufdiagramm
Das Ablaufdiagramm zur Entkopplung der Handoff-Pipeline und automatisierten CI-Prüfungen:

![BridGenta Handoff Workflow](/images/bga-portfolio/BG-PA02-Workflow.webp)

### Artefakt 3: Ergebnis-Nachweis (Audit)
Der nachweisbare Audit-Bericht der Plattform-Analytik und des Qualitätsprüfungs-Systems:

![BridGenta Audit Ergebnis](/images/bga-portfolio/BG-PA03-Audit.webp)

## 5. Results
* **Handoff-Stabilität**: Erfolgreiche Vermeidung unkontrollierter Code-Überschreibungen durch klar definierte Git-Handoff-Zweige.
* **Sicherheit**: Keine unbeabsichtigten Leaks von API-Schlüsseln oder Zugangsdaten durch strikte Filterregeln.
* **Wartbarkeit**: Erhalt einer sauberen, modularen Code-Struktur durch manuelle Qualitätskontrollen nach der KI-Generierung.

## 6. Lessons Learned
Die Erprobung KI-gestützter Entwicklungswerkzeuge hat gezeigt, dass die Kombination aus hoher Code-Generierungsgeschwindigkeit und traditioneller Qualitätskontrolle der Schlüssel zu stabilen Anwendungen ist. KI-Assistenten können Routineaufgaben erheblich beschleunigen, bedürfen jedoch einer klaren Prozessführung und manueller Code-Reviews, um Architekturdrift und unkontrollierten Code-Zuwachs zu verhindern.

Die Etablierung restriktiver Git-Workflows und automatisierter CI-Prüfungen erwies sich als unverzichtbar, um die Codebasis sauber zu halten und die Isolierung sensibler Anwendungsdaten zu gewährleisten.
