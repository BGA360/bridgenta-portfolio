# BECC Operations — Produktive Dokumentenprüfungen

Dieses Verzeichnis ist die offizielle und permanente Repository-Arbeitsumgebung für alle produktiven Dokumentenprüfungen (Operational Assessments) der **BridGenta Engineering Communication Constitution (BECC)** nach deren Freigabe (General Availability).

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist eine **technische Verzeichnishilfe**. Sie enthält keine konstitutionellen Regeln und dient ausschließlich der geordneten Ablage von Audit-Nachweisen.

---

## 1. Zweck & Abgrenzung (Purpose)

Der Ordner `operations/` dient der Aufbewahrung und Dokumentation aller produktiven BECC-Audits. 
*   **Pilots**: Validierungsläufe des Frameworks (wie Pilot 1) verbleiben permanent im Verzeichnis [`stewardship/pilots/`](../pilots/).
*   **Operations**: Alle regulären Projektbewertungen ab Version v1.0 GA werden in diesem Ordner ([`stewardship/operations/`](./)) organisiert.

---

## 2. Grundsätze der Arbeitsumgebung (Workspace Philosophy)

Jeder Prüfungsverlauf in diesem Verzeichnis folgt den Regeln der [BECC Operational Assessment Workspace Specification](../BECC-OPERATIONAL-WORKSPACE-SPECIFICATION.md):
*   **Ein Audit = Ein Ordner**: Jede Prüfung (z. B. `BA-002`) liegt isoliert in einem eigenen Ordner.
*   **Eine Arbeitsumgebung = Eine ID**: Der Ordnername entspricht exakt der zugewiesenen Assessment-Kennung.
*   **Revisionssichere Historie**: Abgeschlossene Audit-Umgebungen sind permanent und unveränderlich.
*   **Keine Ad-Hoc-Ordner**: Unstrukturierte Dateianordnungen oder temporäre Hilfsordner sind unzulässig.

---

## 3. Verzeichnisstruktur (Workspace Structure)

Die Anordnung der Ordner in diesem Verzeichnis folgt der Projekt- und Prüfungsnummerierung:

```text
operations/
├── README.md               ◄── Dieses Dokument
│
├── BA-002/                 ◄── [Beispiel] Zweites Audit für BridGenta
├── BA-003/                 ◄── [Beispiel] Drittes Audit für BridGenta
├── AC-001/                 ◄── [Beispiel] Erstes Audit für AEOcortex
├── LP-001/                 ◄── [Beispiel] Erstes Audit für Lumina Praxis
└── SC-001/                 ◄── [Beispiel] Erstes Audit für StarCleaners
```

> [!IMPORTANT]
> Die oben aufgeführten Projektordner (wie `BA-002`, `AC-001`) sind lediglich Beispiele. Sie werden erst bei offiziellem Bedarf durch ein autorisiertes Audit physisch angelegt.

---

## 4. Struktur zukünftiger Audit-Ordner (Assessment Folder Layout)

Jeder neu erstellte Audit-Ordner muss zwingend die 8 standardisierten Markdown-Dokumente des BECC-Prüfungslebenszyklus enthalten:

```text
operations/[Assessment-ID]/
├── ASSESSMENT-REQUEST.md                   ◄── Prüfungsantrag & Rollen
├── BASELINE-DEFINITION.md                  ◄── Einfrieren des Zielcommits
├── COMPLIANCE-ASSESSMENT.md                ◄── Durchführung Erstprüfung
├── FINDINGS-REGISTER.md                    ◄── Erfassung aller Befunde
├── ENGINEERING-DECISION-REVIEW.md          ◄── Entscheidungen zur Behebung
├── CONTROLLED-REMEDIATION-SPECIFICATION.md  ◄── Arbeitspakete & Kriterien
├── POST-REMEDIATION-ASSESSMENT.md          ◄── Vergleichende Nachprüfung
└── ASSESSMENT-CLOSURE.md                   ◄── Formelle Schließung & Sign-off
```

---

## 5. Arbeitsumgebungen automatisch generieren (Workspace Generator)

Um konsistente und standardkonforme Arbeitsumgebungen zu gewährleisten, steht ein PowerShell-Skript zur Verfügung, das den ersten Schritt eines Audits automatisiert.

