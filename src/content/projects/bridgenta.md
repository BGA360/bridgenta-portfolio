---
title: "BridGenta"
subtitle: "IT-Rekonstruktion & Governance"
category: "Private Beta / IT-Rekonstruktion"
status: "Private Beta"
timeline: "März 2026"
technologies: "Lovable (AI Builder), Produktarchitektur, AI-assisted Development"
description: "AI-gestützte Plattform in privater Entwicklung. Die öffentliche Portfolio-Seite zeigt nur den technischen Entwicklungsansatz, nicht das unveröffentlichte Produkt."
notice: "BridGenta befindet sich aktuell in einer kontrollierten privaten Entwicklungs- und Testphase. Die Produktfunktionen und Benutzeroberflächen werden erst nach Abschluss der ausgewählten Testphase öffentlich vorgestellt. Diese Portfolio-Seite beschreibt ausschließlich die technische Arbeitsweise, die Lernziele und den Entwicklungsansatz."
role: "System Architect & AI Workflow Designer"
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
overview: |
  BridGenta ist ein experimentelles Softwareprojekt zur praktischen Evaluierung moderner KI-gestützter Entwicklungswerkzeuge (AI Builder). Im Mittelpunkt steht die Fragestellung, wie sich die Frontend-Generierung durch KI-Assistenten (wie Lovable) steuern und in einen professionellen Softwareentwicklungs-Workflow mit Git-Versionskontrolle, automatisierten Qualitätsprüfungen und Branch-Protection integrieren lässt.

  Die Produktfunktionen des zugrundeliegenden Portals befinden sich derzeit in einer geschützten privaten Testphase.
problem: |
  KI-Entwicklungswerkzeuge ermöglichen eine hohe Entwicklungsgeschwindigkeit, neigen jedoch ohne architektonischen Rahmen zu ungeplanten Designänderungen (Scope Creep) und Code-Duplikationen (Code Bloat). Die technische Herausforderung bestand darin, einen Prozess zu definieren, der die Entwicklungsgeschwindigkeit von KI-Modellen optimal nutzt, die architektonische Kontrolle über Datenstrukturen und Routing aufrechterhält sowie sensible API-Schlüssel und Benutzerdaten strikt von den KI-Generierungskontexten isoliert.
approach:
  title: "Engineering Approach"
  principles:
    - title: "Workflow-Design"
      description: "Definition der Schnittstelle (Handoff-Grenze) zwischen KI-generiertem Code und dem produktiven Git-Repository."
    - title: "Qualitätssicherung"
      description: "Implementierung automatisierter Build- und Qualitätsprüfungen (CI/CD-Pipelines via GitHub Actions)."
    - title: "Architektur-Kontrolle"
      description: "Gewährleistung der strikten Trennung zwischen statischem Frontend (Astro) und dynamischer Produkt-API."
    - title: "Prozess-Governance"
      description: "Etablierung restriktiver Branch-Protection-Regeln und Codeowner-Reviews zur Erhöhung der Betriebssicherheit."
artifacts:
  - image: "/images/bga-portfolio/BG-PA02-Workspace.webp"
    title: "Workspace"
    description: "Workspace for project reconstruction and structured analysis."
  - image: "/images/bga-portfolio/BG-PA03-Workflow.webp"
    title: "Workflow"
    description: "Structured reconstruction workflow demonstrating project analysis and modernization."
  - image: "/images/bga-portfolio/BG-PA04-Governance.webp"
    title: "Governance"
    description: "Governance and validation layer supporting transparent reconstruction decisions."
resultsGrid:
  - icon: "check"
    title: "Handoff-Stabilität"
    description: "Erfolgreiche Vermeidung unkontrollierter Code-Überschreibungen durch klar definierte Git-Handoff-Zweige."
  - icon: "shield"
    title: "Sicherheit"
    description: "Keine unbeabsichtigten Leaks von API-Schlüsseln oder Zugangsdaten durch strikte Filterregeln."
  - icon: "tool"
    title: "Wartbarkeit"
    description: "Erhalt einer sauberen, modularen Code-Struktur durch manuelle Qualitätskontrollen nach der KI-Generierung."
takeaways: |
  Die Erprobung KI-gestützter Entwicklungswerkzeuge hat gezeigt, dass die Kombination aus hoher Code-Generierungsgeschwindigkeit und traditioneller Qualitätskontrolle der Schlüssel zu stabilen Anwendungen ist. KI-Assistenten können Routineaufgaben erheblich beschleunigen, bedürfen jedoch einer klaren Prozessführung und manueller Code-Reviews, um Architekturdrift und unkontrollierten Code-Zuwachs zu verhindern.

  Die Etablierung restriktiver Git-Workflows und automatisierter CI-Prüfungen erwies sich als unverzichtbar, um die Codebasis sauber zu halten und die Isolierung sensibler Anwendungsdaten zu gewährleisten.
---
