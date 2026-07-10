# BridGenta Engineering Communication Constitution (BECC) — Version 1.0 Release Candidate 2 (RC2)

Dieses Dokument stellt die offizielle Spezifikation des zweiten **Release Candidate (RC2)** der **BridGenta Engineering Communication Constitution (BECC)** dar. Nach Durchführung der Auditierungen (Claude, Codex, Antigravity), Etablierung des Remediation Plans, Definition der EDR-Beschlüsse und der erfolgreichen Verifikation der Implementierung wird die BECC hiermit zur finalen Freigabeprüfung bereitgestellt.

> [!IMPORTANT]
> **RELEASE-STATUS**: Dies ist der **Release Candidate 2 (RC2)** der BECC. Dieses Release dient der finalen Validierung im Rahmen des Freigabegremiums. Es handelt sich **nicht** um die allgemeine Betriebsbereitschaft (General Availability - GA).

---

## 1. Identität des Frameworks (Framework Identity)

- **Name des Frameworks**: BridGenta Engineering Communication Constitution (BECC)
- **Version**: 1.0.0-RC2
- **Status**: Release Candidate 2 (RC2)
- **Veröffentlichungsdatum**: 2026-07-10
- **Eigentümer**: BGA360 (Constitutional Architect) & Release-Engineering-Team
- **Repository-Bereich**: `docs/engineering-communication/`
- **Verifikations-Referenz**: [BECC v1.0 RC2 Verification Report](./BECC-v1.0-RC2-VERIFICATION-REPORT.md)

---

## 2. Zusammenfassung (Executive Summary)

Die BECC v1.0 RC2 ist das verfassungsrechtliche Rahmenwerk, das die technische Kommunikation im BridGenta-Repository als eigenständige **Qualitätsdimension des Software Engineerings** verankert. 

Gegenüber RC1 wurden die Ergebnisse der unabhängigen Framework-Audits (Claude, Codex und Antigravity) vollständig ausgewertet, über EDR-Beschlüsse formalisiert und im Repository implementiert. Sämtliche Verbesserungen wurden unabhängig verifiziert und weisen eine lückenlose Traceability auf.

---

## 3. Zweck von Release Candidate 2 (Purpose of RC2)

Der Zweck dieses zweiten Release Candidates besteht darin:
1. Den Nachweis zu führen, dass alle im Remediation Plan identifizierten Mängel vollständig behoben wurden.
2. Die neu implementierte **Operational Governance** (Linter, Link-Checking-Infrastruktur, Maintainer-Richtlinien, kryptografisches Release-Manifest) unter realen CI/CD-Bedingungen abzusichern.
3. Die formelle Grundlage für das Freigabegremium zur Erklärung der General Availability (GA) bereitzustellen.

---

## 4. Konstitutionelle Architektur & Umfang (Release Scope)

Das BECC-Framework umfasst die verfassungsmäßigen Dokumente sowie die begleitenden Governance- und Release-Assets:

### Konstitutionelle Standards (Frozen baseline)
- `00-foundation/`: Mission, Vision, Scope, Audience, Principles, Success Criteria.
- `01-writing-principles/`: Leitlinien zur Schreibphilosophie.
- `02-explainability/`: Standard für technische Erklärbarkeit komplexer Systeme.
- `03-communication-objectives/`: Die angestrebten Verständniseffekte beim Leser.
- `04-language/`: Sprachrichtlinie (IT-Standardfachbegriffe).
- `05-terminology/`: Lebenszyklusregeln für Fachbegriffe.
- `06-document-architecture/`: Kanonischer Gliederungsfluss.
- `07-writing/`: Handwerkliche Schreibregeln.
- `08-review-feedback/`: Peer-Review-Verfahren.
- `09-quality-assurance/`: Audits und kontinuierliche Verbesserung.

### Integrierte Governance- & Release-Assets (Neu in RC2)
- **Maintainer- & Repository-Richtlinien**: `/CONTRIBUTING.md`, `/CODEOWNERS` und `RELEASES/MAINTAINER_GUIDE.md`.
- **Kryptografische Absicherung**: `RELEASES/release-manifest.json` (SHA-256 Hashes aller BECC-Assets).
- **Prozess-Referenz**: `09-quality-assurance/MOCK_AMENDMENT_CASE_STUDY.md` (Simulierte Fallstudie für Verfassungsänderungen).
- **Validierungs-Tooling**: Automatisierter Linter (`tooling/lint_markdown.cjs`) und Linkchecker (`tooling/check_markdown_links.cjs`, `tooling/audit_links.cjs`).

