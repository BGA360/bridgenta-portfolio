# Sanierungsplan (Remediation Plan) — BECC v1.0 Release Candidate 2 (RC2)

Dieses Dokument stellt den offiziellen **Sanierungsplan (Remediation Plan)** für den zweiten **Release Candidate (RC2)** der **BridGenta Engineering Communication Constitution (BECC)** dar. Es transformiert die im Audit-Konsolidierungsregister erfassten Befunde in gesteuerte (governed) Sanierungspunkte (Remediation Items).

---

## 1. Zweck (Purpose)

Der Zweck dieses Sanierungsplans besteht darin, alle unabhängig geprüft und konsolidierten Audit-Befunde formal in das Release-Governance-Framework der BECC zu überführen. 

### Warum dieses Dokument existiert
Dieses Dokument dient als das offizielle Bindeglied zwischen den rohen Audit-Befunden und den späteren technischen Umsetzungen. Es stellt sicher, dass jeder Befund als formeller Arbeitsgegenstand (Remediation Item) registriert wird, bevor eine inhaltliche Bewertung oder Freigabe erfolgt.

### Warum es der Audit-Konsolidierung folgt
Nachdem im *Audit-Konsolidierungsregister* alle Befunde der Prüfer Claude, Codex und Antigravity strukturiert zusammengeführt wurden, müssen diese nun in konkrete, isolierte Arbeitspakete übersetzt werden. Die Konsolidierung stellt die Evidenz bereit; der Sanierungsplan überführt diese Evidenz in den Governance-Zyklus.

### Warum es der Prüfung der Engineering-Entscheidungen vorausgeht
Die Etablierung dieses Registers ist eine notwendige Voraussetzung für die darauffolgende **Prüfung der Engineering-Entscheidungen (Engineering Decision Review)**. Indem Arbeitspakte vorab formal und neutral beschrieben werden, wird eine objektive Bewertung ermöglicht. So wird verhindert, dass während der Bewertung neue Befunde erfunden oder bestehende ignoriert werden.

### Keine Autorisierung von Implementierungsarbeiten
Dieses Dokument autorisiert **keinerlei Implementierungs- oder Programmierarbeiten**. Es legt fest, *welche* ingenieurtechnischen Bedenken registriert sind, nicht *wie* oder *wann* diese gelöst werden. Alle aufgeführten Punkte befinden sich in einem vorläufigen Prüfstatus.

---

## 2. Geltungsbereich (Scope)

Der Geltungsbereich dieser Governance-Phase ist wie folgt definiert:
- Die konstitutionelle Architektur der BECC ist eingefroren (Frozen).
- Die Befunde aus den unabhängigen Framework-Audits sind vollständig konsolidiert.
- Kein Sanierungspunkt ist in dieser Phase genehmigt oder freigegeben.
- Es wurden keine ingenieurtechnischen Entscheidungen über Annahme oder Ablehnung getroffen.
- Es sind keine Implementierungsaktivitäten autorisiert.

---

## 3. Beziehung zur vorherigen Phase (Relationship to Previous Phase)

Dieses Dokument basiert direkt auf den Ergebnissen des *Audit-Konsolidierungsregisters (AUDIT_CONSOLIDATION_REGISTER.md)*. Es stellt die geordnete Governance-Transition von der Beweissicherung zur Maßnahmenverfolgung dar:

```text
Unabhängige Audits (Claude, Codex, Antigravity)
                     │
                     ▼
       Audit-Konsolidierungsregister
                     │
                     ▼
            RC2-Sanierungsplan
```

Jeder konsolidierte Audit-Befund wird eins-zu-eins in ein steuerbares Sanierungselement überführt, wodurch eine lückenlose Rückverfolgbarkeit (Traceability) über den gesamten Freigabezyklus hinweg gewährleistet bleibt.

---

## 4. RC2-Sanierungsregister (RC2 Remediation Register)

Das folgende Register führt alle registrierten Sanierungspunkte auf. Gemäß den Governance-Richtlinien enthält dieses Register **keine** Entscheidungen, Priorisierungen oder Aufwandsschätzungen.

