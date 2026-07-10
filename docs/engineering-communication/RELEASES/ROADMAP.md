# Roadmap — BridGenta Engineering Communication Constitution (BECC)

Dieses Dokument definiert den Entwicklungsplan für nachgelagerte, operative Werkzeuge (Phase 3 Assets) sowie den langfristigen Governance-Zyklus nach der erfolgreichen Veröffentlichung der BECC Version 1.0 (GA).

---

## Release-Status (Release Status)

- **Release Candidate 1 (RC1)**: Abgeschlossen (2026-07-09)
- **Release Candidate 2 (RC2) - Audit-Remediation & Tooling**: Abgeschlossen (2026-07-10)
- **Release Candidate 2 (RC2) - Packaging**: Abgeschlossen (2026-07-10)
- **Final Release Readiness Review**: Abgeschlossen (2026-07-10)
- **BECC v1.0 General Availability (GA) — Complete**: Abgeschlossen (2026-07-10)

---

## Nächster Lebenszyklus: Constitutional Stewardship (Next Lifecycle)

Mit dem Erreichen der General Availability (GA) tritt das Framework in den operativen Governance-Betrieb über. Zukünftige Aktivitäten konzentrieren sich auf folgende Schwerpunkte:

### 1. Constitutional Stewardship (Verfassungsverwaltung)
- Kontinuierliche Überwachung der Schreibqualität im Repository.
- Einhaltung der CODEOWNERS-Reviewregeln für Dokumentationsbeiträge.

### 2. Maintenance (Wartung)
- Fehlerbehebungen (Patches), redaktionelle Überarbeitungen und Syntaxanpassungen.
- Wartung und Pflege der Validierungsskripte in `/tooling/`.

### 3. Operational Improvements (Operative Verbesserungen)
- Weiterentwicklung der Astro-Dokumentations-Templates.
- Integration zusätzlicher Textqualitätswerkzeuge (z.B. Vale) zur automatisierten Stilprüfung.

### 4. Constitutional Amendments (Verfassungsänderungen)
- Durchführung formaler Verfassungsänderungsverfahren bei inhaltlichen Anpassungsbedarfen.
- Abnahme und Dokumentation genehmigter Amendments im Änderungsprotokoll.

### 5. Zukünftige BECC v1.1 Planung (Future BECC v1.1)
- Vorausschauende Planung neuer konstitutioneller Schichten und erweiterter Standards.
- Konsolidierung von Feedback der Entwicklerteams zur Vorbereitung der Minorversion 1.1.

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
