# BECC Baseline Definition — AC-001: Baseline-Festlegung

Dieses Dokument definiert die offizielle und unveränderliche **Baseline-Festlegung (Baseline Definition)** für das operative Audit **AC-001** der **BridGenta Engineering Communication Constitution (BECC)**. Es friert den Versionsstand des Ziel-Artefakts ein, um eine konsistente, reproduzierbare Konformitätsprüfung zu ermöglichen.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **operatives Nachweis-Dokument** zur Prüfungssteuerung. Es enthält keine konstitutionellen Änderungen und ändert die Verfassung der BECC nicht.

---

## 1. Dokumentenlenkung (Document Control)

*   **Dokumententitel**: Baseline-Festlegung (Baseline Definition)
*   **Assessment ID**: AC-001
*   **Assessment Name**: AEOcortex Operational Communication Assessment
*   **Framework**: BridGenta Engineering Communication Constitution (BECC)
*   **Framework-Version**: BECC v1.0.0 GA
*   **Baseline-Version**: AC-001-BASE-V1.0
*   **Baseline-Status**: **Frozen (Eingefroren)**
*   **Erstellungsdatum**: 2026-07-13
*   **Nachfolgendes Dokument**: `COMPLIANCE-ASSESSMENT.md`

---

## 2. Ziel-Artefakt (Assessment Artifact)

*   **Projekt**: AEOcortex
*   **Artefakt-Typ**: Technische Fallstudie (Public Engineering Case Study)
*   **Repository-Pfad**: `src/content/projects/aeocortex.md`
*   **Produktiv-URL**: [https://bridgenta.de/project-aeocortex/](https://bridgenta.de/project-aeocortex/)
*   **Repository**: `bridgenta-portfolio`

---

## 3. Konfigurationskontrolle (Configuration Control)

Die nachfolgenden Git-Parameter frieren das Audit-Ziel physisch ein:
*   **Git Commit Hash**: `217a565816900cadac8f46effc8cd4a5638d971c`
*   **Aktiver Branch**: `operation/ac-001`
*   **Website-Version**: v1.0.0 (Astro Build)
*   **Assessment ID**: AC-001
*   **Baseline-Version**: AC-001-BASE-V1.0

*Sämtliche im Rahmen der Prüfung erhobenen Befunde und Belege beziehen sich ausschließlich auf diesen eingefrorenen Zustand.*

---

## 4. Sprachdefinition (Language Definition)

*   **Primärsprache**: Deutsch (de)
*   **Ziel-Leserstufe**: GER B2 (Gemeinsamer Europäischer Referenzrahmen)
*   **Schreibstil**: Technische und erklärende Dokumentation (Engineering Communication)
*   **Regelwerk**: BECC v1.0.0 GA

---

## 5. Eingefrorener Prüfungsbereich (Assessment Scope)

Der inhaltliche Geltungsbereich ist auf folgende Kapitelstrukturen der Fallstudie beschränkt:
1.  Zusammenfassung (Executive Summary)
2.  Kontext & Problemstellung (Context / Problem Statement)
3.  Randbedingungen (Constraints)
4.  Architektur & Technische Entscheidungen (Architecture / Engineering Decisions)
5.  Umsetzung (Implementation)
6.  Validierung & Ergebnisse (Validation / Results)
7.  Lessons Learned & Risiken (Lessons Learned / Risks)
8.  Zukünftige Entwicklung (Future Evolution)
9.  Referenzen & Anhänge (References / Appendices)

---

## 6. Explizite Prüfungsausschlüsse (Explicit Exclusions)

Von der Prüfung ausgeschlossen sind:
*   Die funktionale Qualität und Fehlerfreiheit des Astro-Quellcodes,
*   Die architektonische Korrektheit der Software-Implementierung,
*   TypeScript-Typsicherheit,
*   HTML/JS-Umsetzung,
*   Barrierefreiheit (Accessibility) und CSS-Design,
*   Sicherheitstests (Security Testing),
*   SEO- und AEO-Optimierung (Search/Answer Engine Optimization),
*   Website-Performance,
*   Marketing-Evaluationen und Veröffentlichungs-Governance (BPGA),
*   Konstitutionelle Änderungen des BECC-Frameworks.

---

## 7. Geltende operative Dokumente (Governing Documents)

Die Auswertung erfolgt anhand folgender Stewardship-Dokumente:
*   [BECC-ASSESSMENT-METHODOLOGY.md](../../BECC-ASSESSMENT-METHODOLOGY.md) (Bewertungsmethodik)
*   [BECC-ASSESSMENT-MATRIX.md](../../BECC-ASSESSMENT-MATRIX.md) (Bewertungsmatrix)
*   [ASSESSMENT-REQUEST.md](./ASSESSMENT-REQUEST.md) (Prüfungsantrag)
*   [BECC-OPERATIONAL-WORKSPACE-SPECIFICATION.md](../../BECC-OPERATIONAL-WORKSPACE-SPECIFICATION.md) (Workspace-Spezifikation)
*   [BECC-OPERATIONAL-STEWARDSHIP-POLICY.md](../../BECC-OPERATIONAL-STEWARDSHIP-POLICY.md) (Betriebsrichtlinie)

---

## 8. Integritätsregeln der Baseline (Baseline Integrity Rules)

*   **Unveränderlichkeit**: Diese Baseline darf während des gesamten verbleibenden Audit-Lebenszyklus von AC-001 nicht mehr modifiziert werden.
*   **Abweichungen**: Sollten Code-Änderungen am Ziel-Artefakt vorgenommen werden, muss dieses Audit geschlossen und ein neues Assessment mit neuer ID gestartet werden.