---

## 5. Wesentliche Verbesserungen in RC2 (Major Improvements)

### 5.1 Repository-Engineering & Portabilität (Link-Struktur)
- **Problem in RC1**: Absolute `file:///` Links behinderten die Systemunabhängigkeit und führten zu Fehlern beim Abrufen der Dokumente auf anderen Entwicklungsmaschinen.
- **Lösung in RC2**: Alle absoluten Links im gesamten `docs/` Verzeichnis wurden auf relative Pfade umgestellt.

### 5.2 Governance-Klärung (Designed vs. Operational Governance)
- **Problem in RC1**: Die Unterscheidung zwischen Soll-Governance (Verfassungsregeln) und Ist-Governance (technische Kontrollschranken) war begrifflich unscharf.
- **Lösung in RC2**: Einführung klarer Definitionen für Designed Governance und Operational Governance im QA-Standard (`09-quality-assurance/ENGINEERING_COMMUNICATION_QA_STANDARD.md`).

### 5.3 Workflow-Harmonisierung & Kooperation
- **Problem in RC1**: Parallele Veröffentlichungs- und Git-Abläufe waren in unterschiedlichen Dokumenten redundant und inkonsistent beschrieben.
- **Lösung in RC2**: Harmonierung und explizite gegenseitige Cross-References am Ende der Dokumente `workflow.md`, `publication-governance.md` und des QA-Standards.

### 5.4 Release-Engineering & Validierung (Automatisierung)
- **Problem in RC1**: Qualitätsprüfungen (z. B. auf verbotene Überschriften-Sprints, fehlerhafte Links) erfolgten rein manuell.
- **Lösung in RC2**: Implementierung eines lokalen Node-basierten Linters und Link-Checkers in `/tooling/`. Diese wurden in `package.json` und direkt in die CI-Pipeline `.github/workflows/deploy.yml` eingebunden, so dass jeder PR automatisch validiert wird.

### 5.5 Kryptografischer Schutz (Release-Manifest)
- **Lösung in RC2**: Jedes Release enthält ein vom Release-Skript erzeugtes Manifest `release-manifest.json`, das alle verfassungsrelevanten Dokumente mit ihrem SHA-256 Hash auflistet. Jegliche unautorisierte Veränderung führt zu einem Verifikationsfehler.

---

## 6. Verifikations-Zusammenfassung (Verification Summary)

Der [Integritäts-Verifikationsbericht](./BECC-v1.0-RC2-VERIFICATION-REPORT.md) bescheinigt:
- **Fehlerfreie Builds**: Lokale Astro-Builds und CI-Pipelines laufen fehlerfrei durch.
- **Validierung**: Der Markdown-Linter und der Linkchecker melden 0 Fehler im gesamten Dokumenten- und Pfad-Bestand.
- **Traceability**: Jede Änderung lässt sich 1-to-1 auf ein genehmigtes Arbeitspaket (WP) und eine Engineering-Entscheidung (EDR) zurückführen.
- **Integrität**: Es wurden keine konstitutionellen Regelungen verändert oder eigenmächtige Anpassungen vorgenommen.

---

## 7. Bekannte Einschränkungen (Known Limitations)

Die konkrete Erarbeitung des finalen Begriffsregisters (Glossar) sowie die Übersetzungshilfen sind weiterhin als Phase-3-Assets klassifiziert. Sie werden nach der endgültigen Erklärung der General Availability (GA) erarbeitet.

---

## 8. Non-Goals (Nicht-Ziele)

- Neugestaltung (Redesign) der BECC-Schichten oder inhaltliche Aufweichung der Standards.
- Modifikationen am Design oder Layout des Astro-Frontends.

---

## 9. Upgrade-Hinweise (Upgrade Notes)

Für bestehende Dokumentationen auf BridGenta gilt:
- Bei der Erstellung oder Modifikation von Dokumenten sind ausschließlich relative Links zu verwenden.
- Vor dem Pushen von Änderungen ist lokal `npm run lint` und `npm run check-links` auszuführen, um Fehlwürfe in der CI-Pipeline zu verhindern.

---

## 10. Nachfolgende Phase (Successor Phase)

Nach erfolgreichem Packaging von RC2 und Review durch den Project Owner wird die nächste Phase eingeleitet:
- **RC2 Sprint 8 — Final Release Readiness Review**

---

[Zurück zur BECC-Übersicht](../README.md)