### REM-RC2-001: Relative Markdown-Links
* **Zugehörige Befund-ID(s)**: RC2-001
* **Sanierungs-Titel**: Umstellung absoluter Links auf relative Pfade
* **Ingenieurtechnische Beschreibung**: Systemnahe absolute Pfade (wie `file:///c:/...`) müssen in allen Dokumenten des Frameworks durch relative Pfade ersetzt werden, um die Navigation im lokalen Editor, im Web-Repository und im Astro-Build anwendungsneutral zu gestalten.
* **Ursprüngliche Prüfer**: Claude, Codex
* **Ingenieurtechnischer Bereich**: Documentation Engineering
* **Konstitutioneller Bereich**: Gesamtes BECC-Framework (Phasen 1 & 2)
* **Erwarteter Nutzen**: Vollständige Portabilität der Dokumentationsbasis über unterschiedliche Workstations und CI/CD-Pipelines hinweg sowie Auflösbarkeit aller internen Verweise.
* **Zusammenhängende Sanierungspunkte**: REM-RC2-007
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Betrifft primär das Dokument `BECC-v1.0-RC1.md` und verstreute Verweise in den Standards.

---

### REM-RC2-002: Konsistenz der kanonischen Workflows
* **Zugehörige Befund-ID(s)**: RC2-002
* **Sanierungs-Titel**: Harmonisierung paralleler Prozessbeschreibungen
* **Ingenieurtechnische Beschreibung**: Die in `workflow.md`, `publication-governance.md` und den BECC-QA-Standards beschriebenen Abläufe müssen auf Konsistenz geprüft, gegenseitig verknüpft und von Redundanzen befreit werden.
* **Ursprüngliche Prüfer**: Claude
* **Ingenieurtechnischer Bereich**: Documentation Engineering / Process Alignment
* **Konstitutioneller Bereich**: Phase 2 — Operative Standards (`09-quality-assurance`)
* **Erwarteter Nutzen**: Vermeidung von Prozessverwirrung und fehlerhafter Anwendung der Freigabeschranken durch Entwickler.
* **Zusammenhängende Sanierungspunkte**: REM-RC2-003, REM-RC2-004, REM-RC2-008
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Die Kernlogik der Freigaben darf bei der Harmonisierung nicht verändert werden, um den Umfang minimal zu halten.

---

### REM-RC2-003: Präzisierung der Governance-Ebenen
* **Zugehörige Befund-ID(s)**: RC2-003
* **Sanierungs-Titel**: Begriffliche Abgrenzung von Designed und Operational Governance
* **Ingenieurtechnische Beschreibung**: In den Richtlinien muss eine scharfe Begriffstrennung zwischen der Gestaltung der Verfassung (Designed Governance) und der operativen Einhaltung in Sprints (Operational Governance) vorgenommen werden.
* **Ursprüngliche Prüfer**: Claude
* **Ingenieurtechnischer Bereich**: Governance / Terminology
* **Konstitutioneller Bereich**: Phase 2 — Operative Standards (`09-quality-assurance`)
* **Erwarteter Nutzen**: Klares Verständnis darüber, welche Änderungen ein formelles Verfassungs-Änderungsverfahren (Amendment) erfordern und welche im normalen Sprint-Review validiert werden.
* **Zusammenhängende Sanierungspunkte**: REM-RC2-002, REM-RC2-008
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Dient der konzeptionellen Stärkung des BGCF-Regelwerks.

---

### REM-RC2-004: Repository-Governance-Richtlinien
* **Zugehörige Befund-ID(s)**: RC2-004
* **Sanierungs-Titel**: Hinzufügen formaler Repository-Richtlinien
* **Ingenieurtechnische Beschreibung**: Erstellung und Integration der Dateien `CONTRIBUTING.md` (Beitragsregeln), `CODEOWNERS` (Review-Verteilung) und eines `Maintainer Guide` (Release-Verfahren) in die Repository-Wurzel.
* **Ursprüngliche Prüfer**: Codex
* **Ingenieurtechnischer Bereich**: Repository Engineering
* **Konstitutioneller Bereich**: Repository-Struktur / Kollaboration
* **Erwarteter Nutzen**: Etablierung klarer, standardisierter Leitplanken für Code-Beiträge und Veröffentlichungen unter Einhaltung des BGCF.
* **Zusammenhängende Sanierungspunkte**: REM-RC2-002, REM-RC2-005, REM-RC2-007
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Diese Dateien formalisieren den Review- und Veröffentlichungsprozess auf Git-Ebene.

