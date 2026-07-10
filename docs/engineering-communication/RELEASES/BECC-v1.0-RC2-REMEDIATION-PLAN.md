# Sanierungsplan (Remediation Plan) — BECC v1.0 Release Candidate 2 (RC2)

Dieses Dokument stellt den offiziellen Sanierungsplan für den zweiten **Release Candidate (RC2)** der **BridGenta Engineering Communication Constitution (BECC)** dar. Es dokumentiert die Ergebnisse der unabhängigen Audits von RC1, bewertet die Befunde aus ingenieurtechnischer Sicht und legt die Governance-Entscheidungen sowie die Erfolgskriterien für RC2 fest.

---

## 1. Zweck (Purpose)

Der Zweck dieses Dokuments besteht darin, sämtliche Befunde der unabhängigen Audits zu erfassen, zu bewerten und zu steuern, bevor Änderungen am BECC-Framework vorgenommen werden. 

Nach Abschluss der Entwicklungs-Sprints für BECC v1.0 RC1 wurde das Framework drei unabhängigen Audits unterzogen:
- **Claude**: Constitutional Architecture Audit
- **Codex**: Engineering Implementation Audit
- **Antigravity**: Constitutional Compliance Audit

Dieser Sanierungsplan dient als einzige Quelle der Wahrheit (Single Source of Truth - SSOT) für alle technischen Entscheidungen und Umsetzungen im Rahmen des Übergangs von RC1 zu RC2. Er stellt sicher, dass jede Änderung auf einer klaren Bewertung und einem formellen Beschluss basiert.

---

## 2. Review-Philosophie (Review Philosophy)

Sämtliche Befunde und Empfehlungen aus den Audits werden als beratende Vorschläge (Recommendations) und nicht als automatische Änderungsanweisungen behandelt. 

Ob ein Befund akzeptiert und umgesetzt wird, entscheidet sich auf Basis von:
- **Technischer Evidenz**: Empirische Notwendigkeit, Behebung von Fehlern oder Inkonsistenzen.
- **Architektonischer Integrität**: Wahrung der Kernstruktur der BECC ohne Einführung von konzeptionellem Drift oder Redesigns.
- **Scope-Disziplin**: Vermeidung von unnötigem Funktionszuwachs (Scope Creep) oder Überengineering vor Erreichen der General Availability (GA).

---

## 3. Entscheidungs-Kategorien (Decision Categories)

Um eine klare Bewertung und Rückverfolgbarkeit zu gewährleisten, wird jeder Befund einer der folgenden Kategorien zugeordnet:

- **Akzeptieren (Accept)**: Der Befund ist gültig und wird exakt wie empfohlen umgesetzt.
- **Akzeptieren mit Modifikation (Accept with Modification)**: Der Befund ist im Kern berechtigt, die konkrete Umsetzung wird jedoch angepasst, um Architekturschäden oder Überengineering zu vermeiden.
- **Untersuchung erforderlich (Investigation Required)**: Die technische Machbarkeit oder die Auswirkung auf andere Teilsysteme erfordert weitere Analysen, bevor eine endgültige Entscheidung getroffen werden kann.
- **Zurückstellen (Defer)**: Der Befund wird grundsätzlich akzeptiert, seine Umsetzung wird jedoch auf ein zukünftiges Release nach Erreichen der General Availability (GA) verschoben.
- **Ablehnen (Reject)**: Der Befund wird nicht umgesetzt, da er den Verfassungsprinzipien widerspricht, keinen technischen Mehrwert bietet oder auf falschen Annahmen beruht.

---

## 4. Sanierungsregister (Remediation Register)

Das folgende Register bietet eine strukturierte Übersicht über alle identifizierten Audit-Befunde:

