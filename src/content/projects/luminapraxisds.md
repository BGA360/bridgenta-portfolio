---
title: "Lumina Praxis"
subtitle: "Praxis-Website & Interaktive Rechner"
category: "Praxis-Website / Web-App"
status: "Abgeschlossen"
timeline: "Herbst 2025"
technologies: "HTML5, Tailwind CSS, JavaScript, Responsive Layout, Medical SEO"
description: "Modernes Portal für eine biologische Zahnarztpraxis mit medizinischen SEO-Strukturen und interaktivem Vitality-Score-Rechner."
role: "Frontend Engineer & Local SEO Designer"
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
---

## 1. Executive Summary
Lumina Praxis ist ein Webportal für biologische und ganzheitliche Zahnmedizin am Standort Leverkusen. Die Anwendung kombiniert ein ansprechendes, barrierefreies Informationsangebot mit interaktiven Elementen.

Ziel des Projekts war die Etablierung eines digitalen Aufklärungskonzepts, um das Patientenvertrauen in biologische Heilverfahren zu stärken und die Online-Terminbuchungen messbar zu steigern.

## 2. Challenge
Medizinische Fachportale müssen komplexe Zusammenhänge (z. B. biokompatible Implantologie und systemische Wechselwirkungen) verständlich erklären, ohne unübersichtlich zu wirken. Gleichzeitig müssen Patientendaten bei interaktiven Eingaben streng geschützt bleiben und die Barrierefreiheit für ältere oder sehbehinderte Patienten gewährleistet sein.

## 3. Approach
Ich war für das vollständige Frontend-Engineering, die Barrierefreiheit und die Suchmaschinen-Integration des Webportals verantwortlich:
* **Frontend-Entwicklung**: Umsetzung der responsiven Benutzeroberfläche mittels HTML5 und Tailwind CSS unter Einhaltung strenger WCAG-Kontrastvorgaben.
* **Interaktivität**: Implementierung des interaktiven Vitality-Score-Rechners in clientseitigem Vanilla JavaScript, um eine serverunabhängige Datenverarbeitung zu garantieren.
* **Medizinisches SEO**: Einpflege strukturierter JSON-LD-Daten (Zahnarztpraxis-Schema `Dentist` und `MedicalBusiness`, strukturierte Leistungsangebote) zur Erhöhung der lokalen Suchmaschinenpräsenz.
* **Qualitätskontrolle**: Durchführung strukturierter Tastaturnavigationstests und Lighthouse-Audits zur Barrierefreiheit.

## 4. Public Artifacts

### Artefakt 1: Projekt-Visualisierung
*(Hinweis: Zum Schutz der Markenidentität wird hier eine schematische Darstellung verwendet.)*

```
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
```

### Artefakt 2: High-Level Ablaufdiagramm
Das folgende Diagramm zeigt den konzeptionellen Ablauf und die Caching-Grenzen der Datenverarbeitung im Vitality-Score-Rechner:

```mermaid
graph TD
    User([Patient]) -->|Formular-Eingabe| Rechner[Clientseitiger JS-Rechner]
    Rechner -->|Lokale Kalkulation| Ergebnis[Score & Empfehlung im DOM]
    Rechner -.->|Keine Übertragung| Server[(Webserver / Datenschutz-Sicherheit)]
```

### Artefakt 3: Ergebnis-Nachweis
Datenschutz- und Barrierefreiheits-Matrix:

| Prüfpunkt | Vorgabe | Umsetzung |
| :--- | :--- | :--- |
| Patientendatenschutz | DSGVO-Konformität | 100% clientseitige Auswertung im Browser |
| Visueller Kontrast | WCAG 2.1 (AA) | Kontrastverhältnis aller Texte > 4.5:1 |
| Navigation | Tastaturbedienbarkeit | Logischer Fokusfluss über alle Formularelemente |

## 5. Results
* **Datenschutzkonforme Interaktion**: Der Vitality-Score-Rechner verarbeitet Patienteneingaben ausschließlich lokal im Browser – es findet keine Übertragung medizinischer Daten an Webserver statt.
* **Barrierefreiheit**: Erfolgreiches Audit der Barrierefreiheit nach WCAG-Standards.
* **Conversion-Steigerung**: Höhere Interaktionsrate und gestiegene Terminbuchungen durch das interaktive Aufklärungskonzept.

## 6. Lessons Learned
Die Umsetzung dieses Fachportals unterstrich die Bedeutung einer engen Verzahnung von Informationsarchitektur, Datenschutz und Barrierefreiheit. Die decision, den Vitality-Score-Rechner rein clientseitig zu implementieren, war sowohl aus Performance-Gründen als auch zum Schutz vertraulicher Patientendaten die optimale Lösung.

Darüber hinaus hat das Projekt gezeigt, dass barrierefreie Gestaltung nach WCAG-Standards und ästhetisches Design einander nicht ausschließen, sondern gemeinsam ein vertrauenswürdiges und barrierefreies Nutzererlebnis schaffen.