---

### REM-RC2-005: Maschinenlesbares Release-Manifest
* **Zugehörige Befund-ID(s)**: RC2-005
* **Sanierungs-Titel**: Implementierung eines Release-Manifests
* **Ingenieurtechnische Beschreibung**: Generierung einer Datei `release-manifest.json` für jedes Release, die alle verfassungsrelevanten Dokumente kryptografisch (mittels SHA-256-Prüfsummen) und strukturell erfasst.
* **Ursprüngliche Prüfer**: Codex
* **Ingenieurtechnischer Bereich**: Release Engineering
* **Konstitutioneller Bereich**: Release-Integrität / Qualitätssicherung
* **Erwarteter Nutzen**: Ermöglicht die automatisierte und manipulationssichere Überprüfung der Vollständigkeit eines Release-Stands bei nachgelagerten Systeminstallationen.
* **Zusammenhängende Sanierungspunkte**: REM-RC2-004, REM-RC2-007
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Die Pflege des Manifests sollte im Maintainer Guide (REM-RC2-004) dokumentiert werden.

---

### REM-RC2-006: Fallstudie zum Verfassungsänderungsverfahren
* **Zugehörige Befund-ID(s)**: RC2-006
* **Sanierungs-Titel**: Dokumentation eines simulierten Änderungsverfahrens (Mock-Amendment)
* **Ingenieurtechnische Beschreibung**: Erstellung einer Schritt-für-Schritt-Fallstudie in einem separaten Referenzdokument, die den Ablauf einer Verfassungsänderung von der Einreichung über das Review bis zur Fusion (Merge) demonstriert.
* **Ursprüngliche Prüfer**: Claude
* **Ingenieurtechnischer Bereich**: Documentation Engineering / Governance Demonstration
* **Konstitutioneller Bereich**: Phase 2 — Operative Standards (`09-quality-assurance` / `08-review-feedback`)
* **Erwarteter Nutzen**: Praktische Anleitung für zukünftige Verfassungsänderungen, um Anwendungsfehler im realen Betrieb zu verhindern.
* **Zusammenhängende Sanierungspunkte**: REM-RC2-002, REM-RC2-003, REM-RC2-008
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Verhindert das Risiko, die echte Verfassung vor Erreichen des GA-Status durch vorzeitige Änderungen zu destabilisieren.

---

### REM-RC2-007: Automatisierte Qualitätsprüfungen in der CI/CD
* **Zugehörige Befund-ID(s)**: RC2-007
* **Sanierungs-Titel**: Integration automatisierter Linter und Link-Checker
* **Ingenieurtechnische Beschreibung**: Integration von Skripten zur Syntax- und Link-Validierung in die lokalen npm-Befehle und die GitHub Actions Workflow-Pipeline, um fehlerhafte Pull Requests automatisch zu blockieren.
* **Ursprüngliche Prüfer**: Codex
* **Ingenieurtechnischer Bereich**: Repository Engineering / Continuous Integration
* **Konstitutioneller Bereich**: Qualitätssicherung / Tooling
* **Erwarteter Nutzen**: Dauerhafte und fehlerfreie Qualitätssicherung ohne manuellen Review-Aufwand für Formatierungs- und Pfadfehler.
* **Zusammenhängende Sanierungspunkte**: REM-RC2-001, REM-RC2-004, REM-RC2-005
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Baut auf npm-Skripten auf, die lokal und in der CI ausgeführt werden können.

---

