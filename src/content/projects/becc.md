---
title: "BECC v2"
subtitle: "Cloud-Infrastruktur, Persistenz & Verifikation"
description: "Gehärtete Backend- und Cloud-Architektur mit persistenter PostgreSQL, strikter CA-validierter TLS, automatisierten Backups und verifiziertem Restore unter strikter Kostendisziplin."
seoTitle: "BECC v2 – Cloud-Infrastruktur, PostgreSQL & strikte TLS-Verifikation"
seoDescription: "Fallstudie zur gehärteten Cloud-Architektur von BECC v2: Persistente PostgreSQL in Frankfurt, strikte CA-TLS, automatisierte Backups, Restore-Drill und über 300 Tests."
schemaType: "SoftwareApplication"
sidebar:
  category: "Cloud-Infrastruktur / Backend-Architektur"
  status: "Abgeschlossen"
  timeline: "Oktober 2026"
  role: "Backend & Cloud Infrastructure Engineer"
  technologies: "Node.js, TypeScript, PostgreSQL, Managed Cloud (Frankfurt), Strict TLS"
  devStack:
    - Node.js (LTS Runtime)
    - TypeScript
    - PostgreSQL (Persistenter SSD-Speicher)
    - Managed Cloud (Frankfurt am Main / EU)
    - DNS-Ingress & TLS 1.3
    - Strikte CA-validierte Transportsicherheit
    - Provider-Backups & kontinuierliche WAL-Archivierung
  aiBuilders:
    - Antigravity
  notice: "BECC v2 ist die gehärtete Backend- und Auswertungsinfrastruktur für Evidenz- und Bereitschaftsprüfungen von BridGenta. Die Fallstudie dokumentiert verifizierte Architekturentscheidungen und operative Kennzahlen. Interne Zugangsdaten, Passwörter und sensitive Infrastruktur-Details verbleiben geschützt."
---

## Kurzfassung

BECC v2 (*BridGenta Evidence & Constitutional Check*) ist eine headless betriebene Backend- und Verifikationslaufzeit, die technische Bereitschaftskriterien, Governance-Entscheidungen und einen strukturierten, integren Audit-Ledger mit validierten Zugriffskontrollen bereitstellt.

Dieses Dokument richtet sich an Cloud-Architekten, Backend-Ingenieure und technische Auditoren. Es beschreibt den Übergang von einer flüchtigen Entwicklungsumgebung zu einer gehärteten Cloud-Infrastruktur unter realen operativen Rahmenbedingungen: persistente Datenspeicherung in der Region Frankfurt am Main, strikte CA-validierte Transportsicherheit ohne Ausnahme, ein dauerhaft betriebener Container-Dienst zur Minimierung leerlaufbedingter Kaltstarts, automatisierte Provider-Backups mit kontinuierlicher WAL-Archivierung (Point-in-Time-Recovery-Fähigkeit), ein praktisch verifizierter logischer Restore-Drill für Testbestände sowie über 300 automatisierte Tests unter Einhaltung eines monatlichen Budgets von unter 15,00 €.

---

## Warum dieses Projekt entstand

Viele moderne Softwarearchitekturen stützen sich zunehmend auf generative KI-Systeme und automatisierte Agenten. Ohne eine unabhängige, deterministische Prüfinstanz besteht jedoch das Risiko, dass synthetische oder fehlerhafte Behauptungen ungeprüft in Produktionsprozesse einfließen.

BECC v2 wurde als verlässliche Gegeninstanz konzipiert: Ein deterministischer Prüf- und Ledger-Dienst, der Governance-Entscheidungen und Nachweise fortlaufend in einem anfügebasierten Protokoll (Append-Only) erfasst. Ein solches Prüfsystem kann seine Aufgabe jedoch nur glaubwürdig erfüllen, wenn seine eigene Betriebsumgebung verlässliche Standards an Persistenz, Ausfallsicherheit und Datensicherheit erfüllt.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Ein Evidenz- und Governance-System verliert seine Glaubwürdigkeit, wenn sein zugrundeliegender Audit-Speicher flüchtig ist oder Datenverbindungen ohne strikte Zertifikatsprüfung erfolgen. Operative Härtung ist das Fundament vertrauenswürdiger Software.</p>
</div>