| ID | Befund (Finding) | Prüfer (Auditor) | Technische Bewertung (Assessment) | Entscheidung (Decision) | Begründung (Rationale) | Ziel-Release (Target) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RC2-001** | Ersetzen absoluter Repository-Links durch relative Links | Claude, Codex | Absolute `file:///`-Links sind systemspezifisch und brechen bei der Verwendung auf anderen Entwicklergeräten oder in CI/CD-Pipelines. | **Akzeptieren** | Verbessert die Portabilität und Integrität der Verfassungsdokumente über verschiedene Umgebungen hinweg. | v1.0-RC2 | Ausstehend |
| **RC2-002** | Überprüfung multipler kanonischer Engineering-Abläufe | Claude | Die parallele Dokumentation von Prozessen kann zu Inkonsistenzen führen. Die Abläufe müssen harmonisiert und klar referenziert werden. | **Akzeptieren mit Modifikation** | Harmonisierung und gegenseitige Referenzierung bestehender Abläufe (z. B. in [workflow.md](file:///c:/antigravity/statichtmlpro/fdrefs/docs/workflow.md)) ohne Änderung der Kernprozesslogik. | v1.0-RC2 | Ausstehend |
| **RC2-003** | Klarstellung der Begriffe „Designed Governance“ vs. „Operational Governance“ | Claude | Die Unterscheidung zwischen verfassungsgebenden Definitionen und deren operativer Anwendung im Release-Zyklus sollte präziser formuliert werden. | **Akzeptieren** | Schärft das Verständnis der Governance-Ebenen und verhindert Missverständnisse bei der Anwendung. | v1.0-RC2 | Ausstehend |
| **RC2-004** | Hinzufügen von Repository-Governance-Dokumenten (`CONTRIBUTING.md`, `CODEOWNERS`, `Maintainer Guide`) | Codex | Fehlende Standard-Governance-Dateien im Repository erschweren die strukturierte Zusammenarbeit und Zuweisung von Zuständigkeiten. | **Akzeptieren** | Stellt die Einhaltung professioneller Repository-Standards sicher und regelt die Team-Kollaboration. | v1.0-RC2 | Ausstehend |
| **RC2-005** | Einführung eines Release-Manifests | Codex | Ein strukturiertes Release-Manifest erhöht die Integrität, Vollständigkeit und Nachvollziehbarkeit des Releases. | **Akzeptieren** | Erstellung eines maschinenlesbaren Manifests (`release-manifest.json`), das alle Artefakte und Prüfsummen des Releases erfasst. | v1.0-RC2 | Ausstehend |
| **RC2-006** | Demonstration der Governance durch einen realen Verfassungsänderungsprozess | Claude | Die Funktionsweise eines formellen Änderungsverfahrens (Amendments) soll an einem praktischen Beispiel demonstriert werden. | **Akzeptieren mit Modifikation** | Zur Vermeidung vorzeitiger Verfassungsänderungen vor GA wird ein simuliertes Änderungsverfahren (Mock-Amendment) in einem separaten Referenzdokument dokumentiert. | v1.0-RC2 | Ausstehend |
| **RC2-007** | Repository-Automatisierung (Markdown-Linting, CI-Validierung, Link-Prüfung) | Codex | Manuelle Prüfungen sind fehleranfällig. Automatisierte Validierungen in der CI sichern die Qualität dauerhaft. | **Akzeptieren** | Einführung von Skripten und CI-Workflows zur automatischen Überprüfung von Markdown-Stilen und Link-Integrität. | v1.0-RC2 | Ausstehend |
| **RC2-008** | Erhalt der bestehenden Verfassungsarchitektur | Claude, Codex, Antigravity | Die Kernstruktur der BECC ist stabil und erfordert kein Redesign oder tiefgreifende konzeptionelle Änderungen. | **Akzeptieren** | Schützt das bestehende Framework vor Regressionsrisiken; alle Sanierungsschritte sind rein korrigierend oder additiv. | v1.0-RC2 | Ausstehend |

---

## 5. Detaillierte Bewertung (Detailed Assessment)

### RC2-001: Ersetzen absoluter Repository-Links durch relative Links
* **Befund (Finding)**: Ersetzung aller absoluten Links, die das Protokoll `file:///` und absolute Windows-/Unix-Pfade verwenden, durch relative Markdown-Verknüpfungen.
* **Prüfer (Auditor)**: Claude, Codex
* **Technische Bewertung (Engineering Assessment)**: In Dokumenten wie [BECC-v1.0-RC1.md](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/RELEASES/BECC-v1.0-RC1.md) wurden absolute Dateipfade (z. B. `file:///c:/antigravity/...`) verwendet. Diese Links sind in CI/CD-Pipelines und auf anderen Entwickler-Workstations nicht auflösbar.
* **Entscheidung (Decision)**: **Akzeptieren**
* **Technische Begründung (Technical Rationale)**: Durch die Umstellung auf relative Pfade (z. B. `../README.md` statt absoluter Pfade) wird die Portabilität der Dokumentation gewährleistet. Dies ermöglicht eine nahtlose Navigation im lokalen Editor, im Web-Repository (GitHub) und in der gerenderten Astro-Umgebung.
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

### RC2-002: Überprüfung multipler kanonischer Engineering-Abläufe
* **Befund (Finding)**: Harmonisierung und Review der verschiedenen im Workspace dokumentierten Entwicklungs- und Dokumentationsprozesse.
* **Prüfer (Auditor)**: Claude
* **Technische Bewertung (Engineering Assessment)**: Es existieren parallele Beschreibungen von Abläufen in [workflow.md](file:///c:/antigravity/statichtmlpro/fdrefs/docs/workflow.md), [publication-governance.md](file:///c:/antigravity/statichtmlpro/fdrefs/docs/publication-governance.md) und den BECC-QA-Richtlinien. Diese müssen einander klar zugeordnet und auf Konsistenz geprüft werden.
* **Entscheidung (Decision)**: **Akzeptieren mit Modifikation**
* **Technische Begründung (Technical Rationale)**: Um Verwirrung bei der Prozessanwendung zu vermeiden, werden die Dokumente gegenseitig referenziert und redundante Beschreibungen bereigt. Eine Änderung der eigentlichen Freigabeschranken oder des Veröffentlichungsprozesses der BPGA erfolgt dabei nicht, um den Umfang der Änderungen minimal zu halten.
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

### RC2-003: Klarstellung der Begriffe „Designed Governance“ vs. „Operational Governance“
* **Befund (Finding)**: Präzisierung der Begriffe zur Unterscheidung von Verfassungsänderungen und dem operativen Release-Management.
* **Prüfer (Auditor)**: Claude
* **Technische Bewertung (Engineering Assessment)**: Die aktuelle Formulierung in den QA-Standards vermischt teilweise das Design des Regelwerks (Designed Governance) mit der operativen Einhaltung und Überprüfung in Sprints (Operational Governance).
* **Entscheidung (Decision)**: **Akzeptieren**
* **Technische Begründung (Technical Rationale)**: Eine präzise Trennung stellt klar, dass Änderungen an den BECC-Grundlagen (Designed Governance) einem strengeren Änderungsverfahren (Amendments) unterliegen als rein prozedurale Validierungen oder Formatprüfungen im Rahmen eines Release-Zyklus (Operational Governance).
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

### RC2-004: Hinzufügen von Repository-Governance-Dokumenten (`CONTRIBUTING.md`, `CODEOWNERS`, `Maintainer Guide`)
* **Befund (Finding)**: Einführung standardisierter Governance-Dateien für das Git-Repository.
* **Prüfer (Auditor)**: Codex
* **Technische Bewertung (Engineering Assessment)**: Dem Repository fehlen explizite Kollaborations- und Zuweisungsregeln. Ein `CODEOWNERS`-File sowie Beiträge- und Wartungsrichtlinien stärken die Einhaltung des BGCF.
* **Entscheidung (Decision)**: **Akzeptieren**
* **Technische Begründung (Technical Rationale)**: Diese Dateien etablieren formale Leitplanken für die Repository-Nutzung. Die `CONTRIBUTING.md` regelt den Beitragsprozess, die `CODEOWNERS` definiert Zuständigkeiten für die Review-Pflicht und der `Maintainer Guide` sichert die Einhaltung der Release-Schritte.
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

### RC2-005: Einführung eines Release-Manifests
* **Befund (Finding)**: Einführung eines maschinenlesbaren Manifests zur Sicherung und Verifizierung der Release-Artefakte.
* **Prüfer (Auditor)**: Codex
* **Technische Bewertung (Engineering Assessment)**: Bisher erfolgt die Freigabe rein dokumentarisch. Ein Manifest ermöglicht die automatisierte Integritätsprüfung aller Release-Dateien.
* **Entscheidung (Decision)**: **Akzeptieren**
* **Technische Begründung (Technical Rationale)**: Die Einführung einer Datei `release-manifest.json` für RC2 stellt sicher, dass alle verfassungsrelevanten Dokumente kryptografisch (z. B. per SHA-256-Prüfsumme) erfasst sind. Dies ermöglicht eine automatisierte Konsistenzprüfung bei der Installation des Frameworks.
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

### RC2-006: Demonstration der Governance durch einen realen Verfassungsänderungsprozess
* **Befund (Finding)**: Durchführung und Dokumentation eines realen Amendment-Prozesses zur praktischen Veranschaulichung der Verfassungs-Governance.
* **Prüfer (Auditor)**: Claude
* **Technische Bewertung (Engineering Assessment)**: Eine echte Verfassungsänderung vor dem Erreichen der General Availability (GA) birgt das Risiko, den mühsam stabilisierten Stand der RC1 aufzuweichen.
* **Entscheidung (Decision)**: **Akzeptieren mit Modifikation**
* **Technische Begründung (Technical Rationale)**: Anstelle einer echten Verfassungsänderung wird eine simulierte Änderung (Mock-Amendment) als Schritt-für-Schritt-Fallstudie in einem separaten Referenzdokument erstellt. Dies demonstriert den Governance-Prozess von der Einreichung über das Review bis hin zur Autorisierung und Fusion (Merge), ohne die Verfassungstexte der RC1 inhaltlich zu verändern.
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

### RC2-007: Repository-Automatisierung (Markdown-Linting, CI-Validierung, Link-Prüfung)
* **Befund (Finding)**: Automatisierung von Qualitätsprüfungen zur Einhaltung von Dokumentations- und Codestandards.
* **Prüfer (Auditor)**: Codex
* **Technische Bewertung (Engineering Assessment)**: Bislang müssen Format- und Linkfehler manuell gesucht werden. Dies ist ineffizient und fehleranfällig.
* **Entscheidung (Decision)**: **Akzeptieren**
* **Technische Begründung (Technical Rationale)**: Die Integration von Linter- und Link-Checker-Tools in die lokale Build-Pipeline (über npm-Skripte) und die CI (GitHub Actions) stellt sicher, dass keine fehlerhaften Dokumente in den Release-Zweig gelangen.
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

### RC2-008: Erhalt der bestehenden Verfassungsarchitektur
* **Befund (Finding)**: Beibehaltung der in den Sprints 0.1 bis 1.0 etablierten Dokumentations- und Verfassungsarchitektur der BECC.
* **Prüfer (Auditor)**: Claude, Codex, Antigravity
* **Technische Bewertung (Engineering Assessment)**: Die vorliegenden Audits bestätigen, dass das grundlegende Architekturdesign der BECC valide und funktional ist. Ein strukturelles Redesign ist weder erforderlich noch zweckmäßig.
* **Entscheidung (Decision)**: **Akzeptieren**
* **Technische Begründung (Technical Rationale)**: Diese Entscheidung schützt das Projekt vor Regressionsrisiken. Alle Sanierungsschritte für RC2 konzentrieren sich auf operative Ergänzungen und redaktionelle Fehlerbereinigungen, ohne die konstitutionelle Grundlage neu zu entwerfen.
* **Ziel-Meilenstein (Target Milestone)**: BECC v1.0-RC2
* **Aktueller Status (Current Status)**: Ausstehend

---

## 6. Erfolgskriterien für RC2 (RC2 Success Criteria)

Der Meilenstein BECC v1.0 RC2 gilt als erfolgreich abgeschlossen, wenn folgende Bedingungen erfüllt sind:

1. **Vollständige Umsetzung der akzeptierten Befunde**:
   - Alle absoluten Links in den Dokumenten wurden durch relative Links ersetzt (RC2-001).
   - Die kanonischen Abläufe wurden überprüft und konsistent referenziert (RC2-002).
   - Die Begriffe „Designed Governance“ und „Operational Governance“ sind präzise abgegrenzt (RC2-003).
   - Die Dateien `CONTRIBUTING.md`, `CODEOWNERS` und der `Maintainer Guide` wurden hinzugefügt (RC2-004).
   - Ein Release-Manifest (`release-manifest.json`) wurde für RC2 generiert (RC2-005).
   - Das simulierte Änderungsverfahren (Mock-Amendment) wurde dokumentiert (RC2-006).
   - Die Repository-Automatisierung (Linter, Link-Check) ist aktiv und konfiguriert (RC2-007).
2. **Architektonische Integrität**:
   - Die Kernstruktur der BECC wurde unverändert beibehalten (RC2-008).
3. **Fehlerfreier Build**:
   - Die Ausführung von `npm run build` verläuft fehlerfrei.
4. **Qualitätssicherung**:
   - Alle relativen Links verweisen auf existierende Dateien (keine toten Links).
   - Der Übergang wurde durch ein formelles Review der beteiligten Audit-Agenten bestätigt.

---

## 7. Entscheidungsbefugnis (Decision Authority)

Alle Audit-Befunde und die in diesem Dokument aufgeführten Sanierungsentscheidungen dienen als fachliche Empfehlungen der Auditoren. 

Die endgültige Entscheidungs- und Freigabebefugnis für die Implementierung verbleibt beim **Constitutional Architect (BGA360)** und den in der BridGenta-Verfassung festgelegten Instanzen. 

Änderungen an den Dokumenten dürfen erst nach formeller Genehmigung dieses Plans und Freigabe des entsprechenden Feature-Branches in Kraft treten. Jeglicher Merge in den Hauptzweig (`main`) ist direkt verboten und muss über Pull Requests abgewickelt werden.

---

## 8. Nächster Meilenstein (Next Milestone)

Mit der Genehmigung dieses Sanierungsplans wird die BECC RC2-Entwicklungsphase eingeleitet. Der Ablauf gestaltet sich wie folgt:

1. **Freigabe des Sanierungsplans**: Review und Freigabe des vorliegenden Dokuments durch den Stakeholder.
2. **Implementierung**: Umsetzung der freigegebenen Sanierungsmaßnahmen in einem isolierten Feature-Branch (`docs/becc-v1.0-rc2-remediation-plan`).
3. **Verifikation**: Durchführung aller automatisierten und manuellen Verifikationsprüfungen gemäß den Erfolgskriterien.
4. **GA-Bereitschaft**: Nach erfolgreichem Abschluss der RC2-Verifikation wird das Framework zur Vorbereitung auf die General Availability (GA) freigegeben.