### REM-RC2-008: Bewahrung des konstitutionellen Designs
* **Zugehörige Befund-ID(s)**: RC2-008
* **Sanierungs-Titel**: Schutz der bestehenden Verfassungsstruktur
* **Ingenieurtechnische Beschreibung**: Sicherstellung, dass alle Korrekturen und Ergänzungen im Rahmen von RC2 das fundamentale Design und die Struktur der BECC-Sprints 0.1 bis 1.0 unverändert lassen.
* **Ursprüngliche Prüfer**: Claude, Codex, Antigravity
* **Ingenieurtechnischer Bereich**: Architecture Stability
* **Konstitutioneller Bereich**: Gesamtes BECC-Framework
* **Erwarteter Nutzen**: Schutz vor Regressionsrisiken und konzeptionellem Drift vor Erreichen der General Availability (GA).
* **Zusammenhängende Sanierungspunkte**: REM-RC2-002, REM-RC2-003, REM-RC2-006
* **Abhängigkeiten**: Keine
* **Unterstützende Notizen**: Wirkt als architektonische Leitplanke für alle anderen Sanierungsaktivitäten.

---

## 5. Ingenieurtechnische Kategorien (Engineering Categories)

Die registrierten Sanierungspunkte werden in folgende logische ingenieurtechnische Kategorien eingeordnet, um die Strukturierung der nachfolgenden Governance-Schritte zu unterstützen:

### Repository Engineering
Diese Kategorie betrifft die Dateistrukturen, Zugriffsrechte und Automatisierungen auf Ebene des Git-Repositories.
- **REM-RC2-004**: Hinzufügen formaler Repository-Richtlinien (`CONTRIBUTING.md`, `CODEOWNERS`, `Maintainer Guide`)
- **REM-RC2-007**: Integration automatisierter Linter und Link-Checker

### Release Engineering
Diese Kategorie betrifft die Integritätssicherung, Nachvollziehbarkeit und Validierung von Release-Ständen.
- **REM-RC2-005**: Implementierung eines Release-Manifests (`release-manifest.json`)

### Governance
Diese Kategorie befasst sich mit der begrifflichen Definition und praktischen Demonstration verfassungsmäßiger Abläufe.
- **REM-RC2-003**: Begriffliche Abgrenzung von Designed und Operational Governance
- **REM-RC2-006**: Dokumentation eines simulierten Änderungsverfahrens (Mock-Amendment Case Study)

### Documentation Engineering
Diese Kategorie betrifft die Portabilität, Konsistenz und Lesbarkeit der Dokumente.
- **REM-RC2-001**: Umstellung absoluter Links auf relative Pfade
- **REM-RC2-002**: Harmonisierung paralleler Prozessbeschreibungen

### Architecture Stability
Diese Kategorie dient dem Schutz des architektonischen Entwurfs vor strukturellen Veränderungen.
- **REM-RC2-008**: Schutz der bestehenden Verfassungsstruktur

---

## 6. Abhängigkeitsübersicht (Dependency Overview)

Um die spätere technische Bewertung zu erleichtern, werden hier die fachlichen Beziehungen und Abhängigkeiten zwischen den Sanierungspunkten beschrieben. Es wird ausdrücklich **keine** Umsetzungsreihenfolge festgelegt:

- **Abhängigkeit zwischen Link-Portabilität und Link-Prüfung**: 
  Die automatisierte Link-Prüfung (**REM-RC2-007**) setzt voraus, dass absolute filesystem-nahe Links (**REM-RC2-001**) entfernt wurden, da absolute `file:///`-Pfade in der CI-Pipeline nicht aufgelöst werden können und zu Fehlern führen würden.
- **Abhängigkeit zwischen Prozessharmonisierung und Begriffsklärung**: 
  Die Harmonisierung der Prozessdokumente (**REM-RC2-002**) wird inhaltlich von der klaren Definition der Governance-Ebenen (**REM-RC2-003**) beeinflusst. Eine klare Begriffstrennung bildet die semantische Grundlage für konsistente Ablaufbeschreibungen.
- **Abhängigkeit zwischen Repository-Dateien und Release-Manifest**: 
  Die Pflege und Erstellung des Release-Manifests (**REM-RC2-005**) muss prozedural im `Maintainer Guide` (**REM-RC2-004**) verankert werden, damit der Prozess bei zukünftigen Releases reproduzierbar ist.