---

## Ausgangssituation: Die fünf operativen Herausforderungen

Im Rahmen der technischen Bestandsaufnahme wurden fünf wesentliche Herausforderungen identifiziert, die für einen verlässlichen Produktivbetrieb gelöst werden mussten:

1. **Flüchtige Datenhaltung**: Die anfängliche Entwicklungsdatenbank lief auf einer temporären Testinstanz mit automatischem Datenverlust nach Inaktivität.
2. **Datensicherung & Wiederherstellung**: Es fehlten ein automatisiertes Snapshot-Konzept, eine kontinuierliche Transaktionsarchivierung für zeitpunktgenaue Wiederherstellungen sowie ein praktisch verifizierter Restore-Drill.
3. **Transportsicherheit & Zertifikatsvalidierung**: Datenbankverbindungen in Cloud-Umgebungen bergen Risiken, wenn Zertifikatsprüfungen deaktiviert werden; gefordert war eine strikte CA-Validierung (`rejectUnauthorized: true`).
4. **Instanz-Schlafzustände & Latenz**: Kostenfreie Instanzen wurden bei Inaktivität heruntergefahren, was zu unvorhersehbaren Kaltstartverzögerungen für anfragende Clients führte.
5. **Domain-Integration & Ingress-Routing**: Die Anwendung war nur über generische Standard-Hostnamen erreichbar und musste sauber in die primäre Domain-Architektur (`becc.bridgenta.de`) eingebunden werden.

---

## Architekturentscheidung & Cloud-Topologie

Für die Schließung dieser Herausforderungen wurden verschiedene Bereitstellungsmodelle (Multi-Cloud vs. Managed Single-Provider) evaluiert.

Aus Gründen operativer Einfachheit, Latenzminimierung innerhalb der EU und Vermeidung von Egress-Kosten fiel die Entscheidung auf eine **Single-Provider-Topologie in der Region Frankfurt am Main (Deutschland / EU)**:

- **Ingress & Edge-Routing**: Client-Anfragen erreichen den Dienst über die dedizierte Domain `https://becc.bridgenta.de`. Die Edge terminiert TLS über moderne Cipher-Suiten (TLS 1.3) mit automatisch verwalteten Zertifikaten.
- **Compute-Dienst**: Ein kontinuierlich betriebener Container-Daemon auf Basis von Node.js LTS führt die TypeScript-Laufzeit aus und verhindert das automatische Abschalten bei Leerlauf.
- **Datenbank & Persistenz**: Eine dedizierte PostgreSQL-Instanz auf persistentem SSD-Speicher in derselben Cloud-Region sichert den Audit-Ledger dauerhaft ab.
- **Sichere Inter-Service-Kommunikation**: Die Verbindung zwischen Anwendungsinstanz und Datenbank erfolgt verschlüsselt über strikt CA-validiertes TLS.

---

## Persistente Datenhaltung & Rollentrennung

Die Datenbank wurde dauerhaft auf persistenten SSD-Speicher umgestellt. Temporäre Speicherbegrenzungen und Ablauf-Timer wurden vollständig beseitigt.

Zur Durchsetzung des Prinzips der geringsten Rechte (*Least Privilege*) wurde eine strikte administrative Rollentrennung implementiert:

| Zugriffsebene | Zugriffsrechte | Verwendungszweck |
|---|---|---|
| **Administrations- & Migrationsebene** | Superuser- / DDL-Rechte / Schemaberechtigung | Ausschließlich für kontrollierte Schema-Migrationen und Initialisierung |
| **Laufzeitebene (Application)** | Streng limitiert: Nur lesende und anfügende Rechte (`SELECT`, `INSERT`) auf Ledger-Tabellen | Regulärer Anwendungsbetrieb / Append-Only Ledger |

