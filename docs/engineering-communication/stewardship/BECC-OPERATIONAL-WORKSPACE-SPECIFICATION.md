# BECC Operational Assessment Workspace Specification — Spezifikation der Arbeitsumgebung

Dieses Dokument definiert den offiziellen **Repository-Standard zur Organisation operativer BECC-Dokumentenprüfungen (Operational Assessment Workspace Specification)**. Es legt fest, wie und wo die Artefakte einzelner Audits im Repository strukturiert und abgelegt werden, um Konsistenz, Traceability und Revisionssicherheit über alle geprüften Projekte hinweg zu garantieren.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **technisches Implementierungs-Dokument** zur Repository-Strukturierung. Es führt keine neuen konstitutionellen Regeln oder Stewardship-Richtlinien ein und ändert die in BECC v1.0 GA verankerten inhaltlichen Standards nicht.

---

## 1. Zweck & Geltungsbereich (Purpose & Scope)

Mit dem Übergang der BECC in den langfristigen Produktivbetrieb für verschiedene Portfolio-Projekte steigt die Anzahl der erzeugten Audit-Dokumente (Assessments, EDRs, Spezifikationen) signifikant an.
*   **Zweck**: Verhinderung eines unstrukturierten Anwachsens von Dateien im Repository. Eine einheitliche Ordnerstruktur erleichtert die automatisierte Validierung und die Navigation für Prüfer und Entwickler.
*   **Geltungsbereich**: Diese Spezifikation gilt verbindlich für alle zukünftigen offiziellen Dokumentenprüfungen des Portfolios.

---

## 2. Grundsätze der Arbeitsumgebung (Workspace Philosophy)

Die Strukturierung der Audit-Ordner unterliegt folgenden technischen Prinzipien:

*   **Eine Prüfung = Eine Umgebung (One Assessment = One Workspace)**: Jedes Audit (z. B. `BA-002`) erhält einen exklusiven Ordner, in dem alle zugehörigen Dokumente gebündelt liegen.
*   **Unveränderliche Historie (Immutable History)**: Einmal abgeschlossene Audit-Umgebungen dürfen nicht mehr verschoben, umbenannt oder inhaltlich modifiziert werden.
*   **Vollständige Traceability**: Jedes Dokument im Ordner baut logisch und namentlich auf dem vorhergehenden Schritt des Audit-Lebenszyklus auf.
*   **Vorhersagbare Struktur (Predictable Structure)**: Die Anordnung und Benennung der Dateien folgt einem starren Schema.
*   **Wiederverwendbares Layout**: Jedes neue Audit kopiert das standardisierte Markdown-Dokumenten-Template.
*   **Keine Ad-Hoc-Ordner**: Das Anlegen nicht spezifizierter Unterordner im Audit-Verzeichnis ist untersagt.

---

## 3. Standard-Repository-Struktur (Standard Repository Structure)

Alle operativen BECC-Aktivitäten werden im Verzeichnis `docs/engineering-communication/stewardship/` organisiert.

### Verzeichnishierarchie:

```text
docs/
└── engineering-communication/
    └── stewardship/
        │
        ├── pilots/                  ◄── Validierungsläufe (z. B. Pilot 1)
        │   ├── PILOT-1-CHARTER.md
        │   └── ...
        │
        ├── operations/              ◄── Produktive Audits (Operations)
        │   ├── BA-001/              ◄── BridGenta Pilot (Archiviert / Referenz)
        │   ├── BA-002/              ◄── BridGenta Audit 2
        │   ├── AC-001/              ◄── AEOcortex Audit 1
        │   ├── LP-001/              ◄── Lumina Praxis Audit 1
        │   └── ...
        │
        ├── BECC-ASSESSMENT-MATRIX.md
        ├── BECC-ASSESSMENT-METHODOLOGY.md
        ├── BECC-ASSESSMENT-LEDGER.md
        └── ...
```

### Beschreibung der Ordner:
*   `stewardship/pilots/`: Enthält die Dokumente der ersten operativen Validierung (Pilot 1). Dieser Ordner dient als historischer Nachweis der Framework-Validierung.
*   `stewardship/operations/`: Das produktive Hauptverzeichnis für alle echten Projektprüfungen im regulären Betrieb. Jede Prüfung wird hier in einem eigenen Projekt- und ID-Verzeichnis isoliert.

---

## 4. Layout einer Audit-Arbeitsumgebung (Assessment Workspace Layout)

Jeder Audit-Ordner (z. B. `operations/BA-002/`) muss exakt die folgenden standardisierten Markdown-Dokumente enthalten:

1.  `ASSESSMENT-REQUEST.md` (Prüfungsantrag):
    *   *Zweck*: Formeller Antrag zur Durchführung des Audits mit Benennung des Ziel-Artefakts und der Rollen.
2.  `BASELINE-DEFINITION.md` (Baseline-Festlegung):
    *   *Zweck*: Einfrieren des Dokumentenstands (Commit-Hash) vor Prüfungsbeginn.
3.  `COMPLIANCE-ASSESSMENT.md` (Erstprüfung):
    *   *Zweck*: Durchführung der eigentlichen Konformitätsprüfung anhand der Matrix-Fragen.