- **Abhängigkeit der Stabilitätsregel**: 
  Der Schutz der Architektur (**REM-RC2-008**) bildet die übergeordnete Restriktion für alle inhaltlichen Überarbeitungen (insbesondere **REM-RC2-002**, **REM-RC2-003** und **REM-RC2-006**).

---

## 7. Ausgegrenzte Punkte (Items Outside RC2 Scope)

Folgende Beobachtungen und Ideen aus dem Audit-Konsolidierungsregister sind explizit **außerhalb des Geltungsbereichs** der RC2-Sanierung angesiedelt. Sie werden als Governance-Einträge erfasst, ohne dass in dieser Phase Entscheidungen darüber getroffen werden:

### Informationelle Beobachtungen (Audit-Observations)
- **Kopplung von Entwicklung und Präsentation im Repository**: Die gemeinsame Verwaltung von Code und internen Governance-Dokumenten in einem einzigen Repository.
- **Lokale Pfadvariablen in Skripten**: Lokale Pfadreferenzen in Workspace-Konfigurationen, die bei der lokalen Ausführung entstehen.
- **Build-Stabilität der Astro-Plattform**: Die fehlerfreie und stabile Ausführung von `npm run build` für die statischen Frontend-Seiten.

### Zukünftige Überlegungen und langfristige Ideen
- **Vollautomatisierte Manifest-Verifikation**: Einbindung eines CI-Schritts, der bei jedem Release die Prüfsummen aller Dateien im Repository automatisch mit der `release-manifest.json` abgleicht.
- **Multilinguale Erweiterung des Begriffsregisters**: Übersetzungssystem oder strukturiertes Glossar für nachgelagerte Entwicklungsprojekte.
- **Dual-Repository-Architektur**: Strukturierte Aufteilung der Codebasis in ein privates Entwicklungs-Workspace-Repository (`bridgenta-workspace`) für interne Governance und Agentenregeln sowie ein separates öffentliches Portfolio-Repository (`bridgenta-portfolio`) für die reine Präsentation.

---

## 8. Governance-Status (Governance Status)

Alle in diesem Dokument aufgeführten Sanierungspunkte befinden sich ausnahmslos in folgendem Governance-Status:

**Wartet auf formelle Prüfung der Engineering-Entscheidung (Awaiting Engineering Decision Review)**

Kein einziger Sanierungspunkt wurde in dieser Phase:
- akzeptiert (Accepted),
- mit Modifikation akzeptiert (Accepted with Modification),
- zurückgestellt (Deferred),
- abgelehnt (Rejected),
- oder für die Umsetzung freigegeben (Approved for Implementation).

---

## 9. Rückverfolgbarkeit (Traceability)

Jeder Sanierungspunkt in diesem Register ist direkt mit einem entsprechenden Befund aus dem *Audit-Konsolidierungsregister* verknüpft (z. B. `REM-RC2-001` verweist direkt auf `RC2-001`). 

Diese Rückverfolgbarkeit stellt sicher, dass:
1. Die Herkunft (Claude, Codex, Antigravity) jedes Punktes nachvollziehbar bleibt.
2. Keine Audit-Evidenz während der nachfolgenden Governance-Schritte verloren geht.
3. Die Verbindung zur ursprünglichen Fehlerbeschreibung stets erhalten bleibt.

Diese Traceability-Kette darf in den verbleibenden RC2-Phasen nicht unterbrochen werden.

---

## 10. Übergabe (Handover)

Dieser Sanierungsplan stellt die offizielle Governance-Eingangsbasis für den nächsten Release-Meilenstein dar:

**Engineering Decision Review**

Durch dieses Dokument werden **keinerlei Implementierungsaktivitäten autorisiert**. Die tatsächliche Umsetzung von Sanierungsmaßnahmen darf erst beginnen, nachdem:
1. Der *Engineering Decision Review* formal abgeschlossen und dokumentiert wurde.
2. Der Geltungsbereich (Scope) für RC2 offiziell eingefroren wurde.
3. Ein dedizierter *RC2-Implementierungsplan* durch den Constitutional Architect (BGA360) genehmigt wurde.