Versuche der regulären Anwendungsrolle, Schemata zu verändern (`CREATE TABLE`), neue Rollen anzulegen oder bestehende Audit-Einträge nachträglich zu modifizieren (`UPDATE`, `DELETE`), werden von der Datenbank-Engine strikt mit `permission denied` abgewiesen. Diese Barriere schützt vor anwendungsseitigen Fehlern und Injection-Angriffen; administrative Datenbankzugriffe auf Infrastrukturebene oder direkte Eingriffe mit Superuser-Rechten bleiben davon naturgemäß unberührt.

---

## Strikte Transportsicherheit & CA-Validierung

Bei Cloud-Datenbanken greifen Entwicklungsteams häufig auf unsichere Behelfskonfigurationen wie `sslmode=no-verify` oder `rejectUnauthorized: false` zurück, um Verbindungsprobleme mit Zertifikaten zu umgehen. Dies hebt wesentliche Sicherheitsgarantien auf und exponiert Verbindungen für Man-in-the-Middle-Angriffe (MitM).

Für BECC v2 wurde jeglicher Verzicht auf Zertifikatsprüfungen kategorisch ausgeschlossen:
- **Validierungsrichtlinie**: Strikte Erzwingung von `rejectUnauthorized: true` ohne Ausnahme.
- **Trust Store**: Verifikation gegen das offizielle Mozilla-CA-Wurzelzertifikate-Bündel der Node.js-Laufzeit.
- **Ergebnis**: Robuster Schutz des Transportwegs zwischen Anwendungsinstanz und Datenbank gegen Abhören und unbemerkte Manipulation durch konsequente Zurückweisung nicht vertrauenswürdiger Zertifikate.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">TLS ohne strikte CA-Validierung bietet nur die Illusion von Sicherheit. Echte Transportverschlüsselung erfordert die konsequente Zurückweisung unbestätigter Zertifikate (rejectUnauthorized: true) als nicht verhandelbare Richtlinie.</p>
</div>

---

## Always-On Runtime & Betriebsverhalten

Die Laufzeitinstanz wurde auf einen dauerhaft aktiven Betriebsmodus umgestellt, wodurch das automatische Herunterfahren bei Inaktivität eliminiert wurde:

- **Reduzierung von Kaltstarts**: Der Dienst vermeidet das lastunabhängige Herunterfahren bei Leerlauf, wie es bei kostenfreien Tarifen üblich ist.
- **Kontinuierlicher Daemon**: Der Hintergrunddienst läuft stabil als ressourcenschonender Daemon mit geringem Speicherbedarf, sodass ausreichender Puffer für Lastspitzen verbleibt.
- **Betriebsgrenzen**: Die Konfiguration zielt auf kontinuierliche Erreichbarkeit ab; planmäßige Versions-Rollouts, Container-Neustarts oder providerseitige Plattformwartungen bedingen jedoch kurze, betriebsübliche Unterbrechungsintervalle.

---

## Produktiv-Domain & DNS-Ingress

Die Anwendung wurde nahtlos in die bestehende Domain-Architektur von `bridgenta.de` integriert:

- **Hostname**: `https://becc.bridgenta.de`
- **DNS-Verwaltung**: Managed CNAME-Delegation auf die Cloud-Ingress-Infrastruktur.
- **Edge-Zertifikat**: Automatisch verwaltetes TLS-Zertifikat mit vollständiger SNI-Unterstützung und moderner Cipher-Suite (TLS 1.3).
- **Verifikationsstatus**: Verifiziert ohne Weiterleitungsschleifen oder Hostname-Konflikte.

---

## Betriebstelemetrie & Zustandserkennung

Um den Zustand des Dienstes transparent und automatisiert überwachbar zu machen, implementiert BECC v2 standardisierte Schnittstellen zur Zustandserkennung:

