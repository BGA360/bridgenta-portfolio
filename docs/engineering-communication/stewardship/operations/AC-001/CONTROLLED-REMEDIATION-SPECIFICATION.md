# BECC Controlled Remediation Specification — AC-001: Behebungsspezifikation

Dieses Dokument definiert die offizielle **Behebungsspezifikation (Controlled Remediation Specification)** für das Audit **AC-001** der **BridGenta Engineering Communication Constitution (BECC)**. Es legt die genauen inhaltlichen Anforderungen und Abnahmekriterien für die Behebungs-Arbeitspakete fest.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **operatives Nachweis-Dokument** zur Prüfungssteuerung. Es enthält keine konstitutionellen Änderungen und ändert die Verfassung der BECC nicht.

---

## 1. Dokumentenlenkung (Document Control)

*   **Assessment ID**: AC-001
*   **Assessment Name**: AEOcortex Operational Communication Assessment
*   **Framework**: BridGenta Engineering Communication Constitution (BECC)
*   **Framework-Version**: BECC v1.0.0 GA
*   **Baseline-Version**: AC-001-BASE-V1.0
*   **Spezifikations-Status**: **Proposed — Awaiting Human Review**
*   **Erstellungsdatum**: 2026-07-13
*   **Nachfolgendes Dokument**: `REMEDIATION-READINESS-ASSESSMENT.md`

---

## 2. Behebungsstrategie (Remediation Strategy)

Die Behebung erfolgt durch die Ergänzung der drei fehlenden Kapitel im Dokument `src/content/projects/aeocortex.md` nach der formellen Freigabe dieses Plans. Jedes Kapitel muss den qualitativen Standards der BECC entsprechen.

---

## 3. Arbeitspakete (Work Packages)

### 3.1. WP-AC-001-001: Ergänzung des Kapitels "Validation"

*   **Zweck**: Behebung von `FIN-AC-001`.
*   **Ziel-Kapitel**: `## Validation`
*   **Inhaltliche Anforderungen**:
    *   Erklärung der Verifikationsmethode (automatisiertes JSON-LD-Scraping und Lesbarkeitsanalyse).
    *   Beschreibung der Testumgebung (Verwendung von Mock-HTML-Seiten mit bekannten Validierungsfehlern).
    *   Angabe konkreter Testparameter (z. B. Rate Limits von 100 Anfragen/Minute).
*   **Akzeptanzkriterien**: Das Kapitel ist im Dokument vorhanden und enthält konkrete, nachvollziehbare Testbeschreibungen anstelle von Placeholdern.

---

### 3.2. WP-AC-001-002: Ergänzung des Kapitels "Risks"

*   **Zweck**: Behebung von `FIN-AC-002`.
*   **Ziel-Kapitel**: `## Risks`
*   **Inhaltliche Anforderungen**:
    *   Identifikation von mindestens zwei verbleibenden technischen Risiken (z. B. IP-Blockaden durch Webserver, Änderungen an den Schema.org-Vorgaben).
    *   Zuweisung einer konkreten Schadens- und Eintrittsklassifizierung.
    *   Definition von Gegenmaßnahmen (z. B. IP-Rotation, automatische Schema-Updates).
*   **Akzeptanzkriterien**: Das Kapitel listet die Risiken und Gegenmaßnahmen strukturiert auf.

---

### 3.3. WP-AC-001-003: Ergänzung des Kapitels "References"

*   **Zweck**: Behebung von `FIN-AC-003`.
*   **Ziel-Kapitel**: `## References`
*   **Inhaltliche Anforderungen**:
    *   Vollständige Linksammlung aller genutzten externen Bibliotheken (Cheerio, Astro).
    *   Referenzierung der Schema.org-Standards.
    *   Verwendung relativer Repository-Links für interne Dokumente.
*   **Akzeptanzkriterien**: Das Kapitel ist vorhanden und alle enthaltenen Links sind funktional (keine toten Links).
