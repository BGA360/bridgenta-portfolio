# BECC Controlled Remediation Specification — AC-002: Lumina Praxis

Dieses Dokument enthält den offiziellen **Behebungsplan (Controlled Remediation Specification)** für das Audit **AC-002** der **BridGenta Engineering Communication Constitution (BECC)**. Es definiert den exakten technischen Scope und die Abnahmekriterien für den Behebungsauftrag **RM-002**.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **operatives Nachweis-Dokument** zur Spezifikation von Änderungen.

---

## 1. Dokumentenlenkung (Document Control)

*   **Remediation ID**: RM-002
*   **Assessment ID**: AC-002
*   **Target Project**: Lumina Praxis
*   **Dateipfad**: `src/content/projects/luminapraxisds.md`
*   **Status**: **Awaiting Human Review Authorization**
*   **Datum**: 2026-07-13
*   **Autor**: Stewardship Agent (Antigravity)

---

## 2. Arbeitspakete & Abnahmekriterien (Work Packages)

### 2.1. WP-AC-002-001: Kapitel "Validation"

*   **Befund-ID**: FIN-AC-002-001
*   **Einfügeort**: Unmittelbar nach der Überschrift `## Public Artifacts` und unmittelbar vor der Überschrift `## Results`.
*   **Inhaltliche Vorgaben (Spezifikation)**:
    *   Dokumentation der Berechnungstests für den interaktiven Vitality-Score-Rechner (z. B. Validierung von Grenzwert-Eingaben).
    *   Prüfung des lokalen SEO-Rankings und Einhaltung medizinischer Werberichtlinien.
    *   Nutzung von Testdaten und Mock-Szenarien.
*   **Nachweisreferenz**: Muss Verweise auf `AC-002`, `FIN-AC-002-001` und `RM-002` enthalten.

---

### 2.2. WP-AC-002-002: Kapitel "Risks"

*   **Befund-ID**: FIN-AC-002-002
*   **Einfügeort**: Unmittelbar nach der Überschrift `## Lessons Learned` und unmittelbar vor der Überschrift `## Future Evolution`.
*   **Inhaltliche Vorgaben (Spezifikation)**:
    *   Erstellung einer Risikotabelle mit mindestens zwei Risiken (z. B. fehlerhafte Berechnungslogik auf alten Browsern, Abmahnrisiken durch irreführende medizinische Formulierungen).
    *   Zuweisung von Schadensklassen (Mittel/Gering) und Eintrittswahrscheinlichkeiten.
    *   Formulierung von wirksamen Gegenmaßnahmen (Mitigations).
*   **Nachweisreferenz**: Muss Verweise auf `AC-002`, `FIN-AC-002-002` und `RM-002` enthalten.

---

### 2.3. WP-AC-002-003: Kapitel "References"

*   **Befund-ID**: FIN-AC-002-003
*   **Einfügeort**: Unmittelbar nach der Überschrift `## Future Evolution` (Dokumentende).
*   **Inhaltliche Vorgaben (Spezifikation)**:
    *   Links zu externen Ressourcen: Tailwind CSS Spezifikationen, Zahnmedizinische Leitlinien (Kariesprophylaxe).
    *   Absoluter GitHub-Link auf die zentrale BECC-Matrix.
*   **Nachweisreferenz**: Muss Verweise auf `AC-002`, `FIN-AC-002-003` und `RM-002` enthalten.

---

## 3. Abnahme-Bedingungen (Acceptance Criteria)

Der Arbeitsauftrag RM-002 gilt als erfolgreich abgeschlossen, wenn:
1.  Alle drei Kapitel an den spezifizierten semantischen Positionen vorhanden sind.
2.  Keine anderen Abschnitte im Dokument modifiziert oder gelöscht wurden.
3.  Alle lokalen Repository-Validierungsskripte (`npm run lint`, `npm run check-links`, `npm run build`, `node tooling/audit_links.cjs`) fehlerfrei durchlaufen.
