# Changelog — BridGenta Engineering Communication Constitution (BECC)

Dieses Dokument erfasst alle konstitutionellen Meilensteine und Versionsfreigaben der BECC im BridGenta-Ökosystem.

---

## [1.0.0-RC2] — 2026-07-10

### Hinzugefügt
- **Automatisierte Qualitätskontrollen (Linting & Linkcheck)**: Einführung eines lokalen Node-basierten Linters (`lint_markdown.cjs`) und Linkcheckers (`check_markdown_links.cjs`, `audit_links.cjs`) in `/tooling/` zur statischen Dokumentenanalyse.
- **GitHub Actions CI Integration**: Einbindung der Validierungen in die `.github/workflows/deploy.yml` Pipeline, um jeden Pull Request automatisch vor und nach dem Build auf Formatierung und Linkfehler zu prüfen.
- **Maintainer- & Repository-Governance**: Erstellung von `/CONTRIBUTING.md` für Beitragsrichtlinien, `/CODEOWNERS` zur Zuweisung von Review-Zuständigkeiten und `RELEASES/MAINTAINER_GUIDE.md` für Release-Management.
- **Simulierte Amendment Fallstudie**: Erstellung von `09-quality-assurance/MOCK_AMENDMENT_CASE_STUDY.md` zur praktischen Demonstration von Verfassungsänderungsverfahren.
- **Kryptografische Integritätsabsicherung**: Bereitstellung von `RELEASES/release-manifest.json` mit SHA-256 Hashes aller BECC-Assets.
- **Governance-Klärung**: Integration klarer Definitionen für Designed Governance und Operational Governance im QA-Standard (`09-quality-assurance/ENGINEERING_COMMUNICATION_QA_STANDARD.md`).
- **Workflow-Harmonisierung**: Gegenseitige Cross-References in `workflow.md`, `publication-governance.md` und dem QA-Standard.

### Geändert
- **Relative Linkstruktur**: Alle absoluten `file:///` Links im gesamten `docs/` Verzeichnis wurden auf relative Pfade umgestellt, um vollständige Portabilität und fehlerfreie Linkprüfung zu gewährleisten.

---

## [1.0.0-RC1] — 2026-07-09

### Hinzugefügt
Dieses Release markiert die inhaltliche Fertigstellung der verfassungsmäßigen Struktur (Phases 1 & 2) und die Erstellung des ersten Release Candidates (RC1) für das unabhängige Framework-Audit.

#### Meilensteine der konstitutionellen Entwicklung:
- **Sprint 0.1 — Konstitutionelles Fundament**: Erstellung der Kernverzeichnisse und Basisdokumente zur Ausrichtung des Frameworks (`00-foundation/` mit Mission, Vision, Scope, Audience, Principles und Success Criteria).
- **Sprint 0.2 — Schreibprinzipien**: Einführung der grundlegenden Schreibphilosophie für technische Inhalte (z. B. Kontext vor Details).
- **Sprint 0.3 — Erklärbarkeitsstandard**: Formulierung des Standards zur Vermittlung komplexer technischer Konzepte (Why-before-How-Ansatz).
- **Sprint 0.4 — Kommunikationsziele**: Definition der angestrebten inhaltlichen Verständniseffekte auf Leserseite.
- **Sprint 0.5 — Sprachstandard**: Definition des linguistischen Rahmens (Verwendung von IT-Standardfachausdrücken, Verbot von Nominalstil und Metaphern).
- **Sprint 0.6 — Terminologiestandard**: Einführung von Governance-Regeln zur Begriffspflege und Vermeidung von begrifflicher Drift.
- **Sprint 0.7 — Dokumentenarchitektur**: Struktur-Richtlinien und Definition des kanonischen Gliederungsflusses technischer Dokumente.
- **Sprint 0.7A — Konsistenz-Review**: Durchführung der internen verfassungsrechtlichen Konsistenzprüfung.
- **Sprint 0.8 — Schreibstandard**: Handwerkliche Schreibvorgaben auf Satz- und Absatzebene (z. B. Aktiv-Stimme, Längenbegrenzungen).
- **Sprint 0.9 — Review- und Feedbackstandard**: Standardisierung des Peer-Review-Verfahrens und Definition regelbasierter Kommentare.
- **Sprint 1.0 — Qualitätssicherungsstandard**: Definition des Audit-Rahmens, der Qualitätsdimensionen und des kontinuierlichen Verbesserungsprozesses für die BECC.

---

### Konstitutionelle Fertigstellungserklärung
Mit Erreichen der Version 1.0.0-RC1 ist die Verfassungsarchitektur der BECC inhaltlich abgeschlossen. Sämtliche zehn Teilschichten wurden erfolgreich implementiert, auf syntaktische und semantische Konsistenz geprüft und im übergeordneten Portal verlinkt. Das Framework ist bereit für die unabhängige Prüfung (Audit).
