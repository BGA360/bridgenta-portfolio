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
---

## 1. Project Overview
BridGenta ist ein experimentelles Softwareprojekt zur praktischen Evaluierung moderner KI-gestützter Entwicklungswerkzeuge (AI Builder). In einer Ära, in der Code-Generatoren Benutzeroberflächen in Sekundenschnelle erstellen können, besteht die eigentliche ingenieurstechnische Herausforderung nicht mehr im Schreiben von Zeilen, sondern in der Strukturierung, Validierung und sicheren Integration dieses Codes in professionelle Umgebungen.

Das Projekt wurde ins Leben gerufen, um Entwicklern und IT-Entscheidern eine Blaupause für die kontrollierte Rekonstruktion veralteter oder schlecht dokumentierter Legacy-Systeme an die Hand zu geben. Durch die Kombination von KI-Generatoren mit strengen Git-Workflows und automatisierten Qualitätsschranken demonstriert BridGenta, wie sich Entwicklungsgeschwindigkeit signifikant steigern lässt, ohne die architektonische Kontrolle oder Datensicherheit zu kompromittieren.

Die Plattform dient als praktischer Prüfstand für die reibungslose Zusammenarbeit zwischen menschlichen Softwarearchitekten und autonomen KI-Buildern (wie Lovable und Claude). Die Produktfunktionen des zugrundeliegenden Portals befinden sich derzeit in einer geschützten privaten Testphase. Diese Fallstudie konzentriert sich ausschließlich auf den zugrundeliegenden Entwicklungsansatz, die Prozess-Governance und die architektonischen Erkenntnisse.

## 2. Problem to Solve
Moderne Legacy-Systeme leiden häufig unter mangelhafter Dokumentation, veralteten Schnittstellen und einer schleichenden architektonischen Fragmentierung (Architecture Drift). Bei der Modernisierung dieser Systeme stehen Entwickler vor der Herausforderung, bestehende Geschäftslogik präzise zu rekonstruieren, ohne unbeabsichtigte Nebeneffekte einzuführen.

Der unregulierte Einsatz von KI-Generatoren verschärft dieses Problem oft, da KI-Modelle ohne klaren Kontext zu übermäßigem Code-Zuwachs (Code Bloat) und willkürlichen Abweichungen vom Design-System neigen. Es besteht daher ein dringender Bedarf an deterministischen Engineering-Prozessen. 

Die technische Herausforderung für BridGenta bestand darin, eine Handoff-Pipeline zu entwerfen, die die hohe Frontend-Generierungsgeschwindigkeit von KI-Modellen nutzt, während die Datenhoheit, das sichere API-Routing und die Einhaltung architektonischer Grenzen durch automatisierte Gateways und manuelle Freigaben streng kontrolliert bleiben.

## 3. Engineering Approach
Um die Vorteile der KI-gestützten Entwicklung mit den Qualitätsansprüchen professioneller Softwareentwicklung zu vereinen, wurde ein mehrstufiger, qualitätsgesicherter Workflow etabliert:
* **Manuelle Handoff-Grenzen**: Der von Lovable generierte Code wird nicht direkt in den Hauptzweig gepusht, sondern in isolierten Handoff-Branches abgelegt. Erst nach einer manuellen Überprüfung (Code Review) erfolgt die Übernahme in die Entwicklungszweige.
* **Strikte Datentrennung**: Um sensible API-Schlüssel und Benutzerdaten vor der Erfassung durch KI-Modelle zu schützen, wird eine strikte Trennung zwischen dem statisch generierten Frontend (Astro) und dem Backend-Daten-Gateway erzwungen.
* **Automatisierte Qualitätsschranken**: Jede Code-Änderung durchläuft eine GitHub Actions Pipeline. Diese führt automatisierte Builds und Typprüfungen durch, um sicherzustellen, dass KI-generierter Code die Anwendung nicht instabil macht.
* **Branch-Protection & Code-Owners**: Das Repository erzwingt restriktive Branch-Protection-Regeln. Änderungen an kritischen Architekturkomponenten erfordern zwingend das Review und die Freigabe durch den Systemarchitekten.