- **Service-Index**: Liefert grundlegende Status- und Routing-Informationen für berechtigte Diagnoseaufrufe.
- **Tiefgehende Liveness-Prüfung**: Verifiziert kontinuierlich die interne Systembereitschaft einschließlich einer aktiven, verifizierten Datenbankverbindung.
- **Readiness-Prüfung**: Signalisiert vorgeschalteten Ingress- und Routing-Komponenten die Bereitschaft zur Verarbeitung eingehender Anfragen.
- **Metadaten- & Versionsidentifikation**: Stellt semantische Versionsangaben und Release-Identifikatoren für das Änderungsmanagement bereit.

Die Diagnosefunktionen wurden auf minimale Informationspreisgabe ausgelegt: Sie stellen betriebliche Statusinformationen für Monitoring und vorgeschaltete Gateways bereit, ohne interne Zugangsdaten oder sensitive Konfigurationsparameter zu exponieren.

---

## Datensicherung, PITR-Fähigkeit & Verifizierter Restore-Drill

Ein Datensicherungskonzept ist erst dann bewährt, wenn die Wiederherstellung in der Praxis erfolgreich getestet wurde.

### Providerseitige Datensicherung & PITR-Fähigkeit
Die persistente PostgreSQL-Instanz wird durch automatisierte tägliche Snapshots des Cloud-Providers und kontinuierliche Transaktionsarchivierung (Write-Ahead-Logs, WAL) gesichert. Dies stellt die technische Grundlage für ein Point-in-Time-Recovery (PITR) über ein rollierendes Zeitfenster von sieben Tagen auf Plattformebene bereit.

### Der Verifizierte Restore-Drill (Logischer Export/Import)
Um die logische Wiederherstellbarkeit und Strukturintegrität des Audit-Ledgers nachzuweisen, ohne zusätzliche Kosten für parallele Cloud-Instanzen zu verursachen, wurde ein zielgerichteter Restore-Drill durchgeführt:

1. **Testbestand**: Ein synthetischer Testdatenbestand wurde im Ledger hinterlegt.
2. **Isolierter Wiederherstellungspfad**: Die Wiederherstellung erfolgte über einen kontrollierten logischen Export- und Reimport-Prozess in ein isoliertes Zielschema innerhalb der Datenbank.
3. **Integritätsprüfung**: Alle wiederhergestellten Datensätze wurden mit dem Ausgangsbestand verglichen. Für den synthetisch erprobten Testdatenbestand wurde vollständige Datenparität und strukturelle Identität nachgewiesen.
4. **Bereinigung**: Nach Abschluss der Prüfung wurden die temporären Wiederherstellungsstrukturen rückstandslos bereinigt.

*Hinweis zur Abgrenzung:* Dieser Test verifizierte den logischen Wiederherstellungsprozess und die Schemakonsistenz. Eine vollständige physische Point-in-Time-Wiederherstellung auf eine neue Provider-Instanz war nicht Gegenstand dieses isolierten Drills.

---

## Kostendisziplin & Budgettreue

Eine zentrale Leitlinie des Projekts war der Nachweis, dass eine gehärtete, persistente und abgesicherte Backend-Architektur auch mit minimalen Betriebskosten realisierbar ist:

- **Budgetrahmen**: Ausgelegt auf eine Obergrenze von maximal **15,00 € pro Monat**.
- **Kalkulierte Laufzeitkosten**: Die Kombination aus managed SSD-Datenbankspeicher und Always-On Container-Compute bewegt sich im Rahmen von ca. 13,00 € bis 14,00 € monatlich.
- **Wirtschaftlichkeit**: Das Projekt belegt, dass fundamentale Zuverlässigkeitskriterien (Persistenz, strikte TLS-Prüfung, Backups, Health-Monitoring) auch mit kostenbewussten Basistarifen strukturiert umsetzbar sind.

---

## Testabdeckung & Automatisierte Verifikation