4.  `FINDINGS-REGISTER.md` (Befundregister):
    *   *Zweck*: Detaillierte Auflistung aller Abweichungen (Findings) mit Eindeutigkeits-IDs.
5.  `ENGINEERING-DECISION-REVIEW.md` (Entscheidungsbericht):
    *   *Zweck*: Dokumentation der Governance-Entscheidungen (Accept/Defer/Reject) für jeden Befund.
6.  `CONTROLLED-REMEDIATION-SPECIFICATION.md` (Behebungsspezifikation):
    *   *Zweck*: Präzise Anweisungen und Arbeitspakete zur Behebung der Mängel.
7.  `POST-REMEDIATION-ASSESSMENT.md` (Nachprüfung):
    *   *Zweck*: Vergleichende Abschlussprüfung nach erfolgter Behebung zur Messung des Qualitätsgewinns.
8.  `ASSESSMENT-CLOSURE.md` (Audit-Schließung):
    *   *Zweck*: Formelle Unterzeichnung und Archivierungsfreigabe durch den Project Owner.

---

## 5. Namenskonventionen (Naming Convention)

*   **Ordnername**: Der Name des Audit-Ordners entspricht exakt der zugewiesenen Assessment ID im Schema `[Projektkürzel]-[Prüfungsnummer]` (z. B. `BA-002`, `AC-001`).
*   **Dateiname**: Dateinamen müssen in Großbuchstaben verfasst sein und Bindestriche statt Leerzeichen nutzen (z. B. `BASELINE-DEFINITION.md`).
*   **Identifikator-Verwendung**: Innerhalb der Dokumente müssen die IDs konsistent referenziert werden (z. B. `FIN-BA-002-01` für den ersten Befund des Audits BA-002).

---

## 6. Zuordnung zum operativen Lebenszyklus (Lifecycle Mapping)

Die Dokumente im Workspace bilden den chronologischen Ablauf des BECC-Audit-Lebenszyklus ab:

```text
  Audit-Status           Dokument im Workspace
 ──────────────────────────────────────────────────────────
  Registered        ──►  ASSESSMENT-REQUEST.md
       │
       ▼
  Authorized        ──►  BASELINE-DEFINITION.md
       │
       ▼
  In Progress       ──►  COMPLIANCE-ASSESSMENT.md
                         FINDINGS-REGISTER.md
       │
       ▼
  Assessment Compl. ──►  ENGINEERING-DECISION-REVIEW.md
                         CONTROLLED-REMEDIATION-SPECIFICATION.md
       │
       ▼
  Remediation Compl.──►  [Remediation am Ziel-Dokument]
       │
       ▼
  Validated         ──►  POST-REMEDIATION-ASSESSMENT.md
       │
       ▼
  Closed            ──►  ASSESSMENT-CLOSURE.md
```

---

## 7. Interaktion mit dem Stewardship-System (Relationships)

Die dezentralen Arbeitsumgebungen erzeugen die operativen Rohdaten für das zentrale Stewardship:
*   **Assessment Ledger**: Nach dem Übergang in den Status *Closed* trägt der Prüfer die Metadaten des Arbeitsbereichs im zentralen Ledger (`stewardship/BECC-ASSESSMENT-LEDGER.md`) ein.
*   **Kennzahlen-System**: Die im `POST-REMEDIATION-ASSESSMENT.md` ermittelte Konformitätsgüte (Delta) fließt in die aggregierten Framework-Metriken ein.
*   **Änderungsregister**: Im `ASSESSMENT-CLOSURE.md` vermerkte Auslegungsschwierigkeiten werden als Stewardship-Input an das Änderungsregister gemeldet.

---

## 8. Archivierung & Aufbewahrung (Archiving)

*   **Unveränderlichkeit**: Sobald die Datei `ASSESSMENT-CLOSURE.md` committet und vom Project Owner genehmigt wurde, ist der gesamte Ordner eingefroren.
*   **Dauerhafte Aufbewahrung**: Audit-Ordner verbleiben permanent im Repository, um die historische Evolution der Dokumentenqualität nachzuweisen.
*   **Ersetzung (Superseded)**: Wird ein Projekt zu einem späteren Zeitpunkt erneut geprüft, wird ein neuer Ordner angelegt (z. B. `BA-003`). Der alte Ordner `BA-002` bleibt vollständig erhalten.

---

## 9. Regeln zur zukünftigen Erweiterung (Future Expansion)

1.  Für jedes neue Projekt wird durch den Constitutional Architect ein neues zweistelliges Kürzel definiert.
2.  Die Zählung der Audits beginnt für jedes Projekt zwingend bei `001`.
3.  Das Kopieren oder Wiederverwenden bestehender Workspace-Ordner für neue Prüfungen ist strengstens untersagt, um ID-Kollisionen zu vermeiden.

---

## 10. Repository-Engineering-Deklaration (Declaration)

Die Verfassungsverwaltung deklariert hiermit:
*   Die Operational Assessment Workspace Specification ist ab sofort der **verbindliche Repository-Standard** für die Ablage aller BECC-Dokumentenprüfungen.
*   Zukünftige Audits, die dieser Struktur nicht entsprechen, erhalten keine formelle Freigabe und werden nicht im Ledger registriert.

---

[Zurück zur BECC-Übersicht](../README.md)
