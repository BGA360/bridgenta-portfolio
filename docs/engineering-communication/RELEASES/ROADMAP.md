# Roadmap — BridGenta Engineering Communication Constitution (BECC)

Dieses Dokument definiert den Entwicklungsplan für nachgelagerte, operative Werkzeuge (Phase 3 Assets) nach der erfolgreichen Veröffentlichung der BECC Version 1.0 (GA). Diese Assets überführen die verfassungsrechtlichen Leitlinien in die tägliche Entwicklungspraxis.

---

## Release-Status (Release Status)

- **Release Candidate 1 (RC1)**: Abgeschlossen (2026-07-09)
- **Release Candidate 2 (RC2) - Audit-Remediation & Tooling**: Abgeschlossen (2026-07-10)
- **Release Candidate 2 (RC2) - Packaging**: Abgeschlossen (2026-07-10)
- **Final Release Readiness Review**: Nächster Schritt (In Vorbereitung)
- **General Availability (GA)**: Ausstehend (Nach erfolgreichem Review)

---

## Phase 3 — Operative Werkzeuge (Roadmap)

Die Umsetzung der Roadmap ist in vier Themenblöcke unterteilt, die nacheinander realisiert werden sollen:

### 1. Terminologie- und Übersetzungswerkzeuge
- **Fachglossar (Engineering Glossary)**: Aufbau eines zentralen Glossars zur Definition aller BridGenta-spezifischen Kernbegriffe.
- **Begriffsregister (Terminology Registry)**: Aufbau einer zentralen Datenbank zur Abstimmung und Verwaltung bevorzugter, erlaubter und veralteter Begriffe.
- **Übersetzungsleitfaden (Translation Guide)**: Richtlinien für die präzise Übersetzung deutsch-englischer Fachbegriffe (z. B. korrekte Verwendung von Anglizismen).
- **Tooltip-Standard (Tooltip Standard)**: Technische Spezifikation für Web-Dokumente, um Fachbegriffe bei Mauszeigerkontakt automatisch mit Glossar-Definitionen zu hinterlegen.

### 2. Standard-Dokumentenklassen und -Vorlagen
- **Case Study Standard**: Spezifische Strukturregeln und Markdown-Vorlagen für BridGenta-Fallstudien zur Gewährleistung der CEFR-B2-Verständlichkeit.
- **ADR Standard**: Standardisierte Vorlage für die Dokumentation von Architekturentscheidungen (Architecture Decision Records).
- **Architecture Document Standard**: Gliederungsvorlagen für komplexe System- und Softwarearchitekturbeschreibungen.
- **Technical Report & White Paper Standard**: Gliederungsvorgaben für technische Whitepaper und Prüfberichte.
- **Markdown Templates**: Satzfertig formatierte Schreibvorlagen für Entwickler.

### 3. Ausbildung und Befähigung
- **Reviewer-Handbuch (Reviewer Guide)**: Leitfaden zur praktischen Durchführung von Dokumenten-Reviews auf GitHub.
- **Zertifizierungsprozess (Reviewer Certification)**: Einführung eines kurzen Zertifizierungsprogramms für interne Review-Moderatoren.
- **Schulungsmaterialien (Training Material)**: Praxis-Workshops zur Vermittlung des BECC-Schreibstils für neu eingestellte Software-Ingenieure.

### 4. Qualitätssicherung und Automatisierung
- **Prüf-Checklisten (QA Checklists)**: Ableitung kompakter, checkbarer Audit-Listen für Autoren und Reviewer.
- **Qualitätsmetriken (Quality Metrics)**: Messverfahren zur Bewertung von Dokumentenqualität und Verständlichkeit.
- **Linting-Automatisierung (Linter & CI Integration)**: Integration von Text-Prüftools (z. B. Markdownlint, Vale) in GitHub Actions, um Begriffdrift und Nominalstil automatisch vor dem Commit abzufangen.