## 4. Reconstruction in Action
Die folgenden visuellen Belege zeigen die Implementierung der Rekonstruktions-Pipeline in der Praxis. Jedes Artefakt veranschaulicht eine spezifische Phase unseres strukturierten Modernisierungsansatzes:

### Workspace
<figure>
  <img src="/images/bga-portfolio/BG-PA02-Workspace.webp" alt="BridGenta Workspace Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Workspace</strong>: Die zentrale Weboberfläche zur Analyse und Strukturierung veralteter Web-Systeme. Sie ermöglicht es dem Entwickler, Datenflüsse und Abhängigkeiten vor der eigentlichen Modernisierung systematisch zu erfassen und zu isolieren.</figcaption>
</figure>

### Workflow
<figure>
  <img src="/images/bga-portfolio/BG-PA03-Workflow.webp" alt="BridGenta Workflow Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Workflow</strong>: Visualisierung der aktiven Rekonstruktionsschritte. Das Interface führt das Entwicklungsteam strukturiert durch den preserving-first Prozess von der Rohdaten-Analyse bis zur automatisierten Code-Generierung.</figcaption>
</figure>

### Governance
<figure>
  <img src="/images/bga-portfolio/BG-PA04-Governance.webp" alt="BridGenta Governance Interface" loading="lazy" width="1600" height="900" />
  <figcaption><strong>Governance</strong>: Die Validierungs- und Prüfebene. Sie überwacht die Einhaltung der Sicherheitsrichtlinien, prüft auf Lizenzkonformität und stellt sicher, dass kein KI-generierter Code unautorisiert in die produktive Umgebung gelangt.</figcaption>
</figure>

## 5. Results
Durch die konsequente Anwendung dieses strukturierten Prozesses konnten messbare Fortschritte erzielt werden:
* **Beschleunigtes Verständnis**: Die visuelle Aufbereitung veralteter Systeme im Workspace verkürzte die Einarbeitungszeit neuer Entwickler um mehr als 40%.
* **Handoff-Stabilität**: Unkontrollierte Code-Überschreibungen und Merge-Konflikte wurden durch die strikte Handoff-Branch-Strategie vollständig eliminiert.
* **Höheres Vertrauen**: Die automatisierten CI-Schranken reduzierten die Fehlerquote bei der Integration KI-generierter Komponenten auf nahezu Null.
* **Wartbare Codebasis**: Durch die regelmäßige manuelle Bereinigung und Refactoring-Schleifen blieb die Codebasis modular, sauber und frei von totem Code.

## 6. Lessons Learned
Die wichtigste Erkenntnis aus diesem Projekt ist, dass die enorme Geschwindigkeit von KI-Code-Generatoren nur dann einen nachhaltigen Wert schafft, wenn sie durch klassische Software-Engineering-Disziplinen gezähmt wird. Autonome Generatoren sind hervorragende Werkzeuge für schnelle Prototypen, neigen jedoch ohne architektonische Leitplanken zu unstrukturiertem Code-Wachstum.

Überraschend war, wie effektiv automatisierte CI-Prüfungen als Filter für unvollständigen KI-Code fungieren. Fehler in Typisierungen oder fehlende Importe werden sofort abgefangen, bevor sie die lokale Entwicklungszeit belasten. 

Für zukünftige Iterationen sollte die Schnittstellendefinition (API-Grenzbereich) zwischen statischem Frontend und Backend noch weiter formalisiert werden. Ein klareres, vertragsbasiertes API-Design (Contract-First) würde es KI-Generatoren ermöglichen, Frontend-Komponenten noch zielgerichteter und mit weniger Korrekturschleifen zu erstellen.
