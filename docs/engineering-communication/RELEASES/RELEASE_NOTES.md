# Release Notes — BridGenta Engineering Communication Constitution (BECC) Version 1.0 Release Candidate 2 (RC2)

Dieses Dokument enthält die offizielle Freigabe-Mitteilung (Release Notes) für den zweiten **Release Candidate (RC2)** der BECC Version 1.0.

---

## 1. Warum dieses Release existiert (Why RC2 Exists)

Nach der Fertigstellung von RC1 wurde die Verfassung einer Reihe von unabhängigen Framework-Audits (Claude, Codex und Antigravity) unterzogen. 

Das Release Candidate 2 (RC2) konsolidiert alle Auditbefunde, setzt die genehmigten EDR-Abhilfemaßnahmen um und etabliert eine automatisierte Validierungsinfrastruktur (Operational Governance) im Repository. Damit wird sichergestellt, dass die BECC-Standards portabel, verifiziert und nachhaltig im Repository-Betrieb abgesichert sind.

---

## 2. Wesentliche Neuerungen und Änderungen (What Changed)

- **Vollständige Link-Portabilität**: Alle absoluten Links (`file:///`) wurden in relative Pfade umgewandelt. Das Framework ist nun vollständig portabel und plattformunabhängig einsetzbar.
- **Repository-Governance & Beitragsregeln**: 
  - Eine neue `/CONTRIBUTING.md` regelt den exakten Ablauf von Code- und Dokumentenbeiträgen.
  - Eine `/CODEOWNERS`-Datei weist die review-berechtigten Instanzen für verfassungsrelevante Verzeichnisse zu.
  - Der `RELEASES/MAINTAINER_GUIDE.md` dokumentiert den Release-Workflow und den Absicherungsprozess für zukünftige Maintainer.
- **Automatisierte Validierungs-Tools**: In `/tooling/` wurden länderspezifisch konfigurierte Node-Skripte für Markdown-Linting, Markdown-Linkchecks und HTML-Routen-Auditing implementiert. Diese sind in die lokale Entwicklung (`npm run lint`, `npm run check-links`) und in die CI/CD-Pipelines integriert.
- **Kryptografische Absicherung (Release-Manifest)**: Eine kryptografische Prüfsummendatei `release-manifest.json` schützt das Release vor unbeabsichtigten Manipulationen oder schleichender Drift.
- **Simuliertes Änderungsverfahren**: Eine neue Fallstudie `09-quality-assurance/MOCK_AMENDMENT_CASE_STUDY.md` zeigt anschaulich, wie Verfassungsänderungen beantragt, reviewt und freigegeben werden.
- **Governance-Präzisierung**: Der QA-Standard definiert nun trennscharf Designed Governance (Regelwerk) und Operational Governance (technische Kontrollschranken).

---

## 3. Unabhängige Verifikation (What Was Verified)

Die Betriebsbereitschaft von RC2 wurde im [Verification Report](./BECC-v1.0-RC2-VERIFICATION-REPORT.md) erfolgreich nachgewiesen:
1. **Automatisierte Builds & Checks**: Alle Astro-Builds, Markdown-Linter und Linkchecker laufen sowohl in lokalen Windows-Umgebungen als auch in der Linux-CI-Umgebung mit **PASS** (0 Fehler) durch.
2. **Kryptografische Signierung**: Alle Hashes im Manifest stimmen präzise mit den physischen Dateien überein.
3. **Traceability**: Alle Änderungen sind lückenlos über Work Packages auf die Auditberichte zurückführbar.

---

## 4. Verbliebene Einschränkungen (Remaining Limitations)

Wie in RC1 sind nachgelagerte Wörterbücher, Glossare, Übersetzungstools und spezifische ADR-Templates nicht Teil dieser Verfassung. Sie werden in Phase 3 als operative Assets nachgelagert entwickelt.

---

## 5. Nächste Phase (Expected Next Phase)

Mit der erfolgreichen Verifikation und dem Packaging von RC2 tritt das Framework in die finale Phase ein:
- **RC2 Sprint 8 — Final Release Readiness Review**

Nach erfolgreichem Abschluss dieses Reviews durch den Project Owner wird die allgemeine Betriebsbereitschaft (**General Availability - GA**) der BECC v1.0 deklariert.