### Skript-Ablauf & Governance
*   **Ablageort des Skripts**: `docs/engineering-communication/stewardship/operations/scripts/create-assessment-workspace.ps1`
*   **Erzeugte Artefakte**: Das Skript erstellt ausschließlich den neuen Ordner `operations/[Assessment-ID]/` sowie die beiden Einstiegsdateien `ASSESSMENT-CONFIG.yml` und `ASSESSMENT-REQUEST.md`.
*   **Governance-Erzwingung**: Nachfolgende Dokumente des Lebenszyklus (wie `BASELINE-DEFINITION.md`, `COMPLIANCE-ASSESSMENT.md` etc.) werden **nicht** generiert und müssen im Verlauf des Audit-Prozesses physisch erstellt und formell freigegeben werden.

### Benötigte Parameter (Parameters)

| Parameter | Typ | Beschreibung | Beispiel |
| :--- | :--- | :--- | :--- |
| `AssessmentId` | String (Mandatory) | Eindeutige Kennung des Audits (Muster: `^[A-Z]{2,4}-\d{3}$`). | `AC-001` |
| `ProjectName` | String (Mandatory) | Name des zu prüfenden Projekts. | `AEOcortex` |
| `ArtifactPath` | String (Mandatory) | Repository-relativer Pfad zum Ziel-Artefakt. | `src/content/projects/aeocortex.md` |
| `ProductionUrl` | String (Mandatory) | Produktiv-URL des veröffentlichten Berichts. | `https://bridgenta.de/project-aeocortex/` |
| `Language` | String (Optional) | Sprache der Dokumentation (Default: `German`). | `German` |
| `ReadingLevel` | String (Optional) | Ziel-Leserstufe nach GER (Default: `CEFR B2`). | `CEFR B2` |
| `ProjectOwner` | String (Optional) | Eigner des Ziel-Projekts (Default: `BGA360`). | `BGA360` |
| `FrameworkVersion` | String (Optional) | Genutztes BECC-Framework (Default: `v1.0 GA`). | `v1.0 GA` |
| `AssessmentType` | String (Optional) | Typ des Audits (Default: `Full Operational Assessment`). | `Full Operational Assessment` |

### Beispiel für die Ausführung (Example Execution)

```powershell
.\docs\engineering-communication\stewardship\operations\scripts\create-assessment-workspace.ps1 `
    -AssessmentId AC-001 `
    -ProjectName "AEOcortex" `
    -ArtifactPath "src/content/projects/aeocortex.md" `
    -ProductionUrl "https://bridgenta.de/project-aeocortex/" `
    -Language "German" `
    -ReadingLevel "CEFR B2"
```

### Erwartete Ordnerstruktur nach Ausführung (Expected Output)

```text
operations/
└── AC-001/
    ├── ASSESSMENT-CONFIG.yml
    └── ASSESSMENT-REQUEST.md
```

---

## 6. Namenskonvention (Naming Convention)

*   **Identifikator**: Die Ordnernamen entsprechen exakt der ID (z. B. `BA-002`, `AC-001`, `LP-001`, `SC-001`).
*   **Eigenschaften**: IDs sind permanent, eindeutig und werden nach ihrer Vergabe niemals wiederverwendet oder umbenannt.

---

## 7. Integration im Stewardship-System (Relationships)

Die operativen Audits in diesem Verzeichnis liefern die notwendigen Belege für die übergeordneten Stewardship-Prozesse:
*   Sie speisen das zentrale **Bewertungsbuch (Assessment Ledger)** ([`BECC-ASSESSMENT-LEDGER.md`](../BECC-ASSESSMENT-LEDGER.md)).
*   Ihre Ergebnisse fließen in die statistische Bewertung des **Kennzahlen-Systems (Metrics)** ([`BECC-OPERATIONAL-METRICS.md`](../BECC-OPERATIONAL-METRICS.md)) ein.
*   Prozesslücken oder Unklarheiten in den Standards dienen als direkte Eingabe für das **Änderungsregister** ([`BECC-CONSTITUTIONAL-AMENDMENT-REGISTER.md`](../BECC-CONSTITUTIONAL-AMENDMENT-REGISTER.md)).

---

## 8. Archivierung & Erhaltung (Archiving)

*   **Schreibschutz**: Sobald die Datei `ASSESSMENT-CLOSURE.md` von allen Rollen gezeichnet wurde, gilt das Audit als archiviert und darf nicht mehr bearbeitet werden.
*   **Historischer Wert**: Nachweise und Befunde sind permanent im Repository aufzubewahren und dürfen nicht gelöscht werden, um Revisionssicherheit zu gewährleisten.

---

[Zurück zur BECC-Übersicht](../../README.md)