Die Verlässlichkeit der BECC-Laufzeit wird durch eine umfassende, automatisierte Testsuite in der Testumgebung sichergestellt:

- **Gesamtzahl Tests**: **Über 300 automatisierte Tests** (31 Test-Suiten).
- **Test-Schwerpunkte**:
  - Dienst-Lebenszyklus und Diagnose-Schnittstellen.
  - Standalone-PostgreSQL-Testbed mit Container-Isolation.
  - Rollentrennung, DDL-Restriktionen und Ledger-Integrität.
  - Multi-Instanz-Zertifizierung und Fehlertoleranz.
  - Strict-TLS-Handshake und Ablehnung unverschlüsselter oder unzertifizierter Verbindungen.
- **Ausführungsstatus**: Vollständig erfolgreich in der lokalen Testumgebung und der Continuous-Integration-Pipeline.

---

## Was nachgewiesen wurde vs. Was explizit nicht beansprucht wird

Zur Wahrung technischer Redlichkeit und Vermeidung irreführender Zusagen gilt folgende klare Abgrenzung:

### Verifizierte Nachweise
- Echte Persistenz auf SSD-Speicher in der Region Frankfurt am Main ohne Ablaufdatum.
- Strikte CA-validierte TLS-Verschlüsselung zur Datenbank ohne Ausnahme (`rejectUnauthorized: true`).
- Kontinuierliche Transaktionsarchivierung (7-Tage-PITR-Fähigkeit auf Provider-Ebene) und ein erfolgreich durchgeführter logischer Restore-Drill für Testdatenbestände.
- Dauerhafter Container-Betrieb zur Minimierung lastunabhängiger Kaltstarts.
- Dedizierte Subdomain `becc.bridgenta.de` mit Edge-TLS 1.3.
- Über 300 bestandene automatisierte Tests unter Einhaltung des Budgetrahmens (< 15,00 €/Monat).

### Explizit nicht beansprucht
- **Kein Multi-AZ-Hochverfügbarkeitscluster**: Robuste Einzelinstanz im Managed-Einstiegstarif ohne automatisierten Multi-Rechenzentrum-Hot-Standby-Failover.
- **Keine formelle Konformitäts- oder DR-Zertifizierung**: Eigenprojekt ohne ISO 27001, SOC 2 oder NIS2 Zertifizierung.
- **Kein externer Penetrationstest**: Sicherheitsarchitektur basiert auf anerkannten Prinzipien (Least Privilege, Strict TLS), wurde jedoch keinem externen Red-Teaming unterzogen.
- **Keine absolute Ausfallsicherheit / Kein Zero-Downtime-Versprechen**: Versions-Rollouts und providerseitige Plattformwartungen bedingen minimale, betriebsübliche Neustartintervalle.
- **Keine kryptografische Signaturkette / Kein manipulationssicheres Hardware-Ledger**: Das System erzwingt rollenbasierte Append-Only-Zugriffsregeln in der Datenbank, beinhaltet jedoch kein HSM, keine asymmetrischen Signaturen und keine Blockchain-artige Verkettung.

---

## Evidenz- und Prüfgrundlagen

Die in dieser Fallstudie dargestellten Architekturentscheidungen und Testergebnisse basieren auf versionierten, repository-gestützten Prüf- und Auditprotokollen:

- **Architektur- und Anforderungsabgleiche**: Systematische Erfassung der operativen Härtungsanforderungen von flüchtigen Testsystemen hin zu persistenten Datenstrukturen.
- **Evaluierung & Budgetkontrolle**: Dokumentierte Provider- und Architekturentscheidungen unter kontinuierlicher Einhaltung des Kostendeckels.
- **Sicherheits- & TLS-Protokolle**: Verifizierte Nachweise zur Durchsetzung strikter Zertifikatsprüfung und Rollentrennung.
- **Test- & Drill-Dokumentation**: Reproduzierbare Prüfberichte zu Datenparität, Wiederherstellbarkeit und automatisierter Testabdeckung.
