# BECC Operational Validation — Pilot 1 Baseline-Definition

Dieses Dokument stellt die offizielle **Baseline-Definition** für den ersten operativen Validierungslauf (**Operational Validation Pilot 1**) der **BridGenta Engineering Communication Constitution (BECC)** dar. Es friert den Zustand des Ziel-Artefakts und die Konfigurationsparameter ein, um ein reproduzierbares, konsistentes Review zu ermöglichen.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **operatives Stewardship-Dokument** zur Konfigurationssteuerung. Es friert den Testzustand ein und ändert oder erweitert die konstitutionellen Normen der BECC v1.0 nicht.

---

## 1. Baseline-Steckbrief (Baseline Overview)

*   **Baseline-Kennung**: BECC-PILOT-001-BASE
*   **Pilot-Kennung**: BECC-PILOT-001
*   **Regelwerk (Framework)**: BridGenta Engineering Communication Constitution (BECC)
*   **Regelwerks-Version**: Version 1.0.0 (General Availability)
*   **Baseline-Status**: **Frozen — Awaiting Compliance Assessment**
*   **Audit-Status**: Nicht gestartet (Not Started)

---

## 2. Ziel-Artefakt (Assessment Artifact)

Das für diesen Validierungslauf eingefrorene Dokument ist:
*   **Name des Artefakts**: BridGenta Project Case Study (BridGenta Fallstudie)
*   **Typ des Artefakts**: Technische Projektdokumentation (Astro Markdown Content Collection)
*   **Repository-Pfad**: `src/content/projects/bridgenta.md`
*   **Produktions-URL**: `https://bridgenta.de/project-bridgenta/`
*   **Veröffentlichungsstatus**: Entwurfs-Veröffentlichung (Published Draft)
*   **Sprache**: Deutsch (mit IT-Standardfachbegriffen)
*   **Ziel-Sprachniveau**: CEFR-B2 (Mittelstufe / Fachkundig)
*   **Zielgruppe**: Entwickler, technische Auditoren und Reviewer im BridGenta-Repository

---

## 3. Konfigurationssteuerung (Configuration Control)

Die exakte Testkonfiguration ist wie folgt eingefroren:
*   **Audit-Datum**: 2026-07-10
*   **Repository-Branch**: `stewardship/pilot-1-baseline-definition`
*   **Commit-Identifikator**: `abfa63dc6b79b175cabf76d9c38662d3a6bca659`
*   **Produktionsversion**: v1.0.0-GA
*   **Website-Version**: 1.0.0
*   **Prüfungs-Versionskennung**: `PILOT-1-BASE-V1.0`

---

## 4. Geltungsbereich der Bewertung (Assessment Scope)

Die Konformitätsprüfung beschränkt sich strikt auf die folgenden inhaltlichen Abschnitte der Fallstudie `bridgenta.md`:
*   Executive Summary
*   Context (Hintergrund)
*   Problem Statement (Problemstellung)
*   Constraints (Randbedingungen)
*   Engineering Insight (Kernidee)
*   Architecture (Architektur)
*   Engineering Decisions (Entscheidungen - ADRs)
*   Implementation (Umsetzung)
*   Validation (Verifikation)
*   Results (Ergebnisse)
*   Lessons Learned (Erkenntnisse)
*   Future Evolution (Ausblick)

---

## 5. Ausschlüsse (Exclusions)

Von der Konformitätsprüfung ausgeschlossen sind:
*   Der ausführbare Programmcode im Repository.
*   Die Benutzeroberfläche (UI) und visuelle Designelemente (CSS, Layout) des Portfolios.
*   Astro-Konfigurationsdateien, Skripte und JavaScript-Logiken.
*   SEO-Leistungswerte, Ladezeiten, Caching und Suchmaschinenplatzierungen.
*   Barrierefreiheit (WCAG) und Web-Optimierungsmetriken.
*   Die Verfassungsdokumente der BECC selbst sowie begleitende Stewardship-Leitfäden.

---

## 6. Governing Documents (Regelwerke)

Die Bewertung erfolgt ausschließlich unter Governance der folgenden Dokumente:
1.  **BECC-Verfassung**: Die verabschiedeten Teilschichten v1.0 GA (Ordner `00-foundation/` bis `09-quality-assurance/`).
2.  **Bewertungskonzept**: [BECC-ASSESSMENT-METHODOLOGY.md](../BECC-ASSESSMENT-METHODOLOGY.md) (Definiert Ablauf, Outcomes und Befundklassen).
3.  **Bewertungsmatrix**: [BECC-ASSESSMENT-MATRIX.md](../BECC-ASSESSMENT-MATRIX.md) (Definiert Prüffragen und Belege).
4.  **Pilot-Statut**: [PILOT-1-CHARTER.md](./PILOT-1-CHARTER.md) (Definiert den Rahmen und die Meilensteine des Piloten).

---

## 7. Bewertungsschranken (Assessment Constraints)

*   **Evidenzbasierung**: Bewertungen erfordern konkrete Belege (Zitate, Absätze); es wird keine Beurteilung ohne Textnachweis vergeben.
*   **Kein Live-Rewriting**: Während der Bewertung darf der Text der Fallstudie nicht modifiziert werden.
*   **Keine Remediation**: Korrekturschritte dürfen erst nach Abschluss des Audits eingeleitet werden.
*   **Keine ad-hoc Prüffragen**: Es dürfen nur die in der Bewertungsmatrix definierten Fragen (`AQ-ES-001` bis `AQ-AP-002`) angewendet werden.
*   **Konzepttreue**: Der Prüfablauf richtet sich streng nach dem Bewertungskonzept.

---

## 8. Baseline-Integrität (Baseline Integrity)

Das Ziel-Artefakt `src/content/projects/bridgenta.md` ist für die Dauer des Audits eingefroren. 
*   Jegliche inhaltliche Änderung der Datei vor Abschluss des Audits macht diese Baseline ungültig.
*   Bei Änderungen muss eine neue Baseline-Definition erstellt und das Audit auf Basis des neuen Commit-Standes gestartet werden.

---

## 9. Erfolgsbedingungen (Success Conditions)

Diese Baseline gilt als erfolgreich etabliert, wenn:
*   Das Ziel-Artefakt eindeutig über Pfad und Commit-Hash identifiziert ist.
*   Der inhaltliche Geltungsbereich (Scope) festgeschrieben ist.
*   Alle relevanten Governance-Dokumente referenziert sind.
*   Unabhängige Reviewer denselben Git-Stand als identische Prüfungsgrundlage nutzen können.

---

## 10. Freigabe-Entscheidung (Approval Gate)

*Dieser Abschnitt wird bei der formellen Abnahme durch den Project Owner ausgefüllt.*

| Feld | Wert / Unterschrift |
| :--- | :--- |
| **Project Owner Approval** | |
| **Approval Date** | |
| **Approval Notes** | |

---

[Zurück zur BECC-Übersicht](../../README.md)
